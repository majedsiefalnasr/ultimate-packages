# Track-a sharding (CO-8) — closeout record (2026-10-20)

**Status:** Closeout record for the track-a sharding work (ADR-071; Plan Tasks 1–4). It records evidence and, at the user's request, carries the four final-review minors (§5): comment, log-line and test-name changes to the classifier and a comment change to `browser.yml`. It changes no CI behaviour, setting or GAP status. AC1–AC4 are met.

**Records:** ADR-071; Spec `docs/superpowers/specs/2026-10-20-ci-track-a-sharding-design.md` (revision 2, approved); Plan `docs/superpowers/plans/2026-10-20-ci-track-a-sharding.md` (revision 2, approved); inputs from `2026-10-20-ci-cd-optimization-research.md` §7 and `2026-10-20-ci-cd-optimization-stage-3-closeout.md` §4.

## 1. What landed

- [PR #52](https://github.com/majedsiefalnasr/ultimate-packages/pull/52), head `81f7d564`, merged with the user's authorization as merge commit `db040cac` into `develop`. The required `ci` check was successful on `81f7d564` at merge time.
- Branch commits:
  - `ee996d5b`: the classifier emits the `track_a` matrix (`TRACK_A_SHARDS = { ng: 3, react: 1, vue: 3 }`, `trackAMatrix`), derived from the final framework selection (R2);
  - `de1a35c3`: `browser.yml` uses that matrix. Each suite's existing steps gained one `matrix.shard` clause, and the tranche-report artifact name gained the shard. Step order, step names and `fail-fast: false` are unchanged (R1, R3);
  - `c5e1ab83`: ADR-071, the Spec and the Plan;
  - `81f7d564`: final-review fix — `trackAMatrix` throws for a framework without a shard count instead of silently dropping its job.

## 2. Local verification (before push)

- Tests written first and watched failing: `classify-changes.test.mjs` 41/41; `test:scripts` 329/329.
- The scripted shard check failed before the workflow edit and passed after it. It covers:
  - one correct shard clause per suite step;
  - `fail-fast: false` kept;
  - the job-level `if:` unchanged;
  - the tranche-report artifact name;
  - the in-order step list unchanged.
- `actionlint`, Prettier and lint clean; the pre-push hook passed on Node 24.15.0.
- Final whole-branch review by a fresh reviewer: 0 Critical, 0 Important, 5 Minor.
  - One Minor was re-graded to Important and fixed test-first: an unknown framework silently dropped its job, which would be a silent narrowing.
  - Four were deferred, then resolved in the closeout PR at the user's request (§5).

## 3. Acceptance criteria

| Criterion | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Result  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| AC1       | The classifier tests: the seven-entry matrix in framework and shard order with numeric shards; `["react"]` → one entry; `[]` → `{"include":[]}`; the CLI writes the full matrix on a push, on an unresolvable base ref and when closures cannot be derived; an unknown framework throws                                                                                                                                                                                                                                                                                   | **Met** |
| AC2       | The shard check script on the merged workflow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | **Met** |
| AC3       | PR #52: Browser [39436171461](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39436171461), CI [39436174633](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39436174633). Seven track-a jobs `(ng, 1–3)`, `(react, 1)`, `(vue, 1–3)`, all successful. For each framework, every suite step succeeded in exactly its shard and was skipped in the others. Playwright counts equal the Stage 3 push run. 28 artifacts, no duplicates. `ci` differs from the previous push run only in `test:scripts` (326 → 329 passed, the new tests) | **Met** |
| AC4       | Push on `develop` at `db040cac`: Browser [39468266064](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39468266064), CI [39468266286](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39468266286). The same checks as AC3, all met; `ci` successful; the advisory Baselines job red only in Bundle-size regression check and Provenance validation, as before. Measurements in §4                                                                                                                                                    | **Met** |

## 4. Measured against the inputs and estimates

Push runs, job times from the jobs API:

| Track-a job | Before (Stage 3 push, 39422318507) | After (push, 39468266064)                      |
| ----------- | ---------------------------------- | ---------------------------------------------- |
| ng          | 24.6 min                           | shard 1 9.4, shard 2 8.5, shard 3 **10.1** min |
| vue         | 22.4 min                           | shard 1 7.4, shard 2 7.8, shard 3 8.4 min      |
| react       | 5.5 min                            | 5.6 min                                        |

- **Longest Browser job:** 24.6 → **10.1 min** (estimate: about 10 min).
- **Browser workflow wall time** (run start to finish): 25.0 → **10.5 min**.
- **Track-a runner time:** 52.5 → 57.2 min, **+4.7 runner-minutes** per full run (estimate: +6 to +7).
- **Test counts:** every Playwright invocation's count is unchanged: ng 435, 189, 174, 120, 147, 162, 153; vue 396, 207, 174, 123, 138, 162, 162; react 294, 24. All passed, none flaky.
- **Shard balance:** ng shard 3 (G3-B, G3-C1, G3-E) is the longest shard, as Spec R1 estimated.
- **Variation:** these are one run each, and GitHub-hosted runner times vary by about a minute between runs of the same commit. The PR run gave the same picture: longest shard 10.2 min.

The critical path was materially shortened: the last Browser check on a full run now arrives in about 10.5 minutes instead of 25.

## 5. Open items

- **Final-review minors:** at the user's request (2026-10-20), the four deferred minors are resolved in this closeout PR (#53):
  - `classify-changes.mjs`'s Usage header documents the `track_a` output;
  - the CLI's log line prints `track_a` (a test that failed first pins it);
  - the `formatOutput` test name covers the `track_a` line;
  - `browser.yml`'s header gives the measured duration (about 10 minutes for a full run's longest job) instead of 22–26 minutes.
- **Not started:** CO-11 (research only); Phase 2; deferred S1–S7.
