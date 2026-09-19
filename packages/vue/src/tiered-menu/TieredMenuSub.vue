<template>
  <ul :class="root ? cx('rootList') : cx('submenu')" role="menu">
    <template v-for="(item, i) in items" :key="(item.label || '') + i">
      <li v-if="item.separator" :class="cx('separator')" role="separator" />
      <li
        v-else-if="isVisible(item)"
        :class="cx('item', { disabled: isDisabled(item), open: isOpen(item) })"
        role="menuitem"
        :data-u-disabled="isDisabled(item)"
        :data-u-open="isOpen(item)"
        @mouseenter="onMouseEnter(item)"
      >
        <div :class="cx('itemContent')">
          <a
            :href="item.routerLink ? undefined : item.url || '#'"
            :target="item.target"
            :class="cx('itemLink')"
            :aria-haspopup="hasItems(item) ? 'menu' : undefined"
            :aria-expanded="hasItems(item) ? isOpen(item) : undefined"
            :aria-disabled="isDisabled(item) || undefined"
            tabindex="-1"
            @click="onItemClick($event, item)"
          >
            <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
            <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
            <span v-if="hasItems(item)" :class="cx('submenuIcon')" aria-hidden="true">▸</span>
          </a>
        </div>
        <UTieredMenuSub
          v-if="hasItems(item)"
          :items="item.items"
          :root="false"
          @item-select="$emit('item-select', $event)"
        />
      </li>
    </template>
  </ul>
</template>

<script>
// Recursive submenu renderer for `UTieredMenu`, adapted from real
// PrimeVue's `TieredMenuSub` (`.vendor-extracted/vue/tieredmenu/TieredMenuSub.vue`)
// — same recursive-self-reference shape (a TieredMenuSub renders a nested
// TieredMenuSub for each item with `items`), scoped down to this task's
// smaller surface (click/hover-driven open, no keyboard roving-focus/
// search-by-typing machinery, matching `UMenu`'s own established
// reduction pattern) — same decomposition-shape choice this task's
// Angular `UTieredMenuSub`/React `tiered-menu-sub.tsx` siblings already
// made for this same capability.
import { createBaseComponent } from "@ultimate/vue-core";
import { tieredMenuStyleModule } from "./tiered-menu-style";

export default {
  name: "UTieredMenuSub",
  extends: createBaseComponent({ componentName: "tiered-menu", styleModule: tieredMenuStyleModule }),
  props: {
    items: { type: Array, default: () => [] },
    root: { type: Boolean, default: false },
  },
  emits: ["item-select"],
  data() {
    return {
      openItem: null,
    };
  },
  methods: {
    isVisible(item) {
      return typeof item.visible === "function" ? item.visible() : item.visible !== false;
    },
    isDisabled(item) {
      return typeof item.disabled === "function" ? item.disabled() : !!item.disabled;
    },
    hasItems(item) {
      return !!item.items && item.items.length > 0;
    },
    isOpen(item) {
      return this.openItem === item;
    },
    onMouseEnter(item) {
      if (this.hasItems(item) && !this.isDisabled(item)) {
        this.openItem = item;
      }
    },
    onItemClick(event, item) {
      if (this.isDisabled(item)) {
        event.preventDefault();
        return;
      }
      if (this.hasItems(item)) {
        event.preventDefault();
        this.openItem = this.openItem === item ? null : item;
        return;
      }
      if (!item.url && !item.routerLink) {
        event.preventDefault();
      }
      if (item.command) item.command({ originalEvent: event, item });
      this.$emit("item-select", { originalEvent: event, item });
    },
  },
};
</script>
