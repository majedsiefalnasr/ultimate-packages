<template>
  <div :class="cx('tabListRoot')">
    <button
      v-if="showNavigators && isPrevButtonEnabled"
      type="button"
      :class="cx('tabListPrevButton')"
      aria-label="Previous"
      @click="onPrevButtonClick"
    >
      ‹
    </button>
    <div ref="content" :class="cx('tabListContent')" @scroll="onScroll">
      <div ref="tabListEl" :class="cx('tabListTabList')" role="tablist">
        <slot></slot>
        <span ref="inkbar" role="presentation" :class="cx('tabListActiveBar')"></span>
      </div>
    </div>
    <button
      v-if="showNavigators && isNextButtonEnabled"
      type="button"
      :class="cx('tabListNextButton')"
      aria-label="Next"
      @click="onNextButtonClick"
    >
      ›
    </button>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `TabList` component (see
// `.vendor-extracted/vue/tablist/TabList.vue`). Renders the horizontal
// strip of `UTab` triggers (projected via the default slot) plus an
// active-indicator bar, with optional prev/next scroll navigators for
// overflow. Reads `showNavigators`/`value` from the injected `$pcTabs`
// (provided by the container-first `UTabs`, per this family's own build
// order — `UTabs` before `UTabList`).
import { createBaseComponent } from "@ultimate/vue-core";
import { tabsStyleModule } from "./tabs-style";

export default {
  name: "UTabList",
  extends: createBaseComponent({ componentName: "tabs", styleModule: tabsStyleModule }),
  inheritAttrs: false,
  inject: ["$pcTabs"],
  data() {
    return {
      isPrevButtonEnabled: false,
      isNextButtonEnabled: false,
    };
  },
  computed: {
    showNavigators() {
      return this.$pcTabs.showNavigators;
    },
  },
  watch: {
    "$pcTabs.d_value"() {
      this.$nextTick(() => this.updateInkBar());
    },
  },
  mounted() {
    if (this.showNavigators) {
      this.updateButtonState();
    }
    this.$nextTick(() => this.updateInkBar());
  },
  methods: {
    onScroll() {
      if (this.showNavigators) this.updateButtonState();
    },
    onPrevButtonClick() {
      const el = this.$refs.content;
      if (!el) return;
      const pos = Math.abs(el.scrollLeft) - el.clientWidth;
      el.scrollLeft = pos <= 0 ? 0 : pos;
    },
    onNextButtonClick() {
      const el = this.$refs.content;
      if (!el) return;
      const pos = el.scrollLeft + el.clientWidth;
      const lastPos = el.scrollWidth - el.clientWidth;
      el.scrollLeft = pos >= lastPos ? lastPos : pos;
    },
    updateButtonState() {
      const el = this.$refs.content;
      if (!el) return;
      const scrollLeft = Math.abs(el.scrollLeft);
      this.isPrevButtonEnabled = scrollLeft !== 0;
      this.isNextButtonEnabled = Math.abs(scrollLeft - (el.scrollWidth - el.clientWidth)) > 1;
    },
    /** Repositions/resizes the active-tab indicator bar under the active `UTab`. */
    updateInkBar() {
      const content = this.$refs.content;
      const tabList = this.$refs.tabListEl;
      const inkbar = this.$refs.inkbar;
      if (!content || !tabList || !inkbar) return;
      const activeTab = content.querySelector('[data-u-active="true"]');
      if (!activeTab) return;
      inkbar.style.width = `${activeTab.offsetWidth}px`;
      inkbar.style.left = `${activeTab.getBoundingClientRect().left - tabList.getBoundingClientRect().left}px`;
    },
  },
};
</script>
