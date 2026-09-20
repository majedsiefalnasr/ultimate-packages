import { createBaseComponent } from "@ultimate/vue-core";
import { dividerStyleModule } from "./divider-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Divider is a display-only
// primitive with no editable/input state, matching real extracted
// PrimeVue's own BaseDivider.vue's `extends: BaseComponent`.
export function createBaseDivider(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "divider", styleModule: dividerStyleModule }),
    props: {
      layout: { type: String, default: "horizontal" },
    },
  };
}
