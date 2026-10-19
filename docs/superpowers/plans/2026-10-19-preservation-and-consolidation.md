# Preservation and Consolidation — Documentation Hygiene and Suspended Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** APPROVED — Plan Review passed (user, 2026-10-19), revision 6; implementation authorized. Revision 6 changed only Task 6 Steps 2–3, as the user's Plan Review of revision 5 required.

- It applies the user's Plan Review decisions PR-D1 to PR-D6.
- It is aligned with Spec revision 5, for which Spec Review is closed:
  - 18 status-line changes and 26 research notes;
  - required ledger notes (Task 6 Step 1, AC11).
- Committed after Plan Review approval (AGENTS.md §7.3). While it was prepared, no repository file, branch, worktree, PR or ledger changed.

**Goal:** Mark suspended work as `DEFERRED`, and correct only the status lines and research notes that state something now false. Keep every valid historical approval status. Preserve all unique work.

**Architecture:**

- Documentation only, on one branch, `docs/documentation-hygiene-suspended-work`, cut from `origin/main` in a new worktree.
- Exactly 18 Spec/Plan status lines change (category A or C); the old value is kept verbatim. Category B documents are not touched.
- 26 research records get a dated note; their original text stays.
- Register: a new "Deferred (suspended) work" section.
- No GAP status changes and nothing is deleted.

**Tech Stack:** Markdown, git, `prettier`, `agents-md-pointers:validate`.

**Spec:** `docs/superpowers/specs/2026-10-19-documentation-hygiene-and-suspended-work-design.md` (revision 5; Spec Review closed 2026-10-19). Its §2–§8 are binding here.

**Evidence baseline:**

- the Current-State Discovery report, delivered to the user on 2026-10-18 (a session record; it is not committed);
- the evidence tables in §2, each verified on 2026-10-19 against `origin/main` `94807833`.

## Global Constraints

- **Authorizations:**
  - After Plan Review approval: create the worktree and branch, commit, push the feature branch, and open one PR (Auto Mode authorization).
  - **No merge without the user's explicit authorization.**
- **Hands off:**
  - The primary checkout `ultimate/` stays immutable.
  - PRs #15, #37 and #38 are not touched.
  - No deletion of directories, worktrees, branches, stashes, ledgers or caches.
- **Spec rules:**
  - Evidence first (R1). A document without evidence stays unchanged and is reported as unknown.
  - No GAP status changes (R6).
  - Research records are not rewritten (R3).
  - Approval states are not inferred (R5). The Workstream 2 Spec keeps `REVIEWED` as its previous status.
- **Status terms** come from Spec §3. No `SUPERSEDED` or `WITHDRAWN` is added beyond existing records. S4 and S5 stay `DEFERRED`.
- **Git mechanics:** `git worktree add --no-track`. Push with an explicit `src:dst` refspec (the push.default=upstream trap).

## Review Focus

- **An old APPROVED Plan is read as permission to act.** The W1 and W2 headers must start with `DEFERRED`, and the register must state "an approved Spec or Plan does not authorize resuming" (Tasks 1–2 check both).
- **A corrected header loses its history.** Every edited Status line keeps `(Previously: <old value verbatim>)` (Task 3 check).
- **Scope creeps into valid approval statuses.** Only the 18 files in §2.1 may have a changed Status line (Task 7 check).
- **A note erases a contradiction instead of resolving it.** The G3-E closeout note names lines 20, 67, 85 and 97 as superseded by lines 42–43 and 101, and lines 3–4 as superseded by merge `d3aabf57`. It deletes none of them (Task 4 check).
- **S7 is read as suspending all open GAPs.** The register states the Spec §5 boundary: S1/S2 suspend their whole Workstreams, S7 adds nothing beyond S1, and work on other GAPs is neither suspended nor authorized (Task 1 check).
- **Register anchors break.** Run `agents-md-pointers:validate` after each tracking-document edit.

---

## 1. Decisions applied (user, 2026-10-19)

