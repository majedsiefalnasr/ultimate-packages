# Specification — Existing Commitments: Angular Tooltip Visibility, UMenu Popup + SplitButton, React/Vue tsup Subpath Extension (GAP-066–GAP-068)

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit's Final Consolidated Decision Ledger and Final Scope Ledger (both classifying four items as COMPLETE EXISTING COMMITMENT), the pre-Spec tracking reconciliation (this session), and GAP-066/GAP-067/GAP-068.

**Required sequence:** Research → Architecture Discussion → Decision (COMPLETE EXISTING COMMITMENT) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for completing three of the four COMPLETE EXISTING COMMITMENT items from the Final Scope Ledger. The fourth item (Angular ng-packagr/exports) is explicitly excluded from this Spec's own scope — see §2.1 for the mapping discrepancy this stage discloses rather than resolves.

**In scope:** GAP-066 (Angular Tooltip visibility), GAP-067 (Angular `UMenu` popup + `USplitButton` workaround), GAP-068 (React/Vue tsup per-component subpath exports) — `packages/ng/src/tooltip/`, `packages/ng/src/menu/`, `packages/ng/src/split-button/`, `packages/react/tsup.config.ts`, `packages/vue/tsup.config.ts`.

**Explicitly not in scope for this Spec, disclosed rather than silently included or excluded without comment:** the Angular ng-packagr/exports commitment. **Mapping discrepancy:** the Final Scope Ledger's own four-item "COMPLETE EXISTING COMMITMENT" list names this as its own distinct item, but its existing tracking artifacts are **GAP-009 and GAP-023**, both already marked **RESOLVED** in `docs/architecture/BLUEPRINT_GAPS.md`, and both explicitly, mandatorily preserved untouched by this Spec-stage's own governing instructions ("Do not reinterpret or rewrite the historical scope of GAP-009 / GAP-023... use them as existing authoritative context where relevant"). GAP-009's own text already discloses that its RESOLVED status covers only the original proof-set components (9 of them, as of the Angular Form Foundation workstream's own `input-number` addition) — extending that same packaging convention to the ~90+ components built since is real, additional work the Final Scope Ledger's own "complete this commitment" language implies, but GAP-009/023 never claimed to cover, and this Spec-stage's own constraints prohibit reinterpreting or rewriting either entry to say otherwise. **This specification neither writes a new Spec section for that extension work nor silently folds it into GAP-009/023's own existing text.** It is named here as a disclosed gap in the current Spec-stage's own coverage, requiring its own human decision on whether a new GAP should be registered for "extend Angular's per-component export convention to all currently-shipped components" (distinct from GAP-009/023's own already-settled, narrower, RESOLVED scope) — mirroring the same kind of registry gap already surfaced in `2026-09-26-prime-parity-navigation-design.md` §12 for Angular Dock `routerLink`.

---

## 2. Human Decisions This Specification Implements

1. **GAP-066, GAP-067, and GAP-068 are each COMPLETE EXISTING COMMITMENT** — meaning each represents unfinished work against a component/mechanism already committed to and shipped, not newly discovered scope requiring a fresh architectural decision.
2. **TS2729 (the `autocomplete.ts`/`select.ts` class-field-declaration-order defect) is explicitly not a separate scope item** — per the Final Scope Ledger's own explicit instruction, it is "covered by the ng-packagr commitment" as a prerequisite execution step. Since the ng-packagr commitment itself is out of this Spec's own scope (§1), TS2729 is correspondingly also out of this Spec's own scope — it is not silently absorbed into GAP-066/067/068's own requirements, none of which it is actually related to.
3. **GAP-009/GAP-023 remain RESOLVED, untouched, their historical scope not reinterpreted or rewritten** — per this Spec-stage's own mandatory constraint, honored throughout this document.

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-066 (Tooltip visibility) | In scope | N/A (different, already-safe mechanism — off-screen positioning, not `display: none`) | N/A (already fixed, GAP-039) |
| GAP-067 (UMenu popup + SplitButton) | In scope | N/A (already has working popup mechanism) | N/A (already has working popup mechanism) |
| GAP-068 (tsup subpath exports) | N/A (uses a structurally different mechanism, `ng-packagr`, tracked by GAP-009/023, not this Spec) | In scope | In scope |

---

## 4. Existing Behavior

- **GAP-066:** Angular's `UTooltip` has the same effective visibility defect GAP-039 already fixed for Vue — confirmed by Angular's own existing e2e test (`packages/ng/e2e/tooltip.spec.ts`, `expect(computedDisplay).toBe("none")`), which was already in the repository, undisclosed by GAP-039's own original text, when GAP-039 was first written. GAP-039's own resolved entry explicitly discloses this and explicitly disclaims tracking it: *"Angular's gap remains a separately disclosed, not-yet-registered fact; it is not tracked by this entry."*
- **GAP-067:** `UMenu`'s own doc comment (`packages/ng/src/menu/menu.ts:38-44`) explicitly discloses that its `popup` input is currently inert, "awaiting a future task" to extend its input/output surface for the popup overlay. `USplitButton` currently implements its own hand-rolled overlay state as a workaround rather than delegating to `UMenu`'s popup mode.
- **GAP-068:** `tsup.config.ts`'s `entry` map (React and Vue, independently) is stale relative to the components actually shipped since it was last updated — confirmed empirically via a real build during the Overlay Findings Triage: the main package barrel is fully unaffected (esbuild bundles transitively), but per-component subpath exports fail for components added after the map was last updated.

---

## 5. Required Behavior

### 5.1 GAP-066 — Angular Tooltip visibility

Angular's `UTooltip` must apply the same companion inline `display` style GAP-039 already applied to Vue's `showTooltip()`-equivalent, so that the tooltip panel is actually visible in a real browser once shown — matching real PrimeNG's own `create()` mechanism (the same one GAP-039 verified real PrimeVue's own `create()` also uses). `packages/ng/e2e/tooltip.spec.ts`'s existing assertion (`expect(computedDisplay).toBe("none")`, currently asserting the known failure) must be converted to assert correct visibility, mirroring GAP-039's own conversion of Vue's equivalent test.

