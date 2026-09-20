/**
 * Ultimate-owned adaptation of PrimeNG's Tabs family styles (see
 * `.vendor-extracted/ng/tabs/style/*.ts` — `TabsStyle`, `TabListStyle`,
 * `TabStyle`, `TabPanelsStyle`, `TabPanelStyle`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/tabs` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `tieredMenuStyleModule`). Shared
 * across all 5 Angular Tabs-family directives (`UTabs`, `UTabList`,
 * `UTab`, `UTabPanels`, `UTabPanel`), matching real PrimeNG's own
 * per-family (not per-file) style-registration granularity.
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
  tab: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-tab u-component",
    { "u-tab-active": params.active, "u-tab-disabled": params.disabled },
  ],
  tabPanelsRoot: "u-tabpanels u-component",
  tabPanelRoot: "u-tabpanel u-component",
};

export const tabsStyleModule = { css, classes };
