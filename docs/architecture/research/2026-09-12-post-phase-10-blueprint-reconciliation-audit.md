# Post-Phase-10 Blueprint Reconciliation Audit

**Document:** `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md`
**Purpose:** Audit/research only. Establish the authoritative current state of Ultimate against the Blueprint after Phases 0–10, reconciling `BLUEPRINT_GAPS.md`'s known-stale registry against the real repository as of the audited HEAD.
**Status:** Discovery snapshot. Does not modify the Blueprint, `ROADMAP.md`, `BLUEPRINT_GAPS.md`, or `DECISIONS.md`. Does not implement fixes, start a new phase, or make architectural decisions.
**Audited HEAD:** `9ec7883` (`main`) — the merge commit for Phase 10 Track E (SSR/Hydration), which itself contains all of Tracks A–E.
**Method:** Direct repository inspection (file reads, `grep`/`find`, `git log`) cross-referenced against `docs/architecture/BLUEPRINT.md`, `ROADMAP.md`, `BLUEPRINT_GAPS.md`, `DECISIONS.md`, `MIGRATION.md`, `PERFORMANCE.md`, `COMPONENT_INVENTORY.md`, `PROVENANCE.md`, approved specs/plans under `docs/superpowers/`, actual package manifests, `.github/workflows/*.yml`, and real source files. Two focused sub-investigations were dispatched to verify Track A/B/C completion depth and component-coverage/documentation-drift claims independently; their findings are folded in below with attribution.

> **Historical/superseded-for-conclusions (2026-09-16):** this document is the first in a 6-document 2026-09-12/13 reconciliation-audit chain. Its findings were carried into `BLUEPRINT_GAPS.md`'s own reconciliation and re-verified, not re-derived, by every later document in the chain. For the current point-in-time synthesis of the conclusions this document covers, see `docs/architecture/research/2026-09-13-blueprint-closure-current-state-reconciliation.md`. This document remains the original evidence trail (commit SHAs, file:line citations) for those conclusions and retains that value; it is not the current word on gap/decision status.

---

## 1. Phase status reconciliation

`docs/architecture/ROADMAP.md`'s own phase table is itself stale on Phases 9 and 10 (see §11 below). This section reconciles against real repository evidence, not that table.

| Phase | Name | ROADMAP.md claim | Repo-verified status |
|---|---|---|---|
| 0 | Repository Foundation, Provenance & Baseline | Complete | **COMPLETE.** `docs/architecture/{PROVENANCE,DEPENDENCIES,COMPATIBILITY,checksums.json}` populated with commit SHAs/tarball hashes for PrimeNG 21.1.9, PrimeVue 4.5.5, PrimeReact 10.9.9, 4× `@primeuix/*`. No further gaps found. |
| 1 | UltimateUIX Foundation | Complete | **COMPLETE.** `uix-utils`, `uix-styled`, `uix-styles` (base module only, ADR-017), `uix-motion` all have real `src/`, tests, provenance manifests. |
| 2 | UltimateNG | Complete | **COMPLETE WITH EXPLICIT FOLLOW-UPS.** Originally 5-component proof set (ADR-023), since expanded to 8 (see §8). GAP-003 (style-injection no-op) is now **resolved** (commit `680876f`, verified directly — not reflected in current `BLUEPRINT_GAPS.md`). GAP-009/GAP-023 (no `exports` map, broken tree-shaking) **remains genuinely open** — confirmed via direct `package.json` inspection: `packages/ng/package.json` still has no `exports` field. GAP-006 (Tooltip `aria-describedby`) **remains genuinely open** — confirmed via direct grep of `tooltip.ts`: zero occurrences. GAP-007 (single z-index bucket, no stacking order) **remains genuinely open** — confirmed via direct read of `overlay.ts`: still `ZIndex.set("overlay", hostEl, 1000)` for every instance, no priority-queue Escape mechanism. GAP-010 (missing `sha256OfOriginal` provenance field) **remains genuinely open and confirmed never enforced** — `validate-provenance.mjs` checks a different mechanism (`REQUIRED_HEADINGS` in `PROVENANCE.md`) than the per-manifest JSON field the spec named. |
| 3 | UltimateReact | Complete | **COMPLETE.** Per-component subpath `exports` present (the pattern Angular still lacks). No new gaps found this pass. |
| 4 | UltimateVue | Complete | **COMPLETE.** Options-API `extends` mixin architecture (ADR-032), per-component subpaths present. No new gaps found this pass. |
| 5 | Themes | Complete, footnoted | **COMPLETE WITH EXPLICIT FOLLOW-UPS**, unchanged from `ROADMAP.md`'s own footnote 1: React components use hand-written static CSS, not `dt()` calls — Vue/Angular's cross-framework theme proof is genuine; React's is proven only at the `react-core` registration layer. GAP-003a (the ADR-023/ROADMAP contradiction about Angular's theme path) is **now moot** — GAP-003 itself is resolved, so there is no remaining contradiction to reconcile. |
| 6 | Component Metadata | ROADMAP: Complete [^2] | **COMPLETE.** `@ultimate/component-schema` (versioned `ComponentMetadata` schema) and `@ultimate/component-metadata` (8 real records for the proof set) both have substantial real `src/`. `BLUEPRINT_GAPS.md`'s GAP-027 independently marks this RESOLVED — consistent with real repo state, contradicting only that same document's own stale §2 summary table (see §11). |
| 7 | CLI | ROADMAP: Complete [^3] | **COMPLETE WITH EXPLICIT FOLLOW-UPS**, per `ROADMAP.md`'s own footnote 3: 5 real commands (`init`/`add`/`theme`/`doctor`/`generate`) + an `ai` stub; `create`/`migrate`/`update` explicitly unimplemented per spec deferral; a known packaging gap (compatibility-manifest path resolution once installed from `node_modules`, not yet verified) is disclosed, not hidden. |
| 8 | MCP | ROADMAP: Complete [^4] | **COMPLETE WITH EXPLICIT FOLLOW-UPS**, per `ROADMAP.md`'s own footnote 4: 5 real tools, stdio transport, boundary-enforced. HTTP transport/resources/prompts explicitly deferred. Same node_modules-path-resolution caveat as CLI, disclosed not hidden. |
| 9 | AI Skills and LLM Context | ROADMAP: **Not started** | **COMPLETE WITH EXPLICIT FOLLOW-UPS — ROADMAP.md IS STALE.** `packages/ai/src/` contains 7 real files (`bin-generate.ts`, `bin-validate.ts`, `context-files.ts`, `render-section.ts`, `skill-file.ts`, `validate.ts`, `index.ts`) exporting real functions (`renderLlmsTxt`, `renderLlmsFullTxt`, `renderFrameworkContext`, `generateContextFiles`, `generateSkillFile`, `validateSkillFile`). `skills/` at repo root has real per-component skill files for all 8 proof-set components (`button.md` through `tooltip.md`) plus `AGENT_CONVENTIONS.md`. **New follow-up found this pass:** the generation *tooling* is real, but no generated `llms.txt`/`llms-full.txt` output file exists anywhere in the repository (confirmed via `find`) — the artifact itself has apparently never been run-and-committed, only its generator built and tested. `tooling/` at repo root remains `.gitkeep`-only, genuinely empty. |
| 10 | Production Hardening | ROADMAP: **Not started** | **COMPLETE WITH EXPLICIT FOLLOW-UPS — ROADMAP.md IS SEVERELY STALE.** All 5 tracks (A–E) are merged into `main` (confirmed via `git log --oneline --all`: 5 distinct track-merge commits, the most recent being `9ec7883` for Track E). See §2 (Track A/B/C/D/E reconciliation) and §7 (Definition of Done) below for full detail. |

