# Implementation Plan: Phase 10 Track E — SSR / Hydration

**Document:** `docs/superpowers/plans/2026-09-11-phase-10-track-e-ssr-hydration-implementation.md`
**Status:** Draft for review (implementation-ready)
**Approved specification:** `docs/superpowers/specs/2026-09-11-phase-10-track-e-ssr-hydration-design.md` (Spec Gate: APPROVED)
**Baseline:** `main` at `57772ff`. Tracks A, B, C, D complete and merged.

**Binding decisions carried forward from the approved specification, not reopened by this plan:**

1. GAP-008's SSR/hydration slice is promoted to a standalone ADR (ADR-045) — documentary promotion only, substance already decided.
2. Raw/minimal per-framework SSR primitives only — Angular `provideServerRendering`/`provideClientHydration`; React `renderToPipeableStream`/`hydrateRoot`; Vue `createSSRApp`/`renderToString`. No Next.js, no Nuxt, no meta-framework.
3. All 8 proof-set components (Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip) exercised in every harness — not a subset.
4. Chromium-only Playwright coverage for Track E — no tri-browser duplication of Track A's matrix.
5. Harnesses are private, non-published, structurally outside Track B's `packages/*`-only publishable-package graph.
6. No production component code (`packages/ng*`, `packages/react*`, `packages/vue*`, shared `uix-*`) is modified to make the harness pass, unless implementation surfaces concrete contradicting evidence — which is an escalation, not a silent fix.
7. Track A's existing 9 Playwright projects/3 Storybook `webServer` entries, Track B's `ci` job, and Track C's release/migration/provenance artifacts are untouched except for the specifically approved ADR-045/GAP-008 documentation promotion.
8. `.github/workflows/ci.yml` is not edited by this plan's task list unless a task explicitly says so (Task 9 is the only such task) — no other task touches CI.

**Canonical build/start contract (binding on Tasks 2–4, 5–7, and 9 — resolves the CI/harness build-command inconsistency found in the first Plan Review):**

- Every harness's `package.json` exposes exactly one script named `build` that produces both the server-side render artifact and the client browser bundle, and exactly one script named `start` that starts the harness's Node SSR server from those already-built artifacts (no on-demand compilation at request time in either local dev-verification or CI).
- `pnpm --filter playground-angular run build`, `pnpm --filter playground-react run build`, and `pnpm --filter playground-vue run build` are the three canonical build invocations — identical shape across all three frameworks, differing only in the `--filter` package name. No framework-specific build-script name (`build:ssr`, `build:client`, etc.) is exposed at the top level; if a framework's toolchain needs multiple internal steps (e.g., Angular's application builder producing both browser and server output in one invocation, vs. React/Vue needing a separate Vite client build plus a server-file compile/copy step), those steps are composed _inside_ that one `build` script (e.g., via `&&`-chained sub-scripts or a single tool invocation that already does both) — never exposed as separate top-level scripts a caller must know to invoke in order.
- Task 9's CI job step is corrected to call this canonical script directly per framework (see the corrected step below) — no ternary/expression-based name translation is needed for the _script name_ (`build` is always `build`); only the `--filter` package name still needs a per-framework value, which Task 9 now resolves via an explicit `include:` matrix mapping instead of an inline expression (see Amendment 2/6 changes to Task 9 below).

**Verification performed before writing this plan (tooling/version reality check, per this repository's established plan-writing convention):**

- `packages/react/tsup.config.ts` exists — `tsup` is the confirmed, already-installed bundler for React's own library build. No `vite.config.ts` exists in `packages/react` or `packages/vue` at the package root (Storybook's own `.storybook/main.ts` supplies Vite config internally for both). This plan uses **Vite** for both React's and Vue's harness client bundles — not `tsup` — because `tsup` is a library-bundler (ESM/CJS output for consumption by other tools) with no dev-server/HMR story, while Vite is already a first-class, already-installed devDependency for both React's and Vue's Storybook tooling and is the standard tool for bundling a browser entry point for an actual running app. This resolves the specification's Open Question 1 (§L.1) with a concrete, evidence-based choice.
- All three frameworks' `.storybook/preview.*` files call `applyUltimateTheme()` from `@ultimate/themes` as their theme-loading mechanism (`packages/{ng,react,vue}/.storybook/preview.*`, read in full) — this exact call is what every harness's bootstrap/entry mirrors, per spec §C.6. No new theming mechanism is introduced.
- `packages/ng/package.json` has no `exports` map (single `main`/`module`); `packages/react/package.json` and `packages/vue/package.json` both have `exports` maps with per-component subpaths — confirmed directly. Angular's harness therefore imports from `@ultimate/ng`'s root barrel (its only available entry); React's and Vue's harnesses use per-component subpaths per spec §C.3.
- `.github/workflows/ci.yml:131-178` (`track-a-browser-visual-a11y` job) read in full — exact structure this plan's Task 9 mirrors.
- No task in this plan requires any framework CLI flag, API, or behavior beyond what was verified directly against installed tooling and official docs during the Architecture Research and Specification passes (Angular 21 `provideServerRendering`/`provideClientHydration`; React 18.3 `renderToPipeableStream`/`hydrateRoot`; Vue 3.5 `createSSRApp`/`renderToString`) — no further re-verification is needed at plan-writing time beyond the bundler/theming/exports confirmations above, which were not yet checked at Specification time.

---

## 1. Task List Overview

| #   | Task                                                                       | Depends on    | Parallelizable with |
| --- | -------------------------------------------------------------------------- | ------------- | ------------------- |
| 1   | Apply ADR-045 + correct GAP-008's stale field                              | none          | 2, 3, 4             |
| 2   | Angular SSR harness (`apps/playground-angular`)                            | none          | 1, 3, 4             |
| 3   | React SSR harness (`apps/playground-react`)                                | none          | 1, 2, 4             |
| 4   | Vue SSR harness (`apps/playground-vue`)                                    | none          | 1, 2, 3             |
| 5   | Angular Playwright SSR spec + `playwright.config.ts` project/webServer     | 2             | —                   |
| 6   | React Playwright SSR spec + `playwright.config.ts` project/webServer       | 3, 5          | —                   |
| 7   | Vue Playwright SSR spec + `playwright.config.ts` project/webServer         | 4, 6          | —                   |
| 8   | Determinism double-fetch check (recommended by spec §K, adopted here)      | 5, 6, 7       | —                   |
| 9   | CI integration — `track-e-ssr-hydration` job in `.github/workflows/ci.yml` | 5, 6, 7, 8    | —                   |
| 10  | GAP-034 registry update + harness READMEs                                  | 5, 6, 7, 8, 9 | —                   |
| 11  | Whole-track verification (local, full matrix, CI dry-run reasoning)        | 1–10          | —                   |

Task 11 is terminal. Tasks 1–4 have no dependency on each other and may be done in parallel by separate subagents, matching Tracks A/C's own established subagent-driven-development precedent. **Tasks 5, 6, and 7 are no longer mutually parallelizable, corrected from this plan's first draft** — each still depends on its own framework's harness task (2/3/4 respectively) for the harness to exist, but all three also edit the same shared `playwright.config.ts` file, so Task 6 additionally depends on Task 5's edit being complete, and Task 7 additionally depends on Task 6's (see the Sequencing notes under each task) — this avoids a three-way merge conflict on one file and produces a clean, order-preserving diff. Task 8 needs all three Playwright specs to exist so its determinism check pattern is applied uniformly. Task 9 needs 5–7 (and 8, since the CI job runs whatever local verification already proved stable) to be stable and passing locally before being encoded into CI. Task 10 is documentation-closeout, sequenced last before final verification since it describes the real, finished state, not a planned one.

---

## Task 1 — Apply ADR-045 and correct GAP-008's stale field

**Specification traceability:** §B (GAP-008 documentary promotion).

**What to change:**

1. Append to `docs/architecture/DECISIONS.md`, immediately after ADR-044 (currently the last entry, ending at line 191), the exact text block the specification drafted in §B, reproduced here verbatim for this task to apply without rewording:

   ```markdown
   ## ADR-045 — GAP-008's SSR/hydration scope is a minimal per-framework harness, not a full consumer/playground app

   Status: Accepted (architecture discussion `2026-09-08-phase-10-architecture-discussion.md` §5, promoted from citation-only status in ADR-044 to a standalone record). GAP-008 ("no real consumer application anywhere in the monorepo") is a real, still-partially-open gap, but its SSR/hydration-relevant slice is fully resolved: Phase 10's SSR/hydration verification requirement (Blueprint §28's Build/Package testing tier, §31) is satisfied by one minimal, framework-specific SSR-capable harness per framework — using each framework's own raw SSR primitives (Angular's `provideServerRendering`/`provideClientHydration`; React's `renderToPipeableStream`/`hydrateRoot`; Vue's `createSSRApp`/`renderToString`), not a meta-framework (Next.js/Nuxt) and not a full playground/showcase application. `apps/playground-angular`/`apps/playground-react`/`apps/playground-vue` are the intended homes for these harnesses; `apps/showcase` and `apps/docs` remain out of Phase 10 scope entirely. This closes GAP-034 (SSR/hydration verification) using GAP-008's infrastructure as the vehicle; it does not close GAP-008's fuller scope (tree-shaking re-measurement via a real app build — GAP-009 — genuine bundle-size/performance benchmarking, or a real consumer/demo experience), which remains open, unassigned backlog outside Phase 10.
   ```

