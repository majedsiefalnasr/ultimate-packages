import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { dockStyleModule } from "./dock-style";

// Props verified against real .vendor-extracted/vue/dock/BaseDock.vue
// (this task's Step 1) — matches: model, position, ariaLabel.
export function createBaseDock() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "dock", styleModule: dockStyleModule }),
    props: {
      model: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      position: { type: String, default: "bottom" },
      ariaLabel: { type: String, default: null },
    },
  });
}
