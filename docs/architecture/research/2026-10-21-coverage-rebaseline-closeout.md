# Coverage report freshness and the React/Vue re-baseline (GAP-091) — closeout record (2026-10-21)

**Status:** Closeout record for the coverage plan (Spec `2026-10-21-coverage-baselines-and-report-freshness-design.md`, revision 2; Plan `2026-10-21-coverage-baselines-and-report-freshness.md`, revision 3). It records evidence. It changes GAP-091 and the GAP-091 part of C01 (user authorization for Task 8, 2026-10-21); it changes no workflow, script, threshold or other baseline row.

**Records:** ADR-060 (React and Vue R7 line coverage measures production runtime source; the scope was already implemented in PR #16 at `bdc4dbcf`); ADR-066 (integrity applies only to rows the diff changes).

## 1. What landed (all on `develop`, each merged with `--match-head-commit`)

| PR  | Head       | Merge commit | Content                                                                                                                                                                                                                                                                                               |
| --- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #58 | `e0846061` | `53878122`   | Spec (revision 2) and Plan (revision 3), docs only.                                                                                                                                                                                                                                                   |
| #59 | `08353dea` | `56051598`   | `validate-coverage.mjs` rejects a report older than the code it measures (`FRESHNESS_TOLERANCE_SECONDS = 2`, `measuredSourceRoots`, `evaluateReportFreshness`, `collectSourceMtimes`); `coverage:measure` is `pnpm -r --no-bail --if-present run test:coverage`; tests; classifier list and snapshot. |
| #60 | `dff50772` | `655e252a`   | The CI workflow is named `Quality gate`. The job key and name stay `ci`, the required check on `develop` (ADR-068; ADR-070, CO-10).                                                                                                                                                                   |
| #61 | `00be7493` | `f5834c05`   | `docs/architecture/PERFORMANCE.md` Coverage table only: react 89.69 → 91.65, vue 92.13 → 95.11 (2 insertions, 2 deletions).                                                                                                                                                                           |

## 2. The numbers and their source (R5)

A throwaway branch `spike/coverage-numbers` (run [39599816154](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39599816154), deleted from the remote and locally afterwards) ran the advisory job's setup and wrote the values as notice annotations, read through the check-runs API (job logs cannot be downloaded in this environment):

| Package | `pct` | covered / total |
| ------- | ----- | --------------- |
| react   | 91.65 | 11107 / 12118   |
| vue     | 95.11 | 15503 / 16299   |

The local `npx vitest run --coverage` values are identical, so CI's value and the local value agree (K1 not needed).

## 3. Acceptance criteria

| ID   | Evidence                                                                                                                                                                                                                                                                                                                                             | Result |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| AC1  | Unit tests for the decision and CLI tests: a report older than a source file fails as stale and prints no percentage.                                                                                                                                                                                                                                | Met    |
| AC2  | With the React and Vue reports backdated to 2026-09-09, the validator printed `react: coverage report is stale ...` and `vue: ...` and no percentage. With fresh reports it printed `react: OK (89.69% -> 91.7%, +2.0 points)` and `vue: OK (92.13% -> 95.1%, +3.0 points)` (local).                                                                 | Met    |
| AC3  | `coverage-measure.test.mjs` runs the real script from `package.json` in a temporary pnpm workspace: with packages a (ok), b (fails), c (ok) it runs c and exits non-zero naming b. The test fails against the old script (after its vacuous first version was fixed) and passes now.                                                                 | Met    |
| AC4  | PR #59 CI run [39592914188](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39592914188): the advisory job's "Coverage measurement" and "Coverage regression check" both succeeded, so no package was reported stale on a fresh checkout.                                                                                          | Met    |
| AC4b | "Coverage measurement" succeeded on CI with `--no-bail` (same run); the failure path is covered by the script test (AC3).                                                                                                                                                                                                                            | Met    |
| AC5  | PR #61: `git diff --stat` is 1 file, 2 insertions, 2 deletions; the values are the CI-measured ones (§2). Locally `validate-coverage` took the baseline-only integrity path: `react: OK (baseline-only, integrity check: 91.65% matches fresh measurement)`, same for vue 95.11%.                                                                    | Met    |
| AC6  | Push run on `develop` at `f5834c05`: Quality gate [39604028937](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39604028937) and Browser [39604028812](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39604028812) both succeeded; the advisory job's Bundle-size, Coverage and Provenance steps all succeeded. | Met    |
| AC7  | `pnpm run test:scripts` 396/396 on PR #59 (377/377 on the PR #60 branch, which was cut before #59 merged); Prettier, ESLint and `actionlint` clean; the pre-push hook ran on every push.                                                                                                                                                             | Met    |

## 4. Other runs

- PR #59: the CI workflow (named `CI` then) run [39592914188](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39592914188) green (nine Browser jobs ran: `package.json` makes the classifier scope `full`).
- PR #60: `ci` passed and appeared under its own name; the required check on `develop` is still `["ci"]`.
- Push at `655e252a` (#60): Quality gate [39599203171](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39599203171) and Browser [39599203099](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39599203099) green.

## 5. Open items

- **`main` does not have this yet.** The fix and the new baselines are on `develop`. `main` receives them with the next `develop` → `main` merge. GAP-091's status says so.
- **Local-only artefacts, not defects of this work:** locally the `ai` package cannot run `npm pack` under the session's file sandbox, and `themes` kept old reports; the validator now names both. CI measures from scratch and is unaffected.
- **Other mentions of GAP-091 left as they are:** the gate-status line in `BLUEPRINT_GAPS.md` ("RESOLVED as wiring; not green in CI", written 2026-10-07) and the GAP-031/032/033 correction note still describe the gate as failing on stories. They are separate entries; whether to reword them is the user's call.
- **C01 stays incomplete** for reasons outside GAP-091 (see the register); no CI failure is excepted.
- **Unchanged and still open:** AC2.9 of the CI-optimization plan (waits for a real tooling-only PR), CO-11 (research-only), PR #37 (superseded, closing it needs permission), the parked local branches.
