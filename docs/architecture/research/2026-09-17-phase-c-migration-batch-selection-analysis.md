# Phase C — Migration Batch Selection / Planning Analysis

**Document type:** Analysis/planning artifact. **Not a Spec, not an Implementation Plan, not an authorization to implement.** This document does not modify any Ultimate package, does not begin implementation of any component, and does not itself constitute Batch 1's implementation authority. It is the input to a future, separately-gated Batch 1 Spec/Plan (Superpowers workflow: Research → Decision → **Specification** → Spec Review → **Implementation Plan** → Plan Review → Implementation → Verification → Final Review), which has not yet been created.

**Repository:** `ultimate`
**Compiled:** 2026-09-17, on `main` at commit `a6b2f4d` (unchanged since the Dependency Map/Parity Matrix were compiled — reconciliation check in §0 found zero drift).
**Governing inputs:** `docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md` (principles), `docs/architecture/research/2026-09-17-phase-c-migration-dependency-map.md` (per-target classification, §A–§D), `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` (canonical capability grouping, post-human-review corrected version). This document does not recompute either — it applies their existing conclusions to the batch-selection question.

**Migration framing:** Phase A → Phase B → **Phase C**: Dependency Map → Functional Parity Matrix → **this document (batch-selection model + candidate Batch 1)** → a future, separately-gated Batch 1 Spec → Batch 1 Implementation Plan → Implementation. This document sits at the boundary and does not cross it.

---

## 0. Reconciliation check against current repository state

Before drawing conclusions, the Dependency Map's and Parity Matrix's built/remaining counts were checked against the current repository state (not re-researched):

- `packages/ng/src/`: 14 directories (button, checkbox, dialog, menu, tooltip, ripple, autofocus, fluid, badge, paginator, scroller, table, input-text, input-number) — matches Dependency Map §0's "14 `packages/ng/src/` directories" exactly.
- `packages/react/src/`: 8 directories (button, checkbox, dialog, menu, paginator, scroller, table, tooltip) — matches exactly.
- `packages/vue/src/`: 9 directories (button, checkbox, dialog, menu, paginator, ripple, scroller, table, tooltip) — matches exactly.
- `git log` shows no commits since the merge (`a6b2f4d`) that produced the Dependency Map's baseline — zero drift.

**Conclusion: no reconciliation corrections were needed.** The Dependency Map's and Parity Matrix's classifications are used as-is throughout this document.

---

## A. Batch-selection rules

### A.1 What constitutes a batch

