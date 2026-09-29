<template>
  <nav :class="cx('root')" :aria-label="ariaLabel">
    <ul ref="listEl" :class="cx('rootList')" role="menubar" @keydown="onKeydown">
      <template v-for="(item, i) in model" :key="(item.label || '') + i">
        <li
          v-if="isVisible(item)"
          :class="cx('item', { disabled: isDisabled(item), open: isOpen(item) })"
          role="none"
          :data-u-disabled="isDisabled(item)"
          :data-u-open="isOpen(item)"
          @mouseenter="onMouseEnter(item)"
        >
          <div :class="cx('itemContent')">
            <a
              role="menuitem"
              :href="item.routerLink ? undefined : item.url || '#'"
              :class="cx('itemLink')"
              :aria-haspopup="hasColumns(item) ? 'menu' : undefined"
              :aria-expanded="hasColumns(item) ? isOpen(item) : undefined"
              :aria-disabled="isDisabled(item) || undefined"
              :tabindex="isDisabled(item) ? -1 : 0"
              @click="onItemClick($event, item)"
            >
              <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
              <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
              <span v-if="hasColumns(item)" :class="cx('submenuIcon')" aria-hidden="true">▾</span>
            </a>
          </div>
          <div v-if="hasColumns(item)" :class="cx('overlay')">
            <div :class="cx('grid')">
              <div v-for="(column, ci) in item.items" :key="ci" :class="cx('column')">
                <UMegaMenuColumnGroup
                  v-for="(group, gi) in column"
                  :key="(group.label || '') + gi"
                  :group="group"
                  @item-select="handleColumnItemSelect"
                />
              </div>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `MegaMenu` component (see
// `.vendor-extracted/vue/megamenu/MegaMenu.vue`, `MegaMenuSub.vue`).
// Renders a horizontal bar of top-level items; a root item with `items`
// (a 2D column grid — array of columns, each column an array of submenu
// groups) opens a multi-column overlay grid on hover/click, each column
// stacking one or more labeled groups (`UMegaMenuColumnGroup`) of flat
// leaf items — MegaMenu's genuinely distinguishing structural trait vs.
// Menubar/TieredMenu's single-column nested popups.
//
// Real PrimeVue's `MegaMenu` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component — it does NOT
// compose or wrap `Menu`. This adaptation follows that same independent
// shape. Real upstream's overlay grid renders inline (a plain child `div`
// positioned via CSS, not `Portal`/`Teleport`-based) — verified this
// task's Step 1 (`MegaMenuSub.vue`'s own `.u-megamenu-overlay` sibling has
// no `<Portal>` wrapper) — matching the same no-portal choice this task's
// Angular/React `UMegaMenu` siblings already made for this capability.
//
// Deliberately excludes upstream's passthrough system, mobile-breakpoint
// hamburger-menu collapse (`orientation`/`breakpoint`/`mobileActive`), and
// search-by-typing machinery — none of these appear in this task's
// scoped-down surface, matching the same reduction `UMenu` already applied
// to real PrimeVue's `Menu`.
//
// Carries real ARIA roles (`menubar`/`menu`/`menuitem`, already present
// pre-task) and roving-focus keyboard navigation (GAP-054, Spec §5.3),
// matching the shape already established by this component's Angular/React
// siblings (`packages/ng/src/mega-menu/mega-menu.ts`,
// `packages/react/src/mega-menu/mega-menu.tsx`). MegaMenu is a genuine hard
// 2-level structure (confirmed by `MegaMenuColumnGroup.vue`'s own flat,
// non-recursive leaf-item list) — so Escape handling needs only a single
// `openItem` check at this root level, not a recursive per-level chain.
// ArrowRight/ArrowLeft move focus horizontally among root items; Enter/Space
// on a column-having item opens its overlay and moves focus to the overlay's
// first leaf item; Escape closes the open overlay (wherever focus currently
// is inside it) and returns focus to its own root trigger. Disabled items
// are always skipped in roving focus (`:tabindex="isDisabled(item) ? -1 :
// 0"`, already present above).
//
// The `@keydown` handler is bound on this root `<ul>` (via the `listEl`
// template ref) — never on an individual root item's own `<a>` — for the
// same reason established for Menubar/TieredMenu: a root item's own overlay
// content is a DOM *sibling* of that item's own `<a>` (both live inside the
// same `<li>`), so a keydown fired from inside the overlay could never
// bubble through the `<a>` to reach a root-level listener bound there.
// Binding on the root `<ul>` — a genuine DOM ancestor of the entire overlay
// — lets Escape (and any other key) reach this handler via bubbling
// regardless of how deep inside the overlay focus is. Confirmed
// independently for this component: no `<Teleport>` is used anywhere in
// `MegaMenu.vue`/`MegaMenuColumnGroup.vue` — the overlay renders as plain
// in-tree DOM, CSS-positioned — so this ancestor relationship holds with no
// portal escape hatch to account for.
import { createBaseMegaMenu } from "./BaseMegaMenu";
import MegaMenuColumnGroup from "./MegaMenuColumnGroup.vue";

/** Selector for the root list's own direct-child item trigger links. */
const ROOT_ITEM_LINK_SELECTOR = ":scope > li > .u-megamenu-item-content > a";

export default {
  name: "UMegaMenu",
  extends: createBaseMegaMenu(),
  inheritAttrs: false,
  emits: ["item-select"],
  components: { UMegaMenuColumnGroup: MegaMenuColumnGroup },
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
    hasColumns(item) {
      return !!item.items && item.items.length > 0;
    },
    isOpen(item) {
      return this.openItem === item;
    },
    onMouseEnter(item) {
      if (this.hasColumns(item) && !this.isDisabled(item)) {
        this.openItem = item;
      }
    },
    onItemClick(event, item) {
      if (this.isDisabled(item)) {
        event.preventDefault();
        return;
      }
      if (this.hasColumns(item)) {
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
    handleColumnItemSelect(event) {
      this.openItem = null;
      this.$emit("item-select", event);
    },

    /** Direct-child item trigger links of the root list only (excludes overlay leaf items). */
    getRootLinks() {
      const ul = this.$refs.listEl;
      return ul ? Array.from(ul.querySelectorAll(ROOT_ITEM_LINK_SELECTOR)) : [];
    },

    /** Root items that actually render their own direct-child `<a>` (excludes hidden items), in the same order `getRootLinks()` returns their DOM nodes. */
    renderedRootItems() {
      return this.model.filter((candidate) => this.isVisible(candidate));
    },

    /** Resolves the root item this event's target `<a>` belongs to, or `null` if it isn't one of this root list's own direct-child item links. */
    resolveOwnItem(target) {
      const links = this.getRootLinks();
      const index = links.indexOf(target);
      return index === -1 ? null : (this.renderedRootItems()[index] ?? null);
    },

    enabledRootItems() {
      return this.model.filter((candidate) => this.isVisible(candidate) && !this.isDisabled(candidate));
    },

    moveFocus(current, direction) {
      const enabled = this.enabledRootItems();
      if (enabled.length === 0) return;
      const currentIndex = enabled.indexOf(current);
      const startIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
      const nextItem = enabled[nextIndex];
      const links = this.getRootLinks();
      const targetIndex = this.renderedRootItems().indexOf(nextItem);
      links[targetIndex]?.focus();
    },

    focusFirstOverlayItem() {
      this.$nextTick(() => {
        const ul = this.$refs.listEl;
        const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
        const firstLeafLink = openLi?.querySelector(".u-megamenu-submenu a");
        firstLeafLink?.focus();
      });
    },

    closeAndRefocus(item) {
      this.openItem = null;
      const links = this.getRootLinks();
      const targetIndex = this.renderedRootItems().indexOf(item);
      links[targetIndex]?.focus();
    },

    /**
     * Root-level keydown handling. Escape is handled unconditionally here —
     * regardless of whether the event target is a root item's own `<a>` or a
     * leaf item deep inside the open overlay — since MegaMenu's hard
     * 2-level structure means this root level's own `openItem` is always
     * the single, innermost thing to close; there is no further-up level
     * beyond it. ArrowRight/ArrowLeft and Enter/Space only act when the
     * event target resolves to one of this root list's own item `<a>`s (not
     * a leaf item inside an overlay, which is handled by
     * `MegaMenuColumnGroup.vue` itself).
     */
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
      if (!item) return; // Not a root item's own trigger — nothing else to do at this level.

      switch (event.code) {
        case "ArrowRight":
          event.preventDefault();
          this.moveFocus(item, 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          this.moveFocus(item, -1);
          break;
        case "Enter":
        case "Space":
          if (this.hasColumns(item) && !this.isDisabled(item)) {
            event.preventDefault();
            this.openItem = item;
            this.focusFirstOverlayItem();
          }
          break;
      }
    },
  },
};
</script>
