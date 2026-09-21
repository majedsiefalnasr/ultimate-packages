# Phase C Migration Roadmap

**Document type:** Phase C planning/current-state guidance artifact. Not a Spec, not an Implementation Plan, not an authorization to implement, not a new authority tier. This document does not modify `AGENTS.md`'s existing 8-tier source-of-truth hierarchy, does not add a Tier 0, and remains a `docs/architecture/research/` planning artifact — the same category as the documents it draws from.

**Repository:** `ultimate`
**Compiled:** 2026-09-17, on `main`, following the completed human Brainstorming/Decision stage for the Phase C roadmap.
**Status of the decisions captured here:** the 5 decisions in this document (structure, framework scope, future-batch planning, Unverified policy, roadmap depth) were made by the human reviewer in the Brainstorming/Decision stage that preceded this artifact. This document records and operationalizes those decisions — it does not re-derive, re-litigate, or second-guess them.

---

## 1. Purpose and scope

This roadmap establishes the **durable rules** by which Ultimate's Phase C migration (Prime → Ultimate, across Angular/React/Vue) is divided into batches, so that opening a new batch does not require re-deciding *how* batches are formed each time. It is the fourth layer of Phase C's analysis stack:

```
Phase A (Migration Inventory)
  → Phase B (Knowledge Reconciliation)
    → Phase C:
        Migration Operating Context (principles)
          → Migration Dependency Map (per-target classification)
            → Cross-Framework Functional Parity Matrix (canonical capability grouping)
              → Migration Batch Selection / Planning Analysis (eligibility model + candidate evidence)
                → THIS ROADMAP (durable batch-formation rules + Batch 1 scope)
                  → [future, per-batch] Brainstorming/Decision → Spec → Spec Review
                    → Implementation Plan → Plan Review → Implementation
                      → Verification → Final Review/Closeout
                        → next batch, per this roadmap's rules
```

This roadmap does **not** replace any Superpowers gate in that chain. A roadmap entry — including Batch 1's scope, defined in §10 — is **planning intent, not implementation authorization**. No component may be implemented on the strength of this document alone; each batch still requires its own Brainstorming/Decision, Specification, Spec Review, Implementation Plan, and Plan Review before any code is written.

This roadmap is **high-level by design** (per the approved roadmap-depth decision): it documents the operating model, batch-formation rules, and Batch 1's scope, but does not pre-assign Batch 2, 3, 4, or beyond. See §11.

---

## 2. Governing principles

Restated from the Migration Operating Context and reaffirmed as binding on every future batch this roadmap authorizes the formation of:

