import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { accordionStyleModule } from "../accordion/accordion-style";

// AccordionContent carries no props of its own in real PrimeVue's
// BaseAccordionContent.vue — active state is read from the injected
// `$pcAccordionPanel`.
export function createBaseAccordionContent() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "accordion", styleModule: accordionStyleModule }),
  });
}
