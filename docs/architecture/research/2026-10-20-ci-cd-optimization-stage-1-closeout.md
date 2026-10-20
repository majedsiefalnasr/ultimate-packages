# CI/CD optimization Stage 1 — closeout record (2026-10-20)

**Status:** Closeout record for Stage 1 of the CI/CD optimization (Plan Tasks 1–3). It records evidence only. It changes no workflow, script, setting or GAP status. AC1.3 (b) is pending by design (Spec §9.4). As Spec §8 and Plan Task 8 prescribe, it lands with Stage 2.

**Records:** research `2026-10-20-ci-cd-optimization-research.md`; Spec `docs/superpowers/specs/2026-10-20-ci-cd-optimization-design.md` (revision 3, approved); Plan `docs/superpowers/plans/2026-10-20-ci-cd-optimization.md` (revision 4, approved); ADR-070.

## 1. What landed

- [PR #48](https://github.com/majedsiefalnasr/ultimate-packages/pull/48), head `fa39188a`, merged with the user's authorization as merge commit `986fe941` into `develop`. Its parents are `ee8e0897` and `fa39188a`. The required `ci` check was successful on `fa39188a` at merge time.
- Branch commits:
  - `77f3cfa2`: concurrency, timeouts and display names (R1, R2, R4);
  - `df6c8869`: one Playwright HTML report per tranche invocation (R3);
  - `ec5f32d0`: research record, ADR-070, Spec and Plan;
  - `fa39188a`: the Plan status line records PR #48. It was also the second commit for AC1.4.

## 2. Local verification (before push)

- The Plan's Task 1 and Task 2 checks, scripted, failed before the edits (`cancel-in-progress count 0`; `PLAYWRIGHT_HTML_OUTPUT_DIR count`) and passed after them.
- `actionlint`: no errors.
- `prettier --check .`, `pnpm run lint` and `agents-md-pointers:validate`: pass.
- The pre-push hook (`build && typecheck && test`) passed on Node 24.15.0.
- Final whole-branch review by a fresh reviewer: 0 Critical, 0 Important, 1 Minor (deferred, §4).

## 3. Acceptance criteria

| Criterion | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Result                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| AC1.1     | Local checks above: both workflows have the R1 block; the five jobs have the R2 timeouts; `ci` has no job-level `if:` and no `paths` filter; step names unchanged apart from the added upload step (the SSR build step's name renders the same text)                                                                                                                                                                                                                                                        | **Met**                                                                                   |
| AC1.2     | PR #48, CI [39387101736](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39387101736): the check reports as `ci`, success (8m04s); PR merge state `UNSTABLE` (non-required Baselines red), not `BLOCKED`                                                                                                                                                                                                                                                                                  | **Met**                                                                                   |
| AC1.3 (a) | PR #48 checks: `ci`, `Baselines (advisory): size, coverage, provenance`, `Classify changes`, `Playwright visual + a11y (ng/react/vue)`, `SSR hydration (ng/react/vue)`. GitHub appended the matrix suffix to names without a matrix expression, so the R4 fallback was not needed                                                                                                                                                                                                                           | **Met**                                                                                   |
| AC1.3 (b) | The skipped track-a row needs a docs-only PR                                                                                                                                                                                                                                                                                                                                                                                                                                                                | **Pending** (Spec §9.4: completes in the Stage 3 closeout PR, or an earlier docs-only PR) |
| AC1.4     | PR half: pushing `fa39188a` cancelled both runs on `ec5f32d0` (CI 39386897350, Browser 39386896318: `cancelled`). Push half: the `develop` push runs on `986fe941` (CI [39390530749](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39390530749), Browser [39390530714](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39390530714)) ran to completion; no `develop` run is `cancelled`                                                                               | **Met**                                                                                   |
| AC1.5     | Browser 39390530714 uploaded `playwright-report-tranches-ng` (`g3a`, `g3b`, `g3c1`, `g3c2`, `g3d`, `g3e`, each with `index.html`), `-vue` (the same six) and `-react` (`w1`)                                                                                                                                                                                                                                                                                                                                | **Met**                                                                                   |
| AC1.6     | Compared with the previous push run (Browser [39320417193](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39320417193), CI [39320417160](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/39320417160)), job by job under the renamed jobs: every job conclusion and every step conclusion is equal, apart from the new "Upload Playwright HTML reports (tranches)" step (success in the three track-a jobs); every Playwright, Vitest and `node --test` count is equal | **Met**                                                                                   |

Counts on the push run (equal to the baseline):

- Playwright ng: 435 strict; G3-A 189, G3-B 174, G3-C1 120, G3-C2 147, G3-D 162, G3-E 153 passed.
- Playwright vue: 396 strict; G3-A 207, G3-B 174, G3-C1 123, G3-C2 138, G3-D 162, G3-E 162 passed.
- Playwright react: 294 strict; W1 24 passed.
- SSR: ng 10, react 9, vue 9 passed.
- `ci` Test: every package's Vitest count unchanged (for example ng 1188, react 858, vue 1192, themes 864 passed and 108 skipped).
- Baselines (advisory) failed only in its two known steps, Bundle-size regression check and Provenance validation, as on the baseline run.

Push-run job times: `ci` 6.2 min; Baselines 4.4 min; track-a ng 25.3, vue 24.3, react 6.8 min; SSR 1.0–1.8 min. Stage 1 changes no test work, so no runtime change is claimed.

## 4. Open items

- **AC1.3 (b):** pending per Spec §9.4.
- **Deferred minor from the final review:** the SSR build step repeats the playground-directory expression in its name and its `run:`. Spec R4 prescribes the inline form.
- **Not started:** Stage 2 and Stage 3 (separate authorizations); Phase 2; deferred S1–S7.
