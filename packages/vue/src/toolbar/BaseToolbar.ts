import { createBaseComponent } from "@ultimate/vue-core";
import { toolbarStyleModule } from "./toolbar-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Toolbar is a grouping
// layout component (role="toolbar"), not a form control, matching real
// extracted PrimeVue's own BaseToolbar.vue's `extends: BaseComponent`.
export function createBaseToolbar(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "toolbar", styleModule: toolbarStyleModule }),
    props: {
      ariaLabelledby: { type: String, default: null },
    },
  };
}
