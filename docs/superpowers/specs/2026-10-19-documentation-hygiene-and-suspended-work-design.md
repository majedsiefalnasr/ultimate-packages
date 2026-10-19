# Documentation Hygiene and Suspended Work — Design

**Date:** 2026-10-19
**Status:** APPROVED — Spec Review closed (user, 2026-10-19), revision 5. Revision 5 adds only the ledger clarification (§2 item 6, AC11). The implementing Plan (revision 6) passed Plan Review (user, 2026-10-19).

- Independent Spec Review round 1 (2026-10-19) returned CHANGES REQUIRED; findings SR-1 to SR-12 are applied.
- The round 2 re-review returned APPROVE WITH CHANGES; N-1 to N-6 are applied.
- Revision 4 narrows the scope after the user's scope concern of 2026-10-19 (§9).
- Committed after Plan Review approval (AGENTS.md §7.3). Implementation follows the approved Plan (AGENTS.md §7.5).

**Evidence baseline:**

- the Current-State Discovery report, delivered to the user on 2026-10-18 (a session record; it is not committed);
- verification on 2026-10-19 against `origin/main` `94807833`, recorded in the Plan's evidence tables.

**Decisions this Spec records:** the user's Plan Review decisions PR-D1 to PR-D6 of 2026-10-19, made on the first draft of the Preservation and Consolidation Plan.

## 1. Problem

Two kinds of document in this repository can mislead a reader, human or AI:

- **Suspended work that looks active.**
  - Workstream 1 waves W2–W6, the Workstream 2 remainder and the Phase 10 Track C Changesets repair all have APPROVED or REVIEWED documents, branches, worktrees or open PRs.
  - None of them says it is suspended.
  - An agent could read an approved Plan as permission to resume. AGENTS.md §3 already says it is not, but the documents themselves do not say so.
- **Status lines that state something false.**
  - A few Specs and Plans still say "Draft", "awaiting human approval", "Implementation not started" or "prepared for the … HARD USER STOP", although their work has merged.
  - Some research records still say "uncommitted draft", "READY FOR … AUTHORIZATION" or "CI-pending", although their decisions or evidence were later settled.

An approval status is not one of these problems. "APPROVED (Plan Review, 2026-10-06)" is a true historical fact, even after the work ships. Implementation state is a separate fact: it lives in merges, closeout records and the tracking documents (AGENTS.md §2, tiers 1 and 5).

## 2. Scope

**In scope:**

1. Status-line changes, limited to the closed list in §4.
2. Research status notes, limited to the closed list in §4.
3. Recording suspended work as `DEFERRED` in COMPLETION_REGISTER (§5).
4. A preservation map of unique work outside `main` (§6). It is recorded only; nothing is moved or deleted.
5. Tracking-document corrections backed by R1 evidence:
   - add `OPEN` to the BLUEPRINT_GAPS §1 legend, matching its existing use by 38 GAPs;
   - add a BLUEPRINT_GAPS header notice marking the "as of Phase 5" Purpose line as historical;
   - add main CI 39145883565 to the COMPLETION_REGISTER "Overall" paragraph and to C01;
   - remove the stale register sentence "ROADMAP footnote 4 retains a stale MCP reference after GAP-131". Footnote 4 already cites GAP-131, PR #3 and `6f92dd0`. The 2026-10-12 change-log row that mentions the stale footnote is history and stays.
6. Notes outside the repository:
   - **Required.** Append one `DEFERRED` line to the end of each of the two live SDD ledgers:
     - `ultimate-w1-spec/.superpowers/sdd/2026-10-18-workstream-1-shipped-component-completion/progress.md`;
     - `ultimate-w2-a2a3/.superpowers/sdd/2026-10-17-workstream-2-release-ci-tooling/progress.md`.

     A Superpowers controller resumes from a ledger's last lines and dispatches task briefs only after reading the ledger. The appended line is therefore the gate for every brief in that folder, and no brief is edited.

   - **Workstream 2 ledger.** Its line also says that the ledger's last four entries are misfiled Workstream 1 entries from 2026-10-18 and are superseded. They end "Start at Task 0. Nothing implemented yet." In fact, W1 shipped (PR #39, #40) and the rest of Workstream 1 is deferred; see the Workstream 1 ledger. Nothing is deleted.
   - **Optional.** Corrections to the agent memory files that describe this work.

**Out of scope:**

