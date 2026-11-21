# Phase numbering inventory

Status: inventory and proposed cleanup, recorded 2026-11-21. No cleanup edits are applied yet. Each change in section 4 needs the user's approval, and the governance changes also need ADR-073.

## 1. Phase model

- **Roadmap (superseded):** `docs/architecture/BLUEPRINT.md` §35 defines Phases 0 to 10. The work diverged from the goal, so these labels no longer describe a plan. Code and records already labelled with them remain as history.
- **Current path (per the user, 2026-11-21):**
  - Phase 1: setup. Not located in git history by this inventory.
  - Phase 2: source inventory. Not located in git history by this inventory.
  - Phase 3: inventory of completed work. Branch `phase3-ultimate-inventory`, merged as PR #158 (`91a84725`).
  - Phase 4: gap analysis. Closeout record `docs/architecture/research/phase4-gap-analysis.md`, merged as PR #159 (`308a7c38`).
  - Phase 5 and later: not defined.

### Label collisions

- Roadmap Phase 3 (UltimateReact) and current Phase 3 (inventory).
- Roadmap Phase 4 (UltimateVue) and current Phase 4 (gap analysis).
- Roadmap Phase 5 (Themes) and the closeout's "Phase 5" for product fixes (`phase4-gap-analysis.md` lines 23 and 138).

## 2. Findings by category

Counts come from tracked files, excluding `docs/architecture/research/phase4/`.

| Category                      | Files                                                                                                                                                                   | Notes                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Governance                    | `docs/architecture/BLUEPRINT.md`                                                                                                                                        | §35 roadmap. Phase 0 requirements at lines 199, 384 and 392.                |
| ADR log                       | `docs/architecture/DECISIONS.md`                                                                                                                                        | 72 ADRs. 67 lines carry phase labels in status or context. Last ADR is 072. |
| Roadmap-era architecture docs | `COMPONENT_INVENTORY.md`, `PROVENANCE.md`, `PERFORMANCE.md`, `PACKAGE_ARCHITECTURE.md`, `DEPENDENCIES.md`, `AI_ARCHITECTURE.md`, `SAST_BASELINE.md`, `COMPATIBILITY.md` | Describe work by roadmap phase, and some state phase status.                |
| Generated provenance data     | `docs/architecture/provenance/*.json` (9 files)                                                                                                                         | Generated from scripts. Not edited by hand.                                 |
| Current-path inventory        | `docs/inventory/**`                                                                                                                                                     | Phase 3 output. Keep as is.                                                 |
| Prime reference docs          | `docs/prime-reference/README.md`, `REVIEW.md`                                                                                                                           | Status lines such as "complete (Phase 2)".                                  |
| Package READMEs and manifests | `packages/themes`, `uix-styles`, `react-core`, `mcp`, `cli`, `ai` (README and `package.json` description)                                                               | Name a roadmap phase as the package's phase.                                |
| App READMEs and repo files    | `apps/playground-*/README.md`, `CODEOWNERS`, `eslint.config.mjs`                                                                                                        | Roadmap labels in prose or comments.                                        |
| Code comments and tests       | `scripts/*` (16 files), `packages/*` source and tests (45 files)                                                                                                        | Roadmap labels in comments and test text.                                   |
| Phase 4 closeout              | `docs/architecture/research/phase4-gap-analysis.md`                                                                                                                     | Lines 23 and 138 name "Phase 5" for product fixes.                          |
| Superseded report             | `docs/architecture/research/phase3-integration-report.md`                                                                                                               | Already marked superseded.                                                  |

## 3. Stale statements

- `docs/architecture/research/phase4-gap-analysis.md` lines 23 and 138: "Phase 5" for product fixes. Phase 5 is a roadmap label.
- `docs/architecture/BLUEPRINT.md` §35 presents the roadmap as current. The `AGENTS.md` source hierarchy ranks BLUEPRINT second, so a reader can take §35 as the plan.
- `packages/ai/package.json` description and `packages/ai/README.md` name "Phase 9" as the package's phase.
- `packages/cli/README.md` says "Phase 9 (AI Skills) not started" and names Phase 7 for the CLI. Both are roadmap labels.

## 4. Proposed cleanup

1. **ADR-073:** record that the roadmap in BLUEPRINT §35 is superseded. Define the current path (section 1), the label mapping, and the rule that old phase labels are history. This is a governance decision and needs the user's approval.
2. **BLUEPRINT §35:** add a superseded banner that points to ADR-073. Keep the text for history.
3. **Roadmap-era docs and ADR log:** add one banner per file that marks the roadmap labels as historical. Do not edit ADR bodies or generated files.
4. **Package READMEs and manifests:** remove the roadmap number from prose and descriptions. Change the `packages/ai` description only with approval, since it is package metadata.
5. **Phase 4 closeout:** replace "Phase 5" in lines 23 and 138 with "a later phase, not yet defined".
6. **Code comments and tests:** no change in this cleanup. Record them for a later code-hygiene pass.
7. **Memory outside the repo:** no change unless the user asks.

## 5. Open questions for the user

- Approve ADR-073 and the banner approach in section 4.
- Confirm the definitions of Phases 1 and 2. This inventory could not find them in git history.
- Name the next phase after Phase 4, so the closeout's "Phase 5" references can point to it.
- Confirm whether the `packages/ai` package description may change.
