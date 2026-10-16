# GAP-094: provenance classification semantics (decision document)

**Date:** 2026-10-16
**Status:** DECIDED (user decision, 2026-10-16), recorded as [ADR-064](../DECISIONS.md#adr-064--provenance-source-class-copy-reference-original-is-evidence-based-modificationstatus-is-a-descriptive-sub-label). This document is kept as the evidence record, and the analysis below is the pre-decision draft, unchanged except for count and wording corrections from the decision review.
**Base:** `main` `f811c457c720403a66e780a56b115312e25a052d` (PR #25 merge), verified against GitHub. CI [38885628501](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38885628501) fails only "Provenance validation" (677).
**Scope:** the meaning and evidence of `modificationStatus` values. The DR-5 production-only scope (ADR-062) is unchanged.

**Decision recorded:**

- **D1 (taxonomy):** Option B, with source classes COPY, REFERENCE and ORIGINAL.
- **D2 (documentation):** a new ADR (ADR-064), GAP-094 Specification Amendment A1, and a vocabulary section in `PROVENANCE.md`. The Phase 1 and Phase 2 Specifications keep their text, with a note marking their vocabularies historical.
- **D3 (ambiguity):** genuine uncertainty about retained upstream wording, statements or structure resolves to COPY, citing the compared upstream file and stating the uncertainty. Standard APIs, public names or equivalent behavior alone do not establish copying.
- **D4 (enforcement):** no validator or schema change.
- **D5 (existing entries):** they are not edited, migrated or reclassified, including batch 1. The inconsistencies are registered as GAP-132.

**Difference from the §3 Option B table and the §4 G3 row below.** The user asked that undefined legacy values not be approved merely because they exist. ADR-064's matrix is therefore stricter than this draft's table:

- New COPY entries use only `unmodified`, `import-path-adapted` and `adapted`.
- `reference-derived`, `rebranded`, `reconstructed` and `transcribed` become legacy-only, together with `ultimate-authored` and `re-export`.

## 1. Question

Does the repository define authoritative meanings and evidence criteria for `modificationStatus` values such as `adapted`, `reimplemented-with-reference` and `authored`? If not, what should the contract be before more entries are added?

## 2. Findings

### F1. No machine-readable contract exists

- **The validator does not read the field.** `scripts/provenance/validate-provenance.mjs` reads only `ultimateDestination` from manifest entries (lines 128–132 and 192–194). It never reads `modificationStatus`, `originalPath` or `modificationDescription`. There is no JSON Schema for the manifests.
- **Other consumers read only `ultimateDestination`.** Those are `packages/component-schema` (`provenanceRef` validation and its test) and `component-metadata` records.
- **Nothing consumes the label downstream.** No script, CI step or package code does. Third-party notices are maintained per package by hand, not generated from the label.
- **Only one place sets labels mechanically.** `scripts/provenance/generate-manifest.mjs` (Phase 1, `uix-*` only) assigns `unmodified` or `import-path-adapted` by testing for an `@ultimate/uix-` import, plus hand overrides (`reconstructed`, `transcribed`).

### F2. Two different enumerations exist in approved Specs, and neither matches actual use

| Source                                                                                                             | Enumerated values                                                                       | Definition given       |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 Spec (`2026-08-28-phase-1-uix-foundation-design.md:310`)                                                   | `unmodified` \| `import-path-adapted` \| `modified`                                     | None beyond the names. |
| Phase 2 Spec (`2026-08-29-phase-2-ultimateng-foundation-design.md:388`; repeated in the Blueprint Completion Plan) | `unmodified` \| `import-path-adapted` \| `refactored` \| `reimplemented-with-reference` | See below.             |

The only definitional sentence in either Spec is in Phase 2: `reimplemented-with-reference` means "genuinely rewritten with PrimeNG's file as a design reference, not adapted-in-place", and "this must be distinguishable in the manifest from a verbatim or lightly-adapted file".

`modified` and `refactored` have never been used in any manifest.

### F3. Eleven values are in use; eight were introduced without a Spec definition

The counts below are across all 12 manifests at `f811c457`.

| Value                          | Entries | First added                          | Defined in a Spec?                                                                                    |
| ------------------------------ | ------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `authored`                     | 244     | `31103e8d` (2026-08-29, ng scaffold) | No. Named as a value in Phase 2–4 Plans, never defined.                                               |
| `reference-derived`            | 176     | `cd2250cd` (2026-09-01, themes)      | Wording fixed by approved G3 Specs ("Ported (Option B — reference, not verbatim copy)"), not defined. |
| `unmodified`                   | 149     | `081e03f7` (Phase 1)                 | Enumerated (Phase 1/2).                                                                               |
| `adapted`                      | 123     | `709bceb5` (2026-08-29, uix-styles)  | No. Named in Phase 2–4 Plans, never defined.                                                          |
| `reimplemented-with-reference` | 71      | `16c06bda` (2026-08-29)              | Yes (Phase 2, one sentence).                                                                          |
| `import-path-adapted`          | 14      | `081e03f7`                           | Enumerated; generator rule.                                                                           |
| `ultimate-authored`            | 6       | `48dcaac7` (uix-data)                | No.                                                                                                   |
| `reconstructed`                | 5       | `ba69ae3a`                           | No (generator override text only).                                                                    |
| `rebranded`                    | 2       | `fd3cfa8d`                           | No.                                                                                                   |
| `transcribed`                  | 2       | `ba69ae3a`                           | No.                                                                                                   |
| `re-export`                    | 1       | `48dcaac7`                           | No.                                                                                                   |

The values were therefore chosen by individual contributors, with Plans repeating them. They are a convention without an agreed definition.

### F4. Current use is internally inconsistent

1. **`adapted` with no upstream file (10 entries).**
   - 5 vue-core composables are "adapted" from other Ultimate files, not from upstream.
   - 5 Vue style modules are "adapted" from an Ultimate brief.
   - So `adapted` is used both for "derived from upstream" and for "derived from another Ultimate file".
2. **`authored` whose `originalPath` is its own Ultimate path (9 entries).** Nine Angular tests have `originalPath` equal to their own Ultimate path while saying "not derived from upstream".
3. **The same transformation gets different labels.** A `@primeuix/styles` module copied with only its class prefix renamed is `adapted` in `uix-styles.json`, for example `button` and `inputtext`. CSS declarations ported from the same package into G3 `*-style.ts` files are `reference-derived`, described as "reference, not verbatim copy".
   - Yet the G3 CSS keeps upstream declaration text. For example, `packages/ng/src/drawer/drawer-style.ts` holds upstream `drawer` declarations, selected and re-serialized by `g3d-port.mjs`.
   - The labels track the process and the team's intent, not how much upstream text the file contains.
4. **Role decides the label, not evidence.** The Phase C Batch 3 Plan assigns `implementation ? "reimplemented-with-reference" : "authored"` by file name. That includes "structural style" files, which can carry ported CSS. This is the name-based inference the GAP-094 Spec §3.1 forbids for scope; it was applied to classification before that Spec existed.
5. **Self-descriptions contradict the code.**
   - vue-core `service/*.ts` (13faa040) say "not copied verbatim (Option B)", yet keep upstream's statements: the same `emit` calls and the same handle object with `markRaw`.
   - `packages/ng-core/THIRD-PARTY-NOTICES.md`'s preamble says only the `UBaseComponent`/`UBaseEditableHolder` hierarchy is "informed by, but not copied from" PrimeNG, which matches those entries' `reimplemented-with-reference`. It does not mention the `adapted` files in `ng-core.json`: `overlay.ts`, `focus-trap.ts`, `bind.ts`, the icons and, since batch 1, the services.
   - Its MIT license text is present, so the legal notice is satisfied. The preamble is incomplete, not wrong.
6. **Notice wording is stale.** `packages/{react,vue}/THIRD-PARTY-NOTICES.md` still say "will incorporate". Every published package that carries upstream code ships the full MIT text; `uix-data` has no notice and no upstream-derived entries.

### F5. What the Blueprint actually requires

- **Blueprint §8:** "Every copied or materially derived source area must be traceable", legally required notices must be preserved, and the inventory has a "Modification status" column, with no values defined.
- **Blueprint §2.3** lists required attribution.

The normative need is therefore binary per file:

- Does it carry or derive upstream expression, so it must be traced to an upstream file and covered by the package's MIT notice?
- Or is it independent?

The finer distinctions (renamed, subset, re-serialized, reconstructed) are descriptive. Nothing in the repository depends on them.

## 3. Options

### Option A — Define the existing eleven values, then enforce a closed set

Write one definition and evidence rule per existing value, and add an enum check to the validator. Existing entries are kept.

- **Pro:** no migration.
- **Con:** it ratifies F4's overlaps. `adapted` and `reference-derived` would need an artificial line, because both describe kept upstream text. Several existing entries would then violate the new definitions, and per the user's instruction they would not be fixed.

### Option B — One normative axis in the evidence record; `modificationStatus` stays descriptive (recommended)

1. **Normative class, recorded in each batch's evidence table.** The class is decided only by a side-by-side comparison with the pinned upstream file:
   - **COPY.** The file keeps upstream expression: statements, declaration blocks, selectors, doc text or control flow, carried over with or without renames, subsetting, import rewrites or re-serialization.
   - **REFERENCE.** An upstream counterpart was consulted, but the comparison shows no kept upstream expression beyond interface facts: public names, event names, parameter shapes and documented behavior.
   - **ORIGINAL.** No upstream counterpart exists, checked by name and by same-named file or directory in every pinned archive. Ultimate-to-Ultimate adaptation counts as ORIGINAL with respect to upstream.
2. **`modificationStatus` keeps the existing vocabulary as a descriptive sub-label.** A mapping fixes which sub-labels are allowed for each class:

| Class     | Allowed `modificationStatus` for new entries                                                                                                                  | `originalPath`              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| COPY      | `unmodified`, `import-path-adapted`, `rebranded`, `reconstructed`, `transcribed`, `adapted`, `reference-derived` (G3 style ports only, per approved G3 Specs) | the upstream file           |
| REFERENCE | `reimplemented-with-reference`                                                                                                                                | the upstream file consulted |
| ORIGINAL  | `authored`                                                                                                                                                    | `n/a`                       |

3. **Where the rule lives:**
   - the definitions as a new ADR, cited by the GAP-094 Spec §3.4 as an erratum;
   - a short "Manifest status vocabulary" section in `PROVENANCE.md`;
   - the class column in each batch evidence record.

   A validator enum check is optional and a separate decision. A JSON-schema change is not needed.

- **Pro:** it matches what Blueprint §8 needs, and it is decidable from evidence. It needs no migration of the 793 existing entries and no change to merged entries. Each label keeps a fixed meaning for new entries.
- **Con:** existing entries stay inconsistent (F4) until a separate, authorized cleanup.

### Option C — Replace the vocabulary with the three classes

Make `modificationStatus` one of `copy` | `reference` | `original` and migrate every entry.

- **Pro:** the simplest contract.
- **Con:** it rewrites about 793 merged entries and so needs per-entry evidence for all of them. It also discards descriptive detail and widens GAP-094 well beyond the backfill.

### Option D — Keep labels free-form; record only `originalPath` and evidence

- **Pro:** no taxonomy work.
- **Con:** it leaves the inconsistencies in F4 to grow over the remaining 677 files, and it does not answer the question the user raised.

## 4. Evidence required per class (Option B)

| Case                                                                                 | Evidence                                                                                                   | Class                                                                                                    |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Verbatim or renamed upstream code                                                    | Side-by-side diff. Prefer a mechanical check: reverse the rename and diff it to empty.                     | COPY                                                                                                     |
| Partial adaptation: a subset of members, or upstream statements kept around new code | Diff showing at least one kept upstream statement, declaration block or doc passage beyond interface names | COPY. The description lists what was dropped or added.                                                   |
| Upstream CSS re-serialized by a generator (G3)                                       | The generator mapping, plus a declaration-level match                                                      | COPY (superseded sub-label: new entries use `adapted`; `reference-derived` is legacy-only under ADR-064) |
| Same API, different mechanism, no kept expression                                    | Diff showing only interface facts in common, and a note of the mechanism difference                        | REFERENCE                                                                                                |
| No upstream counterpart                                                              | Name search and same-named file/directory check in every pinned archive, recorded with the paths searched  | ORIGINAL                                                                                                 |
| Barrel                                                                               | Same-named upstream barrel or directory check. Re-export-only content alone does not decide (Spec §3.4).   | ORIGINAL if no counterpart, otherwise COPY                                                               |
| Derived from another Ultimate file only                                              | Name the Ultimate source in the description                                                                | ORIGINAL, with `originalPath: "n/a"`                                                                     |
| Ambiguous: the comparison cannot show whether kept text is expression or interface   | Record both readings                                                                                       | **Decision point D3**                                                                                    |

## 5. Impact

### 5.1 The 20 Batch 1 entries (merged in #25, not edited)

Re-evaluated under Option B. The "Label change?" column shows whether the `modificationStatus` value would differ.

| Entry                                                     | Current                      | Class (Option B) | Label change? | Note                                                                                                                                                                                                |
| --------------------------------------------------------- | ---------------------------- | ---------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ng-core `confirmation/confirmation-service.ts`            | adapted                      | COPY             | No            | Upstream statements kept.                                                                                                                                                                           |
| ng-core `confirmation/confirmation.ts`                    | adapted                      | COPY             | No            | **Uncertain.** Field doc text is near-verbatim. Precedent `ng-core/src/api/types.ts` (subset interfaces) is `reimplemented-with-reference`, so the reading depends on whether doc text counts (D3). |
| ng-core `confirmation/index.ts`                           | authored                     | ORIGINAL         | No            |                                                                                                                                                                                                     |
| ng-core `dialog-service/dialog-service.ts`                | reimplemented-with-reference | REFERENCE        | No            | Different mechanism, no kept statements.                                                                                                                                                            |
| ng-core `dialog-service/dynamic-dialog-ref.ts`            | reimplemented-with-reference | REFERENCE        | No            | **Uncertain.** It keeps upstream's `Subject` + `asObservable` + `close(result)` → `next(result)` shape under new names; that is idiomatic RxJS, so it is borderline.                                |
| ng-core `dialog-service/index.ts`                         | authored                     | ORIGINAL         | No            |                                                                                                                                                                                                     |
| ng-core `id/component-id-generator.ts`                    | authored                     | ORIGINAL         | No            |                                                                                                                                                                                                     |
| ng-core `terminal-service/terminal-service.ts`            | adapted                      | COPY             | No            |                                                                                                                                                                                                     |
| ng-core `terminal-service/index.ts`                       | authored                     | ORIGINAL         | No            |                                                                                                                                                                                                     |
| ng-core `toast-service/toast-service.ts`                  | adapted                      | COPY             | No            |                                                                                                                                                                                                     |
| ng-core `toast-service/index.ts`                          | authored                     | ORIGINAL         | No            |                                                                                                                                                                                                     |
| react-core `confirmation-event-bus.ts` (ConfirmDialog.js) | reimplemented-with-reference | REFERENCE        | No            | **Uncertain.** The `visible` default and event name are kept, but the statements are rewritten.                                                                                                     |
| react-core `confirmation-event-bus.ts` (ConfirmPopup.js)  | reimplemented-with-reference | REFERENCE        | No            | Same as above.                                                                                                                                                                                      |
| react-core `confirmation/index.ts`                        | authored                     | ORIGINAL         | No            |                                                                                                                                                                                                     |
| vue-core `service/confirmation-service.ts`                | adapted                      | COPY             | No            | The file's own JSDoc says "not copied verbatim"; the code keeps upstream's statements. The entry follows the code.                                                                                  |
| vue-core `service/dialog-service.ts`                      | adapted                      | COPY             | No            | Same.                                                                                                                                                                                               |
| vue-core `service/toast-service.ts`                       | adapted                      | COPY             | No            | Same.                                                                                                                                                                                               |
| vue-core `service/index.ts`                               | authored                     | ORIGINAL         | No            | PrimeVue `packages/core/src/service/` checked; not a counterpart.                                                                                                                                   |
| uix-styles `inputnumber/index.ts`                         | adapted                      | COPY             | No            | Follows `uix-styles.json` precedent. It would be `reference-derived` only under a G3-style precedent (Option A reading).                                                                            |
| uix-styles `inputtext/index.ts`                           | adapted                      | COPY             | No            | Same.                                                                                                                                                                                               |

**Result.**

- Under Option B, no Batch 1 label changes. Batch 1 already used this rule (its evidence record's status rule).
- Four entries are **uncertain** pending D3: `confirmation.ts`, `dynamic-dialog-ref.ts`, and both react-core `confirmation-event-bus.ts` entries.
- Under Option A with a process-based line, the three vue-core services could become `reimplemented-with-reference`, and the two uix-styles modules could become `reference-derived`.
- Under Option C, all 20 would be rewritten to class values.

### 5.2 The remaining 677 files (ng 172, react 228, vue 277)

- **Barrels: 227 `index.ts`.** Mostly ORIGINAL after the same-named-directory check. Upstream `primevue` and `primereact` component directories each have their own barrels or `package.json` entry files, so each must be checked. The answer is not assumed.
- **Style modules: 127 `*-style.ts`.** Most will be COPY wherever they carry ported CSS (G3 or earlier ports); the rest are ORIGINAL class maps. A per-file comparison against `@primeuix/styles` 2.0.3 decides; the Batch 3 role-based `authored` precedent is not reused.
- **Implementations: 323 component `.ts`/`.tsx`/`.vue` files.** COPY or REFERENCE by diff. The Phase C Plans' "behavior referenced" wording is a starting point, not proof.
- **Cost.** Option B adds one class column and one decidable comparison per file; it does not add new evidence types. Options A and C add definitional disputes or a migration on top of the 677.

## 6. Decision points for the user

- **D1 — Taxonomy.** Choose Option A, B (recommended), C or D.
- **D2 — Where it lives.** Choose one:
  - a new ADR, plus a GAP-094 Spec §3.4 erratum, plus a `PROVENANCE.md` vocabulary section (recommended with B);
  - Spec erratum only.
- **D3 — Ambiguous threshold.** When a comparison cannot settle whether kept text is expression or interface (for example near-verbatim field docs, or an idiomatic `Subject` pattern), choose one:
  - **(a)** classify COPY, the conservative choice, because the package's MIT notice already covers it and over-attribution is harmless (recommended);
  - **(b)** leave the file without an entry for a per-file user decision, which is the current Spec §3.4 "inconclusive" rule.

  Choice (a) would move the three uncertain REFERENCE entries (`dynamic-dialog-ref.ts` and both react-core `confirmation-event-bus.ts` entries) to COPY, with sub-label `adapted`, and confirm `confirmation.ts` as COPY. Choice (b) would make all four candidates for removal pending a per-file decision. Either way, no merged entry is edited without separate authorization.

- **D4 — Enforcement.** Choose one:
  - no validator change now (recommended);
  - a later, separately approved enum/class check.
- **D5 — Existing inconsistencies (F4.1–F4.6).** Record them as a follow-up item for separate authorization. They are not fixed in GAP-094 batches, and merged entries are not edited.

Until D1–D3 are decided, Batch 2 does not start and no manifest changes.
