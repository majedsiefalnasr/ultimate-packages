# Coverage: React/Vue Re-baseline and Report Freshness — Design

**Date:** 2026-10-21
**Status:** APPROVED — Spec Review passed (user, 2026-10-21), revision 2. The open questions of §8 are settled with the Spec's own defaults (§8). Nothing in it is authorized for implementation until the Implementation Plan passes Plan Review and implementation is authorized.

- Brainstorming outcome of 2026-10-21. The user chose the scope on 2026-10-21: close GAP-091 by re-baselining React and Vue, **and** fix the local tooling defect in the same Spec, as two PRs in a fixed order.
- It carries out ADR-060's "Re-baselining" rule. It adds no new architectural decision except R1 to R3 below, which change `validate-coverage.mjs` and `coverage:measure`. Those two need the user's decision at Spec Review.

**Inputs, not guarantees:** ADR-060 and ADR-066; GAP-091 in `BLUEPRINT_GAPS.md`; `scripts/provenance/validate-coverage.mjs` and its tests; `docs/architecture/PERFORMANCE.md` (Coverage table); the measurements in §2.

**Evidence baseline:** `develop` = `4605716f`. The push runs `CI` 39580016575 and `Browser` 39580016676 on that commit are green, including the advisory job's Coverage steps.

## 1. Problem

1. **Stale baselines (GAP-091).** `PERFORMANCE.md` records React 89.69% and Vue 92.13%, measured on 2026-09-09. ADR-060's scope (production runtime source under `src/**`, no stories or tests) is already implemented on `develop`. The baselines were never re-measured under it, so GAP-091 stays OPEN and the gate tolerates a drop of about 2 points (React) or 3 points (Vue) before it can notice.
2. **A local tooling defect that produces false numbers.** `pnpm run coverage:measure` is `pnpm -r --if-present run test:coverage`. It stops at the first failing package. On the author's machine that was `ai`, whose `npm pack` test failed for an unrelated reason, so React and Vue were never measured. `validate-coverage.mjs` then read the old `coverage-summary.json` files from September and printed `react: 89.69% -> 8.6%` and `vue: 92.13% -> 11.3%` as if they were real. The validator reads a report from disk and never checks that the report is newer than the code it describes.
   - CI is not affected: it measures from scratch in the same job. The defect is in local use, and in any future setup where a report can outlive the code.

## 2. Measured inputs

Measured on the author's machine (macOS, Node 24.15.0) on `develop` at `a5195a6b`, with `npx vitest run --coverage` in each package (React twice, with an identical result):

| Package | Recorded | Measured now             | Difference   |
| ------- | -------- | ------------------------ | ------------ |
| React   | 89.69%   | **91.65%** (11107/12118) | +1.96 points |
| Vue     | 92.13%   | **95.11%** (15503/16299) | +2.98 points |

- These are local numbers. The gate runs on Linux. GAP-091 recorded that a Linux Docker reproduction matched CI exactly, so a local number is a candidate, not the value of record. §3 R5 makes CI the authority.
- The 8.6% and 11.3% figures came from stale files (git-ignored `coverage/` directories dated September), not from the code.

## 3. Requirements

### R1 — The validator rejects a report older than the code it measures

- For each package, `validate-coverage.mjs` compares the modification time of that package's `coverage-summary.json` with the newest modification time among the package's measured source files. If any measured source file is newer than the report, the package fails with a message that says the report is stale and names the newest file and both times.
- "Measured source files" are the package's own source tree and its `vitest.config.ts` (or `angular.json` for `ng` and `ng-core`). The exact set per package is settled in the Plan from the existing coverage includes. It must not depend on files outside the package.
- A missing report keeps its existing failure.
- The check runs before the integrity or regression comparison, so a stale report never reaches either.
- On a fresh CI checkout all files share one checkout time within a fraction of a second, and the report is written after it. Verified on 2026-10-21: a clone of `develop` had 446 React source files with a modification-time spread of 0.05 s, and a report written afterwards was newer than every one. The Plan must still cover clock skew with a stated tolerance, and the tolerance must be a named constant with a test.

### R2 — `coverage:measure` reports every package, then fails

- `coverage:measure` continues past a package whose coverage run fails, and exits non-zero at the end naming every package that failed. It must not exit 0 if any package failed, and it must not hide a failure.
- **This changes CI too.** The advisory job's "Coverage measurement" step runs exactly `pnpm run coverage:measure`. Today it stops at the first failing package. After R2 it runs every package and fails at the end, so on CI a failing package no longer hides the packages after it. The step's pass or fail result is unchanged: it fails if any package failed. The Plan must show the step name and its `if:` are untouched.
- The command a human or CI runs stays `pnpm run coverage:measure`. The per-package `test:coverage` scripts are unchanged.
- This is a change to a root script and, if a helper script is needed, to `scripts/`. It does not change what any package measures.

### R3 — Tests for R1 and R2

- Unit tests for the freshness decision, using plain inputs (no file system), covering: report newer than all sources, report older than one source, equal times, clock-skew tolerance, and a missing report.
- A real-file test for the CLI in a temporary directory, covering a stale report failing before the comparison and a fresh one passing.
- A test for R2 that runs the measure script over fake packages where one fails, and asserts that the others still ran, the failure is named, and the exit is non-zero.
- Existing `validate-coverage` tests are changed only where R1 requires it (a fixture needs a fresh report).

### R4 — React and Vue baselines (separate PR)

- A second PR, after R1 to R3 have merged, changes **only** `docs/architecture/PERFORMANCE.md`: the `react` and `vue` rows of the Coverage table. Nothing else in the file and no other file.
- The values come from a fresh measurement that passes R1 (so it cannot be stale), taken on Node 24.15.0 after a clean install. Per R5 they are confirmed against CI before the PR is merged.
- Under ADR-060 and ADR-066 this diff takes the baseline-integrity path for exactly those two rows and the regression path for all others.
- The 0.05 tolerance and the 2-point threshold are unchanged.

