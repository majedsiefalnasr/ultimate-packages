<template>
  <ul ref="listEl" :class="cx('submenu')" role="menu" @keydown="onKeydown">
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
//
// ArrowDown/ArrowUp roving focus (GAP-054, Spec §5.3) is scoped to this
// group's own flat leaf-item list, delegated on this component's own
// `<ul role="menu">` (via the `listEl` template ref), matching
// `TieredMenuSub.vue`'s/`MenubarSub.vue`'s established
// delegate-on-the-ancestor-`<ul>` pattern. Disabled leaf items are skipped
// (`:tabindex="isDisabled(item) ? -1 : 0"`, already present above). Escape
// is deliberately NOT handled here: this component never calls
// `stopPropagation()` on it, letting it bubble untouched up through the
// overlay to `MegaMenu.vue`'s own root `<ul>`, which owns the single
// `openItem` this hard-2-level structure ever needs to close.
import { createBaseComponent } from "@ultimate/vue-core";
import { megaMenuStyleModule } from "./mega-menu-style";

/** Selector for this group's own direct-child leaf item links. */
const ITEM_LINK_SELECTOR = ":scope > li > .u-megamenu-item-content > a";

export default {
  name: "UMegaMenuColumnGroup",
  extends: createBaseComponent({ componentName: "megamenu", styleModule: megaMenuStyleModule }),
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

    /** Direct-child leaf item links for this group only. */
    getItemLinks() {
      const ul = this.$refs.listEl;
      return ul ? Array.from(ul.querySelectorAll(ITEM_LINK_SELECTOR)) : [];
    },

    /** Items that actually render their own direct-child `<a>` (excludes hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
    renderedItems() {
      const items = this.group.items || [];
      return items.filter((candidate) => this.isVisible(candidate));
    },

    moveFocus(current, direction) {
      const items = this.group.items || [];
      const enabled = items.filter(
        (candidate) => this.isVisible(candidate) && !this.isDisabled(candidate)
      );
      if (enabled.length === 0) return;
      const currentIndex = enabled.indexOf(current);
      const startIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
      const nextItem = enabled[nextIndex];
      const links = this.getItemLinks();
      const targetIndex = this.renderedItems().indexOf(nextItem);
      links[targetIndex]?.focus();
    },

    /** ArrowDown/ArrowUp roving focus among this group's own flat leaf items; Escape is intentionally left unhandled so it bubbles to `MegaMenu.vue`'s own root `<ul>`. */
    onKeydown(event) {
      const links = this.getItemLinks();
      const index = links.indexOf(event.target);
      if (index === -1) return; // Not one of this group's own item links.

      const current = this.renderedItems()[index];
      if (!current) return;

      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          this.moveFocus(current, 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          this.moveFocus(current, -1);
          break;
      }
    },
  },
};
</script>