- any status change to a document whose status is a valid historical approval, review or authorization record (§4, category B), even when its work has shipped;
- adding Status lines to documents that have none;
- any GAP `Status` change;
- any consolidation, cleanup or deletion of directories, worktrees, branches, stashes, ledgers or caches;
- any change to PRs #15, #37 or #38, or to the primary checkout;
- any code, CI, baseline or test change;
- marking any work `SUPERSEDED` or `WITHDRAWN` beyond the records that already say so.

## 3. Status terms (PR-D1: existing terms accepted)

| Category            | Term                                  | Existing use                                                       |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| Suspended / On Hold | `DEFERRED`                            | BLUEPRINT_GAPS §1 legend; GAP-012, 021, 026, 040                   |
| Discontinued        | `WITHDRAWN`                           | Prime-parity form-accessibility Plan, Task 1 (2026-09-30)          |
| Superseded          | `SUPERSEDED — <reason>; see <record>` | E1-V2 Spec and Plans                                               |
| Completed / Merged  | `IMPLEMENTED — <evidence>`            | GAP-087 and GAP-092 Specs (`IMPLEMENTED — PR #14, merge 6bba3115`) |

The `DEFERRED` wording for suspended work is fixed:

> `DEFERRED — suspended indefinitely (user, 2026-10-19). No further implementation is authorized. Resuming needs a new explicit authorization; the work may be discontinued in the planned restructuring.`

## 4. Which documents change

### 4.1 Categories

| Category                                                 | Test                                                                                                                                                                                                                                                                                                                                                                                                            | Action                                                                                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Misleading about suspended work or authorization** | The work is unshipped and suspended (§5), but the status reads as approved, reviewed or in progress. An agent could take it as current permission to implement.                                                                                                                                                                                                                                                 | Status line becomes `DEFERRED` (§3) and keeps the old value (R2).                                                                              |
| **B — Valid historical status**                          | The status records an approval, review, authorization or completion that really happened, such as "Approved", "APPROVED (Plan Review …)", "Spec Review passed", "Implementation authorized from Task 1", "Ready for Implementation", "Complete …", "Decisions applied", or "Implementation needs an approved Plan". It stays true as history even after the work ships. Includes documents with no Status line. | **No change.** Implementation state is recorded in merges, closeout records and the register.                                                  |
| **C — Needs an explicit implementation outcome**         | The status asserts a lifecycle state that is now false: "Draft", "awaiting human approval", "Implementation not started", or "prepared for the … HARD USER STOP". The work has shipped, with R1 evidence.                                                                                                                                                                                                       | Status line becomes `IMPLEMENTED — <evidence>` (§3) and keeps the old value verbatim (R2), so any approval or review it recorded is preserved. |

### 4.2 Closed list of status-line changes (18 documents)

| #     | Document                                                                            | Category | Reason                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1–2   | Workstream 1 Spec and Plan (`2026-10-18-workstream-1-shipped-component-completion`) | A        | Waves W2–W6 and Task 7 are suspended (S1, S7)                                                                              |
| 3–4   | Workstream 2 Spec and Plan (`2026-10-17-workstream-2-release-ci-tooling`)           | A        | Tasks 1, 2, 6, 10, 13, PRs #37/#38 and A2/A3 are suspended (S2). The Spec keeps `REVIEWED` as its previous status (PR-D4). |
| 5     | `specs/2026-09-10-phase-10-migration-release-provenance-design.md`                  | A and C  | "Draft for review" although Track C shipped; its Changesets repair is suspended (S3). Composite header (§7).               |
| 6–9   | Phase 10 track Specs for Tracks A, B, D and E                                       | C        | "Draft for review" kept only by D6, now superseded (PR-D2)                                                                 |
| 10    | `specs/2026-09-12-agents-md-orientation-design.md`                                  | C        | "Draft for Spec Review"; shipped                                                                                           |
| 11–12 | `specs/2026-09-12-ssr-safe-component-id-generation-design.md` and its Plan          | C        | "Draft for review (implementation-ready)" invites implementation of shipped work                                           |
| 13–14 | `specs/2026-09-12-vue-dialog-id-scope-amendment.md` and its Plan                    | C        | Same as rows 11–12                                                                                                         |
| 15    | `specs/2026-09-25-gap-039-vue-tooltip-visibility.md`                                | C        | "Draft for Spec Review"; GAP-039 `RESOLVED`                                                                                |
| 16    | `specs/2026-09-21-phase-c-batch-3-migration-design.md`                              | C        | "awaiting human approval" reads as a pending decision. No Spec approval is inferred (R5); the old text is kept.            |
| 17    | `plans/2026-10-05-gap-064-g3b-containers.md`                                        | C        | "Implementation not started; requires separate authorization" is false; the approval is kept in "(Previously: …)"          |
| 18    | `plans/2026-10-06-gap-064-g3c2-visual-review.md`                                    | C        | "prepared for the Step 2 HARD USER STOP" reads as a pending user decision                                                  |

