import type { StyleModule } from "@ultimate/react-core";
import { style as knobStyle } from "@ultimate/uix-styles/knob";

/**
 * `useComponentBase`-shaped style module for `UKnob`. The structural CSS is
 * the shared `@ultimate/uix-styles/knob` module (ADR-082), so it reads the
 * Aura `knob` tokens (ADR-067) and matches Angular and Vue.
 */
const css = /*css*/ `
    ${knobStyle}
`;

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

export const knobStyleModule: StyleModule = { css, classes };