| ID                         | Decision                                                                                                                                                                                               | Where applied        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| PR-D1                      | Existing status terms                                                                                                                                                                                  | Spec §3              |
| PR-D2                      | D6 superseded by a documented amendment; D6 text preserved; headers reconciled from merge evidence                                                                                                     | Spec §7; Task 2      |
| Scope concern (2026-10-19) | Approval and implementation are distinct facts; category B statuses are kept                                                                                                                           | Spec §4; §2.2        |
| PR-D3                      | S1–S7 deferred; S7 narrowed                                                                                                                                                                            | Spec §5; Task 1      |
| PR-D4                      | No Workstream 2 Spec approval inferred; `REVIEWED` kept as the previous status                                                                                                                         | Spec R5, AC9; Task 2 |
| PR-D5                      | CI-health study and bounded-autonomy proposal stay `DEFERRED`                                                                                                                                          | Spec §5; Task 1      |
| PR-D6                      | Follow the AGENTS.md lifecycle. AGENTS.md §3 and §7.5 place a Specification before the Plan, and no existing contract covers the D6 supersession or the deferral rules. So a minimum Spec was written. | Companion Spec       |

## 2. Evidence for every change (verified 2026-10-19, `origin/main` `94807833`)

Categories and rules are those of Spec §4. Wording:

- category A: the Spec §3 `DEFERRED` sentence;
- category C: `IMPLEMENTED — <evidence>`.

Every changed line ends with `(Previously: <old value verbatim>.)`, so any approval or review the old line recorded is kept. Where the document has a `Status detail` line or a "Spec Gate Status" section, the new line adds `The Status detail line below is historical.` (or names the section).

### 2.1 Status-line changes: exactly 18 documents (Spec §4.2)

| #   | Document                                                               | Cat. | Old status (summary)                                                    | Evidence                                                                                   |
| --- | ---------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | `specs/2026-10-18-workstream-1-shipped-component-completion-design.md` | A    | APPROVED (user, 2026-10-18)                                             | S1; W1 shipped as PR #39 `4a426b34` and #40 `94807833`                                     |
| 2   | `plans/2026-10-18-workstream-1-shipped-component-completion.md`        | A    | APPROVED (Plan Review 2026-10-18)                                       | S1; the same two merges                                                                    |
| 3   | `specs/2026-10-17-workstream-2-release-ci-tooling-design.md`           | A    | REVIEWED (kept as previous status, PR-D4)                               | S2; PRs #32–#36 merged; #37 and #38 open                                                   |
| 4   | `plans/2026-10-17-workstream-2-release-ci-tooling.md`                  | A    | APPROVED (Plan Review 2026-10-17)                                       | S2; held Tasks 1, 2, 6, 10, 13 (Workstream 2 ledger)                                       |
| 5   | `specs/2026-09-10-phase-10-migration-release-provenance-design.md`     | A+C  | Draft for review                                                        | Track C merge `57772ffe`; PR #15 open (S3); composite header from Spec §7                  |
| 6   | `specs/2026-09-10-phase-10-browser-visual-accessibility-design.md`     | C    | Draft for review                                                        | Track A merge `02c60d71`                                                                   |
| 7   | `specs/2026-09-08-phase-10-ci-security-quality-gates-design.md`        | C    | Draft for review                                                        | Track B merge `6428d018`                                                                   |
| 8   | `specs/2026-09-09-phase-10-operational-documentation-design.md`        | C    | Draft for review                                                        | Track D merge `2b671e4a`; also receives the D6 amendment note                              |
| 9   | `specs/2026-09-11-phase-10-track-e-ssr-hydration-design.md`            | C    | Draft for review                                                        | Track E merge `9ec78838`; the new line names its "Spec Gate Status" section                |
| 10  | `specs/2026-09-12-agents-md-orientation-design.md`                     | C    | Draft for Spec Review                                                   | merge `ff2fdad6`; `AGENTS.md` on main                                                      |
| 11  | `specs/2026-09-12-ssr-safe-component-id-generation-design.md`          | C    | Draft for review                                                        | `3203ce6e` (React), `68d00a98` (Angular), `496e509b` (Vue Menu), all in Track E `9ec78838` |
| 12  | `plans/2026-09-12-ssr-safe-component-id-generation-implementation.md`  | C    | Draft for review (implementation-ready)                                 | the same commits                                                                           |
| 13  | `specs/2026-09-12-vue-dialog-id-scope-amendment.md`                    | C    | Draft for Spec Review                                                   | `d6f6fb2b`, in `9ec78838`; the new line names its "Spec Gate Status" section               |
| 14  | `plans/2026-09-12-vue-dialog-id-scope-amendment-implementation.md`     | C    | Draft for review (implementation-ready)                                 | `d6f6fb2b`                                                                                 |
| 15  | `specs/2026-09-25-gap-039-vue-tooltip-visibility.md`                   | C    | Draft for Spec Review                                                   | merge `b8042a9f`; GAP-039 `RESOLVED`                                                       |
| 16  | `specs/2026-09-21-phase-c-batch-3-migration-design.md`                 | C    | Spec Review passed …; awaiting human approval                           | merge `389386b3`. The batch 3 Plan says it is complete. No Spec approval is inferred.      |
| 17  | `plans/2026-10-05-gap-064-g3b-containers.md`                           | C    | Approved …; Implementation not started; requires separate authorization | merge `f008a736`                                                                           |
| 18  | `plans/2026-10-06-gap-064-g3c2-visual-review.md`                       | C    | Task 10 Step 1 record, prepared for the Step 2 HARD USER STOP           | closeout `b1f6bfa`; merge `4b9bfaa5`                                                       |

