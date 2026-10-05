/**
 * Ultimate-owned adaptation of PrimeNG's `ToolbarStyle` (see
 * `.vendor-extracted/ng/toolbar/style/toolbarstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/toolbar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-toolbar{display: flex;align-items: center;justify-content: space-between;flex-wrap: wrap;padding: dt('toolbar.padding');background: dt('toolbar.background');border: 1px solid dt('toolbar.border.color');color: dt('toolbar.color');border-radius: dt('toolbar.border.radius');gap: dt('toolbar.gap');}
.u-toolbar-start, .u-toolbar-center, .u-toolbar-end{display: flex;align-items: center;}
`;

const classes = {
  root: "u-toolbar u-component",
  start: "u-toolbar-start",
  center: "u-toolbar-center",
  end: "u-toolbar-end",
};

/** `UBaseComponent`-shaped style module for `UToolbar`. */
export const toolbarStyleModule = { css, classes };
