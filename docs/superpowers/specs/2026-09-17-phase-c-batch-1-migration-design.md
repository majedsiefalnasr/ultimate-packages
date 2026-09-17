# Specification — Phase C, Batch 1: Ordinary Cross-Framework Capability Migration

**Status:** Approved — Spec Review passed, corrections applied, human-approved. Implementation Plan created and approved: `docs/superpowers/plans/2026-09-17-phase-c-batch-1-migration-implementation.md`.
**Date:** 2026-09-17
**Branch:** `feature/phase-c-batch-1-migration`

**Origin:** the Phase C Batch 1 Brainstorming/Decision stage (this conversation), governed by `docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md` (approved, committed `e04bd5e`), `docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md`, `docs/architecture/research/2026-09-17-phase-c-migration-dependency-map.md`, `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md`, and `docs/architecture/research/2026-09-17-phase-c-migration-batch-selection-analysis.md`. Every scope boundary and exclusion below traces to one of these five documents or to a human decision made in this Batch 1 Brainstorming/Decision conversation, referenced as `[Decision N]` per that conversation's own numbering.

**Required sequence (this document is the Specification step):** Phase C Roadmap (approved) → Batch 1 Brainstorming/Decision (complete, this conversation) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout → merge to `main` → next batch, per the Roadmap's own rules.

**This specification does not implement anything.** It defines the exact, bounded scope, per-capability requirements template, sequencing rules, and acceptance criteria that a future, separately-gated Implementation Plan must satisfy. No component is built by this document.

---

## 1. Purpose and scope

**Purpose:** Define the implementation-ready scope for Phase C Batch 1 — the full set of canonical capabilities currently eligible for ordinary migration under the approved Phase C Migration Roadmap's rules (dependency correctness, capability-scoped framework realization, Unverified-exclusion, architectural-exception-exclusion), organized by Functional Family for presentation only, not as a membership boundary `[Roadmap §10, §8]`.

**In scope:** every capability named in §3 below, realized only for the framework(s) that section marks eligible, plus the Vue infrastructure prefix (§3.0).

