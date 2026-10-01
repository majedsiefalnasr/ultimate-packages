# Specification — Vue: Tabs PageUp/PageDown, Stepper Vertical Separator (GAP-062–GAP-063)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (2026-09-30); implementation-stage corrections in §12; GAP-062/GAP-063 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit's residual-Unverified verification "Vue Tabs/Stepper Internal Behavior" (`vue-tabs-stepper-verification.md`), the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-062/GAP-063.

**Required sequence:** Research → Verification (residual-Unverified closure) → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for two confirmed Vue-specific gaps, both INCLUDE by human decision.

**In scope:** GAP-062 (Vue Tabs PageUp/PageDown scroll-into-view), GAP-063 (Vue Stepper vertical-mode separator) — `packages/vue/src/tabs/Tab.vue`, `packages/vue/src/stepper/StepPanel.vue`.

**Out of scope:** Vue Stepper's internal active-state mode-aware comparison difference (`$pcStepItem` vs. own `value`) — this specification's own GAP scope explicitly excludes it, per §2.2.

---

## 2. Human Decisions This Specification Implements

1. **GAP-062 and GAP-063 are both INCLUDE, Vue only.** Both were residual-Unverified items, fully resolved by direct evidence during the Vue Tabs/Stepper verification, then explicitly included by human decision.
2. **Vue Stepper's active-state internal mode-aware check is explicitly DEFER, not part of this Spec's scope.** The same residual verification found no independently demonstrated observable runtime defect from Ultimate's simpler flat comparison (vs. real PrimeVue's `$pcStepItem`-vs-own-`value` distinction) — Ultimate's own `UStepItem` already independently derives correct active state. This is not reopened here; it remains an implementation-detail question to revisit only if future evidence demonstrates an actual user-visible behavioral difference.

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-062 (Tabs PageUp/PageDown) | N/A | N/A | In scope |
| GAP-063 (Stepper vertical separator) | N/A | N/A | In scope |

---

## 4. Existing Behavior

