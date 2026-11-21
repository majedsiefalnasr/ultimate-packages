# Documentation Audit (Realignment Phase 4 follow-up)

**Status:** temporary working record. Delete once the gaps found in Realignment phases 2, 3 and 4 are closed and the documentation cleanup is done.

**Scope:** one row per documentation file or document group. This file records role, evidence, status and a proposed action. It does not change any audited document. No action below is approved; each needs an explicit decision before anything is edited or removed.

## Terminology

- **Realignment phase N**: the five-step correction path (1 Gitflow, 2 Prime study, 3 Ultimate inventory, 4 gap analysis, 5 Completion Planning). The temporary goal is to reposition the project, not to replace the Blueprint.
- **Roadmap Phase N**: the platform roadmap in `docs/architecture/BLUEPRINT.md` section 35. The Blueprint remains the main goal and is not rewritten around the Realignment phases.

## Method and limits

Verified in this pass (read directly from the repository at `develop` `85136d89`):

- Section headings and line counts of `BLUEPRINT.md`, and the text of section 43.
- The text of `PACKAGE_ARCHITECTURE.md`, `AI_ARCHITECTURE.md` and the header of `COMPONENT_INVENTORY.md`.
- Component directory counts under `packages/{ng,react,vue}/src`: ng 89, react 86, vue 94.
- The set of Markdown files tracked by git, and whether `ULTIMATE_COMPLETION_PHASES.md` is tracked.
- Validators: `node --test scripts/inventory/*.test.mjs` (210 of 210 pass), `node --test scripts/prime-reference/*.test.mjs` with `scripts/inventory/packages.test.mjs` (32 of 32 pass), and `node scripts/prime-reference/check-records.mjs` (100 records, 0 problems).

Not checked in this pass:

- `BLUEPRINT.md` sections 5 to 34 against the code.
- ADR bodies in `DECISIONS.md`, other than the status lines noted below.
- Line-by-line contents of `ACCESSIBILITY_BASELINE.md`, `PERFORMANCE.md`, `PROVENANCE.md`, `SAST_BASELINE.md` and `PARITY_PLAYBOOK.md`.
- Package README files other than the references noted below, `skills/*.md`, `GLOSSARY.md`, `CHANGELOG.md` and `SECURITY.md`.

Rows that depend on unchecked material say so.

## Status values

- **Current**: matches repository evidence as far as checked.
- **Stale**: contradicts repository evidence.
- **Historical**: self-declared as not current evidence.
- **Unverified**: not checked in this pass.
- **Temporary**: exists only for the Realignment work.

## Architecture documents

