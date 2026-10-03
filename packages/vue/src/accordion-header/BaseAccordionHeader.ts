import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { accordionStyleModule } from "../accordion/accordion-style";

// AccordionHeader carries no props of its own in real PrimeVue's
// BaseAccordionHeader.vue — active/disabled state is read from the
// injected `$pcAccordionPanel` (see AccordionHeader.vue), not passed as a
// prop.
export function createBaseAccordionHeader() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "accordion", styleModule: accordionStyleModule }),
  });
}
