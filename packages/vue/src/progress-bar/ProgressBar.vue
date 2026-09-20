<template>
  <div
    :class="cx('root', { mode })"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="mode === 'determinate' ? value : undefined"
  >
    <div v-if="mode === 'determinate'" :class="cx('value')" :style="{ width: value + '%' }">
      <div v-if="showValue" :class="cx('label')">{{ value }}{{ unit }}</div>
    </div>
    <div v-else :class="cx('value')"></div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `ProgressBar` component (see
// .vendor-extracted/vue/progressbar/ProgressBar.vue). Confirmed against
// real source (all 3 frameworks): extends the bare `BaseComponent` tier
// (no v-model/writeValue) — a process-status indicator with
// `determinate` (numeric `value` + optional label) and `indeterminate`
// (animated, no value) modes.
//
// Deliberately excludes real source's `#content`/`#value` slot overrides
// and `color`/`valueStyle`/`valueClass` styling escape hatches — same
// "smaller surface than upstream" precedent as every sibling component.
import { createBaseProgressBar } from "./BaseProgressBar";

export default {
  name: "UProgressBar",
  extends: createBaseProgressBar(),
  inheritAttrs: false,
};
</script>
