<template>
  <div
    :class="cx('header')"
    role="button"
    :tabindex="$pcAccordionPanel.disabled ? -1 : 0"
    :aria-expanded="$pcAccordionPanel.active"
    :aria-disabled="$pcAccordionPanel.disabled || null"
    :data-p-disabled="$pcAccordionPanel.disabled"
    :data-p-active="$pcAccordionPanel.active"
    @click="onClick"
    @keydown="onKeydown"
  >
    <slot :active="$pcAccordionPanel.active"></slot>
    <slot name="toggleicon" :active="$pcAccordionPanel.active">
      <span :class="cx('toggleicon')" aria-hidden="true">{{ $pcAccordionPanel.active ? "▾" : "▸" }}</span>
    </slot>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `AccordionHeader` component (see
// .vendor-extracted/vue/accordionheader/AccordionHeader.vue). Injects both
// `$pcAccordion` and `$pcAccordionPanel` (per this family's own container-
// first build order — `UAccordion` -> `UAccordionPanel` -> this component),
// toggling the panel's active value via `$pcAccordion.updateValue()` on
// click/Enter/Space, matching real source's own `changeActiveValue()`
// mechanism. `selectOnFocus`-driven activation and the roving
// ArrowUp/ArrowDown/Home/End header-to-header keyboard navigation are
// excluded — same "smaller surface than upstream" precedent as every
// sibling component; Tab/Enter/Space native keyboard semantics are
// retained.
import { createBaseAccordionHeader } from "./BaseAccordionHeader";

export default {
  name: "UAccordionHeader",
  extends: createBaseAccordionHeader(),
  inheritAttrs: false,
  inject: ["$pcAccordion", "$pcAccordionPanel"],
  methods: {
    onClick() {
      if (this.$pcAccordionPanel.disabled) return;
      this.$pcAccordion.updateValue(this.$pcAccordionPanel.value);
    },
    onKeydown(event) {
      if (event.code === "Enter" || event.code === "Space" || event.code === "NumpadEnter") {
        event.preventDefault();
        this.onClick();
      }
    },
  },
};
</script>
