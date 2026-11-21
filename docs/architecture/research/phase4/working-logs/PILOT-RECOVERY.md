# Pilot evidence recovery

Recovered from authorized history on 2026-11-18. This is a provenance and limitations record, not a final capability matrix or a fresh source verification. Baseline: `91a8472547e34c6e92456f2b98270a1555e3a2db`.

## Provenance

Root session: `session-e1d7f01a-44d6-465d-9142-a9da44eb966c`.

- Events 474 and 597 contain substantive pilot findings for Dialog, Tabs, Table and shared styling. Event 597 calls the sample complete; its Table findings remain preliminary and no later completed Tabs matrix was located.
- Event 378 proposed the temporary external pilot. Method recommendations at 492 were approved at 499. Recommendations at 614 were approved at 621: Dialog gaps stay missing for Phase 5; React Aura remains partial; work continues in small batches outside the product repository.
- Supporting child session `0756219c-87e0-4a42-8f96-eb9e9224a9ab`, events 59, 128, 133: Tabs composition mapping and reversed Home/End documentation.
- Supporting child session `8aee1329-0177-4781-aeb3-d440f233804b`, event 143: inventory verification methodology. Earlier PostCSS-disabled checks do not verify CSS processing.

## Historical findings and limits

### Dialog

Root events 474, 597; the final current-method matrix is `pilot/dialog.md` (19 rows/framework, including the 2026-11-21 Aura-token row). Counts C/P/M/I/N/U: NG 1/10/7/0/1/0; React 1/8/8/0/2/0; Vue 6/3/8/0/2/0 (18-row figures before that row were NG 0/10/7/0/1/0; React 1/7/8/0/2/0; Vue 5/3/8/0/2/0). The user ruled NG blockScroll P by pinned PrimeNG source and recorded its docs/source conflict. PrimeVue modal null vs Ultimate true is a default flag; Vue resizable is N. Source-only; no rendered mask, focus, accessibility-tree, or computed-style verification.

### Tabs

Root event 474; final current-method matrix `pilot/tabs.md` (14 rows/framework, including the 2026-11-21 Aura-token row). Counts C/P/M/I/N/U: NG 5/5/3/0/1/0; React 2/6/5/0/1/0; Vue 5/2/6/0/1/0 (13-row figures before that row were NG 4/5/3/0/1/0; React 2/5/5/0/1/0; Vue 4/2/6/0/1/0). Angular/Vue map to five-part Tabs; React maps to TabView/TabPanel, with TabMenu separate. User ruled Vue Home/End C following pinned source; the docs reversal is recorded as a reference defect. React and Angular remain P due PageUp/PageDown gaps. React inkbar is missing; lazy mounting is M in all three. Earlier Vue checks at `3864a1d` bypassed PostCSS and establish neither styling nor unchanged files at the pilot baseline.

### Table

Root event 597; final current-method matrix `pilot/table.md` (43 rows/framework; rows 1–31 original, rows 32–43 added 2026-11-21 under user ruling option C). Counts C/P/M/I/N/U: NG 13/7/21/0/2/0; React 13/4/23/0/3/0; Vue 14/4/25/0/0/0, recounted mechanically. UTable maps to Angular Table and React/Vue DataTable by function. React cell-edit callbacks are declared but not invoked; row-edit callbacks do fire. Angular unstyled/dt rows follow D-SHARED #5 (P, declared but unread); React dt is N because PrimeReact has no such API. Rows 32–43 cover row keyboard, sortable-header keyboard, `aria-sort`, row `aria-selected`, `role="cell"`, selection-control names, `scrollable`/`scrollHeight` and the global filter. Matrix still excludes cell-level keyboard, filter-menu keyboard/ARIA, loading, empty message/template, variants, responsive, templates, row reorder and context menu pending source reads.

### Shared styling

Root events 474, 597; style-module anchor 529. Dependency declarations did not prove use. Dialog Angular/Vue imported a shared module with 12 dt calls; React used handwritten layout CSS without consuming those token variables. React Aura was reported partial, source-only. This was not a comprehensive theme audit; Lara, Material and Nora were outside the sample. Current in-force ADRs and later shared rulings must be checked before reusing historical styling classifications.

## Coverage treatment

Dialog, Tabs and Table were previously sampled and now have final current-method matrices in `pilot/`. Shared styling is a cross-cutting track, not a fourth component family. This pilot is distinct from original batch1 (the ten families later reanalysed in batch6) and from the unrelated inventory Button pilot.

No tests, browser checks, product edits, specifications, tickets or priorities were introduced by this recovery.
