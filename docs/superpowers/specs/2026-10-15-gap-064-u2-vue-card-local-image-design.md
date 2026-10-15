# GAP-064 U2 — Deterministic header image for the Vue Card story

**Date:** 2026-10-15
**Status:** APPROVED — Spec Review passed with changes (findings 1–6 applied, 2026-10-15); Amendment A1 (user decision, 2026-10-15).
**Authority:** [GAP-064](../../architecture/BLUEPRINT_GAPS.md) G3-B follow-up U2; [G3-B closeout](../../architecture/research/2026-10-05-gap-064-g3b-closeout.md) Follow-ups §2 ("red until the story is made deterministic"); [G3-E Specification](2026-10-08-gap-064-g3e-media-data-design.md) ruling **G3E-1** ("same small local media fixtures … no Prime CDN assets in verification") and §5.1.

## 1. Verified problem

On `main` `bdc4dbcf`, [CI run 38730856573](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38730856573), `track-a-browser-visual-a11y (vue)`, "Run G3-B verification specs (vue)": 173 passed, 1 failed — `[vue-webkit] Vue/Card WithHeaderAndFooter G3-B visual` (`toHaveScreenshot`, all retries).

Reproduced on 2026-10-15 at `bdc4dbcf` in the CI image and architecture (`mcr.microsoft.com/playwright:v1.63.0-jammy`, arm64, Node 24.15.0, `--retries=0`): the same single test fails (1644–2157 differing pixels); the Chromium and Firefox cases and the Card Default cases pass.

Root cause: [`packages/vue/src/card/card.stories.ts`](../../../packages/vue/src/card/card.stories.ts) `WithHeaderAndFooter` loads its header image from `https://primefaces.org/cdn/primevue/images/usercard.jpg`. The rendered result depends on that third-party request at screenshot time. All three committed baselines show the header image absent (a failed load collapsed to no height); the reproduced WebKit render instead shows a large broken-image placeholder occupying the card. The closeout records that two baseline-update attempts also captured broken renders. The `<img>` has no `alt`: when the load fails, Chromium and Firefox collapse it to nothing, while WebKit draws a sized broken-image box, which is why only WebKit fails. A network-dependent story cannot give a stable screenshot.

## 2. Required behavior and scope

1. In the Vue `WithHeaderAndFooter` story, replace the CDN URL with the existing committed local fixture `/media/landscape-1.png` (Ultimate-generated, no third-party content; already served to the Vue Storybook by `staticDirs` in `packages/vue/.storybook/main.ts` and used by the Vue Galleria story). Per Amendment A1, the `<img>` inline style also gains `height: 10rem; object-fit: cover;`. No other story markup changes: the `<img>` keeps having no `alt`, so the pre-existing `image-alt:vue-card--with-header-and-footer:img` fingerprint recorded in `docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md` intentionally remains; fixing it is out of scope.
2. Regenerate the three affected Linux baselines `packages/vue/e2e/g3b-aura-styles.spec.ts-snapshots/Vue-Card-WithHeaderAndFooter-G3-B-visual-1-vue-{chromium,firefox,webkit}.png` in the CI image and architecture, with `--update-snapshots` limited to that test. The render legitimately changes in all three engines (the image now loads), so all three are replaced; no other baseline may change.
3. Unchanged: the test file and its assertions, Playwright config, the Card component and styles, other stories, the Angular and React Card stories (they also reference the CDN; their tests currently pass and React has no G3-B suite. G3E-1 §5.1 binds the G3-E stories; G3-B predates it, so no Specification conflict exists. This change applies G3E-1's principle to the one failing story; the Angular/React CDN references are recorded as a follow-up in the U2 closeout), and tracking documents.

**Amendment A1 (user decision, 2026-10-15).** The first Task 2 capture loaded the fixture deterministically in all three engines. But the Vue Card renders full width: the story's `style="width: 20rem"` does not reach the root, because of `inheritAttrs: false`, the same cause as the BlockUI follow-up. The 800 × 600 image therefore filled the 1280 × 720 screenshot, and the title, content and buttons fell below the fold. The user chose to bound the image height in the story (`height: 10rem; object-fit: cover`) rather than wrap the card or accept an image-only baseline. The Card component and the `inheritAttrs` behaviour are unchanged.

## 3. Acceptance and verification

1. In the CI image, three consecutive runs of `Vue/Card` G3-B tests in Chromium, Firefox and WebKit with `--retries=0` pass against the new baselines (repeatability).
2. The full Vue G3-B verification step passes locally in the CI image (`--retries=0` not required; CI's own retry setting applies), showing no other baseline changed.
3. The new baselines show the loaded fixture image in the card header. **User visual review is a hard stop** (G3-B Spec D-G3-7, review gate before any baseline update): the baselines are committed on the branch and shown in the PR, and the PR is not merged until the user accepts them. The implementer does not claim acceptance.
4. In the CI image, `node scripts/provenance/validate-g3b-accessibility.mjs vue` over the G3-B run's reports passes with 0 introduced violations, and reports no new STALE row for `vue-card--with-header-and-footer`.
5. Lint and format checks pass on the changed story.
6. PR CI: "Run G3-B verification specs (vue)" and "G3-B differential accessibility validation (vue)" pass; every other failure is classified against baseline run 38730856573 as inherited or regression.

## 4. Boundaries

No architectural decision is reopened; G3E-1 already rules out Prime CDN assets in verification. GAP-064 tracking updates (U2 → resolved, the Angular/React follow-up, and the disposition of the rejected capture in local `stash@{0}`) belong to a separate closeout. Next gate: Plan and Plan Review (`AGENTS.md` §3).
