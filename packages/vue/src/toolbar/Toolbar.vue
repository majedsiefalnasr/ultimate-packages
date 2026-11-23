<template>
  <div :class="cx('root')" role="toolbar" :aria-labelledby="ariaLabelledby" v-bind="ptmi('root')">
    <slot></slot>
    <div v-if="$slots.start" :class="cx('start')" v-bind="ptm('start')">
      <slot name="start"></slot>
    </div>
    <div v-if="$slots.center" :class="cx('center')" v-bind="ptm('center')">
      <slot name="center"></slot>
    </div>
    <div v-if="$slots.end" :class="cx('end')" v-bind="ptm('end')">
      <slot name="end"></slot>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Toolbar` component (see
// .vendor-extracted/vue/toolbar/Toolbar.vue). Confirmed against real
// source (all 3 frameworks): extends the bare `BaseComponent` tier (no
// v-model/writeValue) — a grouping layout component for buttons/content
// with `role="toolbar"`, never a form control.
//
// This port keeps real source's `start`/`center`/`end` three-slot layout,
// matching real PrimeVue's own named-slot shape exactly, plus the default
// slot for any un-slotted content. A region renders only when its slot is
// provided (ADR-089). `ptmi('root')` carries `pt` and the fall-through
// attributes onto the root; `unstyled` and `dt` come from the base chain.
import { createBaseToolbar } from "./BaseToolbar";

export default {
  name: "UToolbar",
  extends: createBaseToolbar(),
  inheritAttrs: false,
};
</script>
