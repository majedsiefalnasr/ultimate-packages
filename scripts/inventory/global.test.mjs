import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { reconcileGlobal } from "./global.mjs";

const COVERAGE = "inputs/package-coverage.json";

// A synthetic repository: one package with two source families (x, y), a
// reserved scaffold, a coverage file and two ticket batches that cover it.
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ultimate-global-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, text) => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  put("packages/a/package.json", JSON.stringify({ name: "@test/a" }));
  put("packages/a/src/x/one.ts", "export const one = 1;\n");
  put("packages/a/src/y/two.ts", "export const two = 2;\n");
  put("packages/empty/.gitkeep", "");
  const coverage = {
    mode: "packages",
    version: 1,
    scope: "packages",
    revision: "rev0",
    tickets: [
      { number: 1, title: "X family" },
      { number: 2, title: "Y family" },
    ],
    ownership: [
      { id: "package.test.a", tickets: [1] },
      { id: "package.test.a.x", tickets: [1] },
      { id: "package.test.a.y", tickets: [2] },
      { id: "package.reserved.empty", reason: "Reserved scaffold with only .gitkeep." },
    ],
  };
  put(COVERAGE, JSON.stringify(coverage));
  const record = (id, file, relationships = []) => ({
    id,
    name: id,
    framework: "shared",
    purpose: "Synthetic.",
    surface: "Synthetic.",
    files: [file],
    availability: "internal",
    exports: [],
    evidence: [{ path: file, contains: "export const" }],
    relationships,
    claims: [],
  });
  const batch = (ticket, scope, root_, records, aliases, pending = []) => ({
    version: 1,
    scope,
    revision: `rev${ticket}`,
    ownership: { ticket, path: COVERAGE },
    aliases,
    packages: [{ path: "packages/a", roots: [root_], entries: [] }],
    records,
    dispositions: [],
    pending,
  });
  const one = batch(
    1,
    "x-1",
    "packages/a/src/x",
    [record("x.one", "packages/a/src/x/one.ts", ["package.test.a.y"])],
    [
      { id: "package.test.a", record: "x.one" },
      { id: "package.test.a.x", record: "x.one" },
    ],
    [{ id: "package.test.a.y", batch: "Y family (#2)", reason: "Owned by #2." }]
  );
  const two = batch(
    2,
    "y-2",
    "packages/a/src/y",
    [record("y.two", "packages/a/src/y/two.ts")],
    [{ id: "package.test.a.y", record: "y.two" }]
  );
  const run = (overrides = {}) =>
    reconcileGlobal({
      root,
      coverage: { path: COVERAGE, input: coverage },
      batches: [
        { path: "inputs/one.json", input: one },
        { path: "inputs/two.json", input: two },
      ],
      historical: [],
      ...overrides,
    });
  return { root, put, coverage, one, two, record, run };
}

const kinds = (result) => result.problems.map((p) => `${p.kind}: ${p.subject}`);

test("a fully covered synthetic platform reconciles with evidence for each resolution", (t) => {
  const { run } = fixture(t);
  const result = run();
  assert.deepEqual(result.problems, []);
  assert.equal(result.complete, true);
  assert.equal(result.ownerReview, "required");
  assert.deepEqual(
    result.facts.coverage.map((c) => [c.id, c.resolution]),
    [
      ["package.reserved.empty", "excluded"],
      ["package.test.a", "inputs/one.json#x.one"],
      ["package.test.a.x", "inputs/one.json#x.one"],
      ["package.test.a.y", "inputs/two.json#y.two"],
    ]
  );
  const pending = result.facts.references.find((r) => r.origin === "pending");
  assert.deepEqual(pending, {
    from: "inputs/one.json",
    origin: "pending",
    source: "x-1",
    target: "package.test.a.y",
    resolution: "inputs/two.json#y.two",
    via: "alias",
  });
});

test("coverage owned by a ticket is unresolved unless that ticket's batch aliases it", (t) => {
  const { run, two } = fixture(t);
  const result = run({
    batches: [{ path: "inputs/two.json", input: { ...two, aliases: [] } }],
  });
  assert.equal(result.complete, false);
  // The owning batch still accounts for every file of the family, so it resolves by files.
  assert.equal(
    result.facts.coverage.find((c) => c.id === "package.test.a.y").resolution,
    "inputs/two.json#files"
  );
  assert.ok(kinds(result).includes("coverage: package.test.a"), kinds(result).join("\n"));
  assert.match(
    result.problems.find((p) => p.subject === "package.test.a").detail,
    /No batch input owns ticket #1/
  );
  // A record elsewhere must not be credited to the owning ticket.
  const misplaced = run({
    batches: [
      {
        path: "inputs/two.json",
        input: {
          ...two,
          aliases: [...two.aliases, { id: "package.test.a.x", record: "y.two" }],
        },
      },
    ],
  });
  assert.match(
    misplaced.problems.find((p) => p.subject === "package.test.a.x").detail,
    /aliased only by ticket\(s\) #2, not owning ticket\(s\) #1/
  );
});

