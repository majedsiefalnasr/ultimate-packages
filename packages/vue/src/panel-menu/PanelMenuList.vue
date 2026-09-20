<template>
  <ul :class="cx('submenu')" role="tree">
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
import { createBaseComponent } from "@ultimate/vue-core";
import { panelMenuStyleModule } from "./panel-menu-style";

export default {
  name: "UPanelMenuList",
  extends: createBaseComponent({ componentName: "panel-menu", styleModule: panelMenuStyleModule }),
  props: {
    items: { type: Array, default: () => [] },
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
    onHeaderClick(event, item, index) {
      if (this.isDisabled(item)) {
        event.preventDefault();
        return;
      }
      if (this.hasItems(item)) {
        event.preventDefault();
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
