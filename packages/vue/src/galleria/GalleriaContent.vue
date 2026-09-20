<template>
  <div>
    <div :class="cx('itemWrapper')">
      <button
        v-if="showItemNavigators && value.length > 1"
        type="button"
        :class="cx('prevButton')"
        :disabled="isBackwardDisabled"
        aria-label="Previous"
        @click="$emit('navBackward')"
      >
        &lsaquo;
      </button>
      <div :class="cx('itemContainer')">
        <slot name="item" :item="activeItem" v-if="activeItem !== undefined" />
      </div>
      <button
        v-if="showItemNavigators && value.length > 1"
        type="button"
        :class="cx('nextButton')"
        :disabled="isForwardDisabled"
        aria-label="Next"
        @click="$emit('navForward')"
      >
        &rsaquo;
      </button>
    </div>
    <ul v-if="showThumbnails && value.length > 1" :class="cx('thumbnailList')">
      <li
        v-for="(item, index) in value"
        :key="index"
        :class="cx('thumbnailItem', { active: index === activeIndex })"
        :aria-current="index === activeIndex ? 'true' : null"
        @click="$emit('goTo', index)"
      >
        <slot name="thumbnail" :item="item">
          <slot name="item" :item="item" />
        </slot>
      </li>
    </ul>
  </div>
</template>

<script>
// Internal, unexported sub-component shared by UGalleria's inline and
// fullscreen render paths, so the item-viewport + thumbnail-strip markup
// is authored once. Not a real-source-mirrored component (real
// PrimeVue's own GalleriaContent.vue is a much larger internal facet with
// mask/fullscreen orchestration this port keeps in UGalleria itself) —
// purely a local DRY extraction, cx()/styling passed down as plain props
// since this sub-component does not extend createBaseComponent itself.
export default {
  name: "UGalleriaContent",
  props: {
    value: { type: Array, required: true },
    activeIndex: { type: Number, required: true },
    activeItem: { default: undefined },
    showItemNavigators: { type: Boolean, required: true },
    showThumbnails: { type: Boolean, required: true },
    isForwardDisabled: { type: Boolean, required: true },
    isBackwardDisabled: { type: Boolean, required: true },
    cx: { type: Function, required: true },
  },
  emits: ["navForward", "navBackward", "goTo"],
};
</script>
