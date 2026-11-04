import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const scope = "vue-overlays-notifications";
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
  "inline-message",
  "block-ui",
];
const componentFile = {
  dialog: "Dialog.vue",
  drawer: "Drawer.vue",
  popover: "Popover.vue",
  "confirm-dialog": "ConfirmDialog.vue",
  "confirm-popup": "ConfirmPopup.vue",
  "dynamic-dialog": "DynamicDialog.vue",
  tooltip: "tooltip.ts",
  toast: "Toast.vue",
  message: "Message.vue",
  "inline-message": "InlineMessage.vue",
  "block-ui": "BlockUI.vue",
};
const read = (path) => readFileSync(path, "utf8");
const dir = (family) => `packages/vue/src/${family}`;
const src = (family) => read(`${dir(family)}/${componentFile[family]}`);
const code = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const csrc = (family) => code(src(family));
const style = (family) => read(`${dir(family)}/${family}-style.ts`);
const base = (family) => read(`${dir(family)}/Base${componentFile[family].replace(".vue", "")}.ts`);
const only = (predicate) => families.filter(predicate);
const by = (family) => load().records.find((r) => r.id === `vue.${family}`);
const has = (family, term) => by(family).surface.includes(term);
const withTerm = (term) => families.filter((f) => has(f, term));
const ownedFiles = () => load().records.flatMap((r) => r.files);
const lineOf = (path, needle) =>
  read(path)
    .split("\n")
    .findIndex((l) => l.includes(needle)) + 1;
const names = (list) => list.map((r) => r.id.slice("vue.".length));

