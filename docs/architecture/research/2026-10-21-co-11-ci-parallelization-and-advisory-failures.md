# CO-11 (parallel `ci`) — fresh timings, and the advisory-job failures (2026-10-21)

**Status:** Research note. It records evidence only. It changes no workflow, script, setting or GAP status. CO-11 stays research-only, as decided (ADR-070); nothing here authorizes implementing it.

**Inputs:** `2026-10-20-ci-cd-optimization-research.md` §7 (A3 / CO-11), which asked to revisit CO-11 "with fresh timings" after the earlier stages; `gh run list` / `gh run view` data for `ci.yml`, 60 runs from 2026-10-16 to 2026-10-20 (the 25 most recent were inspected job by job).

## 1. Fresh timings for the required `ci` job [V]

- Full runs (job time above 4 minutes, 19 of 24 inspected): median **8.5 min**. The most recent full run (push to `develop`, run 39481003500) took **9.9 min**.
- The required `ci` job failed in **0 of 24** inspected runs.
- Longest steps in run 39481003500:

| Step                         | Seconds |
| ---------------------------- | ------- |
| Test                         | 165     |
| CodeQL analyze               | 97      |
| Build                        | 64      |
| Pack/install integrity       | 56      |
| Format check                 | 41      |
| Validate generated artifacts | 31      |
| Typecheck                    | 29      |
| Installed-package smoke      | 23      |

## 2. What CO-11 would buy [E]

- Splitting `ci` into parallel jobs behind an aggregator named `ci` puts setup + Build + Test on the critical path: about **4–5 min** against the measured 8.5 min. The saving is about **4 min** per full run. The research §7 estimate (6–9 → 4–5 min) holds up against the measurements.
- Cost: every job repeats checkout, install and (for most) Build, adding about 5 runner-minutes per run.
- Risk: the aggregator must fail on `skipped` or `cancelled` needs unless the classifier skipped them on purpose. ADR-069 forbids job-level conditions on the required job. A mistake here can let a failing PR pass the required check.
- The Browser workflow is now **10.5 min** (was 25) after sharding (ADR-071), so `ci` at 8.5 min is no longer the longest check on a full run. The time-to-green gain from CO-11 is therefore smaller than the 4 min above.

## 3. The advisory jobs fail on every run [V]

- Across the inspected runs, `ci-extended` ("Baselines (advisory)") failed in **10 of 10 full runs** and `Baselines` in **11 of 14** (the 3 passing runs were on `docs/*` closeout branches and were probably docs-only, where the steps are skipped; not verified per run). Every failure names the same two steps: **Bundle-size regression check** and **Provenance validation**.
- Both are documented, known failures (the `ci.yml` comment above the job, and GAP-094). Neither is new, and neither comes from the CI/CD optimization work or the sharding.
  - **Provenance validation:** GAP-094. Production manifest entries are missing (the register counts 645 remaining after the W1 Toolbar batch). Failing since the first remote CI run (2026-10-04). Resolution is the evidence-based backfill batches under the GAP-094 Specification.
  - **Bundle-size regression check:** `component-metadata` exceeds its `PERFORMANCE.md` baseline (165.0 KB `dist`, 7.93 KB `index.mjs` gzip). The failing step log could not be downloaded (log download is blocked), so the exact figures were not re-read; this follows the comment in `ci.yml`.
- Effect: the `CI` workflow result is red on most runs while the required `ci` check is green. A reader who looks at the workflow badge sees failure; a reader who looks at branch protection sees none. The advisory job is not a required check (ADR-068), so nothing is blocked.

## 4. Conclusions

- CO-11 saves about 4 min of a 8.5 min job, costs extra runner-minutes, and touches the one job whose correctness matters most. With the Browser workflow now shorter than before, the case is weaker than when A3 was written. **Recommendation: keep CO-11 research-only.** Re-measure only if `ci` time grows well past 10 min.
- The always-red advisory jobs are a separate problem from CO-11. They are tracked (GAP-094 for provenance) but the bundle-size failure has no GAP found in this search. Whether to register one, rebaseline `component-metadata`, or change the advisory job's reporting is the user's decision.

## 5. Open questions for the user

1. Keep CO-11 research-only (recommended)?
2. Register a GAP for the `component-metadata` bundle-size failure, or accept a new baseline in `PERFORMANCE.md`?
3. Should the advisory job's red result be made less misleading (for example `continue-on-error`, or a documented note), or is it fine as it is?
