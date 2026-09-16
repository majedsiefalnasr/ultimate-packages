# Specification — Phase B: Knowledge Reconciliation

**Status:** Approved (Spec Review passed; approved by the human 2026-09-16, all 7 Spec Review corrections applied — see "Amendment Note" below).
**Date:** 2026-09-16

**Amendment Note (Spec Review pass):** the human's own Spec Review identified 7 required corrections, all applied in this revision: (1) closed §2.1's implementation-file scope — §9 no longer permits discovering and modifying "any other research document," any candidate outside the named list is now escalation-only, requiring a separate specification amendment; (2) made §3's classification procedure a strict, ordered decision tree (first-match-wins) in the exact sequence specified (live error → narrow mechanical staleness → superseded-but-historical → fully redundant → retain), and remapped every cross-reference to §3's rule numbers accordingly; (3) corrected §6 to explicitly permit the minimal verification reading needed to check the `Status:` field's target value against `ROADMAP.md`/repository evidence, while continuing to prohibit substantive re-reading/reinterpretation of the 19 specs' own content; (4) made §8.1 mandate a durable pointer for framework-package component counts, removing the prior restated-count option entirely; (5) removed the "authoritative" characterization of `blueprint-closure-current-state-reconciliation.md` in §9, restating it as the chain's latest/current synthesis only, with an explicit note that research remains tier 6 throughout; (6) generalized §10's closeout criteria to "the appropriate authoritative or current-state document" rather than naming `COMPONENT_INVENTORY.md`/`BLUEPRINT_GAPS.md`/`AGENTS.md` specifically; (7) removed this specification document itself from §10's Phase A/B report reassessment scope, noting it follows the ordinary specification lifecycle instead. Two additional stray subsection-numbering defects from the prior revision (§5's own subsections mislabeled 6.1/6.2/6.3; §8's own subsections mislabeled 9.1/9.2) were also corrected to §5.1/§5.2/§5.3 and §8.1/§8.2, since they were directly implicated by corrections 3, 4, and 6's own cross-references. All seven approved human decisions and the Overall Phase B Principle are unchanged in substance; no new architectural decision is introduced; no scope broadened.
**Amendment Note (Final Review pass, 2026-09-16):** §2.1's file-scope list and §5.3 originally cited `docs/architecture/research/2026-09-12-track-e-ssr-id-nondeterminism-finding.md` as the target research document for the SSR-ID cross-reference note. That citation was a drafting error: that file contains no mention of the sixth-instance finding or `Dialog.vue`. The actual origin document for the sixth-instance finding is `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md`, confirmed as the canonical source both by its own title and by the `2026-09-12-vue-dialog-id-scope-amendment` spec's own "Origin:" citation. The Implementation Plan's Task 4 correctly targeted this actual file instead of the mis-cited one; this note corrects §2.1's file list to name it, retroactively authorizing that substitution. No other part of §2.1 or §5.3 is altered.

