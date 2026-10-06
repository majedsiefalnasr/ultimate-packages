/**
 * Ultimate-owned adaptation of PrimeNG's `ContextMenuStyle` (see
 * `.vendor-extracted/ng/contextmenu/contextmenu.ts` / `style/`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/context-menu` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tieredMenuStyleModule`).
 * GAP-064 G3-C2: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c2-port.mjs).
 */
const css = /*css*/ `
.u-contextmenu-item-disabled, .u-contextmenu-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-contextmenu-item-disabled{opacity: dt('disabled.opacity');}
.u-contextmenu{background: dt('contextmenu.background');color: dt('contextmenu.color');border: 1px solid dt('contextmenu.border.color');border-radius: dt('contextmenu.border.radius');box-shadow: dt('contextmenu.shadow');min-width: 12.5rem;}
.u-contextmenu-root-list{margin: 0;padding: dt('contextmenu.list.padding');list-style: none;outline: 0 none;display: flex;flex-direction: column;gap: dt('contextmenu.list.gap');}
.u-contextmenu-item{position: relative;}
.u-contextmenu-item-content{transition: background dt('contextmenu.transition.duration'), color dt('contextmenu.transition.duration');border-radius: dt('contextmenu.item.border.radius');color: dt('contextmenu.item.color');}
.u-contextmenu-item-link{cursor: pointer;display: flex;align-items: center;text-decoration: none;overflow: hidden;position: relative;color: inherit;padding: dt('contextmenu.item.padding');gap: dt('contextmenu.item.gap');user-select: none;}
.u-contextmenu-item-label{line-height: 1;}
.u-contextmenu-item-icon{color: dt('contextmenu.item.icon.color');}
.u-contextmenu-item.u-contextmenu-item-focused > .u-contextmenu-item-content{color: dt('contextmenu.item.focus.color');background: dt('contextmenu.item.focus.background');}
.u-contextmenu-item.u-contextmenu-item-focused > .u-contextmenu-item-content .u-contextmenu-item-icon{color: dt('contextmenu.item.icon.focus.color');}
.u-contextmenu-item:not(.u-contextmenu-item-disabled) > .u-contextmenu-item-content:hover{color: dt('contextmenu.item.focus.color');background: dt('contextmenu.item.focus.background');}
.u-contextmenu-item:not(.u-contextmenu-item-disabled) > .u-contextmenu-item-content:hover .u-contextmenu-item-icon{color: dt('contextmenu.item.icon.focus.color');}
.u-contextmenu-separator{border-block-start: 1px solid dt('contextmenu.separator.border.color');}
.u-contextmenu{position: absolute;}
`;

/** Params `UContextMenu` passes into `cx('item', params)`. */
export interface ContextMenuClassesParams {
  disabled?: boolean;
  focused?: boolean;
}

const classes = {
  root: () => ["u-contextmenu u-component"],
  rootList: "u-contextmenu-root-list",
  item: (params: ContextMenuClassesParams = {}) => {
    const { disabled, focused } = params;
    return ["u-contextmenu-item", { "u-contextmenu-item-disabled": disabled, "u-contextmenu-item-focused": focused }];
  },
  itemContent: "u-contextmenu-item-content",
  itemLink: "u-contextmenu-item-link",
  itemIcon: "u-contextmenu-item-icon",
  itemLabel: "u-contextmenu-item-label",
  separator: "u-contextmenu-separator",
};

/** `UBaseComponent`-shaped style module for `UContextMenu`. */
export const contextMenuStyleModule = { css, classes };
