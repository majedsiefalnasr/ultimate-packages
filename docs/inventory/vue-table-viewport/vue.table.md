# Vue UTable

ID: vue.table

Framework: vue; availability: public

## Authored interpretation

Render tabular values with sorting, filtering, selection, paging, grouping, editing, expansion and optional virtual scrolling.

## Framework surface

Each is an Options API SFC extending its exported base factory, which extends createBaseComponent from @ultimate/vue-core; mounted registers its component style and cx resolves its local class map. Source-only style module is not re-exported by the family barrel. No plugin, directive or composable is exported by the family entry. UTable and createBaseTable; source-only tableStyleModule. Declared props: value, columns, dataKey, sortMode, sortField, sortOrder, multiSortMeta, filters, selectionMode, selection, compareSelectionBy, selectionColumn, paginator, lazy, loading, first, rows, totalRecords, rowsPerPageOptions, virtualScrollerOptions, editMode, editingRows, groupRowsBy, rowGroupMode and expandedRowKeys. Emits declared: sort, filter, update:selection, selection-change, page, lazy-load, update:editingRows, row-edit-save, row-edit-cancel, update:expandedRowKeys, row-expand and row-collapse. The declared filter event has no emit site. sortColumn emits sort with order 1; no update:sortField or update:sortOrder is emitted. Module-local resolveCell, renderCell, compareValues, matchesFilter, matchesFilterEntry and DEFAULT_EMPTY_MESSAGE are owned implementation details, not barrel exports. Column definitions are local JSDoc (field, header, body(row, {field, rowIndex})); UTableColumn is not an exported type. The body return is interpolated rather than mounted by a custom VNode renderer. No slots. effectiveValue applies local committed row overrides keyed by dataKey; sorting copies rows and supports single and multi-sort, with null-first, numeric or locale string comparison. Filters read field metadata, combine constraints with and/or, and implement contains, startsWith, notContains, endsWith, equals, notEquals, lt, lte, gt, gte, between, in, notIn, dateIs, dateIsNot, dateBefore and dateAfter; custom returns false and unknown modes true. Pagination slices the filtered value; grouping occurs on the paged rows with subheader or rowspan. The virtual branch passes filteredValue to UScroller and renders columns and selection interactions rather than the regular editing, expansion and grouping cells. UPaginator's page event is forwarded; consumers supply changed first/rows. Selection is controlled through update:selection and selection-change; equality uses uix-data equals with dataKey or uix-utils deepEquals; toggle-all uses effectiveValue. Keyboard supports arrows, Home/End, Space/Enter and Ctrl/Cmd+A for multiple selection, guarding selection keys on child controls; DOM sibling navigation can encounter grouping or expansion rows. editingRows seeds local state once; edits keep row-index drafts and save local committed overrides without update:value or a watcher to resync editingRows. Expansion is controlled through expandedRowKeys and renders an empty placeholder row. Loading and the internal 'No results found' empty message are rendered in the nonvirtual branch. tableStyleModule imports @ultimate/uix-styles/table and declares root/table/thead/tbody/row class resolvers; cx('rowGroupHeader') has no corresponding local class entry, and the row resolver receives no selected parameter at its call site.

## Public exports

@ultimate/vue#UTable
@ultimate/vue/table#UTable
@ultimate/vue#createBaseTable
@ultimate/vue/table#createBaseTable

## Owned source and evidence

packages/vue/src/table/Table.vue
packages/vue/src/table/base-table.ts
packages/vue/src/table/table-style.ts
packages/vue/src/table/index.ts

```text
packages/vue/src/table/Table.vue: name: "UTable"
packages/vue/src/table/base-table.ts: createBaseTable
packages/vue/src/table/table-style.ts: export const tableStyleModule
packages/vue/src/table/index.ts: createBaseTable
packages/vue/src/index.ts: export * from "./table";
packages/vue/package.json: "./table": {
packages/vue/src/table/Table.vue: <UScroller
packages/vue/src/table/Table.vue: :items="filteredValue"
packages/vue/src/table/Table.vue: <UPaginator
packages/vue/src/table/Table.vue: this.$emit("page", event);
packages/vue/src/table/Table.vue: this.$emit("sort", { sortField: field, sortOrder: 1 });
packages/vue/src/table/Table.vue: this.$emit("update:selection", next);
packages/vue/src/table/Table.vue: return this.filteredValue.slice(this.first, this.first + this.rows);
packages/vue/src/table/Table.vue: :class="cx('rowGroupHeader')"
```

## Relationships

package.ultimate.vue.table → [vue.table](vue.table.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)
package.ultimate.uix-data.identity (pending cross-batch)
package.ultimate.uix-utils.object (pending cross-batch)
package.ultimate.uix-styles.table (pending cross-batch)
package.ultimate.vue.paginator → [vue.paginator](vue.paginator.md) (reconciled family alias)
package.ultimate.vue.scroller → [vue.scroller](vue.scroller.md) (reconciled family alias)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "The bounded existing Vue table, paginator and scroller specs passed together in the documented local run.",
    "run": "docs/inventory/vue-table-viewport/product-run.json",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/table/ src/paginator/ src/scroller/ --config /tmp/vitest-vue133.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Test Files  3 passed (3)\nTests  97 passed (97)",
    "limitations": "Temporary external config uses the Vue plugin and jsdom with css.postcss.plugins=[] to bypass the host ancestor PostCSS config; CSS processing and visuals are not verified. Prerequisite workspace builds were run. A single local run at the source revision; not a remote CI run."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured conditional non-docs CI Test step runs root pnpm run test, which invokes the Vue test script; this describes workflow configuration, not a successful run or branch protection. The scoped inventory Node tests are not included in test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); earlier steps can prevent execution. No remote CI run observed."
  }
]
```
