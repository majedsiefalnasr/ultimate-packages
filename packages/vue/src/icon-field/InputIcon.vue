<template>
  <span aria-hidden="true" :class="cx('root')" v-bind="ptmi('root')">
    <slot />
  </span>
</template>

<script>
import { createBaseInputIcon } from "./BaseInputIcon";

// Rendering shape verified against PrimeVue's InputIcon.vue: a single root
// <span aria-hidden="true"> rendering the default slot, typically
// positioned as the first/last child inside a UIconField — the CSS driving
// its leading/trailing position via DOM order (see
// `@ultimate/uix-styles/iconfield`). PrimeVue writes `aria-hidden` after
// `v-bind`, so it cannot be replaced; here it comes first, so an
// `aria-hidden` attribute or a `pt` entry replaces it and interactive
// content such as a clear button stays reachable (ADR-091). The class
// reaches the root through the attrs that `ptmi` merges, so the `class`
// prop PrimeVue declares is not needed.
export default {
  name: "UInputIcon",
  extends: createBaseInputIcon(),
  inheritAttrs: false,
};
</script>