### 2.2 Category B: retained unchanged (Spec §4.1)

All other Specs and Plans are retained unchanged. This includes, for example:

- **Approved Specs and Plans whose work shipped** (about 40). Examples:
  - Phase 2–5 and Phase 8 Specs;
  - G3-A to G3-E Specs and Plans;
  - GAP-093, GAP-094, GAP-098, GAP-124 and GAP-131 Specs and Plans;
  - GAP-094 backfill Plans 1–3 and the GAP-132 Plan.

  Their approval or authorization lines are true history.

- **Statuses recording a gate or permission that was really granted.** Examples:
  - the G3-C1 Plan, "Implementation authorized from Task 1";
  - the Phase C batch 1 Plan, "Ready for Implementation";
  - the C2-0, G3-C2, G3-D and G3-E Specs, "Implementation needs an approved Plan".

  They describe that document's gate when it was written. The register and closeouts record the outcome.

- **Plans with no Status line** (29). Their Specs, the ROADMAP and the closeout records carry the outcome.
- **Already-correct statuses:**
  - "Complete …";
  - "Decisions applied";
  - the E1-V2 `SUPERSEDED` documents;
  - the Paginator Plan's `BLOCKED`.

### 2.3 Research status notes: exactly 26 records (Spec §4.3)

The note is placed under the Status line (R3).

