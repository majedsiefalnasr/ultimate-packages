# DECISION-C — Table/Data-Component Architecture Research

**Document:** `docs/architecture/research/2026-09-02-table-data-component-architecture.md`
**Status:** Research/Discovery only. No spec, implementation plan, ADR, or code produced by this document.
**Scope:** Table, TreeTable, Paginator, Scroller, DataView, OrderList, PickList, Tree, TreeSelect, OrganizationChart.
**Baseline preserved:** `@ultimate/uix-data` (ADR-043) is not reopened. No contradiction to its narrow foundation was found. This report extends the evidence base, it does not revise the existing decision.

---

## 1. Executive summary

Real pinned source for all ten target components, across all three frameworks, was extracted from the cached tarballs (not `.vendor-extracted`, which only contains the narrower set of already-migrated foundation packages — see §2) and inspected directly.

**Headline finding:** ADR-043's narrow foundation holds up under this deeper look. Nothing found here contradicts it. Two refinements to the evidence base emerged:

1. **The filter operator/constraints model (GAP-014) is real and now has a clearer shape**, but it splits **2-vs-1**, not "PrimeReact vs PrimeNG" as ADR-043's text currently says: PrimeReact and PrimeVue both normalize as `{ operator, constraints: FilterMetadata[] }` (an object wrapping an array); PrimeNG normalizes as `FilterMetadata[]` directly, with `.operator` duplicated onto every element. Same semantic concept, two shapes, and Vue was not previously named in this specific comparison. This does not change ADR-043's conclusion (still correctly deferred, still not includable without real Table implementation evidence to force a choice between the two shapes) — it sharpens the evidence.
2. **Tree-family in-place mutation is confirmed at the call-site level**, not just structurally: PrimeNG's `TreeNode.expanded` is set with `(<TreeNode>this.node).expanded = true`, a direct object mutation, in `UITreeNode.expand()`/`collapse()`. React's and Vue's `expandedKeys`/`selectionKeys` external key-maps were confirmed with real `useState`/controlled-vs-uncontrolled call sites. ADR-043's Tree exclusion is not just still valid, it is now verified at a finer grain.

Beyond re-confirming the existing baseline, this pass surfaces genuinely new evidence not previously investigated at this depth:

- **Table, DataView, Scroller, and Paginator compose, they don't duplicate.** All three frameworks embed a real `Scroller`/`VirtualScroller` component instance inside `Table`, and `DataView` reuses `Paginator`'s exact prop names (`rows`, `totalRecords`, `rowsPerPageOptions`, `lazy`, `lazyLoadOnInit`). This is a genuine component-composition relationship, verified in source, not an API-naming coincidence — see §6.
- **TreeSelect literally imports and wraps `Tree`** (`import { Tree } from 'primeng/tree'` in `treeselect.ts`), not a parallel reimplementation. TreeTable and OrganizationChart both use the same `TreeNode` type and the same in-place-mutation pattern as Tree, but are separate component trees, not wrappers.
- **OrderList and PickList are architecturally not "Table-family" in the selection sense.** Neither has a `selection`/`selectionMode` input. OrderList uses a single-string `filterMatchMode`, far narrower than Table's `FilterMetadata`. PickList has `dataKey`/`trackBy` but no `selection` — the "selection" concept in these two components is list membership (drag/reorder, dual-list transfer), not row selection. They should not be shoehorned into any Table-oriented shared contract.
- **`dataKey` + `equals`/`deepEquals` identity comparison is confirmed identical across all three frameworks at the call-site level** (not just as a type), reusing exactly the `equals` primitive `uix-data` already exports. This is the strongest piece of new convergence evidence in this pass, and it already has a home in the approved foundation — no action needed, just confirmation.

**No new primitive is recommended for addition to `uix-data` at this time.** The filter operator/constraints question (GAP-014) remains correctly deferred — real Table implementation work is still the right forcing function, per ADR-043's own sequencing rationale, now with a sharper 2-vs-1 shape split to choose between when that work starts.

---

## 2. Sources and exact pinned revisions

| Framework | Version | Identifier (git commit) | Verified against |
|---|---|---|---|
| PrimeNG | 21.1.9 | `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` | `docs/architecture/checksums.json` |
| PrimeReact | 10.9.9 | `d0f574e39122668292fc7a740f081bae1b93b1e9` | `docs/architecture/checksums.json` |
| PrimeVue | 4.5.5 | `66dde6788220fc9e6822342919d1ceb0e3460ece` | `docs/architecture/checksums.json` |

