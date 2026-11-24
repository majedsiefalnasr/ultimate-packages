import type { StyleModule } from "@ultimate/react-core";
import { style as sliderStyle } from "@ultimate/uix-styles/slider";

/**
 * `useComponentBase`-shaped style module for `USlider`. The structural CSS is
 * the shared `@ultimate/uix-styles/slider` module (ADR-082), so it reads the
 * Aura `slider` tokens (ADR-067) and matches Angular and Vue.
 */
const css = /*css*/ `
    ${sliderStyle}
`;

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

export const sliderStyleModule: StyleModule = { css, classes };
