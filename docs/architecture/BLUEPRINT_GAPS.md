# Ultimate Platform Blueprint — Gap Registry

**Document:** `docs/architecture/BLUEPRINT_GAPS.md`
**Purpose:** Discovery/audit only. A single authoritative registry of gaps between `docs/architecture/BLUEPRINT.md` and the actual repository state, as of Phase 5 completion + the post-Phase-5 `@ultimate/uix-data` work.
**Status:** Discovery snapshot. Does not commit to sequencing or phase numbers. Does not modify the Blueprint or reopen `@ultimate/uix-data`'s architecture.
**Method:** Every claim below is sourced from direct repository inspection (file reads, directory walks, `grep`/`find`) performed in this session, cross-referenced against `docs/architecture/BLUEPRINT.md`, `docs/architecture/*.md`, `docs/architecture/provenance/*.json`, `docs/superpowers/specs/*` and `docs/superpowers/plans/*`, `scripts/provenance/*`, `.github/workflows/ci.yml`, and every `packages/*/package.json`. Anything not directly verifiable is marked `UNVERIFIED`.

---

## 1. How to read this document

- **Status**: `MISSING` / `PARTIAL` / `IMPLEMENTED-BUT-UNVERIFIED` / `IMPLEMENTED-BUT-NOT-ENFORCED` / `DOCUMENTATION-GAP` / `ARCHITECTURAL-GAP` / `DEFERRED` / `RESOLVED`
- **Type**: one or more of Architecture, Foundation, Component, Framework, Data, Styling, Accessibility, Testing, CI, Packaging, Developer Experience, Documentation, Provenance, Licensing, CLI, MCP, AI, Production
- **Blocking level**: `BLOCKER` (prevents multiple important capabilities) / `HIGH` (blocks a major family/workstream) / `MEDIUM` (independently addressable) / `LOW` (polish/optimization)
- Gap IDs are stable (`GAP-001`, …) and should not be renumbered once assigned in a later revision of this document.

---

## 2. Blueprint phase status (repository-verified)

**Superseded notice (added during Documentation Reconciliation, current as of `main` post-Phase-10):** this section's table was originally written "as of Phase 5 completion" (see this document's own unnumbered header/Purpose line at the top of the file) and was never updated as Phases 6–10 actually landed — Phase 6–9's real completion was only ever reflected in this document's own §3/§4 gap entries (GAP-027/028/029/030), never in this summary table, and Phase 10 postdates this table entirely. The table below has been corrected against direct repository evidence; the full reconciliation evidence trail (commit references, file:line citations) lives in `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §1–§2, which this correction is sourced from.

Source: `docs/architecture/ROADMAP.md`, cross-checked against `docs/superpowers/plans/*` and actual package contents.

| Phase | Name | Blueprint status | Repo-verified status |
|---|---|---|---|
| 0 | Baseline/Provenance/Repository | Complete | Confirmed — `docs/architecture/{PROVENANCE,DEPENDENCIES,COMPATIBILITY,checksums.json}` all populated with commit SHAs/tarball hashes for PrimeNG/PrimeVue/PrimeReact/4×`@primeuix/*`. |
| 1 | UltimateUIX Foundation | Complete | Confirmed — `uix-utils`, `uix-styled`, `uix-styles` (base module only, ADR-017), `uix-motion` all have `package.json`, `src/`, tests, provenance JSON. |
| 2 | UltimateNG | Complete | Confirmed — `ng-core` + `ng` build; proof set expanded from the original 5 components to 8 (Button/Checkbox/Dialog/Menu/Tooltip/Paginator/Scroller/Table). GAP-003 (style-injection no-op) resolved (commit `680876f`). GAP-006 (Tooltip `aria-describedby`, commit `7f814ae`), GAP-007 (Angular Escape-priority stacking, commit `cfdd4cb`), GAP-009/GAP-023 (per-component secondary entry points, commit `62575fb`), and GAP-010 (provenance spec reconciliation, commit `f6ee470`) are all now resolved by the Blueprint Completion workstream (2026-09-13) — see their own entries below. |
| 3 | UltimateReact | Complete | Confirmed — `react-core` + `react`, full 8-component proof set, per-component subpath exports present (`ng` has 70 secondary entry points since GAP-070, 2026-10-01). |
| 4 | UltimateVue | Complete | Confirmed — `vue-core` + `vue`, full 8-component proof set + `v-ripple`/`v-tooltip` directives, Options-API `extends` mixin architecture (ADR-032). |
| 5 | Themes | Complete, with a footnoted exception | Confirmed — `packages/themes` (Aura preset, 8-component proof set). Footnote in `ROADMAP.md` itself: React components use hand-written static CSS, not `dt()` token calls — cross-framework theme consistency is proven at the `react-core` registration layer only, not through a real React component's CSS. GAP-003a (the contradiction this created against ADR-023) is now moot, since GAP-003 itself is resolved. |
| 6 | Component Metadata | Complete | Confirmed — `@ultimate/component-schema` (versioned `ComponentMetadata` schema) and `@ultimate/component-metadata` (8 real, source-verified records) both have substantial real `src/`. GAP-027 (this document's own §4) already correctly marks this resolved; this row was simply never updated to match. |
| 7 | CLI | Complete, with explicit follow-ups | Confirmed — `@ultimate/cli` ships 5 real commands (`init`/`add`/`theme`/`doctor`/`generate`) + an `ai` stub; `create`/`migrate`/`update` explicitly deferred per spec scope. See `ROADMAP.md` footnote 3 and GAP-028 below. |
| 8 | MCP | Complete, with explicit follow-ups | Confirmed — `@ultimate/mcp` ships 5 real tools over stdio transport, boundary-enforced. HTTP transport/resources/prompts explicitly deferred. See `ROADMAP.md` footnote 4 and GAP-029 below. |
| 9 | AI Skills / LLM Context | Complete | **Corrected — this table previously read "Not started," which was already stale by the time Phase 9 actually landed.** `packages/ai/src/` contains 7 real files exporting real generation/validation functions; `skills/` at repo root has real per-component Skill files for all 8 proof-set components plus `AGENT_CONVENTIONS.md`. `packages/ai/context/{llms,llms-full,llms-ng,llms-react,llms-vue}.txt` now exist as real, committed generated output (GAP-036, resolved by the Blueprint Completion workstream, 2026-09-13); `tooling/` remains empty (cosmetic). See GAP-030. |
| 10 | Production Hardening | Complete, with explicit follow-ups | **Corrected — this table previously read "Not started."** All 5 Phase 10 tracks (A–E) are merged into `main`. `SECURITY.md`/`CHANGELOG.md` exist (Track D); visual-regression/a11y-scanning tooling is real and CI-enforced (Track A); dependency/license/SAST scanning and bundle-size/coverage regression gates are real and CI-enforced (Track B); a real release pipeline exists but has never executed a real release (Track C, disclosed); SSR/hydration verification is real (Track E, GAP-034). See `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 for the full per-track evidence. |

`packages/uix` (the umbrella package named in Blueprint §4's proposed repo shape) also contains only `.gitkeep` — it was never populated; its candidate responsibilities ended up distributed across `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`/`uix-data` instead. This is a repository-shape deviation from the Blueprint's literal proposed layout, not a missing capability (see GAP-001).

---

## 3. Gap registry

### Foundation / architecture

#### GAP-001 — `packages/uix` umbrella package was never populated; UIX responsibilities live in five sibling packages instead
- **Status:** DOCUMENTATION-GAP
- **Type:** Architecture, Packaging, Documentation
- **Blocking level:** LOW
- **Current evidence:** `packages/uix/` contains only `.DS_Store` and `.gitkeep`. Blueprint §4's proposed repo shape lists a single `uix/` package; the actual implementation split shared infrastructure into `uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`, and (post-Phase-5) `uix-data` — five packages, no single `uix` package exists or is referenced as a dependency by anything.
- **Expected state:** Either populate `packages/uix` with something (e.g. a re-export barrel), or formally record in `DECISIONS.md`/`PACKAGE_ARCHITECTURE.md` that the umbrella package is superseded by the `uix-*` family and remove/repurpose the empty directory.
- **Why it matters:** Blueprint §4 explicitly says package names/shape are "provisional... until Phase 0 validates package boundaries" — Phase 0 did validate a different shape than the literal text describes, but no ADR records this specific deviation (ADR-016/017 cover *how* uix-styles/motion were vendored, not *why* there is no `uix` package).
- **What it blocks:** Nothing functionally — cosmetic/documentation only.
- **Dependencies:** None.
- **Framework scope:** N/A (framework-neutral tooling concern).
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** Add a short ADR noting the umbrella package was superseded by the `uix-*` family, then delete the empty directory (or repurpose it as a documented meta-package).
- **Source/evidence:** `packages/uix/` directory listing; `docs/architecture/BLUEPRINT.md` §4.
- **Architectural decision required:** No — clerical.

#### GAP-002 — `README.md` states "Phase 0" while five phases are complete
- **Status:** DOCUMENTATION-GAP
- **Type:** Documentation
- **Blocking level:** LOW
- **Current evidence:** Root `README.md` "Status" section reads: *"Phase 0 — Repository Foundation, Provenance & Baseline Verification. No component source has been migrated yet."* `docs/architecture/ROADMAP.md` shows Phases 0–5 complete, with 5 real components shipped in 3 frameworks plus a theme layer.
- **Expected state:** README status section reflects current roadmap state (or simply points to `ROADMAP.md` as the single source of truth and drops the inline status entirely, to avoid drift again).
- **Why it matters:** First-touch document for any new contributor/agent; actively misleading about platform maturity.
- **What it blocks:** Nothing functionally; onboarding accuracy only.
- **Dependencies:** None.
- **Framework scope:** N/A.
- **Existing reusable infrastructure:** `docs/architecture/ROADMAP.md` already correct.
- **Recommended resolution direction:** Update README status line or replace with a pointer to ROADMAP.md.
- **Source/evidence:** `README.md` lines 7-9; `docs/architecture/ROADMAP.md`.
- **Architectural decision required:** No.

#### GAP-003 — `packages/uix-styled`'s `StyleSheet.createStyleElement` no-op means Angular never injects a real `<style>` element
- **Status:** RESOLVED
- **Type:** Foundation, Styling, Framework (Angular)
- **Blocking level:** HIGH (at the time this was open)
- **Current evidence:** `packages/ng-core/src/basecomponent/style-sheet.ts` now contains a real `NgCoreStyleSheet` subclass overriding `createStyleElement`, delegating to `@ultimate/uix-utils`'s real DOM-injection helper, SSR-guarded via `typeof document === "undefined"` — matching React's/Vue's already-working pattern exactly. Landed in commit `680876f` ("fix(ng-core): append registered component styles to document.head").
- **Expected state:** Angular components' CSS is actually injected into the DOM at runtime, matching React's already-working mechanism. **Met.**
- **Why it matters:** This was a real functional gap in a shipped package — now fixed, Angular's proof-set components have a working runtime styling path.
- **What it blocks:** Nothing — resolved. Previously blocked any real visual usage of `@ultimate/ng` components.
- **Dependencies:** None.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/ng-core/src/basecomponent/style-sheet.ts`; commit `680876f`; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §3 (GAP-003 row).
- **Architectural decision required:** No.

#### GAP-003a — Apparent contradiction: ADR-023/029 say Angular style injection is a no-op, but `ROADMAP.md` footnote says Angular's theme path is proven end-to-end
- **Status:** RESOLVED (moot)
- **Type:** Documentation, Architecture
- **Blocking level:** N/A
- **Current evidence:** Moot as a direct consequence of GAP-003's resolution: Angular's style injection now genuinely works, so `ROADMAP.md` footnote 1's claim that Angular's theme path is proven end-to-end is no longer in tension with anything — there is no remaining contradiction to reconcile, because the underlying fact (does Angular actually inject styles) changed rather than being newly investigated.
- **Expected state:** N/A — moot.
- **Why it matters:** Historical record only; the question this gap asked no longer has two competing answers.
- **What it blocks:** Nothing.
- **Dependencies:** GAP-003 (resolved).
- **Framework scope:** Angular.
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** N/A — close as moot, not as "resolved by investigation."
- **Source/evidence:** GAP-003's own resolution evidence above; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §3 (GAP-003a row).
- **Architectural decision required:** No.

#### GAP-004 — No visual regression / Storybook / screenshot tooling anywhere in the repository
- **Status:** RESOLVED
- **Type:** Testing, CI, Production
- **Blocking level:** HIGH (at the time this was open)
- **Current evidence:** Resolved by Phase 10 Track A. `.storybook/` config directories exist for all 3 frameworks; `storybook` and `axe-core` are real devDependencies in all 3 framework `package.json` files; root `playwright.config.ts` defines 9 named Track A projects (`{ng,react,vue}-{chromium,firefox,webkit}`), each with a real `webServer` entry; `.github/workflows/ci.yml`'s `track-a-browser-visual-a11y` job runs a real 3-framework matrix with screenshot-diff assertions, uploading real HTML/accessibility-report artifacts. `docs/architecture/ACCESSIBILITY_BASELINE.md` documents the real baseline. ADR-044 records the tooling choice this gap's own Open Architectural Decision (DECISION-A) had left open.
- **Expected state:** Per Blueprint §28/§40. **Met.**
- **Why it matters:** Historical — this gap directly blocked Production Hardening exit criteria; now resolved.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** Cross-framework — all 3 frameworks covered.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-044; `.github/workflows/ci.yml` `track-a-browser-visual-a11y` job; `docs/architecture/ACCESSIBILITY_BASELINE.md`; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 (Track A).
- **Architectural decision required:** No — DECISION-A (Open Architectural Decisions §5) is resolved by this implementation; see that entry.

#### GAP-005 — No automated accessibility scanning (axe-core or equivalent) anywhere
- **Status:** RESOLVED
- **Type:** Accessibility, Testing, CI
- **Blocking level:** HIGH (at the time this was open)
- **Current evidence:** Resolved by Phase 10 Track A. `axe-core` is a real devDependency in all 3 framework packages, wired through real Playwright specs; `.github/workflows/ci.yml`'s `track-a-browser-visual-a11y` job runs `validate-accessibility-baseline.mjs --check` as a real CI gate, uploading real accessibility-report artifacts per framework.
- **Expected state:** Blueprint §28/§30. **Met** — the scanning infrastructure itself is real and enforced, not merely present. The 2 isolated follow-ups this scanning surfaced (GAP-006's Tooltip `aria-describedby`; GAP-007's Escape/stacking accessibility implications) are themselves now resolved by the Blueprint Completion workstream, 2026-09-13.
- **Why it matters:** Historical — automated scanning now catches the class of gap GAP-006 represents, going forward.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** Cross-framework.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `.github/workflows/ci.yml` `track-a-browser-visual-a11y` job; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 (Track A), §8 (accessibility validation row).
- **Architectural decision required:** No.

#### GAP-006 — `UTooltip` (Angular) has `role="tooltip"` but no `aria-describedby` wiring
- **Status:** RESOLVED
- **Type:** Accessibility, Component, Framework (Angular)
- **Blocking level:** LOW (at the time this was open)
- **Current evidence:** `packages/ng/src/tooltip/tooltip.ts` now injects `ComponentIdGenerator`, assigns each floating tooltip container a real, SSR-safe id, and wires the trigger element's `aria-describedby` to that id on show — merging with, not overwriting, any pre-existing `aria-describedby` tokens, and restoring the original value exactly on hide. Matches `packages/react/src/tooltip/tooltip.tsx`'s already-shipped merge/restore behavior for the same problem.
- **Expected state:** Trigger element has `aria-describedby` pointing at the tooltip's id when visible. **Met.**
- **Why it matters:** Historical — screen readers can now associate the tooltip text with its trigger; previously they could not.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** Angular only (React/Vue already had this wiring — see `packages/react/src/tooltip/tooltip.tsx`, `packages/vue/src/tooltip/tooltip.ts`).
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/ng/src/tooltip/tooltip.ts`; `packages/ng/src/tooltip/tooltip.spec.ts`; commit `7f814ae`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 2.
- **Architectural decision required:** No.

#### GAP-007 — Angular `UDialog` overlay has a single z-index bucket — no working multi-dialog stacking order
- **Status:** RESOLVED
- **Type:** Accessibility, Overlay/Interaction, Component, Framework (Angular)
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** Direct re-verification during Blueprint Completion (2026-09-13) found this gap's own original z-index framing was already stale by the time it was resolved: `@ultimate/uix-utils/zindex`'s `ZIndex.set(key, element, baseZIndex)` already auto-increments correctly on every call sharing the same key (confirmed by direct read of `packages/uix-utils/src/zindex/index.ts`'s `generateZIndex`) — `UOverlay`'s `ZIndex.set("overlay", hostEl, 1000)` call was never actually a "single static bucket" in the sense of assigning the same numeric z-index to every instance; each call already produced a strictly higher value than the last, confirmed by a new regression test (`packages/ng-core/src/overlay/overlay.spec.ts`). The real, confirmed defect was Escape-handling stacking specifically: `packages/ng/src/dialog/dialog.ts`'s `UDialog` now registers with `@ultimate/uix-utils/escape`'s shared `escapeRegistry`/`displayOrderRegistry` (the same registries `packages/react-core` already consumes, per ADR-026/ADR-036), replacing the previous unconditional `(document:keydown.escape)` host listener — with two dialogs open simultaneously, Escape now closes only the topmost (most-recently-displayed) one, confirmed by two new multi-instance tests in `dialog.spec.ts`.
- **Expected state:** React's `useGlobalEscapeKey`/`useDisplayOrder` mechanism (ADR-026) is now mirrored by Angular's `UDialog`. **Met.**
- **Why it matters:** Historical — unblocks every future Angular overlay component needing correct nested-overlay Escape-stacking behavior; shared infrastructure was already proven by React's consumption of it.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** Angular only — React and Vue already had working priority-queue Escape handling per ADR-026/ADR-036.
- **Existing reusable infrastructure:** N/A — resolved (was `@ultimate/uix-utils/escape`, `@ultimate/uix-utils/zindex`, now consumed).
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/ng/src/dialog/dialog.ts`; `packages/ng/src/dialog/dialog.spec.ts`; `packages/ng-core/src/overlay/overlay.spec.ts`; commit `cfdd4cb`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 3.
- **Architectural decision required:** No.

#### GAP-039 (added during Documentation Reconciliation; resolved 2026-09-25) — Vue `v-tooltip`'s panel was created with the correct role/text/position but was never actually visible in a real browser

- **Status:** RESOLVED
- **Type:** Component, Framework (Vue), Accessibility
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** `packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` now sets `display: "inline-block"` as an inline style on the tooltip panel when it is created, alongside the existing `position`/`width` inline styles — mirroring real PrimeVue's own `Tooltip.js` `create()` mechanism (verified directly against pinned source, `.vendor-cache/primevue-4.5.5.tar.gz`), which sets the identical inline `display: 'inline-block'` on its own tooltip container. `packages/vue/e2e/tooltip.spec.ts`'s real-browser Playwright coverage was converted from asserting the known failure to asserting correct behavior: the Default-story test now asserts `toBeVisible()` and `getComputedStyle(tooltip).display` `not.toBe("none")`, and passes on all three engines against Linux-rendered visual-regression baselines.
- **Root cause (established by the approved Spec, not the class-based mechanism originally suspected here):** the panel's base `.u-tooltip { display: none }` CSS rule (`packages/uix-styles/src/tooltip/index.ts` line 4) is a faithful, correct port of real PrimeVue's own base stylesheet — that CSS was never the defect. The defect was that Vue's `showTooltip()` never carried over the companion **inline** `display` style real PrimeVue's `create()` always applies to its container element; an inline style outranks the class-based `display: none` rule by CSS specificity, which is what makes the real component visible. `packages/vue/src/tooltip/tooltip-style.ts`'s `classes.root` resolver (which computes a `u-tooltip-{position}` modifier class carrying only `padding`, never `display`) was **not** the fix mechanism — wiring it would not have resolved visibility, since that class never sets `display` in the shared CSS either way.
- **Correction to this entry's own prior text:** the previously recorded "Expected state" and "Recommended resolution direction" here incorrectly claimed Angular's `UTooltip` "applies this modifier correctly" and recommended porting that same position-modifier-class approach to Vue. Both claims were wrong: Angular imports the identical shared `uix-styles/tooltip` CSS and has the identical missing-inline-style defect — proven directly by Angular's own real-browser Playwright assertion (`packages/ng/e2e/tooltip.spec.ts`, `expect(computedDisplay).toBe("none")`), which was already in the repository, undisclosed by this entry, when it was first written. The class-based approach this entry recommended would not have fixed Vue's visibility either, for the same reason it does not fix Angular's.
- **Angular's parallel gap (explicitly out of this GAP's resolved scope):** Angular's `UTooltip` has the same effective visibility defect, confirmed by its own existing e2e test. This was not fixed as part of GAP-039's resolution — GAP-039 was scoped to Vue only, per the approved Spec's explicit non-goals. Angular's gap remains a separately disclosed, not-yet-registered fact; it is not tracked by this entry and is not implicitly resolved by this entry's `RESOLVED` status.
- **Why it mattered:** Vue's Tooltip directive was otherwise fully correct (content, ARIA wiring, real position computation) but was completely non-functional from an end-user's perspective — nothing was ever visible — which jsdom-based unit tests could not detect, since jsdom never computes real `display`/layout. The defect was invisible until real-browser (Playwright) coverage existed.
- **What it blocked:** Vue Tooltip's own visibility/usability only — not any other component or workstream. Resolved; blocks nothing now.
- **Dependencies:** None.
- **Framework scope:** Vue only, both for the original defect and for this resolution. Angular has a separately-disclosed analogous gap (see above), not addressed here. React is unaffected — its Tooltip uses an entirely different, already-disclosed off-screen-positioning mechanism, not the `display: none` pattern this gap concerned.
- **Existing reusable infrastructure:** None new was required. The fix reused the panel's already-existing inline `style` object in `showTooltip()`, adding one property. `tooltip-style.ts`'s `classes.root` resolver was left unchanged and unwired, per the approved Spec's non-goals — it remains legitimate, Angular-shared padding infrastructure, not dead code.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `docs/superpowers/specs/2026-09-25-gap-039-vue-tooltip-visibility.md` (approved Spec, full root-cause and evidence trail); `docs/superpowers/plans/2026-09-25-gap-039-vue-tooltip-visibility.md` (approved Plan); commit `b8042a9` (merge to `main`) and its constituent commits `95b6139`, `897cc17`, `26feee7`, `2cae72b`; `packages/vue/src/tooltip/tooltip.ts` (`showTooltip()`); `packages/vue/e2e/tooltip.spec.ts` (converted real-browser regression); `packages/ng/e2e/tooltip.spec.ts` (Angular's parallel, separately-disclosed gap).
- **Architectural decision required:** No — this was a behavioral bug, not a fork.

#### GAP-008 — No real consumer application anywhere in the monorepo (`apps/*` are all empty scaffolding)
- **Status:** MISSING
- **Type:** Testing, Packaging, Production
- **Blocking level:** HIGH
- **Current evidence:** `apps/docs`, `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, `apps/showcase` each contain only `.gitkeep`. `PERFORMANCE.md` states directly: *"No app in this monorepo consumes `@ultimate/ng`/`@ultimate/ng-core` via normal node_modules resolution yet."* ADR-023 records the same for Angular specifically as an accepted, deferred Phase 2 exit-criteria gap.
- **Expected state:** Blueprint §35 Phase 2 exit criteria: "package consumers can use UltimateNG without installing PrimeNG" — necessary condition (no runtime PrimeNG dependency) is CI-enforced; sufficient condition (a real app actually consuming the package) is not met for any of the three frameworks.
- **Why it matters:** This is the single biggest reason several other measurements in this document are asterisked. A real consumer app is the only way to get genuine tree-shaking numbers (Angular's `ng-packagr` partial-Ivy output has no `@__PURE__` annotations — only the Angular linker inside a real app build adds those; GAP-009), genuine bundle-size numbers, genuine SSR/hydration behavior, and genuine runtime style-injection verification (GAP-003/GAP-003a).
- **What it blocks:** GAP-009 (tree-shaking measurement), real bundle-size/performance benchmarking (Blueprint §31), SSR/hydration verification (Blueprint §28's "Build/Package" testing tier), and any credible claim that "Phase 2/3/4 exit criteria" are fully met rather than partially deferred.
- **Dependencies:** None architecturally — this is pure implementation backlog, explicitly deferred by user decision per ADR-023.
- **Framework scope:** Cross-framework (Angular, React, Vue all need at least one real consumer).
- **Existing reusable infrastructure:** All 3 frameworks' component packages are otherwise ready to be imported; `packages/themes` is ready to be applied.
- **Recommended resolution direction:** Build one playground app per framework (or one showcase app spanning all three) that imports and renders the full proof set.
- **Source/evidence:** `apps/*/.gitkeep`; `docs/architecture/PERFORMANCE.md` Notes section; `docs/architecture/DECISIONS.md` ADR-023.
- **Architectural decision required:** Resolved for the SSR/hydration slice only — see ADR-045. GAP-008's fuller consumer-app scope (tree-shaking re-measurement, bundle-size benchmarking, a real demo experience) remains open backlog, not addressed by Phase 10 Track E.

#### GAP-009 — Angular tree-shaking verified broken; `ng` ships a single barrel instead of the originally-planned 9 secondary entry points
- **Status:** RESOLVED
- **Type:** Packaging, Framework (Angular), Testing
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** `packages/ng` now ships 8 real `ng-packagr` secondary entry points (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple` — every component directory confirmed to have zero cross-component source imports), each with its own `ng-package.json`/`lib.entryFile`, matching React's/Vue's per-component `exports` pattern. `button`, `dialog`, `menu`, and `table` are **not** split into secondary entry points: attempting all 12 surfaced a reproducible `ng-packagr@21.2.7`/`@angular/compiler-cli@21.2.22` crash (Angular's internal `ShimReferenceTagger` destructuring `undefined`) whenever one secondary entry point's source imports a file that is itself another secondary entry point's root, which is true for these 4 composites (`button`→`ripple`; `dialog`→`button`; `menu`→`ripple`,`tooltip`; `table`→`paginator`,`scroller`) — confirmed via isolated minimal repro, order-independent, not resolved by changing the import specifier, no newer 21.x patch available. `packages/ng/package.json` now declares a real `exports` map with a subpath per shipped component. `scripts/provenance/verify-tree-shaking.mjs`'s re-run result is documented in `docs/architecture/PERFORMANCE.md`'s tree-shaking section: still FAIL — but that script only ever exercises the *primary* `@ultimate/ng` barrel import (`UButton`), which is unaffected by this task since `button` is one of the 4 excluded composites; this gap is resolved for the 8 shipped components regardless, since the resolution criterion is the presence of real, working secondary entry points and a real `exports` map, not this specific script's unrelated `/* @__PURE__ */`-annotation limitation (Task 17's original finding, requires GAP-008's still-open real-consumer-app scope to fully resolve). **A 5th trigger pairing was confirmed during the Angular Form Foundation workstream:** `input-text`→`fluid` — `UInputText`'s mandated ancestor-`UFluid` DI-lookup (`inject(UFluid, { optional: true, host: true, skipSelf: true })`, matching real PrimeNG's own `Button`/`InputText` ancestor-`Fluid`-detection pattern) requires `packages/ng/src/input-text/input-text.ts` to import `UFluid` from `../fluid/fluid`, which is itself another secondary entry point's root — the same defect shape as the original 4 pairs, reproduced without any new investigation needed since the trigger condition was already fully characterized. `input-text` accordingly ships via the main `@ultimate/ng` barrel only (no `input-text` secondary entry point in `packages/ng/package.json`'s `exports` map), matching the resolution already applied to `button`/`dialog`/`menu`/`table`. **Refinement confirmed by a genuine counterexample (Angular Form Foundation workstream, GAP-038 closure):** `UInputNumber` also has ancestor-`UFluid` detection — inherited via `UBaseInput`'s `hasFluid` — yet `packages/ng/src/input-number/input-number.ts` itself never imports `UFluid`'s class at all, and `input-number` shipped as a real secondary entry point (`packages/ng/input-number/ng-package.json`, `./input-number` in `packages/ng/package.json`'s `exports` map) with zero `ShimReferenceTagger` crash. This is because `UBaseInput` (in `ng-core`) resolves the ancestor `<u-fluid>` wrapper via a marker `InjectionToken`, `U_FLUID_ANCESTOR` (`packages/ng-core/src/base-input/fluid-ancestor.token.ts`), which `UFluid` provides on itself — not via a direct DI-injection of `UFluid`'s class the way `UInputText` does. This refines the trigger condition first characterized by the original 4 pairs and the `input-text`→`fluid` 5th pair above: **the defect is triggered specifically by one secondary entry point's own compilation unit directly importing another secondary entry point's root class**, not by inherited ancestor-detection *behavior* in general. A component needing ancestor-`UFluid` detection can still ship as its own secondary entry point, provided the detection is routed through `UBaseInput`'s token-based indirection rather than a direct `UFluid` import — exactly the choice that let `input-number` succeed where `input-text` did not.
- **Expected state:** Either Angular ships secondary entry points matching React/Vue's per-component export pattern, or the spec is formally amended. **Partially met** — 8 of the original 12 components ship secondary entry points; `button`/`dialog`/`menu`/`table` are permanently excluded due to an upstream `ng-packagr` defect with no available fix, and this exclusion is itself the closure (there is no further action pending — the spec was amended to match reality). `input-text` (added later, by the Angular Form Foundation workstream) hits the identical defect and is excluded on the same basis — see the 5th trigger pairing above. `input-number` (added by the same workstream's GAP-038 closure) does **not** hit the defect and ships as a genuine 9th secondary entry point — see the refinement note above.
- **Why it matters:** Historical — Angular is no longer the outlier among the three frameworks on this specific packaging capability, for the components where the underlying tooling permits it.
- **What it blocks:** Nothing — resolved (as amended).
- **Dependencies:** GAP-008 (a real consumer app remains the only way to fully re-measure tree-shaking through the real Angular linker) is unaffected by this resolution and remains separately open, per its own entry.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved. A future `ng-packagr`/`@angular/compiler-cli` upgrade past this defect could revisit `button`/`dialog`/`menu`/`table`/`input-text`, but no such fix exists as of this resolution.
- **Source/evidence:** `packages/ng/{checkbox,paginator,scroller,tooltip,autofocus,badge,fluid,ripple,input-number}/ng-package.json`; `packages/ng/package.json`; `packages/ng/src/input-text/input-text.ts`; `packages/ng/src/input-number/input-number.ts`; `packages/ng-core/src/base-input/base-input.ts`; `packages/ng-core/src/base-input/fluid-ancestor.token.ts`; `docs/architecture/PERFORMANCE.md`; `docs/superpowers/specs/2026-09-13-blueprint-completion-design.md` WP1 amendment; `docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md`; commit `62575fb`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 4; `docs/superpowers/plans/2026-09-16-angular-form-foundation.md` Task 4; ADR-047.
- **Architectural decision required:** No.

