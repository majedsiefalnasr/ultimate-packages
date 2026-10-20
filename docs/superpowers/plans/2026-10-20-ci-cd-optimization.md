# CI/CD Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED — Plan Review passed (user, 2026-10-20), revision 4; native execution chosen (superpowers:executing-plans, then one fresh whole-branch review per stage). Spec revision 3 is approved. Stage 1 (Tasks 1–3) merged as [PR #48](https://github.com/majedsiefalnasr/ultimate-packages/pull/48) (`986fe941`); its closeout is `docs/architecture/research/2026-10-20-ci-cd-optimization-stage-1-closeout.md`. Stage 2 (Tasks 4–8), with Spec Amendment A1 (user, 2026-10-20), merged as [PR #49](https://github.com/majedsiefalnasr/ultimate-packages/pull/49) (`08e38c37`); its closeout is `docs/architecture/research/2026-10-20-ci-cd-optimization-stage-2-closeout.md`. Stage 3 (Tasks 9–10) is authorized (user, 2026-10-20), with each merge separately authorized. Each stage needs its own implementation authorization (Spec §8), and every commit, push, PR and merge its own.

**Goal:** Implement ADR-070 in three gated stages:

- Stage 1: run hygiene and names;
- Stage 2: browser-input classification, full validation for PRs into `main`, docs-only gating of `ci-extended` and SSR, pack/install on push;
- Stage 3: framework-filtered Storybook servers, with measurement.

**Architecture:**

- Workflow YAML changes for Stage 1.
- One extended pure classifier (`classify-changes.mjs`) with a repository-derived browser-input set for Stage 2, consumed by `ci.yml` and `browser.yml` exactly as ADR-069 does today.
- A `TRACK_A_FRAMEWORK` filter in `playwright.config.ts` for Stage 3.

**Tech Stack:** Node 24.15.0 ESM, `node:test`, GitHub Actions YAML, `actionlint`, pnpm 9.6.0, Playwright 1.63.0.

**Spec:** `docs/superpowers/specs/2026-10-20-ci-cd-optimization-design.md` (revision 3). R1–R11, AC1.1–AC3.3 and §9.4 are binding. ADR-070 is drafted in `docs/architecture/DECISIONS.md`.

## Global Constraints

- **Stage 1 branch:** `research/ci-cd-optimization` in `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate-ci-cd-optimization`, from `origin/develop` `ee8e0897`, created with `--no-track`.
- **Stage 2 and 3 branches:** new, `--no-track`, from `origin/develop` after the previous stage merges. Names are an implementation choice.
- Push only with an explicit `src:dst` refspec.
- **Node:** prefix every `pnpm`/`node` command with `source ~/.nvm/nvm.sh && nvm use 24.15.0`. Run `pnpm install` once per worktree before the first commit, so hooks exist (`AGENTS.md` §7.1).
- **Authorizations:** commits, pushes, PRs and merges each need the stage's explicit authorization. No GitHub setting changes. No branch-protection changes.
- **Hands off:**
  - `release.yml`;
  - `perf-stage1.yml`, except its job `name:` (Task 1);
  - hook commands;
  - the `ci` check name, triggers and job IDs;
  - known-red checks;
  - CO-8, CO-11, S1–S7, Phase 2.
- **Gate expressions:** `!= 'docs'` and `!= '[]'` only, never `== 'full'`.
- **Step names:** no existing step's `name:` changes (Spec §4.4).

## Review Focus

1. **A push run cancelled by concurrency.** Two pushes to `develop` in quick succession must both run to completion. The R1 group includes `github.ref` and `github.sha` for pushes. Task 1 asserts the expression text, and AC1.4 checks it on a real run.
2. **Removal outside the browser jobs.** Both removal modes must run only in the two browser jobs. In `ci` they would delete scripts and packages that `ci` builds, tests and runs. Task 7 Step 4 greps that each mode appears exactly twice, both in `browser.yml`.
3. **Prefix boundaries and the perf harness.** `docs/architecture/provenance.json` must not match the prefix `docs/architecture/provenance/`, and `scripts/perf/x.ts` must select all three, because the playground perf pages import it (Spec SR-4). Task 4 tests both.
4. **A rename across classes.** A file moved from `packages/ng/` to `packages/cli/` must still select ng, and one moved from a listed path to an unlisted one must select all three. The existing `--name-status -M` both-sides parsing covers it; Task 5 adds both cases.
5. **Derivation throws inside the CLI.** The CLI must still write `scope` from the docs rule, with rule 3 giving all three frameworks, and exit 0. Task 5 tests this with `--repo-root` at the `peer-edge` fixture.

