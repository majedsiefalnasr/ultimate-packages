import type { UMenuItem } from "@ultimate/ng-core";

/**
 * Ultimate-owned adaptation of PrimeNG's `BreadCrumbStyle` (see
 * `.vendor-extracted/ng/breadcrumb/style/breadcrumbstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract — same
 * pattern as `menuStyleModule`. No `@ultimate/uix-styles/breadcrumb` entry
 * exists yet, so `css`/`classes` are authored locally here (same precedent
 * `menuStyleModule`'s React sibling already established for a
 * not-yet-ported `uix-styles` entry).
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
 */
const css = /*css*/ `
.u-breadcrumb-item-disabled, .u-breadcrumb-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-breadcrumb-item-disabled{opacity: dt('disabled.opacity');}
.u-breadcrumb{background: dt('breadcrumb.background');padding: dt('breadcrumb.padding');overflow-x: auto;}
.u-breadcrumb-list{margin: 0;padding: 0;list-style-type: none;display: flex;align-items: center;flex-wrap: nowrap;gap: dt('breadcrumb.gap');}
.u-breadcrumb-separator{display: flex;align-items: center;color: dt('breadcrumb.separator.color');}
.u-breadcrumb::-webkit-scrollbar{display: none;}
.u-breadcrumb-item-link{text-decoration: none;display: flex;align-items: center;gap: dt('breadcrumb.item.gap');transition: background dt('breadcrumb.transition.duration'), color dt('breadcrumb.transition.duration'), outline-color dt('breadcrumb.transition.duration'), box-shadow dt('breadcrumb.transition.duration');border-radius: dt('breadcrumb.item.border.radius');outline-color: transparent;color: dt('breadcrumb.item.color');}
.u-breadcrumb-item-link:focus-visible{box-shadow: dt('breadcrumb.item.focus.ring.shadow');outline: dt('breadcrumb.item.focus.ring.width') dt('breadcrumb.item.focus.ring.style') dt('breadcrumb.item.focus.ring.color');outline-offset: dt('breadcrumb.item.focus.ring.offset');}
.u-breadcrumb-item-link:hover .u-breadcrumb-item-label{color: dt('breadcrumb.item.hover.color');}
.u-breadcrumb-item-label{transition: inherit;}
.u-breadcrumb-item-icon{color: dt('breadcrumb.item.icon.color');transition: inherit;}
.u-breadcrumb-item-link:hover .u-breadcrumb-item-icon{color: dt('breadcrumb.item.icon.hover.color');}
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
