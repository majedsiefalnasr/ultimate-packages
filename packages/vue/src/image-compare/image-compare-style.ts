/**
 * Ultimate-owned adaptation of PrimeVue's `ImageCompareStyle` (see
 * `.vendor-extracted/vue/imagecompare/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/imagecompare` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-image-compare { position: relative; overflow: hidden; display: inline-block; line-height: 0; }
.u-image-compare img { display: block; max-width: 100%; }
.u-image-compare > span:nth-of-type(1) { position: absolute; inset: 0; overflow: hidden; }
.u-image-compare-slider { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ew-resize; appearance: none; background: transparent; }
`;

const classes = {
  root: () => ["u-image-compare u-component"],
  slider: "u-image-compare-slider",
};

/** `createBaseComponent`-shaped style module for `UImageCompare`. */
export const imageCompareStyleModule = { css, classes };