| Record (`docs/architecture/research/`)                                  | Status asserts                                                                                | Note states                                                                                                 | Evidence                                                                                                                                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `2026-10-11-final-project-completion-assessment.md`                     | uncommitted draft                                                                             | committed; its pending proposals were decided as ADR-053–ADR-058                                            | COMPLETION_REGISTER, "Completion target and authority"                                                                                                 |
| `2026-10-11-cli-quality-and-api-docs-evidence-research.md`              | uncommitted draft                                                                             | committed; decided as ADR-058                                                                               | DECISIONS.md line 493                                                                                                                                  |
| `2026-10-11-k7-tree-family-architecture-research.md`                    | uncommitted draft                                                                             | committed; decided as ADR-054                                                                               | DECISIONS.md line 420                                                                                                                                  |
| `2026-10-11-k8-decision-b-external-dependency-policy-research.md`       | uncommitted draft                                                                             | committed; decided as ADR-055                                                                               | DECISIONS.md line 440                                                                                                                                  |
| `2026-10-11-k9-config-passthrough-api-research.md`                      | uncommitted draft                                                                             | committed; decided as ADR-056                                                                               | DECISIONS.md line 461                                                                                                                                  |
| `2026-10-11-s4-performance-stage1-methods-research.md`                  | uncommitted draft                                                                             | committed; decided as ADR-057                                                                               | DECISIONS.md line 478                                                                                                                                  |
| `2026-10-11-s5-accessibility-acceptance-research.md`                    | uncommitted draft                                                                             | committed; decided as ADR-053                                                                               | DECISIONS.md line 391                                                                                                                                  |
| `2026-10-11-gap-124-research-proposal.md`                               | Not committed                                                                                 | committed; Spec executed; GAP-124 `PARTIAL`                                                                 | merge `e32c224`; GAP-124 entry                                                                                                                         |
| `2026-09-08-phase-10-production-hardening.md`                           | Draft for review (D6)                                                                         | phase complete; D6 superseded 2026-10-19                                                                    | ROADMAP row 10; Spec §7                                                                                                                                |
| `2026-09-08-phase-10-architecture-discussion.md`                        | Draft for review (D6)                                                                         | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-08-gap-064-g3e-e1-decision-proposal.md`                        | proposal for human decision                                                                   | nothing here is pending: E1-V2 CLOSED, E1-B1 RESOLVED (2026-10-11)                                          | G3-E closeout lines 42–43, 101                                                                                                                         |
| `2026-10-08-gap-064-g3e-e1-v2-c1-experiment-authorization.md`           | READY FOR HUMAN EXPERIMENT AUTHORIZATION                                                      | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-08-gap-064-g3e-e1-v2-disposition-proposal.md`                  | proposal for human approval                                                                   | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-d2-decision-packet.md`                    | prepared for human decision                                                                   | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-d2-readiness-authorization.md`            | D2 execution unauthorized; for review                                                         | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-d3-authorization-packet.md`               | PROPOSED — BLOCKED FOR EXECUTION                                                              | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-d3-preparation-specification.md`          | PROPOSED — NOT AUTHORIZED                                                                     | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-fixture-preparation-correction-packet.md` | READY FOR HUMAN PREPARATION AUTHORIZATION                                                     | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-v1-readiness-d1-investigation.md`         | review pass complete; STOP                                                                    | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-09-gap-064-g3e-e1-v2-v1-readiness-decision-packet.md`          | prepared for human decision                                                                   | same                                                                                                        | same                                                                                                                                                   |
| `2026-10-08-gap-064-g3e-e1-record.md`                                   | before-port record for the HARD USER STOP                                                     | evidence accepted; tranche merged                                                                           | `0987331b`; merge `d3aabf57`                                                                                                                           |
| `2026-10-08-gap-064-g3e-e2-record.md`                                   | same                                                                                          | same                                                                                                        | `51bb61be`; `d3aabf57`                                                                                                                                 |
| `2026-10-08-gap-064-g3e-e3-record.md`                                   | same                                                                                          | same                                                                                                        | `d93a0eb3`; `d3aabf57`                                                                                                                                 |
| `2026-10-08-gap-064-g3e-e4-record.md`                                   | same                                                                                          | same                                                                                                        | `6a97c0b7`; `d3aabf57`                                                                                                                                 |
| `2026-10-08-gap-064-g3e-closeout.md`                                    | merge not authorized; E1-V2 OPEN, E1-B1 BLOCKED (contradicted by its own lines 42–43 and 101) | lines 20, 67, 85 and 97 are superseded by lines 42–43 and 101; lines 3–4 are superseded by merge `d3aabf57` | merge `d3aabf57`                                                                                                                                       |
| `2026-10-06-gap-064-c2-0-closeout.md`                                   | AC8 is CI-pending                                                                             | the AC8 steps it names passed on the merge commit; the run's overall result was failure, from other steps   | CI run 37456600014 at `3d0203da`: Build, Typecheck, Coverage measurement, the strict ng Playwright run and accessibility baseline validation succeeded |

Category B research records, retained without a note:

- the Phase 9 and Track E research records (D6 never covered them);
- the 7 E1-V2 investigation and result records that have no Status line;
- the G3-D and G3-E research records ("research only, for review");
- all other research records.

### 2.4 Tracking documents

| Document                 | Correction                                                                                                                                                                                                                                          | Evidence                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `COMPLETION_REGISTER.md` | New "Deferred (suspended) work" section (Spec §5). The "Overall" paragraph and C01 add main CI 39145883565 at `94807833` (failed steps: only Bundle-size regression check and Provenance validation). C12 names PR #15 as deferred. Change-log row. | `gh run view 39145883565`; `gh pr view 15` |
| `COMPLETION_REGISTER.md` | Remove the sentence "ROADMAP footnote 4 retains a stale MCP reference after GAP-131". It is itself stale: footnote 4 already describes GAP-131's fix (PR #3, `6f92dd0`).                                                                            | ROADMAP footnote 4 on main                 |
| `BLUEPRINT_GAPS.md`      | Add `OPEN` to the §1 legend; it describes existing usage by 38 GAPs and is not a status change.                                                                                                                                                     | GAP status count on main                   |
| `BLUEPRINT_GAPS.md`      | Header line notice: the "as of Phase 5" Purpose line is historical; current state is in the sections below and the register. Same pattern as the existing §2 "Superseded notice".                                                                   | BLUEPRINT_GAPS §2                          |

Dropped from earlier revisions for lack of authoritative evidence:

- the COMPONENT_INVENTORY stale notice;
- the claim that C03 is stale;
- the ROADMAP footnote 4 edit.

## 3. Action classification

| Class                                             | Items                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retain and mark accurately**                    | S1–S7 (register; §2.1 rows 1–5); §2.3 research notes (26)                                                                                                                                                                                                                                                                        |
| **Update or reconcile**                           | §2.1 rows 6–18 (category C); §2.4 register and BLUEPRINT_GAPS lines; D6 amendment note; local ledgers and agent memory (Task 6)                                                                                                                                                                                                  |
| **Consolidate or archive**                        | None executed. The register lists preservation locations (Spec §6). Any later consolidation needs its own decision.                                                                                                                                                                                                              |
| **Discontinue, subject to the required decision** | None proposed                                                                                                                                                                                                                                                                                                                    |
| **Already correct; no action**                    | All category B Specs and Plans (§2.2), including approved documents whose work shipped; E1-V2 Spec and Plans (`SUPERSEDED`); Paginator Plan (`BLOCKED`); GAP-012/021/026/040 (`DEFERRED`); visual-review Plans that record decisions as applied; the ROADMAP parity-corpus note; ROADMAP footnote 4; ADRs; all GAP Status values |

## 4. Preservation locations (Spec §6; recorded in the register, nothing moved)

| Item                                                                                                                                                                                                                                                                | Absolute path                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 10 Changesets v1 Spec/Plan amendment (uncommitted; it rewrites the Track C Plan Status line, so it needs a manual merge if resumed); `b45f9d5a`; `stash@{0}`; GAP-088 Spec draft; `dsh-locale-pack/`; `.vendor-cache/`; `.vendor-extracted/`; `.superpowers/` | `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate`                     |
| Workstream 1 ledger and evidence                                                                                                                                                                                                                                    | `…/ultimate-w1-spec/.superpowers/sdd/2026-10-18-workstream-1-shipped-component-completion/` |
| W2 commits `e6a0f4c2` through `3675c4e0` (6 commits, unpushed)                                                                                                                                                                                                      | `…/ultimate-w2-menus`                                                                       |
| Amendments A2/A3 (uncommitted; they rewrite the W2 Plan Status line, so they need a manual merge if resumed); Workstream 2 ledger                                                                                                                                   | `…/ultimate-w2-a2a3`                                                                        |
| PR #37, PR #38 branches                                                                                                                                                                                                                                             | `…/ultimate-w2-integrity`, `…/ultimate-w2-cli`                                              |
| CI-health commits and brief                                                                                                                                                                                                                                         | `…/ultimate-ci-health-study`                                                                |
| Bounded-autonomy documents and `AGENTS.md` edit                                                                                                                                                                                                                     | `…/ultimate-bounded-autonomous-execution`                                                   |
| Merged-content worktrees (w1-toolbar, w1-batch, gap-094, gap-094-dr5, gap-098)                                                                                                                                                                                      | `…/ultimate-<name>`, kept                                                                   |
| `Ultimate-Theme` (non-git: the Ultimate-Core-UI clone and commercial templates)                                                                                                                                                                                     | `…/Ultimate-Theme`                                                                          |

---

## 5. Tasks

### Task 0: Re-verify the baseline and create the worktree

- [ ] **Step 1:** Fetch and check the base.
  - Run `git fetch origin` and `git rev-parse origin/main`. Expected: `94807833…`.
  - If it has moved, run `git log --oneline 94807833..origin/main -- docs` and re-check every §2 row whose file changed. Report before editing.
- [ ] **Step 2:** Check the three PRs. Run `gh pr view <n> --json state,headRefOid` for each of 15, 37 and 38. Expected: OPEN, with heads `5cb9f0a3`, `d4287d10`, `aedff3d8`. If any differs, stop and report.
- [ ] **Step 3:** Create the worktree: `git worktree add --no-track -b docs/documentation-hygiene-suspended-work ../ultimate-doc-hygiene origin/main`.
- [ ] **Step 4:** Create the ledger `.superpowers/sdd/2026-10-19-preservation-and-consolidation/progress.md`. Its first line is `# SDD ledger — plan: docs/superpowers/plans/2026-10-19-preservation-and-consolidation.md`.
- [ ] **Step 5:** Copy in the approved Spec and Plan and commit them: `docs(spec,plan): add documentation hygiene and suspended work design and plan`.