1. **Prime is the reference ecosystem, not the target architecture.** Prime's directory layout, internal decomposition, and per-framework file structure inform what capabilities exist and how they behave — they do not dictate what Ultimate's own package structure must look like.
2. **Migration is systematic across Angular, React, and Vue** — the goal is cross-framework functional parity (Parity Matrix §0's governing interpretation), not merely mechanical reproduction of Prime's own per-framework directory count.
3. **The canonical capability is the functional unit of this roadmap** — never a Prime source-directory count, never an Ultimate-component count. A canonical capability may be realized by one file in one framework and a multi-directory composed family in another; both count as one roadmap unit (Parity Matrix §1, §5).
4. **Implementations remain framework-native.** No batch, present or future, may require or imply that Angular/React/Vue share an implementation, API shape, or internal file structure. Each framework's realization of a capability follows that framework's own already-established Option-B pattern (ADR-018/024/032).
5. **Existing Ultimate architecture takes precedence over mechanically reproducing Prime's implementation structure.** Where Ultimate has already established a pattern (the 4-tier Angular base-class chain, React's fully-controlled-props model, Vue's 3-tier chain), new work follows it; it is not re-litigated per capability.
6. **Proof-by-exception, not proof-by-default.** A new feasibility study is not created merely because a capability is being migrated. Feasibility/architecture investigation is reserved for genuine exceptions meeting the Operating Context's own §5 criteria — and only the exceptions already identified by the Dependency Map (Chart/Editor, Tree-family, OrderList/PickList/DataView) currently meet that bar. This roadmap creates no new exceptions and resolves none of the existing ones.
7. **Dependencies are respected explicitly, never assumed.** A dependency is only satisfied by an explicit, stated fact (a prerequisite is already built, or the roadmap/Batch Spec states an explicit intra-batch ordering) — never inferred from a target's own "Ready" classification alone.
8. **Architectural exceptions remain separately gated.** Chart/Editor (DECISION-B), Tree/TreeTable/TreeSelect (DECISION-D), and OrderList/PickList/DataView (DECISION-C's open remainder) are never silently absorbed into an ordinary batch, regardless of batch-formation rule or framework readiness.
9. **`Unverified` is not promoted to `Ready` without new evidence.** No batch may include a capability whose Parity-Matrix state is `Unverified / mapping unresolved` for a given framework, for that framework, until that status is independently resolved by new evidence (§6).
10. **Naming differences are not blockers unless a human decision makes them one.** ToggleSwitch, Textarea, Select, DatePicker, Popover, and Drawer are eligible for batch inclusion under their existing framework-native names; the open cross-framework naming-standardization question (Phase A §12 question 5) is a separate, still-undecided product question that does not gate their migration.
11. **No subjective ranking.** Batch formation never uses "best first," business-value scoring, or arbitrary effort/complexity ranking. Batch membership is determined by the deterministic rules in §3–§6, applied to current evidence.
12. **This roadmap is planning/current-state guidance, not implementation authorization.** See §1.

---

## 3. Batch formation model

**Approved structure (Decision 1): a hybrid policy — dependency correctness governs sequencing; Functional Family is the primary human-readable organizing lens; framework parity/readiness is a batch-membership input.** This is a single, structured policy applied consistently to every batch — not permission to choose a different sequencing rule per batch.

### 3.1 The three layers of the rule, applied together

1. **Dependency correctness (governs what *can* be sequenced).** A capability's eligibility for any batch is determined first by the Dependency Map's deterministic eligibility model (Batch Selection Analysis §B.1): *Eligible now*, *Eligible only after a prerequisite*, *Blocked pending architectural decision*, *Excluded/deferred (ordinary)*, or *Not yet eligible — evidence insufficient*. Nothing is scheduled into a batch ahead of a prerequisite it has not yet satisfied, except where the batch (or its eventual Spec) states an explicit intra-batch ordering (§4).
2. **Functional Family (governs how batches are organized and presented).** Within the pool of dependency-eligible capabilities, batches are composed and named around the Parity Matrix's own family groupings (§1.1–§1.7: Foundation/Primitive, Form, Overlay, Navigation, Data, Panel/Layout/Display/Feedback, Visualization/Rich-content) — see §8. This is the lens a human reviewer uses to understand "what is this batch about," not a hard partition that forbids a batch from touching more than one family when dependency correctness requires it (e.g. a small foundation-infrastructure prefix ahead of a family's bulk, per §3.2).
3. **Framework parity/readiness (a batch-membership input, not a gate).** Per the capability-scoped framework model (§5), a capability's per-framework readiness state informs *which frameworks* a given batch realizes that capability in — it does not determine *whether* the capability enters the batch at all. A capability ready in 2 of 3 frameworks enters the batch for those 2 frameworks, with the 3rd framework's realization explicitly tracked as a deferred, named item within the same batch entry, not silently dropped and not forcing the whole capability to wait for 3-framework simultaneity.

### 3.2 Standing structural note: infrastructure prerequisites precede their dependents

Where a family's members depend on currently-unbuilt, *ordinary* (non-architectural-exception) shared infrastructure — per the Dependency Map's Layer 1 finding, this is currently limited to Vue's Badge and Vue's ConfirmationService/DialogService/ToastService-equivalent tier — that infrastructure is sequenced ahead of its dependents, either as a short prefix within the same batch (with an explicit intra-batch ordering stated) or as its own earlier batch. This is not a separate "sixth" organizing principle; it is dependency correctness (§3.1.1) applied to the specific, small, already-identified case of shared ordinary infrastructure.

### 3.3 What this model does not do

- It does not rank families against each other ("Form before Overlay because Form is more valuable") — family choice for a given batch is a scope decision made at that batch's own Brainstorming/Decision stage (§9), constrained only by dependency correctness.
- It does not require a batch to contain an entire family before moving to the next — a family may be split across multiple batches if its size or internal dependency structure warrants it; that split is itself a decision made at batch-opening time (§9), not fixed by this roadmap.
- It does not require uniform batch size — batch size is a consequence of applying the rule to current evidence, not an input to the rule.

---

## 4. Dependency and prerequisite rules

Restated as binding roadmap rules, carried forward from the Dependency Map and Batch Selection Analysis without modification:

1. **A dependent capability may share a batch with its prerequisite only when the roadmap or the batch's own Specification explicitly states the intra-batch ordering.** This document states one such ordering for Batch 1 (§10: Avatar before AvatarGroup). No other ordering is assumed anywhere in this roadmap.
2. **A capability whose prerequisite is itself an architectural exception is permanently excluded from ordinary batch sequencing**, regardless of the dependent's own classification. TreeSelect and TreeTable (all 3 frameworks) are excluded from every batch this roadmap could form, because Tree is a protected architectural exception (DECISION-D) — not because TreeSelect/TreeTable are themselves exceptions.
3. **A capability whose prerequisite is unbuilt-but-ordinary infrastructure (not an exception) becomes eligible once that infrastructure is built**, per §3.2. Vue's OverlayBadge and Vue's ConfirmDialog/ConfirmPopup/DynamicDialog/Toast family become batch-eligible for Vue once Vue's Badge and service tier (respectively) are built.
4. **Soft, within-family internal orderings** (Vue's Tabs/Stepper/Accordion/Splitter container-first sequencing, already documented in Dependency Map §C) are implementation-sequencing notes attached to a single batch entry for that capability — never a reason to split one capability across two batches, and never a reason to exclude a capability from a batch on complexity grounds alone (per Principle 6 — implementation-sequencing complexity is not an architectural exception).
5. **A batch's own detailed internal build order is not this roadmap's job to state** — that belongs to the batch's own Specification and Implementation Plan, once opened.

---

## 5. Framework-scope model

**Approved model (Decision 2): hybrid / capability-scoped.** The canonical capability — not the framework — is the unit of this roadmap. A single roadmap/batch entry names one capability; that entry carries an independent Angular/React/Vue state, drawn directly from the Parity Matrix's §2 per-framework coverage table.

### 5.1 What this means in practice

- **A batch does not require all three frameworks to be ready before a capability enters it.** If a capability is `Eligible now` in React and Vue but the Angular column is `Unverified / mapping unresolved`, the capability enters the batch for React and Vue; Angular's realization is explicitly listed as deferred within the same entry, pending resolution of the Unverified status (§6) — it is not silently dropped from the roadmap, and it does not block React/Vue from proceeding.
- **Framework-specific dependencies and blockers are preserved per framework**, not averaged or collapsed. A capability blocked in Vue only (e.g. ConfirmDialog, blocked on Vue's unbuilt service tier) can still be `Eligible now` for Angular and React in the same batch — the blocker is recorded against Vue specifically, per §4.3.
- **No batch entry may imply or require an identical implementation shape across the frameworks it spans.** Per Principle 4, each framework's realization is independently designed within that framework's own established architecture.
- **Rejected alternative (framework-scoped roadmap):** a structure with separate "Angular Batch 1," "React Batch 1," "Vue Batch 1" tracks was considered during the Brainstorming/Decision stage and explicitly not adopted — the capability-scoped model above is the approved policy.

---

## 6. Unverified handling

**Approved policy (Decision 4): hybrid.** A Parity-Matrix `Unverified / mapping unresolved` capability, for a given framework, does **not** automatically enter an ordinary migration batch for that framework. It remains excluded from batch membership (for that framework) until new evidence resolves the status — the passage of time, a batch being opened, or this roadmap's own existence does not itself constitute new evidence.

### 6.1 What can resolve an Unverified status

Per the Batch Selection Analysis §E/§I item 5 and the Parity Matrix §3.3(b)/§3.6, the currently-Unverified pool (Form-family naming-enumeration gaps, several Overlay/Data/Panel items, the Messages/Message relationship, and others named in those two documents) remains Unverified because Phase A's own per-framework enumeration is independently known to be incomplete, and no reverse-search of each framework's real Prime source for alternate names has been performed. Resolving these requires a **separately scoped Parity Reconciliation pass** — not performed by this roadmap, not performed by any batch's ordinary implementation work, and not performed as part of this roadmap-creation task.

### 6.2 What happens once a status resolves

If a future Parity Reconciliation pass establishes that a previously-Unverified capability is, for a given framework, either genuinely `Ready` or genuinely functionally absent (`Not applicable`, per the Parity Matrix's tier-a evidentiary bar), that capability becomes eligible for inclusion in a **future** batch's Brainstorming/Decision stage, applying the same rules in §3–§5. This roadmap does not pre-authorize which future batch such a capability would join — that is determined when the relevant batch is opened (§9), using whatever evidence exists at that time.

### 6.3 This roadmap does not commission a reconciliation pass

Per the approved decision, this document names the reconciliation-pass option as a standing possibility (consistent with Batch Selection Analysis §I item 5) but does not schedule, scope, or commission it. Whether and when to commission one is a separate future decision.

---

## 7. Architectural exceptions and deferred work

The following remain excluded from every batch this roadmap forms or could form. React/Vue OrganizationChart is a resolved exception (2026-09-21, §12.4) — no longer listed here since it is not excluded by DECISION-D; it remains a separate open question whether it is otherwise migration-eligible, unaddressed by this table.

| Exception | Governing decision | Status |
|---|---|---|
| Chart, Editor (all 3 frameworks) | DECISION-B — external runtime dependency approval process, not yet created | Blocked pending a human decision on DECISION-B's approval process itself; not addressed by this roadmap |
| Tree (all 3 frameworks) | DECISION-D — protected, explicitly "do-not-reopen," per its own structural-incompatibility finding (`BLUEPRINT_GAPS.md`; not ADR-043, which is the unrelated `@ultimate/uix-data` decision — reference corrected by the Parity Reconciliation pass, see §12.2) | Not scheduled for resolution by any part of this Phase C track |
| TreeTable, TreeSelect (all 3 frameworks) | Depend on Tree (hard prerequisite) | Blocked transitively, inherits Tree's DECISION-D status |
| OrderList, PickList, DataView (all 3 frameworks) | DECISION-C's open remainder — whether Table's proven composition pattern generalizes to these | Blocked pending a human decision on DECISION-C's remaining scope |
| Angular `config` (full surface beyond ADR-018's scoped minimum) | Soft architectural exception — would materially change cross-cutting config architecture if built past the current scoped minimum | Deferred; no current pressure identified to resolve it |
| OrganizationChart, Angular only | DECISION-D — confirmed genuine Tree-mechanism dependency (real PrimeNG imports `TreeNode`, mutates `node.expanded` in place); scope clarification human-approved 2026-09-21, see §12.4 | Excluded, same status as Tree itself |

DECISION-B, DECISION-C, DECISION-D, and DECISION-E remain fully intact and are not reopened, reversed, or narrowed by this roadmap. DECISION-D's protection of Tree/TreeTable/TreeSelect, and of Angular OrganizationChart specifically, is unchanged. The one exception is OrganizationChart's own cross-framework scope, which received a human-approved **clarification** (§12.4) — a determination of which frameworks DECISION-D's already-existing protection actually applies to, on the evidence, not a change to what that protection means or how much it protects. These items are named here so that a future batch's Brainstorming/Decision stage does not need to rediscover them — they are a **permanently-tracked, non-numbered gated track**, revisited only if and when their respective decision resolves, outside this roadmap's own batch-numbering sequence.

---

## 8. Functional Family role

Functional Family (Parity Matrix §1.1–§1.7: Foundation/Primitive, Form, Overlay, Navigation, Data, Panel/Layout/Display/Feedback, Visualization/Rich-content) is this roadmap's **primary human-readable organizing lens**, per Decision 1. Its role:

- **Naming and scoping batches for human legibility** — a batch is described by the family (or families) it primarily addresses, so "what is Batch 1 about" has a recognizable answer ("Form-family capabilities, plus a small Vue-infrastructure prefix") rather than only a dependency-graph description.
- **A starting scope filter, not a hard partition** — when a future batch is opened (§9), its Brainstorming/Decision stage uses Functional Family as the first cut to bound the candidate pool, then applies dependency correctness (§3–§4) and framework-scope rules (§5–§6) to determine actual membership within that scope.
- **Not a ranking mechanism** — no family is scheduled "because it matters more"; family choice for a given batch is a scope decision made at that batch's own opening, constrained by which families still have unaddressed, non-excluded, dependency-eligible capabilities remaining.
- **Data and Visualization/Rich-content are structurally different** — per the Dependency Map, the majority of the Data family (Tree, TreeTable, OrderList, PickList, DataView) and the entirety of Visualization/Rich-content (Chart, Editor) are architectural exceptions. These families will not produce an ordinary batch under the current evidence until their governing decisions resolve; this is a factual consequence of family composition, not a policy choice by this roadmap.

---

## 9. How a future batch is opened and decided

**Approved policy (Decision 3): structure, not fixed membership.** This roadmap defines the durable *rules*; it does not pre-populate Batch 2, 3, 4, or beyond. Opening any batch after Batch 1 follows this fixed sequence:

1. **Batch N Brainstorming/Decision** — using this roadmap's rules (§3–§6) applied to the *then-current* Dependency Map, Parity Matrix, and repository state (which may have changed since this roadmap was written — a prior batch's own implementation, or a commissioned Parity Reconciliation pass, could shift what's eligible). This stage determines Batch N's actual candidate composition, using the same deterministic eligibility model as Batch 1's own formation (§10), not a new ad hoc method.
2. **Batch N Specification** — states Batch N's exact membership (per capability, per framework), any intra-batch dependency ordering, and the completion/proof boundary for that batch specifically.
3. **Spec Review** — per the repository's existing gated workflow.
4. **Batch N Implementation Plan** — per the repository's existing gated workflow.
5. **Plan Review** — per the repository's existing gated workflow.
6. **Implementation** — via the repository's existing implementation workflow (e.g. `subagent-driven-development` or equivalent), matching the bar every prior Built component met (real, tested, source-verified).
7. **Verification** — confirming no regression to any already-Built component or foundation tier.
8. **Final Review/Closeout** — including the documentation update this roadmap requires of every batch: marking each newly-built capability's Prime-directory row(s) as built in `COMPONENT_INVENTORY.md` (Angular) and the equivalent current-state tracking mechanism for React/Vue, per the Operating Context's own §9 provision.
9. **Next batch** — repeats from step 1, applying this same roadmap's rules to the evidence current at that time.

This roadmap does not itself perform step 1 for any batch beyond Batch 1 (§10). It does not name Batch 2's capabilities, size, or family focus — doing so would turn this roadmap into a static master implementation plan, which the approved roadmap-depth decision explicitly forbids.

---

## 10. Batch 1

Batch 1's scope is stated here because the Brainstorming/Decision stage that produced the 5 approved decisions also reached a specific conclusion about Batch 1's composition, consistent with those decisions and with §3's dependency-correctness-first, family-organized, parity-input model. This is the one piece of "future batch content" this roadmap commits to, precisely because it is Batch 1 — the batch this roadmap itself opens, not a future one deferred to §9's process.

### 10.1 Structure

**Batch 1's scope is all canonical capabilities currently eligible for ordinary migration under this roadmap's rules — it is not limited to any single Functional Family.** Per §3.2, Batch 1 consists of a small **infrastructure prefix** (dependency-correctness requirement) followed by the full **dependency-eligible, non-exception capability set**, evaluated independently per framework per §5, spanning every family that currently has eligible members: Form, Overlay, Navigation, and Panel/Layout/Display/Feedback (Data and Visualization/Rich-content currently contribute no eligible members, per §8, since their remaining capabilities are architectural exceptions). Functional Family remains the **organizational/presentation lens** through which Batch 1 is described and grouped (§8) — it is not a membership boundary: no capability is excluded from Batch 1 because of which family it belongs to, only because it fails dependency-eligibility (§3.1.1), is an architectural exception (§7), or is `Unverified` for the framework in question (§6).

### 10.2 Infrastructure prefix (sequenced first, explicit intra-batch ordering)

- **Vue Badge** — currently-unbuilt Vue infrastructure; once built, unblocks Vue's own realization of OverlayBadge specifically.
- **Vue's ConfirmationService/DialogService/ToastService-equivalent tier** — currently-unbuilt Vue infrastructure; once built, unblocks Vue's own realization of ConfirmDialog, ConfirmPopup, and Toast specifically (DynamicDialog's Vue realization is also blocked on this same tier, but DynamicDialog carries a separate, independent React-side Unverified status — see §10.3's per-framework table below, which is not resolved by this prefix).

These are named because Angular and React have zero remaining Layer-1 infrastructure gaps (Dependency Map §B) — this prefix addresses Vue's realization of these capabilities specifically. It does not gate Angular's or React's own realizations of the same capabilities, which are independently eligible per §10.3 below.

### 10.3 Capability set

Every canonical capability meeting all of the following, applying §3's rule set to the Dependency Map and Parity Matrix as they currently stand, evaluated **independently per framework** per the capability-scoped model (§5):

- Dependency-eligible ("Eligible now," or "Eligible only after a prerequisite" where the prerequisite is itself in this same batch with an explicit ordering stated);
- Not an architectural exception (§7);
- Not `Unverified` for the framework(s) being included, per §6 (a capability may still enter the batch for the frameworks where it *is* eligible, per §5).

This is the full set meeting those criteria across every family with eligible members — not a Form-only or Form-led subset. Per the capability-scoped model (§5), it includes: the Form family in full (including the naming-variant capabilities ToggleSwitch, Textarea, Select, DatePicker under their existing framework-native names, per Principle 10), the Overlay-family capabilities not blocked by the infrastructure prefix (including Popover and Drawer under their existing framework-native names, plus the mixed-eligibility items detailed in the table below), the Navigation family in full (including the decomposed families Tabs, Stepper, Accordion, Splitter — included per §4 item 4, their internal soft-ordering being an implementation-sequencing note, not a deferral reason), and the eligible portion of Panel/Layout/Display/Feedback. Functional Family groups this list for presentation (§8); it does not bound it.

**Explicit per-framework disposition — mixed-eligibility Overlay capabilities.** Per §5's model, a capability's Batch 1 inclusion is decided independently per framework; a blocked or Unverified framework does not exclude the frameworks where the capability is eligible, and the capability remains one roadmap unit. Applying the current Parity Matrix (§2.3) to the 5 capabilities the infrastructure prefix (§10.2) concerns:

| Capability | Angular | React | Vue | Batch 1 disposition |
|---|---|---|---|---|
| ConfirmDialog | Migration target — ready | Migration target — ready | Blocked (ordinary), unbuilt service tier | **Included for Angular and React.** Vue's realization is deferred, pending the §10.2 infrastructure prefix. |
| ConfirmPopup | Migration target — ready | Migration target — ready | Blocked (ordinary), unbuilt service tier | **Included for Angular and React.** Vue's realization is deferred, pending the §10.2 infrastructure prefix. |
| Toast | Migration target — ready | Migration target — ready | Blocked (ordinary), unbuilt service tier | **Included for Angular and React.** Vue's realization is deferred, pending the §10.2 infrastructure prefix. |
| DynamicDialog | Migration target — ready | Unverified / mapping unresolved (no matching React directory name found; not established as functionally absent) | Blocked (ordinary), unbuilt service tier | **Included for Angular only.** React's realization is deferred per §6 (Unverified, not promoted to Ready). Vue's realization is deferred, pending the §10.2 infrastructure prefix. |
| OverlayBadge | Migration target — ready (Badge already built in Angular) | Unverified / mapping unresolved (no matching React directory name found; not established as functionally absent) | Blocked (ordinary), unbuilt Badge | **Included for Angular only.** React's realization is deferred per §6 (Unverified, not promoted to Ready). Vue's realization is deferred, pending the §10.2 infrastructure prefix. |

None of the deferred framework realizations above are dropped from the roadmap — each remains attached to its capability's single roadmap unit, to be picked up once its specific blocker (Vue's infrastructure prefix, or a future Parity Reconciliation pass resolving React's Unverified status, per §6) clears, at whichever batch is open when that happens (§9).

**Named intra-batch ordering:** Avatar before AvatarGroup (Angular only — AvatarGroup's dependency on Avatar is soft and same-batch; React/Vue's AvatarGroup carries no such prerequisite).

**Named exclusions, unconditional:** OrganizationChart (§7); every architectural exception (§7); every capability, per framework, currently `Unverified` in the Parity Matrix (§6) — for that framework only, where the capability is eligible in another framework (see the per-framework table above for the specific case of DynamicDialog/OverlayBadge in React).

### 10.4 What Batch 1 is not

This section states Batch 1's scope; it does not authorize its implementation. Per §1, Batch 1 still requires its own Specification and Implementation Plan, through the full gated sequence in §9, before any code is written. This roadmap's statement of Batch 1's scope is not itself that Specification.

---

## 11. What this roadmap does NOT decide

Explicitly out of scope for this document, consistent with the approved decisions:

- **Batch 2's, Batch 3's, or any later batch's exact membership.** These are determined at each batch's own Brainstorming/Decision stage (§9), using this roadmap's rules applied to evidence current at that time.
- **Whether or when to commission a Parity Reconciliation pass** to shrink the Unverified pool (§6.3).
- **Cross-framework naming standardization** (Phase A §12 question 5) — remains a separate, open product decision. Its resolution does not retroactively change Batch 1's scope (naming was never a blocker for Batch 1, per Principle 10) and its non-resolution does not block any future batch either.
- **OrganizationChart's DECISION-D discrepancy** — remains unresolved (§7); this roadmap does not adjudicate it.
- **DECISION-B, DECISION-C, DECISION-D, or DECISION-E's own substantive resolution** — this roadmap tracks the consequences of these decisions remaining open; it does not narrow, reopen, or resolve any of them.
- **Batch 1's detailed internal implementation order, task breakdown, or Specification content** — belongs to Batch 1's own Specification and Implementation Plan (§9 steps 2–4), not this roadmap.
- **Whether mixed-eligibility batch members (a capability included for 2 of 3 frameworks) ever "complete" for the deferred framework** — that depends on when the deferred framework's Unverified status resolves (§6), which this roadmap does not schedule.

---

## 12. Current Phase C position / next step

**Current position (updated 2026-09-20, following Batch 1's closeout):** Batch 1 is complete — merged to `main` (commit `78233fe`), all 79 canonical capabilities named in §10.3 built, tested, and reviewed across their eligible frameworks (Form 30/30, Overlay 8/8, Navigation 11/11, Panel/Layout/Display/Feedback 30/30), per the full gated sequence in §9 (Specification, Spec Review, Implementation Plan, Plan Review, Implementation, Verification, Final Review/Closeout). `COMPONENT_INVENTORY.md` (Angular) and the newly-created `docs/architecture/REACT_COMPONENT_STATUS.md`/`VUE_COMPONENT_STATUS.md` (per §9 step 8) reflect this.

### 12.1 Batch 2 Brainstorming/Decision (2026-09-20) — outcome: no ordinary batch currently eligible

Per §9 step 1, Batch 2's Brainstorming/Decision stage was opened and evaluated this roadmap's rules (§3–§6) against the repository state and governing documents as they stand today (`docs/architecture/research/2026-09-17-phase-c-migration-dependency-map.md`, the Parity Matrix, `docs/architecture/DECISIONS.md`, `docs/architecture/BLUEPRINT_GAPS.md`), cross-checked directly against the real `packages/{ng,react,vue}/src/` directory listings rather than assumed from any document's own text.

**Finding: no ordinary, non-exception canonical capability is currently eligible for a new batch.** Specifically:

- **Form, Overlay, Navigation, and Panel/Layout/Display/Feedback** — the four families that contributed Batch 1's eligible set — are now fully closed; no eligible member remains in any of them.
- **Data family** (Tree, TreeTable, TreeSelect, OrderList, PickList, DataView) — remains blocked. DECISION-D (Tree-family, do-not-reopen) and DECISION-C (Table-pattern generalization, narrowed but still open) are confirmed unresolved in `BLUEPRINT_GAPS.md` as of this check; neither has moved since this roadmap's original compilation.
- **Visualization/Rich-content** (Chart, Editor) — remains blocked on DECISION-B (external runtime dependency approval process), confirmed still open.
- **OrganizationChart** — the `BLUEPRINT_GAPS.md`-vs-`COMPONENT_INVENTORY.md` discrepancy named in §7 remains unadjudicated.
- **React `DynamicDialog` and `OverlayBadge`** — confirmed still Unverified (no `packages/react/src/dynamic-dialog/` or `packages/react/src/overlay-badge/` directory exists). Per §6, these remain excluded from ordinary batch membership until a separately commissioned **Parity Reconciliation pass** resolves the status with new evidence — not performed here, per §6.3, and not commissioned by this Brainstorming/Decision stage.
- **Angular `config`'s full surface**, and the four standing deferrals (React Ripple, Vue Fluid, React DataScroller, Vue InlineMessage) — unchanged, per their existing governing decisions.

No new architectural exception was discovered. No existing decision (DECISION-B/C/D/E, the OrganizationChart discrepancy) was reopened, reinterpreted, or resolved by this check.

**Decision (human-confirmed 2026-09-20): declare Phase C's ordinary-migration scope complete for the current evidence and decision state.** Batch 2 is not opened past this Brainstorming/Decision stage — no Specification, Implementation Plan, or implementation work follows from it. This is a recorded current-state conclusion, not a new roadmap rule or a change to any decision in §7.

**Next step:** further ordinary migration requires either (a) a separately authorized **Parity Reconciliation pass** (§6.3 — resolving the Unverified pool, starting with React's DynamicDialog/OverlayBadge), or (b) an explicitly authorized resolution of one of the open exception-track decisions (DECISION-B, DECISION-C, DECISION-D remains permanently protected and is not a candidate for resolution, or the OrganizationChart discrepancy). Neither is commissioned or scheduled by this entry. Until one of those happens and produces new eligible evidence, no Batch 2 Brainstorming/Decision stage will find different results than this one did.

### 12.2 Parity Reconciliation pass (2026-09-20) — outcome: 11 confirmed absent, 2 confirmed eligible

Per §12.1's own named next step (a), a Phase C Next-Step Assessment authorized Path 1 (Parity Reconciliation) as a dedicated evidence workstream — explicitly scoped as evidence/reconciliation only, not ordinary component migration, no implementation. It checked every capability/framework pair remaining in the Parity Matrix's §3.3(b) naming-enumeration-gap tier against real, pinned Prime source (`.vendor-cache/primereact-10.9.9.tar.gz`, `.vendor-cache/primevue-4.5.5.tar.gz`, `.vendor-cache/primeng-21.1.9.tar.gz`), never inferring eligibility from naming similarity alone.

**Outcome — 11 capability/framework pairs confirmed genuinely absent** (reclassified Unverified → Not applicable in the Parity Matrix; full evidence in `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` §3.3(a)/§4.1): React (6) — DynamicDialog, OverlayBadge, IftaLabel, ImageCompare, AnimateOnScroll, InputGroup/InputGroupAddon (confirmed a showcase-only CSS convention, not a shipped component); Angular (5) — MultiStateCheckbox, TriStateCheckbox, Mention, InputChips, DeferredContent (confirmed a showcase-only demo, never exported as part of the installable PrimeNG package).

**Outcome — 2 capability/framework pairs confirmed genuinely eligible** (real, distinct Prime source found; see Parity Matrix §4.1b, `REACT_COMPONENT_STATUS.md`, `VUE_COMPONENT_STATUS.md`): **React DataScroller** (real `components/lib/datascroller/`, genuine infinite-scroll/lazy-append list, distinct from React's already-built `Scroller`) and **Vue InlineMessage** (real `inlinemessage/InlineMessage.vue`, genuinely distinct from PrimeVue's own `Message.vue`). Neither is promoted to any batch by this record — reported as candidates only, per this pass's own scope boundary.

**Not checked by this pass, still genuinely Unverified:** Vue's column for MultiStateCheckbox/TriStateCheckbox/Mention/DataScroller; React's column for InlineMessage; Angular's column for DataScroller/InlineMessage.

**Incidental finding, out of this pass's scope, not acted on:** real PrimeVue has standalone `CheckboxGroup`/`RadioButtonGroup` components already classified "Ready under established pattern" in the Dependency Map before Batch 1 was even scoped — never included in Batch 1 for reasons unrelated to naming uncertainty. This is a pre-existing Batch-formation matter, not a Parity Reconciliation finding.

**ADR reference-integrity defect, confirmed and corrected (citation only, no decision reopened):** every document that cited "ADR-043's structural-incompatibility finding" for DECISION-D's Tree-family question was propagating a mis-citation — `DECISIONS.md`'s actual ADR-043 is `@ultimate/uix-data` (a real, correctly-cited decision for the separate shared-Data-primitives question), and the Tree-family finding has only ever existed in `BLUEPRINT_GAPS.md`'s own DECISION-D prose, never as a numbered ADR. Corrected at the authoritative source (`BLUEPRINT_GAPS.md`'s DECISION-D entry) and in this roadmap's own §7 table, the Dependency Map, and the Batch Selection Analysis — the citation only; DECISION-D's substance, protection, and "do-not-reopen" status are unchanged and were not reopened by this correction. Older, dated historical audit documents that also carry the same mis-citation (e.g. prior reconciliation/audit passes under `docs/architecture/research/2026-*`) were left as-is, as frozen point-in-time records, per this repository's own convention of not silently rewriting dated research artifacts.

**No Batch 2 Spec, Implementation Plan, or implementation follows from this record.** The two newly-eligible candidates (React DataScroller, Vue InlineMessage) may inform a future Batch 2 Brainstorming/Decision stage, but that stage has not been opened by this entry.

*(Note: Batch 2 was subsequently authorized, specced, planned, implemented, and merged to `main` — commit `c37dc40` — but this roadmap's own §12 was not updated with a dedicated closeout entry at that time; this is a known, disclosed documentation gap, not addressed by this update since it was out of scope for the work that produced §12.4 below.)*

### 12.4 OrganizationChart — DECISION-D scope clarification (human-approved, 2026-09-21)

Following Batch 2's merge, a Phase C Next-Step Assessment (2026-09-21) surfaced OrganizationChart's long-standing, previously-unadjudicated DECISION-D discrepancy (§7's prior table entry; Dependency Map §0 finding 2, §D; Parity Matrix §4.2; Batch Selection Analysis §D.2) as a specific decision-analysis question, followed by a source-reconstruction pass tracing DECISION-D's own original text and evidentiary basis, followed by direct real-source verification of all 3 frameworks' actual OrganizationChart implementations.

**Evidence established:** DECISION-D's original inclusion of OrganizationChart (introduced 2026-09-01, consolidated into ADR-043/`BLUEPRINT_GAPS.md` 2026-09-02) was a mechanism-dependency claim ("depending... through Tree") never independently source-verified for OrganizationChart specifically at the time — only Tree itself carried a citation. `COMPONENT_INVENTORY.md`'s own OrganizationChart row (plain `ADAPT`, no Tree dependency) predates DECISION-D by 4 days and was never revised. Direct verification of all 3 frameworks' real Prime source (completed 2026-09-20/21) found the claim is genuinely asymmetric: **Angular's real `OrganizationChart` imports `TreeNode` and mutates `node.expanded` in place** — the same contested mechanism DECISION-D protects. **React's and Vue's real `OrganizationChart` implementations are both structurally independent** — no Tree/`TreeNode` import, no shared expansion-state mechanism, in either framework.

**Decision (human-approved, 2026-09-21):** DECISION-D is interpreted, and its `BLUEPRINT_GAPS.md` entry updated, on a **mechanism-based basis for OrganizationChart specifically**: the decision protects the verified Tree state-management incompatibility, applied per framework where real evidence differs — the same capability-scoped model already governing every other mixed-eligibility capability in Phase C, not a new pattern. **Angular OrganizationChart remains excluded**, same status as Tree itself, unchanged. **React and Vue OrganizationChart are not excluded by DECISION-D** — but neither is thereby declared migration-eligible; both still require normal Phase C eligibility verification (beyond the Tree-dependency question this decision resolves) before either could enter a future batch. Angular's real Tree-dependent implementation is not redesigned or reworked to avoid this classification — no new Angular architecture is introduced. Tree's, TreeTable's, and TreeSelect's own protection under DECISION-D is fully unchanged; this is a scope clarification specific to OrganizationChart's own cross-framework asymmetry, not a reversal, weakening, or reinterpretation of DECISION-D's protection in general.

**Impact on Phase C**: the OrganizationChart/DECISION-D discrepancy previously named in §7, §11, and §12.1 as unadjudicated is now resolved. §7's exceptions table has been updated accordingly (React/Vue OrganizationChart removed from that table; Angular OrganizationChart added with its specific basis). No Batch is authorized by this entry — React/Vue OrganizationChart's eligibility for any future batch remains an open question pending separate verification, not decided here.

---

## Status

**APPROVED — 2026-09-17.**

This roadmap's 5 batch-formation decisions and Batch 1's stated scope (§10) are approved by human review. This document remains planning/current-state guidance, not an implementation authorization — Batch 1 still requires its own Brainstorming/Decision, Specification, Spec Review, Implementation Plan, and Plan Review (§9) before any code is written.

This document does not authorize implementation of any capability, does not constitute a Batch 1 Specification or Implementation Plan, and does not modify `AGENTS.md`'s existing source-of-truth hierarchy. It is a Phase C planning/current-state guidance artifact recording the human-approved batch-formation decisions, for reference by every future batch's own Brainstorming/Decision stage.
