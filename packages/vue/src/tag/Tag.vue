<template>
  <span :class="cx('root', { severity, rounded })">
    <span v-if="icon" :class="cx('icon')">
      <i :class="icon" aria-hidden="true"></i>
    </span>
    <span :class="cx('label')"><slot>{{ value }}</slot></span>
  </span>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Tag` component (see
// .vendor-extracted/vue/tag/Tag.vue). Confirmed against real source (all 3
// frameworks): extends the bare `BaseComponent` tier (no v-model/
// writeValue) — a status/categorization display component (severity-
// colored label with an optional icon), never a form control.
//
// Deliberately excludes real source's custom icon-slot-template override
// beyond a plain default `icon` slot — same "smaller surface than upstream"
// precedent as every sibling component.
import { createBaseTag } from "./BaseTag";

export default {
  name: "UTag",
  extends: createBaseTag(),
  inheritAttrs: false,
};
</script>
