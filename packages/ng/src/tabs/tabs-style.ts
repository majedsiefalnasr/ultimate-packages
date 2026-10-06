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
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
 */
const css = /*css*/ `
.u-tab-disabled, .u-tab-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-tab-disabled{opacity: dt('disabled.opacity');}
.u-tabs{display: flex;flex-direction: column;}
.u-tablist{display: flex;position: relative;overflow: hidden;background: dt('tabs.tablist.background');}
.u-tablist-content{overflow-x: auto;overflow-y: hidden;scroll-behavior: smooth;scrollbar-width: none;overscroll-behavior: contain auto;}
.u-tablist-content::-webkit-scrollbar{display: none;}
.u-tablist-tab-list{position: relative;display: flex;border-style: solid;border-color: dt('tabs.tablist.border.color');border-width: dt('tabs.tablist.border.width');}
.u-tablist-content{flex-grow: 1;}
.u-tablist-prev-button, .u-tablist-next-button{all: unset;position: absolute !important;flex-shrink: 0;inset-block-start: 0;z-index: 2;height: 100%;display: flex;align-items: center;justify-content: center;background: dt('tabs.nav.button.background');color: dt('tabs.nav.button.color');width: dt('tabs.nav.button.width');transition: color dt('tabs.transition.duration'), outline-color dt('tabs.transition.duration'), box-shadow dt('tabs.transition.duration');box-shadow: dt('tabs.nav.button.shadow');outline-color: transparent;cursor: pointer;}
.u-tablist-prev-button:focus-visible, .u-tablist-next-button:focus-visible{z-index: 1;box-shadow: dt('tabs.nav.button.focus.ring.shadow');outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');outline-offset: dt('tabs.nav.button.focus.ring.offset');}
.u-tablist-prev-button:hover, .u-tablist-next-button:hover{color: dt('tabs.nav.button.hover.color');}
.u-tablist-prev-button{inset-inline-start: 0;}
.u-tablist-next-button{inset-inline-end: 0;}
.u-tablist-prev-button:dir(rtl), .u-tablist-next-button:dir(rtl){transform: rotate(180deg);}
.u-tab{flex-shrink: 0;cursor: pointer;user-select: none;position: relative;border-style: solid;white-space: nowrap;gap: dt('tabs.tab.gap');background: dt('tabs.tab.background');border-width: dt('tabs.tab.border.width');border-color: dt('tabs.tab.border.color');color: dt('tabs.tab.color');padding: dt('tabs.tab.padding');font-weight: dt('tabs.tab.font.weight');transition: background dt('tabs.transition.duration'), border-color dt('tabs.transition.duration'), color dt('tabs.transition.duration'), outline-color dt('tabs.transition.duration'), box-shadow dt('tabs.transition.duration');margin: dt('tabs.tab.margin');outline-color: transparent;}
.u-tab:not(.u-tab-disabled):focus-visible{z-index: 1;box-shadow: dt('tabs.tab.focus.ring.shadow');outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');outline-offset: dt('tabs.tab.focus.ring.offset');}
.u-tab:not(.u-tab-active):not(.u-tab-disabled):hover{background: dt('tabs.tab.hover.background');border-color: dt('tabs.tab.hover.border.color');color: dt('tabs.tab.hover.color');}
.u-tab-active{background: dt('tabs.tab.active.background');border-color: dt('tabs.tab.active.border.color');color: dt('tabs.tab.active.color');}
.u-tabpanels{background: dt('tabs.tabpanel.background');color: dt('tabs.tabpanel.color');padding: dt('tabs.tabpanel.padding');outline: 0 none;}
.u-tabpanel:focus-visible{box-shadow: dt('tabs.tabpanel.focus.ring.shadow');outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');outline-offset: dt('tabs.tabpanel.focus.ring.offset');}
.u-tablist-active-bar{z-index: 1;display: block;position: absolute;inset-block-end: dt('tabs.active.bar.bottom');height: dt('tabs.active.bar.height');background: dt('tabs.active.bar.background');transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);}
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
