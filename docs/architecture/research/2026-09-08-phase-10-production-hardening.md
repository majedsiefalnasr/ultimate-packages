# Phase 10 — Production Hardening: Research

**Status:** Draft for review
**Date:** 2026-09-08
**Scope:** Research only. No specification, no implementation plan, no source/CI changes, no branch, no commit.
**Baseline:** `main` at `ee2713f` (Phase 9 merged, working tree clean, full verification passed per the Phase 9 closeout).

---

## 1. Executive Summary

Phase 10 — Production Hardening is the only remaining phase in `docs/architecture/ROADMAP.md`. The Blueprint gives it eight broad objectives (§35) but no dedicated section breaking them into implementation-level detail, unlike Phase 9 which had §22–§26 to ground it. This research independently re-verifies every Phase-10-relevant claim in `docs/architecture/BLUEPRINT_GAPS.md` against current `main`, rather than trusting that document, and finds:

- **All eight objective areas are confirmed still open** at effectively zero automated coverage: no dependency/license/SAST scanning, no visual regression, no accessibility automation, no real-browser testing, no SSR/hydration verification, no bundle-size CI gate, no coverage-threshold gate, no SECURITY/CONTRIBUTING/CHANGELOG, and no wired release-automation workflow (a changesets config exists but nothing invokes it).
- **`BLUEPRINT_GAPS.md` is not uniformly stale.** It was actively maintained through Phase 8 (GAP-027/028/029 were formally marked RESOLVED in commits accompanying those phases), but **GAP-030 (Phase 9) was never updated** — it still reads `MISSING` even though Phase 9 is complete on `main`. This is a real, confirmed documentation gap this research surfaces (see §12).
- **DECISION-A (visual regression + real-browser tooling) remains genuinely unresolved** — no ADR, no spec, no prior evaluation exists anywhere in the repository. §11 below evaluates the realistic options against this specific repository's shape.
- **No new architectural blocker was found.** The two gaps the registry calls true architectural blockers (GAP-018 Angular form foundation, GAP-027 metadata) are both pre-Phase-10 concerns; GAP-027 is resolved. Phase 10's own gap cluster is additive CI/process/documentation work with one real tooling fork (DECISION-A) and no other genuine architectural question.
- **Phase 10's eight objectives do not map to one coherent unit of work.** §13 finds natural, evidence-backed dependency boundaries (testing/browser infrastructure; CI/security/quality gates; release engineering; operational documentation; SSR/hydration) that argue for sequenced sub-tracks rather than one spec/plan cycle, mirroring how Phase 9 was itself scoped narrower than its full Blueprint §35 objective list might have suggested.

**Recommended next gate:** Architecture Discussion, scoped first to (a) DECISION-A and (b) Phase 10 sequencing/sub-track boundaries. Both are the kind of genuine forks that gate exists to resolve — see §15.

---

## 2. Authoritative Blueprint Scope

Direct quotes from `docs/architecture/BLUEPRINT.md`, all re-read this session.

### §35 Phase 10 — Production Hardening (lines 1211–1224)

> Objectives:
> - security
> - accessibility
> - performance
> - browser compatibility
> - SSR/hydration
> - package quality
> - release automation
> - migration tooling
> - operational documentation

This is the complete text of Phase 10's own section — no sub-bullets, no acceptance criteria, no sequencing hint. Every other requirement used in this research is drawn from the *strategy* sections (§28–§31), not from §35 itself, because §35 does not elaborate further.

### §28 Testing Strategy (lines 892–943)

Six named testing tiers: Unit, Component, Integration, Cross-framework Contract Tests, Visual Regression ("Use stable theme/component combinations"), Accessibility ("Automated checks plus targeted keyboard/screen-reader behavior tests"), and Build/Package (tree-shaking, package exports, ESM, "SSR where supported", bundle boundaries, "absence of unwanted AI/tooling runtime dependencies").

### §29 Security Strategy (lines 946–962)

> Security process must include:
> - dependency scanning
> - license scanning
> - SAST where appropriate
> - vulnerability monitoring
> - security advisories
> - patch releases
> - provenance tracking
> - malicious package/dependency review
>
> Prime security advisories are inputs, not automatic patches.

No secret-scanning line item appears anywhere in §29 or elsewhere in the Blueprint — I treat this as a genuine absence, not an oversight to silently fill in (see §14).

### §30 Accessibility Strategy (lines 965–981)

Per-component expected: semantic structure, keyboard interaction, focus management, ARIA behavior, screen-reader behavior, disabled/loading states, high-contrast considerations "where relevant", RTL behavior. "Accessibility regressions are release blockers for affected components."

### §31 Performance Strategy (lines 984–999)

> Measure: bundle size, component cost, rendering cost, change/update cost, virtual scrolling performance, overlay performance, SSR/hydration behavior, tree-shaking.
> Do not optimize based on assumptions; establish benchmarks.

### §40 Definition of Done for the Platform (lines 1333–1354)

