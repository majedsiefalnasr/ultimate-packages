# Sixth Instance of the Module-Scope ID-Counter Defect — `packages/vue/src/dialog/Dialog.vue`

**Status:** Escalated finding, scope decision required. Not a specification or implementation-plan document. No production code changed. No commit created.
**Date:** 2026-09-12
**Discovered during:** Task 4 (whole-change verification) of the already-completed, already-approved "SSR-Safe Component ID Generation" fix — surfaced while confirming zero counter remnants remained across all three frameworks after that fix's 5 instances landed.
**Relationship to the completed fix:** This is a **new, out-of-scope finding**, not a defect in the completed fix. The already-approved and already-implemented 5-instance fix (commits `3203ce6`, `db8faea`, `68d00a9`, `496e509`) remains correct and unchanged. This document does not modify, reopen, or cast doubt on that work — it reports a sixth, previously-undetected instance of the same class of defect, found by accident during that work's own terminal verification step, and explicitly not fixed here per the human's own instruction.

---

## 1. The finding, source-verified

`packages/vue/src/dialog/Dialog.vue:84,124` contains the identical module-scope-counter pattern already fixed in five other locations:

- **Counter declaration** (`Dialog.vue:84`): `let dialogIdCounter = 0;` — module scope, persists for the lifetime of the Node process, not reset per SSR request.
- **ID generation** (`Dialog.vue:124`, inside `data()`): `dialogId: \`u-dialog-${++dialogIdCounter}\`,` — increments the module-scope counter once per component instance construction.
- **Complete ID → ARIA relationship chain** (verified by direct source read of the full file):
  1. `dialogId` (counter-derived, `data()`, line 124).
  2. `ariaLabelledById` — a `computed` property (`Dialog.vue:129-131`): ``return this.header ? `${this.dialogId}_header` : null;`` — derives from `dialogId`, only non-null when a `header` prop is provided.
  3. Bound to the dialog root's `:aria-labelledby="ariaLabelledById"` (`Dialog.vue:25`).
  4. Bound to the header `<span>`'s own `:id="ariaLabelledById"` (`Dialog.vue:29`), inside `<span v-if="header" ...>`.

This is a genuine ARIA-name relationship (the dialog's accessible name is provided by its header text, referenced via `aria-labelledby` pointing at the header element's own `id`) — structurally identical to the pattern already fixed for Angular's `UDialog` (`ariaLabelledBy`), React's `UDialog` (`headerId`/`aria-labelledby`), and (for a different ARIA attribute, `aria-activedescendant`) Vue's own `UMenu`.

## 2. Does the same SSR cross-request nondeterminism and hydration-risk mechanism apply here?

**Yes, in mechanism; the practical exposure through Track E's current harness specifically is currently latent, not yet observed in that harness's SSR output — but the underlying defect is real and unconditional in the component itself.**

