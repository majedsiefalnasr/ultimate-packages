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
| 3 | UltimateReact | Complete | Confirmed — `react-core` + `react`, full 8-component proof set, per-component subpath exports present (unlike `ng`). |
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
- **Current evidence:** `packages/ng` now ships 8 real `ng-packagr` secondary entry points (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple` — every component directory confirmed to have zero cross-component source imports), each with its own `ng-package.json`/`lib.entryFile`, matching React's/Vue's per-component `exports` pattern. `button`, `dialog`, `menu`, and `table` are **not** split into secondary entry points: attempting all 12 surfaced a reproducible `ng-packagr@21.2.7`/`@angular/compiler-cli@21.2.22` crash (Angular's internal `ShimReferenceTagger` destructuring `undefined`) whenever one secondary entry point's source imports a file that is itself another secondary entry point's root, which is true for these 4 composites (`button`→`ripple`; `dialog`→`button`; `menu`→`ripple`,`tooltip`; `table`→`paginator`,`scroller`) — confirmed via isolated minimal repro, order-independent, not resolved by changing the import specifier, no newer 21.x patch available. `packages/ng/package.json` now declares a real `exports` map with a subpath per shipped component. `scripts/provenance/verify-tree-shaking.mjs`'s re-run result is documented in `docs/architecture/PERFORMANCE.md`'s tree-shaking section: still FAIL — but that script only ever exercises the *primary* `@ultimate/ng` barrel import (`UButton`), which is unaffected by this task since `button` is one of the 4 excluded composites; this gap is resolved for the 8 shipped components regardless, since the resolution criterion is the presence of real, working secondary entry points and a real `exports` map, not this specific script's unrelated `/* @__PURE__ */`-annotation limitation (Task 17's original finding, requires GAP-008's still-open real-consumer-app scope to fully resolve).
- **Expected state:** Either Angular ships secondary entry points matching React/Vue's per-component export pattern, or the spec is formally amended. **Partially met** — 8 of 12 components ship secondary entry points; `button`/`dialog`/`menu`/`table` are permanently excluded due to an upstream `ng-packagr` defect with no available fix, and this exclusion is itself the closure (there is no further action pending — the spec was amended to match reality).
- **Why it matters:** Historical — Angular is no longer the outlier among the three frameworks on this specific packaging capability, for the components where the underlying tooling permits it.
- **What it blocks:** Nothing — resolved (as amended).
- **Dependencies:** GAP-008 (a real consumer app remains the only way to fully re-measure tree-shaking through the real Angular linker) is unaffected by this resolution and remains separately open, per its own entry.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved. A future `ng-packagr`/`@angular/compiler-cli` upgrade past this defect could revisit `button`/`dialog`/`menu`/`table`, but no such fix exists as of this resolution.
- **Source/evidence:** `packages/ng/{checkbox,paginator,scroller,tooltip,autofocus,badge,fluid,ripple}/ng-package.json`; `packages/ng/package.json`; `docs/architecture/PERFORMANCE.md`; `docs/superpowers/specs/2026-09-13-blueprint-completion-design.md` WP1 amendment; commit `62575fb`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 4.
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
- **Status:** MISSING
- **Type:** Foundation, Component, Framework (Angular)
- **Blocking level:** BLOCKER (for the Form component family specifically)
- **Current evidence:** COMPONENT_INVENTORY.md's Form table, first row: *"BaseModelHolder / BaseInput (foundation tier, not yet built)... shared ngModel/native-input-value-binding tier that every native-input-wrapping form component (InputText, InputNumber, Textarea, etc.) would inherit from, per the Forms Architecture decision (spec: prevent per-component CVA/value-binding duplication)."* Risk noted as "Low — pattern already proven once by UBaseEditableHolder/UCheckbox in Phase 2."
- **Expected state:** Built once, before the first native-input form component (InputText is likely first, marked `Low` risk) migrates.
- **Why it matters:** Prevents ~20 components (InputText, InputNumber, InputMask, InputOTP, Textarea, Password, Knob, Rating, Slider, ToggleSwitch, RadioButton, ToggleButton, SelectButton, and more) from each reinventing CVA/value-binding wiring independently.
- **What it blocks:** All ~20 native-input-wrapping Form components in COMPONENT_INVENTORY.md's Form table.
- **Dependencies:** Extends `UBaseEditableHolder` (already built, Phase 2) — no upstream blocker.
- **Framework scope:** Angular. React/Vue equivalents' existence is `UNVERIFIED` in this pass — worth checking `react-core`/`vue-core` for an analogous tier before assuming Angular is uniquely behind (React/Vue's own Form-family inventories were never produced at all per GAP-017, so this may be equally true for both, just undocumented).
- **Existing reusable infrastructure:** `UBaseEditableHolder`/`UCheckbox` pattern (Phase 2), directly reusable design reference.
- **Recommended resolution direction:** Build `BaseModelHolder`/`BaseInput` as the first task of Angular's Form-family expansion, before any individual input component.
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` Form components table, row 1.
- **Architectural decision required:** No — pattern already established and approved (ADR-018's Option B posture extends naturally).

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

### DECISION-C — Data component architecture for Table/TreeTable specifically (not blocked by `uix-data`, but not yet started either) — PARTIALLY NARROWED, REMAINS OPEN

- **Question:** `uix-data` deliberately ships only the narrow, cross-framework-verified primitives. The actual `Table` component (and its dependents: TreeTable, Scroller, Paginator internal-consumer relationship) still needs its own per-framework architecture decision — how selection/sort/filter/pagination/virtualization primitives compose into a real, framework-native Table implementation.
- **Current evidence:** COMPONENT_INVENTORY.md marks Table `NEEDS ARCHITECTURE DECISION`, `High` risk, explicitly separate from the (now-resolved) shared-primitives question ADR-043 answered. **Confirmed during Documentation Reconciliation, by direct read of the Table implementation plan (`docs/superpowers/plans/2026-09-02-table-component-implementation.md`) Tasks 5/13/19:** Table's own proof-set architecture is no longer "unstarted" — it shipped for all 3 frameworks, composing real `UPaginator`/`UScroller` instances, with real sort/selection/row-editing/row-grouping. GAP-014 (filter operator/constraints) is separately, correctly marked `RESOLVED` on the strength of these same tasks. **However, the resolution is narrower than this decision's own full scope:** Task 5's own heading is explicit — "**scope narrowed to string match modes**" (`contains`/`startsWith`/`equals` for Angular; `contains` only for React/Vue) — the plan's own Acceptance Criteria section states this outcome is "**Narrower than spec §9's full `FilterMatchMode` vocabulary**." Numeric/set/date/custom filter modes remain explicitly deferred, not implemented. Additionally, this decision's own scope names 7 Data-family rows (Table, TreeTable, Scroller, Paginator, OrderList, PickList, DataView); only Table/Scroller/Paginator have shipped — TreeTable, OrderList, PickList, DataView remain unbuilt.
- **Options:** No longer "not yet had even a first research pass" — real, shipped, tested, cross-framework evidence now exists for Table's own composition question specifically. What remains open is (1) the fuller filter-operator vocabulary beyond string match modes, and (2) whether Table's now-proven composition pattern (Paginator/Scroller/sort/selection/editing) should be treated as the answer for TreeTable/OrderList/PickList/DataView too, or whether each needs its own pass.
- **Affected areas:** TreeTable, OrderList, PickList, DataView remain gated on this decision's fuller resolution. Table/Scroller/Paginator's own architecture question is substantially answered by real implementation, not merely a research pass.
- **Recommendation:** None made here, per this document's scope limits — flagging the narrowed, still-genuinely-open remainder for a future architecture pass, not resolving it.
- **Source/evidence:** `docs/superpowers/plans/2026-09-02-table-component-implementation.md` Tasks 5, 13, 19, and its "Acceptance Criteria" section; GAP-014 (above); `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §5.

### DECISION-D — Hierarchical (Tree-family) shared contract (do-not-open marker)

- **Question:** Restated from GAP-013 for visibility in this section: should Tree/TreeTable/TreeSelect/OrganizationChart ever get a shared cross-framework contract?
- **Current evidence:** ADR-043 already answered this for the *current* evidence: no, structurally incompatible.
- **Options:** N/A — not re-litigated here.
- **Affected areas:** Tree-family components only.
- **Recommendation:** **Do not open this decision without new repository evidence** (per this task's Critical Operating Rule 5, extended by analogy — ADR-043's Tree-family finding deserves the same protection as `uix-data`'s own scope, since it was produced by the same six-pass research effort). Revisit only when a real Tree implementation surfaces genuine new evidence.

### DECISION-E — Package naming finalization (`@ultimate/uix-data` and all others)

- **Question:** Blueprint §34 requires final package names to be validated (npm availability, internal conventions, scope ownership, long-term clarity) "before the first stable public release." No package has undergone this validation yet — all remain explicitly provisional (uix-data's README states this most recently and explicitly).
- **Current evidence:** Every package is at `0.1.0`, pre-1.0, provisional per §34's own framing.
- **Options:** Not enumerated — this is a single validation pass across all ~17 package names at once, not a per-package fork.
- **Affected areas:** Every package.
- **Recommendation:** None — correctly deferred per Blueprint §34's own stated gate ("before the first stable public release"), not urgent now.

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
- **GAP-018** (Angular `BaseModelHolder`/`BaseInput`) — unlocks the entire ~20-component native-input Form family; low risk per its own inventory entry, high leverage. **Still the most valuable remaining item in this group.**
- ~~**GAP-009 / GAP-023** (Angular secondary entry points)~~ — **RESOLVED** (commit `62575fb`, Blueprint Completion, 2026-09-13) for 8 of 12 components; `button`/`dialog`/`menu`/`table` permanently excluded by an upstream `ng-packagr` defect (see GAP-009's entry).
Why here: each is small, evidence-backed, has a proven pattern to copy from a sibling framework, and unblocks a materially larger downstream body of work.

### Group: Component-enabling foundations
- **GAP-008** (real consumer app, at least one per framework) — this is likely the single highest-leverage item in the entire registry: it unblocks genuine tree-shaking numbers, genuine SSR/hydration verification, genuine bundle-size/runtime benchmarking, and genuine end-to-end visual proof of GAP-003's fix.
- **GAP-022's successor state** — once a second real overlay component is planned, extract the shared orchestration pattern ADR-020 deferred (not urgent now, but sequenced here because it's a "when a second consumer exists" trigger, and GAP-008's playground app is a plausible source of that second consumer).

### Group: Component family expansion
- Form family (after GAP-018), Overlay family (after the second-consumer trigger above), Navigation family, Panel/Layout/Display family — all `ADAPT`-classified, low architectural risk, proven pattern from the now-8-component proof set across 3 frameworks (GAP-017).
- Data family — **Table, Scroller, Paginator have shipped** (3 of 8 rows) with real, tested, framework-native composition (see DECISION-C's updated entry in §5). TreeTable, OrderList, PickList, DataView (4 rows) remain blocked on DECISION-C's still-open, now-narrower remainder; Tree itself (1 row) remains correctly deferred per GAP-013/DECISION-D.
- Visualization/Editor — blocked on DECISION-B (external dependency policy), still genuinely open.

### Group: Framework parity
- No forced-parity work is recommended — GAP-024/GAP-025 document that current divergence is evidence-based and correct. The only real parity item, GAP-009/GAP-023 (Angular exports), is now resolved (8 of 12 components; see Foundation blockers above).

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
- **DECISION-C** (Table/Data architecture, now narrower — see §5) blocks TreeTable/OrderList/PickList/DataView's fuller feature sets.
- **GAP-013/DECISION-D** (Tree-family contract) blocks Tree/TreeTable/TreeSelect/OrganizationChart, correctly and deliberately.

Everything else — including the much larger remaining component backlog, and every Production Hardening item — is independently addressable ordinary implementation backlog, not an architectural blocker. (GAP-027, previously listed here as a blocker for MCP/AI Skills, is now resolved — both downstream phases have shipped.)

### Independent Work

The great majority of gaps in this registry can be started without waiting on any other gap or decision: GAP-002/GAP-012 (documentation hygiene), GAP-037 (small documentation backlog — GAP-006/GAP-007/GAP-009/GAP-010/GAP-023/GAP-036, the other isolated Angular/artifact fixes once listed alongside it here, are now resolved by the Blueprint Completion workstream), and most of the Component/Panel/Navigation family expansion once GAP-018 lands.

### Open Architectural Decisions

Four remain genuinely open (§5): external-runtime-dependency approval process (DECISION-B), Table/Data-component architecture (DECISION-C, now narrower — Table's own composition question is substantially answered by real implementation; the remainder is the fuller filter-operator vocabulary and the 4 still-unbuilt Data-family rows), the deliberately-protected Tree-family "do not reopen" marker (DECISION-D), and package-naming finalization (DECISION-E, correctly deferred to pre-1.0). **DECISION-A is now resolved by implementation** (Phase 10 Track A; ADR-044) — retained in §5 for historical continuity, not as an open item.

### Recommended Next Research

Two candidates, in order of cost-to-value ratio:
1. **DECISION-C's narrowed remainder** — the cheapest possible next step is verification, not new research: confirm whether the Table implementation plan's proven composition pattern (Paginator/Scroller/sort/selection/editing) should be the template for TreeTable/OrderList/PickList/DataView, or whether each genuinely needs its own pass. This could retire most of an open decision at near-zero cost.
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
