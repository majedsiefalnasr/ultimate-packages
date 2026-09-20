<template>
  <div v-if="visible" :class="cx('root', { severity })" role="alert" aria-live="polite" :data-severity="severity">
    <div :class="cx('content')">
      <span v-if="resolvedIcon" :class="cx('icon')">
        <i :class="resolvedIcon" aria-hidden="true"></i>
      </span>
      <span :class="cx('text')">
        <slot></slot>
      </span>
      <button
        v-if="closable"
        type="button"
        :class="cx('closeButton')"
        :aria-label="closeAriaLabel"
        @click="close($event)"
      >
        <i v-if="closeIcon" :class="closeIcon" aria-hidden="true"></i>
        <template v-else>&times;</template>
      </button>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Message` component (see
// .vendor-extracted/vue/message/Message.vue). Confirmed against real
// source (all 3 frameworks): extends the bare `BaseComponent` tier (no
// v-model/writeValue) — a status/display component (severity-colored
// banner with an optional close button and optional auto-dismiss timer),
// never a form control.
//
// Real PrimeVue's own `Message` auto-selects a default icon per severity
// when no `icon` prop is given — this port keeps that behavior with plain
// `pi pi-*` icon classes. Deliberately excludes real source's
// `<transition>`-driven show/hide animation (plain `v-if` instead) and its
// `container`/`closeicon` slot-override system — same "smaller surface
// than upstream" precedent as every sibling component.
import { createBaseMessage } from "./BaseMessage";

const DEFAULT_ICON_CLASS = {
  info: "pi pi-info-circle",
  success: "pi pi-check",
  warn: "pi pi-exclamation-triangle",
  error: "pi pi-times-circle",
};

export default {
  name: "UMessage",
  extends: createBaseMessage(),
  inheritAttrs: false,
  emits: ["close"],
  data() {
    return {
      visible: true,
    };
  },
  computed: {
    resolvedIcon() {
      return this.icon ?? DEFAULT_ICON_CLASS[this.severity] ?? null;
    },
  },
  mounted() {
    if (this.life) {
      this.autoCloseTimer = setTimeout(() => {
        this.visible = false;
      }, this.life);
    }
  },
  beforeUnmount() {
    if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
  },
  methods: {
    close(event) {
      this.visible = false;
      this.$emit("close", { originalEvent: event });
    },
  },
};
</script>
