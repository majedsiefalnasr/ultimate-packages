<template>
  <input
    type="text"
    :class="cx('root', styleParams)"
    :value="dValue"
    :name="name"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<script>
import { createBaseInputText } from "./BaseInputText";

// Real rendered DOM verified against .vendor-extracted/vue/inputtext/InputText.vue:
// a single native input[type=text], no decorative wrapper — matching
// UInputText's Angular precedent (an attribute-directive-shaped component
// with no own box/icon markup, unlike Checkbox/RadioButton's dual-element
// pattern). `writeValue()` on every native `input` event, per real source's
// own `onInput(event) { this.writeValue(event.target.value, event); }`.
export default {
  name: "UInputText",
  extends: createBaseInputText(),
  emits: ["focus", "blur"],
  computed: {
    styleParams() {
      return {
        invalid: this.invalid,
        fluid: this.resolvedFluid,
        filled: this.resolvedVariant === "filled",
      };
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
