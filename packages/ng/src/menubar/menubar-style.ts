/**
 * Ultimate-owned adaptation of PrimeNG's `MenuBarStyle` (see
 * `.vendor-extracted/ng/menubar/style/menubarstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/menubar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `breadcrumbStyleModule`).
 * GAP-064 G3-C2: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c2-port.mjs).
 */
const css = /*css*/ `
.u-menubar-item-disabled, .u-menubar-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-menubar-item-disabled{opacity: dt('disabled.opacity');}
.u-menubar{display: flex;align-items: center;background: dt('menubar.background');border: 1px solid dt('menubar.border.color');border-radius: dt('menubar.border.radius');color: dt('menubar.color');padding: dt('menubar.padding');gap: dt('menubar.gap');}
.u-menubar-root-list, .u-menubar-submenu{display: flex;margin: 0;padding: 0;list-style: none;outline: 0 none;}
.u-menubar-root-list{align-items: center;flex-wrap: wrap;gap: dt('menubar.gap');}
.u-menubar-root-list > .u-menubar-item > .u-menubar-item-content{border-radius: dt('menubar.base.item.border.radius');}
.u-menubar-root-list > .u-menubar-item > .u-menubar-item-content > .u-menubar-item-link{padding: dt('menubar.base.item.padding');}
.u-menubar-item-content{transition: background dt('menubar.transition.duration'), color dt('menubar.transition.duration');border-radius: dt('menubar.item.border.radius');color: dt('menubar.item.color');}
.u-menubar-item-link{cursor: pointer;display: flex;align-items: center;text-decoration: none;overflow: hidden;position: relative;color: inherit;padding: dt('menubar.item.padding');gap: dt('menubar.item.gap');user-select: none;outline: 0 none;}
.u-menubar-item-label{line-height: 1;}
.u-menubar-item-icon{color: dt('menubar.item.icon.color');}
.u-menubar-submenu-icon{color: dt('menubar.submenu.icon.color');margin-left: auto;font-size: dt('menubar.submenu.icon.size');width: dt('menubar.submenu.icon.size');height: dt('menubar.submenu.icon.size');}
.u-menubar-submenu .u-menubar-submenu-icon:dir(rtl){margin-left: 0;margin-right: auto;}
.u-menubar-item:not(.u-menubar-item-disabled) > .u-menubar-item-content:has(.u-menubar-item-link:focus-visible){color: dt('menubar.item.focus.color');background: dt('menubar.item.focus.background');}
.u-menubar-item:not(.u-menubar-item-disabled) > .u-menubar-item-content:has(.u-menubar-item-link:focus-visible) .u-menubar-item-icon{color: dt('menubar.item.icon.focus.color');}
.u-menubar-item:not(.u-menubar-item-disabled) > .u-menubar-item-content:has(.u-menubar-item-link:focus-visible) .u-menubar-submenu-icon{color: dt('menubar.submenu.icon.focus.color');}
.u-menubar-item:not(.u-menubar-item-disabled) > .u-menubar-item-content:hover{color: dt('menubar.item.focus.color');background: dt('menubar.item.focus.background');}
.u-menubar-item:not(.u-menubar-item-disabled) > .u-menubar-item-content:hover .u-menubar-item-icon{color: dt('menubar.item.icon.focus.color');}
.u-menubar-item:not(.u-menubar-item-disabled) > .u-menubar-item-content:hover .u-menubar-submenu-icon{color: dt('menubar.submenu.icon.focus.color');}
.u-menubar-item-open > .u-menubar-item-content{color: dt('menubar.item.active.color');background: dt('menubar.item.active.background');}
.u-menubar-item-open > .u-menubar-item-content .u-menubar-item-icon{color: dt('menubar.item.icon.active.color');}
.u-menubar-item-open > .u-menubar-item-content .u-menubar-submenu-icon{color: dt('menubar.submenu.icon.active.color');}
.u-menubar-submenu{display: none;position: absolute;min-width: 12.5rem;z-index: 1;background: dt('menubar.submenu.background');border: 1px solid dt('menubar.submenu.border.color');border-radius: dt('menubar.submenu.border.radius');box-shadow: dt('menubar.submenu.shadow');color: dt('menubar.submenu.color');flex-direction: column;padding: dt('menubar.submenu.padding');gap: dt('menubar.submenu.gap');}
.u-menubar-submenu .u-menubar-separator{border-block-start: 1px solid dt('menubar.separator.border.color');}
.u-menubar-submenu .u-menubar-item{position: relative;}
.u-menubar-submenu > .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu{display: block;left: 100%;top: 0;}
.u-menubar .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu{display: flex;flex-direction: column;}
`;

/** Params `UMenubar` passes into `cx('item', params)`. */
export interface MenubarClassesParams {
  disabled?: boolean;
  open?: boolean;
  focused?: boolean;
}

const classes = {
  root: "u-menubar u-component",
  rootList: "u-menubar-root-list",
  submenu: "u-menubar-submenu",
  item: (params: MenubarClassesParams = {}) => {
    const { disabled, open, focused } = params;
    return [
      "u-menubar-item",
      {
        "u-menubar-item-disabled": disabled,
        "u-menubar-item-open": open,
        "u-focus": focused,
      },
    ];
  },
  itemContent: "u-menubar-item-content",
  itemLink: "u-menubar-item-link",
  itemIcon: "u-menubar-item-icon",
  itemLabel: "u-menubar-item-label",
  submenuIcon: "u-menubar-submenu-icon",
  separator: "u-menubar-separator",
};

export const menubarStyleModule = { css, classes };
