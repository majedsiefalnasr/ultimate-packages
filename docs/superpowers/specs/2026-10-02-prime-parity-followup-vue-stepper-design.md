# Specification — F3 Vue Stepper: Horizontal Separators (GAP-077)

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-10-02
**Branch:** `feature/prime-parity-followup`
**Origin:** post-closeout scope lock (`docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §6–§7), GAP-077 (split out of GAP-063). Parity baseline: ADR-048 (PrimeVue 4.5.5, `@primeuix/styles` 2.0.3).

**Required sequence:** Scope Lock → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for the horizontal Stepper separator that GAP-063 deliberately left out.

**In scope:** GAP-077 — `packages/vue/src/stepper/{Step.vue,StepList.vue,stepper-style.ts}`.

**Out of scope:** the vertical (StepItem) layout and separator delivered by GAP-063; PrimeVue's `isCompleted` state on `Step`; Angular and React Stepper (not examined by this finding); Aura token consumption for the Stepper (GAP-064, later theming phase).

---

## 2. Human Decisions This Specification Implements

1. F3 contains exactly GAP-077 (scope lock §7.8).
2. Pinned PrimeVue 4.5.5 and `@primeuix/styles` 2.0.3 are the normative reference (ADR-048).
3. Lesson carried from GAP-063 (whose layout had to be widened after review): the layout rules the separator needs are part of this Spec from the start.

---

## 3. Framework Applicability

Vue only. Angular and React are out of scope.

---

## 4. Existing Behavior

- `Step.vue` renders the step header only; no separator (`Step.vue:1-8`). It injects `$pcStepper` only.
- `StepList.vue` is a plain wrapper with no `provide()`, so a `Step` cannot tell whether it sits in a horizontal `StepList` or a vertical `StepItem`.
- `stepper-style.ts` lays out horizontal steps as fixed-size columns: `.u-step { display: flex; flex-direction: column; align-items: center; flex: 0 0 auto }` and `.u-step-list { display: flex }` (`:15-16`). A separator placed inside `.u-step` would render below the header, not between steps.
- Reusable from GAP-063 (`bd4c025`, `41a219c`):
  - the internal `StepperSeparator.vue` (`u-stepper-separator`);
  - the `data-u-step` marker on each step root;
  - the horizontal `.u-stepper-separator` rule (`:19`);
  - the `StepItem` `provide()` precedent;
  - `StepPanel.updateSeparator()`'s index logic (`StepPanel.vue:53-68`).

**Baseline Prime:**

- PrimeVue 4.5.5 `step/Step.vue`: renders `<StepperSeparator v-if="isSeparatorVisible" />` after the header inside the step root (`:9`). `updateState()` runs on mount and update. When the step is inside a `StepList` (`$pcStepList`), it sets `isSeparatorVisible = index !== stepLen - 1` (`:37-50`).
- `@primeuix/styles` 2.0.3 `stepper`:
  - `.p-steplist` is a centred row with `justify-content: space-between`;
  - `.p-step` is a row (`display: flex; align-items: center; flex: 1 1 auto`) with a header-to-separator gap;
  - `.p-step:last-of-type { flex: initial }`;
  - `.p-stepper-separator { flex: 1 1 0; width: 100% }`.

---

## 5. Required Behavior

1. In a horizontal Stepper (steps inside `UStepList`), every step except the last renders a separator after its header, inside the step root. The last step renders none.
2. Separator visibility is re-computed on mount and on update, so adding or removing steps updates which step is last (PrimeVue's `updateState()` timing).
3. `UStepList` provides a context that `UStep` injects (optional), mirroring PrimeVue's `$pcStepList` and GAP-063's `StepItem` `provide()`. Steps outside a `StepList`, including vertical steps inside `UStepItem`, render no horizontal separator.
4. Horizontal layout follows `@primeuix/styles` 2.0.3:
   - steps inside a step list are rows that grow;
   - the last step does not grow;
   - the separator fills the space between headers;
   - the list spaces steps across its width.

   These rules are scoped so the vertical (`.u-step-item`) layout from GAP-063 renders exactly as before.

5. The separator stays internal (not exported), as in GAP-063.

---

## 6. API Requirements

No new public API. The `StepList` context and the separator are internal.

---

## 7. Dependency Relationships

Depends only on GAP-063's shipped pieces (§4). Independent of F1, F2, F4 and F5.

---

## 8. Intentional Divergences That Must Remain Unchanged

- PrimeVue's `isCompleted` state is not added (out of scope).
- Stepper CSS stays hand-written with Ultimate values, not Aura tokens (GAP-064 is deferred).

---

## 9. Acceptance Criteria

| Criterion                                                                                                                          | Traces to      |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| A horizontal Stepper with N steps renders N−1 separators, one after each header except the last                                    | GAP-077        |
| Adding a step after mount moves the "no separator" position to the new last step                                                   | GAP-077        |
| A vertical Stepper (StepItem layout) renders no horizontal separator and its existing GAP-063 tests pass unchanged                 | Non-regression |
| Horizontal steps lay out as a row with separators between headers (real-browser bounding-box check or equivalent layout assertion) | GAP-077        |
| No new visual baseline is required (no Stepper screenshot baselines exist in any framework)                                        | Scope control  |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-077, GAP-063; PrimeVue 4.5.5 `packages/primevue/src/step/Step.vue`; `@primeuix/styles` 2.0.3 `dist/stepper` (in `.vendor-cache/`); Ultimate `packages/vue/src/stepper/` at the scope-lock baseline.

---

## 11. Explicit Out-of-Scope Items

Vertical Stepper changes; `isCompleted`; Angular/React Stepper; Stepper Aura tokens; newer commercial Prime releases (ADR-048).
