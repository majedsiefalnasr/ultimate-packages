# StyleSheet and shared style registrations

ID: uixstyled.stylesheet

Framework: shared; availability: public

## Authored interpretation

A style registry class plus helpers that register theme-variable, hidden-accessible, icon-spin and box-model CSS into a StyleSheet.

## Framework surface

See [authored signatures and interpretation](README.md). Default export StyleSheet<E = HTMLStyleElement> (re-exported by name) has get, has, delete, clear, add(key, css?, options?) and update(key, css, options?), where update rewrites a registered entry in place and registers a missing one and options.first puts an entry before all others in registry order and asks createStyleElement to place its element first, getStyles, getAllCSS, getAllMarkup, getAllElements and an overridable createStyleElement that returns undefined by default and an overridable updateStyleElement(element, meta) that does nothing by default; StyleSheetProps, StyleMeta (which carries first) and StyleAddOptions describe its inputs and entries. registerThemeVariables(sheet, componentName) registers common and per-component variable CSS from Theme (the preset block is read under the registration name with its hyphens removed, so input-text reads inputtext; ticket #174, F7), and the preset's top-level css as the global style under u-global-style (ticket #172, F4), and registerComponentCss(sheet, componentName, rawCss) registers a component's structural CSS with dt() resolved. Both subscribe the sheet once to theme:change (held weakly) and rewrite their registered CSS in place after Theme.setTheme, setPreset or setOptions. With cssLayer on, registerThemeVariables also registers the @layer order statement from Theme.getLayerOrderCSS() under u-layer-order, first in the sheet, after the variable blocks, and keeps it current after those changes; with cssLayer off nothing is registered (ticket #173, F6). HIDDEN_ACCESSIBLE_KEY, hiddenAccessibleCss and registerHiddenAccessible(sheet), and ICON_SPIN_KEY, iconSpinCss and registerIconSpin(sheet) register idempotent utility CSS. BOX_MODEL_KEY_PREFIX, boxModelCss(roots), scopeRootsOf(classes) and registerBoxModel(sheet, componentName, roots) register scoped border-box rules. createScopedTheme(sheet, componentName, attrSelector) returns { key, update(dt), dispose() } for per-instance dt: update writes the overrides as a variable block scoped to [attrSelector] under the key <attrSelector>-<componentName>, follows theme:change, and update(undefined) or dispose() removes the block and its style element (ADR-085).

## Public exports

@ultimate/uix-styled#BOX_MODEL_KEY_PREFIX
@ultimate/uix-styled#HIDDEN_ACCESSIBLE_KEY
@ultimate/uix-styled#ICON_SPIN_KEY
@ultimate/uix-styled#ScopedTheme
@ultimate/uix-styled#StyleMeta
@ultimate/uix-styled#StyleSheet
@ultimate/uix-styled#StyleSheetProps
@ultimate/uix-styled#boxModelCss
@ultimate/uix-styled#createScopedTheme
@ultimate/uix-styled#hiddenAccessibleCss
@ultimate/uix-styled#iconSpinCss
@ultimate/uix-styled#registerBoxModel
@ultimate/uix-styled#registerComponentCss
@ultimate/uix-styled#registerHiddenAccessible
@ultimate/uix-styled#registerIconSpin
@ultimate/uix-styled#registerThemeVariables
@ultimate/uix-styled#scopeRootsOf
@ultimate/uix-styled#StyleAddOptions

## Owned source and evidence

packages/uix-styled/src/stylesheet/index.ts
packages/uix-styled/src/stylesheet/theme-variables.ts
packages/uix-styled/src/stylesheet/hidden-accessible.ts
packages/uix-styled/src/stylesheet/icon-spin.ts
packages/uix-styled/src/stylesheet/box-model.ts
packages/uix-styled/src/stylesheet/scoped-theme.ts

```text
packages/uix-styled/src/stylesheet/index.ts: class StyleSheet<E = HTMLStyleElement> {
packages/uix-styled/src/stylesheet/box-model.ts: export function registerBoxModel(
packages/uix-styled/src/stylesheet/theme-variables.ts: export function registerThemeVariables(sheet: StyleSheet<any>, componentName: string): void {
packages/uix-styled/src/index.ts: export { registerComponentCss, registerThemeVariables } from "./stylesheet/theme-variables";
packages/uix-styled/src/stylesheet/scoped-theme.ts: export function createScopedTheme(
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
    "revision": "e3b55c7a5ab74af66f3cf5e7ef14898a5a5a3ac7",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 27 source files accounted for, 59 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
