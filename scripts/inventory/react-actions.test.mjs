import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () => JSON.parse(readFileSync("scripts/inventory/react-actions.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
test("React actions reconcile sources, stable views and preserved authorship", () => {
  const input = load();
  const before = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/react-actions/${name}`, "utf8"), text);
});
test("React actions reject missing ownership, invented exports and unresolved same-ticket aliases", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const fabricated = load();
  fabricated.records[0].exports.push("@ultimate/react#ImaginaryHook");
  assert.ok(run(fabricated).problems.some((p) => p.kind === "export"));
  const alias = load();
  const removed = alias.aliases.shift();
  alias.pending.push({ id: removed.id, batch: "packages", reason: "Incorrect deferral" });
  assert.ok(run(alias).problems.some((p) => p.kind === "ownership"));
});
test("React declarations and composition have explicit authored interpretation", () => {
  const input = load();
  for (const record of input.records) {
    const family = record.id.slice("react.".length);
    assert.ok(
      readFileSync("packages/react/src/index.ts", "utf8").includes(`export * from "./${family}";`)
    );
    const manifest = JSON.parse(readFileSync("packages/react/package.json", "utf8"));
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    assert.equal(manifest.exports[`./${family}`].types, `./dist/${family}/index.d.mts`);
    for (const file of record.files) {
      const source = ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true
      );
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const names = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of names) assert.ok(record.surface.includes(name), `${file}#${name}`);
      }
    }
  }
  assert.ok(input.records.some((r) => r.id === "react.button"));
  for (const slot of ["start", "center", "end", "children"])
    assert.ok(input.records.find((r) => r.id === "react.toolbar").surface.includes(slot));
  const ownership = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.aliases.length, 8);
  for (const pending of input.pending)
    assert.ok(ownership.some((o) => o.id === pending.id && !o.tickets.includes(108)));
});
