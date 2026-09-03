import { createBaseComponent } from "@ultimate/vue-core";
import { tableStyleModule } from "./table-style";
import type { ComponentOptions } from "vue";

export function createBaseTable(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "table", styleModule: tableStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      dataKey: { type: String, default: "" },
      columns: { type: Array, default: () => [] },
      sortMode: { type: String, default: "single" },
      sortField: { type: String, default: undefined },
      sortOrder: { type: Number, default: 0 },
      multiSortMeta: { type: Array, default: () => [] },
    },
    emits: ["sort"],
  };
}
