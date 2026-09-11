# Phase 10 Track E — SSR/Hydration: Specification

**Status:** Draft for review
**Date:** 2026-09-11
**Scope:** Specification only. No implementation plan, no source/CI/package/workflow changes, no commit.
**Baseline:** `main` at `57772ff`. Architecture Gate approved (`docs/architecture/research/2026-09-11-phase-10-track-e-ssr-hydration-research.md`). Tracks A, B, C, D complete and merged.

**Binding architectural decisions (not reopened here):**
1. GAP-008's SSR scope is promoted from `docs/architecture/research/2026-09-08-phase-10-architecture-discussion.md` §5 into a standalone ADR (§B below) — documentary promotion only, substance unchanged.
2. Raw/minimal per-framework SSR primitives — no Next.js, no Nuxt, no meta-framework.
3. All 8 proof-set components (Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip) exercised in every harness.

---

## A. Scope and boundaries

### A.1 What Track E delivers

Three minimal, private, non-published consumer applications — `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue` — each of which:
- Server-renders a single deterministic page containing all 8 proof-set components, using that framework's own raw SSR API (not a meta-framework).
- Hydrates that server-rendered HTML in a real browser with no hydration-mismatch errors and no unexpected console errors.
- Demonstrates, post-hydration, that at least one interactive behavior per component actually works (event handlers/state are live, not merely painted markup).

Plus: Playwright specs (additive to the existing root `playwright.config.ts`) that assert the above automatically, and a CI contract (specified here, not implemented) for running them.

### A.2 What Track E closes, precisely

Track E closes **GAP-034** ("no SSR/hydration verification anywhere... no test proves SSR actually works end-to-end") — it converts "the code has browser guards that look SSR-safe" into "a real server render + real browser hydration has been executed and observed to succeed."

Track E does **not** close GAP-008 in full. GAP-008's full historical scope ("build one playground app per framework... that imports and renders the full proof set," `BLUEPRINT_GAPS.md:176`) named a broader consumer-app objective — routing, a real design/demo experience, tree-shaking measurement via a real Angular-linker app build (GAP-009), genuine bundle-size/performance benchmarking (§31). **None of that is in Track E's scope.** GAP-008's SSR-relevant slice was already scoped down to exactly what Track E delivers by the approved architecture decision (research doc §5, promoted to ADR-045 below); GAP-008's remaining fuller scope (tree-shaking via a real app build, bundle-size benchmarking, a real demo experience) remains open, unassigned backlog, explicitly out of Phase 10.

### A.3 Explicitly out of scope

- Routing, multiple pages, navigation between routes.
- A real design/demo/showcase experience (`apps/showcase`, `apps/docs` — untouched, remain empty).
- Next.js, Nuxt, Angular's full app-shell/router tooling beyond what raw SSR requires.
- Tree-shaking re-measurement (GAP-009) — that needs a real bundler-consuming app build, which is a GAP-008-fuller-scope concern, not Track E's.
- Bundle-size/performance benchmarking (Blueprint §31) beyond what's incidental to building a minimal app.
- Any production component code change to accommodate the harness (see §K.2 — no such change is anticipated; if evidence during implementation contradicts this, that is an Implementation-Plan-level escalation, not a silent fix).
- Any modification to Track A's existing Playwright projects/Storybook instances, Track B's `ci` job, or Track C's release/migration/provenance artifacts, beyond the specifically approved GAP-008 ADR/documentation promotion.
- Any modification to `apps/docs` or `apps/showcase`.

### A.4 Relationship to Tracks A–D

- **Track A** (Storybook + Playwright, merged): Track E reuses the same root `playwright.config.ts` file and the same `@playwright/test` installation, adding new projects and a new `webServer` entry — it does not modify Track A's existing 9 projects or 3 Storybook `webServer` entries. Track A's Storybook instances render components in isolation; Track E's harnesses render them through a real server-rendered page. These are complementary, non-overlapping proof surfaces (confirmed in the architecture research, §5 of the discussion doc).
- **Track B** (CI quality gates, merged): Track E's CI contract (§G) is additive, following Track A's own precedent of a separate job. Track B's main `ci` job (Node 20, the 17-publishable-package pipeline) is untouched. Track E's harnesses are structurally outside Track B's publishable-package graph (verified in §H).
- **Track C** (release/migration/provenance, merged): confirmed zero overlap — Track C's own implementation plan explicitly lists Track E's territory as untouched (`docs/superpowers/plans/2026-09-10-phase-10-migration-release-provenance-implementation.md:319,330`).
- **Track D**: not touched; no dependency in either direction identified in repository evidence.

---

## B. GAP-008 documentary promotion (ADR-045)

This is the one non-implementation repository change Track E's specification phase is authorized to make: adding a new ADR entry and correcting GAP-008's stale field. (Applying it is an Implementation Plan action, not done in this document — see §J/dependencies.)

**Format basis:** `docs/architecture/DECISIONS.md` uses a uniform entry shape — `## ADR-NNN — <Title>` followed by one paragraph beginning `Status: Accepted (<source>).` with no separate Status/Context/Decision sub-headers (verified across all 44 existing entries). The highest existing entry is `ADR-044` (`DECISIONS.md:189`). The new entry is **ADR-045**.

