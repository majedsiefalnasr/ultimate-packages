<template>
  <span :class="cx('root', { variant })" v-bind="ptmi('root')">
    <slot />
  </span>
</template>

<script>
import { createBaseFloatLabel } from "./BaseFloatLabel";

// Rendering shape verified against PrimeVue's FloatLabel.vue: a single root
// <span> rendering the default slot, class from cx('root') and
// `v-bind="ptmi('root')"`, with `inheritAttrs` off. `unstyled` and `dt` come
// from the base chain, and every instance already provides itself as
// `$parentInstance` through the pass-through mixin in vue-core, which is the
// descendant lookup PrimeVue's `provide()` offers. The `$pcFloatLabel`
// provide key has no consumer in PrimeVue and is not provided (ADR-090).
//
// The label-float trigger itself is pure CSS (`:has()` selectors — see
// `@ultimate/uix-styles/floatlabel`), matching real source exactly: no
// JS-side focus/content tracking exists in real FloatLabel at all.
export default {
  name: "UFloatLabel",
  extends: createBaseFloatLabel(),
  inheritAttrs: false,
};
</script>
