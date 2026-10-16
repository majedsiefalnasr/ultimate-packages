# GAP-094 backfill batch 3: Divider and Toolbar (Angular, React, Vue)

**Date:** 2026-10-16
**Status:** Plan for batch 3 under the approved [GAP-094 Specification](../specs/2026-10-15-gap-094-production-provenance-scope-design.md) §3.4 and Amendment A1. The user authorized batch 3 on 2026-10-16.
**Governing decisions:** [ADR-064](../../architecture/DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label) (source classes) and [ADR-065](../../architecture/DECISIONS.md#adr-065--limited-exception-two-pre-existing-react-stylesheets-retain-primereact-theme-css-values-outside-componentslib) (the PrimeReact source boundary stays `components/lib/`; no new outside-boundary sources).
**Evidence record:** [`research/2026-10-16-gap-094-backfill-batch-3-evidence.md`](../../architecture/research/2026-10-16-gap-094-backfill-batch-3-evidence.md)

> **For agentic workers:** Execute inline. Manifest data only. Change no source file, classifier or validator.

## Goal

At `main` `4c932c41`, the validator reports 661 missing files. This batch adds ADR-064 entries for the missing production files of Divider and Toolbar: two layout primitives from Phase C Batch 1 Plan §7 (Divider row 217, Toolbar row 234), present in all three frameworks.

## Files (16 missing; 14 in scope, 2 held)

| Framework   | In scope                                                                                         | Held for a decision (ADR-065 boundary)                 |
| ----------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Angular (4) | `divider/{divider,index}.ts`, `toolbar/{toolbar,index}.ts`                                       | —                                                      |
| React (6)   | `divider/{divider.tsx,index.ts}`, `toolbar/{toolbar.tsx,index.ts}`                               | `divider/divider-style.ts`, `toolbar/toolbar-style.ts` |
| Vue (6)     | `divider/{Divider.vue,BaseDivider.ts,index.ts}`, `toolbar/{Toolbar.vue,BaseToolbar.ts,index.ts}` | —                                                      |

The two React style modules retain literal values that match pinned PrimeReact theme CSS (`public/themes/*`). That is an apparent source outside `components/lib/`. Under ADR-065 and the user's batch 3 instruction, their classification stops: they get no entry, stay validator failures, and their evidence is reported for a separate decision.

## Tasks

1. **Evidence.** For each file, record:
   - lineage from `git log --follow`;
   - the governing Plan row;
   - a side-by-side comparison with the checksum-verified pinned archives (`vendor:fetch`);
   - the source class, decided per entry (ADR-064 Decisions 1 and 2) under the A1 barrel rule.

   For React style modules, also compare the pinned theme CSS, and hold any file whose values match it.

2. **Entries.** Append the 14 entries to `docs/architecture/provenance/{ng,react,vue}.json`, using only the ADR-064 matrix values, with `originalPath` set to the compared upstream file. Change no existing entry.
3. **Verify.**
   - The full local validator output drops by exactly 14 (661 → 647).
   - No file is newly missing, and the production and excluded counts are unchanged.
   - The diff check passes on the committed head.
   - `test:scripts` passes after a build, and the repository's Prettier passes.
4. **Tracking.** Record batch 3, the held files and the remaining count in GAP-094 and C04.
5. **Review and PR.**
   - Get an independent review.
   - Push with an explicit refspec and open a dedicated PR.
   - Compare its CI with `main` CI 38935468313 on step results, per-package summaries and failure messages, using the full local validator output on both trees.
   - Merge only if nothing new fails, then verify `origin/main`.

## Out of scope

- Other components.
- Existing entries.
- The GAP-132 source-comment and legal-review items.
- The classifier, the validator and the Release "Select mode" failure.
