# Specification — Vue: Tabs PageUp/PageDown, Stepper Vertical Separator (GAP-062–GAP-063)

**Status:** Spec stage — awaiting Spec Review.
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
- **GAP-063:** Real PrimeVue's `StepPanel.vue` has a real `updateSeparator()` method rendering a `StepperSeparator` between vertical-mode steps (except after the last step). Ultimate's `StepPanel.vue` has zero separator logic anywhere in the Stepper family, confirmed by exhaustive grep. Real PrimeVue's other Stepper-family files (`Step`/`StepItem`/`StepList`/`StepPanels`) are already confirmed to match Ultimate's own port exactly — `StepPanel.vue`'s separator logic is the one confirmed gap.

---

## 5. Required Behavior

### 5.1 GAP-062 — Vue Tabs PageUp/PageDown

Pressing PageDown/PageUp while a Tab has focus must scroll the tab list into view (matching real PrimeVue's own scroll-into-view mechanism) **without changing the currently selected tab** — this is a scroll-only affordance, not a selection-change affordance. Vue only.

### 5.2 GAP-063 — Vue Stepper vertical separator

When a Stepper is in vertical orientation, a `StepperSeparator` element must render between each pair of consecutive steps, except after the last step — matching real PrimeVue's own `updateSeparator()` behavior exactly. Vue only. Horizontal-orientation Steppers are unaffected (real PrimeVue's own `updateSeparator()` is itself vertical-mode-specific).

---

## 6. API Requirements

No new public API is required for either gap — both are internal-behavior additions (a keyboard handler for GAP-062; conditional separator-element rendering for GAP-063) with no externally observable prop/event surface change.

---

## 7. Dependency Relationships

None. GAP-062 and GAP-063 are independent of each other and of every other GAP in this audit's scope.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Vue Stepper's active-state internal mode-aware comparison difference (§2.2) — DEFERRED, not touched by this Spec or its eventual Plan.
- Real PrimeVue's other Stepper-family files (`Step`/`StepItem`/`StepList`/`StepPanels`) already match Ultimate's own port exactly — unchanged, not reopened.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| PageDown/PageUp scrolls the Vue Tab list into view without changing the selected tab | GAP-062 |
| Vue Stepper renders a `StepperSeparator` between consecutive vertical-mode steps, except after the last step | GAP-063 |
| Vue Stepper's horizontal-mode rendering is unaffected | GAP-063 (non-regression) |
| Vue Stepper's active-state internal comparison mechanism is unchanged | GAP-063 (non-regression, per §2.2's DEFER) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-062, GAP-063; Vue Tabs/Stepper residual verification (`vue-tabs-stepper-verification.md`); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

Vue Stepper's active-state internal mode-aware comparison difference (DEFERRED). Any other Tabs/Stepper capability already confirmed matching real Prime.
