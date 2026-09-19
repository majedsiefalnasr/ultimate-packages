<template>
  <UPortal v-if="confirmation">
    <div ref="content" :class="cx('root')" role="alertdialog">
      <div :class="cx('content')">
        <i v-if="confirmation.icon" :class="[confirmation.icon, cx('icon')]" />
        <span :class="cx('message')">{{ confirmation.message }}</span>
      </div>
      <div :class="cx('footer')">
        <button v-if="confirmation.rejectVisible !== false" type="button" @click="onReject">
          {{ confirmation.rejectLabel ?? "No" }}
        </button>
        <button v-if="confirmation.acceptVisible !== false" type="button" @click="onAccept">
          {{ confirmation.acceptLabel ?? "Yes" }}
        </button>
      </div>
    </div>
  </UPortal>
</template>

<script>
import {
  Portal as UPortal,
  confirmationEventBus,
  useZIndex,
  Z_INDEX_KEYS,
  createGlobalEscapeKeyMixin,
  createDisplayOrderMixin,
} from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { createBaseConfirmPopup } from "./BaseConfirmPopup";

const { set: setZIndex, clear: clearZIndex } = useZIndex();

// Ultimate-owned adaptation of PrimeVue's `ConfirmPopup` component (see
// .vendor-extracted/vue/confirmpopup/ConfirmPopup.vue). Confirmed against
// real source: same service-driven mechanism as ConfirmDialog — subscribes
// to ConfirmationEventBus's 'confirm'/'close' events, renders a small
// overlay positioned relative to `confirmation.target` (typically the
// button that called require()) rather than a modal dialog.
//
// Positioned with a getBoundingClientRect()-based placement (matching
// UPopover's own established precedent). Dismissed on outside click,
// Escape, and window resize.
export default {
  name: "UConfirmPopup",
  extends: createBaseConfirmPopup(),
  data() {
    return {
      confirmation: null,
    };
  },
  confirmListener: null,
  closeListener: null,
  documentClickListener: null,
  windowResizeListener: null,
  created() {
    this.displayOrderMixin = createDisplayOrderMixin({
      group: "overlay-panel",
      isVisible: () => this.confirmation !== null,
    });
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.onReject(),
      when: () => this.confirmation !== null,
      priority: [ESCAPE_PRIORITIES.OVERLAY_PANEL, () => this.displayOrder],
    });
  },
  mounted() {
    this.displayOrderMixin.mounted.call(this);
    this.escapeMixin.mounted.call(this);
    this.confirmListener = (options) => {
      if (options && options.key === this.group) {
        this.confirmation = options;
        this.$nextTick(() => {
          this.align();
          this.bindDismissListeners();
        });
      }
    };
    this.closeListener = () => this.hide();
    confirmationEventBus.on("confirm", this.confirmListener);
    confirmationEventBus.on("close", this.closeListener);
  },
  updated() {
    this.displayOrderMixin.updated.call(this);
    this.escapeMixin.updated.call(this);
  },
  beforeUnmount() {
    this.displayOrderMixin.beforeUnmount.call(this);
    this.escapeMixin.beforeUnmount.call(this);
    confirmationEventBus.off("confirm", this.confirmListener);
    confirmationEventBus.off("close", this.closeListener);
    this.unbindDismissListeners();
    if (this.$refs.content) clearZIndex(this.$refs.content);
  },
  methods: {
    align() {
      const content = this.$refs.content;
      const target = this.confirmation?.target;
      if (!content || !target) return;
      const rect = target.getBoundingClientRect();
      content.style.top = `${rect.bottom + window.scrollY}px`;
      content.style.left = `${rect.left + window.scrollX}px`;
      setZIndex(Z_INDEX_KEYS.overlay, content);
    },
    hide() {
      this.confirmation = null;
      this.unbindDismissListeners();
    },
    onAccept() {
      const target = this.confirmation?.target;
      this.confirmation?.accept?.();
      target?.focus?.();
      this.hide();
    },
    onReject() {
      const target = this.confirmation?.target;
      this.confirmation?.reject?.();
      target?.focus?.();
      this.hide();
    },
    bindDismissListeners() {
      if (!this.documentClickListener) {
        this.documentClickListener = (event) => {
          const content = this.$refs.content;
          const target = this.confirmation?.target;
          const eventTarget = event.target;
          if (
            content &&
            !content.contains(eventTarget) &&
            target !== eventTarget &&
            !(target && target.contains(eventTarget))
          ) {
            this.hide();
          }
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
  components: { UPortal },
};
</script>