Every other Spec and Plan is category B and does not change.

### 4.3 Closed list of research status notes (26 records)

A research record gets a note only when its status asserts one of the following and the assertion is now false:

- a pending decision, authorization or user stop;
- an uncommitted draft;
- pending CI evidence;
- a contradiction with a later authoritative line in the same record.

The 26 records are listed in the Plan's §2.3. In summary:

- 7 records from 2026-10-11 marked "uncommitted draft", whose decisions became ADR-053–058;
- the GAP-124 research proposal, marked "Not committed";
- the 2 D6-named Phase 10 research records (§7);
- 10 G3-E E1/E1-V2 packets marked as awaiting authorization or decision;
- 4 G3-E E-1 to E-4 before-port records;
- the G3-E closeout, which contradicts itself;
- the C2-0 closeout, marked "CI-pending".

Records whose status is merely "for review", "Draft for review" without D6, or absent are category B and get no note.

### 4.4 Rules

- **R1 — Evidence first.** A change is made only when one of these supports it:
  - a merge commit on `origin/main`;
  - a PR state;
  - a CI run;
  - a committed closeout record, ADR, register line or ROADMAP line.

  If the evidence check fails at execution time, the document is left unchanged and reported.

- **R2 — How a Spec or Plan status line changes.**
  - Exactly one line is edited: the first header line beginning `Status:` or `**Status:**`, in its existing format.
  - The old value is kept verbatim as `(Previously: <old value>.)`.
  - `Status detail` lines and "Spec Gate Status" sections are left unchanged; the new Status line says they are historical.
  - The body is not edited. The one exception is the §7 D6 amendment note.
- **R3 — Research records.**
  - The original Status line and body stay.
  - One line is added directly below the Status line: `**Status note (2026-10-19):** <current state>; see <evidence>. The text below is the point-in-time record.`
  - Where a record has no Status line, the note goes below the title or metadata block.
  - Where a record contradicts itself, the note names the later authoritative lines and deletes neither.
  - A CI-run citation states which steps passed and does not imply the whole run was green.
- **R4 — Tracking documents.** They are updated in place, with a dated change-log row where the document keeps one.
- **R5 — No approval is inferred.** Approval of a Plan never counts as approval of its Spec (PR-D4). No new status line claims an approval that the old line did not record.
- **R6 — No GAP status changes** (COMPLETION_REGISTER maintenance rule).
- **Tier 4 alignment.** Under AGENTS.md §2 tier 4, the changed headers record each document's lifecycle state as of 2026-10-19. The register (tier 5) remains the source for current state.

## 5. Suspended work (PR-D3, PR-D5)

All entries below are `DEFERRED` under §3. Each is recorded in a new COMPLETION_REGISTER section, "Deferred (suspended) work".

Headers change only for §4.2 rows 1–5.

- The Track C Plan keeps its `Complete — implemented and merged` status. S3 is recorded in the register only.
- The GAP-124 Spec and Plan (category B) do not change. S6 is recorded in the register only.
- S4 and S5 are recorded in the register only. Their documents are not on `main` and are not moved (§6).

| ID  | Work                                                                                                                                                                | What already shipped                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| S1  | Workstream 1 waves W2–W6 and Plan Task 7, including the 6 unpushed W2 commits on `feat/w2-menus-navigation`                                                         | W1: PR #39 (`4a426b34`) and PR #40 (`94807833`) |
| S2  | Workstream 2 Tasks 1, 2, 6, 10 and 13, PRs #37 and #38, and the uncommitted Amendments A2/A3                                                                        | PRs #32–#36                                     |
| S3  | Phase 10 Track C Changesets v1 repair: PR #15, local `b45f9d5a`, and the uncommitted Spec/Plan amendment in the primary checkout                                    | Track C mechanism, merge `57772ffe`             |
| S4  | CI-health open-gap study: 2 unmerged commits and an untracked brief (DR-1..DR-8)                                                                                    | —                                               |
| S5  | Bounded autonomous execution proposal: untracked documents and an uncommitted `AGENTS.md` edit                                                                      | —                                               |
| S6  | GAP-124 closeout decision                                                                                                                                           | Spinner fix, merge `e32c224`                    |
| S7  | Narrowed to the Workstream 1 remediation of the GAPs assigned to waves W2–W6 in the Workstream 1 Spec: 084–086, 096, 099–115 and 117–130. GAP-116 stays under EX-3. | —                                               |

