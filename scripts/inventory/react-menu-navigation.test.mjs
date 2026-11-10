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
const load = () => JSON.parse(readFileSync("scripts/inventory/react-menu-navigation.json", "utf8"));
const read = (path) => readFileSync(path, "utf8");
const run = (input) => inventory({ root: process.cwd(), input });

test("React navigation reconciles every scoped file and actual public entry", () => {
  const input = load();
  assert.deepEqual(run(input).problems, []);
  const listed = execFileSync(
    "git",
    ["ls-files", ...families.map((f) => `packages/react/src/${f}/`)],
    { encoding: "utf8" }
  )
    .trim()
    .split("\n");
  const accounted = [
    ...input.records.flatMap((r) => r.files),
    ...input.dispositions.map((d) => d.path),
  ];
  assert.deepEqual(accounted.sort(), listed.sort());
  assert.equal(listed.length, 51);
  assert.equal(new Set(accounted).size, 51);
  assert.equal(input.dispositions.length, 19);
  const manifest = JSON.parse(read("packages/react/package.json"));
  for (const family of families) {
    assert.ok(read("packages/react/src/index.ts").includes(`export * from "./${family}";`));
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
  }
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/react#InventedNavigation");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
});

test("owned declarations, public types and source-only composition receive interpretation", () => {
  for (const record of load().records) {
    for (const file of record.files.filter((f) => !f.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const names = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of names) assert.ok(record.surface.includes(name), `${file}#${name}`);
      }
    }
    for (const evidence of record.evidence)
      assert.ok(
        read(evidence.path).includes(evidence.contains),
        `${record.id}: ${evidence.contains}`
      );
    assert.equal(record.claims.find((c) => c.command).outcome, "unavailable");
    assert.ok(!record.claims.some((c) => c.state === "verified"));
  }
  const records = Object.fromEntries(load().records.map((r) => [r.id, r]));
  for (const [family, terms] of Object.entries({
    menu: ["popupAlignment", "aria-activedescendant", "onAfterLeave"],
    "context-menu": ["pageX", "microtask", "global"],
    breadcrumb: ["homeAriaLabel", "aria-current", "not the home"],
    "mega-menu": ["UMegaMenuGroup", "UMegaMenuColumnGroupProps", "source-only"],
    menubar: ["UMenubarSubProps", "ArrowRight", "source-only"],
    "panel-menu": ["UPanelMenuListProps", "Set<UMenuItem>", "display: none"],
    "tiered-menu": ["UTieredMenuSubProps", "-9999px", "source-only"],
    dock: ["Home", "End", "scale(1.5)"],
    "speed-dial": ["USpeedDialDirection", "USpeedDialType", "data-u-hidden"],
  }))
    for (const term of terms)
      assert.ok(records[`react.${family}`].surface.includes(term), `${family}: ${term}`);
});

test("ownership aliases and reference checks reject local deferral and dangling targets", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 126);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.react.${f}`, `react.${f}`]).sort()
  );
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-126", reason: "Invalid local deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership"));
  const dangling = load();
  dangling.records[0].relationships.push("nonexistent.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
});

test("generation preserves authored input and matches indexed committed views", () => {
  const input = load();
  const before = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(read(`docs/inventory/react-menu-navigation/${name}`), text);
});