**Origin:** `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md` (the reviewed Phase B research report this specification implements — every binding decision below traces to either that document's own findings, referenced as `[PhaseB §N]`, or to the human's own confirmed decisions, referenced as `[Decision N]` per this task's own numbered decision list). That report itself used `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` as factual context (referenced as `[PhaseA §N]`) without modifying it.
**Baseline:** `main`, with the two research reports and `docs/architecture/research/README.md` already committed as untracked-then-added files per the prior turn's verification (`docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md`, `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md`, `docs/architecture/research/README.md`).

**Required sequence (this document is the Specification step):** Research (Phase A + Phase B reports) ✅ → Decision (human, 7 numbered decisions + Overall Phase B Principle, confirmed this task) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

This specification does not implement anything. It does not edit `BLUEPRINT_GAPS.md`, does not edit any spec/plan status field, does not delete or consolidate any research document, and does not create an implementation plan. It defines the exact, bounded content and constraints that a future, separately-gated Implementation Plan must satisfy.

---

## 1. Human decisions this specification implements (binding, not reopened here)

Per the human's own 7 numbered decisions and closing "Overall Phase B Principle":

1. **No Tier 0.** The Phase A/Phase B reports do not become a new authority tier. The existing 8-tier hierarchy in `AGENTS.md` §2 is unchanged in its ordering and membership. The two reports remain dated research artifacts under `docs/architecture/research/`, and their findings "must eventually be reconciled into the appropriate authoritative documents" — this specification is that reconciliation's bounded scope.
2. **Consolidate the research cluster.** The 6-document 2026-09-12/13 reconciliation-audit cluster (`[PhaseB §4.5]`) is in scope for consolidation, retention-with-marking, or deletion — evaluated per-document, not defaulted to any single outcome. An index alone is explicitly insufficient (`[Decision 2]`, final bullet).
3. **Documentation reconciliation is in scope for Phase B**, bounded to evidence-backed mechanical fixes (status corrections, component counts, duplicate removal, missing cross-references, historical/superseded marking, consolidation, deletion of no-longer-useful content) — explicitly **not** a vehicle for new architectural decisions. Anything requiring an actual architectural decision is out of this specification's scope and remains separately gated.
4. **Spec/plan `Status:` field ≠ implementation truth.** `AGENTS.md` gains an explicit clarifying statement (the specific sentence(s) are this specification's own binding content, §4 below) that a spec/plan's internal `Status:` field describes that document's own lifecycle state, never current repository implementation state. The 19 stale spec statuses and (per `[Decision 7]`'s narrower framing) select plan statuses identified in `[PhaseB §4.3]`/`[PhaseB §4.8]` are reconciled under this decision, not rewritten wholesale.
5. **MCP vs. `llms*.txt` freshness distinction is documented**, not re-architected. No automatic `llms*.txt` regeneration is introduced by Phase B. No change to the authority hierarchy's tier-8 membership.
6. **Phase A/B lifecycle.** Both reports stay under `docs/architecture/research/` for the duration of Phase B as working reconciliation evidence. No new knowledge directory is created. At Phase B closeout, each report is individually reassessed (retain / consolidate / mark historical / delete) per its own remaining value at that time — **this specification does not pre-decide that closeout outcome**; it is an Implementation Plan task with its own acceptance criterion (§10, tracked at closeout).
7. **Implementation plans are historical execution artifacts, not living dashboards.** Plans are not mechanically rewritten merely to make checkboxes match today's state. Each of the 26 plans is classified (retain/update, retain-as-historical, consolidate, delete) based on remaining value, not force-normalized to a single template. Current implementation state remains authoritative in repository evidence and current-state tracking, never in a plan's own checkbox state.

**Overall Phase B Principle (governs every task below):** the goal is reconciliation, not accumulation. Every task in this specification results in one of exactly four outcomes for the material it touches — **updated, consolidated, superseded, or deleted** — never a fifth new layer of documentation sitting alongside what it was meant to clarify.

---

## 2. What this specification covers — exactly, no more

- The exact classification method and per-document disposition (update / consolidate / mark historical / delete / retain-as-is) for every artifact `[PhaseB §4]` and `[PhaseB §9]` named as stale, duplicated, or in need of a choice.
- The exact content `AGENTS.md` §2 must gain regarding spec/plan `Status:` field authority (`[Decision 4]`), and the exact content `AGENTS.md` §2/tier-8 must gain regarding the MCP-vs-`llms*.txt` freshness distinction (`[Decision 5]`).
- The exact scope and method for reconciling `BLUEPRINT_GAPS.md` (duplicate DECISION-B/C block removal; two new gap entries; per `[PhaseB §4.2]`/`[PhaseB §4.4]`/`[PhaseB §4.9]`).
- The exact scope for the two live-contradiction fixes (`[PhaseB §4.1]`): the missing cross-reference note in the SSR-ID-generation spec and its companion research document.
- The exact classification criteria (not yet the per-document verdicts — those are Implementation Plan/Task output, per §4 below) for: the 6-document research cluster, the 26 implementation plans, the 19 stale specs, and the 3 stale framework READMEs plus the `ai`/`mcp` README status gaps.
- The Phase B closeout re-assessment task for the Phase A/B reports themselves.

### 2.1 Implementation scope (binding, disambiguates any future Plan)

The file-touching scope this specification authorizes an eventual Implementation Plan to cover is strictly limited to:

- **Modify:** `AGENTS.md` — exactly two additions: the spec/plan `Status:` field clarification (§4.1) and the tier-8 MCP/`llms*.txt` distinction (§4.2). No other section altered.
- **Modify:** `docs/architecture/BLUEPRINT_GAPS.md` — remove the duplicate DECISION-B/C block (§5.1); add exactly two new gap entries (§5.2).
- **Modify:** `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md` — add the cross-reference note only (§5.3).
- **Modify:** `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md` — add the cross-reference note only (§5.3). *(Corrected by the "Amendment Note (Final Review pass, 2026-09-16)" above — originally mis-cited as `2026-09-12-track-e-ssr-id-nondeterminism-finding.md`.)*
- **Modify:** up to 19 specs' `Status:` fields (§6, exact list to be enumerated by the Implementation Plan from `[PhaseB §4.3]`'s own named set).
- **Modify:** up to 26 plans' `Status:`/header content, per each plan's individual classification outcome (§7) — not a blanket rewrite.
- **Modify:** `packages/ng/README.md`, `packages/react/README.md`, `packages/vue/README.md` — replace the stale restated component count with a durable pointer only (§8.1).
- **Modify:** `packages/ai/README.md`, `packages/mcp/README.md` — populate the empty "## Status" section only (§8.2).
- **Modify:** `docs/architecture/AI_ARCHITECTURE.md` — correct the "Phase 0 preserves... no implementation" framing for `cli`/`mcp`/`ai` (§8.3).
- **Modify/Consolidate/Delete (per classification outcome, §9):** exactly the 6-document 2026-09-12/13 research cluster named in §9, and `docs/architecture/research/2026-09-12-next-work-prioritization-audit.md` — no other research document.
- **Reassess (per §10's closeout criteria, at Phase B closeout only, not earlier):** `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md`, `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md`, and `docs/architecture/research/README.md`.

**No other file may be added to the implementation scope.** If, during implementation, another document is found to need updating/consolidating/superseding/deleting beyond the exact list above, it must be recorded as a finding/escalation — modifying it requires a new, separately-gated specification amendment, not an in-flight scope expansion of this one. (Corrects a prior drafting error: an earlier revision of §9 permitted the Plan to discover and act on "any other research document" surfaced by §3's method: that phrase authorized open-ended scope expansion and is removed. §9's method still applies §3 to identify candidates, but any candidate outside the exact list above is now escalation-only.)

### 2.2 Explicitly excluded (binding, restated from the human's own instructions across both this task and the Phase A/B research tasks)

- Any change to `docs/architecture/BLUEPRINT.md`.
- Any change to `docs/architecture/DECISIONS.md`'s existing ADR content or numbering (new ADRs may be *proposed* as an open question, §11, but none is authored by this specification or its eventual Plan).
- Reopening DECISION-B, DECISION-C, DECISION-D, or DECISION-E (`[PhaseA §8]`/`[PhaseB §1]`, both explicit).
- Fixing the Vue Tooltip visibility bug itself (`[PhaseB §4.2]`) — this specification authorizes only its **gap-registry entry** (§5.2), not a code fix. A code fix is separately gated implementation work, outside Phase B's documentation-reconciliation scope.
- Fixing the Paginator Task 15 blocker itself, or building the Select-equivalent component it depends on — this specification authorizes only its **gap-registry entry** (§5.2).
- Adding CI regeneration for `llms*.txt` (`[Decision 5]`, explicit: "will not introduce automatic regeneration").
- Any change to the 8-tier authority hierarchy's ordering or membership (`[Decision 1]`, explicit).
- Any change to `skills/*.md` content, `packages/ai/context/*.txt` content, or `packages/component-metadata`/`packages/component-schema`.
- Populating Skills' empty operational-guidance sections (`[PhaseB §4.10]`) — noted there as "Phase C planning" material, not Phase B documentation-hygiene.
- Any new CI validation step, script, or tooling of any kind.
- Any change to `README.md` (root) or any package README beyond the specific corrections named in §8.

---

## 3. Classification method (applies uniformly to §7 and §9's per-document work; also underlies §6's mechanical field-only updates)

Every document evaluated under this specification's Implementation Plan is assigned exactly one disposition. The rules below are evaluated **in this fixed order**; the first rule that matches determines the disposition, and evaluation stops there — a document is never evaluated against a later rule once an earlier one applies. This ordering is itself binding (corrects a prior drafting error where the rules could be read as independent, non-exclusive checks rather than an ordered decision procedure):

1. **Live factual error or contradiction** — does the document contain a claim a reader could act on incorrectly right now (e.g. "No sixth instance exists" — false)? → **update**: fix the specific error, do not delete the document.
2. **Narrow mechanical staleness** — is the document otherwise accurate, but a specific field has gone stale (a status label, a count)? → **update**: correct that field only, no broader rewrite (per `[Decision 7]`'s explicit "not a current project dashboard" instruction for plans, extended by this specification to specs/READMEs under the same reasoning).
3. **Unique historical value, but superseded as current** — does it have real, still-relevant historical value, but a more-current document now gives the better answer to the same question? → **mark historical/superseded and retain**: add a short header note naming what supersedes it; do not rewrite the body.
4. **Fully redundant, no unique remainder** — is its content fully and accurately preserved in a higher-authority or more-current document, with nothing left that isn't already stated there? → **consolidate or delete**: fold any genuinely unique fragment into the surviving document first (consolidate) if one exists, otherwise delete.
5. **None of the above** — is it accurate, current, and non-duplicative? → **retain as-is**, no change.

This is the method; §7 and §9 apply it and record each document's actual verdict as an Implementation Plan task, not a pre-decided outcome in this specification.

---

## 4. `AGENTS.md` §2 additions (`[Decision 4]`, `[Decision 5]`)

### 4.1 Spec/plan status clarification

A new sentence (or short clause) inserted into `AGENTS.md` §2's existing tier-4 description ("Approved specifications and implementation plans... binding for their own scope"). Binding content, exact wording left to the Implementation Plan:

> A specification or implementation plan's own internal `Status:` field (e.g. "Draft for review," a checkbox list) describes that document's lifecycle state at last edit — it is never evidence of current repository implementation state. To determine whether the work a spec/plan describes has actually shipped, consult tier 1 (real repository evidence) or tier 5 (`ROADMAP.md`), never the document's own status field in isolation.

### 4.2 Tier-8 MCP/`llms*.txt` distinction

A short clarifying addition to `AGENTS.md` §2's existing tier-8 description ("AI context files / Skills / `llms.txt` / MCP tool responses — one-directional consumers..."). Binding content, exact wording left to the Implementation Plan:

> Within this tier, freshness guarantees differ: MCP tool responses read `@ultimate/component-metadata` live, at request time. `llms.txt`/`llms-full.txt`/generated Skill sections are static, committed snapshots, regenerated only when someone runs the generator by hand (no CI regeneration exists) — treat them as no fresher than their last commit date.

**Constraint:** neither addition may change tier count, tier ordering, or any other tier's existing wording. `AGENTS.md`'s overall structure (7 sections, per its own governing specification) is unchanged — these are additions within existing §2 content, not new sections.

---

## 5. `BLUEPRINT_GAPS.md` reconciliation (`[Decision 3]`, `[PhaseB §4.2]`/`[§4.4]`/`[§4.9]`/`[§11]`)

### 5.1 Remove the duplicate DECISION-B/C block

`BLUEPRINT_GAPS.md` §5 contains a corrected DECISION-C entry followed later in the same section by a stale, pre-correction copy of DECISION-B and DECISION-C (`[PhaseB §4.4]`, itself citing `2026-09-13-blueprint-closure-current-state-reconciliation.md` §5.9 as the original finder). **Binding action:** delete the second, stale copy; retain the first, corrected copy exactly as-is. This is mechanical (§3, rule 4 — fully redundant, zero unique remainder) — no new content is authored.

### 5.2 Two new gap entries

Add exactly two new entries to `BLUEPRINT_GAPS.md` §3 (Gap registry), following that document's own existing per-gap schema (Status / Type / Blocking level / Current evidence / Expected state / Why it matters / What it blocks / Dependencies / Source-evidence, per `BLUEPRINT_GAPS.md` §1's own field list):

1. **Vue Tooltip visibility bug** (`[PhaseB §4.2]`). Status: `MISSING` (a real behavioral gap, not merely undocumented). Cites `packages/vue/src/tooltip/tooltip.ts`'s `showTooltip()` never applying a `u-tooltip-{position}` modifier class, and `packages/uix-styles/src/tooltip/index.ts`'s base rule leaving `display: none` unset. Numbering: the Implementation Plan assigns the next available `GAP-0NN` number at implementation time (this specification does not pin a number, since other gap-numbering work may land first) — recommend, not require, placing it near GAP-006 in the document's reading order given the topical (Tooltip) relationship, per `[PhaseB §11]`'s own suggestion.
2. **Paginator Task 15 blocker** (`[PhaseB §4.9]`). Status: `DEFERRED` (blocked, not missing — the block condition is named and real). Cites `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md` Task 15's own "BLOCKED pending an Ultimate Select-equivalent component" marker, cross-referenced against `[PhaseA §3]`/`[§4]`'s confirmation that no Select component exists in any of the three frameworks yet.

**Binding constraint:** both entries are added using only the evidence already stated in the cited Phase A/B report sections and the plan file itself — no new research is performed as part of this specification or its Implementation Plan; if the Implementation Plan's author finds the existing evidence insufficient to write an accurate entry, that is an escalation back to research, not a license to investigate further under the documentation-reconciliation banner (`[Decision 3]`'s explicit "must not introduce new architectural decisions under the guise of documentation cleanup" — extended here to mean "must not introduce new *research* under that guise" either, by the same reasoning).

