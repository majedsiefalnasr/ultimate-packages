# GAP-064 research — Aura token wiring for Angular and Vue

**Date:** 2026-10-04
**Evidence gathered at:** `main` `f05bd9b` (static scan of `packages/ng`, `packages/vue`, `packages/react`, `packages/themes`, `packages/uix-styled`, `packages/uix-styles`; runtime probe against the built `@ultimate/themes`/`@ultimate/uix-styled` `dist`).
**Baseline (ADR-048):** PrimeNG 21.1.9, PrimeVue 4.5.5, PrimeReact 10.9.9, `@primeuix/themes` 2.0.3, `@primeuix/styles` 2.0.3, read from the pinned tarballs in `.vendor-cache/`.
**Status:** research record. Sections 1–5 are the evidence and options as presented to the Architecture Discussion; §6 records the decisions taken on them (ADR-051). No implementation, no GAP status change: GAP-064 stays PARTIAL.

## 1. Question

GAP-064's reconciled scope (`2026-10-01-prime-parity-scope-lock.md` §5) was locked on 2026-10-02 for "a later dedicated theming phase". This research re-verifies that scope at current `main` and settles how the remaining work is fixed. It does not widen the scope. The approved scope is:

- 12 components already resolve their Aura tokens, in Angular and in Vue;
- key mismatches: 15 in Angular, 16 in Vue;
- missing token modules: `badge`, `inputgroup`, `paginator`;
- hand-written CSS: 46 Angular and 48 Vue components;
- excluded: `datatable` and `virtualscroller`;
- `tabview`/`tabmenu` have React-only consumers;
- Ripple is undecided;
- React tokenization is not part of this GAP.

## 2. Method

- **Static:** a scratch script reads each Angular and Vue component directory. For each one it records:
  - the style key it registers: `componentName = "…"` in Angular; `componentName: "…"` or `registerComponentStyle("…")` in Vue;
  - the `dt('<key>.…')` prefixes in its style files, including any `@ultimate/uix-styles/<x>` modules it imports;
  - whether `auraPreset.components` has a module under the key, or under the key with hyphens removed.
- **Runtime:** a probe against the built packages calls `applyUltimateTheme()`, `dt('inputtext.color')` and `Theme.getComponent(name)` for hyphenated and unhyphenated names.
- **Upstream:** style names and modules were read from the pinned PrimeNG 21.1.9 and PrimeVue 4.5.5 sources and from `@primeuix/themes` 2.0.3 (`.vendor-extracted/themes/src/presets/aura/`).

## 3. Findings

### 3.1 Lookup mechanism

- A component's `componentName` does two jobs:
  - it is the key of its structural `<style>` in the per-framework `StyleSheet`;
  - it is the preset key that `registerThemeVariables` passes to `Theme.getComponent(name)`.
  - Sources: `packages/ng-core/src/basecomponent/base-component.ts:57-61`, `packages/vue-core/src/styling/vue-style-sheet.ts:42-45`, `packages/react-core/src/styling/use-component-style.ts:14-17`.
- `getPresetC` reads `preset.components[name]` with no normalization (`packages/uix-styled/src/utils/themeUtils.ts:246-250`).
- `dt()` returns a bare reference with no fallback value. The probe returned `dt('inputtext.color')` → `var(--u-inputtext-color)`.
- `Theme.getComponent('input-text')` returns empty CSS (0 bytes). `Theme.getComponent('inputtext')` returns the variable definitions (1,919 bytes).

**Consequence.** For a key-mismatch component, the variables its structural CSS references are never defined, unless another component that registers the upstream key is mounted, and none does. The affected declarations (background, border, padding, colors) are invalid at computed-value time, so those properties fall back to their initial or inherited values. This is a visible defect today, not only a missing customization point.

Upstream registers styles under the preset key exactly. Examples:

- PrimeNG: `name = 'inputtext'`, `'inputnumber'`, `'inputgroup'`, `'badge'`, `'paginator'`.
- PrimeVue: `name: 'inputnumber'`, `'inputgroup'`, `'badge'`, `'paginator'`, and `'ripple-directive'`. `getPresetD` strips the `-directive` suffix.

### 3.2 Classification (reproduces scope-lock §5)

