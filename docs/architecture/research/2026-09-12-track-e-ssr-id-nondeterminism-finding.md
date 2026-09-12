# Phase 10 Track E — Escalated Finding: Module-Scope ID Counters Break SSR Determinism and Hydration Across All Three Frameworks

**Status:** Escalated finding, architecture decision required. Not a specification or implementation-plan document. No production code changed. No commits created for any fix.
**Date:** 2026-09-12
**Discovered during:** Track E Task 4 (Vue SSR harness implementation), surfaced by the Vue implementer, independently reproduced and extended by the coordinator across all three frameworks before this escalation.
**Track E state at time of escalation:** Tasks 1–4 complete and reviewed (commits `e8db927`..`dfc5e97` on branch `phase-10-track-e-ssr-hydration`). **Tasks 5–7 are paused and must not start until this finding is resolved.** Task 8 (the mandatory SSR-determinism double-fetch check) remains binding and unchanged — no normalization or exclusion of `id` attributes is to be added to it as a workaround. No production-package fix has been made; this document presents evidence and options only.

---

## 1. What was found

`packages/ng`, `packages/react`, and `packages/vue` each generate certain component element IDs using a **module-scope, monotonically-incrementing counter variable** — a plain `let counter = 0` at the top of the file, incremented (`++counter`) once per component instance construction, with no reset mechanism. In a long-running Node.js SSR server process (exactly the kind of process this repository's own Blueprint requires and Track E's harnesses implement), that counter persists for the lifetime of the process, not per-request. Two structurally identical requests to the same running server therefore produce **different** HTML for the affected components — a direct violation of the deterministic-SSR-output requirement already binding on Track E (spec §D.3) and, more importantly, a pre-existing correctness defect in shipped component code that exists independently of Track E.

## 2. Affected files and declarations (exact, verified by direct source read)

