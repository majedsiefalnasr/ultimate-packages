<template>
  <nav :class="cx('root')">
    <ol :class="cx('list')">
      <template v-if="home && isVisible(home)">
        <li :class="cx('homeItem')">
          <a
            :href="home.routerLink ? undefined : home.url || '#'"
            :class="cx('itemLink')"
            :aria-label="homeAriaLabel"
            :aria-disabled="isDisabled(home) || undefined"
            :tabindex="isDisabled(home) ? -1 : 0"
            @click="onClick($event, home)"
          >
            <span v-if="home.icon" :class="[cx('itemIcon'), home.icon]" />
            <span v-if="home.label" :class="cx('itemLabel')">{{ home.label }}</span>
          </a>
        </li>
        <li v-if="model.length > 0" :class="cx('separator')" role="separator">›</li>
      </template>
      <template v-for="(item, i) in model" :key="(item.label || '') + i">
        <li v-if="isVisible(item)" :class="cx('item', { disabled: isDisabled(item) })">
          <a
            :href="item.routerLink ? undefined : item.url || '#'"
            :target="item.target"
            :class="cx('itemLink')"
            :aria-disabled="isDisabled(item) || undefined"
            :aria-current="i === lastIndex && isCurrent(item) ? 'page' : undefined"
            :tabindex="isDisabled(item) ? -1 : 0"
            :data-u-disabled="isDisabled(item)"
            @click="onClick($event, item)"
          >
            <span v-if="item.icon" :class="[cx('itemIcon'), item.icon]" />
            <span v-if="item.label" :class="cx('itemLabel')">{{ item.label }}</span>
          </a>
        </li>
        <li v-if="isVisible(item) && i !== lastIndex" :class="cx('separator')" role="separator">›</li>
      </template>
    </ol>
  </nav>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Breadcrumb`/`BreadcrumbItem`
// components (see `.vendor-extracted/vue/breadcrumb/Breadcrumb.vue`,
// `BreadcrumbItem.vue`). Renders a trail-of-links `<nav><ol>` — an
// optional `home` item followed by `model` entries, separated by a
// chevron `<li role="separator">` between each rendered item.
//
// Real PrimeVue's `Breadcrumb` (`extends BaseComponent`, no import of
// `primevue/menu`) is a standalone, independent component — it does NOT
// compose or wrap `Menu`; this adaptation follows that same independent
// shape, extending `createBaseComponent` directly (same tier `UMenu`
// itself uses via `createBaseMenu`), not `createBaseMenu`.
//
// Real upstream decomposes into `Breadcrumb.vue` (root) + a separate
// `BreadcrumbItem.vue` sub-component. This adaptation inlines item
// rendering into a single file instead, matching the decomposition-shape
// choice Ultimate's own Angular and React `UBreadcrumb` siblings already
// made for this same capability (both single-file, no separate item
// sub-component) — consistent cross-framework for this capability.
//
// Deliberately excludes upstream's passthrough (`pt`/`ptm`) system,
// per-item `templates`/slot projection (`item`/`separator`/`itemicon`
// custom templates), and separator-icon component — none of these appear
// in this task's scoped-down surface, matching the same reduction `UMenu`
// already applied to real PrimeVue's `Menu`.
//
// `aria-current="page"` is applied to the last rendered item's link
// whenever its `url` matches the current location path, adapted from
// real upstream's own `isCurrentUrl()` (`BreadcrumbItem.vue`) —
// `routerLink` (Vue Router's own `to`) is out of this project's smaller
// surface (real upstream checks both `to` and `url`; this adaptation
// checks `url` only, since `routerLink`-style navigation is not modeled
// here — matching the Angular/React siblings' own `isCurrent` intent
// adapted to Vue's own real `url`-only equivalent).
import { createBaseBreadcrumb } from "./BaseBreadcrumb";

export default {
  name: "UBreadcrumb",
  extends: createBaseBreadcrumb(),
  inheritAttrs: false,
  emits: ["item-select"],
  computed: {
    lastIndex() {
      return this.model.length - 1;
    },
  },
  methods: {
    isVisible(item) {
      return typeof item.visible === "function" ? item.visible() : item.visible !== false;
    },
    isDisabled(item) {
      return typeof item.disabled === "function" ? item.disabled() : !!item.disabled;
    },
    isCurrent(item) {
      if (!item.url) return false;
      return typeof window !== "undefined" && window.location.pathname === item.url;
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
