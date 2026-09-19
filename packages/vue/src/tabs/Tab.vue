<template>
  <button
    type="button"
    :class="cx('tab', { active, disabled })"
    role="tab"
    :aria-selected="active"
    :aria-disabled="disabled"
    :data-u-active="active"
    :data-u-disabled="disabled"
    :tabindex="tabindexAttr"
    @focus="onFocus"
    @click="onClick"
    @keydown="onKeyDown"
  >
    <slot></slot>
  </button>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Tab` component (see
// `.vendor-extracted/vue/tab/Tab.vue`). A single tab trigger inside
// `UTabList` (this family's tier-3 member, built after `UTabs`/
// `UTabList` per the container-first order); owns keyboard roving-focus
// navigation (ArrowLeft/ArrowRight/Home/End) across sibling `u-tab`
// elements sharing the same parent, matching real PrimeVue's own
// `findNextTab`/`findPrevTab`/`findFirstTab`/`findLastTab` DOM-sibling
// traversal.
//
// Active state is derived by comparing this tab's own `value` prop
// against the injected `$pcTabs.d_value` — an index/string-key comparison
// (`===`), never object-identity, per this task's own documented Vue
// proxy-identity pitfall (not applicable to primitives, but the same
// index/key-based-not-reference-based principle is followed here too).
import { createBaseComponent } from "@ultimate/vue-core";
import { tabsStyleModule } from "./tabs-style";

export default {
  name: "UTab",
  extends: createBaseComponent({ componentName: "tabs", styleModule: tabsStyleModule }),
  inheritAttrs: false,
  inject: ["$pcTabs"],
  props: {
    value: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    active() {
      return this.$pcTabs.d_value === this.value;
    },
    tabindexAttr() {
      if (this.disabled) return -1;
      return this.active ? this.$pcTabs.tabindex : -1;
    },
  },
  methods: {
    onFocus() {
      if (!this.disabled && this.$pcTabs.selectOnFocus) {
        this.activate();
      }
    },
    onClick() {
      if (!this.disabled) {
        this.activate();
      }
    },
    onKeyDown(event) {
      switch (event.code) {
        case "ArrowRight":
          this.focusSibling(this.findNext(this.$el) ?? this.findFirst());
          event.preventDefault();
          break;
        case "ArrowLeft":
          this.focusSibling(this.findPrev(this.$el) ?? this.findLast());
          event.preventDefault();
          break;
        case "Home":
          this.focusSibling(this.findFirst());
          event.preventDefault();
          break;
        case "End":
          this.focusSibling(this.findLast());
          event.preventDefault();
          break;
        case "Enter":
        case "Space":
        case "NumpadEnter":
          if (!this.disabled) this.activate();
          event.preventDefault();
          break;
        default:
          break;
      }
      event.stopPropagation();
    },
    activate() {
      this.$pcTabs.updateValue(this.value);
    },
    isEligible(el) {
      return !!el && el.getAttribute && el.getAttribute("data-u-disabled") !== "true" && el.getAttribute("role") === "tab";
    },
    findNext(el, selfCheck = false) {
      const candidate = selfCheck ? el : el.nextElementSibling;
      if (!candidate) return null;
      return this.isEligible(candidate) ? candidate : this.findNext(candidate);
    },
    findPrev(el, selfCheck = false) {
      const candidate = selfCheck ? el : el.previousElementSibling;
      if (!candidate) return null;
      return this.isEligible(candidate) ? candidate : this.findPrev(candidate);
    },
    findFirst() {
      const first = this.$el.parentElement?.firstElementChild ?? null;
      return first ? this.findNext(first, true) : null;
    },
    findLast() {
      const last = this.$el.parentElement?.lastElementChild ?? null;
      return last ? this.findPrev(last, true) : null;
    },
    focusSibling(el) {
      el?.focus?.();
      el?.scrollIntoView?.({ block: "nearest" });
    },
  },
};
</script>
