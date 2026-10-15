# GAP-094 / DR-5 — Provenance manifest scope: evidence and decision options

**Date:** 2026-10-15
**Status:** DECIDED — the user approved Option B on 2026-10-15, recorded as ADR-062. The GAP-094 Specification refines the "path-pattern" wording in §4: production status comes from build evidence, not from file names.
**Scope:** C04 / [GAP-094](../BLUEPRINT_GAPS.md#gap-094--provenancevalidate-fails-on-a-missing-manifest-entry). Evidence measured at `main` `efd677fd` (tree identical to `bdc4dbcf` under `packages/` and `docs/architecture/provenance/`).

## 1. Verified problem

- [CI run 38730856573](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38730856573) "Provenance validation": `FAIL: packages/ng/src/accordion/accordion.spec.ts has no entry in docs/architecture/provenance/ng.json`. The diff check and the 7 `PROVENANCE.md` headings pass.
- [`validate-provenance.mjs`](../../../scripts/provenance/validate-provenance.mjs) stops at its first missing entry, so CI reports one file. A non-exiting count of the same rule (every `.ts`/`.tsx`/`.vue` under `packages/{uix,ng,react,vue,themes}*/src/`) finds **1163 files without an entry**, matching the 2026-10-11 completion assessment ("1163 of 1915 … 696 production source"). Adding the `accordion.spec.ts` entry alone moves the failure to the next file.

| Package    |  Missing |   Tests | Stories | `index` barrels | Style modules | Component/other |
| ---------- | -------: | ------: | ------: | --------------: | ------------: | --------------: |
| ng         |      318 |      73 |      73 |              72 |            26 |              74 |
| ng-core    |       16 |       5 |       — |               4 |             — |               7 |
| react      |      384 |      74 |      82 |              74 |            71 |              83 |
| react-core |        3 |       1 |       — |               1 |             — |               1 |
| vue        |      432 |      82 |      73 |              81 |            30 |             166 |
| vue-core   |        8 |       4 |       — |               1 |             — |               3 |
| uix-styles |        2 |       — |       — |               2 |             — |               — |
| **Total**  | **1163** | **239** | **228** |         **235** |       **127** |         **334** |

- Origin: about 1100 of the 1163 files were added by the Phase C Batch 1–2 component commits (2026-09-17 → 09-20, e.g. `cbb4bf2d`, `be9f35e4`, `5f1ddb8b`); the rest by the Phase 10 Storybook setup and a few later test commits. The Phase C Specs and Plans required implementers to consult pinned Prime source but did not require manifest entries.
- Existing manifests already record tests, stories and barrels: ng/react/vue hold 57 `authored` test entries, 38 story entries and 47 `index` entries next to Prime-derived ones (`adapted`, `reference-derived`, `reimplemented-with-reference`).
- Shipped content: `ng`, `react` and `vue` publish only `dist`, `README.md` and `THIRD-PARTY-NOTICES.md` (`package.json` `files`). Whether any test or story file reaches `dist` must be confirmed in a later Spec.

> **Note (2026-10-15, Spec Review):** the table's categories were assigned by file name and are estimates. For example, two `uix-styles` files counted as "`index` barrels" (`src/inputtext/index.ts` and `src/inputnumber/index.ts`) are Prime-derived style modules. The GAP-094 Specification reconciles the counts from build evidence.

## 2. Governing text and the conflict DR-5 must settle

- **Phase 0 Spec** (approved): a provenance record for "every Prime-derived source area incorporated"; PR rule for PRs that incorporate Prime-derived source. [ADR-061](../DECISIONS.md) confirmed the source-incorporation qualifier governs the PR diff check.
- **Phase 1 Spec** §manifest: "one array entry per **incorporated** source file", **and** its validator extension: "every `.ts` file under each `packages/uix-*/src/` has a corresponding entry".
- **Phase 2 Spec** (ng), Phase 3/4 Plans (react/vue): the same "every `.ts`/`.tsx`/`.vue` file" rule, extended per framework. This is the rule the validator implements.
- **Completion register C04**: "Decide repository-wide provenance scope, then bounded Spec/Plan and evidence backfill." Gate G3: "`provenance:validate` green under the DR-5 scope."

So the approved documents contain both an _incorporated-source_ scope and an _every-file_ scope. Every option below therefore needs an ADR recording which governs.

## 3. Options

Every option keeps truthful classifications. A non-`authored` status needs per-file evidence against the pinned Prime source, and nothing is marked `authored` without checking for an upstream counterpart.

### Option A — Keep the every-file scope; backfill all 1163 entries

- No validator rule change. The ADR confirms the Phase 1–4 every-file rule.
- Backfill: the 702 tests, stories and barrels are mostly `authored`, but each needs a check against its upstream counterpart (e.g. PrimeNG ships `accordion.spec.ts`). The 461 style and component files need real lineage evidence.
- Most work and the largest diff, but it matches every existing manifest and validator test, and the strongest record.

### Option B — Production scope: exclude tests and stories; backfill 696 entries

- ADR narrows the manifest rule to files that can ship: exclude `*.spec.*`, `*.test.*` and `*.stories.*` under `src/`, and keep barrels and style modules.
- Validator change, with tests, to exclude those patterns. Existing test and story entries stay valid (extra entries are harmless) or are removed by decision.
- Backfill 696: 235 barrels (mostly `authored`/`re-export`, mechanically checkable) plus 461 style and component files that need lineage evidence.
- Ties provenance to distributed code, the licensing purpose. Weaker record for non-shipped files.

### Option C — Incorporated-source only (Phase 0 wording)

- Entries required only for files that incorporate Prime-derived source.
- Needs a machine-checkable "derived" marker (e.g. a per-file header or a declared directory list). Otherwise the validator cannot tell an unrecorded derived file from an authored one and enforcement fails open.
- Smallest manifest, but the weakest CI guarantee, and the biggest design change (new marker contract, Spec/ADR, validator rewrite).

### Cross-cutting add-ons (any option)

- **Report-all mode:** the validator lists every missing entry before exiting non-zero, instead of stopping at the first. This is diagnostic only and does not weaken the gate. It is in scope for whichever Spec implements DR-5.
- **Batching:** backfill per package and per Phase C batch, each with its own evidence record, so review stays bounded. CI stays red until the last batch merges.
- **Forward guard:** keep the existing changed-file completeness practice (ADR-052 X-12) for new work.

## 4. Recommendation

**Option B.**

- It matches the Phase 0 licensing intent: provenance follows distributed source.
- It keeps a deterministic, fail-closed path-pattern rule; Option C's marker problem is avoided.
- It removes 467 low-value test and story entries from the backfill.
- The 461 style and component files need lineage evidence under both A and B, so B saves the low-value part of the work, not the hard part.

Choose **A** if the company's legal review needs every repository file recorded. That requirement is listed as unknown in C04.

## 5. Next gate after the decision

1. ADR recording DR-5.
2. GAP-094 Specification: the validator change (if B or C), report-all mode, the per-file evidence method, and batching.
3. Spec Review, then Plan and Plan Review, then backfill PRs in batches.

The single `accordion.spec.ts` entry is not added on its own: under Option B that file leaves scope.
