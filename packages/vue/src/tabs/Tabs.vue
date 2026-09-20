<template>
  <div :class="cx('tabsRoot')">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Tabs` component (see
// `.vendor-extracted/vue/tabs/Tabs.vue`). Container/state-owner for the
// Tabs family — provides `$pcTabs: this` so descendant family members
// (`UTabList` -> `UTab`, `UTabPanels` -> `UTabPanel`) can `inject` the
// active `value` and related settings, matching real PrimeVue's own
// `provide() { return { $pcTabs: this } }` mechanism (verified this
// task's Step 1, `BaseTabs.vue`) — the only structurally sound way to wire
// independent slotted sibling families to shared root state in Vue's
// Options API (PanelMenu's own single-recursive-chain prop-threading
// doesn't apply here, since `UTabList`'s and `UTabPanels`' own slot
// content is authored directly by the app, not passed through by an
// intermediate component).
//
// `d_value` is derived directly from `this.value` (the `value` prop),
// independently of any parent tier's own `data()` — per this task's own
// documented Vue multi-tier-`data()` pitfall, `this.value` (the prop) is
// always safely readable here since props resolve before `data()` runs,
// unlike a *parent tier's own `data()`-assigned* value, which is not.
import { createBaseTabs } from "./BaseTabs";

export default {
  name: "UTabs",
  extends: createBaseTabs(),
  inheritAttrs: false,
  emits: ["update:value"],
  data() {
    return {
      d_value: this.value,
    };
  },
  provide() {
    return {
      $pcTabs: this,
    };
  },
  watch: {
    value(newValue) {
      this.d_value = newValue;
    },
  },
  methods: {
    updateValue(newValue) {
      if (this.d_value !== newValue) {
        this.d_value = newValue;
        this.$emit("update:value", newValue);
      }
    },
  },
};
</script>