Production readiness requires (verbatim list): verified licensing/provenance, no prohibited Prime runtime dependencies, stable package boundaries, supported framework versions, accessibility validation, security process, performance benchmarks, visual regression coverage, documented APIs, metadata coverage, compatibility resolver, release automation, migration strategy, CLI quality, AI/MCP quality "where those phases are enabled."

### §39 Documentation Artifacts (lines 1305–1330)

Names `DECISIONS.md`, `PROVENANCE.md`, `DEPENDENCIES.md`, `COMPATIBILITY.md` as recommended architecture docs. **Notably absent from this list:** `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` — those three are not named anywhere in §39. Their requirement, if any, must come from §29/§40 by inference, not a direct §39 mandate. Flagged as an ambiguity in §14.

### §38 Architecture Decision Records (lines 1277–1300)

Names 13 "initial ADR candidates" (ADR-001 through ADR-013). None target Phase-10-specific concerns (security tooling, visual-regression tooling, coverage, release automation) — those ADR numbers were reserved for foundational/platform decisions already resolved in Phases 0–9. Confirmed no Phase-10-scoped ADR exists yet (`docs/architecture/DECISIONS.md` runs ADR-001–ADR-043, all tied to Phases 0–9 work).

### §41 Explicit Non-Goals (lines 1357–1372)

Relevant to Phase 10 scoping: "replace Angular CLI," "replace Vite," "become a general-purpose build system," "bundle AI/MCP dependencies into application runtime." None of these constrain Phase 10 directly, but they bound how release/migration tooling (§35) should be interpreted — Phase 10 tooling must not become a build-system replacement.

---

## 3. Current Repository Baseline

Verified directly against `main` at `ee2713f` this session (not inferred from any prior document).

| Item | State |
|---|---|
| `SECURITY.md` / `CONTRIBUTING.md` / `CHANGELOG.md` | **Do not exist** (confirmed via direct `ls`) |
| Storybook / Playwright / axe-core / Percy / Chromatic references | **Zero matches** anywhere in any `package.json` (root + all packages, grepped) |
| SAST / dependency-audit / license-scan CI steps | **Zero matches** in `.github/workflows/ci.yml` (grepped for `audit`, `license-checker`, `codeql`, `semgrep`) |
| Coverage-threshold config | **None found** — no `vitest.config.*` glob resolved in the repo root or package roots under that name (package-level Vitest config is inline in `package.json`/`vite.config` variants — not individually re-audited per package in this pass, flagged `UNVERIFIED` at the per-package level, but no CI-level coverage gate exists regardless) |
| Bundle-size CI step | **None** — `scripts/provenance/measure-package-size.mjs` exists and works but is not called from `.github/workflows/ci.yml` |
| `docs/architecture/PERFORMANCE.md` | Exists, but only has **Phase 1 and Phase 2** sections (`## Package size`, `## Tree-shaking spot-check`, `## Phase 2 — UltimateNG` subsections) — never extended through Phases 3–9 |
| `.changeset/config.json` | **Exists**, configured (`access: "restricted"`, `baseBranch: "main"`), but **no root `package.json` script and no CI step invokes `changeset version`/`changeset publish`/`changeset status`** — config scaffold only, not wired |
| `apps/playground-angular`, `apps/playground-react`, `apps/playground-vue`, `apps/showcase`, `apps/docs` | **All `.gitkeep`-only** — no real consumer app exists in any framework (GAP-008 still fully open) |
| `isPlatformBrowser()` guard | Present in `packages/ng/src/{tooltip,autofocus,ripple,dialog}.ts` and `packages/ng-core/src/overlay/overlay.ts` — an SSR-*awareness* guard in source, not a test |
| SSR/hydration test files | **Zero** — no filename matching `*ssr*`/`*hydrat*` anywhere in the repository outside `node_modules` |
| Package `private` field | **No package under `packages/*` is marked `private`** — all 17 are publish-eligible by that field; only the workspace root (`package.json`) is `"private": true`. Consistent with eventual public/internal registry publishing intent, but nothing currently publishes them. |
| `.github/workflows/ci.yml` | 20 named steps total (checkout → install → lint → format:check → typecheck → build → validate → test → provenance self-tests → provenance:validate → boundary:validate (+cli/mcp/ai) → ceiling:validate → compatibility-manifest:validate). No security/coverage/bundle-size/visual/SSR step among them. |
| `docs/architecture/DECISIONS.md` | ADR-001 through ADR-043, all Phase 0–9 scoped. No Phase-10-targeted ADR exists. |
| Full workspace test/build/validate | All green as of the Phase 9 closeout verification this session (typecheck ✓, build ✓, `validate` ✓ 8/8 Skill files + 5/5 LLM-context files, full test suite ✓ across all 15 test-bearing workspaces, 0 failures) |

---

## 4. Phase 10 Requirement-by-Requirement Gap Analysis

