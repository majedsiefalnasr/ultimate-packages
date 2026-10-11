# GAP-124 — Loading spinner motion and contrast: verification record

**Date:** 2026-10-11
**Branch:** `feature/gap-124-loading-spinner` (from `main` `b2bd892`), not merged, not pushed.
**Spec:** [`docs/superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md`](../../superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md) (revision 4 + Amendment A2).
**Plan:** [`docs/superpowers/plans/2026-10-11-gap-124-loading-spinner.md`](../../superpowers/plans/2026-10-11-gap-124-loading-spinner.md), executed via subagent-driven development.
**Status:** GAP-124 stays **PARTIAL** pending a separate closeout decision. GAP-064 stays PARTIAL. The GAP-098 ruling is unchanged.

This is a dated evidence snapshot (AGENTS.md §2 tier 6). The claims below are **verified** (a check ran and passed at the stated commit) unless marked **CI-enforced**.

## 1. Commits

| Commit    | Item    | Subject                                                                            |
| --------- | ------- | ---------------------------------------------------------------------------------- |
| `72475b8` | docs    | record the loading-spinner research, Spec and Plan                                 |
| `3f17ab3` | fixture | add the Vue DataView loading story as a GAP-124 fixture                            |
| `228e196` | A       | add the shared class-scoped icon-spin rule                                         |
| `e35028b` | A       | register the icon-spin rule from both cores                                        |
| `736c308` | A       | prove React-only documents get no icon-spin rule                                   |
| `57ffb74` | A       | verify spinner rotation and the reduced-motion stop; record item A                 |
| `890b840` | B       | give the DataView loading icon 3:1 non-text contrast                               |
| `71488e5` | docs    | replace the fixed L1 tolerance with the rounding range (Amendment A2, user ruling) |
| `464c524` | B       | measure the DataView loading icon contrast on declared surfaces                    |
| `60f5e39` | B       | record the DataView loading icon selector as K in the Vue G3-E reach table         |
| `6f344d4` | B       | accept the reviewed DataView loading baselines and record item B                   |
| `37c2192` | A       | make the item A motion and SSR checks self-proving (final review)                  |
| `00818bf` | B       | harden the DataView contrast spec against vacuous passes (final review)            |
| `f525f7a` | records | reconcile the DataView loading records with items A and B (final review)           |
| `f281e2a` | docs    | mark superseded tolerance text and update document status (final review)           |
| `de7e66c` | B       | allow the first DataView story load more time in the contrast spec                 |

## 2. Acceptance criteria

### Item A — motion

| AC                                                                             | Result | Evidence                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-AC1 rotation (2s, linear, infinite; transform changes)                       | Pass   | `gap-124-icon-spin.spec.ts` (ng, vue): 24/24 across 6 projects; Docker (Linux) at `f281e2a` inside the GAP-124 suite. RED at `3f17ab3`: the motion tests fail (`animationName` `none`). CI-enforced (CI strict job). |
| A-AC2 reduced motion: `none`, visible, same box, opacity 1, status region kept | Pass   | Same specs. Since `37c2192`, each test first asserts the icon was animating, so it cannot pass on the pre-change code.                                                                                               |
| A-AC3 CSS text exactly §5.1, single class selector, idempotent                 | Pass   | `packages/uix-styled/test/icon-spin.test.ts` (incl. whitespace-normalised equality). CI-enforced (unit).                                                                                                             |
| A-AC4 registered from ng-core and vue-core; SSR once per document              | Pass   | ng-core and vue-core unit tests; `ssr-hydration.spec.ts` asserts the `u-icon-spin` key in server HTML and `counts["u-icon-spin"] === 1` after hydration (ng-ssr-chromium 10/10). CI-enforced.                        |
| A-AC5 no baseline change from item A; parity probe 0 differences               | Pass   | Docker `check E-4` at `57ffb74`: 78/78 unchanged. Parity `dataview/loading` (ng) at `57ffb74`: 0 material differences, ratio 0.0022 (same as the E4-V1 record), noise 0/0/0.                                         |
| A-AC6 accessibility validator 0 introduced                                     | Pass   | Docker CI simulation at `57ffb74` and `f281e2a`: every accessibility check exit 0.                                                                                                                                   |

### React — unchanged (D-124-5)

