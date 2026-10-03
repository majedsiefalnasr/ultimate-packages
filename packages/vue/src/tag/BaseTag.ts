import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { tagStyleModule } from "./tag-style";

// extends: createBaseComponent(...) directly — Tag is a status/
// categorization display component, not a form control, matching real
// extracted PrimeVue's own BaseTag.vue's `extends: BaseComponent`.
export function createBaseTag() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "tag", styleModule: tagStyleModule }),
    props: {
      severity: { type: String, default: null },
      value: { type: String, default: null },
      icon: { type: String, default: undefined },
      rounded: { type: Boolean, default: false },
    },
  });
}
