import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `TabViewBase`/`TabMenuBase`
 * styles (see `.vendor-extracted/react/tabview/TabViewBase.js`,
 * `.vendor-extracted/react/tabmenu/TabMenuBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/tabs` entry exists yet, so `css`/`classes` are
 * authored locally. Shared across both of this capability's real
 * PrimeReact sub-shapes — `UTabView` (content-switching, children-based)
 * and `UTabMenu` (navigation-only, model-array-driven) — matching real
 * PrimeReact's own per-family (not per-directory) precedent already
 * established by this same capability's Angular `tabs-style.ts` sibling.
 */
const css = /*css*/ `
.u-tabview, .u-tabmenu { display: flex; flex-direction: column; }
.u-tabview-nav, .u-tabmenu-nav { display: flex; position: relative; margin: 0; padding: 0; list-style: none; }
.u-tabview-inkbar, .u-tabmenu-inkbar { position: absolute; bottom: 0; height: 2px; background: currentColor; transition: left 0.2s, width 0.2s; }
.u-tabview-header, .u-tabmenu-item { cursor: pointer; display: inline-flex; align-items: center; user-select: none; white-space: nowrap; }
.u-tabview-header[data-u-disabled="true"], .u-tabmenu-item[data-u-disabled="true"] { cursor: default; opacity: 0.6; pointer-events: none; }
.u-tabview-header-action, .u-tabmenu-action { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; background: transparent; border: none; cursor: pointer; }
.u-tabview-close { display: inline-flex; align-items: center; background: transparent; border: none; cursor: pointer; padding: 0 0.5rem; }
.u-tabview-nav-container { position: relative; }
.u-tabview-nav-content { overflow-x: auto; scrollbar-width: none; }
.u-tabview-nav-content::-webkit-scrollbar { display: none; }
.u-tabview-nav-btn { position: absolute; top: 0; z-index: 2; height: 100%; display: flex; align-items: center; background: var(--u-tabview-nav-button-background, #ffffff); border: none; cursor: pointer; }
.u-tabview-nav-prev { left: 0; }
.u-tabview-nav-next { right: 0; }
.u-tabview-panels { flex: 1 1 auto; }
.u-tabview-panel[data-u-hidden="true"] { display: none; }
`;

const classes = {
  tabViewRoot: "u-tabview u-component",
  tabViewNav: "u-tabview-nav",
  tabViewNavContainer: "u-tabview-nav-container",
  tabViewNavContent: "u-tabview-nav-content",
  tabViewNavPrev: "u-tabview-nav-prev u-tabview-nav-btn",
  tabViewNavNext: "u-tabview-nav-next u-tabview-nav-btn",
  tabViewInkbar: "u-tabview-inkbar",
  tabViewHeader: (params: { selected?: boolean; disabled?: boolean } = {}) => [
    "u-tabview-header",
    { "u-tabview-header-selected": params.selected, "u-tabview-header-disabled": params.disabled },
  ],
  tabViewHeaderAction: "u-tabview-header-action",
  tabViewClose: "u-tabview-close",
  tabViewPanels: "u-tabview-panels",
  tabViewPanel: (params: { selected?: boolean } = {}) => ["u-tabview-panel", { "u-tabview-panel-selected": params.selected }],

  tabMenuRoot: "u-tabmenu u-component",
  tabMenuNav: "u-tabmenu-nav",
  tabMenuInkbar: "u-tabmenu-inkbar",
  tabMenuItem: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-tabmenu-item",
    { "u-tabmenu-item-active": params.active, "u-tabmenu-item-disabled": params.disabled },
  ],
  tabMenuAction: "u-tabmenu-action",
  tabMenuIcon: "u-tabmenu-icon",
  tabMenuLabel: "u-tabmenu-label",
};

export const tabsStyleModule: StyleModule = { css, classes };
