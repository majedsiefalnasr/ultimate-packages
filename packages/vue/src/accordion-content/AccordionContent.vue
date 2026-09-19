<template>
  <div
    v-show="$pcAccordionPanel.active"
    :class="cx('contentRoot')"
    role="region"
    :data-p-active="$pcAccordionPanel.active"
  >
    <div :class="cx('content')">
      <slot></slot>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `AccordionContent` component (see
// .vendor-extracted/vue/accordioncontent/AccordionContent.vue). Injects
// both `$pcAccordion` and `$pcAccordionPanel` (per this family's own
// container-first build order — this is the last member built, after
// `UAccordion` -> `UAccordionPanel` -> `UAccordionHeader`). Toggles
// visibility via `v-show` bound to the injected panel's `active` state,
// matching real source's own `v-show="$pcAccordionPanel.active"` behavior
// exactly (content stays mounted, hidden via CSS — no
// mount/unmount-on-toggle, no `lazy`-gated conditional rendering, since
// `lazy` is excluded from this port's Accordion-family surface).
import { createBaseAccordionContent } from "./BaseAccordionContent";

export default {
  name: "UAccordionContent",
  extends: createBaseAccordionContent(),
  inheritAttrs: false,
  inject: ["$pcAccordion", "$pcAccordionPanel"],
};
</script>
