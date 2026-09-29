<template>
  <div :class="cx('root', { position })">
    <div :class="cx('listContainer')">
      <ul ref="listEl" :class="cx('list')" role="menu" :aria-label="ariaLabel" @keydown="onKeydown">
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
//
// Keyboard navigation (Spec §5.4, GAP-055) is a roving focus among this
// dock's own rendered items, bound on the `<ul role="menu">` itself (via
// the `listEl` template ref) — never on an individual item `<a>` —
// matching the ancestor-binding requirement already established while
// fixing GAP-054 (a keydown handler on a trigger element never observes
// events from sibling items) and this component's own already-approved
// Angular/React siblings (`packages/ng/src/dock/dock.ts`,
// `packages/react/src/dock/dock.tsx`). Axis follows `position`:
// ArrowRight/ArrowLeft move focus for a top/bottom-positioned dock,
// ArrowUp/ArrowDown for a left/right-positioned one (real Prime's own
// axis-follows-orientation convention). Home/End jump to the first/last
// item regardless of orientation. Disabled items are skipped.
//
// This dock has no nested/recursive levels (unlike `UPanelMenuList`) and
// no `<Teleport>`/portal usage anywhere in this component (independently
// confirmed for this task) — every item renders as a plain in-tree
// `<li>`/`<a>` direct child of this single `<ul>`, so there is no bubbling
// concern to resolve here.
//
// Index-mapping (GAP-054 lesson applied proactively): this dock supports
// `item.visible === false` items, which render no `<a>` at all. Resolving
// which `UMenuItem` a keydown's target `<a>` belongs to, and finding the
// DOM node to focus for a given `UMenuItem`, must both index into the same
// rendered-items subset (`renderedItems()`) that `getItemLinks()` draws
// its DOM nodes from — never the full, possibly-longer `model` array —
// matching the `PanelMenuList.vue` `renderedItems()` pattern already
// approved for this exact class of bug during GAP-054's own fix loop.
import { createBaseDock } from "./BaseDock";

/** This dock's own direct-child item links, in DOM order. */
const ITEM_LINK_SELECTOR = ":scope > li > a";

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

    /** This dock's own rendered item links, in DOM order. */
    getItemLinks() {
      const ul = this.$refs.listEl;
      return ul ? Array.from(ul.querySelectorAll(ITEM_LINK_SELECTOR)) : [];
    },

    /** Items that actually render their own `<a>` (excludes hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
    renderedItems() {
      return this.model.filter((candidate) => candidate.visible !== false);
    },

    resolveOwnItem(target) {
      const links = this.getItemLinks();
      const index = links.indexOf(target);
      return index === -1 ? null : (this.renderedItems()[index] ?? null);
    },

    moveFocus(current, direction) {
      const enabled = this.renderedItems().filter((candidate) => !candidate.disabled);
      if (enabled.length === 0) return;
      const currentIndex = enabled.indexOf(current);
      const startIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
      const nextItem = enabled[nextIndex];
      const links = this.getItemLinks();
      const targetIndex = this.renderedItems().indexOf(nextItem);
      links[targetIndex]?.focus();
    },

    focusEdge(edge) {
      const enabled = this.renderedItems().filter((candidate) => !candidate.disabled);
      if (enabled.length === 0) return;
      const targetItem = edge === "first" ? enabled[0] : enabled[enabled.length - 1];
      const links = this.getItemLinks();
      const targetIndex = this.renderedItems().indexOf(targetItem);
      links[targetIndex]?.focus();
    },

    onKeydown(event) {
      const item = this.resolveOwnItem(event.target);
      if (!item) return;

      const horizontal = this.position === "top" || this.position === "bottom";
      const nextCode = horizontal ? "ArrowRight" : "ArrowDown";
      const prevCode = horizontal ? "ArrowLeft" : "ArrowUp";

      switch (event.code) {
        case nextCode:
          event.preventDefault();
          this.moveFocus(item, 1);
          break;
        case prevCode:
          event.preventDefault();
          this.moveFocus(item, -1);
          break;
        case "Home":
          event.preventDefault();
          this.focusEdge("first");
          break;
        case "End":
          event.preventDefault();
          this.focusEdge("last");
          break;
      }
    },
  },
};
</script>
