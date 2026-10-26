import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL, URL } from "node:url";
import ts from "typescript";

const schema = JSON.parse(readFileSync(new URL("./pilot-schema.json", import.meta.url), "utf8"));

// The schema uses this deliberately small JSON Schema vocabulary; reject unknown
// keywords when extending it rather than pretending to implement all JSON Schema.
function validate(value, rule, path, problems) {
  if (rule.enum && !rule.enum.includes(value))
    problems.push({ kind: "schema", subject: path, detail: "Not an allowed value" });
  if (
    rule.type &&
    (rule.type === "array"
      ? !Array.isArray(value)
      : rule.type === "object"
        ? !value || typeof value !== "object" || Array.isArray(value)
        : typeof value !== rule.type)
  ) {
    problems.push({ kind: "schema", subject: path, detail: `Expected ${rule.type}` });
    return;
  }
  if (
    typeof value === "string" &&
    ((rule.minLength && value.trim().length < rule.minLength) ||
      (rule.pattern && !new RegExp(rule.pattern).test(value)))
  )
    problems.push({ kind: "schema", subject: path, detail: "Invalid string" });
  if (rule.type === "array")
    value.forEach((item, i) => validate(item, rule.items, `${path}[${i}]`, problems));
  if (rule.type === "object") {
    for (const key of rule.required || [])
      if (!(key in value))
        problems.push({
          kind: "schema",
          subject: `${path}.${key}`,
          detail: "Required field missing",
        });
    for (const [key, item] of Object.entries(value)) {
      if (rule.properties[key]) validate(item, rule.properties[key], `${path}.${key}`, problems);
      else if (rule.additionalProperties === false)
        problems.push({ kind: "schema", subject: `${path}.${key}`, detail: "Unknown field" });
    }
  }
}

