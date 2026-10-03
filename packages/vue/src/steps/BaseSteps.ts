import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { stepsStyleModule } from "./steps-style";

// Props verified against real .vendor-extracted/vue/steps/BaseSteps.vue
// (this task's Step 1) — matches: model, readonly, activeStep.
export function createBaseSteps() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "steps", styleModule: stepsStyleModule }),
    props: {
      model: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      readonly: { type: Boolean, default: true },
      activeStep: { type: Number, default: 0 },
    },
  });
}
