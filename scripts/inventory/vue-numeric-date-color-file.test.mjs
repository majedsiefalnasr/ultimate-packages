import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () =>
  JSON.parse(readFileSync("scripts/inventory/vue-numeric-date-color-file.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = ["input-number", "date-picker", "color-picker", "file-upload"];
const sfc = {
  "input-number": "InputNumber.vue",
  "date-picker": "DatePicker.vue",
  "color-picker": "ColorPicker.vue",
  "file-upload": "FileUpload.vue",
};
const src = (f) => readFileSync(`packages/vue/src/${f}/${sfc[f]}`, "utf8");
const all = (f) =>
  readdirSync(`packages/vue/src/${f}`)
    .filter((n) => /\.(vue|ts)$/.test(n) && !/\.(spec|stories)\.ts$/.test(n))
    .map((n) => readFileSync(`packages/vue/src/${f}/${n}`, "utf8"))
    .join("\n");
const by = (id) => load().records.find((r) => r.id === id);

test("Vue numeric, date, color and file inputs reject missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
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
  deferred.pending.push({ id: alias.id, batch: "ticket-121", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every exported source declaration is interpreted and entries match root barrel and manifest", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/vue/package.json", "utf8"));
  const root = readFileSync("packages/vue/src/index.ts", "utf8");
  assert.deepEqual(
    input.records.map((r) => r.id.slice("vue.".length)).sort(),
    [...families].sort()
  );
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

test("props, emits, model, overlay, accessibility, math, upload and source-only quirks are recorded from source", () => {
  const terms = {
    "input-number": [
      "createBaseInput",
      "inputnumber",
      '["inputtext"]',
      'role="spinbutton"',
      "aria-valuenow",
      "formatToParts",
      "RangeError",
      "percent mode does not scale",
      "blur does not commit",
      "rawText",
      'ref="input" is declared and never read',
      "12345",
      "123456",
      "useGrouping is false",
      "1e+21",
      "no inputId",
      "InputNumberClassesParams",
      "filled is never passed",
    ],
    "date-picker": [
      "createBaseInput",
      "MM/DD/YYYY",
      "captured once",
      "stripTime",
      'role="dialog"',
      'role="grid"',
      "Sunday first",
      "no outside-click",
      "stays open when disabled becomes true",
      "TypeError",
      "no .focus( call",
      "NaN/NaN/NaN",
      "1950",
      "DatePickerClassesParams",
      "p-disabled",
      "UPortal",
    ],
    "color-picker": [
      "createBaseEditableHolder",
      "no size, fluid or variant",
      "0x0fff",
      "h = 300",
      "defaultColor",
      "touchmove",
      "beforeUnmount",
      "outside-click listener",
      "ConnectedOverlayScrollHandler",
      "localHue",
      '"rrggbb" without "#"',
      "stays open when disabled becomes true",
      'aria-label "Select a color"',
      "ColorPickerPreviewClassesParams",
      "validateHsb",
      "no z-index rule",
      "UPortal",
    ],
    "file-upload": [
      "createBaseComponent",
      "no modelValue",
      "customUpload",
      "lengthComputable",
      "readyState 4",
      "no abort",
      "`*/*`",
      "512.00 TB",
      "UProgressBar",
      "FormData",
      "upload-handler",
      "no role or aria-live",
      "Remove file",
      "FileUploadClassesParams",
      "read at completion time",
      "status 0",
      "no UPortal",
    ],
  };
  for (const [family, list] of Object.entries(terms))
    for (const term of list)
      assert.ok(by(`vue.${family}`).surface.includes(term), `${family}: ${term}`);
  // Absent-pattern claims hold for every scoped component and its base/style sources;
  // color-picker's overlay lifecycle (unmount cleanup, watchers, ptmi root attributes,
  // ZIndex and the window resize listener) is the recorded exception.
  const present = {
    "color-picker": ["beforeUnmount", "watch:", "inheritAttrs", "ZIndex", "window."],
  };
  for (const f of families)
    for (const pattern of [
      "aria-controls",
      "aria-live",
      "<slot",
      "defineModel",
      ".focus(",
      "beforeUnmount",
      "unmounted",
      "watch:",
      "inheritAttrs",
      "ZIndex",
      "window.",
      'lang="ts"',
    ])
      assert.equal(
        all(f).includes(pattern),
        Boolean(present[f]?.includes(pattern)),
        `${f}: ${pattern}`
      );
  // v-model is checked on the SFCs only: a base-factory comment mentions it.
  for (const f of families) assert.ok(!src(f).includes("v-model"), `${f}: v-model`);
  // UPortal composed only by date-picker and color-picker.
  const portal = families.filter((f) => /<UPortal/.test(src(f)));
  assert.deepEqual(portal, ["date-picker", "color-picker"]);
  for (const f of families) {
    assert.equal(by(`vue.${f}`).surface.includes("no UPortal"), !portal.includes(f), f);
    assert.equal(
      by(`vue.${f}`).relationships.includes("package.ultimate.vue-core.overlay"),
      portal.includes(f),
      f
    );
  }
  // Among the two overlay families only date-picker has no outside-click handling.
  assert.deepEqual(
    load()
      .records.filter((r) => r.surface.includes("no outside-click"))
      .map((r) => r.id.slice(4)),
    ["date-picker"]
  );
  // document listeners only in color-picker: drag (touch, then mouse) and the outside click.
  assert.deepEqual(
    families.filter((f) => /document\./.test(all(f))),
    ["color-picker"]
  );
  assert.deepEqual(
    [...src("color-picker").matchAll(/document\.addEventListener\("(\w+)"/g)].map((m) => m[1]),
    ["touchmove", "touchend", "touchcancel", "mousemove", "mouseup", "click"]
  );
  // $refs read only by color-picker and file-upload; input-number declares ref and never reads it.
  assert.deepEqual(
    families.filter((f) => src(f).includes("$refs")),
    ["color-picker", "file-upload"]
  );
  assert.ok(src("input-number").includes('ref="input"'));
  // No z-index in any of the four style modules (color-picker's z-index is set by ZIndex).
  assert.deepEqual(
    families.filter((f) =>
      readFileSync(`packages/vue/src/${f}/${f}-style.ts`, "utf8").includes("z-index")
    ),
    []
  );
  // Only input-number passes extra preset keys; only date-picker has clear; only color-picker emits change.
  assert.deepEqual(
    families.filter((f) => /registerComponentStyle\([^)]*\[/.test(all(f))),
    ["input-number"]
  );
  assert.deepEqual(
    families.filter((f) => /\$emit\("clear"/.test(src(f))),
    ["date-picker", "file-upload"]
  );
  assert.deepEqual(
    families.filter((f) => /\$emit\("change"/.test(src(f))),
    ["color-picker"]
  );
  // Base tiers.
  const base = (f) =>
    readFileSync(`packages/vue/src/${f}/Base${sfc[f].replace(".vue", "")}.ts`, "utf8");
  assert.ok(base("input-number").includes("extends: createBaseInput()"));
  assert.ok(base("date-picker").includes("extends: createBaseInput()"));
  assert.ok(base("color-picker").includes("extends: createBaseEditableHolder({"));
  assert.ok(base("file-upload").includes("createBaseComponent({"));
  // Aura registry keys and metadata: names differ from keys; no metadata records.
  const registry = readFileSync("packages/themes/src/presets/aura/index.ts", "utf8");
  const records = readdirSync("packages/component-metadata/src/records");
  for (const f of families) {
    const key = f.replace(/-/g, "");
    assert.ok(new RegExp(`^\\s+${key}: \\w+,$`, "m").test(registry), `${f} registry key`);
    assert.ok(by(`vue.${f}`).relationships.includes("package.ultimate.themes.presets"), f);
    assert.ok(
      !by(`vue.${f}`).relationships.includes("package.ultimate.component-metadata.records"),
      f
    );
    assert.ok(!records.includes(`${f}.ts`), f);
    assert.ok(by(`vue.${f}`).relationships.includes("package.ultimate.vue-core.base"), f);
    assert.ok(by(`vue.${f}`).relationships.includes("package.ultimate.vue-core.styling"), f);
  }
  assert.ok(by("vue.file-upload").relationships.includes("package.ultimate.vue.progress-bar"));
  assert.ok(src("file-upload").includes('"../progress-bar/ProgressBar.vue"'));
  // Plain Node replays of the arithmetic and locale claims in the records.
  const parse = (text, locale, useGrouping) => {
    const parts = new Intl.NumberFormat(locale, { useGrouping }).formatToParts(1234.5);
    const group = parts.find((p) => p.type === "group")?.value ?? ",";
    const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
    let s = text.split(group).join("");
    if (decimal !== ".") s = s.split(decimal).join(".");
    return Number(s.replace(/[^0-9.-]/g, ""));
  };
  for (const l of ["de", "pt-BR", "nl", "tr", "es-AR", "es", "it", "sl"]) {
    const p = new Intl.NumberFormat(l, { useGrouping: true }).formatToParts(1234.5);
    assert.equal(p.find((x) => x.type === "group").value, ".");
    assert.equal(p.find((x) => x.type === "decimal").value, ",");
    assert.equal(parse("1234.5", l, true), 12345);
    assert.equal(parse("1234.56", l, true), 123456);
  }
  for (const l of ["en", "fr", "pl", "ru", "pt-PT"]) assert.equal(parse("1234.5", l, true), 1234.5);
  for (const l of ["de", "fr", "es", "pt", "it", "pl", "ru"])
    assert.equal(parse("1,5", l, false), 15);
  assert.equal(parse("1e+21", "en", true), 121);
  assert.throws(
    () => new Intl.NumberFormat(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 2 }),
    RangeError
  );
  assert.equal(new Intl.NumberFormat("en", { style: "percent" }).format(50), "5,000%");
  assert.equal(new Date(50, 0, 1).getFullYear(), 1950);
  assert.equal(String(new Date(NaN).getMonth() + 1).padStart(2, "0"), "NaN");
  assert.equal(parseInt("fff", 16) >> 16, 0);
  assert.equal((parseInt("fff", 16) & 0x00ff00) >> 8, 15);
  const fileSize = (bytes) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i] ?? sizes[4]}`;
  };
  assert.equal(fileSize(0.5), "512.00 TB");
  assert.equal(fileSize(-1), "NaN TB");
  assert.equal(fileSize(1024 ** 5), "1.00 TB");
  assert.equal("*/*".substring(0, "*/*".indexOf("/")), "*");
  assert.equal("image/png".startsWith("*"), false);
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 121);
  for (const alias of input.aliases)
    assert.ok(coverage.some((o) => o.id === alias.id && o.tickets.includes(121)));
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(121), pending.id);
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
  const readme = readFileSync("docs/inventory/vue-numeric-date-color-file/README.md", "utf8");
  const input = load();
  for (const record of input.records) assert.ok(readme.includes(record.id.slice(4)), record.id);
  const noOutside = input.records
    .filter((r) => r.surface.includes("no outside-click"))
    .map((r) => r.id.slice(4));
  assert.deepEqual(noOutside, ["date-picker"]);
  assert.ok(readme.includes("only date-picker has no outside-click"));
  const leaks = input.records
    .filter((r) => r.surface.includes("no unmount cleanup"))
    .map((r) => r.id.slice(4));
  assert.deepEqual(leaks, []);
  assert.ok(readme.includes("only color-picker registers document listeners"));
  const portals = input.records
    .filter((r) => !r.surface.includes("no UPortal"))
    .map((r) => r.id.slice(4));
  assert.deepEqual(portals, ["date-picker", "color-picker"]);
  assert.ok(readme.includes("date-picker and color-picker compose `UPortal`"));
});

test("Vue numeric, date, color and file inputs reconcile scope, preserve authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/vue-numeric-date-color-file/${name}`, "utf8"), text);
});
