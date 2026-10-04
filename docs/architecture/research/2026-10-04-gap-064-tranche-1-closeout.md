# GAP-064 Tranche 1 closeout — `feature/gap-064-aura-token-wiring`

**Date:** 2026-10-04
**Range:** research and ADR-051 `0eeb9e2`, `849496b`; Spec `98b616e`, Spec Review `6745665`; Plan `0fba343`; implementation `a33c219..1211b4c` (8 commits) on a branch from `main` `f05bd9b`.
**Status:** closeout recorded. GAP-064 stays **PARTIAL**: Tranche 1 is complete; G3 remains open. The user authorized a local `--no-ff` merge into `main`; nothing is pushed.

## Outcome

Tranche 1 (Spec §1; decisions D1–D6, ADR-051) is complete:

- **G1 — style keys.** 16 Angular components (16 sites) and 17 Vue components (18 sites, both `BaseFileUpload.ts` sites) register under the upstream Aura preset key (`input-text` → `inputtext`, …), so their `dt()` references resolve. The change is verified on the generated `<style data-u-ng-style|data-u-style>` elements, not on source literals.
- **G1a — Vue InputNumber.** `@ultimate/vue-core`'s `registerComponentStyle(componentName, styleModule, additionalPresetKeys?)` registers the variables of additional preset keys, never structural CSS under them. Vue InputNumber registers `inputnumber` with `["inputtext"]`.
- **G2 — module ports.** `badge`, `inputgroup` and `paginator` are ported (Option B — reference, not verbatim copy) from `@primeuix/themes` 2.0.3, with fidelity-fixture and `themes.json` provenance entries. `auraPreset` registers 79 modules.
- **D3 — React.** React `UPaginator` now receives the `paginator` variables it already referenced. There is no React source change.
- **D6 — visual.** 134 Linux baselines were regenerated in Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` and reviewed by the user: 40 approved changed tests × 3 browsers, plus 14 platform-only baselines. There were 0 unexpected Tranche 1 visual changes.
- **Accessibility.** Two Angular Badge `color-contrast` entries (`ng-badge--large` 2.53:1, `ng-badge--success` 2.27:1) were added to `ACCESSIBILITY_BASELINE.md` as an approved upstream-Aura parity exception.
- **`MIGRATION.md` §8** records the consumer-visible changes, using the user-approved text.

## Remaining GAP-064 scope

**G3:** the 46 Angular / 48 Vue components whose hand-written CSS does not consume their registered module. They are covered by future per-family specs, with upstream structural CSS as the default (D4).

## Verification

From the visual review record (`docs/superpowers/plans/2026-10-04-gap-064-tranche-1-visual-review.md` §19–§22):

- **Final Docker run:** 835 passed, 0 flaky, 0 failed. That is 807 Storybook runs across ng, vue and react × 3 browsers, plus 28 SSR runs.
- **Accessibility:** validation passes for ng, vue and react.
- **Unit suites:** uix-styled, vue-core, vue, react, react-core, themes, ng and ng-core all pass.
- **Other checks:** typecheck passes. The `@ultimate/vue` `validate` check passes for both module modes, at Vue 3.5.42 and at the floor version 3.5.2.
- **Contract boundary:**
  - The built `@ultimate/vue` declarations contain no style-key literal.
  - `@ultimate/vue-core` types the key only as `componentName: string`.
  - Angular `componentName` stays `protected`, enforced by typecheck.
- **Scope:** every one of the 202 changed paths is attributable to a task or an approved decision. Component files change only their key literal. There is no change in `uix-styled`, React source or `ng-core`.
- **Size gate:** passes; `@ultimate/themes` grew 3.1%.
- **Pre-existing failures,** identical on `main` and not caused by this branch:
  - `lint`: 60 problems.
  - `provenance:validate`: `packages/ng/src/accordion/accordion-style.ts` has no `ng.json` entry.

## Follow-ups (recorded, not implemented)

These are also recorded in the GAP-064 entry in `BLUEPRINT_GAPS.md`. No new GAPs were created.

1. **Ultimate-only token paths.** 20 Angular and 19 Vue references stay undefined (Spec §4.5 E1), in CascadeSelect, ColorPicker, DatePicker, FileUpload and MultiSelect. The tests assert them as a two-way exception list.
2. **RadioButton tolerance gap.** RadioButton (Angular and Vue) did change visibly: a 0×0 box became a 20×20 bordered circle. The change is 193 px with a maximum delta of 991, under Playwright's default tolerance of about 1409, so a regression would not be caught.
3. **Angular IconField and InputGroup stories.** The stories never create their child components (Angular NG0304), so their screenshots do not exercise the renamed styles.
4. **FloatLabel.** In the reviewed story, the label does not reach its floating state.
5. **FileUpload buttons** stay plain: Button/Message token behavior is outside Tranche 1.
6. **Size baselines.** `PERFORMANCE.md` appears out of date. Packages with no source change on the branch measure ng −68.3%, ng-core +2.2% and uix-styled +2.3%.
7. **Earlier follow-ups** (research §5):
   - the inaccurate React tokenization documentation;
   - Angular InputNumber structural parity;
   - FileUpload's dependency on Button/Message tokens;
   - Ripple, which is excluded from GAP-064 by D5.
8. **Test observations.** These are optional, with no change now:
   - the exception check counts variables defined by any `<style>` on the page;
   - it does not assert that a component's CSS references at least one token.
9. **`MIGRATION.md` wording.** The approved text stays unchanged. It names InputGroup twice, and it implies that an old `input-text-variables` element existed. Before Tranche 1 that element was never created, because its CSS was empty.

## Accepted rulings

Execution rulings are recorded in the SDD ledger and summarized in the closeout report. The ones that matter here:

- The Plan's predicted RED state was wrong for one guard test; the test was kept unchanged.
- The Plan's Angular test and accessibility commands were corrected.
- Prettier had reflowed some of the Plan's code blocks; their original meaning was kept.
- The 14 platform-only baselines were regenerated with `--update-snapshots=changed`.
- Failures that also occur on `main` were recorded, not fixed.