### Task 1: Deferred work in COMPLETION_REGISTER (Spec §5, §6; §2.4)

**Files:** Modify `docs/architecture/COMPLETION_REGISTER.md`.

- [ ] **Step 1: Write the check** (in the scratchpad, outside the repository):
  - `grep -q '^## Deferred (suspended) work'`;
  - each of `S1`…`S7` appears as a table row;
  - the strings `No further implementation is authorized` and `does not authorize resuming` are present;
  - the register contains `neither suspended nor authorized` (Spec §5 boundary item 4);
  - C05 contains `only the Workstream 1 wave GAPs`;
  - `^| 2026-10-19 ` is present;
  - `grep -c 'retains a stale MCP reference'` returns 0.

  Run it. Expected: FAIL.

- [ ] **Step 2: Add the section** after "External release conditions".
  - Lead with the Spec §5 sentence: "Work listed here is DEFERRED: suspended indefinitely … may be discontinued in the planned restructuring."
  - Add one table, `ID | Work | Shipped part | Unshipped part and its location | Resumption requires`.
  - Rows S1–S7 come from Spec §5; locations come from §4 of this plan.
  - Add the Spec §5 boundary items 1–4 under the table.
- [ ] **Step 3: Update existing lines.**
  - C01 and "Overall": add CI 39145883565.
  - C05: point its "Gate → next" to S1/S7, stating that S1/S7 covers only the Workstream 1 wave GAPs.
  - C10 and C11: point to S2.
  - C12: name PR #15 and S3.
  - Remove the stale footnote-4 sentence.
  - Add a 2026-10-19 change-log row naming the Spec and this plan.
