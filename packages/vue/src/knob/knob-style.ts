import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `KnobStyle` (see
 * `.vendor-extracted/vue/knob/style/KnobStyle.js`, sourced from
 * `@primeuix/styles/knob`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/vue/src/password/password-style.ts`.
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-knob-range{fill: none;transition: stroke 0.1s ease-in;}
.u-knob-value{animation-name: u-knob-dash-frame;animation-fill-mode: forwards;fill: none;}
.u-knob-text{font-size: 1.3rem;text-align: center;}
.u-knob svg{border-radius: 50%;outline-color: transparent;transition: background dt('knob.transition.duration'), color dt('knob.transition.duration'), outline-color dt('knob.transition.duration'), box-shadow dt('knob.transition.duration');}
.u-knob svg:focus-visible{box-shadow: dt('knob.focus.ring.shadow');outline: dt('knob.focus.ring.width') dt('knob.focus.ring.style') dt('knob.focus.ring.color');outline-offset: dt('knob.focus.ring.offset');}
@keyframes u-knob-dash-frame{100%{stroke-dashoffset: 0;}}
`;

const classes = {
  root: "u-knob u-component",
  range: "u-knob-range",
  value: "u-knob-value",
  text: "u-knob-text",
};

/** `createBaseComponent`-shaped style module for `UKnob`. */
export const knobStyleModule: StyleModule = { css, classes };
