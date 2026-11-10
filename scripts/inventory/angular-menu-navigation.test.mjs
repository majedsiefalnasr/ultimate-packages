import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const load = () =>
  JSON.parse(readFileSync("scripts/inventory/angular-menu-navigation.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });

test("Angular menu navigation reconciles all scoped files and public exports", () => {
  const input = load();
  assert.deepEqual(input.records.map((r) => r.id.slice(8)).sort(), [...families].sort());
  assert.deepEqual(run(input).problems, []);
  const manifest = JSON.parse(readFileSync("packages/ng/package.json", "utf8"));
  const rootBarrel = readFileSync("packages/ng/src/index.ts", "utf8");
  for (const family of families) {
    assert.ok(rootBarrel.includes(family === "menu" ? '"./menu"' : `"@ultimate/ng/${family}"`));
    if (family !== "menu") assert.ok(manifest.exports[`./${family}`]);
  }
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/ng#InventedNavigation");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
});

test("owned source declarations, composition members and interfaces have authored interpretation", () => {
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
    for (const evidence of record.evidence)
      assert.ok(
        readFileSync(evidence.path, "utf8").includes(evidence.contains),
        `${record.id}: ${evidence.contains}`
      );
    assert.ok(record.surface.includes("UBaseComponent"));
    assert.equal(record.claims.find((c) => c.command).state, "not-run");
    assert.ok(!record.claims.some((c) => ["verified", "failed"].includes(c.state)));
  }
  const records = Object.fromEntries(load().records.map((r) => [r.id, r]));
  for (const [id, terms] of Object.entries({
    "angular.menu": ["toggle(event)", "command", "menuStyleModule", "ComponentIdGenerator"],
    "angular.context-menu": ["aria-activedescendant", "pageX", "global"],
    "angular.breadcrumb": ["isCurrentBreadcrumbItem", "source-only", "homeAriaLabel"],
    "angular.mega-menu": ["UMegaMenuGroup", "not re-exported", "UMegaMenuColumnGroup"],
    "angular.menubar": ["UMenubarSub", "ITEM_LINK_SELECTOR"],
    "angular.panel-menu": ["UPanelMenuList", "WritableSignal", "multiple"],
    "angular.tiered-menu": ["UTieredMenuSub", "document:keydown.escape"],
    "angular.dock": ["scale(1.5)", "Home", "End"],
    "angular.speed-dial": ["SpeedDialDirection", "SpeedDialType", "transitionDelay"],
  }))
    for (const term of terms) assert.ok(records[id].surface.includes(term), `${id}: ${term}`);
});

test("local aliases reject same-ticket deferrals and broken references", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 125);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.ng.${f}`, `angular.${f}`]).sort()
  );
  const ownership = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  for (const pending of input.pending)
    assert.ok(!ownership.find((o) => o.id === pending.id).tickets.includes(125));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-125", reason: "Invalid local deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership"));
  const dangling = load();
  dangling.records[0].relationships.push("nonexistent.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
});

test("generation is deterministic, preserves authored input and matches indexed committed views", () => {
  const input = load();
  const before = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/angular-menu-navigation/${name}`, "utf8"), text);
});
