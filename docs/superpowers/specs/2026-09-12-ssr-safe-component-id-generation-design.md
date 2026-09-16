# SSR-Safe Component ID Generation — Specification Proposal

**Status:** Draft for review. **Not part of Phase 10 Track E.** This is a separate, standalone work item with its own gate sequence (Specification → Spec Review → Implementation Plan → Plan Review → Implementation), scoped and requested independently after Track E's escalated finding.
**Date:** 2026-09-12
**Scope:** Specification only. No implementation, no `packages/*` changes, no commit.
**Origin:** `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` (Track E's escalated finding, evidence and reproduction already established there — not re-derived here).
**Architecture decision already made (binding, not reopened here):** fix the defect across all three frameworks, as a separate work item from Track E, before Track E's Tasks 5-7 resume. React and Vue use their respective framework-native `useId()` mechanisms. Angular uses a newly-designed application-injector-scoped ID generator, which is request-isolated under Angular SSR because this repository's SSR harness creates the application injector via bootstrap/render once per request — an SSR-host lifecycle property, not a new Angular request-scope abstraction. The fix is scoped to the demonstrated ID-generation defect only — no adjacent cleanup, no unrelated ID/accessibility work.

---

## 1. Problem statement (carried forward from the escalation, not re-argued)

Five component-ID usages across three framework packages use a module-scope, process-lifetime-persistent counter to generate element IDs that feed real ARIA attributes. In a long-running SSR server process, this produces non-deterministic output across requests and, confirmed for Vue specifically, a silent client-side ID rewrite during hydration with no warning. See the origin document for full reproduction evidence; this specification does not repeat it, only references it where a design decision depends on a specific piece of that evidence.

## 2. Every currently affected component and ID path (complete enumeration)

| #   | Framework | File                                           | Counter            | ID produced                                               | Feeds                                                                                            |
| --- | --------- | ---------------------------------------------- | ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Angular   | `packages/ng/src/dialog/dialog.ts:22,187`      | `dialogIdCounter`  | `u_dialog_<n>_header`                                     | `aria-labelledby` (dialog.ts:124), the header `<span>`'s own `id` (dialog.ts:129)                |
| 2   | React     | `packages/react/src/menu/menu.tsx:54,84`       | `menuIdCounter`    | `u-menu-<n>` (+ `_list`, `_<index>` suffixes)             | `aria-labelledby`, `aria-activedescendant` (menu.tsx:365-367), item `id`s (menu.tsx:327,355,361) |
| 3   | React     | `packages/react/src/dialog/dialog.tsx:38,60`   | `dialogIdCounter`  | `u-dialog-<n>` (+ `_header`, `_content` suffixes)         | `aria-labelledby`, `aria-describedby` (dialog.tsx:173-174)                                       |
| 4   | React     | `packages/react/src/tooltip/tooltip.tsx:30,58` | `tooltipIdCounter` | `u-tooltip-<n>`                                           | `aria-describedby` (tooltip.tsx:112-113)                                                         |
| 5   | Vue       | `packages/vue/src/menu/Menu.vue:61,97`         | `uidCounter`       | `u-menu-<n>` (+ `_<index>` via `itemId(i)`, Menu.vue:124) | `aria-activedescendant` (Menu.vue:9)                                                             |

No sixth instance exists. Confirmed by a targeted grep for the `let.*Counter\s*=\s*0` / `IdCounter` idiom across all five `*-core`/framework `src` trees during the escalation; not re-run here since the origin document already establishes this as exhaustive at commit `dfc5e97`.

**Update (post-implementation cross-reference):** A sixth instance was later discovered in `packages/vue/src/dialog/Dialog.vue` (lines 84, 124) during Task 4 verification of this specification's implementation. The defect and its remediation were addressed via a separate scope amendment: see `docs/superpowers/specs/2026-09-12-vue-dialog-id-scope-amendment.md` and its companion implementation plan `docs/superpowers/plans/2026-09-12-vue-dialog-id-scope-amendment-implementation.md`. The evidence and rationale for this sixth instance are fully documented in `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`.

**Explicitly not in scope:** Vue's Tooltip CSS visibility gap (`packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` never applying a position-modifier class). That defect does not touch ID generation, was not found to be structurally coupled to it (the tooltip's `id` generation and its class-list construction are independent statements in the same function, sharing no variable or control flow), and is explicitly excluded per this work item's own scope boundary. It remains its own, separately tracked production defect.

