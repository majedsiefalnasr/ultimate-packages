<template>
  <span :class="cx('root')" role="group">
    <slot />
  </span>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `ButtonGroup` component (see
// .vendor-extracted/vue/buttongroup/ButtonGroup.vue). A trivial
// content-projecting `<span role="group">` wrapper composing `UButton` by
// CSS only (adjoining borders/squared-off inner corners) — matches real
// source's own minimal template shape exactly (no props of its own).
import { createBaseButtonGroup } from "./BaseButtonGroup";

export default {
  name: "UButtonGroup",
  extends: createBaseButtonGroup(),
  inheritAttrs: false,
};
</script>
