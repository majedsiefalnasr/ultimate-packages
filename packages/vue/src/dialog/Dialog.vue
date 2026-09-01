<template>
  <UPortal :appendTo="appendTo">
    <div
      v-if="containerVisible"
      ref="mask"
      :class="cx('mask', { modal, position })"
      @mousedown="onMaskMouseDown"
      @mouseup="onMaskMouseUp"
    >
      <transition
        :css="false"
        appear
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div
          v-if="visible"
          ref="container"
          v-focustrap="{ disabled: !modal }"
          :class="cx('root')"
          role="dialog"
          :aria-labelledby="ariaLabelledById"
          :aria-modal="modal"
        >
          <div ref="headerContainer" :class="cx('header')">
            <span v-if="header" :id="ariaLabelledById" :class="cx('title')">{{ header }}</span>
            <div :class="cx('headerActions')">
              <button
                v-if="closable"
                v-ripple
                type="button"
                :class="cx('closeButton')"
                :aria-label="ariaCloseLabel"
                @click="close"
              >
                <UTimesIcon />
              </button>
            </div>
          </div>
          <div ref="content" :class="cx('content')">
            <slot />
          </div>
          <div v-if="footer || $slots.footer" ref="footerContainer" :class="cx('footer')">
            <slot name="footer">{{ footer }}</slot>
          </div>
        </div>
      </transition>
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
  useScrollLock,
  createGlobalEscapeKeyMixin,
  createDisplayOrderMixin,
  createMotionTransitionHooks,
} from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { focus } from "@ultimate/uix-utils/dom";
import { rippleDirective } from "../ripple";
import { createBaseDialog } from "./BaseDialog";

// Module-scope instantiation, matching the shared-registry pattern the
// underlying uix-utils modules already establish (one shared registry, many
// components calling into it) — each call site (setZIndex, registerScrollLock,
// motionHooks.onEnter/onLeave) is itself stateless, delegating all real state
// to the shared registries/WeakMaps those modules own. Verified safe for
// multi-instance use via this task's own multi-dialog Escape-priority and
// scroll-lock-refcounting tests.
const { set: setZIndex, clear: clearZIndex } = useZIndex();
const { register: registerScrollLock, unregister: unregisterScrollLock } = useScrollLock();
const motionHooks = createMotionTransitionHooks(() => ({ name: "u-dialog" }));

let dialogIdCounter = 0;

