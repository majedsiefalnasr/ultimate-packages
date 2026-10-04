# Specification — Aura Token Wiring, Tranche 1: Upstream Style Keys, Additional Preset Keys, Badge/InputGroup/Paginator Modules (GAP-064)

**Status:** Approved (Spec Review 2026-10-04); decisions in §13.
**Date:** 2026-10-04
**Branch:** `feature/gap-064-aura-token-wiring` (from `main` `f05bd9b`)
**Origin:** GAP-064 (`docs/architecture/BLUEPRINT_GAPS.md`, stays PARTIAL after this tranche). Decisions: ADR-051, plus D1–D6 in `docs/architecture/research/2026-10-04-gap-064-aura-token-wiring-research.md` §6. Parity baseline: ADR-048.

**Required sequence:** Decision (ADR-051, D1–D6, approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

Make the Angular and Vue components whose structural CSS already calls `dt()` actually receive their Aura variable definitions:

1. **Key rename (D1).** Rename the style key of each affected component to the upstream preset key:
   - Angular: 16 components, 16 registration sites;
   - Vue: 17 components, 18 registration sites.
2. **Additional preset keys (D2).** Add the minimal `@ultimate/vue-core` capability that lets a component also register the theme variables of further preset keys. Vue `InputNumber` uses it for `inputtext`.
3. **Module ports.** Port the `badge`, `inputgroup` and `paginator` Aura modules from the pinned `@primeuix/themes` 2.0.3.
4. **Verification (D3, D6).** Variable resolution, generated style keys, additional-key behavior, Angular SSR reuse, Angular/Vue screenshot coverage, React Paginator verification, and review of every baseline change.

GAP-064 stays PARTIAL: G3 (the 46 Angular / 48 Vue hand-written components) remains.

## 2. Decisions This Specification Implements

- **ADR-051 / D1 = A.** An Angular or Vue component whose structural CSS consumes an Aura preset module registers under that module's upstream key. Hyphen-normalizing the shared lookup and adding a separate `themeKey` are rejected.
- **ADR-051 / D2 = (a).** A component may also register the variables of other preset keys, with no structural CSS under those keys. Vue `InputNumber` is the only consumer. Its DOM and component structure do not change.
- **D3 = accept.** The new `paginator` (and `badge`) modules change React wherever React already reads those token paths. In practice that is `UPaginator`, including inside `UTable`/`UDataView`. This is verified, not avoided. No React tokenization scope.
- **D4.** Tranche 1 = G1 + G1a + G2. G3 follows later, in per-family specs.
- **D5.** Ripple is excluded.
- **D6.** Add the screenshot coverage this tranche needs. Baselines change only after their diff is reviewed.

## 3. Framework Applicability

- **Angular (`@ultimate/ng`):** key rename; SSR verification.
- **Vue (`@ultimate/vue`, `@ultimate/vue-core`):** key rename; additional-preset-key capability.
- **Shared (`@ultimate/themes`):** three new modules.
- **React (`@ultimate/react`):** no source change. Its Paginator rendering changes incidentally (D3) and is verified.

## 4. Existing Behavior (verified on `f05bd9b`)

### 4.1 Registration and lookup

- **Angular.** `UBaseComponent.ngOnInit` (`packages/ng-core/src/basecomponent/base-component.ts:51-63`) does three things:
  - calls `registerThemeVariables(sheet, this.componentName)`;
  - registers `u-hidden-accessible`;
  - adds the structural CSS under `this.componentName`.

  The sheet is `ngCoreStyleSheetFor(this.document)`. Each `<style>` element it creates carries `data-u-ng-style="<key>"`. On creation, an existing server-rendered element with the same key is adopted instead of duplicated (GAP-078; `packages/ng-core/src/basecomponent/style-sheet.ts:23-41`).

- **Vue.** `registerComponentStyle(componentName, styleModule)` (`packages/vue-core/src/styling/vue-style-sheet.ts:35-46`) does the same three things on `vueCoreStyleSheet`. Each `<style>` element carries `data-u-style="<key>"`.
  - `registerComponentStyle` and `vueCoreStyleSheet` are public `@ultimate/vue-core` exports (`packages/vue-core/src/styling/index.ts`; `packages/vue-core/test/exports.test.ts:60`).
  - The README documents `registerComponentStyle(componentName, styleModule)` (`packages/vue-core/README.md:23`).
- **Shared variable registration.** `registerThemeVariables(sheet, name)` (`packages/uix-styled/src/stylesheet/theme-variables.ts:47-60`):
  - adds the common variables once, under `u-common-variables`;
  - adds `Theme.getComponent(name).css` under `<name>-variables`;
  - is idempotent through `sheet.has()`.

  `Theme.getComponent` reads `preset.components[name]` without normalization. `dt()` emits `var(--u-…)` with no fallback.

- **Result.** For a hyphenated key such as `input-text`:
  - the `input-text-variables` element is never added, because the variable CSS is empty and `StyleSheet.add` ignores empty CSS;
  - the `--u-inputtext-*` references in the structural CSS are undefined.

### 4.2 Registration sites to rename

| Framework | Site (file:line)                             | Current key → upstream key                                          |
| --------- | -------------------------------------------- | ------------------------------------------------------------------- |
| Angular   | `cascade-select/cascade-select.ts:129`       | `cascade-select` → `cascadeselect`                                  |
| Angular   | `color-picker/color-picker.ts:96`            | `color-picker` → `colorpicker`                                      |
| Angular   | `date-picker/date-picker.ts:168`             | `date-picker` → `datepicker`                                        |
| Angular   | `file-upload/file-upload.ts:160`             | `file-upload` → `fileupload`                                        |
| Angular   | `float-label/float-label.ts:41`              | `float-label` → `floatlabel`                                        |
| Angular   | `icon-field/icon-field.ts:34`                | `icon-field` → `iconfield`                                          |
| Angular   | `ifta-label/ifta-label.ts:30`                | `ifta-label` → `iftalabel`                                          |
| Angular   | `input-group/input-group.ts:29`              | `input-group` → `inputgroup`                                        |
| Angular   | `input-number/input-number.ts:106`           | `input-number` → `inputnumber`                                      |
| Angular   | `input-otp/input-otp.ts:81`                  | `input-otp` → `inputotp`                                            |
| Angular   | `input-text/input-text.ts:86`                | `input-text` → `inputtext`                                          |
| Angular   | `multi-select/multi-select.ts:129`           | `multi-select` → `multiselect`                                      |
| Angular   | `radio-button/radio-button.ts:78`            | `radio-button` → `radiobutton`                                      |
| Angular   | `select-button/select-button.ts:88`          | `select-button` → `selectbutton`                                    |
| Angular   | `toggle-button/toggle-button.ts:62`          | `toggle-button` → `togglebutton`                                    |
| Angular   | `toggle-switch/toggle-switch.ts:56`          | `toggle-switch` → `toggleswitch`                                    |
| Vue       | `cascade-select/BaseCascadeSelect.ts:42`     | `cascade-select` → `cascadeselect`                                  |
| Vue       | `color-picker/BaseColorPicker.ts:28`         | `color-picker` → `colorpicker`                                      |
| Vue       | `date-picker/BaseDatePicker.ts:59`           | `date-picker` → `datepicker`                                        |
| Vue       | `file-upload/BaseFileUpload.ts:18` and `:44` | `file-upload` → `fileupload` (both sites)                           |
| Vue       | `float-label/BaseFloatLabel.ts:15`           | `float-label` → `floatlabel`                                        |
| Vue       | `icon-field/BaseIconField.ts:11`             | `icon-field` → `iconfield`                                          |
| Vue       | `ifta-label/BaseIftaLabel.ts:12`             | `ifta-label` → `iftalabel`                                          |
| Vue       | `input-chips/BaseInputChips.ts:24`           | `input-chips` → `inputchips`                                        |
| Vue       | `input-group/BaseInputGroup.ts:10`           | `input-group` → `inputgroup`                                        |
| Vue       | `input-number/BaseInputNumber.ts:47`         | `input-number` → `inputnumber` (+ additional key `inputtext`, §5.2) |
| Vue       | `input-otp/BaseInputOtp.ts:32`               | `input-otp` → `inputotp`                                            |
| Vue       | `input-text/BaseInputText.ts:34`             | `input-text` → `inputtext`                                          |
| Vue       | `multi-select/BaseMultiSelect.ts:47`         | `multi-select` → `multiselect`                                      |
| Vue       | `radio-button/BaseRadioButton.ts:41`         | `radio-button` → `radiobutton`                                      |
| Vue       | `select-button/BaseSelectButton.ts:37`       | `select-button` → `selectbutton`                                    |
| Vue       | `toggle-button/BaseToggleButton.ts:52`       | `toggle-button` → `togglebutton`                                    |
| Vue       | `toggle-switch/BaseToggleSwitch.ts:48`       | `toggle-switch` → `toggleswitch`                                    |

All paths are under `packages/ng/src/` or `packages/vue/src/`.

- **Unchanged sub-part keys.** These have no upstream module, and upstream behaves the same way: `input-group-addon` (Angular `input-group.ts:57`, Vue `BaseInputGroupAddon.ts:18`), `input-icon`, `button-group`, Vue `menuitem`.
- **No collisions.** No new key equals a key already registered in the same framework.
- **No test asserts these keys.** No existing test or document asserts the current hyphenated keys of these components.

### 4.3 Vue InputNumber

- Vue `InputNumber` renders a plain `<input>`.
- Its structural CSS references only `inputtext.*` tokens (`packages/vue/src/input-number/input-number-style.ts`).
- Registering `inputnumber` alone therefore leaves its references undefined unless an InputText is mounted.

### 4.4 Missing modules

- Angular and Vue Badge (key `badge`), Paginator (key `paginator`) and InputGroup (key `input-group` → `inputgroup`) already call `dt('badge.…')`, `dt('paginator.…')` and `dt('inputgroup.addon.…')`.
- `auraPreset.components` has no `badge`, `inputgroup` or `paginator` module, so all of those references are undefined.
- React `UPaginator` registers `paginator` and composes `@ultimate/uix-styles/paginator` (`packages/react/src/paginator/paginator.tsx:56`, `paginator-style.ts`). React embeds it in `UTable` and `UDataView`.
- No React component registers `badge` or `inputgroup`.

### 4.5 Ultimate-only and cross-component token references

A pre-Spec probe resolved each Tranche 1 component's `dt()` paths against the common variables plus the variables of its post-rename key(s). After the rename, every reference resolves except the following (the probe excluded the three missing modules):

- **E1 — Ultimate-only token paths.** Referenced by Ultimate's CSS, but neither defined by the 2.0.3 module nor referenced by upstream `@primeuix/styles` 2.0.3. Both frameworks unless noted:
  - `cascadeselect.option.disabled.color`, `cascadeselect.empty.message.padding`;
  - `colorpicker.preview.border.color`;
  - `datepicker.select.month.font.weight`;
  - `datepicker.day.cell.padding`, `datepicker.day.color`, `datepicker.day.width`, `datepicker.day.height`, `datepicker.day.border.radius`;
  - `datepicker.day.selected.background`, `datepicker.day.selected.color`, `datepicker.day.selected.focus.shadow`;
  - `fileupload.content.border.color`, `fileupload.content.border.radius`, `fileupload.content.highlight.background`, `fileupload.content.color`;
  - `fileupload.file.size.color`, `fileupload.file.actions.color`, `fileupload.file.info.border.radius` (Angular only);
  - `multiselect.option.disabled.color`.
- **E2 — FileUpload cross-component references** (research §5.3; out of scope): `button.border.radius`, `button.secondary.background`, `message.error.background`, `message.error.color`.
- **E3 — identical to upstream:** Vue `inputchips.chip.focus.color`. Upstream's `inputchips` CSS references it, and upstream's module does not define it.

These stay undefined after Tranche 1, exactly as today. See §12, item 2.

### 4.6 Existing coverage

- **Screenshot specs that reach Tranche 1 tokens:**
  - Angular: `badge` and `paginator`;
  - Vue: `paginator`;
  - React: `paginator`;
  - `table` in all three frameworks, which renders a paginator;
  - Vue and React `button` specs, which reference a badge.
- **Renamed components.** None has screenshot coverage.
  - Angular `input-text` and `input-number` have no Storybook story.
  - Vue `badge` and the `input-group` components in both frameworks have stories but no e2e spec.
- **Snapshots.** Paths follow `{testFileName}-snapshots/{arg}-{projectName}{ext}` (`playwright.config.ts:111`).
- **Angular SSR.** The harness `apps/playground-angular/e2e/ssr-hydration.spec.ts:386-413` asserts keyed server styles (`u-common-variables`, `button`, `u-hidden-accessible`) and one element per key after hydration. Its proof page (`apps/playground-angular/src/app/proof-page.component.ts`) renders no renamed component.

## 5. Required Behavior

### 5.1 Style key rename (D1)

1. Every site in §4.2 uses the upstream key. Vue `BaseFileUpload.ts` uses `fileupload` at both sites.
2. No Angular or Vue component in §4.2 registers, under any form of its old hyphenated key:
   - a structural `<style>`;
   - a variables `<style>` (`<old>-variables`);
   - any `StyleSheet` entry.
3. Only these identifiers change. Class names (`u-inputtext`, `u-input-text`, …), templates, props, emits and the DOM of the component itself do not.

### 5.2 Additional preset keys (D2)

1. `@ultimate/vue-core` lets a registration name additional preset keys. For each one it calls `registerThemeVariables(vueCoreStyleSheet, key)`:
   - **before** the component's structural CSS is added;
   - in the order given;
   - with the same idempotence as the component's own key.
2. An additional key registers **variables only**. No structural CSS is ever added under an additional key. In particular, Vue `InputNumber` must never create `<style data-u-style="inputtext">`. That key belongs to Vue `InputText`'s structural CSS, and `StyleSheet.has()` would block InputText's CSS if InputNumber registered it first.
3. Existing call shapes keep working unchanged. A registration without additional keys behaves exactly as today.
4. Vue `InputNumber` registers `inputnumber` with additional key `inputtext`.
5. No other component gets additional keys in this tranche. Angular gets no equivalent capability: it has no consumer (YAGNI). Its own InputNumber is a recorded follow-up (research §5.2).
6. The API shape is §12, item 1.

### 5.3 Aura module ports

1. Add `packages/themes/src/presets/aura/badge.ts`, `input-group.ts` and `paginator.ts`, following the file naming of the existing modules (`input-text.ts` → key `inputtext`):
   - port each from `@primeuix/themes` 2.0.3 (`aura/badge`, `aura/inputgroup`, `aura/paginator`);
   - transcribe all sections and values as-is;
   - type each following the existing module precedents: a local extension of `ComponentTokens` where upstream has a `colorScheme` split (`inline-message.ts`), and a flat local interface where it has none (`breadcrumb.ts`). This applies to Badge (split) and to InputGroup and Paginator (no split). Corrected at Spec Review; the Draft named only the `ComponentTokens` form.
2. Register them in `auraPreset.components` as `badge`, `inputgroup` and `paginator`.
3. Update the preset's doc comment to the new count: 79 registered modules.
4. **Provenance.** Add one `docs/architecture/provenance/themes.json` entry per file, matching the existing Aura entries' shape (`originalPath`, `ultimateDestination`, `modificationStatus: "reference-derived"`, `modificationDescription`).
5. **Fidelity fixture.** Add the three upstream token objects to `packages/themes/test/fixtures/aura-upstream-tokens.json` `modules`, generated the way `_meta.method` records:
   - dynamic import of `dist/aura/<module>/index.mjs` from the pinned tarball;
   - no hand edits.

   Extend `_meta.scope` to name this addition. `aura-upstream-fidelity.test.ts` then covers them unchanged: every registered non-proof-set module must deep-equal its fixture entry.

6. **Docs.** Update the module counts and the "Components without an Aura module" list in `packages/themes/README.md` and `docs/architecture/PACKAGE_ARCHITECTURE.md`.

### 5.4 D1 contract boundary (to be established by tests, §8)

Renaming changes these observable internal runtime artifacts, for the renamed components only:

- the `data-u-ng-style` (Angular) and `data-u-style` (Vue) value of the structural `<style>`;
- the `<key>-variables` value of the variables `<style>`;
- the corresponding `StyleSheet` map keys.

The Spec establishes the boundary around that change:

1. **No exported API or signature change from D1.** The public export surfaces of `@ultimate/ng`, `@ultimate/ng-core`, `@ultimate/vue` and `@ultimate/uix-styled` are identical before and after. `@ultimate/vue-core`'s only change is §5.2's (§12, item 1).
2. Angular `componentName` stays `protected abstract readonly` on `UBaseComponent` and `protected override readonly` on each component.
3. Vue's style key stays an internal argument: a literal passed to `createBaseComponent`/`registerComponentStyle` inside each component's base factory. It is not a prop, an option exposed to consumers, or an exported constant.
4. **Angular SSR reuse stays safe.**
   - The server and the client use the same renamed key.
   - A server-rendered `<style data-u-ng-style="<new key>">` (and `<new key>-variables`) is adopted on hydration.
   - Exactly one element exists per key afterwards.
5. **Not a public consumer contract.** No repository document presents these generated keys as one. This Spec does not make them one, and it does not document them as one.

### 5.5 What does not change

- **No change to:**
  - `@ultimate/uix-styled`;
  - `registerThemeVariables`;
  - `Theme`/`getPresetC`;
  - `dt()`;
  - React source.
- **No component CSS edit.** The E1–E3 references (§4.5) stay as they are.
- **Untouched components:**
  - the 12 already-covered components;
  - G3's 46/48 components;
  - Ripple;
  - DataTable/VirtualScroller.

## 6. API Requirements

- `@ultimate/ng`, `@ultimate/ng-core`, `@ultimate/vue`, `@ultimate/uix-styled`, `@ultimate/react`: public API unchanged.
- `@ultimate/vue-core`: one additive, backward-compatible change, for §5.2 only. It is listed in `packages/vue-core/README.md`'s `styling` line.
- `@ultimate/themes`: `auraPreset.components` gains `badge`, `inputgroup` and `paginator` (additive).
- **Consumer-visible rendering changes, all intended:**
  - the renamed components now render with their Aura values;
  - Badge, InputGroup and Paginator do too in Angular and Vue;
  - so does Paginator in React (D3).

  They are recorded in `MIGRATION.md` only if its existing scope covers visual changes. Plan Review decides; nothing is added silently.

## 7. Affected Files

| File(s)                                                                                                                                                       | Change                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| The 16 Angular and 17 Vue registration sites in §4.2 (`packages/ng/src/**`, `packages/vue/src/**`)                                                            | Key literal only                                                                   |
| `packages/vue-core/src/styling/vue-style-sheet.ts`                                                                                                            | §5.2 capability                                                                    |
| `packages/vue/src/input-number/BaseInputNumber.ts`                                                                                                            | Passes additional key `inputtext`                                                  |
| `packages/vue-core/README.md`                                                                                                                                 | `styling` line documents §5.2                                                      |
| `packages/themes/src/presets/aura/{badge,input-group,paginator}.ts`, `.../aura/index.ts`                                                                      | New modules; registration; doc comment                                             |
| `docs/architecture/provenance/themes.json`                                                                                                                    | Three entries                                                                      |
| `packages/themes/test/fixtures/aura-upstream-tokens.json`                                                                                                     | Three upstream objects; `_meta.scope`                                              |
| `packages/themes/README.md`, `docs/architecture/PACKAGE_ARCHITECTURE.md`                                                                                      | Module counts and the missing-module list                                          |
| Unit tests (§8): `packages/ng/src/**/*.spec.ts`, `packages/vue/src/**/*.spec.ts`, `packages/vue-core/src/styling/*.spec.ts`, `packages/themes/test/*.test.ts` | New or extended tests                                                              |
| `packages/ng/src/input-text/input-text.stories.ts`, `packages/ng/src/input-number/input-number.stories.ts`                                                    | New stories (test fixtures for visual coverage)                                    |
| `packages/ng/e2e/*.spec.ts`, `packages/vue/e2e/*.spec.ts` and `*-snapshots/`                                                                                  | New visual specs and baselines (§8, criteria 6–7)                                  |
| `packages/{ng,vue,react}/e2e/*-snapshots/` for paginator, badge, table, button                                                                                | Updated baselines, only after reviewed diffs                                       |
| `apps/playground-angular/src/app/proof-page.component.ts`, `apps/playground-angular/e2e/ssr-hydration.spec.ts`                                                | Add a `UInputText`; extend the GAP-078 test                                        |
| `docs/architecture/PERFORMANCE.md`                                                                                                                            | Only through the established two-step size-baseline procedure, if §8.9 requires it |
| `docs/architecture/BLUEPRINT_GAPS.md`                                                                                                                         | GAP-064 progress note at closeout; status stays PARTIAL                            |

Any further file found necessary during planning is reported at Plan Review rather than added silently.

## 8. Acceptance Criteria

Unless stated otherwise, criteria are checked on the generated `<style>` elements in the test document's `<head>` after mounting with `applyUltimateTheme()` applied. They are not checked on source `componentName` values.

1. **Generated style keys (per component, both frameworks).** Each component in §4.2 is mounted alone, in a fresh document/registry. The document then contains:
   - exactly one `style[data-u-ng-style="<new>"]` (Angular) or `style[data-u-style="<new>"]` (Vue);
   - exactly one `…="<new>-variables"`, whose text defines at least one `--u-<new>-` custom property;
   - no element whose key is the old hyphenated key or `<old>-variables`.

   For Vue FileUpload, one mount through both registration sites yields exactly one `fileupload` and one `fileupload-variables` element. The check is table-driven over the §4.2 list, so a missed site fails it.

2. **Variable resolution.** For each component in §4.2, and for Angular and Vue Badge and Paginator:
   - every `var(--u-…)` reference in its registered structural CSS is defined by a registered variables element (`u-common-variables`, `<key>-variables`, or an additional key's variables);
   - the only exceptions are the exact E1–E3 lists of §4.5.

   The test asserts the exception set exactly in both directions. A newly unresolved reference fails it, and so does an exception that has started to resolve. If implementation finds an unresolved reference not in §4.5 (for example in Badge, InputGroup or Paginator after the port), it is reported for review before the list changes; it is not added silently.

3. **Additional preset keys.**
   - Vue `InputNumber` mounted alone yields `inputnumber`, `inputnumber-variables` and `inputtext-variables`, and **no** `style[data-u-style="inputtext"]`.
   - Mounting `InputNumber` and then `InputText` yields InputText's own structural CSS under `inputtext`, plus exactly one `inputtext-variables`.
   - Mounting them in the reverse order yields the same set.
   - In `vue-core` unit tests, a registration without additional keys produces exactly the elements it does today, and additional keys never produce a structural element.
4. **D1 contract boundary.**
   - The export-surface tests of `@ultimate/ng-core`, `@ultimate/vue`, `@ultimate/vue-core` (`test/exports.test.ts`) and `@ultimate/uix-styled` pass. Any change they need is limited to `@ultimate/vue-core`'s §5.2 addition.
   - A type-checked (not executed) assertion confirms `componentName` is not publicly accessible on an Angular component type: `// @ts-expect-error` on reading `componentName` from a `UInputText`-typed value.
   - The built `@ultimate/vue` declarations contain none of the old or new style-key literals of §4.2, as on `f05bd9b` today. `@ultimate/vue-core` declares the option only as `componentName: string`.
5. **Angular SSR reuse.**
   - The SSR proof page renders a `UInputText`.
   - The extended GAP-078 test asserts that the server HTML contains `data-u-ng-style="inputtext"` and `data-u-ng-style="inputtext-variables"` and no `input-text` key.
   - After hydration every `data-u-ng-style` key occurs exactly once, with no hydration errors.
   - The proof page's existing determinism test (byte-identical SSR output across two requests) still passes.
6. **Screenshot coverage (D6).**
   - A "Default story: visual regression" test, following the existing `badge.spec.ts` pattern, exists for:
     - every Angular component in §4.2;
     - every Vue component in §4.2;
     - Vue Badge.
   - It covers all three browser projects of each framework.
   - Angular InputText and InputNumber get Default stories so they can be covered.
7. **Reviewed baselines.**
   - New screenshot tests are first recorded against the pre-change code (the "before" state), then re-run after the change. The resulting diffs are reviewed and only then accepted as baselines.
   - Every changed existing baseline is listed with its before/after images for review. That covers Angular/Vue/React Paginator, Angular Badge, the three frameworks' Table, and the Vue/React Button specs, plus any other baseline that changes. No baseline is updated without that review.
   - Any change outside the expected set is investigated before acceptance.
8. **React Paginator (D3).**
   - React `UPaginator` registers `paginator-variables`, defining `--u-paginator-*`.
   - `cross-framework-consistency.test.ts` asserts that React and Vue Paginator resolve `paginator.background` to the same variable and that the variable is defined.
   - React Paginator and Table screenshot diffs are reviewed under criterion 7.
   - No React source file changes.
9. **Fidelity and size.**
   - `aura-upstream-fidelity.test.ts` passes, with `badge`, `inputgroup` and `paginator` in the fixture and deep-equal to it.
   - `size:validate` is run and its result recorded. If any package exceeds the 15% regression threshold, the established two-step baseline procedure applies (a separate `PERFORMANCE.md`-only change re-measured on `main`, with an explicit human override at merge). Nothing is overridden silently.
10. **Unchanged behavior elsewhere.** The unit suites of `ng`, `ng-core`, `vue`, `vue-core`, `react`, `react-core`, `themes` and `uix-styled` pass. Existing screenshot tests not listed in criterion 7 do not change.
11. **No out-of-scope edits.** The diff touches no file of a G3 component, Ripple, DataTable/VirtualScroller, TabView/TabMenu, React source, `uix-styled`, or Angular InputNumber's template or style module (beyond its key literal), and no E1–E3 CSS.

## 9. Verification Approach

- **Order.** Screenshot coverage and its "before" baselines first, then the rename and modules, then reviewed diffs. Unit tests are written to fail before the change (criteria 1–3) where the behavior is new.
- **Unit tests.** Vitest in each package.
  - Generated-key and resolution tests mount real components in jsdom with the theme applied.
  - The registries are reset between cases.
- **SSR.** Run the `ng-ssr-chromium` project.
- **Visual.** Run the `ng-*`, `vue-*` and `react-*` projects locally. Before/after images of every changed baseline go into the closeout record.
- **Size.** Run `pnpm run build`, then `size:measure` and `size:validate`.
- **Real CI.** Results of the unit, SSR and visual jobs on push. The open CI triage items (visual/a11y baselines on Linux, SSR web servers, and others from run `37188652979`) are unrelated and are not judged here. Tranche 1 is judged on its own tests.

## 10. Evidence/Source References

- Research `2026-10-04-gap-064-aura-token-wiring-research.md`, §3.1–§3.9 and §6.
- ADR-051, ADR-048, GAP-078's contract (scope-lock §3, §7.3).
- Upstream (pinned):
  - PrimeNG 21.1.9 style names (`name = 'inputtext'`, `'inputgroup'`, `'badge'`, `'paginator'`, …);
  - PrimeVue 4.5.5 style names;
  - `@primeuix/themes` 2.0.3 `aura/{badge,inputgroup,paginator}`;
  - `@primeuix/styles` 2.0.3, for the E1/E3 classification.

## 11. Explicit Out-of-Scope Items

- G3: the 46 Angular / 48 Vue hand-written CSS components.
- DataTable / VirtualScroller parity work.
- TabView / TabMenu.
- React tokenization, and any React source change.
- Angular InputNumber structural parity (research §5.2).
- FileUpload cross-component token behavior (E2; research §5.3).
- Ripple (D5).
- The inaccurate React documentation wording (research §5.1).
- Fixing the E1 Ultimate-only token paths and the upstream-identical E3 reference (§12, item 2).
- Unrelated CI failures; GAP-083; any other GAP.

## 12. Open Items for Spec Review

1. **§5.2 API shape: an exported signature change in `@ultimate/vue-core`.** D1 changes no exported signature. D2's core capability does, additively. Options:
   - **(a) Recommended.** An optional third parameter, `registerComponentStyle(componentName, styleModule, additionalPresetKeys?: readonly string[])`. It keeps the "variables before structural CSS" ordering in one place, and existing calls are unchanged.
   - **(b)** Vue `InputNumber` calls the existing exports directly: `registerThemeVariables(vueCoreStyleSheet, "inputtext")` before `registerComponentStyle(...)`. No `vue-core` signature change. But the capability is not in the core, and the ordering rule is repeated at the call site.
2. **E1 Ultimate-only token paths (§4.5): a new finding at Spec time.** Twenty Angular and nineteen Vue references, in CascadeSelect, ColorPicker, DatePicker, FileUpload and MultiSelect, use token paths that exist neither in the 2.0.3 modules nor in upstream's structural CSS. They stay undefined after the rename.
   - Proposed: record them as a follow-up finding, like the research §5 items; do not fix them in Tranche 1; and assert them as an exact exception list (criterion 2).
   - Fixing them means changing those components' CSS toward upstream, which is G3-style work.
   - E3 matches upstream and needs no action.
3. **Test fixtures outside the component sources.** The two Angular stories (§7) and the `UInputText` added to the Angular SSR proof page are needed only for verification (criteria 5–6). Please confirm they are acceptable as Tranche 1 test fixtures.

## 13. Spec Review Decisions (2026-10-04)

1. **§5.2 API: option (a).** `registerComponentStyle` gets an optional, additive third parameter, `additionalPresetKeys`.
   - When it is omitted, existing call sites behave identically.
   - It registers additional theme variables only, never structural CSS under an additional key.
   - The updated exported signature and its backward compatibility are verified.
   - No further abstraction, and the logic does not move into Vue `InputNumber`.
2. **E1 Ultimate-only token paths: kept as an explicit, bidirectional exception list.** That is 20 Angular and 19 Vue references.
   - The tests prove that every listed exception is observed and unresolved, and that every observed unresolved reference is listed.
   - They are not fixed in Tranche 1.
   - The FileUpload Button/Message dependencies (E2) stay out of scope.
   - The exception list must not mask variables the new Badge/InputGroup/Paginator modules should supply. Those components have no exceptions, and module-port verification stays independent (upstream-fidelity test).
3. **Verification fixtures approved.** These are test infrastructure, not scope expansion:
   - the Angular InputText and InputNumber Storybook stories;
   - `UInputText` on the Angular SSR proof page;
   - any corresponding verification-only fixture C1–C8 need.
4. **`MIGRATION.md`.** No migration change is required at Spec Review. It is decided at Plan Review, once it is clear whether the generated-style-key and token behavior is consumer-visible enough to warrant a note.
