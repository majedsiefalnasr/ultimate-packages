import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const families = [
  "menu",
  "context-menu",
  "breadcrumb",
  "mega-menu",
  "menubar",
  "panel-menu",
  "tiered-menu",
  "dock",
  "speed-dial",
];
const read = (path) => readFileSync(path, "utf8");
const load = () => JSON.parse(read("scripts/inventory/vue-menu-navigation.json"));
const run = (input) => inventory({ root: process.cwd(), input });

test("Vue navigation reconciles every scoped source and public entry", () => {
  const input = load();
  assert.deepEqual(run(input).problems, []);
  assert.deepEqual(input.records.map((r) => r.id).sort(), families.map((f) => `vue.${f}`).sort());
  const listed = execFileSync(
    "git",
    ["ls-files", ...families.map((f) => `packages/vue/src/${f}/`)],
    { encoding: "utf8" }
  )
    .trim()
    .split("\n");
  const accounted = [
    ...input.records.flatMap((r) => r.files),
    ...input.dispositions.map((d) => d.path),
  ];
  assert.deepEqual(accounted.sort(), listed.sort());
  assert.equal(listed.length, 60);
  assert.equal(new Set(accounted).size, listed.length);
  const manifest = JSON.parse(read("packages/vue/package.json"));
  for (const f of families) {
    assert.ok(read("packages/vue/src/index.ts").includes(`export * from "./${f}";`));
    assert.equal(manifest.exports[`./${f}`].import, `./dist/${f}/index.mjs`);
    assert.ok(read("packages/vue/tsup.config.ts").includes(`"${f}/index"`));
  }
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/vue#InventedNavigation");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
});

test("owned declarations and source-only composition have consumer interpretations", () => {
  for (const record of load().records) {
    for (const file of record.files.filter((f) => f.endsWith(".ts") && !f.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const names = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of names) assert.ok(record.surface.includes(name), `${file}#${name}`);
      }
    }
    for (const file of record.files.filter((f) => f.endsWith(".vue"))) {
      const name = /name: "(\w+)"/.exec(read(file))[1];
      assert.ok(record.surface.includes(name), `${file}#${name}`);
    }
  }
  const by = (f) => load().records.find((r) => r.id === `vue.${f}`);
  for (const [f, terms] of Object.entries({
    menu: ["UMenuitem", "aria-activedescendant", "onAfterLeave"],
    "context-menu": ["pageX", "global"],
    breadcrumb: ["homeAriaLabel", "aria-current"],
    "mega-menu": ["UMegaMenuColumnGroup", "toRaw"],
    menubar: ["UMenubarSub", "ArrowRight"],
    "panel-menu": ["UPanelMenuList", "position-derived", "Set"],
    "tiered-menu": ["UTieredMenuSub", "document"],
    dock: ["Home", "End"],
    "speed-dial": ["transitionDelay", "semi-circle"],
  }))
    for (const term of terms) assert.ok(by(f).surface.includes(term), `${f}: ${term}`);
});

test("ownership rejects local deferral and dangling targets", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 127);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-127", reason: "Invalid local deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership"));
  const dangling = load();
  dangling.records[0].relationships.push("nonexistent.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
});

test("generation preserves authored records and matches byte-exact indexed views", () => {
  const input = load();
  const before = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(read(`docs/inventory/vue-menu-navigation/${name}`), text);
});
