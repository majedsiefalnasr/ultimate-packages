/**
 * Ultimate-owned adaptation of PrimeVue's `BlockUIStyle` (see
 * `.vendor-extracted/vue/blockui/style/BlockUIStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/block-ui` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `overlayBadgeStyleModule`).
 */
const css = /*css*/ `
.u-blockui-container { position: relative; }
.u-blockui-mask { display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); }
.u-blockui-mask-document { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
`;

/** Params passed into `cx('mask', params)`. */
export interface BlockUIMaskParams {
  fullScreen?: boolean;
}

const classes = {
  root: () => ["u-blockui-container"],
  mask: (params: BlockUIMaskParams = {}) => [
    "u-blockui-mask",
    { "u-blockui-mask-document": !!params.fullScreen },
  ],
};

/** `createBaseComponent`-shaped style module for `UBlockUI`. */
export const blockUiStyleModule = { css, classes };
