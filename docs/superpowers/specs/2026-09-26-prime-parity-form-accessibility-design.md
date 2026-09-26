# Specification — Form/Accessibility: SelectButton Roving-Tabindex, FileUpload Progress ARIA, Vue Password Disclosure ARIA (GAP-059–GAP-061)

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 6 — depth-closure pass), its Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-059 through GAP-061.

**Required sequence:** Research → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for three confirmed Form/Accessibility gaps, all INCLUDE by human decision, each with a distinct, non-overlapping framework scope.

**In scope:** GAP-059 (SelectButton roving-tabindex, Angular + React), GAP-060 (FileUpload progress ARIA, all three frameworks), GAP-061 (Vue Password disclosure ARIA, Vue only) — `packages/{ng,react}/src/select-button/`, `packages/{ng,react,vue}/src/file-upload/`, `packages/vue/src/password/`.

**Out of scope:** Vue's SelectButton (confirmed correctly matching its own real upstream's lacking behavior — not a gap); Angular's/React's Password (confirmed their own real upstream never had this disclosure-pattern richness).

---

## 2. Human Decisions This Specification Implements

1. **GAP-059 is INCLUDE for Angular + React only.** Vue is explicitly excluded — real PrimeVue itself lacks the roving-tabindex mechanism, independently confirmed via corroborated extraction during Batch 6 triage, not inferred from PrimeNG/PrimeReact. This is not an oversight to correct; Vue already correctly matches its own upstream.
2. **GAP-060 is INCLUDE for all three frameworks** — one shared root cause (FileUpload's implementation task, identically in all three frameworks, rendered a bare `div` instead of composing the already-existing `UProgressBar`), three framework-local instances of the identical fix.
3. **GAP-061 is INCLUDE for Vue only.** Angular and React are explicitly excluded — independently confirmed that PrimeNG's and PrimeReact's own real Password components also lack this disclosure-pattern ARIA richness; this is genuinely Vue-specific, not a gap for the other two frameworks.

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-059 (SelectButton roving-tabindex) | In scope | In scope | **Explicitly out of scope — confirmed matching its own real upstream** |
| GAP-060 (FileUpload progress ARIA) | In scope | In scope | In scope |
| GAP-061 (Password disclosure ARIA) | **Explicitly out of scope — confirmed no upstream equivalent exists** | **Explicitly out of scope — confirmed no upstream equivalent exists** | In scope |

---

## 4. Existing Behavior

- **GAP-059:** Real PrimeNG/PrimeReact both implement genuine roving-tabindex on SelectButton; Angular's and React's SelectButton ports lack it entirely. Real PrimeVue's own SelectButton also lacks it — Ultimate's Vue port correctly matches.
- **GAP-060:** All three real Prime frameworks compose their own real ProgressBar component for FileUpload's upload-progress display. Ultimate's own `UProgressBar` sibling already has correct ARIA in every framework. FileUpload's own implementation task, identically in all three frameworks, rendered a bare `div` instead of composing `UProgressBar`.
- **GAP-061:** Real PrimeVue's Password overlay-toggle interaction has `aria-haspopup`, `aria-expanded`, `aria-controls`, and two `aria-live` regions. Ultimate's Vue Password lacks all four. Real PrimeNG's and PrimeReact's own Password components also lack this richness — independently confirmed, not inferred.

---

## 5. Required Behavior

### 5.1 GAP-059 — SelectButton roving-tabindex

With focus inside the SelectButton group, only one option is tabbable (`tabindex="0"`) at a time; Arrow keys move focus (and the roving `tabindex`) between options, matching real PrimeNG's/PrimeReact's own mechanism exactly. Angular and React only.

### 5.2 GAP-060 — FileUpload progress ARIA

FileUpload's upload-progress display must compose Ultimate's own existing `UProgressBar` component (not a bare, unstyled `div`), inheriting `UProgressBar`'s own already-correct ARIA attributes (`role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`) automatically. All three frameworks.

### 5.3 GAP-061 — Vue Password disclosure ARIA

Vue Password's overlay-toggle interaction must carry `aria-haspopup`, `aria-expanded` (reflecting the overlay's open/closed state), and `aria-controls` (referencing the overlay's element id), plus two `aria-live` regions matching real PrimeVue's own mechanism, for whatever specific announcements real PrimeVue's own two live regions carry. Vue only.

---

## 6. API Requirements

- **GAP-059:** no new public API — internal keyboard/focus-management behavior only.
- **GAP-060:** no new public API — an internal implementation change (compose `UProgressBar` instead of a bare `div`); FileUpload's own existing progress-related props (if any) are unaffected.
- **GAP-061:** no new public API — internal ARIA-attribute wiring on Password's existing overlay-toggle markup.

---

## 7. Dependency Relationships

None. GAP-059, GAP-060, and GAP-061 are independent of each other and of every other GAP in this audit's scope.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Vue's SelectButton correctly lacking roving-tabindex (matches its own real upstream) — must not be "fixed" to match Angular/React.
- Angular's and React's Password correctly lacking disclosure-pattern ARIA richness (matches their own real upstream) — must not be "fixed" to match Vue.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| SelectButton roving-tabindex with Arrow-key focus movement — Angular, React | GAP-059 |
| Vue SelectButton unchanged (no roving-tabindex added) | GAP-059 (non-regression) |
| FileUpload composes `UProgressBar` for upload progress, inheriting its correct ARIA — all 3 frameworks | GAP-060 |
| Vue Password overlay-toggle carries `aria-haspopup`/`aria-expanded`/`aria-controls` plus two `aria-live` regions matching real PrimeVue | GAP-061 |
| Angular/React Password unchanged (no disclosure-pattern ARIA added) | GAP-061 (non-regression) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-059, GAP-060, GAP-061; Batch 6 Triage (`batch6-triage.md`, GC-B6-01/02/03); Consolidated Pass 1 Report §3/§6; Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

Vue SelectButton; Angular/React Password; any other Form-family or Batch-6 finding not named in §1 (e.g. React DynamicDialog/OverlayBadge, InputGroup/IftaLabel-React, InputChips/MultiStateCheckbox/TriStateCheckbox/Mention — all confirmed "Prime capability absent," not INCLUDE, not touched here).