- [ ] **Step 4: Verify.** Run the check, then `pnpm run agents-md-pointers:validate`, then `pnpm exec prettier --check docs/architecture/COMPLETION_REGISTER.md`. Expected: all pass.
- [ ] **Step 5: Commit** `docs(register): record deferred work and preserved locations`.

### Task 2: D6 amendment and §2.1 rows 1–9 (Spec §5, §7)

**Files:** §2.1 rows 1–9 (W1 and W2 Specs and Plans, the 5 Phase 10 track Specs).

- [ ] **Step 1: Write the check.**
  - The D6 Spec gains exactly the Spec §7 amendment line. D6's own text and the 2026-09-16 note are unchanged (`git diff -U0` shows no removed lines other than its Status line).
  - Each W1 and W2 header starts with `**Status:** DEFERRED` and contains `No further implementation is authorized` and `(Previously:`.
  - The Track C Spec header matches Spec AC4.
  - The W2 Spec header contains `(Previously: REVIEWED`.
  - Each Phase 10 header contains its merge SHA from §2.1 and `(Previously: Draft for review`.
  - Each file loses at most one line.

  Run it. Expected: FAIL.

- [ ] **Step 2: Edit the files.**
  - Add the D6 amendment note.
  - Write the Track A, B, D and E headers as `IMPLEMENTED — <track merge>. (Previously: Draft for review. The Status detail line below is historical.)`. Track E's header names its "Spec Gate Status" section instead. The Track C Spec uses the composite header from Spec §7, verbatim.
  - The Track C Plan is not edited (Spec §5).
  - The W1 and W2 headers use the Spec §3 DEFERRED wording, plus the shipped part: W1 `#39 4a426b34, #40 94807833`; W2 `#32–#36`.
- [ ] **Step 3: Verify.** Run the check and `prettier --check` on the changed files. Expected: pass.
- [ ] **Step 4: Commit** `docs(status): supersede D6 and mark workstream remainders deferred`.

### Task 3: Category C headers, §2.1 rows 10–18

**Files:** exactly the 9 documents in §2.1 rows 10–18.

- [ ] **Step 1: Re-confirm the evidence.**
  - For every row, re-run `git merge-base --is-ancestor <sha> origin/main`, or re-read the cited BLUEPRINT_GAPS line.
  - Record the results in the ledger.
  - A row that fails is removed and reported. Its file is not edited.