---

## Stage 1 — run hygiene and names (Spec §4)

### Task 1: Concurrency, timeouts and display names

**Files:**

- Modify: `.github/workflows/ci.yml`, `.github/workflows/browser.yml`, `.github/workflows/perf-stage1.yml` (job `name:` only)

**Interfaces:** none.

- [ ] **Step 1:** Record the pre-change step names: `grep -h "^      - name:" .github/workflows/*.yml | sort > /tmp/<scratch>/step-names-before.txt`, using the session scratchpad path.
- [ ] **Step 2:** Add Spec R1's `concurrency` block verbatim at workflow level to `ci.yml` and `browser.yml`.
- [ ] **Step 3:** Add Spec R2's `timeout-minutes` to the five jobs: `ci` 30, `ci-extended` 20, `changes` 5, track-a 45, SSR 15.
- [ ] **Step 4:** Add Spec R4's `name:` values. Convert the SSR matrix to `framework: [ng, react, vue]`, and replace both `${{ matrix.dir }}` uses with R4's expression. Keep the step's name text, substituting the same expression for `matrix.dir`.
- [ ] **Step 5: Verify.**
  - `actionlint` reports no errors.
  - `grep -c "cancel-in-progress: \${{ github.event_name == 'pull_request' }}"` gives 1 in each of `ci.yml` and `browser.yml`.
  - `grep -n "timeout-minutes"` lists the five jobs.
  - `grep -n "matrix.dir"` returns nothing.
  - The `ci` job still has no job-level `if:`.
  - The step names, captured again as in Step 1 apart from SSR's expression substitution, `diff` empty against the Step 1 file.
- [ ] **Step 6: Commit** `ci: add concurrency, timeouts and descriptive job names`.

### Task 2: Per-invocation Playwright reports

**Files:**

- Modify: `.github/workflows/browser.yml` (track-a job)

**Interfaces:** none.

- [ ] **Step 1:** Add `env: PLAYWRIGHT_HTML_OUTPUT_DIR: playwright-report-tranches/<id>` to the six `Run G3-… verification specs` steps (`g3a`, `g3b`, `g3c1`, `g3c2`, `g3d`, `g3e`) and to `Run W1 verification specs (react)` (`w1`).
- [ ] **Step 2:** Append a final step, "Upload Playwright HTML reports (tranches)":
  - `if: always()`;
  - `actions/upload-artifact@v4`;
  - `name: playwright-report-tranches-${{ matrix.framework }}`;
  - `path: playwright-report-tranches/`;
  - `if-no-files-found: ignore`.
- [ ] **Step 3: Verify.**
  - `actionlint` is clean.
  - `grep -c "PLAYWRIGHT_HTML_OUTPUT_DIR"` gives 7.
  - The Task 1 Step 5 step-name `diff` shows exactly the one added line.
- [ ] **Step 4: Commit** `ci(browser): keep one Playwright report per tranche invocation`.

### Task 3: Stage 1 landing and evidence

**Files:** none changed. Evidence is collected for the Stage 1 closeout, which Task 8 writes.

- [ ] **Step 1:** Run `prettier --check .`, `pnpm run lint` and `pnpm run agents-md-pointers:validate`. Expected: pass. The research record, ADR-070, Spec and Plan are formatted.
- [ ] **Step 1a: Commit the records** (Spec §8: Stage 1 carries them), staging only these four paths:
  - `docs/architecture/research/2026-10-20-ci-cd-optimization-research.md`;
  - `docs/architecture/DECISIONS.md`;
  - `docs/superpowers/specs/2026-10-20-ci-cd-optimization-design.md`;
  - `docs/superpowers/plans/2026-10-20-ci-cd-optimization.md`.

  Message: `docs(ci): record CI/CD optimization research, ADR-070, Spec and Plan`.