| Document                                                                                      | Role                                           | Evidence                                                                                                                                                                                                                                                                        | Status                        | Proposed action                                                                                                                         |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/architecture/BLUEPRINT.md` (1466 lines)                                                 | Architectural intent and governance; main goal | Section 35 still lists Roadmap Phases 0 to 10 as a plan. Section 43 lists decided, provisional, deferred and out-of-scope items; its provisional items were not compared with code.                                                                                             | Unverified                    | Keep. Compare sections 5 to 34 and 43 with code in the gap-closing phase. Do not rewrite around the Realignment phases.                 |
| `docs/architecture/DECISIONS.md` (72 ADRs)                                                    | Binding decisions                              | 68 Accepted and 4 Superseded. The four Superseded entries (lines 135, 139, 171, 175) read "pending Prime study". The `Status:` field at line 744 is followed by a bullet list, not a one-line value. Code and tests cite ADR numbers 111 times.                                 | Unverified                    | Keep. Re-check the four "pending Prime study" entries now that the Prime study (Realignment phase 2) is complete. Do not renumber ADRs. |
| `docs/architecture/PACKAGE_ARCHITECTURE.md` (26 lines)                                        | Package boundaries                             | Says metadata, cli, mcp and ai are "Deferred to Phase 6, 7, 8, 9" and describes ng, react and vue as a "5-component proof set". The component directory counts are 89, 86 and 94. `packages/{ai,cli,mcp,component-metadata,component-schema}` exist.                            | Stale                         | Rewrite to current facts, or fold into Blueprint section 5 and remove. Decide after the gap-closing phase.                              |
| `docs/architecture/AI_ARCHITECTURE.md` (27 lines)                                             | AI and tooling constraints                     | Restates Blueprint sections 2, 6 and 14; refers to Phases 6 to 9 as future or past without saying which roadmap. Overlaps Blueprint sections 22 to 26. No code references found earlier.                                                                                        | Stale                         | Candidate for removal once the Blueprint sections it restates are confirmed to carry the same rules.                                    |
| `docs/architecture/COMPONENT_INVENTORY.md` (211 lines)                                        | Original Prime component classification        | Banner says "Historical migration baseline... Not current inventory evidence." Referenced by comments in `packages/component-metadata` and `packages/ng/src/input-text`, and by `README.md` files of the root, ng, react and vue. `docs/inventory/` is the current replacement. | Historical                    | Candidate for removal after the references are repointed to `docs/inventory/`.                                                          |
| `docs/architecture/PARITY_PLAYBOOK.md` (280 lines)                                            | Normative parity process, approved 2026-10-08  | No code references found earlier. Contents not re-read in this pass.                                                                                                                                                                                                            | Unverified                    | Keep until the user decides how the gap-closing phase uses it.                                                                          |
| `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/*.json`, `checksums.json` | Source provenance of ported code               | Read by scripts or CI.                                                                                                                                                                                                                                                          | Current (consumed by tooling) | Keep.                                                                                                                                   |
| `docs/architecture/PERFORMANCE.md`                                                            | Bundle and performance baselines               | Read by scripts or CI. Contents not re-read.                                                                                                                                                                                                                                    | Unverified                    | Keep.                                                                                                                                   |
| `docs/architecture/SAST_BASELINE.md`                                                          | Security baseline                              | Read by scripts or CI.                                                                                                                                                                                                                                                          | Current (consumed by tooling) | Keep.                                                                                                                                   |
| `docs/architecture/ACCESSIBILITY_BASELINE.md` and `docs/architecture/baselines/*.md`          | Accessibility baselines                        | Read by scripts or CI.                                                                                                                                                                                                                                                          | Current (consumed by tooling) | Keep.                                                                                                                                   |
| `docs/architecture/COMPATIBILITY.md` (24 lines) and `compatibility-*` files                   | Pinned compatibility baselines                 | Line 3 still says "Re-verify immediately before Phase 1 kickoff". The manifest and its test are consumed by tooling.                                                                                                                                                            | Stale (wording)               | Keep the manifest. Reword line 3 in the gap-closing phase.                                                                              |
| `docs/architecture/DEPENDENCIES.md` (54 lines)                                                | Dependency classification                      | Row for `chart.js` says "Not yet". A later paragraph says `chart.js` may enter the tree as an approved optional peer under ADR-055 since 2026-10-11. No `chart.js` was found in `packages/*/package.json`.                                                                      | Unverified                    | Keep. Confirm the `chart.js` row against ADR-055 and the Chart component state.                                                         |

## Research records

| Document                                                                                     | Role                                                   | Evidence                                                                                                                                           | Status     | Proposed action                                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `docs/architecture/research/phase4-gap-analysis.md` and `docs/architecture/research/phase4/` | Realignment phase 4 closeout and per-component reports | Merged in PR #159 and PR #160. Validators above pass.                                                                                              | Temporary  | Keep as the input to gap closing. Delete after the gaps are closed. |
| `docs/architecture/research/phase3-integration-report.md`                                    | Integration record from an earlier phase               | Not re-read in this pass.                                                                                                                          | Unverified | Decide in the gap-closing phase whether it is still an input.       |
| `docs/architecture/research/phase-numbering-inventory.md`                                    | Phase-name inventory created in PR #160                | Claims Phases 1 and 2 are unknown and proposes an ADR-073. Both are wrong: the phase names are settled (see Terminology) and no ADR is needed now. | Stale      | Delete in this change.                                              |
| `docs/architecture/research/docs-audit.md` (this file)                                       | Audit of documentation                                 | n/a                                                                                                                                                | Temporary  | Delete after the documentation cleanup.                             |

## Inventory and Prime reference

| Document                            | Role                                                                        | Evidence                                                                                                                                           | Status            | Proposed action                                                           |
| ----------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| `docs/inventory/`                   | Realignment phase 3 outputs: catalog, components, foundations, coverage map | Validated by the inventory tests (210 of 210 pass).                                                                                                | Current           | Keep. It is the input to the gap-closing phase.                           |
| `docs/prime-reference/`             | Realignment phase 2 outputs: 100 Prime component records                    | `check-records.mjs` reports 100 records and 0 problems. Its `README.md` says "complete (Phase 2)", which does not say which phase scheme it means. | Current (wording) | Keep. Change "Phase 2" to "Realignment phase 2" in the gap-closing phase. |
| `tooling/prime-reference/README.md` | Tooling notes for the Prime reference                                       | Not read in this pass.                                                                                                                             | Unverified        | Keep.                                                                     |

## Agent, onboarding and package documents

| Document                                                  | Role                                      | Evidence                                                                                                                                                                                       | Status     | Proposed action                                                               |
| --------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `AGENTS.md`                                               | Repository orientation                    | Deliberately avoids current phase status.                                                                                                                                                      | Current    | Keep.                                                                         |
| `docs/agents/*.md`                                        | Issue tracker, triage labels, domain docs | Pointers from `AGENTS.md`. Not re-read.                                                                                                                                                        | Unverified | Keep.                                                                         |
| `README.md`, `GLOSSARY.md`, `CHANGELOG.md`, `SECURITY.md` | Onboarding and governance                 | Root `README.md` references `COMPONENT_INVENTORY.md` once. Others not read.                                                                                                                    | Unverified | Keep. Repoint the inventory link when `COMPONENT_INVENTORY.md` is removed.    |
| `packages/*/README.md`                                    | Per-package documentation                 | The ng README references `COMPONENT_INVENTORY.md` twice and the react and vue READMEs once each. Other READMEs not read.                                                                       | Unverified | Keep. Repoint inventory links.                                                |
| `packages/*/THIRD-PARTY-NOTICES.md`                       | Licence notices                           | Legal artifacts.                                                                                                                                                                               | Current    | Keep.                                                                         |
| `skills/*.md` and `packages/ai/context/llms*.txt`         | AI consumer files                         | Only 8 skill files exist (button, checkbox, dialog, menu, paginator, scroller, table, tooltip) against 89 to 94 components per framework. Static snapshots, no fresher than their last commit. | Unverified | Keep. Treat coverage as a gap-closing item, not a documentation cleanup item. |

## Local-only file

`ULTIMATE_COMPLETION_PHASES.md` is not tracked by git. It is excluded through `.git/info/exclude`, so it exists only in this checkout. The Realignment phase list therefore has no durable copy in the repository.

Proposed action: decide whether the phase list should be committed (for example under `docs/architecture/research/`) while Realignment is in progress, and removed with the other temporary records afterwards.

## Findings that need a decision

Resolved in the narrow cleanup (2026-11-21):

1. `PACKAGE_ARCHITECTURE.md` rewritten as stable rules with no counts, phase labels or status.
2. `AI_ARCHITECTURE.md` removed, together with its line in Blueprint section 39. Its rules are in Blueprint sections 2 and 6.
3. `COMPONENT_INVENTORY.md` references in the root, ng, react and vue READMEs now point to `docs/inventory/README.md`.
4. `COMPATIBILITY.md` line 3 and `docs/prime-reference/README.md` line 3 wording corrected.
5. `ULTIMATE_COMPLETION_PHASES.md` recorded as `realignment-phases.md` (PR #162).
6. `GLOSSARY.md` now defines Realignment phase, Roadmap Phase and Gap.

Still open:

1. `COMPONENT_INVENTORY.md` is kept, with its historical banner. Code comments cite its rows by content: `packages/component-metadata/src/records/table.ts`, `packages/component-metadata/src/records/scroller.ts` and `packages/ng/src/input-text/input-text.ts`. `docs/inventory/` does not contain those rows, so repointing the comments would make false citations. Remove the file in the final cleanup ticket, after those comments are rewritten.
2. Four ADRs (030, 031, 039, 040) say "pending Prime study". They are already marked no longer binding. Rule on them first in the gap-closing spec, because each is a product decision.

Nothing above blocks the gap-closing phase.
