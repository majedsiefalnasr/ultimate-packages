# Specification — Display: Galleria Keyboard/Escape/Region, Carousel `aria-live` (GAP-050–GAP-051)

**Status:** Implemented on `feature/prime-parity-audit-gaps`; Plan corrections `4d48825`, `a087cd7`, `1d492a7` (thumbnail keyboard activation widened to all 3 frameworks); GAP-050/GAP-051 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 5 — Panel/Layout/Display family), its Findings Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-050/GAP-051.

**Required sequence:** Research → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for two confirmed Display-family accessibility gaps, both INCLUDE by human decision.

**In scope:** GAP-050 (Galleria keyboard navigation, local Escape handler, `role="region"`), GAP-051 (Carousel `aria-live` on autoplay content) — `packages/{ng,react,vue}/src/galleria/`, `packages/{ng,react,vue}/src/carousel/`.

**Out of scope:** Any other Display-family component; Galleria's fullscreen-overlay redesign itself (already shipped, not reopened — only its missing local Escape handler, made necessary by that redesign, is in scope); Carousel's autoplay mechanism itself (unchanged — only the missing ARIA announcement is in scope).

---

## 2. Human Decisions This Specification Implements

1. **GAP-050 is INCLUDE, all three frameworks.** Three sub-facts (keyboard nav, local Escape handler, `role="region"`) were merged into one finding by the original Batch 5 triage's own consolidation decision — preserved as one Spec section, one GAP, not split.
2. **GAP-051 is INCLUDE, all three frameworks, confirmed independent of GAP-050** — same omission _pattern_ (missing accessibility affordance), no shared mechanism, per the Batch 5 triage's explicit non-merge decision. Kept as a separate acceptance-criteria set within this Spec, not merged into GAP-050's own criteria.

---

## 3. Framework Applicability

| Gap                | Angular  | React    | Vue      |
| ------------------ | -------- | -------- | -------- |
| GAP-050 (Galleria) | In scope | In scope | In scope |
| GAP-051 (Carousel) | In scope | In scope | In scope |

---

## 4. Existing Behavior

- **GAP-050:** Real Prime has full ArrowLeft/Right/Home/End/Enter/Space keyboard support in all three frameworks; Ultimate has none. Ultimate's fullscreen mode is a redesigned (non-native) overlay — unlike real Prime's native-fullscreen approach, there is no browser-provided Escape-to-exit behavior, so a local Escape handler is genuinely needed (not merely a nice-to-have). Real PrimeNG's Galleria root has `role="region"`; Ultimate's root does not (confirmed via dedicated root-element extraction during Batch 5 triage, correcting an earlier mischaracterization as documentation drift).
- **GAP-051:** Real PrimeNG conditionally sets `aria-live` on the content wrapper during autoplay; Ultimate has none in any framework (confirmed via corroborated binary-safe grep during Batch 5 triage).

---

## 5. Required Behavior

### 5.1 GAP-050

**Externally observable requirements:**

1. **Keyboard navigation:** with focus on the Galleria, ArrowLeft/ArrowRight must navigate to the previous/next image, Home/End must jump to the first/last image, and Enter/Space must activate the focused thumbnail (if thumbnails are present), matching real Prime's own key set.
2. **Local Escape handler:** while Ultimate's redesigned fullscreen overlay is open, pressing Escape must close it — this is a component-owned handler (not reliant on native browser fullscreen-Escape behavior, since Ultimate's overlay is not native fullscreen).
3. **`role="region"`:** the Galleria's root element must carry `role="region"`, matching real PrimeNG.

### 5.2 GAP-051

**Externally observable requirement:** while Carousel's autoplay is active, the content wrapper must carry an `aria-live` attribute (politeness level matching real PrimeNG's own conditional value) so that assistive technology announces autoplay-driven content changes. When autoplay is not active (or not configured), the `aria-live` attribute's presence/absence must match real PrimeNG's own conditional behavior — this specification does not mandate an always-on `aria-live`, only that Ultimate's conditional behavior matches real Prime's own conditional behavior.

---

## 6. API Requirements

No new public props are required for either gap — both are internal-behavior/markup additions (keyboard event handlers, an Escape handler, static/conditional ARIA attributes) with no externally observable API surface change beyond the behaviors in §5.

---

## 7. Dependency Relationships

None. GAP-050 and GAP-051 are confirmed independent of each other (§2.2) and of every other GAP in this audit's scope.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Ultimate's Galleria fullscreen mode remains its own redesigned (non-native) overlay implementation — this specification's local-Escape-handler requirement is a _consequence_ of that existing, unreopened design choice, not a reversion to native fullscreen.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                        | Traces to |
| -------------------------------------------------------------------------------------------------------------------------------- | --------- |
| ArrowLeft/Right navigate prev/next image; Home/End jump to first/last; Enter/Space activate focused thumbnail — all 3 frameworks | GAP-050   |
| Escape closes Ultimate's redesigned fullscreen overlay — all 3 frameworks                                                        | GAP-050   |
| Galleria root element carries `role="region"` — all 3 frameworks                                                                 | GAP-050   |
| Carousel content wrapper carries `aria-live` during autoplay, matching real Prime's own conditional value — all 3 frameworks     | GAP-051   |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-050, GAP-051; Panel Findings Triage (`panel-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-P1, GC-P2); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

Any other Galleria/Carousel capability not named in §1. Galleria's fullscreen-overlay redesign itself (unchanged, not reopened).
