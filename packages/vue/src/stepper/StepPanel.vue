<template>
  <div :class="cx('stepPanelRoot')" role="tabpanel" :data-u-hidden="!active" v-show="active">
    <slot :active="active" :activateCallback="activate"></slot>
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

export default {
  name: "UStepPanel",
  extends: createBaseComponent({ componentName: "stepper", styleModule: stepperStyleModule }),
  inheritAttrs: false,
  inject: ["$pcStepper"],
  props: {
    value: { type: [String, Number], required: true },
  },
  computed: {
    active() {
      return this.$pcStepper.d_value === this.value;
    },
  },
  methods: {
    activate(value) {
      this.$pcStepper.updateValue(value);
    },
  },
};
</script>
