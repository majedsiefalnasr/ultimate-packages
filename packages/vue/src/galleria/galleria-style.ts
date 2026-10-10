/**
 * Ultimate-owned adaptation of PrimeVue's `GalleriaStyle` (see
 * `.vendor-extracted/vue/galleria/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/galleria` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-E: generated from g3e-port.mjs (record E-2).
 */
const css = /*css*/ `
.u-galleria-mask{background: dt('mask.background');color: dt('mask.color');}
.u-galleria-prev-button:disabled, .u-galleria-next-button:disabled{opacity: dt('disabled.opacity');}
.u-galleria{overflow: hidden;border-style: solid;border-width: dt('galleria.border.width');border-color: dt('galleria.border.color');border-radius: dt('galleria.border.radius');}
.u-galleria{display: flex;flex-direction: column;}
.u-galleria-item-wrapper{display: flex;flex-direction: column;position: relative;}
.u-galleria-item-container{position: relative;display: flex;height: 100%;}
.u-galleria-prev-button, .u-galleria-next-button{position: absolute !important;top: 50%;display: inline-flex;justify-content: center;align-items: center;overflow: hidden;background: dt('galleria.nav.button.background');color: dt('galleria.nav.button.color');width: dt('galleria.nav.button.size');height: dt('galleria.nav.button.size');transition: background dt('galleria.transition.duration'), color dt('galleria.transition.duration'), outline-color dt('galleria.transition.duration'), box-shadow dt('galleria.transition.duration');margin: calc(-1 * calc(dt('galleria.nav.button.size')) / 2) dt('galleria.nav.button.gutter') 0 dt('galleria.nav.button.gutter');padding: 0;user-select: none;border: 0 none;cursor: pointer;outline-color: transparent;}
.u-galleria-prev-button:not(:disabled):hover, .u-galleria-next-button:not(:disabled):hover{background: dt('galleria.nav.button.hover.background');color: dt('galleria.nav.button.hover.color');}
.u-galleria-prev-button:not(:disabled):focus-visible, .u-galleria-next-button:not(:disabled):focus-visible{box-shadow: dt('galleria.nav.button.focus.ring.shadow');outline: dt('galleria.nav.button.focus.ring.width') dt('galleria.nav.button.focus.ring.style') dt('galleria.nav.button.focus.ring.color');outline-offset: dt('galleria.nav.button.focus.ring.offset');}
.u-galleria-prev-button{border-radius: dt('galleria.nav.button.prev.border.radius');left: 0;}
.u-galleria-next-button{border-radius: dt('galleria.nav.button.next.border.radius');right: 0;}
.u-galleria-prev-button:dir(rtl){left: auto;right: 0;transform: rotate(180deg);}
.u-galleria-next-button:dir(rtl){right: auto;left: 0;transform: rotate(180deg);}
.u-galleria-item-container{display: flex;justify-content: center;align-items: center;height: 100%;width: 100%;}
.u-galleria-thumbnail-list{display: flex;flex-direction: row;background: dt('galleria.thumbnails.content.background');padding: dt('galleria.thumbnails.content.padding');}
.u-galleria-thumbnail-list{display: flex;}
.u-galleria-thumbnail-item{overflow: auto;display: flex;align-items: center;justify-content: center;cursor: pointer;opacity: 0.5;}
.u-galleria-thumbnail-item{outline-color: transparent;}
.u-galleria-thumbnail-item:hover{opacity: 1;transition: opacity 0.3s;}
.u-galleria-thumbnail-item-active{opacity: 1;}
.u-galleria-mask{position: fixed;top: 0;left: 0;width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;}
.u-galleria-close-button{position: absolute !important;top: 0;right: 0;display: flex;justify-content: center;align-items: center;overflow: hidden;margin: dt('galleria.close.button.gutter');background: dt('galleria.close.button.background');color: dt('galleria.close.button.color');width: dt('galleria.close.button.size');height: dt('galleria.close.button.size');padding: 0;border: none;user-select: none;cursor: pointer;border-radius: dt('galleria.close.button.border.radius');outline-color: transparent;transition: background dt('galleria.transition.duration'), color dt('galleria.transition.duration'), outline-color dt('galleria.transition.duration');}
.u-galleria-close-button svg{font-size: dt('galleria.close.button.icon.size');width: dt('galleria.close.button.icon.size');height: dt('galleria.close.button.icon.size');}
.u-galleria-close-button:hover{background: dt('galleria.close.button.hover.background');color: dt('galleria.close.button.hover.color');}
.u-galleria-close-button:focus-visible{box-shadow: dt('galleria.close.button.focus.ring.shadow');outline: dt('galleria.close.button.focus.ring.width') dt('galleria.close.button.focus.ring.style') dt('galleria.close.button.focus.ring.color');outline-offset: dt('galleria.close.button.focus.ring.offset');}
.u-galleria-mask .u-galleria-prev-button, .u-galleria-mask .u-galleria-next-button{position: fixed;top: 50%;}
.u-galleria-mask{z-index: 1100;}
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

/** `createBaseComponent`-shaped style module for `UGalleria`. */
export const galleriaStyleModule = { css, classes };
