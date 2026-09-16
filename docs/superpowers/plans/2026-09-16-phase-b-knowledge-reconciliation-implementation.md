# Implementation Plan — Phase B: Knowledge Reconciliation

**Document:** `docs/superpowers/plans/2026-09-16-phase-b-knowledge-reconciliation-implementation.md`
**Status:** Draft for Plan Review.
**Approved specification:** `docs/superpowers/specs/2026-09-16-phase-b-knowledge-reconciliation-design.md` (Spec Gate: **APPROVED**, 2026-09-16, all 7 Spec Review corrections applied).
**Baseline:** `main`, working tree containing only the pre-existing untracked artifacts this plan itself is aware of (see Pre-planning inspection below).
**Required sequence (this document is the Implementation Plan step):** Research ✅ → Decision ✅ → Specification ✅ → Spec Review ✅ → **Implementation Plan (this document)** → Plan Review → Implementation → Verification → Final Review/Closeout.

**Amendment note (Final Review pass, 2026-09-16):** the Pre-planning inspection's line about "SSR-ID cross-reference targets," the Global Constraints' file-scope list, and Task 4's own `**Exact files:**`/step 2 all originally named `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` as the second cross-reference target. That citation was a drafting error, carried over from the same error already corrected in the governing specification (`docs/superpowers/specs/2026-09-16-phase-b-knowledge-reconciliation-design.md`, its own "Amendment Note (Final Review pass)"): that file contains no mention of the sixth-instance finding or `Dialog.vue`. The actual origin document — and the file Task 4 correctly targeted during Implementation — is `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`. The four citations below are corrected in place to name this file; no other part of this plan is altered by this amendment.

This plan does not implement anything. It does not modify `AGENTS.md`, `BLUEPRINT_GAPS.md`, any spec, any plan, any README, `AI_ARCHITECTURE.md`, or any research document. It defines the exact tasks a future, separately-authorized Implementation step must execute, each citing the exact approved-specification section it satisfies.

---

## Pre-planning inspection performed (evidence this plan is grounded on)

- **Current working-tree state, confirmed by direct inspection:** four untracked files exist from the prior Phase A/B research and specification work — `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md`, `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md`, `docs/architecture/research/README.md`, and `docs/superpowers/specs/2026-09-16-phase-b-knowledge-reconciliation-design.md`. None of this plan's own tasks touch any of these four except as read-only evidence sources (and, for the spec, as this plan's own governing document) — the two research reports and the index are only ever *written to* by Task 9 (Phase A/B report closeout reassessment), which this plan explicitly does not authorize executing now (see Task 9's own scope note). (Corrects a prior drafting error: an earlier revision of this note misidentified this deferred, closeout-only task as "Task 8" — Task 8 is Research-document reconciliation for the unrelated 6-document 2026-09-12/13 cluster; the Phase A/B report closeout reassessment is Task 9, which remains separately gated and deferred exactly as described here.)
- **`BLUEPRINT_GAPS.md`'s exact current field schema, confirmed by direct read of `docs/architecture/BLUEPRINT_GAPS.md` §1 ("How to read this document"):** Status (`MISSING` / `PARTIAL` / `IMPLEMENTED-BUT-UNVERIFIED` / `IMPLEMENTED-BUT-NOT-ENFORCED` / `DOCUMENTATION-GAP` / `ARCHITECTURAL-GAP` / `DEFERRED` / `RESOLVED`), Type (one or more of Architecture, Foundation, Component, Framework, Data, Styling, Accessibility, Testing, CI, Packaging, Developer Experience, Documentation, Provenance, Licensing, CLI, MCP, AI, Production), Blocking level (`BLOCKER`/`HIGH`/`MEDIUM`/`LOW`), plus the per-entry field set already used throughout §3 (Current evidence / Expected state / Why it matters / What it blocks / Dependencies / Framework scope / Existing reusable infrastructure / Recommended resolution direction / Source-evidence / Architectural decision required) — confirmed by reading GAP-001/GAP-002's own full entries as the pattern to match.
- **`BLUEPRINT_GAPS.md`'s current highest gap number, to be re-confirmed at implementation time, not assumed here:** the most recently read state of the registry (this session's own Phase A/B research) showed entries through GAP-038. The spec (§5.2) explicitly defers exact numbering to implementation time "to avoid a stale number if other gap-numbering work lands first" — this plan's Task 3 inherits that same deferral and adds its own explicit re-confirmation step.
- **The duplicate DECISION-B/C block's exact location:** per the Phase B report (`[PhaseB §4.4]`) and the prior session's own Phase A research (which independently found and cited the same defect), `BLUEPRINT_GAPS.md` §5 contains a corrected DECISION-C entry followed later in the same section by a stale, pre-correction copy of DECISION-B and DECISION-C — first identified by `docs/architecture/research/2026-09-13-blueprint-closure-current-state-reconciliation.md` §5.9. This plan's Task 2 must re-locate the exact current line range at implementation time (the registry may have grown since these citations were written), not assume the §5.9 citation's line numbers still hold.
- **The SSR-ID cross-reference targets, confirmed present:** `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md` (containing the "No sixth instance exists" claim, per spec §5.3's own line-25 citation) and `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md` (the actual origin document for the sixth-instance finding, per this plan's own Amendment Note above) both exist in the repository today, confirmed by directory listing.
- **The 19-spec and 26-plan universes, confirmed present:** `docs/superpowers/specs/` currently contains 25 files (per this session's own Phase B research pass); `docs/superpowers/plans/` currently contains 27 files as of this plan's own writing — one more than the 26 the Phase B report counted, because this plan's own governing specification (`2026-09-16-phase-b-knowledge-reconciliation-design.md`) and this plan document itself are newer than that count. **Binding clarification (corrects a prior drafting error in this same note):** the "19 specs" the approved specification names in spec §6 is re-verified per-item against `ROADMAP.md` at implementation time by Task 5, per spec §6's own explicit re-verification instruction — that re-verification is about confirming each named spec's *status field value* is correct, not about re-enumerating which specs are in scope. The "26 plans" is a **fixed, closed list** taken exactly as the approved Phase B Spec/report names it — Task 6 does not re-enumerate `docs/superpowers/plans/` against a fresh directory listing to find additional plans; the 27th file (this plan's own governing specification's sibling, or this plan document itself, or any other plan created after the original 26-plan enumeration) is explicitly out of Task 6's scope, per Plan Review correction 1.
- **README component-count claims, confirmed still present:** `packages/ng/README.md:3`, `packages/react/README.md:3`, `packages/vue/README.md:3` each still state "Button, Checkbox, Dialog, Menu, Tooltip" — confirmed unchanged since the Phase B report's own citation (no other agent or process has touched these files in the interim, per `git log` on each path showing no commits after the report's compile date).
- **`AI_ARCHITECTURE.md`'s stale framing, confirmed still present:** still reads "Phase 0 preserves these constraints architecturally without implementing them" for `cli`/`mcp`/`ai`, confirmed by direct re-read this pass.

