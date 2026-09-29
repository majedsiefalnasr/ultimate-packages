<template>
  <div>
    <div :class="cx('itemWrapper')" data-u-galleria-content tabindex="-1" @keydown="onKeyDown">
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
        role="button"
        tabindex="0"
        @click="$emit('goTo', index)"
        @keydown="onThumbnailKeyDown($event, index)"
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
  emits: ["navForward", "navBackward", "goTo", "escape"],
  methods: {
    // Handles keyboard navigation on the content viewport: ArrowLeft/ArrowRight move to the
    // previous/next item, Home/End jump to the first/last item, and Escape is forwarded to the
    // parent UGalleria (which owns fullscreen state) via the "escape" emit. Ignored when the
    // event originates from a focused editable descendant (e.g. an <input> inside a custom item
    // template) so typing in projected content never triggers gallery navigation.
    onKeyDown(event) {
      if (this.isEditableTarget(event.target)) return;
      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault();
          this.$emit("navBackward");
          break;
        case "ArrowRight":
          event.preventDefault();
          this.$emit("navForward");
          break;
        case "Home":
          event.preventDefault();
          this.$emit("goTo", 0);
          break;
        case "End":
          event.preventDefault();
          this.$emit("goTo", this.value.length - 1);
          break;
        case "Escape":
          this.$emit("escape");
          break;
        default:
          break;
      }
    },
    isEditableTarget(target) {
      if (!(target instanceof HTMLElement)) return false;
      const tagName = target.tagName;
      return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
    },
    // Handles Enter/Space on a focused thumbnail: activates it the same way the existing click
    // handler does (Spec §5.1, GAP-050 Task 7). No-op for any other key.
    onThumbnailKeyDown(event, index) {
      if (event.code === "Enter" || event.code === "Space") {
        event.preventDefault();
        this.$emit("goTo", index);
      }
    },
  },
};
</script>
