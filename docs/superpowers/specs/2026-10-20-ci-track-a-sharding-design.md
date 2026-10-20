# Track-a Sharding (CO-8) — Design

**Date:** 2026-10-20
**Status:** APPROVED — Spec Review passed (user, 2026-10-20), revision 2 (SR-1 to SR-4 applied, §8). Nothing in it is authorized for implementation until Plan Review passes and implementation is authorized. Nothing in it is authorized for implementation.

- The user approved CO-8 on 2026-10-20, after the CO-8 trigger fired: split the Angular and Vue Playwright jobs into three parallel jobs each.
- ADR-071 records the decision. This work is separate from the completed CI/CD optimization stages (ADR-070).

**Inputs, not guarantees:** research `docs/architecture/research/2026-10-20-ci-cd-optimization-research.md` §7 (A2b) and the R11 measurement in `docs/architecture/research/2026-10-20-ci-cd-optimization-stage-3-closeout.md` §4. Every time in this Spec is an estimate until a real run measures it.

**Evidence baseline:** `develop` = `af6a3d28`. Step times are from the Stage 3 push run, Browser [39422318507](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39422318507).

## 1. Problem

The longest Browser job sets how long a PR waits for its last check:

| Job           | Time     | What runs in it                                                            |
| ------------- | -------- | -------------------------------------------------------------------------- |
| track-a ng    | 24.6 min | about 95 s of setup and build, then seven Playwright invocations in series |
| track-a vue   | 22.4 min | the same shape                                                             |
| track-a react | 5.5 min  | two invocations                                                            |

Each invocation is an independent suite (the strict suite, or one GAP-064 tranche with its own validator), so the series can run in parallel jobs without changing any test.

## 2. Measured inputs (Stage 3 push run)

Step durations, including each invocation's server startup:

| Step                                                                     | ng     | vue     |
| ------------------------------------------------------------------------ | ------ | ------- |
| Setup through build (container, checkout, Node, removal, install, build) | ≈ 95 s | ≈ 100 s |
| Strict suite (`Run Playwright projects`)                                 | 329 s  | 285 s   |
| G3-A                                                                     | 198 s  | 201 s   |
| G3-B                                                                     | 172 s  | 154 s   |
| G3-C1                                                                    | 137 s  | 116 s   |
| G3-C2                                                                    | 144 s  | 114 s   |
| G3-D                                                                     | 208 s  | 199 s   |
| G3-E                                                                     | 184 s  | 166 s   |

## 3. Scope

**Non-goals:**

- any test, spec file, validator, baseline, snapshot or Playwright project;
- the strict suite's `--grep-invert` and the tranche commands;
- any step name;
- the SSR jobs, `ci.yml`, `release.yml`, `perf-stage1.yml`;
- triggers, concurrency, branch protection;
- the classifier's `scope` and `frameworks` outputs;
- the react job's contents;
- Phase 2 and deferred S1–S7.

**Anti-goals:** the work fails if any of these happen, even when CI is green:

- a tranche step, the strict suite, the accessibility baseline validation or W1 runs zero times or more than once for a framework in one run;
- a tranche's verification specs and its differential validator run in different shards;
- the job count or shard assignment is decided outside the tested classifier;
- an existing step name changes.

## 4. Requirements

### R1 — Shard assignment

| Shard | ng and vue                                                                 | react                                            |
| ----- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| 1     | strict suite with its accessibility baseline validation and uploads; G3-C2 | strict suite with its validation and uploads; W1 |
| 2     | G3-A; G3-D                                                                 | —                                                |
| 3     | G3-B; G3-C1; G3-E                                                          | —                                                |

- **Rationale:** this balances the measured step times. Estimated shard work for ng is about 473, 406 and 493 s; for vue about 399, 400 and 436 s; each shard also pays the ≈ 95–100 s of setup.
- **Estimated outcome:** the longest track-a job takes about 10 min, against 24.6 min measured, at about +6 to +7 runner-minutes per full run. These are estimates only.
- A tranche's run, validation and upload steps always share a shard (anti-goal 2).

