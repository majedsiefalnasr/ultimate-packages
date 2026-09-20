<template>
  <div :class="cx('root')" aria-live="polite">
    <div
      v-if="!d_active"
      :class="cx('display')"
      tabindex="0"
      role="button"
      :data-p-disabled="disabled"
      @click="onDisplayClick"
      @keydown.enter="onDisplayClick"
    >
      <slot name="display"></slot>
    </div>
    <div v-else :class="cx('content')">
      <slot name="content" :closeCallback="close" />
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Inplace` component (see
// .vendor-extracted/vue/inplace/Inplace.vue). Provides easy editing/
// display at the same time: clicking the display slot opens the content
// slot — matching real source's own `active`/`disabled`/`preventClick`/
// `open`/`close`/`update:active` structural shape and its `d_active`
// internal-state pattern, and its `content` slot's `closeCallback` scope
// prop, exactly.
import { createBaseInplace } from "./BaseInplace";

export default {
  name: "UInplace",
  extends: createBaseInplace(),
  inheritAttrs: false,
  emits: ["open", "close", "update:active"],
  data() {
    return {
      d_active: this.active,
    };
  },
  watch: {
    active(newValue) {
      this.d_active = newValue;
    },
  },
  methods: {
    onDisplayClick(event) {
      if (!this.preventClick) this.open(event);
    },
    open(event) {
      if (this.disabled) return;
      this.d_active = true;
      this.$emit("open", event);
      this.$emit("update:active", true);
    },
    close(event) {
      if (this.disabled) return;
      this.d_active = false;
      this.$emit("close", event);
      this.$emit("update:active", false);
    },
  },
};
</script>
