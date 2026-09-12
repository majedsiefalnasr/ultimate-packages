# Plan Amendment / Implementation Plan: Vue `Dialog.vue` Module-Scope ID Counter (Sixth Instance)

**Document:** `docs/superpowers/plans/2026-09-12-vue-dialog-id-scope-amendment-implementation.md`
**Status:** Draft for review (implementation-ready)
**Approved specification:** `docs/superpowers/specs/2026-09-12-vue-dialog-id-scope-amendment.md` (Spec Gate: APPROVED — final review)
**Not part of Phase 10 Track E. Not a modification of the completed 5-instance SSR-ID-generation fix.** This is the sixth, separately-gated instance of the same defect class, addressed under its own Scope Amendment.
**Frozen, not reopened by this plan:** the completed 5-instance implementation (commits `3203ce6`, `db8faea`, `68d00a9`, `496e509`) — no file from that work is touched here.

**Required sequence (this document is step 4 of 7):** Escalation ✅ → Scope Amendment Specification ✅ → Spec Review ✅ → **Plan Amendment/Implementation Plan (this document)** → Plan Review → Implementation → Verification.

---

## Binding decisions carried forward from the approved Scope Amendment, not reopened by this plan

1. **Implementation scope is exactly two files**, per the amendment's own §1.1: `packages/vue/src/dialog/Dialog.vue` and `packages/vue/src/dialog/dialog.spec.ts`. No other file is touched by this plan's Task 1.
2. Remediation mechanism is Vue's `useId()`, via the identical `setup()` → `data()` bridge already implemented and proven for `Menu.vue` (commit `496e509`) — no alternative mechanism, no custom ID generator, no counter, no reset.
3. G1 (cross-request SSR independence), G2 (hydration stability), G3 (no regression) — same wording, same scope, as already established for the completed 5-instance work. Not reopened, not reworded here.
4. The three `display-order` `uidCounter` instances remain explicitly excluded — not touched, not investigated further.
5. The Vue Tooltip CSS visibility defect remains explicitly out of scope.
6. React and Angular decisions from the completed 5-instance work are not reopened.
7. Track E remains untouched by this plan. The Angular provider-wiring prerequisite (`ComponentIdGenerator` in `apps/playground-angular/src/main.ts` and `main.server.ts`, Track E SSR must not resume until applied) is unchanged and restated below.
8. The §6 documentation-correction proposal from the approved amendment remains **outside** this plan's own two-file implementation scope (see Task 3 below, which is explicitly the only place it appears, and is explicitly optional/separate, running only after Task 2 succeeds).

## Research performed before writing this plan (resolves the amendment's own Open Questions with concrete findings)

- **Resolves OQ-2 (does `UDialog` have an id-override prop?):** No. Direct source read of `packages/vue/src/dialog/BaseDialog.ts`'s full `props` object (13 props: `visible`, `header`, `footer`, `modal`, `closable`, `closeOnEscape`, `dismissableMask`, `blockScroll`, `baseZIndex`, `autoZIndex`, `position`, `appendTo`, `ariaCloseLabel`) confirms no `id`-equivalent override prop exists anywhere in `UDialog`'s prop chain, nor in the further-shared `createBaseComponent()` base it extends. This exactly mirrors `Menu.vue`'s own already-confirmed situation. **Task 1's regression tests therefore do not include an id-prop-override sub-test** — there is no such prop to test, consistent with the already-established precedent of not fabricating one.
- **Resolves OQ-1 (is direct live SSR/hydration reproduction required before implementation?):** **Decision: no, not as a build-blocking prerequisite.** `Dialog.vue` uses the structurally identical Options-API counter-in-`data()` idiom already directly reproduced and confirmed (including the silent hydration-rewrite behavior) for `Menu.vue` during that fix's own verification pass — same framework, same component-authoring pattern (`extends` mixin + `data()`), same lifecycle timing (`data()` runs once per component construction, exactly as `Menu.vue`'s did). No structural difference between the two components' ID-generation mechanism was found that would call the analogy into question. Requiring a fresh live-server reproduction here would re-verify a mechanism already verified once, at real cost (building or reusing a throwaway SSR harness) for no expected new information. **However, per the amendment's own instruction to keep this as a verification activity without expanding file scope:** Task 2 (verification) below includes a manual, throwaway reproduction check as part of the implementer's own pre-completion verification — using the same lightweight method already used for `Menu.vue`'s own verification (a plain Node script calling `renderToString`/`createSSRApp` directly, or an equivalent minimal harness that is not committed and does not become a new file in the repository). This produces direct evidence the fix works, without adding a permanent file to the implementation scope.
- **Confirmed via direct source read of `@vue/test-utils@2.5.0`'s own `mount()` implementation** (`node_modules/.pnpm/@vue+test-utils@2.5.0.../dist/vue-test-utils.cjs.js:8449-8450`, `createInstance(...)`): **each separate `mount()` call creates its own independent Vue `app` instance** — confirmed by reading the function body directly, not assumed. This means the existing `dialog.spec.ts` precedent at lines 76-85 (`const first = mount(UDialog, ...); const second = mount(UDialog, ...);`, used for Escape-priority-stacking coverage) mounts **two independent app instances**, not two components within one shared render tree. **This is the correct pattern for that Escape-priority test's own purpose, but it is the WRONG pattern for this plan's own uniqueness-within-one-render test** — two independent `mount()` calls would each be entitled to compute the same `useId()` value (both being fresh root instances), exactly the trap already identified and avoided once for `Menu.vue`. Task 1's regression tests below use the same shared-parent-wrapper technique already proven for `Menu.vue`'s own `TwoMenus` test, not two independent `mount()` calls.

