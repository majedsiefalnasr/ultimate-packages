import type { StyleModule } from "@ultimate/vue-core";
import { style as sliderStyle } from "@ultimate/uix-styles/slider";

/**
 * `createBaseComponent`-shaped style module for `USlider`. The structural CSS
 * is the shared `@ultimate/uix-styles/slider` module (ADR-082), the same
 * module Angular and React consume, so it reads the Aura `slider` tokens.
 */
const css = /*css*/ `
    ${sliderStyle}
`;

/** Params `USlider` passes into `cx('root', params)`. */
export interface SliderClassesParams {
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: SliderClassesParams = {}) => [
    "u-slider u-component",
    {
      "u-slider-horizontal": params.orientation !== "vertical",
      "u-slider-vertical": params.orientation === "vertical",
      "p-disabled": Boolean(params.disabled),
      "p-invalid": Boolean(params.invalid),
    },
  ],
  range: "u-slider-range",
  handle: "u-slider-handle",
};

/** `createBaseComponent`-shaped style module for `USlider`. */
export const sliderStyleModule: StyleModule = { css, classes };
