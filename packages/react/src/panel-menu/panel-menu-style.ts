import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-panelmenu { display: flex; flex-direction: column; }
.u-panelmenu-panel + .u-panelmenu-panel { margin-top: 2px; }
.u-panelmenu-header-content { display: flex; align-items: center; }
.u-panelmenu-header-action { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; width: 100%; }
.u-panelmenu-item[data-u-disabled="true"] > .u-panelmenu-header-content .u-panelmenu-header-action { cursor: default; pointer-events: none; opacity: 0.6; }
.u-panelmenu-submenu { margin: 0; padding-left: 1.25rem; list-style: none; display: none; }
.u-panelmenu-item[data-u-expanded="true"] > .u-panelmenu-submenu { display: block; }
.u-panelmenu-submenu-icon { transition: transform 0.2s; }
.u-panelmenu-item[data-u-expanded="true"] > .u-panelmenu-header-content .u-panelmenu-submenu-icon { transform: rotate(90deg); }
`;

const classes = {
  root: "u-panelmenu u-component",
  panel: "u-panelmenu-panel",
  headerContent: "u-panelmenu-header-content",
  headerAction: "u-panelmenu-header-action",
  headerIcon: "u-panelmenu-header-icon",
  headerLabel: "u-panelmenu-header-label",
  menuitem: (params: { disabled?: boolean; expanded?: boolean } = {}) => [
    "u-panelmenu-item",
    { "u-panelmenu-item-disabled": params.disabled, "u-panelmenu-item-expanded": params.expanded },
  ],
  submenu: "u-panelmenu-submenu",
  submenuIcon: "u-panelmenu-submenu-icon",
};

export const panelMenuStyleModule: StyleModule = { css, classes };
