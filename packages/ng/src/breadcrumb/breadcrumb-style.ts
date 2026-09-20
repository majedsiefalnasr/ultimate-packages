import type { UMenuItem } from "@ultimate/ng-core";

/**
 * Ultimate-owned adaptation of PrimeNG's `BreadCrumbStyle` (see
 * `.vendor-extracted/ng/breadcrumb/style/breadcrumbstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract — same
 * pattern as `menuStyleModule`. No `@ultimate/uix-styles/breadcrumb` entry
 * exists yet, so `css`/`classes` are authored locally here (same precedent
 * `menuStyleModule`'s React sibling already established for a
 * not-yet-ported `uix-styles` entry).
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
  item: (params: BreadcrumbClassesParams = {}) => {
    const { disabled } = params;
    return ["u-breadcrumb-item", { "u-breadcrumb-item-disabled": disabled }];
  },
  itemLink: "u-breadcrumb-item-link",
  itemIcon: "u-breadcrumb-item-icon",
  itemLabel: "u-breadcrumb-item-label",
  separator: "u-breadcrumb-separator",
};

/** `UBaseComponent`-shaped style module for `UBreadcrumb`. */
export const breadcrumbStyleModule = { css, classes };

/** Resolves whether a breadcrumb item represents the current page (`aria-current="page"`). */
export function isCurrentBreadcrumbItem(item: Pick<UMenuItem, "routerLink">): boolean {
  if (!item.routerLink) return false;
  const path = Array.isArray(item.routerLink) ? item.routerLink.join("/") : item.routerLink;
  return typeof window !== "undefined" && window.location.pathname === `/${path}`.replace(/\/+/g, "/");
}