---

## Global constraints (binding on every task below, restated from the approved specification)

- **Exact file scope and closed boundaries** (spec §2.1, closed per Spec Review correction 1 — no file outside this list may be touched, though some sub-scopes name an at-most count rather than a fixed one, per the individual task notes below): `AGENTS.md`; `docs/architecture/BLUEPRINT_GAPS.md`; `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`; `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`; up to 19 specs' `Status:` fields, re-verified against `ROADMAP.md` per spec — the final modified count may be fewer than 19 if re-verification finds some already correct (Task 5); exactly the 26 plans explicitly named by the approved Phase B Spec/report — no other plan, including this plan document itself or any other newly-created plan (Task 6); `packages/ng/README.md`, `packages/react/README.md`, `packages/vue/README.md`; `packages/ai/README.md`, `packages/mcp/README.md` (Task 7); `docs/architecture/AI_ARCHITECTURE.md` (Task 7a); exactly the 6-document 2026-09-12/13 research cluster — `next-work-prioritization-audit` is one of these 6, not an additional 7th document (Task 8); and, **at closeout only, as a separately-gated, deferred requirement not authorized by this implementation pass** (Task 9 — see Task 9's own scope note), the two Phase A/B reports and `docs/architecture/research/README.md`.
- **No other file may be touched.** Any implementer who finds a reason to touch a file outside this list must stop and escalate — record it as a finding, do not expand scope in flight (spec §2.1's own binding text, Spec Review correction 1).
- **Classification is deterministic** (spec §3, reordered per Spec Review correction 2): every per-document task below applies the 5-rule ordered decision tree in strict first-match-wins order — live error → narrow mechanical staleness → historical-but-superseded → fully redundant → retain-as-is. No task in this plan re-derives or reorders these rules; each cites the specific rule number its disposition matches.
- **No new architectural decision, no scope broadening, no reopening DECISION-B/C/D/E** (spec §1 item 3, §2.2).
- **No code fix for the Vue Tooltip bug or the Paginator Task 15 blocker** — only their gap-registry entries (spec §2.2, Task 3 below).
- **No CI regeneration for `llms*.txt`, no change to the 8-tier hierarchy's ordering/membership, no `skills/*.md` or `packages/ai/context/*.txt` change, no new CI tooling** (spec §2.2).
- **Every task's diff is additive-or-narrowly-corrective, never a wholesale rewrite** — per the approved specification's §3 classification procedure, each per-document disposition is exactly one of the five outcomes that procedure defines: **updated / consolidated / superseded (marked historical) / deleted / retained-as-is**, for the specific material it names, never a new parallel document. (Corrects a prior drafting error: an earlier revision of this constraint stated "exactly four outcomes," omitting retained-as-is — retained-as-is is a real, frequently-expected disposition under §3 rule 5, not an absence of disposition, and its omission here could have been read as implying every touched document must change. This correction aligns the constraint with the approved spec exactly; it does not reopen or reinterpret any architectural decision.)

---

## Task 0 — Pre-implementation git/working-tree check and branch decision

**What to do:**
1. Run `git status --short` and `git branch --show-current`. Confirm the only pending changes are: (a) the four known pre-existing untracked artifacts listed in the Pre-planning inspection above (the two Phase A/B research reports, `docs/architecture/research/README.md`, and the approved specification), and (b) this plan document itself, `docs/superpowers/plans/2026-09-16-phase-b-knowledge-reconciliation-implementation.md` — the newly-created Plan Review artifact this very Implementation Plan step produced, expected to be present and untracked, not an unexpected change. Any pending change beyond these five known files is unexpected and is a reason to stop and escalate before proceeding.
2. Confirm no file this plan's tasks intend to modify (`AGENTS.md`, `BLUEPRINT_GAPS.md`, any spec, any plan, any README, `AI_ARCHITECTURE.md`, any research document) already has uncommitted local changes from another source — if any does, stop and surface it to the human before proceeding, per `AGENTS.md` §3.7.4's own pre-work safety rule (which Task 1 below only clarifies, does not create — the rule already exists in the current `AGENTS.md`).
3. **Ask the human** whether to implement this work item on the current branch (`main`) or a new task branch, per `AGENTS.md` §3.7.1 (direct work on `main` requires explicit authorization; no fixed branch-naming convention exists in this repository).
4. Do not proceed to Task 1 until the branch decision is confirmed.

**Verification:** the confirmed branch (or explicit "proceed on `main`" authorization) is recorded before Task 1 begins.

**Acceptance criteria covered:** none directly — process gate, matching the precedent set by the `AGENTS.md` orientation plan's own Task 0.

---

## Task 1 — `AGENTS.md` §2 additions

**Depends on:** Task 0.
**Exact file:** `AGENTS.md`.
**Spec sections satisfied:** §4.1, §4.2.

**What to do:**
1. Insert, into `AGENTS.md` §2's existing tier-4 bullet ("Approved specifications and implementation plans... binding for their own scope"), a clarifying sentence stating the binding content of spec §4.1: a spec/plan's own internal `Status:` field describes that document's lifecycle state at last edit, never current repository implementation state; to determine whether described work has shipped, consult tier 1 (real evidence) or tier 5 (`ROADMAP.md`), never the status field alone. Exact prose is the implementer's choice; substance must match spec §4.1 exactly.
2. Insert, into `AGENTS.md` §2's existing tier-8 bullet ("AI context files / Skills / `llms.txt` / MCP tool responses — one-directional consumers..."), a clarifying sentence stating the binding content of spec §4.2: within this tier, MCP tool responses are live (read `@ultimate/component-metadata` at request time); `llms.txt`/`llms-full.txt`/generated Skill sections are static, committed snapshots with no CI regeneration, no fresher than their last commit date.
3. **Do not** change tier count, tier ordering, any other tier's existing wording, or `AGENTS.md`'s overall 7-section structure.

**Verification:**
1. `git diff AGENTS.md` shows changes confined to tier-4's and tier-8's own bullet text in §2, nothing else in the file altered.
2. Re-read `AGENTS.md` §2 in full afterward — confirm all 8 tiers still present, in the same order, with the same substance for tiers 1, 2, 3, 5, 6, 7 unchanged.
3. Confirm the section count is still 7 (`grep -c '^## '` or equivalent against the file's top-level headings).

**Acceptance criteria covered:** implements spec §4 in full.

---

## Task 2 — `BLUEPRINT_GAPS.md`: remove the duplicate DECISION-B/C block

**Depends on:** Task 0. (Independent of Task 1 — may run in parallel with it if executed via subagent-driven-development; see Dependencies summary.)
**Exact file:** `docs/architecture/BLUEPRINT_GAPS.md`.
**Spec section satisfied:** §5.1.
**Classification rule applied:** §3 rule 4 (fully redundant, zero unique remainder — the stale copy adds nothing the corrected copy above it doesn't already state).

**What to do:**
1. Re-locate, at implementation time, the exact current line range of the stale, pre-correction DECISION-B/C copy in `BLUEPRINT_GAPS.md` §5 (do not assume the line numbers cited in prior research still hold — the file may have grown).
2. Confirm, by direct comparison, that the first (corrected) DECISION-C copy and any DECISION-B content earlier in §5 are unaffected and will be retained exactly as-is.
3. Delete only the second, stale copy — no other content in §5 or elsewhere in the file is touched.

**Verification:**
1. `git diff docs/architecture/BLUEPRINT_GAPS.md` (after Task 2 alone, before Task 3's additions) shows a pure deletion — no line added, no line outside the stale block's own span changed.
2. Re-read `BLUEPRINT_GAPS.md` §5 in full afterward — confirm exactly one DECISION-B entry and one DECISION-C entry remain, both matching the corrected text, no duplicate anywhere in the section.

**Acceptance criteria covered:** implements spec §5.1 in full.

---

## Task 3 — `BLUEPRINT_GAPS.md`: two new gap entries

**Depends on:** Task 2 (both tasks touch the same file; sequencing avoids a merge/diff-ordering conflict — Task 2's deletion should land before Task 3's additions so Task 3's diff is unambiguous); Task 6 (Task 3's Gap entry B cites `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` Task 15's status as evidence — Task 6 is the only other task that may modify that same file, per Task 6's own step 6, so Task 3 must run after Task 6 completes to ensure its citation reflects that file's final, post-Task-6 state, not a stale pre-Task-6 snapshot; see the Dependencies and sequencing summary below).
**Exact file:** `docs/architecture/BLUEPRINT_GAPS.md`.
**Spec section satisfied:** §5.2.
**Classification rule applied:** §3 rule 1 (live, real gaps not yet reflected in a current-state tracking document — this is new-entry authorship using only already-established evidence, not a "fix" to existing text, but the closest-matching disposition per the spec's own framing of these two entries as closing a documentation gap).

**What to do:**
1. Re-confirm `BLUEPRINT_GAPS.md`'s current highest `GAP-0NN` number by direct read at implementation time (do not assume GAP-038 is still the ceiling — other work may have landed since). Assign the next two available numbers sequentially.
2. Add **Gap entry A — Vue Tooltip visibility bug**, using the existing per-gap schema (Status / Type / Blocking level / Current evidence / Expected state / Why it matters / What it blocks / Dependencies / Framework scope / Existing reusable infrastructure / Recommended resolution direction / Source-evidence / Architectural decision required, matching the exact field set GAP-001/GAP-002 use):
   - **Status:** `MISSING`.
   - **Current evidence:** `packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` never applies a `u-tooltip-{position}` modifier class; `packages/uix-styles/src/tooltip/index.ts`'s base `.u-tooltip` rule leaves `display: none` unset by anything else — cite both file paths, re-verify both claims by direct read at implementation time (do not merely copy the Phase B report's citation without checking it still holds).
   - **Recommend, do not require,** placing this entry near GAP-006 in the document's reading order, given the topical (Tooltip) relationship — per spec §5.2 item 1's own non-binding suggestion.
   - **Architectural decision required:** No — this is a behavioral bug, not a fork.
3. Add **Gap entry B — Paginator Task 15 blocker**, same schema:
   - **Status:** `DEFERRED`.
   - **Current evidence:** `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` Task 15's own "BLOCKED pending an Ultimate Select-equivalent component" marker; cross-reference `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` §3/§4's confirmation that no Select component exists in any of the three frameworks — re-verify both citations still hold at implementation time.
   - **What it blocks:** Paginator's rows-per-page/jump-to-page dropdown UI specifically, not Paginator's already-shipped core functionality.
   - **Architectural decision required:** No — the blocker's resolution path (build Select first) is already named, not an open fork.
4. **Do not** perform new research beyond what the cited Phase A/B report sections and the plan file itself already state. If either citation no longer holds under re-verification, stop and escalate — do not investigate further under this task's own banner (spec §5.2's explicit binding constraint).

**Verification:**
1. `git diff docs/architecture/BLUEPRINT_GAPS.md` (Task 3's own increment) shows exactly two new gap entries added to §3, following the existing schema exactly, no existing entry altered.
2. Confirm both new entries' `Current evidence` citations were freshly re-verified against real source at implementation time (not merely copied from the report). **This verification act itself is recorded only in execution/closeout notes or equivalent implementation evidence, never inside `BLUEPRINT_GAPS.md`** (corrects a prior drafting error that allowed "the entries' own text" as an alternative location — `BLUEPRINT_GAPS.md`'s own `Current evidence` field states the gap's evidence, matching every existing entry's own pattern; it is not a log of the implementer's verification process, and must not become one).
3. Confirm no code fix, no Select-component work, and no other implementation work was performed as part of writing these two entries.

**Acceptance criteria covered:** implements spec §5.2 in full.

---

## Task 4 — SSR-ID cross-reference note

**Depends on:** Task 0. (Independent of Tasks 1-3 — may run in parallel.)
**Exact files:** `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`; `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`.
**Spec section satisfied:** §5.3.
**Classification rule applied:** §3 rule 1 (live factual error — "No sixth instance exists" is false — corrected via an additive note, not a deletion, per the spec's own explicit instruction to preserve the historical record).

**What to do:**
1. In `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`, locate the "No sixth instance exists" claim (cited at line 25; re-confirm the line number still holds at implementation time). Immediately following it, add a short, clearly-marked note stating: a sixth instance was later found in `packages/vue/src/dialog/Dialog.vue`, and was fixed via the `2026-09-12-vue-dialog-id-scope-amendment` spec/plan — with a pointer to both that spec and its companion implementation plan.
2. In `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`, locate the original finding referenced by this cross-reference. Add a symmetrical pointer note at that location, pointing back to the amendment spec/plan.
3. **Do not** alter or delete the original "No sixth instance exists" sentence itself in either file — the correction is additive only, preserving the historical record of what was believed true at the time each document was written.

**Verification:**
1. `git diff` on both files shows only additive insertions at the two named locations — the original claims remain word-for-word unchanged.
2. Re-read both files' surrounding context afterward to confirm the new notes read clearly and do not contradict or confuse the original text they sit beside.

**Acceptance criteria covered:** implements spec §5.3 in full.

---

## Task 5 — Spec `Status:` field reconciliation (19 specs)

**Depends on:** Task 0. (Independent of Tasks 1-4 — may run in parallel.)
**Exact files:** up to 19 files in `docs/superpowers/specs/`, `Status:` field only.
**Spec section satisfied:** §6.
**Classification rule applied:** §3 rule 2 (narrow mechanical staleness).

**What to do:**
1. Re-enumerate, at implementation time, the exact set of specs whose `Status:` field still reads "Draft for review"/"Draft for Spec Review" despite `ROADMAP.md` marking the corresponding phase Complete — use the Phase B report's own named set (Phase 0, Phase 1, uix-data foundation, Paginator, Scroller, Table, Phase 6, Phase 7, Phase 9, all 6 Phase 10 track specs, SSR-safe-ID-generation, vue-dialog-id-scope-amendment, blueprint-completion) as the starting checklist, but confirm each entry's current status by direct file read — do not assume the list is still accurate without checking.
2. For each spec confirmed still stale: read the corresponding `ROADMAP.md` phase/track row directly (not from memory or the report's own citation) to confirm the phase is genuinely marked Complete before touching anything.
3. Change **only** the `Status:` field's value, matching the pattern the 6 already-updated specs use (naming the spec approved/implemented, pointing to the relevant `ROADMAP.md` phase row).
4. **Do not** re-read, reinterpret, or alter any other content in any of the 19 specs — the minimal reading authorized is exactly what step 2 requires (checking `ROADMAP.md`/repository evidence to verify the target status value), never a substantive review of the spec's own prose (spec §6's explicit constraint, sharpened by Spec Review correction 3).

**Verification:**
1. For each modified spec, `git diff` shows a one-line change (the `Status:` field value only) — no other line touched.
2. Confirm every modified spec's new status was backed by a direct, fresh `ROADMAP.md` read at implementation time — not merely trusted from the report.
3. Confirm the final count of modified specs and record it (may be fewer than 19 if re-verification finds some already correct, or if `ROADMAP.md` itself has changed for one — either outcome is acceptable and should be noted, not forced to match 19 exactly).

**Acceptance criteria covered:** implements spec §6 in full.

---

## Task 6 — Plan classification (exactly the 26 plans named by the approved Phase B Spec/report)

**Depends on:** Task 0. (Independent of Tasks 1-5 — may run in parallel.)
**Exact files:** exactly the 26 files in `docs/superpowers/plans/` explicitly identified by the approved Phase B Spec/report's own named set — no more, no fewer.
**Explicitly excluded from this task's scope (corrects a prior drafting error — a previous revision of this task used "up to all files"/"26/27" wording that read as an open-ended re-enumeration; that wording is removed):**
- `docs/superpowers/plans/2026-09-16-phase-b-knowledge-reconciliation-implementation.md` (this plan itself).
- Any other plan created after the approved Phase B Spec/report's own 26-plan enumeration, including any future plan.
- If, during execution, a plan outside the named 26 is encountered (whether newly created or simply missed by the original enumeration), it may only be **recorded as an escalation/observation** — it is never modified, classified, consolidated, or deleted under this task. Modifying it requires a separate, later-gated decision, not an in-flight scope expansion of Task 6.

**Spec section satisfied:** §7.
**Classification rule applied:** §3, all five rules — evaluated per plan, first-match-wins, in strict order.

**What to do:**
1. Confirm the exact 26-plan list from the approved Phase B Spec/report before starting — this is the fixed checklist for this task, not re-derived from a fresh directory listing (a fresh listing may contain more files than these 26, per the exclusions above; those extra files are out of scope, not additional work).
2. Apply §3's classification procedure to each of the 26 plans individually, in this exact order, first-match-wins:
   1. **Live factual error** → update.
   2. **Narrow mechanical staleness** (a status label, a count, a single stale field) → update.
   3. **Unique historical value, but superseded** as the current answer by a more-current document → mark historical/superseded and retain.
   4. **Fully redundant**, zero unique remainder versus a current-state tracking document → consolidate/delete.
   5. **None of the above** → retain as-is.
3. **Do not infer "historical" merely because a plan is old or its implementation is already complete.** A plan is classified historical (rule 3) only when it actually satisfies rule 3 — i.e., only when a specific, more-current document is found to give the better current answer to the same question the plan's content addresses. A completed, accurate, non-superseded plan with no superseding document falls to rule 5 (retain as-is), not rule 3 — completion alone is not evidence of supersession.
4. **Rule 5 means retain as-is** — no note added, no field touched, no file change of any kind for a plan landing on rule 5.
5. For each plan, explicitly check whether it contains a still-open, unexecuted, currently-relevant item (as `2026-09-02-paginator-component-implementation.md`'s own Task 15 is a confirmed example of). A plan found to carry such an item lands on rule 2 (narrow mechanical staleness) — update scoped to the specific stale item, never a blanket checkbox sync.
6. For `2026-09-02-paginator-component-implementation.md` specifically: if the implementer judges the plan document itself (not just the gap registry entry from Task 3) should also reflect Task 15's current blocked status, update only that specific task's own status line — no broader rewrite of the plan.
7. Classify as consolidate/delete (rule 4) only where a specific, documented check finds zero unique remainder beyond what a current-state tracking document already states — do not assume genericness from a plan's age alone. `[PhaseB §8]`'s own starting presumption ("genuine execution records... no changes recommended") is the default for each of the 26; overriding it for any individual plan requires a specific, stated finding against that plan's own content.
8. Record each of the 26 plans' disposition (rule 1 through rule 5, with which rule matched) in execution notes, even for plans landing on rule 5 with zero file change — the classification itself is the deliverable this task must show for all 26, not merely the resulting diff.

**Verification:**
1. All 26 named plans — no more, no fewer — have a recorded disposition citing which of the 5 rules matched, in order, none skipped.
2. `git diff` shows changes only for plans classified rule 1, rule 2, or rule 3 (update or mark-historical), and only to the specific field/item each classification named — no blanket rewrite of any plan's checkboxes or header to "match today," and zero changes for any plan classified rule 5.
3. Confirm zero plans were deleted or consolidated without an explicit, stated zero-unique-remainder finding recorded for that specific plan (rule 4).
4. Confirm this plan's own file (`2026-09-16-phase-b-knowledge-reconciliation-implementation.md`) and any other newly-created plan were not touched, classified, or included in the disposition list — only escalated as an observation if encountered.

**Acceptance criteria covered:** implements spec §7 in full.

---

## Task 7 — README corrections

**Depends on:** Task 0. (Independent of Tasks 1-6 — may run in parallel.)
**Exact files:** `packages/ng/README.md`, `packages/react/README.md`, `packages/vue/README.md`, `packages/ai/README.md`, `packages/mcp/README.md`.
**Spec sections satisfied:** §8.1, §8.2.
**Classification rule applied:** §3 rule 2 (narrow mechanical staleness), for all five files.

**What to do:**
1. In `packages/ng/README.md`, `packages/react/README.md`, `packages/vue/README.md`: replace the restated "Button, Checkbox, Dialog, Menu, Tooltip" (5-component) claim with a durable pointer. For Angular, point to `docs/architecture/COMPONENT_INVENTORY.md` (already the existing, current, committed inventory source). For React/Vue: **at implementation time, first check whether an existing, committed, current inventory source for React/Vue already exists** (e.g., a React/Vue equivalent of `COMPONENT_INVENTORY.md`, should one already exist in the repository at implementation time). If such a committed source exists, point to it. **Only if no committed current inventory source exists for React/Vue** does the pointer fall back to `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` itself, as a fallback, not a first choice. (Corrects a prior drafting error: an earlier revision of this step implied a committed React/Vue inventory source might come into existence "per Task 8/closeout" — neither Task 8 [research-document reconciliation for the unrelated 2026-09-12/13 cluster] nor the deferred Task 9 [Phase A/B report closeout reassessment] creates or folds React/Vue findings into any committed inventory document; no task in this plan does. This step's fallback-only use of the Phase A report is unconditional on any other task's outcome, not contingent on Task 8 or Task 9 having run.) **This task does not create any new inventory artifact** — it only selects among sources that already exist at implementation time, preferring a committed current-state document over the Phase A research report. **Do not write any numeric component count into any of the three files** — this is the sole binding action per Spec Review correction 4; there is no restated-count alternative. No other content in any of the three READMEs is altered.
2. In `packages/ai/README.md` and `packages/mcp/README.md`: populate the empty "## Status" section with a short, accurate statement of current shipped state, sourced from `ROADMAP.md` footnotes 5 and 4 respectively (re-read both footnotes directly at implementation time, do not assume their content from memory) — not a restated phase-completion narrative, a pointer-preferring short statement matching the same durability principle as step 1.

**Verification:**
1. `git diff` on all five files shows changes confined to exactly the sections named above — component-count claim in the first three, empty Status section in the last two.
2. Grep all three framework READMEs afterward for any digit adjacent to "component" — confirm none remains (proving the pointer-only constraint was actually honored, not just intended).
3. Confirm `packages/ai/README.md` and `packages/mcp/README.md`'s new Status content accurately reflects `ROADMAP.md`'s current footnote text, re-read fresh.

**Acceptance criteria covered:** implements spec §8.1 and §8.2 in full.

---

## Task 7a — `AI_ARCHITECTURE.md` framing correction

**Depends on:** Task 0. (Independent of all other tasks — may run in parallel.)
**Exact file:** `docs/architecture/AI_ARCHITECTURE.md`.
**Spec section satisfied:** §8.3 (named in spec §2.1's file list as `docs/architecture/AI_ARCHITECTURE.md` — correct the "Phase 0 preserves... no implementation" framing for `cli`/`mcp`/`ai`).
**Classification rule applied:** §3 rule 2 (narrow mechanical staleness).

**What to do:**
1. Correct the "Phase 0 preserves these constraints architecturally without implementing them" / "no implementation" framing to reflect that `cli`/`mcp`/`ai` are now real, shipped packages (Phases 7/8/9, per `ROADMAP.md`, re-read fresh at implementation time).
2. **Do not** alter the underlying constraint text itself (the boundary rules, dependency direction) — that content remains true and CI-enforced; only the implementation-status framing is stale and in scope.

**Verification:**
1. `git diff docs/architecture/AI_ARCHITECTURE.md` shows a narrow, framing-only correction — the constraint statements themselves (§2.6/§2.7/§6-derived content) are unchanged.
2. Re-read the file in full afterward to confirm it no longer implies `cli`/`mcp`/`ai` are unimplemented.

**Acceptance criteria covered:** implements the `AI_ARCHITECTURE.md` item named in spec §2.1's file scope list.

---

## Task 8 — Research-document reconciliation (6-document 2026-09-12/13 cluster)

**Depends on:** Task 0. (Independent of Tasks 1-7a — may run in parallel, though this is the most research-heavy task and may be scheduled last for implementer convenience.)
**Exact files:** exactly the 6-document 2026-09-12/13 cluster named by the approved specification's §9 Scope line — `post-phase-10-blueprint-reconciliation-audit`, `ai-knowledge-architecture-assessment`, `project-reality-and-ai-operating-model-audit`, `ai-orientation-design`, `next-work-prioritization-audit`, `blueprint-closure-current-state-reconciliation` — **6 documents total, `next-work-prioritization-audit.md` is one of these 6, not a 7th document in addition to them.** No other research document is in scope (spec §9, closed per Spec Review correction 1). (Corrects a prior drafting error in this plan: an earlier revision of this task's own "Exact files" and "Verification" text listed `next-work-prioritization-audit.md` a second time, as if it were an "orphaned audit" outside the 6-document cluster, producing a false 7-document count. The approved specification's own §9 Scope line already includes `next-work-prioritization-audit` as the 5th of the 6 named documents — there is no 7th document anywhere in this task's scope.)
**Spec section satisfied:** §9.
**Classification rule applied:** §3, all five rules — evaluated per document.

**What to do:**
1. For each of the 6 documents, apply §3's procedure. `blueprint-closure-current-state-reconciliation.md` (2026-09-13) is the chain's **latest/current synthesis for the conclusions it covers** — not an authoritative document in the `AGENTS.md` §2 hierarchy sense (research remains tier 6 throughout; its conclusions still require the same re-confirmation-against-real-evidence any tier-6 document requires). Use it as the reference point for "is this superseded" comparisons, per spec §9 item 1, but do not treat its conclusions as automatically correct without spot-checking against real evidence where a disposition depends on it.
2. For the 5 earlier documents in the chain (i.e., all 6 except `blueprint-closure-current-state-reconciliation.md` itself, which includes `next-work-prioritization-audit.md`): where a document's findings are fully and accurately carried forward by the 2026-09-13 document, mark it superseded-for-conclusions **in place** (a short header note, not a body rewrite) and/or consolidate genuinely unique remaining content into the 2026-09-13 document or another surviving target. Retain documents with meaningful unique evidence; only delete where a specific, per-document, zero-unique-remainder finding is made and recorded (§3 rule 4).
3. `next-work-prioritization-audit.md`, one of the 5 documents step 2 covers, needs its own explicit resolution within that same pass, per spec §9 item 3 (`[PhaseB §9 Choice B]`): mark superseded (its core question has a later, different answer: the Phase A/B effort itself) or retain as ordinary historical research, per whichever §3 outcome its actual content supports once read in full. This is not separate work outside step 2 — it is step 2's own treatment of this specific document within the 6, called out here because the approved specification itself calls it out for the same reason (its resolution isn't purely mechanical the way a header-note-only supersession might be for the others).
4. **An index-only fix does not satisfy this task.** `docs/architecture/research/README.md` (already committed) is not sufficient on its own — this task must show an actual per-document disposition for each of the 6, not merely a pointer added elsewhere.
5. Any deletion requires its own one-line, per-document justification recorded in execution notes or the eventual closeout record, per spec §9's explicit deletion-authorization constraint.

**Verification:**
1. Each of the 6 named documents — no more, no fewer — has an explicit, recorded disposition (update / consolidate / mark-historical / delete / retain-as-is) with a one-line justification.
2. `git diff`/`git status` for `docs/architecture/research/` shows changes/deletions confined to exactly these 6 documents — no other research document touched.
3. Confirm no document outside the named 6 was modified, deleted, or newly created under this task, and confirm `next-work-prioritization-audit.md` was not counted or treated as a document separate from the 6.

**Acceptance criteria covered:** implements spec §9 in full.

---

## Task 9 — Phase A/B report closeout reassessment (deferred requirement — tracked only, not executable in this implementation pass)

**This task is recorded here solely so the later closeout requirement is not lost — it is NOT part of, and is NOT authorized by, the current implementation pass.** Per spec §10 (as corrected by Spec Review corrections 6 and 7), this reassessment happens **at Phase B closeout**, a distinct, separately-gated later moment — after Tasks 1-8 above are complete — and is explicitly the final task of the eventual, later Implementation step, not a parallel or early one, and not part of the implementation pass this current Plan Review is reviewing. **This specification document itself is not part of this reassessment** — it follows the ordinary specification lifecycle, not the Phase A/B report retention decision.

**Binding scope clarification (corrects a prior drafting error):** this task's contents below describe what the *later, deferred* closeout reassessment must do once it is separately authorized — they are not instructions for the current implementation pass to act on now, and they must not be read into, or satisfied by, the current pass's acceptance criteria or verification scope (see Task 10, which explicitly excludes Task 9). Task 9 exists in this plan purely as a durable tracking record of a requirement that will need its own future authorization.

**What the later, deferred closeout task must do, once separately authorized and once Tasks 1-8 are actually complete (not before, and not as part of this implementation pass):**
1. Apply §3's method to exactly three artifacts: `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md`, `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md`, and `docs/architecture/research/README.md`.
2. **Retain** either report if it still contains findings not yet folded into whatever authoritative or current-state document is the appropriate target for that finding — the specific target document is determined at this point by which document Tasks 1-8 actually updated, not fixed in advance.
3. **Mark historical/superseded** for whichever parts of either report were successfully folded into their target document by closeout — the report is not deleted merely because its findings were acted on; it remains valid evidence of how those findings were established.
4. **No Tier 0 promotion, regardless of outcome** — absolute, per `[Decision 1]`.

**Verification (once executed):** the disposition for all three artifacts is explicitly recorded, with the specific target document(s) named for anything marked "folded in."

**Acceptance criteria covered:** none, by this plan's own current implementation pass — spec §10 is a deferred requirement Task 9 exists only to track; it is explicitly excluded from this pass's acceptance criteria and from Task 10's verification scope (see Task 10 below). Spec §10 is satisfied only once a future, separately-authorized closeout implementation actually executes this task.

---

## Task 10 — Whole-diff verification and final review

**Depends on:** Tasks 1-8 all complete. (Task 9/closeout is separately gated, per its own scope note, and is not part of this verification pass unless it has also been executed.)

**What to verify, in order:**
1. `git status --short` — confirm every changed/new/deleted file falls within the exact scope named in this plan's Global Constraints section, no more, no fewer.
2. `git diff --stat` — confirm no file outside that scope appears.
3. Confirm `docs/architecture/BLUEPRINT.md` does not appear in the diff at all.
4. Confirm no file under `packages/ai/context/`, `skills/*.md`, `packages/component-metadata/`, `packages/component-schema/`, or any `.github/workflows/*.yml` appears in the diff.
5. Confirm no `package.json` in the repository was touched (no dependency, script, or version change of any kind).
6. Re-read `AGENTS.md` §2 in full one more time against spec §4's exact binding content — final self-review distinct from Task 1's own per-task verification.
7. Re-read `BLUEPRINT_GAPS.md` §3 and §5 in full — confirm exactly the two new entries from Task 3 exist, the duplicate block from Task 2 is gone, and no other entry was altered.
8. Confirm every research-document disposition from Task 8 is reflected accurately in the final diff (no document left in an intermediate, half-edited state).
9. Confirm DECISION-B, DECISION-C, DECISION-D, and DECISION-E in `BLUEPRINT_GAPS.md` §5 are unchanged in substance from before this implementation began (only the duplicate block removed, per Task 2 — the surviving, corrected copies are untouched).

**What NOT to do:**
- Do not commit at the end of this task. Committing is its own separately authorized action, requested explicitly after the human reviews the finished, verified diff.
- Do not execute Task 9 (closeout reassessment) as part of this verification pass — it is a distinct, later-gated task per its own scope note above.

**Acceptance criteria covered:** final, whole-diff confirmation that every task's scope was honored and nothing outside it was touched.

---

## Dependencies and sequencing summary

- **Task 0** gates every other task (branch/working-tree check first).
- **Tasks 1, 2+3 (as a pair), 4, 5, 6, 7, 7a, 8** are each independent of one another once Task 0 is complete — all touch disjoint file sets, **with one exception:** Task 3 and Task 6 both touch `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` (Task 3 reads/cites it as gap-entry evidence; Task 6 may write to it, per Task 6's own step 6) — **Task 6 must complete before Task 3 runs**, so Task 3's citation reflects that file's final state rather than a stale pre-Task-6 snapshot. (Task 2 and Task 3 also share one file, `BLUEPRINT_GAPS.md`, and must run in that internal order for the same reason — Task 2's deletion before Task 3's additions.) Every other task pair shares no file. This plan is therefore suitable for subagent-driven-development with one implementer per task (or per independent task group), dispatched in parallel after Task 0 subject to the Task 6-before-Task-3 ordering above, rather than strict sequential execution — unlike the `AGENTS.md` orientation plan's own fully-sequential shape, this plan's tasks were deliberately scoped (by the approved specification's own §2.1 file-scope list) to be file-disjoint, with this one documented exception.
- **Task 3's full dependency structure is: Task 0 → {Task 6, Task 2} → Task 3** — Task 0 gates both Task 6 and Task 2; Task 6 and Task 2 may execute in either order relative to each other (no ordering requirement between them); Task 3 must wait for **both** Task 6 and Task 2 to complete before it starts. Task 3 waits for Task 6 because Task 6 may modify `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md`, which Task 3 uses as gap-entry evidence. Task 3 waits for Task 2 because Task 2 and Task 3 both modify `docs/architecture/BLUEPRINT_GAPS.md`, and their execution must stay ordered to avoid a same-file conflict. (Corrects a prior drafting error: an earlier revision of this line wrote the dependency as a strict linear chain, "Task 0 → Task 6 → Task 2 → Task 3," which directly contradicted this same line's own parenthetical stating Task 6 and Task 2 have no ordering requirement relative to each other — the two statements could not both be true. The set notation above resolves the contradiction: Task 6 and Task 2 are each independently gated by Task 0 and independently required by Task 3, with no ordering between themselves.) Tasks 1, 4, 5, 7, 7a, 8 remain independent of this structure and of each other.
- **Task 9** (closeout reassessment) is a deferred, separately-gated requirement, not part of this implementation pass at all — it is tracked here only so it is not lost, and would depend on Tasks 1-8 all being complete whenever it is later, separately authorized, per spec §10.
- **Task 10** (whole-diff verification) depends on Tasks 1-8 only — it does not include or wait on Task 9, which is out of scope for this pass entirely.

---

## Commit-message convention for the eventual commit (informational — no commit is authorized by this plan)

Per this repository's own confirmed Conventional Commits convention, an eventual commit — only once separately authorized, and only after Task 10's verification passes — should follow a shape such as `docs(architecture): reconcile Phase B knowledge-authority findings into AGENTS.md/BLUEPRINT_GAPS.md/READMEs`, scoped as `docs` (matching the existing `docs(architecture): ...` pattern), or split into several smaller commits by task group if the human prefers granular review — that choice is the human's, not this plan's, to make at commit time.

---

## Plan Review Gate

**IMPLEMENTATION PLAN — READY FOR REVIEW**

Not self-approved. This plan does not authorize implementation to begin; Plan Review remains the next gate.
