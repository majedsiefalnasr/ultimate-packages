# CI/CD optimization Stage 3 — closeout record (2026-10-20)

**Status:** Closeout record for Stage 3 of the CI/CD optimization (Plan Tasks 9–10), and for the Spec as a whole (Spec §9.4): every acceptance criterion is met except AC2.9, which is monitoring only. It records evidence only. It changes no workflow, script, setting or GAP status. The CO-8 trigger fired (§4); CO-8 is presented for the user's decision, and nothing is sharded without it.

**Records:** research `2026-10-20-ci-cd-optimization-research.md`; Spec `docs/superpowers/specs/2026-10-20-ci-cd-optimization-design.md` (revision 3 with Amendment A1, approved); Plan `docs/superpowers/plans/2026-10-20-ci-cd-optimization.md` (revision 4, approved); ADR-070; Stage 1 and Stage 2 closeout records.

## 1. What landed

- [PR #50](https://github.com/majedsiefalnasr/ultimate-packages/pull/50), head `4238284e`, merged with the user's authorization as merge commit `5655640c` into `develop`. The required `ci` check was successful on `4238284e` at merge time.
- Branch commits:
  - `dfc059fd`: `playwright.config.ts` reads `TRACK_A_FRAMEWORK`; each track-a job sets it to its matrix framework and starts only that framework's Storybook server, with no SSR harness server (R10);
  - `4238284e`: the Stage 2 closeout record and the Plan status.

## 2. Local verification (before push)

- The AC3.1 check, scripted, failed before the change (every value gave all three Storybook servers and all three SSR servers) and passed after it.
- `actionlint`, Prettier and ESLint clean; `prettier --check .` and `pnpm run lint` pass; the pre-push hook passed on Node 24.15.0.
- Final whole-branch review by a fresh reviewer: 0 Critical, 0 Important, 2 Minor (deferred, §5). The reviewer confirmed that the unset behaviour is byte-identical to the base and that every track-a spec reaches only its own Storybook port.

## 3. Acceptance criteria

| Criterion | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Result                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| AC3.1     | `TRACK_A_FRAMEWORK=vue` → exactly `vue-storybook` (likewise ng, react); unset → unchanged (three Storybook and three SSR servers); `TRACK_E_SSR_FRAMEWORK=vue` alone → unchanged (`vue-ssr-server`); `svelte` throws `TRACK_A_FRAMEWORK must be ng, react or vue, got svelte`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | **Met**                    |
| AC3.2     | PR #50 runs (CI [39406726817](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39406726817), Browser [39406726747](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39406726747)) and the push run on `5655640c` (CI [39422318511](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39422318511), Browser [39422318507](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39422318507)): the vue and react track-a logs contain no `[ng-storybook]` lines (3 454 and 989 before), and the ng log only `[ng-storybook]`. The Vite Storybooks print nothing, so their own servers show only through their tests passing on their ports. Against the Stage 2 push run (Browser 39401845742, CI 39401845798): no job, step or count differs | **Met**                    |
| AC3.3     | §4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Met**                    |
| AC1.3 (b) | This closeout PR (docs-only), §3.1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Met**                    |
| AC2.8     | This closeout PR (docs-only), §3.1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | **Met**                    |
| AC2.9     | No PR that changes only no-closure packages or listed paths has occurred yet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **Monitoring** (Spec §9.4) |

### 3.1 Docs-only evidence from this PR

[PR #51](https://github.com/majedsiefalnasr/ultimate-packages/pull/51) changes only this Markdown record. Its runs on `ebeaee43`: CI [39426098017](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39426098017), Browser [39426097998](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39426097998). Both workflows concluded **success**, the first docs-only PR on which the whole `CI` workflow is green.

- **AC2.8:**
  - Both classifier steps logged `event=pull_request base=origin/develop scope=docs frameworks=[]`.
  - `ci` succeeded in 1m15s, with exactly the 16 ADR-069 gated steps skipped.
  - `Baselines (advisory): size, coverage, provenance` succeeded in 25 s, with exactly its six gated steps skipped (Build, Bundle-size measurement, Bundle-size regression check, Coverage measurement, Coverage regression check, Provenance validation).
  - `Playwright visual + a11y` and `SSR hydration` were each skipped as one job, with no matrix expansion.
- **AC1.3 (b):** the skipped matrix jobs render on the PR as `Playwright visual + a11y` and `SSR hydration`, the bare display names, with no unexpanded matrix expression. This confirms the R4 primary form for skipped rows too.

## 4. R11 measurement and the CO-8 trigger

Push runs, measured with the research §3.2 method (pre-test startup = the step's `##[group]Run npx playwright` timestamp to Playwright's `Running N tests`; job times from the jobs API).

| Track-a job | Research §3.2 (run 39308302789) | Stage 2 push (39401845742) | Stage 3 push (39422318507) | Startup per invocation, before → after |
| ----------- | ------------------------------- | -------------------------- | -------------------------- | -------------------------------------- |
| ng          | 25.7 min                        | 26.1 min                   | **24.6 min**               | 34–35 s → 25–26 s                      |
| vue         | 23.7 min                        | 25.0 min                   | **22.4 min**               | 34–37 s → 4–5 s                        |
| react       | 6.8 min                         | 7.2 min                    | **5.5 min**                | 36–37 s → 4 s                          |

- **Startup removed per job:** ng 242 s → 181 s; vue 243 s → 29 s; react 73 s → 8 s.
- **Test counts:** unchanged in every invocation: ng 435, 189, 174, 120, 147, 162, 153; vue 396, 207, 174, 123, 138, 162, 162; react 294, 24; all passed, none flaky.
- **Against the research estimate (§7, A2a):** vue −2.6 min measured (estimate −2 to −3 min); react −1.7 min (estimate −0.5 to −1 min); ng −1.5 min (estimate ≈ 0: the ng job also stopped starting the two Vite Storybooks and the three SSR servers). Measured on one run each; GitHub-hosted runner times vary by about a minute between runs of the same commit.
- **CO-8 trigger (R11):** the longest Browser job on the push run is track-a ng at **24.6 min, above the 15-minute threshold**. Per the user's decision on CO-8, sharding is now presented for a decision (research §7 A2b, estimated ≈ 11–12 min critical path for about +10 runner-minutes per full run). Nothing is sharded without that decision.

## 5. Open items

- **CO-8:** presented for the user's decision (§4).
- **AC2.9:** monitoring.
- **Deferred minors from the final review:**
  - `playwright.config.ts` validates `TRACK_A_FRAMEWORK` with `in`, which also accepts inherited names such as `toString` (local misuse only; it then fails with an unclear error);
  - the config comment does not say that `TRACK_A_FRAMEWORK` takes precedence when both variables are set (no CI job sets both).
- **Deferred minors from earlier stages:** listed in the Stage 1 and Stage 2 closeout records.
- **Not started:** CO-11 (research only); Phase 2; deferred S1–S7.
