# Specification — Phase C, Batch 3: OrderList, PickList, DataView, OrganizationChart

**Status:** Spec Review passed on 2026-09-22 after the explicitly authorized generic Angular `UListbox` `trackBy` amendment; awaiting human approval.
**Date:** 2026-09-21
**Branch:** `feature/phase-c-batch-3-migration` (created off clean `main` at `f8cd78b`, this specification's own commit is its first content).

**Origin:** the Phase C Batch 3 Brainstorming/Selection stage (this conversation), governed by `docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md` (approved, updated §12.4/§12.5 following the OrganizationChart and DECISION-C resolutions), the updated `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` (§2.5, §2.6, §4.2, §4.2a), `docs/architecture/BLUEPRINT_GAPS.md`'s DECISION-C and DECISION-D entries, and a dedicated eligibility-verification pass (this conversation) that independently confirmed all 11 capability/framework combinations against real, freshly-extracted Prime source and current Ultimate architecture. Every scope boundary below traces to one of these documents or to a human decision made in this Batch 3 Brainstorming/Selection conversation, referenced as `[Decision N]` per that conversation's own numbering.

**Required sequence (this document is the Specification step):** Phase C Roadmap (approved) → Batch 2 (complete, merged `c37dc40`) → OrganizationChart DECISION-D scope clarification (complete, `674764f`) → DECISION-C architecture resolution (complete, `b426e14`) → Documentation hygiene passes (complete, `f8cd78b`) → Batch 3 eligibility verification (complete) → Batch 3 Brainstorming/Selection (complete, this conversation) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout → merge to `main` → next batch, per the Roadmap's own rules.

**This specification does not implement anything.** It defines the exact, bounded scope, per-capability requirements, sequencing rules, and acceptance criteria that a future, separately-gated Implementation Plan must satisfy. No component is built by this document.

---

## 1. Purpose and scope

**Purpose:** Define the implementation-ready scope for Phase C Batch 3 — the 11 canonical capability/framework realizations confirmed eligible following the DECISION-C and OrganizationChart-DECISION-D resolutions, per the approved Phase C Migration Roadmap's capability-scoped model `[Roadmap §5, §12.4, §12.5]`.

**In scope:**
1. **OrderList** — Angular, React, Vue (§3.1).
2. **PickList** — Angular, React, Vue (§3.2).
3. **DataView** — Angular, React, Vue (§3.3).
4. **OrganizationChart** — React, Vue only (§3.4).

Total: 11 capability/framework realizations across 4 canonical capabilities.

**Angular OrganizationChart is explicitly and permanently excluded** — not deferred, not pending. DECISION-D's scope clarification (2026-09-21) confirmed Angular's real `OrganizationChart` genuinely imports `TreeNode` and mutates `node.expanded` in place, the same contested mechanism Tree's own protection covers. This is a **permanent framework-specific asymmetry** for this one capability, not a temporary gap awaiting a future batch — React and Vue's own real implementations were independently confirmed structurally independent of Tree, which is why they are in scope here while Angular is not, and will not become in scope in any future batch absent new evidence overturning DECISION-D itself (which this specification does not attempt).

**Out of scope, entirely, for this specification and its eventual Implementation Plan:**
- Any capability not named in §3.
- Tree, TreeTable, TreeSelect, and Angular OrganizationChart — DECISION-D, protected, not reopened `[Roadmap §7]`.
- Chart, Editor — DECISION-B, not reopened `[Roadmap §7]`.
- Angular `config`'s full-surface remainder, React Ripple, Vue Fluid — existing standing deferrals, not reopened or bundled into this batch `[Roadmap §7]`.
- The 7 capability/framework pairs still genuinely `Unverified / mapping unresolved` (Vue MultiStateCheckbox/TriStateCheckbox/Mention/DataScroller; React InlineMessage; Angular DataScroller/InlineMessage) — none promoted without further evidence `[Parity Matrix §4.1b, Roadmap §6]`.
- Vue `RadioButtonGroup`/`CheckboxGroup` — confirmed Vue-specific supporting implementations of already-Built `RadioButton`/`Checkbox`, not separate canonical capabilities `[Batch 2 spec §1, unchanged]`.
- Table's own fuller filter-operator vocabulary beyond string match modes — `BLUEPRINT_GAPS.md` DECISION-C's own separately-tracked remainder, untouched by this batch.
- Any new architectural decision, feasibility study, or foundation-tier change beyond §3.2/§6's expressly authorized generic Angular `UListbox` `trackBy` input and what §6 states is already built and reused — **DECISION-C's own resolution is not reopened, re-litigated, or re-derived here; it is accepted as binding evidence** `[Decision 3]`.
- Batch 4 or any later batch's composition — not pre-decided by this specification.
- Cross-framework naming standardization — every capability below is realized under its existing framework-native name.

---

## 2. Human decisions this specification implements (binding, not reopened here)

Per the Batch 3 Brainstorming/Selection stage:

1. **The full 11-combination eligible pool is accepted as Batch 3's membership** — Option A from the Brainstorming/Selection stage, matching Batch 1's own precedent of taking the full then-eligible pool in one batch rather than splitting artificially `[Decision 1]`.
2. **DECISION-C's resolution (no new shared Table/data foundation; OrderList/PickList ordinary framework-native components; DataView directly reuses Paginator) is accepted as evidence, not re-derived** `[Decision 3]`.
3. **The OrganizationChart/DECISION-D scope clarification (Angular excluded, React/Vue not excluded) is accepted as evidence, not re-derived.** React/Vue OrganizationChart's inclusion in this batch is recorded as a **permanent framework-specific asymmetry**, not a deferred Angular item `[Decision 2]`.
4. **The `@angular/cdk/drag-drop` dependency is included as an explicit, ordinary prerequisite within this batch's own execution sequence** (§5), not as a separate architectural workstream and not gated behind a new feasibility study `[Decision 1]`.
5. **No additional capability is added to this batch.** The pool is accepted as correctly sized for the currently eligible evidence — not padded, not trimmed, beyond the 11 combinations named.

None of these decisions is reopened by this specification.

---

## 3. Batch 3 capability scope — exact, no more

### 3.1 OrderList — Angular, React, Vue

**Canonical capability:** OrderList (Data family, per Parity Matrix §1.5). **Frameworks:** all 3, each realized independently per the capability-scoped model — no framework's realization depends on another's.

**Real source grounding:** PrimeNG 21.1.9 `packages/primeng/src/orderlist/orderlist.ts`; PrimeReact 10.9.9 `components/lib/orderlist/{OrderList.js, OrderListBase.js, OrderListControls.js, OrderListSubList.js}`; PrimeVue 4.5.5 `packages/primevue/src/orderlist/{OrderList.vue, BaseOrderList.vue}` (all extracted via the pinned `scripts/provenance/extract-prime{ng,react,vue}-source.mjs` against `.vendor-cache/`).

**Common core, confirmed real in all 3 frameworks:** a single reorderable list — move-up/move-top/move-down/move-bottom button controls operate on array-index math (`moveItemInArray`-equivalent splice). This button-move mechanism is the baseline interaction in every framework and is the only interaction Vue's real upstream has.

**Drag/drop — framework-specific, not part of the common core:**
- **Angular:** real, optional, opt-in drag/drop via `@angular/cdk/drag-drop` (`dragdrop` prop, default `false`) — see §3.1's Angular table below and §5 item 1's prerequisite.
- **React:** real, optional, opt-in drag/drop via native HTML5 DOM events, hand-rolled (`dragdrop` prop, default `false`) — no dependency implication.
- **Vue:** **no drag/drop of any kind exists in real upstream.** Confirmed via full-file read of `BaseOrderList.vue`/`OrderList.vue` — zero `dragdrop`-related field anywhere. Vue's `UOrderList` is button-move-only; this is not a scope reduction, it is the verified real shape.

**Required behavioral responsibility per framework, derived directly from real source:**

**Angular** (`packages/primeng/src/orderlist/orderlist.ts`):

| Prop (real PrimeNG name/default) | Required behavior |
|---|---|
| `value` (`any[]`, via `sourceOptions`-equivalent) | Source data array. |
| `dragdrop` (`boolean`, default `false`) | Opt-in; when `true`, enables real `@angular/cdk/drag-drop` (`CdkDragDrop`, `moveItemInArray`) reordering in addition to the buttons. Default `false` — button-move is the baseline. |
| `dataKey` (`string`) | Field name used as item identity for the composed `Listbox`'s `optionLabel`/selection matching. |
| `filterBy` (`string`) | Comma-separated field names; when set, enables real `FilterService`-based filtering (`filterMatchMode` vocabulary: `contains`/`startsWith`/`endsWith`/`equals`/`notEquals`/`in`/`lt`/`lte`/`gt`/`gte`, default `contains`). |
| `metaKeySelection` (`boolean`, default `false`) | Ctrl/Cmd-click multi-select behavior, delegated to the composed Listbox. |
| `breakpoint` (`string`, default `'960px'`) | Responsive control-repositioning threshold (CSS media query). |
| `scrollHeight` (`string`, default `'14rem'`) | Composed Listbox's own scroll-viewport height. |
| `stripedRows`, `disabled`, `tabindex`, `ariaLabel`, `buttonProps`, `moveUpButtonProps`/`moveTopButtonProps`/`moveDownButtonProps`/`moveBottomButtonProps` | Standard styling/accessibility/button-customization surface. |

**Real, direct composition confirmed:** Angular's `p-orderList` genuinely composes real `p-listbox` (`Listbox` from `primeng/listbox`) as a template child — `[options]="value"`, `[multiple]="true"`, `[(ngModel)]="d_selection"`, `[filter]="filterBy"`, `[dragdrop]="dragdrop"` all bound directly onto the child Listbox instance. This is the exact same relationship Ultimate's own `UListbox` (`packages/ng/src/listbox/listbox.ts`, real props confirmed: `multiple`, `filter`, `emptyMessage`, `optionLabel`-equivalent) already supports — `UOrderList` composes `UListbox` the same way.

**React** (`components/lib/orderlist/{OrderList.js, OrderListBase.js, OrderListSubList.js}`):

| Prop (real PrimeReact `defaultProps`) | Required behavior |
|---|---|
| `value` (default `null`) | Source data array. |
| `dragdrop` (`boolean`, default `false`) | Opt-in; when `true`, real source hand-rolls native HTML5 drag/drop (`draggable="true"`, `onDragStart`/`onDragOver`/`onDrop` — confirmed in `OrderListSubList.js`) — a browser API, no external dependency. Default `false`. |
| `filter` (`boolean`, default `false`) | Opt-in filtering gate. |
| `filterBy` (default `null`), `filterMatchMode` (default `'contains'`), `filterLocale` | Same `FilterService`-based mechanism as Angular. |
| `dataKey` (default `null`) | Item-identity field. |
| `breakpoint` (default `'960px'`) | Same responsive threshold. |
| `autoOptionFocus`, `focusOnHover`, `tabIndex`, `listStyle`, `itemTemplate` | Standard rendering/accessibility surface. |

**Real finding — React does NOT compose a shared Listbox component the way Angular/Vue do.** React's real `OrderList` renders its own dedicated `OrderListSubList.js`, not PrimeReact's own `Listbox` component. `UOrderList` (React) is an **independent, framework-native implementation** — this is a legitimate divergence from Angular/Vue's own Listbox-composing shape (matches ADR-006's "no forced identical shape" rule), not a scope gap. **`UListbox` is a preferred existing foundation to reuse where its real contract genuinely fits** (option rendering, selection state) — it is not a mandatory implementation mechanism, and must not be forced onto React OrderList in a way that distorts the verified real PrimeReact behavior. If `UListbox`'s real prop surface cannot cleanly support OrderList's specific rendering needs, that is a proof-by-exception finding to report (§4 item 5) — implement OrderList's own bespoke rendering instead, do not silently route around the gap by weakening the port.

