# Phase 4 status — 2026-11-21

Scope is source-based gap analysis and evidence only. Product repo is pinned to `91a8472547e34c6e92456f2b98270a1555e3a2db` and remains untouched. PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5. No product tests or browser checks have been run.

## Durable archive

The analysis folder is backed up in private GitHub repo `https://github.com/majedsiefalnasr/ultimate-phase4-gap-analysis`, branch `main`. User directed that the local and remote archive be deleted at the end, once Phase 4 is complete and it is no longer needed. User approved on 2026-11-21 that, before deletion, one curated closeout (synthesis, rulings, reference defects) is saved inside the product repository under `docs/` (see `DECISIONS.md`, Closeout decision).

## Evidence inventory

- Batch 2: 10 reports, current-method review completed, with `pt`, `ptOptions`, `unstyled`, and `dt` rows separated. Review log: `batch2/review-log.md`.
  - Remaining U cell: MeterGroup Angular row 5 (vertical geometry). Chip Angular row 20 was settled as C (class and style) by the 2026-11-21 host probe. Chip Vue row 22 has an archive-search evidence limitation but is not U.
- Batches 3–6: 40 reports. All four mandatory styling rows are now separate and counts were recalculated. Review logs are present for B3–B7.
- Batch 7: 10 source matrices, all mandatory style-control rows separated. ToggleButton Angular row 33 became C after the 2026-11-21 host probe; no browser check was run.
- Known U count after the 2026-11-21 source traces and rulings: 1 — MeterGroup NG row 5 (needs a rendered vertical group). ConfirmDialog NG row 8 was ruled N + reference defect by the user. The 12 batch4 U cells (Dock 2, Breadcrumb 3, Timeline 1, SpeedDial 1, Splitter 3, Textarea 1, DynamicDialog 1) were resolved by source reading only on 2026-11-21 and recorded in each report's distribution; Card NG and ToggleButton NG row 33 were settled by the host probe.
- Pilots: final source matrices for Dialog (19 rows/framework), Tabs (14), Table (43: 31 original plus 12 added 2026-11-21 for keyboard, ARIA, `scrollable` and global filter) in `pilot/`. Table still excludes unresearched capabilities; it is a bounded pilot, not an exhaustive DataTable audit. `PILOT-RECOVERY.md` serves as the pilot review record; there is no separate `pilot/review-log.md`.
- Current distinct family reports: 60 across batch2–batch7, 37 in batch8, and three pilots, for 100/100 canonical families represented (`datatable` is covered by the bounded `pilot/table.md`, 43 rows after the 2026-11-21 extension). Original batch1 duplicates batch6. Shared-foundation audit is saved and its §8 ledger (F1–F15) is fully ruled (2026-11-21). Evidence synthesis drafted in `SYNTHESIS.md` (2026-11-21), awaiting user review. Remaining: the one open U cell (MeterGroup Angular row 5, needs a rendered check) and the closeout. The `batch5/organizationchart.md` status-table mismatch was fixed on 2026-11-21.
- Coverage and provenance: see `COVERAGE-RECOVERY.md` and `PILOT-RECOVERY.md`.

## Current distributions (C/P/M/I/N/U)

Batch 2 (each count includes separate `pt`, `ptOptions`, `unstyled`, `dt` rows):

- Divider 14: NG 7/2/4/0/1/0; React 4/4/5/0/1/0; Vue 6/0/7/0/1/0.
- MeterGroup 22: NG 8/4/8/0/1/1; React 5/5/10/0/2/0; Vue 7/3/10/0/2/0.
- DataScroller 22: NG all N; React 8/6/6/0/2/0; Vue all N.
- TriStateCheckbox 21: NG/Vue all N; React 5/7/8/0/1/0.
- InputMask 27: NG 4/12/8/1/2/0; React 10/6/5/0/6/0; Vue 5/11/6/0/5/0.
- Toolbar 14: NG 6/3/4/0/1/0; React 3/4/4/0/3/0; Vue 4/1/5/0/4/0.
- CascadeSelect 28: NG 9/8/10/0/1/0; React 5/10/10/0/3/0; Vue 8/8/11/0/1/0.
- MultiStateCheckbox 26: NG/Vue all N; React 7/7/11/0/1/0.
- Chip 27: NG 12/6/6/0/3/0; React 7/7/5/0/8/0; Vue 8/3/9/0/7/0.
- Chips 32: NG all N; React 12/7/10/0/3/0; Vue 12/6/7/0/7/0.

