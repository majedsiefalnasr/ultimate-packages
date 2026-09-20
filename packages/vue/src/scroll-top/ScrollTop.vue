<template>
  <UButton
    v-if="visible"
    ref="buttonRef"
    :class="cx('root', { target })"
    rounded
    type="button"
    :aria-label="buttonAriaLabel"
    icon="pi pi-chevron-up"
    @click="onClick"
  />
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `ScrollTop` component (see
// .vendor-extracted/vue/scrolltop/ScrollTop.vue). Confirmed against real
// source (all 3 frameworks): extends the bare `BaseComponent` tier (no
// v-model/writeValue). Composes `UButton`, matching this batch's own
// `UButton` composition precedent from `USplitButton`/`UPanel`. Real
// source's own `target` option (`'window' | 'parent'`) is honored —
// `'window'` tracks the document's own scroll position, `'parent'` tracks
// this component's own rendered parent element's scroll position, both
// toggling visibility once past `threshold`, using `vue-core`'s
// already-Built `useZIndex` for the overlay layer (same tier `UBlockUI`
// already uses).
//
// This component's `visible` toggle is a plain `v-if` directly in its own
// template (no `UPortal`/Teleport composed), so the known Vue pitfall
// about Teleport-plus-internal-state-driven-`updated()` does not apply
// here — `updated()`/reactivity fire normally for a same-tree `v-if`.
//
// Deliberately excludes real source's `<transition>`-driven show/hide
// animation (plain `v-if` instead, no enter/leave animation) and its
// `#icon` slot override — same "smaller surface than upstream" precedent
// as every sibling component.
import { useZIndex } from "@ultimate/vue-core";
import { UButton } from "../button";
import { createBaseScrollTop } from "./BaseScrollTop";

const { set: setZIndex, clear: clearZIndex } = useZIndex();

export default {
  name: "UScrollTop",
  extends: createBaseScrollTop(),
  inheritAttrs: false,
  components: { UButton },
  emits: ["show", "hide"],
  data() {
    return {
      visible: false,
    };
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          const el = this.$refs.buttonRef?.$el;
          if (el) setZIndex("overlay", el, 0);
        });
        this.$emit("show");
      } else {
        const el = this.$refs.buttonRef?.$el;
        if (el) clearZIndex(el);
        this.$emit("hide");
      }
    },
  },
  mounted() {
    this.scrollTarget = this.target === "window" ? window : this.$el?.parentElement;
    this.checkVisibility = () => {
      const scrollY =
        this.target === "window"
          ? window.pageYOffset || document.documentElement.scrollTop
          : (this.scrollTarget?.scrollTop ?? 0);
      this.visible = scrollY > this.threshold;
    };
    this.scrollTarget?.addEventListener("scroll", this.checkVisibility);
  },
  beforeUnmount() {
    this.scrollTarget?.removeEventListener("scroll", this.checkVisibility);
    const el = this.$refs.buttonRef?.$el;
    if (el) clearZIndex(el);
  },
  methods: {
    onClick() {
      const scrollElement = this.target === "window" ? window : this.$el?.parentElement;
      scrollElement?.scroll({ top: 0, behavior: this.behavior });
    },
  },
};
</script>
