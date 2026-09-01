import { createBaseComponent } from "@ultimate/vue-core";
import { menuStyleModule } from "./menu-style";
import type { ComponentOptions } from "vue";

// Props verified against real .vendor-extracted/vue/menu/BaseMenu.vue
// (this task's Step 1) — matches exactly: popup, model, appendTo,
// autoZIndex, baseZIndex, tabindex, ariaLabel, ariaLabelledby. Real
// BaseMenu.vue also does `provide() { return { $pcMenu: this, $parentInstance:
// this } }` — the passthrough-system inject/provide wiring this project's
// "Option B" posture excludes entirely (spec §7); not reproduced here.
export function createBaseMenu(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "menu", styleModule: menuStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      popup: { type: Boolean, default: false },
      appendTo: { type: [String, Object], default: "body" },
      autoZIndex: { type: Boolean, default: true },
      baseZIndex: { type: Number, default: 0 },
      tabindex: { type: Number, default: 0 },
      ariaLabel: { type: String, default: null },
      ariaLabelledby: { type: String, default: null },
    },
  };
}