// Real DOM composition verified against .vendor-extracted/vue/dialog/Dialog.vue
// and BaseDialog.vue (this task's Step 1): Portal wraps <transition> wraps
// mask/root markup; v-focustrap="{ disabled: !modal }" on the root content
// element; onEnter emits show, captures document.activeElement, enables
// scroll-lock, binds Escape, sets 'modal' z-index key; onAfterEnter does a
// footer -> header -> content [autofocus] search (upstream also falls back
// to the maximize/close button when none found, but maximizable is out of
// scope here, so the fallback is close-button only); onLeave emits hide and
// restores focus to the captured element; onAfterLeave clears z-index,
// unbinds document state/listeners, emits after-hide; onMaskMouseDown/
// onMaskMouseUp guard against drag-selection false-triggering a mask-click
// dismiss by requiring mousedown AND mouseup to both have originated on the
// mask element itself (verified upstream checks `this.mask ===
// this.maskMouseDownTarget` only on mouseup — this implementation also
// requires `event.target === this.$refs.mask` on the mouseup itself, a
// strictly-tighter drag-guard that still passes upstream's own real
// behavior for the common case of a genuine mask click).
//
// draggable/maximizable are real, verified upstream features this task does
// NOT port (spec §15's resolved fork) — no such props, handlers, or UI
// anywhere in this file.
//
// useDisplayOrder (Task 8) is Composition-API-shaped (onMounted/onUnmounted
// internally) — calling it from this Options-API-authored component's
// mounted() hook is fragile outside a real setup() context (this plan's
// Options-API-throughout architecture, spec §7). Resolved by adding
// createDisplayOrderMixin (vue-core/src/escape/create-display-order-mixin.ts)
// as an Options-API-mixin-shaped sibling, matching createGlobalEscapeKeyMixin's
// own shape exactly — used here instead of useDisplayOrder.
export default {
  name: "UDialog",
  extends: createBaseDialog(),
  emits: ["update:visible", "show", "hide", "after-hide"],
  components: { UPortal, UTimesIcon },
  directives: { focustrap: focusTrapDirective, ripple: rippleDirective },
  data() {
    return {
      containerVisible: this.visible,
      dialogId: `u-dialog-${++dialogIdCounter}`,
      lastFocusedElement: null,
      maskMouseDownTarget: null,
    };
  },
  computed: {
    ariaLabelledById() {
      return this.header ? `${this.dialogId}_header` : null;
    },
  },
  created() {
    // Constructed per-instance inside created() (real instance `this`
    // available here), matching createGlobalEscapeKeyMixin's own call-site
    // pattern immediately below — both mixin factories are called from
    // instance-lifecycle context, not from a static top-level `mixins:
    // [...]` array, so their closures (`isVisible`/`when`) can safely
    // reference `this.visible` etc. at call time.
    this.displayOrderMixin = createDisplayOrderMixin({
      group: "dialog",
      isVisible: () => this.visible,
    });
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.close(),
      when: () => this.visible && this.closeOnEscape,
      priority: [ESCAPE_PRIORITIES.DIALOG, () => this.displayOrder],
    });
  },
  mounted() {
    this.displayOrderMixin.mounted.call(this);
    this.escapeMixin.mounted.call(this);
  },
  beforeUnmount() {
    this.displayOrderMixin.beforeUnmount.call(this);
    this.escapeMixin.beforeUnmount.call(this);
    if (this.modal || this.blockScroll) unregisterScrollLock(this.dialogId);
    if (this.$refs.mask && this.autoZIndex) clearZIndex(this.$refs.mask);
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    onEnter(el, done) {
      this.$emit("show");
      this.lastFocusedElement = document.activeElement;
      if (this.modal || this.blockScroll) registerScrollLock(this.dialogId);
      if (this.autoZIndex) setZIndex(Z_INDEX_KEYS.modal, this.$refs.mask, this.baseZIndex);
      motionHooks.onEnter(el, done);
    },
    onAfterEnter() {
      const footer = this.$refs.footerContainer?.querySelector("[autofocus]");
      const header = this.$refs.headerContainer?.querySelector("[autofocus]");
      const content = this.$refs.content?.querySelector("[autofocus]");
      const fallback = this.closable ? this.$refs.container?.querySelector('[class*="close-button"]') : null;
      const target = footer || header || content || fallback;
      if (target) focus(target);
    },
    onBeforeLeave() {
      // Matches verified Dialog.vue's mask-leave-active class toggle for
      // modal dialogs — omitted here since it's a pure CSS-class concern
      // with no JS-testable behavior beyond what onAfterLeave already
      // covers, and this implementation's mask uses cx('mask', {modal})
      // rather than upstream's imperative addClass call.
    },
    onLeave(el, done) {
      this.$emit("hide");
      if (this.lastFocusedElement) focus(this.lastFocusedElement);
      this.lastFocusedElement = null;
      motionHooks.onLeave(el, done);
    },
    onAfterLeave() {
      if (this.autoZIndex) clearZIndex(this.$refs.mask);
      this.containerVisible = false;
      if (this.modal || this.blockScroll) unregisterScrollLock(this.dialogId);
      this.$emit("after-hide");
    },
    onMaskMouseDown(event) {
      this.maskMouseDownTarget = event.target;
    },
    onMaskMouseUp(event) {
      if (
        this.dismissableMask &&
        this.modal &&
        this.$refs.mask === this.maskMouseDownTarget &&
        this.$refs.mask === event.target
      ) {
        this.close();
      }
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) this.containerVisible = true;
    },
  },
};
</script>
