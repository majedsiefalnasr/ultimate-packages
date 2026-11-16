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

test("Vue feedback documents each component and directive interface from source", () => {
  const input = load();
  const interfaces = Object.fromEntries(input.records.map((record) => [record.id, record.surface]));
  for (const id of families.slice(0, 8)) {
    const text = interfaces[`vue.${id}`];
    assert.match(text, /Props: .+\. Emits: .+\. Slots: .+\./, id);
  }
  const expected = {
    "vue.progress-bar": ["value (number, default 0)", "showValue", "unit", "mode"],
    "vue.progress-spinner": ["strokeWidth", "fill", "animationDuration", "ariaLabel"],
    "vue.meter-group": [
      "value (readonly unknown[] array",
      "min",
      "max",
      "orientation",
      "label, color, value",
      "icon",
    ],
    "vue.skeleton": ["shape", "animation", "borderRadius", "size", "width", "height"],
    "vue.terminal": ["welcomeMessage", "prompt", "command(string)", "response(string)", "clear"],
    "vue.inplace": [
      "active",
      "disabled",
      "preventClick",
      "open(event)",
      "close(event)",
      "update:active(boolean)",
      "closeCallback",
    ],
    "vue.scroll-top": ["target", "threshold", "behavior", "buttonAriaLabel", "show", "hide"],
    "vue.deferred-content": ["Props: none", "Emits: load", "Slots: default"],
    "vue.ripple": ["Directive value: void"],
    "vue.key-filter": [
      "RegExp | UKeyFilterPattern | UKeyFilterOptions | undefined",
      "pattern",
      "validateOnly",
    ],
    "vue.style-class": [
      "UStyleClassOptions | undefined",
      "selector",
      "enterFromClass",
      "hideOnOutsideClick",
      "hideOnEscape",
      "hideOnResize",
    ],
    "vue.animate-on-scroll": [
      "AnimateOnScrollValue | undefined",
      "enterClass",
      "leaveClass",
      "rootMargin",
      "threshold",
      "once",
    ],
  };
  const sourceTokens = {
    "vue.progress-bar": ["value", "showValue", "unit", "mode"],
    "vue.progress-spinner": ["strokeWidth", "fill", "animationDuration", "ariaLabel"],
    "vue.meter-group": ["value", "min", "max", "orientation", "label", "color", "icon"],
    "vue.skeleton": ["shape", "animation", "borderRadius", "size", "width", "height"],
    "vue.terminal": ["welcomeMessage", "prompt", "command", "response", "clear"],
    "vue.inplace": [
      "active",
      "disabled",
      "preventClick",
      "open",
      "close",
      "update:active",
      "closeCallback",
    ],
    "vue.scroll-top": ["target", "threshold", "behavior", "buttonAriaLabel", "show", "hide"],
    "vue.deferred-content": ["load", "<slot"],
    "vue.ripple": ["createDirective"],
    "vue.key-filter": [
      "RegExp",
      "UKeyFilterPattern",
      "UKeyFilterOptions",
      "pattern",
      "validateOnly",
      "createDirective",
    ],
    "vue.style-class": [
      "UStyleClassOptions",
      "selector",
      "enterFromClass",
      "hideOnOutsideClick",
      "hideOnEscape",
      "hideOnResize",
      "createDirective",
    ],
    "vue.animate-on-scroll": [
      "AnimateOnScrollValue",
      "enterClass",
      "leaveClass",
      "rootMargin",
      "threshold",
      "once",
      "createDirective",
    ],
  };
  for (const [id, tokens] of Object.entries(expected)) {
    assert.ok(interfaces[id], `${id} must have authored interface details`);
    for (const token of tokens) assert.ok(interfaces[id].includes(token), `${id}: ${token}`);
    const record = input.records.find((entry) => entry.id === id);
    const implementation = record.files
      .filter((file) => !/\.(spec|stories)\.ts$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\\n");
    for (const token of sourceTokens[id])
      assert.ok(implementation.includes(token), `${id} source must define or use ${token}`);
  }
  for (const id of families.slice(8))
    assert.match(
      interfaces[`vue.${id}`],
      /Component props\/emits\/slots: not applicable; this is a directive\./,
      id
    );
});

test("Vue directive relationships follow actual imports and package ownership", () => {
  const input = load();
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  const expected = {
    "vue.deferred-content": ["package.ultimate.vue.deferred-content"],
    "vue.ripple": [
      "package.ultimate.vue.ripple",
      "package.ultimate.vue-core.directive",
      "package.ultimate.uix-utils.dom",
    ],
    "vue.key-filter": ["package.ultimate.vue.key-filter", "package.ultimate.vue-core.directive"],
    "vue.style-class": ["package.ultimate.vue.style-class", "package.ultimate.vue-core.directive"],
    "vue.animate-on-scroll": [
      "package.ultimate.vue.animate-on-scroll",
      "package.ultimate.vue-core.directive",
    ],
  };
  for (const [id, relationships] of Object.entries(expected)) {
    const record = input.records.find((entry) => entry.id === id);
    assert.deepEqual(record.relationships, relationships, id);
    for (const relationship of relationships) {
      const owner = coverage.find((entry) => entry.id === relationship);
      assert.ok(owner, `${id} relationship owner ${relationship}`);
      if (relationship === `package.ultimate.vue.${id.slice("vue.".length)}`)
        assert.ok(owner.tickets.includes(142), `${relationship} remains owned by #142`);
      else
        assert.ok(
          owner.tickets.some((ticket) => ticket !== 142),
          `${relationship} remains cross-ticket owned`
        );
    }
    const family = id.slice("vue.".length);
    const source = readFileSync(
      `packages/vue/src/${family}/${family === "deferred-content" ? "DeferredContent.vue" : `${family}.ts`}`,
      "utf8"
    );
    const usesDirectiveFactory =
      source.includes('from "@ultimate/vue-core"') && source.includes("createDirective");
    assert.equal(
      relationships.includes("package.ultimate.vue-core.directive"),
      usesDirectiveFactory,
      id
    );
    assert.equal(
      relationships.includes("package.ultimate.uix-utils.dom"),
      source.includes('from "@ultimate/uix-utils/dom"'),
      id
    );
  }
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
