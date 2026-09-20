<template>
  <div :class="cx('root', { severity })" role="alert" aria-live="polite" :data-severity="severity">
    <span v-if="resolvedIcon" :class="cx('icon')">
      <i :class="resolvedIcon" aria-hidden="true"></i>
    </span>
    <span :class="cx('text')">
      <slot></slot>
    </span>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `InlineMessage` component (see
// .vendor-extracted/vue/inlinemessage/InlineMessage.vue). Confirmed
// against real source: extends the bare `BaseComponent` tier (no
// v-model/writeValue) — a status/display component (severity-colored
// inline alert), never a form control.
//
// Genuinely distinct from Ultimate's own already-Built `UMessage`: real
// `Message` has `closable`/`life`/`closeIcon`/`closeButtonProps`/`size`/
// `variant` props, a working `v-if="visible"` gate, a real close button,
// and a `<transition>` wrapper. Real `InlineMessage` has none of this —
// only `severity`/`icon`, always-visible, no dismiss mechanism of any kind
// (real or intended). Real source's own `mounted()` hook references
// `this.sticky`/`this.life`, but neither is declared as a prop/data field
// anywhere, and the template never gates on `visible` — this is dead code
// in the actual shipped component, not a working feature, and is
// deliberately NOT ported here (see BaseInlineMessage.ts's own doc
// comment for the full evidence).
import { createBaseInlineMessage } from "./BaseInlineMessage";

const DEFAULT_ICON_CLASS = {
  info: "pi pi-info-circle",
  success: "pi pi-check",
  warn: "pi pi-exclamation-triangle",
  error: "pi pi-times-circle",
};

export default {
  name: "UInlineMessage",
  extends: createBaseInlineMessage(),
  inheritAttrs: false,
  computed: {
    resolvedIcon() {
      return this.icon ?? DEFAULT_ICON_CLASS[this.severity] ?? null;
    },
  },
};
</script>
