/**
 * Ultimate-owned adaptation of PrimeNG's `PanelMenuStyle` (see
 * `.vendor-extracted/ng/panelmenu/style/panelmenustyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/panel-menu` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `breadcrumbStyleModule`/
 * `menubarStyleModule`/`tieredMenuStyleModule`).
 */
const css = /*css*/ `
.u-panelmenu { display: flex; flex-direction: column; }
.u-panelmenu-panel + .u-panelmenu-panel { margin-top: 2px; }
.u-panelmenu-header-content { display: flex; align-items: center; }
.u-panelmenu-header-link { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; width: 100%; }
.u-panelmenu-item[data-u-disabled="true"] > .u-panelmenu-header-content .u-panelmenu-header-link { cursor: default; pointer-events: none; opacity: 0.6; }
.u-panelmenu-submenu { margin: 0; padding-left: 1.25rem; list-style: none; display: none; }
.u-panelmenu-item[data-u-expanded="true"] > .u-panelmenu-submenu { display: block; }
.u-panelmenu-submenu-icon { transition: transform 0.2s; }
.u-panelmenu-item[data-u-expanded="true"] > .u-panelmenu-header-content .u-panelmenu-submenu-icon { transform: rotate(90deg); }
`;

/** Params `UPanelMenu` passes into `cx('item', params)`. */
export interface PanelMenuClassesParams {
  disabled?: boolean;
  expanded?: boolean;
}

const classes = {
  root: "u-panelmenu u-component",
  panel: "u-panelmenu-panel",
  headerContent: "u-panelmenu-header-content",
  headerLink: "u-panelmenu-header-link",
  headerIcon: "u-panelmenu-header-icon",
  headerLabel: "u-panelmenu-header-label",
  item: (params: PanelMenuClassesParams = {}) => {
    const { disabled, expanded } = params;
    return ["u-panelmenu-item", { "u-panelmenu-item-disabled": disabled, "u-panelmenu-item-expanded": expanded }];
  },
  submenu: "u-panelmenu-submenu",
  submenuIcon: "u-panelmenu-submenu-icon",
};

export const panelMenuStyleModule = { css, classes };