---

## Task 1 — Vue `Dialog.vue`: migrate to `useId()` + regression tests (the only production/test task)

**Specification traceability:** Scope Amendment §1.1 (implementation scope), §3 (concrete change), §4 (G1/G2/G3), §5 (regression tests).

**What to change in `packages/vue/src/dialog/Dialog.vue`:**

1. Delete `let dialogIdCounter = 0;` (line 84) entirely.
2. Add a `setup()` hook to `Dialog.vue`'s own component options object (the same object that already has `name: "UDialog"`, `extends: createBaseDialog()`, `emits`, `components`, `directives` — NOT to `createBaseDialog()` itself, per the already-confirmed absence of any conflicting `setup()` anywhere in the mixin chain):
   ```typescript
   import { useId } from "vue";

   // inside Dialog.vue's own component options object, alongside `extends: createBaseDialog()`:
   setup() {
     return { generatedDialogId: useId() };
   },
   ```
3. In `data()` (currently lines 122-127), replace `dialogId: \`u-dialog-${++dialogIdCounter}\`,` (line 124) with `dialogId: \`u-dialog-${this.generatedDialogId}\`,` — relying on Vue's confirmed execution order (`setup()` runs before `data()`, already established and unchanged from the completed 5-instance work's own research).
4. **`ariaLabelledById` (the `computed` property at lines 129-131) is left completely unchanged** — it continues to read `this.dialogId` exactly as before (`` return this.header ? `${this.dialogId}_header` : null; ``). This is the specific point the Scope Amendment's §3 already resolved: `useId()` is called exactly once, in `setup()`, never inside `computed` — Vue's own documented warning against calling `useId()` inside `computed` does not apply here because `ariaLabelledById` never calls `useId()` itself, it only reads a plain data field.
5. **The existing `aria-labelledby` ↔ header `id` relationship is left completely unchanged** — both template bindings (`:aria-labelledby="ariaLabelledById"` at line 25, and `:id="ariaLabelledById"` on the header `<span>` at line 29) continue to read the same `ariaLabelledById` computed property, itself unchanged. No template file content beyond the two lines named in items 2/3 above is touched.
6. **All other `dialogId` consumers are left completely unchanged** — confirmed by source read: `this.dialogId` is also referenced at `Dialog.vue:169,179,207` for scroll-lock registration (`registerScrollLock(this.dialogId)`/`unregisterScrollLock(this.dialogId)`) — these are plain string-key operations against a registry, indifferent to how `dialogId` was produced, exactly the same "downstream usage is plain string operations" reasoning already established for `Menu.vue`'s `itemId(i)`.

**Regression tests to add to `packages/vue/src/dialog/dialog.spec.ts`** (new `describe` block appended to the existing file; no new test file):

