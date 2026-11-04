import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () =>
  JSON.parse(readFileSync("scripts/inventory/react-option-selection.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = ["autocomplete", "cascade-select", "listbox", "multi-select", "select"];
const src = (family) => readFileSync(`packages/react/src/${family}/${family}.tsx`, "utf8");

test("React option selection rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const stale = load();
  stale.dispositions.push({ path: "missing.ts", reason: "Stale exclusion" });
  assert.ok(run(stale).problems.some((p) => p.subject === "missing.ts"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/react#ImaginaryHook");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
  const dangling = load();
  dangling.records[0].relationships.push("imaginary.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-117", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every exported source declaration is interpreted and entries match root barrel and manifest", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/react/package.json", "utf8"));
  const root = readFileSync("packages/react/src/index.ts", "utf8");
  assert.deepEqual(input.records.map((r) => r.id.slice("react.".length)).sort(), [...families]);
  for (const record of input.records) {
    const family = record.id.slice("react.".length);
    assert.ok(root.includes(`export * from "./${family}";`), `${family} root barrel`);
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    assert.equal(manifest.exports[`./${family}`].types, `./dist/${family}/index.d.mts`);
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
  }
});

test("props, state, overlay, accessibility, styles and source-only quirks are recorded from source", () => {
  const by = (id) => load().records.find((r) => r.id === id);
  const never = "option click does not check disabled";
  for (const [id, terms] of Object.entries({
    autocomplete: [
      "not a forwardRef",
      "searchTimeout",
      "never cleared",
      "completeMethod",
      "suggestions[focusedIndex]",
      "ArrowDown",
      "aria-controls",
      "strict equality",
      "u-autocomplete-filled",
      "no CSS rule",
      "no Portal",
      never,
    ],
    select: [
      "optionDisabled",
      "aria-label",
      "aria-controls",
      "non-terminating",
      "Home",
      "showClear",
      "stays open when disabled becomes true",
      "no outside-click",
      "searchbox",
      "USelectChangeEvent",
      "SelectClassesParams",
      never,
    ],
    "multi-select": [
      "toggleAll",
      "onSelectionChange",
      "Select All",
      "maxSelectedLabels",
      "non-terminating",
      "aria-multiselectable",
      "no inputId",
      "stays open when disabled becomes true",
      "no outside-click",
      "selectedItemsLabel",
      "UMultiSelectChangeEvent",
      never,
    ],
    "cascade-select": [
      "optionGroupChildren",
      "activeOptionPath",
      "node.parentKey",
      "role=tree",
      "no keyboard",
      "focused",
      "leaf",
      "no Tab",
      "stays open when disabled becomes true",
      "UCascadeSelectChangeEvent",
      never,
    ],
    listbox: [
      "non-terminating",
      "aria-multiselectable",
      "multiple",
      "never emits null",
      "no aria-activedescendant",
      "filter input stays enabled",
      "UListboxChangeEvent",
      "ListboxClassesParams",
      never,
    ],
  }))
    for (const term of terms) assert.ok(by(`react.${id}`).surface.includes(term), `${id}: ${term}`);
  // The moveFocus do/while edge case is present in exactly select, multi-select and listbox.
  const loops = families.filter((f) =>
    /while \(isOptionDisabled\(visibleOptions\[next\]\)/.test(src(f))
  );
  assert.deepEqual(loops, ["listbox", "multi-select", "select"]);
  for (const f of families)
    assert.equal(by(`react.${f}`).surface.includes("non-terminating"), loops.includes(f), f);
  // Absent-pattern claims hold for every scoped component.
  for (const f of families)
    for (const pattern of [
      "forwardRef",
      "createPortal",
      "addEventListener",
      "aria-controls",
      "useImperativeHandle",
      "Scroller",
    ])
      assert.ok(!src(f).includes(pattern), `${f}: ${pattern}`);
  // Theme links follow the Aura registry; no scoped family has a metadata record.
  const registry = readFileSync("packages/themes/src/presets/aura/index.ts", "utf8");
  for (const f of families) {
    const key = f.replace(/-/g, "");
    assert.ok(new RegExp(`^\\s+(${key}|${key}: \\w+),$`, "m").test(registry), `${f} registry key`);
    assert.ok(by(`react.${f}`).relationships.includes("package.ultimate.themes.presets"), f);
    assert.ok(
      !by(`react.${f}`).relationships.includes("package.ultimate.component-metadata.records"),
      f
    );
  }
  assert.ok(by("react.multi-select").surface.includes("multiselect"));
  assert.ok(by("react.cascade-select").surface.includes("cascadeselect"));
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.react.${f}`, `react.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 117);
  for (const alias of input.aliases)
    assert.ok(coverage.some((o) => o.id === alias.id && o.tickets.includes(117)));
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(117), pending.id);
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
  const readme = readFileSync("docs/inventory/react-option-selection/README.md", "utf8");
  const input = load();
  const loopers = input.records
    .filter((r) => r.surface.includes("non-terminating"))
    .map((r) => r.id);
  assert.deepEqual(loopers, ["react.listbox", "react.multi-select", "react.select"]);
  assert.ok(readme.includes("select, multi-select and listbox"));
  for (const record of input.records) assert.ok(readme.includes(record.id.slice(6)), record.id);
});

test("React option selection reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/react-option-selection/${name}`, "utf8"), text);
});
