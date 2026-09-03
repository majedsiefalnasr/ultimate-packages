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
    },
  };
}