#### GAP-010 — Provenance manifest schema names `sha256OfOriginal` as required; neither `ng.json` nor `ng-core.json` has it
- **Status:** RESOLVED
- **Type:** Provenance, CI
- **Blocking level:** LOW (at the time this was open)
- **Current evidence:** Both the Phase 1 spec (`docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md:310`) and the Phase 2 spec (`docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md:388`) — the latter is what this gap originally cited; the former was found during Blueprint Completion to state the identical claim one phase earlier — are now amended to note that `sha256OfOriginal` was never carried into the actual per-manifest schema, and that `scripts/provenance/validate-provenance.mjs` — the real, CI-enforced gate — checks a different, real mechanism instead (`REQUIRED_HEADINGS` matched against `docs/architecture/PROVENANCE.md`'s own section headings). No manifest JSON file was modified; no field was added anywhere.
- **Expected state:** Either the field is added to both manifests, or the spec is amended to stop requiring it. **Met** — the spec was amended.
- **Why it matters:** Historical — the spec text no longer states a requirement the validator doesn't check.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** N/A (documentation-only; affected both the Phase 1 and Phase 2 specs, not just Angular's manifests as originally scoped).
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md:310`; `docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md:388`; commit `f6ee470`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 1.
- **Architectural decision required:** No.

#### GAP-011 — No `SECURITY.md`, `CONTRIBUTING.md`, or `CHANGELOG.md` anywhere in the repository
- **Status:** PARTIALLY RESOLVED
  - _Rationale:_ SECURITY.md and CHANGELOG.md now exist (Track D, R1/R2), resolving that portion of the gap. Blueprint §21's Changesets-driven release-automation expectation remains genuinely open — Track C's scope, not resolved by Track D. CONTRIBUTING.md is explicitly excluded per DECISION-D4 (not a Blueprint requirement); this is a settled, closed decision, not outstanding work.
- **Type:** Documentation, Production
- **Blocking level:** MEDIUM
- **Current evidence:** `SECURITY.md` and `CHANGELOG.md` now exist at repo root (added by Phase 10 Track D); `CONTRIBUTING.md` does not (explicitly excluded, see Status rationale). `.changeset/config.json` exists and is configured (`changelog: "@changesets/cli/changelog"`), but no changeset has ever been consumed/released (all packages remain at `0.1.0`).
- **Expected state:** Blueprint §29 requires a documented security process ("security advisories, patch releases"); §21 requires Changesets-driven release automation with changelogs.
- **Why it matters:** Phase 10 (Production Hardening) explicitly lists "release automation," "operational documentation" as Definition-of-Done items (§40).
- **What it blocks:** Phase 10 exit; any real npm publish workflow.
- **Dependencies:** None.
- **Framework scope:** N/A.
- **Existing reusable infrastructure:** `.changeset/config.json` already configured and ready to use.
- **Recommended resolution direction:** Author SECURITY.md/CONTRIBUTING.md; start using Changesets for real version bumps as soon as any package nears its first real release.
- **Source/evidence:** Root directory listing; `.changeset/config.json`.
- **Architectural decision required:** No.

#### GAP-012 — `CODEOWNERS` is a stub with zero actual ownership assignments
- **Status:** DEFERRED (explicitly, by its own comment)
- **Type:** Developer Experience, Production
- **Blocking level:** LOW
- **Current evidence:** File content is entirely commented-out example text: *"Phase 0: no packages or team ownership assignments exist yet. This stub is populated once package ownership is decided."*
- **Expected state:** Real ownership entries once team structure is decided (explicitly out of this document's scope to decide).
- **Why it matters:** Low urgency pre-team-formation; recorded for completeness per Production Hardening's operational-documentation requirement.
- **What it blocks:** Nothing currently blocking; relevant once multiple maintainers exist.
- **Dependencies:** Organizational decision, not architectural.
- **Framework scope:** N/A.
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** Populate once team/package ownership is decided — explicitly out of scope for an architecture gap registry.
- **Source/evidence:** `CODEOWNERS`.
- **Architectural decision required:** No (organizational, not architectural).

### Data foundation (post-`uix-data`)

#### GAP-013 — Hierarchical (Tree-family) shared identity/selection/expansion contract does not exist and is evidence-blocked
- **Status:** ARCHITECTURAL-GAP (deliberately unresolved, not overlooked)
- **Type:** Data, Architecture, Component
- **Blocking level:** HIGH
- **Current evidence:** ADR-043, directly: hierarchical identity/selection/expansion "was verified structurally incompatible across frameworks — PrimeNG mutates `TreeNode` object references in place, while PrimeReact and PrimeVue both use external `{[key]: boolean}` key-maps — and is explicitly excluded from any shared contract, remaining framework-native unless future evidence establishes genuine shared semantics."
- **Expected state:** No shared contract is expected until/unless real per-framework Tree implementation work surfaces new evidence. This is a *correctly deferred* gap, not a bug.
- **Why it matters:** Tree, TreeTable, TreeSelect, and OrganizationChart (4 components, COMPONENT_INVENTORY.md Data table) all depend on this decision being made — currently `NEEDS ARCHITECTURE DECISION` for all four.
- **What it blocks:** Tree, TreeTable, TreeSelect, OrganizationChart implementation start.
- **Dependencies:** None upstream; this itself blocks 4 components downstream.
- **Framework scope:** Cross-framework — the incompatibility is the whole point.
- **Existing reusable infrastructure:** None applicable — the finding is that none should be forced.
- **Recommended resolution direction:** Do not resolve preemptively. Revisit only when a real Tree implementation (any one framework) surfaces genuine shared semantics, per ADR-043's own stated condition.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-043; `docs/architecture/COMPONENT_INVENTORY.md` Data components table.
- **Architectural decision required:** Yes, but explicitly NOT NOW — tracked in Open Architectural Decisions §6 as a "do not open until X" entry.

#### GAP-014 — Filter `operator`/`constraints`/multi-constraint model deferred, no `Table` implementation yet to justify it
- **Status:** RESOLVED
- **Type:** Data, Architecture
- **Blocking level:** MEDIUM
- **Current evidence:** ADR-043: "the operator/constraints variant is verifiably real but differently normalized between PrimeReact and PrimeNG, and is deferred until real Table implementation evidence justifies it." `uix-data`'s `FilterMetadata` currently covers only the simple non-operator shape.
- **Expected state:** Extend `uix-data`'s filter module once `Table` (Angular/React/Vue) implementation work provides real evidence for the correct shared shape.
- **Why it matters:** `Table` is the highest-risk, highest-value component in the entire remaining inventory (COMPONENT_INVENTORY.md marks it `High` risk, `NEEDS ARCHITECTURE DECISION`).
- **What it blocks:** Full-featured `Table` filtering across frameworks.
- **Dependencies:** Blocked by / blocks Table implementation start (circular in the sense that Table needs a filter model, but the filter model needs Table implementation evidence — this is why ADR-043 sequenced it as "build simple shape now, extend later with real evidence" rather than trying to design it abstractly).
- **Framework scope:** Cross-framework.
- **Existing reusable infrastructure:** `packages/uix-data/src/filter/index.ts`'s existing simple-shape `FilterMatchMode`/`FilterMetadata` as the starting point.
- **Recommended resolution direction:** Directional only — do not design in the abstract; let the first real Table spec surface the evidence.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-043; `packages/uix-data/README.md` "Out of scope" section. Resolved by Table implementation plan Tasks 5/13/19 (Angular/React/Vue's respective framework-native filter-operator/constraints implementations), which supplied the real cross-framework evidence this gap was deferred pending.
- **Architectural decision required:** No — resolved by Table implementation plan Tasks 5/13/19; see Open Architectural Decisions §6.

#### GAP-015 — Sort-toggle/removable-sort cycling not in shared `uix-data` (framework-divergent, confirmed)
- **Status:** RESOLVED (as "intentionally excluded")
- **Type:** Data
- **Blocking level:** LOW
- **Current evidence:** ADR-043: "a sort-toggle cycle (verified present in React/Vue's real source but entirely absent from Angular's)... rejected as failing the cross-framework-identity bar."
- **Expected state:** Framework-native — each framework implements its own sort-toggle behavior when its own Table/sortable-header component is built.
- **Why it matters:** Recorded here so a future agent does not treat this as an oversight and try to "fix" `uix-data` by adding it.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** React/Vue have the behavior in their real Prime references; Angular's real reference does not.
- **Existing reusable infrastructure:** `uix-data`'s `SortMeta`/`SortMode` covers the shared metadata shape; the toggle-cycling behavior itself stays framework-native.
- **Recommended resolution direction:** No action — resolved by evidence, not a gap to close.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-043.
- **Architectural decision required:** No.

#### GAP-016 — `uix-data` package name is explicitly provisional ("Package name is provisional")
- **Status:** DOCUMENTATION-GAP
- **Type:** Packaging, Documentation
- **Blocking level:** LOW
- **Current evidence:** `packages/uix-data/README.md`: *"Status: unstable (pre-1.0). No semver guarantee yet. Package name is provisional."* Same provisional-naming caveat Blueprint §34 applies to every package name.
- **Expected state:** Final name decided before first stable public release (Blueprint §34).
- **Why it matters:** Low urgency now; becomes relevant once any framework component package starts depending on `uix-data` for a real Table/data component (would need a rename coordinated across all consumers).
- **What it blocks:** Nothing yet — `uix-data` currently has zero consumers (verified: no `package.json` in `ng`/`react`/`vue`/`ng-core`/`react-core`/`vue-core` lists `@ultimate/uix-data` as a dependency).
- **Dependencies:** None currently.
- **Framework scope:** N/A.
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** Revisit at the same time as all other provisional package names, before first stable release (Blueprint §34's own stated gate).
- **Source/evidence:** `packages/uix-data/README.md`; `packages/{ng,react,vue,ng-core,react-core,vue-core}/package.json` (no uix-data dependency in any).
- **Architectural decision required:** Bundled into the broader "finalize package names" decision (§34), not a standalone fork.

### Component coverage gaps

#### GAP-017 — 101 of 117 PrimeNG source areas remain unincorporated (Angular); React/Vue inventories not independently produced
- **Status:** MISSING (expected — explicitly scoped, not a defect)
- **Type:** Component, Framework
- **Blocking level:** HIGH (as a body of remaining work, not as a blocker of anything else)
- **Current evidence:** `COMPONENT_INVENTORY.md`'s fully-reconciled count: 14 exclusively built, 2 split-scope (`config`, `icons`), 101 exclusively remaining, out of 117 authoritative PrimeNG top-level source directories. Grouped in COMPONENT_INVENTORY.md into: Form (28 components), Overlay (8), Navigation (10), Data (8, all `NEEDS ARCHITECTURE DECISION`), Panel/Layout/Display (26), Visualization (1, Chart — needs an external-dependency decision), Cross-cutting infrastructure (4: `config` full surface, `passthrough`, remaining `icons` ~85+, remaining `api` surface), "Not needed" (7 — internal PrimeNG tooling with no Ultimate equivalent).
- **Expected state:** Per Blueprint's phase roadmap, remaining components are picked up in later, unnumbered "component family expansion" work — no phase number assigned yet, correctly.
- **Why it matters:** This is simply the honest size of the remaining backlog — not itself evidence of a problem, but essential to state plainly for planning.
- **What it blocks:** Nothing architecturally; it is largely independent, mechanical, well-precedented work (14 components already prove the pattern per framework).
- **Dependencies:** BaseModelHolder/BaseInput foundation tier (not yet built for Angular; `UNVERIFIED` whether React/Vue built an equivalent) blocks all ~20 native-input form components (InputText, InputNumber, Textarea, etc.) — see GAP-018.
- **Framework scope:** This inventory is Angular-specific (derived from PrimeNG's directory structure). `docs/architecture/PROVENANCE.md`'s PrimeVue entry states a Vue-native inventory "if added in a later phase (not committed this phase)" — confirmed not committed. Same for React (PROVENANCE.md: "Remaining ~111 source areas not classified this phase — see spec §30 for why a full inventory was deliberately not pre-committed"). **This means only Angular has a full component-coverage gap inventory; React and Vue do not.**
- **Existing reusable infrastructure:** Foundation tier (BaseComponent/BaseEditableHolder equivalents, Overlay, FocusTrap, styling, motion) already proven across all 3 frameworks by the 5-component proof set.
- **Recommended resolution direction:** Component-family-by-family expansion, in dependency order (Form foundation tier first, per GAP-018).
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` (full file); `docs/architecture/PROVENANCE.md` PrimeVue/PrimeReact entries.
- **Architectural decision required:** No for most families; yes for Data components (GAP-013/GAP-014) and Chart/Visualization (GAP-019).

#### GAP-018 — `BaseModelHolder`/`BaseInput` foundation tier not yet built for Angular; blocks ~20 native-input form components
- **Status:** RESOLVED (for the `BaseModelHolder`-equivalent slice specifically; the `BaseInput`-equivalent remainder tracked separately as GAP-038 is now also RESOLVED — see that entry)
- **Type:** Foundation, Component, Framework (Angular)
- **Blocking level:** N/A (resolved for its most valuable slice)
- **Current evidence:** Direct extraction of real pinned PrimeNG 21.1.9 source during this workstream's spec found this entry's own original framing blurred two distinct tiers together: `BaseModelHolder` (minimal — `modelValue`/`$filled`/`writeModelValue`) and `BaseInput` (richer — `fluid`/`variant`/`size`/`pattern`/etc.), with `InputText`/`Textarea` extending `BaseModelHolder` directly, never `BaseInput`. `packages/ng-core/src/model-holder/model-holder.ts`'s `UModelHolder` now implements the `BaseModelHolder`-equivalent tier, inserted between `UBaseComponent` and `UBaseEditableHolder`. `packages/ng/src/input-text/input-text.ts`'s `UInputText` is the first real consumer, proving the tier end-to-end the same way `UCheckbox` proved `UBaseEditableHolder` in Phase 2.
- **Expected state:** A `modelValue`/`$filled` tier exists and has a real, tested consumer. **Met**, for this narrower, correctly-scoped slice.
- **Why it matters:** Unblocks any future Angular Form component that only needs `BaseModelHolder`-level capability (e.g. `Textarea`) without requiring the richer `BaseInput` tier.
- **What it blocks:** Nothing — resolved for its own slice. GAP-038 (the `BaseInput`-equivalent remainder) is also now resolved; see that entry.
- **Dependencies:** None.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved for this slice.
- **Source/evidence:** `packages/ng-core/src/model-holder/model-holder.ts`; `packages/ng/src/input-text/input-text.ts`; `docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md`; `docs/superpowers/plans/2026-09-16-angular-form-foundation.md`; ADR-046.
- **Architectural decision required:** No.

