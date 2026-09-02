# Table — Cross-Framework Component Implementation Specification

**Status:** Draft for review
**References:** `docs/architecture/BLUEPRINT.md`, `docs/architecture/research/2026-09-02-table-data-component-architecture.md`, `docs/architecture/research/2026-09-02-table-editing-grouping-dragdrop-architecture.md`, ADR-043 (`docs/architecture/DECISIONS.md`), `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md`, `docs/architecture/checksums.json`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

**No architectural fork was encountered while preparing this spec.** Every design decision below either restates an already-approved conclusion (ADR-043, the two Table research reports) or resolves an ordinary implementation-level question directly from real pinned source. Where real evidence was insufficient, the item is marked `NEEDS IMPLEMENTATION-TIME VERIFICATION` rather than invented.

---

## 1. Status / Purpose / Scope

**Purpose:** Define the implementation-ready design for Ultimate's Table component across UltimateNG, UltimateReact, and UltimateVue — the largest and most architecturally significant component in the Data family, and the forcing function ADR-043 itself named for the one deliberately deferred question (filter operator/constraints).

**Scope:** Table only. TreeTable, Tree, TreeSelect, OrganizationChart, DataView, OrderList, PickList, and Scroller/Paginator as standalone components are out of scope for this spec (each has its own future spec; this document treats Scroller and Paginator only as compositional dependencies of Table, per the two research reports' confirmed composition findings).

**Out of scope for this spec (explicitly, per the source directive):**
- Row/column reordering via drag-drop (confirmed OrderList/PickList territory, not Table's; Table has no drag-drop feature in any of the three real Prime implementations).
- Any new `uix-data` primitive (none is justified — see §5).
- TreeTable-as-grid (separate future spec; shares `SortMeta`/`FilterMetadata` types but diverges on value shape exactly as documented in the first research report §6).
- Column virtualization beyond what `uix-data`'s existing `calculateNumItemsInViewport`/`calculateLast` already cover (frozen columns, column resize/reorder are UI-only concerns handled per framework, not investigated here — flagged where relevant below).

---

## 2. Architectural Baseline

This spec inherits, without modification:

- **`@ultimate/uix-data`** (ADR-043) — six primitives: `equals`, `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`. Table consumes all six. No new export is added by this spec.
- **Filter operator/constraints deferral** (ADR-043, sharpened by the first Table research report §4) — real 2-vs-1 shape split confirmed. This spec resolves it as a **framework-native representation choice**, not a shared-package addition (§9).
- **Tree-family exclusion** (ADR-043, reconfirmed by both Table research reports) — not reopened; Table has no hierarchical concerns.
- **Row grouping reuses `SortMeta`** (second Table research report §4.4) — not reopened; documented as a Table-implementation convention (§13).
- **Drag/drop is not a Table concern** (second Table research report §5) — not reopened; Table's reordering, where it exists at all, is out of this spec's scope (Table itself has no reorder feature in any of the three real Prime implementations — reordering belongs to OrderList/PickList only, already closed).
- **Table↔Paginator and Table↔Scroller composition** — confirmed real component instantiation in all three frameworks by both research reports and re-confirmed during this spec's own targeted verification (§14).

This spec adds, from targeted real-source verification performed while preparing it (not a new broad research pass):

- Vue's cell/row editing mechanics, previously `UNVERIFIED` (§11, §12).
- Confirmation that Table's accessibility/keyboard vocabulary (`role="row"`, `role="columnheader"`, `aria-sort`, keydown handlers) is strongly convergent across all three frameworks (§15).

---

## 3. Component Responsibilities

Table is a flat-identity, selection-capable grid component (per the first research report's §6 taxonomy: "flat-identity, selection-capable grid components that compose with Paginator/Scroller"). Its responsibilities, confirmed by real source in all three frameworks:

- Render tabular data (`value: T[]`) as rows/columns, with per-column templating.
- Own or participate in (per framework's controlled/uncontrolled idiom) selection, sort, filter, pagination, virtualization, row/cell editing, and row grouping state.
- Compose with a real Paginator instance for pagination UI (not reimplement it).
- Compose with a real Scroller instance for virtual-scroll UI (not reimplement it).
- Emit change/lifecycle events for every stateful concern, using each framework's native event/callback idiom.
- Provide accessible grid semantics (`role="table"`/`role="row"`/`role="columnheader"`) and keyboard navigation.

Table is explicitly **not** responsible for: hierarchical data (TreeTable's job), list-transfer/reorder semantics (OrderList/PickList's job), or drag-drop (out of scope entirely for Table, confirmed absent in all three real implementations).

---

## 4. Public API by Framework

This section states the public input/prop/state surface per framework, following each framework's own idiom rather than forcing a shared shape. Names below are Ultimate-native but preserve Prime-recognizable vocabulary where the underlying concept is genuinely shared (per the existing `uix-data` spec's established naming precedent — generic/utility-level names are not renamed; component-level public API naming is Ultimate's own call at implementation time and is **not** finalized by this spec, consistent with how `uix-data`'s own package name remained provisional).

### 4.1 UltimateNG (Angular)

Two-way-bindable `@Input()`/`@Output()` pairs, matching PrimeNG's real `table.ts` surface (verified: `table.ts:744-974` and surrounding):

- `value: T[]`
- `dataKey: string`
- `selectionMode: 'single' | 'multiple' | undefined`, `selection: T | T[]` + `selectionChange`, `compareSelectionBy: 'equals' | 'deepEquals'`
- `sortMode: 'single' | 'multiple'`, `sortField`/`sortOrder` + `sortFieldChange`/`sortOrderChange`, `multiSortMeta: SortMeta[]` + `multiSortMetaChange`
- `filters: Record<string, FilterMetadata | FilterMetadata[]>` (array form carries operator per-element — §9)
- `paginator: boolean`, `first` + `firstChange`, `rows` + `rowsChange`, `totalRecords`, `rowsPerPageOptions`
- `virtualScroll: boolean`, `virtualScrollItemSize`, `virtualScrollOptions`, `lazy: boolean`, `lazyLoadOnInit: boolean`
- `editMode: 'cell' | 'row'`, `editingRowKeys: Record<string, boolean>` (key-map, `dataKey`-scoped)
- `rowGroupMode: 'subheader' | 'rowspan'`, `groupRowsBy`, `groupRowsByOrder`
- Always-internal, always-emitting: the component owns working state and always fires change events; the parent chooses one-way (`[first]`) vs two-way (`[(first)]`) binding at the template level — there is no separate controlled/uncontrolled mode switch, this is Angular-idiomatic by construction (confirmed, first research report §3.1).

### 4.2 UltimateReact (React)

Explicit controlled/uncontrolled props, matching PrimeReact's real `DataTable.js`/`DataTableBase.js` surface:

- `value: T[]`
- `dataKey: string`
- `selectionMode`, `selection` + `onSelectionChange` (controlled when both provided), `compareSelectionBy`
- `sortMode`, `sortField`/`sortOrder` + `onSort`, `multiSortMeta` + `onSort`
- `filters: DataTableFilterMeta` (object form — §9), `onFilter`
- `paginator: boolean`, `first`/`rows`/`totalRecords`/`rowsPerPageOptions`, `onPage`
- `virtualScrollerOptions`, `lazy`, `onLazyLoad`
- `editMode: 'cell' | 'row'`, `editingRows` (prop; controlled when `onRowEditChange` is supplied — confirmed `BodyRow.js:308-346`, else falls back to internal `setEditingState`), `onRowEditChange`, `onRowEditInit`/`onRowEditSave`/`onRowEditCancel`, `cellEditValidator`/`onCellEditComplete`/`onCellEditCancel`
- `rowGroupMode`, `groupRowsBy`, `expandableRowGroups`, `onRowGroupExpand`/`onRowGroupCollapse`
- Internal-only, never exposed as a prop: cell-edit dirty-value tracking (`editingMeta`, §11.2).

### 4.3 UltimateVue (Vue)

Options-API-shaped props + `v-model` + emits, matching PrimeVue's real `DataTable.vue`/`BaseDataTable.vue` surface:

- `value: T[]` (or `v-model:value` where PrimeVue supports it)
- `dataKey: string`
- `selectionMode`, `v-model:selection`, `compareSelectionBy` (verified `DataTable.vue:1178-1179`)
- `sortMode`, `sortField`/`sortOrder`, `multiSortMeta`, `@sort`
- `filters` (object form, same shape as React — §9), `@filter`
- `paginator: boolean`, `first`/`rows`/`totalRecords`/`rowsPerPageOptions`, `@page`
- `virtualScrollerOptions`, `lazy`, `@lazy-load`
- `editMode: 'cell' | 'row'`, `v-model:editingRows` (Array, **not** a key-map — confirmed §11.3, a genuine shape difference from Angular/React's key-map at the *public prop* level even though Vue derives an internal key-map for lookup), `@cell-edit-init`/`@cell-edit-complete`/`@cell-edit-cancel`, `@row-edit-init`/`@row-edit-save`/`@row-edit-cancel`
- `rowGroupMode`, `groupRowsBy`, `expandableRowGroups`
- Internal-only (`d_`-prefixed reactive data, not props): `d_editingRowKeys` (derived from `editingRows` + `dataKey`), `d_editingMeta` (§11.3).

---

## 5. Shared Concepts vs Framework-Native Concepts

Directly inherited from both research reports and ADR-043 — restated here as the binding boundary for this spec, not re-derived:

| Concept | Status | Source |
|---|---|---|
| `dataKey` + `equals`/`deepEquals` identity | **Shared** — `uix-data`'s `equals` | ADR-043; used for selection *and* row-editing key-maps (Angular/React) |
| `SortMeta`/`SortMode` | **Shared** — `uix-data` | ADR-043; also the basis for row grouping (§13) |
| Simple `FilterMetadata`/`FilterMatchMode` | **Shared** — `uix-data` | ADR-043 |
| Filter operator/constraints wrapper | **Framework-native representation** (not shared) | §9 |
| `PaginationState`/`getPageCount` | **Shared** — `uix-data` | ADR-043 |
| Virtualization windowing (`calculateNumItemsInViewport`/`calculateLast`) | **Shared** — `uix-data` | ADR-043 |
| Table state-ownership mechanism (two-way binding / controlled-uncontrolled / Options-API reactive) | **Framework-native** | First research report §3.4 |
| Cell-edit dirty-value tracking | **Framework-native, structurally divergent per framework** | §11 |
| Row grouping algorithm | **Shared semantics, zero new type** — reuses `SortMeta` as a documented Table-implementation convention | Second research report §4.4 |
| Table↔Paginator / Table↔Scroller composition | **Shared architecture pattern**, not a data primitive | Both research reports; §14 |
| Accessibility role/keyboard vocabulary | **Strongly convergent vocabulary, framework-native mechanism** | §15 |

No item in this table changes `uix-data`'s six-primitive scope.

---

## 6. Identity and Selection

Directly reuses `uix-data`'s `equals` and `SelectionMode`. No new type.

- `dataKey: string` resolves item identity via `equals(a, b, dataKey)` (already exported).
- `SelectionMode = "single" | "multiple"` is consumed as-is.
- **Selection collection shape is framework-owned**, per ADR-043's existing Ownership Boundaries: Angular/React/Vue's real `selection: T | T[]` (Angular/React) vs. Vue's `v-model:selection` of the same shape are all framework-native state, not part of `uix-data`.
- `compareSelectionBy: 'equals' | 'deepEquals'` — confirmed identical option values and semantics across all three frameworks at the call-site level (all three research passes; re-confirmed by this spec's own read of `DataTable.vue:1178-1179`). Ultimate's Table exposes this switch per framework using each framework's own prop-naming convention (§4).

---

## 7. Sorting

Directly reuses `uix-data`'s `SortMeta`/`SortMode`. No new type.

- Single-sort: `sortField: string`, `sortOrder: 1 | 0 | -1`.
- Multi-sort: `multiSortMeta: SortMeta[]`.
- Sort execution (walking `value`, applying `SortMeta`, resolving field values) is Table's own implementation logic in every framework — `uix-data` does not export a comparator/sort function (per ADR-043's explicit exclusion, reconfirmed: "No standalone comparator function found genuinely shared across frameworks").
- Sort-toggle/removable-sort cycling remains excluded (ADR-043: present in React/Vue's real source, absent from Angular's — fails the cross-framework bar). Ultimate's Table may offer this as a framework-native, non-shared UX affordance where each framework's real Prime source already has it — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`** for the exact per-framework toggle-cycle order (not investigated at that depth by either research pass or this spec).

---

## 8. Filtering

Directly reuses `uix-data`'s simple `FilterMetadata`/`FilterMatchMode`. The operator/constraints wrapper is **not** part of `uix-data` — see §9 for the resolved framework-native representation.

- Global filter: single string/value + `globalFilterFields`, matched against `uix-data`'s `FilterMatchMode` vocabulary.
- Per-field filter: `FilterMetadata { value, matchMode }` for the simple (non-multi-constraint) case, shared shape.
- Filter execution (walking `value`, applying match-mode functions) is Table's own implementation logic per framework — `uix-data` does not export a filter-predicate/evaluation function (ADR-043's explicit exclusion).

---

## 9. Filter Operator/Constraints — Resolved as Framework-Native Representation (Not a Fork)

**This is not a genuine architectural fork** under the fork-discipline rules given in the source directive: there are not "multiple materially different viable architectural choices" requiring a stop-and-decide, because the correct choice — do not centralize this in `uix-data`, represent it per framework — is already the direction ADR-043 itself points to, and this spec's job is to decide the *Table-implementation-level* representation, not to reopen whether it belongs in the shared package (it does not, confirmed by both research reports).

**Real evidence (re-confirmed by this spec's own targeted read, in addition to both research reports):**

- PrimeNG `table.ts:553`: `filters: { [s: string]: FilterMetadata | FilterMetadata[] }` — the array form carries `.operator` duplicated per element (`table.ts:6071-6215`).
- PrimeReact `datatable.d.ts:114,248,858,1276`: `filters: DataTableFilterMeta`, where `DataTableFilterMeta` is a union covering both a bare constraint and `{operator, constraints: FilterMetadata[]}` (menu display mode).
- PrimeVue `BaseDataTable.vue:97` (`filters` prop) + `ColumnFilter.vue:314-487`: same `{operator, constraints: [...]}` object shape as React, importing `FilterOperator` from `@primevue/core/api`.

**Resolution for Ultimate's Table (Table-implementation-level, per-framework):**

- **UltimateNG**: adopts PrimeNG's real shape as-is — `Record<string, FilterMetadata | FilterMetadata[]>`, array form for multi-constraint fields, `.operator` duplicated per element. This is Angular-idiomatic continuity with the real upstream Table's own filters storage, and Angular's Table implementation will need this exact shape to reuse PrimeNG's real filter-execution algorithm as a starting reference.
- **UltimateReact** and **UltimateVue**: adopt the object-with-constraints-array shape — `Record<string, FilterMetadata | { operator: 'and' | 'or'; constraints: FilterMetadata[] }>` — matching both real upstream implementations' shape exactly (2 of 3 frameworks already converge here; no normalization work is needed to match upstream).
- **No cross-framework public contract is introduced.** Each framework's Table exposes its own `filters` prop typed to its own shape, per §4. Nothing is added to `uix-data`.
- This mirrors ADR-043's Table risk entry verbatim ("A future Table implementation discovers the deferred filter operator/constraints model is needed sooner than expected... Treat the filter-operator addition as its own small architectural fork when it arises, re-verifying real Table requirements against real Prime source at that time") — this spec is that re-verification, and its conclusion is that the correct fork resolution is "framework-native representation, no shared type," not "add to `uix-data`."

**If a future implementation phase discovers a genuine cross-framework consumption need** (e.g., an Ultimate CLI or metadata layer needing to introspect filter state uniformly across frameworks) that this spec did not anticipate, *that* would be a new fork requiring its own decision — not resolved here, because no such requirement exists in the real Table source or the Blueprint today.

---

## 10. Pagination

Directly reuses `uix-data`'s `PaginationState`/`getPageCount`. No new type.

- `first`, `rows`, `totalRecords`, `rowsPerPageOptions` map 1:1 to `PaginationState`'s fields across all three frameworks (confirmed, first research report §3.4).
- Page-count display uses `getPageCount` as-is.
- Page-link display math (`pageLinkSize`-driven — which page numbers render as clickable links) remains excluded from `uix-data` (ADR-043's existing exclusion, not reopened) — it is Paginator's own rendering concern, inherited by Table only through composition (§14), not duplicated into Table's own logic.

---

## 11. Row Editing / Cell Editing

Editing state is **not** unified across frameworks. Each framework's mechanism is documented separately, per the source directive's explicit instruction not to normalize Angular's DOM/forms model and React's/Vue's state models into an artificial shared abstraction.

### 11.1 UltimateNG (Angular) — DOM-reference cell editing, key-map row editing

- **Cell editing**: single mutable `editingCell: Element | undefined | null` field on the Table component (`table.ts:1123`). `openCell()`/`closeEditingCell()` toggle a `p-cell-editing` CSS class and emit `onEditInit`/`onEditComplete`/`onEditCancel`. **No separate dirty-value store** — validity is checked by querying live DOM for Angular reactive-forms validation classes: `isEditingCellValid()` returns `DomHandler.find(this.editingCell, '.ng-invalid.ng-dirty').length === 0` (`table.ts:2512`). On cancel, original value is restored by reference-equality lookup against `this.dataTable.value`, not a keyed lookup.
- **Row editing**: `editingRowKeys: Record<string, boolean>` (`table.ts:578`) — a `dataKey`-scoped key-map, the same idiom as selection's key-map. `initRowEdit`/`saveRowEdit`/`cancelRowEdit` (`table.ts:2552-2567`) resolve `dataKey` and set/delete the corresponding key. `editMode: 'cell' | 'row'` is a single top-level switch.
- **Ultimate implication**: reuse Angular's native reactive-forms integration as the validity mechanism (do not invent a parallel dirty-tracking store) — this is the Angular-idiomatic choice. **Table's cell editing has no structural dependency on GAP-018** (`docs/architecture/BLUEPRINT_GAPS.md`, Angular's `BaseModelHolder`/`BaseInput` tier): real PrimeNG evidence (`table.ts:2512`) shows validity is a pure DOM class query against whatever control the cell template happens to use, not a CVA/wrapper-tier integration. GAP-018 becomes relevant only if Table's example/reference cell templates choose to use Ultimate's wrapped native-input components — a consumer/example integration concern, not a Table implementation blocker.

### 11.2 UltimateReact (React) — controlled/uncontrolled row editing, always-internal cell dirty-tracking

- **Row editing**: `editingRows` is an explicit controlled/uncontrolled prop. `onEditChange` (`BodyRow.js:308`) checks `if (props.onRowEditChange)` — if supplied, the component computes the next `editingRows` value (key-map when `dataKey` present, array otherwise — confirmed `BodyRow.js:314-338`) and hands it back via the callback without touching internal state; otherwise falls back to internal `setEditingState(isEditing)` (`BodyRow.js:346`).
- **Cell editing / dirty-value tracking**: `editingMetaState` (`const [editingMetaState, setEditingMetaState] = React.useState({})`, `DataTable.js:30`) is **always internal** — never exposed as a controlled prop. Shape: `{[editingKey]: {data: {...rowData}, fields: string[]}}` (`DataTable.js:511-527`). **`editingKey` derivation** (confirmed this spec, `BodyRow.js:431`): `props.dataKey ? (props.rowData && props.rowData[props.dataKey]) || props.rowIndex : props.rowIndex` — i.e., `dataKey`-resolved value when `dataKey` is set, falling back to `rowIndex` otherwise. `cellEditValidator`/`cellEditValidatorEvent` are per-column callback props consulted during `switchCellToViewMode`.
- **Ultimate implication**: React's Table exposes `editingRows` as controllable (matching upstream) and keeps cell-edit dirty-tracking as Table-component-internal state, not a public prop — matching upstream exactly, since no cross-framework consumer of this internal shape has been identified.

### 11.3 UltimateVue (Vue) — public array prop + internal key-map + internal dirty-meta (verified this spec, previously UNVERIFIED)

Real source read directly (`packages/primevue/src/datatable/BaseDataTable.vue:205-212`, `DataTable.vue:146-237,396-423,474-516,1167-1175,1919-1969`; `BodyCell.vue:176-244,355-561`) — this closes the `UNVERIFIED` item left open by both prior research reports.

- **`editingRows` is a public `Array` prop** (`BaseDataTable.vue:209-212`), **not** a key-map at the public API level — this is a genuine shape difference from Angular's `editingRowKeys` (key-map) and closer to React's array fallback shape. It supports `v-model` via `update:editingRows` emit (`DataTable.vue:399`), giving Vue the same controlled/uncontrolled-shaped duality as React at the public-prop level, expressed through Vue's own `v-model` idiom rather than React's explicit callback-presence check.
- **Internally, Vue derives a `dataKey`-scoped key-map anyway**: `d_editingRowKeys` (`DataTable.vue:422`), rebuilt by `updateEditingRowKeys()` (`DataTable.vue:1167-1175`) via `resolveFieldData(data, this.dataKey)` whenever `editMode === 'row' && dataKey` is set — the same `dataKey`+`equals`-family idiom as Angular/React, just derived internally from the public array rather than exposed as the public shape itself.
- **Cell-edit dirty-value tracking**: `d_editingMeta` (`DataTable.vue:423`, internal reactive data, never a prop) — same `{[index]: {data: {...}, fields: []}}` shape as React's `editingMetaState` (`onEditingMetaChange`, `DataTable.vue:1949-1963`, structurally near-identical to React's `onEditingMetaChange` in `DataTable.js:509-523`). **Key derivation differs from React**, confirmed this spec: Vue's `index` is always `rowIndex` (`BodyCell.vue:244`: `index: this.rowIndex`, and consumed as `this.editingMeta[this.rowIndex]` at `BodyCell.vue:539`) — **never `dataKey`-resolved**, unlike React's `editingKey` which prefers `dataKey` when set. This is a genuine, real, framework-specific implementation divergence, not an oversight to reconcile.
- **Row/cell edit lifecycle events**: `cell-edit-init`/`cell-edit-complete`/`cell-edit-cancel`, `row-edit-init`/`row-edit-save`/`row-edit-cancel` (`DataTable.vue:173-178,231-236,396-402`) — same vocabulary as Angular's `onEditInit`/`onEditComplete`/`onEditCancel` and React's `onRowEditInit`/`onRowEditSave`/`onRowEditCancel`, confirming shared *naming convention*, not shared *mechanism*.
- **Ultimate implication**: Vue's Table exposes `editingRows` as an Array (matching upstream, and matching React's array-fallback shape rather than Angular's key-map shape at the public level), keeps `d_editingMeta` as component-internal state keyed by `rowIndex` (matching upstream exactly), and does not attempt to align its internal keying scheme with React's `dataKey`-preferring scheme — these are independent, framework-native implementation choices with no cross-framework contract implied.

### 11.4 Cross-framework editing verdict (spec-level)

| Concern | Angular | React | Vue | Ultimate treatment |
|---|---|---|---|---|
| Row edit-mode public shape | `editingRowKeys` (key-map) | `editingRows` (array or key-map, controlled/uncontrolled) | `editingRows` (array, `v-model`) | Framework-native public shape, each matching its own real upstream |
| Row edit-mode internal shape | N/A (public shape is already the key-map) | Same as public (may be key-map) | `d_editingRowKeys` (key-map, internally derived from the public array) | Framework-native |
| Cell-edit dirty-value tracking | None (DOM `.ng-invalid.ng-dirty` query) | Always-internal `editingMetaState`, keyed by `dataKey`-or-`rowIndex` | Always-internal `d_editingMeta`, keyed by `rowIndex` only | Framework-native, structurally divergent — **not reconciled** |
| Validity mechanism | Angular reactive-forms DOM classes | Per-column `cellEditValidator` callback | `NEEDS IMPLEMENTATION-TIME VERIFICATION` (not traced to a specific validator hook this pass; `cellEditValidator`-equivalent prop presence not confirmed) | Framework-native |

No shared editing primitive is added to `uix-data`. This confirms, not contradicts, both research reports' conclusions.

---

## 12. Row Grouping (see also §13)

Covered together with §13 below, since grouping and its `SortMeta`-reuse convention are one continuous topic per the second research report's own structure.

---

## 13. Row Grouping — `SortMeta` Reuse Convention (Not a New Primitive)

Restated from the second research report §4.4, binding on this spec, not reopened:

- `rowGroupMode: 'subheader' | 'rowspan'`, `groupRowsBy`, `groupRowsByOrder` are Table-level props (all three frameworks, prop-name convergent).
- **Implementation convention** (confirmed identical algorithm in Angular and React; Vue extrapolated with high confidence but not independently re-verified at the call-site level by either research report or this spec — `NEEDS IMPLEMENTATION-TIME VERIFICATION` for Vue specifically):
  1. `groupRowsBy` is injected as a synthetic **leading** `SortMeta` entry (`{field: groupRowsBy, order: groupRowsByOrder}`) into the real sort computation.
  2. The already-sorted flat array is walked at render time; group boundaries are detected by comparing `resolveFieldData(row, groupRowsBy)` between adjacent rows (current vs. previous/next), using the same `equals`/`deepEquals` family used elsewhere.
  3. `subheader` mode renders a group header/footer row when the boundary is detected; `rowspan` mode collapses the grouped column's cells across the group's row span instead.
- **This requires zero new `uix-data` export.** `SortMeta` (already shared) and `equals`/`deepEquals` (already shared) are sufficient. Ultimate's Table implementation documents this as an internal convention in its own implementation notes, not as public API surface beyond the existing `groupRowsBy`/`rowGroupMode` props.
- Expandable row groups (`expandableRowGroups`, confirmed present in React's real source) are a Table-level UI/state concern (expand/collapse key-map, structurally similar to — but not required to reuse — the row-editing key-map pattern), not a `uix-data` concern.

---

## 14. Composition with Paginator / Scroller

Confirmed real component composition in all three frameworks, closing the open item from the first research report (§13 item 4) via both the second research report (§6) and this spec's own re-confirmation:

| Framework | Paginator composition | Scroller composition |
|---|---|---|
| Angular | `<p-paginator>` template child (confirmed prior reports) | `<p-scroller>` child, `@ViewChild('scroller') scroller: Scroller` (`table.ts:58,992`) |
| React | `import { Paginator } from '../paginator/Paginator'` + `<Paginator ...>` (`DataTable.js:10,1991`) | `import { VirtualScroller } from '../virtualscroller/VirtualScroller'` (`DataTable.js:12`) |
| Vue | `import Paginator from 'primevue/paginator'` + `DTPaginator: Paginator` registration, used as `<DTPaginator>` (`DataTable.vue:353,2176`) | `<DTVirtualScroller>` embedded in template (`DataTable.vue:77`) |

**Implication for Ultimate:** Table's implementation in every framework depends on its framework's own Paginator and Scroller components existing and being stable **before** Table's pagination/virtualization UI can be assembled. This is a component-sequencing dependency (§26), not a shared-contract question — `PaginationState` and the virtualization windowing functions are already the shared data contract; composition is a separate, per-framework component-architecture concern.

---

## 15. Accessibility and Keyboard Behavior

Verified this spec (not deeply investigated by either prior research report, which flagged this `UNVERIFIED`):

- **Roles**: `role="table"` on the root table element, `role="rowgroup"` on `thead`/`tbody`/`tfoot`, `role="row"` on every row (including group-header/footer/expansion rows), `role="columnheader"` on sortable header cells — confirmed present in Angular (`table.ts:238-282,3222-3330`) and Vue (`BodyRow.vue:3,22,77,88`); React's `role: 'row'` confirmed (`BodyRow.js:680`) with header/columnheader roles reasonably inferred from `HeaderCell.js`'s ARIA-sort handling but not independently traced to an explicit `role` assignment this pass — `NEEDS IMPLEMENTATION-TIME VERIFICATION` for React's exact `columnheader` role attribute (the `aria-sort` attribute itself is confirmed, §below).
- **`aria-sort`**: confirmed on sortable header cells in all three frameworks — Angular (`table.ts:3672`: `'[attr.aria-sort]': 'sortOrder'`), React (`HeaderCell.js:406,429`: `getAriaSort(sortMeta)` → `'aria-sort': ariaSort`), Vue (`HeaderCell.vue:9`: `:aria-sort="ariaSort"`, computed at `HeaderCell.vue:357`).
- **Keyboard navigation**: confirmed present in all three frameworks — Angular has dedicated `onArrowDownKey`/`onArrowUpKey`/`onEnterKey`/`onEndKey`/`onHomeKey` handlers plus a general `@HostListener('keydown')` (`table.ts:3918-4014`) and separate cell-editing keydown handlers (`onEnterKeyDown`/`onTabKeyDown`/`onEscapeKeyDown`, `table.ts:4615-4649`); React has `onKeyDown` on both `BodyRow.js:163` (row-level) and `HeaderCell.js:210` (header-level, sort-triggering); Vue has `onKeyDown` on `HeaderCell.vue:239` wired via `@keydown` (`HeaderCell.vue:11`).
- **Classification**: **Strongly shared vocabulary** (role names, `aria-sort` semantics, arrow/enter/escape/tab key conventions), **framework-native mechanism underneath** (each framework's own event-binding and focus-management idiom). This is documented here as an implementation requirement — every framework's Table must implement this vocabulary — not as a shared `uix-data` contract (accessibility wiring was already explicitly out of `uix-data`'s scope per ADR-043's Ownership Boundaries: "rendering, templating, keyboard interaction, accessibility wiring... none of which are part of the approved six-concept scope at any layer").
- **Row/cell selection and editing ARIA states** (`aria-selected`, `aria-readonly`/editing-state announcements): not traced in this pass — `NEEDS IMPLEMENTATION-TIME VERIFICATION`.
- **Screen-reader live-region announcements** for filter/sort/page changes: not traced in this pass — `NEEDS IMPLEMENTATION-TIME VERIFICATION`.

---

## 16. Events and State Ownership

Restated per-framework from §4 and §11 — no shared event contract exists or is proposed:

- **Angular**: every stateful `@Input()` has a matching `@Output() xChange` emitter; the component always computes and always emits, and the parent's template binding style (`[x]` vs `[(x)]`) determines whether changes are consumed. This applies uniformly to selection, sort, pagination, and (via `editingRowKeys`) row-editing state.
- **React**: explicit controlled/uncontrolled duality per stateful concern, checked by callback-prop presence (`onSelectionChange`, `onSort`, `onPage`, `onRowEditChange`) — confirmed to generalize from Tree's `expandedKeys` pattern (prior research) to Table's row-editing (`BodyRow.js:308`, this spec).
- **Vue**: Options-API `d_`-prefixed internal reactive fields alongside props, with `v-model` support (`update:selection`, `update:editingRows`, etc.) as the idiomatic controlled-equivalent mechanism.

No cross-framework event-naming contract is introduced by this spec beyond the **vocabulary-level** convergence already documented (init/complete/cancel, sort/filter/page) — each framework keeps its own real event/prop names, matching its own upstream Prime implementation, per the "preserve meaningful per-framework API differences" constraint.

---

## 17. Templates / Slots / Render Customization

Not investigated in depth by either research report or this spec's targeted verification. Real source confirms per-column templating exists in all three frameworks (Angular: `ng-template`-based column templates referenced throughout `table.ts`; React: render-prop-style `body`/`header`/`editor` column props confirmed in `BodyCell.js:42` `column.children.body`/`column.children.editor`; Vue: named slots, confirmed `column.children.body`/`column.children.editor` pattern in `BodyCell.vue:42`). The exact template/slot API surface (column definition object shape, per-cell render function signatures, header/footer/caption templates, empty-state templates, loading-state templates) is **`NEEDS IMPLEMENTATION-TIME VERIFICATION`** — this is a large surface deserving its own targeted read during implementation planning, not invented here.

---

## 18. Styling / Theming Integration

Inherits Ultimate's existing theming/styling infrastructure (`uix-styled`, `uix-styles-components`, `uix-styles-full`, `uix-motion` — Phase 1/5 foundations, already implemented and out of this spec's scope to re-describe). Table's own style module (`tablestyle.ts` in the real PrimeNG source, confirmed to exist at `packages/primeng/src/table/style/tablestyle.ts`) is a real, per-component pattern already established by Phase 1's foundation-tier components; Table's implementation follows the same pattern (component-scoped style module, no new styling mechanism). **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: exact design-token names Table's style module will consume, deferred to implementation planning against the already-existing token infrastructure.

---

## 19. Performance Considerations

- Virtualization (`calculateNumItemsInViewport`/`calculateLast`, already shared) is the primary large-dataset performance mechanism; Table's own responsibility is correct array-bounds clamping of `calculateLast`'s result against live collection length, per `uix-data`'s existing explicit exclusion of that clamp (ADR-043: "Array-bounds clamping against live collection length is excluded — it requires live component state").
- Row grouping's adjacent-row comparison (§13) is O(n) over the already-sorted array — no additional complexity class introduced.
- Cell-edit dirty-tracking objects (`editingMeta`/`d_editingMeta`) are rebuilt via object-spread on every edit-state change in both React and Vue's real source (`{...editingMetaState}`, `{...this.d_editingMeta}`) — a real, observed performance characteristic (O(edited-cell-count) spread per keystroke-adjacent state change) inherited as-is from upstream; not flagged as a concern requiring redesign, since it matches real Prime behavior at the pinned versions.
- Record `dist/` size, gzip size, and any Table-specific bundle-size threshold **after** implementation, consistent with every other UIX/component package's existing performance-baseline recording practice — no benchmark is meaningful before implementation exists.

---

## 20. Package Boundaries / Exports

Table belongs in each framework's own component package (`ng`/`react`/`vue`, per `docs/architecture/PACKAGE_ARCHITECTURE.md`'s existing dependency direction: Framework Components → Framework Core → UltimateUIX), consuming:

```text
Framework Components (Table, this spec)
        down to
Framework Core (ng-core / react-core / vue-core)
        down to
UltimateUIX (uix-data, uix-utils, uix-styled, uix-styles, uix-motion)
```

- Table depends on `@ultimate/uix-data` (all six primitives) and on its own framework's core/foundation tier. Table's core Angular implementation has **no structural dependency on GAP-018** (Angular's `BaseModelHolder`/`BaseInput` tier) — its cell-edit validity mechanism is a DOM class query, not a CVA/wrapper-tier integration (§11.1). Any use of Ultimate's wrapped native-input components inside cell templates is optional and downstream, not part of Table's own dependency graph.
- Table depends on its own framework's Paginator and Scroller components existing (component-sequencing dependency, §14, §26) — **not** a package-level dependency on `uix-data` beyond what both already share.
- No new `uix-*` package is introduced by this spec. Table is a component, not shared infrastructure.
- Export surface (public entry points, secondary Angular entry points, React/Vue per-component export granularity): **`NEEDS IMPLEMENTATION-TIME VERIFICATION`** — this spec does not finalize package.json export maps; that is implementation-plan-level detail, following whatever pattern Phase 1/2's already-shipped components established (not re-derived here).

---

## 21. Provenance and Licensing

- Table's real upstream source is PrimeNG 21.1.9 (`table.ts`, commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`), PrimeReact 10.9.9 (`DataTable.js` and siblings, commit `d0f574e39122668292fc7a740f081bae1b93b1e9`), PrimeVue 4.5.5 (`DataTable.vue` and siblings, commit `66dde6788220fc9e6822342919d1ceb0e3460ece`) — all three pinned and sha256-verified per `docs/architecture/checksums.json`, unchanged from both research reports.
- Provenance manifest entries for Table's implementation follow the existing `originalPath`/`ultimateDestination` schema (the direct-adaptation schema, **not** `uix-data`'s `verifiedAgainst` schema — Table's per-framework implementation is a direct adaptation of a single real upstream file per framework, unlike `uix-data`'s cross-framework-synthesized primitives) — consistent with Phase 1/2's existing component provenance pattern.
- License: MIT, inherited from PrimeNG/PrimeReact/PrimeVue's own MIT license, per the existing `THIRD-PARTY-NOTICES.md` pattern already established for Phase 1/2 components — Table's implementation adds its own `THIRD-PARTY-NOTICES.md` entries per framework package, following that existing pattern (unlike `uix-data`, which explicitly did not need one).
- **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: exact per-file provenance manifest entries (line-range citations) are an implementation-time artifact, not produced by this spec.

---

## 22. Testing / Verification Matrix

Following the existing UIX/component testing conventions (Vitest for logic, framework-appropriate component-testing tools):

| Area | Angular | React | Vue |
|---|---|---|---|
| Identity/selection | Unit: `equals`/`compareSelectionBy` branch coverage | Same | Same |
| Sort (single/multi) | Unit + component | Unit + component | Unit + component |
| Filter (simple + framework-native operator shape, §9) | Unit + component, array-of-alternatives shape | Unit + component, object+constraints shape | Unit + component, object+constraints shape |
| Pagination | Component, composition with real Paginator instance | Same | Same |
| Virtualization | Component, composition with real Scroller instance; zero-guard case (`uix-data`'s existing test already covers the pure function) | Same | Same |
| Row/cell editing | Component: DOM-validity-class scenario | Component: controlled/uncontrolled `editingRows`, internal `editingMeta` snapshot correctness | Component: `v-model:editingRows` array shape, `d_editingRowKeys`/`d_editingMeta` internal derivation |
| Row grouping | Component: `subheader`/`rowspan` boundary detection against a known sorted fixture | Same | Same (flagged for extra scrutiny — Vue's grouping call sites were not independently re-verified by either research report or this spec, §13) |
| Table↔Paginator / Table↔Scroller composition | Component: real child instantiation, not a mock | Same | Same |
| Accessibility | Automated ARIA-role/`aria-sort` assertion + keyboard-navigation interaction test | Same | Same |
| Dependency Boundary | `boundary:validate` (existing, name-prefix match) | Same | Same |
| Prime Dependency Boundary | `ceiling:validate` (existing) | Same | Same |
| Provenance | `provenance:validate` (existing, extended per Table's manifest entries) | Same | Same |

**`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: visual regression and cross-browser test tooling for Table specifically — this is flagged as an open architectural decision in `docs/architecture/BLUEPRINT_GAPS.md` (visual/browser-test tooling choice, not resolved by this spec, not reopened here).

---

## 23. Known Framework Divergences

Consolidated from §4, §9, §11, §15 — restated here as the single reference list:

1. **Filter operator/constraints wire shape**: Angular array-of-alternatives vs. React/Vue object-with-constraints-array (§9) — resolved as framework-native, not shared.
2. **Editing-row public shape**: Angular key-map (`editingRowKeys`) vs. React array-or-key-map (`editingRows`) vs. Vue array-only (`editingRows`) (§11.4).
3. **Cell-edit dirty-tracking key derivation**: absent (Angular, DOM-based instead) vs. `dataKey`-preferring-with-`rowIndex`-fallback (React) vs. `rowIndex`-only (Vue) (§11.2, §11.3) — a genuine, newly-confirmed divergence between React and Vue that neither prior research report surfaced at this granularity.
4. **Cell-edit validity mechanism**: Angular reactive-forms DOM query vs. React per-column callback vs. Vue `NEEDS IMPLEMENTATION-TIME VERIFICATION` (§11.4).
5. **State-ownership idiom**: Angular always-internal-plus-emit vs. React explicit controlled/uncontrolled vs. Vue Options-API-reactive-plus-`v-model` (§16, inherited from both research reports, reconfirmed for editing specifically by this spec).

None of these divergences are treated as defects or reconciliation targets — each is the framework-appropriate implementation of a shared *concept*, matching the constraint to preserve meaningful per-framework API differences where upstream genuinely diverges.

---

## 24. Open Decisions / Explicitly Deferred Items

### Already decided by this spec (restated, not reopened)

Filter operator/constraints representation (§9, framework-native, not shared); row grouping as a `SortMeta`-reuse convention with no new type (§13); editing state models remain framework-native and unreconciled (§11); Table↔Paginator/Scroller as real composition (§14); accessibility vocabulary as an implementation requirement, not a shared-package concern (§15).

### Genuinely open, requiring implementation-time verification (not architectural forks — ordinary detail resolvable from source during implementation)

- Vue's exact cell-edit validity mechanism (§11.4, §15).
- React's exact `role="columnheader"` attribute assignment (§15).
- Row/cell selection and editing ARIA state attributes (`aria-selected`, editing-state announcements) (§15).
- Screen-reader live-region announcements for stateful changes (§15).
- Full template/slot API surface per framework (§17).
- Exact design-token consumption in Table's style module (§18).
- Package export-map granularity per framework (§20).
- Sort-toggle cycling exact per-framework behavior, if offered at all (§7).
- Vue's row-grouping call-site mechanics (extrapolated with high confidence from Angular/React convergence, not independently confirmed) (§13, §22).

### Explicitly deferred (not blocking Table implementation start)

- TreeTable-as-grid's own spec (separate future document; shares types, diverges on value shape).
- Frozen-column / column-resize / column-reorder UI mechanics (out of this spec's scope; flagged §1).
- Any future cross-framework filter-state introspection requirement (would be a new fork if it arises — §9's closing note).

---

## 25. Acceptance Criteria

- [ ] Table's public API is defined per framework, matching §4, with no invented cross-framework contract beyond what §5 lists as genuinely shared.
- [ ] `uix-data`'s six primitives are the only shared-package dependency for identity, selection vocabulary, sort metadata, simple filter metadata, pagination state, and virtualization windowing — zero new `uix-data` export.
- [ ] Filter operator/constraints uses each framework's own real-upstream-matching shape (§9) — verified by a diff against real PrimeNG/PrimeReact/PrimeVue `filters` type shapes at implementation time.
- [ ] Row grouping is implemented as a `SortMeta`-reuse convention (§13), with no new shared type introduced.
- [ ] Editing state (row and cell) is implemented per framework matching §11's documented real-source mechanics, with no artificial cross-framework abstraction introduced.
- [ ] Table composes real Paginator and Scroller component instances in every framework (§14) — not a reimplementation.
- [ ] Accessibility vocabulary (`role`, `aria-sort`, keyboard navigation) matches §15's confirmed cross-framework baseline.
- [ ] Every `NEEDS IMPLEMENTATION-TIME VERIFICATION` item in §24 is either resolved with a cited real-source reference during implementation, or explicitly re-flagged in the implementation plan if still unresolved.
- [ ] `docs/architecture/BLUEPRINT_GAPS.md`'s Data-family gaps (GAP-014 and related) are updated to reflect this spec's resolution at implementation-plan time — **not** by this spec itself (this spec found no factual contradiction requiring an immediate edit; see §27).
- [ ] Provenance manifest entries exist for every Table source file per framework, following the existing `originalPath`/`ultimateDestination` schema.

---

## 26. Implementation Sequencing / Dependencies

```text
uix-data (approved, implemented — ADR-043)
    ↓ (sufficient for)
Paginator, Scroller — standalone, no architectural blocker, must exist first (real composition dependency, §14)
    ↓ (Table composes with both)
Table (this spec)
    ├── requires: Paginator ships first (per framework)
    ├── requires: Scroller ships first (per framework)
    ├── does not require: GAP-018 (BaseModelHolder/BaseInput tier) — Table's cell-edit validity mechanism is a DOM class query (§11.1), not a CVA/wrapper-tier integration; GAP-018 may affect availability of certain Ultimate wrapped-input examples/templates inside cells, but that is non-blocking and outside Table's core dependency graph
    ├── does not require: any new uix-data primitive
    ├── does not require: Tree-family architecture (no dependency)
    └── does not require: OrderList/PickList drag-drop architecture (no dependency, confirmed out of scope §1)

TreeTable — future spec, depends on Table's implementation existing as a reference (shares SortMeta/FilterMetadata types, diverges on hierarchical value shape) — not blocked by anything in this spec, but sequenced after Table by convention (grid patterns established once)
```

**No true architectural blocker was found for Table** beyond the one already-tracked, already-known dependency (Paginator/Scroller must ship first). GAP-018 does not block Table in any framework — Table's own cell/row editing has no structural dependency on it.

---

## 27. Consistency Check

- **`@ultimate/uix-data`**: unchanged. No new export, no modified export, no reopened exclusion.
- **ADR-043**: not contradicted. This spec's filter-operator resolution (§9) is the re-verification ADR-043's own risk table explicitly anticipated and named as the correct future action ("re-verifying real Table requirements against real Prime source at that time") — it is fulfillment of that ADR's own stated process, not a deviation from it.
- **`docs/architecture/BLUEPRINT_GAPS.md`**: no factual contradiction found. GAP-014's description remains accurate. This spec's §9 resolution (framework-native representation, not a shared contract) is consistent with GAP-014's status as `DEFERRED`, and provides the concrete resolution direction for whoever next updates that gap's status to `RESOLVED` at implementation-plan or implementation time — **not changed by this spec itself**, per the instruction to stop and report rather than silently edit.
- **`ULTIMATE_PLATFORM_BLUEPRINT.md`**: not modified, not contradicted.
- **Both Table research reports**: not reopened. Every conclusion they reached is treated as binding; this spec's own targeted verification (Vue editing mechanics, §11.3; accessibility, §15) only fills gaps those reports explicitly left open, and reports the findings as additive, not corrective.

No code was written or modified. Only this specification document was created.
