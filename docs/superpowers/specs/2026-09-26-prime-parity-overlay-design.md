# Specification — Overlay: Angular Dialog Scroll-Lock, ConfirmDialog Role Semantics (GAP-048–GAP-049)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (`a3d3ddf`, `5cefdb6`, `8ac8d7f`); GAP-048/GAP-049 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 2 — Overlay family), its Findings Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-048/GAP-049.

**Required sequence:** Research → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for two confirmed Overlay-family gaps, both INCLUDE by human decision.

**In scope:** GAP-048 (Angular Dialog scroll-lock), GAP-049 (Angular + Vue ConfirmDialog `role` semantics) — `packages/ng/src/dialog/`, `packages/ng/src/confirm-dialog/`, `packages/vue/src/confirm-dialog/`.

**Out of scope:** Any other Overlay-family component or behavior not named above; React's ConfirmDialog/Dialog (confirmed N/A — see §2.2); any Escape/z-index-stacking mechanism (already resolved, GAP-007).

---

## 2. Human Decisions This Specification Implements

1. **GAP-048 is INCLUDE, Angular only.** Not reopened.
2. **GAP-049 is INCLUDE for Angular + Vue; React is explicitly N/A** — PrimeReact's own real `ConfirmDialog`/`Dialog` also never sets `role="alertdialog"`, confirmed via direct source read during the Overlay Batch 2 triage. React has zero divergence from its own upstream and must not be touched by this Spec's eventual Plan.

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-048 (scroll-lock) | In scope | N/A (React Dialog is unaffected — no scroll-lock gap identified for React) | N/A (not identified as a gap for Vue) |
| GAP-049 (ConfirmDialog role) | In scope | **Explicitly out of scope — confirmed matching its own upstream** | In scope |

---

## 4. Existing Behavior

- **GAP-048:** `packages/ng-core`'s `scrollLockRegistry` already exists and is already proven working via Angular's own `BlockUI` component. `UDialog` does not consume it — background scroll is not locked while a modal `UDialog` is open.
- **GAP-049:** Angular's `UDialog` and Vue's `Dialog.vue` both hardcode `role="dialog"` with no override capability. Real PrimeNG's/PrimeVue's own `ConfirmDialog` uses `role="alertdialog"` for the confirm-dialog use case specifically. React's `UDialog`/`ConfirmDialog` hardcodes the same role real PrimeReact's own does (confirmed identical, no gap).

---

## 5. Required Behavior

### 5.1 GAP-048

**Externally observable requirement:** while a modal `UDialog` is open, the page background must not be scrollable (matching `BlockUI`'s own already-verified scroll-lock behavior). When the dialog closes, background scroll must be restored, exactly as `scrollLockRegistry`'s existing multi-consumer reference-counting behavior already guarantees for `BlockUI`.

### 5.2 GAP-049

**Externally observable requirement:** Angular's and Vue's `ConfirmDialog` must render with `role="alertdialog"` (not `role="dialog"`), matching their own real upstream. The underlying `UDialog`/`Dialog.vue` component's default role for non-confirm usage remains `role="dialog"`, unchanged — only `ConfirmDialog`'s own rendered role changes.

---

## 6. API Requirements

- **GAP-048:** no new public API is required — `scrollLockRegistry` is an existing internal mechanism; `UDialog` consumes it the same way `BlockUI` already does, with no new consumer-facing prop implied by this requirement. If the Implementation Plan determines a new prop is needed (e.g., to allow opting out of scroll-lock), that is a Plan-stage design choice, not mandated here.
- **GAP-049:** either `UDialog`/`Dialog.vue` gains a `role` override capability consumable by `ConfirmDialog` internally, or `ConfirmDialog` renders its own `role="alertdialog"` directly without needing `UDialog`/`Dialog.vue` to expose a new prop. Both are consistent with this Spec's acceptance criteria (§9) — the exact mechanism is an Implementation Plan decision.

---

## 7. Dependency Relationships

None. GAP-048 and GAP-049 are independent of each other and of every other GAP in this audit's scope.

---

## 8. Intentional Divergences That Must Remain Unchanged

- React's `ConfirmDialog`/`Dialog` role behavior — already matches its own real upstream, must not be changed to `role="alertdialog"` merely for cross-framework consistency with Angular/Vue, since that would create a divergence from React's own correct upstream match.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| Background page does not scroll while a modal `UDialog` is open (Angular); scroll restores on close | GAP-048 |
| Angular `ConfirmDialog` renders `role="alertdialog"` | GAP-049 |
| Vue `ConfirmDialog` renders `role="alertdialog"` | GAP-049 |
| React `ConfirmDialog`/`Dialog` role is unchanged (still matches its own real upstream) | GAP-049 (negative/non-regression criterion) |
| `UDialog`'s/`Dialog.vue`'s own default (non-confirm) role remains `role="dialog"`, unchanged | GAP-049 (negative/non-regression criterion) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-048, GAP-049; Overlay Findings Triage (`overlay-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

React's ConfirmDialog/Dialog role behavior (confirmed correct, not touched). Any other Dialog/ConfirmDialog capability not named in §1.
