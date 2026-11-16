import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const families = [
  "carousel",
  "galleria",
  "image",
  "image-compare",
  "card",
  "panel",
  "fieldset",
  "splitter",
  "divider",
  "scroll-panel",
];
const load = () =>
  JSON.parse(readFileSync("scripts/inventory/angular-media-containers.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });

test("Angular media and containers reconciles every scoped file and public export", () => {
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
  assert.equal(result.facts.files.length, 50);
  assert.equal(result.facts.exports.length, 29);
  assert.equal(input.records.flatMap((r) => r.files).length, 30);
  assert.equal(input.dispositions.length, 20);
  const manifest = JSON.parse(readFileSync("packages/ng/package.json", "utf8"));
  const rootBarrel = readFileSync("packages/ng/src/index.ts", "utf8");
  for (const family of families) {
    assert.ok(rootBarrel.includes(family === "panel" ? '"./panel"' : `"@ultimate/ng/${family}"`));
    if (family === "panel") assert.equal(manifest.exports["./panel"], undefined);
    else assert.ok(manifest.exports[`./${family}`]);
  }
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/ng#InventedMedia");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
});

test("owned declarations, templates, styles and observed behavior have authored interpretation", () => {
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
    assert.ok(record.surface.includes("component-metadata"));
    assert.ok(record.surface.includes("@ultimate/uix-styles"));
    const verified = record.claims.find((c) => c.state === "verified");
    assert.equal(verified.outcome, "passed");
    assert.equal(verified.revision, load().revision);
    assert.ok(record.relationships.includes("package.ultimate.ng-core.basecomponent"));
    assert.ok(record.relationships.includes("package.ultimate.themes.presets"));
  }
  const records = Object.fromEntries(load().records.map((r) => [r.id, r]));
  assert.deepEqual(records["angular.panel"].exports, ["@ultimate/ng#UPanel"]);
  assert.deepEqual(records["angular.splitter"].exports, [
    "@ultimate/ng#USplitter",
    "@ultimate/ng#USplitterPanel",
    "@ultimate/ng#USplitterResizeEvent",
    "@ultimate/ng/splitter#USplitter",
    "@ultimate/ng/splitter#USplitterPanel",
    "@ultimate/ng/splitter#USplitterResizeEvent",
  ]);
  for (const [family, terms] of Object.entries({
    carousel: [
      "UCarouselItemContext",
      "UCarouselPageEvent",
      "CarouselItemListParams",
      "goToPage",
      "autoplayInterval",
    ],
    galleria: [
      "UGalleriaItemContext",
      "activeIndexInput",
      "thumbnail",
      "openFullScreen",
      "constructor",
    ],
    image: ["onImageError", "ESCAPE_PRIORITIES.IMAGE", "imageDisplayOrderUid", "0.1", "UFocusTrap"],
    "image-compare": ["[left]", "[right]", "clipPath", ":dir(rtl)", "no outputs"],
    card: ["subheader", "[card-header]", "[card-footer]", "no outputs"],
    panel: ["UButton", "onBeforeToggle", "onAfterToggle", "toggledCollapsed"],
    fieldset: ["legend", "collapsedChange", "aria-controls", "toggledCollapsed"],
    splitter: [
      "USplitterPanel",
      "uSplitterPanelMinSize",
      "USplitterResizeEvent",
      "@ContentChildren",
      "40 ms",
    ],
    divider: ["role=separator", "aria-orientation", "no outputs"],
    "scroll-panel": [
      "scrollTop(scrollTop:number)",
      "refresh()",
      "contentId",
      "setTimeout",
      "barfocus",
    ],
  }))
    for (const term of terms)
      assert.ok(records[`angular.${family}`].surface.includes(term), `${family}: ${term}`);
  assert.ok(records["angular.panel"].relationships.includes("package.ultimate.ng.button"));
  for (const family of ["image", "galleria"])
    for (const target of ["overlay", "focus-trap", "icons"])
      assert.ok(
        records[`angular.${family}`].relationships.includes(`package.ultimate.ng-core.${target}`)
      );
});

test("local aliases reject same-ticket deferrals and broken references", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 137);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.ng.${f}`, `angular.${f}`]).sort()
  );
  const ownership = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  for (const pending of input.pending)
    assert.ok(!ownership.find((o) => o.id === pending.id).tickets.includes(137));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-137", reason: "Invalid local deferral" });
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
    assert.equal(readFileSync(`docs/inventory/angular-media-containers/${name}`, "utf8"), text);
});
