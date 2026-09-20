<template>
  <div :class="cx('panel')" :data-p-disabled="disabled" :data-p-active="active">
    <slot></slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `AccordionPanel` component (see
// .vendor-extracted/vue/accordionpanel/AccordionPanel.vue). Injects the
// container-first `$pcAccordion` (per this family's own build order —
// `UAccordion` before `UAccordionPanel`) and exposes its own computed
// `active` state, which descendant `UAccordionHeader`/`UAccordionContent`
// in turn inject via `$pcAccordionPanel`, matching real PrimeVue's own
// inject-chain exactly.
import { createBaseAccordionPanel } from "./BaseAccordionPanel";

export default {
  name: "UAccordionPanel",
  extends: createBaseAccordionPanel(),
  inheritAttrs: false,
  inject: ["$pcAccordion"],
  provide() {
    return {
      $pcAccordionPanel: this,
    };
  },
  computed: {
    active() {
      return this.$pcAccordion.isItemActive(this.value);
    },
  },
};
</script>
