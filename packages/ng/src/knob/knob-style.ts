import { style as knobStyle } from "@ultimate/uix-styles/knob";

/**
 * Ultimate-owned adaptation of PrimeNG's `KnobStyle` (see
 * `.vendor-extracted/ng/knob/style/knobstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/knob` module (ADR-082), so it reads
 * the Aura `knob` tokens and matches React and Vue.
 */
const css = /*css*/ `
    ${knobStyle}
`;

/** Params `UKnob` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface KnobClassesParams {
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: KnobClassesParams = {}) => [
    "u-knob u-component",
    { "p-disabled": params.disabled, "p-invalid": params.invalid },
  ],
  range: "u-knob-range",
  value: "u-knob-value",
  text: "u-knob-text",
};

/** `UBaseComponent`-shaped style module for `UKnob`. */
export const knobStyleModule = { css, classes };
