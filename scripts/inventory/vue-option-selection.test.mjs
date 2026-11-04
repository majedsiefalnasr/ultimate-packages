import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () => JSON.parse(readFileSync("scripts/inventory/vue-option-selection.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = ["autocomplete", "cascade-select", "listbox", "multi-select", "select"];
const dir = (family) => `packages/vue/src/${family}`;
const sfcFiles = {
  autocomplete: ["AutoComplete.vue"],
  select: ["Select.vue"],
  "multi-select": ["MultiSelect.vue"],
  "cascade-select": ["CascadeSelect.vue", "CascadeSelectSublist.vue"],
  listbox: ["Listbox.vue"],
};
const sources = (family) =>
  sfcFiles[family].map((f) => readFileSync(`${dir(family)}/${f}`, "utf8")).join("\n");
const by = (id) => load().records.find((r) => r.id === id);

test("Vue option selection rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const stale = load();
  stale.dispositions.push({ path: "missing.ts", reason: "Stale exclusion" });
  assert.ok(run(stale).problems.some((p) => p.subject === "missing.ts"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/vue#ImaginaryHook");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
  const dangling = load();
  dangling.records[0].relationships.push("imaginary.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-118", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every exported source declaration is interpreted and entries match root barrel and manifest", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/vue/package.json", "utf8"));
  const root = readFileSync("packages/vue/src/index.ts", "utf8");
  assert.deepEqual(input.records.map((r) => r.id.slice("vue.".length)).sort(), [...families]);
  for (const record of input.records) {
    const family = record.id.slice("vue.".length);
    assert.ok(root.includes(`export * from "./${family}";`), `${family} root barrel`);
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    assert.equal(manifest.exports[`./${family}`].types, `./dist/${family}/index.d.mts`);
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
});

test("props, emits, v-model, overlay, accessibility, styles and source-only quirks are recorded from source", () => {
  const optionDisabledGuard = "Option-click handlers never read the component disabled prop";
  const terms = {
    autocomplete: [
      "createBaseInput",
      "searchTimeout",
      "not cleared by hide",
      "complete",
      "option-select",
      "change is declared and never emitted",
      "suggestions[focusedIndex]",
      "suggestions is empty",
      "no aria-controls",
      "strict equality",
      "p-filled",
      "no CSS rule",
      "UPortal",
      'ref="input"',
      optionDisabledGuard,
    ],
    select: [
      "createBaseInput",
      "optionDisabled",
      "ariaFilterLabel",
      "aria-activedescendant",
      "no aria-controls",
      "non-terminating",
      "Home",
      "showClear",
      "no outside-click",
      "searchbox",
      "SelectClassesParams",
      "change is declared and never emitted",
      "filterInput",
      "UPortal",
      optionDisabledGuard,
    ],
    "multi-select": [
      "createBaseInput",
      "toggleAll",
      "select-all-change",
      "Select All",
      "maxSelectedLabels",
      "non-terminating",
      "aria-multiselectable",
      "no inputId",
      "no outside-click",
      "selectedItemsLabel",
      "MultiSelectClassesParams",
      "empty array",
      "filterInput",
      "UPortal",
      optionDisabledGuard,
    ],
    "cascade-select": [
      "createBaseInput",
      "optionGroupChildren",
      "activeOptionPath",
      "parentKey",
      'role="tree"',
      "CascadeSelectSublist",
      "no Tab",
      "no outside-click",
      "change is declared and never emitted",
      "no fluid",
      "UPortal",
      optionDisabledGuard,
    ],
    listbox: [
      "createBaseEditableHolder",
      "non-terminating",
      "aria-multiselectable",
      "multiple",
      "never emits null",
      "no aria-activedescendant",
      "filter input is not disabled",
      "ListboxClassesParams",
      "no Portal",
      optionDisabledGuard,
    ],
  };
  for (const [family, list] of Object.entries(terms))
    for (const term of list)
      assert.ok(by(`vue.${family}`).surface.includes(term), `${family}: ${term}`);
  // The moveFocus do/while edge case is present in exactly select, multi-select and listbox.
  const loops = families.filter((f) =>
    /while \(this\.isOptionDisabled\(options\[next\]\) && next !== this\.focusedIndex\)/.test(
      sources(f)
    )
  );
  assert.deepEqual(loops, ["listbox", "multi-select", "select"]);
  for (const f of families)
    assert.equal(by(`vue.${f}`).surface.includes("non-terminating"), loops.includes(f), f);
  // `change` is declared but emitted only by multi-select and listbox.
  const emitsChange = families.filter((f) => /\$emit\("change"/.test(sources(f)));
  assert.deepEqual(emitsChange, ["listbox", "multi-select"]);
  for (const f of families)
    assert.equal(
      by(`vue.${f}`).surface.includes("change is declared and never emitted"),
      !emitsChange.includes(f),
      f
    );
  // UPortal is composed by every family except listbox.
  const portal = families.filter((f) => /<UPortal/.test(sources(f)));
  assert.deepEqual(portal, ["autocomplete", "cascade-select", "multi-select", "select"]);
  for (const f of families)
    assert.equal(by(`vue.${f}`).surface.includes("no Portal"), !portal.includes(f), f);
  // No scoped component handles outside clicks; the four overlay families record it.
  for (const f of families)
    for (const pattern of [
      "aria-controls",
      "addEventListener",
      "getBoundingClientRect",
      "Scroller",
      "<slot",
      "defineModel",
      "v-model",
      ".focus(",
      "$refs",
      "beforeUnmount",
      "ZIndex",
      'lang="ts"',
    ])
      assert.ok(!sources(f).includes(pattern), `${f}: ${pattern}`);
  // Only select has aria-activedescendant besides autocomplete.
  const activedescendant = families.filter((f) => sources(f).includes("aria-activedescendant"));
  assert.deepEqual(activedescendant, ["autocomplete", "select"]);
  for (const f of families)
    assert.equal(
      by(`vue.${f}`).surface.includes("no aria-activedescendant"),
      !activedescendant.includes(f),
      f
    );
  // Option click handlers never read the component disabled prop.
  for (const f of families)
    for (const name of ["onOptionSelect", "onOptionClick"]) {
      const m = sources(f).match(
        new RegExp(`${name}\\((?:event, )?\\w*\\) \\{[\\s\\S]*?\\n    \\},`)
      );
      if (m) assert.ok(!/this\.disabled/.test(m[0]), `${f}.${name}`);
    }
  // Aura registry keys and metadata: names differ from keys for multi-select and cascade-select.
  const registry = readFileSync("packages/themes/src/presets/aura/index.ts", "utf8");
  for (const f of families) {
    const key = f.replace(/-/g, "");
    assert.ok(new RegExp(`^\\s+(${key}|${key}: \\w+),$`, "m").test(registry), `${f} registry key`);
    assert.ok(by(`vue.${f}`).relationships.includes("package.ultimate.themes.presets"), f);
    assert.ok(
      !by(`vue.${f}`).relationships.includes("package.ultimate.component-metadata.records"),
      f
    );
    assert.ok(by(`vue.${f}`).relationships.includes("package.ultimate.vue-core.base"), f);
    assert.equal(
      by(`vue.${f}`).relationships.includes("package.ultimate.vue-core.overlay"),
      portal.includes(f),
      f
    );
  }
  assert.ok(by("vue.multi-select").surface.includes("multiselect"));
  assert.ok(by("vue.cascade-select").surface.includes("cascadeselect"));
  // No metadata record exists for any scoped family.
  const records = readdirSync("packages/component-metadata/src/records");
  for (const f of families) assert.ok(!records.includes(`${f}.ts`), f);
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 118);
  for (const alias of input.aliases)
    assert.ok(coverage.some((o) => o.id === alias.id && o.tickets.includes(118)));
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(118), pending.id);
  }
  for (const record of input.records) {
    assert.ok(!record.claims.some((c) => ["verified", "failed"].includes(c.state)));
    const check = record.claims.find((c) => c.command);
    assert.equal(check.state, "not-run");
    assert.ok(check.limitations.length > 0);
    assert.ok(record.claims.some((c) => c.state === "ci-enforced"));
  }
  const views = run(input).views;
  for (const alias of input.aliases)
    assert.ok(
      views[`${alias.record}.md`].includes(`${alias.id} → [${alias.record}](${alias.record}.md)`)
    );
});

test("README observations are derived from the JSON records", () => {
  const readme = readFileSync("docs/inventory/vue-option-selection/README.md", "utf8");
  const input = load();
  const loopers = input.records
    .filter((r) => r.surface.includes("non-terminating"))
    .map((r) => r.id);
  assert.deepEqual(loopers, ["vue.listbox", "vue.multi-select", "vue.select"]);
  assert.ok(readme.includes("select, multi-select and listbox"));
  const neverChange = input.records
    .filter((r) => r.surface.includes("change is declared and never emitted"))
    .map((r) => r.id.slice(4));
  assert.deepEqual(neverChange, ["autocomplete", "cascade-select", "select"]);
  assert.ok(readme.includes("autocomplete, cascade-select and select declare `change`"));
  for (const record of input.records) assert.ok(readme.includes(record.id.slice(4)), record.id);
});

test("Vue option selection reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/vue-option-selection/${name}`, "utf8"), text);
});
