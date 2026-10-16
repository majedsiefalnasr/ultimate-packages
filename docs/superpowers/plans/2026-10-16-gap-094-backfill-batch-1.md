# GAP-094 backfill batch 1: framework-core services and uix-styles input modules

**Date:** 2026-10-16
**Status:** Plan for batch 1 of the backfill under the approved [GAP-094 Specification](../specs/2026-10-15-gap-094-production-provenance-scope-design.md) §3.4 (ADR-062, DR-5 Option B). The user authorized the backfill and its routine stages on 2026-10-16.
**Evidence record:** [`research/2026-10-16-gap-094-backfill-batch-1-evidence.md`](../../architecture/research/2026-10-16-gap-094-backfill-batch-1-evidence.md)

> **For agentic workers:** Execute inline. Manifest data only. Change no source file, classifier or validator.

## Goal

Add evidence-backed manifest entries for the 19 missing production files outside `packages/{ng,react,vue}`. At `main` `c1745040`, the validator reports 696 missing production files: ng 172, react 228, vue 277, ng-core 11, vue-core 4, react-core 2, uix-styles 2. This batch covers the last four rows. They form one coherent group: the overlay and notification service tier added in Phase C Batch 1, one SSR id service, and two `@primeuix/styles` input modules.

## Files (19)

| Package        | Files                                                                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ng-core (11)   | `confirmation/{confirmation-service,confirmation,index}.ts`, `dialog-service/{dialog-service,dynamic-dialog-ref,index}.ts`, `id/component-id-generator.ts`, `terminal-service/{terminal-service,index}.ts`, `toast-service/{toast-service,index}.ts` |
| react-core (2) | `confirmation/{confirmation-event-bus,index}.ts`                                                                                                                                                                                                     |
| vue-core (4)   | `service/{confirmation-service,dialog-service,toast-service,index}.ts`                                                                                                                                                                               |
| uix-styles (2) | `inputnumber/index.ts`, `inputtext/index.ts`                                                                                                                                                                                                         |

## Tasks

1. **Evidence.** For each file, record in the evidence record:
   - its adding commit and any later commits;
   - the governing Spec or Plan row;
   - the upstream counterpart in the pinned archive (`pnpm run vendor:fetch -- primeng primevue primereact @primeuix/styles`), or a recorded check that none exists;
   - the resulting classification.

   A file with inconclusive evidence gets no entry and is listed for the user.

2. **Entries.** Append one entry per file to `docs/architecture/provenance/{ng-core,react-core,vue-core,uix-styles}.json`, using the existing schema and status vocabulary. A file with two upstream references gets two entries, following the `ng-core/src/api/types.ts` precedent. Do not change any existing entry.
3. **Verify.**
   - `node scripts/provenance/validate-provenance.mjs` reports 677 problems, exactly 19 fewer. Each package's production and excluded counts are unchanged, and no file outside this batch is newly missing.
   - `pnpm run test:scripts` shows no new failure.
   - `npx prettier --check` passes on the changed files.
4. **Tracking.** Record batch 1 and the new remaining count (677) in GAP-094 (`BLUEPRINT_GAPS.md`) and C04 (`COMPLETION_REGISTER.md`). GAP-094 stays OPEN.
5. **Review and PR.**
   - Get an independent review that checks every entry against its evidence row and the upstream file, and apply verified findings.
   - Commit on `feature/gap-094-backfill-batch-1`, push with an explicit refspec, and open a dedicated PR.
   - Compare its CI with `main` CI 38815159004. The expected difference is "Provenance validation" still failing, at 677 instead of 696, with no other step changing.
   - Merge only if nothing new fails, then refresh `origin/main` before batch 2.

## Out of scope

- The 677 files in `packages/{ng,react,vue}`, which go to later batches.
- The classifier and validator, and the deferred validator Minor findings.
- GAP-091/C01, and the Release Select mode failure.