**Proposed ADR-045 text** (for the Implementation Plan to apply verbatim or as refined during Plan Review):

> ## ADR-045 — GAP-008's SSR/hydration scope is a minimal per-framework harness, not a full consumer/playground app
>
> Status: Accepted (architecture discussion `2026-09-08-phase-10-architecture-discussion.md` §5, promoted from citation-only status in ADR-044 to a standalone record). GAP-008 ("no real consumer application anywhere in the monorepo") is a real, still-partially-open gap, but its SSR/hydration-relevant slice is fully resolved: Phase 10's SSR/hydration verification requirement (Blueprint §28's Build/Package testing tier, §31) is satisfied by one minimal, framework-specific SSR-capable harness per framework — using each framework's own raw SSR primitives (Angular's `provideServerRendering`/`provideClientHydration`; React's `renderToPipeableStream`/`hydrateRoot`; Vue's `createSSRApp`/`renderToString`), not a meta-framework (Next.js/Nuxt) and not a full playground/showcase application. `apps/playground-angular`/`apps/playground-react`/`apps/playground-vue` are the intended homes for these harnesses; `apps/showcase` and `apps/docs` remain out of Phase 10 scope entirely. This closes GAP-034 (SSR/hydration verification) using GAP-008's infrastructure as the vehicle; it does not close GAP-008's fuller scope (tree-shaking re-measurement via a real app build — GAP-009 — genuine bundle-size/performance benchmarking, or a real consumer/demo experience), which remains open, unassigned backlog outside Phase 10.

**GAP-008 correction** (`docs/architecture/BLUEPRINT_GAPS.md:178`, currently reading `- **Architectural decision required:** No.`) — replace with:

> - **Architectural decision required:** Resolved for the SSR/hydration slice only — see ADR-045. GAP-008's fuller consumer-app scope (tree-shaking re-measurement, bundle-size benchmarking, a real demo experience) remains open backlog, not addressed by Phase 10 Track E.

No other GAP-008 reference in `BLUEPRINT_GAPS.md` (lines 172, 188, 191, 681, 734–735, 779) requires correction — each already frames GAP-008 as blocking/enabling other gaps in ways consistent with this promotion; none asserts GAP-008 itself is unscoped.

---

## C. Harness architecture

### C.1 Common shape across all three

Each `apps/playground-*` is:
- A new, real `package.json` — the first content ever written under that directory (currently only `.gitkeep`).
- `"private": true` (Track B's publishable-package discovery in `scripts/provenance/workspace-graph.mjs` is explicitly scoped to `packages/*` only — verified at line 5's comment: "packages/* and its transitive closure" — so `apps/*` is already structurally outside that graph; `"private": true` is still set as defense-in-depth and standard practice for a non-published app).
- Declares a runtime dependency on exactly its own framework's `@ultimate/*` packages (`@ultimate/ng` + `@ultimate/ng-core` for Angular; `@ultimate/react` + `@ultimate/react-core` for React; `@ultimate/vue` + `@ultimate/vue-core` for Vue) via `workspace:*`, plus `@ultimate/themes` for the theme preset, matching the existing devDependency pattern each framework package already uses for its own Storybook demos.
- Has two entry points: a **server entry** (runs in Node, produces HTML) and a **client entry** (runs in the browser, hydrates).
- Renders one deterministic proof page (§D) containing all 8 components.
- Loads styling identically to how each framework package already registers styles at runtime (§C.6) — no new styling mechanism invented.
- Starts via a plain Node process for the server, verified by Playwright hitting a real HTTP port (§F).

### C.2 Angular — `apps/playground-angular`

