<template>
  <div :class="cx('root')">
    <slot />
  </div>
</template>

<script>
import { createBaseIconField } from "./BaseIconField";

// Rendering shape verified against the real extracted IconField.vue
// (primevue root, iconfield/IconField.vue): a single root <div> rendering
// the default slot. Icon positioning (leading/trailing) is resolved
// entirely by CSS :first-child/:last-child selectors against DOM order
// (see icon-field-style.ts) — real source carries no `iconPosition` prop
// on the Vue realization at all (confirmed: BaseIconField.vue declares no
// props), unlike PrimeNG's own IconField, which does carry one purely as a
// redundant CSS-hook class (not consulted by the shared CSS itself either).
export default {
  name: "UIconField",
  extends: createBaseIconField(),
};
</script>
