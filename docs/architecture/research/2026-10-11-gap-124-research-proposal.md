# GAP-124 residuals — research proposal and design options

**Date:** 2026-10-11 (revision 3, after user rulings D-124-1..7)
**Status:** DRAFT research input, all design rulings recorded (D-124-1..7). The implementation Spec is separate: `docs/superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md`. Not committed. No code changes. GAP-124 stays PARTIAL, GAP-064 stays PARTIAL, GAP-098 and its 2026-10-08 ruling are unchanged, and no other GAP status changes.

**Status note (2026-10-19):** committed; its Spec was executed and merged to `main` as `e32c224`, and GAP-124 is `PARTIAL`; see merge `e32c224` and the GAP-124 entry in `docs/architecture/BLUEPRINT_GAPS.md`. The text below is the point-in-time record.

**Baseline:** `main` `b2bd892`.

## 1. Scope and rulings

GAP-124 (`BLUEPRINT_GAPS.md`) has two open residuals after the E4-V1 remediation. They are kept as **two separate work items** with separate options and acceptance criteria:

- **Work item A — spin animation.** The loading icon in Button and DataView (Angular, Vue) does not rotate; Prime's does.
- **Work item B — non-text contrast.** The DataView loading icon measures 2.31:1 against the composited mask.

User rulings (2026-10-11; D-124-1..3 first round, D-124-4..7 second round):

| Ruling      | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D-124-1** | The opt-in icon spin is **outside** the GAP-098 global-reset boundary. The solution must stay icon-scoped like Prime's, must not broaden GAP-098, and must not alter the GAP-098 ruling. Preferred direction: a shared icon-level spin rule matching the pinned Prime reference, covering Button and DataView in Angular and Vue.                                                                                                                    |
| **D-124-2** | Respect `prefers-reduced-motion`: no continuous rotation when reduced motion is requested, while the loading state stays perceivable and understandable. Do not hide the indicator. Verify both preferences.                                                                                                                                                                                                                                         |
| **D-124-3** | Treat WCAG 2.2 SC 1.4.11 as **provisionally applicable**. Visual parity with Prime is not evidence of conformance. The visually hidden "Loading" text is a screen-reader announcement, not a visible equivalent. Compare the three options before selecting one.                                                                                                                                                                                     |
| **D-124-4** | Approve **A-1**: one shared, explicitly scoped `.u-icon-spin` rule matching the pinned Prime implementation; it affects only elements carrying the class. Before the Spec is final, establish the exact stylesheet and bundle scope across Angular, Vue and React. A-2 and A-3 are rejected unless evidence shows A-1 cannot be isolated safely.                                                                                                     |
| **D-124-5** | Keep React out **only if** the rule can be scoped so React is not changed. If the shared stylesheet or bundle would give React the new behavior, document that and present the smallest coherent scope decision first. Do not claim React is unaffected without a test or bundle-scope check.                                                                                                                                                        |
| **D-124-6** | Approve **RM-1**: under `prefers-reduced-motion: reduce` the icon stays visible and stops rotating; the live status region stays; no substitute continuous animation. Record the difference from Prime in migration and parity records; test both preferences.                                                                                                                                                                                       |
| **D-124-7** | Approve **B-2**: a dark DataView loading-icon color from **existing** theme tokens, scoped to DataView in Angular and Vue. No new Ultimate-only token unless the Spec shows existing tokens cannot reliably meet 3:1 in light and dark modes. No shared mask change. B-1 rejected. Specify a browser-level check of the rendered icon against the rendered mask in light and dark modes that fails below 3:1; axe text contrast is not a substitute. |

Out of scope: DataView overlay geometry, the Vue "no Prime reference" status (G3E-7), GAP-098's box model, React behavior (conditionally; see §3.4), and every other G3-E gap.

## 2. Verified evidence (at `b2bd892`)

### 2.1 Spin (work item A)