| AC                                                                   | Result | Evidence                                                                                                              |
| -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| R-AC1 loading `UButton`: no `u-icon-spin` key or keyframes in React  | Pass   | `packages/react/src/button/gap-124-react-unchanged.spec.tsx`. CI-enforced.                                            |
| R-AC2 built React output has no spin keyframes or `registerIconSpin` | Pass   | `grep` of `packages/react-core/dist` and `packages/react/dist`: no match; `@ultimate/uix-styled` imported externally. |
| R-AC3 React Storybook loading icon `animation-name: none`            | Pass   | `packages/react/e2e/gap-124-react-unchanged.spec.ts`: 3/3 React projects; Docker GAP-124 suite. CI-enforced.          |
| R-AC4 React-related files exactly the 3 allowed                      | Pass   | `git diff --name-status b2bd892...HEAD`: `react.json` (M) and the two new test files (A); no React production file.   |

### Item B — contrast

| AC                                                                                   | Result | Evidence                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B-AC1 each required condition ≥ 3:1 (L1), ng and vue                                 | Pass   | §3. Lowest value 3.67 (C-L4, every engine). CI-enforced.                                                                                                                                                                  |
| B-AC2 negative control < 3:1                                                         | Pass   | 2.31 (Chromium, Firefox), 2.29 (WebKit).                                                                                                                                                                                  |
| B-AC3 only DataView modules and the generator change for the colour                  | Pass   | `890b840`: `g3e-port.mjs` plus one regenerated line per DataView module. Test bookkeeping in `60f5e39` (Ruling R8).                                                                                                       |
| B-AC4 a11y tree unchanged; 0 introduced violations                                   | Pass   | Docker CI simulation at `f281e2a`: all accessibility checks exit 0, including G3-E.                                                                                                                                       |
| B-AC5 exactly 3 snapshots change; user-reviewed                                      | Pass   | `check E-4` at `464c524`: exactly the 3 `Ng-DataView-Loading-rest` snapshots failed. The user approved them on 2026-10-11. The committed PNGs are byte-identical to the reviewed images. `check E-4` at `f281e2a`: 78/78. |
| B-AC6 every L1 value within its rounding range (Amendment A2)                        | Pass   | 54/54 in 6 projects; repeated 3× in 6 projects at `de7e66c`: 162/162. Docker GAP-124 suite at `de7e66c`: 81/81.                                                                                                           |
| B-AC7 validity guards (≥ 100 core, ≥ 25 % of ink; core within ±2 of computed colour) | Pass   | No guard error in any run.                                                                                                                                                                                                |

## 3. Contrast values (layer L1, device scale 4)

Each value is the minimum contrast between every fully covered icon pixel and every adjacent mask pixel. The Angular and Vue values are identical for Chromium and WebKit. For Firefox, the L1 values are the same and only the pixel counts differ (ng 487/750, vue 502/773).

| Condition          | Surface            | Spec §6.4 | Chromium | Firefox | WebKit |
| ------------------ | ------------------ | --------- | -------- | ------- | ------ |
| C-L1               | light `#ffffff`    | 5.13      | 5.13     | 5.13    | 5.13   |
| C-L2               | light `#f1f5f9`    | 4.74      | 4.73     | 4.73    | 4.74   |
| C-L3               | light `#e2e8f0`    | 4.28      | 4.27     | 4.27    | 4.28   |
| C-L4               | light `#cbd5e1`    | 3.67      | 3.67     | 3.67    | 3.67   |
| C-L5               | light `#ecfdf5`    | 4.92      | 4.91     | 4.91    | 4.92   |
| C-D1               | dark `#18181b`     | 19.79     | 19.74    | 19.90   | 19.62  |
| C-D2               | dark `#27272a`     | 19.02     | 19.00    | 19.16   | 18.86  |
| C-D3               | dark `#a1a1aa`     | 10.32     | 10.23    | 10.32   | 10.23  |
| C-D4               | dark `#ffffff`     | 5.74      | 5.69     | 5.74    | 5.69   |
| C-D5               | dark `#34d399`     | 8.87      | 8.80     | 8.88    | 8.80   |
| N-L1 (not covered) | light `#94a3b8`    | 2.37      | 2.37     | 2.37    | 2.37   |
| N-L2 (not covered) | light `#64748b`    | 1.53      | 1.51     | 1.51    | 1.53   |
| N-L3 (not covered) | light `#10b981`    | 2.36      | 2.36     | 2.36    | 2.36   |
| Negative control   | C-L1, `mask.color` | 2.31      | 2.31     | 2.31    | 2.29   |

