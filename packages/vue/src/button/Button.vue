<template>
  <component
    :is="tag"
    v-if="!asChild"
    v-ripple
    v-tooltip="tooltipBinding"
    :class="cx('root', styleParams)"
    v-bind="rootAttrs"
  >
    <span v-if="loading" :class="cx('loadingIcon')">
      <USpinnerIcon spin />
    </span>
    <span v-else-if="icon" :class="[cx('icon', styleParams), icon, iconClass]" />
    <span v-if="label" :class="cx('label')">{{ label }}</span>
    <slot />
    <span v-if="badge" :class="[cx('badge'), badgeClass]">{{ badge }}</span>
  </component>
  <slot v-else :class="cx('root', styleParams)" />
</template>

<script>
import { SpinnerIcon as USpinnerIcon } from "@ultimate/vue-core";
import { rippleDirective } from "../ripple";
import { tooltipDirective } from "../tooltip";
import { createBaseButton } from "./base-button";

// First real .vue SFC in @ultimate/vue (Task 17) — everything built so far
// (icons, ripple) was plain .ts via defineComponent/h()/createDirective.
// Rendering order verified against the real extracted Button.vue
// (.vendor-extracted/vue/button/Button.vue): loading-icon-or-icon ->
// label -> children (default slot) -> badge (conditional), root wraps all
// with v-ripple applied directly on the root element (unlike React's
// UButton, which deferred Ripple entirely per ADR-031 — Vue's real Button
// wires it directly, and so does this one).
export default {
  name: "UButton",
  extends: createBaseButton(),
  inheritAttrs: false,
  components: { USpinnerIcon },
  directives: { ripple: rippleDirective, tooltip: tooltipDirective },
  computed: {
    tag() {
      return this.as === "BUTTON" ? "button" : this.as;
    },
    hasIcon() {
      return Boolean(this.icon);
    },
    styleParams() {
      return {
        hasIcon: this.hasIcon,
        label: this.label,
        loading: this.loading,
        severity: this.severity,
        raised: this.raised,
        rounded: this.rounded,
        text: this.text || this.variant === "text",
        outlined: this.outlined || this.variant === "outlined",
        link: this.link || this.variant === "link",
        size: this.size,
        fluid: this.fluid === null ? Boolean(this.pcFluid) : this.fluid,
        iconPos: this.iconPos,
      };
    },
    resolvedAriaLabel() {
      if (this.ariaLabel) return this.ariaLabel;
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : undefined;
    },
    rootAttrs() {
      const base = {
        "aria-label": this.resolvedAriaLabel,
        disabled: this.tag === "button" ? this.loading || this.$attrs.disabled : undefined,
        type: this.tag === "button" ? "button" : undefined,
      };
      return { ...this.$attrs, ...base };
    },
    tooltipBinding() {
      if (!this.tooltip) return undefined;
      return { value: this.tooltip, ...this.tooltipOptions };
    },
  },
};
</script>
