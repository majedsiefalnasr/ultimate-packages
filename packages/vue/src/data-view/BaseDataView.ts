import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { dataViewStyleModule } from "./data-view-style";

export function createBaseDataView() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "data-view", styleModule: dataViewStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      layout: { type: String, default: "list" },
      paginator: { type: Boolean, default: false },
      first: { type: Number, default: 0 },
      rows: { type: Number, default: 0 },
      totalRecords: { type: Number, default: undefined },
      rowsPerPageOptions: { type: Array, default: () => [] },
      paginatorPosition: { type: String, default: "bottom" },
      alwaysShowPaginator: { type: Boolean, default: true },
      currentPageReportTemplate: { type: String, default: "{first} to {last} of {totalRecords}" },
      sortField: { type: String, default: null },
      sortOrder: { type: Number, default: 1 },
      lazy: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      loadingIcon: { type: String, default: "u-loading-icon" },
      emptyMessage: { type: String, default: "No results found" },
      dataKey: { type: String, default: null },
      trackBy: { type: Function, default: null },
      itemTemplate: { type: Function, default: (item: unknown) => String(item) },
    },
    emits: ["page", "lazy-load", "update:first", "update:rows"],
  });
}
