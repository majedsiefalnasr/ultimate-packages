<template>
  <div :class="cx('root', styleParams)">
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
      @focus="onFocus"
      @blur="onBlur"
      @change="onChange"
    />
    <div :class="cx('slider')">
      <div :class="cx('handle')" />
    </div>
  </div>
</template>

<script>
import { createBaseToggleSwitch } from "./BaseToggleSwitch";

// Real rendered DOM verified against .vendor-extracted/vue/toggleswitch/
// ToggleSwitch.vue: a real native input[type=checkbox][role=switch]
// carrying checked/disabled/readonly/tabindex/aria-checked/aria-labelledby/
// aria-label/aria-invalid, plus a div.slider > div.handle decorative pair —
// same dual-element shape already established by URadioButton/UCheckbox.
// Upstream's `slot name="handle"` and `getPTOptions`/passthrough plumbing
// are not ported — same no-passthrough boundary cut already documented
// across checkbox/radio-button/toggle-button.
//
// $pcToggleSwitch ambient-context `provide()` is NOT ported — no consumer
// of that injection exists in Batch 1's own scope, same boundary-cut
// precedent already established for $pcRadioButtonGroup/$pcCheckboxGroup/
// $pcToggleButton.
export default {
  name: "UToggleSwitch",
  extends: createBaseToggleSwitch(),
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
