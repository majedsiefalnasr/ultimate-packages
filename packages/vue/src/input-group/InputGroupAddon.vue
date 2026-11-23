<template>
  <div :class="cx('root')" v-bind="ptmi('root')">
    <slot />
  </div>
</template>

<script>
import { createBaseInputGroupAddon } from "./BaseInputGroupAddon";

// Rendering shape verified against the real extracted InputGroupAddon.vue
// (primevue root, inputgroupaddon/InputGroupAddon.vue): a single root <div>
// rendering the default slot.
export default {
  name: "UInputGroupAddon",
  extends: createBaseInputGroupAddon(),
  inheritAttrs: false,
};
</script>
