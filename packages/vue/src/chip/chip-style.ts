/**
 * Ultimate-owned adaptation of PrimeVue's `ChipStyle` (see
 * `.vendor-extracted/vue/chip/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/chip` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-chip{display: inline-flex;align-items: center;background: dt('chip.background');color: dt('chip.color');border-radius: dt('chip.border.radius');padding-block: dt('chip.padding.y');padding-inline: dt('chip.padding.x');gap: dt('chip.gap');}
.u-chip-icon{color: dt('chip.icon.color');font-size: dt('chip.icon.size');width: dt('chip.icon.size');height: dt('chip.icon.size');}
.u-chip-image{border-radius: 50%;width: dt('chip.image.width');height: dt('chip.image.height');margin-inline-start: calc(-1 * dt('chip.padding.y'));}
.u-chip:has(.u-chip-remove-icon){padding-inline-end: dt('chip.padding.y');}
.u-chip:has(.u-chip-image){padding-block-start: calc(dt('chip.padding.y') / 2);padding-block-end: calc(dt('chip.padding.y') / 2);}
.u-chip-remove-icon{cursor: pointer;font-size: dt('chip.remove.icon.size');width: dt('chip.remove.icon.size');height: dt('chip.remove.icon.size');color: dt('chip.remove.icon.color');border-radius: 50%;transition: outline-color dt('chip.transition.duration'), box-shadow dt('chip.transition.duration');outline-color: transparent;}
.u-chip-remove-icon:focus-visible{box-shadow: dt('chip.remove.icon.focus.ring.shadow');outline: dt('chip.remove.icon.focus.ring.width') dt('chip.remove.icon.focus.ring.style') dt('chip.remove.icon.focus.ring.color');outline-offset: dt('chip.remove.icon.focus.ring.offset');}
.u-chip-label{line-height: 1.5;padding: 0.25rem 0;}
`;

const classes = {
  root: () => ["u-chip u-component"],
  image: "u-chip-image",
  icon: "u-chip-icon",
  label: "u-chip-label",
  removeIcon: "u-chip-remove-icon",
};

/** `createBaseComponent`-shaped style module for `UChip`. */
export const chipStyleModule = { css, classes };
