<template>
  <div v-if="!(fullScreen && d_fullScreenActive)" :class="cx('root')">
    <UGalleriaContent
      :value="value"
      :activeIndex="d_activeIndex"
      :activeItem="activeItem"
      :showItemNavigators="showItemNavigators"
      :showThumbnails="showThumbnails"
      :isForwardDisabled="isForwardDisabled"
      :isBackwardDisabled="isBackwardDisabled"
      :cx="cx"
      @navForward="navForward"
      @navBackward="navBackward"
      @goTo="goTo"
    >
      <template #item="slotProps"><slot name="item" v-bind="slotProps" /></template>
      <template v-if="$slots.thumbnail" #thumbnail="slotProps"><slot name="thumbnail" v-bind="slotProps" /></template>
    </UGalleriaContent>
  </div>
  <UPortal v-if="fullScreen">
    <div v-if="d_fullScreenActive" v-focustrap :class="cx('mask')" role="dialog">
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
        <button type="button" :class="cx('closeButton')" aria-label="Close" @click="closeFullScreen">
          <UTimesIcon />
        </button>
        <UGalleriaContent
          :value="value"
          :activeIndex="d_activeIndex"
          :activeItem="activeItem"
          :showItemNavigators="showItemNavigators"
          :showThumbnails="showThumbnails"
          :isForwardDisabled="isForwardDisabled"
          :isBackwardDisabled="isBackwardDisabled"
          :cx="cx"
          @navForward="navForward"
          @navBackward="navBackward"
          @goTo="goTo"
        >
          <template #item="slotProps"><slot name="item" v-bind="slotProps" /></template>
          <template v-if="$slots.thumbnail" #thumbnail="slotProps"><slot name="thumbnail" v-bind="slotProps" /></template>
        </UGalleriaContent>
      </div>
    </div>
  </UPortal>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Galleria` component (see
// .vendor-extracted/vue/galleria/Galleria.vue + GalleriaContent.vue +
// GalleriaItem.vue + GalleriaThumbnails.vue). Confirmed against real
// source: real Galleria is genuinely a multi-file family with
// `responsiveOptions`-driven per-instance breakpoint state, touch/swipe
// gesture handling on the thumbnail strip, a separate indicator-dot
// facet, and a `Portal`-teleported fullscreen mask with its own
// enter/leave transition.
//
// Per this batch's established Carousel precedent (same finding,
// resolved the same way): this port reduces the family to one visible
// component (plus a small internal, non-exported `UGalleriaContent`
// sub-component shared between the inline and fullscreen render paths,
// purely a local DRY extraction, not a real-source-mirrored facet) with a
// main-item viewport (prev/next navigation, index-math circular
// wraparound instead of real source's DOM-cloning illusion), an optional
// click-to-select thumbnail strip, and an optional `autoplayInterval`
// timer. Deliberately excludes `responsiveOptions`/dynamic breakpoint
// state, touch/swipe gestures, separate indicator dots, and per-item
// caption facets — same "smaller surface than upstream" precedent as
// every sibling component (Carousel/Fieldset).
//
// `d_activeIndex` follows the established `d_collapsed`(Fieldset)/
// `d_active`(Inplace) internal-state-derived-from-initial-prop pattern —
// per the known Vue pitfall, it is derived directly from the
// `activeIndex` prop (this component's own source of truth), never from
// another tier's `data()`.
//
// Fullscreen mode composes `UPortal`+`v-focustrap` directly, mirroring
// `UImage`'s own established overlay wiring in this same sub-batch. The
// mask's `v-if="d_fullScreenActive"` sits directly inside `UPortal`'s
// slot (not nested deeper), matching `UDrawer`/`UImage`'s own structure —
// avoids the known Vue slot-content-reactivity pitfall for
// internal-data-driven visibility inside a Portal slot.
//
// `fullScreenActive`/`update:fullScreenActive` follows the established
// `collapsed`/`update:collapsed`(Fieldset) controlled/uncontrolled prop
// pattern, giving external code (and this component's own tests) a way
// to open/close the fullscreen overlay without reaching into internal
// instance methods.
import { Portal as UPortal, TimesIcon as UTimesIcon, focusTrapDirective } from "@ultimate/vue-core";
import { createBaseGalleria } from "./BaseGalleria";
import UGalleriaContent from "./GalleriaContent.vue";

export default {
  name: "UGalleria",
  extends: createBaseGalleria(),
  inheritAttrs: false,
  emits: ["update:activeIndex", "update:fullScreenActive"],
  data() {
    return {
      d_activeIndex: this.activeIndex,
      d_fullScreenActive: this.fullScreenActive,
      intervalId: undefined,
    };
  },
  watch: {
    fullScreenActive(newValue) {
      this.d_fullScreenActive = newValue;
    },
  },
  computed: {
    activeItem() {
      return this.value[this.d_activeIndex];
    },
    isForwardDisabled() {
      return this.value.length === 0 || (this.d_activeIndex >= this.value.length - 1 && !this.circular);
    },
    isBackwardDisabled() {
      return this.value.length === 0 || (this.d_activeIndex <= 0 && !this.circular);
    },
  },
  mounted() {
    if (this.autoplayInterval > 0) this.startAutoplay();
  },
  beforeUnmount() {
    this.stopAutoplay();
  },
  methods: {
    navForward() {
      const total = this.value.length;
      if (total === 0) return;
      if (this.d_activeIndex < total - 1) this.goTo(this.d_activeIndex + 1);
      else if (this.circular) this.goTo(0);
      this.stopAutoplay();
    },
    navBackward() {
      const total = this.value.length;
      if (total === 0) return;
      if (this.d_activeIndex > 0) this.goTo(this.d_activeIndex - 1);
      else if (this.circular) this.goTo(total - 1);
      this.stopAutoplay();
    },
    goTo(index) {
      const total = this.value.length;
      if (total === 0 || index < 0 || index >= total || index === this.d_activeIndex) return;
      this.d_activeIndex = index;
      this.$emit("update:activeIndex", index);
    },
    openFullScreen() {
      if (!this.fullScreen) return;
      this.d_fullScreenActive = true;
      this.$emit("update:fullScreenActive", true);
    },
    closeFullScreen() {
      this.d_fullScreenActive = false;
      this.$emit("update:fullScreenActive", false);
    },
    startAutoplay() {
      this.stopAutoplay();
      this.intervalId = setInterval(() => {
        const total = this.value.length;
        if (total === 0) return;
        const next = this.d_activeIndex >= total - 1 ? 0 : this.d_activeIndex + 1;
        this.goTo(next);
      }, this.autoplayInterval);
    },
    stopAutoplay() {
      if (this.intervalId !== undefined) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
    },
  },
  directives: { focustrap: focusTrapDirective },
  components: { UPortal, UTimesIcon, UGalleriaContent },
};
</script>
