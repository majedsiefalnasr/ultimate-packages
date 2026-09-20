import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-megamenu { display: flex; align-items: center; }
.u-megamenu-root-list { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; position: relative; }
.u-megamenu-item { position: relative; }
.u-megamenu-content { display: flex; align-items: center; }
.u-megamenu-action { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; }
.u-megamenu-item[data-u-disabled="true"] .u-megamenu-action { cursor: default; pointer-events: none; opacity: 0.6; }
.u-megamenu-overlay { position: absolute; top: 100%; left: 0; z-index: 1; display: none; }
.u-megamenu-item[data-u-open="true"] > .u-megamenu-overlay { display: block; }
.u-megamenu-grid { display: flex; flex-direction: row; }
.u-megamenu-column { display: flex; flex-direction: column; }
.u-megamenu-submenu-label { font-weight: 600; }
.u-megamenu-submenu { margin: 0; padding: 0; list-style: none; }
`;

const classes = {
  root: "u-megamenu u-component",
  rootList: "u-megamenu-root-list",
  menuitem: (params: { disabled?: boolean; open?: boolean } = {}) => [
    "u-megamenu-item",
    { "u-megamenu-item-disabled": params.disabled, "u-megamenu-item-open": params.open },
  ],
  content: "u-megamenu-content",
  action: "u-megamenu-action",
  icon: "u-megamenu-icon",
  label: "u-megamenu-label",
  submenuIcon: "u-megamenu-submenu-icon",
  overlay: "u-megamenu-overlay",
  grid: "u-megamenu-grid",
  column: "u-megamenu-column",
  submenuLabel: "u-megamenu-submenu-label",
  submenu: "u-megamenu-submenu",
};

export const megaMenuStyleModule: StyleModule = { css, classes };
