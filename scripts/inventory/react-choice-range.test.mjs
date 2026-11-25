import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () => JSON.parse(readFileSync("scripts/inventory/react-choice-range.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = [
  "checkbox",
  "input-switch",
  "knob",
  "multi-state-checkbox",
  "radio-button",
  "rating",
  "select-button",
  "slider",
  "toggle-button",
  "tri-state-checkbox",
];

test("React choice and range rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
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
  deferred.pending.push({ id: alias.id, batch: "ticket-114", reason: "Incorrect deferral" });
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

test("props, refs, state, composition, styles and source-only quirks are recorded from source", () => {
  const by = (id) => load().records.find((r) => r.id === id);
  assert.ok(by("react.checkbox").exports.includes("@ultimate/react#UCheckboxChangeEvent"));
  assert.ok(by("react.knob").exports.every((e) => !e.includes("ChangeEvent")));
  for (const [id, terms] of Object.entries({
    checkbox: [
      "trueValue",
      "inputRef",
      "internalInputRef",
      "UTooltip",
      "never read",
      "not a forwardRef",
    ],
    "radio-button": [
      "checked: !checked",
      "inputRef",
      "internalInputRef",
      "no value attribute",
      "not a forwardRef",
    ],
    "toggle-button": ["onLabel", "offLabel", "data-p-highlight", "Enter", "tabIndex", ":has"],
    "input-switch": [
      'role="switch"',
      "aria-checked",
      "trueValue",
      "internalInputRef",
      "no readOnly",
    ],
    "select-button": [
      "UToggleButton",
      "fluid: false",
      "never emitted",
      "roving",
      "optionDisabled",
      "SelectButtonClassesParams",
    ],
    "multi-state-checkbox": [
      "empty",
      'role="checkbox"',
      "aria-label",
      "nullLabel",
      "live-region",
      "optionIcon",
    ],
    "tri-state-checkbox": [
      "mixed",
      "u-hidden-accessible",
      "aria-live",
      "UTimesIcon",
      "readOnly",
      "sibling",
    ],
    rating: ["stars", 'role="radio"', "1 star", "cancel", "getElement", "pointerDown"],
    slider: [
      "onSlideEnd",
      "range",
      "orientation",
      'role="slider"',
      "tabIndex",
      "SliderClassesParams",
      "stale",
    ],
    knob: ["onChange(value", "valueTemplate", "PageUp", "offsetX", "touch handling", "KnobProps"],
  }))
    for (const term of terms) assert.ok(by(`react.${id}`).surface.includes(term), `${id}: ${term}`);
  const themed = [
    "checkbox",
    "radio-button",
    "rating",
    "select-button",
    "slider",
    "knob",
    "toggle-button",
  ];
  for (const f of families)
    assert.equal(
      by(`react.${f}`).relationships.includes("package.ultimate.themes.presets"),
      themed.includes(f),
      `${f} theme link`
    );
  for (const record of load().records)
    assert.equal(
      record.relationships.includes("package.ultimate.component-metadata.records"),
      record.id === "react.checkbox",
      `${record.id}: metadata link`
    );
  assert.ok(
    by("react.select-button").relationships.includes("package.ultimate.react.toggle-button")
  );
  assert.ok(by("react.checkbox").relationships.includes("package.ultimate.react.tooltip"));
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.react.${f}`, `react.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 114);
  for (const alias of input.aliases)
    assert.ok(coverage.some((o) => o.id === alias.id && o.tickets.includes(114)));
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(114), pending.id);
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

test("React choice and range reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/react-choice-range/${name}`, "utf8"), text);
});
