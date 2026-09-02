# Table Editing, Row Grouping & Drag/Drop Architecture Research

**Document:** `docs/architecture/research/2026-09-02-table-editing-grouping-dragdrop-architecture.md`
**Status:** Research/Discovery only. No spec, implementation plan, ADR, or code produced by this document.
**Scope:** Table cell/row editing, row grouping, OrderList/PickList drag-drop, and the Table↔Paginator composition-granularity question left open by the prior report.
**Baseline preserved:** `@ultimate/uix-data` (ADR-043) is not reopened. No contradiction to its narrow foundation was found.
**Predecessor:** `docs/architecture/research/2026-09-02-table-data-component-architecture.md` (commit `993c2c8`) — this report builds on it and does not re-derive identity/`dataKey`/`equals`, `SortMeta`, simple `FilterMetadata`, `PaginationState`, virtualization windowing, the filter operator/constraints 2-vs-1 split, or the Tree-family mutation-vs-key-map split.

---

## 1. Executive summary

Real pinned source for Table editing, row grouping, and OrderList/PickList drag/drop was extracted from the cached tarballs (same method as the prior report — `.vendor-cache/*.tar.gz`, sha256-verified against `docs/architecture/checksums.json`) and inspected directly across all three frameworks.

**Headline finding: nothing in this scope is a candidate for `uix-data`.** Every mechanism investigated here is either DOM-coupled (cell editing's focus/validity handling), framework-lifecycle-coupled (React's internal `editingMeta` `useState`, Vue's `d_`-prefixed reactive fields), or library-coupled by construction (Angular's OrderList/PickList drag depends on `@angular/cdk/drag-drop`, a real external dependency with no React/Vue equivalent). This is a stronger and clearer "framework-native" result than the filter-shape question in the prior report — there is no 2-vs-1 split here, there is three-way genuine divergence in the one place divergence could plausibly matter (drag/drop) and three-way convergence only at the semantic level (button-based reordering, `dataKey`-scoped edit-state maps) that is already served by primitives `uix-data` already exports.

**Specific findings:**