2. In `docs/architecture/BLUEPRINT_GAPS.md`, replace the GAP-008 block's `- **Architectural decision required:** No.` line (currently line 178) with:

   ```markdown
   - **Architectural decision required:** Resolved for the SSR/hydration slice only — see ADR-045. GAP-008's fuller consumer-app scope (tree-shaking re-measurement, bundle-size benchmarking, a real demo experience) remains open backlog, not addressed by Phase 10 Track E.
   ```

**What NOT to do:**

- Do not reword ADR-045's text — apply it verbatim as the specification drafted it. Any wording change is a Spec-Review-level concern, not this plan's to make.
- Do not touch any other GAP-008 reference in `BLUEPRINT_GAPS.md` (lines 172, 188, 191, 681, 734–735, 779) — the specification (§B) confirmed none of them require correction.
- Do not renumber or touch any existing ADR (ADR-001 through ADR-044).

**Acceptance criteria:**

- AC1.1: `grep -c "^## ADR-" docs/architecture/DECISIONS.md` returns 45 (was 44).
- AC1.2: `git diff docs/architecture/BLUEPRINT_GAPS.md` shows exactly one changed line (the "Architectural decision required" field for GAP-008), no other diff.
- AC1.3: `git diff --stat` for this task touches only `docs/architecture/DECISIONS.md` and `docs/architecture/BLUEPRINT_GAPS.md`.

---

## Task 2 — Angular SSR harness (`apps/playground-angular`)

**Specification traceability:** §C.2, §C.6, §C.7, §D (Angular rows).

**What to create:**

