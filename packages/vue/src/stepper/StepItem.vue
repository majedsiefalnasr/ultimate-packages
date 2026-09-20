<template>
  <div :class="cx('stepItemRoot', { active: isActive })" :data-u-active="isActive">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `StepItem` component (see
// `.vendor-extracted/vue/stepitem/StepItem.vue`). Groups one `UStep` with
// its corresponding `UStepPanel` for the vertical-orientation layout —
// this family's 4th member, built after `UStepper` -> `UStepList` ->
// `UStep` per the documented container-first order.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";

export default {
  name: "UStepItem",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
  inject: ["$pcStepper"],
  props: {
    value: { type: [String, Number], required: true },
  },
  computed: {
    isActive() {
      return this.$pcStepper?.d_value === this.value;
    },
  },
};
</script>
