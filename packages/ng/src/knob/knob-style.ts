/**
 * Ultimate-owned adaptation of PrimeNG's `KnobStyle` (see
 * `.vendor-extracted/ng/knob/style/knobstyle.ts`, sourced from
 * `@primeuix/styles/knob`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `password-style.ts`: no `@ultimate/uix-styles/knob`
 * subpath exists yet and this task may not add one.
 */
const css = /*css*/ `
    .u-knob-range {
        fill: none;
        transition: stroke.1s ease-in;
    }

    .u-knob-value {
        fill: none;
        animation: dash 1s ease-in-out;
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

/** `UBaseComponent`-shaped style module for `UKnob`. */
export const knobStyleModule = { css, classes };
