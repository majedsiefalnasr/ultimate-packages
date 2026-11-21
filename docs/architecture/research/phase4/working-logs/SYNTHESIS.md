# Phase 4 evidence synthesis (draft for user review)

Date: 2026-11-21. Status: draft. Nothing here is a verdict, a priority, a fix or a ticket; those belong to Phase 5.

- Product: Ultimate, branch `develop`, pinned revision `91a8472547e34c6e92456f2b98270a1555e3a2db`. The product repository was not edited.
- Oracles (ADR-048): Angular = PrimeNG 21.1.9, React = PrimeReact 10.9.9, Vue = PrimeVue 4.5.5.
- Evidence is source reads only. No product tests, browser, visual, assistive-technology or runtime checks were run, except one Angular host probe (class and style coexistence, 2026-11-21).
- Classes: C complete, P partial, M missing, I intentional (needs an in-force ADR or a user ruling), N not applicable, U unresolved.
- Method item 15 applies: component results are distributions per framework, with no percentages and no single verdict.

## 1. Coverage

- 100 of 100 canonical Prime families are represented: 60 reports in `batch2`–`batch7`, 37 in `batch8`, and 3 pilots (`pilot/dialog.md`, `pilot/tabs.md`, `pilot/table.md`).
- The Table pilot is bounded: 43 rows per framework, with cell-level keyboard, filter-menu keyboard and ARIA, loading, empty message, variants, responsive layout, templates, row reorder and context menu still excluded.
- The shared-foundation track (`foundations/shared-foundation-audit.md`) has a 15-item ledger, all ruled or verified by script.

## 2. Capability counts across all reports

Each cell is the sum of capability rows classified C/P/M/I/N/U. Rows are not equal in weight and families have different row counts, so these are inventory counts, not a coverage measure. Counts come from the per-report matrices, recounted by script. Reports without a parseable matrix table were read from their stated distribution. Every framework column sums to its row total.

| Group                        | Reports | Angular                        | React                          | Vue                            |
| ---------------------------- | ------: | ------------------------------ | ------------------------------ | ------------------------------ |
| batch2                       |      10 | 46/35/40/1/110/1               | 66/63/74/0/30/0                | 50/32/55/0/96/0                |
| batch3                       |      10 | 56/35/38/0/28/0                | 36/33/55/0/33/0                | 55/16/51/0/35/0                |
| batch4                       |      10 | 48/61/61/0/20/0                | 33/49/68/0/40/0                | 44/42/82/0/22/0                |
| batch5                       |      10 | 53/68/95/0/12/0                | 45/62/88/0/32/0                | 58/51/97/0/21/0                |
| batch6                       |      10 | 56/27/28/0/55/0                | 30/41/43/1/51/0                | 55/19/47/0/45/0                |
| batch7                       |      10 | 55/59/103/0/42/0               | 55/49/90/0/65/0                | 88/37/88/0/46/0                |
| batch8                       |      37 | 230/169/305/0/81/0             | 211/127/333/1/113/0            | 247/104/368/0/66/0             |
| pilots (Dialog, Tabs, Table) |       3 | 19/22/31/0/4/0                 | 16/18/36/0/6/0                 | 25/9/39/0/3/0                  |
| **All**                      | **100** | **563/476/701/1/352/1** (2094) | **492/442/787/2/370/0** (2093) | **622/310/827/0/334/0** (2093) |

Reading notes:

