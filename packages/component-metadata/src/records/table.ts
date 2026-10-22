import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/table/table.ts (UTable class, `input()`/`output()` signal API)
 * - React: packages/react/src/table/table.tsx (UTableProps interface + destructured props)
 * - Vue: packages/vue/src/table/base-table.ts (createBaseTable's `props`/`emits`)
 *   and packages/vue/src/table/Table.vue (real `$emit` call sites, `sortColumn()`/
 *   `selectRow()`/`onPaginatorPage()` methods)
 *
 * Table was the subject of its own separate, closed implementation effort
 * immediately before Phase 6 began — its props/events below are drawn from a
 * component whose API surface is already stable and shipped, not newly
 * authored for this metadata task. This is the plan's central worked
 * example (spec §12): the richest real cross-framework event divergence
 * found anywhere in the catalog, a real `relationships.dependsOn`
 * (Table composes the already-catalogued Paginator and Scroller, not mocks
 * of them), and the spec §6.1a description/accessibility.guidance boundary.
 *
 * THREE flagship events are detailed here, each verified per framework — the semantic
 * payload is stable per event but the framework-level MECHANISM/NAME
 * diverges sharply:
 *
 * - `sort-changed` — the plan's own flagship divergence case. Angular's
 *   `UTable` declares a plain `sortFieldChange = output<string | undefined>()`
 *   (table.ts:124, alongside `sortOrderChange`/`multiSortMetaChange`) fired
 *   by `onSort()` (table.ts:387-402) — no internal sort state is retained by
 *   Table itself, matching Paginator's/React's "no uncontrolled fallback"
 *   convention already established for this catalog. React's
 *   `UTableProps.onSort` (table.tsx:30) is an OPTIONAL callback prop:
 *   `(event: UTableSortEvent) => void`, called by `handleSort` (table.tsx:441-457)
 *   only `if (onSort)` — clicking a header is inert with no callback supplied
 *   (table.tsx doc comment: "no uncontrolled fallback"). Vue's `Table.vue`
 *   declares `emits: ["sort", ...]` (base-table.ts:32-40) — NOT "onSort" —
 *   fired via `this.$emit("sort", {...})` in `sortColumn()`
 *   (Table.vue:313-327). Angular emits the *changed field* alone (plus two
 *   sibling outputs for order/multiSortMeta); React/Vue emit one combined
 *   event object (`{sortField, sortOrder}` or `{multiSortMeta}`) — a real
 *   payload-shape divergence layered on top of the name/mechanism
 *   divergence, captured in each event's own `payloadDescription`.
 *
 * - `selection-changed` — Angular's `selectionChange = output<T | T[]>()`
 *   (table.ts:133), fired by `onRowClick` (table.ts:428-442). React's
 *   `onSelectionChange` (table.tsx:49) is an optional callback prop, fired
 *   by `handleRowClick` (table.tsx:319-331) only when both `selectionMode`
 *   and `onSelectionChange` are supplied. Vue's `Table.vue` `selectRow()`
 *   (Table.vue:352-366) emits BOTH `update:selection` (the v-model
 *   companion, for `v-model:selection` two-way binding) AND a second, plain
 *   `selection-change` event with the identical payload — mirroring
 *   Paginator's own established "page" + "update:first"/"update:rows"
 *   dual-emit pattern (see paginator.ts's PAGINATOR_METADATA header
 *   comment). This record models Vue's semantic `selection-change` emit
 *   under the shared `selection-changed` semanticId (parallel to ng/react's
 *   semantic name); `update:selection` is a distinct v-model-only companion
 *   emit with no ng/react counterpart and is intentionally left unmodeled
 *   here, matching how Paginator's `update:first`/`update:rows` were each
 *   given their OWN semanticId rather than folded into `pageChanged` — the
 *   difference here is that `update:selection` carries no independent
 *   semantic beyond what `selection-change` already states, so it is noted
 *   in this comment rather than double-counted as a fourth event.
 *
 * - `page-changed` — Angular's `firstChange = output<number>()`
 *   (table.ts:141, alongside a sibling `rowsChange` output) fired by
 *   `onPaginatorPageChange` (table.ts:298-302) AFTER the internal `_first`
 *   signal is updated locally — Table re-broadcasts the composed
 *   `UPaginator`'s own `onPageChange` output under its own output name.
 *   React's `onPage` (table.tsx:55) is an optional callback prop, wired
 *   directly to the composed `<UPaginator>`'s `onPageChange` (table.tsx:552-558:
 *   `onPageChange={(event) => onPage?.(event)}`) — a bare forward, not a
 *   renamed re-emission of a locally-owned value. Vue's `Table.vue`
 *   `onPaginatorPage()` (Table.vue:263-265) re-emits the composed
 *   `UPaginator`'s own `page` event verbatim as Table's own `page` event
 *   (`this.$emit("page", event)`) — matching Angular's re-broadcast pattern,
 *   not React's bare forward, even though the emitted NAME ("page") matches
 *   neither Angular's "firstChange" nor React's "onPage".
 *
 * relationships.dependsOn: ["Paginator", "Scroller"] — Table composes both
 * REAL, already-catalogued components rather than reimplementing paging or
 * windowing: `<u-paginator>`/`<UPaginator>`/`<UPaginator>` for pagination
 * (table.ts:98-105, table.tsx:552-559, Table.vue:85-91) and the real
 * `UScroller` (via its content-template/contentTemplate/`content`
 * scoped-slot composition point documented in SCROLLER_METADATA's own header
 * comment) for virtualization (table.ts:25-61, table.tsx:516-551,
 * Table.vue:44-84). Matches docs/architecture/COMPONENT_INVENTORY.md's
 * Table row ("primitive + overlay tiers, scroller, paginator") and
 * provenance/ng.json's own Table modificationDescription ("pagination
 * composes the real UPaginator instance ... virtualization composes the
 * real UScroller instance").
 *
 * accessibility.verifiedRoles/verifiedAriaAttributes — verified directly
 * against real rendered markup in all three frameworks: `role="table"` on
 * the root (table.ts:24, table.tsx:460, Table.vue:2), `role="rowgroup"` on
 * thead/tbody (table.ts:64/75, table.tsx:462/477, Table.vue:4/15),
 * `role="row"` on the header row and every data row (table.ts:65/84,
 * table.tsx:463/487, Table.vue:5/26), `role="columnheader"` plus
 * `aria-sort` on each `<th>` (table.ts:68-70, table.tsx:467-468,
 * Table.vue:9-10), and `aria-selected` on each data row (table.ts:86,
 * table.tsx:489, Table.vue:28).
 *
 * accessibility.guidance — the real, already-documented windowed-keyboard-
 * navigation limitation, present verbatim (per framework) as an inline code
 * comment directly on each framework's own keyboard-row-navigation handler:
 * ng's template (table.ts:36-41, "Known limitation: onRowKeyDown walks
 * :scope > [role="row"] within this tbody, which under virtualization only
 * contains the currently-rendered window, not the full logical dataset"),
 * react's virtualized-row markup (table.tsx:533-538, identical wording), and
 * vue's virtualized template (Table.vue:70-77, same limitation restated for
 * the sibling-traversal mechanism). All three frameworks' own source
 * independently mark this "intentional (a row outside the window isn't in
 * the DOM to focus), not a bug" — this is a real, already-shipped and
 * already-tested limitation of Table's Scroller composition, not a newly
 * invented caveat.
 *
 * Drift classification (2026-10-18, W2-B4 metadata drift classification):
 * the selection-column, loading, lazy-load, row-editing, cell-editing,
 * filter and row-expansion props/events the sources declare (GAP-042/043/044/046)
 * are now recorded as their own facts. So are ng's two-way companion
 * outputs sortOrderChange, multiSortMetaChange and rowsChange (semanticIds
 * sort-order-changed, multi-sort-meta-changed, rows-changed); in multi-sort
 * mode multiSortMetaChange is the only sort output onSort() emits.
 */
