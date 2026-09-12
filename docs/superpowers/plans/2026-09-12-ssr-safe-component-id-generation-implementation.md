# Implementation Plan: SSR-Safe Component ID Generation

**Document:** `docs/superpowers/plans/2026-09-12-ssr-safe-component-id-generation-implementation.md`
**Status:** Draft for review (implementation-ready)
**Approved specification:** `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md` (Spec Gate: APPROVED)
**Not part of Phase 10 Track E.** Separate work item, own gate sequence. Track E remains paused at Task 4 complete pending this fix landing (spec §10).
**Baseline:** `main` at `57772ff`, or the current `phase-10-track-e-ssr-hydration` branch — this plan's tasks apply cleanly to either, since they touch only `packages/ng-core`, `packages/ng`, `packages/react`, `packages/vue`, none of which Track E's Tasks 1-4 modified. Exact base branch/commit to work from is a sequencing decision for whoever executes this plan, not fixed here.

**Binding decisions carried forward from the approved specification, not reopened by this plan:**
1. Exactly 5 affected usages, no more: `packages/ng/src/dialog/dialog.ts:22,187` (Angular Dialog), `packages/react/src/menu/menu.tsx:54,84` (React Menu), `packages/react/src/dialog/dialog.tsx:38,60` (React Dialog), `packages/react/src/tooltip/tooltip.tsx:30,58` (React Tooltip), `packages/vue/src/menu/Menu.vue:61,97` (Vue Menu).
2. React and Vue use their respective framework-native `useId()` — no alternative ID-generation library, no custom hook/composable wrapping it.
3. Angular uses a new `ComponentIdGenerator` service, application-injector-scoped (not `providedIn: 'root'` by default — spec §6.2/§6.4; OQ-2 below governs whether this plan's own research changes that).
4. No global/process-level counter reset of any kind, anywhere.
5. No ID normalization, exclusion, or weakening in Track E's Task 8 (out of this plan's reach entirely — Task 8 is Track E's own file, untouched here).
6. Vue's Tooltip CSS visibility defect is explicitly out of scope — no file under `packages/vue/src/tooltip` or `packages/uix-styles/src/tooltip` is touched by this plan.
7. No component's public API (props, exported types, template output shape beyond the `id` attribute's literal string value) changes.
8. No component beyond the 5 enumerated gets `useId()`/`ComponentIdGenerator` applied speculatively.
9. G1 (spec §3) is cross-request SSR independence only — not a claim that repeated client-side renders produce identical literal ID strings. Regression tests must not assert the latter as if it were G1.