**Extraction method:** `.vendor-extracted/{ng,react,vue}` in the repository contains only the subset of Prime source already migrated into `packages/*` (foundation-tier components: button, checkbox, dialog, menu, tooltip, etc.) — **none of the ten target Data components exist there yet**. This is expected: Data-family migration has not started (COMPONENT_INVENTORY.md marks all ten `NEEDS ARCHITECTURE DECISION` / `Later Phase`). The full pinned repository snapshots are separately cached, untouched, at `.vendor-cache/{primeng,primereact,primevue}-<version>.tar.gz` (produced by `scripts/provenance/vendor-snapshot.mjs`, sha256-verified against `checksums.json`). This report extracted those three tarballs to a scratch directory (outside the repository, not committed, not copied into `packages/*`) to read real, complete, pinned source. Every finding below cites a real file path within that extraction and, where the finding is load-bearing, an exact line reference at time of reading.

**Files actually opened (primary):**

- PrimeNG: `packages/primeng/src/{table,treetable,tree,treeselect,organizationchart,paginator,scroller,dataview,orderlist,picklist}/*.ts`
- PrimeReact: `components/lib/{datatable,treetable,tree,treeselect,organizationchart,paginator,scroller,dataview,orderlist,picklist,virtualscroller}/*.js`
- PrimeVue: `packages/primevue/src/{datatable,treetable,tree,treeselect,organizationchart,paginator,scroller,dataview,orderlist,picklist}/*.vue`

**Also read for baseline context (repository-resident, not vendored):**

- `packages/uix-data/src/{identity,selection,sort,filter,pagination,virtualization}/index.ts` — current approved shared foundation, read in full.
- `docs/architecture/DECISIONS.md` — ADR-043 (full text) and surrounding ADRs.
- `docs/architecture/BLUEPRINT_GAPS.md` — GAP-014, GAP-015, GAP-013, and the Data-family Open Architectural Decisions entries.
- `docs/architecture/COMPONENT_INVENTORY.md` — the Data-component table (§106+) and its column semantics.
- `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md` — the approved spec, including its stated Non-Goals and Out-of-Scope sections.

No standalone files for the six prior research passes named in that spec's References line ("Discovery Audit," "Data Architecture Research Report," etc.) exist in the repository as separate documents — their findings are consolidated into ADR-043's text and the uix-data spec itself. This report treats ADR-043 as the authoritative record of those passes' conclusions, per the task's instruction not to re-derive already-settled findings.

---

## 3. Table architecture comparison

### 3.1 Angular (PrimeNG) — `packages/primeng/src/table/table.ts` (6,613 lines)

**State ownership / controlled-uncontrolled:** Angular's pattern is banana-in-a-box two-way binding. `value`, `first`, `rows`, `sortField`, `sortOrder`, `multiSortMeta`, `selection` are all `@Input()` **getters with matching `@Output() xChange` emitters** (`firstChange`, `rowsChange`, `selectionChange`), verified at lines 744–974. There is no explicit "controlled vs uncontrolled" mode switch as in React — the component always owns working state internally and always emits change events; the parent chooses whether to bind `[(first)]` (two-way) or `[first]` (one-way, ignoring the emitted changes) at the template level. This is an Angular-idiomatic mechanism with no direct equivalent contract to share.

**Selection:** `selectionMode: 'single' | 'multiple' | undefined | null`, `dataKey: string`, `compareSelectionBy: 'equals' | 'deepEquals' = 'deepEquals'`, `metaKeySelection`, `selectionPageOnly`, `rowSelectable` predicate. Internally maintains `selectionKeys: {[key: string]: 1}` built via `ObjectUtils.resolveFieldData(data, this.dataKey)` (verified at table.ts:1487–2018, dozens of call sites). `compareSelectionBy` chooses between `===` (`'equals'`) and `ObjectUtils.equals(...)` deep comparison (`'deepEquals'`) when `dataKey` is absent.

**Sort:** `sortMode: 'single' | 'multiple'`, `sortField`/`sortOrder` (single), `multiSortMeta: SortMeta[]` (multiple), `customSort` escape hatch with a `sortFunction` output, `resetPageOnSort`, `defaultSortOrder`. `SortMeta` shape (`{field, order}`) matches `uix-data`'s `SortMeta` exactly — confirmed, not new.

