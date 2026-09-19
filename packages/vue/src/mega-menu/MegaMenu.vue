<template>
  <nav :class="cx('root')" :aria-label="ariaLabel">
    <ul :class="cx('rootList')" role="menubar">
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
// keyboard roving-focus/search-by-typing machinery — none of these appear
// in this task's scoped-down surface, matching the same reduction `UMenu`
// already applied to real PrimeVue's `Menu`.
import { createBaseMegaMenu } from "./BaseMegaMenu";
import MegaMenuColumnGroup from "./MegaMenuColumnGroup.vue";

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
  },
};
</script>
