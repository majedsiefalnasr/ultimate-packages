# Specification — Existing Commitments: Angular Tooltip Visibility, UMenu Popup + SplitButton, React/Vue tsup Subpath Extension, Angular ng-packagr Extension (GAP-066–GAP-068, GAP-070)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (2026-10-01); implementation-stage corrections in §13. GAP-066–GAP-068 and GAP-070 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26 (updated 2026-09-26 — GAP-070 integrated following its registration during the Scope Reconciliation stage)
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit's Final Consolidated Decision Ledger and Final Scope Ledger (classifying four items as COMPLETE EXISTING COMMITMENT), the pre-Spec tracking reconciliation (this session), GAP-066/GAP-067/GAP-068, the Scope Reconciliation Report (this session), and GAP-070.

**Required sequence:** Research → Architecture Discussion → Decision (COMPLETE EXISTING COMMITMENT) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for completing all four COMPLETE EXISTING COMMITMENT items from the Final Scope Ledger, while strictly preserving the distinction between GAP-009/GAP-023's own already-settled, narrower, RESOLVED historical scope and GAP-070's own newly-registered extension work.

**In scope:** GAP-066 (Angular Tooltip visibility), GAP-067 (Angular `UMenu` popup + `USplitButton` workaround), GAP-068 (React/Vue tsup per-component subpath exports), GAP-070 (Angular per-component `ng-packagr` secondary entry points extended to components shipped after the original proof set) — `packages/ng/src/tooltip/`, `packages/ng/src/menu/`, `packages/ng/src/split-button/`, `packages/react/tsup.config.ts`, `packages/vue/tsup.config.ts`, and (for GAP-070 only) every Angular component directory under `packages/ng/src/` shipped after the original 9-component proof set named in GAP-009's own text.

**Explicitly not in scope for this Spec, and not reopened by GAP-070's own registration:** GAP-009 and GAP-023 themselves, both RESOLVED, both preserved byte-for-byte, their own historical scope neither reinterpreted nor rewritten. GAP-070 is a distinct, newly-registered GAP covering only the extension work GAP-009/023 never claimed — see §2.3 for the exact boundary.

---

## 2. Human Decisions This Specification Implements

