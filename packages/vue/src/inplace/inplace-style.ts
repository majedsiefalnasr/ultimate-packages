/**
 * Ultimate-owned adaptation of PrimeVue's `InplaceStyle` (see
 * `.vendor-extracted/vue/inplace/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/inplace` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-inplace-display[data-p-disabled="true"], .u-inplace-display[data-p-disabled="true"] *{cursor: default;pointer-events: none;user-select: none;}
.u-inplace-display[data-p-disabled="true"]{opacity: dt('disabled.opacity');}
.u-inplace-display{display: inline-block;cursor: pointer;border: 1px solid transparent;padding: dt('inplace.padding');border-radius: dt('inplace.border.radius');transition: background dt('inplace.transition.duration'), color dt('inplace.transition.duration'), outline-color dt('inplace.transition.duration'), box-shadow dt('inplace.transition.duration');outline-color: transparent;}
.u-inplace-display:not([data-p-disabled="true"]):hover{background: dt('inplace.display.hover.background');color: dt('inplace.display.hover.color');}
.u-inplace-display:focus-visible{box-shadow: dt('inplace.focus.ring.shadow');outline: dt('inplace.focus.ring.width') dt('inplace.focus.ring.style') dt('inplace.focus.ring.color');outline-offset: dt('inplace.focus.ring.offset');}
.u-inplace-content{display: block;}
`;

const classes = {
  root: () => ["u-inplace u-component"],
  display: "u-inplace-display",
  content: "u-inplace-content",
};

/** `createBaseComponent`-shaped style module for `UInplace`. */
export const inplaceStyleModule = { css, classes };