## 3. Design goal

> Generate component IDs in a way that remains stable across server/client hydration and safe across long-running SSR processes, while preserving the existing ARIA relationships and component behavior.

Three sub-goals, all binding:

- **G1 (cross-request SSR independence):** for each SSR request, generated IDs must be independent of prior SSR requests in the same long-running process — no process-lifetime counter or other shared mutable state may leak across requests. This is the specific defect being closed (module-scope counters persisting across the life of the server process); it does not require that arbitrary repeated _client-side_ mounts/renders necessarily produce the same literal ID string — that is a separate property, addressed only where a specific mechanism (e.g. Vue's `useId()`, §5.2) makes an explicit, framework-documented claim about it.
- **G2 (hydration stability):** the ID the server renders for a given request must be the exact ID the client's hydration pass computes for that same request — no silent post-hydration rewrite (closing Vue's confirmed defect).
- **G3 (no regression):** every existing ARIA relationship (`aria-labelledby`, `aria-describedby`, `aria-activedescendant`) must continue to resolve correctly; the visual/behavioral contract of Dialog, Menu, and Tooltip is otherwise unchanged.

## 4. React — `useId()` migration

### 4.1 What changes

All three affected React files (`menu.tsx`, `dialog.tsx`, `tooltip.tsx`) replace their `useState(() => id ?? \`u-<thing>-${++counterVar}\`)`pattern with React's built-in`useId()`:

```tsx
// Before (menu.tsx:84):
const [menuId] = React.useState(() => id ?? `u-menu-${++menuIdCounter}`);

// After:
const generatedId = React.useId();
const menuId = id ?? generatedId;
```

The `menuIdCounter`/`dialogIdCounter`/`tooltipIdCounter` module-scope `let` declarations (menu.tsx:54, dialog.tsx:38, tooltip.tsx:30) are deleted entirely — `useId()` needs no counter of any kind.

### 4.2 Migration implications

- **Format change:** `useId()` produces IDs in React's own internal format (e.g. `:r1:`), not the `u-menu-<n>` string shape the current counter produces. This is fine for ID _uniqueness_ and _ARIA-relationship_ purposes (nothing in this codebase parses or pattern-matches the ID's contents — confirmed by grep across `packages/react`/`packages/react-core` for any regex or string-parsing of `menuId`/`dialogId`/`panelId` beyond direct equality/interpolation), but any **existing test** that asserts on the literal `u-menu-1`/`u-dialog-1` string shape will need updating (see §9).
- **Suffix construction unaffected:** `menuId + "_list"`, `menuId + "_" + index`, `dialogId + "_header"` etc. all continue to work identically — `useId()` returns a plain string, and these are simple string concatenations, not dependent on the counter's numeric format.
- **`id` prop override unaffected:** each component's existing `id ?? <generated>` fallback pattern is preserved exactly — an explicit `id` prop from the consumer still wins; `useId()` is only the fallback source, exactly as the counter was.
- **G2 (hydration stability) is satisfied by construction:** per React's own documentation (quoted in the origin escalation), `useId()` is generated from the component's position in the render tree ("parent path"), which is identical between server and client renders of the same tree — this is the exact mechanism that prevents the class of mismatch the origin document confirmed does NOT currently manifest for React (React's hydration already tolerated the counter-based mismatch silently in observed testing), but which `useId()` closes structurally rather than accidentally.
- **No new dependency:** `useId` has shipped in React since 18.0; this repository already pins `react`/`react-dom` at `^18.3.1` (confirmed, `packages/react/package.json`). No `package.json` change needed for this migration.
- **Rules-of-Hooks compliance:** `useId()` must be called unconditionally at each component's top level — confirmed compatible with all three affected components' current structure (none currently call their existing `useState` counter-fallback conditionally or after an early return; verified by reading each call site's surrounding code during this specification's research).

## 5. Vue — `useId()` migration

### 5.1 What changes

`Menu.vue`'s Options-API `data()` (or equivalent lifecycle hook, matching this repository's existing Options-API `extends` mixin architecture, ADR-032) replaces its `menuId: \`u-menu-${++uidCounter}\``computation with Vue 3.5's built-in`useId()`:

```ts
// Before (Menu.vue:97):
menuId: `u-menu-${++uidCounter}`,

// After (exact call-site mechanics depend on how this repository's
// Options-API `extends` mixin pattern integrates Composition API helpers —
// see Open Question OQ-1 below):
menuId: `u-menu-${useId()}`,
```

