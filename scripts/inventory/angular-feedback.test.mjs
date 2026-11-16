import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const families = [
  "progress-bar",
  "progress-spinner",
  "meter-group",
  "skeleton",
  "terminal",
  "inplace",
  "scroll-top",
  "ripple",
  "autofocus",
  "fluid",
  "key-filter",
  "style-class",
  "animate-on-scroll",
];
const load = () => JSON.parse(readFileSync("scripts/inventory/angular-feedback.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });

test("Angular feedback reconciles tracked scope and actual manifest availability", () => {
  const input = load();
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.deepEqual(input.records.map((r) => r.id.slice(8)).sort(), [...families].sort());
  const tracked = execFileSync(
    "git",
    ["ls-files", ...families.map((f) => `packages/ng/src/${f}/`)],
    { encoding: "utf8" }
  )
    .trim()
    .split("\n")
    .sort();
  assert.deepEqual(result.facts.files, tracked);
  assert.equal(result.facts.files.length, 59);
  assert.equal(input.records.flatMap((r) => r.files).length, 33);
  assert.equal(input.dispositions.length, 26);
  assert.equal(result.facts.exports.length, 31);
  const manifest = JSON.parse(readFileSync("packages/ng/package.json", "utf8"));
  const root = readFileSync("packages/ng/src/index.ts", "utf8");
  for (const family of families) {
    const secondary = manifest.exports[`./${family}`];
    const entry = family === "scroll-top" ? "./scroll-top" : `@ultimate/ng/${family}`;
    assert.ok(root.includes(`export * from "${entry}";`));
    assert.equal(Boolean(secondary), family !== "scroll-top");
    const mapped = input.packages[0].entries.filter(
      (e) => e.source === `packages/ng/src/${family}/index.ts`
    );
    assert.deepEqual(mapped.map((e) => e.subpath).sort(), secondary ? [".", `./${family}`] : ["."]);
  }
  assert.equal(input.ownership.ticket, 140);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.ng.${f}`, `angular.${f}`]).sort()
  );
});

test("source exports including types and source-only style modules have an owning explanation", () => {
  for (const record of load().records) {
    for (const file of record.files.filter((f) => !f.endsWith("/index.ts"))) {
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
});

test("Angular feedback regeneration preserves authored material and matches reading views", () => {
  const authored = readFileSync("scripts/inventory/angular-feedback.json", "utf8");
  const notes = readFileSync("docs/inventory/angular-feedback/README.md", "utf8");
  const evidence = readFileSync("docs/inventory/angular-feedback/product-run.json", "utf8");
  const input = JSON.parse(authored);
  const snapshot = JSON.stringify(input);
  const first = run(input);
  assert.deepEqual(first.problems, []);
  assert.deepEqual(run(input).views, first.views);
  assert.equal(JSON.stringify(input), snapshot);
  assert.equal(readFileSync("scripts/inventory/angular-feedback.json", "utf8"), authored);
  assert.equal(readFileSync("docs/inventory/angular-feedback/README.md", "utf8"), notes);
  assert.equal(readFileSync("docs/inventory/angular-feedback/product-run.json", "utf8"), evidence);
  for (const [name, text] of Object.entries(first.views))
    assert.equal(readFileSync(`docs/inventory/angular-feedback/${name}`, "utf8"), text);
});
