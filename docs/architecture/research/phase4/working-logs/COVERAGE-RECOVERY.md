# Phase 4 coverage recovery

Reconstructed from the authorized session history on 2026-11-18. This is a coverage ledger, not a substitute for evidence-backed family reports. Product revision: `91a8472547e34c6e92456f2b98270a1555e3a2db`.

## Original batch 1

The original batch 1 delegation (session `session-e1d7f01a-44d6-465d-9142-a9da44eb966c`, event 650) assigned these ten families: keyfilter, iftalabel, iconfield, inputgroup, deferredcontent, progressspinner, blockui, floatlabel, mention, inputtext. All ten have later reports in `batch6/`; the original temporary reports are no longer in the old scratchpad. Batch 6 is the saved later analysis, not an additional ten families. Its review log documents subsequent rulings.

## Original batch 2

The original batch 2 delegation (same session, event 756) assigned multistatecheckbox, chip, chips, divider, toolbar, cascadeselect, metergroup, datascroller, tristatecheckbox and inputmask. All ten reports have been recovered, reviewed against the current method and saved in `batch2/`; `pt`, `ptOptions`, `unstyled`, and `dt` are separate rows. Exact recovery provenance is in `batch2/RECOVERY-PROVENANCE.md`; final audit changes and rulings are in `batch2/review-log.md`. Source-only evidence has no browser/test verification. Remaining U cells: MeterGroup NG row5 (vertical geometry) and Chip NG row20 (host class/style coexistence). Chip Vue row22 has an archive-search evidence limit.

## Saved later batches

`batch3/`–`batch6/` contain 40 reports; `batch7/` contains ten more. Original batch1 repeats the ten batch6 families and must not be double-counted. Some batch3–6 reports still combine `pt`/`ptOptions` and/or `unstyled`/`dt`; those need normalization and recount. Batch7 splits all four rows and has one U (ToggleButton Angular row33 host class coexistence).

Current unique family reports: 60 across batch2–batch7 and 37 in `batch8/`. The final pilot reports `pilot/dialog.md`, `pilot/tabs.md`, and `pilot/table.md` cover three additional canonical families, for 100 of 100 families represented (updated 2026-11-21; the earlier "63 of 100" predated batch8). The pilot Table matrix (43 rows after the 2026-11-21 extension) still excludes unresearched capabilities, so its coverage is bounded. See `PILOT-RECOVERY.md`.

## Limitations

- Historical note (as first recovered): 37 canonical component families and the shared-foundation track remained to be analyzed. The 37 are now the `batch8/` reports, and the shared-foundation audit is saved with its ledger ruled (2026-11-21).
- MeterGroup Angular vertical geometry remains unresolved pending a runtime check. Card, Chip, ToggleButton row33, Tag, Paginator and Carousel Angular class and style were settled by a jsdom host probe on 2026-11-21; no browser or visual claim is made.
- Individual reports retain evidence and limits. Do not aggregate across batches3–6 until their method-row normalization is complete.

## Recovery findings (2026-11-18, from session-e1d7f01a-44d6-465d-9142-a9da44eb966c)

- Batch 1 list confirmed (event 650, workflow phase4-batch1). Same ten families as batch6 (agent assignment pairs in event 2663). The earlier "pilot" was Dialog, Tabs, Table plus a shared-styling check (event 597); it is not batch 1. The pilot reports had not been saved when this note was first reconstructed; final matrices are now in `pilot/dialog.md`, `pilot/tabs.md`, and `pilot/table.md`. `scripts/inventory/pilot-sample.json` is an unrelated historical inventory term.
- Original batch 1 numbers are not comparable with batch6: event 741 records that D-PT re-marking recounts were pending, and event 674 flagged an unverified FloatLabel draft.
- Batch 2 list confirmed (events 755-756, five agents, two families each). Closeout at event 975; the full distribution table is in render_ui arguments at event 971.
- Toolbar (event 835, 62 lines) and CascadeSelect (event 841, 78 lines) were recovered from raw session events. Both have since been source-audited, updated to the current row convention, and mechanically recounted. CascadeSelect now has 28 rows per framework; its two Vue token mismatches and framework-specific React ARIA result are documented with evidence. Remaining source-verification limits are stated in the family report.
- The other eight batch 2 reports were recovered from four authorized child sessions. Preserved corrections were applied in sequence with exact old-text matching: MultiStateCheckbox 313; Chip 335; TriStateCheckbox 403; InputMask 413, 433, 438. See `batch2/RECOVERY-PROVENANCE.md` for original writes and session IDs.
- Batch 2 reference-defect rulings were individually obtained from the user and recorded in `DECISIONS.md` and `batch2/review-log.md`; recovery itself granted no approval. The only B2 unresolved classifications are the two runtime-dependent U cells listed above.
- Historical status when this recovery note was created: all ten Batch 2 reports were saved, before current-method review. Current state is recorded above: Batch 2 is now reviewed; 60 distinct batch2–batch7 reports exist, plus three final pilot matrices. Batch 1 duplicates Batch 6. The 100-family analysis is not complete, and aggregate conclusions must wait until Batches 3–6 are normalized.
