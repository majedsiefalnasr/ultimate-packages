<template>
  <div :class="cx('root', { fluid: false })" role="group" :aria-labelledby="ariaLabelledby">
    <UToggleButton
      v-for="(option, index) in options"
      :key="getOptionLabel(option) + '_' + index"
      :model-value="isSelected(option)"
      :on-label="getOptionLabel(option)"
      :off-label="getOptionLabel(option)"
      :disabled="disabled || isOptionDisabled(option)"
      @update:model-value="onOptionSelect(option)"
    />
  </div>
</template>

<script>
import UToggleButton from "../toggle-button/ToggleButton.vue";
import { createBaseSelectButton } from "./BaseSelectButton";

// Real PrimeVue SelectButton (.vendor-extracted/vue/selectbutton/SelectButton.vue)
// renders a flat group of ToggleButton per option — NOT overlay-based, no
// panel/dropdown. This port composes UToggleButton (packages/vue/src/toggle-button)
// the same way, matching real source's own per-option composition exactly.
//
// Supports single-select (multiple=false, default — value is the selected
// option's value or null) and multi-select (multiple=true — value is an
// array), matching real source's own isSelected/onOptionSelect multiple
// branch. allowEmpty (default true) mirrors real source's own default.
//
// Deliberately excludes real source's much larger surface: dataKey-based
// equality, item slot templates, tabindex roving-focus management,
// passthrough — matching every sibling component's established "smaller
// surface than upstream" precedent.
export default {
  name: "USelectButton",
  extends: createBaseSelectButton(),
  components: { UToggleButton },
  emits: ["change"],
  methods: {
    getOptionLabel(option) {
      if (typeof this.optionLabel === "function") return this.optionLabel(option);
      if (typeof this.optionLabel === "string" && typeof option === "object" && option !== null) {
        return String(option[this.optionLabel] ?? "");
      }
      return String(option);
    },
    getOptionValue(option) {
      if (typeof this.optionValue === "function") return this.optionValue(option);
      if (typeof this.optionValue === "string" && typeof option === "object" && option !== null) {
        return option[this.optionValue];
      }
      return option;
    },
    isOptionDisabled(option) {
      if (typeof this.optionDisabled === "function") return this.optionDisabled(option);
      if (typeof this.optionDisabled === "string" && typeof option === "object" && option !== null) {
        return !!option[this.optionDisabled];
      }
      return false;
    },
    isSelected(option) {
      const optionValue = this.getOptionValue(option);
      if (this.multiple) {
        return Array.isArray(this.dValue) && this.dValue.some((v) => v === optionValue);
      }
      return this.dValue === optionValue;
    },
    onOptionSelect(option) {
      if (this.disabled || this.isOptionDisabled(option)) return;
      const optionValue = this.getOptionValue(option);
      const selected = this.isSelected(option);

      let newValue;
      if (this.multiple) {
        const current = Array.isArray(this.dValue) ? [...this.dValue] : [];
        if (selected) {
          if (!this.allowEmpty && current.length === 1) return;
          newValue = current.filter((v) => v !== optionValue);
        } else {
          newValue = [...current, optionValue];
        }
      } else {
        if (selected) {
          if (!this.allowEmpty) return;
          newValue = null;
        } else {
          newValue = optionValue;
        }
      }

      this.writeValue(newValue);
      this.$emit("change", { originalEvent: new Event("change"), value: newValue });
    },
  },
};
</script>
