# Specification — Phase C, Batch 2: React DataScroller, Vue InlineMessage

**Status:** Draft — awaiting Spec Review.
**Date:** 2026-09-20
**Branch:** `feature/phase-c-batch-2-migration` (created off clean `main`, this specification's own commit is its first content).

**Origin:** the Phase C Batch 2 Brainstorming/Decision stage (this conversation), governed by `docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md` (approved, `e04bd5e`, updated §12.1/§12.2 following Batch 1's closeout and the Parity Reconciliation pass), the updated `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` (§4.1b), the updated `docs/architecture/research/2026-09-17-phase-c-migration-dependency-map.md`, the updated `docs/architecture/research/2026-09-17-phase-c-migration-batch-selection-analysis.md`, and the focused Vue RadioButtonGroup/CheckboxGroup verification (this conversation) that confirmed no scope expansion was warranted. Every scope boundary below traces to one of these documents or to a human decision made in this Batch 2 Brainstorming/Decision conversation, referenced as `[Decision N]` per that conversation's own numbering.

**Required sequence (this document is the Specification step):** Phase C Roadmap (approved) → Batch 1 (complete, merged `78233fe`) → Parity Reconciliation pass (complete) → Batch 2 Brainstorming/Decision (complete, this conversation) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout → merge to `main` → next batch, per the Roadmap's own rules.

**This specification does not implement anything.** It defines the exact, bounded scope, per-capability requirements, sequencing rules, and acceptance criteria that a future, separately-gated Implementation Plan must satisfy. No component is built by this document.

---

## 1. Purpose and scope

**Purpose:** Define the implementation-ready scope for Phase C Batch 2 — the exactly two canonical capability/framework realizations that became eligible for ordinary migration following Batch 1's closeout and the Parity Reconciliation pass, per the approved Phase C Migration Roadmap's capability-scoped model `[Roadmap §5, §9]`.

**In scope:**
1. **React DataScroller** (§3.1).
2. **Vue InlineMessage** (§3.2).

Each is a single-framework realization of its own canonical capability. Per the Roadmap's capability-scoped model, a capability entering scope for one framework does not require or imply any other framework's realization — for DataScroller, its Angular and Vue realizations are simply **not in scope for this batch**; for InlineMessage, its Angular and React realizations are simply **not in scope for this batch**. In every case, the framework(s) not in scope remain genuinely `Unverified / mapping unresolved` (§1) — this specification does not assert or imply they are confirmed absent `[Roadmap §5.1]`.

**Out of scope, entirely, for this specification and its eventual Implementation Plan:**
- Any capability not named in §3.
- Any of the 11 capability/framework pairs the Parity Reconciliation pass confirmed genuinely absent (`Not applicable`) — React: DynamicDialog, OverlayBadge, IftaLabel, ImageCompare, AnimateOnScroll, InputGroup/InputGroupAddon (6); Angular: MultiStateCheckbox, TriStateCheckbox, Mention, InputChips, DeferredContent (5) `[Parity Matrix §4.1]`.
- The 7 capability/framework pairs still genuinely `Unverified / mapping unresolved` after the reconciliation pass (Vue MultiStateCheckbox/TriStateCheckbox/Mention/DataScroller; React InlineMessage; Angular DataScroller/InlineMessage) — none promoted without further evidence `[Parity Matrix §4.1b, Roadmap §6]`.
- Vue `RadioButtonGroup`/`CheckboxGroup` — confirmed, by this conversation's own focused verification, to be Vue-specific supporting implementations of the already-Built `RadioButton`/`Checkbox` capabilities, not separate canonical capabilities. Not added to the canonical inventory, not migration targets.
- Any architectural exception (Chart, Editor, Tree, TreeTable, TreeSelect, OrderList, PickList, DataView, Angular's `config` full-surface remainder) — `[Roadmap §7]`, not reopened.
- OrganizationChart — unresolved DECISION-D discrepancy, not adjudicated `[Roadmap §7, Dependency Map §D]`.
- Messages — relationship to Message unresolved `[Parity Matrix §3.6]`.
- React Ripple, Vue Fluid, Angular `config` full surface — existing standing deferrals, not reopened or bundled into this batch merely because it is small `[Roadmap §7]`.
- Batch 3 or any later batch's composition — not pre-decided by this specification.
- Any new architectural decision, feasibility study, or foundation-tier change — both capabilities reuse existing, already-Built foundation tiers exactly (§6); no new tier or shared package export is authorized.
- Cross-framework naming standardization — both capabilities are realized under their existing framework-native names.

---

## 2. Human decisions this specification implements (binding, not reopened here)

Per the Batch 2 Brainstorming/Decision stage and the preceding Parity Reconciliation pass:

1. **The Parity Reconciliation pass's outcome is accepted as evidence** — 11 capability/framework pairs confirmed genuinely absent (React 6, Angular 5), 2 confirmed genuinely eligible (React DataScroller, Vue InlineMessage), 7 remain genuinely Unverified. Not re-derived here.
2. **Vue RadioButtonGroup/CheckboxGroup do not expand this batch's scope** — confirmed, via focused real-source verification, to be Vue-specific supporting implementations of already-Built RadioButton/Checkbox, not new canonical capabilities. Not added to the canonical inventory.
3. **Batch 2 is authorized for exactly these two capabilities**, despite each being single-framework — the capability-scoped model does not require cross-framework parity as a precondition for batch inclusion `[Roadmap §5.1]`; this reverses Batch 1's own earlier deferral of both items (`[Batch 1 spec §8]`, "not promoted solely on single-framework eligibility") now that a full reconciliation pass has independently re-confirmed both are real, and no other family has any currently-eligible member competing for batch composition.
4. **No further capability is added to close out an otherwise-small batch.** A 2-realization batch is accepted as correctly sized for the currently eligible evidence — not padded with anything from the Unverified pool or the exception tracks.

None of these decisions is reopened by this specification.

---

## 3. Batch 2 capability scope — exact, no more

### 3.1 React DataScroller

**Canonical capability:** DataScroller (Data family, per Parity Matrix §1.5). **Framework:** React only. No Angular or Vue realization is in scope — both remain genuinely Unverified (§1).

**Real source grounding:** PrimeReact 10.9.9, `components/lib/datascroller/DataScroller.js`, `DataScrollerBase.js`, `datascroller.d.ts` (extracted via `scripts/provenance/extract-primereact-source.mjs` against the pinned `.vendor-cache/primereact-10.9.9.tar.gz`).

**Required behavioral responsibility**, derived directly from real source:

| Prop (real PrimeReact name/default) | Required behavior |
|---|---|
| `value` (`any[]`, default `null`) | Source data array. |
| `rows` (`number`, default `0`) | Number of items appended per load cycle. |
| `inline` (`boolean`, default `false`) | `true`: the component's own content container is the scroll target. `false`: the window is the scroll target. |
| `lazy` (`boolean`, default `false`) | `true`: defers loading to `onLazyLoad`, consumer supplies newly-appended data via `value`. `false`: component performs its own synchronous array-slicing from the full `value` array. |
| `loader` (`boolean`, default `false`) | `true`: disables the internal scroll listener; the host application drives loading itself via an exposed imperative `load()` method (real source has no built-in "Load More" button UI for this mode — the hook only). |
| `buffer` (`number`, default `0.9`) | Scroll-position fraction (of scrollable distance) that triggers the next load. |
| `scrollHeight` (`string`) | Max-height for `inline` mode's content area. |
| `header`, `footer` (static content) | Static header/footer content, not template/render-prop slots. |
| `itemTemplate` (render function) | Per-item render function — required, since DataScroller has no fixed row shape. |
| `emptyMessage` (content or render function, default a "no records" message) | Rendered when the resolved data set is empty. |
| `onLazyLoad` (callback: `{first, rows}`) | Fired in lazy mode instead of internal slicing. |

**Internal behavior, required:** on mount, load the initial window (`load()` once); bind a scroll listener (window or the inline content container, per `inline`) unless `loader` is `true`; each triggered load appends the next `rows`-sized window from `value` (non-lazy) or invokes `onLazyLoad` (lazy) — loaded items accumulate and remain rendered (no virtualization, no recycling — this is real upstream DataScroller's actual behavior, faithfully portable as-is, not a scope cut). Expose an imperative `reset()` (clears accumulated state, reloads from the start) and `load()` (for `loader: true` host-driven mode).

**Foundation tier:** bare `react-core` `useComponentBase` — real `DataScrollerBase extends ComponentBase`, no CVA, no model-holder tier. Confirmed no dependency on any editable-holder tier.

**Dependency/composition — explicit finding, binding:** DataScroller does **not** compose or depend on Ultimate's existing `UScroller`. Real source's own mechanism (plain incremental array-slicing plus a scroll-position listener) is architecturally unrelated to `UScroller`'s real windowed-virtualization approach (`itemSize`/`numToleratedItems`-based). The Dependency Map's earlier "Paginator + Scroller, both already built" note is a no-dependency/context observation only, never a composition requirement — this is built as an independent component from scratch, per the Implementation Plan's own task.

**Disclosed scope posture:** no passthrough (`pt`/`ptOptions`) surface, matching every existing Ultimate component's posture — this is not a new cut, it is consistent with every prior Batch 1 capability. No other scope cut is required — DataScroller's real surface has no item-recycling/virtualization/animation trick to exclude.

### 3.2 Vue InlineMessage

**Canonical capability:** InlineMessage (Panel/Layout/Display/Feedback family, per Parity Matrix §1.6). **Framework:** Vue only. No Angular or React realization is in scope — both remain genuinely Unverified (§1).

**Real source grounding:** PrimeVue 4.5.5, `inlinemessage/InlineMessage.vue`, `inlinemessage/BaseInlineMessage.vue` (extracted via `scripts/provenance/extract-primevue-source.mjs` against the pinned `.vendor-cache/primevue-4.5.5.tar.gz`).

**Required behavioral responsibility**, derived directly from real source:

| Prop (real PrimeVue name/default) | Required behavior |
|---|---|
| `severity` (string, default `'error'`) | One of `info`/`success`/`warn`/`error`; drives the default icon selection. |
| `icon` (string, default `undefined`) | Override the icon class; when unset, an icon is resolved from `severity`. |
| Default slot | Message text/content. |
| `icon` named slot | Override the entire icon element. |

**Genuine correction to the prior Parity Reconciliation pass's evidence, binding on this specification:** the reconciliation pass's earlier finding described InlineMessage as auto-dismissing via a `life` timeout "unless `sticky`." Direct read of real `BaseInlineMessage.vue`'s actual declared props during this Specification's own evidence-gathering found **no `sticky` or `life` prop declared anywhere** — `InlineMessage.vue`'s `mounted()` hook references `this.sticky`/`this.life`, but both are always `undefined` at runtime (never assigned by any prop/data field), and the component's own `<template>` never gates on `visible` at all (unlike `Message.vue`, which has a real `v-if="visible"`). Real PrimeVue's own `InlineMessage.spec.js` never exercises this path either. **This is real upstream dead code with no observable effect, not a working feature.** This specification requires a faithful port of real InlineMessage's *actual* behavior: **a permanently-visible, non-dismissible inline alert with no timer, no close mechanism of any kind** — not the auto-dismiss/sticky behavior the earlier reconciliation evidence incorrectly attributed to it. The Implementation Plan must not port the dead sticky/life mechanism as if it were functional.

**Confirmed delta vs. already-Built `Message`** (direct comparison, both real sources read): `Message` has real `closable`/`life`/`icon`/`closeIcon`/`closeButtonProps`/`size`/`variant` props, a working `v-if="visible"` gate, a real close button, `close()`/`life-end` emitted events, and a `<transition>` wrapper. `InlineMessage` has none of this — just `severity`+`icon`, always-visible, no dismiss mechanism of any kind (real or intended). This is a materially smaller, genuinely distinct capability, not a redundant duplicate of Message — confirms the Parity Reconciliation pass's core eligibility finding even though its behavioral-detail claim about `sticky`/`life` is corrected above.

**Foundation tier:** bare `vue-core` `createBaseComponent`, matching real `BaseInlineMessage extends BaseComponent` directly — the same bare tier Ultimate's own already-Built `Message.vue` already uses via `createBaseMessage`. No model-holder, no CVA needed.

**Dependency/composition:** none beyond the bare base tier. `Message.vue`'s own file structure is the natural structural sibling/template to follow, with props/template simplified to InlineMessage's genuinely smaller real surface — no new pattern.

**Disclosed scope posture:** the one disclosure required is the inverse of a cut — the Implementation Plan's own component doc comment must explicitly state that real source's `sticky`/`life`/auto-dismiss mechanism is non-functional dead code in the actual shipped PrimeVue component, and is therefore correctly excluded from this port rather than ported as if it worked. No other scope cut is required.

---

## 4. Implementation model (binding on the eventual Plan)

Restated from the Roadmap and Batch 2 Brainstorming/Decision stage, as binding constraints on every task the Implementation Plan creates:

1. **Batch membership is capability-based**, not framework-based. Each of this batch's two items is a single-framework realization of its own canonical capability — this is expected and correct under the capability-scoped model, not a deviation requiring justification beyond §2 item 3.
2. **No Unverified capability is promoted.** The 7 still-Unverified pairs (§1) remain excluded; resolving any of them requires a further, separately-scoped reconciliation pass, not performed by this specification or its Plan.
3. **Existing Ultimate architecture and foundations are reused, not re-derived** — see §6. No new foundation-tier work is authorized or required by this batch (unlike Batch 1's §3.0 Vue infrastructure prefix — this batch needs no equivalent).
4. **Dependency correctness governs sequencing** — see §5. Neither capability has any cross-capability prerequisite; no ordering is required between them.
5. **Proof-by-exception applies.** No new feasibility study is authorized for either capability unless implementation reveals a genuinely new architectural pattern, an unresolved dependency, or another meaningful exception not already known — in which case implementation halts on that capability and escalates, per the Operating Context's own §5 criteria.
6. **Framework-native implementation is mandatory**, consistent with every prior Ultimate component (Option B: reference, not verbatim; ADR-006/018/024/032).
7. **No Prime runtime dependency**, per ADR-004 — both capabilities are adapted/reimplemented, never re-exported or wrapped. Enforced by the existing `validate-dependency-ceiling.mjs` CI gate.
8. **All existing exclusions and protected areas are respected as-is** — DECISION-B, DECISION-C, DECISION-D, DECISION-E, and the OrganizationChart discrepancy are not touched by any task this specification authorizes.
9. **The InlineMessage dead-code correction (§3.2) is binding**, not optional — the Implementation Plan and its implementer must build the corrected (always-visible, no-timer) behavior, not the originally (incorrectly) reported auto-dismiss behavior.

---

## 5. Dependency and sequencing requirements

**No cross-capability dependency exists between React DataScroller and Vue InlineMessage, and neither depends on any capability outside this batch.** Both may proceed in either order, or in parallel, within the Implementation Plan. Neither requires any infrastructure prefix (unlike Batch 1's Vue Badge/service-tier prefix) — both capabilities' required foundation tiers are already fully built and proven (§6).

---

## 6. Reuse of existing Ultimate foundations (binding — no new foundation work authorized)

| Framework | Capability | Foundation reused | Evidence |
|---|---|---|---|
| React | DataScroller | `react-core`'s `useComponentBase` (bare display/data tier, no CVA) | `react-core/src/`; matches real `DataScrollerBase extends ComponentBase` |
| Vue | InlineMessage | `vue-core`'s `createBaseComponent` (bare tier, no CVA) | `vue-core/src/`; matches real `BaseInlineMessage extends BaseComponent`; proven sibling precedent: Ultimate's own already-Built `Message.vue` via `createBaseMessage`, same bare tier |

Neither capability requires `uix-data` (Data-family shared primitives are irrelevant to DataScroller's actual mechanism, per §3.1's explicit no-composition finding), a model-holder/input tier, or any new shared package export. This specification authorizes **no new base-class tier and no new architectural pattern.**

---

## 7. Framework-specific requirements where evidence requires them

- **React — no CVA analogue, fully-controlled data prop.** DataScroller's `value`/`onLazyLoad` follow React's already-established fully-controlled pattern; no shared form-state base class is introduced.
- **React — no passthrough surface.** Real source's `pt`/`ptOptions` props are excluded, matching every existing Ultimate React component's posture — not a new decision.
- **Vue — bare-component convention, no `v-model`.** InlineMessage carries no bindable value (it is not a form control) — no `writeValue()`/`createBaseInput` participation is required or appropriate, matching real source's own nature.
- **Vue — the dead-code exclusion (§3.2) must be documented in-code**, following the established "smaller/corrected surface than upstream, disclosed in a doc comment" precedent already used throughout Batch 1 (e.g. `UInputNumber`, Carousel, Galleria, Splitter).

---

## 8. Exclusions and deferred items — reasons restated for traceability

| Item | Reason | Source |
|---|---|---|
| Chart, Editor, Tree, TreeTable, TreeSelect, OrderList, PickList, DataView, Angular `config` (full surface) | Architectural exceptions — DECISION-B/C/D, not reopened | Roadmap §7 |
| OrganizationChart | Unresolved DECISION-D/`COMPONENT_INVENTORY.md` discrepancy, not adjudicated | Roadmap §7, Dependency Map §D |
| Messages | Relationship to Message unresolved | Parity Matrix §3.6 |
| React Ripple, Vue Fluid, Angular `config` full surface | Existing standing deferrals; not bundled into this batch merely because it is small | Roadmap §7, this Brainstorming/Decision §7 item 4 |
| Vue RadioButtonGroup, Vue CheckboxGroup | Confirmed Vue-specific supporting implementations of already-Built RadioButton/Checkbox, not separate canonical capabilities | This Batch 2 Brainstorming/Decision's own focused verification |
| Angular DataScroller, Vue DataScroller, Angular InlineMessage, React InlineMessage, Vue MultiStateCheckbox, Vue TriStateCheckbox, Vue Mention | Still genuinely `Unverified / mapping unresolved`; not checked by the Parity Reconciliation pass; not promoted without further evidence | Parity Matrix §4.1b, Roadmap §6 |
| The 11 confirmed-absent pairs (React DynamicDialog/OverlayBadge/IftaLabel/ImageCompare/AnimateOnScroll/InputGroup-InputGroupAddon — 6; Angular MultiStateCheckbox/TriStateCheckbox/Mention/InputChips/DeferredContent — 5) | Confirmed genuine functional absence by the Parity Reconciliation pass — `Not applicable`, not eligible for migration | Parity Matrix §4.1 |

---

## 9. Testing / verification expectations

Both Batch 2 capabilities must meet the same bar every already-Built Ultimate component met:

1. **Unit tests** covering each capability's own stated behavior (§3), following each framework's existing test conventions. For DataScroller: initial load window, scroll-triggered incremental load (both `inline` and window-scroll modes), `lazy` mode's `onLazyLoad` firing, `loader: true`'s scroll-listener-disabled + imperative `load()` behavior, `reset()`. For InlineMessage: severity-driven icon rendering, `icon` prop/slot override, default-slot content rendering, and an explicit test confirming the component remains rendered/visible regardless of any internal state change (proving the dead sticky/life mechanism was correctly excluded, not silently reintroduced).
2. **No regression** to any already-Built component or foundation tier — the full existing test suite passes after each task.
3. **Accessibility parity** with the pattern already established for Built components (ARIA roles where real source has them — InlineMessage's real `role="alert"`, if present in real source, must be preserved).
4. **Cross-framework consistency check** where `uix-styles`/`uix-styled` token resolution applies, matching `packages/themes/test/cross-framework-consistency.test.ts`, if either capability sources styling via `dt()`.
5. **Documentation update at closeout**: React DataScroller's row added to `docs/architecture/REACT_COMPONENT_STATUS.md`; Vue InlineMessage's row added to `docs/architecture/VUE_COMPONENT_STATUS.md` — both files already exist (created at Batch 1's Task Group Z) and already carry a candidate-record entry for each (added during the Parity Reconciliation closeout) that the Implementation Plan's closeout task must update from "Eligible candidate" to "Built."
6. **Dependency-ceiling gate** (`validate-dependency-ceiling.mjs`) passes — no new Prime runtime dependency introduced.
7. **Single Verification pass and single Final Review/Closeout for the whole of Batch 2** — both capabilities close together, consistent with Batch 1's own precedent of one gated cycle per batch regardless of internal item count.

---

## 10. Compatibility and architectural constraints

- **MIT-only baseline** (ADR-005) — neither capability introduces a new external dependency; both source from the pinned PrimeReact 10.9.9 / PrimeVue 4.5.5 tarballs already in `.vendor-cache/`.
- **No forced API-shape parity across frameworks** (ADR-006) — moot for this batch, since neither capability spans more than one framework, but stated for consistency with every prior specification.
- **No passthrough (`pt`/`ptOptions`) surface** on either capability, consistent with each framework's existing Option-B ADR posture.
- **Package versioning** — Batch 2 does not touch DECISION-E; no package rename or version-scheme change is in scope.

---

## 11. Acceptance criteria (sufficient to support a subsequent Implementation Plan)

Batch 2 is complete when, for both capabilities in §3:

1. The capability is implemented following its framework's own established architecture (§6, §7) — real, source-verified against the pinned Prime tarball, not invented.
2. §9's testing/verification bar is met (unit tests including the InlineMessage dead-code-exclusion test, no regression, accessibility parity, cross-framework consistency where applicable, dependency-ceiling clean).
3. InlineMessage's implementation matches §3.2's corrected behavior (always-visible, no timer) — not the originally-reported auto-dismiss behavior.
4. DataScroller's implementation does not compose `UScroller` — built independently, per §3.1's explicit finding.
5. `docs/architecture/REACT_COMPONENT_STATUS.md` and `docs/architecture/VUE_COMPONENT_STATUS.md` are each updated from "Eligible candidate" to "Built" for their respective capability.
6. No capability outside §3's exact 2-item list was implemented; no capability inside §3 was silently dropped or substituted.
7. No architectural exception, protected decision, or unresolved discrepancy named in §1/§8 was touched, reinterpreted, or resolved. Vue RadioButtonGroup/CheckboxGroup were not added to the canonical inventory.
8. A single Final Review/Closeout confirms all of the above for the whole batch, then the branch proceeds to merge per the Roadmap's own lifecycle.

---

## 12. Genuinely unresolved questions — identified explicitly, not assumed

1. **The remaining 7 Unverified capability/framework pairs (§1) are not addressed by this batch.** A further Parity Reconciliation pass (or targeted verification, matching the method already used for RadioButtonGroup/CheckboxGroup) could resolve some or all of them — not scheduled or commissioned by this specification.
2. **Per-capability public API surface beyond what §3 states** — both capabilities' exact prop/type signatures are documented in §3 at spec-appropriate detail (not a full line-by-line port), consistent with the Batch 1 spec's own governance-level scope; final exact TypeScript signatures remain Implementation Plan/task-level detail, verified against the same pinned Prime source cited in §3.
3. **Whether a future reconciliation pass or exception-track resolution will produce a Batch 3** — not addressed or pre-decided here, per the Roadmap's own §9/§11.

None of these three gaps blocks Spec Review — they are scoped, named, and assigned to the correct downstream stage rather than silently resolved or left ambiguous.

---

## Status

**Draft — awaiting Spec Review.**

This specification does not authorize implementation. It defines Batch 2's exact, evidence-derived scope and binding constraints for the two capabilities the Parity Reconciliation pass confirmed eligible.
