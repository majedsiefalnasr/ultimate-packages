<template>
  <div :class="cx('stepperRoot')" role="tablist">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Stepper` component (see
// `.vendor-extracted/vue/stepper/Stepper.vue`). Container/state-owner for
// the Stepper family — this family's 1st (container-first) member,
// providing `$pcStepper: this` so descendant members (`UStepList` ->
// `UStepItem` -> `UStep`, `UStepPanels` -> `UStepPanel`) can `inject` the
// active `value`, matching real PrimeVue's own `provide()` mechanism
// (verified this task's Step 1, `BaseStepper.vue`) — same rationale as
// this same capability's `UTabs` sibling's own doc comment.
//
// `d_value` is derived directly from `this.value` (the `value` prop),
// independently of any parent tier's own `data()`, per this task's own
// documented Vue multi-tier-`data()` pitfall.
import { createBaseStepper } from "./BaseStepper";

export default {
  name: "UStepper",
  extends: createBaseStepper(),
  inheritAttrs: false,
  emits: ["update:value"],
  data() {
    return {
      d_value: this.value,
    };
  },
  provide() {
    return {
      $pcStepper: this,
    };
  },
  watch: {
    value(newValue) {
      this.d_value = newValue;
    },
  },
  methods: {
    updateValue(newValue) {
      if (this.d_value !== newValue) {
        this.d_value = newValue;
        this.$emit("update:value", newValue);
      }
    },
    isStepActive(value) {
      return this.d_value === value;
    },
    isStepDisabled() {
      return this.linear;
    },
  },
};
</script>
