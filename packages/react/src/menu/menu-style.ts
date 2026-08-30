import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-menu-overlay { position: absolute; top: -9999px; left: -9999px; }
.u-menu ul { margin: 0; padding: 0; list-style: none; }
.u-menu .u-menuitem-link { cursor: pointer; display: flex; align-items: center; text-decoration: none; }
`;

const classes = {
  root: (params: { popup?: boolean } = {}) => ["u-menu u-component", { "u-menu-overlay": params.popup }],
  menu: "u-menu-list",
  menuitem: (params: { focused?: boolean } = {}) => ["u-menuitem", { "u-focus": params.focused }],
  content: "u-menuitem-content",
  action: "u-menuitem-link",
  label: "u-menuitem-text",
  icon: "u-menuitem-icon",
  separator: "u-menu-separator",
};

export const menuStyleModule: StyleModule = { css, classes };
