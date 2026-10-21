# Provenance ratchet (ADR-072) — closeout record (2026-10-21)

**Status:** Closeout record for the provenance ratchet in the advisory CI job (ADR-072; Plan `2026-10-21-provenance-ratchet-advisory-job.md`, Tasks 1–5). It records evidence only. It changes no workflow, script, setting or GAP status. GAP-094 stays OPEN.

**Records:** ADR-072 (accepted); Spec `docs/superpowers/specs/2026-10-21-provenance-ratchet-advisory-job-design.md` (revision 4, approved); Plan `docs/superpowers/plans/2026-10-21-provenance-ratchet-advisory-job.md` (revision 2, approved); input `2026-10-21-co-11-ci-parallelization-and-advisory-failures.md`.

## 1. What landed

- [PR #54](https://github.com/majedsiefalnasr/ultimate-packages/pull/54), head `03c622f2`, merged with the user's authorization as merge commit `a5195a6b` into `develop`. The merge used `--match-head-commit`, so the merged commit is the one the checks ran on.
- One branch carried the docs and the implementation (user decision, 2026-10-21):
  - `scripts/provenance/known-missing.mjs`: list validation and comparison;
  - `validate-provenance.mjs --known-missing <path>`: the ratchet (R2);
  - `docs/architecture/provenance/known-missing.json`: 645 entries, ng 164, react 216, vue 265 (R1);
  - `ci.yml`: the advisory job passes the flag, and its step name and `if:` are unchanged (R3);
  - classifier snapshots for the new files, and the GAP-094 records (R5).

## 2. Local verification (before push, Node 24.15.0)

- `known-missing` unit tests 15/15; `pnpm run test:scripts` 352/352; Prettier, ESLint and actionlint clean.
- Without the flag, the validator's output was byte-identical to the output before the change (659 lines, exit 1).
- The pre-push hook (build, typecheck, test) passed. An earlier attempt failed only because the session's file sandbox could not write `~/.npm`; the hook was never skipped.

## 3. Acceptance criteria

| ID  | Evidence                                                                                                                                                                                                                                      | Result |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| AC1 | With the flag, exit 0 and `known-missing: 645 remaining` (local). The exact CI command passed the diff check too.                                                                                                                             | Met    |
| AC2 | A scratch list missing one line exits 1 and names `packages/vue/src/accordion/BaseAccordion.ts` (local, real tree), and a unit test covers it.                                                                                                | Met    |
| AC3 | A scratch list with one extra, non-missing line exits 1 and says to remove it (local, real tree), and a unit test covers it.                                                                                                                  | Met    |
| AC4 | Without the flag the validator exits 1 on the 645 missing entries, as before (local, and a unit test).                                                                                                                                        | Met    |
| AC5 | PR #54: CI [39565891264](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39565891264). Push at `a5195a6b`: CI [39567359344](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39567359344). Both are in §4. | Met    |
| AC6 | The list was generated from the validator's own output, and the ratchet run on it passes only when it equals the missing set, so its 645 count is proven (local).                                                                             | Met    |
| AC7 | `ci` passed on both runs, including "Provenance scripts self-tests".                                                                                                                                                                          | Met    |

## 4. Real GitHub runs (AC5)

| Run                                        | `ci` | Provenance validation | Bundle-size regression check | Coverage regression check |
| ------------------------------------------ | ---- | --------------------- | ---------------------------- | ------------------------- |
| PR #54 (39565891264)                       | pass | **pass**              | fail                         | pass                      |
| Push to `develop` `a5195a6b` (39567359344) | pass | **pass**              | fail                         | pass                      |

- Before the change, the advisory job failed in 10 of 10 full runs on the same two steps. It now fails on **one** step, Bundle-size, on both runs.
- The Browser runs passed: PR run [39565891490](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39565891490) and push run [39567359318](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39567359318), seven track-a jobs and three SSR jobs each. The longest track-a job on the PR run was 10.1 min.
- The `CI` workflow is still red on `develop`, because of Bundle-size alone. AC5 required Provenance to be green, not the whole job.

## 5. Open items

- **Bundle-size regression check (not fixed here).** `component-metadata` measures 10.03 KB gzip (Node 24.15.0, clean build at `a5195a6b`) against a recorded 7.93 KB, +26.5%. The records' source grew after the Table, Scroller and Paginator public-API facts were recorded on 2026-10-18 (`table.ts` about 25 KB to about 42 KB).
  - A baseline-only PR that changes only that row does **not** make the gate pass. Nine other rows are stale and fail the integrity check: `component-schema`, `mcp`, `ng-core`, `ng` (202.86 KB recorded, 65.83 KB measured), `react-core`, `react`, `uix-styled`, `vue-core` and `vue`. `validate-bundle-size.mjs` has no "only changed rows" rule.
  - ADR-066 decided that rule for R7 coverage. For R6 bundle size it is still **Proposed**, pending the user's confirmation. Implementing it needs ADR-066's R6 part accepted, then a Spec and a Plan.
  - The measured row update is committed locally as `7ce9ac89` on `chore/component-metadata-size-baseline-parked`. It is not pushed and not part of any PR.
- **GAP-094** stays OPEN. Its resolved condition is the empty list plus `provenance:validate` exiting 0 without the flag.
- **Not started:** CO-11 (research only); Phase 2; deferred S1–S7.
