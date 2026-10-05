/**
 * Ultimate-owned adaptation of PrimeVue's `Splitter` style (see
 * `.vendor-extracted/vue/splitter/style/SplitterStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/splitter` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-splitter{display: flex;flex-wrap: nowrap;border: 1px solid dt('splitter.border.color');background: dt('splitter.background');border-radius: dt('border.radius.md');color: dt('splitter.color');}
.u-splitter-vertical{flex-direction: column;}
.u-splitter-gutter{flex-grow: 0;flex-shrink: 0;display: flex;align-items: center;justify-content: center;z-index: 1;background: dt('splitter.gutter.background');}
.u-splitter-gutter-handle{border-radius: dt('splitter.handle.border.radius');background: dt('splitter.handle.background');transition: outline-color dt('splitter.transition.duration'), box-shadow dt('splitter.transition.duration');outline-color: transparent;}
.u-splitter-gutter-handle:focus-visible{box-shadow: dt('splitter.handle.focus.ring.shadow');outline: dt('splitter.handle.focus.ring.width') dt('splitter.handle.focus.ring.style') dt('splitter.handle.focus.ring.color');outline-offset: dt('splitter.handle.focus.ring.offset');}
.u-splitter-horizontal > .u-splitter-gutter > .u-splitter-gutter-handle{height: dt('splitter.handle.size');width: 100%;}
.u-splitter-vertical > .u-splitter-gutter > .u-splitter-gutter-handle{width: dt('splitter.handle.size');height: 100%;}
.u-splitter-horizontal > .u-splitter-gutter{cursor: col-resize;}
.u-splitter-vertical > .u-splitter-gutter{cursor: row-resize;}
.u-splitter-panel{flex-grow: 1;overflow: hidden;}
.u-splitter-panel .u-splitter{flex-grow: 1;min-width: 0;min-height: 0;border: 0 none;}
.u-splitter-gutter{touch-action: none;}
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    ["u-splitter u-component", `u-splitter-${(params?.["layout"] as string) ?? "horizontal"}`].join(
      " "
    ),
  panel: "u-splitter-panel",
  gutter: "u-splitter-gutter",
  gutterHandle: "u-splitter-gutter-handle",
};

/** `createBaseComponent`-shaped style module for `USplitter`. */
export const splitterStyleModule = { css, classes };