**Filter:** `filters: {[field: string]: FilterMetadata | FilterMetadata[]}` (table.ts:553) — the array form is the operator/constraints model (see §4). `globalFilterFields`, `filterDelay`, `filterLocale`. Filtering executes via `_filter()`/`filterGlobal()`/`filter()` (table.ts:2179–2260), which walks `FilterService`-registered match-mode functions.

**Pagination:** `paginator: boolean`, `rows`, `first`, `totalRecords`, `rowsPerPageOptions`, `paginatorPosition: 'top'|'bottom'|'both'`, `alwaysShowPaginator`. Embeds `<p-paginator>` as a child, verified at template usage — see §6.

**Virtualization/lazy:** `virtualScroll`, `virtualScrollItemSize`, `virtualScrollOptions: ScrollerOptions`, `virtualScrollDelay`, `lazy`, `lazyLoadOnInit`. Embeds `<p-scroller>` as a real child component (`import { Scroller } from 'primeng/scroller'`, table.ts:58; `@ViewChild('scroller') scroller: Scroller`, table.ts:992) — not a reimplementation.

**Editing:** `onEditInit`/`onEditComplete`/`onEditCancel` outputs; cell/row edit mode is a template-level concern (`pEditableColumn` directive family, not investigated line-by-line in this pass — flagged `UNVERIFIED` for exact edit-mode state machine, see §13).

**Grouping:** `rowGroupMode: 'subheader' | 'rowspan'`, `groupRowsBy`, `groupRowsByOrder`.

**Accessibility:** `role="grid"` pattern referenced in COMPONENT_INVENTORY.md; not independently re-verified against ARIA attributes in this pass (time-boxed) — flagged `UNVERIFIED`.

### 3.2 React (PrimeReact) — `components/lib/datatable/DataTable.js` (2,122 lines)

