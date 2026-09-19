/**
 * Ultimate-owned adaptation of PrimeNG's `MenuBarStyle` (see
 * `.vendor-extracted/ng/menubar/style/menubarstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/menubar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `breadcrumbStyleModule`).
 */
const css = /*css*/ `
.u-menubar { display: flex; align-items: center; }
.u-menubar-root-list { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; position: relative; }
.u-menubar-item { position: relative; }
.u-menubar-item-content { display: flex; align-items: center; }
.u-menubar-item-link { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; }
.u-menubar-item[data-u-disabled="true"] .u-menubar-item-link { cursor: default; pointer-events: none; opacity: 0.6; }
.u-menubar-submenu { position: absolute; top: 100%; left: 0; margin: 0; padding: 0; list-style: none; z-index: 1; min-width: 12rem; display: none; }
.u-menubar-item[data-u-open="true"] > .u-menubar-submenu { display: block; }
.u-menubar-submenu .u-menubar-submenu { top: 0; left: 100%; }
.u-menubar-separator { list-style: none; }
`;

/** Params `UMenubar` passes into `cx('item', params)`. */
export interface MenubarClassesParams {
  disabled?: boolean;
  open?: boolean;
  focused?: boolean;
}

const classes = {
  root: "u-menubar u-component",
  rootList: "u-menubar-root-list",
  submenu: "u-menubar-submenu",
  item: (params: MenubarClassesParams = {}) => {
    const { disabled, open, focused } = params;
    return [
      "u-menubar-item",
      {
        "u-menubar-item-disabled": disabled,
        "u-menubar-item-open": open,
        "u-focus": focused,
      },
    ];
  },
  itemContent: "u-menubar-item-content",
  itemLink: "u-menubar-item-link",
  itemIcon: "u-menubar-item-icon",
  itemLabel: "u-menubar-item-label",
  submenuIcon: "u-menubar-submenu-icon",
  separator: "u-menubar-separator",
};

export const menubarStyleModule = { css, classes };
