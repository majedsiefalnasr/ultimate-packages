/**
 * Ultimate-owned adaptation of PrimeNG's `MegaMenuStyle` (see
 * `.vendor-extracted/ng/megamenu/style/megamenustyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/mega-menu` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `breadcrumbStyleModule`/
 * `menubarStyleModule`).
 */
const css = /*css*/ `
.u-megamenu { display: flex; align-items: center; }
.u-megamenu-root-list { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; position: relative; }
.u-megamenu-item { position: relative; }
.u-megamenu-item-content { display: flex; align-items: center; }
.u-megamenu-item-link { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; }
.u-megamenu-item[data-u-disabled="true"] .u-megamenu-item-link { cursor: default; pointer-events: none; opacity: 0.6; }
.u-megamenu-overlay { position: absolute; top: 100%; left: 0; z-index: 1; display: none; }
.u-megamenu-item[data-u-open="true"] > .u-megamenu-overlay { display: block; }
.u-megamenu-grid { display: flex; flex-direction: row; }
.u-megamenu-column { display: flex; flex-direction: column; }
.u-megamenu-submenu-label { font-weight: 600; }
.u-megamenu-submenu { margin: 0; padding: 0; list-style: none; }
`;

/** Params `UMegaMenu` passes into `cx('item', params)`. */
export interface MegaMenuClassesParams {
  disabled?: boolean;
  open?: boolean;
}

const classes = {
  root: "u-megamenu u-component",
  rootList: "u-megamenu-root-list",
  item: (params: MegaMenuClassesParams = {}) => {
    const { disabled, open } = params;
    return ["u-megamenu-item", { "u-megamenu-item-disabled": disabled, "u-megamenu-item-open": open }];
  },
  itemContent: "u-megamenu-item-content",
  itemLink: "u-megamenu-item-link",
  itemIcon: "u-megamenu-item-icon",
  itemLabel: "u-megamenu-item-label",
  submenuIcon: "u-megamenu-submenu-icon",
  overlay: "u-megamenu-overlay",
  grid: "u-megamenu-grid",
  column: "u-megamenu-column",
  submenuLabel: "u-megamenu-submenu-label",
  submenu: "u-megamenu-submenu",
};

export const megaMenuStyleModule = { css, classes };