1. **Uniqueness within one render (sibling components, one shared app instance — NOT two independent `mount()` calls, per this plan's own confirmed `@vue/test-utils` internals above):**
   ```typescript
   it("generates unique dialogId-derived ids for two UDialog instances mounted within the same app instance", () => {
     const TwoDialogs = {
       components: { UDialog },
       template: `<div>
         <UDialog :visible="true" header="First" />
         <UDialog :visible="true" header="Second" />
       </div>`,
     };
     const wrapper = mount(TwoDialogs, { attachTo: document.body });
     const headers = wrapper.findAll('[role="dialog"] [class*="title"]'); // or the actual header-span selector this file's existing tests already use — check for an established header-element query pattern in this same file before introducing a new one
     const idA = headers[0].attributes("id");
     const idB = headers[1].attributes("id");
     expect(idA).toBeTruthy();
     expect(idB).toBeTruthy();
     expect(idA).not.toBe(idB);
     wrapper.unmount();
   });
   ```
   (The exact header-element selector is an implementation-time detail — check this same spec file's existing tests, e.g. lines 42-48, for whatever query pattern they already use to find the rendered header, and reuse it rather than inventing a new one. The structural shape above — one shared parent template, two `UDialog` siblings, `mount()` called once on the parent — is the binding part, mirroring `Menu.vue`'s own already-implemented `TwoMenus` pattern exactly.)
2. **ARIA relationship integrity:** assert the header `<span>`'s actual rendered `id` matches the dialog root's `aria-labelledby` value when the dialog is open and a `header` prop is provided — mirroring the already-established pattern from the completed 5-instance work's own equivalent tests (e.g. `dialog.spec.ts`'s Angular/React counterparts' ARIA-integrity tests already reviewed and approved in that work).
3. **Observable-behavior-only "no state leak" check (binding wording constraint, carried forward unchanged):** mount `UDialog` independently twice (two separate top-level `mount(UDialog, { props: { visible: true, header: "..." } })` calls — this is the correct pattern for THIS test specifically, unlike test 1 above, precisely because this test's own point is to check independent-mount behavior, not sibling-in-one-tree behavior) and assert only that each independent mount produces a validly-formed, non-empty/non-undefined generated `dialogId`/`ariaLabelledById` — **do NOT assert the two mounts' IDs differ** (per this plan's own confirmed `@vue/test-utils` internals: two independent `mount()` calls are two independent app instances, each entitled to legitimately compute the same `useId()` value; asserting inequality here would be incorrect, mirroring the exact correction already made once for `Menu.vue`'s own equivalent test). The test's own name or an immediately-preceding comment must state explicitly that this is a jsdom-level check for retained state, not a proof of cross-request SSR determinism — Track E's own Task 8 remains the stated authoritative real-SSR check, unchanged.
4. **No id-prop-override test** — per this plan's own OQ-2 resolution above, `UDialog` has no such prop; none is fabricated.

**What NOT to do:**
- Do not touch any file beyond `packages/vue/src/dialog/Dialog.vue` and `packages/vue/src/dialog/dialog.spec.ts` — not `BaseDialog.ts`, not any `packages/vue-core/src/base/*` file, not `createDisplayOrderMixin`'s own file, not any Angular/React file, not any Track E file.
- Do not modify `ariaLabelledById`'s own `computed` definition.
- Do not modify the existing Escape-priority-stacking test (`dialog.spec.ts:76-85`) or any other existing test in the file beyond appending the new `describe` block.
- Do not add a `computed` wrapper around `useId()` anywhere.
- Do not assert on the literal string shape `useId()` produces (e.g. `v-0`) in any test.
- Do not use two independent `mount()` calls for the uniqueness-within-one-render test (test 1) — this would test the wrong thing per this plan's own confirmed internals.
- Do not add an `id`-prop-override test — no such prop exists on `UDialog`.
- Do not touch `display-order`/`uidCounter` files, the Vue Tooltip CSS files, or any Track E file.

**Acceptance criteria:**
- AC1.1: `pnpm --filter @ultimate/vue run test` passes, including all new assertions.
- AC1.2: `git diff --stat` confirms exactly the 2 named files changed, nothing else.
- AC1.3: Grep confirms zero remaining occurrences of `dialogIdCounter` anywhere in `packages/vue/src/dialog/`.
- AC1.4: Grep confirms zero test assertion in `dialog.spec.ts` matches on a literal `u-dialog-<number>` string pattern (the old format) in any newly-added test.
- AC1.5 (resolves OQ-1's verification activity): the implementer's own completion report includes direct evidence — obtained via a throwaway, non-committed script or manual test, not a new repository file — that a real `createSSRApp`/`renderToString` render of a `UDialog` with `visible: true` and a `header` prop produces the expected `useId()`-derived ID in the server-rendered HTML, and that a subsequent client-side hydration of that same HTML does not silently rewrite it (mirroring the exact check already performed once for `Menu.vue`). This is evidence to report, not a new committed file or test.

---

## Task 2 — Whole-change verification of Task 1

**Specification traceability:** Scope Amendment §4 (G1/G2/G3), §5 (regression tests), §7 (Track E relationship).

**Depends on:** Task 1 only. Does not depend on Task 3 — Task 3 is optional and, if performed at all, runs strictly after this task succeeds.

**What to verify, in order:**

1. `pnpm --filter @ultimate/vue run test` passes — the full suite, re-confirmed after Task 1's changes land.
2. `git diff --stat` against this plan's own baseline matches exactly Task 1's own 2-file list — no additional file.
3. Grep the diff for `Math.random`, `Date.now`, or any other nondeterminism source accidentally introduced (not expected, cheap explicit check, matching the completed 5-instance work's own Task 4 discipline).
4. Confirm no file under `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, or any Track E spec/plan doc appears in the diff.
5. Confirm no file under `packages/vue/src/tooltip` or `packages/uix-styles/src/tooltip` appears in the diff.
6. Confirm no file under `packages/react/src`, `packages/react-core/src`, `packages/ng/src`, or `packages/ng-core/src` appears in the diff — this amendment is Vue-only, and the completed 5-instance work's own files (already committed in `3203ce6`/`68d00a9`) must show zero further changes.
7. Confirm no `display-order`/`uidCounter` file (`packages/react-core/src/escape/use-display-order.ts`, `packages/vue-core/src/escape/use-display-order.ts`, `packages/vue-core/src/escape/create-display-order-mixin.ts`) appears in the diff.
8. Re-read Task 1's new test names/comments, confirming none claims to prove cross-request SSR determinism — only Track E's own Task 8 makes that claim, once Track E resumes.
9. Re-confirm the AC1.5 SSR/hydration evidence (from Task 1's own report) is present and specific — direct evidence, via a throwaway, non-committed script or manual test (not a new repository file), that a real `createSSRApp`/`renderToString` render of a `UDialog` with `visible: true` and a `header` prop produces the expected `useId()`-derived ID in the server-rendered HTML, and that a subsequent client-side hydration of that same HTML does not silently rewrite it.

**Mandatory final-report section — "Track E resumption prerequisite" (unchanged, restated verbatim, same discipline as the completed 5-instance work's own Task 4):**

> ## Track E resumption prerequisite
>
> `ComponentIdGenerator` (from `@ultimate/ng-core`) must be added to the application bootstrap providers in both:
> - `apps/playground-angular/src/main.ts`
> - `apps/playground-angular/src/main.server.ts`
>
> **Track E's SSR execution must not resume until this provider wiring is applied.** This requirement is unchanged by this amendment and stands independently of it — it originates from the completed 5-instance Angular fix (Task 2 of that work item), not from this amendment's own Vue-only scope.

This section is not satisfied by a paraphrase or cross-reference — it must be reproduced in Task 2's own final report, verbatim or near-verbatim.

**What NOT to do:**
- Do not commit at the end of this task.
- Do not attempt to run Track E's own Task 8 (does not exist yet, Track E is paused).
- Do not wait for or depend on Task 3 — Task 3 is optional and comes after this task, never before or alongside it.

**Acceptance criteria:**
- AC2.1: All checks above return clean/negative results, each explicitly confirmed in this task's own report.
- AC2.2: The "Track E resumption prerequisite" section is present exactly as specified above.
- AC2.3: If Task 2's own checks all pass, the implementation is considered fully verified and complete based on Tasks 1 + 2 alone — Task 3 is not required for this task's own success or for the work item's overall completeness.

## Task 3 — Optional documentation closeout note (explicitly OUTSIDE the Task 1 implementation scope; may run only after Task 2 succeeds)

**Specification traceability:** Scope Amendment §6 (explicitly labeled as outside the two-file implementation scope, a separate, contingent, post-implementation item).

**Depends on:** Task 2 succeeding. Never runs before or alongside Task 1/Task 2.

**Binding framing, restated from the approved specification and not altered here:** this task is **not** part of the production/test implementation scope defined in Task 1. It does not authorize touching `Dialog.vue`, `dialog.spec.ts`, or any file beyond the two documentation files named below. It is entirely optional — if skipped, the implementation (Tasks 1 + 2) remains fully verified and complete on its own.

**What this task would do, if and only if it is performed:**

1. Append a single, minimal corrective note to `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` and/or `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`, stating plainly that a sixth instance (`packages/vue/src/dialog/Dialog.vue`) was subsequently found and addressed under this separate Scope Amendment, with a cross-reference to `docs/superpowers/specs/2026-09-12-vue-dialog-id-scope-amendment.md` and this plan.
2. Do **not** renumber the original documents' own 5-instance enumeration tables — the note is a clearly-marked addition, not a retroactive correction of the original text's own historical accuracy.
3. This is the complete, exhaustive scope of Task 3 — no other documentation file, and absolutely no production/test file, is touched by it.

**What NOT to do:**
- Do not treat this task as license to edit any file beyond the two documentation files named in item 1.
- Do not perform this task before Task 2 has succeeded.
- Do not fold this task's own commit (if performed) into Task 1's commit — keep them separate, exactly mirroring how the completed 5-instance work kept its own docs commit (`db8faea`) separate from each framework's own fix commit.

**Acceptance criteria (only if this task is performed):**
- AC3.1: `git diff --stat` for this task touches only the documentation file(s) named in item 1 — no `packages/*` file, confirming no production/test file was touched by this documentation-only task.

---

## Key decisions (summary)

1. Implementation scope is exactly `Dialog.vue` + `dialog.spec.ts` (Task 1) — the sole production/test task this plan authorizes.
2. `useId()` via `setup()` → `data()`, identical shape to `Menu.vue`'s already-proven fix. `ariaLabelledById`'s `computed` property is untouched — it never calls `useId()` itself.
3. OQ-2 resolved: no `id`-override prop exists on `UDialog` (confirmed via direct source read of `BaseDialog.ts`'s full prop list) — no such test is written.
4. OQ-1 resolved: a fresh live-server SSR/hydration reproduction is not required as a build-blocking prerequisite (the mechanism is already proven identical to `Menu.vue`'s), but is retained as a required verification activity (AC1.5) using a throwaway, non-committed script — not a new repository file.
5. **New finding from this plan's own research:** `@vue/test-utils`'s `mount()` creates an independent app instance per call (confirmed via direct source read) — meaning the existing `dialog.spec.ts` precedent of two separate `mount()` calls (used for Escape-priority testing) is the WRONG pattern for a uniqueness-within-one-render test. Task 1's regression tests use a shared-parent-wrapper technique instead, mirroring `Menu.vue`'s own already-proven `TwoMenus` pattern.
6. The documentation-correction item (Task 3) is explicitly optional, explicitly outside Task 1's implementation scope, and explicitly may not expand to any other file.
7. Track E remains untouched; the Angular provider-wiring prerequisite is carried forward unchanged and is a mandatory Task 2 report section.

## Explicit acceptance criteria

See each task's own AC list above; Task 2 is the final verification gate for the implementation itself (Task 1). Task 3, if performed, is a strictly-subsequent, optional closeout step with its own narrow AC.

## Dependencies and sequencing

- **Task 1: no dependency.**
- **Task 2: depends on Task 1 only.** Does not depend on Task 3 — there is no dependency from Task 2 back to Task 3, removing the prior circular reference.
- **Task 3: optional; may run only after Task 2 succeeds.** Never runs before or alongside Task 1/Task 2.

Linear ordering: Task 1 → Task 2 → Task 3 (optional). If Task 3 is skipped entirely, the implementation is still considered fully verified and complete based on Tasks 1 + 2 alone (AC2.3).

## Unresolved implementation-level questions (legitimately deferred to Task-level implementer judgment)

1. The exact CSS-class/selector used to query the rendered header `<span>` in Task 1's new uniqueness test (item 1's code sketch above) — deferred to whatever query pattern `dialog.spec.ts`'s own existing tests (e.g. lines 42-48) already establish, not fixed here.
2. Whether Task 3 (documentation closeout) is performed at all — explicitly optional per the approved specification; this plan does not require it.

## Plan Review Gate

**PLAN GATE — READY FOR FINAL REVIEW**

Not self-approved. This plan does not authorize implementation to begin; Plan Review remains the next gate, per the required sequence: Escalation ✅ → Scope Amendment Specification ✅ → Spec Review ✅ → **Plan Amendment/Implementation Plan (this document)** → Plan Review → Implementation → Verification. No production code has been modified in producing this plan. No commit has been created.
