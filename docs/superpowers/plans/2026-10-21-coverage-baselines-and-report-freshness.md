# Coverage: Report Freshness, `coverage:measure`, and the React/Vue Re-baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** DRAFT (revision 1), awaiting Plan Review. Spec revision 2 is approved (user, 2026-10-21). No task is authorized; implementation needs its own authorization.

**Goal:** Stop `validate-coverage.mjs` from judging a report that is older than the code it describes, make `coverage:measure` report every failing package instead of stopping at the first, and then re-baseline React and Vue to values that CI reproduces (GAP-091, ADR-060).

**Architecture:**

- **PR 1 (code):** a pure freshness decision in `validate-coverage.mjs`, called per package before any numeric comparison; one flag added to the `coverage:measure` script in `package.json`.
- **PR 2 (data):** two table rows in `docs/architecture/PERFORMANCE.md`. Nothing else. It starts only after PR 1 is merged.
- **Records PR (docs):** GAP-091 and C01, after a green push run on `develop` with the new baselines. Separate, and it needs the user's authorization at that point.

**Tech Stack:** Node 24.15.0 ESM, `node:test`, pnpm 9.6.0, Vitest coverage (v8), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-21-coverage-baselines-and-report-freshness-design.md` (revision 2). R1–R6 and AC1–AC7 (with AC4b) are binding.

## Global Constraints

- **Branches:** each PR has its own branch, created `--no-track` from `origin/develop`:
  - PR 1: `fix/coverage-report-freshness`;
  - PR 2: `chore/coverage-baselines-react-vue`, created after PR 1 is merged;
  - records: `docs/gap-091-closeout`, created after PR 2's push run is green.
  - The spec and this plan are on `docs/coverage-baselines-and-freshness`; they are merged first, as one docs-only PR, after Plan Review.
- **Node:** prefix every `pnpm`, `node` and `npx` command with `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"`. `nvm use` does not change the version in the agent shell.
- **Push:** only with an explicit `src:dst` refspec, with the pre-push hook running. The hook runs `npm pack`, which needs write access to `~/.npm`; if the session's sandbox blocks it, ask for elevated access, never `--no-verify`. Each merge needs the user's explicit authorization, with `--match-head-commit`.
- **Hands off:**
  - what any package measures: `vitest.config.ts` coverage settings, `angular.json`, includes, excludes, `all`;
  - the 2-point threshold and the 0.05 tolerance;
  - every `PERFORMANCE.md` row except `react` and `vue` coverage (PR 2 only);
  - `ci.yml`, `browser.yml`, `release.yml`, branch protection;
  - the unrelated `ai` packaging test.
- **Pre-existing, unrelated:** `.dsh/rules.yaml` is an untracked file in the working tree that is not this work's. Never stage it. Stage files by name.

## Review Focus

1. **A stale report must never reach a comparison** (AC1, AC2). Task 2 puts the freshness check before the integrity and regression paths and tests that a stale report gives no percentage in the output.
2. **No false staleness on CI** (AC4, K3). Task 1 makes the tolerance a named constant; Task 4 confirms it on a real run before anyone relies on it. A false fail is the safe direction, but it must not happen on a healthy checkout.
3. **`ng` and `ng-core` have a different report path and source tree** (K5). Task 1 lists the measured sources per package and Task 2 tests the `ng` shape.
4. **R2 must keep the step's meaning.** `--no-bail` must still exit non-zero when any package fails, and the CI step name and `if:` are untouched (AC4b). Task 3 proves both with an experiment and a test.
5. **PR 2 is two rows** (AC5). Task 6 checks `git diff --stat` and `git diff -U0` before the push.
6. **CI is the authority for the numbers** (R5, K1). Task 5 gets the values from CI, not from the local run.

---

## PR 1: tooling

### Task 1: Freshness decision (pure logic)

**Files:**

- Modify: `scripts/provenance/validate-coverage.mjs`
- Modify: `scripts/provenance/validate-coverage.test.mjs`

**Interfaces:**