Batch 7 counts are in `batch7/review-log.md`; all 10 families are itemized there. Batch 3–6 and pilots are itemized in their reports.

## Immediate next steps

1. Reconcile remaining decisions individually. The 2026-11-21 batch of 13 rulings (Steps, Button, Ripple, ScrollTop, Terminal, Tag) is recorded in `DECISIONS.md`; the mechanical distribution recount now covers batches 2–8 and the pilots (see Pending ledger). Runtime-dependent U cells remain open.
2. Apply broken-dt and D-SHARED findings to affected families as the user ruled; verify all affected row counts and logs.
3. Expand the shared-foundation audit beyond its saved source inventory and candidate findings.
4. Update the coverage ledger after all 100 family reports and foundations are reviewed, then write the evidence synthesis.
5. After the synthesis is reviewed, save the curated closeout in the product repo under `docs/` (separate authorization per write), then delete the local and remote archive only after Phase4 completion, as the user requested.

Phase 5 prioritization and product changes remain out of scope.

## Pending ledger (2026-11-21)

- Drafts regenerated since 2026-11-20: AutoComplete, Button, Chart now exist in `batch8/` (the counts recorded earlier were superseded by the saved reports). All 100 canonical families have reports.
- Citation spot-check done 2026-11-21 for Carousel, Paginator, FileUpload and Select: 646 explicit file:line citations all resolve to existing files within bounds. Semantic re-read of ruling-backing claims: Carousel NG Home/End, Select Vue `content` slot and FileUpload accept/maxFileSize confirmed; two Paginator claims were wrong and are corrected in `batch8/paginator.md` (PrimeNG `last` button is disabled; the `changePage` payload carries the new offset). Bounds checking does not prove every other claim, and key-only citations (for example FileUpload ``PN `:888-914` ``) were checked by sampling, not exhaustively.
- Distribution recount (2026-11-21, mechanical, all 37 batch8 reports): Menu, Carousel, Select, FocusTrap, Paginator, Steps and Terminal match their matrices. Fixed: Menu table (was stale, U=1), AnimateOnScroll NG (3/1/0/0/4/0), Skeleton Vue (M5/N4), VirtualScroller (counts table was an unfilled placeholder). Batch2 Chips table also fixed (React 12/7/10/0/3/0, Vue 12/6/7/0/7/0, matching its matrix and `batch2/review-log.md`).
- Distribution recount of batches 2–7 and the Dialog, Tabs and Table pilots (2026-11-21, mechanical): a backtick-aware parser covered every layout in use (`Angular|React|Vue` and `NG|R|V` matrix tables, one row per framework, `C|P|M` row lists, bullet-style `P/P/P` rows). Every report matches its in-file distribution, so no further corrections were needed. Textarea (batch4) matches its matrix (NG 6/5/4/0/3/0, React 6/3/6/0/3/0, Vue 5/2/6/0/4/1); the earlier mismatch was a parsing artifact. IftaLabel row 09 reads `U→C (lead)` and counts as C, so NG 7/4/5/0/0/0 and Vue 7/3/5/0/1/0 are right as stated. Mention was counted from its React-only table (4/9/13/1/2/0; NG and Vue all N over 29 rows). TieredMenu's 13 bullet rows were counted by hand (NG 1/6/5/0/1/0, React 1/4/6/0/2/0, Vue 1/4/8/0/0/0). The recount checks arithmetic between each matrix and its stated counts. It does not re-verify any individual classification.
- Rulings resolved 2026-11-21: Steps (3), Button (2), Ripple (2), ScrollTop (3), Terminal (2), Tag (1). No batch8 ruling-needed sections remain except runtime-dependent U cells.
- Open U cells: MeterGroup NG row 5 only. The 12 batch4 cells were resolved by source trace on 2026-11-21; Timeline NG row 8 follows the Card ruling by precedent, not a Timeline probe. Card, Chip, ToggleButton, Tag, Paginator and Carousel (Angular) had one question: whether consumer `class`/`style` coexist with the host classes. The 2026-11-21 probe settled it for class and style; aria and other root attributes were not probed.