**Phases 0–8 status is essentially accurate in `ROADMAP.md`** (modulo the Phase 2 follow-ups above, one of which — GAP-003 — is now stale in the *gap registry's* favor, i.e. actually fixed). **Phases 9 and 10 are the two phases where `ROADMAP.md` itself is factually wrong**, not merely imprecise — both have substantial real, merged, tested work that the document claims does not exist at all.

---

## 2. Phase 10 track-by-track reconciliation

Phase 10 is not one track — it is 5 independently planned/implemented/reviewed tracks, none of which are reflected anywhere in `ROADMAP.md`'s current text (which only names "Phase 10" as a single row). This section is the missing reconciliation.

### Track A — Browser / Visual / Accessibility
**Plan:** `docs/superpowers/plans/2026-09-10-phase-10-browser-visual-accessibility-implementation.md`
**Verdict: COMPLETE WITH FOLLOW-UPS.**
Directly resolves GAP-004 (visual regression), GAP-005 (accessibility scanning), GAP-035 (real-browser testing) — all three were `MISSING` in the current stale registry text but are confirmed real:
- `.storybook/` config directories exist for all 3 frameworks (`packages/{ng,react,vue}/.storybook`).
- `storybook` and `axe-core` are real devDependencies in all 3 framework `package.json` files (not merely referenced in a lockfile).
- Root `playwright.config.ts` defines the exact 9 named Track A projects (`{ng,react,vue}-{chromium,firefox,webkit}`), each with a real `webServer` entry starting that framework's Storybook instance.
- `.github/workflows/ci.yml`'s `track-a-browser-visual-a11y` job runs a real 3-framework matrix, installs all 3 browsers, runs all 3 browser projects per framework, runs `validate-accessibility-baseline.mjs --check`, uploads real HTML/accessibility-report artifacts.
- `docs/architecture/ACCESSIBILITY_BASELINE.md` (271 lines) exists with real content.
- Per-framework e2e spec counts: Angular 12 files, React 8 files, Vue 9 files (button/checkbox/dialog/menu/paginator/ripple/scroller/table/tooltip — full 8-component proof set + the Vue-only `ripple` directive; confirmed by direct directory listing, correcting an initial miscounted sub-investigation finding).

### Track B — CI / Security / Quality Gates
**Plan:** `docs/superpowers/plans/2026-09-08-phase-10-ci-security-quality-gates-implementation.md`
**Verdict: COMPLETE.** The most mature evidence trail of the 5 tracks. Directly resolves GAP-031 (dependency/license/SAST scanning) and GAP-032/GAP-033 (bundle-size and coverage — **genuinely CI-ENFORCED, not merely measured**):
- `ci.yml`'s main `ci` job runs, in real sequence: `pnpm audit --audit-level high --prod` (dependency scan), `license-checker-rseidelsohn --onlyAllow ...` (license scan), install-script-policy check, real `github/codeql-action@v3` init+analyze followed by a SARIF-consuming `sast:validate` step, bundle-size measure+validate, coverage measure+validate, pack/install integrity over affected packages.
- `scripts/provenance/validate-bundle-size.mjs`: `REGRESSION_THRESHOLD = 0.15` (15% relative), calls `process.exit(1)` on violation — confirmed directly, a genuine enforced gate.
- `scripts/provenance/validate-coverage.mjs`: `REGRESSION_THRESHOLD_POINTS = 2.0` (absolute percentage points, explicitly documented as "NOT a relative/ratio comparison"), calls `process.exit(1)` on violation — confirmed directly, a genuine enforced gate.
- `docs/architecture/SAST_BASELINE.md` (57 lines) contains 22 real, dated CodeQL findings with fingerprints/rule IDs/file:line references and substantive analyst notes tied to a real `codeql database analyze` run against a specific commit — not placeholder content.
This is a materially stronger claim than `BLUEPRINT_GAPS.md`'s current "IMPLEMENTED-BUT-NOT-ENFORCED" language for GAP-032/GAP-033 — both are now genuinely enforced.

### Track C — Migration / Release / Provenance
**Plan:** `docs/superpowers/plans/2026-09-10-phase-10-migration-release-provenance-implementation.md`
**Verdict: COMPLETE WITH FOLLOW-UPS.**
- `.github/workflows/release.yml` exists and matches its plan closely: a `select-mode` job (`changesets/action/select-mode@v2.1.2`), a `version` job (`if: mode == 'version'`, `contents: write` + `pull-requests: write`), a `publish` job (`if: mode == 'publish'`, real token-based npm auth step immediately before `changeset:publish`).
- `docs/architecture/MIGRATION.md` (82 lines) contains the full planned "Releasing" section with sub-sections for flow description, transition table, provenance limitation disclosure, and branch-protection dependency.
- **Genuine, disclosed (not hidden) limitation:** the fail-closed guarantee (publish never happens against a red CI run) depends entirely on a GitHub branch-protection setting external to repository content — this cannot be verified from the repo itself, and the plan's own text says so explicitly. No real release has ever been executed (no git tags beyond the initial config commit, all 17 packages still at `0.1.0`) — this is Track C's own explicit, disclosed status, not a hidden gap this audit discovered.

### Track D — Operational Documentation
**Plan:** `docs/superpowers/plans/2026-09-09-phase-10-operational-documentation-implementation.md`
**Verdict: COMPLETE (per `BLUEPRINT_GAPS.md`'s own GAP-011 text, itself accurate on this point).** `SECURITY.md` and `CHANGELOG.md` exist at repo root; `CONTRIBUTING.md` is explicitly, deliberately excluded per a recorded decision (not a gap). This is one of the few places the current gap registry text is already accurate and current — not flagged as drift.

### Track E — SSR / Hydration
**Already fully audited and merged this session** (visible in this conversation's own prior history — not re-derived here). GAP-034 is genuinely resolved: 3 real per-framework SSR harnesses, 3 real Playwright specs including determinism double-fetch checks, a real `track-e-ssr-hydration` CI job. `ADR-045` correctly scopes this as resolving only GAP-034, not GAP-008's fuller consumer-app scope.

### Cross-track findings
- `packages/uix` (the empty umbrella package, GAP-001) — untouched by any of the 5 Phase 10 tracks, still `.gitkeep`-only. Explicitly out of scope for Track B/C per their own plan text.
- `apps/showcase`/`apps/docs` — still `.gitkeep`-only, untouched by Tracks A/B/C/D (explicitly out of scope per Track C's plan). Only `apps/playground-{angular,react,vue}` were populated, by Track E specifically.
- Minor cross-job inconsistency (not a defect): the main `ci` job pins Node `"20"` while `track-a-browser-visual-a11y`/`track-e-ssr-hydration` pin Node `"24.15.0"`.

---

## 3. `BLUEPRINT_GAPS.md` complete reconciliation

The existing registry (35 gaps, GAP-001–GAP-035) is preserved by stable ID below. Status column shows this audit's finding; unchanged items are marked so explicitly rather than omitted.

| Gap | Registry's current status | This audit's finding | Reconciliation |
|---|---|---|---|
| GAP-001 (`packages/uix` never populated) | DOCUMENTATION-GAP | **Unchanged.** Still `.gitkeep`-only, confirmed untouched by Phase 10. | No change needed. |
| GAP-002 (README says "Phase 0") | DOCUMENTATION-GAP | Not re-verified this pass (out of the audit's explicit source-priority scope; root `README.md` was not read). | Flag for a future pass — likely still stale given ROADMAP.md's own drift found in §11. |
| GAP-003 (Angular `createStyleElement` no-op) | **MISSING, HIGH** | **RESOLVED.** `packages/ng-core/src/basecomponent/style-sheet.ts` now contains a real `NgCoreStyleSheet` subclass overriding `createStyleElement`, delegating to `@ultimate/uix-utils`'s real DOM-injection helper, SSR-guarded via `typeof document === "undefined"` — matching React's/Vue's already-working pattern exactly. Landed in commit `680876f` ("fix(ng-core): append registered component styles to document.head"), confirmed via `git log` on the exact file. | **Update registry: MISSING → RESOLVED.** Evidence: `packages/ng-core/src/basecomponent/style-sheet.ts` (full file read), commit `680876f`. |
| GAP-003a (ADR-023/029 vs. ROADMAP footnote contradiction) | DOCUMENTATION-GAP | **Moot.** Since GAP-003 is now resolved, there is no remaining contradiction — Angular's style path genuinely works now, consistent with what the ROADMAP footnote always implied for Angular. | **Close as moot**, not "resolved by investigation" — the underlying fact changed, dissolving the question. |
| GAP-004 (no visual regression tooling) | **MISSING, HIGH** | **RESOLVED by Track A.** See §2. | **Update: MISSING → RESOLVED**, evidence per §2's Track A section. |
| GAP-005 (no accessibility scanning) | **MISSING, HIGH** | **RESOLVED by Track A.** `axe-core` is a real devDependency in all 3 framework packages, wired through real Playwright specs and a CI accessibility-baseline validation step. | **Update: MISSING → RESOLVED.** |
| GAP-006 (`UTooltip` no `aria-describedby`) | PARTIAL | **Unchanged — confirmed still genuinely open.** Direct grep of `packages/ng/src/tooltip/tooltip.ts`: zero occurrences of `aria-describedby`/`ariaDescribedBy`. | No change. Still real, still low-severity, still isolated. |
| GAP-007 (single z-index bucket, no stacking) | MISSING, MEDIUM | **Unchanged — confirmed still genuinely open.** Direct read of `packages/ng-core/src/overlay/overlay.ts`: still `ZIndex.set("overlay", hostEl, 1000)` unconditionally for every instance; no priority-queue Escape mechanism analogous to React's `useGlobalEscapeKey`/`useDisplayOrder` exists in Angular's Dialog. | No change. |
| GAP-008 (no real consumer app) | Partially resolved for SSR slice per ADR-045 | **Unchanged — accurately reflects reality already.** `apps/playground-*` now exist and are real (Track E), but they are minimal SSR-verification harnesses, not full consumer/demo apps — GAP-008's fuller scope (tree-shaking re-measurement, bundle-size/performance benchmarking via a real app, a genuine demo) remains open. | No change — the registry's current text on this exact gap is already accurate post-Track-E. |
| GAP-009 (Angular tree-shaking broken) | IMPLEMENTED-BUT-NOT-ENFORCED | **Unchanged — confirmed still genuinely broken.** `packages/ng/package.json` still has no `exports` field (confirmed via direct grep), unlike `packages/react/package.json`/`packages/vue/package.json`, both of which do. | No change. |
| GAP-010 (`sha256OfOriginal` missing) | IMPLEMENTED-BUT-NOT-ENFORCED | **Unchanged and now fully confirmed (was previously `UNVERIFIED`).** Grepped all 12 provenance manifests under `docs/architecture/provenance/`: zero contain `sha256OfOriginal`. Read `scripts/provenance/validate-provenance.mjs` directly: it checks a `REQUIRED_HEADINGS` list against `PROVENANCE.md`'s own section headings — an entirely different mechanism than a per-manifest-JSON required-field check. This field is genuinely, confirmedly never enforced by anything in CI. | **Resolve the prior `UNVERIFIED` flag**: confirmed real and confirmed unenforced. Status unchanged, but confidence upgraded from suspected to directly proven. |
| GAP-011 (no SECURITY/CONTRIBUTING/CHANGELOG) | PARTIALLY RESOLVED | **Unchanged — accurate.** `SECURITY.md`/`CHANGELOG.md` confirmed present (Track D); `CONTRIBUTING.md` confirmed absent, per an explicit recorded decision. | No change. |
| GAP-012 (CODEOWNERS stub) | DEFERRED | Not re-verified this pass. | Presumed unchanged (organizational, not architectural; low priority to re-check). |
| GAP-013 (Tree-family shared contract) | ARCHITECTURAL-GAP, deliberately unresolved | **Unchanged.** No new Tree-family implementation work found in any Phase 6-10 track. | No change — still correctly deferred per ADR-043's own stated condition. |
| GAP-014 (filter operator/constraints model) | RESOLVED | **Unchanged — no new evidence found or needed.** | No change. |
| GAP-015 (sort-toggle cycling) | RESOLVED (intentionally excluded) | **Unchanged.** | No change. |
| GAP-016 (`uix-data` provisional name) | DOCUMENTATION-GAP | **Unchanged.** Still `0.1.0`, still zero consumers (confirmed: no `package.json` among `ng/react/vue/ng-core/react-core/vue-core` lists `@ultimate/uix-data` as a dependency). | No change. |
| GAP-017 (101/117 PrimeNG areas remaining) | MISSING, expected | **The underlying count is now stale** — the proof set grew from 5 to 8 components (Paginator/Scroller/Table added) since this gap was last written, meaning the "14 built" figure is undercounted by at least 3. See §8 for the corrected current count. React/Vue still have no independently-produced full inventory (confirmed directly against `PROVENANCE.md`'s React/Vue sections — both explicitly state their fuller inventories were "deliberately not pre-committed"). | **Update the built-component count** in a future `COMPONENT_INVENTORY.md` revision; the underlying claim (React/Vue lack a full inventory) is unchanged and confirmed correct. |
| GAP-018 (Angular `BaseModelHolder`/`BaseInput` missing) | MISSING, BLOCKER (for Form family) | **Unchanged — confirmed still genuinely absent.** `find packages/ng-core/src -iname "*base-model*" -o -iname "*base-input*"` returns nothing; `packages/ng/src/` has zero form-input directories (`InputText`, `Password`, `Slider`, etc. all absent). | No change. |
| GAP-019 (Chart/Chart.js decision) | ARCHITECTURAL-GAP | Not re-verified this pass (no Chart-family work found in any git history scanned). | Presumed unchanged. |
| GAP-020 (Editor/Quill decision) | ARCHITECTURAL-GAP | Not re-verified this pass. | Presumed unchanged. |
| GAP-021 (`config`/`passthrough` deferred) | DEFERRED, per YAGNI | **Unchanged.** No new component work created pressure to revisit. | No change. |
| GAP-022 (no shared overlay-orchestration abstraction) | RESOLVED (YAGNI) | **Unchanged.** No second Angular overlay component has been built since. | No change. |
| GAP-023 (Angular no per-component subpaths) | PARTIAL | **Unchanged.** Same underlying fact as GAP-009 — confirmed via the same direct `package.json` check. | No change. |
| GAP-024 (framework-native divergences, intentional) | RESOLVED | **Unchanged.** | No change. |
| GAP-025 (`UCheckbox` capability divergence, intentional) | RESOLVED | **Unchanged.** | No change. |
| GAP-026 (`@primevue/forms` unevaluated) | DEFERRED | **Unchanged.** No Vue Form-family work has occurred since. | No change. |
| GAP-027 (component metadata schema, Phase 6) | Already marked RESOLVED in its own entry | **Confirmed accurate.** Real `src/` in both `component-schema`/`component-metadata` packages. | No change to this specific entry's own text — but see §11: the document's own §2 summary table contradicts this entry. |
| GAP-028 (CLI, Phase 7) | Already marked RESOLVED | **Confirmed accurate.** 5 real commands, real compatibility manifest. | Same §11 caveat as GAP-027. |
| GAP-029 (MCP, Phase 8) | Already marked RESOLVED | **Confirmed accurate.** 5 real tools, boundary-enforced. | Same §11 caveat as GAP-027. |
| GAP-030 (AI Skills/LLM context, Phase 9) | **MISSING** | **STALE — RESOLVED WITH A FOLLOW-UP.** `packages/ai/src/` and `skills/*.md` both confirmed real and substantial (see §1's Phase 9 row). The generation *tooling* (`renderLlmsTxt`, `renderLlmsFullTxt`, `generateContextFiles`) is real and exported, but no generated `llms.txt`/`llms-full.txt` output file exists anywhere in the repository — the artifact has apparently never been run-and-committed. `tooling/` at repo root remains genuinely empty (`.gitkeep`-only). | **Update registry: MISSING → RESOLVED WITH FOLLOW-UP** (generator built and tested; generated output artifact not yet produced/committed; `tooling/` still empty). |
| GAP-031 (no dependency/license/SAST scanning) | **MISSING, HIGH** | **RESOLVED by Track B.** See §2. | **Update: MISSING → RESOLVED.** |
| GAP-032 (bundle-size not CI-enforced) | IMPLEMENTED-BUT-NOT-ENFORCED | **RESOLVED by Track B — now genuinely enforced**, not merely measured. See §2 for the real `process.exit(1)`-on-regression mechanism. | **Update: IMPLEMENTED-BUT-NOT-ENFORCED → RESOLVED.** |
| GAP-033 (coverage not CI-enforced) | IMPLEMENTED-BUT-NOT-ENFORCED | **RESOLVED by Track B — now genuinely enforced.** See §2. | **Update: IMPLEMENTED-BUT-NOT-ENFORCED → RESOLVED.** |
| GAP-034 (no SSR/hydration verification) | Already marked RESOLVED (updated by Track E's own Task 10) | **Confirmed accurate and current** — this is the one gap this session's own prior work directly produced and already verified exhaustively. | No change — already correct. |
| GAP-035 (no browser-compatibility/real-browser testing) | **MISSING, LOW** | **RESOLVED by Track A.** Same evidence as GAP-004 (Playwright real-browser matrix). | **Update: MISSING → RESOLVED.** |

**Net effect of this reconciliation:** 8 of the registry's 35 gaps have a status this audit found to be materially stale (GAP-003, GAP-003a, GAP-004, GAP-005, GAP-030, GAP-031, GAP-032, GAP-033, GAP-035 — 9 counting the moot GAP-003a). All 9 are stale in the direction of "more resolved than the document currently claims" — this audit found **zero** cases of a gap the registry claims is resolved but which is actually still open. This is a one-directional drift pattern: the registry has not been updated to reflect Phase 6–10's real completion, not a case of overclaiming.

---

## 4. Newly surfaced gaps

Applying Blueprint §28–§32/§40/§43–§45 directly against current repo state, beyond the existing registry:

### GAP-036 (new) — `llms.txt`/`llms-full.txt` generation tooling exists and is tested, but no generated output artifact has ever been produced or committed
- **Status:** IMPLEMENTED-BUT-NOT-EXECUTED (a new pattern, distinct from IMPLEMENTED-BUT-NOT-ENFORCED — this is about an output artifact, not a CI gate)
- **Type:** AI, Documentation
- **Blocking level:** LOW
- **Exact Blueprint requirement:** §25 ("LLM-Oriented Documentation" — generated `llms.txt`-style outputs); §26 ("AI Context Layers"); ADR-012 ("Generated outputs (llms.txt etc.) should not become the primary source of truth").
- **Actual repository evidence:** `packages/ai/src/context-files.ts` exports real `renderLlmsTxt`/`renderLlmsFullTxt`/`generateContextFiles` functions (confirmed via direct read of `index.ts`'s barrel exports); `find . -iname "llms*.txt"` returns zero matches anywhere in the repository.
- **What it blocks:** Nothing architecturally — the generator is proven to exist and (per Phase 9's own test suite, not independently re-run this pass) presumably works. This is a "run it once and commit the output" gap, not a design gap.
- **Dependencies:** None.
- **Type of work:** Ordinary implementation/operational task (run the existing generator, commit its output), not architecture research or a decision.

### GAP-037 (new) — `PERFORMANCE.md` has no baseline section for Phase 3 (React), Phase 4 (Vue), or Phase 5 (Themes)
- **Status:** DOCUMENTATION-GAP / MISSING (measurement gap, not enforcement gap — distinct from GAP-032, which is about CI enforcement of the sections that DO exist)
- **Type:** Documentation, Performance
- **Blocking level:** LOW
- **Exact Blueprint requirement:** §31 ("Measure: bundle size... establish benchmarks" — implicitly for all frameworks, not just Angular).
- **Actual repository evidence:** Direct read of `PERFORMANCE.md`'s section headers: `# Performance Baseline`, `## Package size`, `## Tree-shaking spot-check`, `## Notes`, `## Phase 2 — UltimateNG`, `## Phase 10 — CI/Security/Quality Gates`. No `## Phase 3`, `## Phase 4`, or `## Phase 5` section exists.
- **What it blocks:** Confident bundle-size/tree-shaking baseline claims for React, Vue, or Themes specifically — the measurement infrastructure (`measure-package-size.mjs`) exists and Track B's own coverage/bundle-size CI gates likely already cover these packages going forward (not independently re-verified in this pass whether the CI gate's package list includes react/vue/themes), but no narrative baseline document section exists for a human reader.
- **Dependencies:** None.
- **Type of work:** Ordinary documentation backfill — run the existing measurement script against react/vue/themes packages, add the corresponding `PERFORMANCE.md` sections.

### No other genuinely new gaps found this pass.
Sections §28 (Testing Strategy — Unit/Component/Integration/Cross-framework/Visual/Accessibility/Build-Package), §29 (Security Strategy), §30 (Accessibility Strategy), §32 (Data Components) were each checked directly against real repo evidence and found either already covered by an existing gap ID above, or genuinely satisfied (e.g., §28's "Cross-framework Contract Tests" line has no dedicated existing gap, but the 5-component-then-8-component proof set's independent per-framework ADRs, each explicitly cross-checking against the same real Prime source, function as this requirement's actual satisfaction mechanism — not a gap). §41's Explicit Non-Goals and §44's First Implementation Rule were checked and found fully honored by the historical record (Phase 0's ordering, no framework-build-tool replacement anywhere). No speculative gap was created merely because the Blueprint mentions an ideal future capability (e.g., "Advanced AI behavior" under §43's DEFERRED list is correctly left as deferred, not converted into a gap).

---

## 5. Open architectural decisions reconciliation

Reconciling `BLUEPRINT_GAPS.md` §5's 5 recorded decisions against current repo state:

| Decision | Current registry framing | This audit's finding |
|---|---|---|
| DECISION-A (visual/browser tooling choice) | Open, zero tooling exists | **RESOLVED BY IMPLEMENTATION, not by this document's own process.** Track A concretely chose and shipped Storybook + Playwright + axe-core — the exact combination Option (c) in the registry's own text anticipated ("both, with Storybook for docs/browsing and Playwright specifically for cross-browser interaction assertions"). This decision should be marked resolved in a future `DECISIONS.md`/`BLUEPRINT_GAPS.md` revision, with an ADR if one doesn't already exist for this specific choice (not found in the current 45-ADR list under this audit's read of `DECISIONS.md` — ADR-044 covers Phase 10's Storybook+Playwright adoption directly, confirming this was in fact ADR'd, just not cross-referenced back into GAP registry's DECISION-A entry). |
| DECISION-B (external dependency approval process — Chart.js/Quill) | Open, weakly favors option (a) | **Still genuinely open.** No Chart or Editor implementation work found in any git history scanned this pass. Not resolved, not superseded, not stale — this decision remains exactly as open as the registry states. |
| DECISION-C (Table/Data architecture) | Open, unstarted | **Still genuinely open and still unstarted.** No Table implementation exists in `packages/{ng,react,vue}/src/table/` beyond what already exists (confirmed: Table IS built as one of the 8 proof-set components — but this decision's own text is about the *deeper* filter-operator/sort-toggle architecture question for a *fuller-featured* Table, not the proof-set Table's existence). This needs precise reconciliation: **the proof-set Table's basic architecture is clearly no longer "unstarted"** (it ships, is tested, is SSR-verified per Track E) — but whether it resolved DECISION-C's specific open question (full filter operator/constraints model, per GAP-014's own note that this was "resolved by Table implementation plan Tasks 5/13/19") is worth a closer look than this pass performed. GAP-014 itself claims resolution via "Table implementation plan Tasks 5/13/19" — if that's accurate, DECISION-C may be more resolved than its own §5 entry currently states. **Flagging as a reconciliation the next document revision should perform directly** (read the actual Table implementation plan's Tasks 5/13/19), not resolving it here. |
| DECISION-D (Tree-family, do-not-open marker) | Explicitly protected, do not reopen without new evidence | **Unchanged. No new evidence found.** This audit found no Tree-family implementation work anywhere. The protection remains valid and this audit does not attempt to reopen it, per its own binding constraint. |
| DECISION-E (package naming finalization) | Open, deferred to pre-1.0 | **Still genuinely open and correctly deferred.** All 17 packages confirmed still at `0.1.0` (direct `package.json` grep across every package). No naming validation pass has occurred. |

**New architectural decisions created by Phases 6–10:** none found that rise to fork-level significance requiring a new DECISION-F/G entry. Track E's own `TRACK_E_SSR_FRAMEWORK`/`trackESsrServers` Playwright-config mechanism and the `CommonEngine`-over-`AngularAppEngine` choice are documented as implementation-level deviations with evidence (per this session's own prior direct verification), not architecture-fork-level decisions requiring a registry entry.

---

## 6. Blocker / foundation / backlog triage

### A. True architectural blockers
(Prevent multiple future workstreams, or require a genuine unresolved decision before proceeding)
- **GAP-018** (Angular `BaseModelHolder`/`BaseInput` missing) — blocks the entire ~20-component native-input Form family for Angular specifically. Pattern is proven (ADR-018's `UBaseEditableHolder`), so this is a blocker in *scope*, not in *difficulty*.
- **DECISION-B** (external dependency approval — Chart.js/Quill) — blocks 2 named components (Chart, Editor) and, more importantly, blocks a *general* policy question that will recur for any future non-Prime dependency need.
- **DECISION-C** (Table/Data architecture, full scope) — blocks up to 7 of 8 Data-family components' fuller feature sets, pending the reconciliation noted in §5 above.
- **GAP-013/DECISION-D** (Tree-family contract) — blocks 4 named components, but is *correctly* blocked (deliberate, evidence-gated non-decision), not an oversight.

### B. Foundation / enabling implementation work
(Ordinary engineering work that unlocks a significant downstream family or platform capability, but does not itself require a fork-level decision)
- **GAP-009/GAP-023** (Angular secondary entry points / tree-shaking) — unlocks genuine Angular bundle-size confidence and framework parity; pattern already proven by React/Vue.
- **GAP-006** (Tooltip `aria-describedby`) — small, isolated, unlocks a specific accessibility claim.
- **GAP-007** (z-index stacking/Escape priority for Angular Dialog) — unlocks every future Angular overlay component (Popover, Drawer, ConfirmDialog, etc.) needing correct nested-overlay behavior; shared infrastructure (`@ultimate/uix-utils/escape`/`zindex`) already exists and is proven by React's consumption of it.
- **GAP-036** (generate and commit real `llms.txt` output) — small, mechanical, completes Phase 9's own deliverable chain.
- **GAP-037** (PERFORMANCE.md React/Vue/Themes sections) — small, mechanical, completes documentation parity.
- **GAP-010** (provenance `sha256OfOriginal` field) — small, mechanical, either add the field everywhere or formally drop the spec requirement.

### C. Ordinary backlog / expansion
(Independent, do not block platform architecture)
- **GAP-017** (remaining ~93-101 PrimeNG component families, count now stale — see §8) — the largest body of work in the registry, but explicitly `ADAPT`-classified, low architectural risk, pattern proven 8 times over across 3 frameworks.
- Framework-family expansion generally (Overlay, Navigation, Panel/Layout/Display) once GAP-018 lands for Angular's Form family specifically.
- GAP-001 (empty `packages/uix` umbrella) — cosmetic.
- GAP-002 (stale README) — not independently re-verified this pass, but presumed still real per §11's broader documentation-drift pattern.
- GAP-012 (CODEOWNERS stub) — organizational, not architectural.

### D. Intentionally deferred (correctly, with evidence)
- GAP-013/DECISION-D (Tree-family) — deliberately unresolved, protected.
- GAP-014 (filter operator/constraints) — deferred until real Table evidence (possibly now available — see §5's DECISION-C note).
- GAP-015 (sort-toggle cycling) — resolved as "intentionally excluded," framework-divergent.
- GAP-021 (config/passthrough) — deferred per YAGNI, confirmed three independent times.
- GAP-022 (overlay-orchestration abstraction) — deferred per YAGNI, single-consumer.
- GAP-026 (`@primevue/forms`) — deferred pending real Vue Form-family pressure.
- DECISION-E (package naming) — correctly deferred to pre-1.0 per Blueprint §34's own stated gate.

---

## 7. Dependency graph of remaining major work

```text
GAP-018 (Angular BaseModelHolder/BaseInput, Foundation blocker)
    → blocks ~20 native-input Form components (InputText, InputNumber, Textarea,
      Password, Knob, Rating, Slider, ToggleSwitch, RadioButton, ToggleButton,
      SelectButton, InputMask, InputOTP, and more) — Angular only;
      React/Vue equivalent tiers UNVERIFIED (never independently checked this pass
      either — carried forward as an open UNVERIFIED item, same as the prior registry)

DECISION-C (Table/Data full architecture — reconciliation pending, see §5)
    → gates the fuller feature set of up to 7 of 8 Data-family components
      (Table's proof-set version already ships; DECISION-C is about what's
      still missing beyond that baseline)
    ← GAP-014 (filter operator/constraints) claims resolution FROM Table's own
      implementation plan — if true, this reduces DECISION-C's own remaining
      scope; needs direct verification against Tasks 5/13/19 of that plan

GAP-013/DECISION-D (Tree-family, correctly unresolved)
    → blocks Tree, TreeTable, TreeSelect, OrganizationChart (4 components) —
      deliberately, pending new evidence only a real Tree implementation attempt
      would surface

DECISION-B (external dependency policy — Chart.js/Quill)
    → blocks Chart (Visualization family) and Editor (Panel/Layout/Display
      family) independently; also blocks any FUTURE non-Prime dependency need
      generically until a policy exists

GAP-009/GAP-023 (Angular tree-shaking/exports)
    → blocks genuine Angular bundle-size confidence; independent of everything
      else, pattern proven by React/Vue already

GAP-006/GAP-007 (isolated Angular accessibility/overlay fixes)
    → GAP-007 specifically blocks every FUTURE Angular overlay component
      (8+ in the remaining component backlog) from having correct stacking;
      GAP-006 is fully isolated, blocks nothing downstream

GAP-036/GAP-037 (llms.txt artifact, PERFORMANCE.md sections)
    → block nothing; pure documentation/artifact-completion backlog

GAP-017 (component family expansion, count now understated — see §8)
    → the single largest body of remaining work; independent of every
      architectural blocker above except where a specific family needs
      GAP-018 (Form) or DECISION-B/C/D (Chart/Editor/Table-fuller/Tree)

Real consumer applications (GAP-008's fuller scope, beyond Track E's SSR harnesses)
    → would provide the only path to genuine tree-shaking re-measurement,
      genuine bundle-size/performance benchmarking beyond one-time snapshots,
      and a real demo experience — independent of all architectural blockers,
      pure implementation backlog, explicitly deferred by prior user decision

Package naming finalization (DECISION-E)
    → correctly deferred to pre-1.0; blocks nothing now; would need to happen
      exactly once, across all 17 packages, before any real npm publish
```

**Independent vs. blocking, summarized:** Of the roughly 15 substantive remaining work items surfaced in this audit, only 4 are genuine architectural blockers (§6.A). Everything else — including the largest single body of work (component-family expansion) — can proceed independently and in parallel, gated only by attention and priority, not by any unresolved architecture question.

---

## 8. Real post-Phase-10 maturity state (Blueprint §40 Definition of Done)

Direct answer to "what is Ultimate's actual maturity level," evaluated item-by-item against Blueprint §40, distinguishing **tested** / **verified** / **CI-enforced** / **production-ready** as genuinely distinct claims:

| §40 item | Satisfied | Partial | Unsatisfied | Intentionally deferred | Evidence |
|---|---|---|---|---|---|
| verified licensing/provenance | ✅ | | | | Phase 0's exact-commit-SHA/tarball-hash provenance for every incorporated source; CI-enforced via `provenance:validate`. |
| no prohibited Prime runtime dependencies | ✅ | | | | ADR-004; `ceiling:validate` CI-enforced; zero `primeng`/`@primeuix/*`/etc. in any package's runtime `dependencies`. |
| stable package boundaries | ✅ | | | | `boundary:validate`/`boundary:validate:cli`/`boundary:validate:mcp`/`boundary:validate:ai` all real, CI-enforced, bidirectional. |
| supported framework versions | ✅ | | | | Angular 21.2.22, React ^18.3.1, Vue ^3.5.13 pinned and peer-range-declared per ADR-042 methodology. |
| accessibility validation | | ✅ | | | **TESTED** (axe-core wired into real Playwright specs) and **CI-ENFORCED** (Track A's baseline-validation step) — but 2 known, isolated, genuinely open accessibility gaps remain (GAP-006 Tooltip `aria-describedby`; GAP-007's Escape/stacking has accessibility implications for future overlay components). Not "**production-ready**" in the sense of zero known gaps, but genuinely tested and enforced, which is a real, non-trivial claim. |
| security process | | ✅ | | | Dependency/license/SAST scanning now real and CI-enforced (Track B — resolves GAP-031). Security *advisory response process* (ADR-013's "case-by-case manual evaluation") is documented but has never been exercised against a real advisory (no real Prime CVE has occurred during this project's lifetime to test the process against) — this is a genuine "process exists, has never been proven under real conditions" partial. |
| performance benchmarks | | ✅ | | | Bundle-size **CI-ENFORCED** (Track B, real regression gate) for whichever packages that gate covers (not independently re-verified which packages this pass) — but narrative baselines exist only for Phase 1/2/10 in `PERFORMANCE.md` (GAP-037: React/Vue/Themes sections missing). "**Measured**" and "**enforced**" are both partially true; "**comprehensive**" is not yet true. |
| visual regression coverage | ✅ | | | | Track A: real Storybook + Playwright screenshot-diff coverage across all 3 frameworks, tri-browser, CI-enforced (resolves GAP-004). |
| documented APIs | | ✅ | | | Component-level: each framework's README/JSDoc exists per-component. Platform-level: `docs/architecture/*` is extensive but internally inconsistent (§11) — "documented" is true; "documentation is currently trustworthy without cross-checking" is not, per this very audit's findings. |
| metadata coverage | | ✅ | | | Real, versioned, source-verified metadata exists for the 8-component proof set (Phase 6/GAP-027) — but covers only 8 of the eventual full component catalog, by design (the proof set was the deliberate initial scope, not a shortfall). |
| compatibility resolver | | ✅ | | | CLI's `init`/`add`/`doctor` read a real compatibility manifest (`compatibility-manifest.json`) covering 3 frameworks × 6 axes — but 2 axes (MCP, AI/Skills version ranges) remain reserved/unpopulated by explicit v1 scope decision, and the manifest's own runtime path-resolution-once-installed-from-`node_modules` question is an explicitly disclosed, unverified gap (both CLI's and MCP's own `ROADMAP.md` footnotes say so). |
| release automation | | ✅ | | | Track C: `release.yml` is real, correctly structured, matches Changesets' own documented flow — but has genuinely **never been executed against a real release** (all 17 packages remain at `0.1.0`, zero real version bumps, zero real npm publishes). "**Built**" is true; "**proven in production**" is not, and cannot be until a first real release occurs. |
| migration strategy | | ✅ | | | `MIGRATION.md` (82 lines) documents the intended process end-to-end — but by its own admission, "no per-version migration-guide entries are fabricated here, since no `@ultimate/*` package has ever shipped a real version." A documented *plan* for migration exists; actual migration *experience* does not yet exist to validate it. |
| CLI quality | | ✅ | | | 5 real, tested commands; 3 explicitly deferred (`create`/`migrate`/`update`) per approved spec scope — this is intentional scope-narrowing, not a quality defect. |
| AI/MCP quality where those phases are enabled | | ✅ | | | Both MCP (5 real tools) and AI/Skills (real generator tooling + 8 real skill files) are enabled and substantially built — but AI/Skills' own generated-artifact chain has a real, disclosed gap (GAP-036: no `llms.txt` ever generated-and-committed). |

**Answer to the explicit question:** Ultimate's post-Phase-10 maturity is **"broadly and genuinely CI-enforced across the dimensions Blueprint §40 names, with zero items still at zero coverage" — a materially different and more mature state than the pre-audit gap registry's text currently implies** (which still shows GAP-004/005/031/032/033/035 as `MISSING`/`NOT-ENFORCED`, i.e., zero coverage, when in fact all six are now real and enforced). At the same time, **"production-ready" in the fullest sense (a real release has shipped, a real consumer app exists, the security/migration processes have been exercised under real conditions) remains genuinely not yet true** — every §40 item that requires *proof under real operating conditions* (release automation, migration strategy, security process) is honestly in the "built and ready, never yet exercised" state, which is meaningfully different from either "missing" or "production-proven."

---

## 9. Component coverage reality check

**Angular (authoritative PrimeNG-derived inventory exists, but is stale):**
`docs/architecture/COMPONENT_INVENTORY.md` was last accurate at the original 5-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus primitives (Ripple, AutoFocus, Fluid, Badge) and foundation tier. It was **never updated** after Paginator, Scroller, and Table were added — its own "Remaining" table still lists all three as `NEEDS ARCHITECTURE DECISION`/not-yet-built, which is factually incorrect: `packages/ng/src/` contains real `paginator/`, `scroller/`, `table/` directories today, all three shipped, tested, and SSR-verified (Track E).

**Real current component count** (excluding non-component support dirs):
- **Angular** (`packages/ng/src/`): 12 directories — `autofocus`, `badge`, `button`, `checkbox`, `dialog`, `fluid`, `menu`, `paginator`, `ripple`, `scroller`, `table`, `tooltip`. (8 in the cross-framework proof set + 4 Angular-only primitives.)
- **React** (`packages/react/src/`): 8 directories — the full proof set (`button`, `checkbox`, `dialog`, `menu`, `paginator`, `scroller`, `table`, `tooltip`), no extras.
- **Vue** (`packages/vue/src/`): 9 directories — the full proof set plus `ripple` (directive, per ADR-034).

**The corrected "built" figure for GAP-017's own accounting is 8 (proof set) + up to 4 Angular-only primitives = up to 12 Angular source areas incorporated, not the stale "14."** (The original "14" figure predates Paginator/Scroller/Table and may have counted differently — this audit does not attempt to re-derive PrimeNG's exact 117-directory taxonomy mapping, only to confirm the built-component list itself has grown since the document was last edited.)

**Remaining known component families** (per the existing, if numerically-stale, `COMPONENT_INVENTORY.md` categorization): Form (~28, blocked by GAP-018 for Angular), Overlay (8, unblocked but sequenced after a second-consumer trigger per GAP-022's own note), Navigation (10, unblocked), Data (8 rows total; the proof-set's Table/Scroller/Paginator are now built — the remaining Data rows are TreeTable/Tree/OrderList/PickList/DataView, 5 rows, of which Tree/TreeTable/TreeSelect are blocked by GAP-013/DECISION-D), Panel/Layout/Display (26, unblocked), Visualization (1 — Chart, blocked by DECISION-B), plus Editor (blocked by DECISION-B) and the cross-cutting `config`/`passthrough`/`icons` surfaces (deliberately deferred, GAP-021).

**Architecture-blocked components specifically:** Chart, Editor (DECISION-B); Tree, TreeTable, TreeSelect, OrganizationChart (GAP-013/DECISION-D); the ~20-component native-input Form family for Angular specifically (GAP-018 — **Angular only**; whether React/Vue have an equivalent foundation-tier gap is a genuinely **unknown, not merely unchecked** fact, since neither framework ever had a full inventory produced to check against in the first place).

**React/Vue inventory limitation, reported honestly per this audit's own binding constraint:** No React-native or Vue-native equivalent of `COMPONENT_INVENTORY.md` exists anywhere in the repository. `docs/architecture/PROVENANCE.md` explicitly states, for React: "Remaining ~111 source areas not classified this phase... a full inventory was deliberately not pre-committed," and for Vue: "Remaining ~145 source areas classified but not incorporated... not committed this phase." **No parity number is invented here for either framework** — this is a genuine, disclosed limitation of the current documentation, not a gap this audit can quantify without doing the inventory work itself (which is out of this audit's scope).

---

## 10. Production-readiness gap analysis

**What still prevents Ultimate from being credibly described as production-ready, ranked:**

| Rank | Item | Dependency impact | Risk | Value | Unblockability | Scope/complexity |
|---|---|---|---|---|---|---|
| 1 | **GAP-018** (Angular Form foundation tier) | HIGH — blocks ~20 components | LOW (pattern proven) | HIGH (unlocks the largest single Angular family) | Fully unblockable now, no dependency | LOW-MEDIUM |
| 2 | **DECISION-C reconciliation** (verify whether Table's implementation plan already resolved the fuller filter/data architecture question) | MEDIUM-HIGH — affects up to 7 Data-family components' fuller scope | LOW (verification only, not new work) | HIGH (could retire an entire open decision at near-zero cost) | Fully unblockable now — just needs a direct read of the named implementation plan's Tasks 5/13/19 | VERY LOW (pure verification) |
| 3 | **GAP-036** (generate + commit real `llms.txt`) | LOW | LOW | MEDIUM (completes Phase 9's own deliverable chain, directly Blueprint-named) | Fully unblockable, tooling already built and tested | VERY LOW |
| 4 | **GAP-009/GAP-023** (Angular tree-shaking/exports) | MEDIUM (Angular bundle-size confidence) | LOW (pattern proven by 2 sibling frameworks) | MEDIUM | Fully unblockable | LOW |
| 5 | **GAP-007** (Angular overlay z-index/Escape stacking) | MEDIUM (blocks every future Angular overlay component correctly) | MEDIUM (accessibility/UX correctness for multi-overlay scenarios) | MEDIUM | Fully unblockable, shared infra already exists | LOW |
| 6 | **A real, exercised release** (Track C's own disclosed gap — first real Changesets version bump + npm publish) | HIGH for any external-consumer credibility claim | MEDIUM (untested automation carries first-run risk) | HIGH (the single most "is this really production-ready" signal) | Blocked only by a deliberate decision to actually cut a release — not by any remaining engineering work | LOW engineering scope, but a real go/no-go business decision, not a technical task |
| 7 | **DECISION-B** (external dependency policy — Chart/Editor) | LOW (2 named components) but sets precedent for all future non-Prime deps | LOW | MEDIUM | Fully unblockable, no prerequisite | LOW (policy decision) + MEDIUM (first real license/provenance evaluation of a non-Prime library) |
| 8 | **GAP-006** (Tooltip `aria-describedby`) | LOW (isolated) | LOW | LOW | Fully unblockable | VERY LOW |
| 9 | **GAP-037** (PERFORMANCE.md React/Vue/Themes sections) | LOW | LOW | LOW | Fully unblockable | VERY LOW |
| 10 | **GAP-017** (remaining component-family expansion) | Varies per family | LOW (proven pattern) | HIGH cumulatively, but each individual component is independently low-value/low-risk | Mostly unblockable now (except Form family pending #1, Data/Tree pending #2/GAP-013, Chart/Editor pending #7) | Large in aggregate, small per-component |

**No ranking choice is made on the human's behalf** — this table orders by the 5 stated criteria as evidence, not as a recommendation of what to do first.

---

## 11. Blueprint/documentation drift

### Drift 1 — `ROADMAP.md`'s phase table is factually wrong on Phases 9 and 10
**Claim A** (`docs/architecture/ROADMAP.md` lines 5–17): Phase 9 "Not started"; Phase 10 "Not started."
**Actual repo state:** `packages/ai/src/` has 7 real files; `skills/` has 10 real files (8 per-component + `AGENT_CONVENTIONS.md` + `README.md`); Phase 10 has 5 tracks, all merged into `main` (`git log --oneline --all` shows 5 distinct track-merge commits, most recently `9ec7883` for Track E).
**Which is authoritative:** the real repository. `ROADMAP.md` is stale and should be corrected in a future documentation pass — **not corrected by this audit**, per the binding constraint against modifying authoritative documents during an audit.
**Nature of the issue:** Factual/stale, not architectural — nothing about the Blueprint's intent is in question, only whether this one tracking document was updated after the work landed.

### Drift 2 — `BLUEPRINT_GAPS.md` self-contradicts on Phases 6–9
**Claim A** (`BLUEPRINT_GAPS.md` §2, its own phase-status table near the top of the file): Phase 6/7/8/9 all "Not started," each phase's package confirmed as "`.gitkeep`-only."
**Claim B** (the same document, later, in its own §3 gap entries): GAP-027 (Phase 6) "Status: RESOLVED"; GAP-028 (Phase 7) "Status: RESOLVED"; GAP-029 (Phase 8) "Status: RESOLVED"; GAP-030 (Phase 9) "Status: MISSING" (itself now also stale, per §3 of this audit).
**Actual repo state:** Confirms Claim B's direction for Phases 6-8, and confirms Claim B is itself stale for Phase 9 (real `packages/ai`/`skills/` content exists).
**Which is authoritative:** neither internal claim alone — the real repository. This is the clearest single piece of evidence in this entire audit that `BLUEPRINT_GAPS.md`'s own top-of-document summary table was never revised after later sections of the same document were updated with newer findings.
**Nature of the issue:** Factual/stale, self-inflicted by the document's own incremental-editing history, not architectural.

### Drift 3 — `PERFORMANCE.md` has an undocumented Phase 10 section already, contradicting the prior registry's own `UNVERIFIED` guess
**Claim A** (`BLUEPRINT_GAPS.md`'s own UNVERIFIED item #10): "no Phase 3/4/5 performance section exists in the file as read" — implicitly assuming only Phase 1/2 sections exist.
**Actual repo state:** `PERFORMANCE.md` has `## Phase 2 — UltimateNG` AND `## Phase 10 — CI/Security/Quality Gates` sections — the Phase 3/4/5 gap is real (confirmed, GAP-037 above), but the prior document's own framing ("only Phase 1/2") undersold what's actually there by missing the Phase 10 section it apparently predates.
**Which is authoritative:** the real file. This is a minor drift — the underlying substantive gap (no React/Vue/Themes performance baseline) is correctly identified either way, just described slightly incorrectly in scope.
**Nature of the issue:** Factual/stale (the prior registry entry simply predates Track B's own PERFORMANCE.md edit).

### No architectural drift found.
Every ADR in `DECISIONS.md` checked against real repository behavior in this pass (ADR-003, ADR-018/024/032's Option-B postures, ADR-025/026/027/030/034/040's framework-divergence claims) remains consistent with actual source — no ADR claims something the repository contradicts. The drift found in this audit is entirely in *tracking/summary* documents (`ROADMAP.md`, `BLUEPRINT_GAPS.md`'s own top-level table), not in the Blueprint itself or in any individual Architecture Decision Record.

---

## 12. Audit continuity

This is the established audit-artifact convention for this repository (per this document's own placement under `docs/architecture/research/`, matching prior audit-shaped documents like `2026-09-12-track-e-ssr-id-nondeterminism-finding.md` and `2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`). A future agent resuming reconciliation work should:

1. Read this document in full before touching `BLUEPRINT_GAPS.md`, `ROADMAP.md`, or `DECISIONS.md` — it contains the evidence trail for every claimed status change.
2. Treat §3's per-gap reconciliation table as the authoritative "what to actually change" list if/when a human authorizes a `BLUEPRINT_GAPS.md` revision (this audit does not perform that revision itself).
3. Treat §4's two newly-surfaced gaps (GAP-036, GAP-037) as candidate new entries for that same future revision, with stable proposed IDs already assigned to avoid collision with the existing GAP-001–035 range.
4. Follow up on §5's flagged-but-unresolved DECISION-C reconciliation question (does the Table implementation plan's Tasks 5/13/19 actually retire part of DECISION-C's open scope?) — this was identified but not run down in this pass, since resolving it would require reading a full separate implementation plan document not otherwise in this audit's critical path.
5. Not re-run the entire audit from scratch — this document's evidence trail (commit SHAs, file:line references, direct quotes) should let a future agent verify or extend specific findings without re-deriving all of them.

This audit artifact is **not committed** to git as part of this task — it exists as an untracked file in the working tree, per the audit's own constraint against making commit decisions on the user's behalf. The coordinating agent/user decides whether and how to commit it.
