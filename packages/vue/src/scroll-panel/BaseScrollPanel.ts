import { createBaseComponent } from "@ultimate/vue-core";
import { scrollPanelStyleModule } from "./scroll-panel-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — ScrollPanel is a bare
// scroll-container primitive, not a form control, matching real extracted
// PrimeVue's own BaseScrollPanel.vue's `extends: BaseComponent`.
export function createBaseScrollPanel(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "scroll-panel", styleModule: scrollPanelStyleModule }),
    props: {
      step: { type: Number, default: 5 },
    },
  };
}
