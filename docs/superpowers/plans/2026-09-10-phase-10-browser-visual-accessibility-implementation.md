# Implementation Plan: Phase 10 Track A — Browser / Visual / Accessibility

**Document:** `docs/superpowers/plans/2026-09-10-phase-10-browser-visual-accessibility-implementation.md`
**Status:** Complete — implemented and merged (Track A); Phase 10 marked Complete in `docs/architecture/ROADMAP.md` and GAP-004/GAP-005/GAP-035 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`.
**Approved specification:** `docs/superpowers/specs/2026-09-10-phase-10-browser-visual-accessibility-design.md` (Spec Gate: APPROVED)
**Baseline:** `main` at `2b671e4` (Track D merged)

**Status detail:** This document contains no implementation. It defines tasks only. All requirement IDs (R1–R8), decision IDs (D1–D5), and open-question IDs (OQ-1–OQ-5) below refer to the approved specification and are not redefined here — this plan does not reopen or redesign any approved decision (D1–D5 unchanged, ADR-044 not reopened). Every plan-level decision below (exact versions, exact tolerance, exact file formats) is either independently verified against a real, current, authoritative source (npm registry, official docs) or explicitly flagged as requiring empirical confirmation at implementation time — never invented.

**Amendment history:** Amended once, in response to a Plan Review verdict of "APPROVE WITH REQUIRED AMENDMENTS," resolving 10 implementation-precision findings: Playwright test discovery/project structure (§1, PD-9), Task 4's `--list` verification (Task 4), the accessibility-fingerprint envelope mechanism (§1, PD-5 revised; Task 6-8), baseline population semantics (§1, PD-11 replacing the removed `--populate-initial` mode; Task 5), the accessibility evidence/report contract (§1, PD-12), Task 11's local-vs-CI mutation-testing split, Storybook CI serving/port/lifecycle contract (§1, PD-13; Task 10), deterministic story-count verification (Tasks 1-3, 12), dependency root-vs-package ownership rationale (§4), and explicit CI matrix × browser-project semantics (Task 10, PD-7 revised). No requirement (R1–R8) or decision (D1–D5) was reopened or redesigned; the approved specification was not modified.

---

## 0. Pre-Implementation Finding (reported, not silently absorbed)

**A factual gap was found in the approved specification's §5 component-inventory table during this plan's own repository verification.** `packages/vue/src/ripple/` exists, exports `rippleDirective`, is re-exported from `packages/vue/src/index.ts` (`export * from "./ripple"`), and is a real, non-stub implementation (129 lines, structurally comparable to Angular's own `ripple.directive.ts`). The approved spec's §5 table lists Vue as exactly "Button, Checkbox, Dialog, Menu (+ Menuitem), Paginator, Scroller, Table, Tooltip — 8 components," with no directive — this is now confirmed stale; Vue actually ships 8 components + 1 directive (`ripple`), not 8 components + 0.

**This is not a new architectural decision** — the approved spec's own §5 coverage contract already states the applicable rule generically: "every component/directive a framework ships gets full standalone Track A coverage" (R1/R2/R3/R4), with only R5's cross-framework *parity* comparison scoped to components with real counterparts across all three frameworks. Vue's `ripple` has no Angular/React counterpart requiring identical parity-scenario duplication (Angular's `ripple` and React's absence of one are already asymmetric — Angular's directive is genuinely framework-specific-shaped, not identical in API to Vue's), so this plan applies the spec's existing rule mechanically: **Vue's `ripple` directive receives full standalone R1/R2/R3/R4 coverage in this plan (Task 6), correctly excluded from R5 parity scenarios (no counterpart to compare), exactly as Angular's Fluid/Badge/Ripple/AutoFocus are already treated.** No new rule is invented; the existing rule is applied to a component the spec's table missed. React confirmed to have exactly the 8 components the spec lists — no similar gap found there. Angular confirmed to have exactly the 10 components + 2 directives the spec lists — no gap found there either.

This correction is noted here, in the plan's own coverage table (§2 below), and will be visible in the Implementation Plan's own review — it does not require re-opening Spec Review, since it applies an already-approved rule rather than deciding anything new.

---

## 1. Plan-Level Decisions (resolving OQ-1 through OQ-5, and the builder/version questions the spec deferred)

None of these reopen D1–D5. Each is independently verified against a real source, cited below.

### PD-1 — Resolves OQ-1: screenshot-diff threshold

**Decision:** Use Playwright's own built-in default for `toHaveScreenshot()` — `threshold: 0.2` (per-pixel YIQ color-difference tolerance) — do not override it. `maxDiffPixelRatio` is left unset (Playwright's own default: unset unless explicitly configured).

**Verification:** Confirmed directly against Playwright's official documentation (`playwright.dev/docs/api/class-locatorassertions`, `toHaveScreenshot` options section): "threshold... Defaults to 0.2" (an acceptable perceived color difference in YIQ color space, 0 = strict, 1 = lenient); "maxDiffPixelRatio... Unset by default." This is a real, verified answer, not a placeholder — OQ-1 is resolved, not deferred further. If Task 8's mutation test (a deliberately mutated story) proves this default too noisy or too strict against this repo's real Storybook renders, Task 8 may tune it — but the starting value is now a verified fact, not an invented one.

### PD-2 — Resolves OQ-2: Storybook builder per framework (implements D2's per-framework topology)

**Decision:** `@storybook/react-vite` for React, `@storybook/vue3-vite` for Vue, `@storybook/angular` for Angular (Angular has no Vite-vs-webpack fork — Storybook's Angular integration only ships one builder, using Angular's own CLI build pipeline under the hood). This choice is only possible/coherent because D2 already decided per-framework Storybook instances (one per package, not a single unified multi-framework instance) — a unified instance would have no single "the builder" to choose, since it would need to somehow reconcile three incompatible builder requirements at once. Tasks 1/2/3's three separate `.storybook/` configs are the direct implementation of D2's decision; this PD only resolves the narrower "which builder per instance" question D2 itself left to Specification/Implementation-Plan level.

**Verification:** `packages/react/package.json` and `packages/vue/package.json` both confirmed to already depend on Vite (`grep -l "vite" packages/react/package.json packages/vue/package.json` — both match) — using `@storybook/react-vite`/`@storybook/vue3-vite` matches this repo's existing build-tooling convention exactly, avoiding introducing a second bundler (webpack) alongside the Vite tooling already in use. `@storybook/react-webpack5` is explicitly not chosen for this reason.

### PD-3 — Resolves OQ-4 (partially) and PD-2's exact versions: dependency versions

All versions below independently verified via `npm view <package> version` against the live npm registry on the date this plan was authored (not assumed, not copied from any prior document):

| Package | Version | Verified peer-dependency compatibility |
|---|---|---|
| `storybook` | `10.6.0` | — |
| `@storybook/angular` | `10.6.0` | Peer range `@angular/core: >=18.0.0 < 23.0.0` — this repo's `@angular/core: ^21.2.22` (from `packages/ng/package.json`) is within range. |
| `@storybook/react-vite` | `10.6.0` | — |
| `@storybook/vue3-vite` | `10.6.0` | This repo's `vue: ^3.5.0` (from `packages/vue/package.json`) satisfies Storybook 10's Vue 3 requirement. |
| `@storybook/addon-a11y` | `10.6.0` | Same major as `storybook` core — required for R1.3's accessibility-metadata display panel. |
| `@playwright/test` | `1.63.0` | — |
| `@axe-core/playwright` | `4.13.0` | Depends on `axe-core: ~4.13.0` (bundled transitively, not a separate pin needed) and `playwright-core: >= 1.0.0` — compatible with the pinned `@playwright/test@1.63.0`. |

**Resolves OQ-4 for these seven packages.** Exact versions are pinned in the task implementations below (Tasks 1, 3, 4), following this repository's existing convention of pinning exact versions once chosen (the same pattern Track B used for `@vitest/coverage-v8`). `axe-core` itself is not separately pinned in `package.json` — it arrives transitively via `@axe-core/playwright`'s own dependency, and its version is recorded in `ACCESSIBILITY_BASELINE.md`'s header per D3's ruleset-precision requirement (Task 5).

### PD-4 — Resolves the axe-core "default ruleset" question precisely (supports OQ-5 and D3's ruleset-precision requirement)

**Decision:** Do not configure `runOnly`/`rules` options when invoking `@axe-core/playwright`'s scan — use the library's own unconfigured default, which is: **all rules except those tagged `experimental`** (axe-core's real, documented default operation, not a curated WCAG-tag subset).

**Verification:** Confirmed directly against axe-core's own official API documentation (`github.com/dequelabs/axe-core/blob/develop/doc/API.md`): "The default operation for `axe.run` is to run all rules except for rules with the `experimental` tag." This is more precise than "WCAG 2.0/2.1 A/AA tags," which the approved spec (D3, R4.2) correctly declined to assert without verification — this plan now has the real answer, confirming D3's caution was warranted (the actual default is broader/differently-shaped than a WCAG-tag list) and giving `ACCESSIBILITY_BASELINE.md`'s header (Task 5) exact, sourced wording to use instead of a guess.

### PD-5 — Resolves OQ-5: axe-core violation-report fingerprint fields and the envelope mechanism that supplies `componentStoryId` (revised; resolves Plan Review finding 3)

**Decision:** R4.6's fingerprint formula (`<axe rule ID>:<component-story identifier>:<CSS selector/target path>`) reads two fields directly from axe-core's own real, verified type definitions (extracted and read from the actual installed `axe-core@4.13.0` package's `axe.d.ts` during this amendment's research, not assumed): `Result.id` (`string`, the rule ID) and `NodeResult.target` (an `UnlabelledFrameSelector` — an array-like CSS-selector-path type; `target.join(" ")` produces a deterministic string). Both fields are confirmed present on every `Result`/`NodeResult` — `interface Result { id: string; nodes: NodeResult[]; ... }`, `interface NodeResult { target: UnlabelledFrameSelector; ... }`.

**The `componentStoryId` gap, resolved:** `AxeBuilder#analyze()` (the real `@axe-core/playwright` API, confirmed via its own documentation: `analyze(): Promise<axe.Results | Error>`) returns raw `axe.Results` with **no built-in field for story identity** — the caller must supply and track this externally, one `analyze()` call per story. This plan therefore defines an explicit **envelope**, not a raw-`axe.Results`-on-disk contract: each Task 6/7/8 Playwright spec, immediately after calling `analyze()` for one story, wraps the raw result before writing it to disk:

