# Phase 10 Track E — SSR/Hydration: Research & Architecture Preparation

**Status:** Draft for review
**Date:** 2026-09-11
**Scope:** Research and architecture preparation only. No specification, no implementation plan, no source/CI/package changes, no commit.
**Baseline:** `main` at `57772ff`. Tracks A, B, C, D of Phase 10 are complete and merged (locally; no remote configured). Track E is the remaining Phase 10 implementation track.

---

## 1. Current repository state

- Branch `main` at `57772ff`, clean working tree, no remote configured.
- Workspace layout: pnpm workspaces (`pnpm-workspace.yaml`: `packages/*`, `apps/*`), `packageManager: pnpm@9.6.0`, root `engines.node: >=20.0.0`, no `.nvmrc`. No Turborepo/Nx (ADR-015 — plain `pnpm -r`).
- `apps/docs`, `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, `apps/showcase` exist as directories but contain only `.gitkeep` — no package.json, no content, anywhere under `apps/`.
- Track A (browser/visual/accessibility testing via Storybook + Playwright), Track B (CI quality gates), Track C (release workflow, migration tooling, provenance) are all merged and out of scope for Track E to touch.

## 2. Track E objective and boundaries

Per the established Phase 10 objective set (Blueprint §35) and this session's brief:

**In scope:**
- SSR/hydration support and verification for all three frameworks (Angular, React, Vue).
- Minimal per-framework consumer/harness applications — not a full playground or showcase app.
- Render the existing 8-component proof set (or a representative subset) through each framework's real SSR pipeline.
- Verify hydration succeeds (no console errors, no DOM mismatches) using real framework/runtime behavior, not mocks.
- Integrate with Track A's Playwright infrastructure where appropriate (new projects/config, not modification of Track A's existing projects).

**Out of scope:**
- Full playground/showcase applications with routing, multiple pages, or a real design/demo experience.
- Any modification to Track B's CI topology beyond what Track E needs to add for itself.
- Any modification to Track C's release/migration/provenance scope.
- Reopening Tracks A/B/C/D artifacts.
- Framework modernization unrelated to SSR (e.g., migrating Vue's Options-API architecture, changing Angular's zoneless posture, upgrading React major versions).

## 3. GAP-008 current state

**GAP-008 is already formally resolved in scope for Track E purposes — by an existing architecture-discussion document, not by this session.** The remaining work is a narrower packaging/promotion question, not a re-litigation of GAP-008 itself. Details below.

### 3.1 What GAP-008 says (as originally registered)

`docs/architecture/BLUEPRINT_GAPS.md:165-191` registers GAP-008 as:

> **GAP-008 — No real consumer application anywhere in the monorepo (`apps/*` are all empty scaffolding)**
> Status: MISSING. Type: Testing, Packaging, Production. Blocking level: HIGH.
> Current evidence: `apps/docs`, `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, `apps/showcase` each contain only `.gitkeep`. `PERFORMANCE.md` states directly: "No app in this monorepo consumes `@ultimate/ng`/`@ultimate/ng-core` via normal node_modules resolution yet." ADR-023 records the same for Angular specifically as an accepted, deferred Phase 2 exit-criteria gap.
> What it blocks: GAP-009 (tree-shaking measurement), real bundle-size/performance benchmarking (Blueprint §31), SSR/hydration verification (Blueprint §28's "Build/Package" testing tier), and any credible claim that "Phase 2/3/4 exit criteria" are fully met rather than partially deferred.
> Recommended resolution direction: Build one playground app per framework (or one showcase app spanning all three) that imports and renders the full proof set.

`BLUEPRINT_GAPS.md` header (line 5) states this document is a **discovery snapshot**: "Does not commit to sequencing or phase numbers." It is evidence, not standing architecture.

### 3.2 What already resolves it, for Track E's purposes

`docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` §5, "SSR / GAP-008 scope decision" (lines 153–182), already answers the exact question this session was asked to investigate. Quoted in full:

**The question posed (line 157):**
> Whether Phase 10 needs full Angular/React/Vue playground apps, one minimal SSR-capable harness, framework-specific minimal harnesses, or another approach — while identifying which parts of GAP-008 are prerequisites versus merely useful infrastructure.

**Decision (lines 167–171):**
> Phase 10's SSR/hydration verification requirement is satisfied by one minimal, framework-specific SSR-capable harness per framework (Angular Universal / Next.js / Nuxt, or the framework's standard minimal SSR starter) — not full playground/showcase applications. Building out `apps/playground-*`/`apps/showcase` into real, feature-complete consumer applications is explicitly out of scope for Phase 10.
>
> Why: the Blueprint requires SSR/hydration to be verified, not a consumer-app experience to exist. A minimal harness — render one or two real Ultimate components through each framework's standard SSR pipeline and confirm hydration succeeds without console errors/mismatches — is the smallest artifact that makes §31's "SSR/hydration behavior" measurement possible and gives Playwright something real to drive.

**Consequences (lines 174–176):**
> Cluster E's scope is: three minimal SSR harnesses (one per framework), each rendering a small number of already-shipped components (the existing 8-component proof set is a natural, ready target — no new component work needed), plus Playwright specs that assert successful hydration.
>
> The existing `apps/playground-angular`/`apps/playground-react`/`apps/playground-vue` directories are reasonable homes for these harnesses, but their scope for Phase 10 purposes is the minimal SSR-verification harness, not a full playground... `apps/showcase` and `apps/docs` remain out of Phase 10 scope entirely.

**Explicitly left open, for Specification (line 328):**
> Cluster E (once its GAP-008 scope decision from §5 is accepted): exact minimal-harness framework starters (Angular Universal vs. alternative; Next.js vs. a lighter React SSR setup; Nuxt vs. a lighter Vue SSR setup); which of the 8 proof-set components get exercised in each harness.

**GAP dependency map entry (line 290):**
> GAP-008 (no real consumer app) | MISSING | Partially resolved in scope — Phase 10 requires only minimal SSR harnesses, not full playground apps | §5 decision

### 3.3 Is this "formally resolved" or does it need a fresh decision?

This is the one genuine gate item in this document (§10 below). Evidence on both sides:

- **For "already sufficient":** §5 is a considered decision with rationale ("Why:"), consequences, and an explicit GAP-dependency-map update — the same documentary form used for DECISION-A in the same file, which **is** cited as an accepted decision in `DECISIONS.md` (ADR-044). ADR-044 (`DECISIONS.md:189-191`) already references "the SSR/GAP-008 scope decision, §5" as settled fact when describing Playwright's future SSR role, treating it as decided, not pending.
- **For "needs a fresh/promoted decision":** GAP-008's own entry in `BLUEPRINT_GAPS.md` (line ~178) still carries an "Architectural decision required: No" field that was written before §5 existed — stale, but never corrected. And unlike DECISION-A, §5's resolution has never been promoted to its own standalone ADR number in `DECISIONS.md` — it exists only as a cross-reference inside ADR-044's body text. There is no ADR whose *subject* is GAP-008/SSR scope; there is only an ADR (SSR tooling) that *cites* the research doc's §5.

**This session did not silently pick an interpretation.** Both readings are evidence-backed; which one satisfies your gate criteria is the decision requested in §10.

### 3.4 A related, distinct gap: GAP-034

`BLUEPRINT_GAPS.md:568` separately registers **GAP-034 — No SSR/hydration verification anywhere (Angular has an `isPlatformBrowser()` guard; no test proves SSR actually works end-to-end)**, status IMPLEMENTED-BUT-UNVERIFIED, with dependency "GAP-008 (a real consumer app is likely the most realistic way to exercise real SSR/hydration)" (line 576).

GAP-008 is "no consumer app exists"; GAP-034 is "even where code looks SSR-safe, nothing proves it end-to-end." **Track E's actual deliverable closes GAP-034**, using the minimal harnesses that §5 scoped GAP-008 down to as the vehicle. This distinction matters for how Track E's specification should describe its own exit criteria — it should name closing GAP-034, not GAP-008 in full (GAP-008's *fuller* scope — routing, real playground/showcase experience — remains explicitly out of Phase 10 per §5).

## 4. Evidence gathered from the repository

### 4.1 Track A — Playwright/Storybook infrastructure

- Root `playwright.config.ts`: 9 projects (Angular/React/Vue × Chromium/Firefox/WebKit), each scoped to `./packages/{ng,react,vue}/e2e`, with a `webServer` array launching each framework's **Storybook** dev server (ports 6001/6002/6003).
- Track A's own spec is explicit that this targets Storybook-rendered pages, not any SSR pipeline: "Playwright tests target rendered Storybook stories, not a separate hand-built test-harness app... Track E's SSR-specific real page is a separate, later concern."
- **Consequence for Track E:** Track E cannot reuse Track A's existing Playwright `webServer`/project entries as-is. It needs its own project(s) and `webServer` entries pointing at each framework's SSR harness (dev or preview server), on distinct ports, with a distinct `testDir` (e.g., `apps/playground-*/e2e`), added to the existing `playwright.config.ts` or a scoped extension of it. This is additive, not a modification of Track A's projects.
- `@axe-core/playwright` is already a devDependency across all three framework packages — usable for optional a11y assertions on the hydrated page, but not a Track E requirement.

### 4.2 Track B — CI topology

- Main `ci` job (Node 20, `ubuntu-latest`): audit → license scan → install-script-policy → lint → format → typecheck → build → validate → test → affected-packages → pack/install integrity → CodeQL → SAST → bundle-size → coverage → provenance → boundary validates → ceiling validate → compatibility-manifest validate.
- A separate `track-a-browser-visual-a11y` job runs on **Node 24.15.0**, matrixed `[ng, react, vue]` — distinct from the main job's Node 20. This is a useful precedent: Track A already established that browser/Storybook/Playwright work can run in its own CI job on its own Node version, separate from the main linear gate.
- No SSR-related CI step exists yet anywhere.
- Per session constraints, Track E's CI integration is implementation-plan/implementation-phase work, not something to design in detail here — but the Track A precedent (separate job, its own Node version, matrixed per framework) is directly relevant input for that later step.

### 4.3 Track C — release/migration boundary

- `docs/superpowers/plans/2026-09-10-phase-10-migration-release-provenance-implementation.md` explicitly lists Track E's territory as untouched by Track C: "Anything under `apps/playground-*`, `apps/showcase` (Track E scope) — untouched" (line 319) and "Any Track E (SSR/hydration) file, harness, or Playwright spec" (line 330) as out of Track C's scope. No overlap risk either direction.

### 4.4 Framework versions (exact)

- **Angular:** peer range `^21.2.22`; devDependencies pin `@angular/build`/`@angular/cli`/`@angular/compiler-cli` at exact `21.2.22`. Effective version: **Angular 21**.
- **React:** peer range `^17.0.0 || ^18.0.0 || ^19.0.0` (broad); devDependencies pin `react`/`react-dom` at `^18.3.1` for actual build/test execution. Effective tested version: **React 18.3.x**.
- **Vue:** peer range `^3.5.0`; devDependency pins `vue: ^3.5.13`. Effective version: **Vue 3.5.x**.

### 4.5 Component architecture

All three frameworks ship **framework-native components**, not Web Components/Shadow DOM:
- Angular: standalone components (no NgModule), signal-based inputs/outputs (ADR-018/019), built on `ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy.
- React: function components with hooks (`useComponentBase`, `useComponentStyle`), plain JSX, no custom elements.
- Vue: Options-API `extends` mixin architecture (ADR-032), plain SFC/render functions, no custom elements.