**Vue** (`packages/primevue/src/orderlist/{OrderList.vue, BaseOrderList.vue}`):

| Prop (real PrimeVue, from `BaseOrderList.vue`) | Required behavior |
|---|---|
| `modelValue` (`Array`, default `null`) | Source data array (Vue's real `v-model` binding target). |
| `dataKey` (`String`, default `null`) | Item-identity field. |
| `metaKeySelection`, `autoOptionFocus`, `focusOnHover`, `responsive`, `breakpoint`, `striped`, `scrollHeight`, `buttonProps` + per-button prop overrides, `tabindex`, `disabled`, `ariaLabel`/`ariaLabelledby` | Standard styling/accessibility surface. |

**Real, confirmed finding, binding:** Vue's real `BaseOrderList.vue` declares **no `dragdrop` prop and no `filterBy`/filter-related field of any kind** — confirmed via full-file read of both `BaseOrderList.vue` and `OrderList.vue`. Vue's real OrderList is **button-move-only**, with neither drag/drop nor filtering as real upstream features. This is not a scope cut this specification is choosing — it is the actual, verified shape of real PrimeVue OrderList. `UOrderList` (Vue) must not port drag/drop or filtering as if they existed in real source. Vue's real `OrderList.vue` composes `Listbox` (`import Listbox from 'primevue/listbox'`) directly as a child component — confirmed at the template level — matching Ultimate's own `UListbox` (`packages/vue/src/listbox/Listbox.vue`, real props confirmed: `options`, `optionLabel`, `multiple`, `filter`, `emptyMessage`) as the composition target.

**Foundation tier, all 3 frameworks:** bare `useComponentBase`(React)/`createBaseComponent`(Vue)/`UBaseComponent`(Angular) — confirmed via each framework's real base class (`OrderListBase.js extends ComponentBase`; `BaseOrderList.vue extends BaseComponent`; Angular's `OrderList` component has no CVA/`ControlValueAccessor` surface). No model-holder/editable-holder tier — OrderList is not a form control in the CVA sense in any framework.