- Produces:
  - `FRESHNESS_TOLERANCE_SECONDS` (exported constant). The value is set in Step 3: start at 2 seconds, and keep it only if Task 4's CI run confirms no false staleness; otherwise raise it in a follow-up commit on the same PR.
  - `measuredSourceRoots(packageName) → string[]`: the paths, relative to the repository root, whose files count as measured source. Rule (Spec §8 decision 1): the package's `src` directory and its config file. For the 15 Vitest-native packages that is `packages/<name>/src` and `packages/<name>/vitest.config.ts`. For `ng` it is `packages/ng/src` and `packages/ng/angular.json`; for `ng-core` it is `packages/ng-core/src` and `packages/ng-core/angular.json`. Verify each path exists in the repository before using it; if a package has no `src`, say so in the commit message and use its package directory minus `node_modules`, `dist`, `coverage` and `storybook-static`.
  - `evaluateReportFreshness({ reportMtimeMs, sourceMtimes, toleranceSeconds }) → { ok: true } | { ok: false, newestPath, newestMtimeMs, reportMtimeMs }`, where `sourceMtimes` is `{ path, mtimeMs }[]`. It is `ok` when the report is newer than or equal to the newest source minus the tolerance, and when `sourceMtimes` is empty (nothing to compare; the existing missing-report failure handles absence).

- [ ] **Step 1: Confirm the measured-source set against the repository.** Checked at plan time (2026-10-21, `develop` `4605716f`): all 17 packages have a `src` directory; the 15 Vitest-native packages have `vitest.config.ts`; `ng` and `ng-core` have `angular.json` and no `vitest.config.ts`. Re-run the same `ls` check at implementation time and stop if any package differs.
- [ ] **Step 2: Write the failing tests** in `validate-coverage.test.mjs` for `evaluateReportFreshness` and `measuredSourceRoots`:
  - report newer than all sources: `ok`;
  - report older than one source by more than the tolerance: not `ok`, and `newestPath` is that source;
  - report older than a source by less than the tolerance: `ok`;
  - report equal to the newest source: `ok`;
  - `sourceMtimes` empty: `ok`;
  - `measuredSourceRoots("react")` and `measuredSourceRoots("ng")` return the paths above, and every one of the 17 packages returns a non-empty list whose first entry starts with `packages/<name>/`.
- [ ] **Step 3: Run** `node --test scripts/provenance/validate-coverage.test.mjs`. Expected: the new tests FAIL (names not exported).
- [ ] **Step 4: Implement** the constant and the two functions as pure functions: no file or git access in them.
- [ ] **Step 5: Run** the test file. Expected: all pass, including every existing test.
- [ ] **Step 6: Commit** `feat(ci): add the coverage report freshness decision`.

### Task 2: Use it in the CLI, before any comparison

**Files:**

- Modify: `scripts/provenance/validate-coverage.mjs`
- Modify: `scripts/provenance/validate-coverage.test.mjs`

**Interfaces:**

- Consumes: Task 1's functions.
- Produces: a per-package stale-report failure in the CLI, printed as `<package>: coverage report is stale — <report path> (<time>) is older than <source path> (<time>); run "pnpm run coverage:measure" and retry`.

- [ ] **Step 1: Write the failing tests** using the existing `runCoverageCli` fixture. The fixture writes every report with the current time, after the source files are committed, so existing tests stay fresh. Add an option to the helper that sets a package's report modification time to a fixed past time (`utimesSync`), and one that sets a source file's modification time to the future.
  - A package whose report is older than its source fails with the stale message and **no percentage** in that package's output line (AC1).
  - Setting the report time to a September date for `react` and `vue` fails both as stale, not as a regression (AC2).
  - A fresh report still goes through the existing integrity and regression paths unchanged: run two existing scenarios again unchanged and confirm they pass.
  - A missing report keeps its existing "could not read coverage report" message.
