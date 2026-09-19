<template>
  <div :class="cx('stepPanelsRoot')">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `StepPanels` component (see
// `.vendor-extracted/vue/steppanels/StepPanels.vue`). Pure content-
// projection wrapper for a set of `UStepPanel` children — this family's
// 6th (final) member, built last per the documented container-first
// order (stepper -> step -> stepitem -> steplist -> steppanel ->
// steppanels, Dependency Map §C) — no state of its own.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";

export default {
  name: "UStepPanels",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
};
</script>
