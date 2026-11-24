<template>
  <div
    :class="cx('root', styleParams)"
    :data-p-checked="checked"
    :data-p-disabled="disabled"
    :data-p="dataP"
    v-bind="ptmi('root')"
  >
    <input
      ref="input"
      :id="inputId"
      type="checkbox"
      role="switch"
      :class="[cx('input'), inputClass]"
      :style="inputStyle"
      :checked="checked"
      :tabindex="tabindex"
      :disabled="disabled"
      :readonly="readonly"
      :aria-checked="checked"
      :aria-labelledby="ariaLabelledby"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      v-bind="ptm('input')"
      @focus="onFocus"
      @blur="onBlur"
      @change="onChange"
    />
    <div :class="cx('slider')" :data-p="dataP" v-bind="ptm('slider')">
      <div :class="cx('handle')" :data-p="dataP" v-bind="ptm('handle')">
        <slot name="handle" :checked="checked" />
      </div>
    </div>
  </div>
</template>

<script>
import { cn } from "@ultimate/uix-utils/classnames";
import { createBaseToggleSwitch } from "./BaseToggleSwitch";

// Real rendered DOM verified against .vendor-extracted/vue/toggleswitch/
// ToggleSwitch.vue: a real native input[type=checkbox][role=switch]
// carrying checked/disabled/readonly/tabindex/aria-checked/aria-labelledby/
// aria-label/aria-invalid, plus a div.slider > div.handle pair. The handle
// renders the `handle` slot (scoped with `checked`), as PrimeVue's does. The
// root carries `data-p-checked`, `data-p-disabled` and `data-p`; the slider
// and handle carry `data-p`. `pt`, `unstyled` and `dt` come from the base
// chain, and `inheritAttrs` is off because `ptmi('root')` places the
// attributes on the root.
//
// $pcToggleSwitch ambient-context `provide()` is NOT ported — no consumer
// of that injection exists in Batch 1's own scope, same boundary-cut
// precedent already established for $pcRadioButtonGroup/$pcCheckboxGroup/
// $pcToggleButton.
export default {
  name: "UToggleSwitch",
  extends: createBaseToggleSwitch(),
  inheritAttrs: false,
  emits: ["change", "focus", "blur"],
  computed: {
    checked() {
      return this.dValue === this.trueValue;
    },
    styleParams() {
      return {
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.invalid,
      };
    },
    dataP() {
      return cn({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.invalid,
      });
    },
  },
  methods: {
    onChange(event) {
      if (this.disabled || this.readonly) return;

      const newValue = this.checked ? this.falseValue : this.trueValue;
      this.writeValue(newValue, event);
      this.$emit("change", event);
    },
    onFocus(event) {
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.$emit("blur", event);
    },
  },
};
</script>
