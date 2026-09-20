import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `select-button-style.ts`'s established React
 * convention (no `dt()` tokens).
 */
const css = /*css*/ `
.u-slider { position: relative; background: #e5e7eb; border-radius: 6px; }
.u-slider-horizontal { height: 6px; width: 100%; }
.u-slider-vertical { width: 6px; height: 100%; }
.u-slider-range { position: absolute; display: block; background: #3b82f6; border-radius: 6px; }
.u-slider-horizontal .u-slider-range { top: 0; left: 0; height: 100%; }
.u-slider-vertical .u-slider-range { bottom: 0; left: 0; width: 100%; }
.u-slider-handle { position: absolute; display: block; touch-action: none; cursor: grab; height: 18px; width: 18px; background: #3b82f6; border-radius: 50%; }
.u-slider-horizontal .u-slider-handle { top: 50%; margin-top: -9px; margin-left: -9px; }
.u-slider-vertical .u-slider-handle { left: 50%; margin-left: -9px; margin-bottom: -9px; }
.u-slider-disabled .u-slider-handle { cursor: default; }
`;

export interface SliderClassesParams {
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}

const classes = {
  root: (params: SliderClassesParams = {}) => [
    "u-slider u-component",
    {
      "u-slider-horizontal": params.orientation !== "vertical",
      "u-slider-vertical": params.orientation === "vertical",
      "u-slider-disabled": Boolean(params.disabled),
    },
  ],
  range: "u-slider-range",
  handle: "u-slider-handle",
};

export const sliderStyleModule: StyleModule = { css, classes };