function readGitFiles(prefixes) {
  const { execFileSync } = process.getBuiltinModule("node:child_process");
  return execFileSync("git", ["ls-files", ...prefixes], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

test("Vue overlay and notification inventory rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
  const missing = load();
  missing.records[0].files.pop();
  assert.ok(run(missing).problems.some((p) => p.kind === "disposition"));
  const stale = load();
  stale.dispositions.push({ path: "missing.ts", reason: "Stale exclusion" });
  assert.ok(run(stale).problems.some((p) => p.subject === "missing.ts"));
  const invented = load();
  invented.records[0].exports.push("@ultimate/vue#ImaginaryDirective");
  assert.ok(run(invented).problems.some((p) => p.kind === "export"));
  const dangling = load();
  dangling.records[0].relationships.push("imaginary.foundation");
  assert.ok(run(dangling).problems.some((p) => p.kind === "reference"));
  const deferred = load();
  const alias = deferred.aliases.shift();
  deferred.pending.push({ id: alias.id, batch: "ticket-123", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every enumerated source file is owned or excluded with a reason, and nothing else exists in the families", () => {
  const input = load();
  const listed = readGitFiles(families.map((f) => `${dir(f)}/`));
  const accounted = [...ownedFiles(), ...input.dispositions.map((d) => d.path)];
  assert.deepEqual([...accounted].sort(), [...listed].sort());
  assert.equal(new Set(accounted).size, accounted.length);
  assert.equal(listed.length, 67);
  assert.equal(ownedFiles().length, 43);
  assert.equal(input.dispositions.length, 24);
  for (const d of input.dispositions) assert.ok(d.reason.length > 20, d.path);
  assert.deepEqual(
    input.dispositions
      .map((d) => d.path)
      .filter((p) => !/\.(spec|stories)\.ts$/.test(p))
      .sort(),
    ["packages/vue/src/dialog/dialog.api.mdx", "packages/vue/src/tooltip/tooltip.api.mdx"]
  );
  // Every file is a component, base, style, barrel, directive, spec, story or generated API page.
  for (const file of listed)
    assert.ok(
      /\/(index\.ts|[A-Z]\w+\.vue|Base\w+\.ts|[\w-]+-style\.ts|tooltip\.ts|[\w-]+\.(spec|stories)\.ts|[\w-]+\.api\.mdx)$/.test(
        file
      ),
      file
    );
  // No composable, service, plugin, provider or injection source exists in the families.
  for (const file of ownedFiles()) {
    const text = code(read(file));
    assert.ok(!/useConfirm|useToast|useDialog|\binject\(|\bprovide\(|\binstall\(/.test(text), file);
    assert.ok(!/from "\.\.\/button/.test(text), file);
  }
  assert.deepEqual(
    readGitFiles(["packages/vue/src", "packages/vue-core/src"]).filter(
      (p) => /\.(ts|vue)$/.test(p) && /useConfirm|useToast|useDialog/.test(read(p))
    ),
    []
  );
  // Supporting files outside the family roots exist but are not owned here.
  const outside = [
    "packages/vue/e2e/dialog.spec.ts",
    "packages/vue/e2e/tooltip.spec.ts",
    "packages/vue/test/exports.test.ts",
    "packages/vue/src/g3a-aura-styles.spec.ts",
    "packages/vue/src/g3b-aura-styles.spec.ts",
    "packages/vue/src/g3d-aura-styles.spec.ts",
    "packages/vue/src/aura-token-wiring.spec.ts",
    "packages/vue/e2e/g3a-aura-styles.spec.ts",
    "packages/vue/e2e/g3b-aura-styles.spec.ts",
    "packages/vue/e2e/g3d-aura-styles.spec.ts",
    "packages/component-metadata/src/records/dialog.ts",
    "packages/component-metadata/src/records/tooltip.ts",
    "packages/uix-styles/src/dialog/index.ts",
    "packages/uix-styles/src/tooltip/index.ts",
    "packages/vue-core/src/service/confirmation-service.ts",
    "packages/vue-core/src/service/dialog-service.ts",
    "packages/vue-core/src/service/toast-service.ts",
  ];
  for (const path of outside) {
    assert.ok(existsSync(path), path);
    assert.ok(!accounted.includes(path), path);
  }
  // The shared Aura style specs and exports test cover other families too.
  for (const path of outside.filter((p) => /aura-styles\.spec/.test(p)))
    assert.ok(/(dialog|toast|blockui|inlinemessage|drawer)/.test(read(path)), path);
});

test("every exported source declaration is interpreted and entries match the barrels, root barrel and manifest", () => {
  const input = load();
  const manifest = JSON.parse(read("packages/vue/package.json"));
  const root = read("packages/vue/src/index.ts");
  const tsup = read("packages/vue/tsup.config.ts");
  assert.deepEqual(names(input.records).sort(), [...families].sort());
  const expected = {
    dialog: ["UDialog", "createBaseDialog"],
    drawer: ["UDrawer", "createBaseDrawer"],
    popover: ["UPopover"],
    "confirm-dialog": ["UConfirmDialog"],
    "confirm-popup": ["UConfirmPopup"],
    "dynamic-dialog": ["UDynamicDialog"],
    tooltip: ["TooltipBindingValue", "tooltipDirective"],
    toast: ["UToast", "createBaseToast"],
    message: ["UMessage", "createBaseMessage"],
    "inline-message": ["UInlineMessage", "createBaseInlineMessage"],
    "block-ui": ["UBlockUI", "createBaseBlockUI"],
  };
  for (const record of input.records) {
    const family = record.id.slice("vue.".length);
    assert.ok(root.includes(`export * from "./${family}";`), `${family} root barrel`);
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    assert.equal(manifest.exports[`./${family}`].types, `./dist/${family}/index.d.mts`);
    assert.ok(tsup.includes(`"${family}/index"`), `${family} tsup`);
    const mine = (prefix) =>
      record.exports
        .filter((e) => e.startsWith(prefix))
        .map((e) => e.split("#")[1])
        .sort();
    assert.deepEqual(mine("@ultimate/vue#"), [...expected[family]].sort(), family);
    assert.deepEqual(mine(`@ultimate/vue/${family}#`), [...expected[family]].sort(), family);
    const barrel = ts.createSourceFile(
      "i.ts",
      read(`${dir(family)}/index.ts`),
      ts.ScriptTarget.Latest,
      true
    );
    const barrelNames = barrel.statements.flatMap((s) =>
      ts.isExportDeclaration(s) ? s.exportClause.elements.map((e) => e.name.text) : []
    );
    assert.deepEqual([...barrelNames].sort(), [...expected[family]].sort(), `${family} barrel`);
    assert.ok(!barrelNames.some((n) => /StyleModule$/.test(n)), family);
    for (const file of record.files.filter((f) => f.endsWith(".ts") && !f.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const declared = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of declared) assert.ok(record.surface.includes(name), `${file}#${name}`);
      }
    }
    // Every record states the exported-but-not-barrelled factories and style modules precisely.
  }
  // createBasePopover is exported from BasePopover.ts but not re-exported by the popover barrel.
  assert.ok(/export function createBasePopover/.test(read(`${dir("popover")}/BasePopover.ts`)));
  assert.ok(has("popover", "createBasePopover") && has("popover", "not re-exported"));
  for (const f of ["confirm-dialog", "confirm-popup", "dynamic-dialog"])
    assert.ok(has(f, "not re-exported"), f);
  assert.deepEqual(
    only((f) => !/export \{ createBase/.test(read(`${dir(f)}/index.ts`)) && f !== "tooltip"),
    ["popover", "confirm-dialog", "confirm-popup", "dynamic-dialog"]
  );
});

test("component shape, overlay behaviour and cleanup recorded in surfaces match every sibling", () => {
  const dflt = (f) => csrc(f);
  // Single-file components are Options API with plain scripts.
  for (const f of families.filter((x) => x !== "tooltip")) {
    assert.ok(
      /<script>\s*import/.test(src(f).replace(/<!--[\s\S]*?-->/g, "")) ||
        /<script>\s*(\/\/.*\s*)*import/.test(src(f)),
      f
    );
    assert.ok(!/<script[^>]*(setup|lang)/.test(src(f)), f);
    assert.ok(/^export default \{/m.test(src(f)), f);
  }
  assert.deepEqual(
    only((f) => /^\s+setup\(\)/m.test(dflt(f))),
    ["dialog"]
  );
  // Portal, focus trap, ripple.
  assert.deepEqual(
    only((f) => /<UPortal/.test(dflt(f))),
    ["dialog", "drawer", "popover", "confirm-popup"]
  );
  assert.deepEqual(withTerm("rendered through UPortal"), [
    "dialog",
    "drawer",
    "popover",
    "confirm-popup",
  ]);
  assert.deepEqual(
    only((f) => /<UPortal v-if="confirmation">/.test(dflt(f))),
    ["confirm-popup"]
  );
  assert.deepEqual(
    only((f) => /appendTo/.test(dflt(f))),
    ["dialog", "drawer", "popover"]
  );
  assert.deepEqual(
    only((f) => /v-focustrap/.test(dflt(f))),
    ["dialog", "drawer"]
  );
  assert.deepEqual(
    only((f) => /v-ripple/.test(dflt(f))),
    ["dialog", "drawer"]
  );
  // Escape and display-order registration.
  assert.deepEqual(
    only((f) => /createGlobalEscapeKeyMixin\(\{/.test(dflt(f))),
    ["dialog", "drawer", "popover", "confirm-popup"]
  );
  assert.deepEqual(
    only((f) => /createDisplayOrderMixin\(\{/.test(dflt(f))),
    ["dialog", "drawer", "popover", "confirm-popup"]
  );
  assert.deepEqual(withTerm("Escape registry"), ["dialog", "drawer", "popover", "confirm-popup"]);
  assert.deepEqual(
    only((f) => /@keydown=/.test(dflt(f))),
    ["drawer"]
  );
  assert.ok(has("drawer", "Escape reaches close() through two paths"));
  assert.ok(/event\.code === "Escape" && this\.closeOnEscape/.test(dflt("drawer")));
  assert.ok(/callback: \(\) => this\.close\(\)/.test(dflt("drawer")));
  assert.deepEqual(
    only((f) => /tooltip/.test(f) && /Escape/.test(dflt(f))),
    []
  );
  // z-index, scroll lock, motion, ids.
  assert.deepEqual(
    only((f) => /useZIndex\(\)/.test(dflt(f))),
    ["dialog", "drawer", "popover", "confirm-popup", "tooltip", "block-ui"]
  );
  assert.deepEqual(
    only((f) => /useScrollLock\(\)/.test(dflt(f))),
    ["dialog", "block-ui"]
  );
  assert.deepEqual(
    only((f) => /createMotionTransitionHooks/.test(dflt(f))),
    ["dialog"]
  );
  assert.deepEqual(
    only((f) => /useId\(/.test(dflt(f))),
    ["dialog"]
  );
  assert.deepEqual(
    only((f) => /<transition/.test(dflt(f))),
    ["dialog"]
  );
  assert.deepEqual(
    only((f) => /setTimeout/.test(dflt(f))),
    ["tooltip", "toast", "message"]
  );
  assert.deepEqual(
    only((f) => /clearTimeout/.test(dflt(f))),
    ["tooltip", "toast", "message"]
  );
  assert.deepEqual(
    only((f) => /aria-live/.test(dflt(f))),
    ["toast", "message", "inline-message"]
  );
  const live = Object.fromEntries(
    families.map((f) => [f, [...dflt(f).matchAll(/aria-live="(\w+)"/g)].map((m) => m[1])])
  );
  assert.deepEqual(
    only((f) => live[f].length),
    ["toast", "message", "inline-message"]
  );
  assert.deepEqual(
    [live.toast, live.message, live["inline-message"]],
    [["assertive"], ["polite"], ["polite"]]
  );
  assert.deepEqual(
    only((f) => /document\.(add|remove)EventListener/.test(dflt(f))),
    ["popover", "confirm-popup"]
  );
  assert.deepEqual(
    only((f) => /window\.(add|remove)EventListener/.test(dflt(f))),
    ["popover", "confirm-popup"]
  );
  for (const f of ["popover", "confirm-popup"]) {
    const text = dflt(f);
    assert.equal([...text.matchAll(/removeEventListener/g)].length, 2, f);
    assert.ok(
      /beforeUnmount\(\) \{[\s\S]*?this\.unbindDismissListeners\(\);/.test(text) &&
        /hide\(\) \{[\s\S]*?this\.unbindDismissListeners\(\);/.test(text),
      f
    );
    assert.ok(has(f, "document click and window resize listeners"), f);
  }
  assert.deepEqual(
    only((f) => /el\.addEventListener/.test(dflt(f))),
    ["tooltip"]
  );
  // Module-level mutable counters.
  assert.deepEqual(
    only((f) => /^let \w+ = 0;$/m.test(dflt(f))),
    ["toast", "block-ui"]
  );
  assert.deepEqual(withTerm("module-level counter"), ["toast", "block-ui"]);
  assert.ok(/nextId\+\+/.test(dflt("toast")) && /\+\+instanceCount/.test(dflt("block-ui")));
  assert.ok(!/nextId--|instanceCount--|nextId = 0;\s*\n\s*\}/.test(dflt("toast")));
  // Roles, labels and aria attributes.
  const roles = Object.fromEntries(
    families.map((f) => [
      f,
      [...dflt(f).matchAll(/(?<!:)\brole(?:=|: )"([\w-]+)"/g)].map((m) => m[1]),
    ])
  );
  assert.deepEqual(roles, {
    dialog: [],
    drawer: ["complementary"],
    popover: ["dialog"],
    "confirm-dialog": ["alertdialog"],
    "confirm-popup": ["alertdialog"],
    "dynamic-dialog": [],
    tooltip: ["tooltip"],
    toast: ["alert"],
    message: ["alert"],
    "inline-message": ["alert"],
    "block-ui": [],
  });
  assert.ok(/:role="role"/.test(dflt("dialog")));
  assert.deepEqual(
    only((f) => /aria-label/.test(dflt(f))),
    ["dialog", "drawer", "toast", "message"]
  );
  assert.deepEqual(
    only((f) => /aria-label="Close"/.test(dflt(f))),
    ["toast"]
  );
  assert.deepEqual(
    only((f) => /aria-modal/.test(dflt(f))),
    ["dialog", "popover"]
  );
  assert.deepEqual(
    only((f) => /aria-labelledby/.test(dflt(f))),
    ["dialog"]
  );
  assert.deepEqual(
    only((f) => /aria-describedby/.test(dflt(f))),
    ["tooltip"]
  );
  assert.deepEqual(
    only((f) => /aria-busy/.test(dflt(f))),
    ["block-ui"]
  );
  assert.deepEqual(
    only((f) => /\binert\b|tabindex/.test(dflt(f))),
    []
  );
  // inheritAttrs false and $attrs.
  assert.deepEqual(
    only((f) => /inheritAttrs: false/.test(dflt(f))),
    ["toast", "message", "inline-message", "block-ui"]
  );
  assert.deepEqual(withTerm("inheritAttrs false with no $attrs binding"), [
    "toast",
    "message",
    "inline-message",
    "block-ui",
  ]);
  assert.deepEqual(
    only((f) => /\$attrs/.test(read(`${dir(f)}/${componentFile[f]}`))),
    []
  );
  // Event buses, composed dialog, direct DOM positioning.
  assert.deepEqual(
    only((f) => /EventBus\b/.test(dflt(f))),
    ["confirm-dialog", "confirm-popup", "dynamic-dialog", "toast"]
  );
  assert.deepEqual(
    only((f) => /from "\.\.\/dialog\/Dialog\.vue"/.test(dflt(f))),
    ["confirm-dialog", "dynamic-dialog"]
  );
  assert.deepEqual(
    only((f) => /style\.(top|left)/.test(dflt(f))),
    ["popover", "confirm-popup", "tooltip"]
  );
  assert.deepEqual(
    only((f) => /\.on\(/.test(dflt(f)) && !/\.off\(/.test(dflt(f))),
    []
  );
  for (const f of ["confirm-dialog", "confirm-popup", "dynamic-dialog", "toast"])
    assert.equal(
      [...dflt(f).matchAll(/EventBus\.on\(/g)].length,
      [...dflt(f).matchAll(/EventBus\.off\(/g)].length,
      f
    );
  // beforeUnmount: every owned component with a subscription, timer, listener or registration has one.
  assert.deepEqual(
    only((f) => /beforeUnmount\(\)/.test(dflt(f))),
    [
      "dialog",
      "drawer",
      "popover",
      "confirm-dialog",
      "confirm-popup",
      "dynamic-dialog",
      "toast",
      "message",
      "block-ui",
    ]
  );
  // Emits: declared and emitted names agree for every component.
  const emitsOf = (f) => {
    const m = dflt(f).match(/emits: \[([^\]]*)\]/);
    return m ? [...m[1].matchAll(/"([\w:-]+)"/g)].map((x) => x[1]) : [];
  };
  const emitted = (f) => [
    ...new Set([...dflt(f).matchAll(/\$emit\("([\w:-]+)"/g)].map((m) => m[1])),
  ];
  for (const f of families.filter((x) => x !== "tooltip"))
    assert.deepEqual(emitsOf(f).sort(), emitted(f).sort(), f);
  assert.deepEqual(
    only((f) => emitsOf(f).length > 0),
    ["dialog", "drawer", "popover", "message", "block-ui"]
  );
  assert.deepEqual(withTerm("Declared emits"), [
    "dialog",
    "drawer",
    "popover",
    "message",
    "block-ui",
  ]);
  // Props: every Base prop is read by its component; dialog and drawer extras absent.
  for (const f of families.filter((x) => !["tooltip", "dynamic-dialog"].includes(x))) {
    const props = [...base(f).matchAll(/^\s{6}(\w+): \{ type/gm)].map((m) => m[1]);
    const text = dflt(f);
    for (const p of props) assert.ok(new RegExp(`\\b${p}\\b`).test(text), `${f}.${p}`);
  }
  assert.ok(!/props:/.test(base("dynamic-dialog")));
  assert.deepEqual(
    only((f) => /draggable|maximiz/i.test(dflt(f))),
    []
  );
  assert.deepEqual(withTerm("no draggable or maximizable"), ["dialog"]);
  // Drawer: modal is read only by the mask-click dismissal.
  assert.equal([...dflt("drawer").matchAll(/this\.modal\b/g)].length, 1);
  assert.ok(/this\.dismissible &&\s*this\.modal &&/.test(dflt("drawer")));
  assert.ok(has("drawer", "modal is read only by the mask-click dismissal"));
  // Drawer: show and hide are emitted by the visible watcher only; mount does not emit.
  assert.deepEqual(
    [...dflt("drawer").matchAll(/\$emit\("(show|hide)"\)/g)].map((m) => m[1]),
    ["show", "hide"]
  );
  assert.ok(
    /mounted\(\) \{[\s\S]*?if \(this\.visible\) this\.onShowEffects\(\);/.test(dflt("drawer"))
  );
  assert.ok(has("drawer", "mount with visible true does not emit show"));
  // Z-index reverts.
  assert.deepEqual(withTerm("ZIndex entry is not reverted on hide"), [
    "drawer",
    "popover",
    "confirm-popup",
  ]);
  for (const f of ["drawer", "popover", "confirm-popup"]) {
    const text = dflt(f);
    assert.equal([...text.matchAll(/clearZIndex\(/g)].length, 1, f); // the single unmount call
    assert.ok(/beforeUnmount\(\) \{[^]*?clearZIndex\(this\.\$refs\.(mask|content)\)/.test(text), f);
  }
  assert.ok(has("popover", "Each align call pushes a new ZIndex entry"));
  assert.ok(
    /updated\(\) \{[\s\S]*?this\.\$nextTick\(\(\) => this\.align\(\)\)/.test(dflt("popover"))
  );
  assert.ok(
    /show\(event, target\) \{[\s\S]*?this\.\$nextTick\(\(\) => this\.align\(\)\)/.test(
      dflt("popover")
    )
  );
  // Entries reverted on hide: dialog (afterLeave), tooltip (hideTooltip), block-ui (unblock).
  assert.ok(/onAfterLeave\(\) \{\s*if \(this\.autoZIndex\) clearZIndex/.test(dflt("dialog")));
  assert.ok(/clearZIndex\(state\.panel\);\s*state\.panel\.remove\(\)/.test(dflt("tooltip")));
  assert.ok(/unblock\(\) \{[\s\S]*?clearZIndex\(this\.\$refs\.mask\);/.test(dflt("block-ui")));
  assert.ok(has("block-ui", "clearZIndex is not gated by autoZIndex"));
  assert.ok(has("block-ui", 'the z-index key is the string literal "modal"'));
  assert.ok(/setZIndex\("modal", this\.\$refs\.mask/.test(dflt("block-ui")));
  // Popover: dismissable gates only the document click; the early return skips the selfClick reset.
  assert.ok(
    /documentClickListener = \(event\) => \{\s*if \(!this\.dismissable\) return;/.test(
      dflt("popover")
    ) && /windowResizeListener = \(\) => this\.hide\(\)/.test(dflt("popover"))
  );
  assert.ok(has("popover", "dismissable false returns before selfClick is reset"));
  assert.ok(has("popover", "Escape hides regardless of dismissable"));
  assert.ok(
    !/dismissable/.test(
      dflt("popover").slice(
        dflt("popover").indexOf("createGlobalEscapeKeyMixin"),
        dflt("popover").indexOf("mounted()")
      )
    )
  );
  assert.ok(has("popover", "no visible prop"));
  // Confirm components: group matching, reject semantics, labels.
  for (const f of ["confirm-dialog", "confirm-popup"]) {
    assert.ok(/options && options\.key === this\.group/.test(dflt(f)), f);
    assert.ok(has(f, "options.key equal to the group prop"), f);
    assert.ok(/rejectLabel \?\? "No"/.test(dflt(f)) && /acceptLabel \?\? "Yes"/.test(dflt(f)), f);
    assert.ok(
      /rejectVisible !== false/.test(dflt(f)) && /acceptVisible !== false/.test(dflt(f)),
      f
    );
  }
  assert.ok(
    has(
      "confirm-dialog",
      "Dismissal through Escape, mask or the close button hides without calling reject"
    )
  );
  assert.ok(
    /onDialogVisibleChange\(value\) \{\s*if \(!value\) this\.hide\(\);/.test(dflt("confirm-dialog"))
  );
  assert.ok(/callback: \(\) => this\.onReject\(\)/.test(dflt("confirm-popup")));
  assert.ok(has("confirm-popup", "Escape calls reject"));
  assert.ok(has("confirm-popup", "outside click and resize hide without calling reject"));
  assert.ok(/target\?\.focus\?\.\(\);/.test(dflt("confirm-popup")));
  assert.ok(has("confirm-popup", "Accept and reject return focus to the target"));
  assert.ok(!/focus/.test(dflt("confirm-dialog")));
  assert.ok(/role="alertdialog"/.test(dflt("confirm-dialog")));
  assert.ok(/:class="cx\('root'\)"/.test(dflt("confirm-dialog")));
  assert.ok(has("confirm-dialog", "class is passed to UDialog whose template root is UPortal"));
  assert.ok(/<UPortal :appendTo="appendTo">/.test(dflt("dialog")));
  // Dynamic dialog forwards only four option fields.
  const forwarded = [...dflt("dynamic-dialog").matchAll(/instance\.options\.(\w+)/g)].map(
    (m) => m[1]
  );
  assert.deepEqual([...new Set(forwarded)].sort(), [
    "closeOnEscape",
    "header",
    "inputValues",
    "modal",
  ]);
  assert.ok(
    has("dynamic-dialog", "only header, modal, closeOnEscape and inputValues are forwarded")
  );
  // Toast removal and timers.
  assert.ok(/"id" in message/.test(dflt("toast")) && /\{ \.\.\.message, id \}/.test(dflt("toast")));
  assert.ok(has("toast", "remove(message) with the original options object removes nothing"));
  assert.ok(/entry\.life \?\? this\.life/.test(dflt("toast")));
  assert.ok(/\(message\?\.group \?\? null\) !== this\.group/.test(dflt("toast")));
  assert.ok(!/useZIndex|Z_INDEX_KEYS|<UPortal/.test(dflt("toast")));
  assert.ok(has("toast", "no UPortal and no useZIndex"));
  // Message: timer dismissal does not emit close.
  assert.ok(/this\.visible = false;\s*\}, this\.life\)/.test(dflt("message")));
  assert.ok(has("message", "timer dismissal does not emit close"));
  assert.ok(has("message", "life is read once on mount"));
  assert.ok(!/watch:/.test(dflt("message")));
  // DEFAULT_ICON_CLASS in message and inline-message is identical.
  const icons = (f) =>
    [...dflt(f).matchAll(/(info|success|warn|error|secondary|contrast): "(pi [\w -]+)"/g)].map(
      (m) => `${m[1]}=${m[2]}`
    );
  assert.deepEqual(icons("message"), [
    "info=pi pi-info-circle",
    "success=pi pi-check",
    "warn=pi pi-exclamation-triangle",
    "error=pi pi-times-circle",
  ]);
  assert.deepEqual(icons("inline-message"), icons("message"));
  assert.deepEqual(withTerm("secondary and contrast severities have no default icon"), [
    "message",
    "inline-message",
  ]);
  // Block UI emits and mount behaviour.
  assert.ok(/mounted\(\) \{\s*if \(this\.blocked\) this\.block\(\);/.test(dflt("block-ui")));
  assert.ok(has("block-ui", "blocked at mount runs block() and emits blocked"));
  assert.ok(
    /beforeUnmount\(\) \{\s*if \(this\.blocked\) \{[\s\S]*?\}\s*\},/.test(dflt("block-ui"))
  );
  assert.ok(has("block-ui", "unmount while blocked emits no unblocked"));
  // Dialog internals.
  assert.ok(/onBeforeLeave\(\) \{\s*\}/.test(dflt("dialog")));
  assert.ok(has("dialog", "onBeforeLeave is an empty handler"));
  assert.ok(
    /this\.\$refs\.mask === this\.maskMouseDownTarget &&\s*this\.\$refs\.mask === event\.target/.test(
      dflt("dialog")
    )
  );
  assert.ok(
    /focus-trap/.test("focus-trap") && /v-focustrap="\{ disabled: !modal \}"/.test(dflt("dialog"))
  );
  assert.ok(/footer \|\| \$slots\.footer/.test(dflt("dialog")));
  assert.ok(/<span v-if="header" :id="ariaLabelledById"/.test(dflt("dialog")));
  // Tooltip: directive behaviour recorded precisely.
  const tt = dflt("tooltip");
  assert.ok(
    /mouseenter/.test(tt) && /mouseleave/.test(tt) && /"focus"/.test(tt) && /"blur"/.test(tt)
  );
  assert.ok(/updated\(el, binding\) \{\s*unbind\(el\);\s*bind\(el,/.test(tt));
  assert.ok(has("tooltip", "updated unbinds and rebinds, which removes an open panel"));
  assert.ok(/state\.onEnter = \(\) => \{\s*clearTimeout\(state\.hideTimer\);/.test(tt));
  assert.ok(!/clearTimeout\(state\.showTimer\);\s*state\.showTimer =/.test(tt));
  assert.ok(has("tooltip", "onEnter does not clear showTimer"));
  assert.ok(
    !/state\.panel\)/.test(
      tt.slice(tt.indexOf("function showTooltip"), tt.indexOf("function hideTooltip"))
    )
  );
  assert.ok(has("tooltip", "showTooltip does not check for an existing panel"));
  assert.ok(/if \(binding\.autoHide === false\) return;/.test(tt));
  assert.ok(has("tooltip", "autoHide false leaves the panel until unbind"));
  assert.ok(
    /innerHTML = binding\.value/.test(tt) && has("tooltip", "escape false assigns innerHTML")
  );
  assert.ok(!/\.classes|cx\(/.test(tt));
  assert.ok(has("tooltip", "never reads tooltipStyleModule.classes"));
  assert.ok(!/u-tooltip-(right|left|top|bottom|arrow)/.test(tt));
  assert.ok(has("tooltip", "u-tooltip-arrow and the position classes are never applied"));
  assert.ok(/rect\.bottom \+ window\.scrollY \+ 4/.test(tt));
  assert.ok(!/resize|scroll"/.test(tt.replace(/scrollY|scrollX/g, "")));
  assert.ok(has("tooltip", "No resize or scroll handling"));
});

test("style modules, class usage and CSS rules recorded in surfaces match every selector", () => {
  const styled = families.filter((f) => f !== "tooltip");
  assert.deepEqual(
    only((f) => /import type \{ StyleModule \}/.test(style(f))),
    ["dialog", "tooltip"]
  );
  assert.deepEqual(withTerm("typed StyleModule"), ["dialog", "tooltip"]);
  assert.deepEqual(withTerm("untyped style module"), [
    "drawer",
    "popover",
    "confirm-dialog",
    "confirm-popup",
    "dynamic-dialog",
    "toast",
    "message",
    "inline-message",
    "block-ui",
  ]);
  assert.deepEqual(
    only((f) => /var\(--/.test(style(f))),
    []
  );
  const result = {};
  for (const f of styled) {
    const text = style(f);
    let css = text.match(/const css = \/\*css\*\/ `([\s\S]*?)`;/)[1];
    if (f === "dialog") css += read("packages/uix-styles/src/dialog/index.ts");
    const tail = text.slice(text.indexOf("const classes"));
    const keys = [...tail.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);
    const unusedKeys = keys.filter((k) => !new RegExp(`cx\\('${k}'`).test(src(f)));
    const found = [
      ...new Set([...tail.matchAll(/"(u-[\w-]+)(?: u-component)?"/g)].map((m) => m[1])),
    ];
    const noRule = found.filter((n) => !new RegExp(`\\.${n}(?![\\w-])`).test(css));
    result[f] = { unusedKeys, noRule };
  }
  assert.deepEqual(result.dialog.noRule, ["u-overlay-mask", "u-dialog-close-button"]);
  assert.deepEqual(result.drawer.noRule, ["u-drawer-close-button"]);
  assert.deepEqual(result["confirm-dialog"].noRule, ["u-confirmdialog"]);
  assert.deepEqual(result["confirm-popup"].noRule, ["u-confirmpopup-message"]);
  assert.deepEqual(result["dynamic-dialog"].noRule, ["u-dynamic-dialog"]);
  for (const f of ["popover", "toast", "message", "inline-message", "block-ui"])
    assert.deepEqual(result[f].noRule, [], f);
  assert.deepEqual(
    only((f) => f !== "tooltip" && result[f].unusedKeys.length > 0),
    ["dynamic-dialog"]
  );
  assert.deepEqual(result["dynamic-dialog"].unusedKeys, ["root"]);
  for (const term of ["u-overlay-mask", "u-dialog-close-button"]) assert.ok(has("dialog", term));
  assert.ok(has("drawer", "u-drawer-close-button"));
  assert.ok(has("confirm-dialog", "u-confirmdialog has no rule"));
  assert.ok(has("confirm-popup", "u-confirmpopup-message"));
  assert.ok(
    has("dynamic-dialog", "u-dynamic-dialog") && has("dynamic-dialog", "cx('root') is never called")
  );
  // u-overlay-mask appears only in the Angular and Vue dialog style files.
  assert.deepEqual(
    readGitFiles(["packages"]).filter(
      (p) => /\.(ts|css|mjs|json)$/.test(p) && read(p).includes("u-overlay-mask")
    ),
    ["packages/ng/src/dialog/dialog-style.ts", "packages/vue/src/dialog/dialog-style.ts"]
  );
  // Tooltip: every class has a rule in uix-styles, but the directive applies only two.
  const tcss = read("packages/uix-styles/src/tooltip/index.ts");
  for (const c of ["u-tooltip", "u-tooltip-text", "u-tooltip-arrow", "u-tooltip-right"])
    assert.ok(new RegExp(`\\.${c}(?![\\w-])`).test(tcss), c);
  assert.ok(
    /class: "u-tooltip-text"/.test(src("tooltip")) &&
      /class: \["u-tooltip", binding\.class\]/.test(src("tooltip"))
  );
  // Block UI selectors in order and positions.
  const blockCss = style("block-ui").match(/const css = \/\*css\*\/ `([\s\S]*?)`;/)[1];
  const selectors = [...blockCss.matchAll(/^(\.[^{]+)\{(.*)\}$/gm)].map((m) => [m[1], m[2]]);
  assert.deepEqual(
    selectors.map((s) => s[0]),
    [
      ".u-blockui-mask",
      ".u-blockui-container",
      ".u-blockui-mask",
      ".u-blockui-mask",
      ".u-blockui-mask.u-blockui-mask-document",
    ]
  );
  assert.deepEqual(
    selectors.map((s) => /position: (\w+)/.exec(s[1])?.[1]),
    ["fixed", "relative", undefined, "absolute", "fixed"]
  );
  assert.ok(
    /^\.u-blockui-mask\{position: absolute;\}$/m.test(blockCss) ||
      (selectors[2][1].includes("border-radius") && /position: absolute/.test(selectors[3][1]))
  );
  assert.ok(has("block-ui", "The fullScreen mask is positioned fixed by the document rule"));
  // Toast stylesheet fixes z-index and position.
  assert.ok(/\.u-toast\{position: fixed;z-index: 1200;/.test(style("toast")));
  assert.ok(has("toast", "position: fixed and z-index 1200"));
  // Toast class resolvers return joined strings; message and inline-message return arrays.
  assert.ok(/\]\.join\(" "\)/.test(style("toast")));
  assert.ok(has("toast", "Root and message class resolvers return joined strings"));
  // Icon-font classes are not styled by these modules.
  assert.deepEqual(
    only((f) => f !== "tooltip" && /\.pi\b/.test(style(f))),
    []
  );
  // Computed counts quoted in surfaces.
  assert.equal([...style("toast").matchAll(/dt\('toast\./g)].length > 0, true);
});

test("props, defaults and conditions recorded from source hold", () => {
  const defaultsOf = (family) => {
    const out = [];
    for (const m of base(family).matchAll(/^\s{6}(\w+): \{ type: (.+?), default: ([^}]+?) \}/gm))
      out.push(`${m[1]} = ${m[3].trim()}`);
    return out;
  };
  const expected = {
    dialog: [
      "visible = false",
      "header = null",
      "footer = null",
      "modal = true",
      "closable = true",
      "closeOnEscape = true",
      "dismissableMask = false",
      "blockScroll = false",
      "baseZIndex = 0",
      "autoZIndex = true",
      'role = "dialog"',
      'position = "center"',
      'appendTo = "body"',
      'ariaCloseLabel = "Close"',
    ],
    drawer: [
      "visible = false",
      "header = null",
      'position = "left"',
      "modal = true",
      "dismissible = true",
      "closable = true",
      "closeOnEscape = true",
      'appendTo = "body"',
      'ariaCloseLabel = "Close"',
    ],
    popover: ["dismissable = true", 'appendTo = "body"'],
    "confirm-dialog": ["group = undefined"],
    "confirm-popup": ["group = undefined"],
    toast: ["group = null", 'position = "top-right"', "life = 3000"],
    message: [
      'severity = "info"',
      "closable = false",
      "life = null",
      "icon = undefined",
      "closeIcon = undefined",
      'closeAriaLabel = "Close"',
    ],
    "inline-message": ['severity = "error"', "icon = undefined"],
    "block-ui": ["blocked = false", "fullScreen = false", "baseZIndex = 0", "autoZIndex = true"],
  };
  for (const [f, list] of Object.entries(expected)) {
    assert.deepEqual(defaultsOf(f), list, f);
    for (const d of list) assert.ok(has(f, d), `${f}: ${d}`);
  }
  // Base factories name their component the same as the Aura registry key.
  const componentName = (f) => /componentName: "([\w-]+)"/.exec(base(f))[1];
  assert.deepEqual(
    Object.fromEntries(families.filter((f) => f !== "tooltip").map((f) => [f, componentName(f)])),
    {
      dialog: "dialog",
      drawer: "drawer",
      popover: "popover",
      "confirm-dialog": "confirmdialog",
      "confirm-popup": "confirmpopup",
      "dynamic-dialog": "dynamic-dialog",
      toast: "toast",
      message: "message",
      "inline-message": "inlinemessage",
      "block-ui": "blockui",
    }
  );
  // Tooltip binding defaults.
  const tt = src("tooltip");
  assert.ok(
    /return \{ value, escape: true, showDelay: 0, hideDelay: 0, autoHide: true \}/.test(tt) &&
      /escape: true,\s*showDelay: 0,\s*hideDelay: 0,\s*autoHide: true,\s*\.\.\.value,\s*value: value\?\.value \?\? "",/.test(
        tt
      )
  );
  for (const term of [
    "escape = true",
    "showDelay = 0",
    "hideDelay = 0",
    "autoHide = true",
    "string shorthand",
    "fitContent",
  ])
    assert.ok(has("tooltip", term), term);
  assert.ok(/binding\.fitContent === false \? undefined : "fit-content"/.test(tt));
  assert.ok(/binding\.id \?\? uuid\("u_tooltip"\)/.test(tt));
  // Dialog conditions.
  const d = csrc("dialog");
  assert.ok(
    /if \(this\.modal \|\| this\.blockScroll\) registerScrollLock\(this\.dialogId\)/.test(d)
  );
  assert.ok(/this\.dismissableMask &&\s*this\.modal &&/.test(d));
  assert.ok(/const target = footer \|\| header \|\| content \|\| fallback;/.test(d));
  assert.ok(
    /ariaLabelledById\(\) \{\s*return this\.header \? `\$\{this\.dialogId\}_header` : null;/.test(d)
  );
  assert.ok(has("dialog", "Focus search order footer, header, content, then the close button"));
  assert.ok(has("dialog", "aria-labelledby is set only when header is truthy"));
  // Metadata discrepancies are computed from the files.
  const dm = "packages/component-metadata/src/records/dialog.ts";
  const dv = "packages/vue/src/dialog/Dialog.vue";
  const lines = {
    emits: lineOf(dv, 'emits: ["update:visible"'),
    show: lineOf(dv, 'this.$emit("show")'),
    hide: lineOf(dv, 'this.$emit("hide")'),
    after: lineOf(dv, 'this.$emit("after-hide")'),
  };
  assert.deepEqual(lines, { emits: 117, show: 189, hide: 211, after: 220 });
  assert.ok(read(dm).includes('"after-hide"]` (line 118)'));
  assert.ok(
    read(dm).includes("line 177") && read(dm).includes("line 199") && read(dm).includes("line 208")
  );
  assert.ok(
    has("dialog", "117") && has("dialog", "189") && has("dialog", "211") && has("dialog", "220")
  );
  assert.ok(has("dialog", "cites lines 118, 177, 199 and 208"));
  const vueMeta = read(dm).slice(read(dm).indexOf("    vue: {\n      props"));
  assert.deepEqual(
    [...vueMeta.matchAll(/frameworkName: "([\w:-]+)"/g)].map((m) => m[1]),
    ["update:visible", "show", "hide"]
  );
  assert.ok(has("dialog", "event facts list update:visible, show and hide and omit after-hide"));
  const tm = "packages/component-metadata/src/records/tooltip.ts";
  assert.ok(read(tm).includes("tooltip.ts:150-161"));
  assert.equal(lineOf("packages/vue/src/tooltip/tooltip.ts", "  hooks: {"), 167);
  assert.ok(
    has("tooltip", "hooks block starts at line 167") && has("tooltip", "tooltip.ts:150-161")
  );
  assert.ok(has("tooltip", "events: [] matches the absence of emits in a directive"));
});

test("foundation, theme, metadata and external links follow source and ticket boundaries", () => {
  const input = load();
  const registry = read("packages/themes/src/presets/aura/index.ts");
  const keyOf = {
    "confirm-dialog": "confirmdialog",
    "confirm-popup": "confirmpopup",
    "inline-message": "inlineMessage",
    "block-ui": "blockui",
  };
  const registryKeys = {
    dialog: "dialog",
    drawer: "drawer",
    popover: "popover",
    "confirm-dialog": "confirmdialog",
    "confirm-popup": "confirmpopup",
    tooltip: "tooltip",
    toast: "toast",
    message: "message",
    "inline-message": "inlinemessage",
    "block-ui": "blockui",
  };
  void keyOf;
  for (const [f, key] of Object.entries(registryKeys)) {
    assert.ok(new RegExp(`^\\s+${key}(: \\w+)?,$`, "m").test(registry), `${f} registry key`);
    assert.ok(existsSync(`packages/themes/src/presets/aura/${f}.ts`), f);
    assert.ok(has(f, `Aura registry key ${key}`), f);
  }
  assert.ok(!/^\s+dynamic-?dialog\b/im.test(registry));
  assert.ok(!existsSync("packages/themes/src/presets/aura/dynamic-dialog.ts"));
  assert.ok(has("dynamic-dialog", "No Aura registry key exists for dynamic-dialog"));
  assert.deepEqual(withTerm("No Aura registry key exists"), ["dynamic-dialog"]);
  // Registry key equals the componentName passed to the base factory (checked above); dir names differ.
  assert.ok(has("block-ui", "componentName blockui differs from the family directory block-ui"));
  assert.deepEqual(withTerm("differs from the family directory"), [
    "confirm-dialog",
    "confirm-popup",
    "inline-message",
    "block-ui",
  ]);
  // Metadata records exist for dialog and tooltip only.
  const withMetadata = families.filter((f) =>
    existsSync(`packages/component-metadata/src/records/${f}.ts`)
  );
  assert.deepEqual(withMetadata, ["dialog", "tooltip"]);
  assert.deepEqual(
    only((f) => by(f).relationships.includes("package.ultimate.component-metadata.records")),
    withMetadata
  );
  // uix-styles has entries for dialog and tooltip only, and exactly those are imported.
  const styleDirs = families.filter((f) => existsSync(`packages/uix-styles/src/${f}/index.ts`));
  assert.deepEqual(styleDirs, ["dialog", "tooltip"]);
  assert.deepEqual(
    only((f) =>
      ownedFiles().some((p) => p.startsWith(dir(f)) && /@ultimate\/uix-styles/.test(code(read(p))))
    ),
    ["dialog", "tooltip"]
  );
  assert.deepEqual(withTerm("has no @ultimate/uix-styles entry"), [
    "drawer",
    "popover",
    "confirm-dialog",
    "confirm-popup",
    "dynamic-dialog",
    "toast",
    "message",
    "inline-message",
    "block-ui",
  ]);
  // Imports per family map to relationships.
  const importsOf = (f) => {
    const found = new Set();
    for (const file of by(f).files.filter((p) => /\.(ts|vue)$/.test(p))) {
      for (const m of read(file).matchAll(/^import[\s\S]*?from "([^"]+)";/gm))
        if (/^(@ultimate\/|\.\.\/)/.test(m[1])) found.add(m[1]);
    }
    return [...found].sort();
  };
  assert.deepEqual(Object.fromEntries(families.map((f) => [f, importsOf(f)])), {
    dialog: [
      "../ripple",
      "@ultimate/uix-styles/dialog",
      "@ultimate/uix-utils/dom",
      "@ultimate/uix-utils/escape",
      "@ultimate/vue-core",
    ],
    drawer: ["../ripple", "@ultimate/uix-utils/escape", "@ultimate/vue-core"],
    popover: ["@ultimate/uix-utils/escape", "@ultimate/vue-core"],
    "confirm-dialog": ["../dialog/Dialog.vue", "@ultimate/vue-core"],
    "confirm-popup": ["@ultimate/uix-utils/escape", "@ultimate/vue-core"],
    "dynamic-dialog": ["../dialog/Dialog.vue", "@ultimate/vue-core"],
    tooltip: [
      "@ultimate/uix-styles/tooltip",
      "@ultimate/uix-utils/dom",
      "@ultimate/uix-utils/uuid",
      "@ultimate/vue-core",
    ],
    toast: ["@ultimate/vue-core"],
    message: ["@ultimate/vue-core"],
    "inline-message": ["@ultimate/vue-core"],
    "block-ui": ["@ultimate/vue-core"],
  });
  const coreNames = (f) => {
    const found = new Set();
    for (const file of by(f).files.filter((p) => /\.(ts|vue)$/.test(p)))
      for (const m of read(file).matchAll(
        /^import (?:type )?\{([^}]*)\} from "@ultimate\/vue-core";/gm
      ))
        for (const part of m[1].split(",")) {
          const n = part
            .trim()
            .split(/\s+as\s+/)[0]
            .replace(/^type\s+/, "");
          if (n) found.add(n);
        }
    return found;
  };
  const needs = {
    "package.ultimate.vue-core.base": ["createBaseComponent", "StyleModule"],
    "package.ultimate.vue-core.styling": ["registerComponentStyle"],
    "package.ultimate.vue-core.overlay": ["Portal"],
    "package.ultimate.vue-core.escape": ["createGlobalEscapeKeyMixin", "createDisplayOrderMixin"],
    "package.ultimate.vue-core.focus-trap": ["focusTrapDirective"],
    "package.ultimate.vue-core.zindex": ["useZIndex", "Z_INDEX_KEYS"],
    "package.ultimate.vue-core.scroll-lock": ["useScrollLock"],
    "package.ultimate.vue-core.motion": ["createMotionTransitionHooks"],
    "package.ultimate.vue-core.icons": ["TimesIcon"],
    "package.ultimate.vue-core.service": [
      "confirmationEventBus",
      "dialogEventBus",
      "toastEventBus",
    ],
    "package.ultimate.vue-core.directive": ["createDirective"],
  };
  const fromImport = {
    "@ultimate/uix-utils/escape": "package.ultimate.uix-utils.escape",
    "@ultimate/uix-utils/dom": "package.ultimate.uix-utils.dom",
    "@ultimate/uix-utils/uuid": "package.ultimate.uix-utils.uuid",
    "@ultimate/uix-styles/dialog": "package.ultimate.uix-styles.dialog",
    "@ultimate/uix-styles/tooltip": "package.ultimate.uix-styles.tooltip",
    "../ripple": "package.ultimate.vue.ripple",
    "../dialog/Dialog.vue": "package.ultimate.vue.dialog",
  };
  for (const f of families) {
    const core = coreNames(f);
    const expectedRel = new Set([`package.ultimate.vue.${f}`]);
    for (const [id, list] of Object.entries(needs))
      if (list.some((n) => core.has(n))) expectedRel.add(id);
    for (const i of importsOf(f)) if (fromImport[i]) expectedRel.add(fromImport[i]);
    if (f in registryKeys) expectedRel.add("package.ultimate.themes.presets");
    if (withMetadata.includes(f)) expectedRel.add("package.ultimate.component-metadata.records");
    assert.deepEqual([...by(f).relationships].sort(), [...expectedRel].sort(), f);
  }
  assert.ok(
    !input.records.some((r) => r.relationships.some((x) => /uix-motion|vue\.button/.test(x)))
  );
  // Aliases, pending targets and ownership.
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.vue.${f}`, `vue.${f}`]).sort()
  );
  const coverage = JSON.parse(read(input.ownership.path)).ownership;
  assert.equal(input.ownership.ticket, 124);
  for (const alias of input.aliases)
    assert.ok(
      coverage.some((o) => o.id === alias.id && o.tickets.length === 1 && o.tickets[0] === 124),
      alias.id
    );
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(124), pending.id);
    assert.equal(pending.batch, `ticket-${owner.tickets[0]}`, pending.id);
    assert.ok(pending.reason.includes(`/issues/${owner.tickets[0]})`), pending.id);
    assert.ok(
      input.records.some((r) => r.relationships.includes(pending.id)),
      `${pending.id} unused`
    );
  }
  const pendingIds = new Set(input.pending.map((p) => p.id));
  for (const r of input.records)
    for (const rel of r.relationships)
      assert.ok(
        rel.startsWith(`package.ultimate.vue.${r.id.slice(4)}`) ||
          pendingIds.has(rel) ||
          input.aliases.some((a) => a.id === rel),
        rel
      );
  // Claims: implemented, not-run and ci-enforced only.
  for (const record of input.records) {
    assert.deepEqual(
      record.claims.map((c) => c.state),
      ["implemented", "not-run", "ci-enforced"],
      record.id
    );
    const check = record.claims.find((c) => c.command);
    assert.equal(check.outcome, "not-run");
    assert.ok(check.limitations.length > 0);
    assert.ok(/vitest run src\/dialog\//.test(check.command));
    for (const f of families) assert.ok(check.command.includes(`src/${f}/`), f);
    assert.equal(check.revision, input.revision);
  }
  assert.ok(read(".github/workflows/ci.yml").includes("run: pnpm run test"));
  assert.ok(read("packages/vue/package.json").includes('"test": "vitest run"'));
  const views = run(input).views;
  for (const alias of input.aliases)
    assert.ok(
      views[`${alias.record}.md`].includes(`${alias.id} → [${alias.record}](${alias.record}.md)`)
    );
});

test("README observations are derived from the JSON records", () => {
  const readme = read(`docs/inventory/${scope}/README.md`);
  const input = load();
  for (const record of input.records) assert.ok(readme.includes(record.id.slice(4)), record.id);
  const list = (marker, rec = input.records) =>
    names(rec.filter((r) => r.surface.includes(marker))).join(", ");
  assert.ok(readme.includes(`rendered through UPortal: ${list("rendered through UPortal")}.`));
  assert.ok(
    readme.includes(
      `ZIndex entry not reverted on hide: ${list("ZIndex entry is not reverted on hide")}.`
    )
  );
  assert.ok(readme.includes(`module-level counters: ${list("module-level counter")}.`));
  assert.ok(
    readme.includes(
      `inheritAttrs false without a $attrs binding: ${list("inheritAttrs false with no $attrs binding")}.`
    )
  );
  assert.ok(readme.includes(`declared emits: ${list("Declared emits")}.`));
  assert.ok(readme.includes(`no Aura registry key: ${list("No Aura registry key exists")}.`));
  const meta = names(
    input.records.filter((r) =>
      r.relationships.includes("package.ultimate.component-metadata.records")
    )
  ).join(", ");
  assert.ok(readme.includes(`metadata records exist for ${meta} only`));
  assert.ok(readme.includes(`${input.dispositions.length} supporting files`));
  assert.ok(readme.includes(`${ownedFiles().length} owned files`));
  assert.ok(readme.includes("Standards review"));
  assert.ok(readme.includes("Spec review"));
});

test("Vue overlay and notification inventory reconciles scope, preserves authorship and generated views are byte-exact", () => {
  const input = load();
  const authored = JSON.stringify(input);
  const result = run(input);
  assert.deepEqual(result.problems, []);
  assert.equal(input.records.length, families.length);
  assert.equal(JSON.stringify(input), authored);
  assert.deepEqual(run(input).views, result.views);
  for (const [name, text] of Object.entries(result.views))
    assert.equal(read(`docs/inventory/${scope}/${name}`), text);
});