- **Firefox dark values:** they sit exactly at the top of their rounding ranges. A pure-white fill against the rounded-down composite `9,9,10` gives 19.9038, the range maximum. There is no headroom, and an upward engine shift fails closed.
- **Cause of the dark-scheme spread:** Chromium and Firefox composite `rgba(0,0,0,0.6)` over `#18181b` to `9,9,10`; WebKit gives `10,10,11`. This is why Amendment A2 replaced the fixed ±0.10 tolerance.

**Layer L2 (rendered, anti-aliased; reported only, KL-4).** Median contrast of pixels with coverage ≥ 0.5, with fully covered / ink pixel counts:

| Condition | Scale | Chromium       | Firefox                    | WebKit         |
| --------- | ----- | -------------- | -------------------------- | -------------- |
| C-L1      | 1×    | 4.28 (3/74)    | 4.34 (3/73)                | 3.90 (0/75)    |
| C-L1      | 2×    | 5.13 (81/232)  | 5.13 (78/222) ng, 5.07 vue | 5.00 (77/230)  |
| C-D1      | 1×    | 15.36 (3/74)   | 15.51 (3/73)               | 13.22 (0/75)   |
| C-D1      | 2×    | 19.57 (81/232) | 19.90 ng, 19.40 vue        | 18.80 (77/230) |

At 1×, WebKit renders no fully covered stroke pixel, and the light-scheme anti-aliased median is 3.90. The 3:1 guarantee is for the specified colours (W3C evaluates contrast with anti-aliasing turned off). KL-4 records the thin-stroke effect.

## 4. Parity (Prime comparison)

- **Angular `dataview/loading`, after item A (`57ffb74`):** 0 material differences, pixel ratio 0.0022 (unchanged from E4-V1).
- **After item B (`f281e2a`):** 0 material differences, pixel ratio 0.0026, verdict "review image". The deliberate icon-colour difference appears as pixels only, not as a computed-style row. The explanatory differences in both runs are the `box-sizing` lines that every DataView row shows (GAP-098).
- **Vue:** `dataview/loading [vue]` remains `no-prime-reference` (G3E-7).
- **Playbook:** the `dataview` row classification is unchanged.

## 5. Repository checks (local, at `f281e2a` unless stated)

