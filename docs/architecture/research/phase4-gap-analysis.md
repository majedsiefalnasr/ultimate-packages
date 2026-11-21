# Phase 4 Gap Analysis: Closeout Record

Status: closeout record of an evidence-only analysis. Nothing here is a verdict, priority, fix or ticket; those belong to a later phase.

Product: Ultimate, branch develop, pinned revision 91a8472547e34c6e92456f2b98270a1555e3a2db. Oracles (ADR-048): PrimeNG 21.1.9 (Angular), PrimeReact 10.9.9 (React), PrimeVue 4.5.5 (Vue).

## Scope and limits

- Evidence is source reads only. No product tests, browser, visual, assistive-technology or runtime checks were run, except one Angular host probe for class and style coexistence (2026-11-21).
- Family reports are kept in `docs/architecture/research/phase4/` (102 files: `batch1`–`batch7`, `pilot`, `foundations`). Candidate drafts, review logs, the working decision log and recovery notes are process records and are not kept.
- Report references such as batch7/confirmdialog.md or pilot/table.md are relative to `docs/architecture/research/phase4/`.
- Rulings superseded later are marked in place so the audit trail stays intact.

## Open items at closeout

- MeterGroup Angular row 5 (vertical geometry) is the only unresolved cell (U). It stays U: a rendered check is outside this evidence-only phase and is a candidate for a later phase.
- Timeline Angular row 8 (root class and style) is classified C by precedent from the Card ruling, not by a Timeline probe. Timeline uses the same host-binding shape as Card, so C stays. The user may object; that would be a one-cell change.
- Card, Chip, ToggleButton, Tag, Paginator and Carousel (Angular) were settled for class and style only; aria and other root attributes were not probed.
- The Table pilot is bounded to 43 rows. Excluded capabilities are not researched.

## Synthesis

Date: 2026-11-21. Status: draft. Nothing here is a verdict, a priority, a fix or a ticket; those belong to Phase 5.

- Product: Ultimate, branch `develop`, pinned revision `91a8472547e34c6e92456f2b98270a1555e3a2db`. The product repository was not edited.
- Oracles (ADR-048): Angular = PrimeNG 21.1.9, React = PrimeReact 10.9.9, Vue = PrimeVue 4.5.5.
- Evidence is source reads only. No product tests, browser, visual, assistive-technology or runtime checks were run, except one Angular host probe (class and style coexistence, 2026-11-21).
- Classes: C complete, P partial, M missing, I intentional (needs an in-force ADR or a user ruling), N not applicable, U unresolved.
- Method item 15 applies: component results are distributions per framework, with no percentages and no single verdict.

### 1. Coverage

- 100 of 100 canonical Prime families are represented: 60 reports in `batch1`–`batch6`, 37 in `batch7`, and 3 pilots (`pilot/dialog.md`, `pilot/tabs.md`, `pilot/table.md`).
- The Table pilot is bounded: 43 rows per framework, with cell-level keyboard, filter-menu keyboard and ARIA, loading, empty message, variants, responsive layout, templates, row reorder and context menu still excluded.
- The shared-foundation track (`foundations/shared-foundation-audit.md`) has a 15-item ledger, all ruled or verified by script.

### 2. Capability counts across all reports

Each cell is the sum of capability rows classified C/P/M/I/N/U. Rows are not equal in weight and families have different row counts, so these are inventory counts, not a coverage measure. Counts come from the per-report matrices, recounted by script. Reports without a parseable matrix table were read from their stated distribution. Every framework column sums to its row total.

| Group                        | Reports | Angular                        | React                          | Vue                            |
| ---------------------------- | ------: | ------------------------------ | ------------------------------ | ------------------------------ |
| batch1                       |      10 | 46/35/40/1/110/1               | 66/63/74/0/30/0                | 50/32/55/0/96/0                |
| batch2                       |      10 | 56/35/38/0/28/0                | 36/33/55/0/33/0                | 55/16/51/0/35/0                |
| batch3                       |      10 | 48/61/61/0/20/0                | 33/49/68/0/40/0                | 44/42/82/0/22/0                |
| batch4                       |      10 | 53/68/95/0/12/0                | 45/62/88/0/32/0                | 58/51/97/0/21/0                |
| batch5                       |      10 | 56/27/28/0/55/0                | 30/41/43/1/51/0                | 55/19/47/0/45/0                |
| batch6                       |      10 | 55/59/103/0/42/0               | 55/49/90/0/65/0                | 88/37/88/0/46/0                |
| batch7                       |      37 | 230/169/305/0/81/0             | 211/127/333/1/113/0            | 247/104/368/0/66/0             |
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

### 3. Families with no working capability rows

These families have no row classified C or P in the named framework, apart from N rows. The count is of rows, so a source read of the specific report is needed before calling a component absent.

- Angular: organizationchart, chart. With only two P rows each: editor, tree, treeselect, treetable.
- React: badge, inputgroup, chart, editor, ripple, tree, treeselect, treetable.
- Vue: chart, editor, fluid, tabmenu, tree, treeselect, treetable.

Editor rows keep their classes (ruling 2026-11-20). No ADR defers Editor, so none of its rows is I (ADR-055 requires its own Spec and Plan).

### 4. Intentional and unresolved

