import { createBaseComponent } from "@ultimate/vue-core";
import { stepsStyleModule } from "./steps-style";
import type { ComponentOptions } from "vue";

// Props verified against real .vendor-extracted/vue/steps/BaseSteps.vue
// (this task's Step 1) — matches: model, readonly, activeStep.
export function createBaseSteps(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "steps", styleModule: stepsStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      readonly: { type: Boolean, default: true },
      activeStep: { type: Number, default: 0 },
    },
  };
}
