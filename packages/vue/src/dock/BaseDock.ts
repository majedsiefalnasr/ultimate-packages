import { createBaseComponent } from "@ultimate/vue-core";
import { dockStyleModule } from "./dock-style";
import type { ComponentOptions } from "vue";

// Props verified against real .vendor-extracted/vue/dock/BaseDock.vue
// (this task's Step 1) — matches: model, position, ariaLabel.
export function createBaseDock(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "dock", styleModule: dockStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      position: { type: String, default: "bottom" },
      ariaLabel: { type: String, default: null },
    },
  };
}
