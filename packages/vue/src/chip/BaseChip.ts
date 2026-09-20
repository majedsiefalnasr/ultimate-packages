import { createBaseComponent } from "@ultimate/vue-core";
import { chipStyleModule } from "./chip-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Chip is a display-only
// primitive with no editable/input state, matching real extracted
// PrimeVue's own BaseChip.vue's `extends: BaseComponent`.
export function createBaseChip(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "chip", styleModule: chipStyleModule }),
    props: {
      label: { type: [String, Number], default: null },
      icon: { type: String, default: null },
      image: { type: String, default: null },
      alt: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      removable: { type: Boolean, default: false },
      removeAriaLabel: { type: String, default: null },
    },
  };
}
