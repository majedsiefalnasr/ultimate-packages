<template>
  <span :class="cx('root', styleParams)">
    <slot>{{ value }}</slot>
  </span>
</template>

<script>
import { createBaseBadge } from "./base-badge";

// Rendering shape verified against the real extracted Badge.vue
// (primevue root, badge/Badge.vue): a single root <span> rendering the
// default slot, falling back to the `value` prop when no slot content is
// provided. Deliberately excludes upstream's `pt`/`ptOptions` passthrough
// binding (`v-bind="ptmi('root')"`) and `data-p` attribute (both Option B
// exclusions already established by every other Ultimate component in this
// package), and excludes the `$pcBadge`/`$parentInstance` provide() pair
// from BaseBadge.vue — that wiring exists upstream only to support the
// attribute-directive/OverlayBadge composition path, which this task's
// brief explicitly excludes (component form only, no attribute-directive
// variant, matching Angular's already-Built UBadge).
export default {
  name: "UBadge",
  extends: createBaseBadge(),
  computed: {
    styleParams() {
      return {
        value: this.value,
        hasDefaultSlot: Boolean(this.$slots.default),
        size: this.size,
        severity: this.severity,
      };
    },
  },
};
</script>
