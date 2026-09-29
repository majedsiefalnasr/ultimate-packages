<template>
  <div :class="cx('root', { vertical: isVertical })" role="region">
    <div :class="cx('content')" data-u-carousel-content :aria-live="autoplayInterval > 0 ? 'polite' : 'off'">
      <div :class="cx('contentInner')">
        <button
          v-if="showNavigators"
          type="button"
          :class="cx('prevButton')"
          aria-label="Previous"
          :disabled="isBackwardDisabled"
          @click="navBackward"
        >
          &lsaquo;
        </button>
        <div :class="cx('viewport')">
          <div :class="cx('itemList')" :style="{ transform: translateStyle }">
            <div
              v-for="(item, index) of value"
              :key="index"
              :class="cx('item')"
              :style="{ flex: itemFlexBasis }"
              role="group"
              :aria-hidden="!isItemVisible(index)"
            >
              <slot name="item" :data="item" :index="index"></slot>
            </div>
          </div>
        </div>
        <button
          v-if="showNavigators"
          type="button"
          :class="cx('nextButton')"
          aria-label="Next"
          :disabled="isForwardDisabled"
          @click="navForward"
        >
          &rsaquo;
        </button>
      </div>
      <ul v-if="showIndicators" :class="cx('indicatorList')">
        <li
          v-for="(dot, index) of totalDotsArray"
          :key="index"
          :class="cx('indicator', { active: index === d_page })"
          :data-p-active="index === d_page"
        >
          <button
            type="button"
            :class="cx('indicatorButton')"
            :aria-label="`Page ${index + 1}`"
            :aria-current="index === d_page ? 'page' : null"
            @click="goToPage(index)"
          ></button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Carousel` component (see
// .vendor-extracted/vue/carousel/Carousel.vue). Confirmed against real
// source: Carousel's real interaction structure is index/page-based
// sliding via a CSS `transform: translate3d(...)` on an item-list
// container, `numVisible`/`numScroll` window sizing, prev/next navigation
// buttons, clickable indicator dots, and an optional `autoplayInterval`
// `setInterval` timer — real source additionally clones boundary items to
// fake a seamless infinite-loop illusion and handles touch swipe/
// `responsiveOptions` breakpoints; all excluded here, same "smaller
// surface than upstream" precedent as every sibling component (see this
// capability's Angular/React twins for the fuller proof-by-exception
// note — identical finding, same resolution, applied per-framework).
// Circular wraparound uses index math instead of DOM cloning.
//
// `page` supports both controlled (`page` prop + `update:page` emit) and
// uncontrolled usage via `d_page` internal state, derived independently
// from `this.page` (the prop, safely readable in `data()`) rather than
// from any parent tier's own `data()`-assigned value, per the documented
// Vue multi-tier-`data()` pitfall.
import { createBaseCarousel } from "./BaseCarousel";

export default {
  name: "UCarousel",
  extends: createBaseCarousel(),
  inheritAttrs: false,
  emits: ["update:page", "page-change"],
  data() {
    return {
      d_page: this.page,
    };
  },
  created() {
    this.autoplayTimer = null;
  },
  mounted() {
    if (this.autoplayInterval > 0) this.startAutoplay();
  },
  beforeUnmount() {
    this.stopAutoplay();
  },
  watch: {
    page(newValue) {
      this.d_page = newValue;
    },
    autoplayInterval(newValue) {
      this.stopAutoplay();
      if (newValue > 0) this.startAutoplay();
    },
  },
  computed: {
    isVertical() {
      return this.orientation === "vertical";
    },
    totalPages() {
      if (!this.value || this.value.length === 0) return 0;
      return Math.ceil((this.value.length - this.numVisible) / this.numScroll) + 1;
    },
    totalDotsArray() {
      return Array.from({ length: Math.max(this.totalPages, 0) });
    },
    itemFlexBasis() {
      return `0 0 ${100 / this.numVisible}%`;
    },
    translateStyle() {
      const shift = this.d_page * this.numScroll * (100 / this.numVisible);
      return this.isVertical ? `translate3d(0, -${shift}%, 0)` : `translate3d(-${shift}%, 0, 0)`;
    },
    isForwardDisabled() {
      return !this.value?.length || (this.d_page >= this.totalPages - 1 && !this.circular);
    },
    isBackwardDisabled() {
      return !this.value?.length || (this.d_page <= 0 && !this.circular);
    },
  },
  methods: {
    isItemVisible(index) {
      const first = this.d_page * this.numScroll;
      const last = first + this.numVisible - 1;
      return index >= first && index <= last;
    },
    navForward() {
      if (this.totalPages === 0) return;
      if (this.d_page < this.totalPages - 1) {
        this.goToPage(this.d_page + 1);
      } else if (this.circular) {
        this.goToPage(0);
      }
      this.stopAutoplay();
    },
    navBackward() {
      if (this.totalPages === 0) return;
      if (this.d_page > 0) {
        this.goToPage(this.d_page - 1);
      } else if (this.circular) {
        this.goToPage(this.totalPages - 1);
      }
      this.stopAutoplay();
    },
    goToPage(index) {
      if (this.totalPages === 0 || index < 0 || index >= this.totalPages || index === this.d_page) {
        return;
      }
      this.d_page = index;
      this.$emit("update:page", index);
      this.$emit("page-change", { page: index });
    },
    startAutoplay() {
      this.stopAutoplay();
      this.autoplayTimer = setInterval(() => {
        if (this.totalPages === 0) return;
        const next = this.d_page >= this.totalPages - 1 ? 0 : this.d_page + 1;
        this.goToPage(next);
      }, this.autoplayInterval);
    },
    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    },
  },
};
</script>
