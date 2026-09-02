import { createBaseComponent } from "@ultimate/vue-core";
import { paginatorStyleModule } from "./paginator-style";
import type { ComponentOptions } from "vue";

export function createBasePaginator(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "paginator", styleModule: paginatorStyleModule }),
    props: {
      first: { type: Number, default: 0 },
      rows: { type: Number, default: 0 },
      totalRecords: { type: Number, default: 0 },
      pageLinkSize: { type: Number, default: 5 },
    },
    emits: ["page", "update:first", "update:rows"],
    data() {
      return {
        d_first: this.first,
        d_rows: this.rows,
      };
    },
    watch: {
      first(newValue: number) {
        this.d_first = newValue;
      },
      rows(newValue: number) {
        this.d_rows = newValue;
      },
    },
  };
}
