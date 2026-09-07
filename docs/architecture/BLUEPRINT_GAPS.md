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

Source: `docs/architecture/ROADMAP.md`, cross-checked against `docs/superpowers/plans/*` and actual package contents.

| Phase | Name | Blueprint status | Repo-verified status |
|---|---|---|---|
| 0 | Baseline/Provenance/Repository | Complete | Confirmed — `docs/architecture/{PROVENANCE,DEPENDENCIES,COMPATIBILITY,checksums.json}` all populated with commit SHAs/tarball hashes for PrimeNG/PrimeVue/PrimeReact/4×`@primeuix/*`. |
| 1 | UltimateUIX Foundation | Complete | Confirmed — `uix-utils`, `uix-styled`, `uix-styles` (base module only, ADR-017), `uix-motion` all have `package.json`, `src/`, tests, provenance JSON. |
| 2 | UltimateNG | Complete | Confirmed — `ng-core` + `ng` build, 5-component proof set (Button/Checkbox/Dialog/Menu/Tooltip) + primitives, 18 test files total. Six follow-ups explicitly left open by ADR-023 (see GAP-004–GAP-009 below). |
| 3 | UltimateReact | Complete | Confirmed — `react-core` + `react`, same 5-component proof set, per-component subpath exports present (unlike `ng`). |
| 4 | UltimateVue | Complete | Confirmed — `vue-core` + `vue`, same 5-component proof set + `v-ripple`/`v-tooltip` directives, Options-API `extends` mixin architecture (ADR-032). |
| 5 | Themes | Complete, with a footnoted exception | Confirmed — `packages/themes` (Aura preset, 5-component proof set). Footnote in `ROADMAP.md` itself: React components use hand-written static CSS, not `dt()` token calls — cross-framework theme consistency is proven at the `react-core` registration layer only, not through a real React component's CSS. |
| 6 | Component Metadata | Not started | Confirmed — `packages/component-schema`, `packages/component-metadata` contain only `.gitkeep`. |
| 7 | CLI | Not started | Confirmed — `packages/cli` contains only `.gitkeep`. |
| 8 | MCP | Not started | Confirmed — `packages/mcp` contains only `.gitkeep`. |
| 9 | AI Skills / LLM Context | Not started | Confirmed — `packages/ai` contains only `.gitkeep`; `skills/` and `tooling/` at repo root are also empty (`.gitkeep` only). |
| 10 | Production Hardening | Not started | Confirmed — no SECURITY.md, no CONTRIBUTING.md, no CHANGELOG.md, no visual-regression/a11y-scanning tooling anywhere in the tree (see §9). |

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
- **Status:** MISSING
- **Type:** Foundation, Styling, Framework (Angular)
- **Blocking level:** HIGH
- **Current evidence:** ADR-023 follow-up 6 and ADR-029 both document this directly: `ngCoreStyleSheet` never overrides `StyleSheet.createStyleElement`, so Angular's style-registration path only dedups metadata — no `<style>` element is ever appended to the DOM for `@ultimate/ng` components. React's `ReactStyleSheet` (Phase 3) already demonstrates the fix pattern (subclassing `StyleSheet`, delegating to `@ultimate/uix-utils/dom`'s `createStyleElement`). Vue is `UNVERIFIED` for this specific mechanism — not directly re-confirmed in this pass; ADR-036 discusses escape/scroll-lock extraction but not style injection.
- **Expected state:** Angular components' CSS is actually injected into the DOM at runtime, matching React's already-working mechanism.
- **Why it matters:** This is a real functional gap in a **shipped, "Phase 2 Complete"** package — Angular's 5-component proof set currently has no working runtime styling path, which the theme system (Phase 5) depends on to render anything visibly.
- **What it blocks:** Any real visual usage of `@ultimate/ng` components; Phase 5's cross-framework theme consistency claim for Angular (though `ROADMAP.md`'s footnote says Angular's path *is* proven end-to-end — this needs reconciling, see GAP-003a below).
- **Dependencies:** None — the fix pattern already exists in `react-core`.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** `@ultimate/uix-utils/dom`'s `createStyleElement`; `react-core/ReactStyleSheet` as a direct template.
- **Recommended resolution direction:** Port the `ReactStyleSheet` subclassing pattern into `ng-core`.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-023 follow-up 6, ADR-029.
- **Architectural decision required:** No — mechanical fix, pattern already approved and shipped for React.

#### GAP-003a — Apparent contradiction: ADR-023/029 say Angular style injection is a no-op, but `ROADMAP.md` footnote says Angular's theme path is proven end-to-end
- **Status:** DOCUMENTATION-GAP
- **Type:** Documentation, Architecture
- **Blocking level:** MEDIUM
- **Current evidence:** `ROADMAP.md` footnote 1: *"Cross-framework theme consistency is proven end-to-end for Vue and Angular. React's components... do not yet source their CSS from `@ultimate/uix-styles`."* This directly conflicts with ADR-023/ADR-029's claim that Angular's `createStyleElement` override is missing and no `<style>` tag is ever injected. Not independently re-verified against `packages/themes/test/cross-framework-consistency.test.ts` in this pass — flagged rather than resolved.
- **Expected state:** One authoritative statement. Either the ROADMAP footnote is wrong (Angular's theme proof is at the token-resolution layer, not the DOM-injection layer, same caveat as React), or ADR-023/029 are stale and Angular's style injection was fixed silently between Phase 2 and Phase 5 without a corresponding ADR update.
- **Why it matters:** Whichever is true, current docs are internally inconsistent about a production-readiness-relevant fact (whether shipped Angular components actually render styled).
- **What it blocks:** Confidence in the Phase 5 exit claim.
- **Dependencies:** GAP-003.
- **Framework scope:** Angular.
- **Existing reusable infrastructure:** `packages/themes/test/cross-framework-consistency.test.ts` (unread in this pass — read it first).
- **Recommended resolution direction:** Read the cross-framework-consistency test directly, determine which document is stale, correct it.
- **Source/evidence:** `docs/architecture/ROADMAP.md` footnote 1 vs. `docs/architecture/DECISIONS.md` ADR-023/ADR-029.
- **Architectural decision required:** No — factual reconciliation.

#### GAP-004 — No visual regression / Storybook / screenshot tooling anywhere in the repository
- **Status:** MISSING
- **Type:** Testing, CI, Production
- **Blocking level:** HIGH
- **Current evidence:** Repository-wide `grep` for `storybook|playwright|chromatic|percy|axe-core` across every `package.json` returns zero matches. ADR-023 explicitly names this as an accepted Phase 2 gap ("zero Storybook, screenshot, or visual-regression tooling exists anywhere in the repository").
- **Expected state:** Per Blueprint §28 ("Visual Regression: Use stable theme/component combinations") and §40 (Definition of Done requires "visual regression coverage").
- **Why it matters:** Blocks Production Hardening (Phase 10) exit criteria directly; blocks confident theme/component changes across 3 frameworks without visual proof.
- **What it blocks:** Phase 10 exit; safe refactoring of any styled component.
- **Dependencies:** None architecturally — tooling choice only.
- **Framework scope:** Cross-framework (Angular/React/Vue all need coverage).
- **Existing reusable infrastructure:** None yet; `packages/themes`' Aura preset + 5-component proof set across 3 frameworks is a ready-made target surface.
- **Recommended resolution direction:** Directional only — evaluate Storybook (also serves Blueprint §27's documentation-surface requirement) vs. a lighter screenshot-diff tool.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-023; grep across `packages/*/package.json`.
- **Architectural decision required:** Yes — tooling choice, see Open Architectural Decisions §6.

#### GAP-005 — No automated accessibility scanning (axe-core or equivalent) anywhere
- **Status:** MISSING
- **Type:** Accessibility, Testing, CI
- **Blocking level:** HIGH
- **Current evidence:** Same grep as GAP-004 — zero `axe-core` references. ADR-023 confirms: "no automated scanning tool such as axe-core is wired in" for Phase 2; accessibility claims for all 3 frameworks rest on manually-written `TestBed`/`@testing-library`/`@vue/test-utils` assertions checking specific ARIA attributes, not automated audits.
- **Expected state:** Blueprint §28 requires "Automated checks plus targeted keyboard/screen-reader behavior tests" and §30 states "Accessibility regressions are release blockers."
- **Why it matters:** Without automated scanning, accessibility is only as good as what a human thought to hand-write a test for. `UTooltip`'s known gap (GAP-006) is exactly the kind of thing an automated scan would have caught.
- **What it blocks:** Phase 10 exit; confident accessibility claims for any component, present or future.
- **Dependencies:** None.
- **Framework scope:** Cross-framework.
- **Existing reusable infrastructure:** Existing `TestBed`/`@testing-library/react`/`@vue/test-utils` test harnesses in all three framework packages are the integration points axe-core would hook into.
- **Recommended resolution direction:** Directional only — wire `axe-core` (or `jest-axe`/`vitest-axe` equivalent) into each framework's existing test harness.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-023; grep.
- **Architectural decision required:** No — clear Blueprint requirement, tooling choice is narrow (axe-core is close to the only mature option).

#### GAP-006 — `UTooltip` (Angular) has `role="tooltip"` but no `aria-describedby` wiring
- **Status:** PARTIAL
- **Type:** Accessibility, Component, Framework (Angular)
- **Blocking level:** LOW
- **Current evidence:** ADR-023 follow-up 4, stated directly: *"UTooltip's floating container has role="tooltip" but no aria-describedby wired from the trigger element back to it — a real, specific accessibility gap."*
- **Expected state:** Trigger element has `aria-describedby` pointing at the tooltip's id when visible.
- **Why it matters:** Screen readers cannot associate the tooltip text with its trigger.
- **What it blocks:** Nothing else — isolated, single-component fix.
- **Dependencies:** None.
- **Framework scope:** Angular only (React/Vue Tooltip `aria-describedby` status is `UNVERIFIED` in this pass — not independently checked; worth the same check).
- **Existing reusable infrastructure:** N/A — direct fix.
- **Recommended resolution direction:** Wire the id association directly.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-023 follow-up 4.
- **Architectural decision required:** No.

#### GAP-007 — Angular `UDialog` overlay has a single z-index bucket — no working multi-dialog stacking order
- **Status:** MISSING
- **Type:** Accessibility, Overlay/Interaction, Component, Framework (Angular)
- **Blocking level:** MEDIUM
- **Current evidence:** ADR-020, stated directly: `UOverlay` hardcodes a single `"overlay"` z-index bucket for every instance; `UDialog`'s Escape handling is "a plain, unconditional `keydown.escape` host listener" with no topmost-z-index check — accepted because there was no real multi-dialog scenario yet to guard against.
- **Expected state:** React already solved this problem class for its own framework: ADR-026 documents `react-core`'s `useGlobalEscapeKey`/`useDisplayOrder` as "a centralized priority-queue mechanism," explicitly noted as "verifiably more correct than Angular's existing UDialog Escape handling" — and explicitly states fixing Angular is "tracked separately," i.e., this exact gap.
- **Why it matters:** Blocks any future component needing correct nested-overlay behavior (Popover, Drawer, ConfirmDialog, ContextMenu, MegaMenu, Menubar, PanelMenu, TieredMenu, SpeedDial, SplitButton — see COMPONENT_INVENTORY.md's Overlay/Navigation tables, all "Later Phase").
- **What it blocks:** Every future Angular overlay component that needs correct stacking (9+ components in COMPONENT_INVENTORY.md's Overlay/Navigation tables).
- **Dependencies:** None architecturally — `@ultimate/uix-utils/escape` and `@ultimate/uix-utils/zindex` submodules already exist (extracted from `react-core` per ADR-036) and are framework-neutral; Angular simply hasn't adopted them yet.
- **Framework scope:** Angular only — React and Vue already have working priority-queue Escape handling per ADR-026/ADR-036.
- **Existing reusable infrastructure:** `@ultimate/uix-utils/escape`, `@ultimate/uix-utils/zindex` (already shared, already consumed by `react-core`; `vue-core` status for this specific registry is `UNVERIFIED` in this pass).
- **Recommended resolution direction:** Angular's `UOverlay`/`UDialog` adopt the shared `uix-utils/escape` + `zindex` registries the same way `react-core` already does.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-020, ADR-026, ADR-036.
- **Architectural decision required:** No — pattern and shared infrastructure already exist and are approved; this is implementation backlog, not a fork.

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
- **Architectural decision required:** No.

#### GAP-009 — Angular tree-shaking verified broken; `ng` ships a single barrel instead of the originally-planned 9 secondary entry points
- **Status:** IMPLEMENTED-BUT-NOT-ENFORCED (broken, and known-broken)
- **Type:** Packaging, Framework (Angular), Testing
- **Blocking level:** MEDIUM
- **Current evidence:** `PERFORMANCE.md` Phase 2 section: `scripts/provenance/verify-tree-shaking.mjs` "still fails" — "importing only UButton pulled in Dialog-related code." Root cause per ADR-023 follow-up 5 and the Phase 2 spec: the spec originally committed to 9 secondary entry points in `ng-package.json` for per-component imports; implementation shipped a single-barrel `entryFile` instead, and the plan text was corrected mid-Phase-2 to match (not silently diverged — but the original spec commitment was not honored). React (`packages/react`) does have per-component subpath exports (`./button`, `./checkbox`, `./dialog`, `./menu`, `./tooltip` — confirmed in `package.json`); Vue likewise has per-component subpaths. Angular is the outlier.
- **Expected state:** Either Angular ships secondary entry points matching React/Vue's per-component export pattern, or the spec is formally amended to stop claiming that as the build strategy (ADR-023 follow-up 5 already frames it as an either/or).
- **Why it matters:** Tree-shaking is an explicit Blueprint §28/§31/§40 requirement ("tree-shaking," "bundle-size monitoring," "tree-shaking verification" all listed as Definition-of-Done items). Currently verified failing for one of three frameworks.
- **What it blocks:** Confident bundle-size claims for `@ultimate/ng`; framework parity between Angular/React/Vue on this specific capability.
- **Dependencies:** GAP-008 (a real consumer app running through the actual Angular linker is the only way to re-measure this correctly — `ng-packagr`'s own partial-Ivy output cannot be judged by a generic bundler).
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** React/Vue's existing per-component `exports` map is the direct pattern to replicate; `scripts/provenance/verify-tree-shaking.mjs` (and its React/Vue siblings, confirmed present: `verify-tree-shaking-react.mjs`, `verify-tree-shaking-vue.mjs`) already exist as the verification mechanism.
- **Recommended resolution direction:** Implement Angular secondary entry points; re-run `verify-tree-shaking.mjs` against a real app build (post GAP-008).
- **Source/evidence:** `docs/architecture/PERFORMANCE.md` "Tree-shaking spot-check (Task 17 re-confirmation)"; `docs/architecture/DECISIONS.md` ADR-023 follow-up 5; `packages/ng/package.json` (single `main`/`module`/`types`, no `exports` map) vs. `packages/react/package.json` / `packages/vue/package.json` (both have per-component `exports`).
- **Architectural decision required:** No — this is a return to the already-approved original spec commitment, not a new decision.

#### GAP-010 — Provenance manifest schema names `sha256OfOriginal` as required; neither `ng.json` nor `ng-core.json` has it
- **Status:** IMPLEMENTED-BUT-NOT-ENFORCED
- **Type:** Provenance, CI
- **Blocking level:** LOW
- **Current evidence:** ADR-023 follow-up 3, stated directly: the Phase 2 spec (line 388) names `sha256OfOriginal` as a required manifest field; neither `docs/architecture/provenance/ng.json` nor `ng-core.json` has it.
- **Expected state:** Either the field is added to both manifests, or the spec is amended to stop requiring it.
- **Why it matters:** `scripts/provenance/validate-provenance.mjs` runs in CI (`.github/workflows/ci.yml` step "Provenance validation") — if this field is genuinely required by the schema the validator checks against, this should be a CI failure; if it isn't failing CI, the validator isn't actually enforcing its own documented schema (an `IMPLEMENTED-BUT-NOT-ENFORCED` pattern). Not independently re-verified against the validator's actual field list in this pass — `UNVERIFIED` whether `validate-provenance.mjs` treats this field as required or optional.
- **What it blocks:** Full confidence that CI provenance validation matches its documented schema.
- **Dependencies:** None.
- **Framework scope:** Angular only (other frameworks' manifests not cross-checked for the same field in this pass — `UNVERIFIED`).
- **Existing reusable infrastructure:** `scripts/provenance/validate-provenance.mjs` already runs in CI.
- **Recommended resolution direction:** Read `validate-provenance.mjs`'s actual required-field list, reconcile the two manifests or the spec.
- **Source/evidence:** `docs/architecture/DECISIONS.md` ADR-023 follow-up 3.
- **Architectural decision required:** No.

#### GAP-011 — No `SECURITY.md`, `CONTRIBUTING.md`, or `CHANGELOG.md` anywhere in the repository
- **Status:** MISSING
- **Type:** Documentation, Production
- **Blocking level:** MEDIUM
- **Current evidence:** Direct `ls` check at repo root: none of the three files exist. `.changeset/config.json` exists and is configured (`changelog: "@changesets/cli/changelog"`), but no changeset has ever been consumed/released (all packages remain at `0.1.0`, no `CHANGELOG.md` generated).
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
- **Status:** PARTIAL
- **Type:** Packaging, Framework
- **Blocking level:** MEDIUM
- **Current evidence:** Direct `package.json` comparison: `packages/react/package.json` and `packages/vue/package.json` both declare an `exports` map with `./button`, `./checkbox`, `./dialog`, `./menu`, `./tooltip` subpaths. `packages/ng/package.json` declares only `main`/`module`/`types` (no `exports` map at all — single-barrel).
- **Expected state:** This is the same underlying fact as GAP-009 (Angular tree-shaking failure) — the two are one gap viewed from two angles (packaging shape vs. its measured consequence).
- **Why it matters:** See GAP-009.
- **What it blocks:** See GAP-009.
- **Dependencies:** Same as GAP-009.
- **Framework scope:** Angular only, relative to React/Vue.
- **Existing reusable infrastructure:** React/Vue's `exports` maps as direct templates.
- **Recommended resolution direction:** Same as GAP-009 — implement Angular secondary entry points via `ng-packagr`.
- **Source/evidence:** `packages/{ng,react,vue}/package.json` `exports` fields, direct comparison.
- **Architectural decision required:** No — duplicate framing of GAP-009; kept as a separate ID only because it surfaces independently in a package-manifest audit, not to double-count in the executive summary.

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
- **Status:** MISSING
- **Type:** AI, Documentation
- **Blocking level:** MEDIUM
- **Current evidence:** `packages/ai` and repo-root `skills/` both contain only `.gitkeep`. `ROADMAP.md`: "Not started."
- **Expected state:** Blueprint §24/§25/§26/ADR-011/ADR-012 — Skills as operational guidance (not just docs), versioned and tied to metadata versions; generated `llms.txt`/`llms-full.txt` outputs that are not the primary source of truth.
- **Why it matters:** Named directly in Blueprint §40 Definition of Done.
- **What it blocks:** Nothing else architecturally — leaf consumer per §6's dependency diagram.
- **Dependencies:** Depends on GAP-027 (metadata) per §24's own stated design ("Skills may be human-authored but should reference canonical component metadata").
- **Framework scope:** Cross-framework, plus framework-specific guidance per skill (§24).
- **Existing reusable infrastructure:** This very document's Superpowers-workflow discipline (specs → plans → implementation → verification, all recorded in `docs/superpowers/`) is itself a working example of the "operational AI guidance" pattern Blueprint §24 describes — worth studying as a template when Phase 9 begins, though it is process tooling for building Ultimate, not a Skill about using Ultimate's own components.
- **Recommended resolution direction:** Directional only.
- **Source/evidence:** `packages/ai/`, `skills/` (both `.gitkeep`-only); `docs/architecture/BLUEPRINT.md` §24/§25/§26.
- **Architectural decision required:** No — Blueprint is directive; real prerequisite is GAP-027.

### Production readiness (Phase 10)

#### GAP-031 — No dependency/license/SAST scanning wired into CI
- **Status:** MISSING
- **Type:** CI, Production, Licensing
- **Blocking level:** HIGH
- **Current evidence:** `.github/workflows/ci.yml` (the only workflow file in `.github/workflows/`) runs: checkout, pnpm install, lint, format:check, typecheck, build, test, provenance scripts self-tests, provenance validation, boundary validation, dependency-ceiling validation. No `npm audit`/`pnpm audit`, no license-scanner (e.g. `license-checker`), no SAST tool (e.g. CodeQL, Semgrep) step anywhere.
- **Expected state:** Blueprint §29: "dependency scanning, license scanning, SAST where appropriate, vulnerability monitoring" as part of the security process.
- **Why it matters:** Directly named Phase 10 requirement; currently zero automated coverage of any of these three specific items, distinct from the provenance/boundary/ceiling checks that already exist and cover a different concern (Prime-source-lineage integrity, not general dependency vulnerability/license risk).
- **What it blocks:** Phase 10 exit.
- **Dependencies:** None.
- **Framework scope:** N/A.
- **Existing reusable infrastructure:** The existing `provenance:validate`/`boundary:validate`/`ceiling:validate` CI steps are a strong precedent for how to wire in a new scanning step the same way.
- **Recommended resolution direction:** Directional only — add `pnpm audit` (or equivalent) plus a license-scanner and a SAST tool as new CI steps, following the existing steps' pattern.
- **Source/evidence:** `.github/workflows/ci.yml` (full file, 8 steps, none matching this gap).
- **Architectural decision required:** No — tooling choice only.

#### GAP-032 — No bundle-size monitoring / size-limit tooling in CI (distinct from the one-time `PERFORMANCE.md` snapshot)
- **Status:** IMPLEMENTED-BUT-NOT-ENFORCED
- **Type:** CI, Production, Packaging
- **Blocking level:** MEDIUM
- **Current evidence:** `scripts/provenance/measure-package-size.mjs` exists and has been run manually twice (Phase 1, Phase 2) with results recorded in `PERFORMANCE.md` — but it is not a CI step in `ci.yml`, and there is no `size-limit`/`bundlewatch`/equivalent CI-enforced budget (confirmed via grep — zero matches across all `package.json` files).
- **Expected state:** Blueprint §31: "Do not optimize based on assumptions; establish benchmarks" — benchmarks exist (`PERFORMANCE.md`), but nothing prevents them from silently regressing since the measurement script isn't wired into CI.
- **Why it matters:** The measurement capability exists and has produced real numbers twice — the gap is specifically that nothing *enforces* those numbers going forward. This is exactly the "implemented vs. verified vs. CI-enforced" distinction the task brief calls mandatory.
- **What it blocks:** Confident claims of "bundle-size monitoring" (§31, §40) as opposed to "bundle-size was measured twice, manually, and could regress silently since."
- **Dependencies:** None.
- **Framework scope:** All packages the script already covers (`uix*`, `ng*` — `UNVERIFIED` whether it was extended to `react*`/`vue*`/`themes` after Phase 2; `PERFORMANCE.md` shows only Phase 1/Phase 2 sections).
- **Existing reusable infrastructure:** `scripts/provenance/measure-package-size.mjs` already exists and works — the gap is purely "not wired into CI as a gate," not "doesn't exist."
- **Recommended resolution direction:** Add `measure-package-size.mjs` (extended to cover all packages) as a CI step, with either a hard budget or a regression-detection diff against the last recorded baseline.
- **Source/evidence:** `scripts/provenance/measure-package-size.mjs`; `docs/architecture/PERFORMANCE.md`; `.github/workflows/ci.yml` (no matching step).
- **Architectural decision required:** No.

#### GAP-033 — Test suites run, but no coverage threshold is enforced anywhere in CI
- **Status:** IMPLEMENTED-BUT-NOT-ENFORCED
- **Type:** CI, Testing
- **Blocking level:** MEDIUM
- **Current evidence:** `ci.yml`'s "Test" step runs `pnpm run test` (→ `pnpm -r --if-present run test`), which does execute real tests (verified: 96 total test files across all packages inspected in this pass — 10+5+10+3+4+8+10+12+6+14+7+7). No `--coverage` flag, no coverage-threshold config (`vitest.config.ts` files not individually re-checked for a `coverage.thresholds` block in this pass — `UNVERIFIED`, but no coverage-reporting step or badge exists at the CI/repo level regardless of per-package config).
- **Expected state:** Blueprint §40: "test coverage enforcement" listed as a Definition-of-Done item.
- **Why it matters:** Tests running ≠ tests enforced-at-a-threshold — exactly the implemented/verified/CI-enforced distinction the task brief requires flagging.
- **What it blocks:** Confident "test coverage enforcement" claim.
- **Dependencies:** None.
- **Framework scope:** All packages.
- **Existing reusable infrastructure:** Vitest (used everywhere per ADR-022's "Vitest-everywhere consistency") has built-in coverage support (`@vitest/coverage-v8` or similar) — no new test runner needed, only configuration.
- **Recommended resolution direction:** Add coverage collection + a threshold gate to the existing CI test step.
- **Source/evidence:** `.github/workflows/ci.yml`; test-file counts gathered via `find`.
- **Architectural decision required:** No.

#### GAP-034 — No SSR/hydration verification anywhere (Angular has an `isPlatformBrowser()` guard; no test proves SSR actually works end-to-end)
- **Status:** IMPLEMENTED-BUT-UNVERIFIED
- **Type:** Testing, Framework, Production
- **Blocking level:** MEDIUM
- **Current evidence:** COMPONENT_INVENTORY.md's FocusTrap+Overlay row notes `isPlatformBrowser()`-guarded code — evidence of SSR-awareness in the implementation. No test file name matching `ssr`/`hydrat` was found in this pass (not exhaustively grepped for content, only scanned via directory listings — `UNVERIFIED` whether any spec file exercises SSR indirectly without an SSR-indicating filename).
- **Expected state:** Blueprint §13 requires Angular to independently track "SSR, hydration" as a compatibility responsibility; §14 the same for React/Vue; §28's Build/Package testing tier requires verifying "SSR where supported."
- **Why it matters:** SSR-awareness in the code (the guard) is necessary but not sufficient evidence that SSR/hydration actually works correctly end-to-end.
- **What it blocks:** Confident SSR support claims for any framework.
- **Dependencies:** GAP-008 (a real consumer app is likely the most realistic way to exercise real SSR/hydration, e.g. an Angular Universal or Next.js/Nuxt playground).
- **Framework scope:** Cross-framework.
- **Existing reusable infrastructure:** The `isPlatformBrowser()` guard pattern already exists in Angular's Overlay/FocusTrap as a starting point.
- **Recommended resolution direction:** Directional only — likely folds into GAP-008's real-consumer-app work, using an SSR-capable app shell for at least one framework.
- **Source/evidence:** `docs/architecture/COMPONENT_INVENTORY.md` FocusTrap+Overlay row; directory-listing scan for SSR-named test files (none found, not exhaustive).
- **Architectural decision required:** No.

#### GAP-035 — No browser-compatibility testing (real-browser or cross-browser) — all tests run under jsdom/Vitest/TestBed
- **Status:** MISSING
- **Type:** Testing, Production
- **Blocking level:** LOW
- **Current evidence:** Every framework package's test setup uses `jsdom` (confirmed as a `devDependency` in `uix-utils`, `uix-styled`, `uix-motion`, `react-core`, `vue-core` `package.json` files) or Angular's `TestBed` (which also runs in a simulated DOM, not a real browser engine) — no Playwright/Cypress/WebdriverIO/BrowserStack reference found anywhere (same grep as GAP-004).
- **Expected state:** Blueprint §28/§31/§40 all reference "browser compatibility" as a testing/production requirement.
- **Why it matters:** jsdom is not a real browser — layout, real focus/ARIA computed-role behavior, and real CSS cascade/paint behavior can all diverge from jsdom's approximation.
- **What it blocks:** Phase 10 exit; genuine confidence in accessibility/interaction claims currently verified only against jsdom.
- **Dependencies:** Likely bundled with GAP-004's visual-regression tooling choice (Playwright serves both real-browser interaction testing and screenshot-diffing use cases) — recommend deciding together.
- **Framework scope:** Cross-framework.
- **Existing reusable infrastructure:** None yet.
- **Recommended resolution direction:** Directional only — likely resolved by the same tooling decision as GAP-004.
- **Source/evidence:** grep across `package.json` files for `jsdom` vs. real-browser test runners.
- **Architectural decision required:** Bundled into GAP-004's Open Architectural Decision.

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

### DECISION-A — Visual regression + real-browser testing tooling choice

- **Question:** What tool(s) provide visual regression (Blueprint §28) and real-browser/cross-browser interaction testing (§28/§31), and should the same tool serve both needs?
- **Current evidence:** Zero tooling exists today (GAP-004, GAP-035). ADR-023 explicitly names this as an accepted, deferred Phase 2 gap, not yet resolved by any later phase.
- **Options:** (a) Storybook + a screenshot-diff addon (also serves Blueprint §27's documentation-surface requirement, giving two wins from one tool); (b) Playwright alone (serves real-browser interaction + can do visual snapshots, but has no built-in component-documentation surface); (c) both, with Storybook for docs/browsing and Playwright specifically for cross-browser interaction assertions.
- **Affected areas:** Phase 10 exit criteria; Phase 6 documentation-generation tooling (§27) has partial overlap with option (a).
- **Recommendation:** Not made here — evidence doesn't yet strongly favor one option; this is a genuine tooling-preference fork, not an evidence-resolvable question.

### DECISION-B — External runtime dependency approval process (Chart.js, Quill, and future cases)

- **Question:** ADR-004 defines a rigorous approval process for Prime-derived source specifically (license verification, commit pinning, provenance recording). No equivalent documented process exists for approving a *non-Prime* external runtime dependency like Chart.js (GAP-019) or Quill (GAP-020).
- **Current evidence:** Two components (Chart, Editor) are already blocked on this exact unresolved question, independently, in COMPONENT_INVENTORY.md.
- **Options:** (a) Extend the existing Phase-0-style provenance/license process to cover any external runtime dependency, not just Prime-derived source; (b) treat each external dependency as a one-off case-by-case ADR with no generic process; (c) avoid external chart/rich-text dependencies entirely and scope Chart/Editor out of the initial platform (Blueprint §41's non-goals don't explicitly forbid this, but don't explicitly require Chart/Editor either).
- **Affected areas:** Chart (Visualization family), Editor (Panel/Layout/Display family), and any future component with a genuine external dependency need.
- **Recommendation:** Option (a) is weakly favored by the evidence — Ultimate already has a working, proven process (Phase 0's) that generalizes naturally — but this is recorded as a recommendation, not a resolution.

### DECISION-C — Data component architecture for Table/TreeTable specifically (not blocked by `uix-data`, but not yet started either)

- **Question:** `uix-data` deliberately ships only the narrow, cross-framework-verified primitives. The actual `Table` component (and its dependents: TreeTable, Scroller, Paginator internal-consumer relationship) still needs its own per-framework architecture decision — how selection/sort/filter/pagination/virtualization primitives compose into a real, framework-native Table implementation.
- **Current evidence:** COMPONENT_INVENTORY.md marks Table `NEEDS ARCHITECTURE DECISION`, `High` risk, explicitly separate from the (now-resolved) shared-primitives question ADR-043 answered.
- **Options:** Not enumerated here — this fork has not yet had even a first research pass, unlike DECISION-A/B which have at least partial prior investigation. Recorded as "exists and is unstarted," per this task's Critical Operating Rule 14 (no implementation plans).
- **Affected areas:** Table, TreeTable, Scroller, Paginator, OrderList, PickList, DataView (7 of the 8 Data-family rows — Tree itself is GAP-013's separate hierarchical-identity question).
- **Recommendation:** None — flagging existence only, per this document's scope limits.

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
- **GAP-003 / GAP-003a** (Angular style injection + the documentation contradiction about it) — unlocks genuine visual verification of already-shipped Angular components; low effort (pattern already proven by React), high leverage.
- **GAP-018** (Angular `BaseModelHolder`/`BaseInput`) — unlocks the entire ~20-component native-input Form family; low risk per its own inventory entry, high leverage.
- **GAP-009 / GAP-023** (Angular secondary entry points) — unlocks genuine Angular tree-shaking measurement and framework parity with React/Vue's already-working export shape.
Why here: each is small, evidence-backed, has a proven pattern to copy from a sibling framework, and unblocks a materially larger downstream body of work.

### Group: Component-enabling foundations
- **GAP-008** (real consumer app, at least one per framework) — this is likely the single highest-leverage item in the entire registry: it unblocks genuine tree-shaking numbers, genuine SSR/hydration verification, genuine bundle-size/runtime benchmarking, and genuine end-to-end visual proof of GAP-003's fix.
- **GAP-022's successor state** — once a second real overlay component is planned, extract the shared orchestration pattern ADR-020 deferred (not urgent now, but sequenced here because it's a "when a second consumer exists" trigger, and GAP-008's playground app is a plausible source of that second consumer).

### Group: Component family expansion
- Form family (after GAP-018), Overlay family (after the second-consumer trigger above), Navigation family, Panel/Layout/Display family — all `ADAPT`-classified, low architectural risk, proven pattern from the 5-component proof set across 3 frameworks (GAP-017).
- Data family — blocked on DECISION-C (Table architecture, unstarted) for 7 of 8 rows, and on GAP-013 (correctly deferred) for the Tree-family row.
- Visualization/Editor — blocked on DECISION-B (external dependency policy).

### Group: Framework parity
- No forced-parity work is recommended — GAP-024/GAP-025 document that current divergence is evidence-based and correct. The only real parity item is GAP-009/GAP-023 (Angular exports), already placed in Foundation blockers above.

### Group: Platform tooling (Phases 6-9, evidence-sequenced)
- **GAP-027** (component metadata) first — it is the one Blueprint-diagrammed (§18) upstream dependency for both MCP and AI Skills.
- **GAP-028** (CLI) can start in parallel — its core orchestration (project init, package install, theme config) does not strictly require metadata; only its later diagnostic/AI-aware features do.
- **GAP-029** (MCP) and **GAP-030** (AI Skills/LLM context) both wait on GAP-027 per the Blueprint's own stated design.

### Group: Production hardening
- **GAP-004/GAP-035** (visual regression + real-browser testing, one tooling decision — DECISION-A) — high leverage, currently completely absent.
- **GAP-005** (accessibility scanning) — narrow tooling choice (axe-core), high leverage, currently completely absent.
- **GAP-031/GAP-032/GAP-033** (dependency/license/SAST scanning, bundle-size CI gate, coverage CI gate) — additive CI work, each independent, each currently unenforced despite partial groundwork existing (measurement scripts, test suites) for two of the three.
- **GAP-011** (SECURITY/CONTRIBUTING/CHANGELOG) — pure documentation, no code dependency.
This group is largely independent of every other group and could, in principle, run concurrently with component-family expansion — it's gated by attention/priority, not by architecture.

---

## 8. Executive summary

### Current Platform State

Five Blueprint phases are genuinely complete with runtime-verified evidence: a provenance-complete Phase 0 baseline (exact commit SHAs or tarball hashes for every incorporated source, MIT-verified); a working, framework-neutral `UltimateUIX` foundation (`uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`); a real 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) independently, natively implemented across Angular, React, and Vue, each with its own base-architecture ADR and its own verified-against-real-Prime-source behavior; a working theme layer (Aura preset) proven cross-framework for Vue and Angular (React's proof is at a lower layer — see GAP-003a); and, most recently, a narrow, rigorously evidence-gated shared Data foundation (`@ultimate/uix-data`) covering selection/sort/filter/pagination/virtualization primitives, ready for a first real consumer. Every one of these claims is backed by CI-enforced provenance/boundary/dependency-ceiling checks, not merely asserted.

### Remaining Major Gaps

The two largest bodies of remaining work are (1) the ~101-of-117-directory PrimeNG component backlog (GAP-017, mostly ordinary, low-architectural-risk `ADAPT` work once foundation-tier prerequisites like GAP-018 are met) and (2) the four entirely-unstarted platform phases — Component Metadata, CLI, MCP, and AI/Skills (GAP-027 through GAP-030) — none of which have any code, only empty scaffolding directories. A cluster of smaller-but-real functional gaps exists inside the "complete" phases themselves: Angular's style-injection no-op (GAP-003), Angular's broken tree-shaking (GAP-009), and the complete absence of visual-regression, accessibility-scanning, real-browser, and dependency/license/SAST-scanning tooling anywhere in the repository (GAP-004, GAP-005, GAP-031, GAP-035) — all of which are Phase-10-relevant and currently at zero, not partial, coverage.

### True Architectural Blockers

Only two gaps are true architectural blockers in the sense of preventing multiple future workstreams, as opposed to being ordinary backlog:
- **GAP-018** (Angular's missing `BaseModelHolder`/`BaseInput` tier) blocks an entire component family (~20 components) until built — but the pattern is already proven and low-risk, so this is a blocker in scope, not in difficulty.
- **GAP-027** (component metadata) blocks two entire subsequent Blueprint phases (MCP, AI Skills) by the Blueprint's own stated dependency diagram (§18).

Everything else — including the much larger 101-component backlog, the CLI, and most Production Hardening items — is independently addressable ordinary implementation backlog, not an architectural blocker.

### Independent Work

The great majority of gaps in this registry can be started without waiting on any other gap or decision: GAP-002/GAP-011/GAP-012 (documentation hygiene), GAP-003/GAP-006/GAP-007/GAP-010 (isolated Angular fixes with proven patterns to copy), GAP-005/GAP-031/GAP-032/GAP-033 (additive CI/tooling gates), GAP-008 (real consumer apps), and most of the Component/Panel/Navigation family expansion once GAP-018 lands.

### Open Architectural Decisions

Five are recorded (§5): visual-regression/browser-testing tooling choice (DECISION-A), external-runtime-dependency approval process (DECISION-B), Table/Data-component architecture (DECISION-C, unstarted), the deliberately-protected Tree-family "do not reopen" marker (DECISION-D), and package-naming finalization (DECISION-E, correctly deferred to pre-1.0). None are resolved by this document, per its operating rules.

### Recommended Next Research

The single most valuable next architectural research track is **the Table/Data-component architecture (DECISION-C)** — it is the one open fork with the largest downstream footprint (7 of 8 Data-family components), the one most likely to surface new evidence relevant to the still-deferred filter operator/constraints question (GAP-014), and — unlike DECISION-A/B, which are narrower tooling-preference questions — it requires the same kind of rigorous, multi-pass, real-Prime-source-verified research effort that produced `@ultimate/uix-data` and ADR-043, since Table is verified `High` risk and has zero prior architecture investigation recorded anywhere in the repository. This research track is not begun by this document.

---

## 9. Uncertainty and `UNVERIFIED` items (consolidated)

For traceability, every claim flagged `UNVERIFIED` in the gap registry above is repeated here:

1. Whether Vue (`vue-core`) has the same `StyleSheet.createStyleElement` DOM-injection gap as Angular, or already works like React (GAP-003).
2. Whether `packages/themes/test/cross-framework-consistency.test.ts` actually resolves the GAP-003a contradiction between ADR-023/029 and the ROADMAP.md footnote — not read directly in this pass.
3. Whether React/Vue Tooltip components have the same `aria-describedby` gap Angular's does (GAP-006) — not independently checked.
4. Whether `vue-core` has adopted the shared `@ultimate/uix-utils/escape`/`zindex` registries the same way `react-core` has (GAP-007) — ADR-036 discusses the extraction but this pass did not re-verify Vue's consumption of it.
5. Whether `scripts/provenance/validate-provenance.mjs` actually treats `sha256OfOriginal` as a required field that should be failing CI right now (GAP-010) — the validator's source was not read in this pass.
6. Whether other frameworks' provenance manifests (`react.json`, `react-core.json`, `vue.json`, `vue-core.json`) have the same `sha256OfOriginal` gap as Angular's (GAP-010).
7. Whether React/Vue built an equivalent to Angular's missing `BaseModelHolder`/`BaseInput` tier (GAP-018) — React/Vue never had a full component inventory produced at all (per PROVENANCE.md's own admission), so this is genuinely unknown, not just unchecked.
8. Whether PrimeReact/PrimeVue have a Chart-equivalent component surfacing the same external-dependency question as Angular's Chart (GAP-019).
9. Whether React/Vue have an Editor/Quill-equivalent component (GAP-020).
10. Whether `scripts/provenance/measure-package-size.mjs` was ever extended to cover `react*`/`vue*`/`themes` packages after the Phase 1/Phase 2 `PERFORMANCE.md` sections — no Phase 3/4/5 performance section exists in the file as read.
11. Whether any spec file anywhere in the repository exercises SSR/hydration behavior without an SSR-indicating filename (GAP-034) — only a filename-pattern scan was performed, not a content grep of every spec file.
12. Whether `vitest.config.ts` files anywhere in the repo declare a `coverage.thresholds` block despite no CI step consuming it (GAP-033) — individual config files were not opened in this pass.

None of these affect the registry's overall conclusions (the phase-completion picture, the empty-scaffolding phases, and the major cross-cutting tooling absences are all independently and directly confirmed), but each is a legitimate next check for whoever picks up the corresponding gap.
