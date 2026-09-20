<template>
  <span :class="cx('root')" aria-hidden="true">
    <slot />
  </span>
</template>

<script>
import { createBaseInputIcon } from "./BaseInputIcon";

// Rendering shape verified against the real extracted InputIcon.vue
// (primevue root, inputicon/InputIcon.vue): a single root <span
// aria-hidden="true"> rendering the default slot, typically positioned as
// the first/last child inside a UIconField — the CSS driving its
// leading/trailing position via DOM order (see icon-field-style.ts).
export default {
  name: "UInputIcon",
  extends: createBaseInputIcon(),
};
</script>