1. **GAP-066, GAP-067, GAP-068, and GAP-070 are each COMPLETE EXISTING COMMITMENT** — meaning each represents unfinished work against a component/mechanism already committed to and shipped, not newly discovered scope requiring a fresh architectural decision.
2. **TS2729 (the `autocomplete.ts`/`select.ts` class-field-declaration-order defect) is explicitly not a separate scope item** — per the Final Scope Ledger's own explicit instruction, it is "covered by the ng-packagr commitment" as a prerequisite execution step. It is not silently absorbed into GAP-066/067/068's own requirements (none of which it is actually related to), and it is not part of GAP-070's own scope either — GAP-070 concerns extending the secondary-entry-point convention to newer components, not fixing a build-blocking defect in already-covered components.
3. **GAP-009/GAP-023 remain RESOLVED, untouched, their historical scope not reinterpreted or rewritten** — per this Spec-stage's own mandatory constraint, honored throughout this document. **GAP-070 is registered as its own distinct, new GAP** covering exactly the extension work GAP-009/023's own text explicitly does not claim: applying the same `ng-packagr` secondary-entry-point convention to Angular components shipped after the original proof set (the 9 named in GAP-009's own text: `checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple`, `input-number`). GAP-070 does not reopen GAP-009/023's own already-excluded 5 components (`button`/`dialog`/`menu`/`table`/`input-text`) — those remain permanently excluded on GAP-009's own already-established basis.
4. **GAP-070's own characterization step must complete before any specific newer component is assumed to need (or not need) a secondary entry point** — per GAP-070's own explicit resolution direction, not every newer component is assumed blocked or unblocked without first checking it against the confirmed `ShimReferenceTagger` trigger condition.

---

## 3. Framework Applicability

| Gap                                                | Angular                                                                                     | React                                                                                    | Vue                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| GAP-066 (Tooltip visibility)                       | In scope                                                                                    | N/A (different, already-safe mechanism — off-screen positioning, not `display: none`)    | N/A (already fixed, GAP-039)                                                           |
| GAP-067 (UMenu popup + SplitButton)                | In scope                                                                                    | N/A (already has working popup mechanism)                                                | N/A (already has working popup mechanism)                                              |
| GAP-068 (tsup subpath exports)                     | N/A (uses a structurally different mechanism, `ng-packagr`, tracked by GAP-009/023/GAP-070) | In scope                                                                                 | In scope                                                                               |
| GAP-070 (ng-packagr extension to newer components) | In scope                                                                                    | N/A (React already has per-component subpath exports for its own components, unaffected) | N/A (Vue already has per-component subpath exports for its own components, unaffected) |

---

## 4. Existing Behavior

- **GAP-066:** Angular's `UTooltip` has the same effective visibility defect GAP-039 already fixed for Vue — confirmed by Angular's own existing e2e test (`packages/ng/e2e/tooltip.spec.ts`, `expect(computedDisplay).toBe("none")`), which was already in the repository, undisclosed by GAP-039's own original text, when GAP-039 was first written. GAP-039's own resolved entry explicitly discloses this and explicitly disclaims tracking it: _"Angular's gap remains a separately disclosed, not-yet-registered fact; it is not tracked by this entry."_
- **GAP-067:** `UMenu`'s own doc comment (`packages/ng/src/menu/menu.ts:38-44`) explicitly discloses that its `popup` input is currently inert, "awaiting a future task" to extend its input/output surface for the popup overlay. `USplitButton` currently implements its own hand-rolled overlay state as a workaround rather than delegating to `UMenu`'s popup mode.
- **GAP-068:** `tsup.config.ts`'s `entry` map (React and Vue, independently) is stale relative to the components actually shipped since it was last updated — confirmed empirically via a real build during the Overlay Findings Triage: the main package barrel is fully unaffected (esbuild bundles transitively), but per-component subpath exports fail for components added after the map was last updated.
- **GAP-070:** GAP-009's own RESOLVED scope covers only the original 9 proof-set components; `button`/`dialog`/`menu`/`table`/`input-text` are permanently excluded by a confirmed `ShimReferenceTagger` defect (triggered when one secondary entry point's own compilation unit directly imports another secondary entry point's root class). GAP-009's own text makes no claim about any Angular component built after the Angular Form Foundation workstream — the ~90+ components shipped since (Phase C batches and later) have never been evaluated against this same convention.

---

## 5. Required Behavior

### 5.1 GAP-066 — Angular Tooltip visibility

Angular's `UTooltip` must apply the same companion inline `display` style GAP-039 already applied to Vue's `showTooltip()`-equivalent, so that the tooltip panel is actually visible in a real browser once shown — matching real PrimeNG's own `create()` mechanism (the same one GAP-039 verified real PrimeVue's own `create()` also uses). `packages/ng/e2e/tooltip.spec.ts`'s existing assertion (`expect(computedDisplay).toBe("none")`, currently asserting the known failure) must be converted to assert correct visibility, mirroring GAP-039's own conversion of Vue's equivalent test.

### 5.2 GAP-067 — Angular UMenu popup + SplitButton

`UMenu`'s popup-overlay mechanism must be built out — its `popup` input's own currently-inert behavior must become functional, rendering a real popup overlay (matching React's/Vue's own already-working Portal+escape-registry+z-index mechanism) when `popup` is enabled. Once functional, `USplitButton` must be simplified to delegate to `UMenu`'s own popup mode rather than maintaining its own separate, hand-rolled overlay state — matching React's/Vue's own already-working shape, where their respective SplitButton equivalents delegate to their own Menu's popup mechanism.

### 5.3 GAP-068 — React/Vue tsup subpath exports

`tsup.config.ts`'s `entry` map, in both `packages/react/` and `packages/vue/`, must be extended to include every currently-shipped component, restoring working per-component subpath exports (`@ultimate/{react,vue}/<component>`) for all of them — matching each framework's own already-correct convention for its original proof-set components. The main package barrel's own already-working behavior must remain unaffected.

### 5.4 GAP-070 — Angular ng-packagr extension to newer components

**Step 1 (prerequisite characterization):** for each Angular component shipped after the original 9-component proof set, determine whether that component's own compilation unit directly imports another secondary entry point's root class (the confirmed `ShimReferenceTagger` trigger condition GAP-009 already established). Do not assume any newer component's outcome before performing this check.

**Step 2 (fix, gated on Step 1's own per-component result):** for each newer component that does **not** hit the trigger condition, add a real `ng-packagr` secondary entry point (its own `ng-package.json`, matching the existing convention's shape). For each newer component that **does** hit the trigger condition, exclude it from secondary-entry-point packaging on the same already-established basis as `button`/`dialog`/`menu`/`table`/`input-text` — this is not a new defect requiring its own separate investigation, since the trigger condition itself is already fully characterized by GAP-009's own text.

