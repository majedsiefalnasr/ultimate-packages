---
component: Table
metadataVersion: 2
frameworks: [ng, react, vue]
---

# Table

## When to use

## Preferred patterns

<!-- ultimate:generated:start section="preferred-patterns" -->

<!-- ultimate:generated:end section="preferred-patterns" -->

## Allowed/recommended APIs

<!-- ultimate:generated:start section="allowed-apis" -->

### ng props

- `value`: T[] (default: [])
- `dataKey`: string (default: "")
- `columns`: { field: string; header: string }[] (default: [])
- `sortMode`: SortMode (default: "single")
- `sortField`: string | undefined
- `sortOrder`: 1 | 0 | -1 (default: 0)
- `multiSortMeta`: SortMeta[] (default: [])
- `filters`: Record<string, FilterMetadata | FilterMetadata[]> (default: {})
- `selectionMode`: SelectionMode | undefined
- `selection`: T | T[] | undefined
- `compareSelectionBy`: "equals" | "deepEquals" (default: "equals")
- `selectionColumn`: boolean (default: false)
- `paginator`: boolean (default: false)
- `first`: number (default: 0)
- `rows`: number (default: 0)
- `totalRecords`: number (default: 0)
- `rowsPerPageOptions`: number[] | undefined
- `virtualScroll`: boolean (default: false)
- `virtualScrollItemSize`: number (default: 0)
- `lazy`: boolean (default: false)
- `lazyLoadOnInit`: boolean (default: false)
- `editMode`: "cell" | "row" | undefined
- `editingRowKeys`: Record<string, boolean> (default: {})
- `expandedRowKeys`: Record<string, boolean> (default: {})
- `rowGroupMode`: "subheader" | "rowspan" | undefined
- `groupRowsBy`: string | undefined
- `loading`: boolean (default: false)

### ng events

- `sortFieldChange` (output): sort-changed
- `selectionChange` (output): selection-changed
- `firstChange` (output): page-changed
- `onLazyLoad` (output): lazy-load
- `editingRowKeysChange` (output): editing-rows-changed
- `expandedRowKeysChange` (output): expanded-rows-changed
- `onRowExpand` (output): row-expand
- `onRowCollapse` (output): row-collapse

### react props

- `value`: T[] (required)
- `dataKey`: string
- `columns`: UTableColumn[] (required)
- `sortMode`: SortMode (default: "single")
- `sortField`: string
- `sortOrder`: 1 | 0 | -1 (default: 0)
- `multiSortMeta`: SortMeta[] (default: [])
- `filters`: Record<string, FilterMetadata | { operator: "and" | "or"; constraints: FilterMetadata[] }> (default: {})
- `selectionMode`: SelectionMode | undefined
- `selection`: T | T[] | undefined
- `compareSelectionBy`: "equals" | "deepEquals" (default: "equals")
- `selectionColumn`: boolean (default: false)
- `paginator`: boolean (default: false)
- `first`: number (default: 0)
- `rows`: number (default: 0)
- `totalRecords`: number (default: 0)
- `virtualScrollerOptions`: { itemSize: number } | undefined
- `lazy`: boolean | undefined
- `editMode`: "cell" | "row" | undefined
- `editingRows`: Record<string, boolean> | undefined
- `cellEditValidator`: (event: { newValue: unknown; oldValue: unknown }) => boolean
- `expandedRowKeys`: Record<string, boolean> | undefined
- `rowGroupMode`: "subheader" | "rowspan" | undefined
- `groupRowsBy`: string | undefined
- `loading`: boolean (default: false)

### react events

- `onSort` (callback-prop): sort-changed
- `onSelectionChange` (callback-prop): selection-changed
- `onPage` (callback-prop): page-changed
- `onFilter` (callback-prop): filter
- `onLazyLoad` (callback-prop): lazy-load
- `onRowEditChange` (callback-prop): editing-rows-changed
- `onRowEditInit` (callback-prop): row-edit-init
- `onRowEditSave` (callback-prop): row-edit-save
- `onRowEditCancel` (callback-prop): row-edit-cancel
- `onCellEditComplete` (callback-prop): cell-edit-complete
- `onCellEditCancel` (callback-prop): cell-edit-cancel
- `onExpandedRowKeysChange` (callback-prop): expanded-rows-changed
- `onRowExpand` (callback-prop): row-expand
- `onRowCollapse` (callback-prop): row-collapse

### vue props

- `value`: Array (default: [])
- `dataKey`: String (default: "")
- `columns`: Array (default: [])
- `sortMode`: String (default: "single")
- `sortField`: String (default: undefined)
- `sortOrder`: Number (default: 0)
- `multiSortMeta`: Array (default: [])
- `filters`: Object (default: {})
- `selectionMode`: String (default: undefined)
- `selection`: [Object, Array] (default: undefined)
- `compareSelectionBy`: String (default: "equals")
- `selectionColumn`: Boolean (default: false)
- `paginator`: Boolean (default: false)
- `first`: Number (default: 0)
- `rows`: Number (default: 0)
- `totalRecords`: Number (default: 0)
- `rowsPerPageOptions`: Array (default: [])
- `virtualScrollerOptions`: Object (default: undefined)
- `lazy`: Boolean (default: false)
- `editMode`: String (default: undefined)
- `editingRows`: Array (default: [])
- `expandedRowKeys`: Object (default: {})
- `rowGroupMode`: String (default: undefined)
- `groupRowsBy`: String (default: undefined)
- `loading`: Boolean (default: false)

### vue events

- `sort` (emit): sort-changed
- `selection-change` (emit): selection-changed
- `page` (emit): page-changed
- `filter` (emit): filter
- `lazy-load` (emit): lazy-load
- `update:editingRows` (emit): editing-rows-changed
- `row-edit-save` (emit): row-edit-save
- `row-edit-cancel` (emit): row-edit-cancel
- `update:expandedRowKeys` (emit): expanded-rows-changed
- `row-expand` (emit): row-expand
- `row-collapse` (emit): row-collapse

<!-- ultimate:generated:end section="allowed-apis" -->

## Anti-patterns

<!-- ultimate:generated:start section="anti-patterns" -->

<!-- ultimate:generated:end section="anti-patterns" -->

## Accessibility guidance

<!-- ultimate:generated:start section="accessibility-guidance" -->

Roles: table, rowgroup, row, columnheader
ARIA attributes: aria-sort, aria-selected
Keyboard navigation (ArrowDown/ArrowUp/Home/End) only operates within the currently-rendered virtualized window, not the full logical dataset, when virtualScroll/virtualScrollerOptions is active — a row outside the window is not in the DOM to focus. This is a real, intentional, already-shipped limitation of Table's Scroller composition, documented inline at the row-keydown handler in all three frameworks' own source.

<!-- ultimate:generated:end section="accessibility-guidance" -->

## Related components

<!-- ultimate:generated:start section="related-components" -->

- Paginator
- Scroller

<!-- ultimate:generated:end section="related-components" -->

## Framework-specific guidance
