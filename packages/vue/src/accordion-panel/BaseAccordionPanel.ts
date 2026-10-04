import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { accordionStyleModule } from "../accordion/accordion-style";

// Props verified against real .vendor-extracted/vue/accordionpanel/BaseAccordionPanel.vue:
// value/disabled match. Shares the same `accordionStyleModule` as the rest
// of the family, matching real PrimeVue's own shared `AccordionStyle`.
export function createBaseAccordionPanel() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "accordion", styleModule: accordionStyleModule }),
    props: {
      value: { type: [String, Number], default: undefined },
      disabled: { type: Boolean, default: false },
    },
  });
}
