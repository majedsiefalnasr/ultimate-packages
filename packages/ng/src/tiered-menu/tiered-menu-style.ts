/**
 * Ultimate-owned adaptation of PrimeNG's `TieredMenuStyle` (see
 * `.vendor-extracted/ng/tieredmenu/style/tieredmenustyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/tiered-menu` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `breadcrumbStyleModule`/
 * `menubarStyleModule`).
 */
const css = /*css*/ `
.u-tieredmenu { display: inline-block; }
.u-tieredmenu-overlay { position: absolute; top: -9999px; left: -9999px; }
.u-tieredmenu-root-list, .u-tieredmenu-submenu { margin: 0; padding: 0; list-style: none; }
.u-tieredmenu-item { position: relative; }
.u-tieredmenu-item-content { display: flex; align-items: center; }
.u-tieredmenu-item-link { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; width: 100%; }
.u-tieredmenu-item[data-u-disabled="true"] .u-tieredmenu-item-link { cursor: default; pointer-events: none; opacity: 0.6; }
.u-tieredmenu-submenu { position: absolute; top: 0; left: 100%; min-width: 12rem; z-index: 1; display: none; }
.u-tieredmenu-item[data-u-open="true"] > .u-tieredmenu-submenu { display: block; }
.u-tieredmenu-separator { list-style: none; }
`;

/** Params `UTieredMenu` passes into `cx('item', params)`. */
export interface TieredMenuClassesParams {
  disabled?: boolean;
  open?: boolean;
}

const classes = {
  root: (params: { popup?: boolean } = {}) => ["u-tieredmenu u-component", { "u-tieredmenu-overlay": params.popup }],
  rootList: "u-tieredmenu-root-list",
  submenu: "u-tieredmenu-submenu",
  item: (params: TieredMenuClassesParams = {}) => {
    const { disabled, open } = params;
    return ["u-tieredmenu-item", { "u-tieredmenu-item-disabled": disabled, "u-tieredmenu-item-open": open }];
  },
  itemContent: "u-tieredmenu-item-content",
  itemLink: "u-tieredmenu-item-link",
  itemIcon: "u-tieredmenu-item-icon",
  itemLabel: "u-tieredmenu-item-label",
  submenuIcon: "u-tieredmenu-submenu-icon",
  separator: "u-tieredmenu-separator",
};

export const tieredMenuStyleModule = { css, classes };