export const TABLE_METADATA: ComponentMetadata = {
  name: "Table",
  category: "Data",
  description:
    "Table renders tabular data with sorting, filtering, selection, pagination, virtualization, and row/cell editing.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 2,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/table/table.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/table/table.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/table/base-table.ts" },
  },
  api: {
    ng: {
      props: [
        {
          name: "value",
          type: "T[]",
          default: "[]",
          required: false,
          description: "The full, unpaginated array of records to render.",
        },
        {
          name: "dataKey",
          type: "string",
          default: '""',
          required: false,
          description:
            "Field name used to resolve a row's identity for selection equality and row editing.",
        },
        {
          name: "columns",
          type: "{ field: string; header: string }[]",
          default: "[]",
          required: false,
          description: "Column definitions: field to resolve per row, and header text to render.",
        },
        {
          name: "sortMode",
          type: "SortMode",
          default: '"single"',
          required: false,
          description:
            "Whether a single field or multiple fields (via multiSortMeta) drive sorting.",
        },
        {
          name: "sortField",
          type: "string | undefined",
          required: false,
          description: "Field currently sorted on, in single-sort mode.",
        },
        {
          name: "sortOrder",
          type: "1 | 0 | -1",
          default: "0",
          required: false,
          description: "Sort direction for sortField, in single-sort mode.",
        },
        {
          name: "multiSortMeta",
          type: "SortMeta[]",
          default: "[]",
          required: false,
          description: "Priority-ordered field/order pairs driving sorting, in multi-sort mode.",
        },
        {
          name: "filters",
          type: "Record<string, FilterMetadata | FilterMetadata[]>",
          default: "{}",
          required: false,
          description:
            "Per-field filter criteria; an array value is OR'd alternatives (Angular's array-of-alternatives shape).",
        },
        {
          name: "selectionMode",
          type: "SelectionMode | undefined",
          required: false,
          description:
            "When set, enables row-click selection (single replaces selection, multiple toggles rows in/out of it).",
        },
        {
          name: "selection",
          type: "T | T[] | undefined",
          required: false,
          description: "Currently selected row (single mode) or rows (multiple mode).",
        },
        {
          name: "compareSelectionBy",
          type: '"equals" | "deepEquals"',
          default: '"equals"',
          required: false,
          description:
            "Row-identity comparator for selection matching: dataKey-based field identity, or full structural deepEquals.",
        },
        {
          name: "selectionColumn",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true and selectionMode is set, renders a leading selection column: a checkbox per row plus a header select-all checkbox in multiple mode, a radio per row in single mode.",
        },
        {
          name: "paginator",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true, renders a composed UPaginator beneath the table and slices the filtered/sorted rows to the current page.",
        },
        {
          name: "first",
          type: "number",
          default: "0",
          required: false,
          description: "Zero-relative index of the first record on the current page.",
        },
        {
          name: "rows",
          type: "number",
          default: "0",
          required: false,
          description: "Number of rows to display per page.",
        },
        {
          name: "totalRecords",
          type: "number",
          default: "0",
          required: false,
          description: "Total record count, forwarded to the composed UPaginator.",
        },
        {
          name: "rowsPerPageOptions",
          type: "number[] | undefined",
          required: false,
          description: "Row-count choices offered by the composed UPaginator.",
        },
        {
          name: "virtualScroll",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true, renders rows through a composed UScroller instead of a plain tbody map.",
        },
        {
          name: "virtualScrollItemSize",
          type: "number",
          default: "0",
          required: false,
          description:
            "Row height in pixels, forwarded to the composed UScroller for windowing math.",
        },
        {
          name: "lazy",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true, enables the composed UScroller's lazy-load notification, forwarded as onLazyLoad.",
        },
        {
          name: "lazyLoadOnInit",
          type: "boolean",
          default: "false",
          required: false,
          description: "When true, triggers an initial lazy-load notification on first render.",
        },
        {
          name: "editMode",
          type: '"cell" | "row" | undefined',
          required: false,
          description:
            "Enables the row-edit-init affordance ('row') or cell-level editing ('cell').",
        },
        {
          name: "editingRowKeys",
          type: "Record<string, boolean>",
          default: "{}",
          required: false,
          description:
            "Key-map (keyed by dataKey-resolved row identity) of rows currently in edit mode.",
        },
        {
          name: "expandedRowKeys",
          type: "Record<string, boolean>",
          default: "{}",
          required: false,
          description:
            "Key-map (keyed by dataKey-resolved row identity) of rows currently expanded; a per-row expansion toggle renders when dataKey is set.",
        },
        {
          name: "rowGroupMode",
          type: '"subheader" | "rowspan" | undefined',
          required: false,
          description: "Row-grouping display strategy when groupRowsBy is set.",
        },
        {
          name: "groupRowsBy",
          type: "string | undefined",
          required: false,
          description: "Field used to group adjacent rows sharing the same value.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true, renders a single loading row in place of the body rows (non-virtualized rendering only).",
        },
      ],
      events: [
        {
          semanticId: "sort-changed",
          frameworkName: "sortFieldChange",
          mechanism: "output",
          payloadDescription:
            "string | undefined — the clicked column's field, emitted by onSort() on every header click in single-sort mode; sortOrderChange (always 1) and multiSortMetaChange (multi-sort mode) are sibling outputs emitted from the same handler, not folded into this one.",
        },
        {
          semanticId: "sort-order-changed",
          frameworkName: "sortOrderChange",
          mechanism: "output",
          payloadDescription:
            "1 | 0 | -1 — always 1 (ascending), emitted by onSort() right after sortFieldChange on every header click in single-sort mode; not emitted in multi-sort mode. The two-way companion of the sortOrder input ([(sortOrder)]).",
        },
        {
          semanticId: "multi-sort-meta-changed",
          frameworkName: "multiSortMetaChange",
          mechanism: "output",
          payloadDescription:
            "SortMeta[] — the next multiSortMeta array with the clicked field added or replaced at order 1, emitted by onSort() on every header click in multi-sort mode, where it is the only sort output. The two-way companion of the multiSortMeta input ([(multiSortMeta)]).",
        },
        {
          semanticId: "selection-changed",
          frameworkName: "selectionChange",
          mechanism: "output",
          payloadDescription:
            "T | T[] — the next selection value, emitted by onRowClick() on a row click when selectionMode is set. Single mode always emits the clicked row; multiple mode emits the toggled selection array.",
        },
        {
          semanticId: "page-changed",
          frameworkName: "firstChange",
          mechanism: "output",
          payloadDescription:
            "number — the composed UPaginator's onPageChange.first, re-broadcast by onPaginatorPageChange() after the internal _first signal is updated locally. A sibling rowsChange output re-broadcasts .rows from the same handler.",
        },
        {
          semanticId: "rows-changed",
          frameworkName: "rowsChange",
          mechanism: "output",
          payloadDescription:
            "number — the composed UPaginator's onPageChange.rows, emitted by onPaginatorPageChange() right after firstChange so a [(rows)] two-way binding stays in sync.",
        },
        {
          semanticId: "lazy-load",
          frameworkName: "onLazyLoad",
          mechanism: "output",
          payloadDescription:
            "{ first: number; last: number } — the composed UScroller's own onLazyLoad payload, re-emitted unchanged by onScrollerLazyLoad().",
        },
        {
          semanticId: "editing-rows-changed",
          frameworkName: "editingRowKeysChange",
          mechanism: "output",
          payloadDescription:
            "Record<string, boolean> — the next editing key-map, emitted by initRowEdit() when a row enters edit mode and by the save/cancel exit path when it leaves it.",
        },
        {
          semanticId: "expanded-rows-changed",
          frameworkName: "expandedRowKeysChange",
          mechanism: "output",
          payloadDescription:
            "Record<string, boolean> — the next expansion key-map with the toggled row's dataKey identity flipped, emitted by toggleRowExpansion().",
        },
        {
          semanticId: "row-expand",
          frameworkName: "onRowExpand",
          mechanism: "output",
          payloadDescription:
            "{ originalEvent: Event; data: T } — emitted by toggleRowExpansion(), after expandedRowKeysChange, when the row becomes expanded.",
        },
        {
          semanticId: "row-collapse",
          frameworkName: "onRowCollapse",
          mechanism: "output",
          payloadDescription:
            "{ originalEvent: Event; data: T } — emitted by toggleRowExpansion(), after expandedRowKeysChange, when the row becomes collapsed.",
        },
      ],
    },
    react: {
      props: [
        {
          name: "value",
          type: "T[]",
          required: true,
          description: "The full, unpaginated array of records to render.",
        },
        {
          name: "dataKey",
          type: "string",
          required: false,
          description:
            "Field name used to resolve a row's identity for selection equality and row editing.",
        },
        {
          name: "columns",
          type: "UTableColumn[]",
          required: true,
          description: "Column definitions: field to resolve per row, and header text to render.",
        },
        {
          name: "sortMode",
          type: "SortMode",
          default: '"single"',
          required: false,
          description:
            "Whether a single field or multiple fields (via multiSortMeta) drive sorting.",
        },
        {
          name: "sortField",
          type: "string",
          required: false,
          description: "Field currently sorted on, in single-sort mode.",
        },
        {
          name: "sortOrder",
          type: "1 | 0 | -1",
          default: "0",
          required: false,
          description: "Sort direction for sortField, in single-sort mode.",
        },
        {
          name: "multiSortMeta",
          type: "SortMeta[]",
          default: "[]",
          required: false,
          description: "Priority-ordered field/order pairs driving sorting, in multi-sort mode.",
        },
        {
          name: "filters",
          type: 'Record<string, FilterMetadata | { operator: "and" | "or"; constraints: FilterMetadata[] }>',
          default: "{}",
          required: false,
          description:
            "Per-field filter criteria; a {operator, constraints} group AND/ORs its constraints (React's object-with-constraints-array shape, distinct from Angular's array-of-alternatives shape).",
        },
        {
          name: "selectionMode",
          type: "SelectionMode | undefined",
          required: false,
          description:
            "When set, enables row-click selection (single replaces selection, multiple toggles rows in/out of it).",
        },
        {
          name: "selection",
          type: "T | T[] | undefined",
          required: false,
          description: "Currently selected row (single mode) or rows (multiple mode).",
        },
        {
          name: "compareSelectionBy",
          type: '"equals" | "deepEquals"',
          default: '"equals"',
          required: false,
          description:
            "Row-identity comparator for selection matching: dataKey-based field identity, or full structural deepEquals.",
        },
        {
          name: "selectionColumn",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true and selectionMode is set, renders a leading selection column: a checkbox per row plus a header select-all checkbox in multiple mode, a radio per row in single mode.",
        },
        {
          name: "paginator",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true, renders a composed UPaginator beneath the table and slices the filtered/sorted rows to the current page.",
        },
        {
          name: "first",
          type: "number",
          default: "0",
          required: false,
          description: "Zero-relative index of the first record on the current page.",
        },
        {
          name: "rows",
          type: "number",
          default: "0",
          required: false,
          description: "Number of rows to display per page.",
        },
        {
          name: "totalRecords",
          type: "number",
          default: "0",
          required: false,
          description: "Total record count, forwarded to the composed UPaginator.",
        },
        {
          name: "virtualScrollerOptions",
          type: "{ itemSize: number } | undefined",
          required: false,
          description:
            "When set, renders rows through a composed UScroller (via its contentTemplate render-prop) instead of a plain tbody map.",
        },
        {
          name: "lazy",
          type: "boolean | undefined",
          required: false,
          description: "When true, enables the composed UScroller's lazy-load notification.",
        },
        {
          name: "editMode",
          type: '"cell" | "row" | undefined',
          required: false,
          description:
            "Enables the row-edit-init affordance ('row') or cell-level editing ('cell').",
        },
        {
          name: "editingRows",
          type: "Record<string, boolean> | undefined",
          required: false,
          description:
            "Controlled key-map of rows currently in edit mode; falls back to internal state when onRowEditChange is omitted.",
        },
        {
          name: "cellEditValidator",
          type: "(event: { newValue: unknown; oldValue: unknown }) => boolean",
          required: false,
          description:
            "Accepted for interface-contract completeness (part of PrimeReact's real DataTable cell-edit surface) but not yet invoked: the cell-edit validator wiring is deferred beyond the row-edit lifecycle scope.",
        },
        {
          name: "expandedRowKeys",
          type: "Record<string, boolean> | undefined",
          required: false,
          description:
            "Key-map (keyed by dataKey-resolved row identity) of rows currently expanded; fully parent-owned when onExpandedRowKeysChange is supplied, otherwise an internal state fallback is used when it is omitted.",
        },
        {
          name: "rowGroupMode",
          type: '"subheader" | "rowspan" | undefined',
          required: false,
          description: "Row-grouping display strategy when groupRowsBy is set.",
        },
        {
          name: "groupRowsBy",
          type: "string | undefined",
          required: false,
          description: "Field used to group adjacent rows sharing the same value.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "When true, renders a single loading row in place of the body rows (non-virtualized rendering only).",
        },
      ],
      events: [
        {
          semanticId: "sort-changed",
          frameworkName: "onSort",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: UTableSortEvent) => void — optional prop. UTableSortEvent is { sortField, sortOrder } in single-sort mode or { multiSortMeta } in multi-sort mode, called by handleSort() only when supplied. Table holds no sort state of its own — a header click is inert without this callback, matching Paginator's no-uncontrolled-fallback convention.",
        },
        {
          semanticId: "selection-changed",
          frameworkName: "onSelectionChange",
          mechanism: "callback-prop",
          payloadDescription:
            "(selection: T | T[]) => void — optional prop, called by handleRowClick() only when both selectionMode and onSelectionChange are supplied. Single mode always calls with the clicked row; multiple mode calls with the toggled selection array.",
        },
        {
          semanticId: "page-changed",
          frameworkName: "onPage",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: PaginatorPageChangeEvent) => void — optional prop, wired as a bare forward directly to the composed UPaginator's own onPageChange callback (onPageChange={(event) => onPage?.(event)}) — not a renamed re-emission of a locally-owned value, unlike ng's firstChange.",
        },
        {
          semanticId: "filter",
          frameworkName: "onFilter",
          mechanism: "callback-prop",
          payloadDescription:
            "(filters: Record<string, FilterMetadata | { operator; constraints }>) => void — optional prop, accepted for interface-contract completeness but not yet invoked: no trigger point or payload is defined yet.",
        },
        {
          semanticId: "lazy-load",
          frameworkName: "onLazyLoad",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: { first: number; last: number }) => void — optional prop, passed straight through to the composed UScroller's own onLazyLoad.",
        },
        {
          semanticId: "editing-rows-changed",
          frameworkName: "onRowEditChange",
          mechanism: "callback-prop",
          payloadDescription:
            "(editingRows: Record<string, boolean>) => void — optional prop, called with the next editing key-map on row-edit init, save and cancel. When supplied, editingRows is fully parent-owned; when omitted, an internal useState fallback holds the map.",
        },
        {
          semanticId: "row-edit-init",
          frameworkName: "onRowEditInit",
          mechanism: "callback-prop",
          payloadDescription:
            "(row: T) => void — optional prop, called with the row when its edit-init button is clicked, before the editing key-map update.",
        },
        {
          semanticId: "row-edit-save",
          frameworkName: "onRowEditSave",
          mechanism: "callback-prop",
          payloadDescription:
            "(row: T) => void — optional prop, called with the committed (draft-merged) row when a row edit is saved.",
        },
        {
          semanticId: "row-edit-cancel",
          frameworkName: "onRowEditCancel",
          mechanism: "callback-prop",
          payloadDescription:
            "(row: T) => void — optional prop, called with the original row when a row edit is cancelled.",
        },
        {
          semanticId: "cell-edit-complete",
          frameworkName: "onCellEditComplete",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: { newValue: unknown; oldValue: unknown }) => void — optional prop, accepted for interface-contract completeness but not yet invoked (cell-edit validator wiring is deferred).",
        },
        {
          semanticId: "cell-edit-cancel",
          frameworkName: "onCellEditCancel",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: { newValue: unknown; oldValue: unknown }) => void — optional prop, accepted for interface-contract completeness but not yet invoked (cell-edit validator wiring is deferred).",
        },
        {
          semanticId: "expanded-rows-changed",
          frameworkName: "onExpandedRowKeysChange",
          mechanism: "callback-prop",
          payloadDescription:
            "(expandedRowKeys: Record<string, boolean>) => void — optional prop, called with the next expansion key-map on each row-expansion toggle. When supplied, expandedRowKeys is fully parent-owned; when omitted, an internal useState fallback holds the map.",
        },
        {
          semanticId: "row-expand",
          frameworkName: "onRowExpand",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: { originalEvent: React.SyntheticEvent; data: T }) => void — optional prop, called by the row-expansion toggle when the row becomes expanded.",
        },
        {
          semanticId: "row-collapse",
          frameworkName: "onRowCollapse",
          mechanism: "callback-prop",
          payloadDescription:
            "(event: { originalEvent: React.SyntheticEvent; data: T }) => void — optional prop, called by the row-expansion toggle when the row becomes collapsed.",
        },
      ],
    },
    vue: {
      props: [
        {
          name: "value",
          type: "Array",
          default: "[]",
          required: false,
          description: "The full, unpaginated array of records to render.",
        },
        {
          name: "dataKey",
          type: "String",
          default: '""',
          required: false,
          description:
            "Field name used to resolve a row's identity for selection equality and row editing.",
        },
        {
          name: "columns",
          type: "Array",
          default: "[]",
          required: false,
          description: "Column definitions: field to resolve per row, and header text to render.",
        },
        {
          name: "sortMode",
          type: "String",
          default: '"single"',
          required: false,
          description:
            "Whether a single field or multiple fields (via multiSortMeta) drive sorting.",
        },
        {
          name: "sortField",
          type: "String",
          default: "undefined",
          required: false,
          description: "Field currently sorted on, in single-sort mode.",
        },
        {
          name: "sortOrder",
          type: "Number",
          default: "0",
          required: false,
          description: "Sort direction for sortField, in single-sort mode.",
        },
        {
          name: "multiSortMeta",
          type: "Array",
          default: "[]",
          required: false,
          description: "Priority-ordered field/order pairs driving sorting, in multi-sort mode.",
        },
        {
          name: "filters",
          type: "Object",
          default: "{}",
          required: false,
          description:
            "Per-field filter criteria; a {operator, constraints} group AND/ORs its constraints, matching React's shape.",
        },
        {
          name: "selectionMode",
          type: "String",
          default: "undefined",
          required: false,
          description:
            "When set, enables row-click selection (single replaces selection, multiple toggles rows in/out of it).",
        },
        {
          name: "selection",
          type: "[Object, Array]",
          default: "undefined",
          required: false,
          description: "Currently selected row (single mode) or rows (multiple mode).",
        },
        {
          name: "compareSelectionBy",
          type: "String",
          default: '"equals"',
          required: false,
          description:
            "Row-identity comparator for selection matching: dataKey-based field identity, or full structural deepEquals.",
        },
        {
          name: "selectionColumn",
          type: "Boolean",
          default: "false",
          required: false,
          description:
            "When true and selectionMode is set, renders a leading selection column: a checkbox per row plus a header select-all checkbox in multiple mode, a radio per row in single mode.",
        },
        {
          name: "paginator",
          type: "Boolean",
          default: "false",
          required: false,
          description:
            "When true, renders a composed UPaginator beneath the table and slices the filtered/sorted rows to the current page.",
        },
        {
          name: "first",
          type: "Number",
          default: "0",
          required: false,
          description: "Zero-relative index of the first record on the current page.",
        },
        {
          name: "rows",
          type: "Number",
          default: "0",
          required: false,
          description: "Number of rows to display per page.",
        },
        {
          name: "totalRecords",
          type: "Number",
          default: "0",
          required: false,
          description: "Total record count, forwarded to the composed UPaginator.",
        },
        {
          name: "rowsPerPageOptions",
          type: "Array",
          default: "[]",
          required: false,
          description: "Row-count choices offered by the composed UPaginator.",
        },
        {
          name: "virtualScrollerOptions",
          type: "Object",
          default: "undefined",
          required: false,
          description:
            "When set, renders rows through a composed UScroller (via its named 'content' scoped slot) instead of a plain tbody map.",
        },
        {
          name: "lazy",
          type: "Boolean",
          default: "false",
          required: false,
          description:
            "When true, enables the composed UScroller's lazy-load notification, forwarded via lazy-load.",
        },
        {
          name: "editMode",
          type: "String",
          default: "undefined",
          required: false,
          description:
            "Enables the row-edit-init affordance ('row') or cell-level editing ('cell').",
        },
        {
          name: "editingRows",
          type: "Array",
          default: "[]",
          required: false,
          description:
            "Array of rows currently in edit mode (Vue's array-append idiom, distinct from ng's/react's dataKey-based key-map shape).",
        },
        {
          name: "expandedRowKeys",
          type: "Object",
          default: "{}",
          required: false,
          description:
            "Key-map (keyed by dataKey-resolved row identity) of rows currently expanded, matching ng's/react's key-map shape; a per-row expansion toggle renders when dataKey is set.",
        },
        {
          name: "rowGroupMode",
          type: "String",
          default: "undefined",
          required: false,
          description: "Row-grouping display strategy when groupRowsBy is set.",
        },
        {
          name: "groupRowsBy",
          type: "String",
          default: "undefined",
          required: false,
          description: "Field used to group adjacent rows sharing the same value.",
        },
        {
          name: "loading",
          type: "Boolean",
          default: "false",
          required: false,
          description:
            "When true, renders a single loading row in place of the body rows (non-virtualized rendering only).",
        },
      ],
      events: [
        {
          semanticId: "sort-changed",
          frameworkName: "sort",
          mechanism: "emit",
          payloadDescription:
            "{ sortField, sortOrder } in single-sort mode or { multiSortMeta } in multi-sort mode — emitted by sortColumn() on every header click. NOT named 'onSort' — the declared emits-array name is 'sort'. Vue props are one-way, so this never assigns back to sortField/sortOrder/multiSortMeta itself.",
        },
        {
          semanticId: "selection-changed",
          frameworkName: "selection-change",
          mechanism: "emit",
          payloadDescription:
            "T | T[] — the next selection value, emitted by selectRow() alongside a companion 'update:selection' v-model emit carrying the identical payload (mirroring Paginator's own 'page' + 'update:first'/'update:rows' dual-emit pattern). Single mode always emits the clicked row; multiple mode emits the toggled selection array.",
        },
        {
          semanticId: "page-changed",
          frameworkName: "page",
          mechanism: "emit",
          payloadDescription:
            "PaginatorPageChangeEvent — the composed UPaginator's own 'page' event, re-emitted verbatim by onPaginatorPage() as Table's own 'page' event. NOT named 'onPageChange' or 'firstChange'.",
        },
        {
          semanticId: "filter",
          frameworkName: "filter",
          mechanism: "emit",
          payloadDescription:
            "Declared in the emits array but never emitted: Table.vue has no $emit('filter') call site.",
        },
        {
          semanticId: "lazy-load",
          frameworkName: "lazy-load",
          mechanism: "emit",
          payloadDescription:
            "{ first, last } — the composed UScroller's own lazy-load event, re-emitted verbatim from the template listener.",
        },
        {
          semanticId: "editing-rows-changed",
          frameworkName: "update:editingRows",
          mechanism: "emit",
          payloadDescription:
            "Array — the next editing-rows array, emitted by initRowEdit() (row appended) and by the save/cancel exit path (row removed); the editingRows prop itself is never mutated.",
        },
        {
          semanticId: "row-edit-save",
          frameworkName: "row-edit-save",
          mechanism: "emit",
          payloadDescription:
            "The committed (draft-merged) row, emitted by saveRowEdit() before the row exits edit mode.",
        },
        {
          semanticId: "row-edit-cancel",
          frameworkName: "row-edit-cancel",
          mechanism: "emit",
          payloadDescription:
            "The original row, emitted by cancelRowEdit() before the row exits edit mode.",
        },
        {
          semanticId: "expanded-rows-changed",
          frameworkName: "update:expandedRowKeys",
          mechanism: "emit",
          payloadDescription:
            "Object — the next expansion key-map with the toggled row's dataKey identity flipped, emitted by toggleRowExpansion(); the expandedRowKeys prop itself is never mutated.",
        },
        {
          semanticId: "row-expand",
          frameworkName: "row-expand",
          mechanism: "emit",
          payloadDescription:
            "{ originalEvent, data } — emitted by toggleRowExpansion(), after update:expandedRowKeys, when the row becomes expanded.",
        },
        {
          semanticId: "row-collapse",
          frameworkName: "row-collapse",
          mechanism: "emit",
          payloadDescription:
            "{ originalEvent, data } — emitted by toggleRowExpansion(), after update:expandedRowKeys, when the row becomes collapsed.",
        },
      ],
    },
  },
  accessibility: {
    verifiedRoles: ["table", "rowgroup", "row", "columnheader"],
    verifiedAriaAttributes: ["aria-sort", "aria-selected"],
    guidance:
      "Keyboard navigation (ArrowDown/ArrowUp/Home/End) only operates within the currently-rendered virtualized window, not the full logical dataset, when virtualScroll/virtualScrollerOptions is active — a row outside the window is not in the DOM to focus. This is a real, intentional, already-shipped limitation of Table's Scroller composition, documented inline at the row-keydown handler in all three frameworks' own source.",
  },
  relationships: {
    dependsOn: ["Paginator", "Scroller"],
  },
  style: {
    componentName: "table",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: [
      "packages/ng/src/table/table.ts",
      "packages/ng/src/table/table-style.ts",
    ],
  },
};
