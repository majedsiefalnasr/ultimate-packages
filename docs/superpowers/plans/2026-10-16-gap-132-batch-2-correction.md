# GAP-132: batch 2 provenance correction and React/Vue notices

**Date:** 2026-10-16
**Status:** Plan for a narrowly scoped GAP-132 correction, authorized by the user on 2026-10-16 after the post-merge review of GAP-094 batch 2.
**Contract:** [ADR-064](../../architecture/DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label), applied as written and not amended.
**Evidence record:** [batch 2 evidence record, Correction section](../../architecture/research/2026-10-16-gap-094-backfill-batch-2-evidence.md#correction-under-gap-132-2026-10-16)

> **For agentic workers:** Execute inline. Records and notices only. Change no source file, schema or validator.

## Scope

1. **Re-assess the flagged batch 2 source entries.** Each entry is judged on its own direct comparison with checksum-verified pinned archives, never on lineage or another entry:
   - React `chip.tsx`: the PrimeReact entry and the PrimeNG entry, separately;
   - React `tag-style.ts`: both entries;
   - Vue `Tag.vue`;
   - the secondary sources of Vue `Chip.vue` (PrimeNG) and React `chip-style.ts` (ChipBase and `@primeuix/styles`).

   Also compare the pinned PrimeReact theme CSS for both React style files. Add a theme entry only where the comparison shows retained upstream expression.

2. **Update only the affected records:**
   - the affected entries in `provenance/react.json` and `provenance/vue.json`;
   - a dated Correction section in the batch 2 evidence record;
   - dispositions under GAP-132;
   - the corrected counts in the GAP-094 progress line.
3. **Notices.** In `packages/react/THIRD-PARTY-NOTICES.md` and `packages/vue/THIRD-PARTY-NOTICES.md`:
   - replace the stale "will incorporate";
   - add the PrimeNG Community Versions MIT notice for `primeng@21.1.9`, without the LTS section;
   - make no legal determination, and flag company-policy legal review (Blueprint §8).
4. **Verify.**
   - Only the targeted entries change, and every other manifest entry stays byte-identical.
   - The validator count is unchanged (661).
   - The PR-diff check, format check and lint pass.
5. **Deliver.**
   - Get an independent review.
   - Open a dedicated PR and compare its CI with `main` CI 38904007299.
   - Merge only if nothing new fails, then verify `origin/main`.

## Out of scope

- ADR-064 changes, the schema, the validator and production scope.
- Other batches and other legacy entries.
- Batch 3.

## Erratum — approved scope deviation (2026-10-16)

- **What happened.**
  - This Plan's file list omitted `docs/architecture/PROVENANCE.md`.
  - Scope item 3's notice changes touch watched package paths, so the ADR-061 PR-diff check (`requiresProvenance()` in `scripts/provenance/validate-provenance.mjs`) requires a `PROVENANCE.md` change in the same diff.
  - PR #28's first CI run (38912565747) failed with `source-affecting or unclassified watched path does not update docs/architecture/PROVENANCE.md`.
  - Commit `13cca895` then added the "GAP-132 batch 2 correction source disclosure" section, and the PR merged as `d21933be` without first asking for a scope decision. The conflict should have been surfaced before the scope was widened.
- **Approval.** The user approved the change after the fact on 2026-10-16 (options A and D). `docs/architecture/PROVENANCE.md` is part of this correction's scope as of this erratum.
- **Follow-up.** The disclosure wording was aligned with ADR-065, the limited exception for the two theme-derived React stylesheets.
- **Unchanged.** No other part of this Plan changes.
