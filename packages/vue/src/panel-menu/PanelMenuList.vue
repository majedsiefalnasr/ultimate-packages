<template>
  <ul ref="listEl" :class="cx('submenu')" role="tree" @keydown="onKeydown">
    <template v-for="(item, i) in items" :key="(item.label || '') + i">
      <li
        v-if="isVisible(item)"
        :class="cx('item', { disabled: isDisabled(item), expanded: isExpanded(item, i) })"
        role="treeitem"
        :data-u-disabled="isDisabled(item)"
        :data-u-expanded="isExpanded(item, i)"
        :aria-expanded="hasItems(item) ? isExpanded(item, i) : undefined"
      >
        <div :class="cx('headerContent')">
          <a
            :href="item.routerLink ? undefined : item.url || '#'"
            :target="item.target"
            :class="cx('headerLink')"
            :aria-disabled="isDisabled(item) || undefined"
            :tabindex="isDisabled(item) ? -1 : 0"
            @click="onHeaderClick($event, item, i)"
          >
            <span v-if="hasItems(item)" :class="cx('submenuIcon')" aria-hidden="true">▸</span>
            <span v-if="item.icon" :class="[cx('headerIcon'), item.icon]" />
            <span v-if="item.label" :class="cx('headerLabel')">{{ item.label }}</span>
          </a>
        </div>
        <UPanelMenuList
          v-if="hasItems(item) && isExpanded(item, i)"
          :items="item.items"
          :node-key="nodeKey ? `${nodeKey}_${i}` : `${i}`"
          :expanded-items="expandedItems"
          :multiple="multiple"
          @item-select="$emit('item-select', $event)"
        />
      </li>
    </template>
  </ul>
</template>

<script>
// Recursive, expand-in-place submenu renderer for `UPanelMenu`, adapted
// from real PrimeVue's `PanelMenuSub`/`PanelMenuList`
// (`.vendor-extracted/vue/panelmenu/PanelMenuSub.vue`,
// `PanelMenuList.vue`) — same recursive-self-reference shape (each group
// item's own `items` render a nested `UPanelMenuList`), scoped down to
// this task's smaller surface (click-driven expand/collapse only, no
// keyboard roving-focus/search-by-typing machinery, matching `UMenu`'s
// own established reduction pattern).
//
// Unlike `UMenubarSub`/`UTieredMenuSub` (popup overlay submenus), this is
// PanelMenu's real distinguishing structural trait: an accordion —
// children expand in-place (indented, always in normal document flow)
// rather than opening a positioned popup. Expand/collapse state lives in
// a single reactive `Set<string>` of position-derived node keys (e.g.
// `"0"`, `"0_1"`), owned by the root `UPanelMenu` and threaded down by
// reference through every recursion level, alongside a `nodeKey` prop
// each recursion level extends with its own item's index.
//
// Real-environment finding made while writing this task's own tests: an
// object-identity-keyed `Set<UMenuItem>` (the shape this capability's
// Angular `UPanelMenuList` sibling correctly uses, since Angular's
// `@Input()` passes object references through unchanged) does NOT work in
// Vue — every `props`-received array/object is wrapped in a fresh
// reactive Proxy on each access, so `item` read from a `v-for` over a
// `props.items` array is a different Proxy identity than the same
// logical item read anywhere else (verified directly: `model[1] ===
// vm.model[1]` is `false` for a plain object model). A `Set` keyed by raw
// item references therefore silently never matches on lookup after the
// first render. Real PrimeVue's own `PanelMenu` avoids this exact problem
// by keying its `expandedKeys` a plain per-item `key`/an index-derived
// key, never a raw item reference (verified this task's Step 1,
// `PanelMenu.vue`'s own `isItemActive`/`expandedKeys[key]` lookups) — the
// same position-derived string-key strategy adopted here.
//
// Keyboard navigation (GAP-054, Spec §5.3) is scoped to this level's own
// visible siblings only, matching Menubar/TieredMenu/MegaMenu's own
// established per-level restriction: ArrowDown/ArrowUp move focus between
// this level's own non-disabled items (wrapping at the ends); Enter/Space
// on a group item toggles its expand/collapse in place via the same
// `toggleExpanded` the existing click handler already uses, without
// moving focus off the header (there is no popup/overlay to move focus
// into — expansion just reveals this item's own nested `UPanelMenuList`,
// which is this item's own DOM sibling, not this level's own list).
//
// No Escape handling is added: PanelMenu is an accordion with no overlay
// to escape from (independently confirmed for this component: no
// `<Teleport>`/portal usage anywhere in `PanelMenu.vue`/`PanelMenuList.vue`
// — nested levels render as plain in-tree DOM, indented via CSS, always in
// normal document flow), so "close the innermost open thing" has no
// meaning here the way it does for Menubar/TieredMenu/MegaMenu's popups —
// matching this capability's already-approved Angular/React siblings
// (`packages/ng/src/panel-menu/panel-menu-list.ts`,
// `packages/react/src/panel-menu/panel-menu-list.tsx`) and the Plan's own
// Review Focus text, which pointedly omits PanelMenu from its
// Escape-requirement enumeration.
//
// `@keydown` is bound on this level's own `<ul>` (via the `listEl`
// template ref), never on an individual header `<a>` — for the same
// reason already established for Menubar/TieredMenu/MegaMenu: a nested
// `UPanelMenuList` rendered for an expanded group item is a DOM *sibling*
// of that item's own `<a>` (both live inside the same `<li>`), so a
// keydown fired from inside an expanded nested list would never bubble
// through its parent's own `<a>` — only through this level's own `<ul>`,
// which genuinely is a DOM ancestor of every level nested within it.
// Because this listener also receives bubbled events from deeper-nested
// levels, movement/toggle keys first resolve which item (if any) at
// *this* level the event's real target belongs to, and no-op (letting the
// event keep bubbling) for anything that isn't a direct-child header `<a>`
// of this level's own `<ul>` — so a deeper level's own listener (the
// nearer ancestor in the bubble path) always handles its own items first,
// never this one.
import { createBaseComponent } from "@ultimate/vue-core";
import { panelMenuStyleModule } from "./panel-menu-style";

