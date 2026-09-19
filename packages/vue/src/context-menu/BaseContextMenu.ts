import { createBaseComponent } from "@ultimate/vue-core";
import { contextMenuStyleModule } from "./context-menu-style";
import type { ComponentOptions } from "vue";

/** Real upstream `BaseContextMenu.vue`'s prop surface, scoped to this capability's spec-mandated fields — a flat `model` list (no nested submenus, matching `UMenu`'s own established reduction; nested-submenu support belongs to `UTieredMenu`). */
export function createBaseContextMenu(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "context-menu", styleModule: contextMenuStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      global: { type: Boolean, default: false },
    },
  };
}