| Check                                                    | Result                                                                                                                                                                                                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run typecheck`, `build`, `test`                    | Exit 0.                                                                                                                                                                                                                                                  |
| `pnpm run lint`                                          | Exit 1 on pre-existing errors in files this branch does not touch (existing ESLint debt) and on git-ignored local scratch. ESLint on every branch file: exit 0.                                                                                          |
| `pnpm run provenance:validate -- --base-ref origin/main` | The diff check passes. The only FAIL is the pre-existing `packages/ng/src/accordion/accordion.spec.ts` entry (GAP-094: the validator stops at its first failure). All 11 files this branch adds under `packages/*/{src,test,e2e}` have manifest entries. |
| `pnpm run size:validate`                                 | Exit 0. The deltas are measured against a stored baseline and include packages this branch does not touch, so they are not attributable.                                                                                                                 |
| `pnpm run format:check`                                  | Exit 1. 511 tracked files are flagged repo-wide (pre-existing). The 3 branch-touched files that are flagged (`base-component.ts`, `vue-style-sheet.ts`, `g3e-port.mjs`) were already flagged before this branch.                                         |

## 6. Docker CI simulation (Playwright 1.63, Linux arm64)

| Run                       | Result                                                                                                                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci ng` at `f281e2a`      | Strict job 368 passed, 1 failed (see §8). All accessibility checks exit 0. Only failing G3 step: `g3d` (inherited GAP-097 Drawer).                                                                                                                                                                    |
| `ci vue` at `f281e2a`     | Strict job 320 passed, 1 failed (see §8). All accessibility checks exit 0. Failing steps: `g3b` (inherited U2 Vue WebKit Card) and `g3d` (inherited GAP-097).                                                                                                                                         |
| `regression` at `57ffb74` | 2472 passed; 7 failed, all inherited (GAP-097 ×6, U2).                                                                                                                                                                                                                                                |
| `regression` at `f281e2a` | 2469 passed. 64 failed = the same 7 inherited + 57 Angular WebKit `page.goto: Could not connect to localhost: Connection refused`: the Angular Storybook server inside the container died during the WebKit pass (infrastructure). The same Angular WebKit specs passed in this commit's `ci ng` run. |
| GAP-124 suite             | 27/27 at `57ffb74` (item A + React); 81/81 at `f281e2a`; 81/81 at `de7e66c`.                                                                                                                                                                                                                          |

## 7. Known limitations (recorded in `MIGRATION.md`)

- **KL-1:** a standalone spinning icon does not rotate unless an Angular or Vue Ultimate component has registered the rule in that document.
- **KL-2:** the rule is a document-level class selector. In a document that also renders an Angular or Vue Ultimate component, a React spinner rotates too. React-only documents are unchanged.
- **KL-3:** over darker or saturated light-scheme content under the mask (N-L1..N-L3), the icon is below 3:1.
- **KL-4:** the spinner stroke (about 1.17 CSS px) renders fainter than its specified colour at low device pixel ratios (§3, L2).

## 8. Rulings, deviations and flaky results

- **Amendment A2 (user):** the fixed ±0.10 L1 tolerance was replaced by the per-condition rounding range (`71488e5`).
- **R5:** the provenance validator cannot exit 0 on this repository (GAP-094). Acceptance was its diff check plus a branch-scoped manifest check.
- **R6:** `packages/vue-core/src/styling/additional-preset-keys.spec.ts` gained `u-icon-spin` in its exact registration-order arrays.
- **R7:** prettier re-padded the whole `PARITY_PLAYBOOK.md` table in item A (`57ffb74`), item B (`6f344d4`) and the records reconciliation (`f525f7a`). `git diff -w` shows only the `dataview` row and separator rows.
- **R8:** the Task 7 selector `.u-data-view > [role="status"] svg` is unreached by any Vue G3-E story, so it was added to the Vue reach table's K list (`60f5e39`). The Angular table needed no change.
- **R9 (final review):** the records were reconciled and the tests made self-proving (`37c2192`, `00818bf`, `f525f7a`, `f281e2a`).
- **R11:** the contrast spec's first story-visibility wait failed twice at the default 5 s on a cold Storybook load: Angular Firefox (L2 report-only test) and Vue WebKit (custom-class test), both before any measurement. `de7e66c` raised that wait to 15 s. Afterwards: 162/162 locally (3 repeats × 6 projects) and 81/81 in Docker.
- **Other flaky results:** five Angular Firefox Menu tests failed once in a full CI simulation and passed when re-run alone. They are unrelated to this branch.
- **Spec §6.2 vs Plan Task 7:** the Spec asked for a BASE_SOURCES-style record. The Plan placed the rule in `RETAINED` with the SR-1 comment, because BASE_SOURCES indexes Prime base rules.
- **Correction:** CI does run `pnpm run format:check` (`.github/workflows/ci.yml:54`). That step was already red on `main` before this branch.

## 9. Rollback

| To revert | Commits (newest first)                                           | Note                                                                                                                           |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Item B    | `de7e66c`, `00818bf`, `6f344d4`, `60f5e39`, `464c524`, `890b840` | `71488e5` is docs-only and needs no revert. In `f525f7a`, remove the item B sentence from the Playbook `dataview` row by hand. |
| Item A    | `37c2192`, `57ffb74`, `736c308`, `e35028b`, `228e196`            | In `f525f7a`, restore the earlier wording by hand.                                                                             |
| Fixture   | `3f17ab3`                                                        | Only after A and B are reverted.                                                                                               |

- **Reverting B alone:** clean apart from the one Playbook note in `f525f7a`.
- **Reverting A while B is present:** conflicts across the re-padded Playbook table (R7). Resolve by deleting the item A sentence and running `npx prettier --write docs/architecture/PARITY_PLAYBOOK.md`.

## 10. Follow-ups (not done here)

- Reconcile the GAP-124 entry in `BLUEPRINT_GAPS.md` and decide its status at closeout (a separate authorization).
- The existing Vue reach-table K entry for `.u-data-view > [role="status"]` cites `DataView.vue:134`; the line is now 136.
- `measureIconContrast` does not restore the icon's inline style if a capture throws. The test fails anyway, so there is no false pass.
- The Docker Angular Storybook server crash under memory pressure (8 GB VM) affects long runs.
