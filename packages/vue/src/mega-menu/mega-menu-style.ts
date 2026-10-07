import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `MegaMenuStyle` (see
 * `.vendor-extracted/vue/megamenu/style/MegaMenuStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/mega-menu` entry exists yet, so `css`/`classes` are
 * authored locally — same precedent as `breadcrumbStyleModule` and this
 * same capability's Angular/React `mega-menu-style.ts` siblings.
 * GAP-064 G3-C2: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c2-port.mjs).
 */
const css = /*css*/ `
.u-megamenu-item-disabled, .u-megamenu-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-megamenu-item-disabled{opacity: dt('disabled.opacity');}
.u-megamenu{position: relative;display: flex;align-items: center;background: dt('megamenu.background');border: 1px solid dt('megamenu.border.color');border-radius: dt('megamenu.border.radius');color: dt('megamenu.color');gap: dt('megamenu.gap');}
.u-megamenu-root-list{margin: 0;padding: 0;list-style: none;outline: 0 none;align-items: center;display: flex;flex-wrap: wrap;gap: dt('megamenu.gap');}
.u-megamenu-root-list > .u-megamenu-item > .u-megamenu-item-content{border-radius: dt('megamenu.base.item.border.radius');}
.u-megamenu-root-list > .u-megamenu-item > .u-megamenu-item-content > .u-megamenu-item-link{padding: dt('megamenu.base.item.padding');}
.u-megamenu-item-content{transition: background dt('megamenu.transition.duration'), color dt('megamenu.transition.duration');border-radius: dt('megamenu.item.border.radius');color: dt('megamenu.item.color');}
.u-megamenu-item-link{cursor: pointer;display: flex;align-items: center;text-decoration: none;overflow: hidden;position: relative;color: inherit;padding: dt('megamenu.item.padding');gap: dt('megamenu.item.gap');user-select: none;outline: 0 none;}
.u-megamenu-item-label{line-height: 1;}
.u-megamenu-item-icon{color: dt('megamenu.item.icon.color');}
.u-megamenu-submenu-icon{color: dt('megamenu.submenu.icon.color');font-size: dt('megamenu.submenu.icon.size');width: dt('megamenu.submenu.icon.size');height: dt('megamenu.submenu.icon.size');}
.u-megamenu-item:not(.u-megamenu-item-disabled) > .u-megamenu-item-content:has(.u-megamenu-item-link:focus-visible){color: dt('megamenu.item.focus.color');background: dt('megamenu.item.focus.background');}
.u-megamenu-item:not(.u-megamenu-item-disabled) > .u-megamenu-item-content:has(.u-megamenu-item-link:focus-visible) .u-megamenu-item-icon{color: dt('megamenu.item.icon.focus.color');}
.u-megamenu-item:not(.u-megamenu-item-disabled) > .u-megamenu-item-content:has(.u-megamenu-item-link:focus-visible) .u-megamenu-submenu-icon{color: dt('megamenu.submenu.icon.focus.color');}
.u-megamenu-item:not(.u-megamenu-item-disabled) > .u-megamenu-item-content:hover{color: dt('megamenu.item.focus.color');background: dt('megamenu.item.focus.background');}
.u-megamenu-item:not(.u-megamenu-item-disabled) > .u-megamenu-item-content:hover .u-megamenu-item-icon{color: dt('megamenu.item.icon.focus.color');}
.u-megamenu-item:not(.u-megamenu-item-disabled) > .u-megamenu-item-content:hover .u-megamenu-submenu-icon{color: dt('megamenu.submenu.icon.focus.color');}
.u-megamenu-item-open > .u-megamenu-item-content{color: dt('megamenu.item.active.color');background: dt('megamenu.item.active.background');}
.u-megamenu-item-open > .u-megamenu-item-content .u-megamenu-item-icon{color: dt('megamenu.item.icon.active.color');}
.u-megamenu-item-open > .u-megamenu-item-content .u-megamenu-submenu-icon{color: dt('megamenu.submenu.icon.active.color');}
.u-megamenu-overlay{display: none;position: absolute;width: auto;z-index: 1;left: 0;min-width: 100%;padding: dt('megamenu.overlay.padding');background: dt('megamenu.overlay.background');color: dt('megamenu.overlay.color');border: 1px solid dt('megamenu.overlay.border.color');border-radius: dt('megamenu.overlay.border.radius');box-shadow: dt('megamenu.overlay.shadow');}
.u-megamenu-overlay:dir(rtl){left: auto;right: 0;}
.u-megamenu-root-list > .u-megamenu-item-open > .u-megamenu-overlay{display: block;}
.u-megamenu-submenu{margin: 0;list-style: none;padding: dt('megamenu.submenu.padding');min-width: 12.5rem;display: flex;flex-direction: column;gap: dt('megamenu.submenu.gap');}
.u-megamenu-submenu-label{padding: dt('megamenu.submenu.label.padding');color: dt('megamenu.submenu.label.color');font-weight: dt('megamenu.submenu.label.font.weight');background: dt('megamenu.submenu.label.background');}
.u-megamenu{align-items: center;padding: dt('megamenu.horizontal.orientation.padding');}
.u-megamenu .u-megamenu-root-list{display: flex;align-items: center;flex-wrap: wrap;gap: dt('megamenu.horizontal.orientation.gap');}
.u-megamenu-grid{display: flex;}
.u-megamenu-column{display: flex;flex-direction: column;}
`;

/** Params `UMegaMenu` passes into `cx('item', params)`. */
export interface MegaMenuClassesParams {
  disabled?: boolean;
  open?: boolean;
}

const classes = {
  root: "u-megamenu u-component",
  rootList: "u-megamenu-root-list",
  item: (params: Record<string, unknown> = {}) => {
    const { disabled, open } = params as MegaMenuClassesParams;
    return ["u-megamenu-item", { "u-megamenu-item-disabled": Boolean(disabled), "u-megamenu-item-open": Boolean(open) }];
  },
  itemContent: "u-megamenu-item-content",
  itemLink: "u-megamenu-item-link",
  itemIcon: "u-megamenu-item-icon",
  itemLabel: "u-megamenu-item-label",
  submenuIcon: "u-megamenu-submenu-icon",
  overlay: "u-megamenu-overlay",
  grid: "u-megamenu-grid",
  column: "u-megamenu-column",
  submenuLabel: "u-megamenu-submenu-label",
  submenu: "u-megamenu-submenu",
};

export const megaMenuStyleModule: StyleModule = { css, classes };