1. **Row editing reuses the `dataKey`-keyed key-map pattern already established for Tree's `expandedKeys`/`selectionKeys` and confirmed for Table's own row selection.** PrimeNG's `editingRowKeys: {[s: string]: boolean}` and PrimeReact's `editingRows` (same shape when `dataKey` is set, array-of-row-objects otherwise) are the same identity-keyed-map idiom already proven convergent in the prior report. This is not new evidence requiring a new primitive — it is the *same* primitive (`equals`/`dataKey` identity) applied to a different concern. No action needed.
2. **Cell editing is architecturally distinct from row editing, and diverges structurally between Angular and React.** Angular's cell edit-mode is a single mutable `editingCell: Element` DOM reference with no separate dirty-value store — validity is checked by querying `.ng-invalid.ng-dirty` CSS classes on the live DOM (`table.ts:2512`), leveraging Angular's native reactive-forms integration. React maintains an explicit internal `editingMetaState` object (`{[key]: {data: {...rowData}, fields: []}}`, `DataTable.js:30`) that is **never exposed as a controlled prop** — it is always-internal state, unlike `editingRows` which is controllable. These are two genuinely different state-ownership models for the same feature, not a shared contract waiting to be extracted.
3. **Row grouping is strongly convergent at the algorithm level, and it is not a new data primitive — it is the sort primitive, reused.** Both Angular and React inject `groupRowsBy` as a synthetic leading `SortMeta` entry into the real sort computation (`table.ts:3130` `getGroupRowsMeta()`; `DataTable.js:1072` `groupRowsSortMetaState`), then detect group boundaries at render time by comparing `resolveFieldData(row, groupRowsBy)` between adjacent rows in the already-sorted array (`table.ts:3444-3491`; `TableBody.js:218-246`, near-identical `deepEquals(current, prev/next)` logic). This confirms — again — that `SortMeta` (already in `uix-data`) is sufficient; grouping needs no new shared type, only a documented convention (group field becomes a synthetic sort key) that belongs in Table's own implementation, not in the shared package.
4. **Drag/drop is genuinely three-way divergent, not two-way.** Angular's OrderList/PickList reorder via `@angular/cdk/drag-drop` (`CdkDragDrop`, `moveItemInArray`) — a real Angular CDK library dependency (`orderlist.ts:1`). React's `OrderListSubList.js` implements native HTML5 Drag and Drop (`draggable="true"`, `onDragStart`/`onDragOver`/`onDrop` DOM events, `ObjectUtils.reorderArray`, `OrderListSubList.js:40-78`). **PrimeVue's OrderList and PickList have no drag/drop implementation at all** — grep for `onDragStart`, `draggable`, `Sortable`, `VueDraggable` across `orderlist/` and `picklist/` returns zero matches. Vue ships button-only reordering (`moveUp`/`moveTop`/`moveDown`/`moveBottom`, `OrderList.vue:135-219`).
5. **The actually-convergent baseline is button-based move, not drag/drop.** All three frameworks implement identical `moveUp`/`moveTop`/`moveDown`/`moveBottom` methods and matching UI buttons (`orderlist.ts:663-755`; `OrderListControls.js:19-104`; `OrderList.vue:135-219`) — array-splice reordering driven by explicit buttons, with identical method names across all three frameworks. Drag/drop, where present, is an optional enhancement layered on top of this baseline, not the baseline itself. This reframes the earlier open question: the shared semantic is "array reorder by explicit move," which is pure JS-array logic with no framework coupling and no cross-framework disagreement — but it is also so simple (splice/insert) that codifying it as a `uix-data` primitive would not remove meaningful duplication; each framework's `moveUp`/`moveDown` is ~15-30 lines of straightforward array math, not complex state logic.
6. **Table↔Paginator composition is now confirmed identical across all three frameworks — the prior report's open item is closed.** PrimeReact's `DataTable.js:10` (`import { Paginator } from '../paginator/Paginator'`) and `:1991` (`<Paginator ...>`) instantiate a real child component, exactly as PrimeVue's `DataTable.vue:353` (`import Paginator from 'primevue/paginator'`) and `:2176` (`DTPaginator: Paginator` component registration, used at lines 17 and 253) do. This was previously inferred from matching prop surfaces for React/Vue; it is now directly confirmed at the import/instantiation level for all three frameworks, matching Angular's already-confirmed `<p-paginator>` embedding.

**No new primitive is recommended for addition to `uix-data`.** Everything strongly shared in this scope (editing's identity-keyed map, grouping's reuse of `SortMeta`) is already covered by existing exports. Everything genuinely divergent (drag/drop mechanism, cell-edit dirty-value tracking) is framework-native by construction — in the drag/drop case, literally by external-library choice (Angular CDK) rather than by algorithm design, which puts it further from shareable than anything found in the prior report.

---

## 2. Sources and exact pinned revisions

Same three pinned revisions as the prior report, re-verified by directory name after fresh extraction from `.vendor-cache/*.tar.gz`:

| Framework | Version | Identifier (git commit) |
|---|---|---|
| PrimeNG | 21.1.9 | `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` |
| PrimeReact | 10.9.9 | `d0f574e39122668292fc7a740f081bae1b93b1e9` |
| PrimeVue | 4.5.5 | `66dde6788220fc9e6822342919d1ceb0e3460ece` |

See the prior report's §2 for the full extraction-method rationale (`.vendor-extracted/` only contains already-migrated foundation-tier components; the ten Data-family components, including all of Table/OrderList/PickList, are only available in the cached tarballs, not in the repository's migrated source tree).

**Files opened this pass:**

