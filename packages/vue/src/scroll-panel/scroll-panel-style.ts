/**
 * Ultimate-owned adaptation of PrimeVue's `ScrollPanelStyle` (see
 * `.vendor-extracted/vue/scrollpanel/style/ScrollPanelStyle.js`), shaped to
 * match `vue-core`'s `createBaseComponent`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/scrollpanel` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-scroll-panel { position: relative; overflow: hidden; }
.u-scroll-panel-content-container { overflow: hidden; width: 100%; height: 100%; position: relative; z-index: 1; }
.u-scroll-panel-content { height: calc(100% + 18px); width: calc(100% + 18px); padding: 0 18px 18px 0; overflow: auto; box-sizing: border-box; scrollbar-width: none; }
.u-scroll-panel-content::-webkit-scrollbar { display: none; }
.u-scroll-panel-bar { position: absolute; background: var(--u-scroll-panel-bar-bg, #c1c1c1); border-radius: 6px; z-index: 2; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
.u-scroll-panel:hover .u-scroll-panel-bar, .u-scroll-panel-bar-grabbed { opacity: 1; }
.u-scroll-panel-bar-x { bottom: 3px; height: 9px; }
.u-scroll-panel-bar-y { inset-inline-end: 3px; width: 9px; }
.u-scroll-panel-bar-hidden { display: none; }
`;

const classes = {
  root: "u-scroll-panel u-component",
  contentContainer: "u-scroll-panel-content-container",
  content: "u-scroll-panel-content",
  barX: "u-scroll-panel-bar u-scroll-panel-bar-x",
  barY: "u-scroll-panel-bar u-scroll-panel-bar-y",
};

/** `createBaseComponent`-shaped style module for `UScrollPanel`. */
export const scrollPanelStyleModule = { css, classes };
