<template>
  <ul :class="cx('submenu')" role="menu">
    <li v-if="group.label" :class="cx('submenuLabel')" role="presentation">{{ group.label }}</li>
    <template v-for="(item, i) in group.items || []" :key="(item.label || '') + i">
      <li v-if="isVisible(item)" :class="cx('item')" role="none">
        <div :class="cx('itemContent')">
          <a
            role="menuitem"
            :href="item.url || '#'"
            :target="item.target"
            :class="cx('itemLink')"
            :aria-disabled="isDisabled(item) || undefined"
            :tabindex="isDisabled(item) ? -1 : 0"
            @click="onClick($event, item)"
          >
            <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
            <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
          </a>
        </div>
      </li>
    </template>
  </ul>
</template>

<script>
// Renders one submenu group within a MegaMenu overlay column — an optional
// `label` header followed by a flat list of leaf items. Adapted from real
// PrimeVue's `MegaMenuSub` (`.vendor-extracted/vue/megamenu/MegaMenuSub.vue`)
// applied to a single group (real MegaMenuSub also renders the grid of
// columns for the root case — this task splits that root-grid
// responsibility into `UMegaMenu` itself, keeping this component a flat,
// non-recursive leaf-group renderer, since a MegaMenu overlay group is
// itself not further nested — same decomposition-shape choice this task's
// Angular `UMegaMenuColumnGroup`/React `mega-menu-column.tsx` siblings
// already made for this same capability).
import { createBaseComponent } from "@ultimate/vue-core";
import { megaMenuStyleModule } from "./mega-menu-style";

export default {
  name: "UMegaMenuColumnGroup",
  extends: createBaseComponent({ componentName: "mega-menu", styleModule: megaMenuStyleModule }),
  props: {
    group: { type: Object, required: true },
  },
  emits: ["item-select"],
  methods: {
    isVisible(item) {
      return typeof item.visible === "function" ? item.visible() : item.visible !== false;
    },
    isDisabled(item) {
      return typeof item.disabled === "function" ? item.disabled() : !!item.disabled;
    },
    onClick(event, item) {
      if (this.isDisabled(item)) {
        event.preventDefault();
        return;
      }
      if (!item.url) {
        event.preventDefault();
      }
      if (item.command) item.command({ originalEvent: event, item });
      this.$emit("item-select", { originalEvent: event, item });
    },
  },
};
</script>
