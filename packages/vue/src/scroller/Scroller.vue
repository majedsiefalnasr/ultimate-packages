<template>
  <div :class="cx('root')" :data-num-items-in-viewport="numItemsInViewport" :data-last="last">
    <div :class="cx('content')" data-u-scroller-content></div>
  </div>
</template>

<script>
import { createBaseScroller } from "./base-scroller";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";

// State-scaffold task (Task 11) — no DOM measurement or item rendering yet
// (that lands in Task 12). `contentSize` stays 0 here, so
// `calculateNumItemsInViewport` naturally resolves to 0 until Task 12 wires
// real measurement; `getLast` still exercises the live-length clamp against
// `this.items` per spec §9 regardless of that.
export default {
  name: "UScroller",
  extends: createBaseScroller(),
  data() {
    return {
      first: 0,
      last: 0,
      numItemsInViewport: 0,
      contentSize: 0,
    };
  },
  computed: {
    resolvedNumToleratedItems() {
      return this.numToleratedItems !== null ? this.numToleratedItems : Math.ceil(this.numItemsInViewport / 2);
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
  },
};
</script>
