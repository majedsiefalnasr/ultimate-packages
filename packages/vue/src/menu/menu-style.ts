import type { StyleModule } from "@ultimate/vue-core";
import { style as menuCss } from "@ultimate/uix-styles/menu";

/**
 * Implementation-time verification finding (this task's Step 2, the same
 * mismatch already found for `@ultimate/uix-styles/button` in Task 17,
 * `.../tooltip` in Task 18, `.../checkbox` in Task 19, and `.../dialog` in
 * Task 20): the brief's draft assumed `@ultimate/uix-styles/menu` exports a
 * `menuStyle` object already shaped as `StyleModule`'s `{ css, classes }`
 * contract. The real file (`packages/uix-styles/src/menu/index.ts`) only
 * exports a plain `style: string` — raw CSS with `dt()` token references, no
 * `classes` resolver map. `StyleModule` (`packages/vue-core/src/base/base-component.ts`)
 * requires both `css` and a `classes` map of per-slot resolvers. The
 * `classes` map below is authored locally here, following the same
 * adaptation already established for button/tooltip/checkbox/dialog.
 *
 * Slot names cross-checked against the real CSS selectors in
 * `packages/uix-styles/src/menu/index.ts` and against real
 * `.vendor-extracted/vue/menu/Menu.vue`/`Menuitem.vue`'s own `cx(...)` call
 * sites read during this task's Step 1: 'root' (`.u-menu`), 'list'
 * (`.u-menu-list`), 'item' (`.u-menu-item`, referenced only via
 * `.u-menu-item.p-focus`/`.u-menu-item:not(.p-disabled)` compound selectors
 * in the real CSS, not standalone), 'itemContent' (`.u-menu-item-content`),
 * 'itemLink' (`.u-menu-item-link`), 'itemLabel' (`.u-menu-item-label`),
 * 'itemIcon' (`.u-menu-item-icon`), 'separator' (`.u-menu-separator`),
 * 'submenuLabel' (`.u-menu-submenu-label` — unused by this task's flat,
 * non-nested `model` support; kept for CSS-selector completeness only,
 * spec §15's submenu-out-of-scope note applies the same as it did to
 * Dialog's maximizable exclusion). `focus`/`itemContent`-vs-`item` styling
 * (real upstream applies `.p-focus` to the outer `<li>`) is preserved via
 * the `item()` resolver's `focused` param below.
 */
const css = /*css*/ `
    ${menuCss}
`;

/** Params `UMenu`/`Menuitem` pass into `cx('item', params)` — see `createBaseComponent`'s `cx()`. */
export interface MenuItemClassesParams {
  focused?: boolean;
  disabled?: boolean;
}

const classes = {
  root: "u-menu",
  list: "u-menu-list",
  item: (params: MenuItemClassesParams = {}) => {
    const { focused, disabled } = params;
    return ["u-menu-item", { "p-focus": Boolean(focused), "p-disabled": Boolean(disabled) }];
  },
  itemContent: "u-menu-item-content",
  itemLink: "u-menu-item-link",
  itemLabel: "u-menu-item-label",
  itemIcon: "u-menu-item-icon",
  separator: "u-menu-separator",
  submenuLabel: "u-menu-submenu-label",
};

export const menuStyleModule: StyleModule = { css, classes };