- [ ] **Step 2:** With authorization, push and open one PR into `develop`. It changes `.github/`, so it classifies `full`.
- [ ] **Step 3:** **AC1.2 and AC1.3:** `gh pr checks <n>` lists `ci` and R4's names; `gh pr view <n> --json mergeStateStatus` is not `BLOCKED` on `ci`. If the matrix suffix is missing, apply R4's fallback in a follow-up commit on this branch and re-verify.
- [ ] **Step 4:** **AC1.4:** push one more commit while the first runs are in progress, for example the Step 3 fallback, or a whitespace-free docs touch-up to this Plan's status line. `gh run list --branch <branch>` shows the older `CI` and `Browser` runs as `cancelled`.
- [ ] **Step 5:** With merge authorization, merge with a merge commit.
  - **AC1.5:** the push run on `develop` has `playwright-report-tranches-{ng,vue,react}`, holding 6, 6 and 1 report folders (`gh run download`).
  - **AC1.6:** every step conclusion and the `N passed` counts equal run 39320417193's.
  - **AC1.4 (push half):** no run on `develop` is `cancelled`.

## Stage 2 — classification (Spec §5)

### Task 4: Closures, `NON_BROWSER_PATHS` and the removal mode

**Files:**

- Modify: `scripts/provenance/classify-changes.mjs`
- Modify: `scripts/provenance/classify-changes.test.mjs`
- Create: `scripts/provenance/fixtures/framework-closures/peer-edge/` (a minimal tree whose `packages/x/package.json` has `peerDependencies: { "@ultimate/y": "workspace:*" }`)

**Interfaces:**

- Produces:

  ```js
  deriveFrameworkClosures(repoRoot: string, roots?: Record<"ng" | "react" | "vue", string[]>): { ng: Set<string>, react: Set<string>, vue: Set<string> } // packages/* dir names; throws on any error (Spec R5.1)
  NON_BROWSER_PATHS: { prefixes: readonly string[], exact: readonly string[] } // Spec R5.2, verbatim
  isNonBrowserPath(path: string): boolean
  noClosurePackages(closures): string[] // packages/* dir names in no closure, sorted
  // CLI: --remove-non-browser-paths [--repo-root <dir>] → deletes matching tracked files, prints count and paths
  // CLI: --remove-out-of-closure-packages [--repo-root <dir>] → empties each no-closure package dir except a script-less package.json, prints packages and counts (Spec Amendment A1)
  // both modes exit non-zero on any error (Spec R5.3)
  ```

- Consumes: nothing from `workspace-graph.mjs` at runtime. That module resolves the repository from its own path, so the derivation reads manifests from `repoRoot` with the same semantics (Spec R5.1). The test imports `getTransitiveClosure` only to compare.