- **GAP-062:** Real PrimeVue's `Tab.vue` implements `onPageDownKey`/`onPageUpKey`, scrolling the tab list into view without changing the selected tab. Ultimate's Vue `Tab.vue` omits both entirely. Real PrimeVue's own core keyboard mechanism (`findNextTab`/`findPrevTab`/`findFirstTab`/`findLastTab` — confirmed to live in `Tab.vue`, not `TabList.vue`) is otherwise already matched by Ultimate's Vue port; PageUp/PageDown is the one confirmed missing piece.
- **GAP-063:** Real PrimeVue's `StepPanel.vue` has a real `updateSeparator()` method rendering a `StepperSeparator` between vertical-mode steps (except after the last step). Ultimate's `StepPanel.vue` has zero separator logic anywhere in the Stepper family, confirmed by exhaustive grep. **(Corrected 2026-09-30 — see §12:** this line originally said the other Stepper-family files already match exactly. Real PrimeVue's `Step.vue` also renders horizontal separators, which Ultimate lacks — registered separately as GAP-077, out of scope here. Ultimate also has no `StepperSeparator` component, no `StepItem`-provided context and no step marker attribute, all of which GAP-063 needs.)

---

## 5. Required Behavior

### 5.1 GAP-062 — Vue Tabs PageUp/PageDown

Pressing PageDown/PageUp while a Tab has focus must scroll the tab list into view (matching real PrimeVue's own scroll-into-view mechanism) **without changing the currently selected tab** — this is a scroll-only affordance, not a selection-change affordance. Per real PrimeVue 4.5.5 `Tab.vue:88-95,122-123`: PageDown scrolls the last (enabled) tab into view, PageUp the first, via `scrollIntoView({ block: 'nearest' })`, calling `preventDefault()`; focus does not move. Vue only.

### 5.2 GAP-063 — Vue Stepper vertical separator

When a Stepper is in vertical orientation — i.e. a `StepPanel` sits inside a `StepItem` (real PrimeVue: `isVertical = !!$pcStepItem`) — a separator element must render inside the panel's content wrapper, before its content, for every step except the last — matching real PrimeVue's own `StepPanel.updateSeparator()` behavior (queried on mount and update). Vue only. Horizontal Steppers are unchanged by this gap; PrimeVue's separate horizontal separator in `Step.vue` is GAP-077. Supporting additions (user decision 2026-09-30, §12): `StepItem` provides its context, a stable step marker attribute, a small internal separator element, and vertical separator/content-wrapper CSS based on `@primeuix/styles` stepper. Widened after the Task 2 review (§12): PrimeUIX's vertical StepItem layout rules (column item, grid panel, content indent, RTL offset, last-item padding), so the separator renders under the step number as a connector.

---

## 6. API Requirements

No new public API is required for either gap — both are internal-behavior additions (a keyboard handler for GAP-062; conditional separator-element rendering for GAP-063) with no externally observable prop/event surface change. GAP-063's `StepItem` provide/inject, step marker attribute and separator element are internal (the separator is not exported).

---

## 7. Dependency Relationships

None. GAP-062 and GAP-063 are independent of each other and of every other GAP in this audit's scope.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Vue Stepper's active-state internal mode-aware comparison difference (§2.2) — DEFERRED, not touched by this Spec or its eventual Plan.
- `Step`/`StepList`/`StepPanels` behavior is not changed beyond GAP-063's step marker attribute; the horizontal `Step` separator gap is GAP-077, not addressed here. **(Corrected 2026-09-30 — this line originally claimed these files already match PrimeVue exactly; see §12.)**

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| PageDown/PageUp scrolls the Vue Tab list into view without changing the selected tab | GAP-062 |
| Vue Stepper renders a `StepperSeparator` between consecutive vertical-mode steps, except after the last step | GAP-063 |
| Vue Stepper's horizontal-mode rendering is unchanged by GAP-063 (no separators added in horizontal mode — that is GAP-077) | GAP-063 (non-regression) |
| Vue Stepper's active-state internal comparison mechanism is unchanged | GAP-063 (non-regression, per §2.2's DEFER) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-062, GAP-063; Vue Tabs/Stepper residual verification (`vue-tabs-stepper-verification.md`); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

Vue Stepper's active-state internal mode-aware comparison difference (DEFERRED). Horizontal `Step` separators (GAP-077). Any other Tabs/Stepper capability already confirmed matching real Prime.

---

## 12. Implementation-Stage Corrections (2026-09-30)

A pre-dispatch source check against real PrimeVue 4.5.5 found two problems; the user ruled on each before any code was written.

- **GAP-062 mechanism.** The Plan's snippet scrolled the focused tab with `inline: end/start`. Real `Tab.vue:88-95,122-123` scrolls the last tab (PageDown) or first tab (PageUp) into view with `{ block: 'nearest' }`, calls `preventDefault()`, and moves neither focus nor selection. Ultimate's `Tab.vue` already has the `findFirstTab`/`findLastTab` helpers and the same scroll call. User decision: match PrimeVue exactly (§5.1).
- **GAP-063 premise.** §4/§8 claimed `Step`/`StepItem`/`StepList`/`StepPanels` already match PrimeVue. They do not: PrimeVue's `Step.vue:9,43-49` renders a separator after each horizontal step header except the last, and Ultimate's does not. Ultimate also has no `StepperSeparator` component (only an unused horizontal `.u-stepper-separator` rule), `StepItem` provides no context (PrimeVue detects vertical mode via `$pcStepItem`), and steps carry no marker attribute. User decision: keep GAP-063 to the vertical `StepPanel` separator, adding the minimal supporting pieces (§5.2); register the horizontal separator separately as GAP-077.
- **GAP-063 vertical layout (after Task 2 review).** Ultimate's `.u-step-item` was a centred row, so the new separator rendered beside the step header rather than under the step number. User decision: widen GAP-063 to include PrimeUIX's vertical StepItem layout rules (column item, grid panel, content indent, RTL offset, last-item padding) in `stepper-style.ts`; horizontal layout unchanged.