- [ ] **Step 2: Run** the file. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.** In `runCli`, after reading the report path and before `readLineCoveragePct`, collect the modification times of the files under `measuredSourceRoots(packageName)` (a small recursive walk that skips `node_modules`, `dist`, `coverage` and `storybook-static`), stat the report, call `evaluateReportFreshness`, and on failure call `fail(...)`, set `anyFailed`, and `continue`. A report that cannot be stat'ed falls through to the existing read, which reports it as missing.
- [ ] **Step 4: Run** the test file, then `pnpm run test:scripts`. Expected: all pass.
- [ ] **Step 5: Reproduce the original defect locally (AC2, real files).** With the old September `packages/react/coverage/coverage-summary.json` restored by `touch -t 202609092120`, run `node scripts/provenance/validate-coverage.mjs --base-ref origin/develop` and record that React is reported as stale. This step changes only git-ignored files. Re-run `pnpm run coverage:measure` afterwards (it needs Task 3) or `npx vitest run --coverage` in the package to restore a fresh report.
- [ ] **Step 6: Commit** `feat(ci): reject a stale coverage report before comparing numbers`.

### Task 3: `coverage:measure` reports every failure

**Files:**

- Modify: `package.json` (one script)
- Create: `scripts/provenance/coverage-measure.test.mjs`

**Interfaces:**

- Produces: `"coverage:measure": "pnpm -r --no-bail --if-present run test:coverage"`.

- [ ] **Step 1: Experiment, already done at plan time and repeated here.** In a temporary workspace with three packages, one of which fails: without `--no-bail`, pnpm 9.6.0 stops after the failure (`ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`, exit 3 with the third package not reported); with `--no-bail` it runs all three and exits 1 (`ERR_PNPM_RECURSIVE_FAIL`, naming the failing package). Paste both outputs into the commit message body.
- [ ] **Step 2: Write the failing test** `coverage-measure.test.mjs`: it builds a temporary pnpm workspace with packages `a` (passes), `b` (fails) and `c` (passes, after a short sleep), reads the `coverage:measure` command from the real `package.json`, runs that command's `pnpm -r …` form in the temporary workspace, and asserts: all three ran, the exit code is non-zero, and the output names `b`. A second case with all three passing asserts exit 0. The test must locate `pnpm` from `PATH` and skip with a clear message if it is not found.
- [ ] **Step 3: Run** it. Expected: FAIL (the current script has no `--no-bail`).
- [ ] **Step 4: Change** the one script line in `package.json`. Nothing else in the file.
- [ ] **Step 5: Run** the new test and `pnpm run test:scripts`. Expected: pass.
- [ ] **Step 6: Check the CI step is untouched.** `git diff --stat` shows `package.json` and the test file only; `.github/workflows/ci.yml` is not in the diff (AC4b). `actionlint .github/workflows/ci.yml` stays clean.
- [ ] **Step 7: Commit** `fix(ci): let coverage:measure run every package and fail at the end`.

### Task 4: Land PR 1 and confirm on CI (AC4, AC4b)

- [ ] **Step 1:** Run Prettier and ESLint on every changed file, `pnpm run test:scripts`, and the full local sequence in Task 2 Step 5. Push with an explicit refspec (hook running) and open the PR against `develop`. The description states: the stale-report defect and how it was found, that CI measures from scratch so it was not affected, that `coverage:measure` now continues past a failure and still fails, and that nothing about what is measured changed.
- [ ] **Step 2: Read the real CI run** of the PR's advisory job:
  - "Coverage measurement" passes, and its log shows every package's coverage table;
  - "Coverage regression check" passes with no stale-report message for any package (AC4);
  - `ci` is green.
  - If any package is reported stale on CI, the tolerance is too small or the modification-time assumption is wrong. Do not merge. Raise `FRESHNESS_TOLERANCE_SECONDS` or fix the source set in a new commit on the same branch and read the run again.
- [ ] **Step 3: Prove AC4b on CI.** A deliberate failure is not pushed to `develop`'s PR. Instead state in the PR that the failure path is covered by the Task 3 test, and read the "Coverage measurement" step's conclusion on the real run (success when all packages pass).
- [ ] **Step 4:** Stop. The merge needs the user's explicit authorization, with `--match-head-commit`. After the merge, read the push run on `develop`.

---

## PR 2: baselines

### Task 5: Get the real numbers from CI (R5)

**Files:** none changed in this task.

