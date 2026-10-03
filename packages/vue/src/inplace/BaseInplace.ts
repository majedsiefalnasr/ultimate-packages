import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { inplaceStyleModule } from "./inplace-style";

// extends: createBaseComponent(...) directly — Inplace is a display-mode
// toggle primitive with its own internal active state, not a form
// control, matching real extracted PrimeVue's own BaseInplace.vue's
// `extends: BaseComponent`.
export function createBaseInplace() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "inplace", styleModule: inplaceStyleModule }),
    props: {
      active: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      preventClick: { type: Boolean, default: false },
    },
  });
}
