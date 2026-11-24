import { style as sliderStyle } from "@ultimate/uix-styles/slider";

/**
 * Ultimate-owned adaptation of PrimeNG's `SliderStyle` (see
 * `.vendor-extracted/ng/slider/style/sliderstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/slider` module (ADR-082), so it
 * reads the Aura `slider` tokens and matches React and Vue.
 */
const css = /*css*/ `
    ${sliderStyle}
`;

/** Params `USlider` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
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
      "p-disabled": params.disabled,
      "p-invalid": params.invalid,
    },
  ],
  range: "u-slider-range",
  handle: "u-slider-handle",
};

/** `UBaseComponent`-shaped style module for `USlider`. */
export const sliderStyleModule = { css, classes };