| Framework | File                                        | Counter declaration         | Usage                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | `packages/ng/src/dialog/dialog.ts:22`       | `let dialogIdCounter = 0;`  | `packages/ng/src/dialog/dialog.ts:187`: `protected readonly ariaLabelledBy = \`u_dialog_${++dialogIdCounter}_header\`;`— set once per component construction, regardless of`visible` state.                                                                                   |
| React     | `packages/react/src/menu/menu.tsx:54`       | `let menuIdCounter = 0;`    | `packages/react/src/menu/menu.tsx:84`: `const [menuId] = React.useState(() => id ?? \`u-menu-${++menuIdCounter}\`);`—`useState` initializer runs once per server-side render (every server render is a fresh mount).                                                          |
| React     | `packages/react/src/dialog/dialog.tsx:38`   | `let dialogIdCounter = 0;`  | `packages/react/src/dialog/dialog.tsx:60`: `const [dialogId] = React.useState(() => id ?? \`u-dialog-${++dialogIdCounter}\`);`— feeds`headerId`/`contentId`at lines 150-151, referenced by`aria-labelledby`/`aria-describedby` at lines 173-174.                              |
| React     | `packages/react/src/tooltip/tooltip.tsx:30` | `let tooltipIdCounter = 0;` | `packages/react/src/tooltip/tooltip.tsx:58`: `const [panelId] = React.useState(() => id ?? \`u-tooltip-${++tooltipIdCounter}\`);`— feeds`aria-describedby` wiring at lines 112-113.                                                                                           |
| Vue       | `packages/vue/src/menu/Menu.vue:61`         | `let uidCounter = 0;`       | `packages/vue/src/menu/Menu.vue:97`: `menuId: \`u-menu-${++uidCounter}\`` — feeds `itemId(i)` at line 124 (`\`${this.menuId}_${modelIndex}\`\`), which in turn feeds `aria-activedescendant` (line 9's binding, explained by the component's own doc comment at lines 88-95). |

No other proof-set component in any of the three frameworks was found to use this pattern (confirmed by a targeted grep for `let.*Counter\s*=\s*0` / `IdCounter` across `packages/ng/src`, `packages/react/src`, `packages/react-core/src`, `packages/vue/src`, `packages/vue-core/src`).

## 3. Reproduction, framework by framework

All three reproductions used a from-scratch `pnpm --filter <harness> run build`, followed by starting the built server as a genuinely detached background process (`nohup node dist/.../server.* &`), and issuing plain sequential `curl` requests — not a shared, long-lived interactive browser session, per this track's own established practice for avoiding false results from stale caching (see Track E Task 2's review history).

### 3.1 Vue — reproduced directly, including a real hydration defect

Three sequential `curl http://localhost:6013/` requests against one running server process:

```
Request 1: id="u-menu-1_0"
Request 2: id="u-menu-2_0"
Request 3: id="u-menu-3_0"
```

Concurrent-request check (5 simultaneous `curl` requests): IDs remained unique per request (`u-menu-7_0`, `u-menu-8_0`, `u-menu-9_0` — no collisions), confirming Node's single-threaded execution model prevents ID collisions under concurrency, but does not prevent the underlying non-determinism.

**A real, silent hydration defect was found, not merely a determinism-test failure.** After priming the server's counter with several prior requests (so the next request would be served with a high counter value, e.g. `u-menu-4_0`), a fresh, isolated Playwright browser instance (fresh `launchPersistentContext` with a throwaway user-data-dir) navigated to the page. The server-rendered HTML for that navigation contained `id="u-menu-4_0"`; after Vue's client-side hydration completed, the **live DOM's actual `id` had silently changed to `u-menu-1_0`** — the client's own independently-computed counter value, not the ID the server sent. Zero console warnings or errors were emitted during this replacement. This means: in a real, long-running production Vue SSR deployment, the ID reaching the client's live DOM does not match what the server rendered — and since this ID feeds `aria-activedescendant` per the component's own doc comment, this is a real, observable accessibility defect in production, not just a test-repeatability inconvenience.

### 3.2 React — reproduced directly for Menu; hydration was NOT observed to mismatch in this specific check

Three sequential `curl http://localhost:6012/` requests against one running server process:

```
Request 1: id="u-menu-1", id="u-menu-1_list", id="u-menu-1_0" (item)
Request 2: id="u-menu-2", ...
Request 3: id="u-menu-3", ...
```

The same priming-then-fresh-browser-navigation test used for Vue was repeated for React: server-rendered HTML for one specific navigation showed `id="u-menu-6"`; after hydration, `document.querySelector("[id^='u-menu-']")?.id` in the live DOM was `u-menu-7` — but this matched what a follow-up `curl` confirmed _would have been_ served to that exact navigation request (since the browser's own `page.goto()` counted as the 7th request against the counter, after 6 prior `curl` priming requests). **No hydration-time ID rewrite was observed for React in this test** — React's `hydrateRoot` appears to have accepted and preserved whatever `id` value the server actually sent for that specific request, unlike Vue's behavior. This is a genuine, verified difference in symptom between the two frameworks sharing the same root-cause defect; it should not be reported as identical behavior.

Dialog's and Tooltip's counters were confirmed (by direct source read, not runtime observation) to advance on every server-side render via the same `useState(() => ...)` initializer pattern regardless of visibility, but their `id`-bearing DOM elements are not present in this specific harness's SSR output while those components are in their closed/hidden default state (Dialog starts closed; Tooltip's floating panel is Portal-gated and absent pre-hydration) — so the counter's _advancement_ is confirmed by source, but its _visible effect in rendered markup_ was not independently observed at runtime for Dialog/Tooltip specifically, only for Menu.

### 3.3 Angular — pattern confirmed present in source; NOT reproducible through the current Track E harness's SSR output

`dialog.ts:187`'s `ariaLabelledBy` field is set at component construction time (before `ngOnInit`), so the counter increments on every server-side instantiation regardless of the `visible` input's value — confirmed by direct source read. However, the counter-derived ID only reaches rendered DOM output inside the dialog's header (`dialog.ts:129`), which is nested inside the `@if (renderMask())` gate (`dialog.ts:117`) that Track E's Task 2 harness's own investigation already established stays `false` (rendering an Angular comment placeholder, `<!---->`) for a Dialog that starts closed — which is this harness's specified default state, per spec §D.2. Three sequential `curl` requests against the Angular harness's running server confirmed **zero occurrences** of the `u_dialog_<n>_header` pattern anywhere in the SSR output (`grep -oE 'u_dialog_[0-9]+_header'` returned nothing on all three requests). Angular's Menu component has no counter-based ID at all (confirmed: no `let.*Counter` pattern found anywhere under `packages/ng/src/menu/`).

**This means the defect exists in Angular's `dialog.ts` source but is not currently observable or reproducible through Track E's Angular harness as built**, because the harness's fixture (correctly, per spec) never opens the Dialog during the initial SSR pass. It would become observable the moment any Angular consumer's dialog is open during an initial server render (e.g., a URL-driven "dialog open by default" state) — a scenario outside this harness's current scope, but not outside `@ultimate/ng`'s real usage surface.

## 4. Is the ID merely cosmetic, or does it participate in real semantics?

**Confirmed real semantic participation in all three frameworks — not cosmetic.** Direct source read of each usage site:

- **Vue Menu:** `menuId` feeds `itemId(i)`, which is what `aria-activedescendant` (bound at `Menu.vue:9`) must reference to identify the currently-focused menu item to assistive technology during keyboard navigation. The component's own doc comment (`Menu.vue:88-95`) explicitly names this as the reason the ID exists.
- **React Menu:** `menuId` feeds `aria-labelledby`, `aria-activedescendant` (via `focusedId`, itself derived from per-item IDs built from `menuId`) — same accessibility mechanism as Vue's.
- **React Dialog:** `dialogId` feeds `headerId`/`contentId`, referenced by the dialog's own `aria-labelledby`/`aria-describedby` (`dialog.tsx:173-174`) — the standard ARIA dialog pattern for associating a dialog with its accessible name and description.
- **React Tooltip:** `panelId` feeds `aria-describedby`, wiring the tooltip's floating content to its trigger element for assistive technology.
- **Angular Dialog:** `ariaLabelledBy` feeds the dialog's own `aria-labelledby` attribute (`dialog.ts:124`), identical ARIA pattern to React's Dialog.

All five usages are genuine accessibility-relationship IDs, not internal bookkeeping or test-selector conveniences.

## 5. Concurrent-request safety

Verified for Vue (5 simultaneous `curl` requests): no ID collisions occurred. Node's single-threaded JavaScript execution model means one request's synchronous render completes (including all counter increments for that render) before the event loop can begin processing another request's render — there is no interleaving _within_ a single render call that would let two concurrent requests compute the same counter value. **This is a non-determinism and hydration-fidelity defect, not a collision/correctness-under-concurrency defect.** No two simultaneous users would ever receive the same ID; the defect is that the same conceptual page, served twice (sequentially or "far apart" in request order under concurrency), never produces the same ID twice, and — for Vue specifically — the ID a client's live DOM ends up with does not necessarily match what the server actually sent.

## 6. Do the frameworks already provide a purpose-built alternative?

**Yes, for React and Vue — confirmed against each framework's own official current documentation, verified via Context7 against real fetched docs, not from training-data recall:**

- **React 18+ (`useId`)**, quoted directly from `react.dev`'s own reference: _"You might be wondering why `useId` is better than incrementing a global variable like `nextId++`. The primary benefit of `useId` is that React ensures that it works with server rendering... This is very difficult to guarantee with an incrementing counter because the order in which the Client Components are hydrated may not match the order in which the server HTML was emitted. By calling `useId`, you ensure that hydration will work, and the output will match between the server and the client. Inside React, `useId` is generated from the 'parent path' of the calling component."_ React's own documentation names this exact anti-pattern (`nextId++`, i.e., precisely what `menuIdCounter`/`dialogIdCounter`/`tooltipIdCounter` are) as the specific problem `useId` exists to solve. This repository's pinned React version (`^18.3.1`) already has `useId` available; it is not currently used anywhere in `packages/react`/`packages/react-core` (confirmed by grep).
- **Vue 3.5+ (`useId`)**, quoted directly from `vuejs.org`'s own API reference: _"Used to generate unique-per-application IDs for accessibility attributes or form elements. These IDs are stable across server and client renders... preventing hydration mismatches."_ This repository's pinned Vue version (`^3.5.13`) already has `useId` available (introduced in Vue 3.5, matching this repo's exact pinned major/minor); it is not currently used anywhere in `packages/vue`/`packages/vue-core`. Vue's own SSR guide additionally documents a `data-allow-mismatch` attribute (Vue 3.5+) as an explicit, named escape hatch for genuinely-unavoidable hydration mismatches — further confirming Vue's own maintainers treat server/client ID divergence as a recognized, real class of defect worth a dedicated API, not a non-issue.
- **Angular** — no directly equivalent single-hook API was found in Angular's own current documentation for this specific purpose (component-instance-scoped, SSR-stable ID generation for ARIA attributes). Angular's server rendering does create a fresh dependency-injection tree per request (confirmed generally true of Angular's SSR architecture, and specifically exercised by Track E Task 2's own harness), which means a request-scoped Angular **service** (injected via Angular's own DI, reset per request because the injector itself is recreated per request) would achieve the same request-scoping React/Vue's `useId()` achieves automatically — but this would be a new, Angular-specific pattern this codebase would need to design, not an existing framework primitive to simply adopt.

## 7. Implications summary

- **SSR determinism (spec §D.3, Track E Task 8):** directly violated for Vue's Menu (confirmed) and, by source-level analysis, for React's Menu/Dialog/Tooltip and Angular's Dialog wherever their counter-derived IDs reach rendered output. Task 8's planned double-fetch byte-identical-response check would fail on any harness/component combination where this is currently observable in SSR output.
- **Hydration correctness:** confirmed as a real, silent client-side ID rewrite for Vue specifically (server-sent ID discarded, replaced with client's independently-computed value, zero warning emitted). Not observed for React in this specific test, though the shared root cause remains present in React's source. Not currently testable for Angular's Dialog or React's Dialog/Tooltip through this harness's own default (closed) fixture state.
- **Accessibility relationships:** all five affected ID usages across the three frameworks feed real ARIA attributes (`aria-labelledby`, `aria-describedby`, `aria-activedescendant`). A silently-rewritten ID (confirmed for Vue) breaks the ARIA relationship between the moment of first paint and the moment hydration completes, and — depending on assistive-technology timing — could present a broken or empty accessibility relationship to a screen reader during that window.
- **Concurrent requests:** no collision risk confirmed (verified for Vue); the defect is non-determinism/hydration-fidelity, not correctness-under-concurrency.
- **Long-running production SSR processes:** this is precisely the deployment shape Track E's harnesses are built to model and the shape any real `@ultimate/*` SSR consumer would run in production — the defect is not an artifact of testing methodology, it is a property of shipping these exact components behind a persistent Node process.

## 8. Secondary finding (separate, non-blocking): Vue Tooltip CSS visibility gap

Recorded separately per instruction — **not to be conflated with the ID-counter finding above, and not to be silently worked around in any Track E harness or Playwright assertion.**

`packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` function (lines 70-79) constructs the floating tooltip panel's class list as `["u-tooltip", binding.class]` — it never adds a `u-tooltip-{position}` modifier class (e.g. `u-tooltip-top`, `-bottom`, `-left`, `-right`). `packages/uix-styles/src/tooltip/index.ts` confirms the base `.u-tooltip` rule sets `display: none`, and none of the four position-modifier rules in that same file (lines 8-60) ever set `display` back to a visible value — nor would they be reached anyway, since the modifier class is never applied. The net effect: the Vue tooltip panel element is created and appended to the DOM correctly on hover/focus, but remains `display: none` and is never visually shown. This affects Track E's forthcoming Vue Playwright assertion for the Tooltip requirement (spec §D.2: "tooltip content becomes visible" on hover) and should be resolved or explicitly scoped before that specific assertion is written — but it is unrelated to SSR determinism or hydration, and is `packages/vue`-only (not reproduced in React or Angular's Tooltip, which were not found to share this specific CSS-class-application gap).

## 9. Alternatives considered for the ID-generation architecture decision

**(a) Fix `packages/ng`/`packages/react`/`packages/vue` now, before Track E resumes**, using each framework's most idiomatic mechanism:

- React: replace the three module-scope counters with `useId()`.
- Vue: replace `Menu.vue`'s module-scope counter with `useId()`.
- Angular: design and introduce a request-scoped ID-generation service (new pattern for this codebase) to replace `dialog.ts`'s module-scope counter.
- Advantages: closes a real, evidence-confirmed production defect (confirmed hydration-visible for Vue) at its actual source, using framework-native, already-available, already-pinned-version-compatible mechanisms for two of the three frameworks. Directly unblocks Task 8 without any test-side compromise.
- Disadvantages: touches production component code in all three packages — a real, non-trivial change with its own review/testing burden, outside Track E's original scope (Track E's binding decision 6 exists specifically to prevent Track E from casually absorbing this kind of fix). Angular's fix requires designing a new pattern, not just swapping in an existing hook.

**(b) Scope Task 8's determinism check to tolerate known `id`-attribute drift** (explicitly rejected by the user's own framing of this escalation; recorded here only for completeness, not as a live option):

- Would weaken the approved §D.3 determinism requirement and conceal a real defect rather than surface it — not compatible with the plan's own binding decisions.

**(c) Defer the fix, narrow Track E's proof-set fixtures to avoid exercising the affected code paths, and document the gap**:

- Advantages: unblocks Track E without touching `packages/*`, fully preserves this escalation's evidence for a future, separately-scheduled fix.
- Disadvantages: Menu is one of the 8 binding proof-set components (spec §D.2) and cannot be dropped from any harness's page without contradicting the approved specification; Menu's ID-counter defect is already observable in normal harness output for Vue and React (only Angular's specific manifestation, via closed-by-default Dialog, is naturally avoided by the current fixture design) — so this option cannot actually avoid the defect for two of the three frameworks without further contradicting the approved 8-component requirement.

**(d) Fix only where currently observable in Track E's own harness output (Vue's Menu, React's Menu), defer Dialog/Tooltip's not-yet-observable instances and Angular's not-yet-reproducible instance to separate, explicitly-tracked follow-up work**:

- Advantages: closes the concretely-demonstrated defects (including the one confirmed hydration-visible bug) with the smallest possible footprint, using each framework's own idiomatic, already-available mechanism (`useId()` for React/Vue's Menu specifically); explicitly defers the harder, not-yet-directly-observed instances (Angular's Dialog, React's Dialog/Tooltip) as a tracked gap rather than silently ignoring them.
- Disadvantages: leaves known-present, source-confirmed instances of the same defect unfixed in Dialog/Tooltip across two frameworks, which could resurface once Task 5-7's Playwright specs exercise Dialog-open/Tooltip-shown interaction states during SSR-adjacent testing, or in real production usage outside Track E's current fixture scope.

## 10. The architecture decision this finding requires

**How should Ultimate's framework component IDs be generated so that SSR output remains request-safe and deterministic across long-running server processes, while preserving hydration/accessibility semantics?**

This decision determines:

1. Whether Track E's Tasks 5-7 (Playwright specs) proceed against harnesses whose underlying components still carry this defect (accepting that Task 8's determinism check will need to account for it in some explicitly-approved way), or whether a `packages/*` fix is scheduled first.
2. If a fix is scheduled, whether it is in-scope for Track E itself (a deviation from binding decision 6, requiring explicit re-approval) or a separate, subsequently-scheduled track/task.
3. Which of options (a) (full fix, all three frameworks) or (d) (fix only currently-observable instances, defer the rest as a tracked gap) — or another option — is the right scope for whatever fix is approved.

This document does not select an option. It is evidence and alternatives for the human's decision, per the plan's existing escalation path (binding decision 6, spec Exit Criterion 10).

---

## Sources

- Direct source reads (file:line citations throughout this document): `packages/ng/src/dialog/dialog.ts`, `packages/react/src/menu/menu.tsx`, `packages/react/src/dialog/dialog.tsx`, `packages/react/src/tooltip/tooltip.tsx`, `packages/vue/src/menu/Menu.vue`, `packages/uix-styles/src/tooltip/index.ts`.
- Runtime reproduction: fresh `pnpm --filter <harness> run build` + detached `node dist/.../server.*` process + sequential/concurrent plain `curl` requests, for all three Track E harnesses (`apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`) as they exist at commit `dfc5e97`.
- Hydration-mismatch verification: fresh, isolated `playwright-core` `launchPersistentContext` browser instances with throwaway temp user-data-dirs (not any shared/long-lived session), for both Vue and React.
- React official docs (Context7 `/reactjs/react.dev`): `react.dev/reference/react/useId` ("Why is useId better than an incrementing counter?").
- Vue official docs (Context7 `/websites/vuejs`): `vuejs.org/api/composition-api-helpers` (`useId()`), `vuejs.org/guide/scaling-up/ssr.html` (Hydration Mismatch, `data-allow-mismatch`).
- Angular official docs (Context7 `/websites/angular_dev`): searched for a direct equivalent; none found — noted as a real difference in available tooling between frameworks, not an oversight in this research.
- Track E's own approved specification (`docs/superpowers/specs/2026-09-11-phase-10-track-e-ssr-hydration-design.md`) §D.2/§D.3 (determinism rules, per-component requirements) and Exit Criterion 10 (production-code-change escalation path); approved implementation plan's binding decision 6 (same escalation path, restated).
