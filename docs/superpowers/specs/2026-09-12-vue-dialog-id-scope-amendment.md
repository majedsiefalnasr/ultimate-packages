# Scope Amendment — Vue `Dialog.vue` Module-Scope ID Counter (Sixth Instance)

**Status:** Draft for Spec Review. New, separate gated artifact — not a rewrite of the existing approved specification/plan.
**Date:** 2026-09-12
**Not part of Phase 10 Track E.** Not a modification of the already-completed "SSR-Safe Component ID Generation" work item. This is a narrow, standalone follow-on amendment, addressing exactly one additional instance of the same defect class, discovered after that work item's own Task 4 verification.
**Origin:** `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md` (the escalation this amendment answers — full evidence, reproduction reasoning, and fresh exhaustive re-search already established there; not re-derived here).
**Scope decision already made (binding, not reopened here):** Option A — fold the sixth instance into the same remediation family, via this new, separately gated amendment. The already-completed 5-instance implementation (commits `3203ce6`, `db8faea`, `68d00a9`, `496e509`) is **frozen** — not modified, not reopened, not rewritten by this amendment or any work it authorizes.

**Required sequence (this document is step 2 of 7):** Escalation ✅ → **Scope Amendment Specification (this document)** → Spec Review → Plan Amendment/New Plan → Plan Review → Implementation → Verification.

---

## 1. What this amendment covers — exactly, no more

- `packages/vue/src/dialog/Dialog.vue`'s module-scope `dialogIdCounter` (lines 84, 124, per the exact citations already established in the escalation).
- Replacing it with Vue's `useId()`, using the identical `setup()` → `data()` bridge pattern already implemented and already proven correct for `packages/vue/src/menu/Menu.vue` in the completed 5-instance fix.
- Regression coverage added to the existing `packages/vue/src/dialog/dialog.spec.ts` file — no new test file, no new test infrastructure.
- The same three binding guarantees (G1/G2/G3) already established by the approved 5-instance specification, applied to this one additional component.

### 1.1 Implementation scope (binding, disambiguates §6 below)

The actual production/test implementation scope authorized by this amendment is strictly limited to exactly these two files:

- `packages/vue/src/dialog/Dialog.vue`
- `packages/vue/src/dialog/dialog.spec.ts`

**No other production or test file may be added to the implementation scope.** This is the complete, exhaustive file list for whatever Plan Amendment/New Plan and Implementation follow this specification. The documentation-correction item described in §6 is explicitly **not** part of this two-file implementation scope — see §6's own boundary statement for exactly how that item relates to this one.

