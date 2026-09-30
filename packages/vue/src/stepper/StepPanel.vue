<template>
  <div :class="cx('stepPanelRoot')" role="tabpanel" :data-u-hidden="!active" v-show="active">
    <div v-if="isVertical" :class="cx('stepPanelContentWrapper')">
      <UStepperSeparator v-if="isSeparatorVisible" />
      <div :class="cx('stepPanelContent')">
        <slot :active="active" :activateCallback="activate"></slot>
      </div>
    </div>
    <slot v-else :active="active" :activateCallback="activate"></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `StepPanel` component (see
// `.vendor-extracted/vue/steppanel/StepPanel.vue`). Content pane linked
// to a `UStep` by matching `value`; hidden (via `v-show`) when its
// `value` does not match the injected `$pcStepper.d_value` — this
// family's 5th member, built after `UStepper` -> `UStepList` -> `UStep`
// -> `UStepItem` per the documented container-first order.
//
// Exposes `activateCallback` as a scoped-slot prop (mirrors real
// PrimeVue's own `:activateCallback="(val) => updateValue(val)"` scoped
// slot) — this capability's validation-gating hook point: a "Next" button
// in the slot's own template can withhold calling `activateCallback`
// until its own step's content is valid.
import { createBaseComponent } from "@ultimate/vue-core";
import { stepperStyleModule } from "./stepper-style";
import UStepperSeparator from "./StepperSeparator.vue";

export default {
  name: "UStepPanel",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  components: { UStepperSeparator },
  inheritAttrs: false,
  inject: {
    $pcStepper: { from: "$pcStepper" },
    $pcStepItem: { from: "$pcStepItem", default: null },
  },
  props: {
    value: { type: [String, Number], required: true },
  },
  data() {
    return { isSeparatorVisible: false };
  },
  computed: {
    active() {
      return this.$pcStepper.d_value === this.value;
    },
    isVertical() {
      return !!this.$pcStepItem;
    },
  },
  mounted() {
    this.updateSeparator();
  },
  updated() {
    this.updateSeparator();
  },
  methods: {
    // Mirrors PrimeVue's `StepPanel.updateSeparator()`: the separator shows
    // in vertical mode for every step except the last one in the stepper.
    updateSeparator() {
      if (!this.$el || !this.$pcStepItem?.$el) return;
      const steps = Array.from(this.$pcStepper.$el.querySelectorAll("[data-u-step]"));
      const ownStep = this.$pcStepItem.$el.querySelector("[data-u-step]");
      this.isSeparatorVisible = this.isVertical && steps.indexOf(ownStep) !== steps.length - 1;
    },
    activate(value) {
      this.$pcStepper.updateValue(value);
    },
  },
};
</script>