**Out of scope, entirely, for this specification and its eventual Implementation Plan:**
- Any capability not named in §3 (including every capability deferred by this Batch 1 Brainstorming/Decision stage — §3.6).
- Any architectural exception (Chart, Editor, Tree, TreeTable, TreeSelect, OrderList, PickList, DataView, Angular's `config` full-surface remainder) — `[Roadmap §7]`, not reopened.
- OrganizationChart — unresolved DECISION-D discrepancy, not adjudicated `[Roadmap §7, Dependency Map §D]`.
- Messages — relationship to Message unresolved `[Parity Matrix §3.6]`.
- Any capability marked `Unverified / mapping unresolved` in the Parity Matrix, for the framework(s) where it is Unverified.
- Batch 2 or any later batch's composition — not pre-decided by this specification `[Roadmap §9, §11]`.
- Any new architectural decision, feasibility study, or foundation-tier change beyond what §6 below states is already built and being reused.
- Cross-framework naming standardization (Phase A §12 question 5) — every capability below is realized under its existing framework-native name; no unified name is adopted or proposed.

---

## 2. Human decisions this specification implements (binding, not reopened here)

Per the Batch 1 Brainstorming/Decision stage's four resolved open questions:

1. **React Ripple / Vue Fluid → deferred**, not in Batch 1. Neither is a prerequisite for any Batch 1 capability.
2. **React DataScroller → deferred**, not in Batch 1. Sole eligible Data-family member; including it would pull a single-framework, single-family-member capability into an otherwise cross-family batch without a dependency or architectural reason requiring it.
3. **Vue InlineMessage → deferred**, not in Batch 1. Single-framework capability; not promoted solely because one framework happens to be eligible.
4. **Batch 1 size → kept as the full currently-eligible set.** Not split merely because it is large. Functional Families organize the work internally; they do not create separate batches or separate specs.

None of these decisions is reopened by this specification.

---

## 3. Batch 1 capability scope — exact, no more

Every capability below carries its **exact per-framework realization scope**, drawn directly from the Parity Matrix's §2 tables and the Dependency Map's §A classifications, re-verified against current repository state during the Brainstorming/Decision stage (zero drift found). "All 3" means Angular, React, and Vue are all in scope for that capability under this specification.

### 3.0 Infrastructure prefix (Vue only, sequenced first — §5)

| Item | Purpose | Required behavioral responsibility |
|---|---|---|
| Vue Badge | Unblocks Vue's OverlayBadge realization (§3.2) | Provide the badge-rendering primitive OverlayBadge composes over its host content, matching the already-Built Angular `UBadge`'s functional role (component form, no attribute-directive variant, per `COMPONENT_INVENTORY.md`'s Angular Badge row). |
| Vue ConfirmationService/DialogService/ToastService-equivalent tier | Unblocks Vue's ConfirmDialog, ConfirmPopup, DynamicDialog, Toast realizations (§3.2, §3.4) | Must provide, at minimum, the infrastructure each of the four in-scope Vue consumers requires to function as a service-driven (not purely template-declared) overlay: **(a) a request/registration capability** — a way for calling code to programmatically invoke a confirmation, popup confirmation, dynamic dialog, or toast without pre-declaring the component instance in a template, matching each capability's own service-driven nature per Phase A's description of these 4 capabilities (`[Parity Matrix §1.3, §1.6]`); **(b) a dispatch/delivery mechanism** connecting that request to the actual rendered overlay instance; **(c) lifecycle management** (open/show, close/dismiss, and — for Toast specifically — a stacked/queued multi-instance lifecycle, since Toast is explicitly a "transient notification stack" per its own canonical description, not a single-instance overlay). The exact API names, options shape, and provide/inject wiring are Implementation Plan-level decisions (§12 item 2) — only this behavioral responsibility is binding here. |

These are genuinely new foundation-tier work, not capability migrations — Angular and React have zero remaining Layer-1 infrastructure gaps `[Dependency Map §B]`. §7 elaborates the service tier's required conventions; §8 restates the exclusion/deferral rationale table.

### 3.1 Form (30 canonical capabilities — 24 realized in all 3 frameworks, 6 mixed-eligibility)

All 3 frameworks unless noted:

RadioButton, ToggleSwitch, ToggleButton, InputText†, Textarea, InputNumber†, InputMask, InputOTP, Password, AutoComplete, Select, MultiSelect, CascadeSelect, Listbox, SelectButton, Rating, Slider, Knob, ColorPicker, DatePicker, FileUpload, KeyFilter, FloatLabel, IconField/InputIcon.

**Mixed-eligibility (per-framework):**
- InputChips — React, Vue only (Angular Unverified, excluded for Angular).
- InputGroup/InputGroupAddon — Angular, Vue only (React Unverified, excluded for React).
- IftaLabel — Angular, Vue only (React Unverified, excluded for React).
- Mention — React only (Angular, Vue Unverified, excluded for both).
- MultiStateCheckbox — React only (Angular, Vue Unverified, excluded for both).
- TriStateCheckbox — React only (Angular, Vue Unverified, excluded for both).

†InputText and InputNumber are already **Built in Angular**. This specification's scope for these two covers only their React and Vue realizations.

**Excluded from Form:** TreeSelect — depends on Tree, an architectural exception; excluded transitively, all 3 frameworks.

### 3.2 Overlay (8 canonical capabilities — 4 realized in all 3 frameworks, 4 mixed-eligibility)

All 3 frameworks, no qualification: Popover, Drawer, ContextMenu, StyleClass.

**Mixed-eligibility (per-framework, Vue gated on §3.0's infrastructure prefix):**
- ConfirmDialog — Angular, React now. Vue's realization is **deferred within this same batch**, pending the infrastructure prefix (§3.0) landing first.
- ConfirmPopup — Angular, React now. Vue deferred, same reason.
- DynamicDialog — Angular only. React Unverified (excluded for React). Vue deferred, same reason.
- OverlayBadge — Angular only. React Unverified (excluded for React). Vue deferred, same reason.

**Excluded from Overlay:** Dialog, Tooltip — already Built, not migration targets.

### 3.3 Navigation (11 canonical capabilities — all 11 realized in all 3 frameworks, no mixed-eligibility)

All 3 frameworks, no qualification: Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Tabs, Stepper, Steps, Dock, SpeedDial, SplitButton.

Tabs and Stepper are realized per each framework's own decomposition shape (Angular: single directive; React: Tabs as TabView+TabMenu, Stepper as Stepper+StepperPanel; Vue: Tabs as a 5-directory family, Stepper as a 6-directory family) — decomposition shape is implementation detail, not a scope boundary `[Parity Matrix §5]`.

**Excluded from Navigation:** Menu — already Built, not a migration target.

### 3.4 Panel/Layout/Display/Feedback (30 canonical capabilities — 26 realized in all 3 frameworks, 4 mixed-eligibility)

All 3 frameworks, no qualification: Accordion, Avatar, AvatarGroup‡, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, Inplace, Message, MeterGroup, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal, Timeline, Toolbar.

Accordion and Splitter follow each framework's own decomposition shape (Vue: 4-directory and 2-directory families respectively; Angular/React: single directive/component) — implementation detail, not a scope boundary.

**Mixed-eligibility (per-framework):**
- ImageCompare — Angular, Vue only (React Unverified, excluded for React).
- AnimateOnScroll — Angular, Vue only (React Unverified, excluded for React).
- DeferredContent — React, Vue only (Angular Unverified, excluded for Angular).
- Toast — Angular, React now. Vue's realization is **deferred within this same batch**, pending §3.0's infrastructure prefix (same pattern as §3.2's ConfirmDialog/ConfirmPopup).

‡AvatarGroup: Angular carries a soft, same-batch dependency on Avatar (§5). React and Vue carry no such dependency.

**Excluded from this family:** OrganizationChart (§1), Messages (§1), InlineMessage (§3.6).

### 3.5 Data, Visualization/Rich-content

**No capability from either family enters Batch 1.** Data's remaining members are either architectural exceptions (Tree, TreeTable, OrderList, PickList, DataView) or the deferred DataScroller (§3.6). Visualization/Rich-content's two members (Chart, Editor) are both DECISION-B architectural exceptions.

### 3.6 Explicitly deferred to a later batch (not in scope here, per §2)

React Ripple, Vue Fluid, React DataScroller, Vue InlineMessage. None of these appears anywhere else in this specification's scope.

---

## 4. Implementation model (binding on the eventual Plan)

Restated from the Roadmap and Batch 1 Brainstorming/Decision stage, as binding constraints on every task the Implementation Plan creates:

1. **Batch membership is capability-based**, not framework-based or family-based. A capability is one unit in this specification and in the eventual Plan, even when realized across multiple frameworks or split into multiple implementation tasks internally.
2. **Framework realization is capability-scoped and independent.** Nothing in this specification or its Plan may require simultaneous completion across all three frameworks for a mixed-eligibility capability (§3.2, §3.4) — Angular's/React's ready realization proceeds independently of Vue's deferred one.
3. **No Unverified capability is promoted.** Every framework exclusion in §3 stands as written; resolving an Unverified status is out of scope for this specification (it requires a separately-scoped Parity Reconciliation pass, `[Roadmap §6]`, not performed here).
4. **Existing Ultimate architecture and foundations are reused, not re-derived** — see §6.
5. **Dependency correctness governs sequencing** — see §5. No task may be scheduled ahead of a prerequisite it depends on, except where §5 states an explicit intra-batch ordering.
6. **Functional Families organize the Plan's task presentation; they do not create separate specs, separate plans, or separate acceptance gates.** One Implementation Plan, one Verification pass, one Final Review/Closeout for all of Batch 1 (§9).
7. **Proof-by-exception applies.** No new feasibility study is authorized for any capability in §3 unless implementation reveals a genuinely new architectural pattern, an unresolved dependency, or another meaningful exception not already known — in which case implementation halts on that specific capability and escalates, per the Operating Context's own §5 criteria, rather than inventing a resolution.
8. **Framework-native implementation is mandatory** for every capability — no shared cross-framework implementation, no forced identical API shape, consistent with every prior Ultimate component (Option B: reference, not verbatim; ADR-018/024/032).
9. **No Prime runtime dependency**, per ADR-004 — every capability is adapted/reimplemented, never re-exported or wrapped. Enforced by the existing `validate-dependency-ceiling.mjs` CI gate; this specification introduces no new dependency.
10. **All existing exclusions and protected areas are respected as-is** — DECISION-B, DECISION-C, DECISION-D, DECISION-E, and the OrganizationChart discrepancy are not touched by any task this specification authorizes.

---

## 5. Dependency and sequencing requirements

**Exhaustive with respect to cross-capability prerequisite relationships** — no *other* dependency between two distinct canonical capabilities in Batch 1 exists per current Dependency Map §C evidence, re-verified during the Brainstorming/Decision stage. Items 3 and 4 below are a different kind of rule: they govern the internal sub-component build order *within* one canonical capability's own decomposed-family realization (Vue's Tabs/Stepper/Accordion/Splitter families, React's Stepper/StepperPanel) — not an additional cross-capability dependency, and not exhaustive in the same sense, since they are implementation detail internal to a single capability's own task rather than a batch-level gate:

1. **§3.0's infrastructure prefix (Vue Badge; Vue service tier) is sequenced first**, ahead of any task realizing Vue's ConfirmDialog, ConfirmPopup, Toast, or OverlayBadge (§3.2, §3.4). Vue's DynamicDialog is also gated on the service tier but is itself excluded from Batch 1 for React (Unverified) — only its Angular and (once unblocked) Vue realizations are in scope; DynamicDialog's Vue realization follows the same prefix-first ordering.
2. **Angular: Avatar before AvatarGroup** (§3.4‡) — soft, explicit, same-batch. AvatarGroup's Angular task may not start before Avatar's Angular task completes. React and Vue's AvatarGroup tasks carry no such ordering.
3. **Vue: within-family container-first ordering**, already documented and not re-derived here — Tabs family (tabs → tablist → tab → tabpanel → tabpanels), Stepper family (stepper → step → stepitem → steplist → steppanel → steppanels), Accordion family (accordion → accordionpanel → accordionheader → accordioncontent), Splitter family (splitter → splitterpanel). These are implementation-sequencing notes internal to each capability's own Vue task, not cross-capability batch gates.
4. **React: Stepper before StepperPanel** — same soft-ordering pattern, React-specific, internal to the Stepper capability's own React task.
5. **No capability in §3 depends on any capability outside §3.** Verified: every capability's Dependency Map dependency, where one exists, resolves either to an already-Built foundation (Button, Menu, Badge-in-Angular, Avatar-in-this-batch) or to §3.0's infrastructure prefix. No task requires waiting on a deferred item (§3.6) or an excluded item (§1).

---

## 6. Reuse of existing Ultimate foundations (binding — no new foundation work authorized beyond §3.0)

Every Batch 1 capability builds on already-Built, already-proven foundation tiers. This specification authorizes **no new base-class tier, no new shared package export, and no new architectural pattern** beyond what is already built, except §3.0's two named Vue infrastructure items.

| Framework | Foundation reused | Evidence |
|---|---|---|
| Angular | `UBaseComponent → UModelHolder → UBaseEditableHolder → UBaseInput` (4-tier chain), `UOverlay`, `UFocusTrap`, `UBind`, `U_FLUID_ANCESTOR` token pattern (for any Form capability needing ancestor-Fluid detection, per GAP-009's refined trigger condition) | `ng-core/src/`, proven by `UInputText`/`UInputNumber` |
| React | `useComponentBase` hook; `react-core`'s overlay/focus-trap/escape/zindex/motion/hooks tiers. No model-holder/input tier — confirmed architecturally unnecessary, not a gap | `react-core/src/`, Parity Matrix §2.1 |
| Vue | `createBaseComponent → createBaseEditableHolder → createBaseInput` (3-tier chain), `createDirective` factory, `vue-core`'s overlay/focus-trap/escape/zindex/motion tiers | `vue-core/src/`, proven by `UCheckbox` (1-consumer proof — Parity Matrix §2.1 flags this as less-proven than Angular's 2-consumer chain; **not a blocker for this batch**, but any Vue Form-family task in §3.1 is the natural point where a second/third real consumer further proves this tier — no new investigation required, proof accrues as a byproduct of ordinary implementation) |
| All 3 | `uix-utils`, `uix-styled`, `uix-styles`, `uix-motion` | Already built, Layer 0 per Dependency Map §B |

`uix-data` is out of scope — relevant only to Data-family work, which has zero members in Batch 1 (§3.5).

---

## 7. Framework-specific requirements where evidence requires them

- **Angular — secondary entry-point eligibility.** Per GAP-009's refined finding (Dependency Map §0, Phase A §9): any Angular Batch 1 component needing ancestor-`UFluid` detection must route it through `UBaseInput`'s `U_FLUID_ANCESTOR` token, never a direct `UFluid` class import, to remain eligible for its own secondary entry point. This applies only to Form-family components that inherit `UBaseInput`; it is a reuse instruction (§6), not new investigation.
- **React — no CVA analogue.** Every React Form capability in §3.1 uses fully-controlled props (`value`/`onChange` or equivalent), matching the already-confirmed architectural fact that React has no shared form-state base class. No task may introduce one.
- **Vue — `v-model`/`writeValue()` form integration.** Every Vue Form capability in §3.1 follows the existing `createBaseInput`'s `writeValue()` pattern, consistent with `UCheckbox`'s proof.
- **Vue — the two new infrastructure items (§3.0)** are genuinely new Vue-only work (no Angular/React equivalent needed, since neither has this gap). §3.0's table states the required behavioral responsibility of each (badge-rendering primitive; request/dispatch/lifecycle infrastructure for the 4 service-driven Overlay/Feedback consumers) — that responsibility is binding. The exact realization (service API shape, DI/provide-inject mechanism, method/option names) is Implementation Plan-level detail, not specified further here — but must itself follow Vue's existing provide/inject and Options-API conventions already established elsewhere in `vue-core`, not a new pattern.
- **All frameworks — decomposed families (§3.3, §3.4).** Where a framework's real Prime source decomposes a capability into multiple sub-components (Vue's Tabs/Stepper/Accordion/Splitter families; React's Tabs-as-TabView+TabMenu, Stepper-as-Stepper+StepperPanel), the Implementation Plan may represent this as multiple sub-tasks under one capability, but the capability remains one roadmap/spec unit (§4.1) with one combined acceptance criterion (§9).

---

## 8. Exclusions and deferred items — reasons restated for traceability

| Item | Reason | Source |
|---|---|---|
| Chart, Editor, Tree, TreeTable, TreeSelect, OrderList, PickList, DataView, Angular `config` (full surface) | Architectural exceptions — DECISION-B/C/D, not reopened | Roadmap §7, Dependency Map §D |
| OrganizationChart | Unresolved DECISION-D/`COMPONENT_INVENTORY.md` discrepancy, not adjudicated | Roadmap §7, Dependency Map §0/§D |
| Messages | Relationship to Message unresolved | Parity Matrix §3.6 |
| React Ripple | Confirmed real gap; not a Batch 1 prerequisite; deferred per human decision | Batch 1 Brainstorming/Decision §7 item 1 |
| Vue Fluid | Confirmed real gap; not a Batch 1 prerequisite; deferred per human decision | Batch 1 Brainstorming/Decision §7 item 1 |
| React DataScroller | Dependency-eligible but sole eligible Data-family member; deferred per human decision to avoid an unmotivated single-framework, single-family-member inclusion | Batch 1 Brainstorming/Decision §7 item 2 |
| Vue InlineMessage | Single-framework eligible capability; deferred per human decision, not promoted solely on single-framework eligibility | Batch 1 Brainstorming/Decision §7 item 3 |
| Every capability's Unverified framework exclusion (§3.1–§3.4) | Parity Matrix Unverified status not promoted to Ready without new evidence | Parity Matrix §2, Roadmap §6 |

---

## 9. Testing / verification expectations

Every Batch 1 capability, for every framework it is realized in, must meet the same bar every already-Built Ultimate component met — real, tested, source-verified, not merely "compiles":

1. **Unit tests** covering the capability's own stated behavior, following each framework's existing test conventions (the pattern already established by Button, Checkbox, Dialog, Menu, Tooltip, Table, Scroller, Paginator's own test suites).
2. **No regression** to any already-Built component or foundation tier — the full existing test suite passes after each task, not just the new capability's own tests.
3. **Accessibility parity** with the pattern already established for Built components (ARIA roles, keyboard navigation) — per-capability specifics are Implementation Plan/task-level detail, not specified further here, since proof-by-exception (§4 item 7) means no new accessibility research is authorized unless a capability's Prime source reveals a genuinely novel pattern.
4. **Cross-framework consistency check** where `uix-styles`/`uix-styled` token resolution applies, matching the existing `packages/themes/test/cross-framework-consistency.test.ts` pattern, for any capability that sources its styling through `dt()` calls.
5. **Documentation update at closeout**, per the Roadmap's own §9 step 8 requirement: mark each newly-built capability's Prime-directory row(s) as built in `COMPONENT_INVENTORY.md` (Angular) and the equivalent current-state tracking mechanism for React/Vue (per the Operating Context's own §9 provision — no committed React/Vue-equivalent inventory currently exists; the Implementation Plan must state which mechanism it uses, consistent with how Phase B's own work handled this same gap).
6. **Single Verification pass and single Final Review/Closeout for the whole of Batch 1** — not per-family, per §4 item 6.

---

## 10. Compatibility and architectural constraints

- **MIT-only baseline** (ADR-005) — no capability in §3 introduces a new external dependency; all sourcing remains within the pinned PrimeNG 21.1.9 / PrimeReact 10.9.9 / PrimeVue 4.5.5 tarballs already in `.vendor-cache/`.
- **No forced API-shape parity across frameworks** (ADR-006) — confirmed consistent with §4 item 8.
- **No passthrough (`pt`/`ptOptions`) surface** on any Batch 1 capability, consistent with each framework's existing Option-B ADR posture.
- **No full global config surface** beyond each framework's existing minimal `unstyled`/ripple-toggle subset — no Batch 1 capability requires Angular's `config` full-surface remainder (an excluded architectural exception, §8).
- **Package versioning** — Batch 1 does not touch DECISION-E (package naming, deferred to pre-1.0); no package rename or version-scheme change is in scope.

---

## 11. Acceptance criteria (sufficient to support a subsequent Implementation Plan)

Batch 1 is complete when, for every capability in §3 and every framework marked eligible for it:

1. The capability is implemented following that framework's own established architecture (§6, §7) — real, source-verified against the pinned Prime tarball, not invented.
2. §9's testing/verification bar is met (unit tests, no regression, accessibility parity, cross-framework consistency where applicable).
3. §5's sequencing rules were followed (infrastructure prefix first; Avatar before AvatarGroup in Angular; within-family soft orderings observed).
4. §3.0's two infrastructure items are built and verified before any task depending on them starts.
5. Angular `COMPONENT_INVENTORY.md` is updated for every Angular capability closed in this batch. The Implementation Plan identifies the appropriate React/Vue current-state tracking mechanism (per §12 item 1 — not yet determined by this specification), and that mechanism is updated for every React/Vue capability closed in this batch, at Batch 1 closeout.
6. No capability outside §3's exact list was implemented; no capability inside §3 was silently dropped or substituted.
7. No architectural exception, protected decision, or unresolved discrepancy named in §1/§8 was touched, reinterpreted, or resolved.
8. A single Final Review/Closeout confirms all of the above for the whole batch, then the branch proceeds to merge per the Roadmap's own lifecycle (`[Roadmap §9]`).

---

## 12. Genuinely unresolved questions — identified explicitly, not assumed

Per the instruction to identify evidence gaps rather than assume a Prime behavior, the following are **not resolved by this specification** and are flagged for the Implementation Plan or human attention:

1. **React/Vue current-state tracking mechanism (§9 item 5).** Neither framework has a committed `COMPONENT_INVENTORY.md`-equivalent today (a known, disclosed gap from Phase A/B). The Implementation Plan must state which mechanism it uses to record Batch 1's closeout — this specification does not invent one, consistent with how the Phase B work left this same gap open rather than fabricating a new tracking document.
2. **Vue's new service-tier API shape (§3.0, §7).** This specification states the service tier must follow Vue's existing provide/inject conventions but does not design its exact public API (method names, options shape) — that is genuinely new (if small) design work belonging to the Implementation Plan or a Plan-level task brief, not invented here, since Prime's own PrimeVue ConfirmationService/DialogService/ToastService source has not been re-examined in this specification pass (proof-by-exception: this is ordinary implementation-level design, not a new architectural pattern, so no separate feasibility study is triggered — but the Plan must still state the concrete shape before implementation begins).
3. **Per-capability public API surface (all 79 canonical capabilities — 30 Form + 8 Overlay + 11 Navigation + 30 Panel/Layout/Display/Feedback).** Consistent with this specification's governance-level scope (§1), individual prop/input/emit surfaces for each are not enumerated here — each is Implementation Plan task-level detail, verified against the same pinned Prime source each prior Ultimate component used, following the established pattern (e.g. the Table spec's own §4-style API tables), not invented in advance by this document.

None of these three gaps blocks Spec Review — they are scoped, named, and assigned to the correct downstream stage rather than silently resolved or left ambiguous.

---

## Status

**Approved.**

This specification does not authorize implementation. It defines Batch 1's exact, evidence-derived scope and binding constraints, now realized in the approved Implementation Plan (`docs/superpowers/plans/2026-09-17-phase-c-batch-1-migration-implementation.md`).
