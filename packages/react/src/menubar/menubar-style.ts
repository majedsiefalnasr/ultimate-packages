import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-menubar { display: flex; align-items: center; }
.u-menubar-root-list { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; position: relative; }
.u-menubar-item { position: relative; }
.u-menubar-content { display: flex; align-items: center; }
.u-menubar-action { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; }
.u-menubar-item[data-u-disabled="true"] .u-menubar-action { cursor: default; pointer-events: none; opacity: 0.6; }
.u-menubar-submenu { position: absolute; top: 100%; left: 0; margin: 0; padding: 0; list-style: none; z-index: 1; min-width: 12rem; display: none; }
.u-menubar-item[data-u-open="true"] > .u-menubar-submenu { display: block; }
.u-menubar-submenu .u-menubar-submenu { top: 0; left: 100%; }
.u-menubar-separator { list-style: none; }
`;

const classes = {
  root: "u-menubar u-component",
  rootList: "u-menubar-root-list",
  submenu: "u-menubar-submenu",
  menuitem: (params: { disabled?: boolean; open?: boolean } = {}) => [
    "u-menubar-item",
    { "u-menubar-item-disabled": params.disabled, "u-menubar-item-open": params.open },
  ],
  content: "u-menubar-content",
  action: "u-menubar-action",
  icon: "u-menubar-icon",
  label: "u-menubar-label",
  submenuIcon: "u-menubar-submenu-icon",
  separator: "u-menubar-separator",
};

export const menubarStyleModule: StyleModule = { css, classes };
