<template>
  <div :class="cx('stepListRoot')">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `StepList` component (see
// `.vendor-extracted/vue/steplist/StepList.vue`). Pure content-projection
// wrapper for a horizontal row of `UStep` (or `UStepItem`) children —
// this family's 2nd member, built after `UStepper` per the documented
// container-first order — no state of its own.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";

export default {
  name: "UStepList",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
};
</script>
