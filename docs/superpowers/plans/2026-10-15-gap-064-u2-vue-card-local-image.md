# GAP-064 U2 Vue Card Local Image Implementation Plan

> **For agentic workers:** Execute inline. Task 4 is a **HARD USER STOP**: the PR must not be merged before the user accepts the three new baselines.

**Status:** APPROVED — Plan Review passed with changes (findings 1–8 applied, 2026-10-15); updated for Spec Amendment A1.

**Goal:** Make `Vue/Card WithHeaderAndFooter` render deterministically by using the committed local fixture image, and replace its three G3-B visual baselines.

**Architecture:** One story `<img>` change (`src` + inline style, Spec A1); three regenerated PNG baselines; no test, config, component or style change.

**Tech stack:** Storybook (Vue 3, Vite), Playwright 1.63.0 in `mcr.microsoft.com/playwright:v1.63.0-jammy` on arm64 (same image and architecture as the CI `track-a-browser-visual-a11y` job), Node 24.15.0, pnpm 9.6.0.

## Global constraints

- [Approved Spec](../specs/2026-10-15-gap-064-u2-vue-card-local-image-design.md) §§2–3 governs.
- Files changed: `packages/vue/src/card/card.stories.ts` (the `<img>` `src` and inline `style`, per Spec A1); `packages/vue/e2e/g3b-aura-styles.spec.ts-snapshots/Vue-Card-WithHeaderAndFooter-G3-B-visual-1-vue-{chromium,firefox,webkit}.png`; this Plan and the Spec. Any other changed file aborts the task.
- Docker runs use a `git archive` export of the branch tree with a fresh `pnpm install --frozen-lockfile` and `pnpm run build`, `CI=true` (the established baseline procedure, e.g. the 2026-10-03 approved-designs closeout).

## Task 1: Story change

In `WithHeaderAndFooter`, replace `src="https://primefaces.org/cdn/primevue/images/usercard.jpg"` with `src="/media/landscape-1.png"`, and (Spec A1) extend the `<img>` inline style to `width: 100%; height: 10rem; object-fit: cover; display: block;`. Keep the rest unchanged, including the missing `alt`. Run `pnpm exec eslint` and `pnpm exec prettier --check` on the file.

## Task 2: Regenerate the three baselines

Export the working tree to a scratch directory (`git archive HEAD` plus the changed story file, `git stash create`, or a temporary commit). Never run `git stash push`, `pop` or `drop`: stash refs are shared across worktrees, and the rejected U2 capture in `stash@{0}` must be kept. In Docker run:

`npx playwright test packages/vue/e2e/g3b-aura-styles.spec.ts --project=vue-chromium --project=vue-firefox --project=vue-webkit --grep "Card WithHeaderAndFooter G3-B visual" --update-snapshots --retries=0`

Copy only the three `Vue-Card-WithHeaderAndFooter-*` PNGs back into the worktree. `git status` must show exactly those three PNGs and the story as modified. All three must have changed: Chromium and Firefox previously passed with the image collapsed, so if only WebKit changed, the image did not load. View each PNG: the header must show the fixture image, the title, the content and both buttons, with no broken-image box.

## Task 3: Verify

In Docker on a fresh export that includes the new baselines:

1. Three consecutive runs of `npx playwright test packages/vue/e2e/g3b-aura-styles.spec.ts --project=vue-chromium --project=vue-firefox --project=vue-webkit --grep "Vue/Card" --retries=0`: all 12 tests pass each time. These runs cannot feed the validator: Playwright clears `test-results/` at the start of every run.
2. In the same export, run the CI step command verbatim: `npx playwright test packages/vue/e2e/g3b-aura-styles.spec.ts --project=vue-chromium --project=vue-firefox --project=vue-webkit` (CI's retry setting). Expect 0 failed. Immediately after it, with no other Playwright run in between, run `node scripts/provenance/validate-g3b-accessibility.mjs vue`. Expect exit 0 and 0 introduced violations, no `STALE` line naming `vue-card--with-header-and-footer`, and a STALE list equal to the one in `vue-validation.txt` from the `g3b-accessibility-reports-vue` artifact of baseline run 38730856573. Record the summary lines.

**Stop rules.** Stop and report to the user, without editing the test, the pre-existing evidence list or any other baseline, if any of these happens:

- any Task 2 or Task 3 failure or flake;
- the Task 2 PNG review fails;
- the validator shows an introduced violation or a STALE row for this story (for example, the `region` node reported under a new selector once the image loads).

Do not re-capture in the hope of a better result. Residual risk: Storybook inserts the `<img>` after the page `load` event, and `toHaveScreenshot`'s two-matching-frames wait is the only image-load guard. The repeat runs and the PNG review are the controls for that risk.

## Task 4: Review, commit, PR — HARD USER STOP before merge

Get an independent code review of the diff and fix any in-scope findings. Commit the Spec, the Plan, the story and the three PNGs. Push with the explicit refspec `git push -u origin fix/gap-064-u2-vue-card-local-image:fix/gap-064-u2-vue-card-local-image` and confirm the output shows no `-> main`. Open a PR whose body embeds or links the three new baselines and asks for the user's visual acceptance. Compare the PR's CI against baseline run 38730856573: both G3-B Vue steps should be green, and every other failure is classified as inherited or a regression. Do not merge. The Angular/React CDN follow-up and the disposition of `stash@{0}` are deferred to the separate closeout (Spec §2.3, §4).
