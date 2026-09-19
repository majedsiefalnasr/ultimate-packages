<template>
  <div :class="cx('tabPanelsRoot')" role="presentation">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `TabPanels` component (see
// `.vendor-extracted/vue/tabpanels/TabPanels.vue`). Pure content-
// projection wrapper for a set of `UTabPanel` children — this family's
// final (5th) member, built last per the documented container-first order
// (tabs -> tablist -> tab -> tabpanel -> tabpanels) — no state of its own.
import { createBaseComponent } from "@ultimate/vue-core";
import { tabsStyleModule } from "./tabs-style";

export default {
  name: "UTabPanels",
  extends: createBaseComponent({ componentName: "tabs", styleModule: tabsStyleModule }),
  inheritAttrs: false,
};
</script>