test("multi-owner package resolves only as an aggregate of every owning batch", (t) => {
  const { run, coverage, one, two } = fixture(t);
  coverage.ownership.find((o) => o.id === "package.test.a").tickets = [1, 2];
  const result = run({
    batches: [
      {
        path: "inputs/one.json",
        input: {
          ...one,
          records: [{ ...one.records[0], relationships: ["package.test.a"] }],
          pending: [{ id: "package.test.a", batch: "#1, #2", reason: "Shared topology." }],
        },
      },
      { path: "inputs/two.json", input: two },
    ],
    scoped: false,
  });
  assert.equal(result.complete, true);
  assert.match(
    result.facts.coverage.find((c) => c.id === "package.test.a").resolution,
    /^aggregate of 2 resolved families/
  );
  // Without the second owner's batch the aggregate must stay unresolved.
  const partial = run({ batches: [{ path: "inputs/one.json", input: one }], scoped: false });
  assert.equal(partial.complete, false);
  assert.equal(partial.facts.coverage.find((c) => c.id === "package.test.a").resolution, null);
  assert.match(
    partial.problems.find((p) => p.kind === "coverage" && p.subject === "package.test.a").detail,
    /Multi-owner package aggregate is incomplete: no batch for #2/
  );
});

test("multi-owner root families stay unresolved without authored aggregate evidence", (t) => {
  const { run, coverage, put } = fixture(t);
  put("packages/a/src/index.ts", "export * from './x/one';\n");
  coverage.ownership.push({ id: "package.test.a.root", tickets: [1, 2] });
  const result = run();
  assert.equal(result.facts.coverage.find((c) => c.id === "package.test.a.root").resolution, null);
  assert.deepEqual(kinds(result), ["coverage: package.test.a.root"]);
});

test("references must resolve to an authored record and agree with the named ticket", (t) => {
  const { run, one, two } = fixture(t);
  const unknown = run({
    batches: [
      {
        path: "inputs/one.json",
        input: {
          ...one,
          records: [{ ...one.records[0], relationships: ["package.test.missing"] }],
          pending: [{ id: "package.test.missing", batch: "#2", reason: "Elsewhere." }],
        },
      },
      { path: "inputs/two.json", input: two },
    ],
    scoped: false,
  });
  assert.deepEqual(
    unknown.problems.filter((p) => p.kind === "reference").map((p) => p.detail),
    [
      "Pending target package.test.missing (named #2) has no authored record or alias in any batch",
      "Relationship x.one -> package.test.missing has no authored record or alias in any batch",
    ]
  );
  assert.ok(
    unknown.facts.references.every((r) => r.target !== "package.test.missing" || !r.resolution)
  );
  const mismatch = run({
    batches: [
      {
        path: "inputs/one.json",
        input: { ...one, pending: [{ ...one.pending[0], batch: "ticket-9" }] },
      },
      { path: "inputs/two.json", input: two },
    ],
    scoped: false,
  });
  assert.deepEqual(kinds(mismatch), ["reference: inputs/one.json"]);
  assert.match(mismatch.problems[0].detail, /names #9 but resolves in ticket #2/);
});

test("duplicates within canonical inputs are reported", (t) => {
  const { run, one, two, record } = fixture(t);
  const result = run({
    batches: [
      { path: "inputs/one.json", input: one },
      {
        path: "inputs/two.json",
        input: {
          ...two,
          records: [
            ...two.records,
            {
              ...record("x.one", "packages/a/src/x/one.ts"),
              availability: "public",
              exports: ["@test/a#one"],
            },
          ],
          aliases: [...two.aliases, { id: "package.test.a.x", record: "y.two" }],
        },
      },
    ],
    scoped: false,
  });
  assert.deepEqual(
    kinds(result).filter((k) => k.startsWith("duplicate")),
    ["duplicate: package.test.a.x", "duplicate: packages/a/src/x/one.ts", "duplicate: x.one"]
  );
});

test("explicit historical input is separated from canonical truth, not counted or resolved", (t) => {
  const { run, one } = fixture(t);
  const result = run({
    historical: [
      {
        path: "inputs/pilot.json",
        input: {
          ...one,
          scope: "pilot",
          ownership: undefined,
          aliases: undefined,
          records: [...one.records, { ...one.records[0], id: "pilot.only" }],
        },
      },
    ],
  });
  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.facts.historical, [
    { path: "inputs/pilot.json", record: "pilot.only", supersededBy: null },
    { path: "inputs/pilot.json", record: "x.one", supersededBy: "inputs/one.json#x.one" },
  ]);
  assert.ok(result.facts.references.every((r) => r.from !== "inputs/pilot.json"));
  assert.match(result.views["validation.md"], /Historical \(not canonical\)/);
});

