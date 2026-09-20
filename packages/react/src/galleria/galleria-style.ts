/**
 * Ultimate-owned adaptation of PrimeReact's `GalleriaBase` style (real
 * source: `components/lib/galleria/GalleriaBase.js`'s `css`/`classes`),
 * shaped to match `useComponentBase`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/galleria` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-galleria { display: flex; flex-direction: column; gap: 0.5rem; }
.u-galleria-item-wrapper { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.u-galleria-item-container { width: 100%; display: flex; align-items: center; justify-content: center; }
.u-galleria-prev-button, .u-galleria-next-button { position: absolute; top: 50%; transform: translateY(-50%); z-index: 1; background: rgba(0, 0, 0, 0.5); color: #fff; border: none; width: 2.5rem; height: 2.5rem; border-radius: 50%; cursor: pointer; }
.u-galleria-prev-button { left: 0.5rem; }
.u-galleria-next-button { right: 0.5rem; }
.u-galleria-prev-button:disabled, .u-galleria-next-button:disabled { opacity: 0.5; cursor: default; }
.u-galleria-thumbnail-list { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.25rem; list-style: none; margin: 0; }
.u-galleria-thumbnail-item { flex: 0 0 auto; cursor: pointer; opacity: 0.6; border: 2px solid transparent; border-radius: 4px; }
.u-galleria-thumbnail-item-active { opacity: 1; border-color: var(--u-galleria-thumbnail-active-border, #3b82f6); }
.u-galleria-mask { position: fixed; inset: 0; z-index: 1100; background: #000; display: flex; align-items: center; justify-content: center; }
.u-galleria-close-button { position: absolute; top: 1rem; right: 1rem; z-index: 1; background: rgba(255, 255, 255, 0.1); border: none; color: #fff; width: 2.5rem; height: 2.5rem; border-radius: 50%; cursor: pointer; }
`;

const classes = {
  root: () => ["u-galleria u-component"],
  itemWrapper: "u-galleria-item-wrapper",
  itemContainer: "u-galleria-item-container",
  prevButton: "u-galleria-prev-button",
  nextButton: "u-galleria-next-button",
  thumbnailList: "u-galleria-thumbnail-list",
  thumbnailItem: (params?: Record<string, unknown>) => [
    "u-galleria-thumbnail-item",
    { "u-galleria-thumbnail-item-active": !!params?.["active"] },
  ],
  mask: "u-galleria-mask",
  closeButton: "u-galleria-close-button",
};

/** `useComponentBase`-shaped style module for `UGalleria`. */
export const galleriaStyleModule = { css, classes };
