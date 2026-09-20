<template>
  <div v-if="visible" :class="cx('root')" :aria-label="label">
    <img v-if="image" :class="cx('image')" :src="image" :alt="alt" @error="onImageError" />
    <span v-else-if="icon" :class="[cx('icon'), icon]" />
    <span v-if="label !== null" :class="cx('label')">{{ label }}</span>
    <span
      v-if="removable"
      :class="cx('removeIcon')"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-label="removeAriaLabel"
      @click="close"
      @keydown="onKeydown"
    >
      <UTimesIcon />
    </span>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Chip` component (see
// .vendor-extracted/vue/chip/Chip.vue). Represents people/items using a
// text `label`, an `icon`, or an `image`, with an optional removable close
// control — matching real source's own label/icon/image/removable
// structural shape and prop names.
//
// Deliberately excludes real source's default `<slot>` render override and
// its `TimesCircleIcon` remove glyph (no such icon exists yet in
// `@ultimate/vue-core`'s icon set — `UTimesIcon` is used instead, same
// "smaller surface than upstream" precedent as every sibling component).
import { TimesIcon as UTimesIcon } from "@ultimate/vue-core";
import { createBaseChip } from "./BaseChip";

export default {
  name: "UChip",
  extends: createBaseChip(),
  inheritAttrs: false,
  emits: ["remove", "imageError"],
  data() {
    return {
      visible: true,
    };
  },
  methods: {
    onKeydown(event) {
      if (event.key === "Enter" || event.key === "Backspace") {
        this.close(event);
      }
    },
    close(event) {
      if (this.disabled) return;
      this.visible = false;
      this.$emit("remove", event);
    },
    onImageError(event) {
      this.$emit("imageError", event);
    },
  },
  components: {
    UTimesIcon,
  },
};
</script>