| Fact                                                                                                                                                                                                                                                                                                                                                                                            | Evidence                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular and Vue spinner icons emit `u-icon-spin` when `spin` is set.                                                                                                                                                                                                                                                                                                                            | `packages/ng-core/src/icons/spinner-icon.ts`; `packages/vue-core/src/icons/spinner-icon.ts:19`.                                                                                    |
| Four in-scope consumers pass `spin`.                                                                                                                                                                                                                                                                                                                                                            | `packages/ng/src/button/button.ts:79`; `packages/ng/src/data-view/data-view.ts:89`; `packages/vue/src/button/Button.vue:11`; `packages/vue/src/data-view/DataView.vue:137`.        |
| No CSS in `packages/*/src` defines `.u-icon-spin`, its keyframes, or `.u-icon`.                                                                                                                                                                                                                                                                                                                 | `git grep`.                                                                                                                                                                        |
| PrimeNG and PrimeVue define the spin in the icon's own stylesheet, `BaseIconStyle` (`name: 'baseicon'`): `.p-icon-spin { animation: p-icon-spin 2s infinite linear }` and `@keyframes p-icon-spin` (0deg → 359deg), plus `.p-icon { display: inline-block; vertical-align: baseline; flex-shrink: 0 }`. Neither has reduced-motion handling.                                                    | `.vendor-extracted/ng-core/icons/baseicon/style/baseiconstyle.ts`; `.vendor-cache/primevue-4.5.5.tar.gz` → `packages/icons/src/baseicon/style/BaseIconStyle.js`.                   |
| `@primeuix/styles` base (GAP-098's layer) does not contain the spin rule.                                                                                                                                                                                                                                                                                                                       | `packages/uix-styles/src/base/index.ts`.                                                                                                                                           |
| **Registration precedent (GAP-074).** `@ultimate/uix-styled` exports `registerHiddenAccessible(sheet)`: one class-scoped Prime base rule under a reserved key, registered once per sheet from each core's existing style-registration point (`ng-core` `UBaseComponent.ngOnInit`, per document under SSR per GAP-078; `vue-core` `registerComponentStyle`; `react-core` `use-component-style`). | `packages/uix-styled/src/stylesheet/hidden-accessible.ts`; `packages/ng-core/src/basecomponent/base-component.ts:49-63`; `packages/vue-core/src/styling/vue-style-sheet.ts:41-60`. |
| Icons are not base components; they register no styles today.                                                                                                                                                                                                                                                                                                                                   | `packages/ng-core/src/icons/base-icon.ts` (a `Directive` with inputs only); `packages/vue-core/src/icons/spinner-icon.ts`.                                                         |
| React's spinner icon also emits `u-icon-spin` with no rule.                                                                                                                                                                                                                                                                                                                                     | `packages/react-core/src/icons/spinner-icon.tsx:20`.                                                                                                                               |
| The parity tooling already captures spinner cases with infinite animations stopped (`still`), so probes and screenshots stay deterministic.                                                                                                                                                                                                                                                     | `tooling/prime-reference/e2e/probe.ts:239-240`; `tooling/prime-reference/cases-g3e.ts:40`.                                                                                         |

### 2.2 Contrast (work item B)

**Criterion (WCAG 2.2 SC 1.4.11, AA):** the visual presentation of "User Interface Components" (visual information required to identify components and states) and "Graphical Objects" ("parts of graphics required to understand the content") has a contrast ratio of at least 3:1 against adjacent colors. Exceptions: inactive components or user-agent-determined appearance (bullet 1), and "when a particular presentation of graphics is essential to the information being conveyed" (bullet 2).

**Understanding document (W3C, WCAG 2.2):** a graphic is not "required for understanding" when "a graphic with text embedded or overlaid conveys the same information", when "the information is available in another form", or when it is decorative; testing excludes "graphics which have visible text for the same information". For multi-color or gradient backgrounds: "choose the least contrasting area to test". It gives "status icons … (without associated text)" as an in-scope example and does not mention spinners.

**Applicability assessment.**

- The loading state has **no visible text equivalent**. The "Loading" text is `u-hidden-accessible`; per D-124-3 it is not a visible equivalent, and the "visible text" exclusion therefore does not apply.
- The **"essential presentation" exception does not apply**: the colors are not essential to the information.
- The dimmed mask also signals that content is blocked, but it does not on its own say "loading" rather than "disabled" or "modal". The evidence does not show that the spinner is redundant.
- **Conclusion:** the evidence does not support an exception. SC 1.4.11 applies to the spinner as a graphical object conveying status.

**Measured contrast** (sRGB relative luminance; mask composited over the content behind it; icon = `mask.color` = `{surface.200}` `#e2e8f0`; Aura `slate` surface):

| Scheme | Mask (`mask.background`) over        | Composite | `#e2e8f0` icon | White icon | Black icon |
| ------ | ------------------------------------ | --------- | -------------- | ---------- | ---------- |
| Light  | `rgba(0,0,0,0.4)` over white         | `#999999` | **2.31**       | 2.85       | 7.37       |
| Light  | `rgba(0,0,0,0.4)` over `surface.50`  | `#959697` | 2.40           | 2.96       | 7.09       |
| Dark   | `rgba(0,0,0,0.6)` over `surface.900` | `#060911` | 16.15          | —          | —          |
| Dark   | `rgba(0,0,0,0.6)` over white content | `#666666` | 4.66           | —          | —          |

Light-mode alternatives over the worst case (white content):

- **Darker icon at alpha 0.4:** `surface.600` 2.66, `surface.700` 3.63, `surface.800` 5.13, `surface.900` 6.27.
- **Darker mask with the `#e2e8f0` icon:** alpha 0.45 → 2.73, **0.5 → 3.20**, 0.55 → 3.85, 0.6 → 4.66.

Key fact: in light mode **no light icon color reaches 3:1** on the current mask; even pure white is 2.85. A passing icon at the current mask has to be dark (`surface.700` or darker), or the mask has to be darker.

**Token blast radius.** `mask.background` / `mask.color` are shared semantic tokens. Ultimate consumers: BlockUI, Galleria, Image, SpeedDial and DataView style modules in both `packages/ng` and `packages/vue` (10 modules), plus `aura/image.ts`; the Aura preset is a verbatim port checked against `packages/themes/test/fixtures/aura-upstream-tokens.json`. (`uix-styles` base also references them but is not imported anywhere, per GAP-098.)

**Automated gate.** axe `color-contrast` checks text only. No non-text-contrast check exists, so work item B needs a new measurement to be testable.

## 3. Work item A — spin animation

### 3.1 Registration options (where the shared rule lives)

- **A-1 (recommended): shared class-scoped rule on the GAP-074 pattern.** Add an icon-spin rule to `@ultimate/uix-styled` under a reserved key (for example `u-icon-spin`), with a purpose-specific `registerIconSpin(sheet)` helper. Call it from the same registration points that already call `registerHiddenAccessible` in `ng-core` and `vue-core`.
  - _For:_ reuses an approved, SSR-safe, per-document contract (GAP-074, GAP-078); there is one source of the rule; no icon component changes; the rule matches only elements with `u-icon-spin`, which is what D-124-1 requires.
  - _Against:_ the rule registers only when an Ultimate component has mounted on the page. A consumer rendering `<u-spinner-icon spin>` / `<SpinnerIcon spin>` standalone, with no other Ultimate component present, gets no rotation. This does not affect the in-scope Button and DataView.
- **A-2: icon self-registration (closest to Prime's `BaseIconStyle`).** Each icon registers the same rule when it renders. In Angular the icons would need `DOCUMENT` injection and the per-document sheet; in Vue a call in `setup`.
  - _For:_ works for standalone icons, and mirrors where Prime registers it.
  - _Against:_ it touches every icon in two cores (Angular has 4 icon components, Vue 6), and adds style registration to a layer that has none today.
- **A-3: per-component rule** in the Button and DataView style modules.
  - _For:_ smallest change.
  - _Against:_ duplicates the rule four times, leaves other spinning icons broken, and is not the "shared icon-level rule" D-124-1 prefers.

Only the spin rule and its keyframes are in scope. Prime's `.p-icon` display rules change layout for every icon and are not proposed here.

### 3.2 Reduced-motion design (D-124-2)

- **RM-1 (recommended): static icon.**
  - **Rule:** under `@media (prefers-reduced-motion: reduce)`, the spin rule sets `animation: none`.
  - **Behavior:** the spinner glyph stays at full size and opacity, so the indicator is still visible. The mask and live region are unchanged.
  - **Why:** simplest, with no motion of any kind.
- **RM-2: non-rotating cue,** such as a slow opacity pulse instead of rotation.
  - **Behavior:** it keeps a sense of activity.
  - **Against:** it is still an animation, which some reduced-motion users want gone. It adds a second keyframe set and a second behavior to verify.
- **RM-3: static icon plus visible text.** This overlaps work item B option B-4 and is decided there.

Ultimate diverges from Prime here: Prime has no reduced-motion rule. The divergence is recorded in MIGRATION and in the Parity Playbook row notes.

### 3.3 Acceptance criteria (work item A)

| ID    | Criterion                                                                                                                                                                                                                   | Verification                                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-AC1 | With normal motion, the loading icon in Button and DataView (Angular and Vue) has a computed animation of the spin keyframes, 2s, linear, infinite, from 0deg to 359deg, as in Prime.                                       | Playwright: `getComputedStyle` `animation-name` / `-duration` / `-timing-function` / `-iteration-count`; two transform samples at different clock times differ. |
| A-AC2 | With `prefers-reduced-motion: reduce`, the computed `animation-name` is `none`, and the icon stays visible: same box size, opacity 1, `display` unchanged. The `role="status"` region and its "Loading" text are unchanged. | Playwright `page.emulateMedia({ reducedMotion: 'reduce' })` on the same four cases.                                                                             |
| A-AC3 | Scope: only elements with `u-icon-spin` animate. No universal or element selector is added. The GAP-098 rule and `uix-styles` base are untouched.                                                                           | Unit test on the registered CSS text; diff review.                                                                                                              |
| A-AC4 | SSR: Angular SSR output contains the rule once per document (GAP-078), as the hidden-accessible rule does.                                                                                                                  | Existing SSR test pattern.                                                                                                                                      |
| A-AC5 | Visual baselines unchanged (screenshots run with infinite animations stopped). `dataview/loading` parity probe still has 0 differences.                                                                                     | Visual suite; parity probe with `still`.                                                                                                                        |
| A-AC6 | Accessibility validator has 0 introduced violations.                                                                                                                                                                        | Existing validator.                                                                                                                                             |

### 3.4 React

React's spinner emits the same unstyled class (`packages/react-core/src/icons/spinner-icon.tsx:20`). GAP-124 is recorded as Angular and Vue only.

**Stylesheet and bundle scope (D-124-4 / D-124-5 condition), verified at `b2bd892`:**

- Each core owns a separate sheet instance and registration point: `ng-core` `ngCoreStyleSheetFor(document)` from `UBaseComponent.ngOnInit` (`base-component.ts:52`); `vue-core` `vueCoreStyleSheet` from `registerComponentStyle` (`vue-style-sheet.ts:41-60`); `react-core` `reactCoreStyleSheet` from `useComponentStyle` (`use-component-style.ts:6-17`).
- A shared helper in `@ultimate/uix-styled` writes CSS only when a core **calls** it. `registerHiddenAccessible` reaches React only because `use-component-style.ts:8` calls it.
- Therefore a new, separate helper (not appended to `hiddenAccessibleCss`) called only from `ng-core` and `vue-core` never injects the rule from React code. React's dependency graph gains an exported but uncalled function; no React CSS changes.
- **Residual case:** a page that renders an Angular or Vue Ultimate component and a React Ultimate spinner in the **same document** would let the injected global `.u-icon-spin` rule match the React icon. This is a mixed-framework page, not a React-only behavior change, and is recorded as a known limitation.
- **Conclusion:** the D-124-5 condition is met. React stays out, and the Spec requires tests that prove React is unchanged (a `react-core` registration test, a built-output check, and a React browser check).

## 4. Work item B — non-text contrast

No option is selected. Each is assessed against the same criteria.

|                              | **B-1 Keep Prime colors, document an exception**                                                                                                       | **B-2 DataView-scoped icon color**                                                                                                                                                                                                                                           | **B-3 Change shared `mask.*` tokens**                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What changes**             | Nothing visual; a written rationale.                                                                                                                   | Light scheme: icon drawn in a dark color (`surface.700` gives 3.63, `surface.800` gives 5.13) over the current mask. Dark scheme: the current `#e2e8f0` already passes. Implemented as a DataView-only rule, either a new Ultimate-only token or per-scheme existing tokens. | Raise light `mask.background` alpha to at least 0.5 (3.20 over white), or change `mask.color`.                                                                               |
| **Accessibility**            | **Not supported by the evidence (§2.2).** There is no visible equivalent and no essential-presentation case, so it would leave a known 1.4.11 failure. | Passes 3:1 in both schemes at the worst-case white background.                                                                                                                                                                                                               | Passes 3:1 at alpha 0.5 by a thin margin (3.20; 3.35 over `surface.50`).                                                                                                     |
| **Blast radius**             | None.                                                                                                                                                  | DataView in 2 frameworks only.                                                                                                                                                                                                                                               | 10 style modules in 5 components (BlockUI, Galleria, Image, SpeedDial, DataView) × 2 frameworks, plus `aura/image.ts`; diverges from the verbatim Aura port and its fixture. |
| **Visual fidelity to Prime** | Identical.                                                                                                                                             | Diverges: a dark spinner on a grey mask, where Prime has a light one. Light scheme only.                                                                                                                                                                                     | Diverges on every mask in the library.                                                                                                                                       |
| **Component consistency**    | Consistent with Prime and other masks.                                                                                                                 | DataView's loading icon differs from other mask content (Image preview toolbar, Galleria).                                                                                                                                                                                   | Consistent across masks, but every mask changes.                                                                                                                             |
| **Testability**              | Nothing to test; the rationale is a review artifact.                                                                                                   | A new contrast probe (icon color vs composited mask over a white and a dark background), plus about 2–4 baseline updates.                                                                                                                                                    | The same probe, plus many baseline updates across 5 components, plus token fixture and provenance changes.                                                                   |
| **Prerequisites**            | User acceptance of a documented failure.                                                                                                               | Token decision: a new Ultimate-only token, or a scoped rule using existing tokens.                                                                                                                                                                                           | Theme-level decision that departs from the Aura source (ADR-level).                                                                                                          |

**B-4 (surfaced by the evidence, not one of the three documented options): visible "Loading" text.**

- **How it works:** making the label visible would make the spinner not "required for understanding", which is the Understanding document's visible-text exclusion.
- **Why it's not a shortcut:** the text then falls under SC 1.4.3 (4.5:1). `#e2e8f0` on the mask is 2.31:1; that was the original E4-V1 text violation. So B-4 still needs a contrast change for the text.
- **Visual impact:** it adds visible text that Prime does not have.
- **Status:** listed for completeness only.

**Assessment summary (not a selection).**

- **B-1** is not supported unless new evidence shows the spinner is redundant to a visible cue.
- **B-2** has the smallest blast radius that meets 3:1, at the cost of light-scheme fidelity.
- **B-3** is the only option that keeps all masks mutually consistent, but it is an Aura-level divergence with a wide visual footprint and a thin margin.

### 4.1 Acceptance criteria (work item B, option-independent)

| ID    | Criterion                                                                                                                                                                                                      | Verification                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| B-AC1 | The DataView loading icon has at least 3:1 contrast against the least-contrasting adjacent color: the mask composited over a white background (light) and over the dark-scheme background, in Angular and Vue. | New Playwright probe: computed icon fill vs computed mask color composited over the measured background, in both color schemes. |
| B-AC2 | Changes stay inside the selected option's blast radius. For B-2: no change to any other component, token, or the Aura fixture.                                                                                 | Diff review; existing theme and fixture tests unchanged.                                                                        |
| B-AC3 | The status live region, `aria-busy`, and the accessibility tree are unchanged from E4-V1.                                                                                                                      | Existing validator; a11y-tree check.                                                                                            |
| B-AC4 | Every visual baseline change is listed, explained by the selected option, and reviewed by the user.                                                                                                            | Visual suite diff report.                                                                                                       |

## 5. Decisions

Recorded in §1 (D-124-4..7). Existing-token evidence for D-124-7 (worst-case composites, Aura `slate` surface):

| Candidate (existing semantic token) | Light value   | Light, mask over white | Light, mask over `surface.200` | Dark value  | Dark, mask over `surface.900` | Dark, mask over white |
| ----------------------------------- | ------------- | ---------------------- | ------------------------------ | ----------- | ----------------------------- | --------------------- |
| `text.color`                        | `surface.700` | 3.63                   | 3.03                           | `surface.0` | 19.91                         | 5.74                  |
| `text.hover.color`                  | `surface.800` | 5.13                   | 4.28                           | `surface.0` | 19.91                         | 5.74                  |

Both flip between schemes and meet 3:1 at DataView's own background (`content.background`: light `surface.0`, dark `surface.900`), so no new token is needed. The Spec selects one and records why.

**Correction (2026-10-11, during Spec revision 2):** the dark-scheme figures above and in §2.2 use the `slate` palette. The dark scheme maps `surface` to `zinc`. Recomputed with zinc: `text.hover.color` over the mask on `surface.900` gives 19.79 (not 19.91), and over white it is unchanged at 5.74. The conclusions are unchanged. The Spec §6.4 holds the authoritative per-condition values, including light-scheme surfaces where 3:1 is not met.

## 6. Next steps (after review)

1. Spec Review of `docs/superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md` (this proposal is its research input, not the Spec).
2. After Spec approval: implementation plan with exact files, test commands, expected results, task ordering and rollback boundaries.
3. No code, GAP status change, commit or push until those gates are approved.