| Blueprint requirement (§28–31, §40) | Current state | Verdict |
|---|---|---|
| Dependency scanning (§29) | None in CI | **Open** |
| License scanning (§29) | None in CI (distinct from Phase 0's Prime-source MIT provenance checks, which cover a different concern — source lineage, not ongoing npm-dependency license risk) | **Open** |
| SAST (§29) | None in CI | **Open** |
| Vulnerability monitoring / security advisories (§29) | None automated; no process documented | **Open** |
| Provenance tracking (§29) | **Partially satisfied** — `scripts/provenance/*` + `docs/architecture/PROVENANCE.md`/`provenance/*.json` cover Prime-source lineage exhaustively (this is Phase 0's domain, already CI-enforced). Does not cover ongoing npm supply-chain provenance (e.g., npm provenance attestations at publish time) — that's release engineering (§8 below), not this line item. | **Partially open** — Prime-lineage sense done; publish-time sense open |
| Malicious package/dependency review (§29) | No process | **Open** |
| Visual regression (§28, §40) | None | **Open**, tied to DECISION-A |
| Accessibility automation (§28, §30) | None automated. Manual/behavioral a11y exists inside component unit tests (not independently re-audited per-component in this pass) but no axe-core-class automated scan exists anywhere. | **Open** |
| Real-browser / cross-browser testing (§28, §31) | Everything runs under jsdom (framework packages) or Angular `TestBed` (also simulated DOM, not a real engine) | **Open**, tied to DECISION-A |
| SSR/hydration (§28, §31) | Guard code exists in Angular only; zero verifying tests, zero real consumer app to exercise it end-to-end | **Open**, see §10 |
| Performance benchmarks (§31, §40) | `measure-package-size.mjs` exists, run manually twice (Phase 1, Phase 2), recorded in `PERFORMANCE.md`; not extended to Phases 3–9; not CI-enforced | **Partially open** — capability exists, coverage and enforcement do not |
| Bundle-size budget (§31) | No budget defined anywhere, no regression gate | **Open** |
| Coverage threshold (§40 "test coverage enforcement" — actually: §40 does not use this exact phrase; see §14 ambiguity note) | Tests run (full suite green), no threshold gate | **Open** |
| Release automation (§35, §40) | `.changeset/config.json` present, unwired; no CHANGELOG.md; no root release script | **Open** — scaffold only |
| Migration tooling (§35, §40 "migration strategy") | `@ultimate/cli`'s `create`/`migrate`/`update` commands are explicitly unimplemented per Phase 7's own scope (`ROADMAP.md` footnote 3) | **Open** — deliberately deferred from Phase 7, now Phase 10's to pick up per Blueprint phrasing, or remains deferred further (open question, see §14) |
| Operational documentation (§35) | SECURITY.md/CONTRIBUTING.md/CHANGELOG.md all absent | **Open** |
| Package quality (§35 — ambiguous term, see §14) | `packages/*` build/typecheck/lint/format:check/boundary-validate all pass; no dedicated "package quality" checklist exists mapping directly to this Blueprint word | **Ambiguous scope, partially covered by existing gates** |
| Browser compatibility (§35) | No real-browser matrix testing exists (same as real-browser testing row above) | **Open**, tied to DECISION-A |

---

## 5. Testing / Browser / Visual / Accessibility Research

Current testing stack, confirmed: Vitest everywhere (ADR-022's "Vitest-everywhere consistency," referenced in the prior gap registry and still true — every `packages/*` test script invokes `vitest`), jsdom for React/Vue/shared-package DOM simulation, Angular `TestBed` for Angular-specific component tests. 96+ test files existed as of the pre-Phase-6 registry snapshot; the actual current count is higher (Phase 6–9 added `component-metadata`, `cli`, `mcp`, `ai` test suites — 42+70+47+80 tests respectively, confirmed in this session's Phase 9 closeout test run).

None of this exercises a real browser engine. jsdom approximates layout, focus, ARIA computed roles, and CSS cascade — it does not execute them. This matters specifically for the accessibility and visual-regression claims Phase 10 must make credibly (§30's "screen-reader behavior," "high-contrast considerations," "RTL behavior" are exactly the categories jsdom cannot faithfully exercise).

Test determinism/reproducibility: not independently investigated as a new question in this pass — no flakiness pattern was found beyond the single pre-existing, load-sensitive `packages/vue-core/test/exports.test.ts` timeout observed during the Phase 9 closeout (confirmed unrelated to Phase 9, reproduces only under full-parallel-workspace load, passes cleanly in isolation). Not a Phase 10 blocker; worth noting as a known flake if a coverage/CI-timing gate is added later, since tighter CI timeouts could make it visible more often.

---

## 6. Security / Supply-Chain Research

Current CI (`.github/workflows/ci.yml`) security-adjacent steps: `provenance:validate` (Prime-source lineage only), `boundary:validate` family (package dependency-direction enforcement, an architectural constraint, not a vulnerability scan), `ceiling:validate` (dependency-count ceiling, also architectural). None of these is a substitute for the four items Blueprint §29 actually names: dependency scanning, license scanning, SAST, vulnerability monitoring.

No tool evaluation is performed in this research pass per the task's explicit instruction ("Do not recommend tools yet unless the evidence/research requires evaluating them" — §29's four items are tooling-choice-only per the prior registry's own "Architectural decision required: No" tag, and nothing in this pass surfaced a reason to contest that tag). The GAPS registry's suggestion to follow the existing `provenance:validate`/`boundary:validate`/`ceiling:validate` CI-step pattern remains a reasonable structural precedent, not a decision made here.

---

## 7. Performance / Package Quality Research

`scripts/provenance/measure-package-size.mjs` — confirmed present and previously functional (ran successfully twice per `PERFORMANCE.md`'s own Phase 1/Phase 2 sections). Its coverage was never extended to `react-core`/`react`/`vue-core`/`vue`/`themes`/`component-schema`/`component-metadata`/`cli`/`mcp`/`ai`/`uix-data` — 11 of the now-17 packages have no recorded size measurement at all.

Tree-shaking: proven working for React and Vue (per-component subpath exports confirmed present in both packages' `package.json` `exports` maps in earlier phases); Angular's tree-shaking was called "verified broken" in the prior registry (GAP-009, ships one barrel instead of secondary entry points) — **not independently re-verified in this pass** (out of this research's stated scope: Phase 10 concerns, not a Phase-2-scoped Angular architecture question) but flagged as still-relevant context since §31 explicitly lists tree-shaking as a Phase 10 measurement target.

Packaging validation: Phase 9 itself established a real precedent here — the `pnpm pack`/`pnpm install`-based standalone packaging-contract test built for `@ultimate/ai` (Task 8 of the Phase 9 plan) is the first place in the repository that verifies a package's published tarball genuinely resolves its own dependencies outside the workspace. No equivalent test exists yet for `ng`/`react`/`vue`/`themes`/`cli`/`mcp` or any other package — this is real, reusable infrastructure precedent for whichever Phase 10 sub-track covers package quality.

---

## 8. Release Engineering Research

`@changesets/cli` is a root devDependency (`^2.27.0`) and `.changeset/config.json` is fully configured (changelog generator wired to `@changesets/cli/changelog`, `access: "restricted"`, `baseBranch: "main"`, `updateInternalDependencies: "patch"`). This is meaningfully further along than "nothing exists" — it is a **configured-but-never-invoked** scaffold: no root `package.json` script (`"changeset"`, `"version-packages"`, `"release"` — none present), no CI workflow step, and consequently no CHANGELOG.md has ever been generated for any package.

`@ultimate/cli`'s `create`/`migrate`/`update` commands remain unimplemented, confirmed unchanged since Phase 7 (`ROADMAP.md` footnote 3, re-verified: `packages/cli/src/commands/` was not re-inspected file-by-file in this pass, but the footnote itself is dated to Phase 7's own closeout and nothing in Phases 8–9 touched `@ultimate/cli`). Whether "migration tooling" (§35) means finishing these three CLI commands, or something narrower (e.g., just a migration *guide*, matching §40's "migration strategy" wording rather than "migration tooling" implying built software) is a genuine ambiguity — see §14.

No npm publish workflow, no provenance/signing (npm's `--provenance` flag or equivalent) exists in CI. Blueprint §29 lists "provenance tracking" as a security-process item; whether that's meant to extend to *published-package* provenance (npm attestations) or is fully satisfied by the existing Prime-source provenance tracking is not resolved by the Blueprint text itself — flagged in §14.

---

## 9. Operational Documentation Research

Confirmed absent: `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` (root-level, direct `ls` check). `docs/architecture/BLUEPRINT.md` §39 does not name any of these three files in its "Documentation Artifacts" list — that list is `BLUEPRINT.md`, `DECISIONS.md`, `PROVENANCE.md`, `DEPENDENCIES.md`, `COMPATIBILITY.md`, `PACKAGE_ARCHITECTURE.md`, `AI_ARCHITECTURE.md`, `ROADMAP.md`. (Note: `PACKAGE_ARCHITECTURE.md` and `AI_ARCHITECTURE.md` were not independently verified to exist in this pass — out of this research's Phase-10 scope, flagged `UNVERIFIED`, not a Phase 10 concern either way since §39 is a general documentation-artifacts list, not Phase-10-specific.)

The requirement for SECURITY/CONTRIBUTING/CHANGELOG therefore comes only by inference from §29 (security process → conventionally documented via SECURITY.md), §35 ("operational documentation," unspecified contents), and §40 ("release automation" conventionally implies CHANGELOG.md). This is a real but inference-based requirement, not a literal Blueprint mandate naming these three filenames — recorded as ambiguity in §14, not silently resolved.

---

## 10. SSR / Hydration Research

Blueprint §13 (Angular Compatibility Strategy) and §14 (React/Vue Compatibility Strategy) both name SSR/hydration as a per-framework compatibility responsibility (confirmed present in both section headers during the earlier table-of-contents pass; full text of §13/§14 not re-quoted here as it was not re-read verbatim this session — flagged `UNVERIFIED` for exact wording, though the section titles and their inclusion in the phase-status table are confirmed). §28's Build/Package tier requires verifying "SSR where supported." §31 lists "SSR/hydration behavior" as a thing to measure.

Current evidence, as stated in §3 above: an `isPlatformBrowser()` guard in five Angular source locations is the *only* SSR-related code in the entire repository. Per this task's explicit instruction, **this guard does not constitute SSR support or verification** — it is defensive code preventing a specific class of server-side crash (accessing `window`/`document` when they don't exist), not evidence that Angular Universal (or Next.js/Nuxt for React/Vue) can actually render and hydrate any Ultimate component correctly end-to-end. No SSR-capable app shell exists anywhere (`apps/*` all `.gitkeep`-only), so there is currently no way to even attempt that verification without first building one.

This ties directly to GAP-008 (no real consumer app) — the prior registry's dependency graph (§6 of that document) already noted GAP-008 blocks GAP-034 (SSR/hydration verification), and this research independently confirms that dependency still holds: SSR/hydration cannot be meaningfully verified without at least one SSR-capable real consumer app in at least one framework.

---

## 11. DECISION-A Evaluation — Visual Regression + Real-Browser Testing Tooling

**The fork, restated:** what tool(s) satisfy Blueprint §28's visual regression requirement and §28/§31's real-browser/cross-browser interaction testing requirement, and should one tool serve both?

**Status confirmed:** genuinely unresolved. No ADR (ADR-001 through ADR-043 checked, none address this), no spec, no prior tooling trial exists anywhere in the repository. ADR-023 (Phase 2) is on record as having *deferred* this decision, not resolved it (per the prior registry's citation, not independently re-read verbatim from `DECISIONS.md` line 23's exact ADR text in this pass — the ADR number and deferral framing were cross-checked against `DECISIONS.md`'s existing ADR-023 entry title, "React styling gets a working `StyleSheet` DOM-injection adapter..." — **correction: ADR-023 in the current `DECISIONS.md` is actually about React styling, not a visual-regression deferral.** This is a discrepancy between the prior gap registry's citation and the current `DECISIONS.md` content, flagged explicitly rather than silently reconciled — see §12).

### Options, evaluated against this repository's actual shape

The repository is a monorepo with three independently-built, framework-native component libraries (Angular via `TestBed`+Vitest, React and Vue via jsdom+Vitest), a from-scratch theme layer (Aura preset via `@ultimate/uix-styles`), zero existing consumer apps, zero existing documentation-site tooling, and CI already running 20 sequential steps in a single job on `ubuntu-latest`.

**(a) Storybook + a screenshot-diff addon (e.g., Chromatic, or an open-source screenshot-diff story-runner)**
- Directly serves two Blueprint requirements at once: §28 visual regression *and* §27 (Storybook and Documentation — confirmed as its own Blueprint section, §27, at line 871; not re-read verbatim this session but its section title independently establishes Storybook-class tooling is already a named Blueprint concern beyond just Phase 10).
- Natural fit for a component-library monorepo: each framework's components get their own stories, addressing the "no real consumer app" gap partially (a Storybook instance is a lightweight app-shell substitute for isolated component rendering, though not a substitute for GAP-008's SSR/real-app-integration need).
- Does not, by itself, provide cross-browser *interaction* testing (keyboard nav, focus order, ARIA computed roles) — screenshot diffing catches visual regressions, not behavioral ones.
- Framework support: Storybook supports Angular, React, and Vue natively (three separate framework integrations, one per package group) — matches this repo's three-framework shape without forcing artificial uniformity.
- Cost: standing up three Storybook instances (or one multi-framework instance, if Storybook's newer versions support that cleanly) plus a screenshot-diff service is nontrivial setup and ongoing CI time; commercial screenshot-diff services (Chromatic) have a cost model to evaluate; open-source alternatives (e.g., self-hosted pixel-diffing) shift cost to CI compute and maintenance instead.

**(b) Playwright alone**
- Real browser engines (Chromium/Firefox/WebKit) — directly satisfies §28/§31's real-browser and cross-browser requirements, and can also do SSR/hydration verification once a real app shell exists (GAP-008), since Playwright drives an actual served page, not a Storybook iframe.
- Has built-in visual-comparison (`toHaveScreenshot()`) — can satisfy §28's visual-regression requirement without a second tool, though without Storybook's story-browsing/documentation UI.
- No native component-documentation surface — doesn't help with §27 (Storybook/Documentation) at all.
- Would need real pages/routes to point at — either a minimal test-harness app per framework (lighter than a full consumer app) or reuse of a future `apps/playground-*` once GAP-008 is addressed.
- Fits naturally with SSR/hydration verification (§10 above) since it's the same tool that would drive a real app shell either way.

**(c) Both — Storybook for docs/browsing + visual regression, Playwright specifically for cross-browser interaction/SSR**
- Covers every Phase 10 testing-related requirement (§28 visual regression, §28/§31 real-browser + cross-browser, §31 SSR/hydration, §27 documentation) without forcing one tool to do work it's not suited for.
- Highest total setup/maintenance cost of the three options — two tools, two CI integrations, two sets of framework adapters to keep current across Angular/React/Vue version bumps.
- Most aligned with the *specific* Blueprint intent, since §27 and §28 are separate sections with separate concerns the Blueprint never suggests should collapse into one tool.

### Integration with existing Vitest/jsdom setup

None of the three options replace Vitest — Vitest continues to own Unit/Component/Integration-tier tests (§28) exactly as it does today (ADR-022's "Vitest-everywhere" pattern is not challenged by any of these options). Playwright and/or Storybook would be **additive** test tiers, not a migration off Vitest. This matters for CI cost: today's 20-step single-job CI run already executes a full Vitest suite across 15+ workspaces; adding a second, slower (real-browser) tier will materially change CI runtime and likely needs to run as a separate job or a scoped/conditional step, not folded into the existing linear step list without consideration.

### Suitability for the monorepo/package structure

All three options are workspace-friendly (Storybook and Playwright both have first-class monorepo/pnpm-workspace support), so package structure is not a differentiator between them.

### No recommendation is made here beyond what the evidence supports

Per the task's explicit instruction, this section presents evidence, not a final choice. The strongest evidence-based observation is that **(a)/(b)/(c) trade off cleanly along a single axis: how many of {visual regression, real-browser interaction, SSR/hydration exercise, component documentation} the repository needs solved at once versus how much CI/maintenance cost it can absorb now.** That trade-off is exactly what the Architecture Discussion gate should resolve, informed by whether Phase 10 is sequenced as one cycle or several (§13) — if testing/browser infrastructure becomes its own sub-track, there is more room to justify option (c)'s higher cost; if Phase 10 must ship as a single narrower slice first, (a) or (b) alone is more defensible as a first increment.

---

## 12. GAP / ADR Reconciliation

Verified against current `main`, not assumed from the prior registry.

| ID | Prior registry status | Re-verified status this session | Notes |
|---|---|---|---|
| GAP-004 (no visual regression/Storybook) | MISSING | **Confirmed still MISSING** | Zero Storybook/screenshot-diff tooling found; independently corroborated by Phase 9's own spec (`2026-09-07-phase-9-ai-skills-llm-context-design.md` explicitly cites GAP-004 as still-open when explaining why Phase 9 deferred documentation ingestion). |
| GAP-005 (no automated a11y scanning) | MISSING | **Confirmed still MISSING** | No axe-core or equivalent found anywhere. |
| GAP-011 (no SECURITY/CONTRIBUTING/CHANGELOG) | MISSING | **Confirmed still MISSING** | Direct `ls` check, all three absent. |
| GAP-031 (no dependency/license/SAST scanning) | MISSING | **Confirmed still MISSING** | `.github/workflows/ci.yml` re-read in full, 20 steps, none match. |
| GAP-032 (bundle-size not CI-enforced) | IMPLEMENTED-BUT-NOT-ENFORCED | **Confirmed same state**, and now further behind — `PERFORMANCE.md` still only has Phase 1/2 sections, meaning the "partial" implementation has not grown across five subsequent completed phases (3, 4, 5, 6/7/8/9 collectively). | Script still present and presumably still functional (not re-run in this pass — re-running it would be an execution action beyond read-only research scope for a script whose safety was not re-confirmed this session). |
| GAP-033 (coverage not CI-enforced) | IMPLEMENTED-BUT-NOT-ENFORCED | **Confirmed still open** — no coverage flag/threshold found in CI. Per-package Vitest coverage config was not individually re-audited (`UNVERIFIED` at that granularity), but CI-level enforcement is confirmed absent regardless. | |
| GAP-034 (no SSR/hydration verification) | IMPLEMENTED-BUT-UNVERIFIED | **Confirmed still open** — guard code only, zero tests, zero real app to test against. | Explicitly re-verified per this task's instruction not to assume the guard is sufficient. |
| GAP-035 (no browser-compat/real-browser testing) | MISSING | **Confirmed still MISSING** | Same jsdom/TestBed-only finding as GAP-004. |
| DECISION-A | Open, unresolved | **Confirmed still open** | See §11. One factual discrepancy found: the prior registry attributes an ADR-023 "deferral" citation that does not match current `DECISIONS.md`'s actual ADR-023 content (React styling adapter, unrelated topic). This is either a stale citation from before ADR renumbering, or an error in the original registry — not resolved here, flagged for whoever picks up DECISION-A formally to re-source directly from `DECISIONS.md` rather than reuse the old citation. |
| **GAP-030 (Phase 9 AI Skills/LLM Context)** | MISSING (as of the pre-Phase-6 registry snapshot) | **STALE — Phase 9 is actually complete on `main`.** The registry's own commit history (`e08f38f`, `511baa9`, `e6a4bf8`) shows GAP-027/028/029 were each formally marked RESOLVED in a dedicated commit immediately after their respective phase closed (Phases 6, 7, 8). **No equivalent commit exists for GAP-030 after Phase 9.** | This is a genuine, freshly-confirmed documentation gap — not invented by this research, discovered by it. Recorded here as evidence; not fixed in this pass since doc edits are out of scope for a research-only turn. |
| GAP-027/028/029 (metadata/CLI/MCP) | RESOLVED (per registry's own later commits) | **Confirmed correctly marked RESOLVED, and correctly so** — all three packages are real and populated on `main`, cross-checked against `packages/component-metadata`, `packages/cli`, `packages/mcp` non-`.gitkeep` contents. | Registry is accurate for these three. |
| GAP-008 (no real consumer app) | MISSING | **Confirmed still MISSING** | All five `apps/*` subdirectories remain `.gitkeep`-only. Directly relevant to Phase 10 via GAP-034 (SSR) and indirectly via genuine bundle-size/tree-shaking measurement credibility (§7). |
| GAP-018 (Angular BaseModelHolder/BaseInput) | MISSING, called a true architectural blocker | **Not re-verified in this pass** (out of Phase-10 scope — a component-family-expansion concern, not a Production Hardening concern) | Listed here only for completeness of "does it block Phase 10" — it does not; it blocks Form-family component expansion, a separate workstream. |

**Header-string staleness, distinct from the GAP-030 content issue:** `BLUEPRINT_GAPS.md`'s own top-of-file `**Purpose:**` line still reads "as of Phase 5 completion + the post-Phase-5 `@ultimate/uix-data` work" even though the document body was later patched for GAP-014/027/028/029 individually. The header was never updated to reflect that the document has, in practice, been incrementally maintained through Phase 8. This is a minor doc-hygiene inconsistency, noted for whoever next touches that file — not something this research pass corrects.

---

## 13. Phase 10 Sequencing / Sub-Track Analysis

Blueprint §35 lists eight objectives with no internal grouping. This research finds real, evidence-backed natural boundaries among them — not invented, but observed from how the *evidence itself* clusters:

1. **Testing / browser / visual / accessibility infrastructure** — security(partial: SAST is really a CI-tooling concern, grouped below instead), accessibility, browser compatibility, and the visual-regression half of "package quality." This cluster shares one property: it needs DECISION-A resolved before any of it can be scoped concretely, and its Playwright/Storybook choice materially affects CI architecture (§11's CI-cost point).
2. **CI / security / quality gates** — dependency/license/SAST scanning (§29), bundle-size CI enforcement (extending GAP-032's existing script), coverage-threshold enforcement (GAP-033). These four are, per the prior registry's own "Architectural decision required: No" tags (independently upheld by this research — nothing found to contest that), pure additive CI work with no tooling fork blocking them. This cluster could start immediately, in parallel with cluster 1, without waiting on DECISION-A.
3. **Release engineering** — finishing the changesets wiring, generating first CHANGELOG.md entries, deciding what "migration tooling" (§35) concretely means relative to `@ultimate/cli`'s already-deferred `create`/`migrate`/`update` commands (§8's flagged ambiguity). This cluster has its own open question (§14) that needs resolving before a spec can be written, independent of DECISION-A.
4. **Operational documentation** — SECURITY.md/CONTRIBUTING.md/CHANGELOG.md (the last item overlaps with cluster 3, since CHANGELOG.md's *content* depends on the release-engineering wiring, but its *existence as a file with a documented process* could be drafted independently). Zero architectural dependency on any other cluster.
5. **SSR/hydration verification** — genuinely blocked on GAP-008 (real consumer app), which is itself explicitly *not* a Phase 10 Blueprint objective (it's implied infrastructure, not named in §35's eight items) but is a hard prerequisite this research confirms (§10). This cluster cannot productively start until GAP-008 is addressed — which may mean this cluster's Phase 10 work is "build the minimal SSR-capable app shell needed to test with," scoped narrowly, rather than "build the full `apps/playground-*` consumer experience."

**Finding:** clusters 2 and 4 have zero cross-dependency on DECISION-A or on each other — they are the lowest-risk, most immediately actionable Phase 10 work by this evidence. Cluster 1 is gated on DECISION-A. Cluster 3 is gated on the migration-tooling-scope ambiguity (§14). Cluster 5 is gated on a GAP-008 scoping decision that itself has not been discussed anywhere.

This supports treating Phase 10 as **multiple independently gated sub-tracks rather than one specification/implementation cycle** — consistent with how the platform has already sequenced work (Phase 9 itself deferred documentation-ingestion scope rather than trying to solve GAP-004 inline, per §9 above's citation). Whether that sequencing should be formalized as "Phase 10a/10b/10c" sub-phases, or kept as Phase 10 with staged specs, is itself a decision for the Architecture Discussion gate — this research does not invent that naming scheme, only the evidence for why splitting is warranted.

---

## 14. Open Architectural Questions

Recorded as genuine ambiguities, not silently resolved:

1. **DECISION-A** (§11) — visual regression + real-browser tooling choice. The primary fork requiring Architecture Discussion.
2. **Migration tooling scope** (§8, §13 cluster 3) — does Blueprint §35's "migration tooling" mean finishing `@ultimate/cli`'s deferred `create`/`migrate`/`update` commands (Phase 7's own explicit deferral), or a narrower "migration strategy" document (§40's phrasing), or both? The Blueprint uses both phrasings in different sections (§35 "migration tooling," §40 "migration strategy") without clarifying whether they're the same requirement at two granularities or two distinct asks.
3. **"Package quality" (§35) — undefined term.** No Blueprint section defines what "package quality" means as a checklist. Existing CI already covers build/typecheck/lint/format/boundary/ceiling — is that already "package quality," or does §35 intend something additional (e.g., npm-pack integrity tests like the one Phase 9 built for `@ultimate/ai`, generalized to all packages — §7's finding)? Not resolved by this research.
4. **SECURITY.md/CONTRIBUTING.md/CHANGELOG.md as literal requirements** (§9) — not directly named in Blueprint §39's documentation-artifacts list; their necessity is inferred from §29/§35/§40, not mandated by exact filename anywhere. Worth confirming intent before speccing rather than assuming the conventional GitHub-repo trio is what's meant.
5. **Provenance/signing scope for release** (§8) — does §29's "provenance tracking" extend to npm publish-time provenance (e.g., `npm publish --provenance`), or is it fully satisfied by the existing Prime-source provenance system? Blueprint text does not disambiguate.
6. **GAP-008 scope for Phase 10's purposes** (§13 cluster 5) — does Phase 10 need a full real consumer app per framework (`apps/playground-*`'s originally-scaffolded intent), or only a minimal SSR-capable harness sufficient to verify hydration? These have very different implementation costs and neither is mandated specifically by §35's "SSR/hydration" line item.
7. **DECISION-A citation discrepancy** (§12) — the prior gap registry's ADR-023 citation for a visual-regression deferral does not match current `DECISIONS.md`'s actual ADR-023 content. Whoever formally resolves DECISION-A should re-source directly from `DECISIONS.md`, not reuse that citation uncritically.

---

## 15. Recommendations for the Next Architecture Discussion

1. Resolve **DECISION-A** first — it has the largest downstream footprint (gates cluster 1 of §13, and partially informs whether SSR/hydration testing in cluster 5 can reuse the same tool).
2. Decide **Phase 10 sequencing** (§13) — whether to run clusters 2 and 4 (CI/security gates, operational docs) as an early, low-risk first sub-track while DECISION-A and the migration-tooling-scope question (§14.2) are still being worked out, mirroring the platform's established pattern of shipping narrower, evidence-gated slices rather than one large cycle.
3. Resolve the **migration-tooling-scope ambiguity** (§14.2) before any release-engineering spec is written — it changes that sub-track's size substantially (finishing three real CLI commands vs. writing a document).
4. Explicitly confirm or reject the **SECURITY/CONTRIBUTING/CHANGELOG inference** (§14.4) so operational-documentation work has a firm target rather than an assumed convention.
5. Scope **GAP-008 for Phase 10's purposes specifically** (§14.6) — a full playground app and a minimal SSR-verification harness are different-sized commitments, and only the latter is strictly required by anything Phase 10's §35 text says.

No other genuinely new architectural fork was found. Everything else in Phase 10's scope (§29's four security items, §33's bundle-size/coverage gates, §9's documentation files once §14.4 is settled) is additive, evidence-supported implementation backlog with no "Architectural decision required" flag surviving this research pass's re-verification.

---

## 16. Sources / Evidence

- `docs/architecture/BLUEPRINT.md` — §2 (read earlier this session for TOC), §28, §29, §30, §31, §35, §38, §39, §40, §41, §42 (read in full or in relevant excerpt this session)
- `docs/architecture/ROADMAP.md` — full file read this session
- `docs/architecture/BLUEPRINT_GAPS.md` — full file read this session (header, §1–§8), cross-referenced against its own git history (`git log --oneline -- docs/architecture/BLUEPRINT_GAPS.md`)
- `docs/architecture/DECISIONS.md` — ADR index re-checked (`grep "^## ADR-0"`), full ADR-024–ADR-043 titles read
- `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` — cross-referenced for independent GAP-004 corroboration and confirmation that Phase 9 introduced no Phase-10-scoped content
- `.github/workflows/ci.yml` — read in full this session, re-confirmed 20 named steps, none matching security/coverage/bundle-size/visual/SSR concerns
- Direct repository inspection this session: `ls`/`find`/`grep` for SECURITY.md/CONTRIBUTING.md/CHANGELOG.md, Storybook/Playwright/axe-core/Percy/Chromatic references, audit/license-checker/codeql/semgrep CI steps, coverage config, `measure-package-size.mjs` CI wiring, `PERFORMANCE.md` section headers, `.changeset/` contents and config, `apps/*` contents, `isPlatformBrowser` occurrences, SSR/hydration test filenames, `private` field across all `packages/*/package.json`
- Phase 9 closeout verification performed earlier this session (typecheck/build/validate/full test suite on merged `main`) — used as the baseline confirming Phase 9 is genuinely complete, not just merged

**Not independently re-verified in this pass (explicitly flagged, not silently assumed correct):** exact verbatim text of Blueprint §13/§14 (Angular/React-Vue compatibility strategy sections) beyond their titles and TOC position; per-package Vitest coverage configuration; whether `PACKAGE_ARCHITECTURE.md`/`AI_ARCHITECTURE.md` exist; Angular's tree-shaking status (GAP-009) re-confirmation; `packages/cli/src/commands/` file-by-file re-inspection for the `create`/`migrate`/`update` deferral status (relied on the Phase 7 `ROADMAP.md` footnote, dated and not contradicted by anything found in Phases 8–9's work, but not re-opened file-by-file in this pass).
