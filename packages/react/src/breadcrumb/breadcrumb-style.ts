import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `BreadCrumbBase`'s style
 * registration (see `.vendor-extracted/react/breadcrumb/BreadCrumbBase.js`),
 * shaped to match `useComponentBase`'s `StyleModule` contract — no
 * `@ultimate/uix-styles/breadcrumb` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `menuStyleModule`'s own locally
 * authored `css`/`classes`).
 */
const css = /*css*/ `
.u-breadcrumb { overflow-x: auto; }
.u-breadcrumb-menu { margin: 0; padding: 0; list-style: none; display: flex; align-items: center; flex-wrap: nowrap; }
.u-breadcrumb-action { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.u-breadcrumb-menuitem[data-u-disabled="true"] .u-breadcrumb-action { cursor: default; pointer-events: none; opacity: 0.6; }
.u-breadcrumb-separator { display: flex; align-items: center; }
`;

const classes = {
  root: "u-breadcrumb u-component",
  menu: "u-breadcrumb-menu",
  home: "u-breadcrumb-home u-breadcrumb-menuitem",
  menuitem: (params: { item?: boolean } = {}) => ["u-breadcrumb-menuitem", { "u-breadcrumb-item": !!params.item }],
  action: "u-breadcrumb-action",
  icon: "u-breadcrumb-icon",
  label: "u-breadcrumb-label",
  separator: "u-breadcrumb-separator",
  separatorIcon: "u-breadcrumb-separator-icon",
};

export const breadcrumbStyleModule: StyleModule = { css, classes };