- **Mechanism:** identical to the already-fixed Vue `Menu.vue` case. `dialogIdCounter` is a plain module-scope `let`, incremented on every `new` component-instance construction (every time `data()` runs), never reset between requests in a long-running Node SSR process. Two sequential SSR requests rendering a `UDialog` with an open/visible state would produce different `dialogId`/`ariaLabelledById` values for what should be identical output — the same class of cross-request non-determinism confirmed for `Menu.vue`, and (per the already-completed fix's own investigation) the same class of defect confirmed to cause a **silent, unwarned hydration-time ID rewrite** for Vue's `Menu.vue` specifically (the client discarding the server-sent ID and substituting its own independently-computed value). There is no structural reason to expect `Dialog.vue`'s behavior to differ from `Menu.vue`'s under hydration, since both are plain Options-API components using the identical counter-in-`data()` idiom — this is stated as a reasoned expectation based on the already-confirmed Vue mechanism, not independently re-reproduced against a running server in this pass (re-reproducing it would require building a harness or test scenario beyond this research-only escalation's scope).
- **Current exposure through Track E's Vue harness specifically:** confirmed, by direct source read of `apps/playground-vue/src/App.vue`, that this harness's `UDialog` fixture starts closed (`dialogVisible = ref(false)`, line 97) and that `Dialog.vue`'s own template gates its entire `role="dialog"` subtree — including the header `<span>` that carries `ariaLabelledById` as its `id` — behind `v-if="containerVisible"` (`Dialog.vue:4`) and a further `v-if="visible"` (`Dialog.vue:19`) on the inner container. **This means the counter-derived ID does not currently appear in Track E's Vue harness's initial SSR HTML at all**, for the same structural reason Angular's closed-by-default `UDialog` doesn't currently expose its own (already-fixed) counter-derived ID in that harness's SSR output either. The defect is real and present in the component's source regardless of this harness's specific fixture state; it would become observable in SSR output the moment any Vue consumer's dialog is open during an initial server render (a scenario outside Track E's current default-closed fixture, but well within `@ultimate/vue`'s real usage surface) — exactly the same caveat already recorded for Angular's Dialog in the original escalation.

## 3. Is Vue's `useId()` still the correct remediation, using the same reasoning already established?

**Yes — the same reasoning applies without modification, and the same implementation pattern (already proven working for `Menu.vue`) transfers directly.**

- `Dialog.vue`'s mixin chain (`extends: createBaseDialog()`) was checked directly: `packages/vue/src/dialog/BaseDialog.ts` and the shared `packages/vue-core/src/base/*` classes contain **no existing `setup()` hook** — confirmed by grep, identical to the pre-fix state already confirmed for `Menu.vue`'s own mixin chain. There is no `extends`-does-not-merge-`setup()` conflict to resolve, for the same reason already established: nothing to merge with.
- The one structural difference from `Menu.vue` — `Dialog.vue`'s `ariaLabelledById` is a `computed` property, not a plain `data()` field — does **not** create a problem with Vue's documented "do not call `useId()` inside `computed`" warning, because the fix would not call `useId()` inside `ariaLabelledById`'s own computed getter. The fix would follow the identical pattern already used for `Menu.vue`: add a `setup()` hook to `Dialog.vue`'s own component options (not to `createBaseDialog()`) returning `{ generatedDialogId: useId() }`; `data()` reads `this.generatedDialogId` in place of `` `u-dialog-${++dialogIdCounter}` `` for the `dialogId` field; the existing `ariaLabelledById` computed property is left completely unchanged, since it only ever reads `this.dialogId` — a plain field, indifferent to how that field was produced. This mirrors the already-fixed `Menu.vue`'s own relationship between its `setup()`-sourced `menuId` and its unchanged downstream `itemId(i)` computed/method.
- No new open question is introduced by this structural difference — `useId()` remains the correct, drop-in, already-proven-working remediation, using `Menu.vue`'s exact implementation shape as the template.

## 4. Fresh, exhaustive re-search across all three frameworks (the prior "exactly five" claim is disproven and not repeated here)

The origin escalation's and the approved specification's own enumeration each stated "no sixth instance exists," backed by a grep described as exhaustive. That grep was, in fact, not exhaustive — `Dialog.vue:84`'s `let dialogIdCounter = 0;` matches even the prior search's own stated pattern (`let.*Counter\s*=\s*0` / `IdCounter`) character-for-character, and should have been found. The specific reason the prior search missed it was not independently re-derived in this pass (the exact grep command that produced the false "zero matches" result is not preserved in the origin document for post-hoc replay) — this is recorded as a real gap in that earlier research's execution, not explained further here since re-diagnosing a past search's exact miss is less valuable than replacing it with a demonstrably broader one now.

**This pass ran three progressively broader searches, all across the complete set of relevant trees (`packages/ng/src`, `packages/ng-core/src`, `packages/react/src`, `packages/react-core/src`, `packages/vue/src`, `packages/vue-core/src`), not a narrowed subset:**

1. **Exact prior pattern, re-run for confirmation:** `let.*Counter\s*=\s*0` / `IdCounter` — this is the search that should have found `Dialog.vue` the first time; re-running it now correctly returns it.
2. **Broader — any `Counter`-named module-scope counter, not just `IdCounter`-suffixed:** `^let [a-zA-Z]*[Cc]ounter\s*=\s*0` — found the same 6 ID-bearing instances (5 already fixed + `Dialog.vue`) plus 3 additional matches: `packages/react-core/src/escape/use-display-order.ts:4`, `packages/vue-core/src/escape/create-display-order-mixin.ts:9`, `packages/vue-core/src/escape/use-display-order.ts:4` (all three named `uidCounter`).
3. **Broadest — any module-scope `let`/`var` initialized to `0`, not requiring "Counter" in the name at all:** `^let [a-zA-Z_]* = 0;` (and `^var` equivalent) — returned exactly the same file set as search 2, plus two test-file-only matches (`table.spec.ts`, `scroller.spec.ts`) confirmed irrelevant (mock `ResizeObserverCallback` state, unrelated to ID generation, and test files never execute in production SSR regardless).
4. **Separately, a search for alternative ID-generation anti-patterns not using a `let` counter at all:** `Math.random()`/`Date.now()` used anywhere in ID construction — zero matches anywhere across all six trees.

**No further instance beyond the ones already named in this document and the origin escalation was found.** This is now a claim backed by three independent, overlapping search strategies across the complete source tree, not a single narrow pattern — a materially stronger basis for "exhaustive" than the prior escalation's single-pattern search that missed a real instance.

## 5. Are the 3 newly-found `use-display-order`-family instances (`uidCounter`) actually ARIA-connected?

**No — confirmed, by tracing every consumer, that none of these three feeds any rendered `id` attribute or ARIA binding.** These are a structurally different case from the 6 ID-bearing instances and do not require the same remediation:

- `packages/react-core/src/escape/use-display-order.ts` (React `useDisplayOrder` hook) and its two Vue-core siblings (`use-display-order.ts`'s Composition-API `Ref`-based version, `create-display-order-mixin.ts`'s Options-API-mixin version) each use their own module-scope `uidCounter` to generate a `uid`, but that `uid` is used **only** as an internal registration key into `displayOrderRegistry` (`packages/uix-utils/src/escape/display-order-registry.ts`), which tracks the relative open-order of simultaneously-visible overlays for keyboard-event (Escape key) dispatch priority — confirmed by tracing every real consumer (`packages/react/src/{dialog,menu,tooltip}.tsx`'s `useDisplayOrder(...)` calls; `packages/vue/src/dialog/Dialog.vue`'s `createDisplayOrderMixin(...)` call) that the resulting `displayOrder` value is consumed only as `priority: [ESCAPE_PRIORITIES.<TYPE>, displayOrder]`, passed into an escape-key registry, and **never assigned to a rendered `id`, `data-*` attribute, or any ARIA binding anywhere** in any of the traced call sites.
- Registration itself only happens inside `useEffect` (React), `onMounted`/`onUnmounted` (Vue Composition), or `mounted()`/`beforeUnmount()`/`updated()` (Vue Options mixin) — all three are lifecycle points already established elsewhere in this codebase's own architecture (and confirmed directly for the Options-API mixin's own doc comments) as client-only, never executing during a server render pass. The counter's value is therefore never computed during SSR at all for these three instances, and never serialized into SSR HTML.
- **Practical consequence:** these three instances share the module-scope-counter _code shape_ with the 6 ID-bearing findings, but do not exhibit the SSR-determinism-visible-in-output or hydration-mismatch risk this whole investigation is about, because their output is pure client-side-only internal state (keyboard-dispatch ordering preference among concurrently-open overlays in one browser session) that never reaches rendered markup or crosses the server/client boundary at all. **No remediation is recommended for these three** under the same rationale (G1/G2/G3, per the approved specification) that motivated fixing the other 6 — they do not violate G1 in any observable way, since there is no SSR output for G1 to apply to.

## 6. Impact on the already-completed 5-instance fix

**None.** The already-completed fix (React Menu/Dialog/Tooltip via `useId()`; Angular Dialog via `ComponentIdGenerator`; Vue Menu via `useId()`) remains fully correct, independently of this finding. Nothing about `Dialog.vue`'s defect changes the correctness, scope, or test coverage of the already-approved and already-implemented work. This finding does not require re-opening, re-reviewing, or re-testing any of the 5 already-fixed instances.

## 7. Impact on Track E

**Two distinct, already-partially-known considerations, one confirmed newly relevant here:**

1. **The already-recorded Angular provider-wiring prerequisite is unaffected and still stands as previously stated** (see "Preserved" section below) — this finding does not change or supersede it.
2. **Newly confirmed by this investigation:** Track E's own Vue SSR harness (`apps/playground-vue/src/App.vue`) does render a `UDialog` instance (confirmed at lines 19-26), meaning this 6th, unfixed instance is a real, in-scope component for Track E's eventual Task 8 (SSR-determinism double-fetch check) and Tasks 5-7 (Playwright interaction specs) once Track E resumes — **not** merely a theoretical concern for some other, unrelated `@ultimate/vue` consumer. However, also confirmed: because this harness's `UDialog` fixture starts closed (`dialogVisible = ref(false)`) and `Dialog.vue`'s template gates the entire ARIA-bearing subtree behind `v-if="containerVisible"`/`v-if="visible"`, **the counter-derived ID does not currently reach this harness's initial SSR HTML response** — meaning Task 8's byte-comparison double-fetch check, as currently scoped (comparing the _initial_ SSR response), would **not** currently be broken by this specific unfixed instance, the same way it is not currently broken by Angular's own already-fixed-but-analogously-gated Dialog counter was before that fix landed. The exposure would become live the moment any Track E Playwright spec (Tasks 5-7) opens the dialog and inspects its post-hydration/interaction state — at which point the same class of silent ID-rewrite risk already confirmed for `Menu.vue` becomes a live concern for `Dialog.vue` too, for the Vue harness specifically.
3. **Track E remains paused** independent of this finding — this document does not change that status, only adds one more piece of evidence relevant to the eventual decision about when it is safe to fully resume Task 5-7's Dialog-interaction assertions for the Vue harness specifically.

## 8. Binding record: the approved implementation must remain unchanged pending a new gate

Per explicit instruction, this document records plainly: **the already-approved specification (`docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`) and implementation plan (`docs/superpowers/plans/2026-09-12-ssr-safe-component-id-generation-implementation.md`) are not modified by this document, and must remain as-approved unless and until a new, separate gate decision explicitly authorizes a change.** No file under `packages/vue/src/dialog/` has been modified. No commit has been created. The four existing implementation commits (`3203ce6`, `db8faea`, `68d00a9`, `496e509`) are untouched and remain the complete, final state of the already-approved work.

## 9. Recommendation — presented for the human's own decision, not selected here

**Option A — fold the sixth instance into the existing fix, via a new scope/spec/plan approval:**

- Advantages: the remediation is mechanically identical to `Menu.vue`'s already-proven-working pattern (§3 above) — low technical risk, small additional diff (one file + its existing spec file, following the exact shape of the already-completed Vue Menu task). Closes the gap before Track E resumes, avoiding a second round-trip through Track E's own Task 8/5-7 discovering this same defect independently later. Keeps all Vue-related ID-generation fixes in one coherent unit of work rather than splitting a near-identical fix across two separate approval cycles.
- Disadvantages: requires reopening the already-approved specification/plan (even if only via an amendment, not a full new cycle) — some process overhead, and technically expands a scope that was explicitly bounded to "exactly 5" at Spec Gate.

**Option B — handle it as a separate, subsequent follow-up work item:**

- Advantages: respects the already-approved fix's bounded scope exactly as gated, with zero risk of quietly re-expanding an already-closed specification's enumerated list after the fact. Keeps this escalation's own evidence-gathering role cleanly separated from any new implementation decision, consistent with how the original escalation → separate-spec → separate-plan sequence was already handled for the first 5 instances.
- Disadvantages: a second, nearly-identical spec/plan/implementation cycle for what is, in substance, one more instance of an already-fully-understood defect with an already-proven fix pattern — some process overhead of its own, and leaves the defect open in `Dialog.vue` for a longer period (though, per §7, not currently observable through Track E's own current harness fixture state, so no immediate blocking urgency exists either way).

**This document does not select between A and B.** Both are presented with their real trade-offs for the human's own decision.

---

## Preserved from the prior report — Track E resumption prerequisite (unchanged, unaffected by this finding)

`ComponentIdGenerator` (from `@ultimate/ng-core`) must be added to the application bootstrap providers in both:

- `apps/playground-angular/src/main.ts`
- `apps/playground-angular/src/main.server.ts`

**Track E's SSR execution must not resume until this provider wiring is applied.** This requirement is unchanged by this document and stands independently of whatever decision is made about the `Dialog.vue` finding above.

---

## Sources

- Direct source reads: `packages/vue/src/dialog/Dialog.vue` (full relevant sections: counter, `data()`, `computed`, template lines 1-40 and 80-135), `packages/vue/src/dialog/BaseDialog.ts`, `packages/vue-core/src/base/*` (confirmed no `setup()` conflict), `packages/react-core/src/escape/use-display-order.ts`, `packages/vue-core/src/escape/use-display-order.ts`, `packages/vue-core/src/escape/create-display-order-mixin.ts`, `packages/uix-utils/src/escape/display-order-registry.ts`, `packages/react/src/{dialog,menu,tooltip}.tsx` (confirmed `useDisplayOrder`/`displayOrder` consumption sites), `packages/vue/src/dialog/Dialog.vue:141-167` (confirmed `createDisplayOrderMixin` consumption), `apps/playground-vue/src/App.vue` (confirmed Track E's own Vue harness renders `UDialog`, starts closed).
- Three independent, overlapping grep searches across all six relevant `packages/*/src` trees (§4), superseding the origin escalation's single-pattern search that missed this instance.
- `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` (origin escalation, for the already-established G1/G2/G3 framing and the already-confirmed Vue `Menu.vue` hydration-mismatch mechanism this document extends the same reasoning from).
- `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`, `docs/superpowers/plans/2026-09-12-ssr-safe-component-id-generation-implementation.md` (the already-approved, unmodified specification and plan this document does not alter).
- `.superpowers/sdd/task-4-report.md` (this fix's own terminal verification report, where this finding was first surfaced).