1. `apps/playground-angular/package.json` — `"private": true`, `"name": "playground-angular"` (unscoped — not an `@ultimate/*` published-package name, avoiding any possible confusion with the real packages), depending on `@ultimate/ng`, `@ultimate/ng-core`, `@ultimate/themes` via `workspace:*`, plus `@angular/*` (core, common, platform-browser, platform-server, ssr, build, cli, compiler-cli) pinned to the same exact `21.2.22` version already used across `packages/ng`'s devDependencies, and `express` (or Angular's own documented minimal server dependency — confirmed at Task time against the current `angular.dev/api/ssr/provideServerRendering` example) for the HTTP layer. Scripts: `"build"` (runs the Angular application builder producing both browser and server output — see artifact flow below) and `"start"` (runs `node dist/playground-angular/server/server.mjs`, or this framework's actual build-output path once confirmed at Task time — starting the compiled server from this task's own `"build"` output, never from source).
2. `apps/playground-angular/angular.json` — a new, `"projectType": "application"` project (not library) — the first of its kind in this monorepo, using `@angular/build:application` (or Angular 21's current equivalent application builder — confirmed against installed `@angular/build` version at Task time) with `server` and `ssr` options pointing at the server/client entry files below.
3. `apps/playground-angular/src/app/proof-page.component.ts` — one standalone component whose template renders all 8 components (`<u-button>`, `<u-checkbox>`, `<u-dialog>`, `<u-menu>`, `<u-paginator>`, `<u-scroller>`, `<u-table>`, `<u-tooltip>`), imported from `@ultimate/ng`, with static fixture data satisfying spec §D.2/§D.3 (literal strings/numbers, no `Math.random()`/`Date.now()`/locale formatting).
4. `apps/playground-angular/src/main.ts` (client bootstrap, the Angular application's browser entry point) — `bootstrapApplication(ProofPageComponent, { providers: [provideClientHydration()] })`.
5. `apps/playground-angular/src/main.server.ts` (server bootstrap, the Angular application's server entry point — a distinct file from `main.ts`, per Angular's own application-builder convention of separate browser/server entry points feeding one build) — the same `ProofPageComponent`, `providers: [provideServerRendering()]`, per `angular.dev/api/ssr/provideServerRendering`.
6. `apps/playground-angular/src/server.ts` — the hand-written Express server (not generated by the Angular builder itself — the builder produces the renderer artifact this file imports and calls, not the HTTP server) serving the SSR-rendered page and static client assets on a configurable port (default 6011, per spec §F.4).

**Angular artifact flow (concrete, resolving the first Plan Review's Amendment 3 finding):**

```
Angular application source
  (src/main.ts — browser entry; src/main.server.ts — server entry;
   src/app/proof-page.component.ts — shared component tree both entries bootstrap)
        │
        ▼
Angular application build  (`ng build`, via the `"build"` script — @angular/build:application
   with `server`/`ssr` options set in angular.json, invoked once, producing BOTH outputs below
   in a single build — not two separate builder invocations)
        │
        ├──► browser artifacts   → dist/playground-angular/browser/**
        │      (the static client JS/CSS bundle main.ts compiles to — what the
        │       Express server in server.ts serves as static assets, and what
        │       the client <script> tag in the HTML shell loads to hydrate)
        │
        └──► server artifacts    → dist/playground-angular/server/**
               (a Node-runnable bundle of main.server.ts's render function —
                what server.ts imports directly, e.g.
                `import { renderApplication } from './dist/playground-angular/server/main.server.mjs'`
                or the actual export shape Angular's application builder produces,
                confirmed at Task time against the installed @angular/build version)
        │
        ▼
Node SSR server (server.ts, started via `"start"`, never via source/ts-node in
   the built-artifact contract — see Task 5/9's build-then-start sequencing)
  — on each HTTP request: calls the server-artifact's render function against
    the requested URL, gets back the rendered HTML string, wraps/serves it
    with the browser artifacts' <script>/<link> tags referencing the browser
    artifact's compiled file names, and serves dist/playground-angular/browser/**
    as static files for those references to resolve
        │
        ▼
HTTP response  (the real SSR HTML, verified by Task 5's Playwright spec and
   AC2.2's manual curl check below)
```

The exact Angular-builder output directory names/export shape (`dist/playground-angular/browser`/`server`, the server artifact's exact function/module name) are confirmed against the actually-installed `@angular/build` version when this task is executed — the _architecture_ above (one build, two artifact outputs, `server.ts` as a distinct hand-written consumer of the server artifact) is fixed by this plan and does not require implementation-time invention; only the literal path/export names are.

7. `applyUltimateTheme()` from `@ultimate/themes` — see the cross-cutting placement rule in the "Theme-loading placement" note below (applies identically to Tasks 2, 3, and 4; not repeated per-task).

**What NOT to do:**

- Do not call `provideZoneChangeDetection()` — Angular 21's zoneless default (verified, angular.dev) is what `@ultimate/ng`/`@ultimate/ng-core` already assume (ADR-022); this harness introduces no zone.js dependency.
- Do not add `withRoutes()`/`withAppShell()` — one page, no routing (spec §C.2, binding out-of-scope §A.3).
- Do not modify `packages/ng/angular.json` or any file under `packages/ng`/`packages/ng-core` — confirmed by the specification (§C.2) that the library project cannot and should not be reused/extended; this is a wholly new, separate project.
- Do not add any DOM manipulation outside Angular's own template/change-detection system in the proof page (spec §C.7 — direct `insertBefore`-style manipulation triggers `NG0500`).
- Do not have `server.ts` compile or bundle Angular source itself at request time or at server-start time — it only loads and calls the already-built server artifact (per the canonical build/start contract above); `"start"` never triggers a build.

**Acceptance criteria:**

- AC2.1: `pnpm --filter playground-angular run build` completes without error and produces both `dist/playground-angular/browser/**` and `dist/playground-angular/server/**` (or the actual confirmed output paths) as separate, verifiable outputs.
- AC2.2: `pnpm --filter playground-angular run start` (run only after AC2.1's build, never combined into one command) starts the server from the built artifacts only, and a plain `curl http://localhost:6011/` (or the assigned port) returns HTML containing, at minimum, the literal static fixture text for all 8 components (e.g., the Button's static label string, the Table's static row values) — verified manually before Task 5 writes the automated Playwright assertion for the same thing.
- AC2.3: `git diff --stat` for this task touches only files under `apps/playground-angular/`.
- AC2.4: No file under `packages/ng` or `packages/ng-core` appears in this task's diff.
- AC2.5: Deleting `dist/` and running `pnpm --filter playground-angular run start` without first running `build` fails cleanly (module-not-found or equivalent) — proving `start` genuinely depends on `build`'s output and never silently falls back to compiling from source.

---

## Task 3 — React SSR harness (`apps/playground-react`)

**Specification traceability:** §C.3, §C.6, §C.7, §D (React rows).

**What to create:**

1. `apps/playground-react/package.json` — `"private": true`, `"name": "playground-react"`, depending on `@ultimate/react`, `@ultimate/react-core`, `@ultimate/themes` via `workspace:*`, `react`/`react-dom` pinned to `^18.3.1` (matching `packages/react`'s own devDependency pin), `vite` (this plan's Task-header decision) for client bundling, and `express` for the Node server. Scripts: `"build"` (a single script chaining two sub-steps — `vite build` for the client bundle, then `tsc` (or `esbuild`, implementer's choice, non-architectural) compiling `entry-server.tsx`/`server.ts` to a plain Node-runnable `.js` — both outputs land under one `dist/` tree before `"build"` exits) and `"start"` (`node dist/server.js`, importing the already-compiled server entry — never `ts-node`/on-the-fly transpilation of source at request time).
2. `apps/playground-react/src/App.tsx` — one root component rendering `<Button>`, `<Checkbox>`, `<Dialog>`, `<Menu>`, `<Paginator>`, `<Scroller>`, `<Table>`, `<Tooltip>`, imported via `@ultimate/react`'s per-component subpaths (`@ultimate/react/button`, etc. — confirmed available, this plan's header), with the same static-fixture-data discipline as Task 2's proof page.
3. `apps/playground-react/src/entry-client.tsx` — `hydrateRoot(document.getElementById("root"), <App />)`; compiled by Vite into `dist/client/**` (the browser bundle).
4. `apps/playground-react/src/entry-server.tsx` — exports a function wrapping `renderToPipeableStream(<App />, { onShellReady, onError })` per `react.dev/reference/react-dom/server/renderToPipeableStream`; compiled (by the `"build"` script's second sub-step) into `dist/entry-server.js`, imported by `dist/server.js` below.
5. `apps/playground-react/server.js` (source file; compiled to `dist/server.js` by `"build"`) — an Express server that, on request, imports and calls the compiled server entry (`dist/entry-server.js`, never the `.tsx` source), pipes the resulting stream into the HTTP response wrapped in the page shell (`<html><head>…</head><body><div id="root">` + piped content + `</div><script type="module" src="/entry-client.js"></script></body></html>`), and serves `dist/client/**` (the Vite-built browser bundle) as static assets for the `<script>` tag's reference to resolve. Default port 6012 (spec §F.4).
6. `applyUltimateTheme()` — see the cross-cutting placement rule in the "Theme-loading placement" note after Task 4.
7. `apps/playground-react/vite.config.ts` — minimal Vite config for building `entry-client.tsx` into `dist/client/**` as the client bundle (the first sub-step of `"build"`).

**React artifact flow (concrete, same architecture pattern as Task 2's Angular flow, resolving the same Amendment-3-class ambiguity for consistency across harnesses):**

```
React application source (src/App.tsx, src/entry-client.tsx, src/entry-server.tsx)
        │
        ▼
"build" script — two sub-steps in one invocation:
  (1) vite build  → dist/client/**        (browser bundle: entry-client.tsx + deps)
  (2) tsc/esbuild → dist/entry-server.js, dist/server.js   (compiled Node-runnable server code)
        │
        ▼
Node SSR server (dist/server.js, started via "start")
  — imports dist/entry-server.js's render function, calls it per-request,
    pipes the stream into the HTTP response, serves dist/client/** as
    static assets for the response's own <script> tag reference
        │
        ▼
HTTP response
```

**What NOT to do:**

- Do not use `renderToString` — the binding decision and spec §C.3 name `renderToPipeableStream` specifically.
- Do not add any Portal special-casing in the harness — Task 2/3/4's own verification (spec §C.3, independently re-confirmed by this session's own direct source read of `packages/react-core/src/overlay/portal.tsx`) already established Portal is server-safe by construction (`mounted` state starts `false`, only flips via a mount-only `useEffect`). If a hydration mismatch traceable to Portal is observed anyway during this task's own manual verification, that is a Task-2/3/4-level finding to report back before proceeding to Task 6, not a harness-side workaround to silently add.
- Do not add a data-fetching Suspense boundary — fixtures are static; `onShellReady` fires immediately (spec §C.3).
- Do not modify `packages/react` or `packages/react-core`.
- Do not have `dist/server.js` import `.tsx`/`.ts` source directly or invoke `ts-node`/`tsx` at request time — it only imports the already-compiled `dist/entry-server.js`.

**Acceptance criteria:**

- AC3.1: `pnpm --filter playground-react run build` completes without error and produces both `dist/client/**` and `dist/server.js`/`dist/entry-server.js` as separate, verifiable outputs.
- AC3.2: `pnpm --filter playground-react run start` (run only after AC3.1's build) starts the server from the built artifacts only; `curl http://localhost:6012/` returns HTML containing all 8 components' static SSR-content-requirement text (spec §D.2 column 1); Dialog/Tooltip/Menu's Portal-dependent content is absent from this raw response (expected — spec §D.2/§D.4), and no other error is present in server logs.
- AC3.3: `git diff --stat` for this task touches only files under `apps/playground-react/`.
- AC3.4: No file under `packages/react` or `packages/react-core` appears in this task's diff.
- AC3.5: Deleting `dist/` and running `pnpm --filter playground-react run start` without first running `build` fails cleanly (module-not-found) — proving `start` depends on `build`'s output, not source.

---

## Task 4 — Vue SSR harness (`apps/playground-vue`)

**Specification traceability:** §C.4, §C.6, §C.7, §D (Vue rows).

**What to create:**

1. `apps/playground-vue/package.json` — `"private": true`, `"name": "playground-vue"`, depending on `@ultimate/vue`, `@ultimate/vue-core`, `@ultimate/themes` via `workspace:*`, `vue` pinned to `^3.5.13` (matching `packages/vue`'s pin), `vite`/`@vitejs/plugin-vue` (already the tool family `packages/vue` uses for its own Storybook/build tooling, this plan's header), and `express`. Scripts: `"build"` (chains `vite build` for the client bundle into `dist/client/**`, then compiles `entry-server.ts`/`server.js` into `dist/entry-server.js`/`dist/server.js`, same two-sub-step shape as Task 3's React `"build"`) and `"start"` (`node dist/server.js`, importing only compiled output).
2. `apps/playground-vue/src/App.vue` (or `.ts` with a render function — implementer's choice, consistent with Vue conventions) — one root component rendering `<UButton>`, `<UCheckbox>`, `<UDialog>`, `<UMenu>`, `<UPaginator>`, `<UScroller>`, `<UTable>`, `<UTooltip>`, imported from `@ultimate/vue`'s per-component subpaths, with the same static-fixture discipline as Tasks 2–3.
3. `apps/playground-vue/src/entry-client.ts` — `createSSRApp(App).mount("#app")`; compiled by Vite into `dist/client/**`.
4. `apps/playground-vue/src/entry-server.ts` — exports a function calling `renderToString(createSSRApp(App))` from `vue/server-renderer`, per `vuejs.org/guide/scaling-up/ssr.html`; compiled into `dist/entry-server.js`, imported by `dist/server.js`.
5. `apps/playground-vue/server.js` (or `.ts`; compiled to `dist/server.js`) — an Express (or plain Node `http`, per spec §L.1's noted equal-viability finding — implementer's choice, since Vue's own official example uses plain `http`) server that imports and calls the compiled `dist/entry-server.js` (never `.ts` source at request time), wraps the returned HTML string in the page shell, and serves `dist/client/**` as static assets. Default port 6013 (spec §F.4).
6. `applyUltimateTheme()` — see the cross-cutting placement rule immediately below.
7. `apps/playground-vue/vite.config.ts` — minimal Vite + `@vitejs/plugin-vue` config for building `entry-client.ts` into `dist/client/**`.

**Vue artifact flow:** identical shape to Task 3's React flow above (source → `"build"`'s two sub-steps → `dist/client/**` + `dist/server.js` → Node server imports compiled server artifact, serves compiled client artifact as static assets → HTTP response) — substituting Vue's `createSSRApp`/`renderToString`/`.mount()` calls for React's `renderToPipeableStream`/`hydrateRoot`.

**What NOT to do:**

- Do not use Nuxt or any Nuxt convention (file-based routing, auto-imports) — plain `createSSRApp`/`renderToString` only.
- Do not add Teleport special-casing — already confirmed server-safe by construction (`packages/vue-core/src/overlay/portal.ts`'s `mounted` ref gate, only flipped in `onMounted()`, which Vue's own docs confirm never fires server-side).
- Do not modify `packages/vue` or `packages/vue-core`.
- Do not have `dist/server.js` import `.ts` source directly at request time.

**Acceptance criteria:**

- AC4.1: `pnpm --filter playground-vue run build` completes without error and produces both `dist/client/**` and `dist/server.js`/`dist/entry-server.js` as separate, verifiable outputs.
- AC4.2: `pnpm --filter playground-vue run start` (run only after AC4.1's build) starts the server from built artifacts only; `curl http://localhost:6013/` returns HTML containing all 8 components' static SSR-content-requirement text; Dialog/Menu's Teleport-dependent content is absent from this raw response (expected).
- AC4.3: `git diff --stat` for this task touches only files under `apps/playground-vue/`.
- AC4.4: No file under `packages/vue` or `packages/vue-core` appears in this task's diff.
- AC4.5: Deleting `dist/` and running `pnpm --filter playground-vue run start` without first running `build` fails cleanly — proving `start` depends on `build`'s output, not source.

---

### Theme-loading placement — implementation-time SSR-safety verification (applies to Tasks 2, 3, 4 identically)

**This plan's own direct source verification, performed while amending this plan (not deferred):** `packages/themes/src/apply-theme.ts` (`applyUltimateTheme()`'s actual implementation, read in full) calls only `Theme.setTheme(...)`, which resolves to `packages/uix-styled/src/config/index.ts`'s `setTheme`/`update` methods — both confirmed, by direct read, to touch only in-memory state (`this._theme`, `this._tokens`, a `Set`-based `_layerNames`/`_loadedStyleNames`) and an event-emitter (`ThemeService.emit(...)`). **No `document`/`window`/browser-global reference exists anywhere in this call chain.** `applyUltimateTheme()` is SSR-safe by construction, not merely by convention — it is confirmed safe to call from both a harness's client entry and its server entry (or, more simply, from one shared bootstrap module both entries import, since the call is identical and side-effect-free with respect to environment).

**Binding placement rule:** each harness calls `applyUltimateTheme()` exactly once, as early as possible, from a location both the server entry and the client entry execute before any component renders (a shared bootstrap module imported by both `main.ts`/`main.server.ts` (Angular), both `entry-client.tsx`/`entry-server.tsx` (React), or both `entry-client.ts`/`entry-server.ts` (Vue) is the simplest such location, and is what Tasks 2–4 now specify).

**Standing escalation clause (unchanged from this plan's original binding decision 6, restated here for this specific call since the first Plan Review asked for explicit verification language):** if any Task 2–4 implementer's own re-verification at implementation time finds `applyUltimateTheme()` or anything in its call chain to in fact be browser-only or dependent on a browser global that this plan's source read above missed, the fix is to relocate the _call site_ to wherever it is technically valid for that specific harness (e.g., client-only, or gated the same way the already-verified `*-core` StyleSheet registrations are gated) — **not** to modify `applyUltimateTheme()`, `Theme.setTheme`, or any file under `packages/themes`/`packages/uix-styled` to accommodate the harness. Any such relocation is documented in that task's own completion notes as a finding, consistent with this plan's existing production-code-change escalation path (binding decision 6, spec Exit Criterion 10) — it is not expected to be needed, given the direct source verification above, but the plan does not assume infallibility of a single read.

---

### Deterministic build-then-serve contract for Playwright (applies to Tasks 5, 6, 7 — resolves the first Plan Review's Amendment 2 finding)

**The workflow is explicit and identical in local dev-verification and CI, in this exact order, for every framework:**

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter <harness> run build` (the canonical `build` script from the binding contract above — produces the harness's `dist/` artifacts)
3. Playwright's `webServer` entry runs `pnpm --filter <harness> run start` (the canonical `start` script — loads only already-built `dist/` output, per each Task 2–4's own "no compile-at-request-time" rule) and waits on `url` for readiness, exactly like Track A's three existing `webServer` entries already do.
4. `npx playwright test --project=<framework>-ssr-chromium` runs against the now-running, already-built server.

**Playwright's `webServer.command` is deliberately `start`, never `build && start`, and never a combined dev-mode command:** step 2 (build) is not folded into the `webServer` entry's `command` field, because Playwright's `reuseExistingServer`/`timeout` semantics are designed around _starting a server_, not around _build-then-start_ — folding a build into `command` would make Playwright's readiness timeout also have to absorb build time, and would silently re-build on every local test run even when nothing changed. Instead, the build step is a **separate, explicit prerequisite** each environment runs once before invoking Playwright at all:

- **Local verification** (Tasks 2–4's own AC2.1–AC4.1, and this task's own manual pre-check before trusting the automated spec): run `pnpm --filter <harness> run build` once, then `npx playwright test --project=<framework>-ssr-chromium` — never skip step 2 and assume stale `dist/` output is current.
- **CI** (Task 9): the CI job's steps run `build` as its own explicit step, strictly before the `playwright test` step — see Task 9's corrected step list below. Playwright's `webServer.command` in CI is still only `start` — CI's ordering guarantee comes from the job's own linear step sequence, not from anything inside `playwright.config.ts`.

This directly answers the first Plan Review's five sub-questions: build is a hard prerequisite (not implicit); built artifacts are produced by each harness's own canonical `build` script (Tasks 2–4); the SSR server consumes them via `start`, which only ever loads `dist/`; `webServer` starts the server via `start` (never `build`); and CI guarantees the prerequisite by running `build` as its own preceding step, not by relying on `webServer` to build on demand.

---

### `webServer`/CI-matrix isolation — why the global-`webServer` assumption was insufficient, and the mechanism that replaces it (resolves the second Plan Review finding)

**The problem, confirmed against real Playwright internals, not assumed:** Playwright's `webServer` config field (whether a single object or an array) is a top-level `TestConfig` property, entirely separate from `projects` — there is no per-project association mechanism anywhere in Playwright's config schema. Verified directly against Playwright's own runner source (fetched via Context7, `/microsoft/playwright.dev`, `node_modules/playwright/lib/runner/tasks.js`): server startup (`createPluginSetupTasks(config)`) is one task that runs over the **entire** resolved `config` object, and it executes **before** test/project filtering is ever applied (`--project` filtering happens later, inside `createLoadTask(..., { filterOnly: true })`, as part of `createRunTestsTasks`). Concretely: **every entry in the `webServer` array starts on every invocation of `npx playwright test`, regardless of which `--project` flag is passed.** This is true today for Track A's three existing Storybook `webServer` entries (all three Storybook instances start even if you run `--project=ng-chromium` alone) and would, without correction, be equally true for three new SSR `webServer` entries — meaning a CI matrix leg that only built `apps/playground-angular` would still have Playwright attempt to start the React and Vue SSR servers too, both of which would fail immediately (no `dist/` built in that job) and either hang the test run on a startup timeout or fail it outright, even though that leg only asked to run `ng-ssr-chromium`.

**The previous plan draft's Tasks 5–7 did not account for this — each described adding "one new `webServer` entry" as if it were scoped to its own project, which Playwright does not do.** This amendment corrects that assumption.

**Chosen mechanism: an environment-variable-gated `webServer` array, built at config-load time inside `playwright.config.ts` — the same pattern this file already uses for `process.env.CI` (`forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `reuseExistingServer: !process.env.CI` on all three existing entries, `playwright.config.ts:25-26,158,165,172`).** `playwright.config.ts` is a plain TypeScript module evaluated once at config-load time — before Playwright's internal task pipeline (including the webServer-startup task confirmed above) ever runs — so any array-construction logic in the file (an `if`/ternary/`.filter()` deciding which entries end up in the exported `webServer` array) is exactly as valid and exactly as "real Playwright configuration convention" as the `process.env.CI`-driven values already present. No Playwright API for per-project `webServer` scoping is invented or assumed; instead, the _array Playwright receives_ is different per invocation, decided entirely by this repository's own config file, which is the standard, documented way to make a Playwright config file environment-sensitive.

**Concrete mechanism:**

- A new environment variable, `TRACK_E_SSR_FRAMEWORK`, optionally set to one of `ng` / `react` / `vue`.
- In `playwright.config.ts`, the three new Track E `webServer` entries (Angular/React/Vue, ports 6011–6013) are constructed as a small array/lookup (e.g., `const trackESsrServers = { ng: {...}, react: {...}, vue: {...} }`), and the entries actually included in the final exported `webServer` array are selected by:
  ```typescript
  const selectedFramework = process.env.TRACK_E_SSR_FRAMEWORK; // "ng" | "react" | "vue" | undefined
  const trackESsrEntries = selectedFramework
    ? [trackESsrServers[selectedFramework]] // CI: exactly one, matching the matrix leg
    : Object.values(trackESsrServers); // local (unset): all three, for AC7.6's combined run
  ```
- The final `webServer` array remains `[...the existing 3 Storybook entries (untouched, unconditional), ...trackESsrEntries]` — Track A's three entries are never touched by this conditional; only the _new_ Track E slice is filtered.
- **Local combined execution (unset `TRACK_E_SSR_FRAMEWORK`):** all three Track E `webServer` entries are included, exactly as the plan's first draft assumed — `npx playwright test --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium` (AC7.6) starts all three SSR servers (plus, harmlessly, Track A's three Storybook servers, unchanged current behavior) and runs the three selected projects against them.
- **CI single-framework execution:** each matrix leg's "Run Playwright SSR project" step sets `TRACK_E_SSR_FRAMEWORK` to that leg's own `matrix.framework` value before invoking `playwright test`, so only that framework's `webServer` entry is in the array Playwright starts — the `ng` matrix job never attempts to start the React or Vue SSR server, and never needs their `dist/` output to exist.
- **Track A isolation:** Track A's three Storybook `webServer` entries are declared exactly as they are today, unconditionally, with no new environment-variable gate applied to them — this mechanism is additive and scoped only to the three _new_ Track E entries; Track A's existing behavior (all three Storybook servers always start) is completely unchanged.
- **Build/start contract preserved:** each Track E `webServer` entry's `command` remains exactly `pnpm --filter <harness> run start` (never `build`, never a combined command) — this amendment changes only _which entries are included in the array_, not what any individual entry's `command` does. The CI job's own explicit "Build harness" step (Task 9, unchanged by this amendment) still runs before the Playwright step, so whichever single server `TRACK_E_SSR_FRAMEWORK` selects in that leg always has its `dist/` already built by the time `webServer` tries to start it.

**Why this satisfies all seven of the required design points:** (1) local combined execution starts all three servers because `TRACK_E_SSR_FRAMEWORK` is unset locally, so the lookup's `Object.values(...)` branch includes all three; (2) CI isolates to one server because each matrix leg sets the variable to its own framework before running tests; (3) the selected framework is communicated via that one environment variable, read once at config-load time — no other signal (file, CLI flag beyond the existing `--project`, etc.) is needed; (4) Track A's 9 projects/3 webServer entries are declared with no reference to this new variable at all, so they are structurally untouched; (5) every Track E `webServer.command` is still exactly `start`; (6) the build→start→test contract from the prior section is unaffected — this amendment only changes array membership, not command content or step ordering; (7) AC7.6 (local combined run) and Task 9's CI matrix (single-framework run) are both satisfiable because they exercise the two different branches of the same conditional, driven by the same one variable, in the same config file.

---

## Task 5 — Angular Playwright SSR spec + config wiring

**Specification traceability:** §E, §F.1–F.4.

**Sequencing (resolves the first Plan Review's Amendment 6 finding):** Task 5 is completed and its own diff to `playwright.config.ts` committed to the working tree **before** Task 6 begins editing the same file, and Task 6's diff is completed before Task 7 begins. This is a hard ordering constraint on this file specifically (not a general constraint on Tasks 2–4, which touch disjoint directories and remain freely parallelizable) — Tasks 5, 6, and 7 are **not** parallelizable with each other, unlike the "Parallelizable with" column in §1's table might otherwise suggest for the underlying harness work; the constraint is scoped to the shared config file, not to the per-framework spec files, which remain independent. Each of Tasks 5/6/7 must, as its own explicit acceptance check, re-run the full existing Playwright suite (not just its own new project) to confirm every previously-added project (Track A's original 9, plus any SSR project added by an earlier-sequenced task in this same set) still passes — proving the edit was purely additive.

**What to create/modify:**

1. `apps/playground-angular/e2e/ssr-hydration.spec.ts` — one file, one `test.describe` block per component (8 total), implementing the full §E pipeline: (a) a plain HTTP GET (via `page.request.get()`) against the running harness asserting each component's SSR-content-requirement text is present in the raw response body **before** `page.goto()` is called; (b) `page.goto()` in the `ng-ssr-chromium` project; (c) a hydration-complete wait — the proof page sets `data-hydrated="true"` on its root element from a post-bootstrap callback, polled via `page.waitForSelector('[data-hydrated="true"]')`; (d) `page.on("console")`/`page.on("pageerror")` listeners registered before `page.goto()`, asserting no message matches Angular's `NG0500` pattern or any other unexpected error; (e) the per-component post-hydration interaction from the concrete interaction table below, asserted via Playwright locators.
2. Add to root `playwright.config.ts`: one new project `ng-ssr-chromium` (`testDir: "./apps/playground-angular/e2e"`, `use: { ...devices["Desktop Chrome"] }`), and — per the `webServer`/CI-matrix isolation mechanism established above (this is the task that introduces the `trackESsrServers` lookup object and the `TRACK_E_SSR_FRAMEWORK`-driven selection logic, since Angular's is the first Track E `webServer` entry added) — one new entry keyed `ng` in that lookup (`name: "ng-ssr-server"`, `command: "pnpm --filter playground-angular run start"` — per the deterministic build-then-serve contract above, never `build && start` — on port 6011, `url: "http://localhost:6011"`, `reuseExistingServer: !process.env.CI`, `timeout: 120_000`). The existing three Storybook `webServer` entries and the existing 9 `projects` entries remain declared exactly as before, unconditionally; only the new Track E slice is filtered by `TRACK_E_SSR_FRAMEWORK`. This task's own local verification runs `pnpm --filter playground-angular run build` once, manually, then runs Playwright with `TRACK_E_SSR_FRAMEWORK` left **unset** (so Angular's is the only Track E entry the lookup has at this point in the sequence, and it is included either way) before trusting Playwright's `webServer` to find a working `dist/` to start from.

**Concrete per-component post-hydration interaction/assertion table (resolves the first Plan Review's Amendment 4 finding — replaces all "if enabled"/implicit wording; binding on Tasks 5, 6, and 7 identically, one row exercised per framework's own component API):**

| Component     | SSR-content assertion                                                                                                                                                                                                                                                                                                                                    | Post-hydration interaction                                                                                                                                                               | Post-hydration assertion                                                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**    | Static label text (e.g., `"Proof Button"`) present in raw HTML                                                                                                                                                                                                                                                                                           | `page.getByRole("button", { name: "Proof Button" }).click()`                                                                                                                             | A static counter/status element's text changes from its initial value (e.g., `"Clicks: 0"` → `"Clicks: 1"`)                                                                                                                                                           |
| **Checkbox**  | Initial `checked`/unchecked state's ARIA/attribute present in raw HTML                                                                                                                                                                                                                                                                                   | `page.getByRole("checkbox").click()`                                                                                                                                                     | The checkbox's `aria-checked` (or equivalent DOM state) flips to the opposite of its initial value                                                                                                                                                                    |
| **Dialog**    | Dialog's trigger button present; dialog content/mask absent from raw HTML (closed by default, per Portal's server-null behavior)                                                                                                                                                                                                                         | Click the trigger button to open; then press `Escape` (or click a close button)                                                                                                          | Dialog content becomes visible (`role="dialog"` element visible) after open; becomes hidden again after close                                                                                                                                                         |
| **Menu**      | Menu rendered in its default **inline** mode (not popup) so its items' static labels are present in raw HTML — inline mode is the concrete, binding choice for SSR-content-presence, not left open                                                                                                                                                       | Click (or `Enter`/`Space`-activate) one specific, named menu item (e.g., `"Item 2"`)                                                                                                     | A static "last selected" display element's text updates to that item's label (e.g., `"Last selected: Item 2"`)                                                                                                                                                        |
| **Paginator** | Static current-page indicator (e.g., `"Page 1"`) present in raw HTML                                                                                                                                                                                                                                                                                     | Click the "next page" control once                                                                                                                                                       | The page indicator updates from `"Page 1"` to `"Page 2"`                                                                                                                                                                                                              |
| **Scroller**  | A static, fixed-size list of exactly 5 fixture items, each with a literal, distinct label (e.g., `"Row 1"`…`"Row 5"`), all present in raw HTML (small enough that no virtualization windowing hides any item from the initial SSR payload — this specific, concrete fixture size is what makes the SSR-content assertion meaningful rather than vacuous) | Programmatically scroll the Scroller's viewport element by a fixed pixel amount (`element.scrollTop = 100` via `page.evaluate()`, or a keyboard `PageDown` if the component supports it) | The scroll does not throw a console error, and the Scroller's viewport `scrollTop` (read back via `page.evaluate()`) reflects the applied scroll offset — proving the scroll handler attached post-hydration and the component did not silently reset scroll position |
| **Table**     | Static, literal row/column data (e.g., 3 rows × 2 columns with fixed string/number values) present in raw HTML                                                                                                                                                                                                                                           | Click one sortable column's header once                                                                                                                                                  | The visible row order changes to match that column's ascending sort of the known, literal fixture values (asserted by reading back the rendered cell text in order, not by trusting an internal sort-state flag)                                                      |
| **Tooltip**   | Host element (e.g., a button with a static label) present in raw HTML; tooltip content itself absent (Portal's server-null behavior)                                                                                                                                                                                                                     | `page.getByRole("button", { name: <host label> }).hover()` (or `.focus()`)                                                                                                               | Tooltip content becomes visible (a specific, literal tooltip text string appears in the DOM)                                                                                                                                                                          |

**What NOT to do:**

- Do not modify any of Track A's existing 9 projects or 3 `webServer` entries in `playwright.config.ts` — additive only.
- Do not add Firefox/WebKit variants — Chromium only (binding decision).
- Do not assert `<style>` tag presence in the raw SSR HTML response (spec §D.3's explicit non-assertion).
- Do not begin Task 6's `playwright.config.ts` edit until this task's own edit is complete (see Sequencing above).

**Acceptance criteria:**

- AC5.1: `npx playwright test --project=ng-ssr-chromium` passes locally, using the deterministic build-then-serve workflow above (`build` run once manually beforehand).
- AC5.2: The spec fails (verified by a deliberate temporary break, then reverted) if the SSR HTML is missing a component's expected content — proving the SSR-content assertion is real, not vacuous.
- AC5.3: The spec fails (verified the same way) if a post-hydration interaction assertion's expected DOM change does not occur — proving the interaction assertion is real, for all 8 components' specific assertions in the table above (not just a subset).
- AC5.4: `npx playwright test` (full existing suite, no `--project` filter) still passes for all of Track A's original 9 projects — proving no regression to Track A.
- AC5.5: `git diff playwright.config.ts` shows only additive changes (new project entry, new webServer entry, and — only in this task, since it is first — the new `trackESsrServers` lookup and `TRACK_E_SSR_FRAMEWORK`-selection logic) — no existing line altered or removed.
- AC5.6: Running `TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium` starts only the Angular SSR server (confirmed by process/port inspection — e.g., `lsof -i :6011` shows a listener, `lsof -i :6012`/`:6013` do not, since those entries don't exist in the lookup until Tasks 6/7) — this is the earliest point the isolation mechanism itself can be verified, even with only one framework's entry present.

---

## Task 6 — React Playwright SSR spec + config wiring

**Specification traceability:** §E, §F.1–F.4.

**Sequencing:** begins only after Task 5's `playwright.config.ts` edit is complete (see Task 5's Sequencing note) — this task's own edit to the file starts from the state Task 5 left it in, appending React's project/webServer entries after Angular's, and must not revert or reorder Task 5's additions.

**What to create/modify:** identical structure to Task 5, scoped to React: `apps/playground-react/e2e/ssr-hydration.spec.ts`, new `react-ssr-chromium` project (`testDir: "./apps/playground-react/e2e"`), and a new `react` key added to the `trackESsrServers` lookup Task 5 introduced (`command: "pnpm --filter playground-react run start"`, per the deterministic build-then-serve contract — this task's own local verification runs `pnpm --filter playground-react run build` once, manually, first) for port 6012 — this task adds a key to the existing lookup object; it does not redefine or duplicate the `TRACK_E_SSR_FRAMEWORK`-selection logic Task 5 already wrote. Hydration-complete signal: `data-hydrated="true"` set from the client entry's post-`hydrateRoot` callback (a `useMountEffect`-driven state flip on the root component), identical mechanism to Task 5's Angular signal for consistency. Per-component interactions: the same concrete table from Task 5, applied via React's own component API/DOM shape (e.g., Menu still defaults to inline mode for SSR-content presence; Table's sort/Scroller's scroll assertions read back the same literal fixture values). This task's own local verification runs Playwright with `TRACK_E_SSR_FRAMEWORK` unset (both Angular's and React's entries are present and both included).

**What NOT to do:** same category as Task 5 — no modification to Track A's existing projects, Chromium-only, no `<style>`-presence assertion, no reordering of Task 5's already-added entries. Additionally: do not add special Portal-timing waits beyond the standard hydration-complete + interaction wait — Portal's post-hydration appearance (Dialog/Tooltip opening, Menu's popup mode if used) is exercised through the normal interaction assertion (click-to-open, then assert visible), not a separate Portal-specific mechanism.

**Acceptance criteria:** AC6.1–AC6.5 mirror AC5.1–AC5.5 exactly, scoped to `react-ssr-chromium`/`apps/playground-react/e2e`, including AC6.3's full-8-component interaction-table coverage and AC6.5's confirmation that Task 5's Angular entries remain untouched in the diff. Additionally:

- AC6.6: Running `TRACK_E_SSR_FRAMEWORK=react npx playwright test --project=react-ssr-chromium` starts only the React SSR server (port 6012 listening; port 6011's Angular server does **not** start even though its lookup entry now also exists) — proving the isolation mechanism correctly excludes a sibling framework's entry, not just that it includes the selected one (AC5.6 alone couldn't prove exclusion, since only one entry existed yet).
- AC6.7: Running `TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium` (re-run from AC5.6, now with React's entry also present in the lookup) still starts only the Angular server — proving Task 6's addition did not regress Task 5's isolation.

---

## Task 7 — Vue Playwright SSR spec + config wiring

**Specification traceability:** §E, §F.1–F.4.

**Sequencing:** begins only after Task 6's `playwright.config.ts` edit is complete — appends Vue's entries after React's, preserving both Task 5's and Task 6's additions unchanged.

**What to create/modify:** identical structure to Tasks 5–6, scoped to Vue: `apps/playground-vue/e2e/ssr-hydration.spec.ts`, new `vue-ssr-chromium` project (`testDir: "./apps/playground-vue/e2e"`), and a new `vue` key added to the `trackESsrServers` lookup (`command: "pnpm --filter playground-vue run start"`, this task's own local verification running `pnpm --filter playground-vue run build` once first) for port 6013 — completing the lookup with all three frameworks; no further selection-logic change is needed since Task 5 already wrote it generically (keyed by framework name, not hardcoded to a fixed count). Hydration-complete signal: the same `data-hydrated="true"` mechanism (a ref/DOM attribute flipped in `onMounted()`). Per-component interactions: the same concrete table from Task 5, applied via Vue's own component API/DOM shape. This task's own local verification runs Playwright with `TRACK_E_SSR_FRAMEWORK` unset (all three entries now present and included) — this is the first point in the sequence where AC7.6's actual three-framework combined scenario can be exercised for real.

**What NOT to do:** same category as Tasks 5–6, scoped to Vue; no special Teleport-timing mechanism beyond the standard interaction wait; no reordering of Tasks 5's/6's already-added entries.

**Acceptance criteria:** AC7.1–AC7.5 mirror AC5.1–AC5.5 exactly, scoped to `vue-ssr-chromium`/`apps/playground-vue/e2e`, including AC7.3's full-8-component interaction-table coverage. Additionally:

- AC7.6 — after Tasks 5, 6, and 7 are all complete, `npx playwright test --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium` **with `TRACK_E_SSR_FRAMEWORK` left unset** passes as one combined run, proving all three Track E `webServer` entries (each started via its own `start` script against its own already-built `dist/`) are all included and can run concurrently without port or process conflicts — this is the local combined-execution scenario the isolation mechanism's "unset variable" branch exists to serve.
- AC7.7 — `git diff playwright.config.ts` against the pre-Task-5 baseline shows Track A's original 9 projects/3 webServer entries fully unchanged, plus exactly 3 new projects, the `trackESsrServers` lookup (all 3 keys), and the `TRACK_E_SSR_FRAMEWORK`-selection logic — confirming the serialized sequencing (Angular's entry/logic first, then React's key, then Vue's key) produced a clean, order-preserving diff.
- AC7.8 — repeating AC5.6/AC6.6's single-framework isolation check for Vue (`TRACK_E_SSR_FRAMEWORK=vue npx playwright test --project=vue-ssr-chromium` starts only port 6013) confirms all three frameworks are now correctly isolatable, completing the matrix of 3 positive (own server starts) × implied negative (siblings don't) checks across AC5.6/AC6.6/AC6.7/AC7.8.
- AC7.9 — a CI-shaped dry run (`TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`, run locally without either React's or Vue's `dist/` having been built at all) succeeds — proving the isolation mechanism, not merely a coincidence of build order, is what prevents the CI matrix's single-framework legs from ever needing a sibling framework's artifacts.

---

## Task 8 — Determinism double-fetch check

**Specification traceability:** §K (nondeterminism row), resolving spec Open Question 6 — adopted, not left optional, since it is cheap and directly enforces a binding requirement (§D.3) with automation rather than relying solely on code review.

**What to add:** in each of the three `ssr-hydration.spec.ts` files (Tasks 5–7), one additional test that issues two separate `page.request.get()` calls against the harness's root URL and asserts the two response bodies are byte-identical (excluding, if any exist, legitimately request-scoped values — none are expected per spec §D.3, so the assertion is a plain equality check with no exclusion logic needed unless a task discovers a genuine exception, which would itself be a §D.3 violation to fix, not to exclude).

**What NOT to do:**

- Do not build this as a separate script or CI step — it is one more Playwright test per framework, run as part of the same `ssr-hydration.spec.ts` file and the same CI job (Task 9).
- Do not add exclusion/normalization logic speculatively — if the two fetches ever differ, that is a §D.3 determinism violation to fix at the source (fixture data), not a difference to launder past the check.

**Acceptance criteria:**

- AC8.1: All three frameworks' double-fetch determinism test passes.
- AC8.2: Deliberately introducing a `Math.random()` or `Date.now()` call into one harness's fixture data (temporarily, for verification, then reverted) causes that framework's determinism test to fail — proving the check has real detection power, not a vacuous pass.

---

## Task 9 — CI integration: `track-e-ssr-hydration` job

**Specification traceability:** §G (full).

**What to change:** add one new job to `.github/workflows/ci.yml`, appended after the existing `track-a-browser-visual-a11y` job, mirroring its exact structure (verified this plan's header, `.github/workflows/ci.yml:131-178`):

```yaml
track-e-ssr-hydration:
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
    matrix:
      include:
        - framework: ng
          dir: playground-angular
        - framework: react
          dir: playground-react
        - framework: vue
          dir: playground-vue
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "24.15.0"
        cache: "pnpm"

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build harness (${{ matrix.dir }})
      run: pnpm --filter ${{ matrix.dir }} run build

    - name: Install Playwright Chromium
      run: npx playwright install --with-deps chromium

    - name: Run Playwright SSR project (${{ matrix.framework }})
      env:
        TRACK_E_SSR_FRAMEWORK: ${{ matrix.framework }}
      run: npx playwright test --project=${{ matrix.framework }}-ssr-chromium

    - name: Upload Playwright HTML report (${{ matrix.framework }})
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-ssr-${{ matrix.framework }}
        path: playwright-report/
```

**Resolves the first Plan Review's Amendment 1/2 findings for CI specifically:** the matrix now uses an explicit `include:` list (`framework`/`dir` pairs) instead of an inline ternary-style name-translation expression — no expression-syntax risk, and the mapping from Playwright's project-naming convention (`${{ matrix.framework }}-ssr-chromium`, matching Task 5–7's project names exactly) to each harness's actual `apps/playground-*` directory name is explicit and readable. The **Build harness** step runs `pnpm --filter <dir> run build` (the canonical `build` script from every harness's package, per Tasks 2–4) as its own step, strictly before the **Run Playwright SSR project** step — this is what guarantees the prerequisite build in CI: Playwright's `webServer.command` in `playwright.config.ts` (Task 5–7) only ever runs `start`, never `build`, so without this explicit preceding step the `webServer` would fail to find a `dist/` to start from. This is the same build-then-serve contract established in the note preceding Task 5, applied here as CI's own concrete realization of it.

**Resolves the second Plan Review finding (`webServer`/CI-matrix isolation):** the **Run Playwright SSR project** step now sets `TRACK_E_SSR_FRAMEWORK: ${{ matrix.framework }}` as a step-scoped environment variable, read by `playwright.config.ts`'s `trackESsrServers` selection logic (established in Task 5, extended by Tasks 6–7 — see the dedicated section preceding Task 5). This is what makes each CI matrix leg build only its own harness (via the preceding "Build harness" step, already scoped to `matrix.dir`) _and_ have Playwright start only its own SSR `webServer` entry — the `ng` leg never attempts to start the React or Vue server, so it never needs their `dist/` output, which this leg never built. Without this environment variable, Playwright's global `webServer` array would attempt to start all three Track E servers in every matrix leg regardless of which one was built, since — confirmed directly against Playwright's own runner source during this amendment — `webServer` startup is not scoped by `--project` selection at all.

**What NOT to do:**

- Do not modify the existing `track-a-browser-visual-a11y` job or the main `ci` job in any way.
- Do not install Firefox/WebKit browsers in this job (`--with-deps chromium` only, narrower than Track A's `chromium firefox webkit`, per binding Chromium-only decision).
- Do not add a `needs:` dependency from this job onto `track-a-browser-visual-a11y` or the main `ci` job — Track E's job runs independently, exactly as Track A's job runs independently of the main `ci` job today (verified: no cross-job `needs:` exists between them currently).
- Do not fold the build step into the Playwright `webServer.command` or into the "Run Playwright SSR project" step — it remains its own explicit, separate step, per the build-then-serve contract.
- Do not build all three harnesses in every matrix leg "just in case" as a workaround for the isolation problem — the `TRACK_E_SSR_FRAMEWORK` mechanism makes that unnecessary; building only `matrix.dir` per leg (as already specified) remains correct and is now provably sufficient.
- Do not set `TRACK_E_SSR_FRAMEWORK` at the job level (applying to all steps) — it is scoped to the "Run Playwright SSR project" step specifically, since no earlier step (checkout, install, build) reads or needs it.

**Acceptance criteria:**

- AC9.1: `git diff .github/workflows/ci.yml` shows only one new job appended — no existing job's YAML altered.
- AC9.2: A CI run (or a local `act`-style dry-run / manual YAML lint, if full CI execution isn't available at this task's verification step) confirms the new job's YAML is syntactically valid, the `include:` matrix correctly maps each `framework` to its `dir`, and its steps reference only scripts/commands that actually exist per Tasks 2–8 (specifically: each harness's `build`/`start` scripts, and each `<framework>-ssr-chromium` Playwright project name from Tasks 5–7).
- AC9.3: The existing `track-a-browser-visual-a11y` job and main `ci` job's own passing status is unaffected (confirmed by running them, or by the diff-scope check in AC9.1 being sufficient evidence no shared file/script was altered).
- AC9.4: Removing the "Build harness" step temporarily (for verification purposes only, then restored) causes the "Run Playwright SSR project" step to fail with a server-startup/module-not-found error — proving the build step is a genuine, load-bearing prerequisite in CI, not redundant with something `webServer` already does.
- AC9.5: Running the `ng` matrix leg's full step sequence in isolation (its own "Build harness" step, then its own "Run Playwright SSR project" step with `TRACK_E_SSR_FRAMEWORK=ng`) succeeds **without** `apps/playground-react` or `apps/playground-vue` ever having been built in that same job run — directly proving the isolation mechanism resolves the finding this amendment addresses, not merely that the job happens to pass when all three are coincidentally built.
- AC9.6: Temporarily removing the `env: TRACK_E_SSR_FRAMEWORK: ${{ matrix.framework }}` line from the "Run Playwright SSR project" step (for verification purposes only, then restored) causes the `ng` matrix leg to fail attempting to start the React and/or Vue `webServer` entries (whose `dist/` was never built in that leg) — proving this specific line, not incidental job ordering, is what provides the isolation.

---

## Task 10 — GAP-034 registry update and harness documentation

**Specification traceability:** §J Exit Criterion 9; resolves spec Open Question 8.

**What to change:**

1. In `docs/architecture/BLUEPRINT_GAPS.md`, update GAP-034's entry: change its `Status:` field from `IMPLEMENTED-BUT-UNVERIFIED` to a verified status (e.g., `VERIFIED` or this registry's own existing convention for a closed/confirmed gap — check the registry for its actual vocabulary for a resolved entry before choosing the exact word, rather than inventing new status vocabulary), and add a line citing the specific evidence: the three harnesses (`apps/playground-{angular,react,vue}`) and their Playwright specs (`apps/playground-*/e2e/ssr-hydration.spec.ts`), plus the CI job (`track-e-ssr-hydration`) that runs them on every relevant trigger.
2. Add a short `README.md` to each of the three harness directories, documenting: what the harness is (a minimal SSR/hydration verification harness, not a playground/showcase), how to run it locally (`pnpm --filter <harness-name> run build` followed by `pnpm --filter <harness-name> run start` — the two canonical scripts from the binding build/start contract, run as two separate commands, never combined), and the one known, pre-existing, already-tracked limitation noted in spec §C.6 for Angular specifically (styling may appear minimal/unstyled post-hydration due to the pre-existing `ngCoreStyleSheet` gap tracked by ADR-023 follow-up 6/ADR-029 — explicitly not a Track E regression).

**What NOT to do:**

- Do not invent a new GAP-034 status vocabulary word not already used elsewhere in the registry — match the existing convention.
- Do not write a README implying these are general-purpose demo/playground apps — the wording must match spec §A.2's precise scope framing (closes GAP-034, not GAP-008 in full).

**Acceptance criteria:**

- AC10.1: GAP-034's entry in `BLUEPRINT_GAPS.md` no longer reads `IMPLEMENTED-BUT-UNVERIFIED` and cites the specific harness/test/CI-job evidence.
- AC10.2: All three `apps/playground-*/README.md` files exist and each explicitly states the harness does not close GAP-008 in full.

---

## Task 11 — Whole-track verification

**Specification traceability:** §E, §J (all 11 exit criteria).

**What to verify, in order:**

1. `pnpm install --frozen-lockfile` succeeds at the repo root with all three new `apps/playground-*` packages present in the workspace.
2. Each harness builds and starts independently (Tasks 2–4's AC2.1/AC3.1/AC4.1 re-confirmed against the final, integrated state — not just each task's own isolated check).
3. `npx playwright test --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium` (with `TRACK_E_SSR_FRAMEWORK` unset) passes as one run (re-confirms AC7.6 against the final state, after Tasks 8–10's changes).
   3a. For each framework, `TRACK_E_SSR_FRAMEWORK=<framework> npx playwright test --project=<framework>-ssr-chromium` is re-run against the final, fully-integrated state with only that framework's `dist/` present (the other two removed/never built in that check) — re-confirming AC9.5's isolation guarantee holds at the end of the whole track, not just when Task 9 first verified it in isolation.
4. `npx playwright test` (the full suite, no filter, `TRACK_E_SSR_FRAMEWORK` unset) passes — proving zero regression to Track A's original 9 projects across the whole implementation, not just Task 5's isolated check.
5. `pnpm run boundary:validate:*` / `pnpm run provenance:validate` / any other Track B gate script that enumerates packages is re-run locally and confirmed to still report exactly 17 publishable packages (or whatever the current true count is at verification time) — proving the three new `apps/playground-*` entries did not leak into Track B's publishable-package graph (spec §H, Exit Criterion 8).
6. `git diff --stat` against `main` for the whole track is reviewed end-to-end, confirming: no file under any `packages/*/src` (production component code) appears; `.github/workflows/ci.yml`'s diff is exactly the one new job from Task 9; `docs/architecture/DECISIONS.md`/`BLUEPRINT_GAPS.md` diffs are exactly Task 1's and Task 10's changes.
7. Each of the specification's 11 exit criteria (§J) is checked off explicitly against real, observed evidence from steps 1–6 above — not asserted from memory.

**What NOT to do:**

- Do not mark this task complete on the basis of any individual task's own earlier acceptance-criteria run — re-run against the final, fully-integrated branch state, since later tasks (8, 9, 10) touch files earlier tasks' checks already passed against.
- Do not commit at the end of this task — per this track's standing constraint (no commits without explicit instruction), Task 11 verifies and reports; committing is a separate, explicitly-requested action.

**Acceptance criteria:**

- AC11.1: All 11 of specification §J's exit criteria are individually confirmed true, each with the specific command/observation that proves it, presented back for review.
- AC11.2: No regression to Track A/B/C/D's existing passing state is found.

---

## Key decisions (summary)

1. Vite (not `tsup`) is the client-bundler choice for React's and Vue's harnesses — resolves spec Open Question 1 with evidence (`tsup` is library-oriented; Vite is already the dev-server tool both frameworks' Storybook setups use).
2. `applyUltimateTheme()` — the exact call every existing `.storybook/preview.*` file already uses — is the harness theming mechanism across all three frameworks; no new theming code is introduced. Its SSR-safety is now independently source-verified as part of this amendment (`packages/themes/src/apply-theme.ts` → `packages/uix-styled/src/config/index.ts`'s `setTheme`/`update`, both read in full — no `document`/`window` reference in the call chain), not merely assumed; a standing escalation clause covers the case where implementation-time re-verification finds otherwise.
3. Angular's harness is the first `"projectType": "application"` Angular project in the monorepo (the existing `packages/ng/angular.json` is library-only and untouched). Its build produces two artifacts (browser + server) from one `build` invocation, per the concrete artifact-flow diagram in Task 2.
4. Hydration-complete detection uses a harness-set DOM signal (`data-hydrated="true"`) polled by Playwright, applied consistently across all three frameworks.
5. The determinism double-fetch check (spec §K's recommendation) is adopted as a mandatory task (Task 8), not left optional, since it is cheap and directly automates enforcement of a binding requirement.
6. CI job (Task 9) mirrors Track A's `track-a-browser-visual-a11y` job structure exactly, narrowed to Chromium-only browser install and the three new SSR projects, using an explicit `include:` matrix (not an inline expression) to map each `framework` value to its harness directory.
7. GAP-034's registry status is updated to whatever this repository's own existing "resolved" vocabulary already is (checked at Task 10 time, not invented here).
8. Canonical `build`/`start` script contract: every harness exposes exactly `build` (produces `dist/` artifacts, composing any framework-specific multi-step process internally) and `start` (runs the already-built server, never compiling from source) — eliminating the build-command inconsistency between Task 9's original CI step and Tasks 2–4's original per-harness scripts.
9. Explicit build-then-serve sequencing: `webServer.command` in `playwright.config.ts` is always `start`, never a combined build+start command; both local verification and CI run `build` as an explicit, separate, preceding step — documented once in the note preceding Task 5 and realized concretely in Task 9's CI step list.
10. Concrete per-component interaction table: Task 5 now defines one binding SSR-content assertion and one binding post-hydration interaction/assertion pair per component (including a specific, non-vacuous Scroller behavior — a fixed 5-item fixture list plus a programmatic scroll-offset check), applied identically (adapted to each framework's own API) by Tasks 6 and 7 — replacing all prior "if enabled"/implicit wording.
11. Task 5/6/7 config-edit serialization: the three tasks are no longer parallelizable with each other (only with respect to Tasks 2–4, which remain parallel) — Task 6 depends on Task 5's `playwright.config.ts` edit completing first, and Task 7 depends on Task 6's, producing one clean, order-preserving diff instead of a three-way conflict on a shared file.
12. **(New, this amendment) `webServer`/CI-matrix isolation via `TRACK_E_SSR_FRAMEWORK`:** confirmed directly against Playwright's own runner source that `webServer` array entries all start unconditionally regardless of `--project` filtering — there is no per-project `webServer` scoping in Playwright's config schema. Resolved with an environment-variable-gated lookup object (`trackESsrServers`) built inside `playwright.config.ts` itself, following the same `process.env.CI`-driven conditional pattern the file already uses: unset locally (all three Track E servers included, serving AC7.6's combined run), set to one framework name in each CI matrix leg (via a step-scoped `env:` on the "Run Playwright SSR project" step, Task 9) so that leg's `webServer` array contains only its own framework's entry. Track A's three Storybook `webServer` entries are declared with no reference to this variable and remain completely unconditional/unchanged.

## Explicit acceptance criteria

See each task's own AC list above; Task 11 aggregates them against specification §J's 11 exit criteria as the track's final acceptance gate. Criteria added by the first amendment: AC2.5/AC3.5/AC4.5 (build-then-start dependency proof per harness), AC9.4 (build-step-is-load-bearing proof in CI), AC7.7 (clean, order-preserving `playwright.config.ts` diff across the serialized Task 5→6→7 sequence). Criteria added by this (second) amendment: AC5.6/AC6.6/AC6.7/AC7.8 (positive/negative single-framework `webServer` isolation proofs, built up incrementally as each framework's entry is added), AC7.9 and AC9.5 (isolation holds even when sibling frameworks' `dist/` was never built at all — the actual CI scenario this amendment exists to make safe), AC9.6 (the specific `env:` line, not incidental ordering, is what provides isolation), and Task 11's new step 3a (isolation re-confirmed at the final, fully-integrated state).

## Dependencies and sequencing

- Tasks 1–4 are independent and parallelizable (no shared files).
- **Tasks 5, 6, and 7 are sequential with respect to each other** (corrected by this amendment) — each still depends on its own framework's harness task (2/3/4) for the harness to exist, but Task 6 additionally depends on Task 5's `playwright.config.ts` edit completing, and Task 7 on Task 6's, since all three edit the same file and this plan now serializes those edits rather than leaving them to an ad hoc merge.
- Task 8 depends on Tasks 5–7 (adds to the same three spec files).
- Task 9 depends on Tasks 5–8 being locally stable.
- Task 10 depends on Tasks 5–9 (describes the finished state).
- Task 11 depends on all prior tasks.

## Unresolved implementation-level questions (legitimately deferred to Task-level implementer judgment, not further plan review)

1. Whether Angular's/React's harness server uses Express or an alternative minimal HTTP layer — Express is used as the default choice in this plan for consistency, since Angular's and React's own official SSR examples both use Express-style request handling; Vue's uses plain `http` per its own official example, but either is acceptable there too. (Unaffected by this amendment.)
2. Exact `"projectType": "application"` builder name/options for Angular 21 at implementation time (`@angular/build:application` or its then-current equivalent), and the exact literal `dist/` subpath names/export shape for its browser/server artifacts — the _architecture_ (one build, two artifacts, `server.ts` as a distinct consumer) is now fixed by Task 2's artifact-flow diagram; only the literal path/export names are confirmed against the actually-installed `@angular/build` version when Task 2 is executed.
3. Exact internal composition of each harness's two-sub-step `build` script (e.g., whether React/Vue's server-file compilation uses `tsc` or `esbuild`) — non-architectural, implementer's choice, provided both sub-steps land in `dist/` before `build` exits per the canonical contract.

## Amendment Note (this pass)

This revision resolves six findings from the first Plan Review of this document, none of which reopen any approved architectural or specification decision:

1. **CI build-contract inconsistency** — resolved via the canonical `build`/`start` script contract (new binding decision 8, above the task table) and Task 9's corrected `include:`-matrix CI step.
2. **Implicit Playwright build/start ordering** — resolved via the new "Deterministic build-then-serve contract" note preceding Task 5, applied identically in Tasks 5–7's `webServer` entries and Task 9's CI steps.
3. **Angular SSR artifact flow left implicit** — resolved via Task 2's new concrete artifact-flow diagram (source → build → browser+server artifacts → `server.ts` → HTTP response) and matching AC2.5.
4. **Vague component interaction wording ("if enabled")** — resolved via the concrete, binding interaction table preceding Task 5, covering all 8 components including a specific Scroller behavior, applied by Tasks 5–7 and checked by their ACx.3 criteria.
5. **`applyUltimateTheme()` SSR-safety assumed, not verified** — resolved via direct source verification performed during this amendment (`apply-theme.ts` → `uix-styled/config/index.ts`, both read in full, no browser-global reference found) plus a standing escalation clause if implementation-time re-verification ever finds otherwise; no production code was touched to reach this conclusion.
6. **Playwright config task sequencing** — resolved by making Tasks 5/6/7 explicitly sequential on the shared `playwright.config.ts` file (Task 6 after Task 5, Task 7 after Task 6), documented in the task table, each task's own Sequencing note, and the new AC7.7.

No previously-approved architectural or specification decision was reopened: ADR-045 remains documentary-only; raw framework SSR primitives (no Next.js/Nuxt) are unchanged; harness locations, private/non-published status, the full 8-component proof set, Chromium-only initial scope, Portal/Teleport's source-verified-safe status, Playwright's additive-to-Track-A posture, ports 6011–6013, the `data-hydrated="true"` signal, the mandatory determinism check, and Track B/C's untouched status are all unchanged from the plan's first draft. Track E continues to close GAP-034 only, not the entirety of GAP-008.

## Amendment Note (second pass — `webServer`/CI-matrix isolation)

This revision resolves one additional finding raised in the second Plan Review of this document: the plan's Tasks 5–7 added three global Playwright `webServer` entries without establishing that a CI matrix leg running only `ng-ssr-chromium` would start only the Angular SSR server. Left unresolved, every CI matrix leg would have attempted to start all three Track E servers regardless of which harness that leg actually built, since — confirmed directly against Playwright's own runner source during this amendment (`node_modules/playwright/lib/runner/tasks.js`, fetched via Context7) — `webServer` array startup (`createPluginSetupTasks`) runs over the entire config object before `--project` filtering is ever applied; Playwright has no per-project `webServer` scoping mechanism.

**Resolution:** an environment-variable-gated `webServer` array, built inside `playwright.config.ts` at config-load time — the same `process.env`-driven conditional pattern the file already uses for `CI` (`playwright.config.ts:25-26,158,165,172`, verified unchanged by this amendment). A new `TRACK_E_SSR_FRAMEWORK` variable, left unset locally (all three Track E servers included) and set per-leg in CI (via a step-scoped `env:` on Task 9's "Run Playwright SSR project" step), selects which of the three Track E `webServer` entries Playwright actually starts. Track A's three Storybook `webServer` entries carry no reference to this variable and remain fully unconditional.

**Sections amended in this pass:**

- New section inserted before Task 5 ("`webServer`/CI-matrix isolation — why the global-`webServer` assumption was insufficient, and the mechanism that replaces it"), containing the full mechanism description, the Playwright-internals evidence, and a point-by-point mapping to the second Plan Review's seven required design points.
- Task 5: `webServer` entry description updated to introduce the `trackESsrServers` lookup and selection logic (this is the task that writes it); new AC5.6.
- Task 6: description updated to note it only adds a `react` key to the existing lookup, does not duplicate selection logic; new AC6.6/AC6.7 (positive and negative isolation proof, now that two entries coexist).
- Task 7: description updated to note it completes the lookup with the `vue` key; AC7.6 corrected to specify `TRACK_E_SSR_FRAMEWORK` unset for the combined run; new AC7.8/AC7.9.
- Task 9: CI job YAML given a step-scoped `env: TRACK_E_SSR_FRAMEWORK: ${{ matrix.framework }}` on the Playwright step; new explanatory paragraph; new "do not set it at job level" and "do not build all three as a workaround" NOT-do items; new AC9.5/AC9.6.
- Task 11: new step 3a re-confirming isolation at the final, fully-integrated state.
- Key decisions: new item 12 documenting the mechanism.
- Explicit acceptance criteria (summary section): updated to list this pass's new criteria alongside the first amendment's.

No previously-approved decision, and none of the first amendment's decisions (canonical `build`/`start` contract, build-then-serve sequencing, the interaction table, Task 5/6/7 serialization, or the theme-loading placement rule), were reopened or altered by this pass — this amendment is additive to the first, addressing a distinct finding.

## Plan Review Gate

**IMPLEMENTATION PLAN — READY FOR REVIEW**

Not self-approved. This plan does not authorize implementation to begin; Plan Review remains the next gate.