### 5.3 SSR-ID cross-reference note

Add the cross-reference note the already-approved `2026-09-12-vue-dialog-id-scope-amendment` plan's own Task 1 specified but never executed (`[PhaseB §4.1]`). **Binding action:** in `docs/superpowers/specs/2026-09-12-ssr-safe-component-id-generation-design.md`, immediately following the "No sixth instance exists" claim (line 25 per `[PhaseB §4.1]`'s citation), add a short note stating a sixth instance was later found in `packages/vue/src/dialog/Dialog.vue` and fixed via the `2026-09-12-vue-dialog-id-scope-amendment` spec/plan, with a pointer to both. Add a symmetrical pointer note to `docs/architecture/research/2026-09-12-vue-dialog-id-counter-sixth-instance-finding.md` at the location of its own original finding. **Do not alter or delete the original "No sixth instance exists" sentence itself** — the note is additive (preserves the historical record of what was believed at the time, per this specification's general principle of not rewriting history, only correcting it forward) — matches §3's rule 1 exactly (fix the specific error via an additive correction, not a deletion). *(File name corrected by the "Amendment Note (Final Review pass, 2026-09-16)" above — originally mis-cited as `2026-09-12-track-e-ssr-id-nondeterminism-finding.md`, which contains no mention of the sixth-instance finding.)*

---

## 6. Spec status-field reconciliation (`[Decision 4]`, `[PhaseB §4.3]`)

**Scope:** the 19 specs `[PhaseB §4.3]` names as still reading "Draft for review"/"Draft for Spec Review" despite `ROADMAP.md` marking their phase Complete with shipped code. The Implementation Plan enumerates the exact 19 file paths from `[PhaseB §4.3]`'s own named set (Phase 0, Phase 1, uix-data foundation, Paginator, Scroller, Table, Phase 6, Phase 7, Phase 9, all 6 Phase 10 track specs, SSR-safe-ID-generation, vue-dialog-id-scope-amendment, blueprint-completion) as an explicit checklist — this specification does not re-derive that list, it is binding as already stated in the cited report section.

**Binding action per spec:** change only the `Status:` field's value, matching the pattern already used by the 6 already-updated specs (`[PhaseB §4.3]`'s own comparison row) — e.g. a value naming the spec approved/implemented and pointing to the relevant `ROADMAP.md` phase row. **No other content in any of the 19 specs is altered.** This is mechanical per §3 rule 2 (narrow mechanical staleness — field correction, not a rewrite) — no re-reading or reinterpretation of the spec's substantive content is authorized, beyond the minimal reading necessary to verify the `Status:` field's target value is correct (§6's own next paragraph specifies this verification step; it is a check against `ROADMAP.md`/repository evidence, not a re-review of the spec's own prose).

