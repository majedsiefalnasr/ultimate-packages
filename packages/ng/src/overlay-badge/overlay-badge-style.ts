/**
 * Ultimate-owned adaptation of PrimeNG's `OverlayBadgeStyle` (see
 * `.vendor-extracted/ng/overlaybadge/overlaybadge.ts` / `style/`), shaped
 * to match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/overlay-badge` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tieredMenuStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-overlaybadge{position: relative;}
.u-overlaybadge .u-badge{position: absolute;inset-block-start: 0;inset-inline-end: 0;transform: translate(50%, -50%);transform-origin: 100% 0;margin: 0;outline-width: dt('overlaybadge.outline.width');outline-style: solid;outline-color: dt('overlaybadge.outline.color');}
.u-overlaybadge .u-badge:dir(rtl){transform: translate(-50%, -50%);}
`;

const classes = {
  root: () => ["u-overlaybadge"],
};

/** `UBaseComponent`-shaped style module for `UOverlayBadge`. */
export const overlayBadgeStyleModule = { css, classes };