This is favorable for SSR: there is no cross-framework declarative-shadow-DOM story to reconcile. Each framework's SSR path is that framework's own standard mechanism.

### 4.6 The 8-component proof set

Confirmed identical across `packages/ng/src`, `packages/react/src`, `packages/vue/src`: **Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip** — matching each package's own `package.json` description string. This supersedes `BLUEPRINT_GAPS.md`'s older "5-component" framing (Button/Checkbox/Dialog/Menu/Tooltip); Paginator, Scroller, and Table were added afterward. The Phase 10 architecture discussion's §5 already correctly cites "the existing 8-component proof set," confirming that document, not the older gap registry, is current on this fact.

### 4.7 Node/tooling

- `packageManager: pnpm@9.6.0`, `engines.node: >=20.0.0`, no `.nvmrc`. Track A's CI precedent (Node 24.15.0 for browser-testing jobs) suggests Track E's SSR harnesses and any associated CI job are not constrained to Node 20 if a newer LTS is more compatible with a chosen SSR framework version — an implementation-plan-level decision, not resolved here.

## 5. Framework-by-framework SSR/hydration findings

### 5.1 Angular 21

**Upstream (angular.dev, verified via Context7 `/websites/angular_dev`):**
- `ng new --ssr` scaffolds hybrid rendering by default in current Angular tooling.
- Hydration is enabled via `provideClientHydration()` passed to `bootstrapApplication`'s providers, with the same provider required in the server bootstrap configuration.
- Server rendering itself is configured via `provideServerRendering()` (from `@angular/ssr`), composable with `withRoutes()` and `withAppShell()`.
- **Hard constraint documented by Angular itself:** "Hydration requires that the application generates the exact same DOM structure on both the server and the client, including whitespaces and comment nodes produced by Angular during server-side rendering. The HTML produced during SSR must not be altered between the server and the client, as structure mismatches will cause hydration to fail." Direct DOM manipulation via native APIs (e.g., `insertBefore`) outside Angular's own change-detection/template system triggers hydration-mismatch error NG0500.
- **Zoneless status:** Angular v21+ makes zoneless change detection the default (no `provideZonelessChangeDetection()` call needed unless overriding). The repository's Angular package already follows a zoneless-only posture per ADR-022. No documented incompatibility was found between zoneless change detection and `provideClientHydration()`/`provideServerRendering()` in current Angular docs — both are default/current-generation APIs in Angular 21, not competing eras of the framework.

