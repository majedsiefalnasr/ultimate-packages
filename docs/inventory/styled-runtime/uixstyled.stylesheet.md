# StyleSheet and shared style registrations

ID: uixstyled.stylesheet

Framework: shared; availability: public

## Authored interpretation

A style registry class plus helpers that register theme-variable, hidden-accessible, icon-spin and box-model CSS into a StyleSheet.

## Framework surface

See [authored signatures and interpretation](README.md). Default export StyleSheet<E = HTMLStyleElement> (re-exported by name) has get, has, delete, clear, add(key, css?), update(key, css), which rewrites a registered entry in place and registers a missing one, getStyles, getAllCSS, getAllMarkup, getAllElements and an overridable createStyleElement that returns undefined by default and an overridable updateStyleElement(element, meta) that does nothing by default; StyleSheetProps and StyleMeta describe its inputs and entries. registerThemeVariables(sheet, componentName) registers common and per-component variable CSS from Theme, and the preset's top-level css as the global style under u-global-style (ticket #172, F4), and registerComponentCss(sheet, componentName, rawCss) registers a component's structural CSS with dt() resolved. Both subscribe the sheet once to theme:change (held weakly) and rewrite their registered CSS in place after Theme.setTheme, setPreset or setOptions. HIDDEN_ACCESSIBLE_KEY, hiddenAccessibleCss and registerHiddenAccessible(sheet), and ICON_SPIN_KEY, iconSpinCss and registerIconSpin(sheet) register idempotent utility CSS. BOX_MODEL_KEY_PREFIX, boxModelCss(roots), scopeRootsOf(classes) and registerBoxModel(sheet, componentName, roots) register scoped border-box rules.

## Public exports

@ultimate/uix-styled#BOX_MODEL_KEY_PREFIX
@ultimate/uix-styled#HIDDEN_ACCESSIBLE_KEY
@ultimate/uix-styled#ICON_SPIN_KEY
@ultimate/uix-styled#StyleMeta
@ultimate/uix-styled#StyleSheet
@ultimate/uix-styled#StyleSheetProps
@ultimate/uix-styled#boxModelCss
@ultimate/uix-styled#hiddenAccessibleCss
@ultimate/uix-styled#iconSpinCss
@ultimate/uix-styled#registerBoxModel
@ultimate/uix-styled#registerComponentCss
@ultimate/uix-styled#registerHiddenAccessible
@ultimate/uix-styled#registerIconSpin
@ultimate/uix-styled#registerThemeVariables
@ultimate/uix-styled#scopeRootsOf

## Owned source and evidence

packages/uix-styled/src/stylesheet/index.ts
packages/uix-styled/src/stylesheet/theme-variables.ts
packages/uix-styled/src/stylesheet/hidden-accessible.ts
packages/uix-styled/src/stylesheet/icon-spin.ts
packages/uix-styled/src/stylesheet/box-model.ts

```text
packages/uix-styled/src/stylesheet/index.ts: class StyleSheet<E = HTMLStyleElement> {
packages/uix-styled/src/stylesheet/box-model.ts: export function registerBoxModel(
packages/uix-styled/src/stylesheet/theme-variables.ts: export function registerThemeVariables(sheet: StyleSheet<any>, componentName: string): void {
packages/uix-styled/src/index.ts: export { registerComponentCss, registerThemeVariables } from "./stylesheet/theme-variables";
```

## Relationships

uixstyled.config
package.ultimate.uix-utils.classnames (pending cross-batch)
package.ultimate.uix-utils.dom (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for StyleSheet and shared style registrations is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed. Existing package tests under packages/uix-styled/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/styled-runtime.json --out docs/inventory/styled-runtime (run twice; authored README SHA-256 checked before and after)",
    "revision": "38d2616779a7a2f65c765724d7760d4532fbbdd2",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 26 source files, 56 named symbols, 56 root export identities, 8 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
