import { createBaseComponent } from "@ultimate/vue-core";
import { accordionStyleModule } from "../accordion/accordion-style";
import type { ComponentOptions } from "vue";

// AccordionContent carries no props of its own in real PrimeVue's
// BaseAccordionContent.vue — active state is read from the injected
// `$pcAccordionPanel`.
export function createBaseAccordionContent(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "accordion", styleModule: accordionStyleModule }),
  };
}
