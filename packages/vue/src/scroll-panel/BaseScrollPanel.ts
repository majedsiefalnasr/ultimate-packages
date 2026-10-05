import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { scrollPanelStyleModule } from "./scroll-panel-style";

// extends: createBaseComponent(...) directly — ScrollPanel is a bare
// scroll-container primitive, not a form control, matching real extracted
// PrimeVue's own BaseScrollPanel.vue's `extends: BaseComponent`.
export function createBaseScrollPanel() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "scrollpanel", styleModule: scrollPanelStyleModule }),
    props: {
      step: { type: Number, default: 5 },
    },
  });
}