test("batch ownership and per-batch scoped validation feed the global result", (t) => {
  const { run, one, two } = fixture(t);
  const result = run({
    batches: [
      { path: "inputs/one.json", input: { ...one, ownership: { ticket: 7, path: COVERAGE } } },
      { path: "inputs/two.json", input: two },
      { path: "inputs/four.json", input: { ...two, scope: "unowned", ownership: undefined } },
      {
        path: "inputs/three.json",
        input: {
          ...two,
          scope: "y-again",
          aliases: [],
          records: [
            { ...two.records[0], id: "y.again", evidence: [{ path: "nope.ts", contains: "x" }] },
          ],
        },
      },
    ],
  });
  const subjects = kinds(result);
  assert.ok(subjects.includes("input: inputs/one.json"), subjects.join("\n"));
  assert.match(
    result.problems.find((p) => p.kind === "input" && p.subject === "inputs/one.json").detail,
    /Ticket #7 is not a coverage ticket/
  );
  assert.match(
    result.problems.find((p) => p.kind === "input" && p.subject === "inputs/four.json").detail,
    /Record input has no ticket ownership/
  );
  assert.match(
    result.problems.find((p) => p.kind === "input" && p.subject === "inputs/two.json").detail,
    /Ticket #2 is also owned by inputs\/three\.json/
  );
  assert.ok(
    result.problems.some(
      (p) => p.kind === "scoped" && p.subject === "inputs/three.json" && /evidence/.test(p.detail)
    )
  );
});

test("output is deterministic regardless of input order", (t) => {
  const { run, one, two } = fixture(t);
  const a = run();
  const b = run({
    batches: [
      { path: "inputs/two.json", input: two },
      { path: "inputs/one.json", input: one },
    ],
  });
  assert.deepEqual(a, b);
  assert.match(a.views["validation.md"], /Owner review: required/);
  assert.match(a.views["validation.md"], /inputs\/one\.json: ticket #1; scope x-1; revision rev1/);
  assert.doesNotMatch(JSON.stringify(a), /\d{4}-\d{2}-\d{2}T/);
});

test("CLI discovers inputs, separates historical input, and refuses to write into inputs", (t) => {
  const { root, put, one, two } = fixture(t);
  put("inputs/one.json", JSON.stringify(one));
  put("inputs/two.json", JSON.stringify(two));
  put("inputs/notes.json", JSON.stringify({ unrelated: true }));
  const cli = (...extra) =>
    spawnSync(
      process.execPath,
      [
        join(import.meta.dirname, "global.mjs"),
        "--root",
        root,
        "--coverage",
        COVERAGE,
        "--inputs",
        "inputs",
        ...extra,
      ],
      { encoding: "utf8" }
    );
  const out = join(root, "out");
  const ok = cli("--out", out);
  assert.equal(ok.status, 0, ok.stderr + ok.stdout);
  assert.deepEqual(readdirSync(out).sort(), ["global.json", "global.md", "validation.md"]);
  assert.equal(
    readFileSync(join(out, "global.json"), "utf8"),
    JSON.parse(ok.stdout).views["global.json"]
  );
  assert.equal(cli("--out", out).stdout, ok.stdout, "regeneration is byte-identical");

  put(
    "inputs/pilot.json",
    JSON.stringify({ ...one, scope: "pilot", ownership: undefined, aliases: [] })
  );
  const unowned = cli();
  assert.equal(unowned.status, 1);
  assert.match(unowned.stdout, /Record input has no ticket ownership; declare it --historical/);
  const declared = cli("--historical", "inputs/pilot.json");
  assert.equal(declared.status, 0, declared.stdout);
  assert.match(declared.stdout, /"supersededBy": "inputs\/one.json#x.one"/);

  const refused = cli("--out", join(root, "inputs"));
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /Output must not be the authored input directory/);
});

test("an alias does not hide an unaccounted discovered family file", (t) => {
  const { run, put } = fixture(t);
  put("packages/a/src/y/extra.ts", "export const extra = 1;\n");
  const result = run({ scoped: false });
  assert.ok(
    result.problems.some(
      (p) => p.kind === "coverage" && /no record owner or reasoned disposition/.test(p.detail)
    ),
    kinds(result).join("\n")
  );
});

test("an alias targeting a missing record is rejected even without scoped validation", (t) => {
  const { run, two } = fixture(t);
  const result = run({
    batches: [
      {
        path: "inputs/two.json",
        input: { ...two, aliases: [{ id: "package.test.a.y", record: "missing.record" }] },
      },
    ],
    scoped: false,
  });
  assert.equal(result.complete, false);
  assert.ok(result.problems.some((p) => p.kind === "alias"));
});
