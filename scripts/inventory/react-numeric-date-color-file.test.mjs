import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const load = () =>
  JSON.parse(readFileSync("scripts/inventory/react-numeric-date-color-file.json", "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = ["input-number", "date-picker", "color-picker", "file-upload"];
const src = (family) => readFileSync(`packages/react/src/${family}/${family}.tsx`, "utf8");

test("React numeric, date, color and file inputs reject missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
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
  deferred.pending.push({ id: alias.id, batch: "ticket-120", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every exported source declaration is interpreted and entries match root barrel and manifest", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/react/package.json", "utf8"));
  const root = readFileSync("packages/react/src/index.ts", "utf8");
  assert.deepEqual(
    input.records.map((r) => r.id.slice("react.".length)).sort(),
    [...families].sort()
  );
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

test("props, state, overlay, accessibility, parsing, upload and source-only quirks are recorded from source", () => {
  const by = (id) => load().records.find((r) => r.id === id);
  for (const [id, terms] of Object.entries({
    "input-number": [
      "forwardRef<HTMLInputElement",
      "inputRef",
      "onValueChange",
      "rawText",
      "every blur emits",
      "allowEmpty",
      "formatToParts",
      "12345",
      "TypeError",
      "RangeError",
      "percent mode does not scale",
      "ArrowUp",
      "aria-valuenow",
      "role=spinbutton",
      "u-inputnumber-focus",
      "InputNumberClassesParams",
      "var(--u-inputtext-",
    ],
    "date-picker": [
      "not a forwardRef",
      "MM/DD/YYYY",
      "captured once",
      "stripTime",
      "No call to focus()",
      "setViewYear inside the setViewMonth updater",
      "no outside-click",
      "stays open when disabled becomes true",
      "role=dialog",
      "role=grid",
      "Sunday first",
      "UDatePickerProps",
      "DatePickerClassesParams",
    ],
    "color-picker": [
      "forwardRef<UColorPickerRef",
      "0x0fff",
      "h = 300",
      "defaultColor",
      "touchmove",
      "useUnmountEffect",
      "useOverlayListener",
      "ConnectedOverlayScrollHandler",
      "without '#'",
      "stays open when disabled becomes true",
      "pointer-only",
      "aria-label 'Select a color'",
      "UColorPickerValue",
      "ColorPickerPreviewClassesParams",
      "validateHsb",
    ],
    "file-upload": [
      "not a forwardRef",
      "customUpload",
      "lengthComputable",
      "readyState 4",
      "no abort",
      "'*/*'",
      "512.00 TB",
      "UProgressBar",
      "FormData",
      "onUploadHandler",
      "no role or aria-live",
      "Remove file",
      "FileUploadClassesParams",
      "never read by any class resolver",
    ],
  }))
    for (const term of terms) assert.ok(by(`react.${id}`).surface.includes(term), `${id}: ${term}`);
  // forwardRef exists in exactly input-number and color-picker; the others state they are not.
  const forwardRefs = ["input-number", "color-picker"];
  assert.deepEqual(
    families.filter((f) => src(f).includes("forwardRef")),
    forwardRefs
  );
  for (const f of families)
    assert.equal(
      by(`react.${f}`).surface.includes("not a forwardRef"),
      !forwardRefs.includes(f),
      f
    );
  // Absent-pattern claims hold for every scoped component; color-picker's ref handle
  // (useImperativeHandle) and its focus() calls are the recorded exceptions.
  const present = { "color-picker": ["useImperativeHandle", "focus("] };
  for (const f of families)
    for (const pattern of [
      "createPortal",
      "useImperativeHandle",
      "aria-controls",
      "useId",
      "useEffect",
      "focus(",
      "window.",
      "aria-live",
    ])
      assert.equal(
        src(f).includes(pattern),
        Boolean(present[f]?.includes(pattern)),
        `${f}: ${pattern}`
      );
  // Document listeners exist only in color-picker (drag): touch first, then mouse.
  assert.deepEqual(
    families.filter((f) => /document\./.test(src(f))),
    ["color-picker"]
  );
  assert.deepEqual(
    [...src("color-picker").matchAll(/document\.addEventListener\("(\w+)"/g)].map((m) => m[1]),
    ["touchmove", "touchend", "touchcancel", "mousemove", "mouseup"]
  );
  // The only overlay component with no outside-click handler is date-picker.
  const overlays = load()
    .records.filter((r) => r.surface.includes("no outside-click"))
    .map((r) => r.id);
  assert.deepEqual(overlays, ["react.date-picker"]);
  for (const f of ["input-number", "file-upload"]) assert.ok(!src(f).includes("overlayVisible"), f);
  // Only input-number style uses CSS custom properties.
  for (const f of families)
    assert.equal(
      /var\(--/.test(readFileSync(`packages/react/src/${f}/${f}-style.ts`, "utf8")),
      f === "input-number",
      f
    );
  // Theme links follow the Aura registry; no scoped family has a metadata record.
  const registry = readFileSync("packages/themes/src/presets/aura/index.ts", "utf8");
  for (const f of families) {
    const key = f.replace(/-/g, "");
    assert.ok(new RegExp(`^\\s+${key}: \\w+,$`, "m").test(registry), `${f} registry key`);
    assert.ok(by(`react.${f}`).relationships.includes("package.ultimate.themes.presets"), f);
    assert.ok(
      !by(`react.${f}`).relationships.includes("package.ultimate.component-metadata.records"),
      f
    );
  }
  assert.ok(by("react.file-upload").relationships.includes("package.ultimate.react.progress-bar"));
  // Plain Node replays of the arithmetic claimed in the records.
  const focusParse = (locale) => {
    const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(1234.5);
    const group = parts.find((p) => p.type === "group")?.value ?? ",";
    const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
    return Number(
      String(1234.5)
        .split(group)
        .join("")
        .replace(decimal, ".")
        .replace(/[^\d.-]/g, "")
    );
  };
  for (const l of ["de", "pt-BR", "nl", "tr", "es", "it"]) assert.equal(focusParse(l), 12345, l);
  for (const l of ["en", "fr", "pl", "ru", "pt-PT"]) assert.equal(focusParse(l), 1234.5, l);
  assert.throws(() => new Intl.NumberFormat(undefined, { style: "currency" }), TypeError);
  assert.throws(
    () => new Intl.NumberFormat(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 2 }),
    RangeError
  );
  assert.equal(parseInt("fff", 16) >> 16, 0);
  assert.equal(0x0fff & 0xff, 255);
  assert.equal(Math.log(0.5) / Math.log(1024) < 0, true);
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.react.${f}`, `react.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 120);
  for (const alias of input.aliases)
    assert.ok(coverage.some((o) => o.id === alias.id && o.tickets.includes(120)));
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(120), pending.id);
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
  const readme = readFileSync("docs/inventory/react-numeric-date-color-file/README.md", "utf8");
  const input = load();
  for (const record of input.records) assert.ok(readme.includes(record.id.slice(6)), record.id);
  const forwardRef = input.records
    .filter((r) => !r.surface.includes("not a forwardRef"))
    .map((r) => r.id);
  assert.deepEqual(forwardRef, ["react.input-number", "react.color-picker"]);
  assert.ok(readme.includes("only input-number and color-picker are forwardRefs"));
  const noOutside = input.records
    .filter((r) => r.surface.includes("no outside-click"))
    .map((r) => r.id.slice(6));
  assert.deepEqual(noOutside, ["date-picker"]);
  assert.ok(readme.includes("only date-picker has no outside-click"));
});

test("React numeric, date, color and file inputs reconcile scope, preserve authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(
      readFileSync(`docs/inventory/react-numeric-date-color-file/${name}`, "utf8"),
      text
    );
});
