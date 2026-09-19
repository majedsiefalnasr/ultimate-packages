<template>
  <nav :class="cx('root')" :aria-label="ariaLabel">
    <UMenubarSub :items="model" :root="true" @item-select="$emit('item-select', $event)" />
  </nav>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Menubar` component (see
// `.vendor-extracted/vue/menubar/Menubar.vue`, `MenubarSub.vue`). Renders
// a horizontal bar of top-level items, each of which may open a nested
// popup submenu (recursive `UMenubarSub`).
//
// Real PrimeVue's `Menubar` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component — it does NOT
// compose or wrap `Menu`. This adaptation follows that same independent
// shape, composing only its own recursive `UMenubarSub` sub-component
// (same "recursive-Sub-component" DNA `UMenu`'s own sibling `Menuitem.vue`
// established for a flat, non-recursive case).
//
// Deliberately excludes upstream's passthrough system, mobile-breakpoint
// hamburger-menu collapse (`autoHide`/`breakpoint`/`mobileActive`),
// keyboard roving-focus/search-by-typing, and template-projection slots —
// none of these appear in this task's scoped-down surface, matching the
// same reduction `UMenu` already applied to real PrimeVue's `Menu`.
import { createBaseMenubar } from "./BaseMenubar";
import MenubarSub from "./MenubarSub.vue";

export default {
  name: "UMenubar",
  extends: createBaseMenubar(),
  inheritAttrs: false,
  emits: ["item-select"],
  components: { UMenubarSub: MenubarSub },
};
</script>
