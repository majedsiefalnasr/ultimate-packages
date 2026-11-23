<template>
  <input
    type="text"
    :class="cx('root', styleParams)"
    :data-p="dataP"
    :value="dValue"
    :name="name"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    v-bind="ptmi('root', { context: { filled, disabled } })"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<script>
import { cn } from "@ultimate/uix-utils/classnames";
import { createBaseInputText } from "./BaseInputText";

// Real rendered DOM verified against .vendor-extracted/vue/inputtext/InputText.vue:
// a single native input[type=text], no decorative wrapper — matching
// UInputText's Angular precedent (an attribute-directive-shaped component
// with no own box/icon markup, unlike Checkbox/RadioButton's dual-element
// pattern). `writeValue()` on every native `input` event, per real source's
// own `onInput(event) { this.writeValue(event.target.value, event); }`.
// `p-filled` follows the value (`filled`, from the editable holder), like
// PrimeVue; `data-p` carries the variant-derived `filled`, as PrimeVue's.
// `pt`, `unstyled` and `dt` come from the base chain.
export default {
  name: "UInputText",
  extends: createBaseInputText(),
  inheritAttrs: false,
  emits: ["focus", "blur"],
  computed: {
    styleParams() {
      return {
        invalid: this.invalid,
        fluid: this.resolvedFluid,
        filled: this.filled,
        variantFilled: this.resolvedVariant === "filled",
        size: this.size,
      };
    },
    dataP() {
      return cn({
        invalid: this.invalid,
        fluid: this.resolvedFluid,
        filled: this.resolvedVariant === "filled",
        [this.size]: this.size,
      });
    },
  },
  methods: {
    onInput(event) {
      this.writeValue(event.target.value, event);
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
