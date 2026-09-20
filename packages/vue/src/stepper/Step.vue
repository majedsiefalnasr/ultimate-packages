<template>
  <div :class="cx('stepRoot', { active, disabled: isStepDisabled })" role="presentation" :aria-current="active ? 'step' : undefined" :data-u-active="active" :data-u-disabled="isStepDisabled">
    <button type="button" :class="cx('stepHeader')" role="tab" :disabled="isStepDisabled" :tabindex="isStepDisabled ? -1 : undefined" @click="onStepClick">
      <span :class="cx('stepNumber')">{{ value }}</span>
      <span :class="cx('stepTitle')"><slot></slot></span>
    </button>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Step` component (see
// `.vendor-extracted/vue/step/Step.vue`). A single step header (number +
// title) — this family's 3rd member, built after `UStepper` ->
// `UStepList` per the documented container-first order. Clicking it
// (when not disabled) activates the matching `UStepPanel`. `linear` mode
// disables every non-active step, matching real PrimeVue's own
// `isStepDisabled` computed.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";

export default {
  name: "UStep",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
  inject: ["$pcStepper"],
  props: {
    value: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    active() {
      return this.$pcStepper.isStepActive(this.value);
    },
    isStepDisabled() {
      return !this.active && (this.$pcStepper.isStepDisabled() || this.disabled);
    },
  },
  methods: {
    onStepClick() {
      this.$pcStepper.updateValue(this.value);
    },
  },
};
</script>
