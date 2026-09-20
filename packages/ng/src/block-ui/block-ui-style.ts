/**
 * Ultimate-owned adaptation of PrimeNG's `BlockUiStyle` (see
 * `.vendor-extracted/ng/blockui/style/blockuistyle.ts` and the real
 * `BlockUI` component's own inline `p-overlay-mask`/`p-blockui-mask`
 * classes), shaped to match `UBaseComponent`'s `styleModule: {css,
 * classes}` contract. No `@ultimate/uix-styles/block-ui` entry exists yet,
 * so `css`/`classes` are authored locally (same precedent as
 * `contextMenuStyleModule`).
 */
const css = /*css*/ `
.u-blockui-container { position: relative; }
.u-blockui-mask { display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); }
.u-blockui-mask-document { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
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
