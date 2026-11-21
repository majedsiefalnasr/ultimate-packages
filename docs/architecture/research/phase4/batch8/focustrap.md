# Phase 4 — FocusTrap

Ultimate HEAD `91a8472547e34c6e92456f2b98270a1555e3a2db`; PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5. Source-read only; no tests, browser, visual or AT checks. C/P/M/I/N/U = complete/partial/missing/intentional/not applicable/unresolved. No I without an active ADR or user ruling. Product paths are repo-relative. PN=.vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/ ; PR=.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/ ; PV=.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/ .

## Mapping

| Framework | Prime                                                             | Ultimate                                                                    | Basis                                                               |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Angular   | PrimeNG `[pFocusTrap]` directive (`focustrap/focustrap.ts:10-14`) | `[uFocusTrap]` (`packages/ng-core/src/focus-trap/focus-trap.ts:17-25`)      | Directive on a container. Mechanisms differ (sentinels vs keydown). |
| React     | PrimeReact `FocusTrap` component (`focustrap/FocusTrap.js:7`)     | `FocusTrap` (`packages/react-core/src/focus-trap/focus-trap.tsx:13`)        | Wrapper renders sentinels around children.                          |
| Vue       | PrimeVue `v-focustrap` (`focustrap/FocusTrap.js:5`)               | `focusTrapDirective` (`packages/vue-core/src/focus-trap/focus-trap.ts:113`) | Directive on the container.                                         |

## Capability matrix

