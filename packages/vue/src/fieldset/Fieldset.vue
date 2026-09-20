<template>
  <fieldset :class="cx('root', { toggleable })">
    <legend :class="cx('legend')">
      <button
        v-if="toggleable"
        :id="headerId"
        type="button"
        :aria-controls="contentId"
        :aria-expanded="!d_collapsed"
        :class="cx('toggleButton')"
        @click="toggle"
        @keydown="onKeyDown"
      >
        <span :class="cx('toggleIcon')" aria-hidden="true">{{ d_collapsed ? "+" : "−" }}</span>
        <span :class="cx('legendLabel')">{{ legend }}</span>
      </button>
      <span v-else :class="cx('legendLabel')">{{ legend }}</span>
    </legend>
    <div
      v-if="!toggleable || !d_collapsed"
      :class="cx('contentContainer')"
      role="region"
      :id="contentId"
      :aria-labelledby="headerId"
    >
      <div :class="cx('content')">
        <slot></slot>
      </div>
    </div>
  </fieldset>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Fieldset` component (see
// .vendor-extracted/vue/fieldset/Fieldset.vue). A grouping component with
// an optional `legend` heading and an optional content-toggle feature —
// matching real source's own `legend`/`toggleable`/`collapsed`/
// `update:collapsed`/`toggle` structural shape and its internal
// `d_collapsed` state pattern exactly.
//
// Deliberately excludes real source's `<transition name="p-collapsible">`
// collapse animation, its `v-ripple` directive on the toggle button, and
// its `legend`/`toggleicon` slot-override system — this port toggles
// visibility via a plain `v-if`, no enter/leave animation, same "smaller
// surface than upstream" precedent as every sibling component. Real
// source's expand/collapse glyphs (`PlusIcon`/`MinusIcon`) are not used
// here for cross-framework consistency with Angular/React (neither has a
// Plus icon yet) — plain `+`/`−` text glyphs are used instead, disclosed
// here rather than silently substituted.
import { createBaseFieldset } from "./BaseFieldset";

let uid = 0;

export default {
  name: "UFieldset",
  extends: createBaseFieldset(),
  inheritAttrs: false,
  emits: ["update:collapsed", "toggle"],
  data() {
    return {
      d_collapsed: this.collapsed,
      instanceId: `u_fieldset_${++uid}`,
    };
  },
  computed: {
    headerId() {
      return `${this.instanceId}_header`;
    },
    contentId() {
      return `${this.instanceId}_content`;
    },
  },
  watch: {
    collapsed(newValue) {
      this.d_collapsed = newValue;
    },
  },
  methods: {
    toggle(event) {
      if (!this.toggleable) return;
      this.d_collapsed = !this.d_collapsed;
      this.$emit("update:collapsed", this.d_collapsed);
      this.$emit("toggle", { originalEvent: event, value: this.d_collapsed });
      event.preventDefault();
    },
    onKeyDown(event) {
      if (event.code === "Enter" || event.code === "NumpadEnter" || event.code === "Space") {
        this.toggle(event);
      }
    },
  },
};
</script>