```json
{
  "componentStoryId": "ng-button--default",
  "framework": "ng",
  "browser": "chromium",
  "axeVersion": "4.13.0",
  "scannedAt": "<ISO-8601 timestamp>",
  "results": { /* raw axe.Results, unmodified */ }
}
```

`componentStoryId` is the Storybook story's own canonical ID (Storybook itself generates a deterministic ID per story from its title/export name — e.g. `ng-button--default` for Angular Button's default-state story — reusing Storybook's own real ID rather than inventing a second parallel naming scheme; Task 1/2/3's story authoring must therefore use Storybook's default title-based ID generation, not a custom `id` override, so this reused ID stays deterministic and traceable back to the exact story file). This envelope, not the bare `results` object, is what Task 6/7/8 write to disk (PD-12 governs the exact file path/location) and what `validate-accessibility-baseline.mjs` (Task 5) reads: the script's fingerprint function consumes `envelope.results.violations[].id` + `envelope.componentStoryId` + `envelope.results.violations[].nodes[].target`, exactly matching R4.6's three-part formula, with `componentStoryId` supplied by the envelope wrapper rather than by any field axe-core itself provides. This does not add a new requirement beyond R4.6 — it specifies the concrete mechanism (a one-line JSON envelope around the real tool's real output) that makes R4.6's already-approved formula computable, since R4.6 names three fields but the approved spec correctly left the concrete plumbing to Implementation Plan level (OQ-5's own framing).

Task 5's fingerprint function operates per-violation, per-node (a single rule violation can report multiple `nodes[]`, each a distinct DOM location needing its own fingerprint entry) against the envelope's `results.violations[]`, unchanged from the original plan's per-node iteration logic.

### PD-6 — `ACCESSIBILITY_BASELINE.md` concrete file format

**Decision:** `docs/architecture/ACCESSIBILITY_BASELINE.md`, Markdown table with columns `Fingerprint | Rule | Component/Story | Note`, header comment block recording the axe-core version, the "all rules except experimental" default-ruleset statement (PD-4), and the one-way-door contract prose — mirroring `SAST_BASELINE.md`'s exact structure (header comment + Markdown table), per R4.5's requirement to follow "the same house format."

### PD-11 — Baseline population semantics: no CLI "populate" mode, additive-only, human-reviewed (revised; resolves Plan Review finding 4)

**Original design flaw, corrected:** the pre-amendment plan proposed a `--populate-initial` CLI mode on `validate-accessibility-baseline.mjs`. This was found, on direct comparison against the real precedent script, to be a departure from `SAST_BASELINE.md`'s own established mechanism without flagging it as one: `validate-sast-baseline.mjs` (read in full during this amendment's research) has **no write/populate mode whatsoever** — it is purely a read-only validator (SARIF in, pass/fail out); `SAST_BASELINE.md` itself was populated by a human directly authoring the Markdown table once, informed by a real scan's output, not by any script-driven write path. A `--populate-initial` mode on the accessibility validator would be a genuinely new mechanism this plan invented without spec authorization, and — exactly as the finding identifies — creates a real CI-escape-hatch risk (any invocation of a mode that writes baseline entries is, definitionally, a path that can turn a failing check into a passing one without human review, which directly contradicts R4.9's review-controlled one-way-door contract).