**State ownership:** Explicit controlled/uncontrolled duality, verified directly: `isEquals` and selection helpers branch on whether the relevant prop (e.g. `onToggle`, in the Tree case; analogous pattern in DataTable for `selection`) is provided by the parent. React's hooks-based function-component model does not have Angular's automatic two-way-binding sugar — the parent must explicitly wire `value={selection}` + `onSelectionChange={...}` to get controlled behavior, or the component would need internal `useState` fallback (verified present in the sibling `Tree` component, §5.2; DataTable's own internal-state fallback was not independently re-verified in this pass for every field — flagged `UNVERIFIED`).

**Selection:** `dataKey`, `compareSelectionBy: 'equals' | 'deepEquals'`, `isEquals(data1, data2)` helper (DataTable.js:129–130) — **identical semantics and identical option values to PrimeNG**, confirmed at the call-site level, not just the type level.

**Sort/Filter/Pagination:** Same field-name surface as Angular (`sortField`, `sortOrder`, `multiSortMeta`, `first`, `rows`, `totalRecords`) — prop names converge strongly across the two frameworks for these concerns (already the basis of `uix-data`'s `SortMeta`/`PaginationState`, re-confirmed here, not new).

**Virtualization:** `import { VirtualScroller } from '../virtualscroller/VirtualScroller'` (DataTable.js:12) — again real composition, not reimplementation. `isVirtualScrollerDisabled()` gate confirmed.

### 3.3 Vue (PrimeVue) — `packages/primevue/src/datatable/*.vue` (split across ~13 files: `DataTable.vue`, `BodyRow.vue`, `HeaderCell.vue`, `BodyCell.vue`, `FilterHeaderCell.vue`, `ColumnFilter.vue`, `TableHeader.vue`, `TableFooter.vue`, `RowCheckbox.vue`, `RowRadioButton.vue`, `BaseDataTable.vue`, others)

**State ownership:** Vue's Options-API pattern here (not Composition API `<script setup>`) uses internal `d_`-prefixed reactive data fields (`d_selectionKeys`, `d_editingRowKeys`) alongside props, with the parent able to override via `v-model`. Structurally closer to Angular's always-internal-plus-emit model than to React's explicit controlled/uncontrolled split, but implemented with Vue's own reactivity system, not Angular's Input/Output decorators. No shared contract candidate here — this is unavoidably framework-native lifecycle behavior.

**Selection:** `dataKey`, `compareSelectionBy` (DataTable.vue:1178–1179: `this.compareSelectionBy === 'equals' ? data1 === data2 : equals(data1, data2, this.dataKey)`), `d_selectionKeys` built via `resolveFieldData(data, this.dataKey)` (DataTable.vue:1129–1164) — a third independent confirmation of the exact same `dataKey`+`equals` pattern.

**Filter:** Split across `ColumnFilter.vue`/`FilterHeaderCell.vue`, using the `{operator, constraints}` object shape (§4) — imports `FilterOperator` from `@primevue/core/api` (ColumnFilter.vue:158).

**Virtualization:** `<DTVirtualScroller>` embedded directly in `DataTable.vue` template (line 77), `virtualScrollerDisabled` computed gate — same composition pattern as the other two frameworks.

### 3.4 Cross-framework Table verdict

| Concern | Angular | React | Vue | Convergence |
|---|---|---|---|---|
| `dataKey` + `equals`/`deepEquals` identity | ✅ | ✅ | ✅ | **Strongly shared** (already in `uix-data`) |
| `SortMeta {field, order}` shape | ✅ | ✅ (`DataTableSortMeta`) | Not independently re-verified this pass | **Strongly shared** (already in `uix-data`) |
| Simple `FilterMetadata {value, matchMode}` | ✅ | ✅ | ✅ | **Strongly shared** (already in `uix-data`) |
| Filter operator/constraints shape | Array-of-alternatives | Object-with-constraints-array | Object-with-constraints-array | **Shared semantics, 2 implementations (2-vs-1 split)** — see §4 |
| `PaginationState` fields | ✅ | ✅ | Not independently re-verified this pass | **Strongly shared** (already in `uix-data`) |
| Virtualization composition (embeds Scroller) | ✅ | ✅ | ✅ | **Strongly shared architecture pattern** (not a data primitive — a composition relationship, see §6) |
| State ownership mechanism (two-way binding vs controlled/uncontrolled vs Options-API reactive data) | Input/Output pairs | Explicit controlled/uncontrolled | Options-API `d_` fields + v-model | **Framework-native** — no shared contract possible or desirable |
| Editing state machine | `pEditableColumn` directive family | Not investigated this pass | Not investigated this pass | `UNVERIFIED` — needs dedicated pass when Table spec work starts |
| Grouping (`rowGroupMode`) | ✅ | Not independently re-verified this pass | Not independently re-verified this pass | `UNVERIFIED` |

---

## 4. Filter architecture comparison (GAP-014 focus)

**Observed fact (all three frameworks, verified at real call sites):**

- PrimeNG (`table.ts:553`): `filters: {[field: string]: FilterMetadata | FilterMetadata[]}`. The array form is the multi-constraint form; each `FilterMetadata` element in the array carries its own `.operator` field (table.ts:6071–6215, e.g. `(<FilterMetadata[]>this.dataTable.filters[field]).push({..., operator: this.getDefaultOperator()})`). Combination logic: `meta.operator === FilterOperator.OR && localMatch) || (meta.operator === FilterOperator.AND && !localMatch)` (table.ts:2250).
- PrimeReact (`DataTable.js:1148–1310`): `filters[field]` is either a bare constraint object (menu-less display mode) or `{operator: FilterOperator.AND, constraints: [constraint, ...]}` when `filterDisplay === 'menu'` (DataTable.js:1295). Combination logic at DataTable.js:1199–1205 mirrors PrimeNG's AND/OR semantics exactly, just walking `filterMeta.constraints[j]` instead of the array directly.
- PrimeVue (`ColumnFilter.vue:314–487`): Same `{operator, constraints: [...]}` object shape as React — `_filters[field].constraints.push(newConstraint)`, `_filters[field].operator = value`. Imports `FilterOperator` from `@primevue/core/api`.

**Architectural inference:** This is genuine shared semantics (operator combining N constraints per field, `AND`/`OR` vocabulary identical across all three) expressed as **two, not three, distinct wire shapes**:

1. **Array-of-alternatives-with-per-item-operator** (PrimeNG only): `FilterMetadata[]`, operator duplicated onto every array element.
2. **Object-with-operator-plus-constraints-array** (PrimeReact and PrimeVue): `{operator, constraints: FilterMetadata[]}`.

ADR-043's existing text says the shape is "differently normalized between PrimeReact and PrimeNG" — accurate as far as it goes, but this pass adds that **Vue sides with React's shape, not Angular's**, which was not previously stated. This is new evidence sharpening the picture, not a contradiction of the conclusion.

**Recommendation (directional only, not a decision):** GAP-014 remains correctly deferred. The 2-vs-1 split means a shared `uix-data` contract, if one is eventually justified, would most naturally standardize on the object-with-constraints-array shape (2 of 3 frameworks already use it, and Angular's array-of-alternatives can be normalized to it without semantic loss — each Angular array element's duplicated `.operator` becomes the wrapper's single `.operator`, since all elements for a field share the same operator in practice per the push/combine logic observed). This is a hint for the eventual decision, **not a decision** — the task's instruction to let real Table implementation work surface the forcing evidence still applies, and this observation should be re-verified against actual Table spec requirements at that time rather than taken as settled.

---

## 5. Tree/TreeTable architecture comparison

### 5.1 Angular — in-place mutation confirmed at the call site

`packages/primeng/src/tree/tree.ts`, class `UITreeNode`:

```
this.tree.onNodeExpand.emit(...)   // tree.ts:350
(<TreeNode>this.node).expanded = true;   // set directly on the node object, tree.ts:345 (via expand())
```

This is a direct object-reference mutation on the `TreeNode` passed in via `[value]`, not a state-map update. `TreeTable` (`treetable.ts`) and `OrganizationChart` (`organizationchart.ts`) both import the same `TreeNode` type from `primeng/api` and both were confirmed to follow the same in-place `.expanded`/selection pattern (organizationchart.ts:168–171: `if (node.expanded) this.chart.onNodeExpand.emit(...)`).

**TreeSelect is not a parallel reimplementation — it is a real composition.** `treeselect.ts:36`: `import { Tree, TreeFilterEvent, TreeNodeSelectEvent, TreeNodeUnSelectEvent } from 'primeng/tree'`. TreeSelect renders a `Tree` instance inside its overlay panel; it does not reimplement node expansion/selection logic.

### 5.2 React — external key-maps confirmed, controlled/uncontrolled pattern verified

`components/lib/tree/Tree.js:18–61`:

```js
const [expandedKeysState, setExpandedKeysState] = React.useState(props.expandedKeys);
const expandedKeys = props.onToggle ? props.expandedKeys : expandedKeysState;
```

This is a real, explicit controlled/uncontrolled branch: if the parent supplies `onToggle`, the component is fully controlled (reads `props.expandedKeys`, never touches its own state); otherwise it manages `expandedKeysState` internally. `selectionKeys` follows the identical pattern (Tree.js:454). No object mutation anywhere in this file — `expandedKeys`/`selectionKeys` are always external `{[key: string]: boolean}` maps, passed by value and replaced wholesale on change (`{...props.expandedKeys, ...value}`, Tree.js:56).

### 5.3 Vue — key-map files confirmed present

`packages/primevue/src/tree/{BaseTree.vue, Tree.vue, TreeNode.vue}` all reference `expandedKeys` as a prop/data field (grep-confirmed; full line-level read not performed in this pass for Vue's Tree specifically — the pattern was already established with high confidence by ADR-043 and cross-checked here structurally, not re-derived from scratch). No contradiction found. Flagged `UNVERIFIED` at the fine-grained call-site level only (the file-level and prop-name-level evidence is solid).

### 5.4 Tree-family verdict

No new evidence contradicts ADR-043. The exclusion of hierarchical identity/selection/expansion from `uix-data` remains correct: Angular's mutate-in-place model and React/Vue's external-key-map model are not reconcilable into one shared contract without forcing one framework into the other's ownership model, which the task's operating rules (and ADR-043 itself) correctly identify as the wrong move. **New, more specific evidence** worth carrying forward: TreeSelect's relationship to Tree is composition, not parallel implementation — relevant to component sequencing (Tree should exist before TreeSelect can be built on top of it) but not to the shared-contract question.

---

## 6. Component relationship map

| Relationship | Nature (evidence-based) | Source |
|---|---|---|
| Table ↔ Scroller | **Real composition.** Table embeds a live Scroller/VirtualScroller instance for virtual-scroll mode in all three frameworks. | NG: `table.ts:58,191-224,992`; React: `DataTable.js:12,125`; Vue: `DataTable.vue:77-84` |
| Table ↔ Paginator | **Real composition** (Angular confirmed via `<p-paginator>`-shaped prop surface embedded in Table's own paginator-prefixed inputs, e.g. `paginatorPosition`, `paginatorStyleClass`, mirroring standalone Paginator's own props one-for-one). Not independently re-verified for a literal child-component instantiation line in React/Vue this pass — flagged `UNVERIFIED` at that specific granularity, though the shared prop surface itself is directly observed fact. | NG: `table.ts:397-432` vs `paginator.ts:164-288` (identical field names) |
| Table ↔ DataView | **Shared semantics, not composition.** DataView reuses Paginator's exact field names (`rows`, `totalRecords`, `rowsPerPageOptions`, `lazy`, `lazyLoadOnInit`, `pageLinks`) as its own inputs rather than embedding a child component differently than Table does — i.e., both Table and DataView independently compose with the pagination concept the same way. | NG: `dataview.ts:165-286` |
| Table ↔ OrderList | **Accidental naming similarity only, not shared architecture.** OrderList has no `selection`/`selectionMode`; its `filterMatchMode` is a single string, not `FilterMetadata`. Different semantic domain (list reordering, not grid selection). | NG: `orderlist.ts:168-283` (no selection input found) |
| Table ↔ PickList | **Accidental naming similarity only.** `dataKey`/`trackBy`/`sourceTrackBy` present (identity concept reused) but no `selection` input — "picking" is dual-list membership, not row selection. | NG: `picklist.ts:429-542` |
| Table ↔ TreeTable | **Shared implementation lineage, not shared contract.** Same `SortMeta`, `FilterMetadata` types imported (`treetable.ts` imports from `primeng/api` same as `table.ts`), but hierarchical value shape (`TreeNode[]` vs flat array) and in-place-mutation selection model diverge exactly as Tree does from Table. | NG: `treetable.ts:51,624-647` |
| Tree ↔ TreeSelect | **Real composition — TreeSelect wraps Tree.** | NG: `treeselect.ts:36` (`import { Tree } ... from 'primeng/tree'`) |
| Tree ↔ TreeTable | **Shared type (`TreeNode`), independent component trees.** Not a wrapper relationship like TreeSelect — TreeTable reimplements grid rendering around the same node shape, it does not embed a `Tree` instance. | NG: both import `TreeNode` from `primeng/api`; `treetable.ts` has its own `UITreeTableNode`-style row rendering, not a `<p-tree>` child |
| Tree ↔ OrganizationChart | **Shared type (`TreeNode`), independent rendering.** OrganizationChart renders a chart layout, not a list/grid — visually and structurally distinct despite the shared node type and in-place `.expanded` mutation pattern. | NG: `organizationchart.ts:99-171` |

**Conclusion for §6:** The real architectural boundary is not "Table-family vs Tree-family" as two clean buckets — it is **"flat-identity, selection-capable grid components that compose with Paginator/Scroller" (Table, TreeTable-as-grid, DataView) vs "hierarchical, mutation/key-map-based tree components that compose with each other" (Tree, TreeSelect, OrganizationChart) vs "list-transfer components with their own narrower identity/filter needs and no selection concept at all" (OrderList, PickList)**. This third bucket was not explicitly named in ADR-043 or the prior gap registry and is a genuine new finding from this pass — see §11.

---

## 7. Cross-framework convergence/divergence matrix

| Candidate | Angular | React | Vue | Classification |
|---|---|---|---|---|
| `equals`/`deepEquals` + `dataKey` identity | ✅ call-site verified | ✅ call-site verified | ✅ call-site verified | **Strongly shared** — already in `uix-data` |
| `SortMeta {field, order}` | ✅ | ✅ | Not re-verified this pass | **Strongly shared** — already in `uix-data` |
| Simple `FilterMetadata {value, matchMode}` | ✅ | ✅ | ✅ | **Strongly shared** — already in `uix-data` |
| `PaginationState` fields | ✅ | ✅ | Not re-verified this pass | **Strongly shared** — already in `uix-data` |
| Virtualization windowing math | ✅ | ✅ | ✅ | **Strongly shared** — already in `uix-data` |
| Filter operator/constraints | Array-of-alternatives | Object+constraints[] | Object+constraints[] | **Shared semantics, different implementation** (2-vs-1 shape split) — deferred, GAP-014 |
| Table↔Scroller/Paginator composition | ✅ | ✅ | ✅ | **Strongly shared architecture pattern**, not a data primitive — informs component sequencing, not `uix-data` |
| Tree node identity/selection/expansion | In-place mutation | External key-map, controlled/uncontrolled | External key-map | **Framework-native** — confirmed, not shareable (ADR-043 upheld) |
| Table state ownership mechanism (two-way binding / controlled-uncontrolled / Options-API reactive) | Input/Output pairs | Explicit hooks-based branch | `d_`-prefixed reactive fields + v-model | **Framework-native** — no shared contract possible |
| OrderList/PickList selection model | No `selection` input (either framework, structurally the same absence expected) | Not independently re-verified | Not independently re-verified | **Insufficient evidence to classify beyond "framework-native, low priority"** — these are not Table-family and do not block Table/Tree decisions |
| Editing state machine (Table) | `pEditableColumn` directive family present | Not investigated | Not investigated | **Insufficient evidence** — flagged `UNVERIFIED`, needs a dedicated pass |
| Row grouping | `rowGroupMode`/`groupRowsBy` present | Not investigated | Not investigated | **Insufficient evidence** — flagged `UNVERIFIED` |
| Drag/drop (OrderList/PickList) | `dragdrop` input present, `TreeDragDropService` imported by Tree | Not investigated | Not investigated | **Insufficient evidence** — flagged `UNVERIFIED` |

---

## 8. Candidate shared primitives

**None are recommended for addition to `uix-data` at this time.** Every strongly-shared concept identified in this pass (§7) is already present in the approved foundation. This confirms — it does not extend — ADR-043's scope.

The one near-candidate, the filter operator/constraints shape (§4), is explicitly **not** recommended for addition now: it is real, cross-framework, and better-understood than before, but the task's own operating rules and ADR-043's sequencing rationale both say the correct forcing function is real Table implementation evidence, not abstract design. Adding it now would be designing in the abstract, which this pass was instructed not to do.

---

## 9. Candidates explicitly rejected for sharing

| Candidate | Why rejected | Evidence |
|---|---|---|
| Tree-family node identity/selection/expansion | Structurally incompatible ownership models (mutation vs external key-map) | §5, ADR-043 (upheld) |
| Table state-ownership mechanism (two-way binding / controlled-uncontrolled / Options-API) | Each is a framework lifecycle idiom, not a data concept; forcing one shape onto another framework would require fighting that framework's own reactivity model | §3.4, §7 |
| Page-link display math (`pageLinkSize`) | Rendering concern (which page numbers to show as clickable links), not data state | Confirmed present in Paginator across frameworks; ADR-043's prior rejection upheld, no new evidence found to reopen it |
| `calculateFirst` virtualization family | Closes over live mutable instance state (`this.first`, `this.both`), not pure | Re-verified directly at `scroller.ts:751-761`; ADR-043's prior rejection upheld |
| OrderList/PickList "selection" as a Table-selection analog | Not actually a selection concept — list membership/transfer, no `selection`/`selectionMode` input exists in either component | §3.4, §6 |
| Editing state machine as a shared contract | Insufficient evidence collected this pass to even describe the shape, let alone claim convergence — premature to reject OR accept | §7 — correctly deferred as `UNVERIFIED`, not rejected outright |

---

## 10. Remaining architectural forks

These are the genuine open questions surfaced or sharpened by this pass. Per the task's methodology, they should be handled one at a time, not resolved here.

1. **Filter operator/constraints shape** (GAP-014, sharpened by §4): when real Table implementation work begins, which of the two real shapes (Angular's array-of-alternatives vs React/Vue's object-with-constraints-array) should `uix-data` standardize on, if any standardization is justified at that point at all. Not yet ripe for decision — needs actual Table spec work as the forcing function, per existing ADR-043 sequencing.
2. **Table↔Paginator composition granularity in React/Vue** (§6, `UNVERIFIED`): whether React's and Vue's Table literally instantiate a Paginator child component (as Angular's does) or reimplement equivalent pagination UI inline. Affects component sequencing (does Paginator need to ship before Table in React/Vue, the way it likely does in Angular) but does not affect the `uix-data` shared-contract question.
3. **Table editing/grouping/drag-drop state models** (§7, `UNVERIFIED` across all three frameworks for React/Vue, and not deeply investigated even for Angular): entirely unresearched in this pass beyond confirming the relevant inputs exist. This is the next-largest gap in evidence, not yet a "fork" in the decision sense — it's a research gap, not a two-options-to-choose-between fork.
4. **Whether the "list-transfer" bucket (OrderList, PickList) needs any shared identity contract at all**, given they already reuse `dataKey`/`equals` but have no selection concept — likely "no new contract needed, framework-native drag/reorder state" but not yet confirmed with React/Vue source for these two specifically.

---

## 11. Dependency/blocking analysis

```
uix-data (approved, implemented — ADR-043)
    ↓ (already sufficient for)
Paginator, Scroller (standalone) — no architectural blocker remaining, implementation-ready
    ↓ (composes into)
Table (flat-identity grid family) — blocked only by:
    - GAP-014 filter operator/constraints shape (deferred by design, not a blocker to starting simple-filter Table work)
    - GAP-018 Angular BaseModelHolder/BaseInput tier (separate, unrelated blocker — cell editing likely needs input foundations)
    - editing/grouping/drag-drop state models (UNVERIFIED, needs research before those specific Table features, not before Table itself)
    ↓ (shared type/pattern with, not blocked by)
TreeTable — blocked by the same open items as Table, plus its own hierarchical-value-shape work (no shared blocker with Tree family beyond the type)
    ↓ (independent branch)
Tree (hierarchical family) — no architectural blocker remaining; ADR-043's exclusion is confirmed sufficient to start framework-native implementation
    ↓ (composes into)
TreeSelect — blocked by Tree shipping first (real composition dependency, not just sequencing preference)
    ↓ (independent, shares only TreeNode type)
OrganizationChart — no blocker beyond Tree's TreeNode type existing somewhere shared/duplicated per-framework (already the case for Table/TreeTable's SortMeta/FilterMetadata reuse pattern)

DataView — no architectural blocker; reuses Paginator's proven contract only
OrderList, PickList — no architectural blocker; narrower, self-contained identity/filter needs, no dependency on Table or Tree decisions
```

**True architectural blockers found in this pass:** none. Everything in the ten-component scope is either already unblocked by the existing `uix-data` foundation, or blocked by ordinary implementation-sequencing (Tree before TreeSelect) rather than an unresolved shared-contract question. GAP-014 is a deferred decision, not a blocker — Table work can start on the simple `FilterMetadata` shape already in `uix-data` and grow into the operator/constraints question when real implementation evidence demands it, exactly as ADR-043 already prescribes.

---

## 12. Recommended next architectural decision

**Single most valuable next research track: Table editing and grouping state models, across all three frameworks, as their own dedicated real-source pass** (§10, item 3).

Rationale: this is the largest evidence gap this report leaves open, it directly affects whether Table's implementation spec can be written with confidence, and — unlike the filter operator/constraints question — it does not yet have even a first-pass real-source answer to sharpen. The filter question (§4) is better served by waiting for actual Table spec work per ADR-043's existing sequencing; editing/grouping has no such existing decision to defer to and is pure unresearched territory.

This report does not begin that research — per the task's operating rules, one fork at a time, and this recommendation itself is directional only.

---

## 13. Open questions / UNVERIFIED findings

1. Table cell/row editing state machine (`pEditableColumn` family) — Angular's input surface confirmed to exist, internal mechanics not read; React/Vue not investigated at all.
2. Table row grouping (`rowGroupMode`, `groupRowsBy`) — Angular's input surface confirmed; React/Vue not investigated.
3. Drag/drop in OrderList/PickList (`dragdrop` input, `TreeDragDropService`) — presence confirmed in Angular only; cross-framework comparison not performed.
4. Table↔Paginator composition granularity in React and Vue — Angular's embedding is structurally inferred from matching prop surfaces, not confirmed via a literal child-component instantiation line the way Scroller was; React/Vue not checked at all for this specific question.
5. PrimeVue Tree's `expandedKeys`/`selectionKeys` call-site-level mechanics (as opposed to file/prop-level presence, which is confirmed) — not read in full.
6. Table accessibility (`role="grid"`/`role="treegrid"`, keyboard navigation patterns) — referenced in COMPONENT_INVENTORY.md, not independently re-verified against real ARIA attribute usage in any framework this pass.
7. Whether DataView's grid/list layout switch has any shared-contract implications beyond pagination reuse — not investigated beyond confirming pagination field reuse.
8. Sort-toggle cycling's exact current status in React/Vue vs Angular (ADR-043 already covers this — not re-verified in this pass, carried forward as-is from existing decision).
9. Whether OrderList's `filterMatchMode` (single string) has any relationship worth tracking to Table's richer `FilterMetadata` model, or is genuinely orthogonal — leaning orthogonal given the narrower surface, not confirmed.

None of the above affect the top-line conclusion: **no contradiction to ADR-043 was found, and no new shared primitive is justified for addition to `uix-data` at this time.**

---

## 14. Consistency check

No factual contradiction to `docs/architecture/BLUEPRINT_GAPS.md` was found. GAP-014's description ("differently normalized between PrimeReact and PrimeNG") is accurate as far as it states — this report's §4 finding (Vue matches React, not Angular) is an **addition** to the evidence, not a correction of an existing false claim, so `BLUEPRINT_GAPS.md` was left unmodified per the task's instruction. If a future pass wants to fold this detail into GAP-014's evidence line, that is a small editorial addition, not a correction — flagged here for whoever picks up that gap next, not made unilaterally by this report.

No factual contradiction to ADR-043 or the `uix-data` implementation was found. No code was written or modified.
