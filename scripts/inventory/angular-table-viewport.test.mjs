import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const families = ["table", "paginator", "scroller"];
const load = () =>
  JSON.parse(readFileSync("scripts/inventory/angular-table-viewport.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });

test("Angular table and viewport reconciles all scoped files and public exports", () => {
  const input = load();
  assert.deepEqual(input.records.map((r) => r.id.slice(8)).sort(), [...families].sort());
  const result = run(input);
  assert.deepEqual(result.problems, []);
  const tracked = execFileSync(
    "git",
    ["ls-files", ...families.map((f) => `packages/ng/src/${f}/`)],
    { encoding: "utf8" }
  )
    .trim()
    .split("\n")
    .sort();
  assert.deepEqual(result.facts.files, tracked);
  assert.equal(result.facts.files.length, 18);
  assert.equal(result.facts.exports.length, 9);
  const manifest = JSON.parse(readFileSync("packages/ng/package.json", "utf8"));
  const rootBarrel = readFileSync("packages/ng/src/index.ts", "utf8");
  for (const family of families) {
    assert.ok(rootBarrel.includes(family === "table" ? '"./table"' : `"@ultimate/ng/${family}"`));
    if (family === "table") assert.equal(manifest.exports["./table"], undefined);
    else assert.ok(manifest.exports[`./${family}`]);
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
    const verified = record.claims.find((c) => c.state === "verified");
    assert.equal(verified.state, "verified");
    assert.equal(verified.outcome, "passed");
    assert.equal(verified.revision, load().revision);
    assert.ok(record.claims.some((c) => c.state === "failed" && c.outcome === "failed"));
    assert.ok(record.relationships.includes("package.ultimate.ng-core.basecomponent"));
    assert.ok(record.relationships.includes("package.ultimate.component-metadata.records"));
  }
  const records = Object.fromEntries(load().records.map((r) => [r.id, r]));
  assert.deepEqual(records["angular.table"].exports, ["@ultimate/ng#UTable"]);
  for (const [id, terms] of Object.entries({
    "angular.table": [
      "UTableColumn",
      "registerCustomFilter",
      "initRowEdit",
      "rowsPerPageOptions",
      "lazyLoadOnInit",
      "source-only",
    ],
    "angular.paginator": [
      "PaginatorPageChangeEvent",
      "changePage(first:number)",
      "pageLinkSize",
      "aria-current",
      "paginatorStyleModule",
    ],
    "angular.scroller": [
      "UScrollerContentContext",
      "descendants:false",
      "ResizeObserver",
      "scrollToIndex",
      "Promise.resolve().then()",
      "scrollerStyleModule",
    ],
  }))
    for (const term of terms) assert.ok(records[id].surface.includes(term), `${id}: ${term}`);
  assert.ok(records["angular.table"].relationships.includes("angular.paginator"));
  assert.ok(records["angular.table"].relationships.includes("angular.scroller"));
  assert.ok(records["angular.paginator"].relationships.includes("package.ultimate.themes.presets"));
  for (const family of ["table", "scroller"])
    assert.ok(
      !records[`angular.${family}`].relationships.includes("package.ultimate.themes.presets")
    );
});

test("local aliases reject same-ticket deferrals and broken references", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 131);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.ng.${f}`, `angular.${f}`]).sort()
  );
  const ownership = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  for (const pending of input.pending)
    assert.ok(!ownership.find((o) => o.id === pending.id).tickets.includes(131));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-131", reason: "Invalid local deferral" });
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
    assert.equal(readFileSync(`docs/inventory/angular-table-viewport/${name}`, "utf8"), text);
});