**Corrected decision:** `validate-accessibility-baseline.mjs` has exactly **one mode: read-only validation.** It never writes to `ACCESSIBILITY_BASELINE.md` under any flag, environment variable, or invocation shape. Baseline population and updates are **always** a human-authored `git` change to the Markdown file directly (identical to `SAST_BASELINE.md`'s own precedent) — never a script-driven write, at initial rollout or afterward. To make this practical (a human should not have to hand-compute fingerprints from raw axe JSON), the script adds a second, clearly-named **reporting** command — `--report <envelope-path>` — which reads one or more accessibility-report envelopes (PD-12) and **prints** (to stdout, never writes to disk) each violation's already-not-baselined fingerprint in a copy-pasteable Markdown-table-row format, for a human to review and manually add to `ACCESSIBILITY_BASELINE.md` in the same reviewed PR. This is a read-only reporting aid, not a write path — it cannot itself change CI's pass/fail outcome, satisfying the finding's "must not be usable as a CI escape hatch" requirement by construction (no code path exists that both writes the baseline and is reachable from CI).

**Exact behavior matrix (all four cases the finding required):**
- **Existing fingerprint** (already in `ACCESSIBILITY_BASELINE.md`): `--report` does not print it (already grandfathered, nothing new to review); the separate `--check` (validation) mode continues to pass for it, per R4.7/R4.8, unchanged from the original plan.
- **New fingerprint** (not in the baseline): `--check` mode fails CI for it (R4.8, unchanged). `--report` mode prints it as a candidate row for human review/addition — printing is purely informational and has no side effect on the file or on `--check`'s exit code.
- **Malformed baseline file:** both `--check` and `--report` fail closed (non-zero exit, clear error message) — mirrors `validate-sast-baseline.mjs`'s own `fail()` behavior on unparseable input, confirmed identical in this amendment's re-read of the precedent script.
- **Missing baseline file:** same fail-closed behavior for both modes, per R4.11 (unchanged from the original plan — already correctly specified).

**Additive-only guarantee:** since no code path writes the file, "additive only" and "never silently deletes/replaces/overwrites" are true by construction, not by a runtime check that could have a bug — there is no writer to have a bug in. A human manually editing the Markdown file to remove a row (the one legitimate removal path, per R4.9: "an existing entry is never removed by anything other than fixing the underlying violation... confirmed by the fingerprint disappearing from a subsequent real scan") remains exactly as before, unaffected by this amendment — R4.7–R4.11's approved one-way-door/review-control semantics are fully preserved, not altered in any way; only the mechanism for *discovering* what a human should add (the new read-only `--report` command, replacing the removed write-capable `--populate-initial` mode) has changed.

**Task 5 and Task 6/7/8 updated accordingly:** Task 5 implements `--check <envelope-or-baseline-context>` and `--report <envelope-path>` as the script's only two modes (both read-only). Task 6/7/8 no longer "populate the baseline" as part of running Playwright specs — instead, after Task 6/7/8's first real scan produces real envelope files, the task's own human implementer runs `--report` against them, reviews the printed candidate rows, and manually commits the resulting `ACCESSIBILITY_BASELINE.md` additions in the same PR as that framework's new spec files (the whole diff — new specs, new envelopes' worth of discovered findings, new baseline rows — is one reviewed PR, exactly matching R4.9's "reviewable PR change" contract).

### PD-12 — Accessibility report/evidence contract: exact locations, naming, ownership, and consumption (resolves Plan Review finding 5)

**Decision:** Every accessibility scan (Task 6/7/8, and later CI runs) writes its envelope (PD-5's JSON shape) to a deterministic path:

```
test-results/accessibility/<framework>/<browser>/<componentStoryId>.json
```

e.g. `test-results/accessibility/ng/chromium/ng-button--default.json`. This directory is:
- **Not committed to the repository** (added to `.gitignore`, matching this repo's existing convention of not committing ephemeral `coverage/`/`test-results/`-shaped output — confirmed by checking the existing `.gitignore` for a `coverage/` entry during Task 7's original SDD work, same pattern applies here).
- **Per-story, per-browser, per-framework — no aggregation into one combined file.** Each scan writes exactly one envelope file; nothing merges multiple stories' results into a single blob. This gives natural per-framework, per-browser ownership (D4's "independent evidence per framework" requirement, extended one level finer to per-browser, since a Chromium-only accessibility quirk should be individually diagnosable without wading through Firefox/WebKit's results in the same file).
- **Locally:** Task 6/7/8's Playwright specs write here as a side effect of running; a developer inspects `test-results/accessibility/<framework>/` directly, or runs Task 5's `--report` command pointed at the directory (globbing all envelopes under it) to see which findings are new.
- **In CI:** the same `test-results/accessibility/` directory is what gets uploaded as a build artifact (via `actions/upload-artifact@v4`, matching this repo's already-real GitHub Actions dependency conventions — no new action type introduced), named `accessibility-reports-${{ matrix.framework }}` — one artifact bundle per framework matrix entry (not per browser, since a framework's 3 browser sub-results already live in that one directory tree, satisfying R8's "evidence artifact" requirement without needing 9 separate artifact uploads).
- **How Task 5 consumes it:** `validate-accessibility-baseline.mjs --check` is invoked once per framework's CI matrix entry, pointed at that framework's `test-results/accessibility/<framework>/**/*.json` glob — it reads every envelope under that path, computes fingerprints for every violation across every story/browser, and checks each against `ACCESSIBILITY_BASELINE.md` (R4.8's set-membership check, applied across the full multi-file envelope set rather than one file, an extension of the original single-file assumption to the real multi-envelope-per-framework shape this amendment establishes).

**R8 evidence-satisfiability, confirmed deterministic:** R8.2 requires "axe's own violation report (rule ID, affected element, WCAG reference) surfaced in CI output/artifact." The envelope's `results` field is the raw, unmodified `axe.Results` object — every field R8.2 names (rule ID via `results.violations[].id`, affected element via `results.violations[].nodes[].target`/`.html`, and axe's own `helpUrl`/`tags` fields, which include WCAG references) is present verbatim in the uploaded artifact, satisfying R8.2 by construction rather than requiring `validate-accessibility-baseline.mjs` to reformat or re-derive anything for evidence purposes — the script's `--check`/`--report` output is a human-readable *summary* on top of this, not the sole evidence source.

### PD-7 — CI YAML structure (implements D4's contract)

**Decision:** New job `track-a-browser-visual-a11y` in `.github/workflows/ci.yml`, separate from the existing `ci:` job, using `strategy.matrix.framework: [ng, react, vue]` with `fail-fast: false` (implements D4's explicit "no fail-fast" requirement). **Explicit browser-coverage contract (resolves Plan Review finding 10):** each of the 3 matrix entries (one per framework) runs Playwright with **all three D5 browser projects** (Chromium, Firefox, WebKit) inside that single matrix entry — i.e. `npx playwright test --project=${{ matrix.framework }}-chromium --project=${{ matrix.framework }}-firefox --project=${{ matrix.framework }}-webkit`, using PD-9's exact 9 named projects (e.g. for the `ng` matrix entry: `--project=ng-chromium --project=ng-firefox --project=ng-webkit`). This is the full, explicit execution contract: **3 framework matrix entries × 3 browser projects each = 9 total (framework, browser) combinations actually executed**, not 3 or 9 separate GitHub Actions matrix entries — the browser dimension is handled *inside* each framework's Playwright invocation (via PD-9's project structure below), not as a second GitHub Actions matrix axis. This keeps D4's "one job definition, matrix over frameworks only" decision intact (GitHub Actions matrix stays 1-dimensional, framework-only) while still guaranteeing D5's full 3-browser coverage per framework, and keeps per-framework artifact/evidence attribution (D4's requirement) as one coherent bundle per framework rather than fragmenting it across a second matrix axis. Each matrix entry: checkout → setup pnpm/Node → install deps → build Storybook for that framework → serve it (PD-13 governs exact serving/readiness/lifecycle) → run Playwright across all 3 browser projects (interaction + visual + axe, via PD-9's project structure) against it → upload artifacts (diff images, axe reports, Playwright traces) labeled by `${{ matrix.framework }}` (per-browser sub-labeling within that bundle, per PD-12). Runs on every PR (R6.2), per Track B's own trigger pattern (`on: push/pull_request` to `main`, no path filter at the workflow-trigger level — matches R6.2's "unconditional" decision).

### PD-8 — OQ-3: affected-path scoping

**Decision:** Not implemented in this initial rollout. Per the approved spec's own OQ-3 framing (a runtime-optimization deferral, not a contract-level requirement), and because Track A's very first implementation has no historical CI-cost data yet to justify the added complexity of reusing Track B's `affected-packages.mjs` pattern inside the new job. Task 10 records this as a documented, deliberate deferral (not a silent omission) — a future optimization pass may add matrix-entry-level path scoping once real CI runtime data exists, without changing R6.2's "runs on every PR" contract (the job still runs; only which matrix entries do meaningful work would narrow).

### PD-9 — Deterministic Playwright project/testDir structure across three package-local `e2e/` directories (resolves Plan Review finding 1)

**Decision:** `playwright.config.ts` (root) defines **9 explicit named projects** — one per (framework, browser) pair — rather than one shared `testDir` plus browser-only projects. Each project sets its own `testDir` pointing directly at that framework's own `e2e/` directory, eliminating any ambiguity about one root `testDir` somehow covering three separate package-local directories:

```
projects: [
  { name: "ng-chromium",    testDir: "./packages/ng/e2e",    use: { ...devices["Desktop Chrome"] } },
  { name: "ng-firefox",     testDir: "./packages/ng/e2e",    use: { ...devices["Desktop Firefox"] } },
  { name: "ng-webkit",      testDir: "./packages/ng/e2e",    use: { ...devices["Desktop Safari"] } },
  { name: "react-chromium", testDir: "./packages/react/e2e", use: { ...devices["Desktop Chrome"] } },
  { name: "react-firefox",  testDir: "./packages/react/e2e", use: { ...devices["Desktop Firefox"] } },
  { name: "react-webkit",   testDir: "./packages/react/e2e", use: { ...devices["Desktop Safari"] } },
  { name: "vue-chromium",   testDir: "./packages/vue/e2e",   use: { ...devices["Desktop Chrome"] } },
  { name: "vue-firefox",    testDir: "./packages/vue/e2e",   use: { ...devices["Desktop Firefox"] } },
  { name: "vue-webkit",     testDir: "./packages/vue/e2e",   use: { ...devices["Desktop Safari"] } },
]
```

No top-level `testDir` is set (each project's own `testDir` takes precedence, per Playwright's documented project-level override — confirmed directly against Playwright's own `TestConfig`/`TestProject` API docs during this amendment's research: "Project-specific options should be put to `testConfig.projects`... top-level `TestConfig` can also define base options shared between all projects," and each project's `testDir` genuinely overrides/scopes independently). `testMatch` is left at Playwright's own default (`**/*.@(spec|test).?(c|m)[jt]s?(x)`, confirmed via the same API docs) — no custom glob is needed once each project's `testDir` is already scoped to exactly one framework's directory.

**Effective 3-framework × 3-browser execution contract, made explicit:** running `npx playwright test` with no filter executes all 9 projects (every framework against every D5 browser engine — full coverage, matching D5's "Chromium, Firefox, WebKit" requirement per framework, not a subset). Running `npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit` (or an equivalent `--grep`/project-name-prefix filter) executes only Angular's 3 browser variants — this is the exact invocation PD-7/Task 10's CI matrix entries use, one framework's 3 projects per GitHub Actions matrix entry. Locally, a developer working on one framework can run just that framework's 3 projects without the other two frameworks' suites executing.

### PD-13 — Storybook serving in CI: deterministic port/readiness/lifecycle contract (resolves Plan Review finding 7)

**Decision:** Each framework's Storybook instance is served on a **framework-specific fixed port**, eliminating any collision risk given each GitHub Actions matrix entry runs in its own isolated runner (no actual concurrent-port collision is possible across matrix entries, since each gets a fresh VM) — but a fixed, framework-specific port per framework (`ng`: 6001, `react`: 6002, `vue`: 6003) is still specified explicitly, both for local-development consistency (a developer running two frameworks' Storybook instances side-by-side locally, e.g. during Task 9's parity-comparison work, needs them on different ports simultaneously) and so `playwright.config.ts`'s `webServer` option (see below) has an unambiguous, non-conflicting `url` to poll per framework.

**Mechanism:** Playwright's own built-in `webServer` config option (one entry per framework, keyed to that framework's fixed port) — not a hand-rolled `wait-on`/background-process script. Each framework's CI step (and each developer's local Task 6/7/8 workflow) invokes `npx playwright test --project=<framework>-*` with `playwright.config.ts`'s `webServer` array already declaring:
```
webServer: [
  { command: "pnpm --filter @ultimate/ng exec storybook dev -p 6001", url: "http://localhost:6001", reuseExistingServer: !process.env.CI, timeout: 120_000 },
  { command: "pnpm --filter @ultimate/react exec storybook dev -p 6002", url: "http://localhost:6002", reuseExistingServer: !process.env.CI, timeout: 120_000 },
  { command: "pnpm --filter @ultimate/vue exec storybook dev -p 6003", url: "http://localhost:6003", reuseExistingServer: !process.env.CI, timeout: 120_000 },
]
```
Playwright's `webServer` mechanism is a real, documented, built-in feature (not invented here) that starts each configured command, polls its `url` until ready (readiness = the URL responds, per Playwright's own implementation), and automatically tears the process down when the test run completes — this is the "readiness/process-lifecycle behavior" the finding required, sourced from an existing Playwright primitive rather than a bespoke script. `reuseExistingServer: !process.env.CI` matches Playwright's own documented convention: in CI, always start fresh (never reuse a stray leftover process); locally, reuse an already-running dev server if a developer left one up, for faster iteration.

**Startup failure behavior:** if a `webServer` command fails to become ready within its `timeout` (120s, chosen as generously larger than Storybook's typical cold-start time for this repo's component-count scale, subject to Task 10's own empirical tuning if 120s proves insufficient against real CI runner performance), Playwright's own `webServer` mechanism fails the entire test run for that project with a clear "web server failed to start" error — this is Playwright's real, built-in failure mode, not a new one this plan invents. **Cleanup:** Playwright's own `webServer` teardown runs automatically on process exit (success, failure, or interruption) — no separate cleanup step is added to the CI job, since Playwright already owns this lifecycle.

Each GitHub Actions matrix entry only starts and serves the one framework's Storybook instance corresponding to its own `matrix.framework` value (i.e. the `ng` matrix entry's CI step only runs the `ng` `webServer` entry, not all three) — configured via `playwright.config.ts`'s `webServer` array being filtered/selected per invocation using the same `--project=<framework>-*` scoping PD-9 already establishes, so CI never attempts to start React's or Vue's dev server inside Angular's matrix entry.

---

## 2. Amended Coverage Table (Task-Planning Reference)

Restated from the approved spec's §5, with the Pre-Implementation Finding (§0 above) applied:

| Framework | Full component/directive set (standalone R1/R2/R3/R4 coverage) | Shared-8 parity set (R5 only) |
|---|---|---|
| `ng` | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip, Fluid, Badge, Ripple, AutoFocus (12 items) | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip (8) |
| `react` | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip (8 items) | Same 8 |
| `vue` | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip, Ripple (9 items — corrected per §0) | Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip (8) |

---

## 3. Task List

| Task | Objective | Depends on |
|---|---|---|
| 1 | Storybook foundation: Angular instance | None |
| 2 | Storybook foundation: React instance | None (parallel-safe with 1, 3) |
| 3 | Storybook foundation: Vue instance | None (parallel-safe with 1, 2) |
| 4 | Playwright installation and base configuration | None (parallel-safe with 1–3) |
| 5 | Accessibility baseline infrastructure (`ACCESSIBILITY_BASELINE.md` + fingerprint/check script) | None (parallel-safe with 1–4; needs no Storybook instance to exist yet — it's pure tooling) |
| 6 | Angular: Playwright interaction + visual regression + axe scans for all 12 items | 1, 4, 5 |
| 7 | React: Playwright interaction + visual regression + axe scans for 8 items | 2, 4, 5 |
| 8 | Vue: Playwright interaction + visual regression + axe scans for 9 items | 3, 4, 5 |
| 9 | Cross-framework parity scenarios (shared 8-component set, R5) | 6, 7, 8 |
| 10 | CI wiring (D4's matrix/parallel contract) | 6, 7, 8, 9 |
| 11a | Local mutation/failure-proof verification (enforcement logic correctness) | 6, 7, 8 |
| 11b | CI-path mutation/failure-proof verification (CI environment correctness) | 10, 11a |
| 12 | Whole-track verification | 1–9, 10, 11a, 11b |

Tasks 1–3 (per-framework Storybook) and Task 4 (Playwright install) and Task 5 (baseline infra) have no cross-dependency and may run in parallel — this mirrors the approved spec's own §8 sequencing note ("R1 must land before R2/R3/R4 can target it" — true per-framework, but the three frameworks' R1 work is mutually independent). Tasks 6/7/8 (per-framework enforcement) depend on that framework's own R1 instance plus the shared R2 config and R4 baseline infra, but are mutually independent of each other. Task 9 needs all three frameworks' interaction suites to exist before parity comparison is meaningful. Task 10 (CI) is deliberately sequenced after local checks are proven working (Tasks 6–9), not before. **Task 11 is split (resolves Plan Review finding 6): Task 11a proves the enforcement logic itself is correct, locally, and does not depend on Task 10 (it only needs Tasks 6/7/8's real suites to mutate against); Task 11b proves the same mechanisms fail correctly through the real CI path Task 10 wired, and genuinely depends on Task 10 existing first.** Both complete before Task 12's final whole-track sign-off.

---

## Task 1 — Storybook: Angular instance

**Objective:** Satisfy R1 (and R7's documentation contract — the story authoring in step 3/4 below is what makes Storybook satisfy Blueprint §27's combined API/behavior/accessibility/theming/examples/framework-notes documentation requirement, not a separate deliverable) for `@ultimate/ng`: a working Storybook instance rendering all 12 items in the amended coverage table (§2), against the Aura preset, with story-level accessibility metadata display.

**Files/directories to change:**
- `packages/ng/package.json` — add `storybook`, `@storybook/angular`, `@storybook/addon-a11y` as devDependencies (exact versions per PD-3).
- `packages/ng/.storybook/main.ts`, `packages/ng/.storybook/preview.ts` — new Storybook config.
- `packages/ng/src/*/*.stories.ts` — one story file per component/directive (12 files).
- Root `package.json` — add a `storybook:ng` (or `--filter @ultimate/ng storybook`) convenience script, matching this repo's existing per-package script-naming convention (e.g. `test:scripts`, `boundary:validate:ai`).
- `pnpm-lock.yaml` — updated by the dependency install.

**Prerequisite:** None.

**Implementation steps:**
1. Add the three devDependencies at the exact versions from PD-3.
2. Scaffold `.storybook/main.ts` targeting `packages/ng/src/**/*.stories.ts`, configured for the Aura preset (import the same theme-token setup `packages/themes/src/presets/aura/` already provides — do not duplicate token values, import them).
3. Author 12 story files (one per R1.2's required content: default state, key prop variations sourced from each component's own existing `*.spec.ts` test file — read the real test file's existing state-coverage rather than inventing new variants — plus at least one interactive state where applicable, e.g. Dialog open).
4. Enable `@storybook/addon-a11y` in `.storybook/main.ts`'s addons list (satisfies R1.3's accessibility-metadata *display* requirement — distinct from R4's automated *scanning*, per the spec's own R1.3 note). For the 4 items with no `component-metadata` record (Fluid, Badge, Ripple, AutoFocus — confirmed via `packages/component-metadata/src/records/` only covering the shared 8), the story's own JSDoc/prose is the accessibility-info source instead — document this fallback in the story file's own header comment, not invented metadata.
5. Verify locally: `pnpm --filter @ultimate/ng exec storybook build` succeeds with zero errors, output directory contains all 12 stories.

**Acceptance criteria traceability:** AC-R1 (per framework).

**Verification (resolves Plan Review finding 8 — deterministic against known IDs, not generic HTML-file counting):**
- `pnpm --filter @ultimate/ng exec storybook build` exits 0.
- Storybook's own build output includes `index.json` (a real, documented Storybook build artifact listing every story's `id`/`title`/`name` — confirmed as Storybook's standard build manifest, not invented here) at `packages/ng/storybook-static/index.json`. Verification reads this file and asserts, by exact ID match, that all 12 expected story IDs are present: `ng-button--default`, `ng-checkbox--default`, `ng-dialog--default`, `ng-menu--default`, `ng-paginator--default`, `ng-scroller--default`, `ng-table--default`, `ng-tooltip--default`, `ng-fluid--default`, `ng-badge--default`, `ng-ripple--default`, `ng-autofocus--default` (exact ID strings depend on each story file's actual title; the check asserts against the real IDs Task 1's own authored stories declare, cross-referenced against §2's 12-item list — not a hand-counted HTML-file total, which could pass with 12 unrelated files or fail with 12 correct ones split across extra states). A generic `find ... -iname "*.html"` count is explicitly NOT used, since it cannot distinguish "12 files, correct 12 components" from "12 files, 6 components with 2 states each."
- `git diff --stat` confined to the files listed above.

---

## Task 2 — Storybook: React instance

**Objective:** Satisfy R1 and R7 (per Task 1's note) for `@ultimate/react`: identical to Task 1's structure, for React's 8 components.

**Files/directories to change:**
- `packages/react/package.json` — `storybook`, `@storybook/react-vite`, `@storybook/addon-a11y` (PD-3 versions).
- `packages/react/.storybook/main.ts`, `packages/react/.storybook/preview.tsx`.
- `packages/react/src/*/*.stories.tsx` (8 files).
- Root `package.json` — `storybook:react` convenience script.
- `pnpm-lock.yaml`.

**Prerequisite:** None.

**Implementation steps:** Same structure as Task 1, scoped to React's 8 components (all of which have real `component-metadata` records — no fallback-documentation case needed here, unlike Task 1's 4 metadata-less items).

**Acceptance criteria traceability:** AC-R1.

**Verification (same `index.json`-based exact-ID pattern as Task 1, resolves Plan Review finding 8):** `packages/react/storybook-static/index.json` asserted to contain exactly React's 8 expected story IDs (`react-button--default` through `react-tooltip--default`, per §2's 8-item React list) — no generic HTML-file count used.

---

## Task 3 — Storybook: Vue instance

**Objective:** Satisfy R1 and R7 (per Task 1's note) for `@ultimate/vue`: identical structure, for Vue's 9 items (8 components + `ripple`, per §0's correction).

**Files/directories to change:**
- `packages/vue/package.json` — `storybook`, `@storybook/vue3-vite`, `@storybook/addon-a11y` (PD-3 versions).
- `packages/vue/.storybook/main.ts`, `packages/vue/.storybook/preview.ts`.
- `packages/vue/src/*/*.stories.ts` (9 files — 8 components + `ripple`).
- Root `package.json` — `storybook:vue` convenience script.
- `pnpm-lock.yaml`.

**Prerequisite:** None.

**Implementation steps:** Same structure as Task 1/2, scoped to Vue's 9 items. `ripple`'s story (a directive, not a component) uses the same fallback-documentation pattern as Task 1's 4 metadata-less Angular items (no `component-metadata` record exists for it) — a minimal demonstrative story showing the directive applied to a sample element, sufficient for R1.1's "render every component/directive" requirement without inventing a component that doesn't exist.

**Acceptance criteria traceability:** AC-R1.

**Verification (same `index.json`-based exact-ID pattern, resolves Plan Review finding 8):** `packages/vue/storybook-static/index.json` asserted to contain exactly Vue's 9 expected story IDs — the shared 8 (`vue-button--default` through `vue-tooltip--default`) plus `vue-ripple--default`, confirming §0's correction is actually reflected in the built output, not just in this plan's prose.

---

## Task 4 — Playwright installation and base configuration

**Objective:** Satisfy R2.1/R2.2/D5: install Playwright once at the repo root (shared across all three frameworks' test suites, since it's a framework-agnostic browser-driving tool), configured for the three default engines.

**Files/directories to change:**
- Root `package.json` — `@playwright/test` devDependency (PD-3 version).
- Root `playwright.config.ts` — new file, defining **9 explicit named projects** per PD-9 (3 frameworks × 3 browsers, each with its own `testDir` pointed directly at that framework's own `e2e/` directory), plus PD-13's `webServer` array — not a generic "three projects, one shared testDir" shape.
- Root `package.json` — a `playwright:install-browsers` script wrapping `playwright install --with-deps` (or equivalent), since Playwright's browser binaries are a separate download from the npm package itself.
- `pnpm-lock.yaml`.

**Prerequisite:** None.

**Implementation steps:**
1. Add `@playwright/test@1.63.0` (PD-3) as a root devDependency — shared by all three frameworks' Task 6/7/8 test files, avoiding three separate installs of the same tool.
2. Configure `playwright.config.ts` with the exact 9-project structure PD-9 specifies verbatim (no top-level `testDir` — each project's own `testDir` scopes it to exactly one framework's `e2e/` directory, eliminating the original draft's ambiguity about one root `testDir` somehow covering three separate package-local directories). Add PD-13's `webServer` array in the same config file.
3. `testMatch` is left at Playwright's own verified default (`**/*.@(spec|test).?(c|m)[jt]s?(x)`) — no custom glob needed, since each project's `testDir` already scopes it correctly (per PD-9).
4. Do not set a global `expect.toHaveScreenshot` threshold override in this config — PD-1 uses Playwright's own default (0.2), so no explicit `threshold` key is needed in `playwright.config.ts`'s `expect` block unless Task 11's mutation testing proves the default needs tuning.

**Acceptance criteria traceability:** AC-R2 (installation half).

**Verification (resolves Plan Review finding 2 — the original `--list`-exits-0 assumption was empirically checked during this amendment's research and found FALSE):**
- `npx playwright --version` reports `1.63.0`.
- **Corrected:** `npx playwright test --list` with zero spec files present does **not** exit 0 — empirically confirmed during this amendment's own research (`npx playwright test --list` against a config with an empty `testDir` prints `Error: No tests found` and exits **1**). The original plan's Task 4 verification step was factually wrong and is removed.
- **Replacement, deterministic and not dependent on any spec file existing yet:** run `pnpm run typecheck` (this repo's existing typecheck script, already covers every `.ts` file including `playwright.config.ts`) and confirm it passes — proves the config file is syntactically valid, importable TypeScript with the correct exported shape, without depending on Task 6/7/8's spec files existing. Additionally, `node -e "await import('./playwright.config.ts')"` (or the repo's existing ts-node-equivalent execution path) confirms the config module loads and exports a `defineConfig(...)` result without throwing — a real, deterministic "the config itself is valid" check that doesn't depend on `--list`'s spec-file-dependent behavior at all. Task 4 does **not** assert anything about test *discovery* — that assertion correctly belongs in Task 6/7/8's own verification, once real spec files exist for `--list` (or a real `test` run) to meaningfully report on.

---

## Task 5 — Accessibility baseline infrastructure

**Objective:** Satisfy R4.5–R4.11: create `docs/architecture/ACCESSIBILITY_BASELINE.md` (empty scaffold, per PD-6's format) and the check script that implements the fingerprint/grandfathering/fail-closed contract.

**Files/directories to change:**
- `docs/architecture/ACCESSIBILITY_BASELINE.md` — new, initially empty table (header comment only, no rows yet — Tasks 6–8's first real scans populate it).
- `scripts/provenance/validate-accessibility-baseline.mjs` — new script, mirroring `scripts/provenance/validate-sast-baseline.mjs`'s structure (pure-function core + thin CLI wrapper, per this repo's established convention).
- `scripts/provenance/validate-accessibility-baseline.test.mjs` — new test file.
- Root `package.json` — `accessibility:validate` script.

**Prerequisite:** None (pure tooling, no dependency on any Storybook instance existing yet — it operates on a hypothetical axe JSON report as input, testable with synthetic fixtures before Task 6's real scans exist).

**Implementation steps (revised per PD-11/PD-12 — resolves Plan Review findings 3, 4, 5):**
1. Read `scripts/provenance/validate-sast-baseline.mjs` in full as the structural template (fingerprint lookup, fail-closed on missing/malformed baseline, exit codes, and — critically — its real read-only-only mode structure, since the original plan's `--populate-initial` mode was found during this amendment to have no precedent in this template at all).
2. Implement `computeFingerprint(componentStoryId, violation, node)` per PD-5's revised envelope-aware formula: `${violation.id}:${componentStoryId}:${node.target.join(" ")}` — `componentStoryId` is read from the envelope wrapper (PD-5), never from the raw `axe.Results` object itself (which has no such field).
3. Implement `readEnvelopes(globPattern)` — reads every `test-results/accessibility/<framework>/**/*.json` envelope file (PD-12's real path convention) matching the given glob, parsing each as `{ componentStoryId, framework, browser, axeVersion, scannedAt, results }` and computing a fingerprint per violation per node across the full set.
4. Implement `loadBaseline(path)` — fails closed (non-zero exit) if the file doesn't exist or doesn't parse, per R4.11, mirroring `validate-sast-baseline.mjs`'s own `loadBaseline`/`fail()` pattern exactly (confirmed identical shape during this plan's own research).
5. Implement `findNewViolations(envelopeFingerprints, baseline)` — set-membership check per R4.8, returning any fingerprint not in the baseline, across all envelopes in the glob.
6. Implement **exactly two CLI modes, both read-only** (PD-11 — no write/populate mode exists):
   - `--check <glob>`: fails (non-zero exit) if any envelope's violation fingerprint is not in the baseline; exits 0 if every violation is already baselined.
   - `--report <glob>`: prints (stdout only, never writes to any file) each not-yet-baselined fingerprint as a copy-pasteable Markdown table row, for a human to review and manually add to `ACCESSIBILITY_BASELINE.md` in the same PR.
7. Write `docs/architecture/ACCESSIBILITY_BASELINE.md`'s initial scaffold per PD-6: header comment recording axe-core's version (from PD-3's resolved `@axe-core/playwright@4.13.0` → `axe-core ~4.13.0`) and PD-4's real, verified "all rules except experimental" default statement, empty table (no rows — Task 6/7/8's human implementer adds real rows manually, informed by `--report`'s output, per PD-11 — this task never writes rows itself, by construction).
8. Unit-test the script against synthetic envelope fixtures (an envelope with zero violations, an envelope with a violation not in any baseline, an envelope with a violation whose fingerprint IS in a test baseline, and — new per this amendment — a multi-envelope glob spanning more than one file, confirming `readEnvelopes` correctly aggregates across files, not just within one) — proving R4.7/R4.8/R4.11's logic before any real component exists to scan. Also test that `--report` never writes to disk (confirm the baseline file's mtime/content is unchanged after a `--report` invocation) — a direct, mechanical proof of PD-11's "cannot be a CI escape hatch" property.

**Acceptance criteria traceability:** AC-R4b (the mechanism half — Task 11 later proves it against a real mutation).

**Verification:**
- `node --test scripts/provenance/validate-accessibility-baseline.test.mjs` passes.
- Manually invoke `--check` against a synthetic "missing baseline file" scenario — confirms non-zero exit (R4.11).
- Manually invoke `--check` against a synthetic malformed baseline file — confirms non-zero exit (R4.11).
- Manually invoke `--report` against a synthetic envelope set, confirm output is printed to stdout and `ACCESSIBILITY_BASELINE.md`'s file content is byte-identical before and after the invocation (proves no write path exists).

---

## Task 6 — Angular: interaction + visual + accessibility enforcement

**Objective:** Satisfy R2/R3/R4 for all 12 Angular items (§2's amended coverage table).

**Files/directories to change:**
- `packages/ng/e2e/*.spec.ts` — 12 Playwright spec files (one per component/directive), each containing: interaction assertions (R2.3), a `toHaveScreenshot()` call (R3), and an `@axe-core/playwright` scan call (R4.1) that writes its envelope to `test-results/accessibility/ng/<browser>/<componentStoryId>.json` per PD-12.
- `packages/ng/package.json` — `@axe-core/playwright` devDependency (PD-3 version).
- `packages/ng/e2e/__screenshots__/` — visual baseline images, generated (not hand-authored) by the first real `--update-snapshots` run.
- `docs/architecture/ACCESSIBILITY_BASELINE.md` — Angular's real first-scan findings (if any) added as **human-authored rows in this PR**, per PD-11 (never script-written).

**Prerequisite:** Task 1 (Storybook instance to target), Task 4 (Playwright config), Task 5 (baseline script to run against).

**Implementation steps (revised per PD-9/PD-5/PD-11/PD-12):**
1. For each of the 12 items, write a Playwright spec (using PD-9's `ng-chromium`/`ng-firefox`/`ng-webkit` projects) that: navigates to that item's Storybook story URL (PD-13's `webServer`-managed dev server, per R2.1), performs the interaction assertions R2.3 requires (keyboard nav/focus order, computed ARIA role/state, real focus-visible/overlay-positioning behavior where applicable — e.g. Dialog's real viewport-relative centering), calls `expect(page).toHaveScreenshot()` (R3), and runs an `@axe-core/playwright` `AxeBuilder(...).analyze()` scan (R4.1) against the rendered story, wrapping the raw result in PD-5's envelope shape (`componentStoryId` + `framework: "ng"` + `browser` + `axeVersion` + `scannedAt` + `results`) and writing it to `test-results/accessibility/ng/<browser>/<componentStoryId>.json`.
2. Confirm no assertion duplicates an existing Vitest/`TestBed` test (R2.4) — cross-check against each component's existing `*.spec.ts` in `packages/ng/src/*/`.
3. Generate initial screenshot baselines: `npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit --update-snapshots` (first-ever run — this is the legitimate baseline-creation path, not a "silently overwritten by a passing run" case per R3.3, since no baseline existed before).
4. Run the axe scans for real (the same `--project=ng-*` invocation above, since each spec runs both its interaction/visual/axe logic in one pass), producing real envelope files under `test-results/accessibility/ng/`.
5. Run `node scripts/provenance/validate-accessibility-baseline.mjs --report "test-results/accessibility/ng/**/*.json"` (Task 5's read-only reporting mode, per PD-11) — review its printed candidate rows.
6. **Manually** add any genuinely-new findings to `docs/architecture/ACCESSIBILITY_BASELINE.md` as reviewed rows in this same PR (per PD-11 — no script performs this write). Do not fabricate or assume any violations exist — if Angular's real scan is clean, `--report` prints nothing and no rows are added for Angular; the baseline file only grows to reflect real, human-reviewed findings.

**Acceptance criteria traceability:** AC-R2, AC-R3, AC-R4, AC-R4b (for Angular's 12 items).

**Verification:**
- `npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit` passes for all 12 specs across all 3 engines (PD-9's explicit project names, not a generic `--project=chromium` filter that would also match React/Vue's projects).
- `node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/ng/**/*.json"` (Task 5's script) exits 0 against Angular's newly-authored baseline rows (proves R4.8's "no un-baselined violation" check passes on the state Task 6 itself just created).
- Cross-check: `grep -c "^| " docs/architecture/ACCESSIBILITY_BASELINE.md` shows a real, non-fabricated row count (0 if Angular's components are genuinely clean, N if N real violations were found and manually added — not asserted here, discovered empirically).

---

## Task 7 — React: interaction + visual + accessibility enforcement

**Objective:** Satisfy R2/R3/R4 for React's 8 components.

**Files/directories to change:** Same structural pattern as Task 6, scoped to `packages/react/e2e/*.spec.tsx` (8 files), `packages/react/package.json`'s `@axe-core/playwright` devDependency, `packages/react/e2e/__screenshots__/`, and React's contribution to `ACCESSIBILITY_BASELINE.md`.

**Prerequisite:** Task 2, Task 4, Task 5.

**Implementation steps:** Identical structure to Task 6 (including PD-9's `react-chromium`/`react-firefox`/`react-webkit` project names, PD-5's envelope shape written to `test-results/accessibility/react/<browser>/<componentStoryId>.json`, and PD-11's read-only `--report`-then-human-authored-PR baseline flow), scoped to React's 8 components. Interaction assertions cross-checked against React's existing `@testing-library/react` tests (R2.4) to avoid duplication.

**Acceptance criteria traceability:** AC-R2, AC-R3, AC-R4, AC-R4b (for React's 8 components).

**Verification:** Same pattern as Task 6 (explicit `--project=react-chromium --project=react-firefox --project=react-webkit`, `--check "test-results/accessibility/react/**/*.json"`), scoped to `packages/react/e2e/`.

---

## Task 8 — Vue: interaction + visual + accessibility enforcement

**Objective:** Satisfy R2/R3/R4 for Vue's 9 items (§2's amended coverage table, including `ripple`).

**Files/directories to change:** Same structural pattern, scoped to `packages/vue/e2e/*.spec.ts` (9 files), `packages/vue/package.json`'s `@axe-core/playwright` devDependency, `packages/vue/e2e/__screenshots__/`, and Vue's contribution to `ACCESSIBILITY_BASELINE.md`.

**Prerequisite:** Task 3, Task 4, Task 5.

**Implementation steps:** Identical structure to Tasks 6/7 (including PD-9's `vue-chromium`/`vue-firefox`/`vue-webkit` project names, PD-5's envelope shape written to `test-results/accessibility/vue/<browser>/<componentStoryId>.json`, and PD-11's read-only `--report`-then-human-authored-PR baseline flow), scoped to Vue's 9 items. `ripple`'s spec covers its directive-application interaction (e.g., verifying the ripple effect triggers on click/keyboard-activate) rather than component-shaped assertions, since it's a directive not a component — same accommodation as Task 3's story authoring. Interaction assertions cross-checked against Vue's existing `@vue/test-utils` tests (R2.4).

**Acceptance criteria traceability:** AC-R2, AC-R3, AC-R4, AC-R4b (for Vue's 9 items).

**Verification:** Same pattern as Tasks 6/7 (explicit `--project=vue-chromium --project=vue-firefox --project=vue-webkit`, `--check "test-results/accessibility/vue/**/*.json"`), scoped to `packages/vue/e2e/`, confirming 9 (not 8) items covered.

---

## Task 9 — Cross-framework parity scenarios (R5)

**Objective:** Satisfy R5: for the shared 8-component set only, verify each framework's Task 6/7/8 interaction suite implements the *same conceptual scenario* (e.g., "Escape closes Dialog, focus returns to trigger") with equivalent expectations.

**Files/directories to change:**
- No new files necessarily — this task audits/aligns the interaction assertions Tasks 6–8 already wrote for the shared 8 components, adjusting wording/coverage where one framework's suite is missing a scenario another framework's suite has.
- Possibly: a new `docs/architecture/TRACK_A_PARITY_SCENARIOS.md` reference doc enumerating the shared scenario list once, so Tasks 6/7/8's specs can cite it (implementation-plan-level convenience, not spec-mandated) — optional, decided by whoever implements this task based on how much drift Tasks 6–8 actually produced.

**Prerequisite:** Tasks 6, 7, 8 (all three frameworks' interaction suites must exist before parity can be verified).

**Implementation steps:**
1. Enumerate the shared 8 components' interaction scenarios each framework's Task 6/7/8 spec already covers.
2. Cross-reference: does every framework have an equivalent scenario for the same component/interaction (e.g., all three have a "Dialog: Escape closes" scenario)? Where one framework is missing a scenario another has, add it (a small addition to that framework's own spec file from Tasks 6/7/8 — not a new mechanism).
3. Do NOT build a single cross-framework test runner (R5.1 explicitly forbids this) — parity is verified by comparing each framework's own independent suite, not by sharing test code across frameworks.
4. Confirm Angular's Fluid/Badge/AutoFocus/Ripple and Vue's Ripple are correctly absent from this parity audit (R5.2) — they have no counterpart to compare, by design.

**Acceptance criteria traceability:** AC-R5.

**Verification:**
- Manual/scripted cross-check confirming each of the 8 shared components has at least one equivalent-named scenario across all three frameworks' spec files (e.g., grep for a consistent scenario-description string pattern across `packages/{ng,react,vue}/e2e/dialog.spec.*`).
- `pnpm run test` (existing Vitest suite) still passes — confirms this task's edits (if any, to existing Task 6-8 spec files) didn't touch anything outside the `e2e/` directories.

---

## Task 10 — CI wiring (implements D4)

**Objective:** Satisfy R6: wire Tasks 1–9's work into `.github/workflows/ci.yml` as a new, separate, matrix-parallel job, per PD-7.

**Files/directories to change:**
- `.github/workflows/ci.yml` — one new job added (`track-a-browser-visual-a11y`), appended after the existing `ci:` job definition — the existing job's steps are not touched (R6.4).

**Prerequisite:** Tasks 6, 7, 8, 9 (local checks proven working before CI wiring, per the plan's own ordering principle).

**Implementation steps (revised per PD-7/PD-9/PD-13 — resolves Plan Review findings 6, 7, 10):**
1. Add the new job per PD-7's structure: `strategy.matrix.framework: [ng, react, vue]`, `fail-fast: false` (D4's explicit no-fail-fast requirement). **Explicit browser semantics (finding 10):** GitHub Actions' matrix dimension stays 1-D (framework only) — each matrix entry then invokes `npx playwright test --project=${{ matrix.framework }}-chromium --project=${{ matrix.framework }}-firefox --project=${{ matrix.framework }}-webkit` (PD-9's 9 named projects, filtered to the 3 belonging to that entry's own framework), so each of the 3 GitHub Actions matrix entries genuinely executes all 3 D5 browser engines — 3 frameworks × 3 browsers = 9 (framework, browser) combinations covered, none skipped.
2. Each matrix entry: checkout, pnpm/Node setup (matching the existing `ci:` job's exact setup steps for consistency — Node version note: the existing `ci:` job pins Node 20 via `actions/setup-node@v4`; this repo's local dev convention uses Node 22.22.2 via nvm — the plan uses the CI-pinned Node 20 for this new job too, matching Track B's own precedent rather than introducing a second CI Node version), install deps, install Playwright browser binaries for that matrix entry's needed engines, run `npx playwright test --project=${{ matrix.framework }}-*` (step 1's invocation) — **Storybook serving is handled entirely by Playwright's own `webServer` mechanism (PD-13), invoked automatically as part of this one command; there is no separate "serve it" step in the YAML** (finding 7's "do not leave serving as an implementation choice" is resolved by delegating to PD-13's already-concrete `webServer` contract, not by adding a bespoke serve/wait-on script step) — then run `node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/${{ matrix.framework }}/**/*.json"` against that framework's fresh envelope files.
3. Upload artifacts via `actions/upload-artifact@v4`: `test-results/accessibility/${{ matrix.framework }}/` (axe envelopes) and Playwright's own `test-results/` output (screenshot diffs, traces), named `accessibility-reports-${{ matrix.framework }}` and `playwright-report-${{ matrix.framework }}` respectively — per PD-12's naming convention, satisfying D4's "independent evidence per framework, not merged into one blob" requirement and R8's evidence contract.
4. Do not add, modify, or depend on any Track B step or script (R6.4) — verified by `git diff` showing zero changes inside the existing `ci:` job block.

**Acceptance criteria traceability:** AC-R6.

**Verification:**
- `.github/workflows/ci.yml` YAML-lints clean (`yamllint` or GitHub's own workflow syntax check via a draft PR, or a local `actionlint` run if available).
- `git diff .github/workflows/ci.yml` shows only additive changes — the existing `ci:` job's steps byte-identical.
- Manual trace: confirm the matrix's `fail-fast: false` key is present and not accidentally defaulted to `true`.
- Manual trace: confirm each matrix entry's `--project=${{ matrix.framework }}-*` invocation genuinely expands to that framework's 3 browser projects (not accidentally 1 or 9) — inspect a real CI run's Playwright summary output showing 3 project names executed per matrix entry.
- Confirm no separate Storybook-serving step exists in the YAML (PD-13's `webServer` handles it inside the `playwright test` invocation itself) — a `git diff` line-count sanity check that the job is shorter than a hand-rolled serve/wait-on/teardown sequence would require.

---

## Task 11 — Mutation/failure-proof tests

**Objective:** Prove the three enforcement mechanisms (visual, accessibility, interaction) actually fail on a real regression, not just "the script exits 0" — required by the approved spec's own AC-R3/AC-R4/AC-R4b mutation-testing language.

**Resolves Plan Review finding 6 — the original plan's contradiction:** the pre-amendment Task 11 claimed its mutations "prove against the real CI path" (its own Prerequisite line) while also stating every mutation is "temporary/uncommitted" and reverted before any commit. An uncommitted local mutation, by definition, never enters a PR, never triggers CI, and therefore cannot prove anything about GitHub Actions' actual execution environment (runner OS/browser-binary versions, Playwright's real `webServer` behavior under CI's process model, artifact-upload behavior) — only about the local machine running it. This amendment corrects the claim rather than the intent: local mutation testing is real and valuable (it proves the *enforcement logic* is correct), but it is a categorically different, narrower claim than "proves CI behavior," and the plan must not conflate the two.

**Corrected structure — two explicitly separated sub-tasks:**

### Task 11a — Local mutation/failure-proof verification (enforcement logic correctness)

**Files/directories to change:** Same as before — temporary, reverted-after-verification mutations to a real component/story (not committed), plus a short-lived note/log of each result retained in the task's own implementation report (not a permanent repository file).

**Prerequisite:** Tasks 6, 7, 8 (real interaction/visual/accessibility suites must exist locally to mutate against) — **not** Task 10. Local mutation testing does not require CI wiring to exist first; it proves the underlying mechanism (Playwright's `toHaveScreenshot()`, `@axe-core/playwright`'s scan, `validate-accessibility-baseline.mjs`'s check logic) works correctly on this machine, independent of CI.

**Implementation steps (unchanged in substance from the original plan, scope-corrected to "local logic proof" only):**
1. **Visual mutation:** pick one already-covered component (e.g., Angular's Button), deliberately change a CSS token used by its Aura styling, run its Playwright spec locally (`npx playwright test --project=ng-chromium <button-spec>`) — confirm `toHaveScreenshot()` fails with a real diff image artifact (not a false pass). Revert the mutation. Satisfies AC-R3's mutation-test requirement, **locally**.
2. **Accessibility mutation:** pick one already-covered component/story, deliberately strip an `aria-label` or similar attribute, run its axe scan locally — confirm `validate-accessibility-baseline.mjs --check` reports a new, un-baselined violation and fails (R4.8). Revert. Satisfies AC-R4's mutation-test requirement, **locally**.
3. **Accessibility baseline mechanics (AC-R4b), each independently proven locally:**
   - Confirm a real, already-baselined violation (if Task 6/7/8 found any genuine ones) continues to pass `--check` on an unrelated re-run — no re-fail merely by existing (R4.9's grandfathering).
   - Confirm fixing a real violation (if one exists) and re-scanning shows the fingerprint no longer produced by `--report`.
   - Confirm deleting `ACCESSIBILITY_BASELINE.md` (temporarily, for this test only) causes `--check` to fail closed (R4.11) — restore the file immediately after.
   - Confirm the R4.9-amendment scenario: introduce a new, deliberately-accepted violation, manually add its fingerprint to the baseline (per PD-11's human-authored-only write path), confirm `--check` now passes — proving the same-PR-addition contract's *logic* works as specified (the actual "same PR" claim is a process fact about how a real PR is structured, verified at Task 11b/real-usage time, not something a local test can prove by itself).
4. **Interaction mutation:** pick one already-covered interaction assertion (e.g., Dialog's Escape-closes-and-refocuses scenario), deliberately break the underlying keyboard handler, run the Playwright spec locally — confirm the assertion fails with a real trace artifact. Revert.
5. Every mutation in this task is reverted before the task's own commit — this task's committed diff is empty or near-empty (test-infrastructure additions only, e.g. a documented mutation-test procedure in a comment, if the team wants it re-runnable later — no permanent broken state is ever committed).

**Acceptance criteria traceability:** AC-R3, AC-R4, AC-R4b (local logic proof), AC-R2/AC-R5 (local interaction failure proof).

**Verification:**
- Each of the 4 mutation scenarios above independently confirmed to fail correctly locally, then confirmed reverted (real component/story diff shows zero net change after this task).
- `git status` clean after this task (no accidentally-committed mutation left behind).
- `pnpm run test` and Task 6-9's real Playwright suites all pass again post-revert.

### Task 11b — CI-path mutation/failure-proof verification (CI environment correctness)

**Objective:** Prove the *same* three enforcement mechanisms correctly fail when run through the real GitHub Actions CI path Task 10 wired — a genuinely different claim from Task 11a's local proof, since CI's runner environment, artifact-upload behavior, and `fail-fast: false`/matrix semantics cannot be exercised by a local, uncommitted mutation.

**Mechanism (a concrete, in-scope, committed/PR-based approach — not a repeat of Task 11a's local-only pattern):** open a short-lived, throwaway pull request against a scratch branch (never merged) containing exactly one of Task 11a's mutations (e.g., the same visual-CSS-token mutation), let Track A's real CI job (Task 10) run against it, and observe the real GitHub Actions run: does the `track-a-browser-visual-a11y` job fail as expected, does it fail *only* the mutated framework's matrix entry (not the other two, proving `fail-fast: false` and independent matrix-entry evidence per D4), and are the real CI-uploaded artifacts (PD-12's `accessibility-reports-${{ matrix.framework }}`/`playwright-report-${{ matrix.framework }}`) present and inspectable. Close/delete the throwaway PR and branch afterward without merging — this is a real, in-scope CI-verification mechanism (a normal PR lifecycle this repo's own contribution workflow already supports), not a new process invented beyond this plan's authority, and it stays within Track A's own scope (no Track B/C/E branch/PR interaction).

**Prerequisite:** Task 10 (the real CI job must exist to test against) and Task 11a (reuses one of 11a's already-proven-locally mutations rather than inventing a new one, so CI verification is confirming environment correctness, not re-discovering whether the mutation itself is valid).

**Implementation steps:**
1. Re-apply one visual mutation (from Task 11a) on a scratch branch, push, open a throwaway PR.
2. Observe the real CI run: confirm the `track-a-browser-visual-a11y` job's mutated-framework matrix entry fails, the other two frameworks' matrix entries still run to completion and report their own (passing) results — direct proof of D4's `fail-fast: false`/independent-execution contract, which nothing local can prove.
3. Confirm the real CI-uploaded artifacts are present and downloadable from the PR's checks tab.
4. Repeat steps 1-3 for one accessibility mutation and one interaction mutation (three throwaway PRs total, or one PR carrying all three mutations at once if that's simpler to manage — implementer's choice, not fixed here).
5. Close every throwaway PR without merging; delete the scratch branch(es). No mutation is ever merged to `main`.

**Acceptance criteria traceability:** AC-R6 (CI job genuinely fails on a real broken check, per its own "deliberately broken visual/accessibility/interaction check fails the job" language — this is the one AC-R6 clause Task 10's own verification could not fully prove without a real triggering PR).

**Verification:**
- Real GitHub Actions run logs/artifacts confirm each of the 3 mutation types correctly fails only its own framework's matrix entry.
- Throwaway PR(s) closed, scratch branch(es) deleted — confirmed via `git branch -a`/`gh pr list` showing no lingering scratch state.
- `main` unaffected throughout (no mutation ever merged).

---

## Task 12 — Whole-track verification

**Objective:** Confirm Track A's implementation, taken as a whole, matches the approved specification exactly — full validation, exact changed-file scope, no excluded file touched, no Track B/C/E scope creep.

**Files/directories to change:** None (verification only).

**Prerequisite:** All of Tasks 1–9, 10, 11a, 11b.

**Implementation steps / checks:**
1. `pnpm run test` (existing Vitest suite) — exit 0, zero existing test modified/broken (G6's "additive, not destabilizing" constraint).
2. `pnpm --filter @ultimate/ng exec storybook build`, same for `react`/`vue` — all three build clean, each `storybook-static/index.json` containing the exact expected story-ID set per Tasks 1-3's amended verification (12/8/9 items respectively, not a generic file count).
3. `npx playwright test` (no project filter — PD-9's config runs all 9 projects by default) across all three frameworks' `e2e/` directories — all pass (AC-R2), confirming all 9 (framework, browser) combinations, not merely that some subset ran.
4. Visual regression baseline validation: confirm `__screenshots__/` directories exist and are committed for all 3 frameworks, all items in §2's coverage table.
5. Deliberate visual mutation failure: re-confirm Task 11a's local proof AND Task 11b's real-CI proof (both, not either).
6. Accessibility baseline validation: `node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/**/*.json"` exits 0 against the real, final `ACCESSIBILITY_BASELINE.md` state, across all three frameworks' envelopes in one combined glob.
7. Deliberate accessibility mutation failure: re-confirm Task 11a's local proof AND Task 11b's real-CI proof.
8. Interaction failure validation: re-confirm Task 11a's local proof AND Task 11b's real-CI proof.
9. CI workflow validation: the new job's YAML is syntactically valid, matrix/fail-fast/artifact-upload structure matches PD-7 exactly, and Task 11b's real CI run already empirically confirmed the matrix/fail-fast/artifact behavior works as specified (not merely YAML-syntax-valid).
10. Artifact/evidence validation: confirm each check type (visual/accessibility/interaction) genuinely produces the R8-required evidence artifact, not just an exit code — spot-check Task 11b's real CI run's uploaded artifacts (`accessibility-reports-${{ matrix.framework }}`, `playwright-report-${{ matrix.framework }}` per PD-12).
11. `git status` clean; `git diff --stat` against the pre-Track-A baseline shows only the files this plan's tasks declared (Storybook configs/stories × 3 frameworks, one root `playwright.config.ts` with 9 projects + PD-13's `webServer` array, per-framework `e2e/` spec files, `ACCESSIBILITY_BASELINE.md`, `validate-accessibility-baseline.mjs` + test, `.gitignore`'s new `test-results/` entry per PD-12, `ci.yml`'s additive new job, `package.json`×4 (root + 3 frameworks) + `pnpm-lock.yaml`).
12. Scope/boundary verification: confirm zero diff inside Track B's existing `ci:` job block, zero `.changeset/` file touched (Track C), zero SSR/hydration-shaped file created (Track E), zero `BLUEPRINT_GAPS.md`/`ROADMAP.md`/`DECISIONS.md` edit (this plan's own explicit exclusion), and confirm no throwaway PR/branch from Task 11b was left lingering (merged or otherwise) on `main`.

**Verification:** All 12 checks pass; final report documents the real, empirical `ACCESSIBILITY_BASELINE.md` row count (whatever it genuinely is, not assumed) and the real screenshot-baseline file count.

---

## 4. Dependency/Version Summary (all independently verified, none invented)

| Package | Version | Root or framework package? | Ownership rationale (resolves Plan Review finding 9) | Source of truth |
|---|---|---|---|---|
| `storybook` | `10.6.0` | **Per-framework** (`packages/{ng,react,vue}/package.json`) | The `storybook` CLI/core package is invoked per-package (`pnpm --filter @ultimate/ng exec storybook ...`, Task 1/2/3's own build/serve commands) against that package's own `.storybook/` config and `src/*.stories.*` files — it has no meaningful root-level invocation, matching this repo's existing convention that build/test tooling lives alongside the code it builds (e.g. `vitest` itself is a per-package devDependency in this repo, not hoisted to root, confirmed by `packages/react-core/package.json`'s own `vitest` entry). | `npm view storybook version`, live registry |
| `@storybook/angular` | `10.6.0` | **`packages/ng` only** | Framework-specific Storybook builder — has no meaning for React/Vue, would be dead weight if hoisted to root. | `npm view @storybook/angular version` + peer-dep range confirmed compatible with `@angular/core@^21.2.22` |
| `@storybook/react-vite` | `10.6.0` | **`packages/react` only** | Same reasoning — framework-specific builder. | `npm view @storybook/react-vite version` |
| `@storybook/vue3-vite` | `10.6.0` | **`packages/vue` only** | Same reasoning — framework-specific builder. | `npm view @storybook/vue3-vite version` |
| `@storybook/addon-a11y` | `10.6.0` | **Per-framework** (all three) | An addon is loaded via each framework's own `.storybook/main.ts` addons list (Task 1/2/3, R1.3) — it is not framework-specific code itself, but Storybook's addon-loading model requires it resolvable from each Storybook instance's own dependency tree, matching where `storybook` itself lives (same rationale as the `storybook` row above). | `npm view @storybook/addon-a11y version` |
| `@playwright/test` | `1.63.0` | **Root only** | Unlike Storybook (genuinely framework-coupled via per-framework builders), Playwright is framework-agnostic at the browser-driving layer — the same `@playwright/test` package drives all 9 projects (PD-9) regardless of which framework's Storybook instance a given project's `testDir` points at. Installing it three times (once per framework package) would be pure duplication with zero framework-specific behavior gained — this repo's own `pnpm` workspace already deduplicates such a root-level shared devDependency via its content-addressable store, matching the precedent of other root-level cross-cutting tools already in this repo (e.g. `prettier`, `eslint`, confirmed as root `package.json` devDependencies, not per-package). | `npm view @playwright/test version` |
| `@axe-core/playwright` | `4.13.0` | **Root only** | Same reasoning as `@playwright/test` — `AxeBuilder` is a Playwright-page-level API, not framework-coupled; Task 6/7/8's specs import it identically regardless of which framework's story they're scanning. Installing once at root, alongside `@playwright/test`, avoids three redundant installs of a tool with zero per-framework variation. | `npm view @axe-core/playwright version` + peer-dep `playwright-core: >=1.0.0` confirmed compatible |

**No dependency beyond these seven was added or is implied by this plan** — flagging explicitly per the task brief's "do not add dependencies beyond the approved seven without explicitly flagging the issue" instruction: no eighth package was introduced during this amendment (the `webServer`/matrix/project features used in PD-9/PD-13 are all native `@playwright/test` capabilities already covered by the one `@playwright/test` entry above, not separate packages). No dependency was added to the repository during this plan's creation — these are the versions Tasks 1–8 will pin when they run.

---

## 5. Package/Repository Boundary Guardrails

Explicit allowlist — no task in this plan may touch anything outside:

- `packages/ng/{.storybook/,e2e/,src/*/*.stories.ts,package.json}`
- `packages/react/{.storybook/,e2e/,src/*/*.stories.tsx,package.json}`
- `packages/vue/{.storybook/,e2e/,src/*/*.stories.ts,package.json}`
- Root `package.json`, `pnpm-lock.yaml`, `playwright.config.ts`, `.gitignore` (adding the `test-results/` entry per PD-12 — the only root `.gitignore` change this plan requires)
- `docs/architecture/ACCESSIBILITY_BASELINE.md`
- `scripts/provenance/validate-accessibility-baseline.mjs` (+ its test file)
- `.github/workflows/ci.yml` (additive new job only)

Note: `packages/{ng,react,vue}/e2e/__screenshots__/` (committed visual baselines) and `test-results/accessibility/**/*.json` (uncommitted, gitignored envelope files, PD-12) are both within-scope artifacts of the above per-framework allowlist entries — the former is a real, versioned deliverable; the latter is deliberately ephemeral and never committed, consistent with this repo's existing `coverage/`-shaped gitignore convention.

**Explicitly excluded (must never appear in any task's diff):**
- Any `scripts/provenance/*.mjs` file already owned by Track B, or any Track B CI step.
- `.changeset/` (Track C).
- Any SSR/hydration-shaped file, config, or dependency (Next.js/Nuxt/Angular Universal) (Track E) — R2's Playwright installation is a prerequisite Track E will later depend on, but this plan does not build Track E's own harness.
- `BLUEPRINT_GAPS.md`, `ROADMAP.md`, `DECISIONS.md` — this plan's own explicit exclusion.
- `CONTRIBUTING.md` and any unrelated documentation/bookkeeping.
- `component-metadata`'s package itself (Task 1/3's fallback-documentation handling for metadata-less items reads around the gap; it does not add new metadata records to that package, which would be scope creep into a different package's domain).

---

## 6. Sources

- `docs/superpowers/specs/2026-09-10-phase-10-browser-visual-accessibility-design.md` — the sole authoritative scope/requirements source (R1–R8, D1–D5, OQ-1–OQ-5, all referenced verbatim above, none redesigned).
- Live `npm view` registry lookups (this plan's own research) — `storybook`, `@storybook/angular`, `@storybook/react-vite`, `@storybook/vue3-vite`, `@storybook/addon-a11y`, `@playwright/test`, `@axe-core/playwright` versions and peer-dependency ranges.
- `playwright.dev/docs/api/class-locatorassertions` (official Playwright documentation, fetched live) — `toHaveScreenshot()`'s real default `threshold: 0.2` and unset `maxDiffPixelRatio` (resolves OQ-1).
- `github.com/dequelabs/axe-core/blob/develop/doc/API.md` (official axe-core documentation, fetched live) — the real default-ruleset behavior ("all rules except experimental"), resolving PD-4 and supporting OQ-5.
- `packages/react/package.json`, `packages/vue/package.json` — confirmed existing Vite-based build tooling (PD-2's evidence).
- `packages/ng/package.json` — confirmed `@angular/core: ^21.2.22`, checked against `@storybook/angular@10.6.0`'s real peer-dependency range.
- `packages/vue/src/ripple/` — direct file inspection revealing the §0 coverage-table correction (real, exported, non-stub `rippleDirective`).
- `packages/component-metadata/src/records/` — confirmed only the shared 8-component set has metadata records, informing Tasks 1/3's fallback-documentation handling for framework-specific items.
- `docs/architecture/SAST_BASELINE.md`, `scripts/provenance/validate-sast-baseline.mjs` — the structural precedent Task 5 mirrors (confirmed real fail-closed logic via direct source read; this amendment's own re-read also confirmed the script has no write/populate mode, correcting the original plan's `--populate-initial` invention — resolves finding 4).
- `playwright.dev/docs/api/class-testconfig` (official Playwright documentation, fetched live during this amendment) — confirmed project-level `testDir` overrides, default `testMatch` pattern, and multi-project isolation behavior (resolves finding 1, PD-9).
- Empirical local test: `npx playwright test --list` against a config with zero matching spec files, run directly during this amendment's research — confirmed real exit code 1 with "Error: No tests found," correcting the original plan's incorrect exit-0 assumption (resolves finding 2).
- `github.com/dequelabs/axe-core-npm` (`@axe-core/playwright` package documentation, fetched live) — confirmed `AxeBuilder#analyze()`'s real return shape (`Promise<axe.Results | Error>`) and the absence of any built-in story-ID/metadata attachment mechanism, establishing the need for PD-5's envelope wrapper (resolves finding 3).
- Real `axe-core@4.13.0` package extracted and its `axe.d.ts` type definitions read directly during this amendment's research — confirmed `Result.id`/`NodeResult.target`'s exact real shape (resolves finding 3, supports PD-5).
- `.github/workflows/ci.yml` — read in full, confirming the exact current 25-step `ci:` job structure Task 10 must not modify, and its Node 20 pin (informing PD-7's Node-version note).