/** Selector for this level's own direct-child header links (excludes nested levels' own headers). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-panelmenu-header-content > a";

export default {
  name: "UPanelMenuList",
  extends: createBaseComponent({ componentName: "panel-menu", styleModule: panelMenuStyleModule }),
  props: {
    items: {
      type: /** @type {import('vue').PropType<readonly unknown[]>} */ (Array),
      default: () => [],
    },
    nodeKey: { type: String, default: "" },
    expandedItems: { type: Object, required: true },
    multiple: { type: Boolean, default: false },
  },
  emits: ["item-select"],
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
    keyFor(index) {
      return this.nodeKey ? `${this.nodeKey}_${index}` : `${index}`;
    },
    isExpanded(item, index) {
      return this.expandedItems.has(this.keyFor(index));
    },

    /** Shared expand/collapse toggle used by both header click and Enter/Space keydown, preserving the existing per-level sibling-exclusivity `Set` mechanism (KEEP CURRENT BEHAVIOR). */
    toggleExpanded(index) {
      const key = this.keyFor(index);
      if (this.expandedItems.has(key)) {
        this.expandedItems.delete(key);
      } else {
        if (!this.multiple) {
          for (let siblingIndex = 0; siblingIndex < this.items.length; siblingIndex++) {
            this.expandedItems.delete(this.keyFor(siblingIndex));
          }
        }
        this.expandedItems.add(key);
      }
    },

    onHeaderClick(event, item, index) {
      if (this.isDisabled(item)) {
        event.preventDefault();
        return;
      }
      if (this.hasItems(item)) {
        event.preventDefault();
        this.toggleExpanded(index);
        return;
      }
      if (!item.url && !item.routerLink) {
        event.preventDefault();
      }
      if (item.command) item.command({ originalEvent: event, item });
      this.$emit("item-select", { originalEvent: event, item });
    },

    /** Direct-child header links for this level only (excludes nested levels' own headers). */
    getItemLinks() {
      const ul = this.$refs.listEl;
      return ul ? Array.from(ul.querySelectorAll(ITEM_LINK_SELECTOR)) : [];
    },

    /** Items that actually render their own direct-child header `<a>` (excludes hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
    renderedItems() {
      return this.items.filter((candidate) => this.isVisible(candidate));
    },

    /**
     * Resolves the item this event's target `<a>` belongs to, but only if
     * that `<a>` is a direct-child header link of *this* level's own `<ul>`
     * (not a descendant belonging to a deeper-nested level). Returns `null`
     * for any event this level does not own, so the caller can leave it
     * bubbling toward the ancestor level that does — though in practice a
     * deeper-nested level's own listener always claims a bubbled event first
     * (it is the nearer ancestor in the bubble path).
     */
    resolveOwnItem(target) {
      const links = this.getItemLinks();
      const index = links.indexOf(target);
      return index === -1 ? null : (this.renderedItems()[index] ?? null);
    },

    moveFocus(current, direction) {
      const enabled = this.items.filter(
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

    /**
     * Delegated roving-focus keyboard handling for this level's own visible
     * items, bound on this level's own `<ul>` (see the class doc comment
     * for why). ArrowDown/ArrowUp move focus between this level's own
     * non-disabled siblings (wrapping at the ends). Enter/Space on a group
     * item toggles its expand/collapse in place, reusing the same
     * `toggleExpanded` the existing click handler already uses. No Escape
     * handling: there is no overlay/popup at any level of this accordion
     * to close (see class doc comment).
     */
    onKeydown(event) {
      const item = this.resolveOwnItem(event.target);
      if (!item) return; // Not this level's own header link — let it keep bubbling.

      const index = this.items.indexOf(item);

      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          this.moveFocus(item, 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          this.moveFocus(item, -1);
          break;
        case "Enter":
        case "Space":
          if (this.hasItems(item) && !this.isDisabled(item)) {
            event.preventDefault();
            this.toggleExpanded(index);
          }
          break;
      }
    },
  },
};
</script>