The `uidCounter` module-scope `let` declaration (Menu.vue:61) is deleted entirely.

### 5.2 Migration implications

- **Format:** Vue's `useId()` produces IDs like `v-0`, `v-1` (or a configured `app.config.idPrefix`) — same category of change as React's, same "no code in this repo parses the ID's contents" conclusion applies (confirmed by the same grep sweep, extended to `packages/vue`/`packages/vue-core`).
- **G2 (hydration stability) is Vue's own documented purpose for this API** — per Vue's own docs (quoted in the origin escalation): "stable across server and client renders... preventing hydration mismatches." This directly closes the **confirmed, observed** Vue hydration defect (the silent server→client ID rewrite documented in the origin escalation §3.1) — this is the one instance in this proposal where the fix is closing a demonstrated bug, not merely a theoretical determinism gap.
- **`useId` must be called during setup, not inside a lifecycle hook or computed property** — Vue's own documentation (quoted in the origin escalation) explicitly warns against calling it inside `computed`. `Menu.vue`'s current `data()`-time computation (Options API) needs to become a Composition-API `setup()`-time call (or the equivalent this repository's ADR-032 mixin pattern uses elsewhere, if it already has a bridge for exactly this — see Open Question OQ-1) whose _result_ is then exposed to the Options-API instance, not a `data()` function invoking `useId()` directly (since `data()` may be re-invoked in ways Vue does not treat identically to a genuine one-time setup call — this needs implementation-time confirmation against how this repository's existing mixin bridges Composition helpers into Options components, since no other component in this codebase currently does so, per this specification's research — see OQ-1).
- **Version requirement met:** `useId()` requires Vue 3.5+; this repository pins `vue` at `^3.5.13` (confirmed, `packages/vue/package.json`) — already satisfied, no dependency change needed.
- **No `app.config.idPrefix` change needed:** this repository's harnesses (and presumably any real consumer) mount exactly one Vue app per page; the multi-app-on-one-page scenario `idPrefix` exists for does not apply here and is not part of this fix's scope.

## 6. Angular — application-injector-scoped ID generator design (concrete)

Angular has no direct `useId()`-equivalent single-call API (confirmed absent from official current documentation during the origin escalation's research). The fix instead uses Angular's own dependency-injection lifecycle as-is: a service scoped to the application injector, which this repository's SSR host already creates fresh per request (§6.1) — an existing SSR-host lifecycle property this design relies on, not a new Angular request-scope abstraction being introduced.

### 6.1 The mechanism this design relies on (verified, not assumed)

Per Angular's own official documentation (`angular.dev/guide/di/hierarchical-dependency-injection`, fetched during this specification's research): `bootstrapApplication()` "creates a child injector of the platform injector," configured by the `ApplicationConfig` passed to it. Track E's own already-built, already-reviewed Angular harness (`apps/playground-angular/src/server.ts`, Task 2) already confirms this concretely: its `CommonEngine`-based server calls `bootstrapApplication()` (via `renderApplication()`) **once per incoming HTTP request** — meaning a fresh application injector, and therefore a fresh instance of any injectable service registered without `providedIn: 'root'` singleton semantics, is created for every request already, as a natural consequence of how Angular SSR works, not something this fix needs to build.

### 6.2 Concrete design

```typescript
// packages/ng-core/src/id/component-id-generator.ts (new file)

import { Injectable } from "@angular/core";

@Injectable() // deliberately NOT providedIn: 'root' — see rationale below
export class ComponentIdGenerator {
  private counter = 0;

  next(prefix: string): string {
    return `${prefix}_${++this.counter}`;
  }
}
```

`Injectable()` with no `providedIn` means this service has no default singleton provider — it must be explicitly provided, and Angular creates a new instance per injector it's provided into. Concretely:

- **The application's own bootstrap** (both `apps/playground-angular/src/main.ts` and `main.server.ts`, and — critically — any real `@ultimate/ng` consumer's own bootstrap) provides `ComponentIdGenerator` once, in its top-level `providers` array, alongside `provideClientHydration()`/`provideServerRendering()`. Since `bootstrapApplication()` creates one fresh child injector per call, and Angular's own SSR pipeline calls `bootstrapApplication()` once per request (§6.1), this single provider registration is sufficient — no per-component or per-module re-provision is needed, and no manual "reset the counter" logic is ever written anywhere.
- **`UDialog` (and any future component needing this pattern)** injects it normally: `private readonly idGenerator = inject(ComponentIdGenerator);` and calls `this.idGenerator.next('u_dialog')` in place of `++dialogIdCounter`, at the same point in its lifecycle (component construction) the counter was previously read.
- **Client-side bootstrap symmetry:** the exact same provider registration is used in `main.ts` (client) as in `main.server.ts` (server) — this is already the existing pattern this repository's harnesses use for `provideClientHydration()`/`provideServerRendering()` (client and server bootstraps sharing a provider list, differing only in the SSR-vs-hydration-specific providers), so this fix introduces no new asymmetry-management burden.