### R2 — Classifier output `track_a`

- `classify-changes.mjs` exports `TRACK_A_SHARDS = { ng: 3, react: 1, vue: 3 }` and `trackAMatrix(frameworks) → { include: [{ framework, shard }, …] }`. Entries are in framework order, then shard order.
- The CLI writes one more output line, `track_a=<JSON>`, built with `JSON.stringify`.
  - It is derived from the final `frameworks`, so every fail-safe case (push, error, unknown path) yields all seven entries.
  - `frameworks=[]` yields `{"include":[]}`.
- `formatOutput` gains the line. The existing `scope` and `frameworks` lines are unchanged.

### R3 — `browser.yml`

- **`changes` job:** exposes `track_a: ${{ steps.classify.outputs.track_a }}`.
- **track-a job:**
  - `strategy.matrix: ${{ fromJSON(needs.changes.outputs.track_a) }}`, with `strategy.fail-fast: false` kept, so a failing shard never cancels its sibling shards or the other frameworks' jobs (SR-1);
  - the job-level `if: needs.changes.outputs.frameworks != '[]'` stays;
  - name, timeout, env, container, setup, removal and build steps are unchanged.
- **Step conditions:** each existing condition gains a shard clause, and nothing else changes:
  - strict suite (`Run Playwright projects`): `if: ${{ matrix.shard == 1 }}`, keeping today's default-success semantics;
  - `Accessibility baseline validation`: `if: ${{ matrix.shard == 1 }}`;
  - its two uploads: `if: ${{ always() && matrix.shard == 1 }}`;
  - each G3 run, validation and upload step: `&& matrix.shard == <R1 shard>` added to its existing condition;
  - W1: `&& matrix.shard == 1`.
- **Step order:** every step keeps its current position in the job. Only `if:` conditions and the one artifact name change. Each invocation writes its accessibility envelopes under `test-results/`, which Playwright cleans at the start of the next invocation, so each suite's validation and upload must stay directly after its own run (SR-2).
- **Artifact names:** the tranche HTML report upload is the only step that runs in every shard, so its artifact name becomes `playwright-report-tranches-${{ matrix.framework }}-${{ matrix.shard }}`. Every other artifact name is already unique, because each upload runs in exactly one shard.
- **Check names:** GitHub appends the matrix values, so the checks read `Playwright visual + a11y (ng, 1)` and so on. The required check `ci` is unaffected, because Browser jobs are not required.

### R4 — Records

- ADR-071 (drafted).
- Closeout record after the push run, with measured times against §2.

## 5. Acceptance criteria

| ID  | Criterion                                                                                                                                                                                                                                                                                                                                                                                               | Evidence                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| AC1 | `classify-changes.test.mjs`: `trackAMatrix(["ng","react","vue"])` gives 7 entries `ng 1–3, react 1, vue 1–3`; `["react"]` gives 1; `[]` gives `{"include":[]}`; the CLI writes `track_a=` with the full matrix on a push and on a classifier error. All existing tests pass                                                                                                                             | Local                     |
| AC2 | A static check of `browser.yml`: every run, validation and upload step of the strict suite, W1 and each tranche carries exactly one `matrix.shard ==` clause matching R1; the shard-1 set is complete; `fail-fast: false` is kept; the in-order list of step names is unchanged; `actionlint` clean                                                                                                     | Local script              |
| AC3 | On the Spec PR (changes `browser.yml`, so all frameworks run): 7 track-a jobs `(ng, 1–3)`, `(react, 1)`, `(vue, 1–3)`. Every R1 step succeeds in exactly its shard and is skipped elsewhere. Across each framework's shards, every Playwright count equals the Stage 3 push run (ng 435, 189, 174, 120, 147, 162, 153; vue 396, 207, 174, 123, 138, 162, 162; react 294, 24). Artifact names are unique | Real GitHub run           |
| AC4 | The push run on `develop` after merge: same as AC3, and the closeout records each shard's measured time and the longest Browser job, against §2 and the estimates in R1                                                                                                                                                                                                                                 | Real GitHub run, closeout |

