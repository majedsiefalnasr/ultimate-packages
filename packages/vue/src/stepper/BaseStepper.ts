import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";
import type { ComponentOptions } from "vue";

// Props verified against real .vendor-extracted/vue/stepper/BaseStepper.vue
// (this task's Step 1) — matches: value, linear.
export function createBaseStepper(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
    props: {
      value: { type: [String, Number], default: undefined },
      linear: { type: Boolean, default: false },
    },
  };
}