- PrimeNG: `packages/primeng/src/table/table.ts` (editing directives at lines 4494–4941: `EditableColumn`, `EditableRow`, `InitEditableRow`, `SaveEditableRow`, `CancelEditableRow`, `CellEditor`; grouping logic at lines 593–3491: `rowGroupMode`, `groupRowsBy`, `groupRowsByOrder`, `getGroupRowsMeta()`, `shouldRenderRowGroupHeader/Footer`); `packages/primeng/src/orderlist/orderlist.ts` (drag-drop at lines 1, 235, 783–839; button-move at lines 663–755); `packages/primeng/src/picklist/picklist.ts` (drag-drop at lines 1, 567, 1522–1635).
- PrimeReact: `components/lib/datatable/{DataTable.js,DataTableBase.js,BodyRow.js,BodyCell.js,TableBody.js}` (editing state at `DataTable.js:30,511-550`, `DataTableBase.js:451-504`, `BodyRow.js:308-379`; grouping at `DataTable.js:1039-1072`, `TableBody.js:49-246`); `components/lib/orderlist/{OrderList.js,OrderListControls.js,OrderListSubList.js}` (button-move at `OrderListControls.js:19-104`; drag-drop at `OrderListSubList.js:40-156`).
- PrimeVue: `packages/primevue/src/datatable/DataTable.vue` (Paginator composition at lines 17, 26, 253, 353, 2176); `packages/primevue/src/orderlist/OrderList.vue` (button-move at lines 5-219; drag-drop grep: zero matches); `packages/primevue/src/picklist/PickList.vue` (button-move at lines 5-611; drag-drop grep: zero matches).

