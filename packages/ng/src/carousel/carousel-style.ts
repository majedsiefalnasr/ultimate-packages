/**
 * Ultimate-owned adaptation of PrimeNG's `CarouselStyle` (see
 * `.vendor-extracted/ng/carousel/style/carouselstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/carousel` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `contextMenuStyleModule`).
 * GAP-064 G3-E: generated from g3e-port.mjs (record E-2).
 */
const css = /*css*/ `
.u-carousel{display: flex;flex-direction: column;}
.u-carousel-content{display: flex;flex-direction: column;overflow: auto;}
.u-carousel-content-inner{display: flex;flex-direction: row;gap: dt('carousel.content.gap');}
.u-carousel-content-inner:dir(rtl){flex-direction: row-reverse;}
.u-carousel-viewport{overflow: hidden;width: 100%;}
.u-carousel-item-list{display: flex;flex-direction: row;}
.u-carousel-item-list:dir(rtl){flex-direction: row-reverse;}
.u-carousel-prev-button, .u-carousel-next-button{align-self: center;flex-shrink: 0;}
.u-carousel-indicator-list{display: flex;flex-direction: row;justify-content: center;flex-wrap: wrap;padding: dt('carousel.indicator.list.padding');gap: dt('carousel.indicator.list.gap');margin: 0;list-style: none;}
.u-carousel-indicator-button{display: flex;align-items: center;justify-content: center;background: dt('carousel.indicator.background');width: dt('carousel.indicator.width');height: dt('carousel.indicator.height');border: 0 none;transition: background dt('carousel.transition.duration'), color dt('carousel.transition.duration'), outline-color dt('carousel.transition.duration'), box-shadow dt('carousel.transition.duration');outline-color: transparent;border-radius: dt('carousel.indicator.border.radius');padding: 0;margin: 0;user-select: none;cursor: pointer;}
.u-carousel-indicator-button:focus-visible{box-shadow: dt('carousel.indicator.focus.ring.shadow');outline: dt('carousel.indicator.focus.ring.width') dt('carousel.indicator.focus.ring.style') dt('carousel.indicator.focus.ring.color');outline-offset: dt('carousel.indicator.focus.ring.offset');}
.u-carousel-indicator-button:hover{background: dt('carousel.indicator.hover.background');}
.u-carousel-indicator-active .u-carousel-indicator-button{background: dt('carousel.indicator.active.background');}
.u-carousel-vertical .u-carousel-content-inner{flex-direction: column;}
.u-carousel-vertical .u-carousel-item-list{flex-direction: column;height: 100%;}
.u-carousel-item-list{transition: transform 500ms ease 0s;}
.u-carousel-item{flex-shrink: 0;box-sizing: border-box;}
.u-carousel-prev-button:disabled, .u-carousel-next-button:disabled{opacity: 0.5;cursor: default;pointer-events: none;}
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
