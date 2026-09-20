<template>
  <div :class="cx('root')" :tabindex="tabindex" :aria-labelledby="ariaLabelledby" :aria-label="ariaLabel">
    <slot name="left"></slot>
    <span ref="right"><slot name="right"></slot></span>
    <input type="range" min="0" max="100" value="50" :class="cx('slider')" @input="onSlide" />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `ImageCompare` component (see
// .vendor-extracted/vue/imagecompare/ImageCompare.vue). Compares two
// images side by side with a slider: a `left` slot renders the base
// image, a `right` slot renders the overlay image clipped by a native
// `<input type="range">` slider — matching real source's own left/right
// slot + range-input structural shape.
//
// Deliberately excludes real source's RTL direction auto-detection and
// its `$dt('imagecompare.scope.x')` CSS-custom-property indirection (no
// `@ultimate/uix-styles/imagecompare` theme token exists yet) — this port
// always clips left-to-right and sets `clip-path` directly via a `$refs`
// element reference (matching Angular's own `UImageCompare` port for
// cross-framework consistency), same "smaller surface than upstream"
// precedent as every sibling component. Real source relies entirely on
// PrimeVue's theme CSS for the absolute positioning that makes the
// "right" image visually overlay the "left" one — no such theme package
// exists here (ADR-004: no Prime runtime dependency), so this port's own
// `imageCompareStyleModule` includes the minimum layout CSS needed for
// the compare effect to render correctly.
import { createBaseImageCompare } from "./BaseImageCompare";

export default {
  name: "UImageCompare",
  extends: createBaseImageCompare(),
  inheritAttrs: false,
  methods: {
    onSlide(event) {
      const value = event.target.value;
      this.$refs.right.style.clipPath = `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)`;
    },
  },
};
</script>
