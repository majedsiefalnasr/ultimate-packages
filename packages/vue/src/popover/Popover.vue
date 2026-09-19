<template>
  <UPortal :appendTo="appendTo">
    <div
      v-if="render"
      ref="content"
      :class="cx('root')"
      role="dialog"
      :aria-modal="visible"
      @click="onOverlayClick"
    >
      <div :class="cx('content')" @click="onContentClick">
        <slot />
      </div>
    </div>
  </UPortal>
</template>

<script>
import {
  Portal as UPortal,
  useZIndex,
  Z_INDEX_KEYS,
  createGlobalEscapeKeyMixin,
  createDisplayOrderMixin,
} from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { createBasePopover } from "./BasePopover";

const { set: setZIndex, clear: clearZIndex } = useZIndex();

// Real DOM composition verified against .vendor-extracted/vue/popover/Popover.vue:
// Portal wraps a single root <div role="dialog"> which wraps a `content`
// inner <div> the default slot renders into — this port matches that same
// shape, imperatively controlled (toggle/show/hide, matching real upstream's
// own consumption pattern — a trigger button's @click calls
// `$refs.op.toggle($event)`) rather than a data-bound `visible` prop.
//
// Positioned with a getBoundingClientRect()-based placement (simpler than
// porting upstream's full absolutePosition()/flip algorithm — KISS, matching
// UPopover's own established Angular/React precedent for this same
// capability).
export default {
  name: "UPopover",
  extends: createBasePopover(),
  emits: ["show", "hide"],
  data() {
    return {
      visible: false,
      render: false,
    };
  },
  target: null,
  selfClick: false,
  documentClickListener: null,
  windowResizeListener: null,
  created() {
    this.displayOrderMixin = createDisplayOrderMixin({
      group: "overlay-panel",
      isVisible: () => this.visible,
    });
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.hide(),
      when: () => this.visible,
      priority: [ESCAPE_PRIORITIES.OVERLAY_PANEL, () => this.displayOrder],
    });
  },
  mounted() {
    this.displayOrderMixin.mounted.call(this);
    this.escapeMixin.mounted.call(this);
  },
  // NOTE: unlike UDialog/UDrawer (where `visible` is a *prop*, and a prop
  // change reliably triggers this component's own updated() hook), UPopover
  // is imperatively controlled — `visible`/`render` are internal data()
  // toggled from show()/hide(), and are read only inside the default slot
  // passed to UPortal. Verified (this task's own investigation): Vue 3's
  // stable-slot-content tracking attributes a reactive dependency read only
  // inside a child component's slot to that child's own re-render, not to
  // this (the slot-owning) component's updated() hook — so updated() here
  // never actually fires in response to show()/hide()'s data() mutations,
  // meaning displayOrder/Escape registration would never happen when opened
  // imperatively. registerMixins()/unregisterMixins() are therefore called
  // directly from show()/hide() below, at the exact point visibility
  // actually changes, instead of depending on updated() to observe it.
  // Left in place as a harmless, idempotent no-op fallback (both mixins'
  // own internal `registered` guards make repeat calls safe) for any future
  // caller that mutates visible via some other reactive path.
  updated() {
    this.displayOrderMixin.updated.call(this);
    this.escapeMixin.updated.call(this);
    if (this.visible && this.$refs.content) {
      this.$nextTick(() => this.align());
    }
  },
  beforeUnmount() {
    this.displayOrderMixin.beforeUnmount.call(this);
    this.escapeMixin.beforeUnmount.call(this);
    this.unbindDismissListeners();
    if (this.$refs.content) clearZIndex(this.$refs.content);
  },
  methods: {
    toggle(event, target) {
      this.visible ? this.hide() : this.show(event, target);
    },
    show(event, target) {
      if (event) event.stopPropagation();
      this.target = target || (event && (event.currentTarget || event.target)) || null;
      this.visible = true;
      this.render = true;
      // Registers displayOrder + the Escape-key handler right away — see
      // the updated() hook's own comment for why this can't wait for
      // updated() to observe the visible/render change.
      this.displayOrderMixin.updated.call(this);
      this.escapeMixin.updated.call(this);
      this.bindDismissListeners();
      this.$emit("show");
      this.$nextTick(() => this.align());
    },
    hide() {
      if (!this.visible) return;
      this.visible = false;
      this.render = false;
      this.displayOrderMixin.updated.call(this);
      this.escapeMixin.updated.call(this);
      this.unbindDismissListeners();
      this.$emit("hide");
    },
    align() {
      const content = this.$refs.content;
      if (!content || !this.target) return;
      const rect = this.target.getBoundingClientRect();
      content.style.top = `${rect.bottom + window.scrollY}px`;
      content.style.left = `${rect.left + window.scrollX}px`;
      setZIndex(Z_INDEX_KEYS.overlay, content);
    },
    onOverlayClick() {
      this.selfClick = true;
    },
    onContentClick() {
      this.selfClick = true;
    },
    bindDismissListeners() {
      if (!this.documentClickListener) {
        this.documentClickListener = (event) => {
          if (!this.dismissable) return;
          const content = this.$refs.content;
          const target = event.target;
          if (
            !this.selfClick &&
            content &&
            !content.contains(target) &&
            this.target !== target &&
            !(this.target && this.target.contains(target))
          ) {
            this.hide();
          }
          this.selfClick = false;
        };
        document.addEventListener("click", this.documentClickListener);
      }
      if (!this.windowResizeListener) {
        this.windowResizeListener = () => this.hide();
        window.addEventListener("resize", this.windowResizeListener);
      }
    },
    unbindDismissListeners() {
      if (this.documentClickListener) {
        document.removeEventListener("click", this.documentClickListener);
        this.documentClickListener = null;
      }
      if (this.windowResizeListener) {
        window.removeEventListener("resize", this.windowResizeListener);
        this.windowResizeListener = null;
      }
    },
  },
  components: {
    UPortal,
  },
};
</script>
