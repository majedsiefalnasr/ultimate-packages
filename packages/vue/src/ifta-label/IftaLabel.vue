<template>
  <span :class="cx('root')">
    <slot />
  </span>
</template>

<script>
import { createBaseIftaLabel } from "./BaseIftaLabel";

// Rendering shape verified against the real extracted IftaLabel.vue
// (primevue root, iftalabel/IftaLabel.vue): a single root <span> rendering
// the default slot. The label-position trigger is pure CSS (`:has()`
// selectors — see ifta-label-style.ts), matching UFloatLabel's own
// precedent exactly: no JS-side focus/content tracking of its own.
export default {
  name: "UIftaLabel",
  extends: createBaseIftaLabel(),
};
</script>
