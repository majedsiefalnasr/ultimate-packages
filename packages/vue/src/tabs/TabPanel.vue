<template>
  <div :class="cx('tabPanelRoot')" role="tabpanel" :data-u-active="active" v-show="active">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `TabPanel` component (see
// `.vendor-extracted/vue/tabpanel/TabPanel.vue`). Content pane linked to
// a `UTab` by matching `value`; hidden (via `v-show`) when its `value`
// does not match the injected `$pcTabs.d_value`. This family's 4th
// member, built after `UTabs` -> `UTabList` -> `UTab`, per the documented
// container-first order (tabs -> tablist -> tab -> tabpanel -> tabpanels,
// Dependency Map §C).
import { createBaseComponent } from "@ultimate/vue-core";
import { tabsStyleModule } from "./tabs-style";

export default {
  name: "UTabPanel",
  extends: createBaseComponent({ componentName: "tabs", styleModule: tabsStyleModule }),
  inheritAttrs: false,
  inject: ["$pcTabs"],
  props: {
    value: { type: [String, Number], required: true },
  },
  computed: {
    active() {
      return this.$pcTabs.d_value === this.value;
    },
  },
};
</script>
