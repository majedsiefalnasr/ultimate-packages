import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inventory } from "./pilot.mjs";
import ts from "typescript";

const load = () => JSON.parse(readFileSync("scripts/inventory/vue-actions.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
test("Vue actions reject missing sources, invented exports and same-ticket deferrals", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/vue#ImaginaryDirective");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "packages", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership"));
});
test("Vue declarations, factory availability and composition match source", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/vue/package.json", "utf8"));
  for (const record of input.records) {
    const family = record.id.slice(4);
    assert.ok(
      readFileSync("packages/vue/src/index.ts", "utf8").includes(`export * from "./${family}";`)
    );
    assert.equal(manifest.exports[`./${family}`].types, `./dist/${family}/index.d.mts`);
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    for (const file of record.files.filter((f) => f.endsWith(".ts") && !f.endsWith("/index.ts"))) {
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
  const overlay = input.records.find((r) => r.id === "vue.overlay-badge");
  assert.ok(!overlay.exports.some((e) => e.endsWith("#createBaseOverlayBadge")));
  assert.ok(overlay.surface.includes("source-only"));
  for (const slot of ["default", "start", "center", "end"])
    assert.ok(
      input.records
        .find((r) => r.id === "vue.toolbar")
        .surface.toLowerCase()
        .includes(slot)
    );
  const ownership = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.aliases.length, 10);
  for (const pending of input.pending)
    assert.ok(ownership.some((o) => o.id === pending.id && !o.tickets.includes(109)));
});
test("Vue actions reconcile owned sources and public exports without replacing the pilot button identity", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.filter((r) => r.id === "vue.button").length, 1);
  assert.equal(input.records.length, 10);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/vue-actions/${name}`, "utf8"), text);
});
