<template>
  <span :class="cx('root', { variant })">
    <slot />
  </span>
</template>

<script>
import { createBaseFloatLabel } from "./BaseFloatLabel";

// Rendering shape verified against the real extracted FloatLabel.vue
// (primevue root, floatlabel/FloatLabel.vue): a single root <span>
// rendering the default slot, class resolved via cx('root'). Deliberately
// excludes upstream's `pt`/`ptOptions` passthrough binding
// (`v-bind="ptmi('root')")`) and the `$pcFloatLabel`/`$parentInstance`
// provide() pair — that wiring exists upstream only to support descendant
// form controls reading their ancestor FloatLabel instance, which this
// task's scope (a pure label-position wrapper, no cross-component state
// sharing) does not require, matching every other Option B exclusion
// already established in this package.
//
// The label-float trigger itself is pure CSS (`:has()` selectors — see
// float-label-style.ts), matching real source exactly: no JS-side focus/
// content tracking exists in real FloatLabel at all.
export default {
  name: "UFloatLabel",
  extends: createBaseFloatLabel(),
};
</script>