- I cells (3): InputMask Angular (1), Mention React (1), ScrollTop React (1, token consumption only, ADR-067).
- U cells (1): MeterGroup Angular row 5 (needs a rendered vertical group; percentage heights depend on layout). ConfirmDialog Angular row 8 was ruled N + reference defect on 2026-11-21 (see `batch7/confirmdialog.md`).
- Twelve further U cells were resolved on 2026-11-21 by reading source only: Textarea Vue 4 (partial), Dock React positions and Vue hidden-item filtering (complete), Breadcrumb React/Vue home icon (n/a) and Vue item class (missing), Timeline Angular 8 (complete, by the Card ruling's precedent rather than a Timeline probe), SpeedDial Angular 18 (partial), Splitter row 3 in all three frameworks (partial with a source-read clamp defect when a splitter has three or more panels), DynamicDialog Vue 9 (partial). None was rendered or run.
- Card, Chip, ToggleButton, Tag, Paginator and Carousel Angular were settled by the 2026-11-21 host probe for class and style only; aria and other root attributes were not probed.

### 5. Shared foundations (outside family counts)

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

### 6. Cross-cutting findings recorded once

From the working decision log, not kept in this repository (D-PT, D-SHARED, rulings):

- React token architecture (ADR-067): every non-exception React family carries an explicit Aura-token row, classed P with the style-file and key evidence (user ruling option B, 2026-11-21).
- Angular and Vue declare Ultimate-only `dt()` paths that do not resolve for nine families; their Aura-token rows are P (user ruling 2026-11-19).
- Vue attribute fall-through loss where `inheritAttrs` is disabled without rebinding `$attrs` (D-SHARED #2).
- Input and field state-class names differ between producers (InputText) and consumers (IftaLabel, FloatLabel) in Angular and Vue (D-SHARED #3); impact is judged per family row.
- Angular `unstyled` and `dt` are declared but never read (P); React and Vue lack both (M, or N for React `dt`).
- Runtime theme switching is not propagated in any framework (F5).

### 7. Table pilot findings (source only)

- Established: sort, filter match modes, pagination, selection, row edit, expansion, grouping and virtual scrolling exist in all three frameworks, several with narrower options than Prime.
- Row keyboard movement, Enter/Space selection and `aria-sort` are C. Ctrl/Cmd+A is C in Angular and Vue.
- Missing in all three: keyboard sort on headers, accessible names for selection controls, `scrollable`/`scrollHeight` (the CSS exists in `uix-styles` but nothing applies it), the global filter, column resize/reorder, frozen columns, CSV export and state persistence.
- Row 38 (`aria-sort`) is C with a flag: Prime writes `none` on unsorted sortable columns and the product omits it. Whether that is equivalent to the ARIA default was not checked against the spec in this pass. This is an agent reading the user can override. The related gap, header sorting by keyboard, is counted separately in row 37.

### 8. Rulings and reference defects

- The working decision log had about 75 bullet entries after its Open rulings heading; about 42 of them mention a reference defect (docs promise versus pinned source). This is an approximate text search, not a per-ruling audit. Exact per-ruling listing is not done.
- The pinned source is the oracle where docs and source differ. A ruling is individual, never a blanket authorization.
- This record carries the rulings and reference defects in curated form, taken from the working decision log and the family reports.

### 9. Known issues and limits

- `batch4/organizationchart.md`: its "Row tally" table was stale (it predated rows 24 and 25) and was corrected on 2026-11-21 to match the matrix row by row (React P gained row 25 and N gained row 24; Vue P now lists 25 instead of 23 and M gained 23 and 24). The distribution (Angular 0/0/24/0/1/0, React 8/6/7/0/4/0, Vue 8/6/10/0/1/0) was already right. `recount3.mjs` still prints a `statustable` DIFF for this file because it reads row numbers in that table as counts; that is a script artifact, not a data error.
- Aggregated counts depend on per-report classification. Cross-checks were arithmetic (matrix against stated distribution) and sampled citation resolution (646 citations in four reports); no report was re-verified semantically in full.
- No rendering, theme switching, SSR, animation, reduced-motion, assistive-technology or keyboard execution was performed. Every "complete" is a source-read claim, not a verified run.

## Method, rulings and decisions

Status: reconstructed 2026-11-17 from decisions the user agreed in chat. Outside the repo; no repo writes.
Repo: Ultimate (branch develop). Pinned revision: 91a8472547e34c6e92456f2b98270a1555e3a2db.
Scope: gap analysis + evidence documentation only. Product fixes and prioritization are Phase 5. No specs, tickets, or publishing.

### Method (agreed)

1. Scope: components (100 Prime reference families) AND shared foundations (primeuix utils/styled/styles/motion; presets Aura/Lara/Material/Nora; Ultimate has Aura only). Shared foundations are the target architecture for Angular, React and Vue in Ultimate. Compare the capability Prime gives each framework vs how Ultimate provides it. Implementation location alone is not a gap; presence of a shared foundation does not prove a framework uses it: verify actual use.
2. Unit: capability within a component, per framework. Component summary aggregates.
3. Oracle per framework: Angular=PrimeNG 21.1.9, React=PrimeReact 10.9.9, Vue=PrimeVue 4.5.5 (ADR-048). Cross-framework differences in Prime are reference facts (not a gap where Prime lacks it).
4. Mapping by function/behavior, not names. Record basis + evidence on both sides. Unclear mapping stays pending.
5. Classes: complete / partial / missing / intentional architectural difference / not applicable, plus "unresolved" when evidence is insufficient. Classification is separate from verification level. Name/API presence without working implementation is not complete.
6. "Intentional difference" only with an accepted in-force ADR or explicit user ruling. Old comments, phase non-goals, and superseded ADRs (030/031/039/040) are context only.
7. "N/A" only when the capability is absent from that framework's Prime reference or its technical condition does not apply, with a documented reason. Deliberately not offering a Prime capability = intentional difference needing a decision.
8. Known product defects factor into the verdict (broken/unwired is not complete). Link the existing inventory record; state source-read vs test.
9. Verification limits travel with each evidence item. Env failures are not product defects; PostCSS-disabled passes are not visual proof. Missing evidence = unresolved + required check noted.
10. Equivalent behavior with different API shape counts as complete; document the usage difference.
11. Prime's own defects (docs vs pinned source) = "reference defect". Pinned source wins over docs. If it affects classification: unresolved until the user rules. User ruling (turn 30): decide each reference defect as it appears.
12. Platform tools (CLI/MCP/metadata/AI) are a separate track.
13. One pinned Ultimate revision; keep prior evidence's revision/limits.
14. Pilot first, review in chat before generalizing.
15. Component summary = distribution per framework; no percentages or single verdict.
16. Limited runs of existing checks allowed without modifying product/config; setup needed = blocker, unresolved.
17. Refinements (approved): default-value difference is a flag on the item, not a 6th class (complete if configurable to match Prime, else partial); read implementation before classifying; use the pinned Prime archive when classification depends on defaults/presence, record incompleteness, or docs/source conflict; items blocked by superseded ADRs = "missing" + per-family decisions-needed appendix.

### D-PT (user decision)

`pt` and `ptOptions` are separate capability rows. Each is **missing** wherever the corresponding Prime oracle offers it, and **n/a** where Prime does not. Implementation scope/timing is Phase 5.

### D-SHARED (cross-cutting findings, recorded once; family reports reference by number)

1. React Aura-token architecture: under ADR-067 (`docs/architecture/DECISIONS.md:787-803`), React components with an Aura style module must consume tokens through `dt()` and register the correct preset key. Exceptions are mention, multi-state-checkbox, tri-state-checkbox, data-scroller, button-group, scroll-top, scroller, and table. Record each component's actual style-module/key evidence; do not apply a blanket verdict from this rule. User ruling 2026-11-21 (option B): every non-exception React family report carries an explicit Aura-token row (NG/Vue C where `dt()` paths resolve, React P + architecture with the style-file and registration-key evidence). Applied to the 23 reports that had none: checkbox, radiobutton, inputnumber, inputotp, slider, card, knob, speeddial, splitter, tieredmenu, splitbutton, menubar, confirmpopup, contextmenu, megamenu, blockui, inputtext, drawer, popover, orderlist, panelmenu and the Dialog and Tabs pilots. Reports that already count an equivalent row (e.g. visual-paint or token-wiring rows in ToggleSwitch, SelectButton, ToggleButton, ProgressSpinner, ScrollPanel) were left unchanged; InputMask and AvatarGroup have no Aura key and were not given a row. Counts were recomputed mechanically from each report. Normalization (same date, user-approved): the React Aura-token cell is P in every family; Breadcrumb, Dock, OrganizationChart and Panel moved M→P and FloatLabel N→P (React 1/4/3/0/5/0).
2. Vue attribute fall-through loss: components that disable inheritAttrs without rebinding $attrs drop root attributes (id/class/aria). Counted missing/partial per family where Prime forwards them.
3. Input/field state-class mismatches: producers and dependent field styles use inconsistent root/state class names (e.g. Angular InputText emits `u-inputtext`, `p-filled`, `p-invalid` at `packages/ng/src/input-text/input-text-style.ts:38-42`, while IftaLabel/FloatLabel styles target `u-input-text`, `u-filled`, `u-invalid` at `packages/ng/src/ifta-label/ifta-label-style.ts:30,40` and `packages/ng/src/float-label/float-label-style.ts:42-45,111`; Vue InputText emits `u-input-text`, `p-invalid` at `packages/vue/src/input-text/input-text-style.ts:76-79`, while related label styles target `u-filled`/`u-invalid` at `packages/vue/src/ifta-label/ifta-label-style.ts:33,43` and `packages/vue/src/float-label/float-label-style.ts:43-46,112`). Record concrete producer/consumer evidence and classify each affected family row independently; this cross-cutting note alone does not establish impact or verdict.
4. `unstyled` and per-instance `dt` are separate capabilities. Ultimate Angular declares these inputs but does not consume them, so each is partial. Ultimate React and Vue lack unstyled mode, so those cells are missing. For per-instance `dt`, React is N/A where its PrimeReact oracle has no `dt` API; otherwise React/Vue without a matching product input are missing.
   Item 4 (default-value differences) is covered by method item 17: record as a row flag, not a separate class.

### Open rulings

- Knob arrows: user agreed (turn 30) that using `step` = complete, with Prime source difference (literal ±1 in pinned PrimeNG/PrimeReact vs docs "step") recorded as reference defect. Applied and verified in batch2: NG 6/5/3/0/0/0, React 6/4/3/0/1/0, Vue 7/4/3/0/0/0.
- Old unresolved rows: ImageCompare Vue slider naming, Fieldset NG label association and Avatar React image failure were ruled 2026-11-18 (see entries below). Card NG root class/style was settled for class and style by the 2026-11-21 Angular host probe (see the Card entry below).

### Batch 4 reference-defect rulings

- Breadcrumb Angular: user chose pinned source over documented promises for `aria-current` and hidden separators. These absent Prime capabilities are N/A for Prime parity; record Ultimate additions separately. This ruling does not establish accessibility quality.
- Menubar Angular: user chose pinned PrimeNG source for nested roles (`menubar` in Prime versus `menu` in Ultimate). Record documentation conflict as reference defect; broader ARIA result remains partial.
- Menubar React: user chose pinned PrimeReact source for root-list naming; do not require the documented label forwarding absent from source. Other ARIA differences must have independent evidence before sustaining partial.
- These are individual rulings, not blanket authorization to resolve future reference defects.

### Batch 5 reference-defect rulings

- Drawer fullscreen: compare the user-visible full-screen effect as one capability. `position="full"` counts as equivalent where source evidence supports viewport fill; PrimeNG's mismatch between the `fullScreen`-driven class/animation and `position="full"`-driven `data-p` state is recorded as a reference defect, not a separate required API (user agreed during batch 5 review).
- PanelMenu Angular nested roles: use pinned PrimeNG source (`tree`) as the oracle over reference docs (`group`); where Ultimate also uses `tree`, classify that role behavior complete and record the docs/source conflict as a reference defect. Keep independent header/region accessibility gaps separate (user agreed during batch 5 review).
- OrganizationChart Vue `selectable:false`: use pinned PrimeVue runtime over docs. Since the reference source emits selection despite the flag, classify the capability “ignore click when selectable=false” as N/A for PrimeVue and record the docs/source conflict; Ultimate's stricter blocking behavior is an Ultimate-specific extra (user ruled during batch 5 review).
- OrganizationChart React `expanded:false`: PrimeReact source suppresses child rendering for nodes with `expanded === false`, while Ultimate permits opening such a node through its toggle. Classify the row partial and record a PrimeReact reference defect (user ruled during batch 5 review).
- ConfirmPopup trigger `aria-expanded` / `aria-controls`: pinned NG/React/Vue sources do not add these despite docs. Classify N/A in all three and record a docs/source reference defect (user ruled during batch 5 review).
- ConfirmPopup React root role/`aria-modal`: pinned PrimeReact source sets neither despite docs; classify the docs-promised capability N/A for PrimeReact and record Ultimate React's `role="alertdialog"` as an extra (user ruled during batch 5 review).

### Batch 6 reference-defect rulings

- Mention React ARIA (user approved 2026-11-18): use pinned PrimeReact source, which implements none of the docs-promised combobox/listbox roles and ARIA. Classify row 23 N/A, record the docs/source reference defect, and record Ultimate's existing ARIA as an extra. No product changes or accessibility-quality conclusion follow from this ruling. Mention React distribution becomes 4/9/12/1/2/0 (C/P/M/I/N/U).

- InputGroup Angular `fluid` property (user approved 2026-11-18): classify activation via a component `fluid` input N/A. Pinned PrimeNG InputGroupStyle checks `instance.fluid` (inputgroup/style/inputgroupstyle.ts:45), but InputGroup and its BaseComponent expose no such property. Record the unreachable class condition as a reference defect. This ruling does not classify other full-width layout mechanisms.

- InputText React visual `iconPosition` (user approved 2026-11-18): row 15 N/A for visible icon positioning. Pinned InputTextBase.js:30 declares the prop; InputText.js:21 only exposes it to pt metadata context. There is no built-in visual position behavior. Document this API/behavior limitation and retain pt-context coverage under the separate pt row. Do not label the prop entirely unused.

- BlockUI full-screen coverage (user approved 2026-11-18): row 2 P in Angular, React and Vue. Inline fixed masks can be constrained by an ancestor establishing a fixed-position containing block; pinned Prime appends/moves the mask to body. Judge observable coverage, not portal placement alone. Source-based finding; transformed-ancestor browser verification remains unrun. Final BlockUI C/P/M/I/N/U: NG 3/4/5/0/3/0; React 3/5/6/0/1/0; Vue 5/3/5/0/2/0.

- KeyFilter preset semantics (user approved 2026-11-18): row 03 stays P [default-differs] in React and Vue. Prime tests the single typed character against preset regexes; Ultimate tests the would-be value (e.g. `-` accepted only at start; Vue alphanum case-insensitive vs PrimeVue case-sensitive). No in-force ADR, so not I. Counts unchanged: NG 10/1/4/0/2/0; React 8/3/2/0/4/0; Vue 8/3/2/0/4/0.

- Card NG root class/style (user approved 2026-11-18): the deprecated `styleClass` input is not itself a gap. Native `class` and `style` on the host are the functional replacement, and the row is complete only if a runtime check confirms they coexist with the component root class `u-card u-component` and update dynamically. Until that check runs, the row stays U. Do not classify it as partial merely because the name differs. Resolved 2026-11-21: a jsdom host probe confirmed that consumer static and dynamic `class` and `style` coexist with `u-card u-component` and update dynamically. Aria and other root attributes were not probed.

- ImageCompare Vue slider naming (user approved 2026-11-18): row classified complete + reference-defect. Pinned PrimeVue and Ultimate Vue both bind aria-label/aria-labelledby to the root, not the slider; docs promise slider naming and their example IDs mismatch (docs/prime-reference/components/imagecompare.md:68). Pinned source wins over docs. Ultimate NG does label its slider (PrimeNG labels root only): recorded as a cross-framework difference with no accessibility-quality conclusion. ImageCompare Vue becomes 4/1/4/0/1/0.

- Fieldset Angular region label association (user approved 2026-11-18): row 10 complete + reference-defect by parity with pinned PrimeNG. Both implementations point aria-labelledby at the conditional toggle button id, leaving a dangling reference when non-toggleable (Ultimate `packages/ng/src/fieldset/fieldset.ts:37-62`; PrimeNG `fieldset/fieldset.ts:43-87`). This establishes source parity only, not accessibility quality. Angular Fieldset distribution becomes 6/2/7/0/2/0.

- Avatar React image failure (user approved 2026-11-18): row 4 complete + reference-defect. Ultimate falls back to label/icon on every image error (`packages/react/src/avatar/avatar.tsx:33-42`), matching docs avatar.md:53,100; pinned PrimeReact suppresses built-in fallback when `onImageError` is supplied (`avatar/Avatar.js:61-74`). Pinned source wins for the contract but the contradiction with its own docs is a reference defect; no gap counted. imageFallback is a separate row. Avatar React becomes 5/4/5/0/1/0.

- ToggleButton React role/state (user ruling 2026-11-18): row 16 is C + reference defect. Pinned PrimeReact source and Ultimate both expose a checked native checkbox; the published PrimeReact example claims button/aria-pressed. Use pinned runtime source as oracle. Accessible naming and keyboard behavior remain separate rows. After splitting the required style-control rows and React row 33, ToggleButton has 42 rows: NG 13/3/13/0/12/1, React 11/3/16/0/12/0, Vue 23/1/9/0/9/0. Angular row 33 remains U pending runtime class coexistence evidence.

- SelectButton Vue dedicated focus/blur emits (user ruling 2026-11-18): row 15 is N + reference defect. Pinned PrimeVue `SelectButton.vue:32-37` emits only `change`; the declaration `SelectButton.d.ts:254-261` lists focus/blur without runtime support. Ultimate's lack of dedicated component emits matches the pinned implementation. Native DOM focus/blur listeners on the root are a separate capability. After separating `pt`, `ptOptions`, `unstyled` and `dt`, SelectButton has 34 rows: NG 10/4/14/0/6/0, React 10/2/14/0/8/0, Vue 10/2/13/0/9/0.

- InputNumber Vue `getFormatter` (user ruling 2026-11-18): C + reference defect. Pinned PrimeVue runtime exposes a computed formatter and Ultimate does likewise; PrimeVue types/docs call it a method. Runtime source wins. InputNumber counts NG 2/7/16/0/4/0, React 3/13/8/0/5/0, Vue 4/10/14/0/1/0 (29 rows) after separating PT, ptOptions, unstyled and per-instance dt; with the 2026-11-21 Aura-token row (D-SHARED #1 ruling): 30 rows, NG 3/7/16/0/4/0, React 3/14/8/0/5/0, Vue 5/10/14/0/1/0.

- Password strength live-region announcement (user ruling 2026-11-18): NG and React rows N + reference defect, separately. Pinned sources have no live region though docs promise announcements. After the dedicated forms-integration audit and four-row style-control split, Password (25 rows) counts were NG 5/6/10/0/4/0; React 3/9/7/0/6/0; Vue 6/4/11/0/4/0; after the 2026-11-19 broken-dt ruling added an Aura-token row, Password (26 rows) is NG 5/7/10/0/4/0, React 3/10/7/0/6/0, Vue 6/5/11/0/4/0.

- Slider keyboard behavior (user ruling 2026-11-18): use each pinned source, not conflicting documentation. NG and Vue rows P because product arrows match source but configured-step paging differs. React row P because product's Home/End min/max behavior corrects PrimeReact's out-of-bound source calculation in some min/step/range cases. Document each Prime reference discrepancy. Current source-based Slider counts after four-row style-control split: 17 rows; NG 1/11/4/0/1/0; React 3/6/4/0/4/0; Vue 1/8/7/0/1/0. With the 2026-11-21 Aura-token row (D-SHARED #1 ruling): 18 rows; NG 2/11/4/0/1/0; React 3/7/4/0/4/0; Vue 2/8/7/0/1/0.

- Slider React `aria-valuenow` (user ruling 2026-11-18): compare the documented actual-value meaning; product outputs actual value whereas pinned PrimeReact outputs percentage position. Record reference defect. The combined accessible-value/name row remains P because the product does not forward an accessible name. Count contribution remains P.

- Slider NG animation (user ruling 2026-11-18): N/source note. PrimeNG toggles `p-slider-animate`, but pinned styles have no corresponding selector/effect. Do not count absence as product gap; retain evidence that the upstream API class is inert.

- PrimeReact dedicated forms integration for Rating, InputOtp, Slider, InputNumber and Password: no dedicated field registration, context, or adapter exists. Generic controlled props/events are manual integration only. Their framework forms-integration rows are N/A. Pinned declarations `components/lib/ts-helpers.d.ts:7-13,23-30` define event payload types only; each component types/source were separately audited. This resolves the React forms U rows for InputNumber, InputOtp, Password and Slider.

- Rating React role/checked-state capability (user ruling 2026-11-18): N/A + reference defect. Pinned PrimeReact source has focusable divs without radio semantics although its docs promise hidden radios. Record Ultimate's radio semantics as extra behavior; this is not an accessibility-quality conclusion.

- Rating React locale-driven star labels (user ruling 2026-11-18): N/A + reference defect. Pinned source provides neither built-in labels nor localization although the docs promise locale labels. Record Ultimate's English labels as extra behavior, not localization.

- Rating React standard Space activation (user ruling 2026-11-18): N/A + reference defect. PrimeReact tests `event.key === 'Space'` while standard React space input is `' '`; product handles `' '`. Record product support as extra behavior. Clear-on-reactivation remains separate.

- InputOtp React standard focus/blur callbacks (user ruling 2026-11-18): N/A + reference defect. Types/docs advertise `onFocus/onBlur`, but pinned runtime invokes only undocumented `focus/blur` properties. Record the runtime hooks as a source note; Ultimate has no callbacks.

- InputOtp React root attribute forwarding (user ruling 2026-11-18): N/A + reference defect for broad HTML props/className declared by PrimeReact types but not consumed by pinned runtime (root uses its own class, ref, style and PT). Ultimate's explicit className support is an extra, but general arbitrary-attribute forwarding is absent. DOM output remains unverified.

- InputOtp Angular Tab in integerOnly mode (user ruling 2026-11-18): P + reference defect. Compare the pinned source: its integer-only key filter blocks Tab despite the docs promise, whereas Ultimate allows leaving. Other arrow/navigation and digit-filtering support exists, but this combined keyboard row differs. Source only; focus movement not browser-verified. After separating `pt`, `ptOptions`, `unstyled` and `dt`, InputOtp has 15 rows: NG 0/10/4/0/1/0, React 2/5/4/0/4/0, Vue 6/2/6/0/1/0; with the 2026-11-21 Aura-token row (D-SHARED #1 ruling): 16 rows, NG 1/10/4/0/1/0, React 2/6/4/0/4/0, Vue 7/2/6/0/1/0.

### Counting convention

Each family matrix includes four separate rows: `pt`, `ptOptions`, `unstyled`, and per-instance `dt`. Do not combine `pt` with `ptOptions` or `unstyled` with `dt`. Earlier ScrollPanel and Badge reports combined both pairs; normalize them and recalculate their distributions.

### Additional rulings (user approved 2026-11-19)

- Dialog NG block-scroll (user ruling): row P, following pinned PrimeNG source. Ultimate (`packages/ng/src/dialog/dialog.ts:343-349`) locks scroll whenever visible and has no `blockScroll` input; PrimeNG (`dialog/dialog.ts:263,751-763,784-796`) declares `blockScroll=false` but locks when `modal`, reading `blockScroll` only on maximize of non-modal dialogs. Docs `docs/prime-reference/components/dialog.md:53` conflict with source: recorded as a reference defect. Source-only; no runtime check.

- RadioButton React `onClick` (user ruling): N + reference defect. PrimeReact declares it in types (`radiobutton/radiobutton.d.ts:70-73`, `RadioButtonBase.js:30-32`) but the pinned runtime neither invokes nor forwards it (`componentbase/ComponentBase.js:441`, `RadioButton.js:24-182`). After splitting mandatory method rows, the final 19-row counts are NG 3/4/10/0/2/0, React 5/0/10/0/4/0, Vue 8/2/4/0/5/0.

- InputNumber/Password integration with FloatLabel/IftaLabel (user ruling): not a new counted row. Kept as cross-cutting note D-SHARED #3 to avoid double counting existing invalid-state rows. Producers emit `p-invalid`/`p-filled` (React `u-inputnumber-invalid`/`u-password-filled`), consumers expect `u-invalid`/`u-filled`. Source-only; no runtime check. Apply the same note-only treatment to Chips' label-state hook mismatch: Batch2 Chips row 28a was removed from the count because the problem overlaps existing focus/invalid/style rows and is the same shared label integration; evidence remains in `batch1/chips.md`.

- PrimeVue Dialog `modal` default (user approved 2026-11-19): record as a default-value flag under method rule 17, not a class conflict. PrimeVue `BaseDialog.vue:21-24` defaults to null (false-like); Ultimate defaults to true. This does not create a classification U.

- MeterGroup Vue sizing precision (user ruling 2026-11-19): row 2 = P, follow pinned PrimeVue runtime using fractional dimensions; record the conflicting documentation claim that dimensions are rounded as a reference defect.
- MeterGroup Vue legend icon slot (user ruling 2026-11-19): row 12 = N/A for PrimeVue runtime, with a reference defect. The internal label component declares an icon slot, but the MeterGroup root does not forward it; Ultimate Vue also does not expose it.
- MeterGroup React/Vue equal bounds (user ruling 2026-11-19): row 20 = C; keep Ultimate's guard that returns 100 as a safer extra and record pinned Prime's division-by-zero/NaN behavior as a reference defect.
- TriStateCheckbox React null state (user ruling 2026-11-19): row 8 = C + Prime reference defect. Ultimate emits `aria-checked="mixed"`; pinned PrimeReact emits `false` for null. Count the component's indeterminate state capability as complete; do not treat the Prime source result as the required contract.
- Checkbox and RadioButton matrices (user-approved method application 2026-11-19): split `pt`, `ptOptions`, `unstyled`, and per-instance `dt` into separate rows. Counts after split are in `batch6/checkbox.md` and `batch6/radiobutton.md`.
- Tabs Vue Home/End (user ruling 2026-11-19): row 3 = C following all three pinned Prime runtimes (Home→first, End→last); record the docs reversal as a reference defect. Angular and React remain P because they also lack PageUp/PageDown.
- Runtime theme switching (user ruling 2026-11-19): P in Angular, React and Vue, recorded in the shared-foundation track (not a family row). Prime subscribes to `theme:change` (PrimeNG `basecomponent.ts:395-401`, PrimeVue `BaseComponent.vue:208-215`); Ultimate emits it (`packages/uix-styled/src/config/index.ts:53-76`) but nothing subscribes. No ADR accepts set-before-mount only. Source-only.
- Broken `dt()` token references (user ruling 2026-11-19): include in family reports. Aura-token rows drop C→P in Angular and Vue for affected families (date-picker, file-upload, password, select, multi-select, listbox, cascade-select, color-picker, rating) per exact lines in `foundations/shared-foundation-audit.md`. Families not yet reported apply this when analysed.
- Broken-dt application (lead, 2026-11-19): CascadeSelect row21 NG C→P (NG 9/8/10/0/1/0); ColorPicker row26 unchanged P|M|P (only `preview.border.color` is broken; `panel.border.color` resolves via Aura colorScheme); Password and Rating gained an Aura-token row (Rating 26 rows: NG 7/9/7/0/3/0, React 4/3/8/0/11/0, Vue 5/6/10/0/5/0). React cells in those new rows are P under D-SHARED #1/ADR-067 (hand-authored CSS, no `dt()`), same basis as CascadeSelect row21 React.
- ConfirmDialog React role (user ruling 2026-11-20): N + reference defect. Pinned PrimeReact renders Dialog `role="dialog"` (`dialog/Dialog.js:668-671`); docs promise alertdialog. React 6/2/9/0/2/0 (19 rows).
- Tooltip `aria-describedby` (user ruling 2026-11-20): N + reference defect in NG, React and Vue; pinned sources never write it; Ultimate's linkage is an extra. Tooltip (18 rows) NG 5/5/7/0/1/0, React 7/5/4/0/2/0, Vue 9/4/4/0/1/0.
- Toast React `group` routing (user ruling 2026-11-20): N + reference defect; typed in `toast.d.ts:107-110` but not routed in `Toast.js:34-38,117-177`. Toast React 8/3/8/0/4/0 (23 rows).
- ConfirmDialog PrimeNG `defaultFocus` (user ruling 2026-11-20): stays U, deferred runtime check (selector `.p-confirm-dialog-accept` vs template class `p-confirmdialog-accept-button`). ConfirmDialog NG keeps 10/2/6/0/0/1. Superseded 2026-11-21: see the ConfirmDialog focus entry below (user approved N + reference defect, NG 10/2/6/0/1/0).
- DatePicker `aria-selected` NG row 21 (user ruling 2026-11-20): N + reference defect; pinned PrimeNG day cell lacks it, Ultimate's binding is an extra.
- DatePicker weekday `abbr` rows 22 NG/React (user ruling 2026-11-20): N + reference defect each. DatePicker (32 rows) NG 6/9/14/0/3/0, React 5/7/16/0/4/0, Vue 7/8/15/0/2/0.
- FocusTrap `pt`/`ptOptions` NG/Vue (user ruling 2026-11-20): N + reference defect (declared, never applied). FocusTrap `unstyled`/`dt` (user ruling): N in all three, KeyFilter precedent. FocusTrap (13 rows) NG 1/1/1/0/10/0, React 3/2/1/0/7/0, Vue 4/2/2/0/5/0 (verify mechanically).
- Carousel NG Home/End (user ruling 2026-11-20): N + reference defect; PrimeNG declares onHomeKey/onEndKey but never calls them. Carousel NG 11/4/12/0/1/1 (one other U remains, verify). Superseded count: batch7/carousel.md now records NG 12/4/12/0/1/0, so no U remains in that report.
- Editor (user ruling 2026-11-20): rows stay M; no ADR defers Editor, so none are I. ADR-055 requires its own Spec and Plan.
- Select Vue `content` slot, row 33 (user ruling 2026-11-20): N + reference defect; PrimeVue declares it in `Select.d.ts` but `Select.vue` never reads `$slots.content`. Select Vue becomes 7/13/13/0/2/0 (35 rows); verify the in-file distribution section, which is stale (still 33 rows).
- AutoComplete NG `aria-haspopup` (user ruling 2026-11-19, recorded late 2026-11-20): N + reference defect. PrimeNG docs promise `aria-haspopup=listbox`; pinned `autocomplete.ts:76-110` omits it; Ultimate also omits it. AutoComplete NG 4/9/20/0/1/0 on the 34-row draft (final 36-row draft: NG 5/10/20/0/1/0, React 6/6/16/0/8/0, Vue 8/6/19/0/3/0).
- Menu popup trigger ARIA, row 23 (user ruling 2026-11-20): N + reference defect in NG, React and Vue; pinned sources never write aria-expanded/haspopup/controls though docs/prime-reference/components/menu.md:123 promises them. Menu (30 rows) NG 10/11/8/0/1/0, React 17/6/5/0/2/0, Vue 19/2/8/0/1/0.

### Additional rulings (user approved 2026-11-21)

- Steps Angular list element, row 18 (user ruling, option A): N + reference defect. Pinned PrimeNG renders `<ul>` although docs say ordered list; pinned source wins.
- Steps React `aria-current`, row 17 (user ruling, option A): N + reference defect. Pinned PrimeReact writes it only through template options; Ultimate's attribute is an extra.
- Steps Vue keyboard activation (user ruling, option B): split activation (row 15, P for missing Space) from index correctness (new row 15b, C + reference defect, since pinned PrimeVue emits an undefined index on Enter/Space). Row 15b added as C in Angular and React to keep the matrix rectangular. Steps (27 rows) NG 11/8/2/0/6/0, React 11/5/7/0/4/0, Vue 9/6/8/0/4/0.
- Button React ripple, row 22 (user ruling, option A): M. No in-force ADR exists; superseded ADR-031 is context only.
- Button Vue tooltip, row 17 (user ruling, option A): N; Ultimate's `v-tooltip` is recorded as an extra.
- Ripple Angular/Vue visual CSS (user ruling, option A): P. Product activates ink but ships no structural CSS. The Vue comment saying the theme defines `.u-ink-active` is a note, not evidence.
- Ripple React (user ruling, option A): M; no I without an in-force ADR. Consistent with the Button React ripple ruling.
- ScrollTop transition, row 3 (user ruling, option A): P in all three; animation is a Prime capability.
- ScrollTop icon override, row 4 (user ruling, option A): P in all three.
- ScrollTop styling, row 10 (user ruling, option A): Angular/Vue P; React I covers token consumption only (ADR-067) and is not extended to omitted transitions.
- Terminal input accessible name, row 8 (user ruling, option A): the docs-promised input label is N + reference defect (pinned sources place attrs on the root). The row now measures root attribute forwarding: NG C, React P (className only), Vue M (`inheritAttrs:false`, D-SHARED #2). The row classifications were derived by the agent from the ruling and source and are source-only. Terminal (13 rows) NG 6/2/3/0/2/0, React 6/2/3/0/2/0, Vue 6/0/5/0/2/0.
- Terminal autofocus NG, row 6 (user ruling, option A): stays P; counted as a capability gap.
- Tag Angular consumer class, row 08 (user ruling, option A): stays U until a permitted runtime check, following the Card Angular precedent. Resolved 2026-11-21 by the same host probe (class only).

### Foundation ledger and Table pilot rulings (user approved 2026-11-21)

- Foundation ledger (`foundations/shared-foundation-audit.md` §8): the user approved every proposed class as written. F4 = M/M/M (C2); F6 = P/P/P (C3); F10 = P/P/P (C6); F13 = P/P/P (C7); F9 = P/P/P (C8); F3, F12, F14 and the C4 reading of F7 unchanged.
- Table pilot (user ruling, option C): extend `pilot/table.md` with the four capability areas most likely to hide gaps: keyboard and ARIA, `scrollable`/`scrollHeight`, and the global filter. The other excluded capabilities stay excluded and documented as not researched.

### ConfirmDialog focus and Timeline root (2026-11-21)

- ConfirmDialog Angular row 8, initial focus target (user approved, recommended option): N + reference defect. Pinned PrimeNG declares `defaultFocus` and queries `.p-confirm-dialog-accept` and `.p-confirm-dialog-reject`, but its template and style map apply `p-confirmdialog-accept-button` and `p-confirmdialog-reject-button`, so the advertised focus target is not rendered by default. Pinned source wins over the documented promise.
- Timeline Angular row 8, root class and style (agent judgment, not a user ruling): C, following the user-approved Card ruling by precedent. Pending the user's objection.

### Closeout decision (user approved 2026-11-21)

At the end of Phase 4, one curated closeout document is saved inside the product repository under `docs/` (for example `docs/architecture/research/`), containing the evidence synthesis, rulings and reference defects. The raw archive is then deleted as the user previously directed (local and remote). This is the only planned exception to the no-repo-writes rule. It happens only after the synthesis is reviewed, on a new branch from `develop`, and each repo write or push still needs its own authorization (AGENTS.md section 5.1). Nothing is written to the repository before then.

## Reference-defect notes

Standalone reference-defect notes from the family and pilot reports, kept verbatim under the batch or family they belong to (88 notes). Review logs, candidate drafts and recovery notes are not kept in the repository, so their notes are labelled by batch or family instead of by file.

### Pilot recovery notes

- L22: Root event 474; final current-method matrix `pilot/tabs.md` (14 rows/framework, including the 2026-11-21 Aura-token row). Counts C/P/M/I/N/U: NG 5/5/3/0/1/0; React 2/6/5/0/1/0; Vue 5/2/6/0/1/0 (13-row figures before that row were NG 4/5/3/0/1/0; React 2/5/5/0/1/0; Vue 4/2/6/0/1/0). Angular/Vue map to five-part Tabs; React maps to TabView/TabPanel, with TabMenu separate. User ruled Vue Home/End C following pinned source; the docs reversal is recorded as a reference defect. React and Angular remain P due PageUp/PageDown gaps. React inkbar is missing; lazy mounting is M in all three. Earlier Vue checks at `3864a1d` bypassed PostCSS and establish neither styling nor unchanged files at the pilot baseline.

### `batch1/cascadeselect.md`

- L80: No unresolved rows; no class-affecting reference defect. Limits: source read only; Vue style read in full (row 21); NG style not re-read for hard-coded colours; NG token verdict assumes variables are defined via `registerThemeVariables` (`packages/uix-styled/src/stylesheet/theme-variables.ts:47-60`). Specs mock browser APIs; behavior untested in a real browser.

### `batch1/chip.md`

- L97: No class-affecting reference defect.

### `batch1/chips.md`

- L75: No unresolved rows; no class-affecting reference defect.

### `batch1/inputmask.md`

- L65: No additional docs-versus-pinned-source defect was conclusively established in this family. The Ultimate Angular and Vue style comments claim actual InputText reuse, but `N:64-67`, `NS:26-45`, `V:1-17` and `VS:15-23` show the relevant limitations; these are Ultimate source-comment inconsistencies, not Prime reference defects.

### `batch1/metergroup.md`

- L82: 2. **Vue icon slot:** REF:54,102 presents public icon customization. PL-V:4 declares the internal icon slot, but P-V:3-17 never forwards root slots into MeterGroupLabel. The public capability is not reachable through the pinned MeterGroup root. User ruling (2026-11-19): row12 Vue is n/a with this reference defect recorded.

### `batch1/multistatecheckbox.md`

- L88: No unresolved rows; no class-affecting reference defect. Rows 13–15 make accessibility claims from source only; a screen-reader check in a real browser is needed before any accessibility statement. Tests: `packages/react/src/multi-state-checkbox/multi-state-checkbox.spec.tsx` (7 cases) exists; not run.

### Batch 1 review-log notes

- L41: 2. MeterGroup row 12 Vue — n/a + reference defect; public slot not wired at the PrimeVue root.
- L42: 3. MeterGroup row 20 React and Vue — complete + reference defect; Ultimate's guard (100) is a safer extra.
- L43: 4. TriStateCheckbox row 8 React — complete + Prime reference defect; `mixed` is the indeterminate state.

### `batch1/toolbar.md`

- L65: No unresolved rows; no class-affecting reference defect. Limits: source read only. Known-defect links: `docs/inventory/angular-actions/README.md:22,56`, `docs/inventory/react-actions/README.md:14,62`, `docs/inventory/vue-actions/README.md:14` mention toolbar composition only; the Vue `$attrs` drop and React `children`/function-form differences are not recorded.

### `batch1/tristatecheckbox.md`

- L49: Prime renders null as `aria-checked=false` (P:122-135), losing a programmatic distinction from false, although three values exist. Ultimate emits `mixed` (U:99). This is a source observation, not a requirement to reproduce it. User ruling (2026-11-19): row 8 is complete with this Prime reference defect recorded.

### `batch2/imagecompare.md`

- L41: Vue slider naming: resolved by user ruling 2026-11-18 (complete + reference-defect, see the working decision log). Root tab stop default (tabindex 0 bound in Ultimate, unbound in Prime) remains recorded as default-differs; Prime's unused tabindex is a reference defect, not a requirement to copy.

### `batch2/knob.md`

- L47: 4. Keyboard arrows: resolved by user ruling — classify step-based behavior complete and record the PrimeNG/PrimeReact literal-1 implementation as a reference defect.

### `batch2/messages.md`

- L50: PrimeReact types the close-icon pass-through key as `buttonIcon` while source reads `buttonicon`, `docs/prime-reference/components/messages.md:42,45`, R `messages/UIMessage.js:56`. The accessibility documentation claims `closeButtonProps` despite the API lacking it, and the styled-mode documentation lists `p-messages*` classes while the implementation emits `p-message*` (`docs/prime-reference/components/messages.md:83,90`). These are reference defects, not requirements to reproduce them.

### `batch2/scrollpanel.md`

- L51: Not a reference defect (unverified mechanism, see §6): REC:66 says arrow keys repeat by `step` while held. All three pinned sources schedule one 40 ms `setTimeout` per keydown (`PNG/scrollpanel/scrollpanel.ts:331-336`, `PRA/scrollpanel/ScrollPanel.js:247-252`, `PVA/scrollpanel/ScrollPanel.vue:249-254`). Ultimate uses the same code in all three (`packages/ng/src/scroll-panel/scroll-panel.ts:260-268`, `packages/react/src/scroll-panel/scroll-panel.tsx:112-120`, `packages/vue/src/scroll-panel/ScrollPanel.vue:215-221`). This does not disprove repeat-while-held, because the browser may dispatch repeated keydown events. No reference defect is asserted, and no parity difference exists in source.

### `batch3/dock.md`

- L55: Decide React magnification and neighbor behavior (recommend parity), item templates/slots, Space activation and wrapping vs clamping, React Aura token integration under ADR-067, and breakpoint/tooltip/header-footer scope. Reference defects: REC says all frameworks handle NumpadEnter; PrimeNG source handles Enter/Space only (`NGA/dock/dock.ts:294-343`). PrimeReact sets item role then overwrites it with `none` (`PRA/dock/Dock.js:238,244`); its click handler always preventDefault (`:47-53`) conflicting with URL navigation. PrimeNG router condition repeats `itemTemplate` (`NGA/dock/dock.ts:102-104`). PrimeVue DockSub reads processed item via `processedItem.item` while wrapper passes raw model (`PVA/dock/DockSub.vue:112-114`, `PVA/dock/Dock.vue:3`); command impact unconfirmed. Reference says Vue forwards focus/blur, source wrapper does not.

### `batch3/menubar.md`

- L13: 5. Roles, labels and item ARIA: **P/P/P**. Angular: user ruled to use pinned PrimeNG source; it assigns `menubar` to nested lists while Ultimate uses `menu`, so partial; docs conflict is recorded as reference defect. React: user ruled to use pinned PrimeReact source; the documented root-list label is not forwarded by Prime source, so it is a reference defect; Ultimate labels the surrounding nav and differs in role/navigation structure, so partial. Vue has basic roles/state but labels nav and lacks list naming/active-descendant.
- L39: React is in ADR-067 Aura target; `packages/react/src/menubar/menubar-style.ts:3-13` has structural CSS/literals without Menubar token references. Registration in `packages/react-core/src/styling/use-component-style.ts:12-29` alone does not prove consumption. Decide responsive behavior, fuller keyboard/accessibility contract, templates/commands, and React Aura consumption; implementation priorities remain Phase 5. PrimeNG nested role documentation/source conflict (`docs/prime-reference/components/menubar.md:87-90`, pinned MenubarSub source) and PrimeReact root-list label docs/source conflict (`docs/prime-reference/components/menubar.md:87-89`, `Menubar.js:655-675`, `MenubarSub.js:277-298`) are recorded as reference defects, with user ruling to use pinned sources. PrimeVue focus/blur runtime emits exist despite incomplete type declarations. Exact checks: inspect computed root/nested roles; keyboard/focus through disabled first entry; breakpoint behavior; computed React theme styles. No test claims made.

### `batch3/speeddial.md`

- L49: Unresolved: inspect model fields and event signatures in all frameworks to verify rows 1-2 and 6; browser checks of circular layout, focus, outside click and accessibility were not run. No new Prime reference defect established. All claims are source-read only.

### `batch3/splitbutton.md`

- L41: React is covered by ADR-067 for Aura consumption; `packages/react/src/split-button/split-button-style.ts:3-6` uses literal 6px and no token refs. Theme-variable registration alone does not establish consumption. Decide nested TieredMenu behavior, dropdown accessibility, customization/overlay configuration, and React Aura use; recommendations in agent analysis favored parity and Aura, but implementation/priority belongs to Phase 5. PrimeVue declares `buttoncontent` but template does not render it; PrimeReact declares `transitionOptions` but does not forward it; PrimeNG declares `plain` but template does not use it. These are reference defects; do not count them as required capabilities without resolving the source behavior. Existing inventory action records describe historical environment/build failures, not current product tests. Remaining checks: popup placement/dismissal/focus, accessible state/name, Angular host/root merge, React computed theme/dark mode, nested components.

### `batch3/timeline.md`

- L38: Decide whether to implement `align` (currently ineffective) or remove the prop; recommendation: implement. Consider React/Vue `dataKey`, template index/static React node, Vue ordered-list semantics, and NG/React element getters. D-PT implementation remains Phase 5. PrimeVue declares horizontal default while pinned source is vertical (`PVA BaseTimeline.vue:16`); verify exact reference-record wording before registering a reference defect. Prime reference implies ordered list while NG/React source uses divs; the exact claim should be verified. React Ultimate comment at `packages/react/src/timeline/timeline.tsx:42-44` incorrectly says Prime lacks stable identity, while PrimeReact has `dataKey`.

### `batch4/contextmenu.md`

- L18: 12 `ptOptions`: M|M|M (D-PT; NG: PN contextmenu.ts:491; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR contextmenu/contextmenu.d.ts:200 (pt), 205 (unstyled); ptOptions NOT declared; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); PrimeReact ContextMenu runtime accepts ptOptions through ComponentBase.extend (ComponentBase.js:420-423 merged at 429-438, read at 467) although contextmenu.d.ts omits it; runtime source governs, types omission recorded as reference defect; Vue: PV contextmenu/BaseContextMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))

### `batch4/drawer.md`

- L7: Fullscreen compared as one visible capability; position="full" equivalent where it fills viewport; PrimeNG fullScreen input/class inconsistency (drawer.ts:222-232,547-554; drawerstyle.ts:45-52) = reference defect.
- L22: **User ruling applied:** fullscreen counts as one visual effect. Where `position="full"` makes the drawer fill the viewport, it is equivalent. PrimeNG's `fullScreen` input is not a separate required API; its class/input inconsistency is recorded under reference defects.
- L120: **Reference defects**

### `batch4/organizationchart.md`

- L12: React expanded:false: PrimeReact suppresses children (OrganizationChartNode.js:70-73,117-120); Ultimate allows toggling → partial + PrimeReact reference defect.

### `batch4/panel.md`

- L96: No Prime reference defect affects any classification.

### `batch4/popover.md`

- L113: **Reference defects (no verdict depends on them)**

### Batch 4 review-log notes

- L10: **OrganizationChart** (23 rows/framework): NG `0/0/22/0/1/0`; React `8/5/7/0/3/0`; Vue `8/6/8/0/1/0`. React single-root array mapping is complete; multi-root rendering is an extension. React `expanded:false` row is partial per user ruling: PrimeReact suppresses children at `OrganizationChartNode.js:70-73,117-120`; Ultimate initializes collapsed and permits toggle-open at `packages/react/src/organization-chart/organization-chart.tsx:37,75-103`. Record a PrimeReact reference defect. User ruled to use pinned PrimeVue source for Vue `selectable:false`: PrimeVue emits selection despite the flag, while Ultimate Vue blocks it (`packages/vue/src/organization-chart/OrganizationChart.vue:25-33`; pinned PrimeVue `OrganizationChartNode.vue:110-117,150-154`; docs `docs/prime-reference/components/organizationchart.md:74`). The click-exclusion capability is N/A in PrimeVue and Ultimate's stricter blocking is an Ultimate-specific extra; record the docs/source conflict. ADR-054 makes Angular implementation eligible, so absent implementation is missing, not intentional. React selectable=false is complete (Ultimate and PrimeReact both block it).
- L11: **PanelMenu**: Angular accessibility was split into two capabilities: header/button-to-region relation is partial independently of the reference defect; for nested role, user ruled to follow pinned PrimeNG source (`tree`) over docs (`group`), making Ultimate's matching `tree` behavior complete and recording the docs/source conflict. Updated counts: NG `1/7/6/0/1/0` over 15 rows; React `1/5/6/0/2/0`; Vue `0/5/8/0/1/0`.
- L14: **Drawer** (25 rows): user ruled fullscreen is one user-visible capability; `position="full"` is equivalent to Prime's effect where source supports viewport fill. NG row 3 changes unresolved→complete; PrimeNG's inconsistent `fullScreen` input vs `position` class/state is recorded as a reference defect, not a separate capability. Counts: NG `12/3/8/0/2/0`; React `6/8/9/0/2/0`; Vue `8/6/8/0/2/1`.
- L22: **Drawer fullscreen ruling:** compare user-visible full-screen result as one capability; `position="full"` counts equivalent when source supports viewport fill. PrimeNG fullScreen-driven class vs position-driven data-p is a reference defect, not an independently required API.

### `batch5/blockui.md`

- L1: <!-- Historical pre-normalization lead review 2026-11-18: user approved row 2 P in all frameworks for full-screen coverage limitations when an ancestor establishes a fixed-position containing block. Final counts: NG 3/4/5/0/3/0, React 3/5/6/0/1/0, Vue 5/3/5/0/2/0. Each totals 15. PrimeVue animationend reference defect touches no row. Source-read only; no browser check. Ledger updated to reflect the ruling. -->

### `batch5/floatlabel.md`

- L26: Notes: source comments excluding pt/instance injection are not rulings → no I. No reference defects. Specs 5/framework jsdom, not rerun. Row 05 exact check: render with real UInputText, compare computed label position/colour.

### `batch5/keyfilter.md`

- L12: PrimeVue `email` regex range `.-@` is a reference defect; does not affect classification.

### `batch5/mention.md`

- L12: Row 23 ARIA: confirmed reference defect. Pinned PR Mention.js has no `aria-`/`role` (grep empty); docs/prime-reference/components/mention.md:71-72 already records docs promise combobox/listbox/aria-controls/Home-End while source sets none. Xjw sets role=combobox, aria-expanded, aria-autocomplete, aria-activedescendant, listbox/option, aria-selected (packages/react/src/mention/mention.tsx:249-264). User approved on 2026-11-18: classify this docs-promised ARIA capability N/A against the pinned source; retain the reference defect and record Ultimate's ARIA as an extra. This classification does not assess the accessibility quality of those additions.

### `batch5/progressspinner.md`

- L27: Notes: React hand CSS not in ADR-067 exceptions → architecture violation recorded, not decided. No reference defects confirmed. Specs 4/framework jsdom at c531e881…, not rerun. Row 10 exact check: computed --u-progressspinner-color-one in browser.

### Batch 5 review-log notes

- L4: User ruling 2026-11-18: Mention React row23 U→N; pinned source lacks docs-promised ARIA; record reference defect and Ultimate additions. Updated report and the working decision log. Final React 4/9/12/1/2/0.
- L5: Agent-9 DeferredContent/InputGroup draft received; returned for missing inventory/source checks before saving final reports. InputGroup NG fluid reference defect still needs individual user ruling after source review.

### inputnumber candidate draft notes

- L122: The Vue `getFormatter` row was resolved by user ruling as C + reference defect: both pinned runtime and product expose computed formatter behavior while PrimeVue types/docs call it a method. The React forms-integration row is N/A after source audit confirmed PrimeReact has no dedicated field registration/context/adapter. No U rows remain in this candidate matrix; product defects remain part of their own capability verdicts.
- L128: 1. PrimeNG Home/End: documentation promises the provided bound, including zero; pinned inputnumber.ts:962-971 tests truthiness and skips zero. Classification is M in Angular regardless of which behavior is the oracle, because Ultimate has neither Home nor End; the source/docs conflict is recorded as a reference defect and needs no ruling. Do not apply a ruling from another family.
- L129: 2. PrimeVue getFormatter (user ruling): classify complete because both runtime implementations expose computed formatter functionality. Record the contradiction in InputNumber.d.ts:505 and docs/prime-reference/components/inputnumber.md:67 as a reference defect. Source oracle wins.

### inputotp candidate draft notes

- L80: The user rulings resolve React focus/blur and root attribute forwarding as N/A + reference defects. Angular integer-only Tab behavior is P + reference defect: pinned source blocks Tab despite the documentation, while Ultimate allows leaving the field. React paste/whole-code entry is P from the compared source behavior; no documentation defect is claimed. No classification rulings remain open in this matrix. Product defects and source-only verification limits remain separate.

### password candidate draft notes

- L110: The React forms-integration row is N/A after source audit confirmed PrimeReact has no dedicated field registration/context/adapter. The user ruled NG and React live-announcement rows N + reference defect: pinned sources lack live regions despite the documentation promise. No U rows remain; assess the documented product defects in their own capability rows.
- L116: 1. PrimeNG strength announcement: showcase promises aria-live but pinned source password.ts:435-505 does not supply one; docs/prime-reference/components/password.md:100-102 records the conflict. User ruling: pinned source is the comparison; row is N + reference defect (resolved).
- L117: 2. PrimeReact strength announcement: same documented promise independently conflicts with Password.js:366-433, which has no live region. Separate user ruling: same source-based comparison; row is N + reference defect (resolved).

### selectbutton candidate draft notes

- L48: **Reference ruling applied.** Vue row 15 is N + reference defect: the pinned runtime does not emit the declared focus/blur events. Root native focus/blur listeners remain separate.

### toast candidate draft notes

- L58: PrimeReact's `ToastMessageOptions` type declares `group?: string` (`toast/toast.d.ts:107-110`), but pinned `Toast.js` routes by no group and `ToastBase.js:122-137` has no group prop; `show()` only appends to that instance (`Toast.js:34-38`). The routing row is U because honoring the declared contract versus executable source changes PrimeReact from M (declared capability not implemented) to N (no runtime capability), and can change the product verdict. Options: (A) score runtime only, classify PrimeReact routing N and record its unused type field as a reference defect; (B) treat the declared type as intended contract, leave Prime's own implementation defect noted and classify Ultimate React M for lacking group routing. Recommendation: A, because pinned runtime is the behavior oracle in the working decision log, section 11. Keep U until the user rules. No other class-changing docs/source conflict found. PrimeVue's missing container `life` prop is a default/API difference, represented by a default flag in row 5; examples passing `life:3000` do not establish a container default.

### togglebutton candidate draft notes

- L68: Row 16 React is **C, reference defect** by user ruling: pinned PrimeReact runtime and product both expose a checked native checkbox, despite published text describing a button/aria-pressed. Naming and keyboard behavior remain separate rows. Rows 17–20 document the independently observable naming and keyboard behavior. `PRD:14-45`; `PR:47-52,112-132`; `UR:77-106`.

### Uncovered families, initial candidate draft

- L74: Candidate reference conflict ready for individual ruling: PrimeVue docs/types say `autoFocus=true`, runtime defaults false (`FocusTrap.d.ts` vs `FocusTrap.js:72`); autoFocus affects initial focus fallback and therefore classification if row is defined by default behavior. Recommend source wins and record default flag/reference defect per method 17, unless the user explicitly prioritizes public declaration. PrimeReact has dangling missing focustrap.d.ts: source reports it, but that is package evidence limitation; runtime component still exists. Do not infer no feature from no showcase/catalog entry. Provisional distribution, 11 rows (C/P/M/I/N/U): NG `1/6/0/0/4/0`; React `3/1/1/0/4/2`; Vue `4/3/2/0/2/0`. Arithmetic only; `pt` / `ptOptions` conflict and unsupported PrimeNG component styles need source-level resolution.
- L97: Known conflict ready for ruling: all framework accessibility docs promise `aria-describedby`, pinned Prime sources do not implement it (`docs/prime-reference/components/tooltip.md:101`; PN `tooltip/tooltip.ts`, PR `tooltip/Tooltip.js`, PV `tooltip/Tooltip.js`). Recommend classify against source as no Prime capability and record reference defect; prior user rulings elsewhere establish individual defects, not blanket authorization, so ask separately for Tooltip. It changes verdict if accessible-description linkage row is scored from docs. Provisional distribution, 13 rows (C/P/M/I/N/U): NG `3/5/4/0/0/1`; React `2/6/3/0/1/1`; Vue `5/3/4/0/0/1`.
- L132: Pending individual user rulings (no prior ruling found for these families): Accordion ARIA linkage/keyboard differences if docs conflict; ConfirmDialog React role and PrimeNG defaultFocus query mismatch; FocusTrap PrimeVue `autoFocus` declared default true vs runtime false; Tooltip documented `aria-describedby` vs absence in pinned runtime; Toast PrimeReact style-doc class names / close icon PT key vs runtime. Recommendation for each: classify by pinned source as oracle and record reference defect, subject to individual user decision under the working decision log, section 11. PrimeVue FocusTrap default is also a method-17 default flag; use runtime default unless user selects declaration as contract. These conflicts can change a capability verdict, so leave their affected cells U until ruled.

### `batch6/checkbox.md`

- L37: No source/docs reference defect requiring a user ruling was identified in this matrix. React Aura-token architecture is counted in row 17 (D-SHARED #1); other cross-cutting styling integration is recorded in the shared-foundation track; no D-SHARED #3 instance is claimed for Checkbox. Source citations establish implementation evidence only; no rendered or assistive-technology claim is made.

### `batch6/inputnumber.md`

- L125: The Vue `getFormatter` row was resolved by user ruling as C + reference defect: both pinned runtime and product expose computed formatter behavior while PrimeVue types/docs call it a method. The React forms-integration row is N/A after source audit confirmed PrimeReact has no dedicated field registration/context/adapter. No U rows remain in this candidate matrix; product defects remain part of their own capability verdicts.
- L131: 1. PrimeNG Home/End: documentation promises the provided bound, including zero; pinned inputnumber.ts:962-971 tests truthiness and skips zero. Classification is M in Angular regardless of which behavior is the oracle, because Ultimate has neither Home nor End; the source/docs conflict is recorded as a reference defect and needs no ruling. Do not apply a ruling from another family.
- L132: 2. PrimeVue getFormatter (user ruling): classify complete because both runtime implementations expose computed formatter functionality. Record the contradiction in InputNumber.d.ts:505 and docs/prime-reference/components/inputnumber.md:67 as a reference defect. Source oracle wins.

### `batch6/inputotp.md`

- L83: The user rulings resolve React focus/blur and root attribute forwarding as N/A + reference defects. Angular integer-only Tab behavior is P + reference defect: pinned source blocks Tab despite the documentation, while Ultimate allows leaving the field. React paste/whole-code entry is P from the compared source behavior; no documentation defect is claimed. No classification rulings remain open in this matrix. Product defects and source-only verification limits remain separate.

### `batch6/password.md`

- L113: The React forms-integration row is N/A after source audit confirmed PrimeReact has no dedicated field registration/context/adapter. The user ruled NG and React live-announcement rows N + reference defect: pinned sources lack live regions despite the documentation promise. No U rows remain; assess the documented product defects in their own capability rows.
- L119: 1. PrimeNG strength announcement: showcase promises aria-live but pinned source password.ts:435-505 does not supply one; docs/prime-reference/components/password.md:100-102 records the conflict. User ruling: pinned source is the comparison; row is N + reference defect (resolved).
- L120: 2. PrimeReact strength announcement: same documented promise independently conflicts with Password.js:366-433, which has no live region. Separate user ruling: same source-based comparison; row is N + reference defect (resolved).

### `batch6/radiobutton.md`

- L40: No unresolved rows remain. The React `onClick` source/type mismatch is recorded as an individually ruled reference defect. The React `radio-button` style-key mismatch and missing `dt()` use are counted in row 20 (D-SHARED #1). No D-SHARED #3 producer/consumer instance is claimed for RadioButton. Comments describing exclusions are not treated as accepted ADRs. No rendered DOM, focus order, or computed-style claims are made.

### Batch 6 review-log notes

- L7: User ruled React role/state C + reference defect: pinned implementation `components/lib/togglebutton/ToggleButton.js:100-150` and product `packages/react/src/toggle-button/toggle-button.tsx:86-106` both expose a native checked checkbox, while docs `components/doc/togglebutton/accessibilitydoc.js:16-20` describe a button/aria-pressed. Accessible naming is separate: PrimeReact forwards `aria-label` and `aria-labelledby` to the input (`:128-129`), product input omits both (`:93-106`). Keyboard is also separate: PrimeReact's handler toggles on `keyCode === 32` (`ToggleButton.js:47-52`); product handles Space with cancellation and also toggles on Enter (`toggle-button.tsx:74-84`).
- L36: Vue SelectButton component emissions. `packages/primevue/src/selectbutton/SelectButton.d.ts:254-261` declares `focus` and `blur`. The pinned `SelectButton.vue:2-22,32-37,61-84` listens to child `change` and emits only `change`. Product `packages/vue/src/select-button/SelectButton.vue:2-12,33-37,71-96` also emits only `change`. User ruled row 15 N + reference defect: the pinned runtime does not emit the declared focus/blur events. Product matches the runtime. Native DOM listeners at the root are a separate behavior.
- L40: Slider rulings applied: pinned-source keyboard comparison yields NG/Vue P (configured-step page behavior differs) and React P (product corrects Prime's Home/End source defect). React's combined accessible-value/name row remains P because product lacks an accessible name; its actual `aria-valuenow` follows the docs' actual-value meaning while pinned Prime emits percentages, recorded as a reference defect. PrimeNG animate class is N/source note because pinned styles have no effect. Final counts: NG 1/10/3/0/1/0; React 3/6/3/0/3/0; Vue 1/8/5/0/1/0.
- L41: Rating user rulings applied to React rows 9, 11, 13 individually: missing Prime runtime role/state, locale labels and standard Space support are N/A + reference defects despite docs promises; Ultimate's radio semantics, English labels and standard Space handler are recorded as extras. No accessibility-quality conclusion. Rating React final counts are 4/2/8/0/11/0 after the mandatory ptOptions row was separated.
- L42: InputOtp rulings applied: React focus/blur and root attribute forwarding are N/A + reference defects (Prime types advertise APIs not consumed by runtime; product explicit className is an extra). React paste is P by source: both paste; Prime truncates to `length + 1` and numeric-coerces while product caps length/pads/prevents default. Whole-code docs claim is supported, no defect claimed. Angular integerOnly Tab row is P + reference defect under user's source-parity ruling: Prime source blocks Tab despite docs, product permits leaving. No U remains. After separate PT/ptOptions/unstyled/dt rows, counts NG 0/10/4/0/1/0; React 2/5/4/0/4/0; Vue 6/2/6/0/1/0.

### `batch6/selectbutton.md`

- L48: **Reference ruling applied.** Vue row 15 is N + reference defect: the pinned runtime does not emit the declared focus/blur events. Root native focus/blur listeners remain separate.

### `batch6/togglebutton.md`

- L68: Row 16 React is **C, reference defect** by user ruling: pinned PrimeReact runtime and product both expose a checked native checkbox, despite published text describing a button/aria-pressed. Naming and keyboard behavior remain separate rows. Rows 17–20 document the independently observable naming and keyboard behavior. `PRD:14-45`; `PR:47-52,112-132`; `UR:77-106`.

### `batch7/autocomplete.md`

- L80: Applied: NG row 24 = N + reference defect (user, 2026-11-19). Vue row 17 = P, React row 23 = P (lead, 2026-11-20). No class-changing conflict remains open.

### `batch7/carousel.md`

- L65: 1. **Carousel NG Home/End (row 16):** user chose (a). N + reference defect: pinned PrimeNG declares the handlers but never calls them. The distribution above matches the matrix (mechanically recounted 2026-11-21). No U remains: row 24 was settled for class and style by the 2026-11-21 probe.

### `batch7/confirmdialog.md`

- L53: 1. **React alertdialog (row 6).** Recommended: follow pinned source, classify the docs-promised alertdialog capability N for PrimeReact and record a reference defect; Ultimate’s `dialog` role is then not a gap. Alternative: follow the docs contract, classify M because Ultimate React does not emit `alertdialog`.
- L54: 2. **PrimeNG default focus (row 8).** Ruled 2026-11-21 (user approved, option A): N + reference defect. The source query is authoritative and matches no default-rendered element, so the effective feature is absent in pinned PrimeNG; Ultimate has no option for it, which is not a gap.

### `batch7/datepicker.md`

- L65: **A. Row 21, Angular `aria-selected`.** Option 1 (recommended): pinned PrimeNG source governs, so capability is N, Ultimate's attribute is an extra, doc is a reference defect. Option 2: doc governs, Ultimate is C. Recommendation 1, matching the pinned-source-wins rule from earlier rulings.
- L67: **B. Row 22, weekday `abbr`, Angular and React.** Option 1 (recommended): source governs, N + reference defect for each. Option 2: doc governs, M for each. Vue is P either way. Each framework is ruled separately.

### `batch7/focustrap.md`

- L52: 1. **`pt` / `ptOptions` (rows 10-11), PrimeNG and PrimeVue.** Both declare PT but the FocusTrap runtime never applies it. Option A (recommended): runtime governs, N plus reference defect (same basis as InputOtp React focus/blur ruling); Ultimate's absence is then not a gap. Option B: declaration governs, M under D-PT. PrimeReact is N under either option (no declaration). Cells stay U until ruled.

### `batch7/menu.md`

- L68: **Popup trigger ARIA (row 23, all frameworks):** user chose Option 1. Pinned runtime source governs; N + reference defect in Angular, React and Vue, applied separately. Ultimate not providing the attributes is not a parity gap. Distribution above was recounted mechanically on 2026-11-21 and matches the matrix.

### `batch7/select.md`

- L78: 1. **PrimeVue `content` slot (row 33):** Should the matrix follow the PrimeVue type/docs declaration, or the pinned runtime? Recommendation: choose pinned runtime and classify the consumer content-slot capability N/A + reference defect, because the SFC consumes no `$slots.content`; its `v-slot:content` is for its internal VirtualScroller. Pending this choice, the matrix cell remains U.

### `batch7/steps.md`

- L68: 1. **PrimeNG list element (row 18, Angular):** user chose A. Pinned source wins; Angular N plus reference defect.
- L69: 2. **PrimeReact active-step ARIA (row 17, React):** user chose A. Source wins; N plus reference defect; Ultimate's attribute is an extra.
- L70: 3. **PrimeVue keyboard selection index (row 15, Vue):** user chose B. Activation (row 15) is split from index correctness (new row 15b). Row 15 is P for the missing Space handler; row 15b is C plus reference defect. Rows 15b added to Angular and React as C so the matrix stays rectangular (27 rows per framework).

### `batch7/terminal.md`

- L52: 1. **Accessible name for input (row 8):** user chose A. Pinned source wins: the docs-promised input label is N + reference defect; the row now requires only root attribute forwarding (C / P / M for Angular / React / Vue).

### `batch7/toast.md`

- L58: PrimeReact's `ToastMessageOptions` type declares `group?: string` (`toast/toast.d.ts:107-110`), but pinned `Toast.js` routes by no group and `ToastBase.js:122-137` has no group prop; `show()` only appends to that instance (`Toast.js:34-38`). The routing row is U because honoring the declared contract versus executable source changes PrimeReact from M (declared capability not implemented) to N (no runtime capability), and can change the product verdict. Options: (A) score runtime only, classify PrimeReact routing N and record its unused type field as a reference defect; (B) treat the declared type as intended contract, leave Prime's own implementation defect noted and classify Ultimate React M for lacking group routing. Recommendation: A, because pinned runtime is the behavior oracle in the working decision log, section 11. Keep U until the user rules. No other class-changing docs/source conflict found. PrimeVue's missing container `life` prop is a default/API difference, represented by a default flag in row 5; examples passing `life:3000` do not establish a container default.

### `batch7/virtualscroller.md`

- L62: Prime VirtualScroller references `virtualscroller.loader.mask.background`, `.mask.color`, and `.loader.icon.size` without an Aura token module, in both Prime style sources and Ultimate's shared style. Record as Prime reference defect; the parity classes remain C because both implementations use the same shared style/token paths.

### `foundations/shared-foundation-audit.md`

- L62: **PrimeVue imports all 93.** `base` is imported by PV/core/src/base/style/BaseStyle.js:2. **Reference defect:** docs/prime-reference/foundations/primeuix.md:190 says PrimeVue imports 92 and that `base` is not imported; pinned source contradicts it. No verdict impact.
- L122: Prime-also unresolved (reference facts, Prime's own styles reference tokens Aura does not define): all `datatable.*` (143), `virtualscroller.*` (5), `imagecompare.scope.x`, `imagecompare.handle.border.style`, `scrollpanel.barfocus.ring.width/offset`, `menubar.submenu.color`, `inputchips.chip.focus.color`, plus (in Prime only) colorpicker.preview.focus.border.color, confirmpopup.arrow.left, popover.arrow.left, fileupload.filelist.gap, rating.invalid.icon.color, ripple.background. **Reference defect candidates**: these resolve to undefined variables in Prime too.

### `pilot/table.md`

- L8: User rulings needed: none. No reference defect changes a classification.

### `pilot/tabs.md`

- L43: User ruling (2026-11-19): Vue keyboard row C, following pinned source; docs reversal recorded as reference defect.
