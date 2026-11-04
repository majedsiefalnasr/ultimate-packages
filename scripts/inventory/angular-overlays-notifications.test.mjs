import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const scope = "angular-overlays-notifications";
const load = () => JSON.parse(readFileSync(`scripts/inventory/${scope}.json`, "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = [
  "dialog",
  "drawer",
  "popover",
  "confirm-dialog",
  "confirm-popup",
  "dynamic-dialog",
  "tooltip",
  "toast",
  "message",
  "block-ui",
];
const metadata = { dialog: "DIALOG_METADATA", tooltip: "TOOLTIP_METADATA" };
const uixStyles = { dialog: "dialog", tooltip: "tooltip" };
const auraLine = {
  dialog: "    dialog,",
  drawer: "    drawer,",
  popover: "    popover,",
  "confirm-dialog": "    confirmdialog: confirmDialog,",
  "confirm-popup": "    confirmpopup: confirmPopup,",
  tooltip: "    tooltip,",
  toast: "    toast,",
  message: "    message,",
  "block-ui": "    blockui: blockUI,",
};

test("overlay and notification inventory rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const stale = load();
  stale.dispositions.push({ path: "missing.ts", reason: "Stale exclusion" });
  assert.ok(run(stale).problems.some((p) => p.subject === "missing.ts"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/ng#ImaginaryOverlay");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
  const dangling = load();
  dangling.records[0].relationships.push("imaginary.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-122", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every exported source declaration is interpreted and entries match the barrel and package manifest", () => {
  const input = load();
  const manifest = JSON.parse(readFileSync("packages/ng/package.json", "utf8"));
  const root = readFileSync("packages/ng/src/index.ts", "utf8");
  assert.deepEqual(input.records.map((r) => r.id.slice(8)).sort(), [...families].sort());
  for (const record of input.records) {
    const family = record.id.slice(8);
    const subpath = manifest.exports[`./${family}`];
    const exposed = record.exports.filter((e) => e.startsWith(`@ultimate/ng/${family}#`));
    assert.equal(exposed.length > 0, Boolean(subpath), `${family} manifest subpath mismatch`);
    if (!subpath) assert.ok(record.surface.includes(`no ./${family} manifest subpath`), family);
    const barrel = root.includes(`/${family}"`);
    assert.equal(
      record.exports.some((e) => e.startsWith("@ultimate/ng#")),
      barrel,
      `${family} root barrel mismatch`
    );
    if (!barrel) assert.ok(record.surface.includes("not re-exported by the root barrel"));
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
        for (const name of names)
          assert.ok(`${record.name} ${record.surface}`.includes(name), `${file}#${name}`);
      }
    }
  }
});

test("inputs, outputs, services, overlay, timers, accessibility and cleanup facts are recorded from source", () => {
  const by = (id) => load().records.find((r) => r.id === id);
  for (const [id, terms] of Object.entries({
    "angular.dialog": [
      "ComponentIdGenerator",
      "NullInjectorError",
      "visibleChange",
      "closeOnEscape",
      "ESCAPE_PRIORITIES.DIALOG",
      "scroll lock",
      "restores focus",
      "does not move focus",
      "uFocusTrapDisabled",
      "aria-labelledby",
      "DialogClassesParams",
      "dialogStyleModule",
    ],
    "angular.drawer": [
      "complementary",
      "SIDEBAR",
      "dismissible",
      "onKeyDown",
      "both paths",
      "applyVisible",
      "No aria-modal",
      "DrawerClassesParams",
      "drawerStyleModule",
    ],
    "angular.popover": [
      "dismissable",
      "selfClick",
      "OVERLAY_PANEL",
      "instanceCount",
      "aria-modal",
      "ZIndex.clear",
      "popoverStyleModule",
    ],
    "angular.confirm-dialog": [
      "UConfirmationService",
      "alertdialog",
      "without calling reject",
      "not cleared",
      "rejectVisible",
      "confirmDialogStyleModule",
    ],
    "angular.confirm-popup": [
      "UConfirmationService",
      "OVERLAY_PANEL",
      "instanceCount",
      "target",
      "does not call reject",
      "confirmPopupStyleModule",
    ],
    "angular.dynamic-dialog": [
      "UDialogService",
      "open$",
      "no unsubscribe",
      "inputValues",
      "data",
      "dynamicDialogStyleModule",
    ],
    "angular.tooltip": [
      "directive",
      "aria-describedby",
      "ComponentIdGenerator",
      "no vertical",
      "TOOLTIP_METADATA",
      "tooltipStyleModule",
    ],
    "angular.toast": [
      "UToastService",
      "setTimeout",
      "nextId",
      "aria-live",
      "sticky",
      "toastStyleModule",
    ],
    "angular.message": [
      "setTimeout",
      "does not emit onClose",
      "life",
      "aria-live",
      "messageStyleModule",
    ],
    "angular.block-ui": [
      "wasBlocked",
      "maskRef",
      "scroll lock",
      "aria-busy",
      "blockUiStyleModule",
      "blockui",
    ],
  }))
    for (const term of terms) assert.ok(by(id).surface.includes(term), `${id}: ${term}`);
});

test("aliases, pending targets and product checks keep ticket boundaries and honest claims", () => {
  const input = load();
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.ng.${f}`, `angular.${f}`]).sort()
  );
  const coverage = JSON.parse(readFileSync(input.ownership.path, "utf8")).ownership;
  assert.equal(input.ownership.ticket, 122);
  for (const alias of input.aliases)
    assert.deepEqual(coverage.find((o) => o.id === alias.id).tickets, [122]);
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(122), pending.id);
  }
  const aura = readFileSync("packages/themes/src/presets/aura/index.ts", "utf8");
  for (const record of input.records) {
    const family = record.id.slice(8);
    assert.ok(!record.claims.some((c) => ["verified", "failed"].includes(c.state)));
    const check = record.claims.find((c) => c.command);
    assert.equal(check.state, "not-run");
    assert.ok(check.limitations.length > 0);
    assert.ok(record.claims.some((c) => c.state === "ci-enforced"));
    if (metadata[family]) {
      assert.ok(record.surface.includes(metadata[family]), record.id);
      assert.ok(record.relationships.includes("package.ultimate.component-metadata.records"));
    } else {
      assert.ok(record.surface.includes("no component-metadata record"), record.id);
      assert.ok(!record.relationships.some((r) => r.includes("component-metadata")), record.id);
    }
    if (uixStyles[family]) {
      assert.ok(record.relationships.includes(`package.ultimate.uix-styles.${uixStyles[family]}`));
    } else {
      assert.ok(record.surface.includes("No dedicated @ultimate/uix-styles"), record.id);
      assert.ok(!record.relationships.some((r) => r.includes("uix-styles")), record.id);
    }
    for (const e of record.evidence) {
      assert.ok(readFileSync(e.path, "utf8").includes(e.contains), `${record.id}: ${e.contains}`);
    }
    if (family === "dynamic-dialog") {
      assert.ok(!aura.toLowerCase().includes("dynamic"));
      assert.ok(record.surface.includes("no Aura registry key"));
      assert.ok(!record.relationships.includes("package.ultimate.themes.presets"));
    } else {
      assert.ok(record.relationships.includes("package.ultimate.themes.presets"), record.id);
      assert.ok(
        record.evidence.some(
          (e) => e.path.endsWith("aura/index.ts") && e.contains === auraLine[family]
        )
      );
    }
  }
  const views = run(input).views;
  for (const alias of input.aliases)
    assert.ok(
      views[`${alias.record}.md`].includes(`${alias.id} → [${alias.record}](${alias.record}.md)`)
    );
});

test("overlay and notification inventory reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(readFileSync(`docs/inventory/${scope}/${name}`, "utf8"), text);
});
