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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- preserves the existing inferred public type (GAP-082)
      selectionKeys: { type: Object as PropType<Record<string, any> | null>, default: null },
      selectionMode: { type: String as PropType<SelectionMode>, default: null },
      collapsible: { type: Boolean, default: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- preserves the existing inferred public type (GAP-082)
      collapsedKeys: { type: Object as PropType<Record<string, any> | null>, default: null },
    },
    emits: ["update:selectionKeys", "update:collapsedKeys"],
  });
}