| Class                                          | Angular                            | Vue                                                                             |
| ---------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| Covered (resolves today)                       | 12                                 | 12 (same components)                                                            |
| Key mismatch                                   | 15                                 | 16 (adds `input-chips`)                                                         |
| Missing module, CSS already token-based        | `badge`, `inputgroup`, `paginator` | same                                                                            |
| Missing module, excluded                       | `datatable`, `virtualscroller`     | same                                                                            |
| Hand-written CSS, module registered but unused | 46                                 | 48 (51 registrations: the Accordion's 3 sub-parts register the `accordion` key) |

- The 12 covered components: autocomplete, button, checkbox, dialog, listbox, menu, password, rating, select, slider, textarea, tooltip.
- The 15 key-mismatch components: cascade-select, color-picker, date-picker, file-upload, float-label, icon-field, ifta-label, input-number, input-otp, input-text, multi-select, radio-button, select-button, toggle-button, toggle-switch. Vue adds input-chips.

### 3.3 Vue InputNumber

Vue `InputNumber` renders a plain `<input>`, and its structural CSS references only `inputtext.*` tokens (`packages/vue/src/input-number/input-number-style.ts`). Upstream, those variables come from a child InputText. Renaming its key to `inputnumber` alone therefore defines the wrong variables: the `inputtext` variables stay undefined unless an InputText is mounted.

### 3.4 Missing modules

- **Token paths.** Angular and Vue Badge, InputGroup and Paginator already call `dt('badge.…')`, `dt('inputgroup.addon.…')` and `dt('paginator.…')`. The paths correspond to keys in the 2.0.3 modules (`aura/badge`, `aura/inputgroup`, `aura/paginator`).
- **InputGroup's key.** Angular and Vue InputGroup register as `input-group`, and the module's key is `inputgroup`, so InputGroup also needs the §3.1 key fix.
  - `input-group-addon` has no upstream module (upstream `inputgroupaddon` has none either), so it needs no change.
  - Its `inputgroup.addon.*` variables are defined globally once the parent InputGroup registers them.

### 3.5 Differences that need no change

Some sub-parts register a key that has no preset module, exactly as upstream does: `input-icon` (upstream `inputicon`), `input-group-addon` (`inputgroupaddon`), `button-group` (`buttongroup`), Vue `menuitem`, and the Accordion sub-parts. Their tokens come from the parent module.

The Vue `u-input-text` and Angular `u-inputtext` root classes differ. That is a class name, not a lookup key.

### 3.6 Effect of a key rename (D1)

- **Collisions.** None. No renamed key equals any key already registered in the same framework.
- **Rename sites.** The rename covers 16 Angular and 17 Vue components, at 16 Angular and 18 Vue registration sites:
  - the key-mismatch components (15 Angular, 16 Vue): 15 Angular sites and 17 Vue sites (Vue `BaseFileUpload.ts` registers twice);
  - `input-group`, from §3.4: 1 site per framework.
- **Uses of `componentName` beyond stylesheet lookup.**
  - Besides the structural-stylesheet key and the preset key, the value appears in the DOM as the key attribute of the generated `<style>` elements: `data-u-ng-style` in Angular, `data-u-style` in Vue. The theme-variable `<style>` element follows the same rule (`<key>-variables`).
  - Angular SSR hydration reuse (GAP-078) matches server and client `<style>` elements by this attribute. Server and client use the same key, so reuse is unaffected.
  - No repository documentation presents these attribute values as a consumer contract. No test asserts the hyphenated keys of the renamed components.
- **Public API.** Angular's `componentName` is `protected`. In Vue the value is an internal argument to `createBaseComponent`, so the signature of that exported factory does not change. React's keys are untouched.
- **Metadata.** `@ultimate/component-metadata` carries `style.componentName` only for button, checkbox, dialog, menu, paginator, scroller, table and tooltip, none of which is renamed.

### 3.7 React

React's style files are not static. 19 use `dt()` and 29 use `var(--u-<component>-…, <fallback>)`. React registers its styles through the same `registerThemeVariables`. Two consequences:

1. A change to the shared lookup (for example, stripping hyphens in `registerThemeVariables`) would change React rendering.
2. Adding the `paginator` module changes React `UPaginator`, which already composes `@ultimate/uix-styles/paginator` under the key `paginator`. React embeds `UPaginator` in `UTable` and `UDataView`. No React component registers `badge` or `inputgroup`.

### 3.8 Ripple

- The upstream `aura/ripple` module defines only a light/dark `root.background`.
- Angular and Vue Ripple register no structural CSS and no theme variables. They rely on the consumer's stylesheet for `.u-ink`.
- Porting the module alone would therefore have no effect. Using it would need a new style registration for the directive, following the upstream `ripple-directive` and `getPresetD` path.

### 3.9 Visual coverage

Screenshot specs exist only for Angular badge, paginator and table, Vue paginator and table, and React paginator and table. These specs and some Button specs reference a paginator or a badge. None of the components renamed under §3.6 has screenshot coverage.

## 4. Options for the Architecture Discussion

| Decision                                  | Options                                                                                                                                                                                                                                               | Recommendation                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| D1 Key mismatch                           | A. Rename `componentName` to the upstream key. B. Strip hyphens inside `registerThemeVariables`, which also changes React. C. Add an optional `themeKey` alongside `componentName`.                                                                   | A                                              |
| D2 Vue InputNumber                        | (a) Let a component also register the variables of other preset keys, here `inputtext`. (b) Render the inner input as a child InputText, which is a structural change.                                                                                | (a)                                            |
| D3 React effect of the `paginator` module | Accept as incidental, with React visual verification; or restrict to Angular/Vue, which the shared preset does not allow.                                                                                                                             | Accept                                         |
| D4 Sequencing                             | Tranche 1 = key mismatch + Vue InputNumber + missing modules; the 46/48 hand-written components in later per-family specs. For those: (a) port upstream `@primeuix/styles` structural CSS, or (b) replace literals with `dt()` in the existing rules. | Tranches; (a), with (b) as a recorded fallback |
| D5 Ripple                                 | Exclude and record, or include a directive style registration.                                                                                                                                                                                        | Exclude                                        |
| D6 Visual verification                    | Add screenshot coverage for Tranche 1; update baselines after reviewing the diff.                                                                                                                                                                     | Add coverage                                   |

## 5. Findings outside GAP-064 (recorded, not in scope)

1. **React documentation is inaccurate.**
   - `BLUEPRINT_GAPS.md` GAP-064 and scope-lock §5 say React "consumes no tokens" and that its style files are "hand-written static CSS".
   - §3.7 shows otherwise. The accepted React exception stands; only its stated basis is wrong.
   - This needs a separate documentation correction.
2. **Angular InputNumber structure.** The inner `<input>` gets only `u-inputnumber-input` (`packages/ng/src/input-number/input-number-style.ts:58`). Upstream PrimeNG applies `pInputText` to it (`inputnumber.ts:54`), so Ultimate's Angular InputNumber lacks InputText styling. This is a component-parity issue, not a token issue.
3. **FileUpload cross-component tokens.** Angular and Vue FileUpload CSS reads `button.border.radius` and `message.error.*`; upstream `@primeuix/styles/fileupload` reads only `fileupload.*`. Those variables are defined only if a Button or Message is also mounted.
4. **Ripple** (§3.8), excluded by D5.

## 6. Decisions (2026-10-04, user)

Recorded as ADR-051 (D1, D2).

- **D1 = A.** Where a component's style key differs from the upstream preset key, its `componentName` is renamed to the upstream key: the key-mismatch components (15 Angular, 16 Vue; `input-text` → `inputtext`, …) and `input-group` → `inputgroup` in both frameworks.
  - The rename affects stylesheet registration and preset lookup only.
  - Its one other observable effect is the `<style>` key attribute value (§3.6). That is not a documented consumer contract and has no test dependency.
  - B is rejected because it changes React. C is rejected because it adds an API that upstream does not have.
- **D2 = (a).** Vue InputNumber also registers the variables of the `inputtext` preset key, in addition to `inputnumber`. Its DOM and component structure do not change.
- **D3 = Accept.** Adding the `badge` and `paginator` modules may change React rendering, because React already reads those shared token paths (in practice `UPaginator`, including where `UTable`/`UDataView` embed it). This is an intentional incidental effect. Tranche 1 includes React visual verification for it. No React tokenization scope is created.
- **D4 = tranches.**
  - Tranche 1 is §3.1/§3.2's key mismatch, §3.3's Vue InputNumber and §3.4's missing modules.
  - The 46 Angular / 48 Vue hand-written components follow in later specs, one per component family.
  - For those, upstream structural CSS is the default. Literal-to-`dt()` conversion is used only where Ultimate's DOM differs materially from upstream, and each such fallback is recorded as an explicit parity exception.
- **D5 = exclude.** Ripple is excluded from GAP-064. §3.8 is kept as a separate follow-up.
- **D6 = add coverage.** Tranche 1 adds the screenshot coverage it needs. Affected baselines are updated only after the visual diff is reviewed.

**Out of Tranche 1:** DataTable/VirtualScroller; TabView/TabMenu; React tokenization; Angular InputNumber structural parity (§5.2); FileUpload's cross-component token dependency (§5.3); the 46/48 hand-written components; the React documentation correction (§5.1). §5.1–§5.3 stay recorded findings, not GAP-064 scope.
