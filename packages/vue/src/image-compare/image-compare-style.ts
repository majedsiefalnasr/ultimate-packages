/**
 * Ultimate-owned adaptation of PrimeVue's `ImageCompareStyle` (see
 * `.vendor-extracted/vue/imagecompare/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/imagecompare` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-E: generated from g3e-port.mjs (record E-1).
 */
const css = /*css*/ `
.u-image-compare{position: relative;overflow: hidden;width: 100%;aspect-ratio: 16 / 9;}
.u-image-compare img{width: 100%;height: 100%;position: absolute;}
.u-image-compare > span{clip-path: polygon(0 0, dt('imagecompare.scope.x', '50%') 0, dt('imagecompare.scope.x', '50%') 100%, 0 100%);}
.u-image-compare:dir(rtl) > span{clip-path: polygon(calc(100% - dt('imagecompare.scope.x', '50%')) 0, 100% 0, 100% 100%, calc(100% - dt('imagecompare.scope.x', '50%')) 100%);}
.u-image-compare-slider{position: relative;-webkit-appearance: none;width: calc(100% + dt('imagecompare.handle.size'));height: 100%;margin-inline-start: calc(-1 * calc(dt('imagecompare.handle.size') / 2));background-color: transparent;outline: none;transition: all dt('imagecompare.handle.transition.duration');}
.u-image-compare-slider::-webkit-slider-thumb{-webkit-appearance: none;height: dt('imagecompare.handle.size');width: dt('imagecompare.handle.size');background: dt('imagecompare.handle.background');border: dt('imagecompare.handle.border.width') solid dt('imagecompare.handle.border.color');border-radius: dt('imagecompare.handle.border.radius');background-size: contain;cursor: ew-resize;transition: all dt('imagecompare.handle.transition.duration');}
.u-image-compare-slider::-moz-range-thumb{height: dt('imagecompare.handle.size');width: dt('imagecompare.handle.size');background: dt('imagecompare.handle.background');border: dt('imagecompare.handle.border.width') dt('imagecompare.handle.border.style') dt('imagecompare.handle.border.color');border-radius: dt('imagecompare.handle.border.radius');background-size: contain;cursor: ew-resize;}
.u-image-compare-slider:focus-visible::-webkit-slider-thumb{box-shadow: dt('imagecompare.handle.focus.ring.shadow');outline: dt('imagecompare.handle.focus.ring.width') dt('imagecompare.handle.focus.ring.style') dt('imagecompare.handle.focus.ring.color');outline-offset: dt('imagecompare.handle.focus.ring.offset');}
.u-image-compare-slider:focus-visible::-moz-range-thumb{box-shadow: dt('imagecompare.handle.focus.ring.shadow');outline: dt('imagecompare.handle.focus.ring.width') dt('imagecompare.handle.focus.ring.style') dt('imagecompare.handle.focus.ring.color');outline-offset: dt('imagecompare.handle.focus.ring.offset');}
.u-image-compare-slider:hover{width: calc(100% + dt('imagecompare.handle.hover.size'));margin-inline-start: calc(-1 * calc(dt('imagecompare.handle.hover.size') / 2));}
.u-image-compare-slider:hover::-webkit-slider-thumb{background: dt('imagecompare.handle.hover.background');border-color: dt('imagecompare.handle.hover.border.color');height: dt('imagecompare.handle.hover.size');width: dt('imagecompare.handle.hover.size');}
.u-image-compare-slider:hover::-moz-range-thumb{background: dt('imagecompare.handle.hover.background');border-color: dt('imagecompare.handle.hover.border.color');height: dt('imagecompare.handle.hover.size');width: dt('imagecompare.handle.hover.size');}
.u-image-compare > span{position: absolute;inset: 0;}
`;

const classes = {
  root: () => ["u-image-compare u-component"],
  slider: "u-image-compare-slider",
};

/** `createBaseComponent`-shaped style module for `UImageCompare`. */
export const imageCompareStyleModule = { css, classes };