**Research performed before writing this plan (resolves the specification's Open Questions with concrete findings, not deferred further):**

- **Resolves OQ-1 (Vue `useId()`/Options-API bridge mechanics):** Confirmed via Vue's own official documentation (`vuejs.org/api/composition-api-setup`, `vuejs.org/api/options-composition`) that Composition API's `setup()` executes **before** any Options API hook, including `beforeCreate` — meaning `setup()`'s returned bindings are already merged onto the component instance (accessible via `this`) by the time `data()` runs. Separately confirmed by direct source read that `Menu.vue`'s entire mixin chain (`createBaseMenu()` in `packages/vue/src/menu/BaseMenu.ts`, and its own base classes under `packages/vue-core/src/base/`) contains **zero existing `setup()` hooks anywhere** — so there is no `extends`-does-not-merge-`setup()` conflict to resolve (Vue's own docs confirm `extends` does not auto-merge a base's `setup()`, but this is moot here since no ancestor defines one). **Concrete resolution:** `Menu.vue`'s own component options object (not the `createBaseMenu()` mixin factory) adds a `setup()` hook returning `{ generatedMenuId: useId() }`; `data()` reads `this.generatedMenuId` in place of `` `u-menu-${++uidCounter}` ``. This is now a fixed instruction for Task 3 below, not an open question.
- **Resolves OQ-2 (`providedIn: 'root'` vs. explicit):** Not changed from the specification's default (explicit, non-`providedIn`) — no research finding in this pass surfaced a reason to prefer `providedIn: 'root'` over explicit provision; the specification's own stated rationale (intent-signaling at the provider-list call site) stands. Task 2 below uses the explicit form.
- **Resolves OQ-3 (`ComponentIdGenerator` file placement):** `packages/ng-core/src/` currently groups files by concern into subdirectories (`config`, `base-editable-holder`, `icons`, `api`, `overlay`, `bind`, `focus-trap`, `basecomponent` — confirmed by directory listing). A new `packages/ng-core/src/id/component-id-generator.ts` (matching the specification's own sketch) follows this existing one-concern-per-subdirectory convention directly — no alternative placement was found to fit better.
- **Test-convention confirmation:** all 5 affected components' existing spec files (`packages/ng/src/dialog/dialog.spec.ts`, `packages/react/src/menu/menu.spec.tsx`, `packages/react/src/dialog/dialog.spec.tsx`, `packages/react/src/tooltip/tooltip.spec.tsx`, `packages/vue/src/menu/menu.spec.ts`) use Vitest, with `@angular/core/testing`'s `TestBed`, `@testing-library/react`'s `render`, and `@vue/test-utils`'s `mount` respectively — confirmed by reading each file's own imports. This plan's regression tests extend these same files with these same tools; no new test dependency is introduced anywhere.

---

## 1. Task List Overview

| # | Task | Depends on | Parallelizable with |
|---|---|---|---|
| 1 | React: migrate Menu/Dialog/Tooltip to `useId()` + regression tests | none | 2, 3 |
| 2 | Angular: `ComponentIdGenerator` service + Dialog migration + regression tests | none | 1, 3 |
| 3 | Vue: Menu migration to `useId()` via `setup()` bridge + regression tests | none | 1, 2 |
| 4 | Whole-change verification (full test suites, scope diff, non-goal confirmation) | 1, 2, 3 | — |

Task 4 is terminal. Tasks 1-3 are fully independent — three different framework packages, zero shared files, zero cross-task interface — and may be executed in parallel by separate subagents, consistent with this repository's established subagent-driven-development precedent (Tracks A/C/E all used this pattern for their own independent per-framework tasks).

---

## Task 1 — React: migrate Menu/Dialog/Tooltip to `useId()`

**Specification traceability:** §4 (React `useId()` migration), §9 items 1/2/3/4 (regression tests), §2 rows 2-4.

**What to change:**

1. `packages/react/src/menu/menu.tsx`: delete `let menuIdCounter = 0;` (line 54). Replace `const [menuId] = React.useState(() => id ?? \`u-menu-${++menuIdCounter}\`);` (line 84) with:
   ```tsx
   const generatedMenuId = React.useId();
   const menuId = id ?? generatedMenuId;
   ```
2. `packages/react/src/dialog/dialog.tsx`: delete `let dialogIdCounter = 0;` (line 38). Replace `const [dialogId] = React.useState(() => id ?? \`u-dialog-${++dialogIdCounter}\`);` (line 60) with:
   ```tsx
   const generatedDialogId = React.useId();
   const dialogId = id ?? generatedDialogId;
   ```
3. `packages/react/src/tooltip/tooltip.tsx`: delete `let tooltipIdCounter = 0;` (line 30). Replace `const [panelId] = React.useState(() => id ?? \`u-tooltip-${++tooltipIdCounter}\`);` (line 58) with:
   ```tsx
   const generatedPanelId = React.useId();
   const panelId = id ?? generatedPanelId;
   ```
4. All downstream usages of `menuId`/`dialogId`/`panelId` (suffix construction for `_list`/`_<index>`/`_header`/`_content`, ARIA attribute bindings) are left completely unchanged — per spec §4.2, these are plain string operations on whatever `menuId`/`dialogId`/`panelId` holds, indifferent to whether that value came from a counter or `useId()`.

**Regression tests to add** (append to each component's existing spec file — `menu.spec.tsx`, `dialog.spec.tsx`, `tooltip.spec.tsx`):

- **AC1.1 (uniqueness within one render, spec §9.1):** render two instances of the same component in one test (two `<UMenu>`/`<UDialog>`/`<Tooltip>` siblings, or two separate `render()` calls within the same `it()` block if the component doesn't support two instances in one tree cleanly) and assert their generated IDs differ.
- **AC1.2 (ARIA relationship integrity, spec §9.2):** for Menu, assert the container's `id` matches what `aria-activedescendant`/`aria-labelledby` reference; for Dialog, assert `aria-labelledby`/`aria-describedby` match the header/content elements' actual `id`s; for Tooltip, assert `aria-describedby` on the trigger matches the panel's `id`. Use `screen.getByRole(...)`/`container.querySelector(...)` plus direct attribute reads — not a snapshot of the literal ID string (per Task requirement below, literal `useId()` output must never be asserted on).
- **AC1.3 (observable behavior only — no reused ID across separate renders, spec §9.3 — NOT proof of G1):** render the same component twice in the same test file/process run (two separate `render()` calls in two separate `it()` blocks, or two sequential renders in one `it()` with cleanup between) and assert only what is externally observable: the two renders' generated DOM IDs are not the same string. **Do not assert anything about *how* the IDs differ** — no numeric-increment check, no derivation-strategy check, no assertion touching React's internal tree-position mechanism or any other implementation detail a black-box jsdom/Vitest test cannot actually see. The test's only job is to catch a regression back to retained module-scope counter behavior (which this observable "no ID reuse across separate renders" check is sufficient to catch, since the old counter's defect was specifically that a fresh render's ID depended on a prior render's — a `useId()`-based implementation with no cross-render dependency will simply produce a different ID each time, without any assumption about numeric or positional relationship needed to detect a regression). **The test itself, or a comment immediately above it, must state explicitly that this is a jsdom-level check for retained state, not a determinism proof — the real SSR proof is Track E's own Task 8.** Do not phrase this test's name or comment as "SSR determinism test" or similar — name it after what it actually checks (e.g., `"does not reuse the same generated id across separate renders"`).
- **AC1.4 (`id` prop override still wins, spec §9.4):** pass an explicit `id` prop to each of the three components and assert the rendered element carries exactly that ID, not a `useId()`-generated one.

**What NOT to do:**
- Do not assert on the literal string shape `useId()` produces (e.g. `:r1:`) anywhere in any test — per spec §4.2, this format is React-internal and not part of any contract this codebase relies on; asserting on it would create a brittle, React-version-coupled test for no benefit.
- Do not modify any other file under `packages/react` or `packages/react-core` — this task's diff is confined to the 3 named files plus their 3 spec files.
- Do not add a jsdom test and label it as proving cross-request SSR determinism (binding decision 9 above) — the AC1.3 test's own wording must reflect its actual, narrower scope.
- Do not touch `packages/react/src/tooltip/tooltip.ts` (the Vue file of a similar name lives elsewhere — this note exists only to prevent a cross-framework file-path confusion; the React Tooltip file is `tooltip.tsx`, already correctly named above).

**Acceptance criteria:**
- AC1.5: `pnpm --filter @ultimate/react run test` passes, including all new assertions.
- AC1.6: `git diff --stat` for this task touches exactly `packages/react/src/menu/menu.tsx`, `packages/react/src/menu/menu.spec.tsx`, `packages/react/src/dialog/dialog.tsx`, `packages/react/src/dialog/dialog.spec.tsx`, `packages/react/src/tooltip/tooltip.tsx`, `packages/react/src/tooltip/tooltip.spec.tsx` — no other file.
- AC1.7: grep confirms zero remaining occurrences of `menuIdCounter`, `dialogIdCounter`, `tooltipIdCounter` anywhere in `packages/react/src`.
- AC1.8: grep confirms zero test assertion anywhere in the touched spec files matches on a literal `u-menu-`, `u-dialog-`, or `u-tooltip-` prefixed numeric ID (the old format) — proving no stale pre-migration assertion survived un-updated.

---

## Task 2 — Angular: `ComponentIdGenerator` service + Dialog migration

**Specification traceability:** §6 (Angular design, concrete), §9 item 5 (Angular-specific regression test), §2 row 1.

**What to create:**

1. `packages/ng-core/src/id/component-id-generator.ts` (new file, new directory — per this plan's own OQ-3 resolution above):
   ```typescript
   import { Injectable } from "@angular/core";

   @Injectable()
   export class ComponentIdGenerator {
     private counter = 0;

     next(prefix: string): string {
       return `${prefix}_${++this.counter}`;
     }
   }
   ```
   (Exactly as specified in spec §6.2 — no deviation.)
2. `packages/ng-core/src/id/component-id-generator.spec.ts` (new test file, matching this repo's one-spec-per-source-file convention already used throughout `ng-core`): the Angular-specific regression test from spec §9.5 — instantiate `ComponentIdGenerator` fresh (plain `new ComponentIdGenerator()`, or via a fresh `TestBed` instance with it in `providers` if that better matches this package's own existing test conventions — check `packages/ng-core`'s other service spec files for the established pattern before choosing) and assert `.next('u_test')` returns `'u_test_1'` on the first call, `'u_test_2'` on the second, and that a **second, separately-created** instance also starts at `'u_test_1'` — proving no state survives across instances (the Angular-specific analogue of "no module-scope counter remains").
3. Export `ComponentIdGenerator` from `packages/ng-core`'s public entry point (find and follow the existing export-aggregation pattern — check `packages/ng-core/src/index.ts` or equivalent barrel file for how other services like this are currently exported, and match it exactly).

**What to change:**

4. `packages/ng/src/dialog/dialog.ts`: delete `let dialogIdCounter = 0;` (line 22). Inject the new service: add `private readonly idGenerator = inject(ComponentIdGenerator);` alongside the existing `private readonly injector = inject(Injector);` (line 185). Replace `protected readonly ariaLabelledBy = \`u_dialog_${++dialogIdCounter}_header\`;` (line 187) with:
   ```typescript
   protected readonly ariaLabelledBy = `${this.idGenerator.next("u_dialog")}_header`;
   ```
   Import `ComponentIdGenerator` from `@ultimate/ng-core` at the top of the file, matching this file's existing import style for other `ng-core` symbols.
5. **Provide `ComponentIdGenerator` at application bootstrap** — this is a consumer-facing requirement, not something `dialog.ts` itself can satisfy alone (the service has no `providedIn`, per binding decision 3). Two things need this:
   - Track E's already-built `apps/playground-angular` harness (both `apps/playground-angular/src/main.ts` and `apps/playground-angular/src/main.server.ts`) needs `ComponentIdGenerator` added to its `providers` array once this fix lands, or its Dialog component will throw a "no provider for `ComponentIdGenerator`" error the next time Track E resumes and that harness is rebuilt. **This plan does not modify Track E's files directly** (Track E is paused, not this plan's to edit) — instead, this task's own completion report must explicitly flag this exact required follow-up edit (file paths, exact provider-array addition) so whoever resumes Track E applies it as part of that resumption, not forgotten. See Task 4's verification step for confirming this flag was actually raised.
   - Document this requirement in `packages/ng/src/dialog/dialog.ts`'s own JSDoc/comment directly above the `UDialog` class or the `ariaLabelledBy` field (whichever this codebase's existing convention prefers — check nearby doc comments in the same file for the established style), stating plainly: "Consumers must provide `ComponentIdGenerator` (from `@ultimate/ng-core`) in their application's bootstrap providers for this component to function — it has no default provider." This is the permanent, in-source record of the new consumer-facing requirement this fix introduces, independent of Track E.

**Regression tests to add** (append to `packages/ng/src/dialog/dialog.spec.ts`):

- **AC2.1 (uniqueness within one render, application/TestBed injector scope, spec §9.1):** `ComponentIdGenerator` must be provided at the `TestBed`/application injector level — i.e., in `TestBed.configureTestingModule({ providers: [ComponentIdGenerator] })` — **not** in either `UDialog`'s own component-level `providers` array nor a host component's component-level `providers` array. This is the exact analogue of the production design (§6.2/§6.4: the service is provided once, at application bootstrap, not per-component) and is the whole point of this test: it must prove that two `UDialog` instances constructed within the *same* `TestBed`/application injector context correctly **receive and share the same `ComponentIdGenerator` instance**, and consequently produce **distinct, sequential** IDs from that one shared instance (e.g. `u_dialog_1_header`, `u_dialog_2_header` — not two independent `u_dialog_1_header`s, which is what a component-scoped or per-instance-provided generator would incorrectly produce). Render two `UDialog` instances in one `TestHostComponent` (or two separate `TestBed.createComponent()` calls against the same configured `TestBed`, whichever this file's existing test-host pattern supports more naturally — check the file's current structure before choosing) and assert both the difference (two distinct IDs) and the sequential relationship (proving one shared instance actually served both). This is a stronger, more specific assertion than "the two IDs merely differ" — it is what actually exercises and proves the application-injector-scoping design, not just a side effect of it. The separate `component-id-generator.spec.ts` fresh-instance-isolation test (Task 2 item 2) remains unchanged and is not replaced by this — that test proves a *new* generator instance starts clean; this test proves *one shared* instance, provided at the correct injector level, correctly serves multiple consumers within one application/request context.
- **AC2.2 (ARIA relationship integrity, spec §9.2):** assert the header `<span>`'s actual `id` (dialog.ts:129) matches the dialog root's `aria-labelledby` value (dialog.ts:124) when the dialog is open.
- **AC2.3 (Angular-specific state-isolation test, spec §9.5):** covered by `component-id-generator.spec.ts` (Task 2 item 2 above) rather than duplicated in `dialog.spec.ts` — `dialog.spec.ts`'s own tests only need to confirm `UDialog` correctly delegates to whatever `ComponentIdGenerator` instance it's given (AC2.1/AC2.2 above already do this); the generator's own internal correctness is `component-id-generator.spec.ts`'s job, not `dialog.spec.ts`'s, avoiding duplicate coverage of the same fact from two files.
- **AC2.4 (no provider throws clearly, new — not in spec but a natural consequence of introducing a required-but-unprovided-by-default service):** a test confirming that constructing a `UDialog` in a `TestBed` configuration that does **not** provide `ComponentIdGenerator` throws Angular's own standard "no provider" error (`NullInjectorError` or equivalent) rather than silently producing `undefined`/a broken ID — this is the automated proof that the JSDoc requirement added in item 5 above is real and enforced, not just documented.

**What NOT to do:**
- Do not add `providedIn: 'root'` to `ComponentIdGenerator` (binding decision 3; OQ-2 resolved as "keep explicit" above) unless this task's own implementer finds a concrete, evidence-based reason the specification's stated rationale is wrong — if so, stop and report the finding rather than silently switching, per this repository's own standing escalation convention for deviating from an approved design.
- Do not add any "reset" method to `ComponentIdGenerator` — none is needed (a fresh instance per bootstrap already achieves G1) and adding one would invite exactly the kind of manual-reset misuse the specification's binding decision 4 forbids.
- Do not modify Track E's `apps/playground-angular` files directly in this task — flag the required follow-up (item 5 above) in this task's report instead.
- Do not modify `packages/ng/src/dialog/dialog.ts` beyond the single field/import/injection change specified in item 4 — no unrelated refactor of the surrounding class.
- Do not provide `ComponentIdGenerator` in `UDialog`'s own `@Component({ providers: [...] })` array, nor in any host/test component's component-level `providers` array, anywhere in production code or in AC2.1's own test — this would silently give every `UDialog` instance (or every host-scoped group of instances) its own separate generator, defeating the one-shared-instance-per-application/request design (§6.2) without any visible error, since Angular's hierarchical DI would simply resolve the injection from the nearer, incorrect provider instead of the intended application-level one. AC2.1 exists specifically to catch this exact mistake.

**Acceptance criteria:**
- AC2.5: `pnpm --filter @ultimate/ng-core run test` and `pnpm --filter @ultimate/ng run test` both pass, including all new assertions.
- AC2.6: `git diff --stat` for this task touches exactly `packages/ng-core/src/id/component-id-generator.ts` (new), `packages/ng-core/src/id/component-id-generator.spec.ts` (new), `packages/ng-core/src/index.ts` (or the actual barrel file, whichever it is), `packages/ng/src/dialog/dialog.ts`, `packages/ng/src/dialog/dialog.spec.ts` — no other file, and specifically no file under `apps/playground-angular`.
- AC2.7: grep confirms zero remaining occurrences of `dialogIdCounter` anywhere in `packages/ng/src`.
- AC2.8: this task's completion report explicitly names the exact Track-E-resumption follow-up (adding `ComponentIdGenerator` to `apps/playground-angular/src/main.ts` and `main.server.ts`'s provider arrays), stating plainly that Track E's SSR execution must not resume until this wiring is applied — confirmed present in the report text as a clearly labeled requirement, not merely implied. This is carried forward into Task 4's own mandatory "Track E resumption prerequisite" report section (see Task 4).

---

## Task 3 — Vue: Menu migration to `useId()` via `setup()` bridge

**Specification traceability:** §5 (Vue `useId()` migration, as resolved by this plan's own OQ-1 research above), §9 items 1/2/3/4, §2 row 5.

**What to change:**

1. `packages/vue/src/menu/Menu.vue`: delete `let uidCounter = 0;` (line 61). Add a `setup()` hook to `Menu.vue`'s own component options object (not to `createBaseMenu()` — confirmed by this plan's own research that no ancestor in the mixin chain defines `setup()`, so there is no merge conflict to resolve, and adding it directly on `Menu.vue` keeps the change minimally scoped to the one file that actually needs it):
   ```typescript
   import { useId } from "vue";

   // inside Menu.vue's component options object, alongside `extends: createBaseMenu()`:
   setup() {
     return { generatedMenuId: useId() };
   },
   ```
   Replace `data()`'s `menuId: \`u-menu-${++uidCounter}\`,` (line 97) with `menuId: \`u-menu-${this.generatedMenuId}\`,`. This relies on Vue's own documented execution order (`setup()` runs before any Options API hook including `beforeCreate`, confirmed in this plan's header research) — `this.generatedMenuId` is guaranteed available by the time `data()` executes.
2. `itemId(i)` (Menu.vue:124) and every other downstream usage of `this.menuId` are left completely unchanged — same rationale as React's Task 1 item 4: these are plain string operations indifferent to how `menuId` was produced.

**Regression tests to add** (append to `packages/vue/src/menu/menu.spec.ts`):

- **AC3.1 (uniqueness within one render, spec §9.1):** `mount()` two separate `UMenu` instances in the same test and assert their `menuId`-derived container `id`s differ.
- **AC3.2 (ARIA relationship integrity, spec §9.2):** assert `aria-activedescendant` (when a menu item is focused) matches the actual `id` of the corresponding item element (via `itemId(i)`).
- **AC3.3 (observable behavior only — no reused ID across separate mounts, spec §9.3 — NOT proof of G1):** `mount()` the same component twice in the same test-process run and assert only what is externally observable: the two mounts' generated DOM IDs are not the same string. Do not assert anything about how they differ (no numeric-increment check, no derivation-strategy check) — same scope discipline as Task 1's AC1.3, applied here to Vue's `useId()` output. Same naming/comment discipline as Task 1's AC1.3 — the test or its comment must explicitly disclaim being an SSR-determinism proof.
- **AC3.4 (`id`-equivalent prop override, if `UMenu` supports one — check the component's actual props before writing this test; spec §9.4 names this as required "for... Vue's Menu" but this plan does not assume `UMenu` has an explicit `id`-override prop without confirming it first):** if `UMenu` has a prop that overrides the generated ID (mirroring React's `id ?? generated` pattern), test that it wins. If no such prop exists on `UMenu` today, this specific sub-check is not applicable — note this explicitly in the task's completion report rather than fabricating a prop that doesn't exist, since spec §9.4's requirement is conditioned on the override mechanism actually existing for each named component and this plan's own research (§2, this document's header) did not confirm `UMenu` has one the way React's three components do.

**What NOT to do:**
- Do not add a `setup()` hook to `createBaseMenu()` or any other shared mixin — the change is scoped to `Menu.vue` itself, since it's the only component with this defect (binding decision 8: no speculative application elsewhere).
- Do not introduce a `computed` property wrapping `useId()` — Vue's own documentation (cited in the specification) explicitly warns against calling `useId()` inside a `computed` context; this task's `setup()`-return-value approach avoids that entirely by calling `useId()` directly in `setup()`, once.
- Do not modify `packages/vue/src/tooltip/tooltip.ts` or any file under `packages/uix-styles/src/tooltip` — the Tooltip CSS defect remains explicitly out of scope (binding decision 6).
- Do not modify `packages/vue-core/src/base/*` or `packages/vue/src/menu/BaseMenu.ts` — confirmed by this plan's own research that neither needs to change for this fix.

**Acceptance criteria:**
- AC3.5: `pnpm --filter @ultimate/vue run test` passes, including all new assertions.
- AC3.6: `git diff --stat` for this task touches exactly `packages/vue/src/menu/Menu.vue` and `packages/vue/src/menu/menu.spec.ts` — no other file.
- AC3.7: grep confirms zero remaining occurrences of `uidCounter` anywhere in `packages/vue/src/menu/`.
- AC3.8: grep confirms zero test assertion anywhere in `menu.spec.ts` matches on a literal `u-menu-<number>` string pattern (the old format) for any newly-added test — proving no stale pre-migration assertion pattern survived un-updated in the new tests (pre-existing tests unrelated to ID format are unaffected and out of this check's scope).

---

## Task 4 — Whole-change verification

**Specification traceability:** §7 (cross-framework hydration-stability summary), §8 (concurrency), §11 (explicit non-goals), all of §9.

**What to verify, in order:**

1. `pnpm --filter @ultimate/react run test`, `pnpm --filter @ultimate/ng run test`, `pnpm --filter @ultimate/ng-core run test`, `pnpm --filter @ultimate/vue run test` all pass — the full set of affected packages' own test suites, re-run together after all three tasks are merged (not just each task's own isolated run), to catch any cross-task interaction (there should be none, given zero shared files, but this is the explicit re-confirmation).
2. `git diff --stat` against this plan's own baseline (§ header) is reviewed end-to-end and confirmed to match the **union** of Tasks 1/2/3's own AC1.6/AC2.6/AC3.6 file lists exactly — no additional file, no file from one task's list missing.
3. Grep the whole diff for `Math.random`, `Date.now`, or any other nondeterminism source accidentally introduced by this fix itself (not expected, but a cheap, explicit check given this fix's entire purpose is determinism).
4. Confirm, by reading Task 2's completion report, that the required Track-E-resumption follow-up (AC2.8) is present and specific enough to act on without re-deriving it, then reproduce it as this task's own mandatory "Track E resumption prerequisite" report section (see below) — this is a required output of this task, not merely a verification step.
5. Confirm no file under `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, or any other Track E artifact (`docs/superpowers/specs/2026-09-11-*`, `docs/superpowers/plans/2026-09-11-*`, Track E's own progress ledger) appears anywhere in this whole change's diff — this fix must be fully transparent to Track E's own already-reviewed state.
6. Confirm no file under `packages/vue/src/tooltip` or `packages/uix-styles/src/tooltip` appears in the diff (binding decision 6 / Task 3's own NOT-to-do item).
7. Re-read each of the three tasks' new/modified test files' new test names and any accompanying comments, confirming none of them claims to prove cross-request SSR determinism (G1) — only Track E's own Task 8 makes that claim, once Track E resumes with this fix in place.

**What NOT to do:**
- Do not commit at the end of this task — per this work item's own standing constraint (mirroring Track E's own convention), verification reports; committing is a separate, explicitly-requested action.
- Do not attempt to run Track E's own Task 8 (it does not exist yet — Track E is paused before that task) as part of this verification; this fix's own scope ends at the unit-test level, per spec §9's own "explicitly not required" clause.

**Required mandatory final-report section — "Track E resumption prerequisite":**

Task 4's own completion report MUST include a section with exactly this heading, populated as a required (not optional) handoff/verification item, not a passing note:

> ## Track E resumption prerequisite
>
> `ComponentIdGenerator` (from `@ultimate/ng-core`) must be added to the application bootstrap providers in both:
> - `apps/playground-angular/src/main.ts`
> - `apps/playground-angular/src/main.server.ts`
>
> **Track E's SSR execution must not resume until this provider wiring is applied.** Without it, `UDialog`'s constructor will throw Angular's "no provider for `ComponentIdGenerator`" error the moment Track E's Angular harness is next built and run, since this fix removes `dialog.ts`'s old module-scope counter fallback entirely and the service now has no default provider (by design — see this plan's binding decision 3).

This section is not satisfied by a paraphrase or a cross-reference to Task 2's own report — it must be reproduced in Task 4's own final report, verbatim or near-verbatim, as the last thing a reader of that report sees before this work item is considered complete. Track E's own files remain completely untouched by this plan (no task here edits `apps/playground-angular` directly) — this section exists solely to guarantee the requirement is not lost between this work item's completion and whoever next resumes Track E.

**Acceptance criteria:**
- AC4.1: All 5 affected packages' test suites pass together, evidence (command + output summary) presented.
- AC4.2: The combined diff exactly matches Tasks 1-3's own stated file lists — no more, no less.
- AC4.3: Steps 3, 5, 6, 7 above each return a clean/negative result (no nondeterminism introduced, no Track E file touched, no Tooltip CSS file touched, no mislabeled determinism-proof test), each explicitly confirmed in this task's own report.
- AC4.4: Task 4's final report contains the "Track E resumption prerequisite" section exactly as specified above — this is a mandatory pass/fail criterion for Task 4 itself, not a courtesy note. A Task 4 report missing this section, or stating the requirement only implicitly/by cross-reference, does not satisfy AC4.4 and Task 4 is not complete.

---

## Key decisions (summary)

1. React: `useState(() => id ?? \`prefix-${++counter}\`)` → `React.useId()` fallback, in all three affected components, verbatim per spec §4 — no deviation found necessary during this plan's research.
2. Angular: new `ComponentIdGenerator` service at `packages/ng-core/src/id/component-id-generator.ts` (OQ-3 resolved: matches `ng-core`'s existing one-concern-per-subdirectory convention), explicitly provided (not `providedIn: 'root'`, OQ-2 resolved: no reason found to change the specification's default), injected into `UDialog` in place of its module-scope counter.
3. Vue: `Menu.vue` gains its own `setup()` hook returning `useId()`'s result (OQ-1 resolved: confirmed via Vue's own docs that `setup()` runs before `data()`, and confirmed via source read that no ancestor mixin already defines a conflicting `setup()`) — the mixin chain itself (`createBaseMenu()`, `vue-core`'s base classes) is untouched.
4. A new, previously-undocumented consumer-facing requirement is introduced by the Angular fix specifically: any application bootstrapping `@ultimate/ng`'s `UDialog` must now provide `ComponentIdGenerator`. This is documented in-source (Task 2 item 5) and explicitly flagged as a required Track-E-resumption follow-up (Task 2's AC2.8, Task 4's AC4.4) rather than silently assumed to be someone else's problem to discover.
5. All regression tests are unit-level (existing Vitest/jsdom/TestBed-based spec files, extended in place) — no new test infrastructure, no end-to-end SSR-server test written by this plan (that remains Track E Task 8's exclusive domain, per spec §9's explicit non-goal and this plan's own binding decision 9).

## Explicit acceptance criteria

See each task's own AC list above; Task 4 aggregates them as this work item's final verification gate.

## Dependencies and sequencing

- Tasks 1, 2, and 3 are fully independent (three different framework packages, zero shared files) and may run in parallel.
- Task 4 depends on all three.
- This entire work item is a prerequisite for Track E's Task 8 to pass for Vue's Menu and React's Menu specifically (spec §10) — Track E's own Tasks 5-7 could in principle proceed without waiting for this fix (spec §10 confirms they don't need rewriting), but the human's own architecture decision was to land this fix before Track E resumes at all, which this plan does not reopen.

## Unresolved implementation-level questions (legitimately deferred to Task-level implementer judgment, not further plan review)

1. Exact `TestBed`/service-instantiation pattern for `component-id-generator.spec.ts` (plain `new` vs. a fresh `TestBed` instance) — Task 2 item 2 defers this to whatever `ng-core`'s other existing service spec files already establish as convention; not fixed here since this plan's own research did not survey every existing `ng-core` service spec file exhaustively.
2. Exact `TestBed` test-host structure for Task 2's AC2.1 (two `UDialog` instances in one host vs. two separate `TestBed.createComponent()` calls) — left to whichever the existing `dialog.spec.ts` file's own structure supports more naturally, per that task's own instruction.
3. Whether `UMenu` (Vue) has an existing `id`-override prop at all (Task 3's AC3.4) — not confirmed by this plan's own research; the task itself instructs its implementer to check first and skip the sub-test cleanly (with a report note) if no such prop exists, rather than inventing one.

## Amendment Note (this pass)

This revision applies three targeted corrections from the first Plan Review, none of which reopen the approved architecture (`useId()` for React/Vue, explicit non-`providedIn` `ComponentIdGenerator` for Angular, no reset API, no ID normalization):

1. **AC1.3/AC3.3 rescoped to observable behavior only** — both tests now assert only "the two renders' generated IDs are not the same string," with an explicit prohibition (in both the AC text and its surrounding rationale) against asserting anything about numeric increments, derivation strategy, or tree-position internals a jsdom/Vitest black-box test cannot actually observe. The explicit "not proof of G1" disclaimer is retained unchanged.
2. **Task 4 gains a mandatory "Track E resumption prerequisite" report section** (verbatim heading and required content specified in Task 4 above), promoted from a "restate the note" acceptance criterion (previously AC4.4) to a required, exactly-specified, pass/fail report section — Task 2's own AC2.8 is correspondingly strengthened to state the "must not resume until applied" language explicitly, not just "flag the follow-up."
3. **Task 2's AC2.1 rewritten to enforce and prove application/TestBed injector scope** — the test must now provide `ComponentIdGenerator` at the `TestBed`/application level only (never component-level, for either `UDialog` or any test host), and must prove two `UDialog` instances in that one context share the same generator instance (sequential IDs), not merely that two IDs happen to differ. A new explicit "do not provide at component level" prohibition was added to Task 2's own NOT-to-do list to prevent an implementer from satisfying the old, weaker assertion via the wrong mechanism. The separate fresh-instance-isolation test in `component-id-generator.spec.ts` is unchanged and unaffected — the two tests now cover genuinely distinct properties (fresh-instance isolation vs. correct shared-instance scoping) rather than any overlap.

No change was made to: the choice of `useId()` for React/Vue, the Angular service's design or lack of `providedIn`/reset API, the affected-component list, the Tooltip CSS exclusion, or any Track E file (still completely untouched by this plan).

## Plan Review Gate

**IMPLEMENTATION PLAN — READY FOR REVIEW**

Not self-approved. This plan does not authorize implementation to begin; Plan Review remains the next gate. No `packages/*` file has been modified in producing this plan.