### 6.3 Why this satisfies G1/G2/G3 without inventing a "global reset" or "process-level counter reset" (both explicitly forbidden by the decision)

- **G1 (cross-request SSR independence):** because a fresh `ComponentIdGenerator` instance is created every time `bootstrapApplication()` runs (once per request, per §6.1), its internal `counter` always starts at `0` for every request — no global/process-level state is ever shared or reset; there is simply never a process-level counter to reset in the first place. This closes the specific defect G1 targets (cross-request state leakage) using Angular's own DI lifecycle instead of a framework-provided hook; it makes no claim about repeated client-side renders producing identical literal IDs, consistent with G1's scope.
- **G2 (hydration stability):** the client's own bootstrap creates its own fresh `ComponentIdGenerator` starting at `0` for the one page it's hydrating — since exactly one component tree is being hydrated (matching the one tree the server rendered for that request), the client's sequence of `.next()` calls, encountered in the same tree-traversal order as the server's, produces the identical sequence of IDs, **provided component construction order is deterministic and identical between server and client** — which Angular's own hydration contract already requires unconditionally for structural reasons (per `angular.dev/guide/hydration`, already quoted in Track E's own research: "the application generates the exact same DOM structure on both the server and the client"). This fix does not need to separately guarantee tree-traversal-order consistency; it inherits that guarantee from Angular's pre-existing, load-bearing hydration contract.
- **G3 (no regression):** `ComponentIdGenerator.next(prefix)` produces the same string shape (`<prefix>_<n>`) the old counter produced, just sourced from an injected instance instead of a closed-over module variable — the `ariaLabelledBy` field's assignment site changes from `` `u_dialog_${++dialogIdCounter}_header}` `` to `` `${idGenerator.next('u_dialog')}_header` ``, but the resulting string format, and every downstream `aria-labelledby`/template binding that reads `ariaLabelledBy`, is unchanged.

### 6.4 Why not `providedIn: 'root'`

A `providedIn: 'root'` service is a genuine singleton _per root injector_ — and since Angular's own SSR pipeline creates one root injector per `bootstrapApplication()` call (i.e., per request), a `providedIn: 'root'` `ComponentIdGenerator` would actually behave identically to the explicit-provider design above for this specific use case. The explicit (non-`providedIn`) form is specified instead purely for clarity and intent-signaling — it makes the "this must be provided fresh at the application's own bootstrap, not silently available everywhere via tree-shakeable injection" contract visible at the provider-list call site, rather than implicit in a decorator option. This is a stylistic/API-clarity choice, not a functional requirement; the Angular implementer may use `providedIn: 'root'` instead if a later review judges the explicit form unnecessary — flagged as Open Question OQ-2, not decided here.

## 7. SSR → hydration stability (cross-framework summary)

All three fixes converge on the same underlying guarantee, achieved by each framework's own idiomatic mechanism:

- React: `useId()`'s tree-position-derived ID generation.
- Vue: `useId()`'s documented server/client stability guarantee.
- Angular: a fresh application-injector-scoped service instance — request-isolated because the SSR host creates a new application injector per request — whose call-order determinism is inherited from Angular's own pre-existing hydration contract (identical DOM structure requirement).

None of the three introduces a new hydration-timing dependency, a new lifecycle hook, or a new build-time step. All three are drop-in replacements for the existing ID-computation call site, changing only _how_ the ID string is produced, not _when_ or _where_ in each component's render/construction flow it is produced.

## 8. Long-running servers, sequential requests, and concurrent requests

