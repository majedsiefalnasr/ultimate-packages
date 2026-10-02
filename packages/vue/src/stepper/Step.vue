<template>
  <div :class="cx('stepRoot', { active, disabled: isStepDisabled })" role="presentation" data-u-step :aria-current="active ? 'step' : undefined" :data-u-active="active" :data-u-disabled="isStepDisabled">
    <button type="button" :class="cx('stepHeader')" role="tab" :disabled="isStepDisabled" :tabindex="isStepDisabled ? -1 : undefined" @click="onStepClick">
      <span :class="cx('stepNumber')">{{ value }}</span>
      <span :class="cx('stepTitle')"><slot></slot></span>
    </button>
    <UStepperSeparator v-if="isSeparatorVisible" />
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
import UStepperSeparator from "./StepperSeparator.vue";

export default {
  name: "UStep",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
  components: { UStepperSeparator },
  inject: {
    $pcStepper: { from: "$pcStepper" },
    $pcStepList: { from: "$pcStepList", default: null },
  },
  props: {
    value: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  data() {
    return { isSeparatorVisible: false };
  },
  mounted() {
    this.$pcStepList?.registerStep(this);
    this.updateSeparator();
  },
  updated() {
    this.updateSeparator();
  },
  beforeUnmount() {
    this.$pcStepList?.unregisterStep(this);
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
    // Mirrors PrimeVue 4.5.5 Step.vue:43-49: inside a step list, every step
    // except the last shows a separator after its header.
    updateSeparator() {
      if (!this.$el || !this.$pcStepList?.$el) {
        this.isSeparatorVisible = false;
        return;
      }
      const steps = Array.from(this.$pcStepList.$el.querySelectorAll("[data-u-step]"));
      this.isSeparatorVisible = steps.indexOf(this.$el) !== steps.length - 1;
    },
  },
};
</script>