### 5.2 GAP-067 — Angular UMenu popup + SplitButton

`UMenu`'s popup-overlay mechanism must be built out — its `popup` input's own currently-inert behavior must become functional, rendering a real popup overlay (matching React's/Vue's own already-working Portal+escape-registry+z-index mechanism) when `popup` is enabled. Once functional, `USplitButton` must be simplified to delegate to `UMenu`'s own popup mode rather than maintaining its own separate, hand-rolled overlay state — matching React's/Vue's own already-working shape, where their respective SplitButton equivalents delegate to their own Menu's popup mechanism.

### 5.3 GAP-068 — React/Vue tsup subpath exports

`tsup.config.ts`'s `entry` map, in both `packages/react/` and `packages/vue/`, must be extended to include every currently-shipped component, restoring working per-component subpath exports (`@ultimate/{react,vue}/<component>`) for all of them — matching each framework's own already-correct convention for its original proof-set components. The main package barrel's own already-working behavior must remain unaffected.

---

## 6. API Requirements

- **GAP-066:** no new public API — an internal styling fix (one additional inline-style property), exactly mirroring GAP-039's own fix mechanism.
- **GAP-067:** `UMenu`'s own already-declared `popup` input's *behavior* becomes functional; no new prop is introduced beyond what `UMenu`'s own doc comment already names as pending ("extend this component's input/output surface for the popup overlay, submenu nesting, and the additional key handlers" — the exact additional inputs/outputs needed are an Implementation Plan design question, not fixed here). `USplitButton`'s own public API is unaffected by its internal delegation-mechanism simplification.
- **GAP-068:** no public API change — this is a build/packaging configuration fix; the same components already accessible via the main barrel become also accessible via their own subpath, matching their own already-existing barrel-level public contract.

---

## 7. Dependency Relationships

None among GAP-066, GAP-067, and GAP-068 — each is independent. **TS2729 is not a dependency of any of these three** (§2.2) — it relates only to the ng-packagr commitment, which is outside this Spec's own scope (§1).

---

## 8. Intentional Divergences That Must Remain Unchanged

- React's and Vue's own Tooltip mechanisms — already correct (React: off-screen positioning, not `display: none`; Vue: already fixed by GAP-039) — not touched by GAP-066.
- React's and Vue's own already-working Menu/SplitButton popup mechanisms — the template for GAP-067's fix, not themselves modified.
- Angular's own structurally different per-component export mechanism (`ng-packagr` secondary entry points, GAP-009/023) — not touched by GAP-068, which concerns only React/Vue's `tsup`-based mechanism.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| Angular `UTooltip` panel is visible in a real browser once shown (computed `display` is not `"none"`); `packages/ng/e2e/tooltip.spec.ts` asserts correct visibility | GAP-066 |
| `UMenu`'s `popup` mode renders a real, functional popup overlay | GAP-067 |
| `USplitButton` delegates to `UMenu`'s own popup mechanism rather than its own hand-rolled overlay state | GAP-067 |
| React per-component subpath exports (`@ultimate/react/<component>`) work for every currently-shipped component | GAP-068 |
| Vue per-component subpath exports (`@ultimate/vue/<component>`) work for every currently-shipped component | GAP-068 |
| React/Vue main barrel imports remain unaffected | GAP-068 (non-regression) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-039 (Vue's own resolved fix, the direct template for GAP-066), GAP-066, GAP-067, GAP-068, GAP-009, GAP-023 (referenced as existing authoritative context, not rewritten); `packages/ng/src/menu/menu.ts:38-44`; `packages/ng/e2e/tooltip.spec.ts`; `packages/{react,vue}/tsup.config.ts`; Overlay Findings Triage (`overlay-findings-triage.md`); pre-Spec tracking reconciliation (this session); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

The Angular ng-packagr/exports commitment (GAP-009/GAP-023, untouched, historical scope not reinterpreted — see §1's disclosed mapping discrepancy). TS2729 (§2.2, not related to any GAP in this Spec's scope).
