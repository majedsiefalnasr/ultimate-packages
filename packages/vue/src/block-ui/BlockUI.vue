<template>
  <div :class="cx('root')" :aria-busy="blocked">
    <slot />
    <div v-if="blocked" ref="mask" :class="cx('mask', { fullScreen })"></div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `BlockUI` component (see
// .vendor-extracted/vue/blockui/BlockUI.vue). Confirmed against real
// source: `blocked` is a plain visibility-toggle prop (a `watch` calls
// `block()`/`unblock()`), not a form control — no v-model/writeValue
// participation in any of the 3 real sources; it is architecturally a
// mask-overlay toggle, matching UDrawer's own `visible` shape rather than
// UCheckbox's editable-holder shape. Renders a mask over its own default
// slot content (real source's `target` "block another element" mode is
// excluded here, same "smaller surface than upstream" precedent as every
// sibling component).
//
// When `fullScreen` is set, blocks the whole viewport and registers a
// body-scroll lock via vue-core's already-Built `useScrollLock` (the same
// mechanism UDialog/UDrawer already use).
import { useScrollLock, useZIndex } from "@ultimate/vue-core";
import { createBaseBlockUI } from "./BaseBlockUI";

const { set: setZIndex, clear: clearZIndex } = useZIndex();
const { register: registerScrollLock, unregister: unregisterScrollLock } = useScrollLock();

let instanceCount = 0;

export default {
  name: "UBlockUI",
  extends: createBaseBlockUI(),
  inheritAttrs: false,
  emits: ["blocked", "unblocked"],
  created() {
    this.lockId = `u-block-ui-${++instanceCount}`;
  },
  mounted() {
    if (this.blocked) this.block();
  },
  beforeUnmount() {
    if (this.blocked) {
      if (this.fullScreen) unregisterScrollLock(this.lockId);
      clearZIndex(this.$refs.mask);
    }
  },
  watch: {
    blocked(newValue) {
      if (newValue) this.block();
      else this.unblock();
    },
  },
  methods: {
    block() {
      if (this.fullScreen) registerScrollLock(this.lockId);
      this.$nextTick(() => {
        if (this.autoZIndex) setZIndex("modal", this.$refs.mask, this.baseZIndex);
      });
      this.$emit("blocked");
    },
    unblock() {
      if (this.fullScreen) unregisterScrollLock(this.lockId);
      clearZIndex(this.$refs.mask);
      this.$emit("unblocked");
    },
  },
};
</script>
