# GAP-094 backfill batch 2: Chip and Tag (Angular, React, Vue)

**Date:** 2026-10-16
**Status:** Plan for batch 2 under the approved [GAP-094 Specification](../specs/2026-10-15-gap-094-production-provenance-scope-design.md) §3.4 and Amendment A1, following [ADR-064](../../architecture/DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label). The user authorized batch 2 on 2026-10-16.
**Evidence record:** [`research/2026-10-16-gap-094-backfill-batch-2-evidence.md`](../../architecture/research/2026-10-16-gap-094-backfill-batch-2-evidence.md)

> **For agentic workers:** Execute inline. Manifest data only. Change no source file, classifier or validator.

## Goal

At `main` `d08fb800`, add ADR-064 entries for every production file of Chip and Tag that still lacks a manifest entry, in all three frameworks. These are two small display components, added in Phase C Batch 1 (Chip and Tag rows of Plan §7).

## Files (16)

| Framework   | Files                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Angular (4) | `chip/{chip,index}.ts`, `tag/{tag,index}.ts`                                    |
| React (6)   | `chip/{chip.tsx,chip-style.ts,index.ts}`, `tag/{tag.tsx,tag-style.ts,index.ts}` |
| Vue (6)     | `chip/{Chip.vue,BaseChip.ts,index.ts}`, `tag/{Tag.vue,BaseTag.ts,index.ts}`     |

The other Chip and Tag files (Angular and Vue style modules, tests and stories) already have entries or are excluded from production.

## Tasks

1. **Evidence.** For each file, record:
   - lineage from `git log --follow`;
   - the governing Plan row;
   - a side-by-side comparison with the counterpart in the checksum-verified pinned archive. These are PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5 and `@primeuix/styles` 2.0.3, fetched with `pnpm run vendor:fetch`.

   From the comparison, derive the source class (ADR-064 Decision 1, with genuine uncertainty resolved to COPY). Index files follow the A1 barrel rule.

2. **Entries.** Append the entries to `docs/architecture/provenance/{ng,react,vue}.json`:
   - use only the ADR-064 matrix values;
   - give `originalPath` as the compared upstream file;
   - add two entries where two upstream files contribute;
   - change no existing entry.
3. **Verify.**
   - The validator reports exactly 16 fewer problems (677 → 661). No file is newly missing, and the production and excluded counts are unchanged.
   - The PR-diff check passes.
   - `test:scripts` passes after a build.
   - The repository's Prettier passes.
4. **Tracking.** Record batch 2 and the remaining count in GAP-094 and C04.
5. **Review and PR.**
   - Get an independent review of every entry against its upstream file.
   - Push with an explicit refspec and open a dedicated PR.
   - Compare its CI with `main` CI 38895551609.
   - Merge only if nothing new fails, then refresh `origin/main`.

## Out of scope

- The remaining components.
- Vue Badge: Angular and React Badge already have entries, so it is left for a later batch.
- Existing entries (GAP-132).
- The classifier and validator.
- Release Select mode.
