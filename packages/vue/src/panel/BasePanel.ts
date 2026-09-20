import { createBaseComponent } from "@ultimate/vue-core";
import { panelStyleModule } from "./panel-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Panel is a display-only
// container with its own internal collapsed-toggle state, not a form
// control, matching real extracted PrimeVue's own BasePanel.vue's
// `extends: BaseComponent`. Props verified against real source:
// header/toggleable/collapsed match verbatim; `toggleButtonProps` (an
// arbitrary bag of button props) is excluded — same "smaller surface than
// upstream" precedent as every sibling component.
export function createBasePanel(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "panel", styleModule: panelStyleModule }),
    props: {
      header: { type: String, default: null },
      toggleable: { type: Boolean, default: false },
      collapsed: { type: Boolean, default: false },
      showHeader: { type: Boolean, default: true },
    },
  };
}
