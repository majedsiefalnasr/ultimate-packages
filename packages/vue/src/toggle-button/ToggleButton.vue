<template>
  <button
    ref="host"
    v-ripple
    type="button"
    :class="cx('root', styleParams)"
    :tabindex="tabindex"
    :disabled="disabled"
    :aria-pressed="active"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-invalid="invalid || undefined"
    @click="onChange"
    @blur="onBlur"
  >
    <span :class="cx('content')">
      <span v-if="onIcon || offIcon" :class="[cx('icon'), active ? onIcon : offIcon]" />
      <span :class="cx('label')">{{ label }}</span>
    </span>
  </button>
</template>

<script>
import { isNotEmpty } from "@ultimate/uix-utils/object";
import { rippleDirective } from "../ripple";
import { createBaseToggleButton } from "./BaseToggleButton";

// Real rendered DOM verified against .vendor-extracted/vue/togglebutton/
// ToggleButton.vue: a real native <button type="button"> host (unlike
// RadioButton/Checkbox's dual-element input+decorative-box shape) carrying
// aria-pressed/disabled/tabindex, with v-ripple applied directly on the
// root — same established precedent as UButton
// (packages/vue/src/button/Button.vue) — wrapping a single
// span.content > [span.icon?, span.label] structure. Upstream's `slot`/
// `icon` named-slot indirection and `getPTOptions`/passthrough plumbing are
// not ported — no passthrough surface, per this project's Option-B ADR
// posture (spec §10), same boundary cut already documented across
// checkbox/radio-button.
//
// $pcToggleButton ambient-context `provide()` is NOT ported — no consumer
// of that injection exists in Batch 1's own scope (no ToggleButtonGroup
// capability), same boundary-cut precedent RadioButton's own doc comment
// already established for $pcRadioButtonGroup/$pcCheckboxGroup.
export default {
  name: "UToggleButton",
  extends: createBaseToggleButton(),
  emits: ["change", "blur"],
  directives: { ripple: rippleDirective },
  computed: {
    active() {
      return this.dValue === true;
    },
    hasLabel() {
      return isNotEmpty(this.onLabel) && isNotEmpty(this.offLabel);
    },
    label() {
      return this.hasLabel ? (this.active ? this.onLabel : this.offLabel) : " ";
    },
    styleParams() {
      return {
        checked: this.active,
        disabled: this.disabled,
        invalid: this.invalid,
        fluid: this.fluid,
      };
    },
  },
  methods: {
    onChange(event) {
      if (this.disabled || this.readonly) return;

      this.writeValue(!this.active, event);
      this.$emit("change", event);
    },
    onBlur(event) {
      this.$emit("blur", event);
    },
  },
};
</script>
