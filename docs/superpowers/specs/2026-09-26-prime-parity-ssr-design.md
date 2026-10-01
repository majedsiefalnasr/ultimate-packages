# Specification — SSR: Post-Track-E Angular Unguarded `window`/`document` Access (GAP-065)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (2026-10-01); implementation-stage corrections in §12; GAP-065 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit's residual-Unverified verification "Post-Track-E SSR Status" (`ssr-post-track-e-verification.md`), the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-065.

**Required sequence:** Research → Verification (residual-Unverified closure) → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for Angular's confirmed SSR-unsafe `window`/`document` access, now INCLUDE by human decision, while explicitly preserving the evidence distinction between the two fully confirmed components and the eight not-yet-individually-traced ones.

**In scope:** GAP-065 — `packages/ng/src/{scroll-panel,context-menu,breadcrumb,color-picker,confirm-popup,knob,popover,slider,splitter,style-class}/`.

**Out of scope, entirely, for this specification and its eventual Implementation Plan:** React's and Vue's own equivalent-risk-class SSR behavior — Parity Confirmed by direct evidence (React's `useEffect`, Vue's `mounted()` never execute server-side, by each framework's own design), a separate row in the Final Scope Ledger, not touched here. Track E's original 8-component proof set (Button/Checkbox/Dialog/Menu/Paginator/Scroller/Table/Tooltip) — already verified safe by Track E itself, not reopened (except `Tooltip`, whose _visibility_ defect — unrelated to SSR-safety — is tracked separately by GAP-066, not this Spec).

---

## 2. Human Decisions This Specification Implements

1. **GAP-065 is INCLUDE, Angular only.**
2. **`ScrollPanel` and `ContextMenu` are fully confirmed** — both hooks (`ngAfterViewInit` for `ScrollPanel`, `ngOnInit` for `ContextMenu`) genuinely execute during Angular Universal SSR (Angular's own `ngOnInit`/`ngAfterViewInit` genuinely run server-side, by Angular's own design) and unconditionally call `window`/`document` APIs with zero `isPlatformBrowser` guard — a real, reproducible SSR-crash defect, individually lifecycle-traced during the residual verification.
3. **The remaining 8 components (`Breadcrumb`, `ColorPicker`, `ConfirmPopup`, `Knob`, `Popover`, `Slider`, `Splitter`, `StyleClass`) share the identical missing-guard pattern but were not each individually lifecycle-traced to their own exact triggering hook.** Per the human decision's own explicit condition: **the remaining identified Angular components require the appropriate final lifecycle verification before implementation** — this specification does not authorize applying the fix to these 8 with the same unconditional confidence as `ScrollPanel`/`ContextMenu` until that verification step completes.
4. **React/Vue require no equivalent fix** — Parity Confirmed, kept as a separate row/finding, not touched by this Spec.

---

## 3. Framework Applicability

Angular only. React and Vue are explicitly out of scope (Parity Confirmed, per §2.4).

---

## 4. Existing Behavior

`ScrollPanel`'s `ngAfterViewInit` and `ContextMenu`'s `ngOnInit` unconditionally call `window`/`document` APIs with zero `isPlatformBrowser` guard, confirmed via full lifecycle tracing during the Post-Track-E SSR residual verification — both hooks genuinely execute server-side under Angular Universal SSR, producing a real `ReferenceError` crash. `Breadcrumb`, `ColorPicker`, `ConfirmPopup`, `Knob`, `Popover`, `Slider`, `Splitter`, and `StyleClass` share the identical missing-guard _pattern_ (unconditional `window`/`document` access with no `isPlatformBrowser` check) but were not individually traced to confirm which lifecycle hook triggers the access or whether that hook genuinely executes server-side for each specific component. Track E's own Plan (`docs/superpowers/plans/2026-09-11-phase-10-track-e-ssr-hydration-implementation.md`, lines 12/570) explicitly, fixedly scoped SSR verification to an 8-component proof set that never included any of these 10 components. None of the 10 flagged components is currently exercised by the existing SSR test harness.

---

## 5. Required Behavior

**Externally observable requirement:** none of the 10 named Angular components must throw a `ReferenceError` (or otherwise crash) when server-rendered under Angular Universal SSR. Each component's `window`/`document` access must be guarded by `isPlatformBrowser(this.platformId)` (via `UBaseComponent`'s existing `inject(PLATFORM_ID)`), matching the already-proven pattern used correctly by the Track E proof-set's own `Tooltip`.

