import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `PanelMenuStyle` (see
 * `.vendor-extracted/vue/panelmenu/style/PanelMenuStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/panel-menu` entry exists yet, so `css`/`classes`
 * are authored locally — same precedent as this same capability's
 * Angular/React `panel-menu-style.ts` siblings.
 * GAP-064 G3-C2: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c2-port.mjs).
 */
const css = /*css*/ `
.u-panelmenu-item-disabled, .u-panelmenu-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-panelmenu-item-disabled{opacity: dt('disabled.opacity');}
.u-panelmenu{display: flex;flex-direction: column;gap: dt('panelmenu.gap');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item){background: dt('panelmenu.panel.background');border-width: dt('panelmenu.panel.border.width');border-style: solid;border-color: dt('panelmenu.panel.border.color');color: dt('panelmenu.panel.color');border-radius: dt('panelmenu.panel.border.radius');padding: dt('panelmenu.panel.padding');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):first-child{border-width: dt('panelmenu.panel.first.border.width');border-start-start-radius: dt('panelmenu.panel.first.top.border.radius');border-start-end-radius: dt('panelmenu.panel.first.top.border.radius');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):last-child{border-width: dt('panelmenu.panel.last.border.width');border-end-start-radius: dt('panelmenu.panel.last.bottom.border.radius');border-end-end-radius: dt('panelmenu.panel.last.bottom.border.radius');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-header-content{outline: 0 none;}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-header-content{border-radius: dt('panelmenu.item.border.radius');transition: background dt('panelmenu.transition.duration'), color dt('panelmenu.transition.duration'), outline-color dt('panelmenu.transition.duration'), box-shadow dt('panelmenu.transition.duration');outline-color: transparent;color: dt('panelmenu.item.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-header-content > .u-panelmenu-header-link{display: flex;gap: dt('panelmenu.item.gap');padding: dt('panelmenu.item.padding');align-items: center;user-select: none;cursor: pointer;position: relative;text-decoration: none;color: inherit;}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-header-content .u-panelmenu-header-icon, .u-panelmenu-item .u-panelmenu-item > .u-panelmenu-header-content .u-panelmenu-header-icon{color: dt('panelmenu.item.icon.color');}
.u-panelmenu-submenu-icon{color: dt('panelmenu.submenu.icon.color');}
.u-panelmenu-submenu-icon:dir(rtl){transform: rotate(180deg);}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:has(.u-panelmenu-header-link:focus-visible){background: dt('panelmenu.item.focus.background');color: dt('panelmenu.item.focus.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:has(.u-panelmenu-header-link:focus-visible) .u-panelmenu-header-icon{color: dt('panelmenu.item.icon.focus.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:has(.u-panelmenu-header-link:focus-visible) .u-panelmenu-submenu-icon{color: dt('panelmenu.submenu.icon.focus.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover{background: dt('panelmenu.item.focus.background');color: dt('panelmenu.item.focus.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-header-icon{color: dt('panelmenu.item.icon.focus.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item):not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-submenu-icon{color: dt('panelmenu.submenu.icon.focus.color');}
.u-panelmenu-item .u-panelmenu-submenu{margin: 0;padding: 0 0 0 dt('panelmenu.submenu.indent');outline: 0;list-style: none;}
.u-panelmenu-item .u-panelmenu-submenu:dir(rtl){padding: 0 dt('panelmenu.submenu.indent') 0 0;}
.u-panelmenu-item .u-panelmenu-item > .u-panelmenu-header-content > .u-panelmenu-header-link{display: flex;gap: dt('panelmenu.item.gap');padding: dt('panelmenu.item.padding');align-items: center;user-select: none;cursor: pointer;text-decoration: none;color: inherit;position: relative;overflow: hidden;}
.u-panelmenu-item .u-panelmenu-item > .u-panelmenu-header-content .u-panelmenu-header-label{line-height: 1;}
.u-panelmenu-item .u-panelmenu-item > .u-panelmenu-header-content{border-radius: dt('panelmenu.item.border.radius');transition: background dt('panelmenu.transition.duration'), color dt('panelmenu.transition.duration'), outline-color dt('panelmenu.transition.duration'), box-shadow dt('panelmenu.transition.duration');color: dt('panelmenu.item.color');outline-color: transparent;}
.u-panelmenu-item .u-panelmenu-item:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover{background: dt('panelmenu.item.focus.background');color: dt('panelmenu.item.focus.color');}
.u-panelmenu-item .u-panelmenu-item:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-header-icon{color: dt('panelmenu.item.icon.focus.color');}
.u-panelmenu-item .u-panelmenu-item:not(.u-panelmenu-item-disabled) > .u-panelmenu-header-content:hover .u-panelmenu-submenu-icon{color: dt('panelmenu.submenu.icon.focus.color');}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-submenu{display: grid;grid-template-rows: 1fr;}
.u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-submenu{min-height: 0;}
.u-panelmenu-submenu-icon{transition: transform 0.2s;}
.u-panelmenu-item-expanded > .u-panelmenu-header-content .u-panelmenu-submenu-icon{transform: rotate(90deg);}
`;

/** Params `UPanelMenuList` passes into `cx('item', params)`. */
export interface PanelMenuClassesParams {
  disabled?: boolean;
  expanded?: boolean;
}

const classes = {
  root: "u-panelmenu u-component",
  panel: "u-panelmenu-panel",
  headerContent: "u-panelmenu-header-content",
  headerLink: "u-panelmenu-header-link",
  headerIcon: "u-panelmenu-header-icon",
  headerLabel: "u-panelmenu-header-label",
  item: (params: Record<string, unknown> = {}) => {
    const { disabled, expanded } = params as PanelMenuClassesParams;
    return ["u-panelmenu-item", { "u-panelmenu-item-disabled": Boolean(disabled), "u-panelmenu-item-expanded": Boolean(expanded) }];
  },
  submenu: "u-panelmenu-submenu",
  submenuIcon: "u-panelmenu-submenu-icon",
};

export const panelMenuStyleModule: StyleModule = { css, classes };