### R5 — CI is the authority for the numbers

- The values written in R4 are the ones the CI advisory job measures, not the local ones. The Plan obtains them from a CI run (the Coverage measurement step's printed table, or a throwaway PR whose only purpose is to print the measured value). If CI and the local run differ, CI wins, and the difference is recorded in the PR.
- The PR passes only if its own CI run's integrity check passes.

### R6 — Records

- After the R4 PR merges and a push run on `develop` is green with the new baselines: GAP-091 is updated (status, evidence, the resolved condition met) and C01 in `COMPLETION_REGISTER.md` is updated for GAP-091 only. Both are tracking documents and need the user's authorization at that point. C01 may stay incomplete for other reasons, and this Spec does not decide that.
- ADR-060 gets no text change. The Spec and a closeout record carry the evidence.

## 4. Scope

**Non-goals:**

- Any change to what a package measures: coverage includes, excludes, `all`, thresholds, and the 2-point and 0.05 rules.
- Re-baselining any package other than React and Vue.
- The other advisory steps, `ci.yml` and `browser.yml`.
- Fixing the unrelated `ai` packaging test (it failed locally only because the author's `~/.npm` is not writable from the session).

**Anti-goals:** the work fails if any of these happen, even when CI is green:

- A stale report passes the gate.
- A package that failed to measure is reported as measured.
- A baseline is written that CI does not reproduce.
- The R4 PR contains anything but the two rows.
- `coverage:measure` exits 0 when any package failed.

## 5. Acceptance criteria

| ID   | Criterion                                                                                                                                     | Evidence                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| AC1  | With a report older than one source file, `validate-coverage.mjs` fails that package with a stale-report message and does not compare numbers | Unit and CLI tests                  |
| AC2  | With the real September `coverage-summary.json` files present, the validator fails React and Vue as stale, not as 8.6% and 11.3%              | Local run before `coverage:measure` |
| AC3  | `coverage:measure` runs every package even when one fails, then exits non-zero naming each failed package                                     | Script test and a local run         |
| AC4  | On CI the validator passes with fresh reports (no false staleness from checkout time)                                                         | Real GitHub run of the R1 PR        |
| AC4b | On CI, "Coverage measurement" still fails when a package fails and passes when all pass                                                       | Script test and the R1 PR's run     |
| AC5  | The R4 PR's diff is exactly two table rows in `PERFORMANCE.md`, with values that CI reproduced                                                | `git diff --stat`, CI log           |
| AC6  | After the R4 PR, a push run on `develop` is green and the React and Vue coverage rows pass the regression path against the new baselines      | Real GitHub run                     |
| AC7  | `pnpm run test:scripts`, Prettier, ESLint and `actionlint` stay clean                                                                         | Command output                      |

## 6. Risks

| ID  | Risk                                                                                                          | Mitigation                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1  | Local and CI numbers differ (macOS against Linux).                                                            | R5: CI is the authority. A mismatch fails the integrity check on the PR and is fixed by writing CI's value. Nothing is merged on a local number alone. |
| K2  | A higher baseline narrows the margin: a later PR that lowers coverage by more than 2 points now fails sooner. | This is the intended effect of an accurate baseline. It is recorded so reviewers expect it. No threshold change.                                       |
| K3  | The freshness check fails on a healthy CI checkout because of modification-time ordering.                     | Measured 2026-10-21 (0.05 s spread). R1 adds a tolerance as a named, tested constant, and AC4 checks it on a real run before the check is relied on.   |
| K4  | Source files are touched after the report is produced for a harmless reason, and the check fails.             | The failure message names the file and the fix (re-run `coverage:measure`). It never silently passes. A false fail is cheaper than a false pass.       |
| K5  | `ng` and `ng-core` write their reports one directory deeper and measure a different source tree.              | The Plan lists the measured sources per package and tests the `ng` shape explicitly (R1, R3).                                                          |
| K6  | R2 continues past failures and the final exit hides one in a long log.                                        | R2 prints one summary block of failed packages at the end and exits non-zero. A test asserts it.                                                       |

## 7. Landing

1. Spec Review, then a Plan, then Plan Review, each separately authorized.
2. **PR 1:** R1 to R3 (validator, `coverage:measure`, tests). It changes code, so it takes the regression path for every row.
3. **PR 2:** R4 and R5, after PR 1 is merged. It is `PERFORMANCE.md` only.
4. **Records:** R6, after a green push run on `develop` with the new baselines, with the user's authorization.

PR 1 first, because PR 2's measurement must go through the freshness check, and because ADR-060 forbids a baseline from landing in the same PR as a change to how coverage is judged.

## 8. Decisions at Spec Review (user, 2026-10-21)

The user approved the Spec without changing the proposals below, so they stand as decisions:

1. **Measured-source set (R1):** the package's whole source tree and its config file, not only the files the coverage `include` selects. Simpler and slightly stricter. The Plan lists the exact paths per package, including `ng` and `ng-core`.
2. **Clock-skew tolerance (R1):** a small fixed number of seconds, set in the Plan as a named constant with a test. It is not a free parameter: AC4 checks it on a real CI run.
3. **`coverage:measure` (R2):** it keeps running all packages, as today, and now reports every failure at the end instead of stopping at the first.
4. **Records (R6):** GAP-091 and C01 are updated in a separate docs PR after the green push run on `develop` with the new baselines, not in the baselines PR.

No question is left open for the Plan except the exact file lists and the tolerance value.
