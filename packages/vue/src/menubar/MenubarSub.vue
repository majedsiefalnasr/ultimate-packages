<template>
  <ul ref="listEl" :class="root ? cx('rootList') : cx('submenu')" :role="root ? 'menubar' : 'menu'" @keydown="onKeydown">
    <template v-for="(item, i) in items" :key="(item.label || '') + i">
      <li v-if="item.separator" :class="cx('separator')" role="separator" />
      <li
        v-else-if="isVisible(item)"
        :class="cx('item', { disabled: isDisabled(item), open: isOpen(item) })"
        :data-u-disabled="isDisabled(item)"
        :data-u-open="isOpen(item)"
        @mouseenter="onMouseEnter(item)"
      >
        <div :class="cx('itemContent')">
          <a
            role="menuitem"
            :href="item.routerLink ? undefined : item.url || '#'"
            :target="item.target"
            :class="cx('itemLink')"
            :aria-haspopup="hasItems(item) ? 'menu' : undefined"
            :aria-expanded="hasItems(item) ? isOpen(item) : undefined"
            :aria-disabled="isDisabled(item) || undefined"
            :tabindex="isDisabled(item) ? -1 : 0"
            @click="onItemClick($event, item)"
          >
            <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
            <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
            <span v-if="hasItems(item)" :class="cx('submenuIcon')" aria-hidden="true">{{ root ? "▾" : "▸" }}</span>
          </a>
        </div>
        <UMenubarSub v-if="hasItems(item)" :items="item.items" :root="false" @item-select="$emit('item-select', $event)" />
      </li>
    </template>
  </ul>
</template>

<script>
// Recursive submenu renderer for `UMenubar`, adapted from real PrimeVue's
// `MenubarSub` (`.vendor-extracted/vue/menubar/MenubarSub.vue`) — same
// recursive-self-reference shape (a MenubarSub renders a nested
// MenubarSub for each item with `items`), scoped down to this task's
// smaller surface (no search-by-typing machinery, matching `UMenu`'s own
// established reduction pattern) — same decomposition-shape choice this
// task's Angular `UMenubarSub`/React `menubar-sub.tsx` siblings already
// made for this same capability.
//
// Carries real ARIA roles (`menubar`/`menu`/`menuitem`), matching the
// shape already established by this component's Angular/React siblings
// (GAP-054, Spec §5.3) — required for the roving-focus keyboard navigation
// below to be meaningfully testable/correct at all. ArrowRight/ArrowLeft
// move focus horizontally among the root level's own items; ArrowDown/
// ArrowUp move focus vertically within a submenu level (matching real
// PrimeNG/PrimeReact/PrimeVue's own axis-per-level convention). Enter/Space
// on an item with children opens its submenu and moves focus to its first
// item. Escape closes only the innermost open submenu and returns focus to
// that submenu's own trigger. Disabled items are always skipped in roving
// focus and excluded from the DOM tab order (`:tabindex="isDisabled(item)
// ? -1 : 0"`).
//
// Ancestor-binding note (ported from Angular's post-fix `UMenubarSub`, see
// `packages/ng/src/menubar/menubar-sub.ts`, and React's `menubar-sub.tsx`):
// `@keydown` is bound on this level's own `<ul>` (via the `listEl` template
// ref), never on an individual item's `<a>`. A nested `UMenubarSub`
// rendering a deeper level is a DOM *sibling* of its parent item's own
// `<a>` (both live inside the same `<li>`), so binding on the `<a>` would
// leave a deeper level's keydown unreachable by an ancestor level once
// focus moves into a nested submenu — Vue's native DOM event listeners
// still follow real DOM bubbling, so a handler on the parent level's `<ul>`
// (a real DOM ancestor of every level nested within it) does receive the
// bubbled event; a handler on the parent's `<a>` (a DOM sibling of the
// nested `<ul>`, not an ancestor) would not. Confirmed: no `<Teleport>` is
// used anywhere in this component — nested submenus render as plain
// in-tree DOM, CSS-positioned (`.u-menubar-submenu { position: absolute }`
// in `menubar-style.ts`) — so this ancestor relationship holds all the way
// down with no portal escape hatch to account for.
import { createBaseComponent } from "@ultimate/vue-core";
import { menubarStyleModule } from "./menubar-style";

/** Selector for a level's own direct-child item trigger links (excludes nested submenu items). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-menubar-item-content > a";

export default {
  name: "UMenubarSub",
  extends: createBaseComponent({ componentName: "menubar", styleModule: menubarStyleModule }),
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

    /** Direct-child item trigger links for this level only (excludes nested submenus). */
    getItemLinks() {
      const ul = this.$refs.listEl;
      return ul ? Array.from(ul.querySelectorAll(ITEM_LINK_SELECTOR)) : [];
    },

    /** Items that actually render their own direct-child `<a>` (excludes separators and hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
    renderedItems() {
      return this.items.filter((candidate) => !candidate.separator && this.isVisible(candidate));
    },

    /**
     * Resolves the menu item this event's target `<a>` belongs to, but only
     * if that `<a>` is a direct-child item link of *this* level's own `<ul>`
     * (not a descendant belonging to a deeper-nested level). Returns `null`
     * for any event this level does not own, so the caller can leave it
     * bubbling toward the ancestor level that does.
     */
    resolveOwnItem(target) {
      const links = this.getItemLinks();
      const index = links.indexOf(target);
      return index === -1 ? null : (this.renderedItems()[index] ?? null);
    },

    enabledItems() {
      return this.items.filter((candidate) => !candidate.separator && this.isVisible(candidate) && !this.isDisabled(candidate));
    },

    moveFocus(current, direction) {
      const enabled = this.enabledItems();
      if (enabled.length === 0) return;
      const currentIndex = enabled.indexOf(current);
      const startIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
      const nextItem = enabled[nextIndex];
      const links = this.getItemLinks();
      const targetIndex = this.renderedItems().indexOf(nextItem);
      links[targetIndex]?.focus();
    },

    focusFirstSubmenuItem() {
      this.$nextTick(() => {
        const ul = this.$refs.listEl;
        const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
        const firstLink = openLi?.querySelector(".u-menubar-submenu > li:first-child > .u-menubar-item-content > a");
        firstLink?.focus();
      });
    },

    closeAndRefocus(item) {
      this.openItem = null;
      const links = this.getItemLinks();
      const targetIndex = this.renderedItems().indexOf(item);
      links[targetIndex]?.focus();
    },

    onKeydown(event) {
      if (event.code === "Escape") {
        if (this.openItem) {
          event.preventDefault();
          event.stopPropagation();
          this.closeAndRefocus(this.openItem);
        }
        return;
      }

      const item = this.resolveOwnItem(event.target);
      if (!item) return; // Not this level's own item — let it keep bubbling.

      const forwardKey = this.root ? "ArrowRight" : "ArrowDown";
      const backwardKey = this.root ? "ArrowLeft" : "ArrowUp";

      switch (event.code) {
        case forwardKey:
          event.preventDefault();
          this.moveFocus(item, 1);
          break;
        case backwardKey:
          event.preventDefault();
          this.moveFocus(item, -1);
          break;
        case "Enter":
        case "Space":
          if (this.hasItems(item) && !this.isDisabled(item)) {
            event.preventDefault();
            this.openItem = item;
            this.focusFirstSubmenuItem();
          }
          break;
      }
    },
  },
};
</script>