**Explicitly does not reopen:** GAP-009/GAP-023's own RESOLVED status, or their own already-excluded 5 components' exclusion.

---

## 6. API Requirements

- **GAP-066:** no new public API — an internal styling fix (one additional inline-style property), exactly mirroring GAP-039's own fix mechanism.
- **GAP-067:** `UMenu`'s own already-declared `popup` input's _behavior_ becomes functional; no new prop is introduced beyond what `UMenu`'s own doc comment already names as pending ("extend this component's input/output surface for the popup overlay, submenu nesting, and the additional key handlers" — the exact additional inputs/outputs needed are an Implementation Plan design question, not fixed here). `USplitButton`'s own public API is unaffected by its internal delegation-mechanism simplification.
- **GAP-068:** no public API change — this is a build/packaging configuration fix; the same components already accessible via the main barrel become also accessible via their own subpath, matching their own already-existing barrel-level public contract.
- **GAP-070:** no public API change — components that receive a secondary entry point become additionally accessible via their own subpath (`@ultimate/ng/<component>`), matching React's/Vue's own already-correct convention; components excluded by the trigger condition remain accessible via the main barrel only, exactly as they are today. No component's own component-level API (props/inputs/outputs) changes.

---

## 7. Dependency Relationships

None among GAP-066, GAP-067, GAP-068, and GAP-070 — each is independent of the others. **TS2729 is not a dependency of any of these four** (§2.2). **GAP-070's own internal prerequisite:** Step 1 (characterization) must complete, per newer component, before Step 2 (fix) is applied to that specific component (§5.4) — this is a within-GAP-070 sequencing requirement, not a dependency on GAP-066/067/068 or on GAP-009/023.

---

## 8. Intentional Divergences That Must Remain Unchanged

- React's and Vue's own Tooltip mechanisms — already correct (React: off-screen positioning, not `display: none`; Vue: already fixed by GAP-039) — not touched by GAP-066.
- React's and Vue's own already-working Menu/SplitButton popup mechanisms — the template for GAP-067's fix, not themselves modified.
- Angular's own structurally different per-component export mechanism (`ng-packagr` secondary entry points, GAP-009/023) — not touched by GAP-068, which concerns only React/Vue's `tsup`-based mechanism.
- **GAP-009/GAP-023's own RESOLVED status and their own already-excluded 5 components** (`button`/`dialog`/`menu`/`table`/`input-text`) — not reopened, not reinterpreted, not rewritten by GAP-070's own registration or by any work under this Spec.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                                                                                            | Traces to                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Angular `UTooltip` panel is visible in a real browser once shown (computed `display` is not `"none"`); `packages/ng/e2e/tooltip.spec.ts` asserts correct visibility                                  | GAP-066                          |
| `UMenu`'s `popup` mode renders a real, functional popup overlay                                                                                                                                      | GAP-067                          |
| `USplitButton` delegates to `UMenu`'s own popup mechanism rather than its own hand-rolled overlay state                                                                                              | GAP-067                          |
| React per-component subpath exports (`@ultimate/react/<component>`) work for every currently-shipped component                                                                                       | GAP-068                          |
| Vue per-component subpath exports (`@ultimate/vue/<component>`) work for every currently-shipped component                                                                                           | GAP-068                          |
| React/Vue main barrel imports remain unaffected                                                                                                                                                      | GAP-068 (non-regression)         |
| Every Angular component shipped after the original proof set is characterized against the confirmed `ShimReferenceTagger` trigger condition before any secondary-entry-point decision is made for it | GAP-070 (Step 1)                 |
| Newer components that do not hit the trigger condition receive a real `ng-packagr` secondary entry point                                                                                             | GAP-070 (Step 2)                 |
| Newer components that do hit the trigger condition remain excluded, on the same basis as GAP-009's own already-excluded 5 components                                                                 | GAP-070 (Step 2, non-regression) |
| GAP-009/GAP-023's own RESOLVED status and their own 5 excluded components are unchanged                                                                                                              | GAP-070 (non-regression)         |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-039 (Vue's own resolved fix, the direct template for GAP-066), GAP-066, GAP-067, GAP-068, GAP-070, GAP-009, GAP-023 (referenced as existing authoritative context, not rewritten); `packages/ng/src/menu/menu.ts:38-44`; `packages/ng/e2e/tooltip.spec.ts`; `packages/{react,vue}/tsup.config.ts`; Overlay Findings Triage (`overlay-findings-triage.md`); pre-Spec tracking reconciliation (this session); Scope Reconciliation Report (this session, confirming GAP-070's registration); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

GAP-009's and GAP-023's own historical RESOLVED scope (untouched, not reinterpreted, not rewritten). GAP-009's own already-excluded 5 components (`button`/`dialog`/`menu`/`table`/`input-text`) — not reopened by GAP-070. TS2729 (§2.2, not related to any GAP in this Spec's scope, including GAP-070).

