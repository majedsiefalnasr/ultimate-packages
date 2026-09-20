/**
 * Ultimate-owned adaptation of PrimeNG's `ContextMenuStyle` (see
 * `.vendor-extracted/ng/contextmenu/contextmenu.ts` / `style/`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/context-menu` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tieredMenuStyleModule`).
 */
const css = /*css*/ `
.u-contextmenu { position: absolute; top: 0; left: 0; }
.u-contextmenu-root-list { margin: 0; padding: 0; list-style: none; }
.u-contextmenu-item { position: relative; }
.u-contextmenu-item-content { display: flex; align-items: center; }
.u-contextmenu-item-link { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; width: 100%; }
.u-contextmenu-item[data-u-disabled="true"] .u-contextmenu-item-link { cursor: default; pointer-events: none; opacity: 0.6; }
.u-contextmenu-separator { list-style: none; }
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
