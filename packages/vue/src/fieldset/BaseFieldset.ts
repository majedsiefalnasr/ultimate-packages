import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { fieldsetStyleModule } from "./fieldset-style";

// extends: createBaseComponent(...) directly — Fieldset is a display-only
// grouping primitive with its own internal collapsed-toggle state, not a
// form control, matching real extracted PrimeVue's own BaseFieldset.vue's
// `extends: BaseComponent`.
export function createBaseFieldset() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "fieldset", styleModule: fieldsetStyleModule }),
    props: {
      legend: { type: String, default: null },
      toggleable: { type: Boolean, default: false },
      collapsed: { type: Boolean, default: false },
    },
  });
}
