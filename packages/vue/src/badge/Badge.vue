<template>
  <span :class="cx('root', styleParams)" v-bind="ptmi('root')">
    <slot>{{ value }}</slot>
  </span>
</template>

<script>
import { createBaseBadge } from "./base-badge";

// Rendering shape verified against the real extracted Badge.vue
// (primevue root, badge/Badge.vue): a single root <span> rendering the
// default slot, falling back to the `value` prop when no slot content is
// provided. `ptmi('root')` carries `pt` and the fall-through attributes onto
// the root, so `inheritAttrs` is off; `unstyled` and `dt` come from the base
// chain. Excludes the `data-p` attribute and the `$pcBadge`/`$parentInstance`
// provide() pair: that wiring only supports upstream's deprecated `v-badge`
// directive, which is a deliberate gap here (ADR-088).
export default {
  name: "UBadge",
  extends: createBaseBadge(),
  inheritAttrs: false,
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