**Package/workspace role:** private Angular application (not a library) — the first `application`-type Angular project in this monorepo. `packages/ng/angular.json` is a `"projectType": "library"` project built via `@angular/build:ng-packagr` (verified: no `application` builder anywhere in it) — it cannot be reused or extended for this purpose. `apps/playground-angular` needs its own `angular.json` (or Angular 21's equivalent minimal project config) declaring an `application`-type project.

**Entry points:**
- Server entry: a bootstrap function using `provideServerRendering()` (from `@angular/ssr`), following the pattern verified in official Angular docs (`angular.dev/api/ssr/provideServerRendering`) — no `withRoutes()`/`withAppShell()` needed since Track E has exactly one page, not routing.
- Client entry: `bootstrapApplication()` with `provideClientHydration()` (from `@angular/platform-browser`), per `angular.dev/guide/hydration`.
- Both entries bootstrap the same root component/providers list (Angular's hydration contract requires server/client bootstrap consistency — a documented hard constraint, §C.7).

**SSR mechanism:** `provideServerRendering()`. **Hydration mechanism:** `provideClientHydration()`. Both are current, non-deprecated Angular 21 APIs (verified via Context7 `/websites/angular_dev`).

**Zoneless:** Angular 21 makes zoneless change detection the default (verified: `provideZonelessChangeDetection()` is unneeded unless overriding — angular.dev). The repository's `@ultimate/ng`/`@ultimate/ng-core` already assume zoneless (ADR-022). No documented incompatibility exists between zoneless and `provideClientHydration()`/`provideServerRendering()` — both are current-generation Angular 21 APIs, not competing eras. This harness does not call `provideZoneChangeDetection()`.

**Rendering the 8 components:** a single root component's template lists all 8 (`u-button`, `u-checkbox`, `u-dialog`, `u-menu`, `u-paginator`, `u-scroller`, `u-table`, `u-tooltip`), imported from `@ultimate/ng`, matching the deterministic fixture rules in §D.

**Styling/theme loading:** identical to how `@ultimate/ng`'s own Storybook demo already loads `@ultimate/themes`' Aura preset (no new mechanism) — a theme-application call in the bootstrap, before first render.

**Determinism:** no server-only randomness; Angular's SSR output determinism is already governed by its own documented constraint (§C.7) — this harness's fixture data (§D) is the only thing under Track E's control, and it is static.

**Server/browser process startup for verification:** the server entry compiles to a small Node HTTP server (e.g., Express, since Angular's own SSR guide's server examples use Express-style request handling) serving the rendered page and static client assets; started as a Playwright `webServer` entry (§F) on its own port.

### C.3 React — `apps/playground-react`

**Package/workspace role:** private Vite-or-esbuild-bundled React app with a hand-written Node server — no Next.js. React itself does not ship a project scaffold; the harness needs its own minimal build setup (the existing `packages/react` package already uses `tsup` for its library build — the harness can reuse `tsup` or Vite for bundling its client entry, since both are already present in the monorepo's tooling vocabulary; exact choice deferred to Implementation Plan, §L.1).

**Entry points:**
- Server entry: a Node script that imports the root App component and calls `renderToPipeableStream(<App />, { onShellReady, onError })` (per `react.dev/reference/react-dom/server/renderToPipeableStream`), piping the result into an HTTP response wrapped with the page shell (`<html>`/`<head>`/`<div id="root">…</div>`/client `<script>` tag).
- Client entry: `hydrateRoot(document.getElementById("root"), <App />)` (per `react.dev/reference/react-dom/client/hydrateRoot`).

**Why streaming over `renderToString`:** React's own docs recommend `renderToPipeableStream` for Node server environments and reserve `renderToString` for environments without stream support (verified, react.dev) — this repository's harness runs in Node, so streaming is the documented-correct choice, per the binding architectural decision naming `renderToPipeableStream` specifically.

**Deterministic initial render:** the shell must not resolve before the fixture data is ready — since the proof page's fixtures are static (§D), `onShellReady` fires immediately once React has produced the initial HTML for the static tree; no data-fetching suspense boundary is needed for Track E's fixtures.

**Rendering the 8 components:** a single root `App` component rendering `<Button>`, `<Checkbox>`, `<Dialog>`, `<Menu>`, `<Paginator>`, `<Scroller>`, `<Table>`, `<Tooltip>`, imported from `@ultimate/react`.

**React Portal — confirmed SSR-safe, no code change needed (resolves the open question the architecture research flagged):** `packages/react-core/src/overlay/portal.tsx` (read in full) returns `null` unless both `visible` is `true` and its internal `mounted` state is `true`; `mounted` starts `false` and is only ever flipped via `useMountEffect` (`packages/react-core/src/hooks/use-mount-effect.ts`, confirmed to wrap plain `useEffect`, not `useLayoutEffect`) — which never executes during `renderToPipeableStream`'s server pass. This means **Portal always renders as `null` server-side, for every consumer** — confirmed by direct grep across `packages/react/src`: Dialog (`dialog.tsx:196`), Menu (`menu.tsx:378`), and Tooltip (`tooltip.tsx:157`) all invoke `<Portal>` unconditionally in their JSX output (Dialog/Menu additionally track a separate `portalReady` state that gates a post-mount *effect callback*, not Portal's presence in the tree — this does not change the SSR path: `mounted` is still `false` server-side regardless of `portalReady`), and all three inherit the same server-safe `null` behavior with zero special-casing needed in the harness. No production code change is required for Portal's SSR behavior — this resolves §K.3 as a non-issue, not a residual risk.

**Avoiding server execution of browser-only behavior:** already guaranteed by the existing `useMountEffect`/`typeof document === "undefined"` guard pattern verified across `react-style-sheet.ts` and `use-component-style.ts` — no new guard needed in the harness itself.

**Styling/theme loading:** `@ultimate/react`'s existing runtime style-injection path (`useComponentStyle` → `reactCoreStyleSheet`) already handles this — it is a no-op during the server render (guarded, and never invoked before mount regardless) and runs after hydration on the client, injecting `<style>` tags into `document.head`. This means **the initial server-rendered HTML will not include component `<style>` tags** — this is expected, documented behavior (§D.3's "no FOUC assertion" note), not a defect to fix.

**package.json shape to import from:** `@ultimate/react`'s existing `exports` map already provides per-component subpaths (`./button`, `./dialog`, etc.) and a root barrel — the harness can use either; per-component subpaths are preferred to keep the harness's own bundle minimal, consistent with the package's own tree-shaking design intent.

### C.4 Vue — `apps/playground-vue`

**Package/workspace role:** private Vite-bundled Vue app with a hand-written Node server — no Nuxt. `packages/vue` already depends on `vite`/`@vitejs/plugin-vue` as devDependencies for its own build/Storybook tooling — the harness reuses the same tool family, consistent with existing monorepo conventions.

**Entry points:**
- Server entry: `createSSRApp(RootComponent)` + `renderToString(app)` from `vue/server-renderer`, run in Node (per `vuejs.org/guide/scaling-up/ssr.html`), producing the initial HTML.
- Client entry: `createSSRApp(RootComponent)` again, then `app.mount("#app")` — Vue's own documented behavior is that mounting an SSR app on the client "assumes the HTML was pre-rendered and will perform hydration instead of mounting new DOM nodes" (verified, vuejs.org).

**Server/client application symmetry:** both entries construct the identical `RootComponent` tree — required by Vue's hydration contract exactly as Angular's and React's are.

**Rendering the 8 components:** a single root component rendering `<UButton>`, `<UCheckbox>`, `<UDialog>`, `<UMenu>`, `<UPaginator>`, `<UScroller>`, `<UTable>`, `<UTooltip>`, imported from `@ultimate/vue`.

**Vue Teleport/Portal — confirmed SSR-safe:** `packages/vue-core/src/overlay/portal.ts` wraps native `<Teleport>` behind a `mounted` ref gate — `mounted.value` starts `false`, only flips inside `onMounted()` (which Vue's own docs confirm "is not triggered during server-side rendering," `vuejs.org/api/options-lifecycle.html`). The Portal component therefore returns `null` during `renderToString`, mirroring React's identical pattern. Vue's `Menu` component is the confirmed consumer (`packages/vue/src/menu/menu.spec.ts` references Teleport); Dialog's own overlay path uses the same shared `Portal` component. No production code change needed.

**Lifecycle behavior relevant to SSR:** `createBaseComponent`'s style registration (`packages/vue-core/src/base/base-component.ts:39-40`) is called from `mounted()` — which, per Vue's own documented lifecycle contract, never fires server-side. This is the same "guaranteed by framework lifecycle, guard is defense-in-depth" pattern confirmed for React.

**Styling/theme loading:** identical pattern to React — `registerComponentStyle` runs client-only via `mounted()`; the server-rendered HTML will not include component `<style>` tags (same expected, documented behavior as §C.3).

### C.5 Server/browser process startup for verification (all three)

Each harness's server entry is started as its own Playwright `webServer` entry (distinct from Track A's three Storybook `webServer` entries, on new ports — Track A already occupies 6001–6003). Playwright's `url`-based readiness check (the same mechanism Track A's config already uses, verified in `playwright.config.ts:132-137`'s own comment reasoning) is reused for Track E's servers.

### C.6 Styling/theme loading — cross-framework summary

No new styling mechanism is introduced. Each framework's existing runtime style-registration path (already verified SSR-safe by construction, §C.2–C.4) is reused unchanged:
- Angular: `ngCoreStyleSheet` (existing, verified no-op-for-injection gap per ADR-023 follow-up 6 / ADR-029 — **this is a pre-existing, already-tracked gap independent of Track E, not something Track E introduces or is responsible for fixing**; it does mean Angular's harness may show unstyled or minimally-styled output even post-hydration, a known limitation to document in the harness's own README, not a Track E regression).
- React: `reactCoreStyleSheet`, client-only via `useMountEffect`.
- Vue: `vueCoreStyleSheet`, client-only via `mounted()`.

Each harness additionally imports `@ultimate/themes`' Aura preset the same way each framework package's own Storybook preview already does, for a baseline theme token set.

### C.7 Deterministic SSR output — cross-framework summary

- **Angular's own documented constraint** (angular.dev/guide/hydration, verified): "the application generates the exact same DOM structure on both the server and the client, including whitespaces and comment nodes... The HTML produced during SSR must not be altered between the server and the client, as structure mismatches will cause hydration to fail." Direct DOM manipulation outside Angular's own template/CD system (e.g., `insertBefore`) triggers hydration-mismatch error `NG0500` — verified via `angular.dev/errors/NG0500`. Track E's harness performs no such manipulation.
- **React/Vue** have no bespoke "identical structure" error code in the same way, but both frameworks' hydration functions (`hydrateRoot`, client `createSSRApp().mount()`) assume matching markup; divergence produces console warnings/errors that this spec's verification (§E) explicitly checks for.
- **Cross-framework determinism rule (Track E's own requirement, §D.3):** no `Math.random()`, `Date.now()`, or locale-dependent formatting anywhere in the initial render path of any harness's fixture data.

---

## D. Eight-component proof page

### D.1 Principle

One page per framework, one deterministic fixture set, minimum interactive behavior per component — not a showcase. Simple, static props; no data fetching; no animation timing dependent on wall-clock time.

### D.2 Per-component minimum demonstrated behavior

| Component | SSR content requirement | Post-hydration interaction requirement |
|---|---|---|
| **Button** | Rendered with static label text present in initial HTML | Click triggers a visible state change (e.g., a click counter or toggled label) |
| **Checkbox** | Rendered with a static initial checked/unchecked state in initial HTML | Click toggles checked state; state change is visible in the DOM |
| **Dialog** | Rendered closed (mask/root not in initial HTML per its own `renderMask` gate — Angular's `UDialog` already gates on this; React/Vue equivalent: closed state produces no portal content) | A trigger button opens the dialog; dialog content becomes visible; Escape or close-button closes it |
| **Menu** | Rendered with static menu items present in initial HTML (or closed, per that framework's default popup/inline mode — inline mode preferred for SSR content-presence, per §D.4) | Clicking/keyboard-activating a menu item fires its handler (e.g., updates a "last selected" display) |
| **Paginator** | Rendered with a static current-page indicator in initial HTML | Clicking next/previous page updates the displayed page number |
| **Scroller** | Rendered with a static, small, fixed-size item list in initial HTML | Scrolling (or a keyboard/interaction equivalent) does not throw; virtualized item rendering remains consistent |
| **Table** | Rendered with static row/column data in initial HTML | Clicking a sortable column header (if enabled) re-orders visible rows, or a row-selection click updates a "selected row" display |
| **Tooltip** | Host element rendered in initial HTML; tooltip content itself absent from initial HTML (consistent with Portal returning `null` server-side, §C.3/C.4 — this is expected, not a defect) | Hover or focus on the host reveals the tooltip content |

### D.3 Determinism rules (binding)

- No `Math.random()` anywhere in fixture data or component props.
- No `Date.now()`/`new Date()` (wall-clock-dependent) anywhere in fixture data or component props — if a "current date" concept is ever needed for a future component, it is out of scope for this 8-component proof set (none of the 8 require it).
- No locale-dependent generated content (e.g., no `toLocaleString()` on fixture numbers/dates) — fixture text is literal, static strings/numbers.
- No environment-dependent values (no reading `process.env`, viewport size, or user-agent into initial render output).
- **Explicit non-assertion:** Track E's Playwright specs do not assert that component `<style>` tags are present in the raw SSR HTML response (§C.6 established this is expected-absent, framework-consistent behavior, not a flash-of-unstyled-content defect to fix) — this is a deliberate scope boundary, not an oversight.

### D.4 Browser-only behavior isolation

Any component behavior that inherently requires the browser (measuring `getBoundingClientRect()` for Tooltip positioning, Scroller's viewport-based virtualization sizing) is already isolated to post-hydration/interaction time by the existing, verified component implementations (§C.2–C.4) — the harness's proof page does not need to invent new isolation; it only needs to avoid triggering such behavior during the page's initial static render (e.g., Tooltip's content is not force-shown on load; Menu defaults to a mode whose content is present without requiring a popup-trigger click, per §D.2's SSR-content-requirement column).

---

## E. SSR verification

Track E proves genuine server rendering, not jsdom simulation, via the following pipeline for each framework:

1. **Real SSR server, real HTTP response:** Playwright's `webServer` starts each framework's actual Node server process (§C.5); the initial HTML is obtained via a real HTTP GET against that running server — not via any in-process render-to-string call inside the test runner itself, and never via jsdom.
2. **Expected proof-set content present in initial HTML:** before the browser loads the page (or by fetching the raw HTML via `page.goto()`'s response, or a preceding plain HTTP request), assert that each of the 8 components' SSR-content-requirement text/markup (§D.2's first column) is present in the raw response body.
3. **Browser loads the server-rendered document:** `page.goto(harnessUrl)` in a real Chromium instance (§F.5) — the browser parses and paints the actual server-delivered HTML before any client JS executes.
4. **Hydration executes:** the client entry's `hydrateRoot`/`provideClientHydration`/`createSSRApp().mount()` runs; Playwright waits for a hydration-complete signal (e.g., a post-hydration-only DOM attribute or class the harness sets once mounted, or `page.waitForFunction()` polling for interactivity — exact mechanism is an Implementation Plan detail, §L.2).
5. **No framework hydration mismatch/error is emitted:** capture `page.on("console", ...)` and `page.on("pageerror", ...)` for the full test duration; explicitly fail on any message matching known hydration-error signatures — Angular's `NG0500` (verified error code, angular.dev/errors/NG0500), React's hydration-mismatch console error text, Vue's hydration-mismatch warning text (exact string patterns to be finalized in Implementation Plan against each framework's actual current wording, §L.3).
6. **No unexpected browser/console errors:** any other `console.error`/uncaught `pageerror` not on an explicit allowlist fails the test.
7. **Post-hydration interaction proves attached handlers:** for each of the 8 components, the corresponding §D.2 post-hydration interaction is performed via Playwright and its expected effect asserted — this is the proof that hydration did not merely repaint matching markup but attached live event handlers and reactive state.

---

## F. Playwright architecture

### F.1 Test location

`apps/playground-{angular,react,vue}/e2e/`, mirroring Track A's existing per-framework `packages/{ng,react,vue}/e2e/` convention (verified structure: `packages/ng/e2e/*.spec.ts` plus one shared `accessibility-envelope.ts` helper). One spec file per component or one combined `ssr-hydration.spec.ts` per framework — recommended: one file per framework (`ssr-hydration.spec.ts`) containing one `test.describe` block per component, since all 8 share one page load, avoiding 8x redundant server-render/page-load overhead; final structure choice deferred to Implementation Plan if a stronger reason to split emerges.

### F.2 Project naming

New projects added to the existing root `playwright.config.ts`'s `projects` array: `ng-ssr-chromium`, `react-ssr-chromium`, `vue-ssr-chromium` — named distinctly from Track A's `{framework}-chromium/-firefox/-webkit` projects to avoid any ambiguity about which surface (Storybook vs. SSR harness) a given project exercises.

### F.3 Server startup mechanism and ports

Three new `webServer` entries, following the exact pattern Track A's three entries already use (`command`, `url`, `reuseExistingServer: !process.env.CI`, `timeout`) — starting each harness's own Node SSR server. Ports must not collide with Track A's 6001–6003: recommended **6011 (Angular), 6012 (React), 6013 (Vue)** — sequential, clearly distinguishable from Track A's block by the leading digit, final assignment confirmed in Implementation Plan.

### F.4 Framework-to-harness mapping

| Framework | Harness directory | Playwright project | Port |
|---|---|---|---|
| Angular | `apps/playground-angular` | `ng-ssr-chromium` | 6011 |
| React | `apps/playground-react` | `react-ssr-chromium` | 6012 |
| Vue | `apps/playground-vue` | `vue-ssr-chromium` | 6013 |

### F.5 Browser coverage

**Chromium only**, per the binding instruction, since no repository evidence found during research or this specification pass demonstrates a Firefox/WebKit-specific hydration behavior difference that SSR verification specifically needs to catch (Track A's existing tri-browser matrix already covers general cross-browser rendering/accessibility concerns at the Storybook layer — duplicating that full matrix here would be redundant coverage of the same browser-engine differences, not new SSR-specific signal). If Implementation or Verification surfaces a genuine Chromium-only SSR/hydration blind spot, expanding to Firefox/WebKit for Track E specifically is a scoped follow-up decision, not something to pre-build speculatively (YAGNI).

### F.6 Console-error capture, hydration-error detection, SSR HTML assertions, post-hydration interaction assertions

All four specified together in §E.5–E.7 above — no separate mechanism needed beyond standard Playwright APIs (`page.on("console")`, `page.on("pageerror")`, `page.goto()`'s response body access or a preceding `fetch`/`page.request.get()` call for raw-HTML assertion before hydration, and standard locator-based interaction assertions).

---

## G. CI integration (specification level — no workflow file created or modified)

### G.1 Relationship to Track B

Track B's existing `ci` job (Node 20, the full audit → build → test → provenance → boundary-validate pipeline) is **untouched**. Track E's CI contract is a new, separate job, following Track A's own `track-a-browser-visual-a11y` job as the direct precedent (verified structure: separate job, `strategy.matrix`, its own Node version, its own steps — `.github/workflows/ci.yml:131-178`).

### G.2 Proposed job shape (for Implementation Plan to realize as an actual workflow edit — not created now)

- **Name:** `track-e-ssr-hydration` (parallel naming convention to `track-a-browser-visual-a11y`).
- **Trigger:** same trigger surface as the existing `track-a-browser-visual-a11y` job (verified: no job-specific `on:` override exists in the current file — job-level triggers inherit the workflow's own top-level `on:` block; Track E follows the identical inheritance, no new trigger logic).
- **Framework matrix:** `matrix.framework: [ng, react, vue]`, identical dimension to Track A's job, mapped to each harness directory/Playwright project (§F.4).
- **Node version:** Track A's job already establishes the precedent of a browser-testing job using a different Node version (24.15.0) than the main `ci` job (20) — Track E's job should use the **same Node version as Track A's job (24.15.0)** by default, for consistency within the browser-testing job family, unless a specific SSR framework version in Implementation is found to require otherwise (no such requirement found in this specification's research).
- **Required commands (per matrix leg):** install dependencies (`pnpm install --frozen-lockfile`, shared with Track A's job) → install Playwright's Chromium browser only (narrower than Track A's `--with-deps chromium firefox webkit`, since §F.5 scopes Track E to Chromium) → run `npx playwright test --project=${{ matrix.framework }}-ssr-chromium`.
- **Failure behavior:** a failing hydration/console-error assertion in any framework's leg fails that matrix leg; `fail-fast: false` (matching Track A's own job setting) so one framework's failure does not hide results for the other two.
- **Artifact/log expectations:** upload the Playwright HTML report per framework leg (mirroring Track A's `playwright-report-${{ matrix.framework }}` artifact upload pattern) — no separate accessibility-report artifact is needed unless §I decides accessibility assertions are added.

### G.3 Explicit non-modification statement

No `.github/workflows/ci.yml` edit is made by this specification. The job shape above is a specification-level contract for the Implementation Plan to realize; Plan Review is the gate at which the actual workflow diff is proposed and reviewed.

---

## H. Package/workspace boundaries

**Verified, not assumed:**
- `pnpm-workspace.yaml:1-3` scopes workspaces to `packages/*` and `apps/*` — both are valid workspace locations; adding real `package.json` files under `apps/playground-*` requires no workspace-config change.
- Track B's publishable-package/provenance tooling (`scripts/provenance/workspace-graph.mjs:5`, comment verified verbatim: "packages/* and its transitive closure") is **explicitly and only** scoped to `packages/*`. `apps/*` is structurally outside this graph's discovery mechanism — not merely by convention, but because the tool never reads that directory at all.
- No package in the repository currently sets `"private": true` (verified: no match found in any `packages/*/package.json`) — this is not evidence that private apps are unsupported, only that no precedent yet exists; Track E's harnesses will be the first to set it, which is a correct, standard, additive convention for non-published workspace packages, not a deviation from anything established.
- **Binding requirement:** each harness's `package.json` sets `"private": true` explicitly (defense-in-depth alongside the structural `packages/*`-only gate above) and declares only the dependencies it actually needs (its own framework's `@ultimate/*` packages, `@ultimate/themes`, and whatever minimal server/build tooling that framework's raw SSR setup requires — no unrelated devDependencies copied wholesale from the library packages).

---

## I. Accessibility

Track A already provides accessibility infrastructure (`@axe-core/playwright`, wired into `runAccessibilityScan`/`accessibility-envelope.ts`, exercised against every Storybook story per component). Track E's primary and only objective is SSR/hydration verification.

**Decision:** Track E does **not** add a full accessibility-scan pass duplicating Track A's existing per-story coverage — the same 8 components' accessibility properties are already exercised via Storybook stories under Track A's job. Track E adds accessibility assertions only where they materially validate something Track A's isolated-rendering coverage cannot: specifically, that ARIA attributes/roles set during SSR are correctly present in server-rendered markup itself (not just after client-side mount) — a genuinely SSR-specific concern (e.g., confirming Dialog's `role="dialog"`/`aria-modal` attributes are already correct in the raw HTML response Playwright fetches in §E.2, not only after hydration). This is folded into the existing per-component assertions in §D.2/§E.2 rather than a separate axe-core scan pass — no new accessibility tooling dependency is introduced by Track E.

---

## J. Exit criteria

Track E is complete when all of the following hold:

1. `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue` each contain a real, working SSR harness (server entry + client entry) using that framework's raw SSR primitives named in the binding architectural decision.
2. Each harness's server, run for real, produces initial HTML containing the SSR-content-requirement markup (§D.2) for all 8 proof-set components.
3. Each harness hydrates successfully in a real Chromium browser instance (via Playwright) with zero framework-emitted hydration-mismatch errors (Angular `NG0500` or equivalent; React/Vue hydration-mismatch console errors) and zero other unexpected console/page errors.
4. Post-hydration, the interaction requirement (§D.2) for all 8 components is demonstrated and asserted for all 3 frameworks (24 total component/framework interaction proofs).
5. All fixture data satisfies the determinism rules (§D.3) — verified by code review during Implementation, not merely asserted.
6. The new Playwright projects (§F.2) pass in CI under the proposed job (§G.2) — establishing the automated, repeatable verification Track E exists to provide.
7. The CI job for Track E passes without modifying or breaking Track B's existing `ci` job.
8. Each harness's `package.json` sets `"private": true` and remains outside Track B's publishable-package/provenance graph — verified by confirming `workspace-graph.mjs`'s package count and pack/install integrity checks are unaffected by the harnesses' presence.
9. GAP-034 can be marked resolved (its own registry entry updated from `IMPLEMENTED-BUT-UNVERIFIED` to a verified state, referencing the specific harnesses/tests as evidence) — this update is an Implementation/Closeout-phase documentation action, not performed by this specification.
10. No production component code (`packages/ng`, `packages/ng-core`, `packages/react`, `packages/react-core`, `packages/vue`, `packages/vue-core`, or any shared `uix-*` package) is modified to make the harness pass, **unless** implementation surfaces concrete evidence contradicting this specification's SSR-safety findings (§C.3/C.4) — in which case that finding, its evidence, and the minimal proposed fix are escalated back through Architecture/Spec review before being applied, not silently patched.
11. ADR-045 (§B) is applied to `docs/architecture/DECISIONS.md` and the GAP-008 correction (§B) is applied to `docs/architecture/BLUEPRINT_GAPS.md`.

---

## K. Risk / failure handling

| Risk | Blocker or expected limitation? | Handling |
|---|---|---|
| Hydration mismatch (any framework) | **Blocker** if triggered by Track E's own harness code (fixture data, page structure) | Fix the harness's markup/fixture determinism; this is squarely Track E's responsibility, not a framework limitation |
| Hydration mismatch caused by a genuine, reproducible defect in `@ultimate/*` component code | **Blocker**, but resolved via the escalation path in Exit Criterion 10 — not a silent production-code patch | Document the defect with reproduction evidence; escalate to Architecture/Spec review for an explicitly approved fix, scoped as narrowly as possible |
| Browser-only API access during SSR | **Not expected** — §C.2–C.4 confirm all 8 components' relevant code paths are already guarded or lifecycle-timed safely | If discovered anyway during implementation, treat as the same escalation path as the row above |
| React Portal SSR behavior | **Resolved, not a residual risk** — confirmed safe by direct source inspection (§C.3) | No action needed; retained in this table only to record that it was investigated and closed, not left open |
| Vue Teleport SSR behavior | **Resolved, not a residual risk** — confirmed safe by direct source inspection (§C.4) | Same as above |
| Styling differences between server/client (no `<style>` in initial HTML) | **Expected limitation, not a blocker** — explicitly scoped out of Track E's assertions (§D.3) | Document in each harness's own README; do not add FOUC-prevention infrastructure (out of scope, would be showcase-grade polish) |
| Server startup failures in CI (port conflicts, missing build step) | **Blocker** if it prevents verification from running at all | Follow Track A's own `webServer` readiness pattern (`url`-based, not `port`-based) exactly, since it already solves this class of problem for Track A's three Storybook servers |
| Nondeterministic markup (accidental `Date.now()`/`Math.random()`/locale formatting introduced during implementation) | **Blocker** | Code-review gate at Implementation time against §D.3's explicit rules; a Playwright assertion re-running the SSR fetch twice and diffing the two responses (excluding any legitimately-random request-scoped IDs, of which none are expected) can serve as an automated determinism check — recommended for Implementation Plan, not mandated here |
| Framework-specific hydration warnings that are not true mismatches (e.g., a benign dev-mode-only warning) | **Expected limitation** if verified benign against that framework's own documentation | Document the specific warning text and why it's benign; do not add it to the failing-console-error check's allowlist without that documentation |
| CI environment differences (Linux runner vs. local dev machine) | **Expected limitation, managed the same way Track A already manages it** | Track A's `playwright.config.ts` already solves the cross-OS snapshot-path problem (`snapshotPathTemplate`, verified) for visual regression; Track E has no visual-regression/screenshot assertions (§F.6 lists only console/hydration/interaction assertions), so this specific cross-OS concern does not apply to Track E's own assertions — flagged here only to confirm it was considered and found not applicable, not overlooked |

---

## Key decisions (summary)

1. GAP-008's SSR slice is promoted to a standalone ADR-045 (text drafted in §B); GAP-008's stale "Architectural decision required: No" field is corrected to reference it. GAP-008's fuller scope stays open, unaffected.
2. Each framework gets its own raw-primitive SSR harness under its existing empty `apps/playground-*` scaffold — no meta-framework, no shared cross-framework abstraction layer (three genuinely separate, framework-native harnesses, consistent with ADR-006's framework-native-implementation principle).
3. All 8 proof-set components appear on one deterministic page per framework; per-component minimum SSR-content and post-hydration-interaction requirements are explicitly enumerated (§D.2) rather than left to implementer judgment.
4. React Portal and Vue Teleport are confirmed SSR-safe by direct source inspection during this specification pass — no production code change anticipated, resolving what the architecture research had flagged as an open verification item.
5. Playwright coverage is additive to the existing root config: three new projects, three new `webServer` entries, new ports (6011–6013), Chromium-only, explicitly not duplicating Track A's tri-browser matrix.
6. CI integration follows Track A's separate-job precedent exactly (own job, own Node version 24.15.0, own matrix) — specified at contract level only; no workflow file is created or edited by this document.
7. Harnesses are private (`"private": true`), structurally outside Track B's `packages/*`-only publishable-package graph (verified via `workspace-graph.mjs` source, not assumed).
8. Accessibility: no duplicate axe-core scan pass; only SSR-specific ARIA-in-initial-HTML assertions folded into existing per-component checks.

## Explicit acceptance criteria

See §J (Exit Criteria) in full — eleven numbered criteria covering harness existence, SSR content, hydration success, interaction proof, determinism, CI passage, Track B non-interference, package-boundary compliance, GAP-034 closure, no unjustified production-code changes, and ADR/documentation application.

## Dependencies and sequencing

- This Specification depends on the approved Architecture Gate (satisfied) and produces one artifact this Implementation Plan must apply before/alongside harness work: ADR-045 + the GAP-008 correction (§B) — recommended as the Implementation Plan's first task, since it's a pure documentation change with no code dependency, and closes the one loose traceability thread before other work proceeds.
- The three per-framework harnesses (Angular/React/Vue) have no dependency on each other and can be implemented in parallel.
- Playwright spec work (§F) depends on at least one harness being runnable; CI integration (§G) depends on the Playwright specs being stable and passing locally first.
- No dependency on Track A/B/C/D beyond reusing Track A's already-installed Playwright/`@playwright/test` and the existing root `playwright.config.ts` file as an edit target.

## Unresolved implementation-level questions (legitimately deferred to the Implementation Plan)

1. Exact bundler/build tool for React's and Vue's harness client bundles (tsup vs. Vite vs. esbuild directly) — §C.3/C.4 note existing monorepo precedent for both but do not mandate one.
2. Exact hydration-complete detection signal for Playwright to wait on (a DOM attribute/class the harness sets post-mount, vs. `page.waitForFunction()` polling) — §E.4.
3. Exact console-error/warning string patterns to match for each framework's hydration-mismatch detection, verified against each framework's actual current error/warning text at implementation time — §E.5.
4. Final Playwright spec file granularity (one combined file per framework vs. one per component) — §F.1 recommends combined, not mandated.
5. Final port assignment (6011–6013 recommended, not binding) — §F.3.
6. Whether an automated double-fetch determinism check (diffing two SSR responses) is built, per the recommendation (not mandate) in §K's nondeterminism row.
7. Express vs. an alternative minimal Node HTTP server for Angular's and React's server entries — no repository precedent exists either way; Vue's server entry has no HTTP-framework dependency at all in its own official minimal example (plain `http` module suffices per vuejs.org's shown example, though Express is equally viable).
8. Exact GAP-034 registry-entry wording update — deferred to Implementation/Closeout, per Exit Criterion 9.

## SPEC GATE STATUS

**SPEC GATE — READY FOR REVIEW**
