import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `DockStyle` (see
 * `.vendor-extracted/vue/dock/style/DockStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/dock` entry exists yet, so `css`/`classes` are
 * authored locally. Magnification-on-hover is CSS-only — see this same
 * capability's Angular `dock-style.ts` sibling's doc comment for the
 * cross-framework finding this mirrors (real PrimeVue 4.5.5's own `Dock`/
 * `DockSub` also tracks a hover `currentIndex` purely for bookkeeping,
 * never for scale/transform styling).
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
 */
const css = /*css*/ `
.u-dock-item-disabled, .u-dock-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-dock-item-disabled{opacity: dt('disabled.opacity');}
.u-dock{position: absolute;z-index: 1;display: flex;justify-content: center;align-items: center;pointer-events: none;}
.u-dock-list-container{display: flex;pointer-events: auto;background: dt('dock.background');border: 1px solid dt('dock.border.color');padding: dt('dock.padding');border-radius: dt('dock.border.radius');}
.u-dock-list{margin: 0;padding: 0;list-style: none;display: flex;align-items: center;justify-content: center;outline: 0 none;}
.u-dock-item{transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);will-change: transform;padding: dt('dock.item.padding');border-radius: dt('dock.item.border.radius');}
.u-dock-item-link{display: flex;flex-direction: column;align-items: center;justify-content: center;position: relative;overflow: hidden;cursor: default;width: dt('dock.item.size');height: dt('dock.item.size');}
.u-dock-top{left: 0;top: 0;width: 100%;}
.u-dock-bottom{left: 0;bottom: 0;width: 100%;}
.u-dock-right{right: 0;top: 0;height: 100%;}
.u-dock-right .u-dock-list{flex-direction: column;}
.u-dock-left{left: 0;top: 0;height: 100%;}
.u-dock-left .u-dock-list{flex-direction: column;}
.u-dock-item-link{transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);transform-origin: bottom center;}
.u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"]{transform: scale(1.5);}
`;

const classes = {
  root: (params: Record<string, unknown> = {}) => ["u-dock u-component", `u-dock-${params.position ?? "bottom"}`],
  listContainer: "u-dock-list-container",
  list: "u-dock-list",
  item: (params: Record<string, unknown> = {}) => [
    "u-dock-item",
    { "u-dock-item-active": Boolean(params.active), "u-dock-item-disabled": Boolean(params.disabled) },
  ],
  itemLink: "u-dock-item-link",
  itemIcon: "u-dock-item-icon",
};

export const dockStyleModule: StyleModule = { css, classes };
