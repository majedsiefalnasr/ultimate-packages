<template>
  <div :class="cx('stepListRoot')">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `StepList` component (see
// `.vendor-extracted/vue/steplist/StepList.vue`). Pure content-projection
// wrapper for a horizontal row of `UStep` children (`UStepItem` is the
// vertical-layout grouping and is used directly under `UStepper`) —
// this family's 2nd member, built after `UStepper` per the documented
// container-first order — no state of its own.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";

export default {
  name: "UStepList",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
  // Mirrors PrimeVue 4.5.5's `$pcStepList` (Step.vue:37) so a UStep can tell
  // it is in a horizontal list. Steps register themselves; updated() fires
  // whenever this list re-renders its slot (e.g. a step added or removed),
  // and existing steps do not re-render on their own then, so refresh them here.
  provide() {
    return { $pcStepList: this };
  },
  created() {
    this.steps = new Set();
  },
  updated() {
    this.steps.forEach((step) => step.updateSeparator());
  },
  methods: {
    registerStep(step) {
      this.steps.add(step);
    },
    unregisterStep(step) {
      this.steps.delete(step);
    },
  },
};
</script>
