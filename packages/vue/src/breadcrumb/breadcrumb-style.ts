import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `BreadcrumbStyle` (see
 * `.vendor-extracted/vue/breadcrumb/style/BreadcrumbStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/breadcrumb` entry exists yet, so `css`/`classes` are
 * authored locally — same precedent Angular's `breadcrumbStyleModule` and
 * React's `breadcrumb-style.ts` already established for this same capability.
 */
const css = /*css*/ `
.u-breadcrumb { overflow-x: auto; }
.u-breadcrumb-list { margin: 0; padding: 0; list-style: none; display: flex; align-items: center; flex-wrap: nowrap; }
.u-breadcrumb-item-link { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.u-breadcrumb-item[data-u-disabled="true"] .u-breadcrumb-item-link { cursor: default; pointer-events: none; opacity: 0.6; }
.u-breadcrumb-separator { display: flex; align-items: center; }
`;

/** Params `UBreadcrumb` passes into `cx('item', params)`. */
export interface BreadcrumbClassesParams {
  disabled?: boolean;
}

const classes = {
  root: "u-breadcrumb u-component",
  list: "u-breadcrumb-list",
  homeItem: "u-breadcrumb-item u-breadcrumb-home-item",
  item: (params: Record<string, unknown> = {}) => {
    const { disabled } = params as BreadcrumbClassesParams;
    return ["u-breadcrumb-item", { "u-breadcrumb-item-disabled": Boolean(disabled) }];
  },
  itemLink: "u-breadcrumb-item-link",
  itemIcon: "u-breadcrumb-item-icon",
  itemLabel: "u-breadcrumb-item-label",
  separator: "u-breadcrumb-separator",
};

export const breadcrumbStyleModule: StyleModule = { css, classes };
