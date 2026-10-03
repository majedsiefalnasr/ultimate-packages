import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import type { SelectionMode } from "@ultimate/uix-data";
import type { PropType } from "vue";
import { organizationChartStyleModule } from "./organization-chart-style";

export function createBaseOrganizationChart() {
  return defineComponent({
    extends: createBaseComponent({
      componentName: "organization-chart",
      styleModule: organizationChartStyleModule,
    }),
    props: {
      value: { type: null, default: null },
      selectionKeys: { type: Object, default: null },
      selectionMode: { type: String as PropType<SelectionMode>, default: null },
      collapsible: { type: Boolean, default: false },
      collapsedKeys: { type: Object, default: null },
    },
    emits: ["update:selectionKeys", "update:collapsedKeys"],
  });
}