#### GAP-019 — Chart/Visualization family requires an unresolved external-dependency decision (Chart.js)
- **Status:** ARCHITECTURAL-GAP
- **Type:** Component, Architecture, Licensing
- **Blocking level:** MEDIUM
- **Current evidence:** COMPONENT_INVENTORY.md: Chart is `NEEDS ARCHITECTURE DECISION`, Risk `High`, reason given directly: *"depends on approving an external charting dependency; blocked by ADR-004's no-required-runtime-dependency posture until Chart.js is evaluated as an explicit, approved peer dependency."*
- **Expected state:** A decision on whether Chart.js (or an alternative) becomes an approved peer dependency, following the same evaluation rigor Phase 0 applied to Prime baselines.
- **Why it matters:** ADR-004 (no Prime runtime dependency) is about Prime specifically, not all external dependencies — but no equivalent "external dependency approval" process is documented for non-Prime libraries like Chart.js.
- **What it blocks:** Chart component family only (1 component in the inventory, but likely represents a broader unaddressed question: what is Ultimate's general policy for approving non-Prime runtime dependencies?).
- **Dependencies:** None upstream.
- **Framework scope:** Cross-framework (Chart exists in PrimeNG at minimum; PrimeReact/PrimeVue equivalents not confirmed present in this pass — `UNVERIFIED`).
- **Existing reusable infrastructure:** None — first case of this decision type.
- **Recommended resolution direction:** Directional only — evaluate Chart.js's license/maintenance/bundle-size fit, or consider a headless/adapter approach that doesn't hard-couple Ultimate to one charting library.
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` Visualization table.
- **Architectural decision required:** Yes — see Open Architectural Decisions §6.

#### GAP-020 — `Editor` component wraps Quill (external dependency), same unresolved-approval pattern as Chart
- **Status:** ARCHITECTURAL-GAP
- **Type:** Component, Architecture, Licensing
- **Blocking level:** LOW
- **Current evidence:** COMPONENT_INVENTORY.md: Editor is `NEEDS ARCHITECTURE DECISION`, Risk `High (external dependency approval)`, wraps Quill.
- **Expected state:** Same external-dependency approval process as GAP-019, whenever that process is defined.
- **Why it matters:** A second, independent instance of the same unaddressed policy gap as GAP-019 — worth resolving once, generically, rather than twice.
- **What it blocks:** Editor component only.
- **Dependencies:** Same underlying policy gap as GAP-019 — recommend resolving together.
- **Framework scope:** Angular-confirmed; React/Vue `UNVERIFIED`.
- **Existing reusable infrastructure:** None.
- **Recommended resolution direction:** Fold into the same general external-dependency-approval decision as GAP-019.
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` Panel/Layout/Display table, Editor row.
- **Architectural decision required:** Yes — same fork as GAP-019.

#### GAP-021 — `config` full surface (global `PrimeNGConfig`-equivalent) and `passthrough` (`pt`/`ptm`/`ptmo` system) both explicitly deferred, cross-framework
- **Status:** DEFERRED (deliberately, per YAGNI)
- **Type:** Architecture, Foundation
- **Blocking level:** MEDIUM
- **Current evidence:** COMPONENT_INVENTORY.md's cross-cutting table: `config` full surface and `passthrough` both `NEEDS ARCHITECTURE DECISION`, both explicitly "revisit only on real duplicate-pattern pressure" — this same exclusion is independently confirmed for all three frameworks (ADR-018 Angular, ADR-024 React, ADR-032 Vue all separately state the passthrough system is excluded from their respective Option-B base architectures).
- **Expected state:** No action expected unless a specific future component creates real, demonstrated duplicate-pattern pressure that only a passthrough system would solve.
- **Why it matters:** Recorded so a future agent does not treat this as an oversight — it is a three-times-independently-confirmed deliberate boundary.
- **What it blocks:** Nothing currently — by design.
- **Dependencies:** None.
- **Framework scope:** Cross-framework, independently decided the same way three times (strong convergent evidence it's the right call).
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** No action. Revisit only on real pressure.
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` cross-cutting table; ADR-018, ADR-024, ADR-032.
- **Architectural decision required:** No — already decided, three times, convergently.

### Cross-cutting: Overlay/Interaction

#### GAP-022 — No shared overlay-orchestration abstraction; each framework wires Overlay+FocusTrap+Motion directly per-component
- **Status:** RESOLVED (as "intentionally not built," per YAGNI)
- **Type:** Architecture, Overlay/Interaction
- **Blocking level:** LOW
- **Current evidence:** ADR-020: `UDialog` "wires UOverlay + UFocusTrap + @ultimate/uix-motion's createMotion together directly in its own class/template rather than through a shared 'overlay orchestration service' abstraction, per YAGNI — there is exactly one consumer this phase."
- **Expected state:** Revisit once Popover/Drawer/ConfirmDialog (or any second overlay component) actually migrate and a real shared-pattern need emerges.
- **Why it matters:** Recorded so a future agent building the second overlay component (there are 8 more in COMPONENT_INVENTORY.md's Overlay table, plus Menu-family popups) knows this was a deliberate single-consumer YAGNI call, not an oversight — and knows to look for the pattern once there are 2+ real consumers.
- **What it blocks:** Nothing now; likely becomes relevant the moment a second Angular overlay component is built.
- **Dependencies:** None currently.
- **Framework scope:** Angular-specific in its current framing (React/Vue's own overlay-wiring patterns were not compared for the same question in this pass — `UNVERIFIED`).
- **Existing reusable infrastructure:** `UOverlay`, `UFocusTrap`, `createMotion` all already exist independently and are proven to compose.
- **Recommended resolution direction:** No action now. Extract a shared pattern only when a second real overlay consumer creates duplicate wiring.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-020.
- **Architectural decision required:** No — YAGNI call already made and correctly deferred.

### Framework parity

#### GAP-023 — Angular has no per-component subpath exports (React and Vue do)
- **Status:** RESOLVED
- **Type:** Packaging, Framework
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** Same resolution as GAP-009 (this was always the same underlying fact viewed from two angles). `packages/ng/package.json` now declares a real `exports` map with per-component subpaths for the 8 components an upstream `ng-packagr` defect does not block (`./checkbox`, `./paginator`, `./scroller`, `./tooltip`, `./autofocus`, `./badge`, `./fluid`, `./ripple`), matching `packages/react/package.json`'s and `packages/vue/package.json`'s existing shape for those subpaths. `./button`, `./dialog`, `./menu`, `./table` are not added — see GAP-009's full explanation of the blocking defect.
- **Expected state:** Angular ships per-component `exports` subpaths matching React/Vue. **Partially met** — 8 of 12; see GAP-009.
- **Why it matters:** Historical — see GAP-009.
- **What it blocks:** Nothing — resolved (as amended). See GAP-009.
- **Dependencies:** Same as GAP-009.
- **Framework scope:** Angular only, relative to React/Vue.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/{ng,react,vue}/package.json` `exports` fields; commit `62575fb`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 4.
- **Architectural decision required:** No.

#### GAP-024 — Framework-native divergences are real and intentional, not gaps — recorded so they are not "fixed" for false parity
- **Status:** RESOLVED (documented as intentional divergence)
- **Type:** Framework
- **Blocking level:** LOW
- **Current evidence:** Multiple ADRs record deliberate, evidence-based framework divergence: ADR-025 (React FocusTrap uses sentinel-span, not Angular's keydown interception), ADR-027 (React Menu uses `aria-activedescendant` virtual focus; Angular's `UMenu` uses literal DOM focus movement — both verified as matching their own framework's real Prime reference), ADR-030 vs. ADR-040 (React's `UDialog` excludes draggable/resizable/maximizable entirely per spec; Vue's real PrimeVue reference has draggable+maximizable but never had resizable at all — Vue's `UDialog` excludes draggable/maximizable "to keep scope identical across all three frameworks," a scope decision, not a source-fidelity gap), ADR-034 (Vue's FocusTrap/Tooltip/Ripple are native Vue directives, matching PrimeVue's own directive-shaped source — not components, unlike React's component-shaped equivalents).
- **Expected state:** No forced parity. This is the correct application of Blueprint §9's "Do not force identical APIs where framework conventions make that harmful."
- **Why it matters:** Recorded explicitly so a future "framework parity audit" does not treat these as bugs to fix — each is independently verified against real per-framework Prime source and is the *correct* framework-native behavior.
- **What it blocks:** Nothing — recorded for future-agent context only.
- **Dependencies:** None.
- **Framework scope:** All three, by design divergent from each other in specific, evidenced ways.
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** No action.
- **Source/evidence:** ADR-025, ADR-026, ADR-027, ADR-030, ADR-034, ADR-040.
- **Architectural decision required:** No — already resolved, multiple times, with evidence.

#### GAP-025 — `UCheckbox` capability genuinely differs across frameworks (Vue richest, React narrowest) — not an inconsistency to fix
- **Status:** RESOLVED (documented as intentional, evidence-based divergence)
- **Type:** Framework, Component
- **Blocking level:** LOW
- **Current evidence:** ADR-038: Vue's `UCheckbox` supports controlled+uncontrolled modes, `indeterminate`, and array-membership mode — none of which PrimeReact's real Checkbox has at all. ADR-039: Vue additionally excludes `@primevue/forms` integration as a deliberate boundary cut of a real, working upstream feature (unlike React, which had nothing to cut).
- **Expected state:** Each framework's `UCheckbox` correctly reflects its own verified upstream reference's real capability — this is not a defect to reconcile.
- **Why it matters:** Same reasoning as GAP-024 — recorded so it isn't miscategorized as a parity bug later.
- **What it blocks:** Nothing.
- **Dependencies:** None.
- **Framework scope:** Vue (richest), Angular (middle — has indeterminate per ADR-018's `UCheckbox` row, `UNVERIFIED` on array-membership mode), React (narrowest, fully-controlled-only).
- **Existing reusable infrastructure:** N/A.
- **Recommended resolution direction:** No action.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-038, ADR-039.
- **Architectural decision required:** No.

#### GAP-026 — `@primevue/forms` is a real, verified, working upstream feature with zero Ultimate provenance record — deliberately unevaluated
- **Status:** DEFERRED
- **Type:** Architecture, Provenance, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** ADR-039: `@primevue/forms` "remains unpinned, unevaluated, with no provenance record — incorporating it is deferred to its own future evidence-based evaluation."
- **Expected state:** No action until a future Form-family Vue component creates real pressure to evaluate it, following the same Phase-0-style pinning/license/provenance process already established for every other Prime-derived source.
- **Why it matters:** Recorded as a known, named future evaluation target so it doesn't get silently pulled in ad hoc by a later component that happens to touch its edge (ADR-039's own explicit concern).
- **What it blocks:** Full-featured Vue Form-family components that would benefit from `@primevue/forms`' abstraction — not blocking, since framework-native form handling remains available without it.
- **Dependencies:** None currently.
- **Framework scope:** Vue only — no Angular/React equivalent package exists to evaluate (PrimeReact/PrimeNG have no equivalent separate forms package per ADR-039's own comparison).
- **Existing reusable infrastructure:** N/A — would be a net-new provenance evaluation, same process as Phase 0.
- **Recommended resolution direction:** Directional only — evaluate if/when a Vue Form-family component's implementation creates real pressure.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-039.
- **Architectural decision required:** Yes, but explicitly deferred — see Open Architectural Decisions §6.

### Metadata / CLI / MCP / AI (Phases 6-9)

#### GAP-027 — Component metadata schema and metadata do not exist (Phase 6)
- **Status:** RESOLVED
- **Type:** Documentation, Component, AI
- **Blocking level:** BLOCKER
- **Current evidence:** `packages/component-schema` and `packages/component-metadata` both contain only `.gitkeep`. `ROADMAP.md` marks Phase 6 "Not started."
- **Expected state:** Blueprint §17/§18/ADR-009: schema + metadata as a first-class, versioned platform artifact, feeding docs/Storybook/MCP/Skills/LLM context uniformly.
- **Why it matters:** Blueprint §18's Component Knowledge Model diagram makes metadata the single upstream source for Docs, Storybook, MCP, and Skills → LLM context. Phases 8 and 9 are architecturally downstream of Phase 6 by the Blueprint's own diagram.
- **What it blocks:** Phase 8 (MCP — "MCP should read structured Ultimate metadata rather than depend on arbitrary source parsing at runtime," §23), Phase 9 (AI Skills/LLM context — Skills should "reference canonical component metadata," §24), and any documentation-generation tooling (§27).
- **Dependencies:** Blocks GAP-028, GAP-029, GAP-030. Depends on nothing outstanding — the 5-component-×-3-framework proof set is a ready, real target to design the schema against (avoiding designing metadata in the abstract).
- **Framework scope:** Cross-framework by design (metadata schema must represent per-framework availability, per Blueprint §17's "framework availability" field).
- **Existing reusable infrastructure:** COMPONENT_INVENTORY.md's own 11-column schema (Component/Prime source path/Category/Dependencies/UIX dependencies/Framework-specific responsibilities/Style dependencies/Accessibility responsibilities/Migration classification/Migration phase/Risk) is a strong head start — it already captures much of what Blueprint §17 asks metadata to cover, just not yet in a machine-readable, versioned schema form.
- **Recommended resolution direction:** Directional only, per operating rules (no implementation plans in this document). Design the schema against the real, already-built 5×3 proof set as ground truth.
- **Source/evidence:** `packages/component-schema/`, `packages/component-metadata/` (both `.gitkeep`-only); `docs/architecture/ROADMAP.md`; `docs/architecture/BLUEPRINT.md` §17/§18. Resolved by Component Metadata implementation plan Tasks 1-8 (`@ultimate/component-schema`'s versioned `ComponentMetadata` schema, `nextMetadataVersion`, and `validateComponentMetadata` runtime validator), Tasks 9-16 (`@ultimate/component-metadata`'s 8 real, source-verified metadata records for the closed proof set: Button, Checkbox, Dialog, Menu, Tooltip, Paginator, Scroller, Table), and Task 18 (whole-workspace boundary/ceiling/typecheck verification confirming zero regressions).
- **Architectural decision required:** Not primarily — Blueprint §17/§18 already specify the intent fairly concretely; the remaining decisions are schema-detail-level, not fork-level, and thus out of scope for this document's Open Architectural Decisions section.

#### GAP-028 — CLI does not exist (Phase 7)
- **Status:** RESOLVED
- **Type:** CLI, Developer Experience
- **Blocking level:** HIGH
- **Current evidence:** `packages/cli` contains only `.gitkeep`. `ROADMAP.md`: "Not started."
- **Expected state:** Blueprint §19/§20/ADR-008 — orchestrator only, never replaces Angular CLI/Vite; needs a compatibility resolver (§20) reading a machine-readable compatibility manifest.
- **Why it matters:** Directly named in Blueprint §40's Definition of Done ("CLI quality").
- **What it blocks:** Nothing else is blocked *by* the CLI's absence per the dependency-direction diagram (§6) — CLI is a consumer of platform knowledge, not a producer other packages depend on. Its absence blocks only the CLI's own deliverable and any Skills/AI setup flows that assume `ultimate ai` exists (§19).
- **Dependencies:** Benefits from, but does not strictly require, GAP-027 (metadata) — could start with a minimal orchestration/scaffolding surface (framework detection, package install, theme config) before metadata exists, then add metadata-aware features (`ultimate doctor`/`ultimate ai`) once GAP-027 resolves.
- **Framework scope:** Cross-framework by design (adapters per framework, §19).
- **Existing reusable infrastructure:** `docs/architecture/COMPATIBILITY.md`'s existing baseline/peer-range table is a partial seed for the compatibility manifest §20 calls for, though it currently covers Prime baselines, not Ultimate's own package/framework/theme/metadata/CLI/MCP/AI version matrix (§20's actual scope).
- **Recommended resolution direction:** Directional only. Resolved — see `docs/superpowers/plans/2026-09-07-phase-7-cli-implementation.md`.
- **Source/evidence:** `packages/cli/` (`.gitkeep`-only); `docs/architecture/BLUEPRINT.md` §19/§20. Resolved by Phase 7 CLI implementation plan Tasks 1-11 (`@ultimate/cli`'s five real commands — `init`, `add`, `theme`, `doctor`, `generate` — plus the `ai` stub; the compatibility manifest at `docs/architecture/compatibility-manifest.json` covering 3 frameworks across 6 evaluated axes plus 2 reserved axes; and the `compatibility-manifest:validate`/`boundary:validate:cli` CI gates) and Task 12 (whole-suite verification confirming zero regressions).
- **Architectural decision required:** No — Blueprint is fairly directive here (§19's non-goals are explicit: never replace framework build tools).

#### GAP-029 — MCP server does not exist (Phase 8)
- **Status:** RESOLVED
- **Type:** MCP, AI
- **Blocking level:** HIGH
- **Current evidence:** `packages/mcp` contains only `.gitkeep`. `ROADMAP.md`: "Not started."
- **Expected state:** Blueprint §23/ADR-010 — optional, never a runtime dependency, reads structured metadata rather than parsing source at runtime.
- **Why it matters:** Named directly in Blueprint §40 Definition of Done ("AI/MCP quality where those phases are enabled").
- **What it blocks:** Nothing else architecturally — MCP is a leaf consumer per the dependency diagram (§6).
- **Dependencies:** Architecturally depends on GAP-027 (metadata) per §23's own stated design ("MCP should read structured Ultimate metadata rather than depend on arbitrary source parsing at runtime") — building MCP before metadata exists would likely mean parsing source directly, which the Blueprint explicitly discourages.
- **Framework scope:** Cross-framework (framework-aware queries, §23).
- **Existing reusable infrastructure:** `AI_ARCHITECTURE.md` notes PrimeVue 4.5.5 already ships its own `mcp` and `metadata` sibling packages as "useful prior art to review during Phase 6/8 planning" — explicitly flagged, not yet reviewed.
- **Recommended resolution direction:** Directional only. Review PrimeVue's own `mcp`/`metadata` packages as prior art (already flagged by AI_ARCHITECTURE.md) once GAP-027 is underway.
- **Source/evidence:** `packages/mcp/` (`.gitkeep`-only); `docs/architecture/AI_ARCHITECTURE.md`. Resolved by Phase 8 MCP implementation plan Tasks 1-8 (`@ultimate/mcp`'s 5 real tools, stdio transport, shared error taxonomy) and Tasks 9-10 (the `boundary:validate:mcp` CI gate proving no dependency on `@ultimate/cli`/`@ultimate/{ng,react,vue,themes}` in either direction).
- **Architectural decision required:** No — Blueprint §23 is directive; the real prerequisite is GAP-027, not a fork.

#### GAP-030 — AI Skills package, LLM context generation, and agent-instruction conventions do not exist (Phase 9)
- **Status:** RESOLVED
- **Type:** AI, Documentation
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** `packages/ai/src/` contains 7 real files (`bin-generate.ts`, `bin-validate.ts`, `context-files.ts`, `render-section.ts`, `skill-file.ts`, `validate.ts`, `index.ts`) exporting real functions (`renderLlmsTxt`, `renderLlmsFullTxt`, `renderFrameworkContext`, `generateContextFiles`, `generateSkillFile`, `validateSkillFile`). Repo-root `skills/` has real per-component skill files for all 8 proof-set components (`button.md` through `tooltip.md`) plus `AGENT_CONVENTIONS.md`. The one remaining follow-up this entry used to disclose — the generator had never been run-and-committed — is itself now resolved (GAP-036, Blueprint Completion, 2026-09-13); `tooling/` at repo root remains an empty placeholder (cosmetic, not independently tracked).
- **Expected state:** Blueprint §24/§25/§26/ADR-011/ADR-012. **Met** — the generator, validator, Skill content, and generated `llms.txt`-family output all exist and are real.
- **Why it matters:** Named directly in Blueprint §40 Definition of Done.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** Depended on GAP-027 (metadata) — now resolved, and `packages/ai`'s real implementation does reference `@ultimate/component-metadata` as its design anticipated.
- **Framework scope:** Cross-framework, plus framework-specific guidance per skill (§24).
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/ai/src/index.ts` (barrel exports); `skills/*.md`; `packages/ai/context/*.txt`; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §1 (Phase 9 row), §4 (GAP-036).
- **Architectural decision required:** No.

### Production readiness (Phase 10)

#### GAP-031 — No dependency/license/SAST scanning wired into CI
- **Status:** RESOLVED
- **Type:** CI, Production, Licensing
- **Blocking level:** HIGH (at the time this was open)
- **Current evidence:** Resolved by Phase 10 Track B. `.github/workflows/ci.yml`'s main `ci` job now runs, in sequence: `pnpm audit --audit-level high --prod` (dependency scan), `license-checker-rseidelsohn --onlyAllow ...` (license scan), a real `github/codeql-action@v3` init+analyze step followed by a SARIF-consuming `sast:validate` step. `docs/architecture/SAST_BASELINE.md` (57 lines) contains 22 real, dated CodeQL findings with fingerprints/rule IDs/file:line references tied to a real `codeql database analyze` run.
- **Expected state:** Blueprint §29. **Met.**
- **Why it matters:** Historical — this gap directly blocked Production Hardening exit criteria; now resolved and CI-enforced.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** N/A.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `.github/workflows/ci.yml` (main `ci` job); `docs/architecture/SAST_BASELINE.md`; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 (Track B).
- **Architectural decision required:** No.

#### GAP-032 — No bundle-size monitoring / size-limit tooling in CI (distinct from the one-time `PERFORMANCE.md` snapshot)
- **Status:** RESOLVED
- **Type:** CI, Production, Packaging
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** Resolved by Phase 10 Track B — now genuinely CI-enforced, not merely measured. `scripts/provenance/validate-bundle-size.mjs` implements a merge-base-anchored, two-step baseline acceptance lifecycle: `REGRESSION_THRESHOLD = 0.15` (15% relative), calls `process.exit(1)` on violation. `PERFORMANCE.md`'s "Phase 10 — CI/Security/Quality Gates" section is the gate's baseline of record, covering all 17 publishable packages (extended from the original `uix*`/`ng*`-only scope).
- **Expected state:** Blueprint §31. **Met** — this is now genuinely "bundle-size monitoring," not "bundle-size was measured twice, manually."
- **Why it matters:** Historical — the distinction this gap named (implemented vs. enforced) is now closed in the enforced direction.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** All 17 publishable packages.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved. (See GAP-037 for a related, narrower documentation-only gap: `PERFORMANCE.md` lacks a dedicated narrative section for Phase 3/4/5 specifically, even though the Phase 10 table's data already covers those packages.)
- **Source/evidence:** `scripts/provenance/validate-bundle-size.mjs`; `docs/architecture/PERFORMANCE.md` "Phase 10" section; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 (Track B).
- **Architectural decision required:** No.

#### GAP-033 — Test suites run, but no coverage threshold is enforced anywhere in CI
- **Status:** RESOLVED
- **Type:** CI, Testing
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** Resolved by Phase 10 Track B — now genuinely CI-enforced. `@vitest/coverage-v8` is wired into all 15 Vitest-native packages plus `ng`/`ng-core`'s Angular-idiomatic equivalent (`ng test --coverage`). `scripts/provenance/validate-coverage.mjs` implements the same merge-base-anchored, two-step baseline lifecycle as GAP-032's bundle-size gate: `REGRESSION_THRESHOLD_POINTS = 2.0` (absolute percentage points), calls `process.exit(1)` on violation. `PERFORMANCE.md`'s "Coverage" table is the gate's baseline of record, covering all 17 publishable packages.
- **Expected state:** Blueprint §40. **Met.**
- **Why it matters:** Historical — tests running now genuinely equals tests enforced-at-a-threshold.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** All 17 publishable packages.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `scripts/provenance/validate-coverage.mjs`; `docs/architecture/PERFORMANCE.md` "Coverage" table; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 (Track B).
- **Architectural decision required:** No.

#### GAP-034 — No SSR/hydration verification anywhere (Angular has an `isPlatformBrowser()` guard; no test proves SSR actually works end-to-end)
- **Status:** RESOLVED (SSR/hydration verification specifically; does not close GAP-008's fuller scope)
- **Type:** Testing, Framework, Production
- **Blocking level:** MEDIUM
- **Current evidence:** COMPONENT_INVENTORY.md's FocusTrap+Overlay row notes `isPlatformBrowser()`-guarded code — evidence of SSR-awareness in the implementation. Phase 10 Track E built one minimal, framework-native SSR/hydration harness per framework — `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue` — each using its own raw SSR primitives (Angular's `provideServerRendering`/`provideClientHydration`; React's `renderToPipeableStream`/`hydrateRoot`; Vue's `createSSRApp`/`renderToString`) rather than a meta-framework. Each harness has a real Playwright spec (`apps/playground-angular/e2e/ssr-hydration.spec.ts`, `apps/playground-react/e2e/ssr-hydration.spec.ts`, `apps/playground-vue/e2e/ssr-hydration.spec.ts`) that builds and serves the harness, asserts server-rendered markup is present pre-hydration, asserts no hydration-mismatch/console errors, and includes a determinism double-fetch check (two independent SSR responses for the same route must match). All three specs run in CI via the `track-e-ssr-hydration` matrix job in `.github/workflows/ci.yml` on every relevant trigger.
- **Expected state:** Blueprint §13 requires Angular to independently track "SSR, hydration" as a compatibility responsibility; §14 the same for React/Vue; §28's Build/Package testing tier requires verifying "SSR where supported." This state is now met for all three frameworks.
- **Why it matters:** SSR-awareness in the code (the guard) is necessary but not sufficient evidence that SSR/hydration actually works correctly end-to-end — real, CI-enforced Playwright specs now supply that missing end-to-end proof.
- **What it blocks:** Nothing further — confident SSR support claims are now backed by CI-enforced evidence for all three frameworks.
- **Dependencies:** GAP-008 (a real consumer app remains separately, more broadly open — this resolution used GAP-008's harness infrastructure as the vehicle for the SSR/hydration slice specifically, per ADR-045, without closing GAP-008's fuller scope: tree-shaking re-measurement via a real app build, genuine bundle-size/performance benchmarking, or a real consumer/demo experience).
- **Framework scope:** Cross-framework (Angular, React, Vue — all verified).
- **Existing reusable infrastructure:** The `isPlatformBrowser()` guard pattern already existed in Angular's Overlay/FocusTrap as a starting point; superseded as primary evidence by the three real harnesses and their CI-enforced specs above.
- **Recommended resolution direction:** Resolved — no further action for GAP-034 itself. GAP-008's remaining, broader scope (real consumer/demo app, tree-shaking re-measurement, bundle-size benchmarking) stays open as separate backlog.
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` FocusTrap+Overlay row; `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue` (harness implementations and READMEs); `apps/playground-*/e2e/ssr-hydration.spec.ts` (Playwright SSR/hydration specs with determinism double-fetch checks); `.github/workflows/ci.yml`'s `track-e-ssr-hydration` job; `docs/architecture/DECISIONS.md` ADR-045.
- **Architectural decision required:** No — already resolved, per ADR-045.

#### GAP-035 — No browser-compatibility testing (real-browser or cross-browser) — all tests run under jsdom/Vitest/TestBed
- **Status:** RESOLVED
- **Type:** Testing, Production
- **Blocking level:** LOW (at the time this was open)
- **Current evidence:** Resolved by Phase 10 Track A, using the same real-browser Playwright matrix as GAP-004: 9 named projects (`{ng,react,vue}-{chromium,firefox,webkit}`) exercising real Chromium/Firefox/WebKit engines, not jsdom. jsdom/TestBed remain in use for unit/component tests (correctly — that tier's purpose is unchanged), but genuine cross-browser interaction testing now exists as a separate, real tier above it.
- **Expected state:** Blueprint §28/§31/§40. **Met.**
- **Why it matters:** Historical — accessibility/interaction claims are no longer verified only against jsdom's approximation.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** Was bundled with GAP-004's tooling decision, per this entry's own prior note — both resolved by the same Track A implementation.
- **Framework scope:** Cross-framework.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `playwright.config.ts` (9 Track A projects); `.github/workflows/ci.yml` `track-a-browser-visual-a11y` job; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §2 (Track A).
- **Architectural decision required:** No — resolved alongside GAP-004/DECISION-A.

#### GAP-036 (added during Documentation Reconciliation, resolved during Blueprint Completion) — `llms.txt`/`llms-full.txt` generation tooling exists and is tested, but no generated output artifact has ever been produced or committed
- **Status:** RESOLVED
- **Type:** AI, Documentation
- **Blocking level:** LOW
- **Current evidence:** `packages/ai/context/{llms,llms-full,llms-ng,llms-react,llms-vue}.txt` now exist as real, committed, non-gitignored repository files, generated by running the existing `renderLlmsTxt`/`renderLlmsFullTxt`/`generateContextFiles` functions once against the current 8-component metadata proof set. `packages/ai/package.json`'s `build`/`validate` scripts now target `context/` instead of the previously-gitignored `dist/context/`, and `"files"` now includes `"context"` so a real `npm install @ultimate/ai` still ships these files (preserving the pre-existing npm-packaging contract test's guarantee — `packages/ai/test/packaging.test.ts`, spec §7.1a — from the new location). This is a one-time snapshot commit, not a CI-enforced regeneration — per explicit scope decision during the Blueprint Completion brainstorming session, CI is not wired to regenerate or diff-check this output going forward.
- **Expected state:** Blueprint §25's named `llms.txt`-style generated output exists as a real repository artifact. **Met.**
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Type of work:** Completed — ordinary implementation/operational task (ran the existing generator, committed its output).
- **Source/evidence:** `packages/ai/context/*.txt`; `packages/ai/package.json`; `packages/ai/test/packaging.test.ts`; commit `10435ca`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 5.

#### GAP-037 (new, added during Documentation Reconciliation) — `PERFORMANCE.md` has no dedicated narrative section for Phase 3 (React), Phase 4 (Vue), or Phase 5 (Themes)
- **Status:** DOCUMENTATION-GAP
- **Type:** Documentation, Performance
- **Blocking level:** LOW
- **Current evidence:** `PERFORMANCE.md`'s section headers are `# Performance Baseline`, `## Package size`, `## Tree-shaking spot-check`, `## Notes`, `## Phase 2 — UltimateNG`, `## Phase 10 — CI/Security/Quality Gates`. No `## Phase 3`, `## Phase 4`, or `## Phase 5` heading exists. **Important nuance, confirmed during reconciliation:** this is narrower than "no data exists" — the Phase 10 section's own package-size and coverage tables already include real, measured rows for `packages/react`, `packages/vue`, and `packages/themes` (e.g., `packages/react`: 370.6 KB dist / 10.60 KB gzip; `packages/vue`: 643.5 KB dist / 19.68 KB gzip; `packages/themes`: 110.7 KB dist / 5.23 KB gzip — both measured 2026-09-09 against commit `62480b6`). What's missing is a phase-attributed narrative section presenting that data in the same style Phase 1/2/10 got (tree-shaking spot-check discussion, component-creation-cost benchmarks, etc.), not the underlying measurements themselves.
- **Expected state:** Blueprint §31 ("Measure: bundle size... establish benchmarks" — implicitly for all frameworks).
- **Why it matters:** A human reader looking for "the Phase 3/4/5 performance baseline" finds no dedicated section, even though the raw numbers exist elsewhere in the same document under a differently-scoped heading.
- **What it blocks:** A narrative reference point for React/Vue/Themes-specific performance discussion (e.g., a React/Vue-specific tree-shaking spot-check, analogous to Phase 2's Angular one) — not the existence of size/coverage data itself, which the CI-enforced gates (GAP-032/GAP-033) already cover going forward for all 17 packages.
- **Dependencies:** None.
- **Framework scope:** React, Vue, Themes.
- **Existing reusable infrastructure:** `scripts/provenance/measure-package-size.mjs`; the Phase 10 table's existing react/vue/themes rows as a starting point.
- **Recommended resolution direction:** Add `## Phase 3 — UltimateReact`, `## Phase 4 — UltimateVue`, `## Phase 5 — Themes` sections, cross-referencing the Phase 10 table's existing measurements rather than re-measuring, plus any framework-specific tree-shaking spot-check discussion analogous to Phase 2's.
- **Source/evidence:** `docs/architecture/PERFORMANCE.md` (full section-header read); `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §4, §11 (Drift 3).
- **Architectural decision required:** No — ordinary documentation backfill.

#### GAP-038 (added during Angular Form Foundation workstream) — `BaseInput` foundation tier (richer `fluid`/`variant`/`size`/`pattern`/etc.) not yet built for Angular; blocks `InputMask`/`Password`/`AutoComplete`/`DatePicker`/`InputNumber`/`Select`
- **Status:** RESOLVED (for the `UBaseInput` tier itself and its first real consumer, `UInputNumber`; `Password`/`InputMask`/`AutoComplete`/`DatePicker`/`Select` remain unmigrated and are not part of this resolution)
- **Type:** Foundation, Component, Framework (Angular)
- **Blocking level:** N/A (resolved)
- **Current evidence:** `packages/ng-core/src/base-input/base-input.ts`'s `UBaseInput` now implements the `BaseInput`-equivalent tier, extending `UBaseEditableHolder` with the richer `fluid`/`variant`/`size`/`pattern`/`min`/`max`/`step`/`minlength`/`maxlength` surface real PrimeNG's own `BaseInput` carries. Its `hasFluid` ancestor-detection cannot DI-inject `UFluid`'s class directly the way `UInputText` does (`ng-core` has no dependency on `@ultimate/ng` — `ng` depends on `ng-core`, not the reverse, so importing the class would create a circular workspace dependency); instead it injects a new marker `InjectionToken`, `U_FLUID_ANCESTOR` (`packages/ng-core/src/base-input/fluid-ancestor.token.ts`), which `UFluid` (`packages/ng/src/fluid/fluid.ts`) provides on itself. `packages/ng/src/input-number/input-number.ts`'s `UInputNumber` is the first real consumer, extending `UBaseInput` directly and implementing its own `ControlValueAccessor` (`NG_VALUE_ACCESSOR` + `writeControlValue` override) — a genuine, confirmed difference from `UInputText`, which implements no CVA of its own. Alongside this, `UBaseEditableHolder` gained the real `writeControlValue(value, setModelValue)` bridge PrimeNG's own `BaseEditableHolder.writeValue` uses (default NOOP; `writeValue` is now fixed, no longer `abstract`), and `UCheckbox` was migrated to it: its own `checked` signal stays the authoritative, template-bound state, `writeControlValue` additionally calls `setModelValue` to populate the inherited `modelValue`/`$filled` in parallel, and `toggle()` (the user-interaction path) also calls `writeModelValue` directly so `modelValue`/`$filled` stay in sync on user-driven writes too.
- **Expected state:** Built once a real consumer justifies it, per the same YAGNI reasoning GAP-018 itself was originally deferred under. **Met.**
- **Why it matters:** Unblocks the remaining five Form components (`Password`, `InputMask`, `AutoComplete`, `DatePicker`, `Select`) once each is individually scheduled — the foundation tier and its ancestor-`UFluid`-detection mechanism are now proven end-to-end by a real consumer, not just designed.
- **What it blocks:** Nothing for `UBaseInput`/`UInputNumber` themselves — resolved. `Password`/`InputMask`/`AutoComplete`/`DatePicker`/`Select` migration remains separately unscheduled, each still blocked only on its own dedicated workstream, not on this tier.
- **Dependencies:** None remaining — resolved.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved. A future workstream migrating `Password`/`InputMask`/`AutoComplete`/`DatePicker`/`Select` extends `UBaseInput` directly, following `UInputNumber`'s proven template.
- **Source/evidence:** `packages/ng-core/src/base-input/base-input.ts`; `packages/ng-core/src/base-input/fluid-ancestor.token.ts`; `packages/ng-core/src/base-editable-holder/base-editable-holder.ts`; `packages/ng/src/input-number/input-number.ts`; `packages/ng/src/fluid/fluid.ts`; `packages/ng/src/checkbox/checkbox.ts`; `docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md`; `docs/superpowers/plans/2026-09-16-angular-form-foundation.md`; ADR-047.
- **Architectural decision required:** No — pattern already established by `UModelHolder`/`UInputText`, extended here.

#### GAP-040 (new, added during Documentation Reconciliation) — Paginator's rows-per-page/jump-to-page dropdown controls (Task 15) remain blocked on an Ultimate Select-equivalent component that does not yet exist in any framework

- **Status:** DEFERRED
- **Type:** Component, Framework, Architecture
- **Blocking level:** MEDIUM
- **Current evidence:** `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` Task 15 (line 1577 onward) reads: *"Status: BLOCKED pending an Ultimate Select-equivalent component."* Its Step 0 gate instructs re-running `find packages/ng/src packages/react/src packages/vue/src -maxdepth 1 -type d` before ever starting the task. Re-running that exact command confirms no `select`/`dropdown`-named (or otherwise equivalent) component directory exists at one directory depth under any of the three frameworks' `src/` trees — the only top-level component directories present are `tooltip`, `checkbox`, `ripple`, `dialog`, `button`, `table`, `menu`, `scroller`, `paginator` (Vue/React), plus `input-text`, `autofocus`, `input-number`, `fluid`, `badge` (Angular). This is independently consistent with `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` §3/§4's confirmation that no Select component exists in any of the three frameworks.
- **Expected state:** Once a real Ultimate Select/Dropdown-equivalent component ships in all three frameworks, Task 15 can be planned concretely (a follow-up plan section wiring the rows-per-page dropdown to `rowsPerPageOptions` per spec §10) and implemented. Until then, no action is expected — this is a deliberately gated, not invented, deferral.
- **Why it matters:** Paginator's rows-per-page and jump-to-page controls are the one piece of the component's public API surface (spec §10/§21 criterion 6) that cannot be built without a dependency that doesn't exist yet; recording it here prevents a future agent from treating the gap as an oversight rather than an explicit, evidence-based gate.
- **What it blocks:** Paginator's rows-per-page/jump-to-page dropdown UI specifically — **not** Paginator's already-shipped core functionality. First/prev/next/last navigation, page-links, and the current-page report (Tasks 1-14 of the same plan) are already complete, tested, and usable as a full paging control without rows-per-page/jump-to-page; this gate does not block shipping the rest of Paginator or starting other components' own plans.
- **Dependencies:** A real Ultimate Select/Dropdown-equivalent component, in all three frameworks (not yet scheduled as its own workstream).
- **Framework scope:** Cross-framework — Angular, React, and Vue all lack the prerequisite equally.
- **Existing reusable infrastructure:** None yet — this is the first case requiring a Select-equivalent component; Paginator's Tasks 1-14 (navigation, page-links, current-page report) are unaffected and already reusable as-is.
- **Recommended resolution direction:** Build a Select-equivalent component first (in whichever framework or cross-framework order is separately prioritized), then write a follow-up Task 15 plan section mirroring the existing plan's Tasks 2-12 structure, per the plan's own Step 0 instructions.
- **Source/evidence:** `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` Task 15 (line 1577 onward); `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` §3/§4; `find packages/ng/src packages/react/src packages/vue/src -maxdepth 1 -type d` (re-run, one directory depth, no Select/Dropdown-equivalent directory found).
- **Architectural decision required:** No — the blocker's resolution path (build Select first) is already named, not an open fork.

### Prime-vs-Ultimate parity audit (new, added during Scope Freeze / GAP-stage reconciliation)

Every entry below originates from the exhaustive Prime-vs-Ultimate parity audit (Batches 1–6, Consolidated Pass 1, Findings Decision/Scope Triage, Human Decision Sheet, six-plus residual-Unverified verifications, and the Final Scope Ledger/reconciliation). Each entry's own "Source/evidence" field cites the specific audit artifact its finding and human decision trace back to. None of these gaps invents new evidence beyond what that audit already established — this section only registers the audit's own already-approved INCLUDE scope as formal gap-registry entries, per the approved GAP-stage authorization.

#### GAP-041 — Table column templates/rendering API does not exist in any framework

- **Status:** RESOLVED (2026-10-01, Table Plan — `1e2fd3c`, `c3f26d7`, `19a27ae`, `8a2f33d`)
- **Type:** Component, Data, Architecture
- **Blocking level:** HIGH
- **Current evidence:** Table's own Spec (`docs/superpowers/specs/2026-09-02-table-component-design.md` §17) flagged the column-template/slot API surface as "needs implementation-time verification" but this was never carried into the implementation Plan — no column-definition object, render-function signature, or header/footer/empty/loading template slot mechanism exists in `packages/{ng,react,vue}/src/table/`.
- **Expected state:** A real, framework-appropriate column-templating mechanism (e.g. Angular content-projection/`ng-template`, React render-prop/children-function, Vue slots) letting consumers render custom cell/header/footer content — the mechanism real PrimeNG/PrimeReact/PrimeVue's own Table/DataTable all provide.
- **Why it matters:** This is the traced root cause blocking GC-D2 (checkbox/radio selection UI) and the templated half of the loading/empty-states gap (GAP-046) — several other Table gaps cannot be scoped concretely until this API shape is settled.
- **What it blocks:** GAP-042 (Table checkbox/radio selection UI) fully; GAP-046's templated-empty-state half partially (soft sequencing preference only, not a hard block).
- **Dependencies:** None upstream. Blocks GAP-042 downstream (hard dependency).
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None yet — this is genuinely new API-shape work, not an extension of an existing mechanism.
- **Recommended resolution direction:** Directional only, per GAP-stage rules — the exact column-template API shape is intentionally **not designed here**; that belongs to this gap's own future Spec.
- **Source/evidence:** `docs/superpowers/specs/2026-09-02-table-component-design.md` §17; Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D1); Final Decision Ledger / Final Scope Ledger (GC-D1 — INCLUDE).
- **Architectural decision required:** No — this is scoped, evidence-based implementation work, not an architectural fork.

#### GAP-042 — Table checkbox/radio selection UI does not exist in any framework

- **Status:** RESOLVED (2026-10-01, Table Plan — `1d33554`, `7a4dcbb`, `ba37cbf`)
- **Type:** Component, Data
- **Blocking level:** MEDIUM
- **Current evidence:** Real PrimeNG/PrimeReact/PrimeVue's `TableCheckbox`/equivalent is a template-consumed class with no template host in any of Ultimate's three Table ports — confirmed structurally: no selection-column UI mechanism exists.
- **Expected state:** A real checkbox/radio selection-column UI, consistent with real Prime's own template-consumed selection-column pattern.
- **Why it matters:** Selection UI is one of Table's most commonly used capabilities; its absence blocks any consumer needing built-in multi/single-row selection controls.
- **What it blocks:** Nothing further downstream within this audit's own scope.
- **Dependencies:** **Fully dependent on GAP-041** — cannot be scoped or implemented before GAP-041's column-template mechanism exists.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None yet — depends on GAP-041's own template mechanism as its host.
- **Recommended resolution direction:** Directional only — sequence strictly after GAP-041's Spec/Plan settles the template API shape.
- **Source/evidence:** Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D2); Final Decision Ledger / Final Scope Ledger (GC-D2 — INCLUDE, dependent on GC-D1).
- **Architectural decision required:** No.

#### GAP-043 — Table row/cell editing lifecycle (save/cancel/validation) not implemented in any framework

- **Status:** RESOLVED (2026-10-01, Table Plan — `025b928`, `c04b361`, `135c0fe`, `8a2f33d`)
- **Type:** Component, Data
- **Blocking level:** MEDIUM
- **Current evidence:** The Table implementation Plan's own task text (Angular Task 10 / React Task 16 / Vue Task 22) explicitly, symmetrically defers save/cancel/cell-editor UI across all three frameworks — confirmed by direct Plan-text read during Batch 4 triage.
- **Expected state:** A real row/cell editing lifecycle (enter-edit, save, cancel, validation-state UI), framework-native per each framework's own editing-state model (Angular's key-map/DOM-forms-validity, React's controlled/uncontrolled `editingRows`, Vue's array-prop) — these framework-native shapes are already settled by the original Table Spec §11 and are not reopened here.
- **Why it matters:** Row/cell editing is a core Table capability real Prime provides in all three frameworks; its absence is a genuine, previously-deferred capability gap now explicitly included by human decision.
- **What it blocks:** Nothing further downstream within this audit's own scope.
- **Dependencies:** Independent of GAP-041/GAP-042.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None yet.
- **Recommended resolution direction:** Directional only — a dedicated Spec is needed; the framework-native editing-state model per framework is already settled by the original Table Spec §11.
- **Source/evidence:** `docs/superpowers/plans/2026-09-02-table-component-implementation.md` Angular Task 10 / React Task 16 / Vue Task 22 (as cited by Batch 4 triage); Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D3); Final Decision Ledger / Final Scope Ledger (GC-D3 — INCLUDE). **Supersession notice:** Batch 4's own triage classified this Deferred at the time, on the grounds of the Plan's own disclosed deferral; the final human decision explicitly overrides that classification to INCLUDE — the Deferred classification is superseded, not reopened as a competing status.
- **Architectural decision required:** No.

#### GAP-044 — Table row expansion (`expandedRowKeys`/`onRowExpand`) not implemented in any framework

- **Status:** RESOLVED (2026-10-01, Table Plan — `788935a`, `c994080`, `1bd39be`; expanded rows render an empty placeholder, no expansion-content template yet)
- **Type:** Component, Data
- **Blocking level:** MEDIUM
- **Current evidence:** Real PrimeNG's `expandedRowKeys`/`onRowExpand` is a genuine Prime API; confirmed never named in-scope or out-of-scope anywhere in Table's Spec or Plan — a spec-coverage blind spot, not a disclosed exclusion.
- **Expected state:** A real row-expansion mechanism, likely following the same expanded-row key-map pattern already precedented by Table's own existing selection key-map.
- **Why it matters:** Row expansion (nested detail rows) is a common Table capability with no Ultimate equivalent in any framework.
- **What it blocks:** Nothing further downstream within this audit's own scope.
- **Dependencies:** Independent.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** Table's own existing selection key-map pattern is the direct structural precedent for an expanded-row key-map.
- **Recommended resolution direction:** Directional only — a dedicated Spec should scope the expanded-row key-map/state model, following the existing selection key-map's own shape.
- **Source/evidence:** Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D4); Final Decision Ledger / Final Scope Ledger (GC-D4 — INCLUDE).
- **Architectural decision required:** No.

#### GAP-045 — Table `rowGroupMode: "rowspan"` declared but not implemented (Angular/React); never declared at all (Vue)

- **Status:** RESOLVED (2026-10-01, Table Plan — `7e15a57`, `f4b5f9a`, `76690cc`)
- **Type:** Component, Data
- **Blocking level:** MEDIUM
- **Current evidence:** The Table implementation Plan's own Angular/React tasks declare the accepting type `'subheader' | 'rowspan'` but only implement the `subheader` branch — a provable type-vs-implementation contract defect, confirmed by direct Plan/source comparison during Batch 4 triage. Vue's own task never declared `rowspan` as an option at all — a distinct, additional asymmetry from Angular/React's own type-vs-implementation gap.
- **Expected state:** All three frameworks support `rowGroupMode: "rowspan"` — per this GAP-stage's own human decision explicitly naming Angular + React + Vue in scope, resolving the framework-asymmetry question the audit's own prior ledger had left open.
- **Why it matters:** `rowspan` grouping is a real, named Table capability (declared in Angular/React's own type signature) that was never completed; Vue's own omission of the type entirely is a related but separate asymmetry now also brought into scope.
- **What it blocks:** Nothing further downstream within this audit's own scope.
- **Dependencies:** Independent.
- **Framework scope:** Angular, React, Vue (all three, per this GAP-stage's explicit human decision).
- **Existing reusable infrastructure:** The already-implemented `subheader` branch is the direct structural template for `rowspan`'s own implementation.
- **Recommended resolution direction:** Directional only — complete the `rowspan` branch for Angular/React using the `subheader` branch as the template; add the `rowspan` option to Vue for the first time, matching Angular/React's completed shape.
- **Source/evidence:** Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D5); Final Decision Ledger §4.9 (flagged Vue asymmetry as unresolved); Final Scope Ledger (GC-D5 — INCLUDE, Angular + React + Vue, resolving the prior ledger's own flagged open question).
- **Architectural decision required:** No.

#### GAP-046 — Table loading/empty states not implemented in any framework

- **Status:** RESOLVED (2026-10-01, Table Plan — `085bd95`, `f45467c`, `b72591d`)
- **Type:** Component, Data, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real PrimeNG has `loading`/`loadingIcon`/`showLoader` with a real mask overlay; confirmed never named in-scope or out-of-scope anywhere in Table's Spec or Plan.
- **Expected state:** A `loading` boolean flag (independently implementable now) and a fully-templated empty-state variant (soft-sequences after GAP-041's template mechanism, not a hard block).
- **Why it matters:** Loading/empty-state feedback is a baseline expectation for any data-table component; its complete absence is a genuine, previously-undisclosed gap.
- **What it blocks:** Nothing further downstream within this audit's own scope.
- **Dependencies:** The boolean-flag half is independent; the fully-templated empty-state half has a **soft sequencing preference** (not a hard dependency) toward GAP-041's own template mechanism landing first.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None yet for the boolean flag; the templated half will reuse GAP-041's own mechanism once it exists.
- **Recommended resolution direction:** Directional only — the boolean `loading` flag can proceed independently of GAP-041; the templated empty-state variant should be scoped alongside or after GAP-041's own Spec.
- **Source/evidence:** Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D6); Final Decision Ledger / Final Scope Ledger (GC-D6 — INCLUDE).
- **Architectural decision required:** No.

#### GAP-047 — Table keyboard selection/select-all not implemented in any framework

- **Status:** RESOLVED (2026-10-01, Table Plan — `8e77055`, `d2b8315`, `d1d409b`; integration fixes `b62984e`, `7d40345`, `1b7871a`)
- **Type:** Component, Data, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real PrimeNG's row keydown handler explicitly handles Space/Enter (select) and Ctrl/Cmd+A (select-all); Ultimate's existing keyboard handler covers Arrow/Home/End only — confirmed via direct source comparison during Batch 4 triage. Real PrimeNG's own Ctrl+A condition checks `selectionMode`, not checkbox-column presence, confirming this is independent of GAP-042 (selection-column UI).
- **Expected state:** The existing Arrow/Home/End keydown handler extended to also handle Space/Enter (select) and Ctrl/Cmd+A (select-all).
- **Why it matters:** Keyboard-only selection is an accessibility-relevant capability real Prime provides that Ultimate currently lacks in all three frameworks.
- **What it blocks:** Nothing further downstream within this audit's own scope.
- **Dependencies:** **Confirmed independent of GAP-042** — real PrimeNG's own condition for Ctrl+A checks `selectionMode`, not checkbox-column presence, verified via direct source read.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** The already-working Arrow/Home/End keydown handler is the direct extension point — no new mechanism needed, only new key handling within the existing handler.
- **Recommended resolution direction:** Directional only — extend the existing keydown handler; no new Spec needed given the extension shape is already fully precedented.
- **Source/evidence:** Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-D7); Final Decision Ledger / Final Scope Ledger (GC-D7 — INCLUDE, confirmed independent of GC-D2).
- **Architectural decision required:** No.

#### GAP-048 — Angular Dialog has no scroll-lock; existing `scrollLockRegistry` infrastructure is unwired

- **Status:** RESOLVED (2026-10-01, Overlay Plan — `a3d3ddf`)
- **Type:** Component, Accessibility
- **Blocking level:** LOW
- **Current evidence:** The shared `scrollLockRegistry` infrastructure already exists and is already proven working via Angular's own `BlockUI` component — confirmed via direct source read during the Overlay Batch 2 triage. `UDialog` does not consume it.
- **Expected state:** `UDialog` wired to the existing `scrollLockRegistry`, mirroring `BlockUI`'s own already-working consumption pattern.
- **Why it matters:** Background-scroll leakage while a modal dialog is open is a real accessibility/UX defect; the fix mechanism already exists and is already proven, making this a pure wiring gap.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** `scrollLockRegistry`, already proven via `BlockUI`.
- **Recommended resolution direction:** Directional only — wire `UDialog` to `scrollLockRegistry`, following `BlockUI`'s own already-working pattern; no new Spec needed given the mechanism is fully precedented.
- **Source/evidence:** Overlay Findings Triage (`overlay-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (Angular Dialog scroll-lock — INCLUDE).
- **Architectural decision required:** No.

#### GAP-049 — Angular and Vue ConfirmDialog hardcode `role="dialog"`, diverging from their own real upstream's `role="alertdialog"`

- **Status:** RESOLVED (2026-10-01, Overlay Plan — `5cefdb6` Angular, `8ac8d7f` Vue; React N/A)
- **Type:** Component, Accessibility, Framework
- **Blocking level:** LOW
- **Current evidence:** Both Angular's `UDialog` and Vue's `Dialog.vue` hardcode `role="dialog"` with no override capability, diverging from their own real upstream's `role="alertdialog"` for the confirm-dialog use case — confirmed via direct source comparison during the Overlay Batch 2 triage. **React is confirmed correctly excluded** — PrimeReact's own real `ConfirmDialog`/`Dialog` also never sets `role="alertdialog"`, verified via direct source read; React has zero divergence from its own upstream on this point.
- **Expected state:** Either `UDialog`'s/`Dialog.vue`'s `role` becomes configurable, or `ConfirmDialog` gains its own role override — a small API-surface addition, not an architectural fork.
- **Why it matters:** `role="alertdialog"` vs. `role="dialog"` is an accessibility-semantics difference; real Prime's own Angular/Vue references use the more specific role for confirm-style dialogs.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Angular, Vue. **React is explicitly out of scope** — confirmed to already match its own real upstream's (lacking) behavior.
- **Existing reusable infrastructure:** `UDialog`'s/`Dialog.vue`'s existing role-rendering mechanism is the direct extension point.
- **Recommended resolution direction:** Directional only — add a role-override capability at implementation-plan level; the fix shape is not architecturally ambiguous, so no dedicated Spec is expected to be required.
- **Source/evidence:** Overlay Findings Triage (`overlay-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (Angular + Vue ConfirmDialog role semantics — INCLUDE, React N/A).
- **Architectural decision required:** No.

#### GAP-050 — Galleria lacks keyboard navigation, a local Escape handler, and `role="region"` in all three frameworks

- **Status:** RESOLVED (2026-10-01, Display Plan — `f8fa6a7`, `e945772`, `1403db7`; thumbnail keyboard activation `e5bebbe`, `4f28a9c`, `3c76eca`)
- **Type:** Component, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real Prime has full ArrowLeft/Right/Home/End/Enter/Space keyboard support in all three frameworks; Ultimate has none, confirmed during Panel/Layout/Display Batch 5 triage. Ultimate's fullscreen mode is a redesigned (non-native) overlay, removing the "browser handles Escape" reasoning real Prime's native-fullscreen approach relies on — so a local Escape handler is genuinely needed. Real PrimeNG's Galleria root genuinely has `role="region"` (confirmed via dedicated root-element extraction during triage, correcting an earlier claim of documentation drift); Ultimate's own root is missing it.
- **Expected state:** Full keyboard navigation (matching real Prime's key set), a local Escape handler for the redesigned fullscreen overlay, and `role="region"` on the root element.
- **Why it matters:** Three related but distinct accessibility gaps in the same component, all confirmed by direct evidence, merged into one finding per the original Batch 5 triage's own consolidation decision.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** Accordion's own already-shipped keyboard-handling pattern and `USplitButton`'s own local-Escape-handler pattern are the direct structural precedents for the two respective sub-fixes.
- **Recommended resolution direction:** Directional only — add keyboard handlers (Accordion's pattern), a local Escape handler (`USplitButton`'s pattern), and the missing `role="region"` attribute.
- **Source/evidence:** Panel Findings Triage (`panel-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-P1); Final Decision Ledger / Final Scope Ledger (GC-P1 — INCLUDE).
- **Architectural decision required:** No.

#### GAP-051 — Carousel lacks `aria-live` on the autoplay content wrapper in all three frameworks

- **Status:** RESOLVED (2026-10-01, Display Plan — `d753aeb`, `cf2cbb9`, `d3b2482`; static `autoplayInterval > 0` condition, `aria-live="off"` otherwise, per user ruling)
- **Type:** Component, Accessibility
- **Blocking level:** LOW
- **Current evidence:** Real PrimeNG conditionally sets `aria-live` on the content wrapper for autoplay; Ultimate has none in any framework, confirmed via corroborated binary-safe grep during Batch 5 triage.
- **Expected state:** One conditional ARIA attribute (`aria-live`) on the autoplay content wrapper, matching real Prime.
- **Why it matters:** Autoplay content changes are otherwise not announced to assistive technology.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from GAP-050** — same omission *pattern*, no shared mechanism, per the Batch 5 triage's explicit non-merge decision.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None needed — a single conditional attribute addition.
- **Recommended resolution direction:** Directional only — add the conditional `aria-live` attribute; no Spec needed.
- **Source/evidence:** Panel Findings Triage (`panel-findings-triage.md`); Consolidated Pass 1 Report §3/§6 (GC-P2); Final Decision Ledger / Final Scope Ledger (GC-P2 — INCLUDE).
- **Architectural decision required:** No.

#### GAP-052 — Steps lacks keyboard navigation in all three frameworks

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `b46aa6a`, `1301b7f`, `ed7c8c5`; hidden-item fix `9df8a0b`, `20518e7`, `41f2b21`)
- **Type:** Component, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real Prime has a full ArrowRight/Left/Home/End system for Steps; Ultimate has none in any framework, confirmed during Navigation Batch 3 triage, and undisclosed anywhere.
- **Expected state:** A roving-focus keyboard handler matching real Prime's key set.
- **Why it matters:** Steps is a navigation component; keyboard operability is a baseline accessibility expectation real Prime already meets.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** The same roving-focus keyboard-handler shape already used elsewhere in this registry's Navigation-family gaps (GAP-054, GAP-056) is the direct structural precedent.
- **Recommended resolution direction:** Directional only — add a roving-focus keyboard handler, following the same shape as GAP-054/GAP-056.
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (Steps keyboard navigation — INCLUDE).
- **Architectural decision required:** No.

#### GAP-053 — Angular Steps lacks `routerLink` integration

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `9dd5a33`, `a169b00`; Breadcrumb's own defect is GAP-073)
- **Type:** Component, Framework (Angular)
- **Blocking level:** LOW
- **Current evidence:** Real PrimeNG Steps has router integration; internally inconsistent with Angular's own sibling Breadcrumb, which has router integration — confirmed during Navigation Batch 3 triage. **(Corrected 2026-09-30:** this entry originally described Breadcrumb's pattern as "already correctly" implemented and "already-working". Implementation found Breadcrumb's pattern — `[attr.href]` and `[routerLink]` co-located on one anchor — has a latent defect: Angular's `RouterLink` host binding overwrites the `[attr.href]` fallback. That Breadcrumb defect is tracked separately as GAP-073 and is not part of GAP-053.)
- **Expected state:** Steps supports `routerLink`, with navigation only for clickable items, matching real PrimeNG 21.1.9's `isClickableRouterLink` (`item.routerLink && !readonly && !item.disabled`).
- **Why it matters:** Internal cross-component inconsistency within Angular's own Navigation family — Breadcrumb has router integration, Steps does not, despite both having a real upstream equivalent.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Independent from GAP-073 (Breadcrumb's own href defect).
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** Breadcrumb's router wiring is the historical template, but not its co-located binding shape (see GAP-073). The shipped implementation uses an `@if`/`@else` structural branch so `RouterLink` is present only on clickable items.
- **Recommended resolution direction:** Directional only — add router integration to Steps via the structural-branch pattern, gated on PrimeNG's `isClickableRouterLink` condition. (Implemented during the Navigation Plan, commits `9dd5a33` and `a169b00`; RESOLVED 2026-10-01.)
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (Angular Steps routerLink — INCLUDE).
- **Architectural decision required:** No.

#### GAP-054 — Menubar/TieredMenu/MegaMenu/PanelMenu lack keyboard navigation in all three frameworks

- **Status:** RESOLVED (2026-10-01, Navigation Plan — Angular `862cde5`..`fd843a9`, React `b7dd0b8`..`3410b8f`, Vue `b6317e7`..`b4126e6`; index-mapping fixes `c5aa8a9`, `41d20ae`, `228ab75`)
- **Type:** Component, Accessibility
- **Blocking level:** HIGH
- **Current evidence:** Real Prime has extensive keyboard systems for all four components (confirmed at source-line level for Menubar/MegaMenu during Navigation Batch 3 triage); Ultimate has zero keyboard navigation for any of the four, in any framework. This is one systemic finding covering all four components, per the original Batch 3 finding's own framing — not four independent gaps, since all four share the identical omission and the identical fix shape (roving-focus keyboard handler).
- **Expected state:** Roving-focus keyboard navigation for all four components, in all three frameworks.
- **Why it matters:** This is the largest single Navigation-family gap in the audit by component count; comments claiming this "matches `UMenu`'s own reduction pattern" understate the gap — `UMenu` itself retains basic Arrow navigation, while these four retain none.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. **Independent from GAP-055** (Dock keyboard navigation) — same omission *pattern* only, different component, no shared mechanism.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None directly reusable — this requires new keyboard-handling logic for each of the four components, though the four may share one implementation approach given the systemic nature of the finding.
- **Recommended resolution direction:** Directional only — one plan covering all four components' keyboard-navigation addition, given the shared root pattern; may still require framework-specific task breakdown within that one plan.
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (Menubar/TieredMenu/MegaMenu/PanelMenu keyboard navigation — INCLUDE, one systemic finding).
- **Architectural decision required:** No.

#### GAP-055 — Dock lacks keyboard navigation in all three frameworks

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `2dce580`, `0004242`, `3f481c9`)
- **Type:** Component, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real Prime Dock has full roving keyboard navigation; Ultimate is mouse-only in all three frameworks, confirmed during Navigation Batch 3 triage and undisclosed anywhere.
- **Expected state:** Roving-focus keyboard navigation between Dock action items, matching real Prime.
- **Why it matters:** Dock is otherwise entirely mouse-dependent, a real accessibility gap.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from GAP-054** — different component, same omission *pattern* only.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** The same roving-focus keyboard-handler shape used elsewhere in this registry's Navigation-family gaps.
- **Recommended resolution direction:** Directional only — add keyboard navigation, following the same roving-focus shape as GAP-052/GAP-056.
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (Dock keyboard navigation — INCLUDE).
- **Architectural decision required:** No.

#### GAP-056 — SpeedDial lacks keyboard navigation between action items in all three frameworks

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `481fe7c`, `2cad7b2`, `94084f4`)
- **Type:** Component, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real Prime SpeedDial has full roving keyboard navigation between action items; Ultimate implements only Escape-to-close, in all three frameworks, confirmed during Navigation Batch 3 triage and undisclosed anywhere.
- **Expected state:** Roving-focus keyboard navigation between SpeedDial action items, matching real Prime.
- **Why it matters:** SpeedDial's action items are currently only mouse-operable once opened. **Explicitly distinct from SpeedDial's layout-fidelity question** (positioning/radius/direction math), which was separately, fully verified as Parity Confirmed this audit — this gap concerns keyboard navigation only.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** The same roving-focus keyboard-handler shape used elsewhere in this registry's Navigation-family gaps.
- **Recommended resolution direction:** Directional only — add keyboard navigation between action items; layout math itself needs no changes (already Parity Confirmed, not part of this gap).
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); SpeedDial layout-fidelity verification (`speeddial-layout-verification.md` — Parity Confirmed, cited here only to disclaim scope overlap); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (SpeedDial keyboard navigation — INCLUDE).
- **Architectural decision required:** No.

#### GAP-057 — React Tabs lacks `scrollable` overflow support

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `54cd1a9`, `13653e5`; Angular/Vue overflow defects are GAP-071/GAP-072)
- **Type:** Component, Framework (React)
- **Blocking level:** LOW
- **Current evidence (corrected 2026-09-30, during Implementation — the original text below was carried forward from an unverified Batch 3 triage claim and did not match real source):** Real PrimeReact 10.9.9 TabView has an opt-in `scrollable` prop (default `false`) that, when enabled, renders prev/next navigator buttons only while scrolling in that direction is possible (`scrollLeft !== 0` for prev; not at scroll end for next), recomputed via a `useEffect` with no dependency array (i.e., after every render) and on the strip's own `scroll` event — no `ResizeObserver`. React's own `UTabView` has none of this: no scroll container, no navigators, no `scrollable` prop at all. **The original claim that "Angular's `showNavigators`/Vue's `TabList.vue` already correctly implement the equivalent" is INCORRECT as a description of automatic/continuous overflow detection** — direct source inspection (this Implementation-stage re-verification) found: Ultimate Angular's `UTabList.updateButtonState()` is only ever called from its own `scroll` listener, never at component load and never on resize, so it never shows a navigator on initial overflow at all (a real, separate defect — now tracked by GAP-071). Ultimate Vue's `TabList.vue` calls `updateButtonState()` once in `mounted()` (so it does correctly show the Next button on initial overflow) plus on `scroll`, but never on resize (a real, separate gap — now tracked by GAP-072). Neither Angular nor Vue has a `ResizeObserver`. Real PrimeNG/PrimeVue (unlike PrimeReact) do have `ResizeObserver`-driven continuous overflow detection, but that is not what Ultimate Angular/Vue currently implement, and is not GAP-057's own parity target (GAP-057's target is real PrimeReact, which itself has no `ResizeObserver`).
- **Expected state:** React Tabs gains an opt-in `scrollable` prop (default `false`, matching real PrimeReact's own default) that, when `true`, wraps the tab-header strip in a horizontally-scrollable container and renders prev/next navigator buttons only while scrolling in that direction is possible — recomputed on render/update and on the strip's own `scroll` event, matching real PrimeReact's own recalculation behavior exactly. No `ResizeObserver` is introduced for GAP-057 (out of scope for this GAP; see GAP-071/GAP-072 for the separate Angular/Vue resize-reactivity findings, which do not block or extend GAP-057).
- **Why it matters:** React is the sole outlier among Ultimate's three frameworks for having zero overflow-scrolling capability, and its own real upstream (PrimeReact) has a clear, directly portable API shape to match.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from GAP-058** (`closable`) — confirmed no shared root cause, different Prime-availability shape. **Independent from GAP-071/GAP-072** — those are separate, newly-discovered Angular/Vue-specific findings that do not block, extend, or get folded into GAP-057's own React-only scope.
- **Framework scope:** React only.
- **Existing reusable infrastructure:** None directly reusable — Ultimate's own Angular/Vue implementations do not match real PrimeReact's own behavior closely enough to port as-is (see corrected Current evidence above); real PrimeReact 10.9.9's own `TabView.js`/`TabViewBase.js` source is the actual parity target.
- **Recommended resolution direction:** Port real PrimeReact 10.9.9's own `scrollable` prop (default `false`) and navigator-visibility/recalculation behavior directly — do not port Ultimate Angular's or Vue's own current implementation, since neither matches real PrimeReact's behavior and Angular's own has an independent defect (GAP-071).
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (React Tabs scrollable — INCLUDE); Implementation-stage re-verification (2026-09-30) against real PrimeReact 10.9.9 (`.vendor-cache/primereact-10.9.9.tar.gz`, `components/lib/tabview/{TabView,TabViewBase}.js`) and real Ultimate source (`packages/ng/src/tabs/{tabs,tab-list}.ts`, `packages/vue/src/tabs/{TabList.vue,BaseTabs.ts}`).
- **Architectural decision required:** No — resolved by user decision (2026-09-30): use real PrimeReact's own `scrollable` (opt-in, default `false`) semantics, not Ultimate's own `showNavigators` (always-on) convention; recalculate on render/update + scroll only, no `ResizeObserver`.

#### GAP-058 — React Tabs lacks per-tab `closable` support

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `fd1c773`, `ba5d7ce`; known limitations listed under Expected state)
- **Type:** Component, Framework (React)
- **Blocking level:** LOW
- **Current evidence:** Real PrimeReact TabView/TabPanel has a genuine per-tab close capability; React's `UTabPanel` omits it entirely, confirmed during Navigation Batch 3 triage and undisclosed. **Angular/Vue are correctly N/A** — real PrimeNG's/PrimeVue's newer Tabs family never had this concept at all, confirmed independently per-framework.
- **Expected state:** React Tabs supports per-tab closing, matching real PrimeReact 10.9.9's own API. **Decisions recorded (user rulings, 2026-09-30, during Implementation; see Navigation Spec §12 and Plan Task 25):** (1) `closable` (default `false`) and `closeIcon` are props on `UTabPanel`; (2) `onTabClose` and cancellable `onBeforeTabClose` (returning `false` cancels) are props on `UTabView`, with payload `{ originalEvent, index }` where `index` is the original panel index; (3) the close control is a native `<button type="button" aria-label="Close">` placed beside the header button inside the tab `<li>` (a disclosed deviation from PrimeReact's focusable SVG); (4) PrimeReact-compatible active-tab re-pick after every close (first enabled visible tab at/after the closed index, else the nearest before, including after closing a non-active tab), and closed-tab identity by the child's React key, falling back to its original index. **Known limitations, not part of the GAP-058 contract:** a controlled parent removing children inside `onTabClose` is an unsupported/undefined mutation-timing edge case (the re-pick uses the pre-removal panel list; PrimeReact is also unreliable here); and the close button sits inside an element with `role="tab"`, whose children ARIA treats as presentational — an accessibility follow-up requiring dedicated verification with a real screen reader, not a demonstrated GAP-058 acceptance failure.
- **Why it matters:** This is genuinely React-specific — no cross-framework Ultimate template exists, since Angular/Vue correctly never had this feature to draw from.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from GAP-057** (`scrollable`).
- **Framework scope:** React only. **Angular/Vue explicitly out of scope** — confirmed their own real upstream never had this feature.
- **Existing reusable infrastructure:** None — no cross-framework Ultimate template exists for this specific feature.
- **Recommended resolution direction:** Directional only — port real PrimeReact's own close-button/close-icon pattern directly, since no Ultimate cross-framework precedent exists.
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (React Tabs closable — INCLUDE, Angular/Vue N/A).
- **Architectural decision required:** No.

#### GAP-059 — SelectButton lacks roving-tabindex keyboard behavior (React)

- **Status:** RESOLVED (2026-10-01, React only — Form/Accessibility Plan `f2b8d41`; Angular reclassified as matching PrimeNG; real-browser Space double-toggle is GAP-075)
- **Type:** Component, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** Real PrimeReact 10.9.9 implements roving-tabindex on SelectButton (`SelectButton.js:16,101`; `SelectButtonItem.js:41-94`); React's SelectButton port lacks it entirely, confirmed during Batch 6 triage. **Vue is intentionally, correctly excluded** — real PrimeVue itself lacks this mechanism, independently confirmed via corroborated extraction (not inferred from PrimeNG/PrimeReact). **(Corrected 2026-09-30, Implementation-stage source check:** this entry originally also claimed real PrimeNG implements roving-tabindex and scoped Angular in. Real PrimeNG 21.1.9 SelectButton has none — each option is a `p-togglebutton` with tabindex 0 (−1 when disabled) handling only Enter/Space (`togglebutton.ts:54,87-100`); its `changeTabIndexes` method (`selectbutton.ts:267`) is never called outside its own spec. Ultimate Angular already matches PrimeNG; by user decision Angular is reclassified as matching upstream, like Vue.)
- **Expected state:** Roving-tabindex keyboard behavior for React SelectButton, matching real PrimeReact: first enabled option initially tabbable (PrimeReact: first option); ArrowRight/ArrowDown move focus to the next option, ArrowLeft/ArrowUp to the previous, wrapping at both ends; arrows move focus only; Space selects. Two Ultimate differences by user decision: arrow keys on a component with no tabbable option are a no-op instead of throwing (PrimeReact would throw); and disabled options are skipped, because Ultimate's `USelectButton` composes `UToggleButton`, whose native-disabled checkbox input cannot receive focus (PrimeReact renders its own focusable item per option). `UToggleButton` gains one optional `tabIndex` prop to support this.
- **Why it matters:** Roving-tabindex is a real accessibility pattern real PrimeReact provides; Ultimate's React port currently lacks it.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** React only. **Vue and Angular explicitly out of scope** — both confirmed to already match their own real upstream's (lacking) behavior, not an oversight.
- **Existing reusable infrastructure:** None directly reusable — new roving-tabindex logic needed for React.
- **Recommended resolution direction:** Directional only — add PrimeReact-matching roving-tabindex keyboard behavior to React only.
- **Source/evidence:** Batch 6 Triage (`batch6-triage.md`, GC-B6-01); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (GC-B6-01 — INCLUDE, Angular + React only, as originally decided; Angular removed 2026-09-30, see Current evidence); Form/Accessibility Spec §12.
- **Architectural decision required:** No.

#### GAP-060 — FileUpload progress bar lacks ARIA attributes in all three frameworks

- **Status:** RESOLVED (2026-10-01, Form/Accessibility Plan — `e47233c`, `84afe79`, `e0d955d`, `cff02d6`)
- **Type:** Component, Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** All three real Prime frameworks compose their own real ProgressBar component for upload-progress; Ultimate's own `UProgressBar` sibling already has correct ARIA in every framework; FileUpload's own implementation task, identically in all three frameworks, rendered a bare `div` instead — confirmed during Batch 6 triage. **One shared root cause, three framework-local instances** — not three separate gaps.
- **Expected state:** FileUpload composes the already-existing, already-correct `UProgressBar` (`showValue` false) in place of the bare `div`, in all three frameworks, under the existing `uploading` render condition. Added 2026-09-30 by user decision: a FileUpload-scoped rule gives the composed bar Prime's thin `0.25rem` height (`@primeuix/styles` fileupload), and the dead bare-div CSS is removed; `UProgressBar`'s own styles are unchanged, so the bar now takes `UProgressBar`'s colours, radius and transition (accepted).
- **Why it matters:** This is the most mechanical fix in the entire audit — the correct, accessible component already exists and is already used correctly elsewhere in the same codebase; FileUpload simply didn't reuse it.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** `UProgressBar`, already correct and already shipped in all three frameworks.
- **Recommended resolution direction:** Directional only — compose `UProgressBar` in place of the bare `div`; no new Spec needed.
- **Source/evidence:** Batch 6 Triage (`batch6-triage.md`, GC-B6-02); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (GC-B6-02 — INCLUDE).
- **Architectural decision required:** No.

#### GAP-061 — Vue Password lacks disclosure-pattern ARIA attributes

- **Status:** RESOLVED (2026-10-01, Form/Accessibility Plan — `36eab26`; related follow-ups GAP-074, GAP-076)
- **Type:** Component, Accessibility, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** Genuinely PrimeVue-specific richness (`aria-haspopup`, `aria-expanded`, `aria-controls`, two `aria-live` regions) — independently confirmed absent from PrimeNG/PrimeReact too, confirmed during Batch 6 triage, so Angular/React correctly match their own baselines by *not* having it.
- **Expected state:** Vue's Password gains the disclosure-pattern ARIA real PrimeVue 4.5.5 uses (`Password.vue:13-15,44-45,57-58`): on the **input**, `aria-haspopup` (= `feedback`), `aria-expanded` (= strength overlay open) and `aria-controls` (= the overlay's id, only while open); the strength overlay gets an id plus `role="dialog"` and `aria-live="polite"`; a visually hidden `aria-live="polite"` span shows the current strength text (`infoText`), always rendered. The mask/unmask toggle icons are unchanged. **(Corrected 2026-09-30, Implementation-stage source check:** this entry originally placed the ARIA on the "overlay-toggle", which the Plan read as the mask toggle; real PrimeVue puts it on the input and ties it to the strength-meter overlay. User decision: follow real PrimeVue.)
- **Why it matters:** This is genuinely Vue-specific richness real PrimeVue provides that Ultimate's Vue port currently lacks; Angular/React are correctly unaffected since their own real upstream never had this either.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Vue only. **Angular/React explicitly out of scope** — confirmed their own real upstream never had this feature.
- **Existing reusable infrastructure:** The same disclosure-pattern ARIA approach already used elsewhere in this codebase for overlay-disclosure ARIA is the direct precedent.
- **Recommended resolution direction:** Directional only — add real PrimeVue's input/overlay disclosure ARIA and two `aria-live` regions to Vue's Password.
- **Source/evidence:** Batch 6 Triage (`batch6-triage.md`, GC-B6-03); Consolidated Pass 1 Report §3/§6; Final Decision Ledger / Final Scope Ledger (GC-B6-03 — INCLUDE, Vue only).
- **Architectural decision required:** No.

#### GAP-062 — Vue Tabs lacks PageUp/PageDown scroll-into-view keyboard support

- **Status:** RESOLVED (2026-10-01, Vue Plan — `3345962`)
- **Type:** Component, Accessibility, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** Real PrimeVue's `Tab.vue` implements `onPageDownKey`/`onPageUpKey` to scroll the tab list into view without changing selection; Ultimate's Vue `Tab.vue` omits both entirely, confirmed during the Vue Tabs/Stepper residual verification.
- **Expected state:** PageUp/PageDown scroll-into-view-only behavior, ported exactly — must not change the selected tab as a side effect, per the human decision's own explicit clarification. Real PrimeVue 4.5.5 `Tab.vue:88-95,122-123`: PageDown scrolls the last tab into view, PageUp the first, via `scrollIntoView({ block: 'nearest' })`, with `preventDefault()` and no focus change. (Clarified 2026-09-30 after the Implementation-stage source check; the Plan's original snippet scrolled the current tab instead.)
- **Why it matters:** Real PrimeVue's own keyboard mechanism (`findNextTab`/`findPrevTab`/`findFirstTab`/`findLastTab`, confirmed to live in `Tab.vue` not `TabList.vue`) is otherwise already matched by Ultimate's Vue port; this is the one confirmed missing piece.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Vue only.
- **Existing reusable infrastructure:** The existing `findNextTab`/`findPrevTab`/`findFirstTab`/`findLastTab` mechanism already in `Tab.vue` is the direct extension point.
- **Recommended resolution direction:** Directional only — port the scroll-into-view-only behavior exactly; do not change selection as a side effect.
- **Source/evidence:** Vue Tabs/Stepper residual verification (`vue-tabs-stepper-verification.md`); Final Decision Ledger / Final Scope Ledger (Vue Tabs PageUp/PageDown — INCLUDE).
- **Architectural decision required:** No.

#### GAP-063 — Vue Stepper lacks vertical-mode separator rendering

- **Status:** RESOLVED (2026-10-01, Vue Plan — `bd4c025`, `41a219c`, including the widened vertical StepItem layout; horizontal separators are GAP-077)
- **Type:** Component, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** Real PrimeVue's `StepPanel.vue` has a real `updateSeparator()` method rendering a `StepperSeparator` between vertical steps (except after the last); Ultimate's `StepPanel.vue` has zero separator logic anywhere in the Stepper family, confirmed by exhaustive grep during the Vue Tabs/Stepper residual verification.
- **Expected state:** The `updateSeparator()` mechanism ported, with `StepperSeparator` rendering wired in for vertical-mode Steppers. "Vertical" means the panel sits inside a `StepItem` (PrimeVue `StepPanel.vue`: `isVertical = !!$pcStepItem`); the separator renders inside a content wrapper before the panel content, for every vertical step except the last. Supporting pieces Ultimate lacks and this gap adds (user decision 2026-09-30): `StepItem` provides its context to descendants, a stable step marker attribute, a small internal separator element, and vertical separator/content-wrapper CSS based on `@primeuix/styles` 2.0.3 stepper (`.p-stepitem .p-stepper-separator`, `.p-stepitem .p-steppanel-content-wrapper`). Widened 2026-09-30 by user decision after the Task 2 review: also the PrimeUIX vertical StepItem layout (item as a column, panel as a grid, content indent, RTL offset, last-item padding), because Ultimate's pre-existing row layout left the separator beside the header instead of under the step number.
- **Why it matters:** This is a real, visible rendering gap for vertical-orientation Steppers. **(Corrected 2026-09-30, Implementation-stage source check:** this entry originally said PrimeVue's other Stepper-family files already match Ultimate exactly. Real PrimeVue `Step.vue:9,43-49` also renders a separator after each horizontal step header except the last, which Ultimate's `Step.vue` lacks; that horizontal gap is registered separately as GAP-077 and is not part of GAP-063.)
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None.
- **Framework scope:** Vue only.
- **Existing reusable infrastructure:** Real PrimeVue's own `updateSeparator()` mechanism is the direct porting template.
- **Recommended resolution direction:** Directional only — port `updateSeparator()` and wire in `StepperSeparator` rendering for vertical-mode Steppers.
- **Source/evidence:** Vue Tabs/Stepper residual verification (`vue-tabs-stepper-verification.md`); Final Decision Ledger / Final Scope Ledger (Vue Stepper vertical separator — INCLUDE).
- **Architectural decision required:** No.

#### GAP-064 — Aura preset has per-component token coverage for only 5 of ~88 comparable components (76 registered after the Batches 1-3 tranche, 2026-10-01)

- **Status:** PARTIAL (2026-10-01: Batches 1-3 tranche delivered, `b9ec863`..`cf341df`, 76 modules registered; remaining scope in the Progress note below)
- **Type:** Styling, Component, Architecture
- **Blocking level:** MEDIUM
- **Current evidence:** Real Prime's shared `@primeuix/themes` package has 88 per-component preset modules; Ultimate has 5 (`checkbox`/`button`/`menu`/`tooltip`/`dialog` — the original Phase 5 proof set), confirmed during the Aura token-completeness residual verification. The other ~83 components have real, working, but hardcoded (non-themeable) CSS instead — confirmed via Accordion as a representative sample, self-disclosed in-code, recurring in 54 of Vue's own style-module files. **The `base`-tier foundation tokens are Parity Confirmed and explicitly not part of this gap** — see the separate Parity Confirmed entry in the Final Scope Ledger.
- **Progress (2026-10-01, Theming Plan — Batches 1-3 tranche, commits `b9ec863`..`cf341df`):** 71 further Aura preset modules ported verbatim from `@primeuix/themes` 2.0.3 and registered in `auraPreset.components` (76 registered in total, including the original 5), each with a `themes.json` provenance entry and CI-enforced fidelity against a committed upstream JSON fixture (`packages/themes/test/fixtures/aura-upstream-tokens.json`; the original 5 proof-set modules are not in the fixture). Status remains PARTIAL. Still open: (a) wiring components' style files to consume the new modules (corrected 2026-10-01 — see "Reconciled remaining scope" below: some components already resolve the new modules); (b) upstream modules with Ultimate components but not ported — `tabview`/`tabmenu` (React `UTabView`/`UTabMenu`), `badge` (ng/vue), `inputgroup` (ng/vue), `paginator` (all three); (c) `ripple` (inclusion undecided); (d) InputMask has no upstream module (uses `inputtext` tokens, ported); (e) out of scope by decision: `editor` (DECISION-B), tree family (DECISION-D), `datatable` (Table Plan), `virtualscroller`; (f) the `@ultimate/themes` bundle grew from 5.23 KB to about 13.1 KB gzip, failing `size:validate` until the branch's two-step baseline update (see the Theming Plan).
- **Reconciled remaining scope (2026-10-01, documentation correction; method and per-component lists in `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §5):** a component re-themes only when its structural CSS calls `dt('<key>.…')` (directly or via an imported `@ultimate/uix-styles` module) **and** the name it registers its styles under equals the preset key exactly — `Theme.getComponent(name)` looks up `preset.components[name]` with no normalization (`packages/uix-styled/src/utils/themeUtils.ts:248`, via `registerThemeVariables`). Measured against the 76 registered modules and the 88 component modules of `@primeuix/themes` 2.0.3 (the normative baseline, ADR-048):
  - **Already covered (resolves today), Angular and Vue:** autocomplete, button, checkbox, dialog, listbox, menu, password, rating, select, slider, textarea, tooltip.
  - **Key mismatch** (CSS already token-based, module registered, but the registered name is hyphenated): Angular and Vue cascade-select, color-picker, date-picker, file-upload, float-label, icon-field, ifta-label, input-number, input-otp, input-text, multi-select, radio-button, select-button, toggle-button, toggle-switch; Vue also input-chips. These components' token references currently resolve to nothing.
  - **Missing module, CSS already token-based:** `badge`, `inputgroup`, `paginator` (Angular and Vue). Also `datatable` (Table) and `virtualscroller` (Scroller), both out of scope by earlier decision.
  - **Hand-written CSS, module registered but unused:** 46 Angular and 48 Vue components (e.g. accordion, card, tabs, timeline); wiring these is a style-file rewrite per component.
  - **Module not ported, no Ultimate consumer yet:** `tabview`/`tabmenu` (React `UTabView`/`UTabMenu` only), `ripple` (inclusion undecided).
  - **React:** no component consumes tokens — React style files are hand-written static CSS (the accepted `ROADMAP.md` footnote exception); React consumption is outside this GAP unless that exception is revisited.
- **Expected state:** Per-component Aura preset modules for the ~83 components built since Phase 5's original 5-component proof set, enabling theme-level customization for them via the same `dt()`-based mechanism the original 5 already use.
- **Why it matters:** The original 5-component scope boundary (Phase 5 Spec §108/§203/§245) was fully, explicitly disclosed at the time it was written — but it was never revisited or re-affirmed as Phase C's real component count grew roughly 15x beyond that original proof set. This gap registers that unrevisited extension, not the original (still-valid) boundary.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from Material/Lara/Nora catalog breadth** (a separately DEFERRED decision, not a registered GAP; corrected 2026-10-01 — this line previously named GAP-065, which is the Angular SSR gap) — kept explicitly separate per the human decision's own instruction; these are two genuinely distinct capabilities (per-component token depth within Aura vs. catalog-family breadth).
- **Framework scope:** Angular, React, Vue (shared, framework-neutral `@ultimate/themes` package).
- **Existing reusable infrastructure:** The original 5-component proof set's own `dt()`-based pattern is the direct template for each new per-component preset module.
- **Recommended resolution direction:** Directional only — a dedicated Spec is needed to scope exact component sequencing/coverage; this is a substantial body of work (~83 components), not a simple mechanical extension.
- **Source/evidence:** Aura token-completeness residual verification (`aura-token-verification.md`); Final Decision Ledger / Final Scope Ledger (Aura per-component preset coverage — INCLUDE).
- **Architectural decision required:** No.

#### GAP-065 — Post-Track-E: 10 Angular components have unguarded `window`/`document` access, unsafe under SSR

- **Status:** RESOLVED (2026-10-01, SSR Plan — all 10 confirmed: 2 fixed `38560be`, 8 verified safe `72a8afa`..`16690f1`; see Outcome. Scroller, outside this scope, is GAP-080)
- **Type:** Component, Framework (Angular), Architecture
- **Blocking level:** HIGH
- **Current evidence:** `ScrollPanel`'s `ngAfterViewInit` and `ContextMenu`'s `ngOnInit` are **confirmed, fully lifecycle-traced** to unconditionally call `window`/`document` APIs with zero `isPlatformBrowser` guard — both hooks genuinely execute during Angular Universal SSR (Angular's own `ngOnInit`/`ngAfterViewInit` genuinely run server-side, by Angular's own design), meaning a real server-render crash (`ReferenceError`) would occur, confirmed during the Post-Track-E SSR residual verification. 8 further files (`Breadcrumb`, `ColorPicker`, `ConfirmPopup`, `Knob`, `Popover`, `Slider`, `Splitter`, `StyleClass`) share the identical missing-guard pattern but were **not** each individually lifecycle-traced to their own exact triggering hook in the verification pass. Track E's own Plan (`docs/superpowers/plans/2026-09-11-phase-10-track-e-ssr-hydration-implementation.md`, lines 12/570) explicitly, fixedly scoped SSR verification to an 8-component proof set (Button/Checkbox/Dialog/Menu/Paginator/Scroller/Table/Tooltip) — never widened to cover these 10 components, confirmed via direct Plan-text read.
- **Outcome (2026-10-01, SSR Plan `3dbf819`..`16690f1`; marked RESOLVED at the branch closeout 2026-10-01):** all 10 now confirmed. `ScrollPanel` and `ContextMenu` were fixed with the `isPlatformBrowser(this.platformId)` guard (`38560be`; `scroll-panel.ts:121`, `context-menu.ts:124`; `ContextMenu`'s `global` still registers client-side). The other 8 were lifecycle-traced (the Plan's evidence table, re-checked at HEAD) and found to reach `window`/`document` only from user-event or imperative paths, never from server-executed hooks or teardown, so per the Plan's Global Constraints they received verification tests, not guards (one test-only commit each, `72a8afa`..`16690f1`). All tests are spy-based under a server `PLATFORM_ID` (Spec §12): they assert zero browser-global calls through mount, change detection and destroy; the two fixes' tests were shown failing before the fix, and mutation checks confirm the verification tests fail if a server-reachable global call is added. Related but separate: SSR style injection (GAP-078); Scroller's unguarded `ResizeObserver` (a Track E proof-set component outside this scope) is GAP-080.
- **Expected state:** The already-proven `isPlatformBrowser(this.platformId)` guard pattern (already used correctly by the proof-set's own `Tooltip`, via `UBaseComponent`'s existing `inject(PLATFORM_ID)`) applied to all 10 components. **(Superseded 2026-10-01 by the Outcome above and Spec §12: guards on the 2 confirmed defects; verification tests on the 8 that the tracing found safe.)**
- **Why it matters:** This is a real, undisclosed SSR-crash defect for `ScrollPanel`/`ContextMenu` (fully confirmed), with 8 further components sharing the identical pattern but needing individual confirmation before the same fix can be applied with equal confidence.
- **What it blocks:** Nothing further downstream, but the 8 unconfirmed components must not be treated as equally certain to `ScrollPanel`/`ContextMenu` until traced.
- **Dependencies:** **Explicitly separate from React/Vue's own equivalent-risk-class finding** (Parity Confirmed — see the Final Scope Ledger's own separate entry) — React's `useEffect` and Vue's `mounted()` are both, by each framework's own SSR architecture, client-only execution contexts that never fire during server rendering, directly traced for representative components, not inferred from Angular's finding. Angular SSR and React/Vue SSR are kept as separate rows per explicit instruction.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** `UBaseComponent`'s existing `inject(PLATFORM_ID)` plus `isPlatformBrowser` from `@angular/common`, already proven via `Tooltip`.
- **Recommended resolution direction:** Directional only — apply the already-proven guard pattern to `ScrollPanel` and `ContextMenu` immediately once implementation is authorized; **complete individual lifecycle-tracing for the remaining 8 files as a prerequisite step within the same future plan**, per the human decision's own explicit condition, before applying the fix to them with the same confidence.
- **Source/evidence:** Post-Track-E SSR residual verification (`ssr-post-track-e-verification.md`); `docs/superpowers/plans/2026-09-11-phase-10-track-e-ssr-hydration-implementation.md` lines 12/570; Final Decision Ledger / Final Scope Ledger (Post-Track-E Angular SSR safety — INCLUDE; React/Vue SSR — Parity Confirmed, kept as a separate row).
- **Architectural decision required:** No.

#### GAP-066 — Angular `UTooltip` has the same visibility defect GAP-039 fixed for Vue, but was never itself registered or fixed

- **Status:** RESOLVED (2026-10-01, Existing Commitments Plan — `1f1e505`; Tooltip/Dialog screenshot baselines still to be regenerated in the Linux container before merge, see the branch closeout record)
- **Type:** Component, Framework (Angular), Accessibility
- **Blocking level:** MEDIUM
- **Current evidence:** GAP-039's own resolved entry (§3, Cross-cutting: Overlay/Interaction) explicitly discloses this: *"Angular's `UTooltip` has the same effective visibility defect, confirmed by its own existing e2e test... This was not fixed as part of GAP-039's resolution — GAP-039 was scoped to Vue only... Angular's gap remains a separately disclosed, not-yet-registered fact; it is not tracked by this entry."* Angular's own existing Playwright assertion (`packages/ng/e2e/tooltip.spec.ts`, `expect(computedDisplay).toBe("none")`) already proves the defect in a real browser. The confirmed, already-proven fix mechanism (adding the companion inline `display` style GAP-039 added to Vue's `showTooltip()`) is directly applicable, since Angular imports the identical shared `uix-styles/tooltip` base CSS.
- **Expected state:** Angular's `UTooltip` gains the same one-line inline-`display`-style fix GAP-039 already applied to Vue, and its existing e2e assertion is converted from asserting the known failure to asserting correct visibility, mirroring GAP-039's own Vue fix exactly.
- **Why it matters:** This is a real, already-proven-in-browser defect with an already-proven fix mechanism sitting one component away — the lowest-risk item in this entire GAP set, but genuinely unregistered until now, per GAP-039's own explicit disclosure.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Not a duplicate of GAP-039 — GAP-039 explicitly, textually excludes Angular from its own resolved scope.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** GAP-039's own approved Spec/Plan/fix (commit history: `b8042a9`, `95b6139`, `897cc17`, `26feee7`, `2cae72b`) is the direct, already-proven template — the identical inline-style fix, applied to `packages/ng/src/tooltip/tooltip.ts` in place of `packages/vue/src/tooltip/tooltip.ts`.
- **Recommended resolution direction:** Directional only — apply GAP-039's own already-proven fix mechanism to Angular's `showTooltip()`-equivalent, and convert `packages/ng/e2e/tooltip.spec.ts`'s existing assertion the same way GAP-039 converted Vue's.
- **Source/evidence:** GAP-039 (this document, §3, Cross-cutting: Overlay/Interaction) — its own text discloses and disclaims tracking this; `packages/ng/e2e/tooltip.spec.ts`; Final Decision Ledger / Final Scope Ledger (Angular Tooltip visibility — COMPLETE EXISTING COMMITMENT).
- **Architectural decision required:** No — this is a behavioral bug with an already-proven fix, not a fork, exactly matching GAP-039's own reasoning.

#### GAP-067 — Angular `UMenu` popup mode is inert; `USplitButton` hand-rolls its own overlay instead of using it

- **Status:** RESOLVED (2026-10-01, Existing Commitments Plan — `a314711`, `9ee1f91`, `1814c34`; consumer-facing changes in MIGRATION.md §8; Menu screenshot baselines still to be regenerated)
- **Type:** Component, Framework (Angular), Architecture
- **Blocking level:** MEDIUM
- **Current evidence:** `UMenu`'s own doc comment (`packages/ng/src/menu/menu.ts:38-44`) explicitly discloses: *"`popup` is accepted as an input per the Interfaces section, but this task's file list has no popup-overlay component to render into, so it is currently inert beyond flagging the `u-menu-overlay` style-class variant... A future task can extend this component's input/output surface for the popup overlay, submenu nesting, and the additional key handlers."* This was named as expected future work at the time `UMenu` shipped, not discovered fresh by the Prime-vs-Ultimate parity audit. `USplitButton` currently implements its own hand-rolled overlay state as a workaround rather than delegating to `UMenu`'s popup mode, confirmed during the Findings Decision/Scope Triage. React's and Vue's own `UMenu`/`USplitButton` equivalents already have working popup mechanisms (Portal+escape-registry+z-index), confirmed as the direct cross-framework template.
- **Expected state:** `UMenu`'s popup-overlay mechanism built out (input/output surface extended per its own doc comment's named scope), after which `USplitButton` can be simplified to delegate to it, matching React/Vue's own already-working shape.
- **Why it matters:** This is a real, previously-named (not undisclosed) piece of unfinished work — `UMenu`'s own doc comment named the deferral at the time it shipped — that `USplitButton` currently works around with duplicated, hand-rolled overlay logic instead of a shared mechanism.
- **What it blocks:** Nothing further downstream; `USplitButton`'s current workaround is functional, just duplicated.
- **Dependencies:** None upstream. `USplitButton`'s own simplification is downstream of this gap's resolution, not a separate blocking dependency.
- **Framework scope:** Angular only. React's and Vue's own equivalents already have working popup mechanisms and are unaffected.
- **Existing reusable infrastructure:** React's and Vue's own working Portal+escape-registry+z-index popup mechanisms are the direct cross-framework template for what Angular's `UMenu` needs to build out.
- **Recommended resolution direction:** Directional only, per GAP-stage rules — build out `UMenu`'s popup-overlay mechanism using the React/Vue pattern as the template, then simplify `USplitButton` to delegate to it. Exact task breakdown belongs to this gap's own future Plan, not designed here.
- **Source/evidence:** `packages/ng/src/menu/menu.ts:38-44` (UMenu's own disclosing doc comment); `packages/ng/src/split-button/` (USplitButton's current hand-rolled overlay workaround); Findings Decision/Scope Triage (`pass1-decision-triage.md`, lines 42/56); Final Decision Ledger / Final Scope Ledger (Angular UMenu popup + SplitButton workaround — COMPLETE EXISTING COMMITMENT); pre-Spec tracking reconciliation (this session) confirming no prior GAP/ADR tracked this finding.
- **Architectural decision required:** No — this is scoped, already-named implementation work, not an architectural fork.

#### GAP-068 — React/Vue tsup per-component subpath exports are broken for components beyond the original proof set

- **Status:** RESOLVED (2026-10-01, Existing Commitments Plan — `8647317` Vue, `5ba681e` React; Vue's declarations remain unresolvable, GAP-079)
- **Type:** Packaging, Framework (React, Vue)
- **Blocking level:** MEDIUM
- **Current evidence:** `tsup.config.ts`'s `entry` map is stale relative to the components actually shipped since it was last updated — confirmed empirically via a real build during the Overlay Findings Triage: the main package barrel (`@ultimate/{react,vue}`) is fully unaffected, since esbuild bundles everything transitively through the barrel regardless of the `entry` map's own contents; only the per-component subpath exports (`@ultimate/{react,vue}/<component>`) fail for components added after the map was last updated. One shared root cause (`tsup.config.ts`'s own `entry` map), two framework-local instances (React and Vue each maintain their own stale map).
- **Expected state:** `tsup.config.ts`'s `entry` map extended in both packages to cover every currently-shipped component, restoring working per-component subpath exports for all of them, matching each framework's own already-correct convention for its original proof-set components.
- **Why it matters:** This is a real, silent packaging regression — consumers importing a newer component via its own subpath (rather than the main barrel) currently get a broken import, with no build-time signal, since the main barrel's own successful build masks the subpath-specific failure.
- **What it blocks:** Nothing further downstream; the main barrel import path remains fully functional as a workaround in the interim.
- **Dependencies:** None. The React and Vue instances share one root cause but can be fixed independently per framework.
- **Framework scope:** React, Vue. Angular is unaffected — its own per-component export mechanism (`ng-packagr` secondary entry points, GAP-009/GAP-023) is a structurally different, separately-tracked mechanism, not the same defect.
- **Existing reusable infrastructure:** Each framework's own already-correct `entry` map for its original proof-set components is the direct template — this is a mechanical extension of an existing, working pattern, not new tooling.
- **Recommended resolution direction:** Directional only, per GAP-stage rules — extend `tsup.config.ts`'s `entry` map in both packages to cover every currently-shipped component. Exact task breakdown belongs to this gap's own future Plan, not designed here.
- **Source/evidence:** `packages/react/tsup.config.ts`; `packages/vue/tsup.config.ts`; Overlay Findings Triage (`overlay-findings-triage.md` — real-build verification distinguishing barrel-level success from subpath-level failure); Final Decision Ledger / Final Scope Ledger (React/Vue tsup per-component subpath artifacts — COMPLETE EXISTING COMMITMENT); pre-Spec tracking reconciliation (this session) confirming no prior GAP/ADR tracked this finding.
- **Architectural decision required:** No — this is a mechanical extension of an already-working, already-correct pattern, not an architectural fork.

#### GAP-069 — Angular Dock lacks `routerLink` integration

- **Status:** RESOLVED (2026-10-01, Navigation Plan — `2ce8d59`)
- **Type:** Component, Framework (Angular)
- **Blocking level:** LOW
- **Current evidence:** Real PrimeNG Dock has router integration; Angular's Dock lacks it, internally inconsistent with Angular's own Menu/Breadcrumb/TieredMenu/MegaMenu/Steps, which all already expose a `routerLink` binding (Steps' own version tracked separately by GAP-053; Breadcrumb's binding has a known href/`RouterLink` conflict, tracked separately as GAP-073). Confirmed during Navigation Batch 3 triage; independently re-confirmed as its own distinct, unregistered finding during the Prime parity audit's Spec-stage Scope Reconciliation (this session), which found no existing GAP covered it — GAP-055 as committed covers Dock keyboard navigation only, with no `routerLink` content anywhere in its body.
- **Expected state:** Dock accepts a `routerLink`-equivalent per-item navigation binding, with the `RouterLink` directive present only on enabled items with a `routerLink` (structural `@if`/`@else` branch, as shipped for Steps under GAP-053). **(Corrected 2026-09-30:** this entry originally called the Breadcrumb/Menu/Steps pattern "already-working". Breadcrumb's co-located `[attr.href]`+`[routerLink]` binding has a latent href-clobbering defect, tracked separately as GAP-073, not part of GAP-069.)
- **Why it matters:** Internal cross-component inconsistency within Angular's own Navigation family — Breadcrumb/Menu/TieredMenu/MegaMenu/Steps all have router integration; Dock does not, despite having a real upstream equivalent.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. **Independent from GAP-055** — GAP-055 remains strictly Dock keyboard navigation, not broadened by this entry.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** Steps' own shipped structural-branch `routerLink` pattern (GAP-053) is the direct template, not Breadcrumb's co-located binding (see GAP-073).
- **Recommended resolution direction:** Directional only — apply Steps' structural-branch `routerLink` pattern to Dock. (Implemented during the Navigation Plan, commit `2ce8d59`; RESOLVED 2026-10-01.)
- **Source/evidence:** Navigation Findings Triage (`navigation-findings-triage.md`); Final Decision Ledger / Final Scope Ledger (Angular Dock routerLink — INCLUDE); `docs/superpowers/specs/2026-09-26-prime-parity-navigation-design.md` §12 (original disclosure of this then-unregistered finding); Scope Reconciliation Report (this session, confirming no prior GAP covered it).
- **Architectural decision required:** No.

#### GAP-070 — Angular per-component `ng-packagr` secondary entry points not extended to components shipped after the original proof set

- **Status:** RESOLVED (2026-10-01, Existing Commitments Plan — prerequisites `4a47883`, `29a3390`; `8a46cc4`: 61 new entry points, 70 subpaths, 11 unbuildable subpaths removed; 14 components barrel-only per Spec §5.4; duplicate-class hazard is GAP-081)
- **Type:** Packaging, Framework (Angular)
- **Blocking level:** MEDIUM
- **Current evidence:** GAP-009's own RESOLVED scope covers only the original proof-set components (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple`, `input-number` — 9 components as of the Angular Form Foundation workstream's own addition), with `button`/`dialog`/`menu`/`table`/`input-text` permanently excluded by a confirmed `ng-packagr@21.2.7`/`@angular/compiler-cli@21.2.22` `ShimReferenceTagger` defect (triggered when one secondary entry point's own compilation unit directly imports another secondary entry point's root class). GAP-009's own text makes no claim about any Angular component built after that workstream — the ~90+ components shipped since (Phase C batches and later) have never been evaluated against this same convention. Confirmed via direct GAP-009 text re-read during the Prime parity audit's Spec-stage Scope Reconciliation (this session) that no existing GAP tracks this extension.
- **Characterization (2026-10-01, Existing Commitments Plan Task 6; evidence `docs/architecture/research/2026-10-01-gap-070-ng-secondary-entry-characterization.md`):** after the build prerequisites (TS2729 `4a47883`, `@angular/cdk` peer `29a3390`), real ng-packagr builds of all 75 candidates found 61 that build as their own secondary entry point and 14 that fail with the same crash. **Corrected trigger** (refines GAP-009's wording, which is left unchanged per the Plan): ng-packagr sets each secondary entry's `rootDir` to the entry file's own directory, so any source file outside that component's `src/` directory reached by the entry's compilation fails (TS6059); when that file is an Angular component, the diagnostic surfaces as the `ShimReferenceTagger` `referencedFiles` crash, whether or not the imported component is itself an entry point. In practice, a component with any relative import into another component directory cannot be its own entry point. **CI:** `scripts/provenance/pack-install-integrity.mjs` (CI "Pack/install integrity (affected)") fails for `@ultimate/ng` at `a869ad5` on 144 missing export paths (72 advertised subpaths never built). **User decisions (2026-10-01):** add entry points for the 61, and remove the 11 advertised subpaths that can never build (`textarea`, `select-button`, `file-upload`, `split-button`, `drawer`, `confirm-dialog`, `confirm-popup`, `dynamic-dialog`, `overlay-badge`, `panel`, `scroll-top`; still importable from the `@ultimate/ng` barrel), so every advertised subpath is built and the integrity check can pass. The duplicate-class hazard between the barrel and subpaths is GAP-081.
- **Expected state:** Every Angular component shipped after the original proof set is first characterized against the same confirmed `ShimReferenceTagger` trigger condition GAP-009 already established (does the component's own compilation unit directly import another secondary entry point's root class?); components that do **not** hit that trigger receive a real `ng-packagr` secondary entry point, matching the existing convention; components that **do** hit the trigger are excluded on the same already-established basis as `button`/`dialog`/`menu`/`table`/`input-text`, not treated as a new, separate defect.
- **Why it matters:** Angular currently has real per-component packaging parity with React/Vue for only its own original 9-component proof set; every newer component ships via the main barrel only, an unevaluated (not necessarily incorrect, but unconfirmed) state.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None upstream from any other GAP. **Internal prerequisite:** the characterization step (does each newer component hit the `ShimReferenceTagger` trigger?) must complete before that specific component's own secondary-entry-point addition — do not assume every newer component requires one before checking.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** GAP-009's own already-established trigger-condition characterization method and its own existing `ng-package.json`-per-component convention are the direct template for both the characterization step and the eventual fix.
- **Recommended resolution direction:** Directional only — characterize each newer component against the existing trigger condition first; add secondary entry points only to those that pass; leave those that fail excluded, following GAP-009's own existing precedent and reasoning, not a new investigation.
- **Source/evidence:** GAP-009 (this document, §3, Foundation/architecture — referenced as existing authoritative context, not modified); Final Decision Ledger / Final Scope Ledger (Angular ng-packagr/export/build mechanism — COMPLETE EXISTING COMMITMENT); `docs/superpowers/specs/2026-09-26-prime-parity-existing-commitments-design.md` §1 (original disclosure of this then-unregistered extension); Scope Reconciliation Report (this session, confirming no prior GAP covered it).
- **Architectural decision required:** No — this is a mechanical characterization-then-extension of an already-established, already-understood defect boundary, not a new architectural question.

**Note on GC-D1's own template-shape scope:** GAP-041's exact column-template API shape is intentionally left undesigned here, deferred to its own future Spec, per the GAP-stage's own explicit constraint. (Superseded: the Table Spec/Plan designed and delivered it; GAP-041 RESOLVED 2026-10-01.)

#### GAP-071 — Angular Tabs never performs initial or resize-triggered overflow detection

- **Status:** RESOLVED (2026-10-03, F1 — `f0d446a`; navigator state computed on view init and kept current by a browser-only `ResizeObserver`; `tab-list.ts` comment corrected)
- **Type:** Component, Framework (Angular)
- **Blocking level:** LOW
- **Current evidence:** Discovered during GAP-057's own Implementation-stage re-verification (2026-09-30), not part of GAP-057's original scope. `packages/ng/src/tabs/tab-list.ts`'s `updateButtonState()` (the method that decides whether the prev/next navigator buttons render, via `isPrevButtonEnabled()`/`isNextButtonEnabled()` signals gating `@if (showNavigators() && ...)` in the template) is called **only** from the component's own `onScroll` handler — there is no `ngAfterViewInit`/`afterNextRender` call and no `ResizeObserver` anywhere in the file. Both enabled-state signals initialize to `false`. Consequence: when `UTabs` first renders with overflowing tab labels, **neither navigator button appears** — a button only shows up after the user has already scrolled the strip by some other means (trackpad/shift-wheel; the CSS sets `overflow-x: auto`). This does not match real PrimeNG 21.1.9's own `Tabs`/`TabList`, which calls `updateButtonState()` from `onAfterViewInit` and binds a real `ResizeObserver` (`packages/primeng/src/tabs/tablist.ts`, confirmed during the same re-verification) — nor does it match Ultimate's own doc comment in `tab-list.ts:10-11`, which claims the component "Reads `scrollable`" (a separate, distinct documentation defect — see the note below, not folded into this GAP).
- **Expected state:** `UTabList`'s navigator-button visibility is correctly computed at least once when the component first renders with content already present (matching real PrimeNG's own `onAfterViewInit` call), so an overflowing tab strip shows its navigator(s) immediately, not only after a manual scroll. Whether resize-reactivity (a real `ResizeObserver`, matching real PrimeNG) is added is a separate implementation-scope question for whichever Plan picks this GAP up — not decided here.
- **Why it matters:** This is a real, user-visible defect independent of any Prime-parity audit finding: a tab strip that overflows on first render is currently unusable via its own navigator buttons until the user discovers an unrelated manual-scroll gesture.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from GAP-057/GAP-058/GAP-072** — discovered incidentally during GAP-057's own React-only implementation work, but is its own separate Angular-only defect, not a prerequisite for or extension of any of those three.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** Real PrimeNG 21.1.9's own `onAfterViewInit`/`ResizeObserver` pattern (`packages/primeng/src/tabs/tablist.ts`) is the direct upstream template, if resize-reactivity is included in whatever Plan resolves this.
- **Recommended resolution direction:** Directional only — at minimum, call the existing `updateButtonState()` method once during Angular's own view-init lifecycle (not just on scroll); investigate whether to also add `ResizeObserver` parity with real PrimeNG as part of the same fix, or defer that separately.
- **Source/evidence:** GAP-057's own Implementation-stage re-verification (2026-09-30) — direct source inspection of `packages/ng/src/tabs/{tabs,tab-list}.ts` and real PrimeNG 21.1.9 (`.vendor-cache/primeng-21.1.9.tar.gz`, `packages/primeng/src/tabs/tablist.ts`); confirmed zero existing test coverage for this behavior in `packages/ng/src/tabs/tabs.spec.ts`.
- **Architectural decision required:** No — user-authorized (2026-09-30) as its own tracked GAP, not folded into GAP-057.
- **Note (separate documentation defect, not part of this GAP):** `packages/ng/src/tabs/tab-list.ts:10-11`'s own doc comment claims the component "Reads `scrollable`," but `UTabs` has no `scrollable` input at all anywhere in its actual source. This is a pre-existing documentation-only defect, independently discovered during the same re-verification. Per explicit user instruction, it is **not** folded into GAP-071 or GAP-072 without a separate scope-reconciliation step confirming it belongs to one of them — it remains unregistered and untracked as its own item pending that reconciliation. **Reconciled 2026-10-01 (user decision, no new GAP):** folded into GAP-071 as a minor cleanup — correct the comment when `tab-list.ts` is changed for this GAP. Adding a `scrollable` input (PrimeNG 21.1.9 has one, `tabs.ts:52`) is not part of GAP-071.

#### GAP-072 — Vue Tabs never re-evaluates overflow on resize (initial mount check only)

- **Status:** RESOLVED (2026-10-03, F1 — `a7fd362`; `updated()`, `ResizeObserver`, `showNavigators` watcher, disconnect before rebind; the unused `scrollable` prop remains a cleanup note)
- **Type:** Component, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** Discovered during GAP-057's own Implementation-stage re-verification (2026-09-30), not part of GAP-057's original scope. `packages/vue/src/tabs/TabList.vue`'s `updateButtonState()` is called from `mounted()` (so it does correctly compute navigator visibility once, when the component first renders with content already present) and from the component's own `scroll` handler — but there is no `updated()` hook and no `ResizeObserver` anywhere in the file. Consequence: a Vue Tabs instance that starts non-overflowing but later overflows (window resize, container resize, dynamic tab addition) never re-shows a navigator button until the user manually scrolls the strip by some other means. This partially, not fully, matches real PrimeVue 4.5.5's own `TabList.vue`, which calls `updateButtonState()` from `mounted()`, `updated()`, `scroll`, **and** a real `ResizeObserver` (`packages/primevue/src/tablist/TabList.vue`, confirmed during the same re-verification) — Ultimate Vue has only the first and third of those four triggers.
- **Expected state:** `TabList.vue`'s navigator-button visibility is re-evaluated when the tab list's own content changes size after initial mount (at minimum on Vue's own `updated()` lifecycle hook; whether a real `ResizeObserver` is added for full real-PrimeVue parity is a separate implementation-scope question for whichever Plan picks this GAP up — not decided here).
- **Why it matters:** A real, user-visible defect independent of any Prime-parity audit finding: a Vue Tabs instance whose overflow state changes after mount (the common real-world case — window resize, responsive layouts, dynamically added tabs) currently has no way to regain correct navigator visibility without an unrelated manual-scroll gesture.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** **Independent from GAP-057/GAP-058/GAP-071** — discovered incidentally during GAP-057's own React-only implementation work, but is its own separate Vue-only defect, not a prerequisite for or extension of any of those three.
- **Framework scope:** Vue only.
- **Existing reusable infrastructure:** Real PrimeVue 4.5.5's own `mounted()`/`updated()`/`scroll`/`ResizeObserver` pattern (`packages/primevue/src/tablist/TabList.vue`) is the direct upstream template, if full resize-reactivity is included in whatever Plan resolves this.
- **Recommended resolution direction:** Directional only — at minimum, add an `updated()` hook calling the existing `updateButtonState()` method; investigate whether to also add `ResizeObserver` parity with real PrimeVue as part of the same fix, or defer that separately.
- **Source/evidence:** GAP-057's own Implementation-stage re-verification (2026-09-30) — direct source inspection of `packages/vue/src/tabs/{TabList.vue,BaseTabs.ts}` and real PrimeVue 4.5.5 (`.vendor-cache/`, `packages/primevue/src/tablist/TabList.vue`); confirmed zero existing test coverage for this behavior in `packages/vue/src/tabs/tabs.spec.ts`. Also confirmed: `BaseTabs.ts` declares a `scrollable` prop (default `false`) that is never actually read anywhere in `TabList.vue`'s own logic — a related but distinct dead-prop observation, noted here for completeness but not itself the subject of this GAP (which is about resize-reactivity, not the unused prop). **Reconciled 2026-10-01 (user decision, no new GAP):** recorded as a minor cleanup note only, outside GAP-072's acceptance; PrimeVue 4.5.5's `TabList.vue` itself reads `scrollable` only into its pass-through context (`:201`).
- **Architectural decision required:** No — user-authorized (2026-09-30) as its own tracked GAP, not folded into GAP-057.

#### GAP-073 — Angular Breadcrumb's `url`/`#` href fallback is overwritten by the `RouterLink` directive

- **Status:** RESOLVED (2026-10-03, F1 — `90602d3`; structural `@if`/`@else` anchor split for home and model items)
- **Type:** Component, Framework (Angular)
- **Blocking level:** LOW
- **Current evidence:** Discovered during the Navigation Plan's GAP-053 implementation (2026-09-30) and confirmed in its reviews; registered on user instruction after the Navigation Plan final review. Not part of GAP-053 or GAP-069. `packages/ng/src/breadcrumb/breadcrumb.ts` co-locates `[attr.href]="…routerLink ? null : (…url ?? '#')"` and `[routerLink]="…disabled ? null : (…routerLink ?? null)"` on the same `<a>`, for both the home item (lines 48-49) and each model item (lines 73-74). Angular's `RouterLink` directive is structurally present on every such anchor, even when bound to `null`, and its own host binding (`[attr.href]: reactiveHref()`) overwrites the template's `[attr.href]`. Consequence: items without a `routerLink` (or disabled items) do not get their intended `url`/`#` href fallback. `packages/ng/src/breadcrumb/breadcrumb.spec.ts` has no `href` assertions, so the defect is untested. The same defect was found and fixed in Steps (GAP-053, commit `9dd5a33`) and avoided from the start in Dock (GAP-069, commit `2ce8d59`), both via an `@if`/`@else` structural branch.
- **Expected state:** Breadcrumb anchors without an active `routerLink` render their `url` (or `#`) href, and `RouterLink` is present only on anchors that should route.
- **Why it matters:** Breadcrumb links configured with `url` instead of `routerLink` do not produce the intended href.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Independent from GAP-053 and GAP-069.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** The structural-branch pattern shipped in `packages/ng/src/steps/steps.ts` and `packages/ng/src/dock/dock.ts`.
- **Recommended resolution direction:** Directional only — apply the same structural-branch pattern to Breadcrumb's home and model item anchors, with `href`-asserting regression tests. Scope is limited to the href/`RouterLink` co-location defect; Breadcrumb's other behavior (including `aria-current` matching) is out of scope.
- **Source/evidence:** Navigation Plan Task 4 (GAP-053) implementation and review findings; Navigation Plan final review (2026-09-30); direct source inspection of `breadcrumb.ts` and Angular router 21.2.22's `RouterLink` host binding.
- **Architectural decision required:** No — user-authorized (2026-09-30) as a separate GAP, not fixed as part of GAP-053 or GAP-069.

#### GAP-074 — `hidden-accessible` classes are used but never styled (Angular, React, Vue)

- **Status:** RESOLVED (2026-10-03, approved-designs phase — `63b7a6a`, `7572867`, `3126b70`; shared `u-hidden-accessible` rule in `@ultimate/uix-styled` registered once per sheet by each core; Angular/Vue Rating and Vue Password use it; real-browser `getByRole("radio")` check in Chromium, Firefox, WebKit)
- **Type:** Accessibility, Styling, Framework (Angular, React, Vue)
- **Blocking level:** LOW
- **Current evidence:** Discovered during the Form/Accessibility Plan's GAP-061 task (2026-09-30); registered on user instruction. Several components mark content as visually hidden with a `p-hidden-accessible` or `u-hidden-accessible` class, but no stylesheet, style module or theme in the source packages defines either class (only built `storybook-static` output contains a `clip` rule). Real Prime relies on its shared base CSS (`.p-hidden-accessible`) for this. Usages: `packages/vue/src/rating/Rating.vue:9` and `packages/ng/src/rating/rating.ts:45` (`p-hidden-accessible` wrapping each star's radio input); `packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx:93` (`u-hidden-accessible` `aria-live` label text); `packages/vue-core/src/focus-trap/focus-trap.ts:33` and `packages/react-core/src/focus-trap/focus-trap.tsx:65,75` (`u-hidden-accessible` empty focus sentinels). Consequence: content meant for assistive technology only (radio inputs, live label text) can render visibly unless the consuming app supplies CSS for these classes.
- **Expected state:** Every element marked hidden-accessible is visually hidden but still available to assistive technology, in all three frameworks.
- **Why it matters:** Visible stray inputs or duplicate label text in Rating/TriStateCheckbox; the hidden-accessible contract is silently broken.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Not part of GAP-061: Vue Password's new live span is hidden by a Password-scoped rule (user decision 2026-09-30).
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** None — no shared base stylesheet currently defines utility classes.
- **Recommended resolution direction:** Directional only — decide whether to define one shared hidden-accessible utility (and normalise the `p-`/`u-` prefixes) or scope a rule per component; add visual-hiding assertions. Exact approach belongs to this gap's own Spec.
- **Source/evidence:** Form/Accessibility Plan Task 6 stop report (`task-6-report.md`, 2026-09-30) and controller re-verification (repo-wide search of source packages).
- **Architectural decision required:** Possibly — whether a shared utility-class layer is introduced. **Decided 2026-10-02 (user):** one shared `u-hidden-accessible` utility registered through `@ultimate/uix-styled`; scope in `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §7. Not in the next implementation phase.

#### GAP-075 — React `UToggleButton` toggles twice on Space in real browsers

- **Status:** RESOLVED (2026-10-03, F2 — `f52e842`; Space toggles then `preventDefault()`, matching PrimeReact 10.9.9; real-browser state-per-press tests in Chromium, Firefox, WebKit)
- **Type:** Component, Accessibility, Framework (React)
- **Blocking level:** MEDIUM
- **Current evidence:** Found by the Form/Accessibility Plan's Task 2 (GAP-059) review (2026-09-30); pre-existing since `13d92bb` (Phase C Batch 1); registered on user instruction. `packages/react/src/toggle-button/toggle-button.tsx:71-75` (as of `f2b8d41`) calls `toggle()` on a Space/Enter `keydown` but never calls `preventDefault()`. The element is a native `<input type="checkbox">`, so in a real browser Space also fires `click`/`change` on keyup, and the input's `onChange={toggle}` runs a second time — by then the parent has re-rendered, so the second call reverses the first. Real PrimeReact 10.9.9 `ToggleButton.js:47-50` toggles on Space and calls `event.preventDefault()`, suppressing the native toggle. Effect: in `USelectButton` single mode with `allowEmpty`, Space selects an option and immediately deselects it; standalone `UToggleButton` flips twice. jsdom does not simulate the keyup click, so the existing unit tests (including GAP-059's "Space selects exactly once") cannot detect it.
- **Expected state:** Space toggles `UToggleButton` exactly once in real browsers, matching PrimeReact, with a browser-level (e.g. Playwright) regression check.
- **Why it matters:** Keyboard activation of ToggleButton and SelectButton is unreliable, undermining GAP-059's keyboard support.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Not part of GAP-059.
- **Framework scope:** React only (Angular/Vue not examined as part of this finding).
- **Existing reusable infrastructure:** PrimeReact's own Space handling as the reference.
- **Recommended resolution direction:** Directional only — prevent the native Space activation when toggling on keydown (or rely solely on the native change path), and add a real-browser test.
- **Source/evidence:** Form/Accessibility Plan Task 2 review (2026-09-30); controller verification of PrimeReact `ToggleButton.js:47-50` and `git log` for `13d92bb`.
- **Architectural decision required:** No.

#### GAP-076 — Vue Password has no `ariaLabelledby` prop

- **Status:** RESOLVED (2026-10-03, F2 — `c786c15`; Vue only, per decision)
- **Type:** Component, Accessibility, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** Found by the Form/Accessibility Plan's Task 6 (GAP-061) review (2026-09-30); pre-existing; registered on user instruction. Real PrimeVue 4.5.5 binds `:aria-labelledby="ariaLabelledby"` on the Password input (`packages/primevue/src/password/Password.vue:11`). Ultimate's `packages/vue/src/password/BasePassword.ts` declares `inputId` and `ariaLabel` (`:38-39`) but no `ariaLabelledby`, so consumers cannot label the input by reference. GAP-061 deliberately added no new public props.
- **Expected state:** Vue Password accepts `ariaLabelledby` and binds it to the input's `aria-labelledby`, matching PrimeVue.
- **Why it matters:** Referencing a visible label element is a standard labelling path; without it consumers must duplicate label text in `ariaLabel`.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Not part of GAP-061.
- **Framework scope:** Vue only (Angular/React Password not examined as part of this finding).
- **Existing reusable infrastructure:** The existing `ariaLabel` prop/binding pattern in the same component.
- **Recommended resolution direction:** Directional only — add the prop and binding with a test.
- **Source/evidence:** Form/Accessibility Plan Task 6 review (2026-09-30); PrimeVue `Password.vue:11`; `BasePassword.ts:38-39`.
- **Architectural decision required:** No.

#### GAP-078 — Component style injection uses the global `document`, so SSR output carries no component CSS (Angular, React, Vue)

- **Status:** RESOLVED (2026-10-03, approved-designs phase — `a5720f0`, `b735582`, `0608e6d`; Angular: per-`Document` style registry, `data-u-ng-style` key attribute, server-rendered styles adopted on hydration and refreshed when their CSS differs; React/Vue: client-only injection, contract documented and tested)
- **Type:** Styling, Architecture, Framework (Angular, React, Vue)
- **Blocking level:** MEDIUM
- **Current evidence:** Found during the SSR Plan (GAP-065) Task 1 review (2026-10-01); registered on user instruction. All three frameworks' style sheets create `<style>` elements only when a global `document` exists and append them to the global `document.head`: `packages/ng-core/src/basecomponent/style-sheet.ts:18-19` (`NgCoreStyleSheet`, called from `UBaseComponent.ngOnInit`), `packages/react-core/src/styling/react-style-sheet.ts:6-7`, `packages/vue-core/src/styling/vue-style-sheet.ts:12-13`. Angular's injected `DOCUMENT`/`Renderer2` (both available on `UBaseComponent`) are not used. Consequences: under SSR with no global `document`, no component CSS is written into the server-rendered HTML (styles appear only after client bootstrap); if a server polyfills a global `document`, styles go into that shared object rather than the per-request document; registration is a module-level singleton shared across requests. Track E's SSR harness deliberately does not assert `<style>` presence.
- **Expected state:** A decided SSR styling strategy — e.g. styles emitted into each request's document/HTML, or an explicit documented client-only styling contract — consistent across the three frameworks.
- **Why it matters:** Unstyled server-rendered markup until hydration, and potential cross-request style state.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Not part of GAP-065 (which concerns crashes from unguarded browser globals).
- **Framework scope:** Angular, React, Vue.
- **Existing reusable infrastructure:** Angular `DOCUMENT`/`Renderer2` on `UBaseComponent`; each framework's own SSR style-collection mechanisms.
- **Recommended resolution direction:** Directional only — decide the SSR styling contract in its own Spec.
- **Source/evidence:** SSR Plan Task 1 and final reviews (2026-10-01, ledger `.superpowers/sdd/2026-09-27-prime-parity-ssr/progress.md`); the three style-sheet files above.
- **Architectural decision required:** Yes — the SSR styling strategy. **Decided 2026-10-02 (user):** the proposed contract — Angular writes into the injected per-request `DOCUMENT`; React/Vue stay client-only, documented; see `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §7. Not in the next implementation phase.

#### GAP-079 — Vue's shipped type declarations are unresolvable for consumers

- **Status:** RESOLVED for declaration/package resolvability (2026-10-03, F5 — `041e7eb`, `6360a83`; every exported subpath type-checks under `Bundler` and `NodeNext`; declaration maps and story declarations no longer shipped). Typed component props are out of scope for this GAP and tracked as GAP-082.
- **Type:** Packaging, Framework (Vue)
- **Blocking level:** MEDIUM
- **Current evidence:** Found during the Existing Commitments Plan's GAP-068 work (2026-10-01); pre-existing; registered on user instruction. `@ultimate/vue` emits declarations per file with `vue-tsc --emitDeclarationOnly` followed by `scripts/rename-dts.mjs` (`packages/vue/package.json` `build` script), which renames `.d.ts` to `.d.mts` but leaves relative import specifiers unrewritten. A scratch consumer (TypeScript, `moduleResolution: Bundler`) importing `@ultimate/vue/button` fails with TS2307 "Cannot find module './Button.vue'" and on `./base-button` — the emitted `.d.mts` files reference SFC and extensionless paths that do not resolve to emitted declaration files. This predates GAP-068's new subpath entries (the proof-set `button` subpath already shipped this way). Evidence: `.superpowers/sdd/2026-09-27-prime-parity-existing-commitments/task-4-5-report.md` (Task 4 resumed section). The same declaration build also ships 91 Storybook `*.stories.d.mts` files, and its `.d.mts` files keep `sourceMappingURL` comments naming the pre-rename `.d.ts.map` files (React shows the same comment leftover).
- **Expected state:** Every exported `@ultimate/vue` subpath and the barrel type-check for consumers under `Bundler` and `NodeNext` resolution, with props/emits types intact.
- **Why it matters:** TypeScript consumers of `@ultimate/vue` get unresolved-module errors or `any`-typed components.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Follow-up: typed Vue component props, GAP-082 (out of scope here). Related: React's equivalent was fixed within GAP-068 by rewriting relative specifiers in React's `scripts/rename-dts.mjs`; Vue additionally needs `.vue` declaration handling.
- **Framework scope:** Vue only.
- **Existing reusable infrastructure:** React's specifier rewrite in `packages/react/scripts/rename-dts.mjs` (GAP-068).
- **Recommended resolution direction:** Directional only — make Vue's declaration build emit resolvable specifiers (including SFC declarations), verified by a consumer type-check.
- **Source/evidence:** GAP-068 Task 4 stop report (2026-10-01); `packages/vue/package.json` build script; `packages/vue/scripts/rename-dts.mjs`.
- **Architectural decision required:** No.

#### GAP-080 — Angular Scroller creates a `ResizeObserver` in `ngAfterViewInit` without a browser guard (SSR)

- **Status:** RESOLVED (2026-10-03, F4 — `ea28372`; view-init work browser-only, matching PrimeNG 21.1.9; CI SSR build-order fix `8edc668`)
- **Type:** Component, Framework (Angular), SSR
- **Blocking level:** MEDIUM
- **Current evidence:** Found during the Existing Commitments Plan's GAP-070 prerequisite work (2026-10-01) and confirmed in review; pre-existing on `main` (`2bd2538`); registered on user instruction. `packages/ng/src/scroller/scroller.ts:141` runs `this.resizeObserver = new ResizeObserver(...)` in `UScroller.ngAfterViewInit` with no `isPlatformBrowser` guard; `ngAfterViewInit` runs during server rendering, where `ResizeObserver` is undefined. The Angular SSR playground's build-time prerender logs `ERROR ReferenceError: ResizeObserver is not defined at ngAfterViewInit` (via `apps/playground-angular/src/app/proof-page.component.ts:90`). The build still exits 0 and the `ng-ssr-chromium` Playwright project passes (it checks browser console/pageerror only), so CI does not catch it. It surfaced only once `@ultimate/ng` could be built again (TS2729 and `@angular/cdk` fixes, `4a47883`/`29a3390`). Scroller is one of Track E's eight proof-set components, which GAP-065's scope deliberately excluded.
- **Expected state:** No browser-only API is reached from Scroller's server-executed lifecycle hooks; the observer is created only in the browser, with a spy-based server test as in GAP-065.
- **Why it matters:** Server rendering of any page with a Scroller logs an error and skips the rest of `ngAfterViewInit`.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Same defect class as GAP-065.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** The `isPlatformBrowser(this.platformId)` guard and spy-based server test pattern from GAP-065 (`38560be`).
- **Recommended resolution direction:** Directional only — guard the observer creation (and its cleanup) for the browser; consider whether the CI SSR job should fail on server-side prerender errors.
- **Source/evidence:** Existing Commitments Plan Tasks 5b/5c review (2026-10-01, ledger `.superpowers/sdd/2026-09-27-prime-parity-existing-commitments/progress.md`); `scroller.ts:141`; playground prerender log.
- **Architectural decision required:** No.

#### GAP-081 — Angular primary barrel and secondary entry points ship separate copies of the same component classes

- **Status:** RESOLVED (2026-10-03, approved-designs phase — `6bc1e6c`, `28e0212`; DECISION-F Option 1: barrel re-exports 69 secondary entries by package specifier, 13 internal imports rewritten, development-only `tsconfig.json` path mapping; duplicate classes 86 → 0, class identity 6/6 with no `NG0912`)
- **Type:** Packaging, Architecture, Framework (Angular)
- **Blocking level:** MEDIUM
- **Current evidence:** Confirmed during GAP-070's characterization (2026-10-01); pre-existing for GAP-009's nine secondary entry points; registered on user instruction. The primary `@ultimate/ng` bundle (`fesm2022/ultimate-ng.mjs`) contains every component's code and imports none of the package's subpaths, while each subpath bundle contains its own copy — e.g. `class UCheckbox` and `class UTabs` each appear in both the primary bundle and their subpath bundle. An application importing a component from both `@ultimate/ng` and its subpath loads two distinct classes (separate DI tokens, `instanceof` mismatches, duplicated code). GAP-070 widens the affected set from 9 to 70 subpaths. Evidence: `docs/architecture/research/2026-10-01-gap-070-ng-secondary-entry-characterization.md`.
- **Expected state:** One class identity per component regardless of import path (e.g. the primary barrel re-exports from its subpaths), or a documented single supported import style.
- **Why it matters:** Mixed import styles silently break DI and type identity, and grow bundles.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** Related to GAP-070 (more subpaths) and its corrected trigger (components cannot import across directories inside secondary entries).
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** None yet.
- **Recommended resolution direction:** Directional only — decide the Angular packaging model in its own Spec.
- **Source/evidence:** Existing Commitments Plan Task 6 characterization and review (2026-10-01).
- **Architectural decision required:** Yes — the Angular packaging model (Open Architectural Decisions §5, DECISION-F).

#### GAP-077 — Vue Stepper lacks horizontal separators between step headers

- **Status:** RESOLVED (2026-10-03, F3 — `96332a0`, `bcaa306`, `bcbc06c`; horizontal separators + scoped row layout; vertical GAP-063 layout unchanged)
- **Type:** Component, Framework (Vue)
- **Blocking level:** LOW
- **Current evidence:** Found by the Vue Plan's Implementation-stage source check (2026-09-30); registered on user instruction. Real PrimeVue 4.5.5 `step/Step.vue` renders `<StepperSeparator v-if="isSeparatorVisible" />` after each step header (`:9`), with `updateState()` setting `isSeparatorVisible = index !== stepLen - 1` when the step is inside a `StepList` (`:43-49`). Ultimate's `packages/vue/src/stepper/Step.vue` renders no separator, although `stepper-style.ts` already defines a horizontal `.u-stepper-separator` rule (line 19 as of `41a219c`; before GAP-063 it was unused, and GAP-063's internal `StepperSeparator.vue` now uses it only in vertical mode, with vertical overrides). This contradicts the earlier audit claim (Vue Plan Spec §4/§8, GAP-063's original text) that Ultimate's `Step` already matches PrimeVue exactly.
- **Expected state:** Horizontal Steppers render a separator between consecutive step headers, none after the last, matching PrimeVue.
- **Why it matters:** Visible rendering gap in the default (horizontal) Stepper layout.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** Can reuse the step marker and internal separator element added by GAP-063.
- **Framework scope:** Vue only (Angular/React Stepper not examined as part of this finding).
- **Existing reusable infrastructure:** `.u-stepper-separator` CSS; GAP-063's internal `StepperSeparator.vue` and `data-u-step` marker (shipped in `bd4c025`).
- **Recommended resolution direction:** Directional only — port `Step.vue`'s separator rendering for steps inside `StepList`.
- **Source/evidence:** Vue Plan pre-dispatch source check (ledger `.superpowers/sdd/2026-09-27-prime-parity-vue/progress.md`); PrimeVue `Step.vue:9,43-49`; Ultimate `Step.vue`, `stepper-style.ts:19` (as of `41a219c`).
- **Architectural decision required:** No.

#### GAP-082 — Vue components ship without typed public props

- **Status:** RESOLVED (2026-10-04, `feature/gap-082-typed-vue-props` — `3249079`, `f146ea8`, `145ca81`, `2e45411`, `ec3112f`, `bb4d1a4`, `0eebd1b`; ADR-049: factories return inferred `defineComponent(...)` types, type-only typing with no runtime change, readonly-accepting array props, contract-based nullability; all 88 prop-bearing exported components expose their 661 runtime prop keys; CI-enforced consumer type-check in `packages/vue` `validate`. Record: `docs/architecture/research/2026-10-04-gap-082-typed-vue-props-closeout.md`)
- **Type:** Packaging, Component, Framework (Vue)
- **Blocking level:** MEDIUM
- **Current evidence:** Found by the F5 consumer type-check (2026-10-03, Prime-parity follow-up phase). After GAP-079, `@ultimate/vue`'s declarations resolve for consumers, but the Vue component base factories return an untyped `ComponentOptions` (e.g. `packages/vue/src/button/base-button.ts:20`, `createBaseButton(): ComponentOptions`), and components extend them (`extends: createBaseButton()`). `vue-tsc` therefore emits each component as `DefineComponent` with an empty props type (e.g. `packages/vue/dist/button/Button.vue.d.mts`), across approximately 95 component bases. A consumer passing a wrongly typed prop (e.g. a number for `UButton`'s `label`) gets no TypeScript error. Pre-existing; not caused by GAP-079 (before it, the declarations did not resolve at all).
- **Expected state:** Each exported Vue component's declaration carries its real props (and emits) types, so wrong prop types are compile-time errors for consumers.
- **Why it matters:** TypeScript consumers of `@ultimate/vue` get no prop checking or editor completion for component props.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** Follows GAP-079 (resolvable declarations are a prerequisite, now met).
- **Framework scope:** Vue only.
- **Existing reusable infrastructure:** Vue's `defineComponent` typing; the F5 consumer type-check method (pack, install into a scratch consumer, type-check every exported subpath, `@ts-expect-error` on a wrong prop).
- **Recommended resolution direction:** Directional only — needs a dedicated architectural/retyping phase covering the base-factory pattern across ~95 components. Intentionally not included in F5 (user decision 2026-10-03).
- **Source/evidence:** F5 Task 3 consumer check and final whole-branch review (2026-10-03); `docs/architecture/research/2026-10-03-prime-parity-followup-closeout.md`.
- **Architectural decision required:** Yes — how Vue base factories expose typed props (affects every Vue component).

#### GAP-083 — `@ultimate/vue` declarations do not type-check against Vue 3.5.0, the lower bound of its peer range

- **Status:** MISSING
- **Type:** Packaging, Compatibility, Framework (Vue)
- **Blocking level:** MEDIUM
- **Current evidence:** Found by the GAP-082 final whole-branch review (2026-10-04); pre-existing, not introduced by GAP-082.
  - `@ultimate/vue` and `@ultimate/vue-core` declare the peer range `vue: ^3.5.0` (`packages/vue/package.json`, `packages/vue-core/package.json`; ADR-042). The workspace develops against `^3.5.13`, and Vue 3.5.42 is installed.
  - The shipped SFC declarations (emitted by `vue-tsc` 2.2.12) reference Vue's `DefineComponent` with 20 type arguments.
  - A consumer type-check of the built package against Vue 3.5.0 reports 198 × TS2707: "DefineComponent requires between 0 and 19 type arguments". The affected component types are lost.
  - `main` already emitted the same `DefineComponent` form before GAP-082; GAP-082 only adds more such references.
  - Not yet established: the earliest 3.5.x release that accepts the 20-argument form, and whether `@ultimate/vue-core`'s bundled declarations fail the same way.
- **Expected state:** Every Vue version inside the declared peer range type-checks `@ultimate/vue`'s declarations, or the peer range states the real minimum.
- **Why it matters:** Consumers on early Vue 3.5.x releases, which the peer range allows, get type errors in library declarations and lose component prop types.
- **What it blocks:** Nothing further downstream.
- **Dependencies:** None. Related: GAP-079 (declaration resolvability), GAP-082 (typed props, whose consumer check runs only against the workspace Vue version).
- **Framework scope:** Vue only.
- **Existing reusable infrastructure:** GAP-082's consumer type-check (`packages/vue/scripts/validate-consumer-types.mjs`), which installs the packed package with a pinned `vue` version.
- **Recommended resolution direction:** Directional only. A dedicated research/architecture phase decides between:
  1. raising the minimum supported Vue version;
  2. making the declarations compatible with Vue 3.5.0;
  3. adding an explicit minimum-version compatibility check.
- **Source/evidence:** GAP-082 final whole-branch review (2026-10-04); `docs/architecture/research/2026-10-04-gap-082-typed-vue-props-closeout.md`; ADR-042.
- **Architectural decision required:** Yes — the supported Vue floor vs declaration compatibility.

---

## 4. Resolved gaps

### `@ultimate/uix-data` — the shared Data foundation

- **Original gap:** Blueprint §32 calls for shared architecture across selection/sorting/filtering/pagination/editing/grouping/expansion/virtualization/accessibility for Data components, while COMPONENT_INVENTORY.md's Data table (Table, TreeTable, Tree, Scroller, Paginator, OrderList, PickList, DataView) marked all 8 rows `NEEDS ARCHITECTURE DECISION` — the shape of any shared contract was genuinely unknown at Phase 2 close.
- **What research established:** Six sequential architecture research passes, each re-verified against real pinned PrimeNG 21.1.9/PrimeReact 10.9.9/PrimeVue 4.5.5 source (not assumed from memory or generic patterns), found that only a narrow set of concepts hold up as genuinely shared: selection-mode vocabulary (not state/storage), sort metadata shape (not toggle-cycling behavior), simple (non-operator) filter shape, pagination state + page-count math, and virtualization windowing math (with a real, evidenced zero-guard fix carried over from Angular's superior real implementation). Hierarchical identity/selection was found structurally incompatible (object-mutation vs. external key-maps) and excluded. A final consumption-readiness pass simulated real usage against actual Prime call sites and confirmed no additional primitive was missing.
- **What architectural decision was made:** ADR-043 — create `@ultimate/uix-data` as a new, narrow, sibling package to `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`, exposing exactly six items (`equals`, `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`).
- **What was implemented:** `packages/uix-data` — `package.json`, 6 `src/` submodules (identity, selection, sort, filter, pagination, virtualization), 8 test files (4 `.test.ts` runtime + 4 `.test-d.ts` type-level), provenance manifest (`docs/architecture/provenance/uix-data.json`), README, `PROVENANCE.md` entry, performance baseline entry (`PERFORMANCE.md`: 7.0 KB dist, 0.34 KB gzip index). Merged to `main` via `685aee5` (`Merge branch 'worktree-uix-data-foundation'`), preceded by a final-review fix commit (`995012b`) addressing four review findings.
- **What is intentionally still excluded:** Hierarchical (Tree-family) identity/selection/expansion (GAP-013, structurally incompatible, no forced contract); filter `operator`/`constraints` model (GAP-014, deferred until real Table evidence); sort-toggle cycling (GAP-015, framework-divergent, stays framework-native); page-link display math, array-bounds clamping, live-scroll-state-coupled calculations (rendering/live-state concerns, not pure Data semantics — never revisit as "missing," these were evaluated and rejected on the merits).
- **Current consumers:** None yet (verified: zero framework component package depends on `@ultimate/uix-data`). It is proven-correct, tested, and provenance-complete infrastructure waiting for the first real Data component to consume it.

### PrimeReact 11 baseline reclassification

- **Original gap/ambiguity:** Blueprint §7/§4 described PrimeReact 11 as "alpha" and a candidate for architectural reference, implying it might mature into an incorporable source later.
- **What research established:** Phase 0 investigation (spec Finding 2) found PrimeReact 11.1.0 is GA (published 2026-08-05), not alpha, and commercially licensed under the "PrimeUI License" — not MIT.
- **What decision was made:** ADR-014 — reclassify PrimeReact 11 as "architectural reference only, commercially licensed." Its package-split pattern (`@primereact/{core,headless}`) remains useful prior art for Ultimate's own React package boundaries, but zero source is incorporated from it, and the reason is licensing, not immaturity. Followed the Architectural Deviation Protocol (Blueprint §37) explicitly.
- **What is intentionally excluded:** Any PrimeReact 11 source incorporation, now or in the future, absent a licensing change.

### `@primeuix/*` sourcemap-based vendoring mechanism

- **Original gap:** The four pinned `@primeuix/*` npm tarballs ship only compiled `.mjs`/`.d.mts` output with no `src/` directory, and the upstream `primefaces/primeuix` GitHub repo's history never reached the exact pinned versions — a genuine "how do we get real source, not just compiled output" problem.
- **What research established:** Every pinned tarball's `.mjs.map` sourcemap embeds a complete `sourcesContent` array — the original per-file TypeScript source at the exact pinned MIT baseline.
- **What was implemented:** ADR-016 — `scripts/provenance/extract-source.mjs` deterministically recovers original source from the same checksummed tarballs Phase 0 already pinned, with no network access needed at extraction time. Confirmed present: `.vendor-extracted/{uix-motion,uix-motion-types,uix-styled,uix-styles-components,uix-styles-full,uix-utils}`.

---

## 5. Open Architectural Decisions

Listed here only where the repository shows genuine, unresolved forks requiring a decision — not implementation backlog. One should be handled at a time, later, not resolved by this document.

### DECISION-A — Visual regression + real-browser testing tooling choice — RESOLVED BY IMPLEMENTATION

- **Question (as originally posed):** What tool(s) provide visual regression (Blueprint §28) and real-browser/cross-browser interaction testing (§28/§31), and should the same tool serve both needs?
- **Resolution:** Option (c) was chosen and shipped by Phase 10 Track A: Storybook for docs/browsing and screenshot-diff visual regression, Playwright specifically for cross-browser interaction assertions — exactly the combination this entry's own text anticipated as option (c). Recorded formally in **ADR-044** ("Phase 10 testing/documentation tooling: Storybook + Playwright, distinct responsibilities").
- **Current evidence:** `.storybook/` configs for all 3 frameworks; `storybook`/`axe-core` real devDependencies; 9 real Playwright projects in `playwright.config.ts`; the `track-a-browser-visual-a11y` CI job. See GAP-004/GAP-005/GAP-035 above for full evidence.
- **Status:** Closed — no longer an open fork. Retained here (rather than deleted) for historical continuity, per this document's own "stable gap identity" convention.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-044; `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §5.

### DECISION-B — External runtime dependency approval process (Chart.js, Quill, and future cases)

- **Question:** ADR-004 defines a rigorous approval process for Prime-derived source specifically (license verification, commit pinning, provenance recording). No equivalent documented process exists for approving a *non-Prime* external runtime dependency like Chart.js (GAP-019) or Quill (GAP-020).
- **Current evidence:** Two components (Chart, Editor) are already blocked on this exact unresolved question, independently, in COMPONENT_INVENTORY.md. **Confirmed still genuinely open during Documentation Reconciliation** — no Chart or Editor implementation work has occurred in any track through Phase 10.
- **Options:** (a) Extend the existing Phase-0-style provenance/license process to cover any external runtime dependency, not just Prime-derived source; (b) treat each external dependency as a one-off case-by-case ADR with no generic process; (c) avoid external chart/rich-text dependencies entirely and scope Chart/Editor out of the initial platform (Blueprint §41's non-goals don't explicitly forbid this, but don't explicitly require Chart/Editor either).
- **Affected areas:** Chart (Visualization family), Editor (Panel/Layout/Display family), and any future component with a genuine external dependency need.
- **Recommendation:** Option (a) is weakly favored by the evidence — Ultimate already has a working, proven process (Phase 0's) that generalizes naturally — but this is recorded as a recommendation, not a resolution. **This decision remains open** — this reconciliation pass does not resolve it.

### DECISION-C — Data component architecture for Table/TreeTable specifically (not blocked by `uix-data`, but not yet started either) — NARROWED, PARTIALLY RESOLVED (OrderList/PickList/DataView, 2026-09-21; Table's own fuller filter vocabulary, 2026-09-23); TreeTable remains separately open

- **Question:** `uix-data` deliberately ships only the narrow, cross-framework-verified primitives. The actual `Table` component (and its dependents: TreeTable, Scroller, Paginator internal-consumer relationship) still needs its own per-framework architecture decision — how selection/sort/filter/pagination/virtualization primitives compose into a real, framework-native Table implementation.
- **Current evidence:** COMPONENT_INVENTORY.md marks Table `NEEDS ARCHITECTURE DECISION`, `High` risk, explicitly separate from the (now-resolved) shared-primitives question ADR-043 answered. **Confirmed during Documentation Reconciliation, by direct read of the Table implementation plan (`docs/superpowers/plans/2026-09-02-table-component-implementation.md`) Tasks 5/13/19:** Table's own proof-set architecture is no longer "unstarted" — it shipped for all 3 frameworks, composing real `UPaginator`/`UScroller` instances, with real sort/selection/row-editing/row-grouping. GAP-014 (filter operator/constraints) is separately, correctly marked `RESOLVED` on the strength of these same tasks. **However, the resolution is narrower than this decision's own full scope:** Task 5's own heading is explicit — "**scope narrowed to string match modes**" (`contains`/`startsWith`/`equals` for Angular; `contains` only for React/Vue) — the plan's own Acceptance Criteria section states this outcome is "**Narrower than spec §9's full `FilterMatchMode` vocabulary**." Numeric/set/date/custom filter modes remain explicitly deferred, not implemented. Additionally, this decision's own scope names 7 Data-family rows (Table, TreeTable, Scroller, Paginator, OrderList, PickList, DataView); only Table/Scroller/Paginator have shipped — TreeTable, OrderList, PickList, DataView remain unbuilt.
- **Options:** No longer "not yet had even a first research pass" — real, shipped, tested, cross-framework evidence now exists for Table's own composition question specifically. This entry originally left open (1) the fuller filter-operator vocabulary beyond string match modes (Table's own scope), and (2) whether Table's now-proven composition pattern should be treated as the answer for TreeTable/OrderList/PickList/DataView too, or whether each needs its own pass — **item (2) is now resolved for OrderList/PickList/DataView specifically, and item (1) is now resolved for Table's own filter vocabulary, see below.**
- **Affected areas:** TreeTable remains gated on this decision's fuller resolution — **explicitly and separately**, since TreeTable's real blocker is Tree/DECISION-D (protected, do-not-reopen), not this decision; TreeTable's status is not addressed or changed by the resolution below. Table/Scroller/Paginator's own architecture question is substantially answered by real implementation, not merely a research pass.
- **Recommendation:** None made here, per this document's scope limits, for TreeTable — it remains flagged, not resolved. Table's own fuller filter-vocabulary question is resolved, see the 2026-09-23 resolution paragraph below.
- **Source/evidence:** `docs/superpowers/plans/2026-09-02-table-component-implementation.md` Tasks 5, 13, 19, and its "Acceptance Criteria" section; GAP-014 (above); `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §5.
- **OrderList/PickList/DataView resolution (human-approved architectural decision, 2026-09-21):** a dedicated architecture-brainstorming pass, grounded in direct real-source verification across all 3 frameworks (extraction via the pinned `.vendor-cache/` tarballs — never from directory names or documentation pages alone) plus two prior 2026-09-02 research documents (`2026-09-02-table-data-component-architecture.md`, `2026-09-02-table-editing-grouping-dragdrop-architecture.md`) that had already independently investigated this exact question, resolved item (2) above for these 3 capabilities specifically: **no new shared Table/data foundation is required, and no generalized Table pattern should be introduced.** Evidence: **DataView** genuinely and directly composes each framework's own already-Built Paginator component (confirmed real imports in all 3 frameworks, not a lookalike), with `sortField`/`sortOrder`/`lazy` matching Table's own sort/lazy-load field shape — it fits Ultimate's existing architecture exactly as Table itself already does, no extension needed. **OrderList and PickList are not architectural Table reuse at all** — real source confirms neither has a `selection`/`selectionMode` concept in Table's sense (their own "selection" is list-transfer/reorder membership), neither composes Table/DataTable or uses virtualization; the only shared surface is composing the same `Listbox` component and, where present, the same `FilterMatchMode` vocabulary — both remain **ordinary framework-native components**, not a Table-generalization case. **Drag/drop is confirmed framework-native and genuinely divergent, not a candidate for a shared primitive:** Angular's real OrderList/PickList depend on `@angular/cdk/drag-drop` (external Angular-ecosystem library); React's real implementations use native HTML5 drag/drop DOM events, hand-rolled; **Vue's real OrderList and PickList have neither drag/drop nor filtering at all** (confirmed via full-file reads of `OrderList.vue`/`BaseOrderList.vue` and `PickList.vue`/`BasePickList.vue` — zero `draggable`/`onDragStart`/`onDrop`/`dragdrop`/`filterBy`/`FilterService` references anywhere in either pair). Angular/React may require ordinary component-local drag/drop implementation, or a clearly disclosed scope cut (matching the "smaller surface than upstream" precedent already used throughout Phase C) — this is implementation-time detail, not an architectural gap. **DataView filtering is confirmed not a three-framework shared contract:** Angular has real, genuine `FilterService`-based filtering (injected service, public `filterBy` input, a `filter()` method that calls the same mechanism already used by Table/OrderList/PickList in Angular); React and Vue have **no DataView filtering contract at all**, confirmed absent at every evidence layer checked (full component prop lists, full component logic, and each framework's own showcase-documentation directory — genuinely absent, not merely undocumented). This asymmetry does not require a new shared foundation; where it exists, it already routes through the existing mechanism. **This is a decision/documentation-only resolution — it does not migrate or select OrderList, PickList, or DataView for any batch**, and does not change TreeTable's own status, which remains governed separately by DECISION-D.

- **Table filter-operator vocabulary resolution (2026-09-23):** the fuller filter-operator vocabulary remainder identified above — item (1), "the fuller filter-operator vocabulary beyond string match modes" — is now resolved, and resolved more completely than originally scoped. All 14 remaining comparator modes named by the plan (`notContains`, `endsWith`, `notEquals`, `lt`, `lte`, `gt`, `gte`, `between`, `in`, `notIn`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`) plus `custom` shipped across all 3 frameworks (`packages/ng/src/table/table.ts`, `packages/react/src/table/table.tsx`, `packages/vue/src/table/Table.vue`). Final-review verification also found that React's and Vue's `matchesFilter` switch statements, as given complete in the plan's own task code, additionally dispatch `startsWith`/`equals` for the first time — these two modes were type-declared but never wired for React/Vue before this branch (Table's 2026-09-02 implementation had narrowed React/Vue to `contains` only). Both gained dedicated tests in the final-review fix pass. **The accurate current state, confirmed by direct source inspection, is that all 18 `FilterMatchMode` values are now dispatched in all 3 frameworks** — not merely the 15 (14 comparators + custom) this remainder originally scoped. Real, framework-verified edge-case divergences are deliberately preserved rather than papered over: `notEquals`'s absent/empty-filter default differs by framework (Angular `false`, Vue `false`, React `true`), and Vue alone coerces string-typed date filter/cell values via `new Date(...)` before comparing, matching each framework's own real Prime source rather than a forced cross-framework uniform behavior. The `custom` mode is supported only for Angular, via a real, Spec-approved, Table-scoped `registerCustomFilter(fn)` registration contract (per-instance, reserved `'custom'` key, duplicate-registration replaces, an unregistered `custom` filter resolves to `false`, and registration after the component's first render correctly triggers reactivity under `OnPush` via a signal-backed field); React and Vue were confirmed, by direct source verification, to have no executable registration path for `custom` — it always resolves to `false` in both, by design, not a gap. This closes Table's own fuller filter-vocabulary scope referenced in this entry's "Options"/"Affected areas"/"Recommendation" lines above; TreeTable's status is unaffected and remains gated on DECISION-D, unchanged. Source/evidence: `docs/superpowers/plans/2026-09-23-table-filter-vocabulary.md` (implementation plan, all tasks complete) and `docs/superpowers/specs/2026-09-23-table-filter-vocabulary-design.md` (approved specification).

### DECISION-D — Hierarchical (Tree-family) shared contract (do-not-open marker)

- **Question:** Restated from GAP-013 for visibility in this section: should Tree/TreeTable/TreeSelect/OrganizationChart ever get a shared cross-framework contract?
- **Current evidence:** This decision's own six-pass research effort already answered this for the *current* evidence: no, structurally incompatible (PrimeNG mutates `TreeNode` object references in place; PrimeReact and PrimeVue both use external `{[key]: boolean}` key-maps).
- **Options:** N/A — not re-litigated here.
- **Affected areas:** Tree-family components only.
- **Recommendation:** **Do not open this decision without new repository evidence** (per this task's Critical Operating Rule 5, extended by analogy — this Tree-family finding deserves the same protection as `uix-data`'s own scope, since it was produced by the same six-pass research effort). Revisit only when a real Tree implementation surfaces genuine new evidence.
- **Reference-integrity note (Parity Reconciliation pass, 2026-09-20):** this entry's "current evidence" line previously attributed the structural-incompatibility finding above to "ADR-043." `DECISIONS.md`'s actual ADR-043 is titled "`@ultimate/uix-data` introduced as a narrow, evidence-verified shared Data foundation" — a real, correctly-cited decision (see DECISION-C's own "Current evidence" line above, which correctly references it for the *shared-Data-primitives* question) but unrelated to Tree. Searched all of `DECISIONS.md` for this Tree structural-incompatibility content under any ADR number — it does not exist there under any number; it has only ever lived in this entry's own prose. The citation has been corrected here to attribute the finding to this DECISION-D entry directly, not to a numbered ADR. Every downstream document that cited "ADR-043's structural-incompatibility finding" for Tree (the Phase C Migration Roadmap, Dependency Map, Batch Selection Analysis, and prior audit documents) was correctly propagating this entry's own prior text, so the error originated here, not in each downstream copy. This correction is a citation fix only — DECISION-D's substance, protection, and "do-not-reopen" status are unchanged and not reopened by this note.
- **OrganizationChart scope clarification (human-approved architectural decision, 2026-09-21) — mechanism-based interpretation adopted, protection substance unchanged:** a source-reconstruction pass traced this entry's original inclusion of OrganizationChart back to its first appearance (uix-data design spec, 2026-09-01, consolidated into this entry 2026-09-02) and found the inclusion was stated as a mechanism-dependency claim ("also depending... through Tree") but was never independently source-verified for OrganizationChart at the time — only Tree itself carried a citation. `COMPONENT_INVENTORY.md`'s own OrganizationChart row (plain `ADAPT`, no Tree dependency, written 2026-08-29, four days before this decision existed and never revised since) reflects that lack of verification, not an error. Direct real-source verification (2026-09-20/21) has since established the claim is framework-asymmetric, not uniform: **Angular's real PrimeNG `OrganizationChart` genuinely imports `TreeNode` and mutates `node.expanded` in place** — the same contested mechanism this decision protects — so **Angular OrganizationChart remains excluded, unchanged**. **React's real PrimeReact `OrganizationChart` and Vue's real PrimeVue `OrganizationChart` are both structurally independent** — neither imports Tree's module or `TreeNode` type, neither shares Tree's own expansion-state mechanism (real source: `OrganizationChartNode.js`'s local `useState` for React; `OrganizationChart.vue`'s own `collapsedKeys` prop for Vue, distinct from Tree's `expandedKeys`) — so **this decision's protection does not, on the evidence, extend to React or Vue OrganizationChart**. This is a **scope clarification** (this decision protects the verified Tree mechanism, applied per framework where evidence differs — the same capability-scoped model already used throughout Phase C for every other mixed-eligibility capability), **not a reversal or reopening of Tree's own protected status**, which remains fully intact for Tree/TreeTable/TreeSelect and for Angular's OrganizationChart specifically. React and Vue OrganizationChart are **not thereby declared migration-eligible** — they still require normal Phase C eligibility verification (beyond the Tree-dependency question resolved here) before any future batch could include them. No Angular redesign is authorized or implied — Angular's real Tree-dependent implementation is not to be reworked to avoid this classification.

### DECISION-E — Package naming finalization (`@ultimate/uix-data` and all others)

- **Question:** Blueprint §34 requires final package names to be validated (npm availability, internal conventions, scope ownership, long-term clarity) "before the first stable public release." No package has undergone this validation yet — all remain explicitly provisional (uix-data's README states this most recently and explicitly).
- **Current evidence:** Every package is at `0.1.0`, pre-1.0, provisional per §34's own framing.
- **Options:** Not enumerated — this is a single validation pass across all ~17 package names at once, not a per-package fork.
- **Affected areas:** Every package.
- **Recommendation:** None — correctly deferred per Blueprint §34's own stated gate ("before the first stable public release"), not urgent now.

### DECISION-F — Angular packaging model: primary barrel vs secondary entry points (GAP-081)

- **Question:** Should the Angular primary `@ultimate/ng` barrel re-export from its secondary entry points (one class identity per component), or should consumers be told to use a single import style?
- **Current evidence:** Registered 2026-10-01 with GAP-081. The primary bundle contains every component's code while each of the 70 secondary entry points (GAP-070) ships its own copy, so mixing import styles loads two copies of a class. ng-packagr's per-entry `rootDir` also prevents components with cross-directory imports from being secondary entries (GAP-070's corrected trigger), which constrains any model.
- **Spike evidence (2026-10-01):** package-specifier re-exports build and give one class identity per component, provided barrel-only components also import subpath components by package specifier; every component can then be a secondary entry, including GAP-009's excluded four. Results and per-option evidence: `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §2.
- **Options:** (1) barrel re-exports from subpaths; (2) PrimeNG-style subpath-only packaging; (3) current model plus one documented canonical import style. Not yet chosen.
- **Affected areas:** `@ultimate/ng` packaging, consumer imports, bundle size.
- **Decision (2026-10-02, user):** Option 1 — the barrel re-exports its existing secondary entries by package specifier, the 13 cross-directory relative imports become package-specifier imports, both import styles are preserved, a test-only path mapping is added and the hand-written `exports` map is kept accurate. Options 2 and 3 rejected. Implementation (GAP-081) is a later dedicated packaging phase. See `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §7. Implemented 2026-10-03 (GAP-081 RESOLVED, `6bc1e6c`, `28e0212`).

---

## 6. Dependency graph of major gaps

**Superseded notice (added during Documentation Reconciliation):** this graph was accurate as of Phase 5 completion. Several of the gaps/edges below are now resolved and are retained here only as a historical record of what once blocked what — see §2/§3/§5 above for each item's corrected current status. In particular: GAP-003/GAP-003a are resolved (the "blocks genuine visual verification" edge no longer applies); GAP-004/GAP-035/DECISION-A are resolved (Track A); GAP-008's edge to GAP-034 is resolved (GAP-034 shipped via Track E using GAP-008's harness infrastructure as the vehicle, per ADR-045 — GAP-008's own fuller scope remains open, but the specific SSR/hydration edge drawn here is closed); GAP-011/GAP-031/GAP-032/GAP-033 are all resolved (Tracks B/D); GAP-027 is resolved (its downstream edges to GAP-029/GAP-030 are both also resolved). GAP-013/GAP-014/GAP-018/GAP-019/GAP-020/DECISION-B/DECISION-C's edges remain live, with DECISION-C narrowed per §5's updated entry.

```text
GAP-027 (component metadata schema/data)
    → blocks GAP-029 (MCP — designed to read metadata, not parse source)
    → blocks GAP-030 (AI Skills — designed to reference metadata)
    → weakly informs GAP-028 (CLI's `ultimate doctor`/`ultimate ai` metadata-aware features;
      CLI's core orchestration does not strictly require this)

GAP-008 (no real consumer app in any framework)
    → blocks GAP-009 / GAP-023 (genuine tree-shaking measurement — needs the real
      Angular linker inside a real app build, not a generic bundler against dist/)
    → blocks GAP-034 (genuine SSR/hydration verification)
    → blocks credible bundle-size/runtime-cost benchmarking beyond the current
      one-time dist/-only measurements in PERFORMANCE.md

GAP-003 (Angular StyleSheet.createStyleElement no-op)
    → blocks genuine visual verification of any shipped Angular component
    → entangled with GAP-003a (documentation contradiction — must be resolved
      by reading real evidence, not assumed either way)

GAP-013 (hierarchical Tree-family contract — correctly unresolved)
    → blocks Tree, TreeTable, TreeSelect, OrganizationChart (4 components)

GAP-014 (filter operator/constraints model — deferred by design)
    → blocks full-featured Table filtering
    ← is itself unblocked only by starting DECISION-C (Table architecture),
      a circular-looking but intentionally sequenced relationship (build the
      simple case now, let real Table work surface the harder case's evidence)

GAP-018 (Angular BaseModelHolder/BaseInput foundation tier missing)
    → blocks ~20 native-input Form components (InputText, InputNumber, Textarea,
      Password, Knob, Rating, Slider, ToggleSwitch, RadioButton, ToggleButton,
      SelectButton, InputMask, InputOTP, and more)

GAP-004 (no visual regression tooling) + GAP-035 (no real-browser testing)
    → both blocked on the same tooling choice (DECISION-A)
    → both block Phase 10 exit criteria directly

GAP-019 (Chart external dependency) + GAP-020 (Editor/Quill external dependency)
    → both blocked on the same unresolved policy question (DECISION-B)

GAP-011 (no SECURITY/CONTRIBUTING/CHANGELOG) + GAP-031 (no dependency/license/SAST
scanning) + GAP-032 (bundle-size not CI-enforced) + GAP-033 (coverage not CI-enforced)
    → collectively constitute the bulk of what stands between the platform and a
      credible Phase 10 "Production Hardening" exit; largely independent of each
      other and of every other gap above (each is additive CI/process work,
      not blocked on any other listed gap)
```

---

## 7. Recommended future sequencing — dependency-aware grouping, not phase numbers

### Group: Foundation blockers
Gaps that unlock the most other work and should be resolved before the workstreams below them start in earnest.
- ~~**GAP-003 / GAP-003a** (Angular style injection)~~ — **RESOLVED** (commit `680876f`); no longer a blocker.
- ~~**GAP-018** (Angular `BaseModelHolder`/`BaseInput`)~~ — **RESOLVED** (`BaseModelHolder` slice via `UModelHolder`/`UInputText`; `BaseInput` slice via GAP-038, see below) — the foundation tier for the ~20-component native-input Form family is now fully built and proven by two real consumers (`UInputText`, `UInputNumber`).
- ~~**GAP-038** (Angular `BaseInput` tier + `UInputNumber`)~~ — **RESOLVED** (this workstream, ADR-047) — unblocks `Password`/`InputMask`/`AutoComplete`/`DatePicker`/`Select` migration whenever each is individually scheduled.
- ~~**GAP-009 / GAP-023** (Angular secondary entry points)~~ — **RESOLVED** (commit `62575fb`, Blueprint Completion, 2026-09-13) for 8 of 12 components; `button`/`dialog`/`menu`/`table` permanently excluded by an upstream `ng-packagr` defect (see GAP-009's entry). Extended to 70 subpaths by GAP-070 (2026-10-01).
Why here: each is small, evidence-backed, has a proven pattern to copy from a sibling framework, and unblocks a materially larger downstream body of work.

### Group: Component-enabling foundations
- **GAP-008** (real consumer app, at least one per framework) — this is likely the single highest-leverage item in the entire registry: it unblocks genuine tree-shaking numbers, genuine SSR/hydration verification, genuine bundle-size/runtime benchmarking, and genuine end-to-end visual proof of GAP-003's fix.
- **GAP-022's successor state** — once a second real overlay component is planned, extract the shared orchestration pattern ADR-020 deferred (not urgent now, but sequenced here because it's a "when a second consumer exists" trigger, and GAP-008's playground app is a plausible source of that second consumer).

### Group: Component family expansion
- Form family (after GAP-018), Overlay family (after the second-consumer trigger above), Navigation family, Panel/Layout/Display family — all `ADAPT`-classified, low architectural risk, proven pattern from the now-8-component proof set across 3 frameworks (GAP-017).
- Data family — **Table, Scroller, Paginator have shipped** (3 of 8 rows) with real, tested, framework-native composition (see DECISION-C's updated entry in §5). **OrderList, PickList, DataView's architectural relationship to Table/DECISION-C is now resolved (2026-09-21)** — no new shared foundation required, ordinary framework-native implementation work only; not yet built or scheduled for any batch. TreeTable (1 row) remains blocked, but on Tree/DECISION-D specifically, not DECISION-C. Tree itself (1 row) remains correctly deferred per GAP-013/DECISION-D.
- Visualization/Editor — blocked on DECISION-B (external dependency policy), still genuinely open.

### Group: Framework parity
- No forced-parity work is recommended — GAP-024/GAP-025 document that current divergence is evidence-based and correct. The only real parity item, GAP-009/GAP-023 (Angular exports), is now resolved (8 of 12 components, extended to 70 subpaths by GAP-070 on 2026-10-01; see Foundation blockers above).

### Group: Platform tooling (Phases 6-9) — **all four now RESOLVED (see §2's corrected phase table)**
- ~~**GAP-027** (component metadata)~~ — RESOLVED. ~~**GAP-028** (CLI)~~ — RESOLVED, with disclosed follow-ups. ~~**GAP-029** (MCP)~~ — RESOLVED, with disclosed follow-ups. ~~**GAP-030** (AI Skills/LLM context)~~ — RESOLVED (its one disclosed follow-up, GAP-036, is itself now resolved too). This entire group, sequenced here as future work when this document was first written, has since landed in full.

### Group: Production hardening — **all CI-enforcement items now RESOLVED**
- ~~**GAP-004/GAP-035**~~ (visual regression + real-browser testing) — RESOLVED by Phase 10 Track A.
- ~~**GAP-005**~~ (accessibility scanning) — RESOLVED by Phase 10 Track A.
- ~~**GAP-031/GAP-032/GAP-033**~~ (dependency/license/SAST scanning, bundle-size CI gate, coverage CI gate) — RESOLVED by Phase 10 Track B, all now genuinely CI-enforced.
- **GAP-011** (SECURITY/CONTRIBUTING/CHANGELOG) — already accurately marked PARTIALLY RESOLVED (Track D); unchanged by this reconciliation.
- ~~**GAP-036**~~ (generate/commit `llms.txt`) — RESOLVED (commit `10435ca`, Blueprint Completion, 2026-09-13). **GAP-037** (PERFORMANCE.md Phase 3/4/5 sections) — LOW blocking level, mechanical, remains open.
This entire group, sequenced here as future work when this document was first written, has since landed in full except for GAP-037.

---

## 8. Executive summary

**Superseded notice (added during Documentation Reconciliation):** this section was originally written as of Phase 5 completion, before Phases 6–10 landed. It is corrected below against current repository evidence; historical framing is preserved where it remains accurate, and corrected in place where it does not. Full evidence trail: `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md`.

### Current Platform State

All ten Blueprint phases are now genuinely complete, most with explicit, disclosed follow-ups rather than zero remaining work — see §2's corrected phase table for the full per-phase evidence. Beyond what was already true at Phase 5 (a provenance-complete Phase 0 baseline; a working `UltimateUIX` foundation; an 8-component proof set — expanded from the original 5 — independently, natively implemented across Angular, React, and Vue; a working theme layer; a narrow, evidence-gated shared Data foundation, `@ultimate/uix-data`), the platform now also has: real, source-verified component metadata (`@ultimate/component-schema`/`@ultimate/component-metadata`, Phase 6); a working CLI with 5 real commands (Phase 7); a working MCP server with 5 real tools (Phase 8); real AI/Skills generation tooling and 8 real per-component Skill files (Phase 9); and all 5 Phase 10 Production Hardening tracks merged — real visual regression, accessibility scanning, and real-browser testing (Track A); real, CI-enforced dependency/license/SAST scanning and bundle-size/coverage regression gates (Track B); a real (never-yet-executed) release pipeline (Track C); operational documentation (Track D); and real SSR/hydration verification (Track E). Every one of these claims is backed by CI-enforced checks or direct source evidence, not merely asserted.

### Remaining Major Gaps

The single largest body of remaining work is the ~90-plus-directory remaining PrimeNG component backlog (GAP-017, mostly ordinary, low-architectural-risk `ADAPT` work once foundation-tier prerequisites like GAP-018 are met — the exact count is itself stale, since the proof set grew from 5 to 8 components since this figure was last computed; see `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §9 for the corrected accounting). The small cluster of isolated, real functional gaps that remained inside otherwise-complete phases — Angular's broken tree-shaking (GAP-009/GAP-023, now resolved for 8 of 12 components), Angular's Tooltip `aria-describedby` gap (GAP-006, resolved), Angular's overlay z-index/Escape stacking (GAP-007, resolved), the provenance-spec `sha256OfOriginal` text (GAP-010, resolved), and the `llms.txt` generated-artifact gap (GAP-036, resolved) — was closed by the Blueprint Completion workstream (2026-09-13); only `PERFORMANCE.md`'s Phase 3/4/5 narrative-section gap (GAP-037) remains as small, mechanical documentation backlog. None of these block Production Hardening's exit criteria at zero coverage anymore — that state (GAP-004/005/031/032/033/035 all previously `MISSING`/`NOT-ENFORCED`) has been resolved.

### True Architectural Blockers

Four gaps/decisions are true architectural blockers in the sense of preventing multiple future workstreams, as opposed to being ordinary backlog:
- **GAP-018** (Angular's missing `BaseModelHolder`/`BaseInput` tier) blocks an entire component family (~20 components) until built — but the pattern is already proven and low-risk, so this is a blocker in scope, not in difficulty.
- **DECISION-B** (external dependency approval policy) blocks Chart and Editor independently, and blocks any future non-Prime dependency need generically until a policy exists.
- **DECISION-C** (Table/Data architecture, now narrower — see §5): OrderList/PickList/DataView's architectural relationship to Table is resolved (2026-09-21, no new foundation required); TreeTable remains blocked, but on Tree/DECISION-D, not DECISION-C.
- **GAP-013/DECISION-D** (Tree-family contract) blocks Tree/TreeTable/TreeSelect, correctly and deliberately, and blocks Angular OrganizationChart specifically (confirmed genuine Tree-mechanism dependency, 2026-09-21 scope clarification) — React/Vue OrganizationChart are not blocked by this decision (confirmed structurally independent), though neither is yet declared migration-eligible pending normal eligibility verification.

Everything else — including the much larger remaining component backlog, and every Production Hardening item — is independently addressable ordinary implementation backlog, not an architectural blocker. (GAP-027, previously listed here as a blocker for MCP/AI Skills, is now resolved — both downstream phases have shipped.)

### Independent Work

The great majority of gaps in this registry can be started without waiting on any other gap or decision: GAP-002/GAP-012 (documentation hygiene), GAP-037 (small documentation backlog — GAP-006/GAP-007/GAP-009/GAP-010/GAP-023/GAP-036, the other isolated Angular/artifact fixes once listed alongside it here, are now resolved by the Blueprint Completion workstream), and most of the Component/Panel/Navigation family expansion once GAP-018 lands.

### Open Architectural Decisions

The Prime-vs-Ultimate parity audit's GAP-041–GAP-070 were delivered on `feature/prime-parity-audit-gaps` (closeout 2026-10-01; GAP-064 PARTIAL); GAP-071–GAP-081 were registered during that work and remain open. Deferred items and branch-level check results: `docs/architecture/research/2026-10-01-prime-parity-branch-closeout.md`. The Prime-parity follow-up phase (`feature/prime-parity-followup`, closeout 2026-10-03) resolved GAP-071–GAP-073, GAP-075–GAP-077, GAP-079 (declaration resolvability only) and GAP-080, and registered GAP-082 (typed Vue props); GAP-064 stays PARTIAL and GAP-074, GAP-078 and GAP-081 remain open with approved designs. Record: `docs/architecture/research/2026-10-03-prime-parity-followup-closeout.md`. The approved-designs phase (`feature/prime-parity-approved-designs`, closeout 2026-10-03) resolved GAP-074, GAP-078 and GAP-081; GAP-064 (PARTIAL) and GAP-082 remain open. Record: `docs/architecture/research/2026-10-03-prime-parity-approved-designs-closeout.md`. GAP-082 (typed Vue props) was resolved on `feature/gap-082-typed-vue-props` (closeout 2026-10-04), which registered GAP-083 (Vue 3.5.0 declaration compatibility, pre-existing). Record: `docs/architecture/research/2026-10-04-gap-082-typed-vue-props-closeout.md`.

Five were open (§5) at the 2026-10-01 closeout; DECISION-F was decided on 2026-10-02 (Option 1), leaving four: external-runtime-dependency approval process (DECISION-B), Table/Data-component architecture (DECISION-C, now narrower still — Table's own composition question is substantially answered by real implementation, OrderList/PickList/DataView's relationship to it is resolved (2026-09-21, no new foundation required), and Table's own fuller filter-operator vocabulary is resolved (2026-09-23, all 18 `FilterMatchMode` values dispatched in all 3 frameworks); the remainder is TreeTable specifically, gated on the separate DECISION-D), the deliberately-protected Tree-family "do not reopen" marker (DECISION-D), and package-naming finalization (DECISION-E, correctly deferred to pre-1.0). **DECISION-A is now resolved by implementation** (Phase 10 Track A; ADR-044) — retained in §5 for historical continuity, not as an open item.

### Recommended Next Research

Two candidates, in order of cost-to-value ratio:
1. **DECISION-C's narrowed remainder** — the verification step this item originally recommended (confirming whether Table's proven composition pattern generalizes to TreeTable/OrderList/PickList/DataView, or whether each needs its own pass) has been completed for OrderList/PickList/DataView (2026-09-21, resolved: no new foundation required). Table's own fuller filter-operator vocabulary is also resolved (2026-09-23, see DECISION-C's own resolution paragraph). TreeTable remains excluded from both resolutions — its own blocker is Tree/DECISION-D, a separate, protected decision, not this item.
2. **DECISION-B** (external dependency approval process) — still the one open fork with no prior research investment at all; unlike DECISION-C, it requires an actual first architecture pass (Ultimate already has a working, generalizable process from Phase 0 to build on, per this entry's own recommendation in §5).

---

## 9. Uncertainty and `UNVERIFIED` items (consolidated)

For traceability, every claim flagged `UNVERIFIED` in the gap registry above is repeated here:

1. Whether Vue (`vue-core`) has the same `StyleSheet.createStyleElement` DOM-injection gap as Angular, or already works like React (GAP-003).
2. Whether `packages/themes/test/cross-framework-consistency.test.ts` actually resolves the GAP-003a contradiction between ADR-023/029 and the ROADMAP.md footnote — not read directly in this pass.
3. Whether React/Vue Tooltip components have the same `aria-describedby` gap Angular's does (GAP-006) — not independently checked.
4. Whether `vue-core` has adopted the shared `@ultimate/uix-utils/escape`/`zindex` registries the same way `react-core` has (GAP-007) — ADR-036 discusses the extraction but this pass did not re-verify Vue's consumption of it.
5. ~~Whether `scripts/provenance/validate-provenance.mjs` actually treats `sha256OfOriginal` as a required field~~ — **RESOLVED during Documentation Reconciliation**: read directly. It checks a `REQUIRED_HEADINGS` list against `PROVENANCE.md`'s own section headings, an entirely different mechanism than a per-manifest-JSON required-field check. Confirmed via grep of all 12 provenance manifests: zero contain `sha256OfOriginal`. This field is genuinely, confirmedly never enforced — the Phase 1/Phase 2 spec text naming it as required was itself corrected to match (GAP-010, **RESOLVED**, Blueprint Completion, 2026-09-13), rather than adding the field to any manifest.
6. Whether other frameworks' provenance manifests (`react.json`, `react-core.json`, `vue.json`, `vue-core.json`) have the same `sha256OfOriginal` gap as Angular's (GAP-010).
7. Whether React/Vue built an equivalent to Angular's missing `BaseModelHolder`/`BaseInput` tier (GAP-018) — React/Vue never had a full component inventory produced at all (per PROVENANCE.md's own admission), so this is genuinely unknown, not just unchecked.
8. Whether PrimeReact/PrimeVue have a Chart-equivalent component surfacing the same external-dependency question as Angular's Chart (GAP-019).
9. Whether React/Vue have an Editor/Quill-equivalent component (GAP-020).
10. ~~Whether `scripts/provenance/measure-package-size.mjs` was ever extended to cover `react*`/`vue*`/`themes` packages~~ — **RESOLVED during Documentation Reconciliation**: yes, by Phase 10 Track B, whose "Phase 10 — CI/Security/Quality Gates" `PERFORMANCE.md` section extends the script's scope to all 17 publishable packages, including `packages/react`/`packages/vue`/`packages/themes`. No dedicated Phase 3/4/5 *narrative* section exists, however (that remains a real, separate documentation gap — see GAP-037).
11. Whether any spec file anywhere in the repository exercises SSR/hydration behavior without an SSR-indicating filename (GAP-034) — only a filename-pattern scan was performed, not a content grep of every spec file.
12. Whether `vitest.config.ts` files anywhere in the repo declare a `coverage.thresholds` block despite no CI step consuming it (GAP-033) — individual config files were not opened in this pass.

None of these affect the registry's overall conclusions (the phase-completion picture, the empty-scaffolding phases, and the major cross-cutting tooling absences are all independently and directly confirmed), but each is a legitimate next check for whoever picks up the corresponding gap.
