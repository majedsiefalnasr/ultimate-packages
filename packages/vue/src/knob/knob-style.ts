import type { StyleModule } from "@ultimate/vue-core";
import { style as knobStyle } from "@ultimate/uix-styles/knob";

/**
 * `createBaseComponent`-shaped style module for `UKnob`. The structural CSS is
 * the shared `@ultimate/uix-styles/knob` module (ADR-082), the same module
 * Angular and React consume, so it reads the Aura `knob` tokens.
 */
const css = /*css*/ `
    ${knobStyle}
`;

/** Params `UKnob` passes into `cx('root', params)`. */
export interface KnobClassesParams {
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: KnobClassesParams = {}) => [
    "u-knob u-component",
    { "p-disabled": Boolean(params.disabled), "p-invalid": Boolean(params.invalid) },
  ],
  range: "u-knob-range",
  value: "u-knob-value",
  text: "u-knob-text",
};

/** `createBaseComponent`-shaped style module for `UKnob`. */
export const knobStyleModule: StyleModule = { css, classes };