- [ ] **Step 1: Write the failing tests.**
  - **`real tree closures`:** `themes` and every `uix-*` in all three; none of `ai`, `cli`, `mcp`, `component-metadata`, `component-schema` in any; `react` not in `ng`'s.
  - **`closure semantics match workspace-graph`:** for each framework, the closure equals the roots under `packages/` plus, for each such root, `getTransitiveClosure("@ultimate/<root>")` short names, plus, for each `apps/`/`tooling/` root, its direct `workspace:` dependencies and their `getTransitiveClosure`.
  - **`peer-edge fixture throws`.**
  - **`real tree closure shape`:** `noClosurePackages` returns exactly `ai`, `cli`, `component-metadata`, `component-schema`, `mcp`; every other non-root package is in all three closures.
  - **`isNonBrowserPath`:** every Spec R5.2 entry matches. Non-matches: `docs/architecture/provenance.json` and `scripts/perf/x.ts` (Review Focus 3), `docs/architecture/compatibility-manifest.json`, `scripts/copy-compatibility-manifest.mjs`, `skills/x`, `docs/architecture/ACCESSIBILITY_BASELINE.md`, `scripts/provenance/classify-changes.mjs`, `scripts/provenance/baseline-lib.mjs`.
  - **`listed files on the real tree` (AC2.2):**
    - the sorted `git ls-files` paths that `isNonBrowserPath` matches equal a literal snapshot array in the test;
    - none is under `packages/`, `apps/`, `skills/` or `tooling/`;
    - none appears as a literal in `.github/workflows/browser.yml` or `playwright.config.ts`.
  - **`--remove-non-browser-paths`:**
    - in a temp git repository with tracked `AGENTS.md`, `docs/architecture/provenance/a.json`, `scripts/provenance/classify-changes.mjs` and `README.md`, plus an untracked `.changeset/u.md`: exactly the first two are deleted, and stdout names them;
    - in a non-git temp directory, it exits non-zero.
  - **`--remove-out-of-closure-packages`:**
    - on a fixture tree with roots `packages/fw` (depends on `packages/shared`) and a no-closure `packages/tool` holding `package.json`, `src/a.ts` and an untracked `dist/a.js`: afterwards `packages/tool` contains only `package.json`, which has no `scripts`, and `packages/shared` is untouched with its `scripts`;
    - on the `peer-edge` fixture, it exits non-zero.
  - Fixture closures need framework roots. Give `deriveFrameworkClosures` an optional second parameter `roots` (default: Spec R5.1's roots), used only by tests.
- [ ] **Step 2: Run** `node --test scripts/provenance/classify-changes.test.mjs`. Expected: the new tests FAIL (exports missing); the 15 existing tests pass.
- [ ] **Step 3: Implement** the four exports and the two CLI modes per Spec R5.1–R5.3. The removal mode lists files with `git ls-files -z` run in `repoRoot` and deletes with `rmSync`. The package mode empties each no-closure directory except `package.json` with `rmSync(…, { recursive: true })` per entry. Neither mode swallows errors.
- [ ] **Step 4: Run** the same command. Expected: all pass.
- [ ] **Step 5: Commit** `feat(ci): derive framework closures and a closed non-browser path list`.

### Task 5: Framework rule, `main` base and CLI wiring

**Files:**

- Modify: `scripts/provenance/classify-changes.mjs`
- Modify: `scripts/provenance/classify-changes.test.mjs`

**Interfaces:**

- Consumes: `deriveFrameworkClosures`, `isNonBrowserPath` (Task 4).
- Produces:
  - `classifyChanges(paths, { event, baseRef, closures })`, where `closures: ReturnType<typeof deriveFrameworkClosures> | null` and `null` means the derivation failed;
  - the same return shape as today;
  - the CLI also accepts `--repo-root <dir>` (default: cwd).

- [ ] **Step 1: Write the failing tests**, with a hand-built `closures` fixture: `uix-utils` in all three, `cli` in none. One `test()` per Spec R5.4 rule:
  - `packages/cli/src/x.ts` → `[]`;
  - `packages/uix-utils/x` → all;
  - a package present in only the `ng` closure of a hand-built fixture → all (Spec R5.4 rule 3);
  - `scripts/perf/browser/harness.ts` → all;
  - `packages/nope/x` → all;
  - `docs/architecture/provenance/react.json`, `AGENTS.md`, `.changeset/x.md`, `.github/codeql/codeql-config.yml`, `.github/workflows/ci.yml`, `scripts/provenance/validate-provenance.mjs` → `[]`;
  - `scripts/provenance/validate-g3a-accessibility.mjs`, `scripts/provenance/new.mjs`, `docs/architecture/compatibility-manifest.json`, `docs/architecture/ACCESSIBILITY_BASELINE.md`, `skills/a/b.md`, `.github/workflows/browser.yml`, `playwright.config.ts`, `pnpm-lock.yaml`, `apps/docs/x`, `newdir/x` → all;
  - `["packages/cli/x", "packages/react/y"]` → `["react"]`;
  - through `parseNameStatus`: rename `packages/ng/a.ts` → `packages/cli/a.ts` gives `["ng"]`; rename `docs/architecture/provenance/a.json` → `docs/architecture/a.json` gives all (Review Focus 4);
  - `closures: null` with `packages/cli/x` → all; with `AGENTS.md` → `[]` (rule 4 needs no closures); with docs-only paths → `scope=docs`, `[]`;
  - **R6:** `event: "pull_request"`, `baseRef: "origin/main"`, docs-only paths → `scope=full`, all;
  - **CLI:** `--repo-root` at the `peer-edge` fixture with `--event push` → exit 0, `frameworks=["ng","react","vue"]` (Review Focus 5).
- [ ] **Step 2: Run** the test file. Expected: the new tests FAIL; the existing tests pass. Update existing call sites in the test file to pass `closures` only where a test needs it. `undefined` behaves as `null`.
- [ ] **Step 3: Implement** Spec R5.4 (rules in order 1–5) and R6 in `classifyChanges`. The CLI calls `deriveFrameworkClosures(repoRoot)` inside its own `try`, logs `[classify-changes] framework closures unavailable, packages select all frameworks: <message>` on failure, and passes `null`. Update the header comment to cite ADR-070 (Spec R9).
- [ ] **Step 4: Run** `pnpm run test:scripts`, after `pnpm run vendor:fetch -- primereact primevue` in a fresh worktree. Expected: all pass.
- [ ] **Step 5: AC2.3 replay.** Write a throwaway script in the session scratchpad, not committed. For the 43 merges in research §3.5, it feeds `git diff --name-status -M <sha>^1 <sha>` through `parseNameStatus` and `classifyChanges(…, { event: "pull_request", baseRef: "origin/develop", closures: deriveFrameworkClosures(cwd) })`, and prints PR → frameworks. Expected: exactly Spec AC2.3's list; keep the output for Task 8's closeout.
- [ ] **Step 6: Commit** `feat(ci): narrow browser frameworks by closures and the non-browser list; run everything for PRs into main`.

### Task 6: Pack/install integrity on push

**Files:**

- Modify: `scripts/provenance/affected-packages.mjs` (CLI only)
- Modify: `scripts/provenance/affected-packages.test.mjs`
- Modify: `.github/workflows/ci.yml` ("Determine affected packages")

**Interfaces:** the CLI gains `--event <name>`.

- [ ] **Step 1: Write the failing test.** Run the CLI through `execFileSync(process.execPath, [script, "--event", "push", "--base-ref", "refs/does-not-exist"])`. Stdout lists all 17 short names, and the exit code is 0. A bad ref would throw if git were called.
- [ ] **Step 2: Run** `node --test scripts/provenance/affected-packages.test.mjs`. Expected: the new test FAILS; the existing tests pass.
- [ ] **Step 3: Implement** Spec R8: with `--event push`, use `getAllPackageNames()` (short, sorted) and skip `getChangedFiles`. In `ci.yml`, add `EVENT: ${{ github.event_name }}` to the step's `env:` and append `--event "$EVENT"`.
- [ ] **Step 4: Run** the test file and `actionlint`. Expected: pass, clean.
- [ ] **Step 5: Commit** `fix(ci): check every package's pack/install integrity on push`.

### Task 7: `ci-extended` gating, SSR scoping, physical exclusion

**Files:**

- Modify: `.github/workflows/ci.yml` (`ci-extended`)
- Modify: `.github/workflows/browser.yml` (`track-a-browser-visual-a11y`, `track-e-ssr-hydration`)

**Interfaces:** consumes the classifier outputs `scope` and `frameworks`, unchanged in name and format, and Task 4's `--remove-non-browser-paths` and `--remove-out-of-closure-packages`.

- [ ] **Step 1:** In `ci-extended`, insert the "Classify changes" step after "Setup Node.js", copied from `ci`. Append `&& steps.classify.outputs.scope != 'docs'` to the six steps of Spec R7.
- [ ] **Step 2:** In the SSR job, add `needs: changes`, `if: needs.changes.outputs.frameworks != '[]'` and `framework: ${{ fromJSON(needs.changes.outputs.frameworks) }}`.
- [ ] **Step 3:** In both browser jobs, with no `if:` (Spec R5.3):
  - add "Remove non-browser inputs" (`run: node scripts/provenance/classify-changes.mjs --remove-non-browser-paths`) right after "Setup Node.js";
  - add "Remove packages outside the framework closures" (`run: node scripts/provenance/classify-changes.mjs --remove-out-of-closure-packages`) right after "Install dependencies" and before the job's build step (Spec Amendment A1).
- [ ] **Step 4: Verify.**
  - `actionlint` is clean.
  - `grep -n "== 'full'"` over `.github/workflows` returns nothing.
  - `ci-extended` has no job-level `if:`.
  - `grep -c -- "--remove-non-browser-paths"` and `grep -c -- "--remove-out-of-closure-packages"` each give 2 in `browser.yml` and 0 in every other workflow (Review Focus 2).
  - The step-name `diff` from Task 1 shows exactly the five added lines: "Classify changes" in `ci-extended`, and both removal steps in the two browser jobs.
- [ ] **Step 5: Commit** `ci: skip ci-extended and SSR on docs-only PRs; scope SSR; remove non-browser inputs in browser jobs`.

### Task 8: Stage 2 landing, Stage 1 closeout

**Files:**

- Create: `docs/architecture/research/2026-MM-DD-ci-cd-optimization-stage-1-closeout.md`, dated the day it is written

- [ ] **Step 1:** Write the Stage 1 closeout in the style of `2026-10-19-affected-only-ci-closeout.md`: what landed, local verification, and the AC1.1, AC1.2, AC1.3 (a), AC1.4, AC1.5 and AC1.6 runs with links. It records AC1.3 (b) as **pending**, citing Spec §9.4 for where it completes, unless a docs-only PR has merged since Stage 1 and supplies it.
- [ ] **Step 2:** Run `prettier --check .`, `pnpm run lint` and `pnpm run test:scripts`. Expected: pass.
- [ ] **Step 3:** With authorization, push and open the PR into `develop`. **AC2.6:**
  - the `Classify changes` log shows `scope=full` and all three frameworks;
  - three track-a and three SSR jobs run, each with "Remove non-browser inputs" listing the Task 4 snapshot files and "Remove packages outside the framework closures" listing the five no-closure packages;
  - all pass with the Stage 1 push run's test counts.

  A failure after the first removal step means a listed file is a browser input: drop that entry (and its AC2.3 expectation) in a follow-up commit. A failure after the second means a no-closure package is needed at browser runtime, or pnpm cannot start the servers with emptied packages: stop and report to the user, because withdrawing rule 3's narrowing is a Spec change (Spec §7). Never weaken the job.

- [ ] **Step 4:** With merge authorization, merge. **AC2.7:** the push run's pack/install step shows 17 `integrity:pack-install` groups; all frameworks run; `ci-extended` steps run.
- [ ] **Step 5:** AC2.8 and AC2.9 are not collected here. Spec §9.4 assigns AC2.8 to the Stage 3 closeout PR (Task 10) and makes AC2.9 monitoring only.

## Stage 3 — Storybook servers (Spec §6)

### Task 9: `TRACK_A_FRAMEWORK`

**Files:**

- Modify: `playwright.config.ts`
- Modify: `.github/workflows/browser.yml` (track-a job `env:`)

**Interfaces:** environment variable `TRACK_A_FRAMEWORK` = `ng` | `react` | `vue` | unset.

- [ ] **Step 1: Write the check** (AC3.1) as a command, not a committed test:

  ```bash
  for v in ng react vue ""; do TRACK_A_FRAMEWORK=$v node -e 'import("./playwright.config.ts").then(m=>console.log(process.env.TRACK_A_FRAMEWORK||"(unset)", m.default.webServer.map(w=>w.name).join(",")))'; done
  TRACK_A_FRAMEWORK=svelte node -e 'import("./playwright.config.ts")'   # expected: non-zero exit
  ```

  Node 24 strips the config's erasable TypeScript. If Node cannot load the config this way, stop and report. Do not add a dependency to load it.

- [ ] **Step 2: Run it.** Expected before the change: every line lists all three Storybook and all three SSR servers, and the invalid value does not throw.
- [ ] **Step 3: Implement** Spec R10. The Storybook entries become a keyed record filtered like `trackESsrServers`. An unknown non-empty value throws `Error("TRACK_A_FRAMEWORK must be ng, react or vue, got <value>")`. In `browser.yml`, add `env: TRACK_A_FRAMEWORK: ${{ matrix.framework }}` at the track-a job level.
- [ ] **Step 4: Run Step 1 again.** Expected:
  - `ng ng-storybook`, `react react-storybook`, `vue vue-storybook`;
  - `(unset) ng-storybook,react-storybook,vue-storybook,ng-ssr-server,react-ssr-server,vue-ssr-server`, unchanged from Step 2;
  - the invalid value exits non-zero.
- [ ] **Step 5: Verify** `actionlint` is clean and `prettier --check playwright.config.ts` passes.
- [ ] **Step 6: Commit** `ci(browser): start only the job's own Storybook server`.

### Task 10: Stage 3 landing, measurement, closeouts

**Files:**

- Create: `docs/architecture/research/2026-MM-DD-ci-cd-optimization-stage-2-closeout.md` (on the Stage 3 branch)
- Create: `docs/architecture/research/2026-MM-DD-ci-cd-optimization-stage-3-closeout.md` (its own docs-only PR)

- [ ] **Step 1:** Write the Stage 2 closeout: the AC2.1–AC2.7 evidence and the Task 5 replay output. It records AC1.3 (b) and AC2.8 as **pending** per Spec §9.4, and AC2.9 as monitoring, unless an earlier PR already supplied them.
- [ ] **Step 2:** With authorization, push and open the Stage 3 PR. **AC3.2:**
  - each track-a log has `[<own fw>-storybook]` lines and no other framework's (`gh api …/jobs/<id>/logs`, escape sequences stripped);
  - `N passed` counts match research §3.2 or are explained.
- [ ] **Step 3:** With merge authorization, merge. On the push run, measure the R11 segments with the research §3.2 method: per-invocation `##[group]Run npx playwright` timestamp to `Running N tests`, step durations from the jobs API.
- [ ] **Step 4:** Write the Stage 3 closeout:
  - the R11 table, before (research §3.2) and after, measured;
  - the CO-8 trigger outcome: longest Browser job above or below 15 min;
  - AC1.3 (b) and AC2.8, taken from this closeout PR's own runs, because the PR is docs-only;
  - AC2.9: cited if a qualifying PR has occurred, otherwise still recorded as monitoring.
- [ ] **Step 5:** With authorization, open the closeout PR. Fill in AC1.3 (b) and AC2.8 from its runs before merge, in the same PR. The follow-up push is docs-only too, so the evidence stays valid. Under Spec §9.4, Stage 3 and the Spec close only after these two are met.

## Plan Review record

**In-session review (2026-10-20), against approved Spec revision 3.** Findings applied in revision 4:

| ID   | Finding                                                                                                      | Resolution                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| PR-1 | Spec §8 says Stage 1 carries the research record, ADR-070, the Spec and the Plan, but no task committed them | Task 3 Step 1a commits exactly those four paths                    |
| PR-2 | Task 4 Step 3 said "three exports and the CLI mode"; revision 3 has four exports and two CLI modes           | Corrected; the package mode's deletion method is named             |
| PR-3 | Task 7's Interfaces named only `--remove-non-browser-paths`                                                  | Both modes named                                                   |
| PR-4 | Review Focus 2 covered only the first removal mode, and cited Task 7 Step 3 instead of Step 4                | Covers both modes; cites Step 4                                    |
| PR-5 | Task 9's AC3.1 check depends on Node loading `playwright.config.ts` directly, which is not yet run here      | Step 1 says to stop and report rather than add a loader dependency |

Checked and found consistent: every Spec requirement R1–R11 maps to a task (R1–R4: Tasks 1–2; R5: Tasks 4, 5, 7; R6: Task 5; R7: Task 7; R8: Task 6; R9: Task 5; R10: Task 9; R11: Task 10); every AC has a verifying step; §9.4's pending evidence is recorded in Tasks 8 and 10; no task touches `release.yml`, branch protection, hooks, CO-8, CO-11, S1–S7 or Phase 2.

**Plan Review approved (user, 2026-10-20)** on revision 4, with native execution.