A **migration batch** is a bounded set of canonical capabilities (per the Parity Matrix's §1 definition — user-facing capabilities, not Prime source directories) that:

1. Are jointly eligible under the model in §B (no unresolved hard prerequisite inside the batch pointing outside it, no unresolved architectural exception, no capability whose own classification is Unverified without an explicit, named rationale for including it anyway).
2. Are implemented **per framework, independently, in framework-native form** — a batch does not require simultaneous three-framework delivery of every member; it requires that each framework-specific realization of a batch member is itself internally eligible (per §B) for that framework.
3. Share a **common proof-by-exception discipline outcome** — every member in a batch was classified without needing a new feasibility study (per the operating context's §5 principle), or, if a member did require one, that study is itself already complete and its conclusion already reflected in the Dependency Map/Parity Matrix (this document creates no new studies).
4. Has an explicit, statable **completion/proof boundary** (§H) — the condition under which the batch is considered done, distinct from any individual component's own done-state.

A batch is **not**: a Prime-directory count, a fixed number of components, a sprint-sized chunk chosen for scheduling convenience, or a ranked "top N" list. Batch composition is determined by dependency and classification structure, not by size or effort estimate — this document makes no size claim as a selection criterion.

### A.2 Cross-framework vs. framework-specific vs. mixed batches

Per the Parity Matrix's own governing interpretation (Prime is the source ecosystem; Ultimate's cross-framework functional parity is the target; implementations remain framework-native), a batch is **defined at the canonical-capability level** and **realized independently per framework**:

- A canonical capability that is `ready` in all three frameworks (e.g. RadioButton, ToggleButton, Card, Panel — see §F) can be included in a batch as a **cross-framework capability entry**, with three independent, framework-native implementation efforts under it. This is not "one shared implementation" — each framework builds its own, per Ultimate's existing Option-B posture in all three frameworks' foundation ADRs.
- A canonical capability that is `ready` in only one or two frameworks (e.g. per the Parity Matrix, several Form-family items are `Unverified` for Angular or React solely due to naming-enumeration gaps, not confirmed absence) can still be included in a batch **for the frameworks where it is actually eligible**, while the Unverified framework(s) are excluded from that specific batch member until their status is resolved (§E). This is a **mixed** batch member — eligible-in-some-frameworks, deferred-in-others — and must be recorded as such, not silently treated as all-or-nothing.
- A capability that is only meaningfully framework-specific (no plausible cross-framework counterpart currently identified, e.g. a framework-unique supporting service) is **not** batch material under this model until the Parity Matrix's own mapping work resolves whether it has cross-framework siblings.

**A batch is therefore capability-scoped, not framework-scoped** — "Batch 1" names capabilities, and for each capability names which framework(s) it is eligible in for this batch, rather than naming "Angular Batch 1" and "React Batch 1" as separate artifacts.

### A.3 Handling shared prerequisites

Per the Dependency Map §C's "Shared prerequisites" table and §B's Layer model:

- A **shared prerequisite that is itself already built** (e.g. Button, Menu — already built in all 3 frameworks, prerequisite for SplitButton/ContextMenu/MegaMenu/etc.) imposes no batch constraint — dependents are eligible immediately.
- A **shared prerequisite that is itself unbuilt but is a plain migration target** (e.g. Avatar for AvatarGroup, in Angular only — Avatar itself is `ready`) can be placed in the **same batch** as its dependent, with the prerequisite ordered first within the batch. This is an intra-batch ordering constraint, not a cross-batch blocker.
- A **shared prerequisite that is itself an architectural exception or unbuilt infrastructure** (Tree for TreeSelect/TreeTable; Vue's service tier for ConfirmDialog/ConfirmPopup/DynamicDialog/Toast; Badge for Vue's OverlayBadge) makes every dependent **ineligible for the current batch** until the prerequisite is resolved in a separate, prior batch or architectural decision. The dependent is not independently eligible merely because its own row says "ready" or "depends on X" rather than "architectural exception" — per the task's own instruction, "ready" and "selected" are not conflated, and neither is "depends on an unresolved prerequisite" treated as "eligible now."

### A.4 Representing decomposed framework families

Per the Parity Matrix §5, a canonical capability realized as a multi-directory family in one framework (Vue's Tabs/Stepper/Accordion/Splitter families; React's TabView+TabMenu for Tabs; React's Stepper+StepperPanel) is represented in a batch as **one capability entry per framework**, not as separate entries per internal directory. The internal soft-ordering (container-first, per Dependency Map §C) is an implementation-sequencing note attached to that one entry, not a batch-structural boundary. A batch does not need to include or exclude a family's sub-directories individually — inclusion of the capability implies inclusion of whatever internal decomposition that framework's implementation requires.

### A.5 Batch-level completion/proof boundary

A batch's completion boundary (elaborated in §H) is: every included capability, for every framework in which it was included, reaches the Dependency Map's implicit "Built" state (real, tested, source-verified — the same bar every already-built component in Phase A's Built tables met) with a task-level review per the existing `subagent-driven-development`/plan-review workflow this repository already uses for every other implementation initiative (e.g. the Table/Scroller/Paginator initiative, the Phase B docs branch). This document does not define a new review process — it names which existing process gate applies.

---

## B. Dependency eligibility

### B.1 Deterministic eligibility model

Every canonical capability, for a given framework, is assigned exactly one of five **eligibility states**, derived mechanically from the Dependency Map's existing per-target primary classification (§A of the Dependency Map) plus the capability's cross-framework grouping in the Parity Matrix. No new classification is invented — this is a deterministic function of already-recorded facts:

| Eligibility state | Condition (deterministic rule) | Dependency Map primary classification(s) this maps from |
|---|---|---|
| **Eligible now** | Primary classification = "Ready under established pattern," AND no unresolved hard/soft prerequisite from Dependency Map §C points to a target that is itself not "Eligible now" or already Built | 1. Ready under established pattern |
| **Eligible only after a prerequisite** | Primary classification = "Depends on another migration target," AND the named prerequisite's own eligibility state is tracked — if the prerequisite is "Eligible now" or itself in the same candidate batch, this target becomes eligible once the prerequisite completes; if the prerequisite is itself blocked/an exception, this target inherits "Blocked pending architectural decision" | 2. Depends on another migration target |
| **Blocked pending architectural decision** | Primary classification = "Architectural exception," OR the target's prerequisite (state above) is itself an architectural exception | 3. Architectural exception (direct or inherited) |
| **Excluded / deferred (ordinary)** | Primary classification = "Blocked (ordinary)" (unbuilt infrastructure, not an architectural question) OR "Not needed / superseded" OR "Type-only" | 4. Blocked (ordinary); 5. Not needed/superseded; 6. Type-only |
| **Not yet eligible — evidence insufficient** | Primary classification = "Unverified" in the Dependency Map, OR the capability's Parity Matrix state for this framework is "Unverified / mapping unresolved" (regardless of what the Dependency Map alone would say), OR the capability is caught in an unresolved discrepancy (OrganizationChart/DECISION-D) | 7. Unverified (Dependency Map) or Unverified/mapping-unresolved (Parity Matrix) |

**Precedence rule when the Dependency Map and Parity Matrix would give different signals for the same framework/capability pair:** the Parity Matrix's Unverified state always overrides a Dependency-Map "Ready" state for eligibility purposes, because the Parity Matrix's Unverified marking specifically means the *canonical capability identity itself* is not confirmed (e.g. Angular's InputChips row is `Unverified` in the Parity Matrix despite there being no equivalent Dependency Map row at all to compare — the Dependency Map operates on Prime-directory names, and this capability has no Angular directory name, so the Dependency Map has nothing to say about it either way). This precedence rule is itself a deterministic tie-break, not a judgment call per item.

### B.2 Why "ready" is not "eligible-for-this-batch" and not "selected"

The Dependency Map's "Ready under established pattern" is a **prerequisite-clearance** classification — it says a target has no *dependency* blocking it. It says nothing about whether that target's canonical capability identity is settled (Parity Matrix concern) or whether it was chosen for a specific batch (a decision this document is authorized to make, per the task, but distinguishes explicitly from mere readiness). A capability can be "Ready under established pattern" in the Dependency Map and still be:

- Excluded from Batch 1 because its Parity Matrix cross-framework state is Unverified for one or more frameworks (§B.1's precedence rule);
- Excluded from Batch 1 simply because this document, per the task's own instruction against arbitrary ranking, declines to force a choice among several equally-eligible items and instead documents them as alternatives (§F.3);
- Deferred to a later batch for reasons stated in §G, without that deferral implying anything is wrong with the target itself.

---

## C. Cross-framework parity considerations

Per the task's explicit instructions:

1. **Functional capability grouping is preferred over Prime source-directory grouping.** Batch composition in this document is stated in terms of the Parity Matrix's 109 canonical capabilities (§1), not the Dependency Map's ~310 Prime-directory-level rows. Where a capability is decomposed differently per framework (Tabs, Stepper, Accordion, Splitter, Table, Paginator), the batch entry names the capability once, with framework-specific decomposition noted per §A.4 — never as separate batch line-items.
2. **Framework-native implementation is preserved.** No batch entry in this document requires or implies that Angular/React/Vue share an implementation, API shape, or internal structure. Each framework's realization of a batch capability follows that framework's own already-established Option-B pattern (ADR-018/024/032).
3. **Decomposition differences are not treated as separate functional migration targets.** Per §A.4, confirmed by cross-checking every §F candidate against the Parity Matrix's §4.3 "not a parity gap" list.
4. **Unresolved mappings are not treated as confirmed gaps.** Every Parity-Matrix-Unverified capability is placed in eligibility state "Not yet eligible — evidence insufficient" (§B.1), never silently upgraded to "eligible" nor silently downgraded to "excluded" — both would be an inference this document is instructed not to make.
5. **OrganizationChart/DECISION-D and other already-declared unresolved questions are not resolved here.** See §D.2 and §I.

---

## D. Architectural-exception handling

### D.1 General rule

Every canonical capability in eligibility state "Blocked pending architectural decision" (§B.1) is **categorically excluded from any candidate batch** in this document, regardless of how many frameworks it might otherwise be ready in. This includes: Chart, Editor (DECISION-B, all 3 frameworks), Tree, TreeTable, TreeSelect (DECISION-D, all 3 frameworks, TreeTable/TreeSelect inheriting via prerequisite), OrderList, PickList, DataView (DECISION-C's open remainder, all 3 frameworks), and Angular's `config` full-surface remainder (soft exception, ADR-018 scoped minimum already settled). None of DECISION-B, DECISION-C, DECISION-D, or DECISION-E is reopened, reinterpreted, or narrowed by this document. No feasibility study is created for any of these — per the operating context's own proof-by-exception principle, these already-identified exceptions are the correct and only place such a study would eventually belong, and none is undertaken here.

### D.2 OrganizationChart — preserved exactly as unresolved

The Dependency Map (§0 finding 2, §D) and the Parity Matrix (§4.2) both already record, and do not resolve, the conflict between `BLUEPRINT_GAPS.md`'s DECISION-D (which names OrganizationChart as Tree-family) and `COMPONENT_INVENTORY.md`'s own Angular row (plain `ADAPT`, no Tree dependency). This document **does not adjudicate this conflict**. Its practical consequence for batch selection: OrganizationChart is **not included in any candidate batch composition in this document**, regardless of which of the two possible resolutions would apply, because a target whose primary classification is genuinely disputed between two authoritative sources cannot be deterministically assigned an eligibility state under §B.1's model without inference. This is a conservative exclusion, not a resolution — if DECISION-D's naming is confirmed authoritative in the future, nothing here changes; if `COMPONENT_INVENTORY.md`'s row is confirmed authoritative, OrganizationChart becomes eligible for a future batch, not retroactively part of this one.

**Resolved (2026-09-21), for the record — this document's own analysis above is left unedited as a point-in-time snapshot.** Neither of the two outcomes this section anticipated was exactly what direct real-source verification found: the conflict resolved **asymmetrically per framework**, not uniformly toward one side. Angular's real `OrganizationChart` genuinely imports `TreeNode` and mutates `node.expanded` in place — DECISION-D's naming was correct for Angular, which remains excluded. React's and Vue's real implementations were independently confirmed structurally independent of Tree — `COMPONENT_INVENTORY.md`'s "no Tree dependency" framing was effectively correct for them (that document is Angular-only and never made a claim about React/Vue, but the underlying fact it asserted for Angular — no genuine Tree dependency — turned out true for the other two frameworks instead). Full record: `BLUEPRINT_GAPS.md`'s DECISION-D entry; `docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md` §12.4. This resolution does not retroactively add OrganizationChart to any candidate batch composition in this document — per this section's own stated logic, that determination belongs to a future batch's own Brainstorming/Decision stage, now that eligibility can be assigned without inference.

---

## E. Unverified-evidence handling

Every capability in eligibility state "Not yet eligible — evidence insufficient" (§B.1) is excluded from candidate Batch 1 composition. This is the largest single exclusion category by capability count, spanning most of Form-family items with naming-enumeration gaps (InputChips for Angular, MultiStateCheckbox/TriStateCheckbox/Mention for Angular+Vue, IftaLabel for React, InputGroup/InputGroupAddon for React), several Overlay items (DynamicDialog and OverlayBadge for React), Data-family DataScroller (Angular+Vue), and several Panel/Display items (ImageCompare/AnimateOnScroll for React, DeferredContent/InlineMessage partially). No item in this category is treated as a confirmed gap (per §C point 4) and none is silently included on the assumption that "probably it exists, just unnamed" — per the task's explicit instruction against inventing missing mappings, these remain excluded until the Parity Matrix's own future reconciliation (not this document's job) resolves them.

The Messages/Message relationship (Parity Matrix §3.6) is treated the same way: Messages is excluded from Batch 1 consideration entirely (not merged into Message, not treated as a separate ready capability) because its own identity as distinct-or-not-distinct from Message is unresolved.

---

## F. Candidate Batch 1

### F.1 Selection method

Per §B.1, the pool of candidates is every canonical capability with eligibility state "Eligible now" for at least one framework, after excluding (§D) every architectural exception and (§E) every Unverified item. Within that pool, per the task's explicit instruction against subjective "best"/scoring, this document does **not** rank or narrow further by any effort/complexity/value heuristic. §F.2 states the **full three-framework eligible candidate set** — every capability that is "Eligible now" for **all three frameworks simultaneously**, since this is the only selection criterion in the task's own definitions (§A.1/§A.2) that is itself non-arbitrary: full three-framework eligibility is a factual property of the evidence, not a judgment call. Cross-framework naming standardization (Phase A §12 question 5) is a separate, still-open product decision and is not applied as an eligibility filter here — a capability is included in §F.2 under its own framework-native name wherever the underlying evidence establishes eligibility, regardless of whether that name is shared across frameworks. §F.3 documents the substantial remainder of partially-eligible capabilities as an explicit alternative, per the task's instruction to document alternatives rather than silently choose among them. Naming this set does not select it as Batch 1 — see §F.5.

### F.2 Candidate Batch 1 — full three-framework eligibility set

Cross-referencing Parity Matrix §2 (per-framework state, post-correction) against Dependency Map §D (exclude all exceptions) and the Unverified exclusion (§E), the following canonical capabilities are "Eligible now" (Dependency Map: Ready under established pattern, with no unresolved hard prerequisite) **in Angular, React, and Vue simultaneously**, with no Unverified marking in the Parity Matrix for any of the three:

**Form:** RadioButton, ToggleButton, ToggleSwitch, InputMask, InputOTP, Password, AutoComplete, MultiSelect, CascadeSelect, Listbox, SelectButton, Rating, Slider, Knob, ColorPicker, DatePicker, FileUpload, KeyFilter, FloatLabel, IconField / InputIcon, Textarea, Select

**Overlay:** ContextMenu, StyleClass, Popover, Drawer

**Navigation:** Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Steps, Dock, SpeedDial, SplitButton

**Panel/Layout/Display/Feedback:** Avatar, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, Inplace, Message, MeterGroup, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Tag, Terminal, Timeline, Toolbar

**Note on ToggleSwitch, Textarea, Select, DatePicker, Popover, Drawer:** each has a real Parity Matrix naming-mapping note (§3.1) tied to Phase A §12's still-open cross-framework naming-standardization question (whether Ultimate eventually unifies these under one shared name across frameworks, or keeps each framework's own Prime-native name indefinitely). That question is **not resolved by this document** and is **not treated as an eligibility blocker** — each of these six is included above under its own framework-native name (e.g. Angular's `Select`, React's `Dropdown`, Vue's `Select`), because the underlying Dependency-Map/Parity-Matrix evidence establishes "Eligible now" in all three frameworks independent of what any future naming decision resolves. The open naming question remains logged as a human/product decision (§I item 2) — it affects only whether a *future* unified cross-framework name is adopted, not whether each framework's own version is eligible now.

**Named exclusions from this set**, per explicit §B.1 precedence rule or §D.2:
- **Tabs, Stepper, Accordion, Splitter** — eligible in all 3 frameworks per Dependency Map, and explicitly confirmed **not** a parity gap by Parity Matrix §4.3 (decomposition-only difference). These are legitimate three-framework-ready candidates; held out of the F.2 headline list only to keep it to capabilities requiring zero framework-specific internal-family sequencing discussion, and listed in §F.4 as an equally-valid inclusion with a one-line sequencing note.
- **AvatarGroup** — Angular depends on Avatar (soft, same batch). Not "Eligible now" for Angular under the strict §B.1 definition; listed in §F.4 as "eligible-after-prerequisite," since Avatar is itself in F.2.
- **OrganizationChart** — excluded per §D.2, unconditionally.
- **Toast, ConfirmDialog, ConfirmPopup, DynamicDialog** — Vue is blocked (ordinary, unbuilt service tier); not three-framework-eligible. Listed in §G.

### F.3 Alternative: mixed-eligibility batch (framework-partial inclusion)

Per §A.2's "mixed batch" provision, a legitimate alternative composition includes every §F.2 capability **plus** every capability that is "Eligible now" in two of three frameworks, with the third framework's realization deferred (not abandoned) pending its Unverified status resolving. Examples: InputChips (React/Vue eligible, Angular Unverified), MultiStateCheckbox/TriStateCheckbox/Mention (React eligible, Angular/Vue Unverified), IftaLabel/InputGroup-InputGroupAddon (Angular/Vue eligible, React Unverified), ImageCompare/AnimateOnScroll (Angular/Vue eligible, React Unverified), DeferredContent (React/Vue eligible, Angular Unverified). This alternative is **not selected over F.2** by this document — both are presented as valid compositions under different scope-boundary choices (strict three-framework-simultaneous vs. per-framework-independent), and the choice between them is a human decision, not one this document makes on the evidence's behalf (per the task's explicit instruction against forcing a single composition when multiple are valid).

### F.4 Items held out of the F.2 headline list for a stated reason (not excluded — see reason)

| Item(s) | Reason held out of F.2's headline list | Disposition |
|---|---|---|
| Tabs, Stepper, Accordion, Splitter | Held out of headline list only for presentation; not excluded | Fully eligible in all 3 frameworks; Vue's internal family members follow the soft container-first ordering already documented in Dependency Map §C — an implementation-sequencing note, not a batch-eligibility blocker. |
| AvatarGroup | Angular depends on Avatar (soft, same batch) | Eligible for Angular once Avatar (already in F.2) is sequenced first within the batch; eligible now for React/Vue. |

*(ToggleSwitch, Textarea, Select, DatePicker, Popover, Drawer were previously listed in this table as held out pending the naming-standardization question — corrected: they are included directly in §F.2 above under their existing framework-native names, since the naming question does not gate their eligibility. See the note in §F.2.)*

### F.5 What this document is not asserting

This document does not assert that F.2 (or F.2+F.4, or F.3) **should** be Batch 1. It asserts that these are the compositions the current evidence deterministically supports as internally eligible, under the stated model. Selecting a final Batch 1 composition, sizing it, and sequencing its internal implementation order remain for the future Batch 1 Spec, per this document's own scope boundary.

---

## G. Deferred/blocked candidates and why

| Candidate | Why deferred/blocked | Which gate would need to clear |
|---|---|---|
| Chart, Editor | Architectural exception — DECISION-B (external runtime dependency approval process, not yet created) | A human decision on DECISION-B's approval process, then a separately-gated dependency-approval exercise — not a batch-eligibility fix |
| Tree | Architectural exception — DECISION-D, protected, do-not-reopen | Explicitly not scheduled for resolution by this Phase C track at all, per DECISION-D's own structural-incompatibility finding (`BLUEPRINT_GAPS.md`; not ADR-043, which is the unrelated `@ultimate/uix-data` decision — reference corrected by the Parity Reconciliation pass, 2026-09-20) |
| TreeTable, TreeSelect | Depend on Tree (hard) | Blocked transitively until Tree's DECISION-D status changes |
| OrderList, PickList, DataView | Architectural exception — DECISION-C's open remainder | A human decision on whether Table's composition pattern generalizes to these, or whether each needs its own pass |
| Angular `config` (full surface) | Architectural exception (soft) — building past ADR-018's scoped minimum | Only becomes urgent if a future component requires the fuller surface; no current pressure identified |
| ConfirmDialog, ConfirmPopup, DynamicDialog, Toast (Vue) | Blocked (ordinary) — unbuilt Vue service tier | Building the ConfirmationService/DialogService/ToastService-equivalent tier first (itself a plain migration target, not an exception) |
| OverlayBadge (Vue) | Blocked (ordinary) — unbuilt Vue Badge | Building Badge first (plain migration target) |
| OrganizationChart | Unresolved DECISION-D discrepancy (§D.2) | Human resolution of the `BLUEPRINT_GAPS.md`/`COMPONENT_INVENTORY.md` conflict — not adjudicated here |
| Every §E item (naming-enumeration-gap capabilities) | Evidence insufficient — Parity Matrix Unverified | A future, separately-scoped Parity Matrix reconciliation pass (reverse-searching Prime source for alternate names), not this document's job |
| Messages | Relationship to Message unresolved | Same as above |

---

## H. Batch-level verification/proof requirements

A candidate batch's completion/proof boundary consists of:

1. **Per-capability, per-framework build completion** to the same bar every already-Built component in Phase A's Built tables met — real, tested, source-verified (not merely "compiles"), using the repository's existing implementation-and-review workflow (`subagent-driven-development` or equivalent gated process already established for prior initiatives, e.g. the Table/Scroller/Paginator work and the Phase B docs branch).
2. **No regression to any already-Built component or foundation tier** — verified via the repository's existing test suites, not a new verification mechanism invented by this document.
3. **Re-verification that no batch member's classification drifted** between this document's compilation and the future Batch 1 Spec's own drafting — since batch composition depends on Dependency Map/Parity Matrix state that could, in principle, be revised by an intervening reconciliation pass (as already happened twice for the Dependency Map and once for the Parity Matrix in this Phase C track).
4. **Documentation update** to `COMPONENT_INVENTORY.md` (Angular) and the equivalent current-state tracking mechanism for React/Vue (per the operating context's own §9 provision — "the appropriate current-state tracking document or gap registry"), marking each newly-built capability's Prime-directory row(s) as built, exactly as every prior Built row in this repository has been recorded. This document does not perform that update — it names it as part of the batch's own completion boundary for the future implementation phase to satisfy.
5. **No batch is "complete" until every framework included for a given capability has met (1)-(4) for that capability** — a batch does not partially close; a mixed-eligibility batch member (§F.3) closes only once its deferred framework(s) also complete, or the batch's own scope is explicitly revised to drop that framework for that member (a decision for the Batch 1 Spec, not this document).

---

## I. Open decisions, if any

This document surfaces the following as requiring a human decision before a Batch 1 Spec can be finalized — none are resolved here:

1. **Batch composition scope choice**: strict three-framework-simultaneous (§F.2) vs. mixed per-framework-independent (§F.3) vs. some explicitly-scoped hybrid. This document presents both as valid; does not choose.
2. **Cross-framework naming standardization** (Phase A §12 question 5, pre-existing, not newly raised here): whether ToggleSwitch/Textarea/Select/DatePicker/Popover/Drawer should eventually be unified under one shared name across all 3 frameworks, or whether each framework keeps its own Prime-native name indefinitely. This does **not** gate these six capabilities' inclusion in §F.2 — they are included there under their existing per-framework names regardless of how this question is eventually resolved. The open question affects only whether a future unified name is adopted; it is not treated as an implementation prerequisite by this document.
3. **Whether to include the Tabs/Stepper/Accordion/Splitter family group in Batch 1** alongside the flatter capabilities in §F.2, or sequence them into a later batch given their internal decomposition complexity in Vue — a scope/sequencing choice, not a blocked-by-evidence question (they are fully eligible per §B.1).
4. **OrganizationChart/DECISION-D** (pre-existing, not newly raised): remains open per Dependency Map §0 finding 2 and Parity Matrix §4.2. Not adjudicated by this document, per instruction.
5. **Whether a narrower Parity Matrix reconciliation pass** (reverse-searching each framework's real Prime source for alternate names covering the §E Unverified items) should be commissioned before or in parallel with Batch 1's implementation, to shrink the Unverified pool for a future Batch 2+. Not decided here — this document only names the option.

---

## Status

**READY FOR HUMAN REVIEW — NOT APPROVED.**

This document does not authorize implementation of any capability, does not constitute a Batch 1 Spec or Implementation Plan, and does not itself select a final Batch 1 composition — it states the full three-framework eligible candidate set (§F.2) and a documented alternative composition (§F.3), and leaves the final composition choice, along with the open decisions in §I, to human review and to a future, separately-gated Batch 1 Spec/Plan.