- Missing is the largest class in every framework. Part of that is structural: under D-PT, `pt` and `ptOptions` are M wherever Prime offers them, and `unstyled` and per-instance `dt` are P in Angular and M in React/Vue (D-SHARED #5). Every family carries these rows.
- Not applicable is large because a Prime framework may not ship the component at all. Families that are all N for a framework:
  - Angular (8): chips, datascroller, multistatecheckbox, tristatecheckbox, messages, deferredcontent, mention, tabmenu.
  - React (5): imagecompare, dynamicdialog, iftalabel, animateonscroll, fluid.
  - Vue (5): datascroller, multistatecheckbox, tristatecheckbox, messages, mention.
- Excluding those families, the counts are: Angular (92 families) 563/476/701/1/179/1; React (95) 492/442/787/2/313/0; Vue (95) 622/310/827/0/223/0.
- Panel menu is not rectangular by design: Angular 17 rows, React and Vue 16 (row 5 split in Angular).

## 3. Families with no working capability rows

These families have no row classified C or P in the named framework, apart from N rows. The count is of rows, so a source read of the specific report is needed before calling a component absent.

- Angular: organizationchart, chart. With only two P rows each: editor, tree, treeselect, treetable.
- React: badge, inputgroup, chart, editor, ripple, tree, treeselect, treetable.
- Vue: chart, editor, fluid, tabmenu, tree, treeselect, treetable.

Editor rows keep their classes (ruling 2026-11-20). No ADR defers Editor, so none of its rows is I (ADR-055 requires its own Spec and Plan).

## 4. Intentional and unresolved

- I cells (3): InputMask Angular (1), Mention React (1), ScrollTop React (1, token consumption only, ADR-067).
- U cells (1): MeterGroup Angular row 5 (needs a rendered vertical group; percentage heights depend on layout). ConfirmDialog Angular row 8 was ruled N + reference defect on 2026-11-21 (see `batch8/confirmdialog.md`).
- Twelve further U cells were resolved on 2026-11-21 by reading source only: Textarea Vue 4 (partial), Dock React positions and Vue hidden-item filtering (complete), Breadcrumb React/Vue home icon (n/a) and Vue item class (missing), Timeline Angular 8 (complete, by the Card ruling's precedent rather than a Timeline probe), SpeedDial Angular 18 (partial), Splitter row 3 in all three frameworks (partial with a source-read clamp defect when a splitter has three or more panels), DynamicDialog Vue 9 (partial). None was rendered or run.
- Card, Chip, ToggleButton, Tag, Paginator and Carousel Angular were settled by the 2026-11-21 host probe for class and style only; aria and other root attributes were not probed.

## 5. Shared foundations (outside family counts)

Ledger from `foundations/shared-foundation-audit.md` §8, classes Angular / React / Vue:

| #   | Item                                           | Class | Basis                                                  |
| --- | ---------------------------------------------- | ----- | ------------------------------------------------------ |
| F1  | PrimeUIX API surface                           | C/C/C | Verified by script                                     |
| F2  | Aura values for shared keys (79 of 79)         | C/C/C | Verified by script                                     |
| F3  | Aura key coverage (79 of 88)                   | P/P/P | Ruled                                                  |
| F4  | Preset top-level `css`                         | M/M/M | Ruled (C2)                                             |
| F5  | Runtime theme switching reaches mounted styles | P/P/P | Ruled (C1): `theme:change` emitted, nothing subscribes |
| F6  | CSS layer-order registration                   | P/P/P | Ruled (C3)                                             |
| F7  | Style registration key matches Aura key        | C/P/C | Ruled (C4): React registers 44 non-Aura names          |
| F8  | Components consume tokens through `dt()`       | C/P/C | Ruled (C4, C5)                                         |
| F9  | Shared structural style modules (12 of 93)     | P/P/P | Ruled (C8)                                             |
| F10 | `uix-styles/base` in use and renamed           | P/P/P | Ruled (C6)                                             |
| F11 | Motion engine                                  | C/C/C | Verified by script                                     |
| F12 | Motion adoption in components                  | P/P/P | Ruled                                                  |
| F13 | Motion default class-name prefix               | P/P/P | Ruled (C7)                                             |
| F14 | Prefix, layer and SSR attribute renames        | C/C/C | Ruled                                                  |
| F15 | Per-instance `dt` and `unstyled`               | P/M/M | Ruled (D-SHARED #5)                                    |

Distribution of the 15 items: Angular 6/8/1/0, React 4/9/2/0, Vue 6/7/2/0 (C/P/M/N). These count foundation items, not components.

## 6. Cross-cutting findings recorded once

From `DECISIONS.md` (D-PT, D-SHARED, rulings):

- React token architecture (ADR-067): every non-exception React family carries an explicit Aura-token row, classed P with the style-file and key evidence (user ruling option B, 2026-11-21).
- Angular and Vue declare Ultimate-only `dt()` paths that do not resolve for nine families; their Aura-token rows are P (user ruling 2026-11-19).
- Vue attribute fall-through loss where `inheritAttrs` is disabled without rebinding `$attrs` (D-SHARED #2).
- Input and field state-class names differ between producers (InputText) and consumers (IftaLabel, FloatLabel) in Angular and Vue (D-SHARED #3); impact is judged per family row.
- Angular `unstyled` and `dt` are declared but never read (P); React and Vue lack both (M, or N for React `dt`).
- Runtime theme switching is not propagated in any framework (F5).

## 7. Table pilot findings (source only)

- Established: sort, filter match modes, pagination, selection, row edit, expansion, grouping and virtual scrolling exist in all three frameworks, several with narrower options than Prime.
- Row keyboard movement, Enter/Space selection and `aria-sort` are C. Ctrl/Cmd+A is C in Angular and Vue.
- Missing in all three: keyboard sort on headers, accessible names for selection controls, `scrollable`/`scrollHeight` (the CSS exists in `uix-styles` but nothing applies it), the global filter, column resize/reorder, frozen columns, CSV export and state persistence.
- Row 38 (`aria-sort`) is C with a flag: Prime writes `none` on unsorted sortable columns and the product omits it. Whether that is equivalent to the ARIA default was not checked against the spec in this pass. This is an agent reading the user can override. The related gap, header sorting by keyboard, is counted separately in row 37.

## 8. Rulings and reference defects

- `DECISIONS.md` has about 75 bullet entries after its Open rulings heading; about 42 of them mention a reference defect (docs promise versus pinned source). This is an approximate text search, not a per-ruling audit. The closeout will list them exactly.
- The pinned source is the oracle where docs and source differ. A ruling is individual, never a blanket authorization.
- The closeout document will carry the rulings and reference defects in curated form, taken from `DECISIONS.md` and the family reports.

## 9. Known issues and limits

- `batch5/organizationchart.md`: its "Row tally" table was stale (it predated rows 24 and 25) and was corrected on 2026-11-21 to match the matrix row by row (React P gained row 25 and N gained row 24; Vue P now lists 25 instead of 23 and M gained 23 and 24). The distribution (Angular 0/0/24/0/1/0, React 8/6/7/0/4/0, Vue 8/6/10/0/1/0) was already right. `recount3.mjs` still prints a `statustable` DIFF for this file because it reads row numbers in that table as counts; that is a script artifact, not a data error.
- Aggregated counts depend on per-report classification. Cross-checks were arithmetic (matrix against stated distribution) and sampled citation resolution (646 citations in four reports); no report was re-verified semantically in full.
- No rendering, theme switching, SSR, animation, reduced-motion, assistive-technology or keyboard execution was performed. Every "complete" is a source-read claim, not a verified run.