| # | Capability | NG | React | Vue | Evidence (Prime → Ultimate) |
| --: | -------------------------------------------------------------------------------------------------------------- | :-: | :---: | :-: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1 | Tab / Shift+Tab wraps at the container boundaries | P | C | C | PN `focustrap/focustrap.ts:58-97` (hidden sentinels) → NG `packages/ng-core/src/focus-trap/focus-trap.ts:39-65` (keydown only, wraps when `activeElement` is first/last); React `packages/react-core/src/focus-trap/focus-trap.tsx:47-59,61-82`; Vue `packages/vue-core/src/focus-trap/focus-trap.ts:49-70`. PR `focustrap/FocusTrap.js:66-86,88-122`; PV `focustrap/FocusTrap.js:78-95`. NG wraps only while focus is already inside. |
| 2 | Focus arriving from outside is redirected into the container | M | P | C | PN `focustrap.ts:83-97` (`relatedTarget` outside → first/last focusable); PR `FocusTrap.js:66-86`; PV `FocusTrap.js:78-95` → NG has no sentinels or focusin handling (`focus-trap.ts:20-24`) → M. React sentinels ignore `relatedTarget`: first sentinel always focuses the last focusable and the last sentinel the first (`focus-trap.tsx:47-59`), so entering from outside lands on the opposite end → P. Vue mirrors Prime's `relatedTarget` logic (`focus-trap.ts:49-65`) → C. |
| 3 | Initial autofocus on mount (`autoFocus`, `autoFocusSelector`, `[autofocus]` target) | N | C | C | PN `FocusTrap` never moves focus (separate `AutoFocus` directive; `docs/prime-reference/components/focustrap.md:15,77`) → NG none → N. PR `FocusTrap.js:31-36,50-60` → React `focus-trap.tsx:24-45` (also supports `data-u-autofocus`). PV `FocusTrap.js:5-13,71-77` → Vue `focus-trap.ts:97-106,116-121`. **[default-differs?]** PV `FocusTrap.d.ts:27-30` documents `autoFocus` default true, runtime default is false (`FocusTrap.js:72`); product Vue default is falsy (`focus-trap.ts:102`) and product React default false (`focus-trap.tsx:15`), PR runtime default false (`FocusTrap.js:51`). Class unchanged either way. |
| 4 | Reacts to `disabled` | C | C | C | PN input toggles sentinels (`focustrap.ts:19,35-43`); PR read once at mount (`FocusTrap.js:31-36`); PV `updated` unbinds only, sentinels remain (`FocusTrap.js:19-23`) → NG checks per Tab (`focus-trap.ts:29,40,54`); React mount-only (`focus-trap.tsx:41-45`) like PR; Vue same as PV (`focus-trap.ts:123-125`). |
| 5 | Recover focus after child-list mutation | N | N | P | PV `FocusTrap.js:34-50` (MutationObserver picks next focusable after the mutation point); PN/PR have none → Vue `focus-trap.ts:72-80` observes the same mutations but always focuses the first focusable, not the next one after the removed node → P. |
| 6 | Configurable selectors and sentinel `tabIndex` (`firstFocusableSelector`, `lastFocusableSelector`, `tabIndex`) | N | P | P | PN none; PR `FocusTrap.js:51,89` (`firstFocusableSelector`, `tabIndex`; `lastFocusableSelector` unused); PV `FocusTrap.js:97` (all three read) → React supports both selectors via `firstFocusableSelector` only (`focus-trap.tsx:9-10,18`), no `tabIndex` (sentinels fixed 0, `:66`) → P; Vue has both selectors (`focus-trap.ts:12-14`), no `tabIndex` (`:34`) → P. |
| 7 | `onFocusIn` / `onFocusOut` callbacks | N | N | M | PV `FocusTrap.js:32,57-61` → Vue installs empty `focusin`/`focusout` listeners and its binding type has no callbacks (`focus-trap.ts:9-15,82-85`) → M. PN/PR none. |
| 8 | Imperative access (`getInk/getTarget`, `el.$focustrap.autoFocus()`) | N | M | M | PR `FocusTrap.js:25-29`; PV `FocusTrap.js:68-70` → React exposes no ref (`focus-trap.tsx:13-19`); Vue directive exposes no instance method (`focus-trap.ts:113-130`). |
| 9 | Aura tokens / component stylesheet | N | N | N | No FocusTrap tokens or component CSS in any Prime: PN has no style provider (`focustrap.ts:10-14`), PR `FocusTrapBase.js:4` styles are `''`, PV `focustrap/style/FocusTrapStyle.js:3-5` is name-only. Product uses the shared hidden-accessible utility (`packages/uix-styled/src/stylesheet/hidden-accessible.ts:4`). Not an Aura-key/`dt()` row. |
| 10 | `pt` | N | N | N | PN: directive extends `BaseComponent` (`focustrap.ts:14`) so `pt` is inherited, but no `ptm` call exists in the file. PR: `setMetaData` yields `ptm` but `FocusTrap.js:21-23` never uses it; no d.ts exists. PV: PT options are typed (`FocusTrap.d.ts`, `FocusTrapDirectivePassThroughOptions`) but `FocusTrap.js` never calls `ptm`. Product has no PT in any framework. Declaration vs runtime conflict changes the class (M if declaration governs, N if runtime). | User ruling 2026-11-20: runtime governs, N + reference defect. |
| 11 | `ptOptions` | N | N | N | Same basis: PN base `basecomponent/basecomponent.ts:72`; PV `core/src/basedirective/BaseDirective.js:20,55` read it only inside `_getPTValue`, which FocusTrap never reaches; PR `ComponentBase.js:422` default only. Pending the same ruling as `pt`. | User ruling 2026-11-20: runtime governs, N + reference defect. |
| 12 | Unstyled mode | N | N | N | Brief default (D-SHARED #5). PN base `basecomponent.ts:60`; PR `FocusTrap.js:19` (`useStyle`, styles `''`); PV `BaseDirective.js:94,182` skips common-style loading when unstyled. NG base declares, never reads (`packages/ng-core/src/basecomponent/base-component.ts:34-36,50-53`); React/Vue have none. Judgment flag: if the KeyFilter precedent (no styled feature to suppress) is applied, all three become N. | User ruling 2026-11-20: KeyFilter precedent, N (no CSS/tokens). |
| 13 | Per-instance `dt` | N | N | N | Applied by KeyFilter precedent (lead ruling 2026-11-19): PV `BaseDirective.js:127-135,184` supports scoped presets, but FocusTrap's style (`FocusTrapStyle.js:3-5`) has no tokens, so there is nothing to scope; PN/PR have no tokens either (PrimeReact has no `dt` API, `ComponentBase.js:420-423`). The brief default would be NG P, Vue M. |

## Distribution (13 rows; C/P/M/I/N/U)

| Framework | C   | P   | M   | I   | N   | U   |
| --------- | --- | --- | --- | --- | --- | --- |
| Angular   | 1   | 1   | 1   | 0   | 10  | 0   |
| React     | 3   | 2   | 1   | 0   | 7   | 0   |
| Vue       | 4   | 2   | 2   | 0   | 5   | 0   |

## Default flags

- PrimeVue `autoFocus`: `.d.ts` says default true (`FocusTrap.d.ts:27-30`), runtime false (`FocusTrap.js:72`). Ultimate Vue/React default false. **Class impact: none.** Row 3 is "initial autofocus exists and is configurable"; with the runtime default the product matches (flag-free), with the docs default it is a `[default-differs]` flag. Either way the capability is complete (method 17), so no ruling is needed for this item.
- PrimeVue/PrimeReact sentinel `tabIndex` default 0 (`FocusTrap.js:97`, `:89`); product fixed 0.

## Reference defects

- PrimeVue `autoFocus` default typed true, runtime false (above).
- PrimeVue `lastFocusableSelector` is read (`FocusTrap.js:97`) but `$_pfocustrap_focusableselector` is only assigned on the sentinels, and PrimeReact never reads `lastFocusableSelector` at all (`docs/prime-reference/components/focustrap.md:66-67`).
- PrimeReact ships no `focustrap.d.ts`/catalog entry although the runtime exists.

## Ruling needed

1. **`pt` / `ptOptions` (rows 10-11), PrimeNG and PrimeVue.** Both declare PT but the FocusTrap runtime never applies it. Option A (recommended): runtime governs, N plus reference defect (same basis as InputOtp React focus/blur ruling); Ultimate's absence is then not a gap. Option B: declaration governs, M under D-PT. PrimeReact is N under either option (no declaration). Cells stay U until ruled.
2. **Style-control rows 12-13 (judgment, not U).** I applied the brief default to `unstyled` (P/M/M) but the KeyFilter precedent to `dt` (N/N/N). Option A (recommended): use the KeyFilter precedent for both, so `unstyled` becomes N/N/N (no styled feature). Option B: brief defaults for both (`dt` NG P, Vue M). This moves counts by at most 3 cells.

## Verification limits

Source only; no focus-order or browser check. Product Angular wraps only on keydown while focus is inside, so outside-entry behavior (row 2) is read from code, not executed. PN/PR/PV sentinel line ranges were read in full for FocusTrap files; the PT/unstyled conclusions rest on the absence of `ptm`/style use within those files.