**Disclosed scope cut (non-goal, binding):** no passthrough (`pt`/`ptOptions`) surface, matching every existing Ultimate component. Angular's `controlsPosition` (`'left' | 'right'`) and per-button ARIA-label override props are real but excluded from this batch's scope, following the established "smaller surface than upstream" precedent (matching, e.g., `UInputNumber`'s own established cut-disclosure precedent) — not required for Batch 3's own acceptance criteria (§11); may be added in a later pass if real pressure emerges, not decided here.

### 3.2 PickList — Angular, React, Vue

**Canonical capability:** PickList (Data family, per Parity Matrix §1.5). **Frameworks:** all 3, each realized independently.

**Real source grounding:** PrimeNG `packages/primeng/src/picklist/picklist.ts`; PrimeReact `components/lib/picklist/{PickList.js, PickListBase.js, PickListSubList.js}`; PrimeVue `packages/primevue/src/picklist/{PickList.vue, BasePickList.vue}`.

**Common core, confirmed real in all 3 frameworks:** dual-list transfer — two side-by-side lists (source/target) with move-between-lists controls, plus each side's own independent internal reorder controls (same button-move mechanism as OrderList's own common core — move-up/top/down/bottom).

**Drag/drop — framework-specific, not part of the common core, same split as OrderList (§3.1):** Angular (real, optional, `@angular/cdk/drag-drop`) and React (real, optional, native HTML5) each support drag/drop as an additive mechanism; **Vue's real PickList has no drag/drop of any kind** — confirmed via full-file read of `BasePickList.vue`/`PickList.vue`, matching OrderList's own verified Vue shape exactly.

