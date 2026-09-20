<template>
  <div :class="cx('root', styleParams)" :aria-labelledby="ariaLabelledby" :aria-label="ariaLabel">
    <img v-if="image && !imageFailed" :src="image" :alt="ariaLabel" @error="onError" />
    <span v-else-if="label" :class="cx('label')">{{ label }}</span>
    <span v-else-if="icon" :class="[cx('icon'), icon]" />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Avatar` component (see
// .vendor-extracted/vue/avatar/Avatar.vue). Renders an image when `image`
// is set (falling back to `label`/`icon` on a load error, matching real
// source's own `onError` handler), else a text `label`, else an `icon`.
//
// Deliberately excludes real source's default-slot content-projection
// override and `$slots.icon` render-function branch — this port's `icon`
// prop is a CSS icon-class string (matching Angular's `UAvatar`/real
// PrimeNG's own `icon` input shape), not a component/render-function slot.
import { createBaseAvatar } from "./BaseAvatar";

export default {
  name: "UAvatar",
  extends: createBaseAvatar(),
  inheritAttrs: false,
  emits: ["error"],
  data() {
    return {
      imageFailed: false,
    };
  },
  computed: {
    styleParams() {
      return {
        hasImage: Boolean(this.image),
        imageFailed: this.imageFailed,
        shape: this.shape,
        size: this.size,
      };
    },
  },
  methods: {
    onError(event) {
      this.imageFailed = true;
      this.$emit("error", event);
    },
  },
};
</script>
