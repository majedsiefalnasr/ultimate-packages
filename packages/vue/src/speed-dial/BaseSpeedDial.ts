import { createBaseComponent } from "@ultimate/vue-core";
import { speedDialStyleModule } from "./speed-dial-style";
import type { ComponentOptions } from "vue";

// Props verified against real .vendor-extracted/vue/speeddial/BaseSpeedDial.vue
// (this task's Step 1) — matches: model, visible, direction, transitionDelay,
// type, radius, mask, disabled, closeOnEscape (this project's own naming for
// real source's implicit Escape-close behavior, matching this capability's
// Angular/React `speed-dial` siblings' own explicit prop).
export function createBaseSpeedDial(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "speed-dial", styleModule: speedDialStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      visible: { type: Boolean, default: false },
      icon: { type: String, default: undefined },
      direction: { type: String, default: "up" },
      type: { type: String, default: "linear" },
      radius: { type: Number, default: 0 },
      transitionDelay: { type: Number, default: 30 },
      mask: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      closeOnEscape: { type: Boolean, default: true },
      ariaLabel: { type: String, default: null },
    },
  };
}
