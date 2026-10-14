# GAP-088 closeout — SSR web-server selection

**Date:** 2026-10-14

**Authority:** Human-authorized GAP-088 verification and closeout under [AGENTS.md §3](../../../AGENTS.md#3-workflow-and-approval-gates). [PR #8](https://github.com/majedsiefalnasr/ultimate-packages/pull/8) merged fix commit `fe8073240d627f77b9a3178f6af36355678a204f` into `main` at `3f86cbce30fcde4fd0ff88756e2713b8daf0a6ae`. The verified current `main` is `48c45eba40f62bb3106a4897b885bbb7bc87107c`.

## Result

The merged `playwright.config.ts` includes the three Track A Storybook servers only when `TRACK_E_SSR_FRAMEWORK` is unset. With the filter set by each Track E SSR CI job, it starts only that framework's SSR harness server. The CI matrix still builds its own harness closure and runs its matching Playwright SSR project; the tests were not weakened. This resolves the React and Vue server-start failure registered on 2026-10-07. The original failure remains in [GAP-088](../BLUEPRINT_GAPS.md#gap-088--react-and-vue-ssr-jobs-start-the-angular-storybook-web-server-which-cannot-build-in-those-jobs) as historical evidence.

## Verification

- **Merged source:** The fix commit changes only `playwright.config.ts`; [PR #8](https://github.com/majedsiefalnasr/ultimate-packages/pull/8) is merged with that commit as its head. At verified `main`, `.github/workflows/ci.yml` sets `TRACK_E_SSR_FRAMEWORK` to `ng`, `react` or `vue` in the SSR matrix and runs `npx playwright test --project=<framework>-ssr-chromium`.
- **SSR execution:** In [main CI run 38525033948](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38525033948) at `48c45eba`, all three SSR jobs completed **success**. Their Playwright logs show Angular 10/10, React 9/9 and Vue 9/9 tests passed. The uploaded `playwright-report-ssr-ng`, `playwright-report-ssr-react` and `playwright-report-ssr-vue` HTML reports were downloaded and inspected: their embedded report summaries respectively record 10, 9 and 9 expected tests, with zero unexpected, flaky or skipped tests.
- **Other CI and Release:** In the same CI run, the `ci` job completed **failure**: Coverage regression check, Provenance scripts self-tests and Provenance validation failed. Angular and Vue browser jobs were still running at this review. [Release run 38525033917](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38525033917) at the same SHA completed **failure** in Select mode → Install dependencies: `ERR_PNPM_UNSUPPORTED_ENGINE` under Node `v20.20.2` against a dependency requiring `^22.22.3 || ^24.15.0 || >=26.0.0`. Version and Publish were skipped. The Release failure is separate from the successful SSR jobs and remains under GAP-087.

GAP-088 is resolved on merged source and SSR job evidence. C01 remains **incomplete** because other CI checks fail; none is a pass or approved exception. [COMPLETION_REGISTER.md](../COMPLETION_REGISTER.md#c01--restore-trustworthy-ci-signals) records the dependent C10 P8 eligibility change without treating P8's own Stage 1 work as complete.
