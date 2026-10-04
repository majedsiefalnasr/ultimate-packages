import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { toolbarStyleModule } from "./toolbar-style";

// extends: createBaseComponent(...) directly — Toolbar is a grouping
// layout component (role="toolbar"), not a form control, matching real
// extracted PrimeVue's own BaseToolbar.vue's `extends: BaseComponent`.
export function createBaseToolbar() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "toolbar", styleModule: toolbarStyleModule }),
    props: {
      ariaLabelledby: { type: String, default: null },
    },
  });
}
