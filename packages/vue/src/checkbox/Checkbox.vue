<template>
  <div :class="cx('root', styleParams)">
    <input
      ref="input"
      type="checkbox"
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
    />
    <div :class="cx('box')">
      <UCheckIcon v-if="checked" :class="cx('icon')" />
      <UMinusIcon v-else-if="dIndeterminate" :class="cx('icon')" />
    </div>
  </div>
</template>

<script>
import { CheckIcon as UCheckIcon, MinusIcon as UMinusIcon } from "@ultimate/vue-core";
import { createBaseCheckbox } from "./BaseCheckbox";

// Real rendered DOM verified against .vendor-extracted/vue/checkbox/Checkbox.vue
// (this task's Step 1): dual-element pattern — a real native
// input[type=checkbox] carrying checked/disabled/readonly/required/tabindex/
// name/aria-labelledby/aria-label/aria-invalid, plus a separate decorative
// div.box rendering CheckIcon/MinusIcon. $pcCheckboxGroup injection and its
// groupName/$formName composition are NOT ported (out of Phase 4 scope,
// spec §19) — name/checked/onChange all operate on this component's own
// dValue directly, never a checkbox-group ambient context.
//
// MinusIcon is the real, dedicated vue-core icon added as this task's
// addendum to Task 14 (packages/vue-core/src/icons/minus-icon.ts) — a
// horizontal-bar glyph distinct from WindowMinimizeIcon (window-chrome
// minimize, unrelated to checkbox state). No placeholder aliasing.
export default {
  name: "UCheckbox",
  extends: createBaseCheckbox(),
  emits: ["change", "focus", "blur", "update:indeterminate"],
  components: { UCheckIcon, UMinusIcon },
  data() {
    return { dIndeterminate: this.indeterminate };
  },
  watch: {
    indeterminate(newValue) {
      this.dIndeterminate = newValue;
      this.updateIndeterminate();
    },
  },
  mounted() {
    this.updateIndeterminate();
  },
  updated() {
    this.updateIndeterminate();
  },
  computed: {
    checked() {
      if (this.dIndeterminate) return false;
      if (this.binary) return this.dValue === this.trueValue;
      return Array.isArray(this.dValue) && this.dValue.includes(this.value);
    },
    styleParams() {
      return {
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.invalid,
        variant: this.resolvedVariant,
        size: this.size,
      };
    },
  },
  methods: {
    onFocus(event) {
      this.$emit("focus", event);
    },
    onBlur(event) {
      this.$emit("blur", event);
    },
    onChange(event) {
      if (this.disabled || this.readonly) return;

      let newValue;
      if (this.binary) {
        newValue = this.dIndeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue;
      } else {
        const current = Array.isArray(this.dValue) ? this.dValue : [];
        newValue =
          this.checked || this.dIndeterminate
            ? current.filter((v) => v !== this.value)
            : [...current, this.value];
      }

      if (this.dIndeterminate) {
        this.dIndeterminate = false;
        this.$emit("update:indeterminate", false);
      }

      this.writeValue(newValue, event);
      this.$emit("change", event);
    },
    updateIndeterminate() {
      if (this.$refs.input) this.$refs.input.indeterminate = this.dIndeterminate;
    },
  },
};
</script>
