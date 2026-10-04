import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { contextMenuStyleModule } from "./context-menu-style";

/** Real upstream `BaseContextMenu.vue`'s prop surface, scoped to this capability's spec-mandated fields — a flat `model` list (no nested submenus, matching `UMenu`'s own established reduction; nested-submenu support belongs to `UTieredMenu`). */
export function createBaseContextMenu() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "context-menu", styleModule: contextMenuStyleModule }),
    props: {
      model: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      global: { type: Boolean, default: false },
    },
  });
}
