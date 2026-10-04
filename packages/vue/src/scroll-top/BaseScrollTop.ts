import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { scrollTopStyleModule } from "./scroll-top-style";

// extends: createBaseComponent(...) directly — ScrollTop is a bare,
// display-driven overlay button, not a form control, matching real
// extracted PrimeVue's own BaseScrollTop.vue's `extends: BaseComponent`.
// Props verified against real source: target/threshold/behavior match
// verbatim; `icon`/`buttonProps` are folded into `buttonAriaLabel` +
// hardcoded chevron icon — same "smaller surface than upstream" precedent
// as every sibling component.
export function createBaseScrollTop() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "scroll-top", styleModule: scrollTopStyleModule }),
    props: {
      target: { type: String, default: "window" },
      threshold: { type: Number, default: 400 },
      behavior: { type: String, default: "smooth" },
      buttonAriaLabel: { type: String, default: "Scroll to top" },
    },
  });
}