Boundary of S1, S2 and S7:

1. No GAP's Status changes.
2. S1 and S2 suspend every unshipped task of their Workstreams. That includes those tasks' GAP-064, GAP-091 and GAP-094 portions, and their accessibility rows that have no GAP number.
3. S7 adds nothing beyond S1. It names the GAPs whose Workstream 1 remediation is suspended.
4. This Spec neither suspends nor authorizes work on any GAP outside the S1 and S2 efforts.
5. The register's C05 entry says that S1/S7 covers only the Workstream 1 wave GAPs.

S4 and S5 stay `DEFERRED`. Neither is marked `SUPERSEDED` or `WITHDRAWN` without a separate supported decision (PR-D5).

## 6. Preservation map

Every location holding work not on `main` is listed with its absolute path in the register's deferred section, so no copy is mistaken for disposable. The list comes from the discovery report §4. Nothing is moved, committed elsewhere or deleted. Any later consolidation is a separate decision.

Known future overlaps are recorded in the register rows, not resolved here:

- The uncommitted A2/A3 edit in `ultimate-w2-a2a3` rewrites the W2 Plan's Status line.
- The uncommitted Track C amendment in the primary checkout rewrites the Track C Plan's Status line and edits the Track C Spec near its header.

If that work resumes, those copies need a manual merge with this branch's Status edits.

The unpushed W2 commits are named as "`e6a0f4c2` through `3675c4e0` (6 commits)".

## 7. Decision D6 is superseded (PR-D2)

**Current rule.** D6 (`specs/2026-09-09-phase-10-operational-documentation-design.md` §D6, narrowed by the Phase B amendment note) keeps 5 Phase 10 track Specs and 2 research records at `Draft for review` after they shipped.

**Decision.** The user superseded D6 on 2026-10-19.

**How it is recorded.** An amendment note is added below D6's existing amendment note. D6's text and its earlier note stay unchanged. The note reads:

> `> **Amendment note (2026-10-19):** by user decision (Preservation and Consolidation Plan Review, PR-D2), D6 is superseded. Spec Status headers record each Spec's lifecycle state as of its last edit (2026-10-19), under the documentation-hygiene Spec. D6's text above is the historical record.`

**What then changes.**

- The 5 Phase 10 track Specs become category C (§4.2 rows 5–9): `IMPLEMENTED — <track merge>. (Previously: Draft for review. The Status detail line below is historical.)`.
- The 2 D6-named research records get notes (§4.3): `2026-09-08-phase-10-production-hardening.md` and `2026-09-08-phase-10-architecture-discussion.md`.
- The Track C Spec's composite header is:

  > `IMPLEMENTED — Track C merge 57772ffe. The Changesets action v1 repair is DEFERRED (S3): PR #15 open; its 2026-10-14 amendment is uncommitted in the primary checkout. No further implementation is authorized. (Previously: Draft for review. The Status detail line below is historical.)`

- AC5.5 of the operational-documentation Spec is part of Track D's historical acceptance criteria. It is not edited.

## 8. Acceptance criteria

- **AC1.** Exactly the 18 documents in §4.2 have a changed Status line, and each has R1 evidence listed in the PR's evidence table.
- **AC2.** In each changed Spec or Plan, the only removed line is its Status line. The new line contains `(Previously:` followed by the old value verbatim.
- **AC3.** Exactly the 26 records in §4.3 gain one line each, and none loses a line.
- **AC4.** Headers for suspended work:
  - the W1 Spec, W1 Plan, W2 Spec and W2 Plan headers begin with `DEFERRED` and contain "No further implementation is authorized";
  - the Track C Spec header begins `IMPLEMENTED — Track C merge 57772ffe` and contains `DEFERRED (S3)` and "No further implementation is authorized".
