<template>
  <span :class="cx('stepperSeparator')"></span>
</template>

<script>
// Internal separator element for `UStepPanel`'s vertical layout (mirrors
// PrimeVue's `stepper/StepperSeparator.vue`). Not exported from `index.ts`.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";

export default {
  name: "UStepperSeparator",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
};
</script>
