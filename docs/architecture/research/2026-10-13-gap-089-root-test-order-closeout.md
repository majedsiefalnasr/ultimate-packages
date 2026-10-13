# GAP-089 closeout — root Test ordering

**Date:** 2026-10-13

**Change:** `8fc69cde` (`package.json` only), merged to `main` as `0ab75fff` by [PR #5](https://github.com/majedsiefalnasr/ultimate-packages/pull/5); `cbc05f4a` narrows a follow-up timeout change to one Vue test.

**Review:** Superpowers read-only code review found no issues; human Final Review approved the merge and normal closeout.

## Result

The root `pnpm run test` script runs the complete `@ultimate/themes` test command, including its `pretest` build, before recursively testing the other packages with Themes excluded. This prevents the Themes build from cleaning React's declaration output while `packages/react/test/exports.test.ts` checks it. Direct `pnpm -r test` invocations are outside this change.

## Verification

- [PR #5 CI attempt 3](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38247833439/attempts/3/job/115310933261) ran at candidate `8fc69cde`. Its Test log printed the changed root script, then Themes `pretest` and test before the remaining recursive tests. The Test step passed: React exports 12/12, React 857/857, and Vue 1,192/1,192.
- [PR #6's verification-only job](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38289045573/job/114944364581) checked out and asserted the same candidate SHA, then passed `pnpm run integrity:pack-install -- react`: React and seven closure members packed, installed and verified, with 177 manifest paths checked. PR #6 remains unmerged.
- The Vue package-export test in `packages/vue/src/table/table.spec.ts` timed out at 5 seconds in the root Test step on candidate attempts 1 and 2. The same test passed in the separate Vue coverage run on both attempts (3.799 and 4.644 seconds), and in the Test step on attempt 3 (4.839 seconds).
- [First post-merge CI](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38404581717/job/115320731636) at `0ab75fff` again passed React exports 12/12, but its Test step failed on that Vue export test's 5-second timeout. The same test passed in its Vue coverage run at 4.496 seconds. The repeated threshold crossing, while the same import passes in separate coverage invocations, supports a timing-sensitive timeout. A follow-up commit `cbc05f4a` raises only this test's timeout to 10 seconds; its assertion remains unchanged. The focused Vue table suite passed locally, 67/67. The follow-up's Superpowers read-only review found no issues.
- [CI run 38406846324](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38406846324) at `cbc05f4a` passed the root Test step. Its log prints the changed root command and Themes `pretest` before the other package tests. React exports passed 12/12, React passed 857/857, and Vue passed 1,192/1,192. The Vue package-root import passed in 7.108 seconds, above the old 5-second limit and within the new 10-second limit.

The overall CI job at `cbc05f4a` remains red. Compared with the first post-merge run at `0ab75fff`, Test is the only `ci` job step that changed from failure to success; Lint, Format check, Coverage regression check, Provenance scripts self-tests, and Provenance validation still fail. The passing final Test step and React pack/install job establish the bounded GAP-089 evidence; those other failures are tracked independently.

## Delivery note

The follow-up was intended for a new PR, but the local Git configuration (`push.default=upstream`) and the new branch's `origin/main` upstream sent its push directly to `main`. The pushed commit contains only the reviewed one-test timeout change; no history rewrite or corrective force-push was used. Subsequent branch pushes use an explicit destination ref.
