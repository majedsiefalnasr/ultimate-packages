<template>
  <UPortal :appendTo="appendTo">
    <div
      v-if="containerVisible"
      ref="mask"
      :class="cx('mask')"
      @mousedown="onMaskMouseDown"
      @mouseup="onMaskMouseUp"
    >
      <div
        v-if="visible"
        ref="container"
        v-focustrap
        :class="cx('root', { position })"
        role="complementary"
        @keydown="onKeyDown"
      >
        <div :class="cx('header')">
          <span v-if="header" :class="cx('title')">{{ header }}</span>
          <button
            v-if="closable"
            ref="closeButton"
            v-ripple
            type="button"
            :class="cx('closeButton')"
            :aria-label="ariaCloseLabel"
            @click="close"
          >
            <UTimesIcon />
          </button>
        </div>
        <div :class="cx('content')">
          <slot />
        </div>
        <div v-if="$slots.footer" :class="cx('footer')">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </UPortal>
</template>

<script>
import {
  Portal as UPortal,
  TimesIcon as UTimesIcon,
  focusTrapDirective,
  useZIndex,
  Z_INDEX_KEYS,
  createGlobalEscapeKeyMixin,
  createDisplayOrderMixin,
} from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { rippleDirective } from "../ripple";
import { createBaseDrawer } from "./BaseDrawer";

const { set: setZIndex, clear: clearZIndex } = useZIndex();

// Real DOM composition verified against .vendor-extracted/vue/drawer/Drawer.vue:
// Portal wraps a mask <div> wraps a root <div role="complementary"> with
// header (title + close button)/content/footer slots — this port matches
// that same shape, data-bound `visible`/`update:visible` (not imperative,
// unlike UPopover), positioned at one of left/right/top/bottom/full via CSS
// classes, dismissed on mask click/Escape/close button. Composes
// v-focustrap the same way UDialog already does.
export default {
  name: "UDrawer",
  extends: createBaseDrawer(),
  emits: ["update:visible", "show", "hide"],
  data() {
    return {
      containerVisible: this.visible,
      maskMouseDownTarget: null,
    };
  },
  created() {
    this.displayOrderMixin = createDisplayOrderMixin({
      group: "sidebar",
      isVisible: () => this.visible,
    });
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.close(),
      when: () => this.visible && this.closeOnEscape,
      priority: [ESCAPE_PRIORITIES.SIDEBAR, () => this.displayOrder],
    });
  },
  mounted() {
    this.displayOrderMixin.mounted.call(this);
    this.escapeMixin.mounted.call(this);
    if (this.visible) this.onShowEffects();
  },
  updated() {
    this.displayOrderMixin.updated.call(this);
    this.escapeMixin.updated.call(this);
  },
  beforeUnmount() {
    this.displayOrderMixin.beforeUnmount.call(this);
    this.escapeMixin.beforeUnmount.call(this);
    if (this.$refs.mask) clearZIndex(this.$refs.mask);
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.containerVisible = true;
        this.$nextTick(() => this.onShowEffects());
        this.$emit("show");
      } else {
        this.containerVisible = false;
        this.$emit("hide");
      }
    },
  },
  methods: {
    onShowEffects() {
      if (this.$refs.mask) setZIndex(Z_INDEX_KEYS.modal, this.$refs.mask);
    },
    close() {
      this.$emit("update:visible", false);
    },
    onKeyDown(event) {
      if (event.code === "Escape" && this.closeOnEscape) this.close();
    },
    onMaskMouseDown(event) {
      this.maskMouseDownTarget = event.target;
    },
    onMaskMouseUp(event) {
      if (
        this.dismissible &&
        this.modal &&
        event.target === event.currentTarget &&
        event.target === this.maskMouseDownTarget
      ) {
        this.close();
      }
    },
  },
  directives: { focustrap: focusTrapDirective, ripple: rippleDirective },
  components: { UPortal, UTimesIcon },
};
</script>
