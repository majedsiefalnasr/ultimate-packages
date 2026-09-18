import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `KnobStyle` (see
 * `.vendor-extracted/vue/knob/style/KnobStyle.js`, sourced from
 * `@primeuix/styles/knob`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/vue/src/password/password-style.ts`.
 */
const css = /*css*/ `
    .u-knob-range {
        fill: none;
        transition: stroke .1s ease-in;
    }

    .u-knob-value {
        fill: none;
    }

    .u-knob-text {
        font-size: 1.3rem;
        text-align: center;
    }
`;

const classes = {
  root: "u-knob u-component",
  range: "u-knob-range",
  value: "u-knob-value",
  text: "u-knob-text",
};

/** `createBaseComponent`-shaped style module for `UKnob`. */
export const knobStyleModule: StyleModule = { css, classes };