**Real, load-bearing finding — the data model genuinely diverges across frameworks, binding on this specification:**
- **Angular:** two independent inputs, `source()` and `target()` (confirmed via the real `sourceOptions`/`targetOptions` getters: `get sourceOptions() { return [...(this.source() || [])]; }`) — two separate arrays, not one combined structure.
- **React:** two independent props, `source` and `target` (confirmed in `PickListBase.js`'s real `defaultProps`: `source: null, target: null`) — matching Angular's shape exactly.
- **Vue:** **one combined prop**, `modelValue`, typed `Array` with a real default of `() => [[], []]` — an array-of-two-arrays pair (confirmed in `BasePickList.vue`). This is a materially different data-model shape from Angular/React's two-separate-props approach, not a naming difference. `UPickList` (Vue) must use Vue's own real `[[], []]`-pair model, not force Angular/React's two-separate-props shape onto Vue — per ADR-006, no cross-framework API-shape forcing is authorized.

**Required behavioral responsibility per framework, derived directly from real source:**

**Angular:** same `dragdrop` (`boolean`, default `false`, real `@angular/cdk/drag-drop` mechanism), `filterBy`/`filterLocale` (`FilterService`-based, independently configurable per source/target side — confirmed via separate `showSourceFilter`/`showTargetFilter` booleans, default `true`), `dataKey`, `metaKeySelection`, `breakpoint`, `sourceHeader`/`targetHeader`, `sourceStyle`/`targetStyle`, `showSourceControls`/`showTargetControls` (default `true`), `sourceTrackBy`/`targetTrackBy`, `disabled`, `sourceOptionDisabled`/`targetOptionDisabled`. Real source composes 2 independent `p-listbox` instances (confirmed at the template level: separate `[options]="sourceOptions"`/`[options]="targetOptions"` bindings on two `p-listbox` elements).

**Narrow, expressly authorized Angular foundation exception:** current Ultimate `UListbox` hardcodes `@for (option of visibleOptions(); track $index)` and exposes no `trackBy` input. Add exactly one generic Angular `UListbox` `trackBy` input with the callback contract `(index: number, option: unknown) => unknown`. When supplied, `UListbox` invokes that callback with the rendered option's index and option and uses its return value as the tracking key. When absent, the tracking expression returns the index, preserving the current index-tracking behavior. This is generic list rendering support, not PickList behavior: it adds no source/target state, transfer controls, selection policy, or other PickList semantics to `UListbox`. Angular `UPickList` must map `sourceTrackBy` only to the source `UListbox.trackBy` and `targetTrackBy` only to the target `UListbox.trackBy`.

**React:** same `dragdrop`, `filter`/`filterBy`/`filterMatchMode` (independently configurable via `showSourceFilter`/`showTargetFilter`, default `true`), `dataKey`, `metaKeySelection`, `breakpoint`, `sourceHeader`/`targetHeader`, `sourceStyle`/`targetStyle`, `showSourceControls`/`showTargetControls` (default `true`). Real source does **not** compose PrimeReact's own `Listbox` (same divergence as OrderList) — renders via its own `PickListSubList.js`, doubled.

**Vue:** `dataKey`, `metaKeySelection`, `breakpoint`, `striped`, `scrollHeight`, `showSourceControls`/`showTargetControls`, `buttonProps` + per-button overrides. **Confirmed via full-file read of `BasePickList.vue` (116 lines) and `PickList.vue` (643 lines): zero `dragdrop`-related field, zero `filterBy`/`filter`/`FilterService`-related field anywhere in either file.** Vue's real PickList is button-move-only, matching OrderList's own confirmed pattern exactly — not merely inferred by analogy, independently re-verified. Vue's real `PickList.vue` composes `Listbox` (`import Listbox from 'primevue/listbox'`) twice, once per side.

**Foundation tier, all 3 frameworks:** bare tier, same as OrderList (§3.1) — confirmed via each framework's real base class, no CVA/`ControlValueAccessor` surface in any framework's real source.

**Disclosed scope cut (non-goal, binding):** same as OrderList (§3.1) — no passthrough surface; per-button ARIA-label overrides excluded from this batch's scope, not required for Batch 3's own acceptance criteria (§11).

### 3.3 DataView — Angular, React, Vue

**Canonical capability:** DataView (Data family, per Parity Matrix §1.5). **Frameworks:** all 3, each realized independently.

**Real source grounding:** PrimeNG `packages/primeng/src/dataview/dataview.ts`; PrimeReact `components/lib/dataview/{DataView.js, DataViewBase.js}`; PrimeVue `packages/primevue/src/dataview/{DataView.vue, BaseDataView.vue}`.

**Core behavioral model, confirmed real in all 3 frameworks:** a grid/list-toggle display of a dataset, with pagination and sort support.

**Required behavioral responsibility, common core across all 3 frameworks (prop names verified identical or near-identical per framework):**

| Prop (real name, all 3 frameworks unless noted) | Required behavior |
|---|---|
| `value` (`any[]`) | Source data array. |
| `layout` (`'list' \| 'grid'`, default `'list'`) | Display mode. Angular/React implement this via separate template/render branches per mode; Vue implements it via separate `#list`/`#grid` named slots — different mechanism, same functional effect, framework-native per ADR-006. |
| `paginator` (`boolean`, default `false`) | Enables pagination — **real, direct composition of each framework's own already-Built `UPaginator`** (confirmed: Angular imports `PaginatorModule` and renders real `p-paginator`; React imports `{ Paginator } from '../paginator/Paginator'` and renders it as a real child, `createPaginator()`; Vue imports and renders `DVPaginator` from `primevue/paginator`). This is the exact composition pattern `UTable` (`packages/{ng,react,vue}/src/table/`) already uses — `UDataView` composes Ultimate's own `UPaginator` (real contract confirmed: React's `UPaginatorProps` = `{first, rows, totalRecords, pageLinkSize?, onPageChange}`, fully controlled) the identical way. |
| `rows`, `first`, `totalRecords`, `rowsPerPageOptions`, `paginatorPosition` (default `'bottom'`), `alwaysShowPaginator` (default `true`), `currentPageReportTemplate` | Standard Paginator-composition surface, matching `UPaginator`'s own real contract. |
| `sortField`, `sortOrder` | Real, present in all 3 frameworks' actual prop surface — matches Table's own already-established sort field shape, no new pattern. |
| `lazy` (`boolean`, default `false`) | Real in all 3 — same lazy-load pattern already established by Table/Scroller/DataScroller. |
| `loading` (`boolean`, default `false`), `loadingIcon` | Loading-state indicator. |
| `itemTemplate` | Required per-item render function — DataView has no fixed row shape. |
| `emptyMessage`, `dataKey`, `trackBy` | Standard rendering/identity surface. |

**Filtering — confirmed genuine cross-framework asymmetry, binding on this specification, not a blocker:** Angular's real `dataview.ts` injects `FilterService` (`filterService = inject(FilterService)`), declares a public `filterBy`/`filterLocale` input, and exposes a real `filter(filter, filterMatchMode = 'contains')` method that calls `this.filterService.filter(this.value, searchFields, filter, filterMatchMode, this.filterLocale)` — the same mechanism already used by Table/OrderList/PickList in Angular. **React's and Vue's real `DataViewBase.js`/`BaseDataView.vue` declare no `filterBy`/filter-related field at all** — confirmed via full-file reads of both (React's complete 39-field `defaultProps`; Vue's complete 16-field props list) — genuinely absent, not merely undocumented, matching the prior DECISION-C evidence-closure pass's own finding exactly. `UDataView` (Angular) must implement real filtering via the already-Built `FilterService`-equivalent mechanism; `UDataView` (React, Vue) must not port filtering, since real source has none.

**Foundation tier, all 3 frameworks:** bare tier — no CVA, confirmed via each framework's real base class (`DataViewBase.js extends ComponentBase`; `BaseDataView.vue extends BaseComponent`; Angular's DataView has no `ControlValueAccessor` surface).

**Disclosed scope cut (non-goal, binding):** `paginatorTemplate` (a template-string customization of which paginator controls render, real in all 3 frameworks) is excluded — `UDataView` uses Ultimate's own fixed `UPaginator` rendering, matching the established "smaller surface than upstream" precedent (e.g., Table's own already-disclosed filter-vocabulary narrowing). Not required for Batch 3's own acceptance criteria (§11). No passthrough surface.

