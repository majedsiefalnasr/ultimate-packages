/**
 * Ultimate-owned adaptation of PrimeNG's `ImageStyle` (see
 * `.vendor-extracted/ng/image/style/imagestyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/image` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-E: generated from g3e-port.mjs (record E-1).
 */
const css = /*css*/ `
.u-image-mask{background: dt('mask.background');color: dt('mask.color');position: fixed;top: 0;left: 0;width: 100%;height: 100%;}
.u-image-toolbar > button:disabled{opacity: dt('disabled.opacity');}
.u-image-mask{display: flex;align-items: center;justify-content: center;}
.u-image:has(> .u-image-preview-mask){position: relative;display: inline-flex;line-height: 0;}
.u-image-preview-mask{position: absolute;inset-inline-start: 0;inset-block-start: 0;width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;opacity: 0;border: 0 none;padding: 0;cursor: pointer;background: transparent;color: dt('image.preview.mask.color');transition: background dt('image.transition.duration');}
.u-image:has(> .u-image-preview-mask):hover > .u-image-preview-mask, .u-image-preview-mask:focus-visible{opacity: 1;cursor: pointer;background: dt('image.preview.mask.background');outline: 0 none;}
.u-image-preview-icon{font-size: dt('image.preview.icon.size');width: dt('image.preview.icon.size');height: dt('image.preview.icon.size');}
.u-image-toolbar{position: absolute;inset-block-start: dt('image.toolbar.position.top');inset-inline-end: dt('image.toolbar.position.right');inset-inline-start: dt('image.toolbar.position.left');inset-block-end: dt('image.toolbar.position.bottom');display: flex;z-index: 1;padding: dt('image.toolbar.padding');background: dt('image.toolbar.background');backdrop-filter: blur(dt('image.toolbar.blur'));border-color: dt('image.toolbar.border.color');border-style: solid;border-width: dt('image.toolbar.border.width');border-radius: dt('image.toolbar.border.radius');gap: dt('image.toolbar.gap');}
.u-image-toolbar > button{display: inline-flex;justify-content: center;align-items: center;color: dt('image.action.color');background: transparent;width: dt('image.action.size');height: dt('image.action.size');margin: 0;padding: 0;border: 0 none;cursor: pointer;user-select: none;border-radius: dt('image.action.border.radius');outline-color: transparent;transition: background dt('image.transition.duration'), color dt('image.transition.duration'), outline-color dt('image.transition.duration'), box-shadow dt('image.transition.duration');}
.u-image-toolbar > button:hover{color: dt('image.action.hover.color');background: dt('image.action.hover.background');}
.u-image-toolbar > button:focus-visible{box-shadow: dt('image.action.focus.ring.shadow');outline: dt('image.action.focus.ring.width') dt('image.action.focus.ring.style') dt('image.action.focus.ring.color');outline-offset: dt('image.action.focus.ring.offset');}
.u-image-toolbar > button svg{font-size: dt('image.action.icon.size');width: dt('image.action.icon.size');height: dt('image.action.icon.size');}
.u-image-toolbar > button:disabled{pointer-events: auto;}
.u-image-original{max-width: 100vw;max-height: 100vh;transition: transform 300ms;}
.u-image-mask{z-index: 1100;}
`;

const classes = {
  root: () => ["u-image u-component"],
  previewMask: "u-image-preview-mask",
  previewIcon: "u-image-preview-icon",
  mask: "u-image-mask",
  toolbar: "u-image-toolbar",
  rotateRightButton: "u-image-rotate-right-button",
  rotateLeftButton: "u-image-rotate-left-button",
  zoomOutButton: "u-image-zoom-out-button",
  zoomInButton: "u-image-zoom-in-button",
  closeButton: "u-image-close-button",
  original: "u-image-original",
};

/** `UBaseComponent`-shaped style module for `UImage`. */
export const imageStyleModule = { css, classes };