- [ ] **Step 2: Write the check.**
  - Each file has exactly one changed line matching `^(\*\*)?Status:` within its first 15 lines, starting `IMPLEMENTED — `.
  - That line contains its evidence SHA and `(Previously: ` followed by the old value verbatim.
  - `git diff -U0 | grep '^-' | grep -v '^---' | grep -vc 'Status'` returns 0.

  Run it. Expected: FAIL.

- [ ] **Step 3: Write the headers** using the wording in §2.
- [ ] **Step 4: Verify.** Run the check and `prettier --check`. Expected: pass.
- [ ] **Step 5: Commit** `docs(status): record implementation outcome on stale draft and pending status lines`.

### Task 4: Research status notes (§2.3)

**Files:** exactly the 26 records in §2.3.

- [ ] **Step 1: Write the check.**
  - Each file gains exactly one line starting `**Status note (2026-10-19):**` and loses none (`git diff -U0 <file> | grep -c '^-[^-]'` returns 0).
  - The G3-E closeout note contains `20, 67, 85 and 97`, `42–43`, `101` and `d3aabf57`.
  - The C2-0 note contains `37456600014`.

  Run it. Expected: FAIL.

- [ ] **Step 2: Add the notes** using the "Note states" column and its evidence.
- [ ] **Step 3: Verify.** Run the check and `prettier --check`. Expected: pass.
- [ ] **Step 4: Commit** `docs(research): add dated status notes to point-in-time records`.

### Task 5: BLUEPRINT_GAPS legend and header notice (§2.4)

**Files:** Modify `docs/architecture/BLUEPRINT_GAPS.md`.

- [ ] **Step 1: Write the check.**
  - The legend line contains `` `OPEN` ``.
  - A `Superseded notice (2026-10-19)` line follows the Purpose line.
  - `git diff -U0 | grep -E '^[-+]- \*\*Status:\*\*'` is empty: no GAP status changed. GAP entries use `**Status:**`; the legend line uses `**Status**:`, so it is not matched.

  Run it. Expected: FAIL.

- [ ] **Step 2: Edit the file.**
  - Insert `` `OPEN` `` into the legend.
  - Add the notice.
- [ ] **Step 3: Verify.** Run the check, `agents-md-pointers:validate` and `prettier --check`. Expected: pass.
- [ ] **Step 4: Commit** `docs(gaps): list OPEN in the status legend and mark the header historical`.

### Task 6: Local ledgers and agent memory (outside the repository)

**Files:**

- Append to the two ledgers named in §4.
- Edit the memory files `workstream_2_release_ci_tooling.md`, `gap_064_g3e.md` and `MEMORY.md`.

- [ ] **Step 1: Mark the ledgers (required, Spec §2 item 6, AC11).**
  - Append to the end of each ledger: `- DEFERRED (user, 2026-10-19): suspended indefinitely; no further dispatch or implementation authorized; see COMPLETION_REGISTER "Deferred (suspended) work".`
  - In the Workstream 2 ledger, the line continues: ` The four entries above dated 2026-10-18 that concern Workstream 1, ending "Start at Task 0. Nothing implemented yet.", are misfiled and superseded: W1 shipped (PR #39, #40) and the Workstream 1 remainder is deferred; see the Workstream 1 ledger.`
  - Remove no ledger line, and edit no brief.
- [ ] **Step 2: Correct the memory files.** The memory directory is `~/.claude-work/projects/-Users-majedsiefalnasr-Documents-Work-Ultimate-Solutions-EGY-ultimate/memory/`.
  - **`MEMORY.md` (index)**
    - Line 21 (Workstream 2 execution): replace `W2 in progress (../ultimate-w2-menus)` with `Workstream 1 remainder (waves W2–W6 and Plan Task 7) DEFERRED 2026-10-19; Workstream 2 remainder (Tasks 1, 2, 6, 10, 13, PRs #37/#38, Amendments A2/A3) DEFERRED 2026-10-19`.
    - Line 12 (GAP-064 G3-E): replace `E-1 incomplete (E1-V2 OPEN, E1-B1 BLOCKED)` with `E-1 executed (E1-V2 CLOSED, E1-B1 RESOLVED 2026-10-11)`.
  - **`workstream_2_release_ci_tooling.md`**
    - In "## Workstream 1 (2026-10-18)", replace `Execution: SUBAGENT-DRIVEN (user, 2026-10-18), starting at Task 0 once the agent usage limit resets on 2026-10-21.` with `Execution was SUBAGENT-DRIVEN (user, 2026-10-18). W1 shipped (PR #39 4a426b34, PR #40 94807833). The Workstream 1 remainder (waves W2–W6 and Plan Task 7) is DEFERRED (user, 2026-10-19); no further implementation is authorized.`
    - Under "## Still gated", add `- The Workstream 2 remainder (Tasks 1, 2, 6, 10, 13, PRs #37/#38, Amendments A2/A3) is DEFERRED (user, 2026-10-19); no further implementation is authorized. See COMPLETION_REGISTER "Deferred (suspended) work".`
  - **`gap_064_g3e.md`**
    - Append `- 2026-10-19 correction: E1-V2 is CLOSED and E1-B1 is RESOLVED (2026-10-11, G3-E closeout lines 42–43 and 101); G3-E merged d3aabf57. Earlier dated entries saying "E1-B1 BLOCKED, E1-V2 OPEN" are historical.`
    - The dated log entries themselves stay unchanged.
