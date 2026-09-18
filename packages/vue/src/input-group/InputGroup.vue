<template>
  <div :class="cx('root')">
    <slot />
  </div>
</template>

<script>
import { createBaseInputGroup } from "./BaseInputGroup";

// Rendering shape verified against the real extracted InputGroup.vue
// (primevue root, inputgroup/InputGroup.vue): a single root <div>
// rendering the default slot.
export default {
  name: "UInputGroup",
  extends: createBaseInputGroup(),
};
</script>
