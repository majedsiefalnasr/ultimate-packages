import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () => JSON.parse(readFileSync("scripts/inventory/vue-text-entry.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = [
  "float-label",
  "icon-field",
  "ifta-label",
  "input-chips",
  "input-group",
  "input-mask",
  "input-otp",
  "input-text",
  "password",
  "textarea",
];

test("Vue text entry rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
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
  deferred.pending.push({ id: alias.id, batch: "ticket-112", reason: "Incorrect deferral" });
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

test("props, emits, slots, v-model, composition and source-only quirks are recorded from source", () => {
  const by = (id) => load().records.find((r) => r.id === id);
  assert.ok(by("vue.icon-field").exports.includes("@ultimate/vue#UInputIcon"));
  assert.ok(by("vue.input-group").exports.includes("@ultimate/vue#UInputGroupAddon"));
  for (const [id, terms] of Object.entries({
    "vue.input-text": [
      "createBaseInput",
      "resolvedVariant",
      "p-invalid",
      "p-variant-filled",
      "size",
      "writeValue",
    ],
    "vue.textarea": ["autoResize", "ResizeObserver", "mounted", "offsetParent", "filled", "never"],
    "vue.input-mask": [
      "unmask",
      "slotChar",
      "complete",
      "partialPosition",
      "data()",
      "u-input-text",
      "paste",
    ],
    "vue.input-otp": [
      "integerOnly",
      "length",
      "keydown",
      "not emitted",
      "aria-label",
      "setTimeout",
      "isNaN",
    ],
    "vue.password": [
      "toggleMask",
      "strongRegex",
      "Portal",
      "Escape",
      "clearIcon",
      'role="button"',
      "invalid",
    ],
    "vue.input-chips": [
      "createBaseComponent",
      "inheritAttrs",
      "$attrs",
      "add",
      "paste",
      "max",
      "separator",
      "focusedIndex",
    ],
    "vue.float-label": ["variant", "over", ":has", "u-filled", "do not match", "p-invalid"],
    "vue.ifta-label": ["no props", ":has", "u-invalid", "does not match", "p-invalid"],
    "vue.icon-field": ["no props", "iconPosition", "first-child", "UInputIcon", "aria-hidden"],
    "vue.input-group": [
      "no props",
      "u-component",
      "u-inputwrapper",
      "u-button",
      "UInputGroupAddon",
    ],
  }))
    for (const term of terms) assert.ok(by(id).surface.includes(term), `${id}: ${term}`);
  const themed = by("vue.input-text").relationships;
  assert.ok(themed.includes("package.ultimate.themes.presets"));
  assert.ok(!by("vue.input-mask").relationships.includes("package.ultimate.themes.presets"));
  assert.ok(by("vue.password").relationships.includes("package.ultimate.vue-core.overlay"));
  for (const record of load().records) {
    assert.ok(
      !record.relationships.includes("package.ultimate.component-metadata.records"),
      `${record.id}: metadata link has no source support`
    );
    assert.ok(
      !record.relationships.includes("package.ultimate.uix-styles.inputtext"),
      `${record.id}: Vue styles are hand-ported, not imported from uix-styles`
    );
  }
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 112);
  for (const alias of input.aliases)
    assert.ok(coverage.some((o) => o.id === alias.id && o.tickets.includes(112)));
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(112), pending.id);
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

test("Vue text entry reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/vue-text-entry/${name}`, "utf8"), text);
});