**Repository evidence (from fork research, confirmed by direct file read for one hook):**
- `isPlatformBrowser()` guards already present at: `packages/ng/src/tooltip/tooltip.ts:87`, `packages/ng/src/autofocus/auto-focus.ts:49`, `packages/ng/src/ripple/ripple.ts:57`, `packages/ng/src/dialog/dialog.ts:213,250`, `packages/ng-core/src/overlay/overlay.ts:60`. Two of these carry doc comments stating "All DOM creation is guarded behind `isPlatformBrowser()` per the SSR..." (tooltip.ts:59, overlay.ts:33).
- No module-scope (import-time, unconditional) `window.`/`document.` usage was found anywhere in Angular package source.
- **Conclusion:** Angular's proof-set components already follow the framework's own documented SSR-safety pattern. No known blocking defect. The harness itself (bootstrap wiring, `provideServerRendering`, `provideClientHydration`, Express/Node server entry) does not yet exist — that is Track E's actual deliverable, not a component fix.

### 5.2 React 18.3

**Upstream (react.dev, verified via Context7 `/reactjs/react.dev`):**
- Server: `renderToString` (synchronous, returns a string; no streaming) or `renderToPipeableStream` (Node streaming, supports abort-on-timeout to flush a fallback and let the client finish). React's own docs recommend the streaming API for Node server environments and reserve `renderToString` for environments without stream support.
- Client: `hydrateRoot(container, <App />)` makes server-rendered HTML interactive; assumes the DOM already matches what React would render.
- **Documented failure mode:** `useLayoutEffect` "does nothing on the server" and throws a runtime warning if used in code paths rendered during SSR; React's own guidance is to replace it with `useEffect`, mark the component client-only, defer it past hydration, or use `useSyncExternalStore` if synchronizing with an external store.
- Server/client content divergence is an explicitly supported pattern via a post-mount `useEffect` that flips state after hydration (React's own "two-pass rendering" example), with the caveat that this pattern slows hydration and should be used sparingly.

**Repository evidence:**
- `packages/react-core/src/hooks/use-mount-effect.ts` (verified directly, full file): wraps `useEffect(effect, [])` — plain `useEffect`, **not** `useLayoutEffect`. This means the SSR warning React documents for `useLayoutEffect` does not apply to this hook.
- `packages/react-core/src/styling/react-style-sheet.ts`: `createStyleElement` has an explicit `if (typeof document === "undefined") return undefined;` guard (SSR guard, per its own comment). Style registration is invoked through `useComponentStyle` → `useMountEffect`, i.e., a mount-only `useEffect` that never executes during the `renderToString`/`renderToPipeableStream` server pass at all — the explicit `typeof document` guard is defense-in-depth, not load-bearing.
- Other `document.`/`window.` references (`portal.tsx:35`, `tooltip.tsx:33-34`, `dialog.tsx:97`) sit inside function bodies invoked at render/interaction time in the browser, not module scope. Portal's `document.body` fallback specifically has not been independently verified safe if a harness ever server-renders a Portal-based component directly — flagged as an open item for Specification/implementation, not a known defect.
- **Conclusion:** No known blocking SSR defect. The two supported server APIs (`renderToString` vs. `renderToPipeableStream`) and the harness shell (a minimal Express/Node server, or a lightweight framework like Next.js's App/Pages router in its simplest form) remain an open choice for Specification, per §5 of the existing architecture discussion.

### 5.3 Vue 3.5

**Upstream (vuejs.org, verified via Context7 `/websites/vuejs`):**
- Server: `createSSRApp(rootComponent)` + `renderToString(app)` from `vue/server-renderer`, run in Node.
- Client: `createSSRApp` again with the same app definition, then `app.mount('#app')` — mounting an SSR app on the client assumes the HTML was pre-rendered and performs hydration rather than fresh DOM creation.
- **Documented lifecycle constraint:** the `mounted()` lifecycle hook is "called after the component is mounted and the DOM tree is created; not triggered during server-side rendering" — i.e., `mounted()` is inherently client-only/post-hydration by Vue's own design, not something that needs an extra guard to be SSR-safe.

**Repository evidence:**
- `packages/vue-core/src/styling/vue-style-sheet.ts`: `createStyleElement` guards with `if (typeof document === "undefined") return undefined;`, with its own doc comment noting it mirrors `react-core`'s identical guard.
- `packages/vue-core/src/base/base-component.ts:39-40`: style registration (`registerComponentStyle`) is called from the component's **`mounted()`** hook — which, per Vue's own docs above, never fires during `renderToString`. The `typeof document` check is a second layer on top of a lifecycle guarantee Vue already provides.
- Other `document.`/`window.` references (`focus-trap.ts:74`, `tooltip.ts:82,86-87`, `ripple.ts:68-69`) are inside event handlers/DOM-manipulation functions invoked at interaction time, not module scope or render body.
- **Conclusion:** No known blocking SSR defect. Vue's own lifecycle semantics already make the proof-set components' styling registration inherently server-safe; the explicit guards are consistent, convergent defense-in-depth matching the same pattern used in React. The harness choice (Vue's own minimal `createSSRApp`/`renderToString` server, vs. Nuxt) remains open for Specification.

### 5.4 Cross-framework observation

All three frameworks converge on the same structural pattern in this codebase: guard browser-only access with a runtime check (`isPlatformBrowser`, `typeof document === "undefined"`), and additionally rely on each framework's own lifecycle timing (Angular's platform injection, React's `useEffect`, Vue's `mounted()`) to keep DOM/style work out of the server render path by construction. This is reassuring evidence but **not proof** — none of it has been exercised through an actual server render process yet (unit tests run under jsdom, which is not a real SSR environment and cannot substitute for it — this is exactly what GAP-034 flags as unverified). Track E's harnesses are what would convert "looks safe by pattern" into "proven safe by execution."

## 6. Existing infrastructure that can be reused

- **Playwright** (Track A): framework-agnostic browser engine already wired into the repo and CI; Track E adds new projects/config pointing at SSR harness servers rather than building browser automation from scratch.
- **`@axe-core/playwright`**: already present as a devDependency in all three framework packages, available if Track E wants optional a11y checks on hydrated output (not required).
- **`apps/playground-angular`/`apps/playground-react`/`apps/playground-vue`**: already-reserved, currently-empty directories that are the natural home for the harnesses per §5's own recommendation — no new top-level workspace entries need to be invented.
- **pnpm workspace `apps/*` glob**: already covers these directories; no workspace-config change needed to add real `package.json` files under them.
- **Track A's Node 24.15.0 CI-job precedent**: a directly reusable pattern (separate job, framework-matrixed, distinct Node version) for however Track E's own CI integration gets designed later.
- **The 8-component proof set itself**: already built, already used identically across all three frameworks in Track A's Storybook/Playwright setup — no new component work is implied by Track E.

## 7. Risks and constraints

- **Hydration-mismatch fragility (Angular-documented, generalizable):** any whitespace, comment-node, or conditional-rendering difference between server and client output breaks hydration. This is a property of SSR generally, not specific to this codebase, but the harnesses must be built with this in mind from the start (e.g., avoid `Math.random()`/`Date.now()`/locale-dependent formatting in initial render paths without explicit two-pass handling).
- **React API choice affects harness shape:** `renderToString` vs. `renderToPipeableStream` is not just a style choice — streaming changes how the harness's Node server is structured (pipe vs. return-a-string). This must be decided in Specification, not assumed.
- **Framework-starter choice affects scope and dependency footprint:** Angular Universal, Next.js, and Nuxt each pull in their own routing/build conventions beyond raw SSR — using a framework's full meta-framework (e.g., Next.js) for what's meant to be a *minimal* harness risks quietly reintroducing GAP-008's fuller (out-of-scope) shape. A lighter, hand-built Node server using each framework's raw SSR primitives (as shown in the upstream docs above) may better match the "minimal harness" intent than adopting a full meta-framework — this is a real trade-off for Specification to make explicitly, not silently default into whichever is most familiar.
- **CI cost:** three more dev/build/preview servers, three more Playwright projects, likely a new CI job — real but bounded incremental cost, consistent with Track A's existing precedent.
- **Unverified edge case:** React Portal's `document.body` fallback under direct server-side rendering has not been checked; if any proof-set component (or a component it depends on, e.g., Dialog/Tooltip's overlay machinery) renders a Portal during the initial server pass rather than only after mount, this needs explicit verification during implementation, not assumption of safety.
- **Package-boundary question:** whether harnesses live as private, non-published entries under `apps/*` (implied by §5 and the existing empty scaffolding) needs to be confirmed as fully out of the publishable-package boundary Track B's CI already enforces (bundle-size/provenance/compatibility-manifest gates) — likely yes since `apps/*` is a separate workspace glob from `packages/*`, but Specification should state this explicitly rather than assume it.

## 8. Alternatives considered for resolving GAP-008

Three ways to treat GAP-008 in this document, given that §5 already contains a considered decision:

**(a) Treat §5 as sufficient as-is; proceed straight to Specification citing it.**
- Advantages: no new process overhead; §5 already has rationale, consequences, and a GAP-map update in the same documentary form used elsewhere in this repository's decision record; ADR-044 already treats it as settled when describing Playwright's SSR role.
- Disadvantages: GAP-008's own entry in `BLUEPRINT_GAPS.md` still says "Architectural decision required: No" from before §5 existed, and unlike DECISION-A, §5 was never given its own ADR number — it exists only as a citation inside ADR-044. A future reader auditing `DECISIONS.md` alone (without also reading the research-discussion doc) would not find GAP-008's resolution recorded there as a first-class decision.

**(b) Promote §5 into a new, standalone ADR in `DECISIONS.md` before Specification proceeds.**
- Advantages: closes the documentary gap noted above — `DECISIONS.md` becomes self-sufficient for this decision, matching the treatment DECISION-A (Storybook+Playwright) already received as its own accepted-decision entry. Costs almost nothing (the content already exists in §5; this is a promotion/citation exercise, not new analysis).
- Disadvantages: minor process overhead; arguably unnecessary if the existing citation chain (Specification → this doc → §5 → ADR-044) is judged sufficient traceability.

**(c) Reopen GAP-008's scope question from scratch in this document.**
- Advantages: none identified — no new repository evidence contradicts §5's reasoning, and the session brief's own instruction ("whether the existing Phase 10 discussion already provides enough evidence to resolve it") is answered yes by §3.2 above.
- Disadvantages: would re-litigate a decision that is already well-reasoned and already relied upon by an accepted ADR (ADR-044), wasting effort and risking an inconsistent second answer to the same question.

## 9. Recommended architectural direction

*(Recommendation, clearly separated from the facts above.)*

Option (b) is recommended: promote §5's existing decision into a standalone ADR entry in `DECISIONS.md` (an ADR *about* GAP-008/SSR scope, not merely one that cites it), and correct GAP-008's stale "Architectural decision required: No" field to point at that ADR. This is low-cost, brings this decision's documentary weight in line with how DECISION-A was already handled in the same source document, and removes the one loose thread (§3.3) that would otherwise sit underneath every subsequent Track E artifact. It does **not** require re-deciding anything substantive — §5's reasoning and scope already stand on their own evidence and are recommended to be adopted verbatim, just formally promoted.

Recommendation on the SSR-starter sub-question (explicitly left open by §5 itself, not part of GAP-008's resolution): favor each framework's lightest raw SSR primitives (Angular Universal via `provideServerRendering`, a small Node server using React's `renderToPipeableStream` + `hydrateRoot`, and Vue's `createSSRApp`/`renderToString` + client hydrate) over adopting a full meta-framework (Next.js/Nuxt) for the harness, specifically because the session's own constraint is "minimal harness, not full playground" — a meta-framework brings routing/build conventions that exceed that minimal intent. This should be confirmed, not assumed, at Specification.

## 10. Explicit decisions requiring approval

1. **GAP-008 documentary resolution:** accept option (a), (b), or (c) from §8. Recommended: (b).
2. **SSR-starter approach per framework:** raw framework SSR primitives (recommended in §9) vs. adopting a meta-framework (Next.js/Nuxt/Angular's full app-shell tooling) per framework — this gates what Specification can assume about the harness's dependency footprint and build tooling.
3. **Which of the 8 proof-set components get exercised per harness:** all eight, or a representative subset (§5 itself only commits to "a small number... no new component work needed," leaving the exact count/selection open).

## 11. Proposed Track E subtracks (high-level only)

- **E1 — Angular SSR harness:** minimal `apps/playground-angular` app using Angular's standard SSR/hydration APIs, rendering the selected proof-set components.
- **E2 — React SSR harness:** minimal `apps/playground-react` app using the chosen React server API, rendering the selected proof-set components.
- **E3 — Vue SSR harness:** minimal `apps/playground-vue` app using Vue's `createSSRApp`/`renderToString`, rendering the selected proof-set components.
- **E4 — Playwright hydration verification:** new Playwright project(s)/config additive to the existing `playwright.config.ts`, asserting successful hydration (no console errors, no mismatch warnings, interactive behavior works post-hydration) against each harness.
- **E5 — CI integration:** a Track-E-scoped CI job (or extension), following Track A's separate-job/Node-version precedent, wiring E1–E4 into the pipeline without modifying Track B's existing job.

Sequencing and exact task breakdown are Specification/Implementation-Plan territory, not decided here.

## 12. Dependencies and sequencing

- Track E has a hard dependency on the GAP-008 documentary resolution (§10.1) and the SSR-starter/component-selection decisions (§10.2–10.3) before Specification can be written without guessing.
- Track E has a soft dependency on Track A (needs Playwright already installed/configured — satisfied, merged) but does not need to modify Track A's artifacts.
- Track E has no dependency on, and must not modify, Track B's or Track C's scope (confirmed in §4.2–4.3).
- Within Track E itself, E1/E2/E3 (per-framework harnesses) can proceed in parallel once the starter-approach decision is made; E4 (Playwright verification) depends on at least one harness existing to point at; E5 (CI) depends on E4 having a stable, runnable command.

## 13. Verification strategy (high level)

- Each harness must produce a real server-rendered HTML response (via the framework's own SSR API) and successfully hydrate in a real browser (via Playwright), with no console errors and no framework-emitted hydration-mismatch warnings (e.g., Angular's NG0500).
- Playwright specs should assert both the static SSR output (e.g., expected text/markup present before JS runs, where practically checkable) and post-hydration interactivity (e.g., a button click triggers the expected state change), proving hydration attached real event handlers rather than merely painting matching markup.
- Verification should run in at least Chromium via the existing Playwright setup; whether Firefox/WebKit coverage is required for Track E specifically (vs. Track A's existing full tri-browser matrix) is a Specification-level cost/value call, not decided here.

## 14. Open questions

- Should Track E's Playwright specs live under `apps/playground-*/e2e` (harness-local, mirroring Track A's `packages/*/e2e` convention) or under a new top-level location? Track A's existing convention (framework-scoped `e2e` directories) is the natural default but should be confirmed in Specification.
- Does the React Portal `document.body` fallback need an explicit code change, or does the chosen proof-set component subset avoid exercising Portal during the initial server pass entirely? Cannot be answered without either picking the component subset first or testing Portal specifically.
- Should the harnesses be fully private/unpublished (no `package.json` `"private": true` ambiguity) — confirming they sit outside every Track B publishable-package gate (bundle-size ceiling, provenance, compatibility manifest)? Likely yes, given `apps/*` is already a separate workspace glob from `packages/*`, but not yet explicitly stated anywhere.
- Node version for the harnesses/CI job: stay on the root's `>=20.0.0` floor, or follow Track A's precedent of using a newer Node (24.15.0) for this specific browser/SSR-adjacent job? No blocking reason found either way in this research pass.

---

## Sources

- `docs/architecture/BLUEPRINT.md` §13, §14, §28, §31, §35, §40
- `docs/architecture/BLUEPRINT_GAPS.md` (GAP-008 lines 165–191, 681, 734–735, 779; GAP-034 lines 568–579)
- `docs/architecture/DECISIONS.md` (ADR-044, lines 189–191; ADR-018/019/022/032 for component-architecture context)
- `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` (§2 DECISION-A, §5 SSR/GAP-008 scope decision, §10 GAP map, §12 open Specification items)
- `docs/superpowers/plans/2026-09-10-phase-10-migration-release-provenance-implementation.md` (lines 319, 330 — Track C/E boundary)
- Root `playwright.config.ts`; `.github/workflows/ci.yml`
- `packages/ng/package.json`, `packages/react/package.json`, `packages/vue/package.json` (framework versions, proof-set descriptions)
- `packages/ng/src/tooltip/tooltip.ts:59,87`; `packages/ng/src/autofocus/auto-focus.ts:49`; `packages/ng/src/ripple/ripple.ts:57`; `packages/ng/src/dialog/dialog.ts:213,250`; `packages/ng-core/src/overlay/overlay.ts:33,60`
- `packages/react-core/src/hooks/use-mount-effect.ts` (read directly, verified `useEffect` not `useLayoutEffect`)
- `packages/react-core/src/styling/react-style-sheet.ts`; `packages/react-core/src/styling/use-component-style.ts`
- `packages/vue-core/src/styling/vue-style-sheet.ts`; `packages/vue-core/src/base/base-component.ts:39-40`
- Angular official docs (Context7 `/websites/angular_dev`): `angular.dev/best-practices/performance/ssr`, `angular.dev/guide/hydration`, `angular.dev/api/ssr/provideServerRendering`, `angular.dev/errors/NG0500`, `angular.dev/guide/zoneless`, `angular.dev/api/core/provideZonelessChangeDetection`
- React official docs (Context7 `/reactjs/react.dev`): `react.dev/reference/react-dom/server/renderToString`, `.../renderToPipeableStream`, `.../client/hydrateRoot`, `react.dev/reference/react/useLayoutEffect`
- Vue official docs (Context7 `/websites/vuejs`): `vuejs.org/guide/scaling-up/ssr.html`, `vuejs.org/api/application.html`, `vuejs.org/api/ssr`, `vuejs.org/api/options-lifecycle.html`

---

## Architecture Gate Status

**ARCHITECTURE GATE — READY FOR DECISION**
