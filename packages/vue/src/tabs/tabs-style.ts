import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's Tabs family styles (see
 * `.vendor-extracted/vue/{tabs,tablist,tab,tabpanels,tabpanel}/style/
 * *.js`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. No `@ultimate/uix-styles/tabs`
 * entry exists yet, so `css`/`classes` are authored locally. Shared across
 * all 5 Vue Tabs-family components (`UTabs`, `UTabList`, `UTab`,
 * `UTabPanels`, `UTabPanel`), matching this same capability's Angular
 * `tabs-style.ts` sibling's own per-family style-registration granularity.
 */
const css = /*css*/ `
.u-tabs { display: flex; flex-direction: column; }
.u-tablist { display: flex; position: relative; }
.u-tablist-content { overflow-x: auto; scrollbar-width: none; flex: 1 1 auto; }
.u-tablist-content::-webkit-scrollbar { display: none; }
.u-tablist-tab-list { position: relative; display: flex; }
.u-tablist-active-bar { position: absolute; bottom: 0; height: 2px; background: currentColor; transition: left 0.2s, width 0.2s; }
.u-tablist-prev-button, .u-tablist-next-button { flex: 0 0 auto; cursor: pointer; background: transparent; border: none; }
.u-tab { cursor: pointer; display: inline-flex; align-items: center; user-select: none; white-space: nowrap; background: transparent; border: none; }
.u-tab[data-u-disabled="true"] { cursor: default; opacity: 0.6; pointer-events: none; }
.u-tabpanels { flex: 1 1 auto; }
.u-tabpanel[hidden] { display: none; }
`;

const classes = {
  tabsRoot: "u-tabs u-component",
  tabListRoot: "u-tablist u-component",
  tabListContent: "u-tablist-content",
  tabListTabList: "u-tablist-tab-list",
  tabListActiveBar: "u-tablist-active-bar",
  tabListPrevButton: "u-tablist-prev-button",
  tabListNextButton: "u-tablist-next-button",
  tab: (params: Record<string, unknown> = {}) => [
    "u-tab u-component",
    { "u-tab-active": Boolean(params.active), "u-tab-disabled": Boolean(params.disabled) },
  ],
  tabPanelsRoot: "u-tabpanels u-component",
  tabPanelRoot: "u-tabpanel u-component",
};

export const tabsStyleModule: StyleModule = { css, classes };
