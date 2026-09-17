<template>
  <div :class="cx('root', styleParams)">
    <input
      ref="input"
      type="radio"
      :id="inputId"
      :class="[cx('input'), inputClass]"
      :style="inputStyle"
      :value="value"
      :name="name"
      :checked="checked"
      :tabindex="tabindex"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-labelledby="ariaLabelledby"
      :aria-label="ariaLabel"
      :aria-invalid="invalid || undefined"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div :class="cx('box')">
      <div :class="cx('icon')" />
    </div>
  </div>
</template>

<script>
import { createBaseRadioButton } from "./BaseRadioButton";

// Real rendered DOM verified against .vendor-extracted/vue/radiobutton/RadioButton.vue
// (this task's own Step 1): dual-element pattern — a real native
// input[type=radio] carrying checked/disabled/readonly/required/tabindex/
// name/aria-labelledby/aria-label/aria-invalid, plus a separate decorative
// div.box/div.icon pair, matching UCheckbox's own established shape.
//
// $pcRadioButtonGroup ambient-context injection is NOT ported (out of this
// task's scope — no RadioButtonGroup capability is part of Batch 1's §3
// list): `checked`/`onChange` operate on this component's own dValue
// directly via writeValue(), never a radio-group ambient context — same
// boundary cut UCheckbox's own doc comment already documents for
// $pcCheckboxGroup.
export default {
  name: "URadioButton",
  extends: createBaseRadioButton(),
  emits: ["change", "focus", "blur"],
  computed: {
    checked() {
      return this.dValue != null && (this.binary ? !!this.dValue : this.dValue === this.value);
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

      const newValue = this.binary ? !this.checked : this.value;
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