**Explicitly not covered by this amendment** (per the scope decision's own binding constraints):

- The three `display-order`-family `uidCounter` instances (`packages/react-core/src/escape/use-display-order.ts`, `packages/vue-core/src/escape/use-display-order.ts`, `packages/vue-core/src/escape/create-display-order-mixin.ts`) — the escalation's own research already confirmed these are client-only internal registration keys for Escape-key dispatch priority among stacked overlays, never reaching a rendered `id` attribute or any ARIA binding, and therefore outside the scope this whole remediation family exists to address. This exclusion is restated here as binding, not re-investigated.
- Any reopening of the React or Angular fix decisions from the completed 5-instance work — those remain exactly as implemented.
- The Vue Tooltip CSS visibility defect (`packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` never applying a position-modifier class) — a separate, already-recorded, still-open, still-out-of-scope production defect, unrelated to ID generation.
- Any Track E file, harness, spec, or plan.
- Any production-code change performed by this document itself (this is a specification proposal only).

## 2. The defect, as already established (not re-derived, cited for completeness)

Quoted/restated from the escalation document's own source-verified findings:

- **Counter declaration** (`Dialog.vue:84`): `let dialogIdCounter = 0;` — module scope, persists for the process lifetime, not reset per SSR request.
- **ID generation** (`Dialog.vue:124`, inside `data()`): `dialogId: \`u-dialog-${++dialogIdCounter}\`,`.
- **Complete ID → ARIA relationship chain**, all confirmed by direct source read: `dialogId` (data field) → `ariaLabelledById` (a `computed` property, `Dialog.vue:129-131`: ``return this.header ? `${this.dialogId}_header` : null;``) → bound to the dialog root's `:aria-labelledby="ariaLabelledById"` (`Dialog.vue:25`) and to the header `<span>`'s own `:id="ariaLabelledById"` (`Dialog.vue:29`, inside `<span v-if="header" ...>`). This is a genuine ARIA-name relationship (the dialog's accessible name, provided via its header text) — the same structural pattern already fixed for Angular's `UDialog` and React's `UDialog`.
- **Mixin chain confirmed clean:** `Dialog.vue extends createBaseDialog()`; `createBaseDialog()` (`packages/vue/src/dialog/BaseDialog.ts`) and the shared `packages/vue-core/src/base/*` classes contain no existing `setup()` hook — confirmed by direct grep in the escalation's own research. No `extends`-does-not-merge-`setup()` conflict exists, for the same reason already established for `Menu.vue`.

## 3. Why `useId()`, using `Menu.vue`'s exact pattern, remains the correct remediation

No new architectural question exists here — this amendment applies an already-proven pattern to a second, structurally near-identical component, not a novel design.

- `Menu.vue`'s already-implemented, already-reviewed, already-tested fix (commit `496e509`) established the pattern: add a `setup()` hook directly to the component's own options object (not to the shared mixin factory), returning `{ generated<X>Id: useId() }`; `data()` reads `this.generated<X>Id` in place of the old counter-based computation; everything downstream of the data field (suffix construction, `computed` properties, ARIA bindings) is left completely unchanged, since those are plain string/derivation operations indifferent to how the base ID was produced.
- `Dialog.vue`'s one structural difference from `Menu.vue` — `ariaLabelledById` is a `computed` property, not a plain `data()` field reading the ID directly — does **not** create a conflict with Vue's own documented "do not call `useId()` inside `computed`" warning (already cited in the original, approved 5-instance specification), because the fix does not call `useId()` inside `ariaLabelledById`'s own getter. `useId()` is called exactly once, in `setup()`, exactly as `Menu.vue`'s fix already does; `ariaLabelledById` continues to read `this.dialogId` — a plain field — completely unchanged.
- **Concrete change, mirroring `Menu.vue`'s already-implemented shape exactly:**
  ```typescript
  // Before (Dialog.vue:84):
  let dialogIdCounter = 0;
  // ... inside data() (Dialog.vue:124):
  dialogId: `u-dialog-${++dialogIdCounter}`,
  ```
  ```typescript
  // After:
  import { useId } from "vue";

  // inside Dialog.vue's own component options object, alongside `extends: createBaseDialog()`:
  setup() {
    return { generatedDialogId: useId() };
  },
  // inside data():
  dialogId: `u-dialog-${this.generatedDialogId}`,
  ```
  `ariaLabelledById`'s own `computed` definition (`Dialog.vue:129-131`) is not touched — it continues to read `this.dialogId`.

## 4. G1/G2/G3, applied to this one additional instance (no new goal introduced)

Restated from the already-approved 5-instance specification, unchanged, applied here:

- **G1 (cross-request SSR independence):** for each SSR request, `Dialog.vue`'s generated ID must be independent of prior SSR requests in the same long-running process. Satisfied by construction, identically to `Menu.vue`'s already-verified case: every fresh `createSSRApp()`/`mount()` call (one per SSR request, per this repository's own confirmed per-request-bootstrap architecture) deterministically restarts Vue's internal `useId()` sequence at its root value (confirmed directly against Vue 3.5.42's real installed source during the `Menu.vue` fix's own Task 4 verification — every root component instance initializes its `ids` state to the same literal starting constant, independent of process history). This amendment does not require re-verifying this mechanism against Vue's source again — it is a framework-level guarantee already confirmed once and equally applicable to any component using `useId()`, not something specific to `Menu.vue`.
- **G2 (hydration stability):** the ID the server renders for a given request must be the exact ID the client's hydration pass computes for that same request. Satisfied by construction, per Vue's own documented purpose for `useId()` (already cited in the approved specification): "stable across server and client renders... preventing hydration mismatches." This directly targets the same class of defect already confirmed, by direct observation, to affect `Menu.vue` before its fix (a silent, unwarned client-side ID rewrite during hydration) — the same mechanism is expected to apply to `Dialog.vue`'s unfixed counter today, by structural analogy (both are plain Options-API components using the identical counter-in-`data()` idiom), though this has not been independently re-reproduced against a running server for `Dialog.vue` specifically in either the escalation or this amendment (reproducing it would require a harness or test scenario beyond a research/specification-level activity) — flagged as Open Question OQ-1 below for the Implementation Plan or its own verification step to close with direct evidence, not left as an unstated assumption.
- **G3 (no regression):** the existing ARIA relationship (`aria-labelledby` / header `id`) must continue to resolve correctly; `Dialog.vue`'s visual/behavioral contract is otherwise unchanged. Satisfied by construction: `dialogId`'s string _contents_ change format (framework-internal `useId()` shape instead of `u-dialog-<n>`), but `ariaLabelledById`'s own derivation logic, and every template binding that reads it, are untouched — identical reasoning already validated for `Menu.vue`'s own `itemId(i)` relationship.

## 5. Regression tests to add to the existing `packages/vue/src/dialog/dialog.spec.ts`

No new test file. No new test infrastructure. Extending the existing file with the same four test categories already established as this remediation family's own standard (matching the already-approved 5-instance plan's own §9, and already-implemented once for Vue's `Menu.vue` in that same plan's Task 3):

1. **Uniqueness within one render:** mount two `UDialog` instances as genuine siblings within one shared app instance/root (mirroring `Menu.vue`'s own already-implemented AC3.1 correction — verified during that task's own review to be the only test construction that correctly exercises Vue's real per-app-instance `useId()` uniqueness guarantee) and assert their generated `dialogId`/`ariaLabelledById` values differ.
2. **ARIA relationship integrity:** assert the header `<span>`'s actual rendered `id` matches the dialog root's `aria-labelledby` value when the dialog is open and a `header` prop is provided.
3. **Observable-behavior-only "no state leak" check (NOT proof of G1 — binding wording constraint, carried forward unchanged from the already-approved plan's own Plan Review amendment):** the test must assert only that generated IDs are not inappropriately reused — no assertion about numeric increments, derivation strategy, or Vue's internal `useId()` mechanism. Per the already-established, already-confirmed Vue internals (§4/G1 above): two genuinely separate, independent `mount()` calls (not siblings within one app instance) may legitimately produce the _same_ first generated ID, since each fresh root app instance correctly restarts its own `useId()` sequence — asserting cross-mount inequality would be **incorrect** here, for the identical reason already established and already corrected once for `Menu.vue`'s own AC3.3. This test must therefore assert only that each independent mount produces a validly-formed, non-undefined generated ID (proving the `setup()` → `data()` bridge works and no counter-like state persists), not that two independent mounts differ from each other. The test (or a comment immediately above it) must explicitly state it is a jsdom-level check, not proof of cross-request SSR determinism — Track E's own Task 8 remains the stated authoritative real-SSR check, unchanged.
4. **`id`-equivalent prop override, if `UDialog`/`createBaseDialog()` has one:** check the component's actual props before writing this test, per the same discipline already applied to `Menu.vue`'s own AC3.4 (which found no such prop existed on `UMenu` and correctly reported that rather than fabricating one). If `UDialog` has an existing prop that overrides the generated ID, test that it wins; if not, state this plainly in the Implementation Plan/Task report and skip the sub-check cleanly, exactly as already done once for `Menu.vue`.

## 6. Documentation correction — a separate, post-implementation closeout task, NOT part of the two-file implementation scope

**This entire section is explicitly outside the production/test implementation scope defined in §1.1.** It is recorded here only as a documentation-boundary observation and a proposal for a later, separate, contingent closeout task — it must not be read as authorizing any file beyond the two named in §1.1, and it is not itself part of what "implementation" means for this amendment. Restated plainly:

- **Outside the production/test implementation scope** defined in §1.1 — the two-file list there is exhaustive and this section adds nothing to it.
- **Not an authorization to expand the implementation to additional files** — a future Plan Amendment must not read this section as license to touch any file beyond `Dialog.vue`/`dialog.spec.ts` under the banner of "documentation cleanup" or any other framing.
- **Limited, if and when it is done at all, to the minimum additive corrective note + cross-reference proposed below** — nothing broader.

Per explicit instruction, this amendment does **not** silently rewrite the historical research/spec documents now, and does not authorize doing so as part of implementing the two-file fix above. It records the discrepancy plainly and proposes only the minimum documentation update that could be done **afterward**, as its own contingent, separately-tracked item — not performed now, and not bundled into the two-file implementation task.

**The discrepancy, stated plainly:** `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` §2 and `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md` §2 both stated "No sixth instance exists" / "Confirmed... exhaustive," backed by a search that, in fact, missed a real instance matching its own stated search pattern. This has been disproven by direct re-verification (`docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md` §4's three independent, broader re-searches).

**Proposed minimum documentation update — a post-implementation closeout task, contingent on this amendment's own successful implementation and verification, not performed now and not part of the two-file scope in §1.1:**

1. A single corrective note appended to the original escalation document (`...track-e-ssr-id-nondeterminism-finding.md`) and/or the original specification (`...ssr-safe-component-id-generation-design.md`), stating that a sixth instance was subsequently found and addressed under this separate amendment, with a cross-reference to this document and its own eventual implementation record — not a rewrite of either document's original enumeration or reasoning, which remain historically accurate records of what was known and decided at the time.
2. No renumbering of the original 5-instance enumeration table — this amendment's own instance is recorded as an addition, not a correction requiring the original table's "5" to become "6" retroactively in that document's own text.
3. If a future Plan Amendment chooses to schedule this closeout note-taking as one of its own tasks (mirroring the completed 5-instance work's own Task 4 verification-and-reporting discipline), that task must be clearly labeled as documentation-only, contingent on the two-file implementation (§1.1) having already passed its own verification, and must not itself touch `Dialog.vue`, `dialog.spec.ts`, or any file beyond the two documentation files named in item 1 above. It remains equally valid for the Plan Amendment to simply not schedule this at all and leave it as a freestanding, separately-requested follow-up — this amendment does not require it to happen.

## 7. Relationship to Track E (unchanged, restated for completeness)

- Track E remains paused, independent of this amendment's own review timeline.
- **The existing Angular provider-wiring prerequisite is unaffected and unchanged by this amendment:** `ComponentIdGenerator` (from `@ultimate/ng-core`) must be added to the application bootstrap providers in both `apps/playground-angular/src/main.ts` and `apps/playground-angular/src/main.server.ts`. **Track E's SSR execution must not resume until this provider wiring is applied.**
- Track E's own Vue harness (`apps/playground-vue/src/App.vue`) does render a `UDialog` instance (confirmed in the escalation, §7) — meaning this amendment's eventual fix, once implemented, is directly relevant to that harness's future Task 8/Tasks 5-7 work, though (per the escalation's own confirmed finding) not currently blocking, since the harness's default-closed Dialog fixture does not currently expose the counter-derived ID in initial SSR HTML.
- This amendment's own implementation, once approved, does **not** touch any Track E file — exactly the same boundary already observed by the completed 5-instance work.

## 8. Open questions (for the Plan Amendment/New Plan to resolve, not blocking this specification's review)

- **OQ-1:** Direct reproduction of the expected hydration-mismatch behavior for `Dialog.vue`'s current, unfixed counter (mirroring the already-completed direct reproduction performed for `Menu.vue` during that fix's own Task 4 pass) has not been performed in this escalation or this amendment — the expectation that `Dialog.vue` exhibits the same silent hydration-rewrite defect `Menu.vue` was confirmed to have is a reasoned structural analogy, not an independently observed fact for this specific component. The Plan Amendment should decide whether to perform this direct reproduction (e.g., via a throwaway harness or manual server-priming test, matching the method already used for `Menu.vue`) as part of confirming the fix's necessity/correctness, or whether the structural analogy plus the already-proven fix pattern is sufficient grounds to proceed without it — this is a verification-thoroughness judgment call, not an architectural fork.
- **OQ-2:** Whether `UDialog`/`createBaseDialog()` has an existing `id`-override prop (§5 item 4) — not confirmed by this amendment's own research; deferred to the Plan Amendment/its own implementer to check first, per the same discipline already applied once for `Menu.vue`.
- **OQ-3:** Exact placement/wording of the proposed documentation corrections (§6) — a Plan Amendment task-sequencing detail, not an architectural question.

---

## Explicit acceptance criteria for this amendment (for Spec Review)

1. The implementation scope is exactly the two files named in §1.1 (`packages/vue/src/dialog/Dialog.vue` and `packages/vue/src/dialog/dialog.spec.ts`) — no other file, and §6's documentation-correction proposal is confirmed to remain outside this scope, not folded into it.
2. The fix mechanism is `useId()` via a `setup()` → `data()` bridge, identical in shape to `Menu.vue`'s already-implemented, already-reviewed fix — no alternative mechanism, no custom ID generator, no counter, no reset.
3. G1/G2/G3 all hold for this instance, using the same reasoning already established and already verified for the 5-instance fix — no new goal, no weakened goal.
4. The three `display-order` `uidCounter` instances remain explicitly excluded.
5. The already-completed 5-instance implementation (`3203ce6`, `db8faea`, `68d00a9`, `496e509`) is not modified, reopened, or rewritten by anything this amendment authorizes.
6. Track E remains untouched; the Angular provider-wiring prerequisite is restated, not altered.
7. The Vue Tooltip CSS defect remains untouched and unmentioned as anything other than "still separately out of scope."
8. No production code, spec/plan document (other than this new amendment itself), or commit has been created by this specification-stage document.

## Spec Gate Status

**SPEC GATE — READY FOR FINAL REVIEW**

Not self-approved. This document does not authorize implementation planning to begin; Spec Review remains the next gate, per the required sequence: Escalation ✅ → **Scope Amendment Specification (this document)** → Spec Review → Plan Amendment/New Plan → Plan Review → Implementation → Verification.
