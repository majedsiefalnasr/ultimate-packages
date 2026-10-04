import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { accordionStyleModule } from "./accordion-style";

// Props verified against real .vendor-extracted/vue/accordion/BaseAccordion.vue:
// value/multiple/selectOnFocus all match. `lazy`/`tabindex`/`expandIcon`/
// `collapseIcon`/`activeIndex` are excluded — same "smaller surface than
// upstream" precedent as every sibling component (no lazy-mount logic, no
// custom-icon override, no deprecated activeIndex dual-API).
export function createBaseAccordion() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "accordion", styleModule: accordionStyleModule }),
    props: {
      value: {
        type: [String, Number, Array] as PropType<string | number | readonly unknown[]>,
        default: undefined,
      },
      multiple: { type: Boolean, default: false },
      selectOnFocus: { type: Boolean, default: false },
    },
  });
}