**Verification method the Plan must use:** for each spec, confirm via direct `ROADMAP.md` read (not assumption) that the corresponding phase/workstream is actually marked Complete before changing the status field — this specification requires the Plan to re-verify `[PhaseB §4.3]`'s claim against current `ROADMAP.md` content at implementation time, since `ROADMAP.md` could theoretically have changed between this specification's writing and the Plan's execution (low likelihood, but the check is cheap and matches this repository's own "re-verify current-state tracking docs before relying on them" convention, `AGENTS.md` §2 tier 5).

---

## 7. Plan classification (`[Decision 7]`)

**Scope:** all 26 files in `docs/superpowers/plans/`.

**Binding method:** apply §3's classification procedure to each plan individually. Per `[Decision 7]`'s explicit instruction, the default outcome for a plan whose implementation is complete and closed is **retain as historical** — not "update to match current state." A plan is only classified **retain/update** if it still contains a genuinely open, unexecuted, currently-relevant item (the Implementation Plan must check for this per-plan, not assume none exist — `2026-09-02-paginator-component-implementation.md`'s own Task 15 is a confirmed example of a plan carrying a still-live item, per §5.2 item 2 above, and is itself evidence this check has real findings to make, not a formality).

**Binding constraint on "update":** even where an update is warranted, it is scoped to the specific stale/incomplete item found (e.g., Paginator's Task 15 status, if the Plan judges the plan document itself — not just the gap registry — should also reflect the block's current status) — never a blanket "check every box to match today." This directly operationalizes `[Decision 7]`'s closing line: "the goal is not to make every historical plan look like a current project dashboard."

**Consolidate/delete:** the Implementation Plan may propose consolidation or deletion for any plan found to have zero remaining unique value beyond what a current-state tracking document already states — but per §3's method, this requires the Plan to actually check for unique remainder, not assume genericness from a plan's age alone. `[PhaseB §8]`'s own existing assessment ("All 26 implementation plans — genuine execution records... No changes recommended") is the starting presumption per document, rebuttable only with a specific finding, not overridden wholesale by this specification.

---

## 8. README corrections (`[PhaseB §4.6]`/`[§4.7]`)

### 8.1 Framework-package component counts

`packages/ng/README.md`, `packages/react/README.md`, `packages/vue/README.md` each currently state "Button, Checkbox, Dialog, Menu, Tooltip" (5 components). **Binding action:** replace with a durable pointer to `docs/architecture/COMPONENT_INVENTORY.md` (Angular) and the appropriate current-inventory source for React/Vue (`docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` until its React/Vue findings are folded into a committed document per §10, at which point the pointer follows the finding) — **not** a restated numeric count. Corrects a prior drafting error: an earlier revision of this section left restating the count (14/8/9, or 18 for Angular's fuller foundation-tier accounting) as an equally-acceptable alternative to a pointer; a restated count would itself go stale again the moment Phase C adds another component, which is exactly the failure mode this specification exists to stop. The pointer-only approach is now the sole binding action — no numeric count of any kind is written into any of the three READMEs. **No other README content is altered.**

### 8.2 `ai`/`mcp` README status sections

`packages/ai/README.md` and `packages/mcp/README.md` each have an empty "## Status" section (`[PhaseB §4.7]`). **Binding action:** populate each with a short, accurate statement of current shipped state (per `ROADMAP.md` footnotes 5 and 4 respectively) — not a restated phase-completion narrative, a pointer-preferring short statement matching the same durability principle as §8.1.

---

## 9. Research-document reconciliation (`[Decision 2]`, `[PhaseB §4.5]`/`§9 Choice A/B`)

**Scope:** exactly the 6-document 2026-09-12/13 cluster (`post-phase-10-blueprint-reconciliation-audit`, `ai-knowledge-architecture-assessment`, `project-reality-and-ai-operating-model-audit`, `ai-orientation-design`, `next-work-prioritization-audit`, `blueprint-closure-current-state-reconciliation`) — no other research document is in this specification's implementation scope (per §2.1). If the Implementation Plan's own application of §3's method surfaces a duplicate/superseded candidate outside this list, that is a finding to record and escalate, not a document to modify under this specification.

**Binding method (implements `[Decision 2]`'s explicit rejection of "index alone"):**

1. For each of the 6 documents, apply §3's procedure. `[PhaseB §4.5]` already establishes `blueprint-closure-current-state-reconciliation.md` (2026-09-13) as the chain's latest/current synthesis for the conclusions it covers — not an authoritative document in the sense of `AGENTS.md` §2's hierarchy (research remains tier 6 throughout, per `[Decision 1]`; this document is simply the most recent point-in-time snapshot among the six, and its conclusions still require the same re-confirmation-against-real-evidence any tier-6 document requires before being relied upon). The Implementation Plan does not need to re-derive which document is most recent, only apply that ordering.
2. For the 5 earlier documents in the chain: where a document's findings are fully and accurately carried forward by the 2026-09-13 document, mark it superseded-for-conclusions **in place** (a short header note, not a rewrite of its body) and/or consolidate genuinely unique remaining content into the 2026-09-13 document or another surviving target — per `[Decision 2]`'s explicit instruction, retain historical documents with meaningful unique evidence, delete those with none.
3. `next-work-prioritization-audit.md` specifically (`[PhaseB §9 Choice B]`): the Implementation Plan resolves this as part of the same pass — mark superseded (its core question has a later, different answer: the Phase A/B effort itself) or retain as ordinary historical research, per whichever §3 outcome its actual content supports once read in full for this purpose.
4. **An index-only fix (`docs/architecture/research/README.md` alone, already committed) does not satisfy this section.** `[Decision 2]`'s final bullet is explicit and binding: "Do not rely on an index alone to resolve conflicting research." The Implementation Plan must show, for each of the 6 (plus `next-work-prioritization-audit.md`), an actual per-document disposition of update/consolidate/mark-historical/delete — not merely a pointer added elsewhere.

**Deletion authorization:** this specification authorizes deletion of a research document only where the Implementation Plan documents, per document, that zero unique evidentiary remainder exists (§3 rule 4) — a blanket "the cluster is old, delete most of it" is not authorized; each deletion candidate needs its own one-line justification in the Plan or its closeout record.

---

## 10. Phase A/B report closeout reassessment (`[Decision 6]`)

**Not performed by this specification's own Implementation Plan as a default task** — `[Decision 6]` is explicit that the reassessment happens "at Phase B closeout," which this specification treats as the final task of the eventual Implementation Plan (after §4–§9's other tasks are complete), not a parallel or early task.

**Binding criteria at that point, applying §3's method to `2026-09-16-phase-a-prime-migration-inventory.md`, `2026-09-16-phase-b-knowledge-reconciliation.md`, and `docs/architecture/research/README.md`:**

(This specification document itself — `2026-09-16-phase-b-knowledge-reconciliation-design.md` — is **not** part of this reassessment. It follows the ordinary specification lifecycle defined by `AGENTS.md` §3's gate sequence, not the Phase A/B report retention decision `[Decision 6]` governs; corrects a prior drafting error that included it here.)

- **Retain** if either report still contains findings not yet folded into whatever authoritative or current-state document is the appropriate target for that finding (e.g., a component-inventory document for Phase A findings, a gap/decision registry or orientation document for Phase B findings — the specific target document is determined at closeout time by which document §4–§9's tasks actually updated, not fixed in advance by this specification).
- **Mark historical/superseded** for whichever parts *are* successfully folded into their appropriate target document by the time of closeout — the report does not need to be deleted merely because its findings were acted on; it remains valid evidence of *how* those findings were established (matching this specification's own treatment of the SSR-ID research chain, §9).
- **No Tier 0 promotion** regardless of outcome (`[Decision 1]`, absolute).

This section is intentionally a criterion, not a verdict — the actual disposition depends on how much of §4–§9 the Implementation Plan actually completes, which is not yet known at specification time.

---

## 11. Open questions for Spec Review

1. **Exact wording** for the two `AGENTS.md` additions (§4.1/§4.2) — this specification states binding *content*, leaves exact prose to the Implementation Plan/implementer, consistent with this repository's own established spec/plan division of labor (see the `AGENTS.md` orientation specification's own precedent, which used the same content-not-prose-binding approach).
2. **Gap numbering** for the two new `BLUEPRINT_GAPS.md` entries (§5.2) is deferred to implementation time rather than pinned here, to avoid a stale number if other gap-numbering work lands first — flagged for Spec Review to confirm this deferral is acceptable rather than requiring a reserved number now.
3. **Whether an explicit ADR should be added** for React's `componentbase`/passthrough exclusion (`[PhaseA §12]`, item 4) is **not** addressed by this specification — it is a documentation-hygiene-flavored item but touches `DECISIONS.md`, which is explicitly excluded from this specification's scope (§2.2). Flagged for Spec Review to confirm this exclusion is correct, or to explicitly fold it in via amendment if the human intends `DECISIONS.md` additions (as opposed to edits) to be in scope.
4. **The cross-framework naming-reconciliation question** (`[PhaseA §12]`, item 5 — Popover/OverlayPanel, Drawer/Sidebar, etc.) is explicitly **not** addressed by this specification, per `[Decision 3]`'s "must not introduce new architectural decisions" boundary — this is a product-API-design decision, not documentation reconciliation, and remains fully open for a future, separate decision gate.
5. **Deprecated-alias verification** (`[PhaseA §12]`, item 6 — the 8 suspected-deprecated PrimeVue directories) is **not** addressed by this specification — it requires reading real Prime source, which is Phase A/C-flavored research, not Phase B documentation reconciliation, and is explicitly out of scope per §2.2's "no new research under the documentation-cleanup banner" principle (§5.2's binding constraint, generalized).

---

## Specification Gate

**SPECIFICATION — APPROVED**

All 7 requested Spec Review corrections (see the Amendment Note above) were applied, then the human approved this specification (2026-09-16). This approval authorizes writing an Implementation Plan; it does not itself authorize implementation. Plan Review remains a separate, required gate before any file named in §2.1 is actually touched.
