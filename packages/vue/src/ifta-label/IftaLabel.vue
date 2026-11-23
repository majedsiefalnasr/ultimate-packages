<template>
  <span :class="cx('root')" v-bind="ptmi('root')">
    <slot />
  </span>
</template>

<script>
import { createBaseIftaLabel } from "./BaseIftaLabel";

// Rendering shape verified against PrimeVue's IftaLabel.vue: a single root
// <span> rendering the default slot, class from cx('root') and
// `v-bind="ptmi('root')"`, with `inheritAttrs` off. `unstyled` and `dt` come
// from the base chain, and every instance already provides itself as
// `$parentInstance` through the pass-through mixin in vue-core. The
// `$pcIftaLabel` provide key has no consumer in PrimeVue and is not
// provided (ADR-092). The label-position trigger is pure CSS (`:has()`
// selectors — see `@ultimate/uix-styles/iftalabel`), matching UFloatLabel's
// own precedent exactly: no JS-side focus/content tracking of its own.
export default {
  name: "UIftaLabel",
  extends: createBaseIftaLabel(),
  inheritAttrs: false,
};
</script>