---

## 12. Resolution History (Informational)

This Spec originally disclosed the Angular ng-packagr/exports commitment's own "extension to newer components" question as a coverage gap with no corresponding GAP entry, discovered while authoring this document — the Final Scope Ledger's own "complete this commitment" language implied work broader than GAP-009/023's own committed RESOLVED scope. A subsequent Scope Reconciliation Report confirmed no prior GAP covered that extension and recommended registration; GAP-070 was then created, and this Spec was updated (§1, §2.3/§2.4, §3, §4, §5.4, §6, §7, §8, §9, §10, §11) to incorporate it as a normal, fully-traced requirement. GAP-009 and GAP-023 were not modified, reinterpreted, or broadened by this process — both remain exactly as originally committed, and GAP-070 is tracked as its own, separate entry covering only the extension work they never claimed.

## 13. Implementation-Stage Corrections (2026-10-01)

- **TS2729 blocks the ng-packagr build.** A pre-dispatch build of `@ultimate/ng` fails at the primary entry point with TS2729 in `autocomplete.ts:156` and `select.ts:162` (a `static instanceCount` declared after the instance field that reads it). §2.2 kept TS2729 out of scope unless it blocked the build work; it does, so GAP-070's characterization cannot run. User decision: a minimal prerequisite fix (Plan Task 5b) precedes the characterization; any further build error is reported, not fixed.
- **Advertised subpaths without entry points.** `@ultimate/ng`'s `exports` already lists 81 component subpaths while only 9 have secondary entry points, so 72 advertised subpaths have no built artifact. GAP-070's work therefore reconciles the exports map: entry points are added for components that pass characterization, and the remaining advertised-but-unbuilt subpaths were reported for a user decision rather than removed unilaterally. **Outcome:** the user decided to remove the 11 that can never build (see the GAP-070 bullet below).
- **`@angular/cdk` blocks the ng-packagr build.** After the TS2729 fix, the build stopped because `@angular/cdk` (a regular dependency since OrderList/PickList drag-and-drop) is not allowed by ng-packagr. User decision: move it to `peerDependencies`, matching PrimeNG (Plan Task 5c, `29a3390`). Consumers now install `@angular/cdk` themselves (`docs/architecture/MIGRATION.md` §8).
- **GAP-070 characterization and corrected trigger** (`docs/architecture/research/2026-10-01-gap-070-ng-secondary-entry-characterization.md`): 61 of 75 candidates build as secondary entries; 14 fail. ng-packagr compiles each entry with `rootDir` set to its own directory, so any import into another component directory fails, surfacing as the `ShimReferenceTagger` crash for Angular components — broader than the trigger wording in §4/§5.4/§9 and GAP-009, which is superseded here (GAP-009 left unchanged). Per §5.4, trigger-hitting components stay barrel-only. User decisions: add the 61 entries, and remove the 11 advertised subpaths that can never build so CI's pack/install integrity check passes (Plan Task 7, `8a46cc4`). That removal is a public-API change to advertised (never functional) subpaths, so §6's "no public API change" no longer holds literally for GAP-070. The barrel/subpath duplicate-class hazard is GAP-081.
- **GAP-067 rulings** (Plan Corrections items 4-7): Escape at the `MENU` tier, topmost popup by open order (`displayOrderRegistry`), `baseZIndex` applied by `UMenu` itself, Tasks 2 and 3 landed together, SplitButton test queries updated with assertions unchanged, `UContextMenu` moved to the shared open-order keys, and `show()` no longer stops the opening click. Consumer-facing: the SplitButton menu panel now renders in `document.body`.
- **GAP-068 React declaration build** (Plan Corrections item 8): building every React entry exhausted the default Node heap in tsup's bundled declaration step, so React now emits declarations with `tsc` (like Vue) and rewrites relative specifiers in `scripts/rename-dts.mjs`. Vue's pre-existing unresolvable declarations are GAP-079.