/** Reconcile an explicitly bounded inventory; never asserts platform completeness. */
export function inventory({ root, input }) {
  const problems = [];
  validate(input, schema, "input", problems);
  if (problems.length)
    return { problems, complete: false, facts: { files: [], exports: [] }, views: {} };
  const files = [];
  const exports = [];
  const read = (path) => readFileSync(resolve(root, path), "utf8");
  function walk(path) {
    for (const entry of readdirSync(resolve(root, path), { withFileTypes: true })) {
      const next = `${path}/${entry.name}`;
      if (entry.isDirectory()) walk(next);
      else if (entry.isFile()) files.push(next);
    }
  }
  for (const pkg of input.packages) {
    const manifest = JSON.parse(read(`${pkg.path}/package.json`));
    for (const path of pkg.roots) walk(path);
    for (const entry of pkg.entries) {
      if (!Object.hasOwn(manifest.exports || {}, entry.subpath))
        problems.push({
          kind: "entry",
          subject: entry.subpath,
          detail: `Not exported by ${manifest.name}`,
        });
      const source = ts.createSourceFile(
        entry.source,
        read(entry.source),
        ts.ScriptTarget.Latest,
        true
      );
      for (const statement of source.statements) {
        if (
          ts.isExportDeclaration(statement) &&
          statement.exportClause &&
          ts.isNamedExports(statement.exportClause)
        ) {
          for (const symbol of statement.exportClause.elements)
            exports.push(
              `${manifest.name}${entry.subpath === "." ? "" : entry.subpath.slice(1)}#${symbol.name.text}`
            );
        } else if (ts.isExportDeclaration(statement)) {
          problems.push({
            kind: "discovery",
            subject: entry.source,
            detail:
              "Star and namespace re-exports require an explicit bounded entry mapping; not silently expanded",
          });
        } else if (statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
          if (ts.isVariableStatement(statement))
            for (const d of statement.declarationList.declarations)
              exports.push(
                `${manifest.name}${entry.subpath === "." ? "" : entry.subpath.slice(1)}#${d.name.getText(source)}`
              );
          else if (statement.name)
            exports.push(
              `${manifest.name}${entry.subpath === "." ? "" : entry.subpath.slice(1)}#${statement.name.text}`
            );
        }
      }
    }
  }
  for (const symbol of exports) {
    if (
      input.records.filter((r) => r.exports.includes(symbol) && r.availability === "public")
        .length !== 1
    )
      problems.push({
        kind: "export",
        subject: symbol,
        detail: "Expected exactly one public record",
      });
  }
  for (const record of input.records)
    for (const symbol of record.exports) {
      if (!exports.includes(symbol))
        problems.push({
          kind: "export",
          subject: symbol,
          detail: "Authored export is not discovered",
        });
    }
  for (const file of files) {
    const owners = input.records.filter((r) => r.files.includes(file));
    const dispositions = input.dispositions.filter((d) => d.path === file && d.reason?.trim());
    if (owners.length + dispositions.length !== 1)
      problems.push({
        kind: "disposition",
        subject: file,
        detail: "Expected exactly one record owner or reasoned disposition",
      });
  }
  for (const record of input.records) {
    for (const evidence of record.evidence) {
      try {
        if (!read(evidence.path).includes(evidence.contains))
          throw new Error("Source anchor not found");
      } catch (error) {
        problems.push({
          kind: "evidence",
          subject: record.id,
          detail: `${evidence.path}: ${error.message}`,
        });
      }
    }
    for (const claim of record.claims) {
      if (
        claim.state === "verified" &&
        (!claim.command ||
          claim.outcome !== "passed" ||
          !claim.revision ||
          !claim.limitations ||
          !claim.output)
      )
        problems.push({
          kind: "claim",
          subject: record.id,
          detail:
            "Verified claims require command, passed outcome, revision, limitations and captured output",
        });
    }
  }
  const ids = new Set(input.records.map((r) => r.id));
  if (ids.size !== input.records.length)
    problems.push({ kind: "identity", subject: input.scope, detail: "Duplicate record ID" });
  for (const pending of input.pending)
    if (
      ids.has(pending.id) ||
      pending.batch === input.scope ||
      !pending.batch ||
      !pending.reason?.trim()
    )
      problems.push({
        kind: "reference",
        subject: pending.id,
        detail: "Pending reference must name a different batch and rationale, not a local record",
      });
  for (const record of input.records)
    for (const target of record.relationships) {
      if (
        !ids.has(target) &&
        !input.pending.some((p) => p.id === target && p.batch !== input.scope && p.reason?.trim())
      )
        problems.push({
          kind: "reference",
          subject: record.id,
          detail: `Unknown relationship ${target}`,
        });
    }
  const records = [...input.records].sort((a, b) => a.id.localeCompare(b.id));
  const views = {
    "index.md":
      "# Ultimate inventory pilot\n\nScoped sample only; not platform completeness.\n\n" +
      records.map((r) => `- [${r.name}](${r.id}.md)`).join("\n") +
      "\n",
  };
  for (const record of records)
    views[`${record.id}.md`] =
      `# ${record.name}\n\nID: ${record.id}\n\nFramework: ${record.framework}; availability: ${record.availability}\n\n## Authored interpretation\n\n${record.purpose}\n\n## Framework surface\n\n${record.surface}\n\n## Public exports\n\n${record.exports.join("\n") || "None; owned internal source."}\n\n## Owned source and evidence\n\n${record.files.join("\n")}\n\n${record.evidence.map((e) => `${e.path}: ${e.contains}`).join("\n")}\n\n## Relationships\n\n${record.relationships.map((id) => `${id}${ids.has(id) ? "" : " (pending cross-batch)"}`).join("\n") || "None recorded."}\n\n## Verification\n\n${JSON.stringify(record.claims, null, 2)}\n`;
  views["validation.md"] =
    `# Scoped validation\n\nScope: ${input.scope}; source revision: ${input.revision}\n\nGlobal completeness: not asserted.\n\n${problems.length ? problems.map((p) => `${p.kind}: ${p.subject}: ${p.detail}`).join("\n") : "Scoped reconciliation passed."}\n\nPending references:\n${input.pending.map((p) => `${p.id}: ${p.batch}: ${p.reason}`).join("\n")}\n`;
  return {
    problems,
    complete: false,
    facts: { files: files.sort(), exports: exports.sort() },
    views,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    const value = (flag) => args[args.indexOf(flag) + 1];
    if (!args.includes("--root") || !args.includes("--input"))
      throw new Error("Usage: node pilot.mjs --root ROOT --input INPUT");
    const result = inventory({
      root: resolve(value("--root")),
      input: JSON.parse(readFileSync(value("--input"), "utf8")),
    });
    if (args.includes("--out") && !result.problems.length) {
      const out = resolve(value("--out"));
      mkdirSync(out, { recursive: true });
      for (const [name, text] of Object.entries(result.views)) {
        const target = resolve(out, name);
        if (target === resolve(value("--input")))
          throw new Error("Output must not overwrite authored input");
        writeFileSync(target, text);
      }
    }
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.problems.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