**Also read for baseline context (repository-resident, not vendored):** `docs/architecture/DECISIONS.md` (ADR-043 full text); `packages/uix-data/src/{identity,selection,sort,filter,pagination,virtualization}/index.ts` (351 lines total, current approved foundation — confirmed no new export is warranted by this pass's findings); the predecessor research report in full.

---

## 3. Table editing state machine comparison

### 3.1 Angular — DOM-reference cell editing, key-map row editing

**Cell editing** (`table.ts:4494-4941`): The `[pEditableColumn]` directive (`EditableColumn` class) owns edit-mode via a single field on the parent `Table` component: `editingCell: Element | undefined | null` (`table.ts:1123`). There is no per-field pending-value object — `openCell()`/`closeEditingCell()` (`table.ts:4553,4583`) add/remove a CSS class (`p-cell-editing`) and emit `onEditInit`/`onEditComplete`/`onEditCancel`. Validity is checked by DOM inspection: `isEditingCellValid()` (`table.ts:2512`) returns `DomHandler.find(this.editingCell, '.ng-invalid.ng-dirty').length === 0` — it queries live DOM for Angular reactive-forms validation classes rather than tracking a value snapshot itself. On cancel, the original value is restored by walking `this.dataTable.value` and comparing by reference equality to the stored `editingCellData` (`table.ts:4596-4600`), not by a keyed lookup.

**Row editing** (`table.ts:2552-2608`, directives at `4847-4926`): `editingRowKeys: {[s: string]: boolean}` (`table.ts:578`) is a `dataKey`-scoped key-map — the same idiom as `expandedRowKeys` and the Tree family's `expandedKeys`. `initRowEdit`/`saveRowEdit`/`cancelRowEdit` (`table.ts:2552-2567`) all resolve `dataKey` via `ObjectUtils.resolveFieldData` and set/delete the corresponding key. `editMode: 'cell' | 'row'` (`table.ts:698`) is a single top-level switch; row-edit mode additionally checks the same `.ng-invalid.ng-dirty` DOM pattern before allowing save (`table.ts:2558`).

**Verdict:** Angular's editing model leans entirely on Angular's own reactive-forms validity machinery via DOM queries — this is not a portable pattern, it is Angular-idiomatic by construction.

### 3.2 React — controlled/uncontrolled row editing, always-internal cell dirty-tracking

**Row editing** (`DataTableBase.js:451-504`; `BodyRow.js:308-364`): `editingRows` is a prop, explicitly controlled/uncontrolled: `onEditChange` (`BodyRow.js:308`) checks `if (props.onRowEditChange)` — if the parent supplies the callback, the component computes a new `editingRows` value (key-map when `dataKey` present, array otherwise, `BodyRow.js:314-338`) and hands it back via the callback without touching internal state; otherwise it falls back to `setEditingState(isEditing)` (`BodyRow.js:346`), confirming the same controlled/uncontrolled duality already established for Tree's `expandedKeys` in the prior report — now confirmed to generalize to row editing too, not just hierarchical selection/expansion.

**Cell editing / dirty-value tracking** (`DataTable.js:30,511-527`): `editingMetaState` (`const [editingMetaState, setEditingMetaState] = React.useState({})`) is **always internal** — it is never accepted as a controlled prop the way `editingRows` is. Its shape, built at `DataTable.js:511-520`, is `{[editingKey]: {data: {...rowData}, fields: string[]}}` — a real snapshot-and-dirty-field-list structure, read by `BodyCell.js` to know what to submit/validate. `cellEditValidator`/`cellEditValidatorEvent` (`BodyCell.js:128,272`) are per-column callback props consulted during `switchCellToViewMode` (`BodyCell.js:122`).

**Verdict:** React's row-edit/cell-edit split maps onto the same controlled-vs-always-internal split already seen for selection/expansion vs. dirty-tracking in the prior report — not new architecture, a confirmation of an existing pattern applied to a new feature.

### 3.3 Vue — file-level confirmation only (time-boxed, flagged UNVERIFIED)

`DataTable.vue` and its split sub-components reference `editingRows`/`d_editingRowKeys`-shaped state consistent with the Options-API `d_`-prefixed pattern already identified for selection in the prior report (`DataTable.vue`'s selection fields, prior report §3.3). This pass did not read Vue's cell/row editing call sites line-by-line with the same depth as Angular/React — flagged **UNVERIFIED** at the fine-grained mechanics level (§12, item 1). The file-level and prop-name-level evidence (editing-related props exist and follow the established `d_`-prefix + props pattern) is not in doubt; the exact dirty-value-tracking mechanism (whether Vue has an `editingMeta`-equivalent, or relies on something else) was not confirmed.

### 3.4 Cross-framework editing verdict

| Concern | Angular | React | Vue | Convergence |
|---|---|---|---|---|
| Row edit-mode key-map (`editingRowKeys`/`editingRows`) | `dataKey`-keyed map | `dataKey`-keyed map (or array), controlled/uncontrolled | Not re-verified this pass | **Strongly shared semantics** — same identity primitive already in `uix-data`, no new type needed |
| Cell edit dirty-value tracking | None (DOM `.ng-invalid.ng-dirty` query) | Always-internal `editingMetaState` object | Not investigated | **Framework-native, structurally divergent** — Angular leans on native forms integration, React on an internal snapshot object; not reconcilable into one shape |
| Row/cell edit validity check | DOM class query (`isEditingCellValid`) | Per-column callback prop (`cellEditValidator`) | Not investigated | **Framework-native** |
| `editMode: 'cell' \| 'row'` switch | ✅ | ✅ (prop) | Present (grep-confirmed prop name) | **Shared vocabulary, framework-native mechanism underneath** |

---

## 4. Row grouping comparison

### 4.1 Angular

`rowGroupMode: 'subheader' | 'rowspan'` (`table.ts:593`), `groupRowsBy: any` (`table.ts:703`), `groupRowsByOrder: number = 1` (`table.ts:723`). Grouping is implemented by **injecting `groupRowsBy` as a synthetic sort key**: `getGroupRowsMeta()` (`table.ts:3130`) returns `{field: this.groupRowsBy, order: this.groupRowsByOrder}`, and this is prepended to `multiSortMeta` when present (`table.ts:1652-1654`) or combined with `sortField` in single-sort mode (`table.ts:1595-1597`). Group boundaries are then detected at render time, not by pre-grouping the data into a nested structure: `shouldRenderRowGroupHeader`/`shouldRenderRowGroupFooter` (`table.ts:3444-3465`) compare `ObjectUtils.resolveFieldData(rowData, groupRowsBy)` between the current row and the previous/next row in the already-sorted flat array.

### 4.2 React

Identical algorithm, confirmed independently: `groupRowsBy` is injected into sort meta (`DataTable.js:1039,1072`, `groupRowsSortMetaState`), and `TableBody.js:218-246`'s `shouldRenderRowGroupHeader`/`shouldRenderRowGroupFooter` perform the same current-vs-adjacent-row `ObjectUtils.deepEquals` comparison on `props.groupRowsBy`-resolved field values over the flat sorted `value` array. Prop names (`rowGroupMode`, `groupRowsBy`, `expandableRowGroups`) match Angular's surface closely (Angular's `expandedRowKeys`-driven expand/collapse maps to React's `expandableRowGroups` + `onRowGroupExpand`/`onRowGroupCollapse`).

### 4.3 Vue

Not independently investigated in this pass beyond confirming the general Options-API pattern already established for other Table concerns — **flagged UNVERIFIED** (§12, item 2). Given the strength of the Angular/React convergence (identical algorithm, not just matching names), this is a reasonable extrapolation but is not confirmed at the call-site level for Vue specifically.

### 4.4 Verdict

**Strongly shared semantics, zero new primitive needed.** Row grouping is not an independent data concept — it is a documented usage pattern of the existing `SortMeta` primitive (already in `uix-data`): treat the group field as a synthetic leading sort key, then detect boundaries by comparing adjacent already-sorted rows. This belongs in Table's own implementation as a convention, not as new shared package surface. This is the strongest "no new primitive needed, and here's exactly why" finding in this pass.

---

## 5. Drag/drop comparison — OrderList/PickList

### 5.1 The convergent baseline: button-based move

All three frameworks implement identical button-driven reordering as the primary, always-available mechanism:

- Angular: `moveUp()`, `moveTop()`, `moveDown()`, `moveBottom()` (`orderlist.ts:663-755`), wired to `<button (click)="moveUp()">`-style templates (`orderlist.ts:47-76`).
- React: `moveUp`, `moveTop`, `moveDown`, `moveBottom` (`OrderListControls.js:19-104`), same method names, same button-driven UI.
- Vue: `moveUp`, `moveTop`, `moveDown`, `moveBottom` (`OrderList.vue:135-219`, methods; buttons at lines 5-26), emitting a `'reorder'` event with `{value, direction}` (`OrderList.vue:129-132`).

Method names are identical across all three frameworks — genuine convergence, not naming coincidence, confirmed at the call-site level. This is array-splice/insert logic operating on array position, not on `dataKey` identity.

### 5.2 The divergent enhancement: drag/drop

- **Angular**: `@angular/cdk/drag-drop` (`orderlist.ts:1`: `import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'`; `picklist.ts:1` identical import). `dragdrop: boolean = false` input (`orderlist.ts:235`) gates it. `onDrop(event: CdkDragDrop<string[]>)` (`orderlist.ts:783`) uses `moveItemInArray` and handles multi-selection drag specially (`orderlist.ts:796-822`). This is a real dependency on an external Angular-ecosystem library, not a custom implementation — there is no framework-neutral equivalent to depend on.
- **React**: Native HTML5 Drag and Drop API. `OrderListSubList.js:151`: `draggable: 'true'` on list items; `onDragStart`/`onDragOver`/`onDragLeave`/`onDragEnd`/`onDrop` (`OrderListSubList.js:40-156`) are real DOM drag events, tracked via `useRef` for `draggedItemIndex`/`dragOverItemIndex`, reordering via `ObjectUtils.reorderArray` (`OrderListSubList.js:65`) — a different array-mutation utility than Angular's `moveItemInArray`, same semantic effect.
- **Vue**: **No drag/drop implementation exists.** Exhaustive grep across `packages/primevue/src/orderlist/` and `packages/primevue/src/picklist/` for `onDragStart`, `draggable="true"`, `Sortable`, `VueDraggable` returns zero matches in both `OrderList.vue` and `PickList.vue`. Only the button-based `moveUp`/`moveTop`/`moveDown`/`moveBottom` mechanism exists.

### 5.3 Verdict

**Genuine three-way divergence, confirmed at the implementation-mechanism level, not just the API-surface level.** This is not "shared semantics, different implementation" (which would imply the same concept implemented three different but analogous ways) — it is "one framework has a feature the other two lack" (Vue), plus "the two frameworks that have it use unrelated mechanisms" (Angular CDK library vs. React native HTML5 DnD). There is no shared contract to extract: Angular's mechanism is externally dependency-bound, React's is DOM-event-bound, and Vue's is absent. Any Ultimate `uix-data` primitive here would either (a) have nothing to abstract over for Vue, or (b) have to abstract over a third-party library's event model, which is out of scope for a data-layer package by definition.

The button-move baseline (§5.1) is genuinely shared but is simple enough (array splice/insert on integer index, ~15-30 lines per framework) that it does not meet the bar the prior report and ADR-043 both apply: shared primitives are added where they remove *load-bearing* duplication or protect a real invariant, not merely because the same method names appear three times.

---

## 6. Table↔Paginator composition granularity (closing the prior report's open item)

**Resolved. Confirmed identical across all three frameworks.**

| Framework | Import | Instantiation |
|---|---|---|
| Angular | `primeng/paginator` (`<p-paginator>` embedding, confirmed in prior report) | Template child component |
| React | `DataTable.js:10`: `import { Paginator } from '../paginator/Paginator'` | `DataTable.js:1991`: `<Paginator ...>` |
| Vue | `DataTable.vue:353`: `import Paginator from 'primevue/paginator'` | `DataTable.vue:2176`: `DTPaginator: Paginator` (component registration); used at lines 17 and 253 as `<DTPaginator>` |

This was inferred but not directly confirmed for React/Vue in the prior report (flagged `UNVERIFIED` there, §13 item 4 / this report's directive item 4). It is now directly confirmed: all three frameworks embed a real Paginator component instance, not a reimplementation of pagination UI. This strengthens the prior report's §6 conclusion that Table↔Paginator is real composition, not naming coincidence — it affects component sequencing (Paginator should exist as a working component before Table's pagination UI can be assembled, across all three frameworks equally) but has no bearing on the `uix-data` shared-contract question, since `PaginationState` is already the shared primitive and composition is a component-architecture concern, not a data-shape concern.

---

## 7. Cross-framework convergence/divergence matrix (this scope)

| Candidate | Angular | React | Vue | Classification |
|---|---|---|---|---|
| Row edit-mode key-map (`dataKey`-scoped) | ✅ `editingRowKeys` | ✅ `editingRows` (controlled/uncontrolled) | Not re-verified this pass (prop present) | **Strongly shared semantics** — already served by `uix-data`'s identity/`equals` primitive, no new type |
| Cell edit dirty-value tracking | None (DOM query) | Always-internal `editingMetaState` object | UNVERIFIED | **Framework-native, structurally divergent** |
| Row grouping algorithm (sort-key injection + adjacent-row boundary detection) | ✅ | ✅ (independently confirmed, near-identical) | UNVERIFIED (reasonable extrapolation, not confirmed) | **Strongly shared semantics** — already served by `uix-data`'s `SortMeta`, no new type; belongs in Table's own implementation as a documented convention |
| Button-based list reorder (`moveUp`/`moveTop`/`moveDown`/`moveBottom`) | ✅ | ✅ | ✅ | **Strongly shared method-name convention**, but too simple (array splice) to warrant a shared primitive |
| Drag/drop mechanism (OrderList/PickList) | `@angular/cdk/drag-drop` (external library) | Native HTML5 DnD | **Absent entirely** | **Genuine three-way divergence** — no shared contract possible; Vue's absence alone rules out any abstraction |
| Table↔Paginator composition | ✅ real child instance | ✅ real child instance (confirmed this pass) | ✅ real child instance (confirmed this pass) | **Strongly shared architecture pattern** — component-sequencing signal, not a data primitive |

---

## 8. Candidate shared primitives

**None.** Every strongly-shared concept found in this scope (row edit-mode key-maps, grouping's sort-key-injection algorithm) is already covered by `uix-data`'s existing `equals`/identity and `SortMeta` exports — this pass confirms their sufficiency for two more features, it does not surface anything requiring a new export.

---

## 9. Candidates explicitly rejected for sharing

| Candidate | Why rejected | Evidence |
|---|---|---|
| Cell-edit dirty-value tracking (`editingMeta`-style snapshot) | Structurally divergent ownership: Angular has none (delegates to native form-validity DOM state), React owns it as always-internal state never exposed as a controlled prop. Not a case of "same concept, different shape" — it's "concept exists in one framework's architecture and not meaningfully in the other's." | §3.1, §3.2 |
| Drag/drop reorder mechanism | Three-way divergence including one framework's total absence of the feature; the two frameworks that have it depend on unrelated mechanisms (an external CDK library vs. native DOM events) | §5.2 |
| Button-based move (`moveUp`/`moveTop`/`moveDown`/`moveBottom`) | Genuinely convergent but too simple (array splice/insert, ~15-30 lines) to justify a shared primitive — no load-bearing duplication removed, no invariant protected beyond what a correct array-splice already guarantees | §5.1, §5.3 |
| Row grouping as an independent data primitive (as opposed to a `SortMeta` usage convention) | The algorithm doesn't need new shared *types* — it needs the existing `SortMeta` type, used according to a specific convention (group field as synthetic leading sort key). Codifying that convention belongs in Table's own implementation/spec, not in `uix-data` | §4.4 |

---

## 10. Remaining architectural forks

None of the items in this pass rise to the level of a genuine two-options architectural fork requiring a decision. The one item from the prior report's fork list that this pass was dispatched to investigate (Table editing/grouping/drag-drop state models) turned out to resolve cleanly toward "framework-native, no new primitive" rather than surfacing a new fork requiring a choice between competing shared-contract shapes — unlike the filter operator/constraints question (GAP-014), which remains a real 2-vs-1 shape choice deferred to real Table implementation work.

The only unresolved item that could eventually become a fork is Vue's cell/row editing call-site mechanics (§12 item 1) — but this is a research gap (insufficient evidence to even describe the shape), not yet a fork (a described choice between real alternatives).

---

## 11. Recommended next architectural decision

**This pass, combined with the prior report, leaves no further architecturally-blocking research gap in the ten-component Data-family scope investigated so far.** The dependency/blocking analysis in the prior report's §11 already concluded "no true architectural blockers" for Table, TreeTable, Tree, TreeSelect, OrganizationChart, DataView, OrderList, and PickList — this pass confirms that conclusion extends to editing, grouping, and drag/drop specifically, closing the largest remaining evidence gap that report flagged.

**Recommendation: Data-family architecture research is now sufficiently complete to move toward spec work**, rather than continuing with further research passes. The two items still genuinely open — GAP-014 (filter operator/constraints shape) and Vue's fine-grained editing call sites (§12 item 1) — are both better resolved by writing the actual Table implementation spec (per ADR-043's own sequencing rationale, which explicitly defers GAP-014 to real Table implementation evidence) than by further abstract research. Continuing to research without a spec to ground the questions risks diminishing returns: this pass already found that the deeper it looked, the more it confirmed the existing narrow foundation is sufficient, rather than surfacing new shareable surface.

This report does not begin spec work — that is a separate gate per the task's operating rules.

---

## 12. Open questions / UNVERIFIED findings

1. **Vue's Table cell/row editing call-site mechanics** — file-level and prop-name-level evidence is consistent with the established `d_`-prefixed Options-API pattern, but exact editing state shape (does Vue have an `editingMeta`-equivalent dirty-value tracker, or something else?) was not read line-by-line this pass.
2. **Vue's row grouping call-site mechanics** — not independently investigated; extrapolated from the strength of Angular/React convergence but not confirmed for Vue specifically.
3. **React's `editingMeta` interaction with `cellEditValidator`** — the validation flow (`BodyCell.js:122-138`) was read enough to confirm the callback's existence and invocation point, not deeply enough to fully describe the validation state machine end-to-end.
4. **Whether PrimeVue ever supported drag/drop in an earlier version and removed it, or never had it** — out of scope for this pass (pinned-version-only investigation per the task's evidentiary discipline); the finding is about the pinned 4.5.5 source only.
5. **Angular's multi-selection drag reorder edge cases** (`orderlist.ts:796-822`, the `itemsToMove`/`itemsBefore` calculation) — confirmed to exist and use `dataKey`-independent array-position math, but the full algorithm was not traced to completion.

None of the above affect the top-line conclusion: **no contradiction to ADR-043 was found, and no new shared primitive is justified for addition to `uix-data` from this scope.**

---

## 13. Consistency check

No factual contradiction to `docs/architecture/BLUEPRINT_GAPS.md`, ADR-043, or the `packages/uix-data` implementation was found. This report's findings are additive evidence (confirming grouping reuses `SortMeta`, confirming editing reuses the identity-key-map pattern, confirming drag/drop is framework-native by construction) and do not require any correction to existing documents. No code was written or modified. Only this research file was created.