- [ ] **Step 1:** After PR 1 is merged and `develop` is synced, read the Coverage measurement log of the push run on `develop` (the advisory job). From the printed per-package tables, read the `All files` line coverage for `react` and `vue`. Record both with the run id.
- [ ] **Step 2:** Measure locally with `npx vitest run --coverage` in `packages/react` and `packages/vue` on Node 24.15.0 after a clean build, twice each. If the CI value and the local value differ, **CI's value is used** and the difference is recorded in the PR description (K1).
- [ ] **Step 3:** Write down the two final values (to the precision the report prints, two decimals) and where each came from. Do not edit any file yet.

### Task 6: The two-row PR

**Files:**

- Modify: `docs/architecture/PERFORMANCE.md` (two rows)

- [ ] **Step 1:** Create `chore/coverage-baselines-react-vue` `--no-track` from `origin/develop`. In the Coverage table only, change `react` and `vue` to the Task 5 values. Add no sentence elsewhere in the file unless the existing table note already describes these rows; if it does, change only that sentence and say so in the PR.
- [ ] **Step 2: Check the diff is exactly what Spec R4 allows.**
  - `git diff --stat` shows one file, `docs/architecture/PERFORMANCE.md`;
  - `git diff -U0` shows only the two rows (plus the one sentence, if the note had to change);
  - `git diff --name-only origin/develop...HEAD` is that one file.
- [ ] **Step 3:** Run Prettier on the file. Run, with fresh local reports from `npx vitest run --coverage` in the two packages, `node scripts/provenance/validate-coverage.mjs --base-ref origin/develop`. Expected for `react` and `vue`: `OK (baseline-only, integrity check: <value>% matches fresh measurement)`. Other packages may fail locally for the known local reasons (`ai` has no report here); that is not part of this check, and CI is the judge (Step 5).
- [ ] **Step 4:** Commit `docs(perf): re-baseline React and Vue line coverage under ADR-060 scope`. Push with the hook running and open the PR with: the values, the CI run they came from, the local values and any difference, and the K2 note that the margin before the gate fails is now 2 points below the new baseline.
- [ ] **Step 5: Read the PR's CI run.** "Coverage regression check" passes (the integrity path for exactly `react` and `vue`, the regression path for the others), and `ci` is green. Stop; the merge needs the user's explicit authorization.

### Task 7: Verify on `develop` (AC6)

- [ ] **Step 1:** After the merge, read the push run on `develop`: the advisory job is green, and its Coverage regression check output shows `react` and `vue` passing the regression path against the new baselines.
- [ ] **Step 2:** Re-run Task 2 Step 5's check locally on the merged `develop` to confirm a stale report still fails and a fresh one still passes.

---

## Records PR

### Task 8: GAP-091 and C01 (R6)

**Files:**

- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-091)
- Modify: `docs/architecture/COMPLETION_REGISTER.md` (C01, GAP-091 part only)
- Create: `docs/architecture/research/2026-10-21-coverage-rebaseline-closeout.md`

- [ ] **Step 1:** This task needs the user's explicit authorization when it is reached (tracking documents). Do not start it earlier.
- [ ] **Step 2:** Write the closeout record: what landed (PR numbers, merge commits), the Task 5 values and their sources, AC1–AC7 with run links, and the open items. Update GAP-091: status, evidence, and the resolved condition now met, using the file's existing wording style. Update C01 for GAP-091 only; if C01 stays incomplete for other reasons, say which remain and do not change those.
- [ ] **Step 3:** Prettier on the changed files; open the docs-only PR; stop for the user's merge authorization.

---

## Self-check against the Spec

- **Requirement coverage:** R1 → Tasks 1, 2; R2 → Task 3; R3 → Tasks 1–3; R4 → Task 6; R5 → Tasks 5, 6; R6 → Task 8.
- **Acceptance coverage:** AC1, AC2 → Task 2; AC3 → Task 3; AC4 → Task 4 Step 2; AC4b → Task 3 Step 6 and Task 4 Step 3; AC5 → Task 6 Step 2; AC6 → Task 7; AC7 → every task's final step.
- **Spec §8 decisions applied:** measured-source set is the whole `src` plus config (Task 1); the tolerance is a named constant (Task 1); `coverage:measure` keeps running every package (Task 3); records are a separate docs PR (Task 8).
- **Hands off:** no task changes what a package measures, a threshold, a tolerance, or another baseline row.

## Plan Review record

Not yet reviewed.
