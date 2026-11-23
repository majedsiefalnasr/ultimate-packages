<template>
  <div :class="cx('root')" v-bind="ptmi('root')">
    <slot />
  </div>
</template>

<script>
import { createBaseIconField } from "./BaseIconField";

// Rendering shape verified against PrimeVue's IconField.vue: a single root
// <div> rendering the default slot, class from cx('root') and
// `v-bind="ptmi('root')"`, with `inheritAttrs` off. Icon positioning
// (leading/trailing) is resolved entirely by CSS :first-child/:last-child
// selectors against DOM order (see `@ultimate/uix-styles/iconfield`) — real
// source carries no `iconPosition` prop on the Vue realization at all,
// unlike PrimeNG's own IconField, which does carry one purely as a
// redundant CSS-hook class. `unstyled` and `dt` come from the base chain,
// and every instance already provides itself as `$parentInstance` through
// the pass-through mixin in vue-core; the `$pcIconField` provide key has no
// consumer in PrimeVue and is not provided (ADR-091).
export default {
  name: "UIconField",
  extends: createBaseIconField(),
  inheritAttrs: false,
};
</script>