## 6. Risks

- **Runner availability:** seven arm64 container jobs instead of three. The public repository has free runners, but a concurrency limit could queue shards. The AC4 measurement shows it.
- **Duplicate setup:** each shard repeats the ≈ 95–100 s setup and the workspace build. That cost is intended, and it is the runner-minute increase in R1.
- **Evidence reading:** closeouts that cite X-12 step results now read them from three jobs per framework. Step names are unchanged.
- **Missing classifier output:** if the classify step dies before writing outputs, `frameworks` is empty, so the job-level `if:` (`!= '[]'`) is true and `fromJSON('')` fails the job loudly. This is the same failure mode as today's `frameworks` matrix, and never a silent skip (SR-3).
- **Renamed artifact:** `playwright-report-tranches-<fw>` (Stage 1, CO-9) becomes `playwright-report-tranches-<fw>-<shard>`. Earlier closeout records that cite the old name are history and are not rewritten (SR-4).
- **Estimates:** runner timing varies by about a minute between runs. If the measured longest job is not materially shorter, the closeout says so; nothing else is changed in this work.

## 7. Landing

- **Branch:** `research/ci-track-a-sharding`, `--no-track` from `origin/develop` `af6a3d28`. It carries ADR-071, this Spec, the Plan and R2–R3.
- **PRs:** one PR into `develop`; the closeout follows in its own docs-only PR.
- **Authorizations:** implementation, push, PR and each merge need their own authorization, as `AGENTS.md` §3 and §7 require.

## 8. Spec Review record

**Round 1 (in-session, 2026-10-20),** against ADR-071, `AGENTS.md`, the current `browser.yml` and `playwright.config.ts`, and the Stage 3 push run:

| ID   | Finding                                                                                                                                                                                                                                                                                                                                          | Resolution                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| SR-1 | R3 replaced `strategy.matrix` without saying that `fail-fast: false` stays. GitHub's default is `true`, so one failing shard would cancel the other shards and frameworks and lose their evidence                                                                                                                                                | R3 and AC2 require `fail-fast: false`                        |
| SR-2 | The Spec relied on the job's step order without requiring it. The envelopes live under `test-results/`, which Playwright cleans when the next invocation starts (verified in `accessibility-envelope.ts`: `test-results/accessibility/<fw>/<browser>/`), so a validator or upload moved after a later invocation would read an emptied directory | R3 fixes the step order; AC2 compares the in-order step list |
| SR-3 | The failure mode of a missing `track_a` output was unstated                                                                                                                                                                                                                                                                                      | §6 states it: a loud job failure, the same as today          |
| SR-4 | The CO-9 artifact rename was not acknowledged against the Stage 1 records                                                                                                                                                                                                                                                                        | §6 records it; earlier records stay as history               |

Checked and found correct:

- **Shard selection:** R1 covers every existing suite once: the strict suite with its validation, 6 tranches and W1. Each tranche keeps its run, validator and upload together, and the shard map balances the measured §2 times.
- **Fail-safe:** `track_a` derives from the final `frameworks`, so a push, a pull request into `main`, an unknown path or a classifier error gives all seven jobs.
- **Test and validator preservation:** no test command, project, `--grep-invert` or validator changes. Each tranche validator still finds all three browsers' envelopes from its own single invocation.
- **Artifact isolation:** every upload except the tranche-report upload runs in exactly one shard, and that one gains the shard in its name.
- **Unchanged:** the required check `ci` and the SSR jobs.
- **ADR-052 X-12:** the cited steps keep their names; they are read across shard jobs (§6).
