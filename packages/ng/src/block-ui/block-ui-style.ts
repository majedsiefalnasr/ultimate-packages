/**
 * Ultimate-owned adaptation of PrimeNG's `BlockUiStyle` (see
 * `.vendor-extracted/ng/blockui/style/blockuistyle.ts` and the real
 * `BlockUI` component's own inline `p-overlay-mask`/`p-blockui-mask`
 * classes), shaped to match `UBaseComponent`'s `styleModule: {css,
 * classes}` contract. No `@ultimate/uix-styles/block-ui` entry exists yet,
 * so `css`/`classes` are authored locally (same precedent as
 * `contextMenuStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-blockui-mask{background: dt('mask.background');color: dt('mask.color');position: fixed;top: 0;left: 0;width: 100%;height: 100%;}
.u-blockui-container{position: relative;}
.u-blockui-mask{border-radius: dt('blockui.border.radius');}
.u-blockui-mask{position: absolute;}
.u-blockui-mask.u-blockui-mask-document{position: fixed;}
`;

const classes = {
  root: () => ["u-blockui-container"],
  mask: (params: { fullScreen?: boolean } = {}) => [
    "u-blockui-mask",
    { "u-blockui-mask-document": params.fullScreen },
  ],
};

/** `UBaseComponent`-shaped style module for `UBlockUI`. */
export const blockUiStyleModule = { css, classes };
