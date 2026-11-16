import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const inputPath = "scripts/inventory/vue-feedback.json";
const load = () => JSON.parse(readFileSync(inputPath, "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = [
  "progress-bar",
  "progress-spinner",
  "meter-group",
  "skeleton",
  "terminal",
  "inplace",
  "scroll-top",
  "deferred-content",
  "ripple",
  "key-filter",
  "style-class",
  "animate-on-scroll",
];

test("Vue feedback reconciles every scoped source and package entry", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/vue/package.json", "utf8"));
  const root = readFileSync("packages/vue/src/index.ts", "utf8");
  assert.deepEqual(
    input.records.map((record) => record.id.slice("vue.".length)).sort(),
    [...families].sort()
  );
  assert.equal(input.revision, "fdd42818185ed77ae0c025f732310672581c1cea");
  for (const record of input.records) {
    const family = record.id.slice("vue.".length);
    assert.ok(root.includes(`export * from "./${family}";`), family);
    const subpath = manifest.exports[`./${family}`];
    if (record.exports.some((entry) => entry.startsWith(`@ultimate/vue/${family}#`))) {
      assert.ok(subpath, `${family} subpath export`);
      assert.equal(subpath.import, `./dist/${family}/index.mjs`);
      assert.equal(subpath.types, `./dist/${family}/index.d.mts`);
    } else {
      assert.equal(subpath, undefined, `${family} is root-only`);
    }
    const file = `packages/vue/src/${family}/index.ts`;
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    for (const statement of source.statements) {
      if (
        !ts.isExportDeclaration(statement) ||
        !statement.exportClause ||
        !ts.isNamedExports(statement.exportClause)
      )
        continue;
      for (const item of statement.exportClause.elements)
        assert.ok(
          record.exports.some((entry) => entry.endsWith(`#${item.name.text}`)),
          `${file}#${item.name.text}`
        );
    }
  }
});

test("Vue feedback records Vue-specific directive and component contracts", () => {
  const by = (id) => load().records.find((record) => record.id === id);
  const cases = {
    "vue.progress-bar": ["createBaseProgressBar", "ProgressBar.vue"],
    "vue.progress-spinner": ["createBaseProgressSpinner", "ProgressSpinner.vue"],
    "vue.meter-group": ["UMeterGroup", "MeterGroup.vue"],
    "vue.skeleton": ["USkeleton", "Skeleton.vue"],
    "vue.terminal": ["terminalEventBus", "Terminal.vue"],
    "vue.inplace": ["createBaseInplace", "Inplace.vue"],
    "vue.scroll-top": ["UScrollTop", "ScrollTop.vue"],
    "vue.deferred-content": ["UDeferredContent", "DeferredContent.vue"],
    "vue.ripple": ["rippleDirective", "ripple.ts"],
    "vue.key-filter": ["UKeyFilter", "key-filter.ts"],
    "vue.style-class": ["UStyleClass", "style-class.ts"],
    "vue.animate-on-scroll": ["animateOnScrollDirective", "animate-on-scroll.ts"],
  };
  for (const [id, terms] of Object.entries(cases)) {
    const record = by(id);
    assert.ok(record, id);
    for (const term of terms)
      assert.ok(
        record.exports.some((entry) => entry.endsWith(`#${term}`)) ||
          record.files.some((file) => file.endsWith(term)),
        `${id}: ${term}`
      );
    assert.ok(record.relationships.includes(id.replace("vue.", "package.ultimate.vue.")), id);
  }
  assert.ok(by("vue.ripple").exports.some((entry) => entry.endsWith("#rippleDirective")));
  const animationSource = readFileSync(
    "packages/vue/src/animate-on-scroll/animate-on-scroll.ts",
    "utf8"
  );
  assert.equal((animationSource.match(/new IntersectionObserver/g) ?? []).length, 2);
});

test("Vue feedback keeps product run provenance and unrelated ownership separate", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((alias) => [alias.id, alias.record]).sort(),
    families.map((family) => [`package.ultimate.vue.${family}`, `vue.${family}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 142);
  for (const alias of input.aliases)
    assert.ok(
      coverage.some((item) => item.id === alias.id && item.tickets.includes(142)),
      alias.id
    );
  for (const record of input.records) {
    assert.ok(
      record.claims.some((claim) => claim.state === "verified" && claim.outcome === "passed"),
      record.id
    );
    assert.ok(
      record.claims.some((claim) => claim.state === "failed" && claim.outcome === "failed"),
      record.id
    );
  }
});

test("Vue feedback reconciles scope, preserves authorship and generated views byte-for-byte", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/vue-feedback/${name}`, "utf8"), text);
});
