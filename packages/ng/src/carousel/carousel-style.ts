/**
 * Ultimate-owned adaptation of PrimeNG's `CarouselStyle` (see
 * `.vendor-extracted/ng/carousel/style/carouselstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/carousel` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `contextMenuStyleModule`).
 */
const css = /*css*/ `
.u-carousel { display: flex; flex-direction: column; }
.u-carousel-content { display: flex; flex-direction: column; }
.u-carousel-content-inner { display: flex; flex-direction: row; align-items: center; }
.u-carousel-vertical .u-carousel-content-inner { flex-direction: column; }
.u-carousel-viewport { overflow: hidden; width: 100%; }
.u-carousel-item-list { display: flex; flex-direction: row; transition: transform 500ms ease 0s; }
.u-carousel-vertical .u-carousel-item-list { flex-direction: column; }
.u-carousel-item { flex-shrink: 0; box-sizing: border-box; }
.u-carousel-prev-button, .u-carousel-next-button { flex: 0 0 auto; }
.u-carousel-prev-button:disabled, .u-carousel-next-button:disabled { opacity: 0.5; cursor: default; pointer-events: none; }
.u-carousel-indicator-list { display: flex; flex-direction: row; justify-content: center; list-style: none; margin: 0.5rem 0 0; padding: 0; gap: 0.25rem; }
.u-carousel-indicator-button { width: 0.75rem; height: 0.75rem; border-radius: 50%; border: 0 none; background: var(--u-carousel-indicator-background, #ccc); cursor: pointer; padding: 0; }
.u-carousel-indicator[data-p-active="true"] .u-carousel-indicator-button { background: var(--u-carousel-indicator-active-background, #333); }
`;

/** Params passed into `cx('itemList', params)`. */
export interface CarouselItemListParams {
  numVisible?: number;
  vertical?: boolean;
}

const classes = {
  root: (params: { vertical?: boolean } = {}) => [
    "u-carousel u-component",
    { "u-carousel-vertical": params.vertical, "u-carousel-horizontal": !params.vertical },
  ],
  content: () => ["u-carousel-content"],
  contentInner: () => ["u-carousel-content-inner"],
  viewport: () => ["u-carousel-viewport"],
  itemList: () => ["u-carousel-item-list"],
  item: () => ["u-carousel-item"],
  prevButton: () => ["u-carousel-prev-button"],
  nextButton: () => ["u-carousel-next-button"],
  indicatorList: () => ["u-carousel-indicator-list"],
  indicator: (params: { active?: boolean } = {}) => [
    "u-carousel-indicator",
    { "u-carousel-indicator-active": params.active },
  ],
  indicatorButton: () => ["u-carousel-indicator-button"],
};

/** `UBaseComponent`-shaped style module for `UCarousel`. */
export const carouselStyleModule = { css, classes };
