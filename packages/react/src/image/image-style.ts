/**
 * Ultimate-owned adaptation of PrimeReact's `ImageBase` style (real
 * source: `components/lib/image/ImageBase.js`'s `css`/`classes`), shaped
 * to match `useComponentBase`'s `styleModule: {css, classes}` contract.
 * No `@ultimate/uix-styles/image` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-image { position: relative; display: inline-block; }
.u-image-preview-mask { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; color: #fff; opacity: 0; transition: opacity 0.15s; }
.u-image:hover .u-image-preview-mask { opacity: 1; background: rgba(0, 0, 0, 0.5); }
.u-image-preview-icon { width: 1.5rem; height: 1.5rem; }
.u-image-mask { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.9); z-index: 1100; }
.u-image-toolbar { position: absolute; top: 0; right: 0; display: flex; gap: 0.5rem; padding: 1rem; z-index: 1; }
.u-image-toolbar button { background: rgba(255, 255, 255, 0.1); border: none; color: #fff; width: 2.5rem; height: 2.5rem; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.u-image-toolbar button:disabled { opacity: 0.5; cursor: default; }
.u-image-original { max-width: 90vw; max-height: 90vh; transition: transform 0.15s; }
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

/** `useComponentBase`-shaped style module for `UImage`. */
export const imageStyleModule = { css, classes };
