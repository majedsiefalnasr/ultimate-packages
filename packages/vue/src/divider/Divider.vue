<template>
  <div :class="cx('root', { layout })" :aria-orientation="layout" role="separator">
    <div v-if="$slots.default" :class="cx('content')">
      <slot></slot>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Divider` component (see
// .vendor-extracted/vue/divider/Divider.vue). Separates content with a
// horizontal or vertical rule, with an optional default-slot label
// centered on the rule — matching real source's own `layout` structural
// shape.
//
// Deliberately excludes real source's `type` (`solid`/`dashed`/`dotted`)
// and `align` props — this port renders a solid rule only, centered
// content only, same "smaller surface than upstream" precedent as every
// sibling component.
import { createBaseDivider } from "./BaseDivider";

export default {
  name: "UDivider",
  extends: createBaseDivider(),
  inheritAttrs: false,
};
</script>
