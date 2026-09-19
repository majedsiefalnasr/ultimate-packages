<template>
  <div :class="cx('root', { position })">
    <div :class="cx('listContainer')">
      <ul :class="cx('list')" role="menu" :aria-label="ariaLabel">
        <template v-for="(item, index) in model" :key="(item.label || '') + index">
          <li v-if="item.visible !== false" :class="cx('item', { active: hoveredIndex === index, disabled: !!item.disabled })" role="none">
            <a
              :href="item.url || '#'"
              :class="cx('itemLink')"
              role="menuitem"
              :aria-label="item.label"
              :aria-disabled="!!item.disabled"
              :data-u-active="hoveredIndex === index"
              @click="onItemClick($event, item)"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = -3"
            >
              <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]"></span>
            </a>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Dock` component (see
// `.vendor-extracted/vue/dock/Dock.vue`, `DockSub.vue`). Renders a
// macOS-dock-style bar of menuitems; the per-icon magnification-on-hover
// effect is CSS-driven (`dock-style.ts`'s doc comment), matching real
// PrimeVue 4.5.5's own `DockSub`, which tracks a hover `currentIndex`
// purely for bookkeeping and never reads it for scale/transform styling.
//
// Real PrimeVue's `Dock` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component driven by a
// flat `model` array.
import { createBaseDock } from "./BaseDock";

export default {
  name: "UDock",
  extends: createBaseDock(),
  inheritAttrs: false,
  emits: ["item-select"],
  data() {
    return {
      hoveredIndex: -3,
    };
  },
  methods: {
    onItemClick(event, item) {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      this.$emit("item-select", { originalEvent: event, item });
      if (item.command) item.command({ originalEvent: event, item });
      if (!item.url) {
        event.preventDefault();
      }
    },
  },
};
</script>