### 3.4 OrganizationChart — React, Vue only

**Canonical capability:** OrganizationChart (Panel/Layout/Display/Feedback family, per Parity Matrix §1.6). **Frameworks:** React, Vue only. **Angular is permanently excluded** — DECISION-D, not part of this batch's scope, not deferred (§1).

**Real source grounding:** PrimeReact `components/lib/organizationchart/{OrganizationChart.js, OrganizationChartBase.js, OrganizationChartNode.js, organizationchart.d.ts}`; PrimeVue `packages/primevue/src/organizationchart/{OrganizationChart.vue, BaseOrganizationChart.vue}`.

**Core behavioral model, confirmed real in both frameworks:** a hierarchical tree-chart layout rendering `OrganizationChartNodeData`-shaped nodes, with expand/collapse per node and an optional selection mechanism — structurally independent of Tree in both frameworks (no `TreeNode` import, no shared expansion-state mechanism with either framework's real Tree component; already established by the DECISION-D scope-clarification pass, not re-derived here).

**Required behavioral responsibility, React** (from real `organizationchart.d.ts`'s actual `OrganizationChartProps` interface):

| Prop (real PrimeReact name/type) | Required behavior |
|---|---|
| `value` (`OrganizationChartNodeData[]`) | Root-level node array. Each node: `{className?, expanded?, children?, selectable?, label?}` (real `OrganizationChartNodeData` interface, confirmed in full). |
| `selectionMode` (`'single' \| 'multiple'`) | Real selection-cardinality vocabulary — matches `uix-data`'s own already-Built `SelectionMode` type exactly, no new primitive needed. |
| `selection` (`OrganizationChartNodeData \| OrganizationChartNodeData[] \| null`) | Selected node(s). |
| `togglerIcon` | Upstream evidence only; expressly excluded from Batch 3 by the binding scope cut below. |

**Internal behavior, React:** expand/collapse state is local `React.useState(node.expanded)` per node instance (confirmed in `OrganizationChartNode.js`, line 22) — seeded from the node's own `expanded` field, not a global expanded-keys map, not a mutate-in-place write onto the node object. This is a real, distinct third mechanism (neither Tree's key-map nor Angular OrganizationChart's own object-mutation).

**Required behavioral responsibility, Vue** (from real `BaseOrganizationChart.vue`'s actual props):

| Prop (real PrimeVue name/type) | Required behavior |
|---|---|
| `value` (untyped, `null` default) | Root-level node data. |
| `selectionKeys` (untyped, `null` default) | External key-map for selection — a real, distinct mechanism from React's `selection` object-reference approach; framework-native, not forced to match. |
| `selectionMode` (`String`, `null` default) | Same single/multiple vocabulary as React. |
| `collapsible` (`Boolean`, default `false`) | Whether nodes can be collapsed at all. |
| `collapsedKeys` (untyped, `null` default) | External key-map for collapse state — Vue's own real mechanism, confirmed distinct from React's per-node local state and from Tree's own `expandedKeys` (no shared code, pattern-family resemblance only, already established by the DECISION-D pass). |

**Foundation tier, both frameworks:** bare tier — `useComponentBase`(React)/`createBaseComponent`(Vue), confirmed via real base class (`OrganizationChartBase.js extends ComponentBase`; `BaseOrganizationChart.vue extends BaseComponent`). No CVA/model-holder surface in either framework's real source.

**Dependency/composition:** neither framework's real source composes any other not-yet-built Ultimate capability. No blocker beyond standard bare-tier foundation, already Built.

**Disclosed scope cut (non-goal, binding):** no passthrough surface. React's `togglerIcon` prop and Vue's own icon-customization surface are excluded — `UOrganizationChart` uses Ultimate's own established icon convention in both frameworks, not required for Batch 3's own acceptance criteria (§11).

---

## 4. Implementation model (binding on the eventual Plan)

Restated from the Roadmap and Batch 3 Brainstorming/Selection stage, as binding constraints on every task the Implementation Plan creates:

1. **Batch membership is capability-based**, not framework-based. Each of the 4 capabilities in §3 is realized independently per eligible framework — OrganizationChart's React/Vue-only scope is expected and correct, not a deviation requiring justification beyond §1's own explanation of its permanent nature.
2. **No Unverified capability is promoted.** None of the 11 combinations in this batch was ever Unverified — all 11 were independently confirmed "Eligible now" or "Eligible only after an ordinary prerequisite" by the Batch 3 eligibility-verification pass. The 7 still-Unverified pairs from the Parity Reconciliation pass remain untouched and out of scope (§1).
3. **Existing Ultimate architecture and foundations are reused, not re-derived** — see §6. `UListbox` and `UPaginator` are the two load-bearing compositions this batch relies on; both are already Built and their real contracts are cited in §3. The only exception is §3.2's expressly authorized, generic Angular `UListbox` `trackBy` input: it is a bounded extension of the existing foundation solely as generic list-rendering support, not new PickList semantics or broader foundation work.
4. **Dependency correctness governs sequencing** — see §5. The `@angular/cdk/drag-drop` prerequisite (§5 item 1) is the only cross-cutting sequencing rule this batch introduces; everything else may proceed in any order or in parallel.
5. **Proof-by-exception applies.** No new feasibility study is authorized for any of the 11 combinations unless implementation reveals a genuinely new architectural pattern, an unresolved dependency, or another meaningful exception not already known — in which case implementation halts on that specific realization and escalates, per the Operating Context's own §5 criteria.
6. **Framework-native implementation is mandatory** — no shared cross-framework implementation, no forced identical API shape, consistent with every prior Ultimate component (Option B: reference, not verbatim; ADR-006/018/024/032). §3.2's PickList data-model divergence (Vue's `[[], []]`-pair vs. Angular/React's two-separate-props) is the clearest instance of this rule in this batch — it must not be flattened to one shape across frameworks.
7. **No Prime runtime dependency**, per ADR-004 — every capability is adapted/reimplemented, never re-exported or wrapped. Enforced by the existing `validate-dependency-ceiling.mjs` CI gate. **`@angular/cdk/drag-drop` is explicitly outside this gate's scope** — confirmed by direct read of `scripts/provenance/validate-dependency-ceiling.mjs`'s own source, which restricts only `primeng`/`primevue`/`primereact` direct dependencies and `@primeuix/*` version ceilings; `@angular/cdk` is Angular's own first-party ecosystem package, not Prime-derived, and is not checked by this gate at all.
8. **All existing exclusions and protected areas are respected as-is** — DECISION-B, DECISION-C, DECISION-D, DECISION-E, and Angular OrganizationChart's own permanent exclusion are not touched by any task this specification authorizes.
9. **The Angular CDK dependency addition is ordinary implementation-time work, not a new architectural decision.** It must be disclosed explicitly in the Implementation Plan and in the eventual PR/commit history (matching this repo's own new-dependency disclosure convention), but does not require its own feasibility study, ADR, or separate gated workstream — per the Batch 3 Brainstorming/Selection stage's own explicit decision (§2 item 4).

---

## 5. Dependency and sequencing requirements

1. **`@angular/cdk/drag-drop` dependency disclosure/approval must be sequenced first, ahead of Angular OrderList's and Angular PickList's own implementation work** — an explicit intra-batch ordering, matching Batch 1's own Vue-infrastructure-prefix precedent (§3.0 of that batch's spec). **This dependency is introduced specifically, and only, to support the in-scope real drag/drop behavior named for Angular OrderList/PickList in §3.1/§3.2** — it is not a generic or speculative addition. This is a small, ordinary dependency-addition step (confirmed via real source: real PrimeNG OrderList/PickList import `CdkDragDrop`, `DragDropModule`, `moveItemInArray` from `@angular/cdk/drag-drop`, and this package has zero prior usage anywhere in the monorepo — confirmed via `packages/ng/README.md`'s own explicit statement, "`@angular/cdk` is not used anywhere in this package's dependency closure," and a repo-wide `package.json`/source grep returning zero matches). **This remains ordinary dependency disclosure/approval work — not an architectural decision and not a separate feasibility workstream** (§4 item 9). The Implementation Plan's own task for this step must: add `@angular/cdk` as a real dependency to `packages/ng/package.json`, confirm `validate-dependency-ceiling.mjs` still passes (it is not expected to flag this, per §4 item 7's own finding — that gate's own source was directly read and confirmed to check only `primeng`/`primevue`/`primereact` and `@primeuix/*` ceilings, nothing else — but the gate must still be run after the addition and its clean result confirmed, not assumed), and disclose the addition in the task's own commit message.
2. **React OrderList/PickList have no drag/drop dependency step** — native HTML5 drag/drop is a browser API, zero package addition required.
3. **Vue OrderList/PickList have no drag/drop or filter implementation at all** — confirmed real upstream absence (§3.1, §3.2); no sequencing implication.
4. **No capability in §3 depends on any other capability in §3.** OrderList, PickList, DataView, and OrganizationChart may each proceed independently and in any order (subject to item 1's Angular-CDK prefix for OrderList/PickList's own Angular realizations specifically).
5. **`UListbox` and `UPaginator`, the two Ultimate foundations this batch composes, are already Built in all 3 frameworks** — confirmed via direct inspection (§3.1, §3.2, §3.3). No task in this batch is blocked on either.
6. **No capability in §3 depends on anything outside §3.** Verified: every capability's real dependency (Listbox, Paginator, the `@angular/cdk` addition) resolves either to an already-Built foundation or to this batch's own named prerequisite (item 1). No task requires waiting on a deferred item (§1) or an excluded item (§1).

---

## 6. Reuse of existing Ultimate foundations (binding — no new foundation work except the expressly authorized generic Angular `UListbox` `trackBy` input)

| Framework | Capability | Foundation reused | Evidence |
|---|---|---|---|
| Angular, React, Vue | OrderList, PickList | Bare tier (`useComponentBase`/`createBaseComponent`/`UBaseComponent`) + `UListbox` composition (Angular/Vue real; React independent per §3.1's own divergence finding) | `packages/{ng,react,vue}/src/listbox/`, real props confirmed in §3.1/§3.2 |
| Angular only | Generic `UListbox` rendering support | Existing `UListbox` gains exactly one generic `trackBy` input with the callback contract `(index: number, option: unknown) => unknown`: an omitted input makes the tracking expression return the index; a supplied callback's return value drives list rendering. It has no PickList semantics. | `packages/ng/src/listbox/listbox.ts` (current `@for` hardcodes `track $index`; no `trackBy` input), §3.2 |
| Angular, React, Vue | DataView | Bare tier + `UPaginator` composition (all 3, real and direct) | `packages/{ng,react,vue}/src/paginator/`, real `UPaginatorProps` contract confirmed in §3.3 |
| React, Vue | OrganizationChart | Bare tier only, no composition dependency | `react-core`/`vue-core`'s own bare-component tiers, already Built |
| Angular only | OrderList, PickList (drag/drop mode) | New: `@angular/cdk/drag-drop`, a real Angular-first-party package, not Prime-derived — ordinary dependency addition per §4 item 9/§5 item 1 | `packages/ng/package.json` (to be added), `validate-dependency-ceiling.mjs` (confirmed out of this gate's scope) |
| All | — | `uix-utils`, `uix-styled`, `uix-styles`, `uix-motion` | Already built, Layer 0 per Dependency Map §B |

`uix-data`'s `SelectionMode` type is directly reusable for OrganizationChart's `selectionMode` prop in both React and Vue (§3.4) — confirmed matching vocabulary, no new primitive needed. No new base-class tier, no new shared package export, and no new architectural pattern is authorized by this specification beyond the one named dependency addition (§5 item 1) and the expressly authorized generic Angular `UListbox` `trackBy` input above. No other foundation work is authorized.

---

## 7. Framework-specific requirements where evidence requires them

- **Angular — `@angular/cdk/drag-drop` addition.** See §5 item 1. This is the only genuinely new dependency any task in this batch introduces.
- **React — no shared `Listbox` composition for OrderList/PickList.** Real PrimeReact source does not compose its own `Listbox` component for either capability (§3.1) — `UOrderList`/`UPickList` (React) remain **independent, framework-native implementations**. `UListbox` is a **preferred existing foundation, reused where its real contract genuinely fits** — never a mandatory implementation mechanism, and never forced on in a way that would distort the verified real PrimeReact behavior. Not a forced 1:1 port of `OrderListSubList.js`/`PickListSubList.js` either — a genuine gap between `UListbox`'s contract and either capability's own real needs is a proof-by-exception finding, not something to route around by weakening the port.
- **Vue — PickList's real `[[], []]`-pair data model.** `UPickList` (Vue) must use `modelValue: Array` with a `[[], []]` default, matching real source exactly — not Angular/React's two-separate-props shape (§3.2).
- **Vue — OrderList/PickList's real absence of drag/drop and filtering.** Both must be built as button-move-only, no filter input — not a disclosed scope cut choice, the actual verified shape of real upstream (§3.1, §3.2).
- **Angular, React, Vue — DataView's real filtering asymmetry.** Angular implements real `FilterService`-based filtering; React/Vue do not implement filtering at all, matching real source's own genuine absence (§3.3) — not a cut, an accurate port.
- **React, Vue — OrganizationChart's real selection-state mechanisms genuinely differ** (React: per-node local `useState`; Vue: external `collapsedKeys`/`selectionKeys` maps) — each framework's own real mechanism, not forced to match (§3.4).

---

## 8. Exclusions and deferred items — reasons restated for traceability

| Item | Reason | Source |
|---|---|---|
| Chart, Editor, Tree, TreeTable, TreeSelect, Angular `config` (full surface) | Architectural exceptions — DECISION-B/D, not reopened | Roadmap §7 |
| Angular OrganizationChart | **Permanent** exclusion — confirmed genuine Tree-mechanism dependency, DECISION-D scope clarification | Roadmap §12.4, `BLUEPRINT_GAPS.md` DECISION-D entry |
| Table's own fuller filter-operator vocabulary | `BLUEPRINT_GAPS.md` DECISION-C's own separately-tracked remainder, untouched by this batch's resolution | Roadmap §12.5, `BLUEPRINT_GAPS.md` DECISION-C entry |
| React Ripple, Vue Fluid | Existing standing deferrals; not bundled into this batch | Roadmap §7 |
| Vue `RadioButtonGroup`/`CheckboxGroup` | Confirmed Vue-specific supporting implementations, not separate canonical capabilities | Batch 2 Brainstorming/Decision (unchanged) |
| The 7 still-Unverified capability/framework pairs | Not promoted without further evidence | Parity Matrix §4.1b, Roadmap §6 |

---

## 9. Testing / verification expectations

Every Batch 3 capability, for every framework it is realized in, must meet the same bar every already-Built Ultimate component met:

1. **Unit tests** covering each capability's own stated behavior (§3), following each framework's existing test conventions. Specifically: OrderList/PickList's move-button reordering (all 4 directions), Angular's real drag/drop (`CdkDragDrop` event handling), React's real drag/drop (native `dragstart`/`dragover`/`drop` event simulation); DataView's grid/list toggle, Paginator composition (page-change events genuinely update the rendered window), Angular's real filtering; OrganizationChart's expand/collapse per node, selection (single/multiple mode). The expressly authorized generic Angular `UListbox` `trackBy` input requires regression coverage for: omitted-input default/index tracking; supplied custom tracking; stable PickList selection and subsequent deselection after an equivalent-object refresh; and independent forwarding of `sourceTrackBy` to the source `UListbox.trackBy` and `targetTrackBy` to the target `UListbox.trackBy`. **Where §3 establishes that a real upstream mechanism is genuinely absent for a given framework** (Vue OrderList/PickList's drag/drop and filtering; React/Vue DataView's filtering) **, tests must guard against that absence being silently violated by a future change** — i.e., confirm the implementation does not accidentally introduce behavior the verified upstream contract does not contain, where that absence is load-bearing to the Spec's own binding findings (§7). The concrete test mechanism for each such guard (which assertion, which DOM/state check) is Implementation Plan/task-level detail, not specified here — matching the established precedent already used for Batch 2's own InlineMessage dead-code-exclusion guard, without mandating that specific test's own assertion shape.
2. **No regression** to any already-Built component or foundation tier — the full existing test suite passes after each task, not just the new capability's own tests.
3. **Accessibility parity** with the pattern already established for Built components (ARIA roles/labels where real source has them).
4. **Cross-framework consistency check** where `uix-styles`/`uix-styled` token resolution applies, matching `packages/themes/test/cross-framework-consistency.test.ts`, for any capability sourcing styling via `dt()`.
5. **Dependency-ceiling gate** (`validate-dependency-ceiling.mjs`) passes after every task, including the Angular CDK addition task specifically (confirmed expected to pass, per §4 item 7, but must be run and its result reported, not assumed).
6. **Documentation update at closeout**: `COMPONENT_INVENTORY.md` (Angular's 3 rows: OrderList, PickList, DataView — the same rows already updated to `ADAPT` by the DECISION-C resolution, now moved to `Built`), `docs/architecture/REACT_COMPONENT_STATUS.md` (React's 4 rows), `docs/architecture/VUE_COMPONENT_STATUS.md` (Vue's 4 rows).
7. **Single Verification pass and single Final Review/Closeout for the whole of Batch 3** — not per-capability.

---

## 10. Compatibility and architectural constraints

- **MIT-only baseline** (ADR-005) — no capability in §3 introduces a new Prime dependency; all Prime-sourced evidence remains within the pinned PrimeNG 21.1.9 / PrimeReact 10.9.9 / PrimeVue 4.5.5 tarballs already in `.vendor-cache/`. `@angular/cdk`'s own license (MIT, matching Angular's own) must be confirmed as part of the Implementation Plan's own dependency-addition task, consistent with this repo's existing provenance discipline.
- **No forced API-shape parity across frameworks** (ADR-006) — confirmed consistent with §4 item 6, most visibly in PickList's real per-framework data-model divergence (§3.2) and OrganizationChart's real per-framework selection-state divergence (§3.4).
- **No passthrough (`pt`/`ptOptions`) surface** on any Batch 3 capability, consistent with each framework's existing Option-B ADR posture.
- **Package versioning** — Batch 3 does not touch DECISION-E; no package rename or version-scheme change is in scope.

---

## 11. Acceptance criteria (sufficient to support a subsequent Implementation Plan)

Batch 3 is complete when, for every capability in §3 and every framework marked eligible for it:

1. The capability is implemented following that framework's own established architecture (§6, §7) — real, source-verified against the pinned Prime tarball, not invented.
2. §9's testing/verification bar is met (unit tests including regression guards for every real, load-bearing absence named in §3/§7 — Vue's drag-drop/filter absence, React/Vue's DataView filter absence — no regression, accessibility parity, cross-framework consistency where applicable, dependency-ceiling clean including the CDK addition).
3. Angular's `@angular/cdk/drag-drop` dependency was added, disclosed, and confirmed not to trip `validate-dependency-ceiling.mjs`, sequenced ahead of Angular OrderList's/PickList's own implementation (§5 item 1).
4. Angular `UListbox` exposes exactly the one generic `trackBy` input in §3.2/§6: omitting it preserves index tracking, it carries no PickList semantics, and Angular PickList forwards `sourceTrackBy` and `targetTrackBy` to their corresponding child `UListbox` instances. The §9 regression coverage proves default/index tracking, custom tracking, stable selection and deselection after an equivalent-object refresh, and both forwarding paths.
5. PickList's Vue implementation uses the real `[[], []]`-pair `modelValue` shape, not Angular/React's two-separate-props shape (§3.2, §7).
6. DataView's Angular implementation includes real filtering; React/Vue implementations do not (§3.3, §7).
7. OrganizationChart is realized for React and Vue only — no Angular realization exists anywhere in this batch's output (§1, §3.4).
8. `COMPONENT_INVENTORY.md`, `REACT_COMPONENT_STATUS.md`, and `VUE_COMPONENT_STATUS.md` are each updated for every capability/framework closed in this batch.
9. No capability outside §3's exact list was implemented; no capability inside §3 was silently dropped or substituted.
10. Except for the expressly authorized generic Angular `UListbox` `trackBy` exception in §3.2/§6, no architectural exception, protected decision, or unresolved discrepancy named in §1/§8 was touched, reinterpreted, or resolved.
11. A single Final Review/Closeout confirms all of the above for the whole batch, then the branch proceeds to merge per the Roadmap's own lifecycle.

---

## 12. Downstream clarifications — non-blocking, explicitly not Spec-level uncertainties

Everything this specification needed to resolve at the Spec level is resolved — including §3.2's expressly authorized generic Angular `UListbox` `trackBy` exception — and §3's own "Disclosed scope cut (non-goal, binding)" notes for OrderList, PickList, DataView, and OrganizationChart are firm decisions, not open questions. The two items below are genuinely different in kind: neither is a gap in this Spec's own scope or requirements — both are administrative/downstream matters correctly deferred to a later stage or a separate, unrelated workstream.

1. **Two non-blocking documentation follow-ups**, discovered during the Batch 3 eligibility-verification pass, entirely outside this batch's own scope and unrelated to Batch 3's requirements: the Parity Matrix's separate `DragDrop` capability row still references OrderList/PickList as "both exceptions for unrelated reasons" (stale since DECISION-C's resolution); the Parity Matrix's React/Vue OrganizationChart cells still say "not yet verified eligible beyond this question" (now superseded by this batch's own eligibility-verification pass). Neither is a Batch 3 acceptance-criteria item — both are candidates for a future, separate documentation-hygiene pass, not addressed by this specification or its eventual Plan.
2. **React OrderList's/PickList's exact `UListbox`-reuse outcome** (§3.1, §7) is Implementation Plan/task-level detail by design, not a Spec-level gap — §3.1/§7 already state the binding rule (`UListbox` preferred where its contract fits, never mandatory, proof-by-exception governs any real gap). This item records that the *specific outcome* (does the contract fit cleanly, or does a gap surface) is necessarily unknown until implementation begins — the *rule* governing that outcome is already fully specified and is not itself open.

Neither item blocks Spec Review or requires any further Spec-level decision.

---

## Status

**Spec Review passed on 2026-09-22 after the explicitly authorized generic Angular `UListbox` `trackBy` amendment; awaiting human approval.**

This specification does not authorize implementation. It defines Batch 3's exact, evidence-derived scope and binding constraints for the 11 capability/framework combinations the eligibility-verification pass confirmed ready, plus the one expressly authorized generic Angular `UListbox` `trackBy` foundation exception required for Angular PickList forwarding.
