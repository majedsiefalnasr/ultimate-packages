/**
 * Ultimate-owned adaptation of PrimeNG's `ScrollPanelStyle` (see
 * `.vendor-extracted/ng/scrollpanel/style/scrollpanelstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/scrollpanel` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `fieldsetStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-scroll-panel-content-container{overflow: hidden;width: 100%;height: 100%;position: relative;z-index: 1;float: left;}
.u-scroll-panel-content{height: calc(100% + calc(2 * dt('scrollpanel.bar.size')));width: calc(100% + calc(2 * dt('scrollpanel.bar.size')));padding-inline: 0 calc(2 * dt('scrollpanel.bar.size'));padding-block: 0 calc(2 * dt('scrollpanel.bar.size'));position: relative;overflow: auto;box-sizing: border-box;scrollbar-width: none;}
.u-scroll-panel-content::-webkit-scrollbar{display: none;}
.u-scroll-panel-bar{position: relative;border-radius: dt('scrollpanel.bar.border.radius');z-index: 2;cursor: pointer;opacity: 0;outline-color: transparent;background: dt('scrollpanel.bar.background');border: 0 none;transition: outline-color dt('scrollpanel.transition.duration'), opacity dt('scrollpanel.transition.duration');}
.u-scroll-panel-bar:focus-visible{box-shadow: dt('scrollpanel.bar.focus.ring.shadow');outline: dt('scrollpanel.barfocus.ring.width') dt('scrollpanel.bar.focus.ring.style') dt('scrollpanel.bar.focus.ring.color');outline-offset: dt('scrollpanel.barfocus.ring.offset');}
.u-scroll-panel-bar-y{width: dt('scrollpanel.bar.size');inset-block-start: 0;}
.u-scroll-panel-bar-x{height: dt('scrollpanel.bar.size');inset-block-end: 0;}
.u-scroll-panel-bar-hidden{visibility: hidden;}
.u-scroll-panel:hover .u-scroll-panel-bar, .u-scroll-panel:active .u-scroll-panel-bar{opacity: 1;}
.u-scroll-panel-bar-grabbed{user-select: none;}
`;

const classes = {
  root: "u-scroll-panel u-component",
  contentContainer: "u-scroll-panel-content-container",
  content: "u-scroll-panel-content",
  barX: "u-scroll-panel-bar u-scroll-panel-bar-x",
  barY: "u-scroll-panel-bar u-scroll-panel-bar-y",
};

/** `UBaseComponent`-shaped style module for `UScrollPanel`. */
export const scrollPanelStyleModule = { css, classes };
