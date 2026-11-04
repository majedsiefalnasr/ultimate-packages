import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import ts from "typescript";
import { inventory } from "./pilot.mjs";

const scope = "react-overlays-notifications";
const load = () => JSON.parse(readFileSync(`scripts/inventory/${scope}.json`, "utf8"));
const run = (input) => inventory({ root: process.cwd(), input });
const families = [
  "dialog",
  "drawer",
  "popover",
  "confirm-dialog",
  "confirm-popup",
  "tooltip",
  "toast",
  "message",
  "block-ui",
];
const read = (path) => readFileSync(path, "utf8");
const src = (family) => read(`packages/react/src/${family}/${family}.tsx`);
const style = (family) => read(`packages/react/src/${family}/${family}-style.ts`);
const only = (predicate) => families.filter(predicate);
const by = (family) => load().records.find((r) => r.id === `react.${family}`);
const has = (family, term) => by(family).surface.includes(term);
const withTerm = (term) => families.filter((f) => has(f, term));
const ownedFiles = () => load().records.flatMap((r) => r.files);

test("React overlay and notification inventory rejects missing sources, invented exports, dangling relationships and same-ticket deferrals", () => {
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
  deferred.pending.push({ id: alias.id, batch: "ticket-123", reason: "Incorrect deferral" });
  assert.ok(run(deferred).problems.some((p) => p.kind === "ownership" && p.subject === alias.id));
  const unowned = load();
  unowned.aliases.shift();
  assert.ok(run(unowned).problems.some((p) => p.kind === "ownership"));
});