- **Sequential requests (the originally-observed defect):** closed for all three frameworks — each request now gets a value derived from either a genuinely fresh per-render hook call (React/Vue) or a genuinely fresh per-request injector/service instance (Angular), never a shared, persistent counter.
- **Concurrent requests:** the origin escalation already confirmed (empirically, for Vue, and by the general single-threaded-Node-event-loop reasoning that applies equally to all three frameworks' Node-hosted SSR) that concurrent requests do not produce ID _collisions_ even under the old, defective counter design — each request's synchronous render completes atomically before the next can begin. This fix does not change that guarantee; it was never the actual defect. The defect being closed is _determinism/hydration-fidelity_, not _collision-safety_, and this fix's design is scoped accordingly — no additional concurrency-specific mechanism (locking, atomic counters, etc.) is introduced, because none was ever needed.

## 9. Regression tests

Each of the 5 affected components already has an existing spec file (confirmed present at commit `dfc5e97`): `packages/ng/src/dialog/dialog.spec.ts`, `packages/react/src/menu/menu.spec.tsx`, `packages/react/src/dialog/dialog.spec.tsx`, `packages/react/src/tooltip/tooltip.spec.tsx`, `packages/vue/src/menu/menu.spec.ts`. The regression tests for this fix are added to these existing files — no new test infrastructure is introduced.

**Required new test cases per affected component** (exact assertions to be finalized at Implementation Plan time, but the required _behaviors_ to prove are fixed here):

1. **Uniqueness within one render:** rendering two instances of the same component in one component tree produces two different IDs (this already had implicit coverage via the old counter's `++`, but should be an explicit assertion post-fix to prove the replacement mechanism preserves it).
2. **ARIA relationship integrity:** the generated ID and whatever attribute references it (`aria-labelledby`/`aria-describedby`/`aria-activedescendant`) resolve to the same value — i.e., the element carrying `id={x}` and the element carrying the ARIA attribute referencing `x` agree, post-fix, exactly as they did pre-fix. This is the direct regression check for G3.
3. **No retained module/component-level counter state (React/Vue — jsdom-based unit test):** rendering the same component twice in the same test-process run (two separate `render()`/`mount()` calls in one Vitest file) and asserting each render's generated ID is independent of the other (e.g. neither derived from nor incremented by a value the other render produced). This test proves only that the replacement mechanism (`useId()`) does not retain any counter or other state at the module or component level between separate render calls, and separately confirms whatever uniqueness/expected-shape behavior each generated ID exhibits within a single render. **It is explicitly not proof of G1 (cross-request SSR determinism)** — a jsdom `render()`/`mount()` call is not a real SSR request, and this test makes no claim about a real Node SSR server's behavior across real HTTP requests. The authoritative, end-to-end proof of G1 remains Track E's own Task 8 (the real SSR double-fetch test against a running server process) — see §11.
4. **`id` prop override still wins:** for the three React components and Vue's Menu, passing an explicit `id` prop still produces that exact ID, not a generated one — proving the fallback logic (`id ?? generated`) survived the migration unchanged.
5. **Angular-specific:** a test confirming `ComponentIdGenerator`, when provided fresh (e.g., via `TestBed.configureTestingModule({ providers: [ComponentIdGenerator] })` in a new `TestBed` instance per test, mirroring one bootstrap per request), produces `_1` as its first `.next()` result every time — proving the service itself carries no cross-instantiation state leak, the Angular-specific analogue of "no module-scope counter remains."

**Explicitly not required by this fix:** end-to-end SSR-server-based regression tests (spinning up a real Node SSR server and issuing two real HTTP requests, per component, per framework) — that is precisely what Track E's own Task 8 (the double-fetch determinism check) already does, at the whole-harness level, once Track E resumes. This fix's own regression tests are unit-level (existing Vitest/jsdom-based spec files), proving the mechanism is correct in isolation; Track E's Task 8 is what proves the fixed mechanism holds up through a real SSR server process end-to-end. Duplicating that here would be out-of-scope, redundant test infrastructure this fix does not need to build.

## 10. Relationship to Track E (addressing point 11 of the request directly)

This work item is a **prerequisite for Track E's Tasks 5-7 and Task 8 to be trustworthy**, but it is **not part of Track E's own task list or specification**. Specifically:

- Track E's Tasks 5-7 (Playwright specs) currently would exercise Dialog-open and Menu-interaction states whose underlying components carry this defect — proceeding with those tasks before this fix lands would mean writing Playwright assertions against components that are known, in at least one confirmed case (Vue), to silently rewrite IDs during hydration. This does not necessarily break any _specific_ Track E acceptance criterion as currently worded (none of Track E's spec §D.2 requirements assert on ID stability directly), but it does mean Task 8's determinism check — which asserts byte-identical SSR responses across two fetches — **would fail** for any harness/component combination where the counter's non-determinism is currently observable in rendered SSR output (confirmed: Vue's Menu, React's Menu; not currently observable for Angular's Dialog or React's Dialog/Tooltip given their current closed/hidden default fixture states, per the origin escalation §3).
- Therefore: **this fix is a hard prerequisite for Track E's Task 8 to pass for Vue's Menu and React's Menu specifically**, and a soft/precautionary prerequisite for the Dialog/Tooltip instances not currently exercised by Track E's own fixtures (closing them now, rather than waiting for a future fixture change to surface them, is the safer sequencing, per the human's own Option (a) decision).
- Track E's Tasks 5-7 do not need to be _rewritten_ once this fix lands — they were already specified against the correct, intended component behavior (spec §D.2's interaction requirements are about user-facing behavior, not implementation-internal ID format), so this fix is transparent to Track E's own specification and plan. Only the _sequencing_ — this fix landing before Track E's Task 8 actually runs its double-fetch check against Menu — is the binding dependency.
- **Track E's deterministic double-fetch requirement itself is unchanged by this proposal** (point 12 of the request) — this fix exists specifically to make that requirement passable without weakening it, not to alter what it checks.

## 11. Explicit non-goals of this fix

- Does not touch Vue's Tooltip CSS visibility defect (§2, "explicitly not in scope").
- Does not add end-to-end SSR-server-based regression tests (§9, "explicitly not required").
- Does not change any component's public API, props, or visual/behavioral contract beyond the internal ID-generation mechanism.
- Does not introduce `useId()` (or an ID-generation service) to any component beyond the 5 enumerated in §2, even if other components could theoretically benefit — no speculative application of this pattern elsewhere in the codebase.
- Does not modify Track E's specification, implementation plan, or any already-completed/reviewed Track E task (1-4).

## 12. Open questions (for Implementation Plan to resolve, not blocking this specification's review)

- **OQ-1:** The exact mechanics of calling `useId()` (a Composition API function) from within `Menu.vue`'s Options-API-based component definition, consistent with this repository's existing ADR-032 `extends` mixin architecture. No other component in this codebase currently bridges a Composition API helper into an Options-API component; this may require either a small `setup()` addition to `Menu.vue` specifically (Options and Composition APIs can coexist in one component per Vue's own documented interop) or confirmation that the existing mixin base already provides an equivalent hook-in point. Needs a brief, targeted investigation at Implementation Plan time — not an architectural fork, since Vue's own documented `setup()` + Options API interop is the standard, expected answer; this is a "confirm the mechanics," not a "choose between designs," question.
- **OQ-2:** Whether `ComponentIdGenerator` should be `providedIn: 'root'` or explicitly provided at each bootstrap (§6.4) — a style/clarity choice with no functional difference for this specific use case, left to the Implementation Plan or its reviewer.
- **OQ-3:** Exact placement of the new `ComponentIdGenerator` file within `packages/ng-core`'s existing directory structure (e.g., alongside `config`/`base-editable-holder` or in a new `id/` subdirectory as sketched in §6.2) — a repository-convention question for the Implementation Plan to resolve by following whatever precedent `ng-core`'s existing directory layout establishes.

---

## Sources

- `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` (origin escalation — full evidence, reproduction, and prior alternatives analysis, not repeated here).
- Direct source reads (this specification's own additional research): `packages/react/src/menu/menu.tsx`, `packages/react/src/dialog/dialog.tsx`, `packages/react/src/tooltip/tooltip.tsx`, `packages/vue/src/menu/Menu.vue`, `packages/ng/src/dialog/dialog.ts`, and confirmation of existing spec files for all five.
- Angular official docs (Context7 `/websites/angular_dev`): `angular.dev/guide/di/hierarchical-dependency-injection` (child-injector-per-`bootstrapApplication()` behavior), cross-referenced against Track E Task 2's own already-reviewed `apps/playground-angular/src/server.ts` (confirms one `bootstrapApplication()`/`renderApplication()` call per HTTP request in this repository's actual SSR harness).
- React official docs (Context7 `/reactjs/react.dev`): `react.dev/reference/react/useId` (tree-position-derived stability), `react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks` (unconditional top-level call requirement, confirmed compatible with all three affected components).
- Vue official docs (Context7 `/websites/vuejs`): `vuejs.org/api/composition-api-helpers` (`useId()`, version/stability guarantees, `computed`-context restriction).
