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
const load = () => JSON.parse(readFileSync("scripts/inventory/vue-media-containers.json", "utf8"));
const read = (path) => readFileSync(path, "utf8");
const run = (input) => inventory({ root: process.cwd(), input });

test("Vue media and containers reconciles every scoped file and actual public entry", () => {
  const input = load();
  assert.deepEqual(run(input).problems, []);
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
  assert.equal(listed.length, 61);
  assert.equal(new Set(accounted).size, 61);
  assert.equal(input.dispositions.length, 20);
  assert.equal(input.records.flatMap((r) => r.exports).length, 40);
  const manifest = JSON.parse(read("packages/vue/package.json"));
  for (const family of families) {
    assert.ok(read("packages/vue/src/index.ts").includes(`export * from "./${family}";`));
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    assert.ok(read("packages/vue/tsup.config.ts").includes(`"${family}/index"`));
  }
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/vue#InventedMedia");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
});

test("owned declarations, base factories and source-only composition receive interpretation", () => {
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
    for (const evidence of record.evidence)
      assert.ok(
        read(evidence.path).includes(evidence.contains),
        `${record.id}: ${evidence.contains}`
      );
    assert.equal(record.claims.find((c) => c.state === "verified").outcome, "passed");
  }
  const records = Object.fromEntries(load().records.map((r) => [r.id, r]));
  for (const [family, terms] of Object.entries({
    carousel: ["CarouselRootParams", "CarouselIndicatorParams", "autoplayInterval", "page-change"],
    galleria: ["UGalleriaContent", "fullScreenActive", "thumbnail", "activeIndex"],
    image: ["ESCAPE_PRIORITIES", "imageError", "preview", "TimesIcon"],
    "image-compare": ["clipPath", "left", "right", "tabindex"],
    card: ["subtitle", "footer", "no default slot"],
    panel: ["UButton", "before-toggle", "showHeader"],
    fieldset: ["NumpadEnter", "legend", "update:collapsed"],
    splitter: ["minSize", "resizestart", "setInterval", "no SplitterPanel"],
    divider: ["aria-orientation", "layout", "solid"],
    "scroll-panel": ["contentId", "setTimeout", "refresh()", "scrollTop(value)"],
  }))
    for (const term of terms)
      assert.ok(records[`vue.${family}`].surface.includes(term), `${family}: ${term}`);
});

test("ownership aliases and reference checks reject local deferral and dangling targets", () => {
  const input = load();
  assert.equal(input.ownership.ticket, 139);
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-139", reason: "Invalid local deferral" });
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
    assert.equal(read(`docs/inventory/vue-media-containers/${name}`), text);
});
