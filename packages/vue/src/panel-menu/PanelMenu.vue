<template>
  <div :class="cx('root')">
    <UPanelMenuList
      :items="model"
      :expanded-items="expandedItems"
      :multiple="multiple"
      @item-select="$emit('item-select', $event)"
    />
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `PanelMenu` component (see
// `.vendor-extracted/vue/panelmenu/PanelMenu.vue`, `PanelMenuSub.vue`,
// `PanelMenuList.vue` — merged into a single recursive `UPanelMenuList`,
// matching this task's smaller surface). Renders an accordion-style
// nested menu: expandable panels, each toggled in-place (indented nested
// list), not a popup overlay — PanelMenu's genuinely different structural
// trait vs. Menubar/TieredMenu (both of which open positioned popup
// submenus).
//
// Real PrimeVue's `PanelMenu` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component — it does NOT
// compose or wrap `Menu`. This adaptation follows that same independent
// shape, composing only its own recursive `UPanelMenuList` sub-component.
//
// Deliberately excludes upstream's passthrough system, header/submenu-icon
// template projection, and keyboard roving-focus/search-by-typing
// machinery — matching the same reduction `UMenu` already applied to real
// PrimeVue's `Menu`.
import { createBasePanelMenu } from "./BasePanelMenu";
import PanelMenuList from "./PanelMenuList.vue";

export default {
  name: "UPanelMenu",
  extends: createBasePanelMenu(),
  inheritAttrs: false,
  emits: ["item-select"],
  components: { UPanelMenuList: PanelMenuList },
  // A reactive `Set<string>` of position-derived node keys (e.g. `"0"`,
  // `"0_1"`), not item references — see PanelMenuList.vue's own doc
  // comment for why a raw-object-identity Set does not work in Vue.
  data() {
    return {
      expandedItems: new Set(),
    };
  },
};
</script>
