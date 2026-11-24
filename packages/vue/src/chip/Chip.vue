<template>
  <div
    v-if="visible"
    :class="cx('root', styleParams)"
    :aria-label="label"
    v-bind="ptmi('root')"
    :data-p="dataP"
  >
    <slot>
      <img
        v-if="image"
        :class="cx('image')"
        :src="image"
        :alt="alt"
        v-bind="ptm('image')"
        @error="onImageError"
      />
      <span v-else-if="$slots.icon" :class="cx('icon')" v-bind="ptm('icon')">
        <slot name="icon" />
      </span>
      <span v-else-if="icon" :class="[cx('icon'), icon]" v-bind="ptm('icon')" />
      <span v-if="label !== null" :class="cx('label')" v-bind="ptm('label')">{{ label }}</span>
    </slot>
    <slot v-if="removable" name="removeicon" :remove-callback="close" :keydown-callback="onKeydown">
      <span
        :class="[cx('removeIcon'), removeIcon]"
        role="button"
        :tabindex="disabled ? -1 : 0"
        :aria-label="removeAriaLabel"
        v-bind="ptm('removeIcon')"
        @click="close"
        @keydown="onKeydown"
      >
        <UTimesIcon v-if="!removeIcon" />
      </span>
    </slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Chip` component (see
// .vendor-extracted/vue/chip/Chip.vue). Represents people/items using a
// text `label`, an `icon`, or an `image`, with an optional removable close
// control. The default slot replaces the image, icon and label, the `icon`
// slot fills the icon part (PrimeVue applies the icon class to the slot's own
// root, which Vue cannot do for a fragment, so a wrapper span carries it), and
// the `removeicon` slot replaces the whole remove
// control (it receives `removeCallback` and `keydownCallback`). `removeIcon`
// swaps the default glyph for a font class.
//
// `inheritAttrs` is off and the root binds `ptmi('root')`, so consumer
// `class`, `style` and `aria-*` reach the root. The remove control is
// focusable (role button, tabindex), which PrimeVue's is not.
//
// Deliberately excludes real source's `TimesCircleIcon` default glyph
// (`UTimesIcon` is used instead), recorded in ADR-098.
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
  computed: {
    styleParams() {
      return { disabled: this.disabled };
    },
    dataP() {
      return this.removable ? "removable" : undefined;
    },
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