- [ ] **Step 3: Check (all three memory files and both ledgers).**
  - Both ledgers end with the DEFERRED line, and the Workstream 2 ledger's line contains `misfiled and superseded`.
  - `MEMORY.md`:
    - `grep -c 'W2 in progress' MEMORY.md` returns 0;
    - `grep -c 'E-1 incomplete (E1-V2 OPEN, E1-B1 BLOCKED)' MEMORY.md` returns 0;
    - `grep -c 'Workstream 1 remainder (waves W2–W6 and Plan Task 7) DEFERRED 2026-10-19' MEMORY.md` returns 1;
    - `grep -c 'Workstream 2 remainder (Tasks 1, 2, 6, 10, 13, PRs #37/#38, Amendments A2/A3) DEFERRED 2026-10-19' MEMORY.md` returns 1;
    - `grep -c 'E1-V2 CLOSED, E1-B1 RESOLVED 2026-10-11' MEMORY.md` returns 1.
  - `workstream_2_release_ci_tooling.md`:
    - `grep -c 'starting at Task 0 once the agent usage limit resets' workstream_2_release_ci_tooling.md` returns 0;
    - `grep -c 'Workstream 1 remainder (waves W2–W6 and Plan Task 7) is DEFERRED' workstream_2_release_ci_tooling.md` returns 1;
    - `grep -c 'Workstream 2 remainder (Tasks 1, 2, 6, 10, 13, PRs #37/#38, Amendments A2/A3) is DEFERRED' workstream_2_release_ci_tooling.md` returns 1.
  - `gap_064_g3e.md`:
    - `tail -1 gap_064_g3e.md` starts with `- 2026-10-19 correction: E1-V2 is CLOSED and E1-B1 is RESOLVED`;
    - the number of lines containing `E1-B1 BLOCKED` is the same as before the edit, because historical entries are not removed.

### Task 7: Verify the whole branch and open the PR

- [ ] **Step 1:** Run `pnpm run format:check`, `pnpm run agents-md-pointers:validate` and `git diff --check origin/main...HEAD`. Expected: pass.
- [ ] **Step 2:** `git diff --stat origin/main...HEAD` lists files under `docs/` only (Spec AC7).
- [ ] **Step 2a:** `for f in $(git diff --name-only origin/main...HEAD -- docs/superpowers); do git diff -U0 origin/main...HEAD -- "$f" | grep -qE '^-(\*\*)?Status:' && echo "$f"; done` prints exactly the 18 files of §2.1. The Spec and Plan added by Task 0 are new files and do not appear (Spec AC1, AC10). `git diff --name-only origin/main...HEAD -- docs/architecture/research` lists exactly the 26 records of §2.3 (AC3).
- [ ] **Step 3:** `git diff origin/main...HEAD | grep '^-' | grep -v '^---'` lists only:
  - Status lines;
  - the BLUEPRINT_GAPS legend line;
  - the Task 1 register lines;
  - the removed footnote-4 sentence.

  Check each by hand against §2.

- [ ] **Step 4:** Run the final whole-branch review on the most capable model, against Spec AC1–AC11 and the Review Focus. Allow one round of fixes.
- [ ] **Step 5:** Push with `git push origin docs/documentation-hygiene-suspended-work:docs/documentation-hygiene-suspended-work`. Open the PR, including the §2 evidence tables. **Stop. No merge without the user's authorization.**
