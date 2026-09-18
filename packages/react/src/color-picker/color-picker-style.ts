import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `select-style.ts`'s established React
 * convention (no `dt()` tokens).
 */
const css = /*css*/ `
.u-color-picker { display: inline-block; position: relative; }
.u-color-picker-preview { width: 2rem; height: 2rem; padding: 0; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; }
.u-color-picker-preview-disabled { cursor: default; opacity: 0.6; }
.u-color-picker-panel { position: absolute; top: 100%; left: 0; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 2px 12px rgba(0,0,0,.15); z-index: 1000; }
.u-color-picker-content { display: flex; padding: 0.5rem; gap: 0.5rem; }
.u-color-picker-color-selector { position: relative; width: 150px; height: 150px; cursor: pointer; background: linear-gradient(to top, #000 0%, rgba(0,0,0,0) 100%), linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%); }
.u-color-picker-color-background { width: 100%; height: 100%; }
.u-color-picker-color-handle { position: absolute; top: 0; left: 150px; width: 10px; height: 10px; border: 1px solid #fff; border-radius: 100%; transform: translate(-50%, -50%); cursor: pointer; }
.u-color-picker-hue { position: relative; width: 20px; height: 150px; cursor: pointer; background: linear-gradient(0deg, red 0, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, red); }
.u-color-picker-hue-handle { position: absolute; top: 0; left: 0; margin-left: -3px; margin-top: -5px; width: 24px; height: 10px; border: 2px solid #fff; opacity: 0.85; cursor: pointer; }
`;

export interface ColorPickerPreviewClassesParams {
  disabled?: boolean;
}

const classes = {
  root: "u-color-picker u-component",
  preview: (params: ColorPickerPreviewClassesParams = {}) => [
    "u-color-picker-preview",
    { "u-color-picker-preview-disabled": Boolean(params.disabled) },
  ],
  panel: "u-color-picker-panel",
  content: "u-color-picker-content",
  colorSelector: "u-color-picker-color-selector",
  colorBackground: "u-color-picker-color-background",
  colorHandle: "u-color-picker-color-handle",
  hue: "u-color-picker-hue",
  hueHandle: "u-color-picker-hue-handle",
};

export const colorPickerStyleModule: StyleModule = { css, classes };
