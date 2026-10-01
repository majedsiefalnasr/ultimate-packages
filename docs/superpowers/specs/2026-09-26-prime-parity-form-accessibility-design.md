# Specification — Form/Accessibility: SelectButton Roving-Tabindex, FileUpload Progress ARIA, Vue Password Disclosure ARIA (GAP-059–GAP-061)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (2026-09-30); implementation-stage corrections in §12 (GAP-059 React only); GAP-059–GAP-061 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 6 — depth-closure pass), its Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-059 through GAP-061.

**Required sequence:** Research → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for three confirmed Form/Accessibility gaps, all INCLUDE by human decision, each with a distinct, non-overlapping framework scope.

**In scope:** GAP-059 (SelectButton roving-tabindex, React — Angular removed 2026-09-30, see §12), GAP-060 (FileUpload progress ARIA, all three frameworks), GAP-061 (Vue Password disclosure ARIA, Vue only) — `packages/react/src/select-button/`, `packages/{ng,react,vue}/src/file-upload/`, `packages/vue/src/password/`.

**Out of scope:** Vue's and Angular's SelectButton (both confirmed correctly matching their own real upstream's lacking behavior — not a gap; Angular per §12); Angular's/React's Password (confirmed their own real upstream never had this disclosure-pattern richness).

---

## 2. Human Decisions This Specification Implements

1. **GAP-059 is INCLUDE for React only** (originally Angular + React; Angular removed by user decision 2026-09-30 after real PrimeNG was found to lack the mechanism — see §12). Vue is also explicitly excluded — real PrimeVue itself lacks the roving-tabindex mechanism, independently confirmed via corroborated extraction during Batch 6 triage, not inferred from PrimeNG/PrimeReact. This is not an oversight to correct; Vue already correctly matches its own upstream.
2. **GAP-060 is INCLUDE for all three frameworks** — one shared root cause (FileUpload's implementation task, identically in all three frameworks, rendered a bare `div` instead of composing the already-existing `UProgressBar`), three framework-local instances of the identical fix.
3. **GAP-061 is INCLUDE for Vue only.** Angular and React are explicitly excluded — independently confirmed that PrimeNG's and PrimeReact's own real Password components also lack this disclosure-pattern ARIA richness; this is genuinely Vue-specific, not a gap for the other two frameworks.

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-059 (SelectButton roving-tabindex) | **Explicitly out of scope — confirmed matching its own real upstream (§12)** | In scope | **Explicitly out of scope — confirmed matching its own real upstream** |
| GAP-060 (FileUpload progress ARIA) | In scope | In scope | In scope |
| GAP-061 (Password disclosure ARIA) | **Explicitly out of scope — confirmed no upstream equivalent exists** | **Explicitly out of scope — confirmed no upstream equivalent exists** | In scope |

---

## 4. Existing Behavior

- **GAP-059:** Real PrimeReact implements genuine roving-tabindex on SelectButton; React's SelectButton port lacks it entirely. Real PrimeNG 21.1.9 does not (each option is a separately tabbable `p-togglebutton` handling only Enter/Space), and Ultimate's Angular port already matches it. **(Corrected 2026-09-30 — see §12; this line previously said PrimeNG also implements roving-tabindex.)** Real PrimeVue's own SelectButton also lacks it — Ultimate's Vue port correctly matches.
- **GAP-060:** All three real Prime frameworks compose their own real ProgressBar component for FileUpload's upload-progress display. Ultimate's own `UProgressBar` sibling already has correct ARIA in every framework. FileUpload's own implementation task, identically in all three frameworks, rendered a bare `div` instead of composing `UProgressBar`.
- **GAP-061:** Real PrimeVue's Password input has `aria-haspopup`, `aria-expanded` and `aria-controls` describing its strength-meter overlay, plus two `aria-live` regions (a hidden strength-text span and the overlay itself). **(Corrected 2026-09-30 — see §12; this line previously attributed the ARIA to the "overlay-toggle".)** Ultimate's Vue Password lacks all four. Real PrimeNG's and PrimeReact's own Password components also lack this richness — independently confirmed, not inferred.

---

## 5. Required Behavior

### 5.1 GAP-059 — SelectButton roving-tabindex

Only one option is tabbable (`tabindex="0"`) at a time, initially the first enabled option (PrimeReact: the first option); ArrowRight/ArrowDown move focus (and the roving `tabindex`) to the next option and ArrowLeft/ArrowUp to the previous, wrapping at both ends; arrows move focus only, Space selects — matching real PrimeReact 10.9.9 (`SelectButton.js:16,101`, `SelectButtonItem.js:41-94`). Two Ultimate differences: when no option is tabbable (component `disabled`), arrow keys are a no-op instead of throwing; and disabled options are skipped (PrimeReact does not skip them), because `USelectButton` composes `UToggleButton`, whose native-disabled input cannot receive focus. `UToggleButton` gains one optional `tabIndex` prop. React only. **(Corrected 2026-09-30 — see §12.)**

### 5.2 GAP-060 — FileUpload progress ARIA

FileUpload's upload-progress display must compose Ultimate's own existing `UProgressBar` component (not a bare, unstyled `div`), inheriting `UProgressBar`'s own already-correct ARIA attributes (`role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`) automatically. All three frameworks.

### 5.3 GAP-061 — Vue Password disclosure ARIA

Matching real PrimeVue 4.5.5 (`Password.vue:13-15,44-45,57-58`): Vue Password's **input** must carry `aria-haspopup` (= `feedback`), `aria-expanded` (= strength overlay open) and `aria-controls` (= the overlay's element id, only while open). The strength overlay gets that id plus `role="dialog"` and `aria-live="polite"`. A visually hidden `aria-live="polite"` span renders the current strength text (`infoText`), always present. The mask/unmask toggle icons are unchanged. Vue only. **(Corrected 2026-09-30 — see §12.)**

---

## 6. API Requirements

- **GAP-059:** no new `USelectButton` API — internal keyboard/focus-management behavior. `UToggleButton` gains one optional `tabIndex` prop (added 2026-09-30 by user decision, see §12), passed to its input.
- **GAP-060:** no new public API — an internal implementation change (compose `UProgressBar` instead of a bare `div`); FileUpload's own existing progress-related props (if any) are unaffected.
- **GAP-061:** no new public API — internal ARIA-attribute wiring on Password's existing input and strength-overlay markup.

---

## 7. Dependency Relationships

None. GAP-059, GAP-060, and GAP-061 are independent of each other and of every other GAP in this audit's scope.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Vue's and Angular's SelectButton correctly lacking roving-tabindex (each matches its own real upstream) — must not be "fixed" to match React.
- Angular's and React's Password correctly lacking disclosure-pattern ARIA richness (matches their own real upstream) — must not be "fixed" to match Vue.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| SelectButton roving-tabindex with Arrow-key focus movement matching PrimeReact — React | GAP-059 |
| Vue and Angular SelectButton unchanged (no roving-tabindex added) | GAP-059 (non-regression) |
| FileUpload composes `UProgressBar` for upload progress, inheriting its correct ARIA — all 3 frameworks | GAP-060 |
| Vue Password input carries `aria-haspopup`/`aria-expanded`/`aria-controls` for the strength overlay, plus two `aria-live` regions, matching real PrimeVue | GAP-061 |
| Angular/React Password unchanged (no disclosure-pattern ARIA added) | GAP-061 (non-regression) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-059, GAP-060, GAP-061; Batch 6 Triage (`batch6-triage.md`, GC-B6-01/02/03); Consolidated Pass 1 Report §3/§6; Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

Vue and Angular SelectButton; Angular/React Password; any other Form-family or Batch-6 finding not named in §1 (e.g. React DynamicDialog/OverlayBadge, InputGroup/IftaLabel-React, InputChips/MultiStateCheckbox/TriStateCheckbox/Mention — all confirmed "Prime capability absent," not INCLUDE, not touched here).

---

## 12. Implementation-Stage Corrections (2026-09-30)

Source checks at the start of implementation (pinned `.vendor-cache/` tarballs) found two premise errors; the user ruled on each before any code was written.

- **GAP-059 Angular removed.** Real PrimeNG 21.1.9 SelectButton has no roving-tabindex: each option is a `p-togglebutton` with tabindex 0 (−1 when disabled) handling only Enter/Space (`togglebutton.ts:54,87-100`); `SelectButton.changeTabIndexes` (`selectbutton.ts:267`) is never called outside its own spec. Ultimate's Angular port already matches. User decision: reclassify Angular as matching upstream, like Vue; GAP-059 is React-only.
- **GAP-059 React semantics.** The Plan asked for skipping disabled options and an all-disabled no-op; real PrimeReact wraps without skipping disabled options and would throw when no option is tabbable. User decision: match PrimeReact exactly (§5.1), plus a guard so arrow keys are a no-op when no option is tabbable.
- **GAP-061 ARIA placement.** The original text put the disclosure ARIA on the "overlay-toggle", which the Plan read as the mask toggle with `aria-expanded` tracking the mask state. Real PrimeVue 4.5.5 puts it on the input, describing the strength-meter overlay (`Password.vue:13-15`), with live regions at `:44-45` and `:57-58`. User decision: follow real PrimeVue (§5.3).
- **GAP-059 React: composition constraint.** A pre-dispatch check of Task 2 found Ultimate's `USelectButton` composes `UToggleButton`, which renders a native `<input type="checkbox">` (disabled natively) and exposes no `tabIndex` prop, while PrimeReact renders its own focusable item per option. User decision: add one optional `tabIndex` prop to `UToggleButton`, handle arrow keys on the `role="group"` container, and skip disabled options since they cannot be focused (§5.1).
- **GAP-061 hidden live span.** PrimeVue hides its strength-text live span with base CSS `.p-hidden-accessible`; Ultimate defines no CSS for `p-hidden-accessible`/`u-hidden-accessible` anywhere. User decision: hide the span with a Password-scoped visually-hidden rule in `password-style.ts`; the pre-existing unstyled usages elsewhere are registered as GAP-074, outside this Spec.
- **GAP-060 bar height.** Composing `UProgressBar` inherited its standalone 1.5rem height; real Prime scopes the bar to 0.25rem inside FileUpload. User decision: Tasks 3-5 also add a FileUpload-scoped rule in each `file-upload-style.ts` and delete the dead bare-div CSS; `UProgressBar` styles unchanged.
- **GAP-060 premise unchanged.** All three real Prime FileUploads compose ProgressBar (PrimeNG `fileupload.ts:240`, PrimeReact `FileUpload.js:545`, PrimeVue `FileUpload.vue:43`); the premise holds.