test("every enumerated source file is owned or excluded with a reason, and nothing else exists in the families", () => {
  const input = load();
  const listed = readGitFiles(families.map((f) => `packages/react/src/${f}/`));
  const accounted = [...ownedFiles(), ...input.dispositions.map((d) => d.path)];
  assert.deepEqual([...accounted].sort(), [...listed].sort());
  assert.equal(new Set(accounted).size, accounted.length);
  assert.equal(listed.length, 47);
  assert.equal(input.dispositions.length, 20);
  for (const d of input.dispositions) assert.ok(d.reason.length > 20, d.path);
  // Excluded files are exactly specs, stories and the two generated API pages.
  assert.deepEqual(
    input.dispositions
      .map((d) => d.path)
      .filter((p) => !/\.(spec|stories)\.tsx$/.test(p))
      .sort(),
    ["packages/react/src/dialog/dialog.api.mdx", "packages/react/src/tooltip/tooltip.api.mdx"]
  );
  // No hook, context, provider or service source exists in the families.
  assert.deepEqual(
    listed.filter(
      (p) =>
        !/\/(index\.ts|[\w-]+\.tsx|[\w-]+-style\.ts|[\w-]+\.(spec|stories)\.tsx|[\w-]+\.api\.mdx)$/.test(
          p
        )
    ),
    []
  );
  for (const f of families)
    for (const file of listed.filter((p) => p.startsWith(`packages/react/src/${f}/`)))
      assert.ok(
        /\/(index\.ts|[\w-]+\.tsx|[\w-]+-style\.ts|[\w-]+\.(spec|stories)\.tsx|[\w-]+\.api\.mdx)$/.test(
          file
        ) &&
          !/(createContext|useContext|Provider|Service)/.test(
            file.endsWith(".mdx") ? "" : read(file).replace(/\/\*[\s\S]*?\*\//g, "")
          ),
        file
      );
  // Supporting files outside the family roots exist but are not owned here.
  for (const outside of [
    "packages/react/e2e/dialog.spec.tsx",
    "packages/react/e2e/tooltip.spec.tsx",
    "packages/component-metadata/src/records/dialog.ts",
    "packages/component-metadata/src/records/tooltip.ts",
    "packages/uix-styles/src/dialog/index.ts",
    "packages/uix-styles/src/tooltip/index.ts",
  ])
    assert.ok(existsSync(outside), outside);
});

function readGitFiles(prefixes) {
  const { execFileSync } = process.getBuiltinModule("node:child_process");
  return execFileSync("git", ["ls-files", ...prefixes], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

test("every exported source declaration is interpreted and entries match the barrels, root barrel and manifest", () => {
  const input = load();
  const manifest = JSON.parse(read("packages/react/package.json"));
  const root = read("packages/react/src/index.ts");
  assert.deepEqual(
    input.records.map((r) => r.id.slice("react.".length)).sort(),
    [...families].sort()
  );
  const expected = {
    dialog: ["UDialog", "UDialogProps"],
    drawer: ["UDrawer", "UDrawerProps"],
    popover: ["UPopover", "UPopoverHandle", "UPopoverProps"],
    "confirm-dialog": ["UConfirmDialog", "UConfirmDialogProps"],
    "confirm-popup": ["UConfirmPopup", "UConfirmPopupProps"],
    tooltip: ["UTooltip", "UTooltipProps"],
    toast: ["UToast", "UToastHandle", "UToastMessageOptions", "UToastProps"],
    message: ["UMessage", "UMessageProps"],
    "block-ui": ["UBlockUI", "UBlockUIProps"],
  };
  for (const record of input.records) {
    const family = record.id.slice("react.".length);
    assert.ok(root.includes(`export * from "./${family}";`), `${family} root barrel`);
    assert.equal(manifest.exports[`./${family}`].import, `./dist/${family}/index.mjs`);
    assert.equal(manifest.exports[`./${family}`].types, `./dist/${family}/index.d.mts`);
    const names = record.exports
      .filter((e) => e.startsWith("@ultimate/react#"))
      .map((e) => e.slice("@ultimate/react#".length))
      .sort();
    assert.deepEqual(names, expected[family], family);
    assert.deepEqual(
      record.exports
        .filter((e) => e.startsWith(`@ultimate/react/${family}#`))
        .map((e) => e.split("#")[1])
        .sort(),
      expected[family],
      family
    );
    // The barrel exports exactly these names.
    const barrel = ts.createSourceFile(
      "i.ts",
      read(`packages/react/src/${family}/index.ts`),
      ts.ScriptTarget.Latest,
      true
    );
    const barrelNames = barrel.statements.flatMap((s) =>
      ts.isExportDeclaration(s) ? s.exportClause.elements.map((e) => e.name.text) : []
    );
    assert.deepEqual([...barrelNames].sort(), expected[family], `${family} barrel`);
    for (const file of record.files.filter((f) => !f.endsWith("/index.ts"))) {
      const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const declared = ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.map((d) => d.name.getText(source))
          : [statement.name?.getText(source)].filter(Boolean);
        for (const name of declared) assert.ok(record.surface.includes(name), `${file}#${name}`);
      }
    }
    // Style modules are not part of any barrel.
    assert.ok(!barrelNames.some((n) => /StyleModule$/.test(n)), family);
  }
});

test("component shape, hooks, refs and overlay behaviour recorded in surfaces match every sibling", () => {
  // forwardRef and imperative handles.
  assert.deepEqual(
    only((f) => src(f).includes("forwardRef")),
    ["popover", "toast", "message", "block-ui"]
  );
  assert.deepEqual(
    only((f) => !has(f, "not a forwardRef")),
    ["popover", "toast", "message", "block-ui"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("useImperativeHandle")),
    ["popover", "toast"]
  );
  // Portal usage, never createPortal directly.
  assert.deepEqual(
    only((f) => src(f).includes("createPortal")),
    []
  );
  assert.deepEqual(
    only((f) => src(f).includes("<Portal")),
    ["dialog", "drawer", "popover", "confirm-popup", "tooltip"]
  );
  assert.deepEqual(withTerm("rendered through Portal"), [
    "dialog",
    "drawer",
    "popover",
    "confirm-popup",
    "tooltip",
  ]);
  // appendTo is passed only by dialog.
  assert.deepEqual(
    only((f) => /appendTo=/.test(src(f))),
    ["dialog"]
  );
  // Focus trap and escape.
  assert.deepEqual(
    only((f) => src(f).includes("<FocusTrap")),
    ["dialog", "drawer"]
  );
  assert.deepEqual(withTerm("FocusTrap"), ["dialog", "drawer"]);
  assert.deepEqual(
    only((f) => src(f).includes("useGlobalEscapeKey({")),
    ["dialog", "drawer", "popover", "confirm-popup", "tooltip"]
  );
  assert.deepEqual(withTerm("useGlobalEscapeKey"), [
    "dialog",
    "drawer",
    "popover",
    "confirm-popup",
    "tooltip",
  ]);
  // z-index, scroll lock, motion, ids, timers, live regions.
  assert.deepEqual(
    only((f) => src(f).includes("useZIndex()")),
    ["dialog", "drawer", "popover", "confirm-popup", "tooltip", "block-ui"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("useScrollLock()")),
    ["dialog", "block-ui"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("useMotion(")),
    ["dialog"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("useId")),
    ["dialog", "tooltip"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("setTimeout")),
    ["tooltip", "toast", "message"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("aria-live")),
    ["toast", "message"]
  );
  assert.deepEqual(
    only((f) => /document\./.test(src(f))),
    ["dialog", "tooltip"]
  );
  // Module-level mutable counters.
  assert.deepEqual(
    only((f) => /^let \w+ = 0;$/m.test(src(f))),
    ["toast", "block-ui"]
  );
  assert.deepEqual(withTerm("module-level"), ["toast", "block-ui"]);
  // Roles.
  const roles = Object.fromEntries(
    families.map((f) => [f, [...src(f).matchAll(/role="([\w-]+)"/g)].map((m) => m[1])])
  );
  assert.deepEqual(roles, {
    dialog: ["dialog"],
    drawer: ["complementary"],
    popover: ["dialog"],
    "confirm-dialog": [],
    "confirm-popup": ["alertdialog"],
    tooltip: ["tooltip"],
    toast: ["alert"],
    message: ["alert"],
    "block-ui": [],
  });
  assert.deepEqual(
    only((f) => src(f).includes("aria-label")),
    ["dialog", "drawer", "toast", "message"]
  );
  assert.deepEqual(
    only((f) => /aria-label="Close"/.test(src(f))),
    ["dialog", "drawer", "toast"]
  );
  // Imports of foundation packages: only react-core, never uix packages, in owned sources.
  for (const f of families)
    for (const file of by(f).files.filter((p) => !p.endsWith(".mdx"))) {
      const text = read(file);
      assert.ok(!/from "@ultimate\/uix-/.test(text), file);
      assert.ok(!/from "@ultimate\/(vue|ng)/.test(text), file);
    }
  assert.deepEqual(
    only((f) => /from "\.\.\/button\/button"/.test(src(f))),
    ["confirm-dialog", "confirm-popup"]
  );
  assert.deepEqual(
    only((f) => /from "\.\.\/dialog\/dialog"/.test(src(f))),
    ["confirm-dialog"]
  );
  assert.deepEqual(
    only((f) => /confirmationEventBus/.test(src(f))),
    ["confirm-dialog", "confirm-popup"]
  );
  // Context, providers and services are absent from every family and from react-core.
  for (const f of families)
    assert.ok(
      !/createContext|useContext|Provider|Service/.test(src(f).replace(/\/\*[\s\S]*?\*\//g, "")),
      f
    );
  // Unmount cleanups that pass a ref to clearZIndex (refs are detached when unmount cleanups run).
  assert.deepEqual(
    only((f) => /useUnmountEffect\(\(\) => \{[\s\S]*?clearZIndex\(\w+\.current\)/.test(src(f))),
    ["dialog", "drawer", "tooltip"]
  );
  assert.deepEqual(withTerm("unmount cleanup receives null"), ["dialog", "drawer", "tooltip"]);
  // Conditionally rendered elements whose ref is null when the clear runs on close.
  assert.deepEqual(withTerm("ZIndex entry is never reverted"), [
    "drawer",
    "confirm-popup",
    "tooltip",
    "block-ui",
  ]);
  assert.deepEqual(withTerm("no inline top, left or z-index is ever set"), ["popover"]);
  assert.deepEqual(
    withTerm("positions the panel only when a new confirmation replaces an open one"),
    ["confirm-popup"]
  );
  // Popover and confirm popup position inside an effect that sees a null ref.
  for (const f of ["popover", "confirm-popup"]) {
    assert.ok(
      /content\.style\.top/.test(src(f)) && /if \(!content \|\| !target\) return;/.test(src(f)),
      f
    );
    assert.ok(has(f, "align() returns early"), f);
  }
  assert.deepEqual(
    only((f) => /style\.(top|left)/.test(src(f))),
    ["popover", "confirm-popup"]
  );
  assert.deepEqual(
    only((f) => /if \(!(visible|confirmation)\) clearZIndex\(contentRef\.current\)/.test(src(f))),
    ["popover", "confirm-popup"]
  );
  // Outside click listener usage.
  assert.deepEqual(
    only((f) => src(f).includes("useOverlayListener({")),
    ["popover", "confirm-popup"]
  );
  // Only drawer closes the mask on mouse-down plus mouse-up; dialog uses pointer-up.
  assert.deepEqual(
    only((f) => src(f).includes("onMouseUp")),
    ["drawer"]
  );
  assert.deepEqual(
    only((f) => src(f).includes("onPointerUp")),
    ["dialog"]
  );
  // Dialog onAfterLeave does not call onHide, onClose or the onHide prop.
  const leave = src("dialog").slice(
    src("dialog").indexOf("onAfterLeave: () => {"),
    src("dialog").indexOf("portalReady\n  );")
  );
  assert.ok(!/onHide|onClose/.test(leave));
  const meta = read("packages/component-metadata/src/records/dialog.ts");
  assert.ok(/onAfterLeave completes/.test(meta));
  // Tooltip: no code assigns inline position; only the stylesheet places the panel off screen.
  assert.ok(!/style\.|top:|left:/.test(src("tooltip")));
  assert.ok(/top: -9999px; left: -9999px/.test(style("tooltip")));
  // Array targets use only the first selector.
  assert.ok(/querySelector<HTMLElement>\(target\[0\]\)/.test(src("tooltip")));
  // Block UI counter expression is evaluated on every render.
  assert.ok(/React\.useRef\(`u-block-ui-\$\{\+\+instanceCount\}`\)/.test(src("block-ui")));
  // Early-return handlers described precisely.
  assert.ok(/if \(blocked === wasBlockedRef\.current\) \{\s*return;/.test(src("block-ui")));
  assert.ok(/if \(!life\) return;/.test(src("message")));
});

test("style modules, class usage and CSS rules recorded in surfaces match every selector", () => {
  assert.deepEqual(
    only((f) => /: StyleModule = /.test(style(f))),
    ["dialog", "drawer", "popover", "confirm-dialog", "confirm-popup", "tooltip"]
  );
  assert.deepEqual(withTerm("typed StyleModule"), [
    "dialog",
    "drawer",
    "popover",
    "confirm-dialog",
    "confirm-popup",
    "tooltip",
  ]);
  assert.deepEqual(withTerm("untyped style module"), ["toast", "message", "block-ui"]);
  assert.deepEqual(
    only((f) => /var\(--/.test(style(f))),
    ["toast", "message"]
  );
  assert.deepEqual(
    only((f) => /\.pi\b/.test(style(f))),
    []
  );
  // Class names defined by each style module, whether cx uses them, and whether a CSS rule exists.
  const result = {};
  for (const f of families) {
    const text = style(f);
    const css = text.match(/css = \/\*css\*\/ `([\s\S]*?)`;/)[1];
    const tail = text.slice(text.indexOf("const classes"));
    const keys = [...tail.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);
    const unusedKeys = keys.filter((k) => !new RegExp(`cx\\("${k}"`).test(src(f)));
    const names = [
      ...new Set([...tail.matchAll(/"(u-[\w-]+)(?: u-component)?"/g)].map((m) => m[1])),
    ];
    const noRule = names.filter((n) => !css.includes(`.${n}`));
    result[f] = { unusedKeys, noRule };
  }
  assert.deepEqual(result.dialog.noRule, [
    "u-dialog-header-title",
    "u-dialog-header-icons",
    "u-dialog-close-button",
    "u-dialog-close-icon",
  ]);
  assert.deepEqual(result.drawer.noRule, ["u-drawer-title", "u-drawer-close-button"]);
  assert.deepEqual(result["confirm-popup"].noRule, [
    "u-confirmpopup-icon",
    "u-confirmpopup-message",
  ]);
  assert.deepEqual(
    only((f) => result[f].unusedKeys.length > 0),
    ["confirm-dialog", "confirm-popup"]
  );
  assert.deepEqual(result["confirm-dialog"].unusedKeys, ["icon"]);
  assert.deepEqual(result["confirm-popup"].unusedKeys, ["icon"]);
  for (const f of ["popover", "tooltip", "toast", "message", "block-ui", "confirm-dialog"])
    assert.deepEqual(result[f].noRule, [], f);
  for (const term of [
    "u-dialog-header-title",
    "u-dialog-header-icons",
    "u-dialog-close-button",
    "u-dialog-close-icon",
  ])
    assert.ok(has("dialog", term));
  for (const term of ["u-drawer-title", "u-drawer-close-button", "empty rule"])
    assert.ok(has("drawer", term));
  for (const term of ["u-confirmpopup-icon", "u-confirmpopup-message"])
    assert.ok(has("confirm-popup", term));
  assert.ok(has("confirm-dialog", 'cx("icon")') && has("confirm-popup", 'cx("icon")'));
  assert.ok(/\.u-drawer-footer \{ \}/.test(style("drawer")));
  // Tooltip position classes have no rule.
  assert.ok(
    !/u-tooltip-(right|left|top|bottom)/.test(
      style("tooltip").match(/css = \/\*css\*\/ `([\s\S]*?)`;/)[1]
    )
  );
  assert.ok(has("tooltip", "u-tooltip-right, u-tooltip-left, u-tooltip-top and u-tooltip-bottom"));
  // Block UI: only three selectors, none gives the non-fullScreen mask a position.
  const blockCss = style("block-ui").match(/css = \/\*css\*\/ `([\s\S]*?)`;/)[1];
  assert.deepEqual(
    [...blockCss.matchAll(/^(\.[\w-]+) \{/gm)].map((m) => m[1]),
    [".u-blockui-container", ".u-blockui-mask", ".u-blockui-mask-document"]
  );
  assert.ok(
    /\.u-blockui-mask \{[^}]*\}/.test(blockCss) &&
      !/\.u-blockui-mask \{[^}]*position/.test(blockCss)
  );
  assert.ok(/\.u-blockui-container \{ position: relative; \}/.test(blockCss));
  assert.ok(has("block-ui", "no CSS rule gives the non-fullScreen mask a position"));
  // Toast stylesheet fixes z-index and does not use useZIndex or Portal.
  assert.ok(/\.u-toast \{ position: fixed; z-index: 1200;/.test(style("toast")));
  assert.ok(has("toast", "position: fixed and z-index 1200"));
  assert.deepEqual(
    [
      ...style("toast").matchAll(
        /u-toast-(top-right|top-left|bottom-right|bottom-left|top-center|bottom-center|center) \{/g
      ),
    ].length,
    7
  );
  for (const f of ["toast", "message"])
    assert.equal([...style(f).matchAll(/var\(--/g)].length, 12, f);
  // Message icon defaults: four severities mapped, two without.
  const icons = [...src("message").matchAll(/(info|success|warn|error): "(pi [\w -]+)"/g)].map(
    (m) => `${m[1]}=${m[2]}`
  );
  assert.deepEqual(icons, [
    "info=pi pi-info-circle",
    "success=pi pi-check",
    "warn=pi pi-exclamation-triangle",
    "error=pi pi-times-circle",
  ]);
  assert.ok(has("message", "secondary and contrast"));
});

test("props, defaults and conditions recorded from source hold", () => {
  const defaults = {
    dialog: [
      "modal = true",
      "closable = true",
      "showCloseIcon = true",
      "closeOnEscape = false",
      "dismissableMask = false",
      "blockScroll = false",
      "focusOnShow = true",
    ],
    drawer: [
      'position = "left"',
      "modal = true",
      "dismissible = true",
      "closable = true",
      "closeOnEscape = true",
    ],
    popover: ["dismissable = true"],
    tooltip: [
      'position = "right"',
      'event = "hover"',
      "showDelay = 0",
      "hideDelay = 0",
      "disabled = false",
      "closeOnEscape = false",
      "autoZIndex = true",
    ],
    toast: ['position = "top-right"', "life = 3000"],
    message: ['severity = "info"', "closable = false", 'closeAriaLabel = "Close"'],
    "block-ui": ["blocked = false", "autoZIndex = true", "baseZIndex = 0", "fullScreen = false"],
  };
  for (const [f, list] of Object.entries(defaults))
    for (const d of list) {
      assert.ok(src(f).includes(d), `${f}: ${d}`);
      assert.ok(
        has(f, d.replace(/ = /, " ").replace(/"/g, "")) || has(f, d.split(" = ")[0]),
        `${f} surface: ${d}`
      );
    }
  // Confirm dialog / popup labels and group matching.
  for (const f of ["confirm-dialog", "confirm-popup"]) {
    assert.ok(/\?\? "No"/.test(src(f)) && /\?\? "Yes"/.test(src(f)), f);
    assert.ok(
      /options\.visible === false/.test(src(f)) && /options\.group === group/.test(src(f)),
      f
    );
    assert.ok(has(f, "any group"), f);
  }
  assert.ok(
    /closeOnEscape=\{confirmation\?\.closeOnEscape \?\? true\}/.test(src("confirm-dialog"))
  );
  assert.ok(/modal=\{confirmation\?\.modal \?\? true\}/.test(src("confirm-dialog")));
  assert.ok(
    !/closeOnEscape|modal|header/.test(
      src("confirm-popup")
        .replace(/^ \*.*$/gm, "")
        .replace(/import[\s\S]*?;\n/g, "")
    )
  );
  assert.ok(has("confirm-popup", "ignores header, modal and closeOnEscape"));
  assert.ok(has("confirm-dialog", "reject callback is not called"));
  assert.ok(has("confirm-popup", "Escape calls the reject callback"));
  assert.ok(has("confirm-popup", "outside click or resize hides without calling reject"));
  // Popover handle and dismissable gating.
  assert.ok(
    /if \(meta\.type === "resize" \|\| dismissable\) hide|meta\.type === "resize" \|\| dismissable/.test(
      src("popover")
    )
  );
  assert.ok(has("popover", "Escape hides regardless of dismissable"));
  assert.ok(has("popover", "hide() calls onHide even when already hidden"));
  assert.ok(!/useGlobalEscapeKey\(\{[^}]*dismissable/.test(src("popover")));
  // Toast: life 0 and message extras.
  assert.ok(/entry\.life \?\? life/.test(src("toast")));
  assert.ok(has("toast", "life 0 schedules a zero-delay timeout"));
  assert.ok(has("toast", "extra keys are accepted but never read"));
  // Message: timer dismissal vs close().
  assert.ok(has("message", "timer dismissal does not call onClose"));
  assert.ok(/setTimeout\(\(\) => setVisible\(false\), life\)/.test(src("message")));
  // Block UI effect and mount behaviour.
  assert.ok(has("block-ui", "blocked on first render runs the block branch on mount"));
  // Tooltip listener capture and timers.
  assert.ok(has("tooltip", "listeners are attached once on mount"));
  assert.ok(/useMountEffect\(\(\) => \{/.test(src("tooltip")));
  // Dialog dismissableMask condition and header condition.
  assert.ok(/dismissableMask && modal && maskRef\.current === event\.target/.test(src("dialog")));
  assert.ok(/header !== undefined &&/.test(src("dialog")));
  assert.ok(/closable && showCloseIcon &&/.test(src("dialog")));
  assert.ok(
    /closable && \(\s*<button/.test(
      src("drawer")
        .replace(/\n/g, " ")
        .replace(/const closeButton = /, "const closeButton = ")
    ) || /const closeButton = closable && \(/.test(src("drawer"))
  );
  assert.ok(/<div className=\{cx\("footer"\)\}><\/div>/.test(src("drawer")));
});

test("foundation, theme, metadata and external links follow source and ticket boundaries", () => {
  const input = load();
  const registry = read("packages/themes/src/presets/aura/index.ts");
  const keyOf = {
    "block-ui": "blockui",
    "confirm-dialog": "confirmdialog",
    "confirm-popup": "confirmpopup",
  };
  for (const f of families) {
    const key = keyOf[f] ?? f;
    assert.ok(new RegExp(`^\\s+${key}(: \\w+)?,$`, "m").test(registry), `${f} registry key`);
    assert.ok(existsSync(`packages/themes/src/presets/aura/${f}.ts`), f);
    const record = by(f);
    assert.ok(record.relationships.includes("package.ultimate.themes.presets"), f);
    assert.ok(record.relationships.includes("package.ultimate.react-core.base"), f);
    assert.ok(record.relationships.includes("package.ultimate.react-core.styling"), f);
    assert.ok(record.relationships.includes(`package.ultimate.react.${f}`), f);
    assert.ok(!record.relationships.some((r) => /uix-(styles|utils|motion)/.test(r)), f);
    assert.ok(record.surface.includes(`componentName ${f}`), f);
    // Registry key note appears exactly where the key differs from the component name.
    assert.equal(record.surface.includes(`Aura registry key ${key}`), true, f);
    assert.equal(f in keyOf, record.surface.includes("differs from the componentName"), f);
  }
  // Metadata records exist exactly for dialog and tooltip and are linked only there.
  const withMetadata = families.filter((f) =>
    existsSync(`packages/component-metadata/src/records/${f}.ts`)
  );
  assert.deepEqual(withMetadata, ["dialog", "tooltip"]);
  assert.deepEqual(
    only((f) => by(f).relationships.includes("package.ultimate.component-metadata.records")),
    withMetadata
  );
  // uix-styles has entries for dialog and tooltip only, but no owned source imports them.
  const styleDirs = families.filter((f) => existsSync(`packages/uix-styles/src/${f}/index.ts`));
  assert.deepEqual(styleDirs, ["dialog", "tooltip"]);
  for (const f of families)
    assert.ok(
      !ownedFiles().some(
        (p) =>
          !p.endsWith(".mdx") &&
          /@ultimate\/uix-styles/.test(read(p).replace(/\/\*[\s\S]*?\*\//g, ""))
      ),
      f
    );
  assert.deepEqual(withTerm("No @ultimate/uix-styles entry exists"), [
    "toast",
    "message",
    "block-ui",
  ]);
  for (const f of ["toast", "message", "block-ui"])
    assert.ok(
      new RegExp(`No \`@ultimate/uix-styles/${f}\` entry exists yet`).test(
        style(f).replace(/\n\s*\*\s*/g, " ")
      ),
      f
    );
  // Each foundation relationship is backed by an import from react-core in the owned source.
  const needs = {
    "package.ultimate.react-core.overlay": ["Portal", "useOverlayListener"],
    "package.ultimate.react-core.escape": ["useGlobalEscapeKey"],
    "package.ultimate.react-core.focus-trap": ["FocusTrap"],
    "package.ultimate.react-core.zindex": ["useZIndex"],
    "package.ultimate.react-core.scroll-lock": ["useScrollLock"],
    "package.ultimate.react-core.motion": ["useMotion"],
    "package.ultimate.react-core.confirmation": ["confirmationEventBus"],
    "package.ultimate.react-core.icons": ["UTimesIcon"],
    "package.ultimate.react-core.hooks": ["useMountEffect", "useUpdateEffect", "useUnmountEffect"],
  };
  for (const f of families) {
    const code = src(f)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    for (const [id, names] of Object.entries(needs))
      assert.equal(
        by(f).relationships.includes(id),
        names.some((n) => new RegExp(`\\b${n}\\b`).test(code)),
        `${f} ${id}`
      );
  }
  assert.deepEqual(
    only((f) => by(f).relationships.includes("package.ultimate.react.button")),
    ["confirm-dialog", "confirm-popup"]
  );
  assert.deepEqual(
    only((f) => f !== "dialog" && by(f).relationships.includes("package.ultimate.react.dialog")),
    ["confirm-dialog"]
  );
  // Aliases, pending targets and ownership.
  assert.deepEqual(
    input.aliases.map((a) => [a.id, a.record]).sort(),
    families.map((f) => [`package.ultimate.react.${f}`, `react.${f}`]).sort()
  );
  const coverage = JSON.parse(read(input.ownership.path)).ownership;
  assert.equal(input.ownership.ticket, 123);
  for (const alias of input.aliases)
    assert.ok(
      coverage.some((o) => o.id === alias.id && o.tickets.length === 1 && o.tickets[0] === 123),
      alias.id
    );
  for (const pending of input.pending) {
    const owner = coverage.find((o) => o.id === pending.id);
    assert.ok(owner && !owner.tickets.includes(123), pending.id);
    assert.equal(pending.batch, `ticket-${owner.tickets[0]}`, pending.id);
    assert.ok(pending.reason.includes(`/issues/${owner.tickets[0]})`), pending.id);
    assert.ok(
      input.records.some((r) => r.relationships.includes(pending.id)),
      `${pending.id} unused`
    );
  }
  for (const id of [
    "package.ultimate.react-core.base",
    "package.ultimate.themes.presets",
    "package.ultimate.react.button",
    "package.ultimate.component-metadata.records",
  ])
    assert.ok(
      input.pending.some((p) => p.id === id),
      id
    );
  assert.ok(!input.pending.some((p) => /uix-/.test(p.id)));
  // Claims: implemented, not-run and ci-enforced only.
  for (const record of input.records) {
    assert.deepEqual(
      record.claims.map((c) => c.state),
      ["implemented", "not-run", "ci-enforced"],
      record.id
    );
    assert.ok(!record.claims.some((c) => ["verified", "failed"].includes(c.state)));
    const check = record.claims.find((c) => c.command);
    assert.equal(check.outcome, "not-run");
    assert.ok(check.limitations.length > 0);
    assert.ok(/vitest run src\/dialog\//.test(check.command));
    assert.equal(check.revision, input.revision);
  }
  assert.ok(read(".github/workflows/ci.yml").includes("run: pnpm run test"));
  assert.ok(read("packages/react/package.json").includes('"test": "vitest run"'));
  const views = run(input).views;
  for (const alias of input.aliases)
    assert.ok(
      views[`${alias.record}.md`].includes(`${alias.id} → [${alias.record}](${alias.record}.md)`)
    );
});

test("README observations are derived from the JSON records", () => {
  const readme = read(`docs/inventory/${scope}/README.md`);
  const input = load();
  for (const record of input.records) assert.ok(readme.includes(record.id.slice(6)), record.id);
  const list = (names) => names.join(", ");
  const claims = {
    forwardRef: input.records
      .filter((r) => !r.surface.includes("not a forwardRef"))
      .map((r) => r.id.slice(6)),
    portal: input.records
      .filter((r) => r.surface.includes("rendered through Portal"))
      .map((r) => r.id.slice(6)),
    neverReverted: input.records
      .filter((r) => r.surface.includes("ZIndex entry is never reverted"))
      .map((r) => r.id.slice(6)),
    unmountNull: input.records
      .filter((r) => r.surface.includes("unmount cleanup receives null"))
      .map((r) => r.id.slice(6)),
    metadata: input.records
      .filter((r) => r.relationships.includes("package.ultimate.component-metadata.records"))
      .map((r) => r.id.slice(6)),
    moduleLevel: input.records
      .filter((r) => r.surface.includes("module-level"))
      .map((r) => r.id.slice(6)),
  };
  assert.ok(readme.includes(`forwardRef components: ${list(claims.forwardRef)}.`));
  assert.ok(readme.includes(`rendered through Portal: ${list(claims.portal)}.`));
  assert.ok(
    readme.includes(
      `ZIndex entry never reverted when the element is removed: ${list(claims.neverReverted)}.`
    )
  );
  assert.ok(
    readme.includes(
      `unmount cleanup passes a detached ref to clearZIndex: ${list(claims.unmountNull)}.`
    )
  );
  assert.ok(readme.includes(`metadata records exist for ${list(claims.metadata)} only`));
  assert.ok(readme.includes(`module-level mutable counters: ${list(claims.moduleLevel)}.`));
  assert.ok(readme.includes(`${input.dispositions.length} supporting files`));
  assert.ok(readme.includes("Aura registry keys blockui, confirmdialog and confirmpopup"));
  assert.ok(readme.includes("Standards review"));
  assert.ok(readme.includes("Spec review"));
});

test("React overlay and notification inventory reconciles scope, preserves authorship and generated views are byte-exact", () => {
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
