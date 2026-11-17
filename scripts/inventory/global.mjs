import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inventory } from "./pilot.mjs";
import { reconcilePackages } from "./packages.mjs";

const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const groupBy = (items, key) => {
  const map = new Map();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
};
const where = (hit) => `${hit.path}#${hit.record}`;
const tickets = (list) => list.map((n) => `#${n}`).join(", ");

/**
 * Reconcile every canonical ticket batch against the package coverage census.
 * A resolution is only claimed when an authored record or alias exists; an
 * explicitly historical input is reported as superseded and never resolves.
 */
export function reconcileGlobal({ root, coverage, batches, historical = [], scoped = true }) {
  const problems = [];
  const problem = (kind, subject, detail) => problems.push({ kind, subject, detail });
  batches = [...batches].sort((a, b) => byText(a.path, b.path));
  historical = [...historical].sort((a, b) => byText(a.path, b.path));

  // Discovered identities and their owners come from the existing census.
  const census = reconcilePackages({ root, input: { ...coverage.input, closeout: false } });
  for (const p of census.problems) problem(p.kind, p.subject, p.detail);
  const coverageTickets = new Set((coverage.input.tickets ?? []).map((t) => t.number));
  const exclusions = new Set(
    (coverage.input.ownership ?? []).filter((o) => o.reason?.trim()).map((o) => o.id)
  );

  const ticketOf = new Map();
  for (const { path, input } of batches) {
    const ticket = input.ownership?.ticket;
    if (ticket === undefined) {
      problem(
        "input",
        path,
        "Record input has no ticket ownership; declare it --historical or add ownership"
      );
      continue;
    }
    ticketOf.set(path, ticket);
    if (input.ownership.path !== coverage.path)
      problem("input", path, `Ownership path ${input.ownership.path} is not ${coverage.path}`);
    if (!coverageTickets.has(ticket))
      problem("input", path, `Ticket #${ticket} is not a coverage ticket`);
  }
  for (const [ticket, owners] of groupBy([...ticketOf], ([, t]) => t))
    if (owners.length > 1)
      for (const [path] of owners)
        problem(
          "input",
          path,
          `Ticket #${ticket} is also owned by ${owners
            .map(([p]) => p)
            .filter((p) => p !== path)
            .join(", ")}`
        );

  if (scoped)
    for (const { path, input } of batches)
      for (const p of inventory({ root, input }).problems)
        problem("scoped", path, `${p.kind}: ${p.subject}: ${p.detail}`);

  // Global identity index over canonical inputs only.
  const hits = [];
  for (const { path, input } of batches) {
    const ticket = ticketOf.get(path);
    for (const r of input.records ?? [])
      hits.push({ id: r.id, path, ticket, record: r.id, via: "record" });
    for (const a of input.aliases ?? [])
      hits.push({ id: a.id, path, ticket, record: a.record, via: "alias" });
  }
  const index = groupBy(hits, (h) => h.id);
  for (const [id, found] of index)
    if (found.length > 1)
      problem(
        "duplicate",
        id,
        `Identity defined in ${found.map((h) => `${h.path} (${h.via})`).join(", ")}`
      );
  const claims = (pick) =>
    batches.flatMap(({ path, input }) =>
      (input.records ?? []).flatMap((r) => pick(r).map((value) => ({ value, path })))
    );
  for (const [label, pick] of [
    ["Public export claimed", (r) => (r.availability === "public" ? r.exports : [])],
    ["Source file owned", (r) => r.files],
  ])
    for (const [value, found] of groupBy(claims(pick), (c) => c.value)) {
      const paths = [...new Set(found.map((c) => c.path))];
      if (paths.length > 1) problem("duplicate", value, `${label} by ${paths.join(", ")}`);
    }
  // A multi-owner topology identity is not an alias for one owner's component.
  // A package resolves only as an aggregate: every owning ticket has a batch and
  // every discovered family of that package resolves. Multi-owner families never do.
  const multiOwner = new Set(
    [...census.facts.packages, ...census.facts.families]
      .filter((item) => item.coverage?.tickets?.length > 1)
      .map((item) => item.id)
  );
  const familiesOf = groupBy(census.facts.families, (f) => f.package);
  // A family with no record/alias resolves when one owning batch accounts for every
  // discovered file through record ownership or a reasoned disposition.
  const accounted = new Map(
    batches.map(({ path, input }) => [
      path,
      new Set([
        ...(input.records ?? []).flatMap((r) => r.files ?? []),
        ...(input.dispositions ?? []).filter((d) => d.reason?.trim()).map((d) => d.path),
      ]),
    ])
  );
  const coverageHits = new Map();
  const resolve_ = (id) => {
    if (coverageHits.has(id)) return coverageHits.get(id);
    if (multiOwner.has(id)) return null;
    const found = index.get(id) ?? [];
    if (found.length === 1) return found[0];
    if (!found.length && exclusions.has(id)) return { via: "exclusion" };
    return null;
  };
  const resolution = (hit) =>
    !hit
      ? null
      : hit.via === "exclusion"
        ? "excluded"
        : hit.via === "aggregate"
          ? hit.record
          : where(hit);

  // Coverage: each ticket-owned identity needs that ticket's record, alias or full
  // file accounting; packages are checked after their families.
  const coverageFacts = [];
  const isPackage = new Set(census.facts.packages.map((p) => p.id));
  const ordered = [...census.facts.families, ...census.facts.packages];
  for (const item of ordered) {
    const owner = item.coverage;
    if (!owner) {
      coverageFacts.push({ id: item.id, owner: null, resolution: null });
      continue;
    }
    if (owner.reason?.trim() && !owner.tickets?.length) {
      coverageFacts.push({ id: item.id, owner: owner.reason, resolution: "excluded" });
      continue;
    }
    const batchless = owner.tickets.filter((n) => ![...ticketOf.values()].includes(n));
    if (multiOwner.has(item.id)) {
      const families = familiesOf.get(item.id) ?? [];
      const open = families.filter((f) => !coverageHits.get(f.id));
      if (isPackage.has(item.id) && families.length && !open.length && !batchless.length) {
        const hit = {
          via: "aggregate",
          ticket: null,
          record: `aggregate of ${families.length} resolved families (${tickets(owner.tickets)})`,
        };
        coverageHits.set(item.id, hit);
        coverageFacts.push({
          id: item.id,
          owner: tickets(owner.tickets),
          resolution: resolution(hit),
        });
        continue;
      }
      problem(
        "coverage",
        item.id,
        isPackage.has(item.id)
          ? `Multi-owner package aggregate is incomplete: ${
              batchless.length ? `no batch for ${tickets(batchless)}` : ""
            }${batchless.length && open.length ? "; " : ""}${
              open.length ? `unresolved families ${open.map((f) => f.id).join(", ")}` : ""
            }${!families.length ? "no discovered families" : ""}`
          : `Multi-owner topology requires aggregate inventory evidence for ${tickets(owner.tickets)}; one component record or alias cannot resolve it`
      );
      coverageFacts.push({ id: item.id, owner: tickets(owner.tickets), resolution: null });
      continue;
    }
    const found = (index.get(item.id) ?? []).filter((h) => owner.tickets.includes(h.ticket));
    let hit = found.length === 1 ? found[0] : null;
    if (!found.length && item.files?.length) {
      const full = [...ticketOf]
        .filter(([, ticket]) => owner.tickets.includes(ticket))
        .filter(([path]) => item.files.every((f) => accounted.get(path).has(f)));
      if (full.length === 1)
        hit = { id: item.id, path: full[0][0], ticket: full[0][1], record: "files", via: "files" };
    }
    if (hit) coverageHits.set(item.id, hit);
    if (!found.length && !hit) {
      const elsewhere = [...new Set((index.get(item.id) ?? []).map((h) => h.ticket))];
      problem(
        "coverage",
        item.id,
        elsewhere.length
          ? `Identity aliased only by ticket(s) ${tickets(elsewhere)}, not owning ticket(s) ${tickets(owner.tickets)}`
          : batchless.length === owner.tickets.length
            ? `No batch input owns ticket ${tickets(batchless)}`
            : `Owning ticket(s) ${tickets(owner.tickets)} batch has no record, alias or full file accounting for this identity`
      );
    }
    coverageFacts.push({ id: item.id, owner: tickets(owner.tickets), resolution: resolution(hit) });
  }
  coverageFacts.sort((a, b) => byText(a.id, b.id));

  // References: pending targets and record relationships across all batches.
  const references = [];
  for (const { path, input } of batches) {
    const add = (origin, source, target, label) => {
      const hit = resolve_(target);
      references.push({
        from: path,
        origin,
        source,
        target,
        resolution: resolution(hit),
        via: hit?.via ?? null,
      });
      if (!hit) {
        problem(
          "reference",
          path,
          multiOwner.has(target)
            ? `Target ${target} requires aggregate inventory evidence for all owning tickets`
            : origin === "pending"
              ? `Pending target ${target} (named ${label}) has no authored record or alias in any batch`
              : `Relationship ${source} -> ${target} has no authored record or alias in any batch`
        );
        return;
      }
      const named = [...(label ?? "").matchAll(/#(\d+)|ticket-(\d+)/g)].map((m) =>
        Number(m[1] ?? m[2])
      );
      if (named.length && hit.ticket != null && !named.includes(hit.ticket))
        problem(
          "reference",
          path,
          `Pending target ${target} names ${tickets(named)} but resolves in ticket #${hit.ticket} (${where(hit)})`
        );
    };
    for (const p of input.pending ?? []) add("pending", input.scope, p.id, p.batch);
    for (const r of input.records ?? [])
      for (const target of r.relationships ?? []) add("relationship", r.id, target);
  }
  references.sort(
    (a, b) =>
      byText(a.from, b.from) ||
      byText(a.origin, b.origin) ||
      byText(a.source, b.source) ||
      byText(a.target, b.target)
  );

  const historicalFacts = historical
    .flatMap(({ path, input }) =>
      (input.records ?? []).map((r) => {
        const hit = resolve_(r.id);
        return {
          path,
          record: r.id,
          supersededBy: hit && hit.via !== "exclusion" ? resolution(hit) : null,
        };
      })
    )
    .sort((a, b) => byText(a.path, b.path) || byText(a.record, b.record));

  problems.sort(
    (a, b) => byText(a.kind, b.kind) || byText(a.subject, b.subject) || byText(a.detail, b.detail)
  );
  const facts = {
    coverageInput: { path: coverage.path, revision: coverage.input.revision },
    scoped,
    batches: batches.map(({ path, input }) => ({
      path,
      scope: input.scope,
      ticket: ticketOf.get(path) ?? null,
      revision: input.revision,
      records: (input.records ?? []).length,
      aliases: (input.aliases ?? []).length,
      pending: (input.pending ?? []).length,
    })),
    coverage: coverageFacts,
    references,
    historical: historicalFacts,
  };
  const complete = !problems.length;
  return {
    problems,
    complete,
    ownerReview: "required",
    facts,
    views: views(facts, problems, complete),
  };
}

function views(facts, problems, complete) {
  const unresolved = (list) => list.filter((x) => !x.resolution);
  const notice =
    "Generated from authored inputs; edit those inputs, not this file. A passing reconciliation " +
    "means every discovered identity and reference resolves to authored inventory evidence. It " +
    "does not assert a defect-free product, and closure requires owner review.";
  const batchLines = facts.batches
    .map(
      (b) =>
        `- ${b.path}: ticket ${b.ticket === null ? "NONE" : `#${b.ticket}`}; scope ${b.scope}; revision ${b.revision}`
    )
    .join("\n");
  const markdown =
    `# Ultimate global inventory\n\n${notice}\n\n` +
    `Coverage input: ${facts.coverageInput.path}; revision ${facts.coverageInput.revision}\n\n` +
    `## Batches\n\n${batchLines}\n\n` +
    `## Coverage\n\n${facts.coverage.map((c) => `- ${c.id}: ${c.owner ?? "UNOWNED"} -> ${c.resolution ?? "UNRESOLVED"}`).join("\n")}\n\n` +
    `## References\n\n${facts.references.length} references; ${unresolved(facts.references).length} unresolved.\n\n` +
    facts.batches
      .map((b) => {
        const own = facts.references.filter((r) => r.from === b.path);
        return `- ${b.path}: ${own.length} references, ${unresolved(own).length} unresolved`;
      })
      .join("\n") +
    "\n";
  const validation =
    `# Global inventory validation\n\nOwner review: required. ${notice}\n\n` +
    `Coverage input: ${facts.coverageInput.path}; revision ${facts.coverageInput.revision}\n\n` +
    `Scoped batch validation: ${facts.scoped ? "run" : "skipped"}\n\n` +
    `Batch inputs:\n${batchLines}\n\n` +
    `Result: ${complete ? "global reconciliation passed" : `${problems.length} problem(s)`}\n\n` +
    (problems.length
      ? `Diagnostics:\n${problems.map((p) => `- ${p.kind}: ${p.subject}: ${p.detail}`).join("\n")}\n\n`
      : "") +
    `Historical (not canonical):\n${facts.historical.map((h) => `- ${h.path}#${h.record}: ${h.supersededBy ? `superseded by ${h.supersededBy}` : "no canonical counterpart"}`).join("\n") || "None declared."}\n`;
  return {
    "global.json":
      JSON.stringify({ complete, ownerReview: "required", problems, ...facts }, null, 2) + "\n",
    "global.md": markdown,
    "validation.md": validation,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const value = (flag, fallback) =>
      args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
    if (!args.includes("--root"))
      throw new Error(
        "Usage: node global.mjs --root ROOT [--coverage PATH] [--inputs DIR] [--historical PATH]... [--out DIR] [--no-scoped]"
      );
    const root = resolve(value("--root"));
    const coveragePath = value("--coverage", "scripts/inventory/package-coverage.json");
    const inputsDir = value("--inputs", "scripts/inventory");
    const historicalPaths = args.flatMap((a, i) => (a === "--historical" ? [args[i + 1]] : []));
    const out = args.includes("--out") ? resolve(value("--out")) : null;
    if (out && out === resolve(root, inputsDir))
      throw new Error("Output must not be the authored input directory");
    const read = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
    const batches = [];
    const historical = [];
    for (const name of readdirSync(resolve(root, inputsDir))
      .filter((n) => n.endsWith(".json"))
      .sort()) {
      const path = posix.join(inputsDir, name);
      if (path === posix.normalize(coveragePath)) continue;
      const input = read(path);
      if (!Array.isArray(input.records)) continue;
      (historicalPaths.some((h) => posix.normalize(h) === path) ? historical : batches).push({
        path,
        input,
      });
    }
    for (const h of historicalPaths)
      if (!historical.some((x) => x.path === posix.normalize(h)) || !existsSync(resolve(root, h)))
        throw new Error(`Historical input ${h} is not a record input in ${inputsDir}`);
    const result = reconcileGlobal({
      root,
      coverage: { path: coveragePath, input: read(coveragePath) },
      batches,
      historical,
      scoped: !args.includes("--no-scoped"),
    });
    if (out) {
      mkdirSync(out, { recursive: true });
      for (const [name, text] of Object.entries(result.views))
        writeFileSync(resolve(out, name), text);
    }
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.problems.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
