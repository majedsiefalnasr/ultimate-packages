<template>
  <div :class="cx('root')" role="progressbar" aria-busy="true" :aria-label="ariaLabel">
    <svg :class="cx('spin')" viewBox="25 25 50 50" :style="{ animationDuration }">
      <circle :class="cx('circle')" cx="50" cy="50" r="20" :fill="fill" :stroke-width="strokeWidth" stroke-miterlimit="10" />
    </svg>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `ProgressSpinner` component (see
// .vendor-extracted/vue/progressspinner/ProgressSpinner.vue). Confirmed
// against real source (all 3 frameworks): extends the bare `BaseComponent`
// tier (no v-model/writeValue) — a purely visual, indeterminate SVG-circle
// spinner with a configurable stroke width, fill, and animation duration.
// No determinate/indeterminate mode distinction exists in real source
// (unlike `ProgressBar`) — it is always an indeterminate busy indicator.
import { createBaseProgressSpinner } from "./BaseProgressSpinner";

export default {
  name: "UProgressSpinner",
  extends: createBaseProgressSpinner(),
  inheritAttrs: false,
};
</script>
