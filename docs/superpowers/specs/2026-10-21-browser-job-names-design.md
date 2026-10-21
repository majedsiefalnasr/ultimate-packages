# Browser track-a Job Names — Design

**Date:** 2026-10-21
**Status:** DRAFT (revision 1). Not reviewed. Nothing in it is authorized for implementation until Spec Review passes, an Implementation Plan exists and passes Plan Review, and implementation is authorized.

- The user asked on 2026-10-21 why the sharded Browser jobs read `Playwright visual + a11y (ng, 1)` and why the names do not say what each job does. This Spec answers with a naming change. It amends ADR-071's "Check names" line, so it needs the user's decision on that amendment.
- It changes display names only. No test, step, validator, baseline, trigger or required check changes.

**Evidence baseline:** `develop` = `a5195a6b`. On PR #54 the Browser run [39565891490](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39565891490) showed the ten checks `Playwright visual + a11y (ng, 1)` to `(vue, 3)`, `(react, 1)` and `SSR hydration (…)`.

## 1. Problem

- A track-a job's check name is `Playwright visual + a11y` plus the matrix values GitHub appends: `(ng, 1)`, `(ng, 2)`, `(ng, 3)`, and the same for vue. The number is a shard index. It does not say which suites run, so a reader of the PR checks list cannot tell what failed without opening the job.
- The suites per shard are fixed by ADR-071 (Spec R1 of the sharding Spec): shard 1 runs the strict suite and G3-C2, shard 2 runs G3-A and G3-D, shard 3 runs G3-B, G3-C1 and G3-E. React is one job: the strict suite and W1.

## 2. Scope

**Non-goals:**

- Any change to what runs in a shard, to the shard counts, or to the shard map.
- Step names, artifact names, the SSR jobs, `ci.yml`, `release.yml`, triggers, concurrency, branch protection.
- The skipped job's name when no framework changes (`Playwright visual + a11y`, as AC1.3 (b) of the CI/CD optimization records it).

**Anti-goals:** the work fails if any of these happen, even when CI is green:

- A job name says something that is not true of what the job runs.
- A name can drift from the shard map without a test failing.
- A shard's tranche steps move or change names.

## 3. Requirements

### R1 — Labels from one source

- The classifier's `track_a` matrix gains a `label` field on every include entry, produced next to the shard counts. The shard map and the labels live together in one place, so they change together.
- A label names the framework and the work of that shard, for example `Angular · strict suite + G3-C2`. The exact wording and separator are settled in the Plan; it must stay readable when GitHub truncates long check names.
- `shard` stays a number, as ADR-071 and the existing tests require.

### R2 — `browser.yml`

- The track-a job's `name:` uses the label: `name: ${{ matrix.label }}`, or the fixed prefix and the label. It must not append `(framework, shard)` any more.
- Every step keeps its name, its position and its `matrix.shard` condition. The tranche artifact name keeps `${{ matrix.framework }}-${{ matrix.shard }}`.
- The job's `if:` and the `fromJSON` matrix are unchanged, so `frameworks=[]` still skips the job as one.
- **The skipped job must keep the bare name `Playwright visual + a11y`** (AC1.3 (b) of the CI/CD optimization). A `name:` that contains a matrix expression is not expanded when the job is skipped before the matrix exists, so GitHub may render the raw expression. Whether any `name:` form avoids that is **not known yet**; §7 makes it a spike that must pass before a Plan is written.

### R3 — Tests

- A classifier test asserts every include entry has a non-empty `label`, that labels are unique within a matrix, and that the shard map and the labels agree: every suite named in a label is a step condition `matrix.shard == <that shard>` in `browser.yml`, and no suite is missing from its label.
- The existing exact-output assertions that carry the matrix (`FULL_TRACK_A` and the CLI tests) are updated for the new field and for no other reason.

### R4 — Records

- ADR-071 gets an amendment note under its "Check names" consequence: the names come from the matrix `label`. The sharding Spec's §3 R3 "Check names" line gets a pointer to this Spec. Neither document's other text changes.
- Earlier closeouts that quote the old names (`ng, 1`) are dated evidence and are not rewritten.

## 4. Acceptance criteria

| ID  | Criterion                                                                                                                             | Evidence                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| AC1 | `trackAMatrix(["ng","react","vue"])` returns seven entries, each with a unique non-empty `label` and a numeric `shard`                | Unit test                |
| AC2 | The agreement test in R3 fails when a suite's `if:` shard or a label is edited alone                                                  | Unit test, mutated input |
| AC3 | On a real PR run, the seven track-a checks show the new names, the three SSR checks are unchanged, and no step name or count changed  | Real GitHub run          |
| AC4 | With no browser-relevant change, the skipped job still reads exactly `Playwright visual + a11y` (no raw expression) and `ci` is green | Spike run, then real run |
| AC5 | `actionlint` is clean, and the diff to `browser.yml` is the `name:` line (and nothing in the steps)                                   | Command output and diff  |

## 5. Risks

| ID  | Risk                                                                                                                                                                                                          | Mitigation                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | The check name is longer and GitHub truncates it in the checks list.                                                                                                                                          | Keep the label short; the Plan fixes a length limit and a test enforces it.                                                                                                            |
| K2  | A label disagrees with what the shard runs (a suite moves, the label does not).                                                                                                                               | R3's agreement test reads `browser.yml`; a mismatch fails the classifier tests, which run in `ci`.                                                                                     |
| K3  | Something outside the repository keys on the old names.                                                                                                                                                       | Branch protection requires only `ci` (checked 2026-10-21). Repository text that quotes the names is listed in R4.                                                                      |
| K4  | A `name:` with a matrix expression may render raw (`${{ matrix.label }}`) when the job is skipped, because the matrix is never expanded. The current name has no expression, which is why it renders cleanly. | Spike before the Plan (§7 item 1). If no `name:` form keeps the bare skipped name, this Spec is withdrawn or reduced to a documentation table, not shipped with a worse skipped check. |

## 6. Landing

1. Spec Review, then a Plan, then Plan Review, each separately authorized.
2. One implementation PR from `develop` to `develop`.
3. A closeout record after a real PR run shows AC3 and AC4.

## 7. Open questions for Spec Review

1. **Spike (blocking):** on a throwaway branch, push a change that gives `frameworks=[]` (for example a docs-only file) and read how the skipped track-a check renders under each candidate `name:` form: the matrix expression alone, an expression with a fixed prefix, and an expression with a fallback (`format`/`||`). Also read how a normal run renders. Record the results. Without a form that keeps the bare skipped name, this Spec does not proceed. The spike also records whether GitHub still appends matrix values after an explicit `name:` that uses the matrix, since this Spec's wording depends on it.
2. The label wording: framework and suites (`Angular · strict suite + G3-C2`), or shorter (`Angular 1/3: strict + C2`).
3. Whether the display name should say `Angular` and `Vue` in full, or keep the short `ng` and `vue` that the repository uses elsewhere.
4. Whether the SSR jobs (`SSR hydration (ng)`) get the same treatment. They are one job per framework and already read clearly, so this Spec leaves them alone.
