<template>
  <div
    :class="cx('root', styleParams)"
    :aria-labelledby="ariaLabelledby"
    :aria-label="ariaLabel"
    v-bind="ptmi('root')"
  >
    <slot>
      <span v-if="label" :class="cx('label')" v-bind="ptm('label')">{{ label }}</span>
      <component :is="$slots.icon" v-else-if="$slots.icon" :class="cx('icon')" />
      <span v-else-if="icon" :class="[cx('icon'), icon]" v-bind="ptm('icon')" />
      <img v-else-if="image" :src="image" :alt="ariaLabel" @error="onError" v-bind="ptm('image')" />
    </slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Avatar` component (see
// .vendor-extracted/vue/avatar/Avatar.vue). The default slot replaces the
// content; otherwise it shows the `label`, else the `icon` slot, else the
// `icon` class string, else the `image`, as PrimeVue does. A failed image only
// emits `error` (ADR-087). `ptmi('root')` carries `pt` and the fall-through
// attributes onto the root, so `inheritAttrs` is off; `unstyled` and `dt` come
// from the base chain. Excludes the `data-p` attribute.
import { createBaseAvatar } from "./BaseAvatar";

export default {
  name: "UAvatar",
  extends: createBaseAvatar(),
  inheritAttrs: false,
  emits: ["error"],
  computed: {
    styleParams() {
      return {
        hasImage: Boolean(this.image),
        shape: this.shape,
        size: this.size,
      };
    },
  },
  methods: {
    onError(event) {
      this.$emit("error", event);
    },
  },
};
</script>
