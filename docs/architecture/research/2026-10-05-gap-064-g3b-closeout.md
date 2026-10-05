# GAP-064 G3-B closeout — `feature/gap-064-g3b-containers`

**Date:** 2026-10-05
**Range:**

- Research and decisions B-1..B-9: `f2698e3`.
- Spec: `fc5bad8` (§13 Spec Review decisions), later amended by §14 Amendment A1 in `fcbb65a`.
- Plan: `29b7b7d` (Plan Review decisions), later amended by A1 in `fcbb65a` and A2 in `018f4b8`.
- Implementation: `411fd27` through `968a346` inclusive, 15 commits, on a branch from `main` `fe86fe4`.
- Merged into local `main` as `f008a73` (`--no-ff`, parents `fe86fe4` + `968a346`), as the user authorized.

**Status:** closeout recorded. GAP-064 stays **PARTIAL**: G3-B is complete, and G3-C, G3-D and G3-E remain open. Nothing is pushed. The feature branch is kept.

## Outcome

G3-B (family F1, Containers & Panels) is complete:

- **Scope.** 10 Aura keys: accordion, blockui, card, divider, fieldset, inplace, panel, scrollpanel, splitter and toolbar. That is 10 Angular and 10 Vue style modules; the Vue Accordion family's four directories share one module.
- **Port.** Each style module's `css` is the applicable `@primeuix/styles` 2.0.3 structural CSS, with selectors mapped to the existing Ultimate DOM (decisions B-1..B-9). The style-module content is generated from a committed upstream fixture by `packages/themes/test/utils/g3b-port.mjs`.
- **Data model.** Spec §5.9 categories D1–D6. Per framework, 76 of the 89 upstream component rule groups are ported (D1) and 13 are omitted as feature exclusions (D2). Base-role rules (D3), the Divider inline-role rules (D4) and three retained Ultimate-only rules (D5) are separate categories outside the 89. The base mask animations (D6) are excluded.
- **Unresolved tokens.** The only exception is `scrollpanel.barfocus.ring.width/offset`, an upstream typo ported as-is.
- **Style keys (ADR-051).** `block-ui` → `blockui` and `scroll-panel` → `scrollpanel`, in Angular and Vue (4 sites). Component files change only those literals. There is no DOM, class or runtime change.
- **Provenance.**
  - 20 `reference-derived` entries in `docs/architecture/provenance/{ng,vue}.json`.
  - The `@primeuix/styles` entry in `PROVENANCE.md` now also covers the G3-A and G3-B per-component ports (Amendment A2).
- **CI.**
  - New tranche-scoped `scripts/provenance/validate-g3b-accessibility.mjs`.
  - The strict scan's selection becomes `--grep-invert "G3-A|G3-B"`.
  - Three G3-B steps, mirroring G3-A.
  - The G3-A tooling is unchanged.
- **`MIGRATION.md` §8.** Records the consumer-visible changes and the 7 removed legacy `--u-*` variables.

## User decisions during execution

- **Amendment A1 (Spec §14).** The BlockUI layout check compares the mask with the container's inside-the-border box. The 0.5px tolerance is unchanged, and there is no CSS or story change.
- **Visual review.** 138 screenshot baselines were accepted, including N1 (BlockUI FullScreen rounded corners), N2 (Inplace Active spacing) and the four U1 Angular ScrollPanel tests as rendered. The U2 baseline was not accepted (see Follow-ups). The final visual acceptance is **138 accepted screenshot changes + 1 intentionally unaccepted U2 WebKit test**.
- **Accessibility.** No `ACCESSIBILITY_BASELINE.md` rows were added: 0 violations were introduced and 0 were fixed. The 147 pre-existing axe fingerprints are recorded as evidence in `docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md`.
- **Amendment A2.** This was the final-review fix pass:
  - the Accordion layout checks now assert header text colour (the Aura header backgrounds are all identical);
  - the `@primeuix/styles` provenance entry is updated;
  - the Task 10 record now names the actual provenance failure.

## Verification

From the review record, `docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md`:

- **Targeted G3-B Docker run** (`mcr.microsoft.com/playwright:v1.63.0-jammy`, arm64):
  - 347 passed, 1 failed;
  - the only failure is the user-ruled U2 exception;
  - layout 42/42, accessibility 150/150;
  - validator: ng 75/75, vue 75/75, 0 introduced.
- **Regression run** (every non-G3-B spec, G3-A included, 9 Storybook and 3 SSR projects): 1231 passed, 0 failed.
- **CI simulation** (ng, vue, react):
  - every strict, G3-A and G3-B step passes, except the expected U2 failure in the vue G3-B run;
  - two pre-existing strict-run tests were flaky and passed on retry.
- **Unit suites:** uix-styled, themes, vue-core, vue, react, ng and ng-core pass, as do `test:scripts` (134), typecheck and the Angular SSR check (10/10).
- **Size, authoritative** (`fe86fe4` build vs current build, `index.mjs` gzip): ng +0.19%, vue +0.69%. The 15% gate passes.
- **Scope:** every changed path is attributable to a task, an amendment or an approved decision. The G3-A tooling and `ACCESSIBILITY_BASELINE.md` are unchanged.

## Remaining GAP-064 scope

G3-C (F2 Menus & navigation), G3-D (F3 Overlays + F8 Composites) and G3-E (F6 Media + F7 Data): 23 Angular and 24 Vue components, per `docs/architecture/research/2026-10-04-gap-064-g3-research.md` §7 and §11.

## Follow-ups (recorded at this closeout; not implemented, not separate GAPs)

1. **U1, Angular ScrollPanel story.**
   - The `<u-scroll-panel>` custom-element root is inline and unstyled, so the story's `width`/`height`/`border` do not create the intended clipped 200×200 panel.
   - As a result, the hover screenshots do not visually show the scroll bars.
   - This is pre-existing story behaviour, not a G3-B regression.
   - The browser layout checks remain the authoritative verification of bar visibility, position and the hidden state.
   - No G3-B CSS change is required or authorized.
   - Status: open.
2. **U2, Vue Card WithHeaderAndFooter WebKit screenshot.**
   - The story loads its header image from an external CDN (`primefaces.org`).
   - The baseline-update run and the single approved retry both captured a broken render.
   - Normal rendering is shown by the review-run retry evidence and the pre-port baseline.
   - The baseline is intentionally **not accepted**. The test is unchanged and not suppressed. It is the single known failing G3-B visual test, so the CI `track-a-browser-visual-a11y (vue)` job is red until the story is made deterministic.
   - The rejected capture is kept in local `stash@{0}`.
   - Status: open.
3. **Vue BlockUI story.**
   - The story's inline `height`/`border` do not reach the rendered BlockUI container, because of the existing `inheritAttrs: false` in `BlockUI.vue` (Spec §14).
   - No G3-B change.
   - Status: open.

**Not a G3-B follow-up (pre-existing, separate):** `provenance:validate` still exits 1 on `packages/ng/src/accordion/accordion.spec.ts` having no `ng.json` entry. The G3-B diff check now passes. Fixing the manifest gap needs separate authorization.
