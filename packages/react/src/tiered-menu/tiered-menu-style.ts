import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-tieredmenu { display: inline-block; }
.u-tieredmenu-overlay { position: absolute; top: -9999px; left: -9999px; }
.u-tieredmenu-root-list, .u-tieredmenu-submenu { margin: 0; padding: 0; list-style: none; }
.u-tieredmenu-item { position: relative; }
.u-tieredmenu-content { display: flex; align-items: center; }
.u-tieredmenu-action { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; width: 100%; }
.u-tieredmenu-item[data-u-disabled="true"] .u-tieredmenu-action { cursor: default; pointer-events: none; opacity: 0.6; }
.u-tieredmenu-submenu { position: absolute; top: 0; left: 100%; min-width: 12rem; z-index: 1; display: none; }
.u-tieredmenu-item[data-u-open="true"] > .u-tieredmenu-submenu { display: block; }
.u-tieredmenu-separator { list-style: none; }
`;

const classes = {
  root: (params: { popup?: boolean } = {}) => ["u-tieredmenu u-component", { "u-tieredmenu-overlay": params.popup }],
  rootList: "u-tieredmenu-root-list",
  submenu: "u-tieredmenu-submenu",
  menuitem: (params: { disabled?: boolean; open?: boolean } = {}) => [
    "u-tieredmenu-item",
    { "u-tieredmenu-item-disabled": params.disabled, "u-tieredmenu-item-open": params.open },
  ],
  content: "u-tieredmenu-content",
  action: "u-tieredmenu-action",
  icon: "u-tieredmenu-icon",
  label: "u-tieredmenu-label",
  submenuIcon: "u-tieredmenu-submenu-icon",
  separator: "u-tieredmenu-separator",
};

export const tieredMenuStyleModule: StyleModule = { css, classes };
