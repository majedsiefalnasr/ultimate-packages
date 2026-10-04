import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { tableStyleModule } from "./table-style";
import type { PropType } from "vue";

export function createBaseTable() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "table", styleModule: tableStyleModule }),
    props: {
      value: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      dataKey: { type: String, default: "" },
      columns: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      sortMode: { type: String, default: "single" },
      sortField: { type: String, default: undefined },
      sortOrder: { type: Number, default: 0 },
      multiSortMeta: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      filters: { type: Object, default: () => ({}) },
      selectionMode: { type: String, default: undefined },
      selection: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- selection accepts an arbitrary keyed record or an array of rows (GAP-082)
        type: [Object, Array] as PropType<Record<string, any> | readonly unknown[] | null>,
        default: undefined,
      },
      compareSelectionBy: { type: String, default: "equals" },
      selectionColumn: { type: Boolean, default: false },
      paginator: { type: Boolean, default: false },
      first: { type: Number, default: 0 },
      rows: { type: Number, default: 0 },
      totalRecords: { type: Number, default: 0 },
      rowsPerPageOptions: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      virtualScrollerOptions: { type: Object, default: undefined },
      lazy: { type: Boolean, default: false },
      editMode: { type: String, default: undefined },
      editingRows: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      expandedRowKeys: { type: Object, default: () => ({}) },
      // Widened for GAP-045: this task adds "rowspan" for the first time —
      // Vue's own rowGroupMode never declared it (only "subheader" existed).
      rowGroupMode: { type: String as PropType<"subheader" | "rowspan">, default: undefined },
      groupRowsBy: { type: String, default: undefined },
      loading: { type: Boolean, default: false },
    },
    emits: [
      "sort",
      "filter",
      "update:selection",
      "selection-change",
      "page",
      "lazy-load",
      "update:editingRows",
      "row-edit-save",
      "row-edit-cancel",
      "update:expandedRowKeys",
      "row-expand",
      "row-collapse",
    ],
  });
}
