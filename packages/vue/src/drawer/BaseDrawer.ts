import { createBaseComponent } from "@ultimate/vue-core";
import { drawerStyleModule } from "./drawer-style";
import type { ComponentOptions } from "vue";

/** Real upstream `BaseDrawer.vue`'s prop surface, scoped to this capability's spec-mandated fields — no `blockScroll`/breakpoints/passthrough (matches every sibling component's already-established "smaller surface than upstream" precedent). */
export function createBaseDrawer(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "drawer", styleModule: drawerStyleModule }),
    props: {
      visible: { type: Boolean, default: false },
      header: { type: String, default: null },
      position: { type: String, default: "left" },
      modal: { type: Boolean, default: true },
      dismissible: { type: Boolean, default: true },
      closable: { type: Boolean, default: true },
      closeOnEscape: { type: Boolean, default: true },
      appendTo: { type: [String, Object], default: "body" },
      ariaCloseLabel: { type: String, default: "Close" },
    },
  };
}
