import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `TieredMenuStyle` (see
 * `.vendor-extracted/vue/tieredmenu/style/TieredMenuStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/tiered-menu` entry exists yet, so `css`/`classes`
 * are authored locally — same precedent as this same capability's
 * Angular/React `tiered-menu-style.ts` siblings.
 * GAP-064 G3-C2: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c2-port.mjs).
 */
const css = /*css*/ `
.u-tieredmenu-item-disabled, .u-tieredmenu-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-tieredmenu-item-disabled{opacity: dt('disabled.opacity');}
.u-tieredmenu{background: dt('tieredmenu.background');color: dt('tieredmenu.color');border: 1px solid dt('tieredmenu.border.color');border-radius: dt('tieredmenu.border.radius');min-width: 12.5rem;}
.u-tieredmenu-root-list, .u-tieredmenu-submenu{margin: 0;padding: dt('tieredmenu.list.padding');list-style: none;outline: 0 none;display: flex;flex-direction: column;gap: dt('tieredmenu.list.gap');}
.u-tieredmenu-submenu{position: absolute;min-width: 100%;z-index: 1;background: dt('tieredmenu.background');color: dt('tieredmenu.color');border: 1px solid dt('tieredmenu.border.color');border-radius: dt('tieredmenu.border.radius');box-shadow: dt('tieredmenu.shadow');}
.u-tieredmenu-item{position: relative;}
.u-tieredmenu-item-content{transition: background dt('tieredmenu.transition.duration'), color dt('tieredmenu.transition.duration');border-radius: dt('tieredmenu.item.border.radius');color: dt('tieredmenu.item.color');}
.u-tieredmenu-item-link{cursor: pointer;display: flex;align-items: center;text-decoration: none;overflow: hidden;position: relative;color: inherit;padding: dt('tieredmenu.item.padding');gap: dt('tieredmenu.item.gap');user-select: none;outline: 0 none;}
.u-tieredmenu-item-label{line-height: 1;}
.u-tieredmenu-item-icon{color: dt('tieredmenu.item.icon.color');}
.u-tieredmenu-submenu-icon{color: dt('tieredmenu.submenu.icon.color');margin-left: auto;font-size: dt('tieredmenu.submenu.icon.size');width: dt('tieredmenu.submenu.icon.size');height: dt('tieredmenu.submenu.icon.size');}
.u-tieredmenu-submenu-icon:dir(rtl){margin-left: 0;margin-right: auto;}
.u-tieredmenu-item:not(.u-tieredmenu-item-disabled) > .u-tieredmenu-item-content:hover{color: dt('tieredmenu.item.focus.color');background: dt('tieredmenu.item.focus.background');}
.u-tieredmenu-item:not(.u-tieredmenu-item-disabled) > .u-tieredmenu-item-content:hover .u-tieredmenu-item-icon{color: dt('tieredmenu.item.icon.focus.color');}
.u-tieredmenu-item:not(.u-tieredmenu-item-disabled) > .u-tieredmenu-item-content:hover .u-tieredmenu-submenu-icon{color: dt('tieredmenu.submenu.icon.focus.color');}
.u-tieredmenu-item-open > .u-tieredmenu-item-content{color: dt('tieredmenu.item.active.color');background: dt('tieredmenu.item.active.background');}
.u-tieredmenu-item-open > .u-tieredmenu-item-content .u-tieredmenu-item-icon{color: dt('tieredmenu.item.icon.active.color');}
.u-tieredmenu-item-open > .u-tieredmenu-item-content .u-tieredmenu-submenu-icon{color: dt('tieredmenu.submenu.icon.active.color');}
.u-tieredmenu-separator{border-block-start: 1px solid dt('tieredmenu.separator.border.color');}
.u-tieredmenu-overlay{box-shadow: dt('tieredmenu.shadow');will-change: transform;}
.u-tieredmenu-item:not(.u-tieredmenu-item-open) > .u-tieredmenu-submenu{display: none;}
.u-tieredmenu-overlay{position: absolute;top: -9999px;left: -9999px;}
.u-tieredmenu-submenu{inset-inline-start: 100%;top: 0;}
.u-tieredmenu{display: inline-block;}
`;

/** Params `UTieredMenuSub` passes into `cx('item', params)`. */
export interface TieredMenuClassesParams {
  disabled?: boolean;
  open?: boolean;
}

const classes = {
  root: (params: Record<string, unknown> = {}) => ["u-tieredmenu u-component", { "u-tieredmenu-overlay": Boolean(params.popup) }],
  rootList: "u-tieredmenu-root-list",
  submenu: "u-tieredmenu-submenu",
  item: (params: Record<string, unknown> = {}) => {
    const { disabled, open } = params as TieredMenuClassesParams;
    return ["u-tieredmenu-item", { "u-tieredmenu-item-disabled": Boolean(disabled), "u-tieredmenu-item-open": Boolean(open) }];
  },
  itemContent: "u-tieredmenu-item-content",
  itemLink: "u-tieredmenu-item-link",
  itemIcon: "u-tieredmenu-item-icon",
  itemLabel: "u-tieredmenu-item-label",
  submenuIcon: "u-tieredmenu-submenu-icon",
  separator: "u-tieredmenu-separator",
};

export const tieredMenuStyleModule: StyleModule = { css, classes };
