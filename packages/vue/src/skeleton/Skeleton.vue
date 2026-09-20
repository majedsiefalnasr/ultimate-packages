<template>
  <div :class="cx('root', { shape, animation })" :style="containerStyle" aria-hidden="true"></div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Skeleton` component (see
// .vendor-extracted/vue/skeleton/Skeleton.vue). Confirmed against real
// source (all 3 frameworks): extends the bare `BaseComponent` tier (no
// v-model/writeValue) — a pure placeholder/display component with an empty
// body, sized via inline width/height/size/borderRadius styles and an
// animation/shape class toggle.
//
// Deliberately excludes real source's `styleClass` deprecated-prop
// passthrough — same "smaller surface than upstream" precedent as every
// sibling component.
import { createBaseSkeleton } from "./BaseSkeleton";

export default {
  name: "USkeleton",
  extends: createBaseSkeleton(),
  inheritAttrs: false,
  computed: {
    containerStyle() {
      if (this.size) {
        return { width: this.size, height: this.size, borderRadius: this.borderRadius };
      }
      return { width: this.width, height: this.height, borderRadius: this.borderRadius };
    },
  },
};
</script>