- **AC5.** COMPLETION_REGISTER has a "Deferred (suspended) work" section with rows S1–S7, including locations, and a 2026-10-19 change-log row.
- **AC6.** No `#### GAP-` Status line changes.
- **AC7.** Only files under `docs/` change, plus the Spec and Plan files.
- **AC8.** `pnpm run format:check` and `pnpm run agents-md-pointers:validate` pass.
- **AC9.** The Workstream 2 Spec keeps `REVIEWED` as its previous status, and no approval is claimed (PR-D4).
- **AC10.** No category B document changes, and no new status line claims an approval its old line did not record (R5).
- **AC11.** Both ledgers in §2 item 6 end with the `DEFERRED` line. The Workstream 2 ledger's line names the misfiled Workstream 1 entries as superseded. No ledger line is removed.

## 9. Review record

**Round 1** (independent, 2026-10-19): CHANGES REQUIRED. Findings SR-1 to SR-12 were applied:

| Finding | Applied in                                                               |
| ------- | ------------------------------------------------------------------------ |
| SR-1    | AC4                                                                      |
| SR-2    | §5                                                                       |
| SR-3    | §5 boundary                                                              |
| SR-4    | R5 and AC10 (revision 4 replaces the former R2a wording rule; see below) |
| SR-5    | R2                                                                       |
| SR-6    | R3; the Plan lists files explicitly                                      |
| SR-7    | R2 exception                                                             |
| SR-8    | §7                                                                       |
| SR-9    | §2 item 5                                                                |
| SR-10   | §6                                                                       |
| SR-11   | §4.4 tier-4 alignment                                                    |
| SR-12   | Plan line references                                                     |

**Round 2** (scoped re-review, 2026-10-19): APPROVE WITH CHANGES. Findings N-1 to N-6 were applied. The review recorded that no further round was needed, and corrected the E1 file count to 18.

**Revision 4** (user scope concern, 2026-10-19: "Approval status and implementation status are distinct facts"):

- Adds the A/B/C categories (§4.1).
- Limits status-line changes to 18 documents (§4.2), down from about 88 in revision 3:
  - Revision 3's "Approved — implemented" rewrites of 40 approved Specs and Plans are dropped as category B.
  - Its 29 added Status lines for Plans without one are dropped.
  - The Phase C batch 1 Plan ("Ready for Implementation") moves to category B.
- Removes the former R2a rule, which chose between "Approved — implemented" and "IMPLEMENTED". Category C always uses `IMPLEMENTED — <evidence>`, and the old text, including any approval it records, is kept verbatim. SR-4's intent, that no approval is inferred, is kept in R5 and AC10.
- Limits research notes to 26 records (§4.3), down from 37. The dropped records are:
  - the Phase 9 and Track E research records ("Draft for review", not D6);
  - the 7 E1-V2 investigation records without a Status line;
  - the G3-D and G3-E research records ("for review").

Settled decisions PR-D1 to PR-D6 are unchanged.

**Revision 5** (user check on stale authorization outside the 18 changes, 2026-10-19):

- **Plans without a Status line (29).** None concerns S1–S7 work. A search for suspended-work identifiers (GAP-084–086, 091, 094, 096, 099–130; Workstream 1/2; PR #15; CI-health; bounded autonomy) found only incidental words: "Changesets" in the shipped Phase 0 Plan, and "bounded" used as an ordinary word in two Plans. Category B stands, and no change is needed.
- **Local ledgers.**
  - The Workstream 1 ledger ends with the user's "stop everything" halt.
  - The Workstream 2 ledger ends with four misfiled Workstream 1 entries, the last reading "Start at Task 0. Nothing implemented yet." This is stale, and a controller could act on it.
  - Revision 4 called the ledger notes optional, so they did not cover this. Revision 5 makes them required, adds the misfiled-entry statement, and adds AC11 (§2 item 6).
- **Briefs** (W1 `task-3a-brief.md`, an empty `task-3-brief.md` and `wave-template.md`; W2 `task-6-brief.md` and `task-6R-brief.md`). These are reached only through their ledger, so the ledger line covers them. `task-6R-brief.md` also carries its own "held" gate.
- **Out of scope, with reasons.**
  - The W2 folders in `ultimate-w2-cli` and `ultimate-w2-integrity` hold only review diffs and have no ledger.
  - The historical ledgers in the primary checkout belong to merged Plans. That checkout is immutable, and no current Plan resumes from them.

No change list (18 status lines, 26 research notes) and no settled decision changed.

**Spec Review closed** (2026-10-19): this revision resolves the last open gap. The user instructed that Spec Review close once no gap remains.