**Two-tier acceptance, preserving the evidence distinction (§2.2/§2.3):**

1. **`ScrollPanel` and `ContextMenu`:** may proceed directly to fix implementation once this Spec is approved and a Plan exists — their own triggering hooks are already fully confirmed.
2. **The remaining 8 components:** each must first undergo the same individual lifecycle-tracing already completed for `ScrollPanel`/`ContextMenu` (confirming which specific lifecycle hook triggers the unguarded access, and confirming that hook genuinely executes server-side for that specific component) **before** the guard fix is applied to it. This tracing step is a prerequisite task within the eventual Implementation Plan, not a separate Spec — the fix mechanism itself is already fully specified (§5's own guard-pattern requirement); only the individual confirmation-of-trigger-point step remains outstanding per component.

---

## 6. API Requirements

No new public API — this is an internal implementation-safety fix (adding an `isPlatformBrowser` guard around existing `window`/`document` calls). No prop, event, or public method signature changes.

---

## 7. Dependency Relationships

None upstream. **Internal sequencing within this gap's own scope:** the 8 not-yet-traced components' own fix application is gated on their own individual lifecycle-tracing completing first (§5, tier 2) — this is a prerequisite step within GAP-065's own resolution, not a dependency on any other GAP.

---

## 8. Intentional Divergences That Must Remain Unchanged

- React's `useEffect`-based and Vue's `mounted()`-based equivalents — both Parity Confirmed, correct-by-design (client-only execution contexts, never running server-side), not touched by this Spec.
- Track E's original 8-component proof set's own already-verified-safe SSR behavior — unchanged, not reopened.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                                                                                                                                           | Traces to                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `ScrollPanel`'s `ngAfterViewInit` window/document access is guarded by `isPlatformBrowser`; no SSR crash                                                                                                                                            | GAP-065 (tier 1, fully confirmed)   |
| `ContextMenu`'s `ngOnInit` window/document access is guarded by `isPlatformBrowser`; no SSR crash                                                                                                                                                   | GAP-065 (tier 1, fully confirmed)   |
| Each of the 8 remaining components (`Breadcrumb`, `ColorPicker`, `ConfirmPopup`, `Knob`, `Popover`, `Slider`, `Splitter`, `StyleClass`) has its own triggering hook individually lifecycle-traced and confirmed before its own guard fix is applied | GAP-065 (tier 2, prerequisite step) |
| Each of the 8 remaining components' confirmed window/document access is guarded by `isPlatformBrowser`; no SSR crash, after its own tracing step completes                                                                                          | GAP-065 (tier 2, fix)               |
| React's and Vue's own equivalent components are unaffected by any work under this Spec                                                                                                                                                              | GAP-065 (non-regression, per §2.4)  |

(Note 2026-10-01: rows 3-4 are satisfied per §12 — the tier-2 tracing found none of the 8 reaches a browser global from a server-executed path, so they received spy-based verification tests instead of guards.)

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-065; Post-Track-E SSR residual verification (`ssr-post-track-e-verification.md`); `docs/superpowers/plans/2026-09-11-phase-10-track-e-ssr-hydration-implementation.md` lines 12/570; `packages/ng-core/src/basecomponent/base-component.ts` (existing `inject(PLATFORM_ID)` mechanism); `packages/ng/src/tooltip/tooltip.ts` (existing correct-pattern reference); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

React/Vue SSR behavior (Parity Confirmed). Track E's original 8-component proof set (already verified). Angular Tooltip's own _visibility_ defect (unrelated to SSR-safety, tracked separately by GAP-066).

---

## 12. Implementation-Stage Corrections (2026-10-01)

- **Verification method.** The Plan's test sketches mounted each component under a server `PLATFORM_ID` and asserted "does not throw". Unit tests run in jsdom, where `window` and `document` always exist, so those assertions cannot fail and would not evidence §5/§9. User decision: every task uses spy-based unit tests — under a server `PLATFORM_ID`, spy on the browser-global APIs the component touches and assert zero calls through mount, change detection and destroy. The two fixes' tests must fail before the fix. The Playwright SSR harness (`apps/playground-angular`, `ng-ssr-chromium`) is not changed.
- **Tier-2 tracing.** The Plan-stage investigation (Plan's evidence table, re-checked at HEAD 2026-10-01) is the §5 tier-2 lifecycle tracing for the 8 remaining components: none reaches `window`/`document` from a server-executed lifecycle hook, so per the Plan's Global Constraints they receive verification tests, not guards. Their destroy paths also only remove listeners that were registered.
