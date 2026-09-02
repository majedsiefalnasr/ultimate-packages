<template>
  <div
    ref="elementRef"
    :class="cx('root')"
    :data-num-items-in-viewport="numItemsInViewport"
    :data-last="last"
    :data-first="first"
    :aria-busy="loading ? 'true' : null"
    @scroll="onScroll"
  >
    <div v-if="loading" :class="cx('loader')">
      <span class="u-scroller-loading-icon"></span>
    </div>
    <div :class="cx('content')" data-u-scroller-content :style="{ height: items.length * itemSize + 'px' }">
      <div
        v-for="entry in visibleItems"
        :key="entry.index"
        :class="cx('item')"
        data-u-scroller-item
        :style="{ top: entry.index * itemSize + 'px' }"
      >
        {{ entry.value }}
      </div>
    </div>
  </div>
</template>

<script>
import { createBaseScroller } from "./base-scroller";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";

// Content measurement + virtual item rendering (Task 12). DEVIATION from
// the task brief's example: the brief drops `immediate: true` from the
// `items` watcher (relying solely on `mounted()`'s explicit recompute()
// call for the initial computation). That is a genuine regression, not a
// harmless redundancy — verified empirically by running Task 11's existing
// `clamps last (getLast) against the live items array length` test against
// the brief's code as-written: it failed (`data-last` read as "0" instead
// of "5") even though `this.last` was internally correct (5) by the end of
// `mounted()`. Root cause: Vue's lifecycle commits the *first* DOM patch
// before `mounted()` fires, so a `mounted()`-only recompute() reactively
// triggers a *second*, asynchronously-queued re-render — invisible to any
// assertion (like this existing, approved test) that reads the DOM
// synchronously right after `mount()` without `await nextTick()`. Keeping
// `immediate: true` fires the watcher during component creation, before
// the first render, so the first DOM patch already reflects the correct
// value. `mounted()`'s own recompute() (using the real measured
// `offsetHeight`, unavailable at `created()` time) then still runs
// immediately after, correcting `contentSize` from its `created()`-time
// value of 0 to the real measured value via a second, expected
// reactive re-render.
export default {
  name: "UScroller",
  extends: createBaseScroller(),
  props: {
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    lazy: { type: Boolean, default: false },
  },
  emits: ["lazy-load"],
  data() {
    return {
      first: 0,
      last: 0,
      numItemsInViewport: 0,
      contentSize: 0,
      resizeObserver: null,
    };
  },
  computed: {
    resolvedNumToleratedItems() {
      return this.numToleratedItems !== null ? this.numToleratedItems : Math.ceil(this.numItemsInViewport / 2);
    },
    visibleItems() {
      if (this.disabled) {
        return this.items.map((value, index) => ({ index, value }));
      }
      const result = [];
      for (let i = this.first; i < this.last; i++) {
        result.push({ index: i, value: this.items[i] });
      }
      return result;
    },
  },
  watch: {
    items: {
      immediate: true,
      handler() {
        this.recompute();
      },
    },
    itemSize: {
      handler() {
        this.recompute();
      },
    },
  },
  mounted() {
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeVue's this.element.offsetHeight measurement exactly
    // (VirtualScroller.vue:289, pinned commit 66dde6788220fc9e6822342919d1ceb0e3460ece),
    // not clientHeight. PrimeVue's real source also genuinely uses
    // ResizeObserver here (VirtualScroller.vue:596-599), so this mirrors
    // real upstream Vue exactly, not just a modern-choice substitute the
    // way Angular's/React's ResizeObserver usage is.
    this.contentSize = this.$refs.elementRef.offsetHeight;
    this.resizeObserver = new ResizeObserver(() => {
      this.contentSize = this.$refs.elementRef.offsetHeight;
      // DEVIATION from the brief's example: the brief's ResizeObserver
      // callback only updates `contentSize`, without calling recompute().
      // `numItemsInViewport`/`last` have no separate watcher on
      // `contentSize`, so without this call they would go stale after any
      // resize past the very first one (and the two new measurement tests,
      // which re-invoke the captured `resizeObserverCallback` to simulate a
      // resize after `mount()`, would never observe the updated viewport
      // size). Calling recompute() here keeps behavior correct on every
      // subsequent resize, matching real PrimeVue's onResize() handler,
      // which recomputes on every ResizeObserver firing.
      this.recompute();
    });
    this.resizeObserver.observe(this.$refs.elementRef);
    this.recompute();
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect();
  },
  methods: {
    recompute() {
      this.numItemsInViewport = calculateNumItemsInViewport(this.contentSize, this.itemSize);
      const rawLast = calculateLast(this.first, this.numItemsInViewport, this.resolvedNumToleratedItems);
      this.last = this.getLast(rawLast);
    },
    getLast(last = 0, isCols = false) {
      if (!this.items) return 0;
      const liveLength = isCols ? this.items.length : this.items.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
      return Math.min(liveLength, last);
    },
    onScroll() {
      const newFirst = Math.floor(this.$refs.elementRef.scrollTop / (this.itemSize || 1));
      if (newFirst !== this.first) {
        this.first = newFirst;
        this.recompute();
        if (this.lazy) {
          const first = this.first;
          const last = this.last;
          Promise.resolve().then(() => {
            this.$emit("lazy-load", { first, last });
          });
        }
      }
    },
    scrollTo(options) {
      this.$refs.elementRef.scrollTo(options);
    },
    scrollToIndex(index, behavior = "auto") {
      this.scrollTo({ top: index * this.itemSize, behavior });
    },
  },
};
</script>
