import type { StyleModule } from "@ultimate/vue-core";
import { style as colorPickerStyle } from "@ultimate/uix-styles/colorpicker";

/**
 * `createBaseComponent`-shaped style module for `UColorPicker`. The
 * structural CSS is the shared `@ultimate/uix-styles/colorpicker` module
 * (ADR-082), the same module Angular and React consume, so it reads the Aura
 * `colorpicker` tokens.
 */
const css = /*css*/ `
    ${colorPickerStyle}
`;

/** Params `UColorPicker` passes into `cx('root', params)`. */
export interface ColorPickerRootClassesParams {
  inline?: boolean;
  dragging?: boolean;
}

/** Params `UColorPicker` passes into `cx('preview', params)`. */
export interface ColorPickerPreviewClassesParams {
  disabled?: boolean;
}

/** Params `UColorPicker` passes into `cx('panel', params)`. */
export interface ColorPickerPanelClassesParams {
  inline?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: ColorPickerRootClassesParams = {}) => [
    "u-color-picker u-component",
    {
      "u-color-picker-overlay": !params.inline,
      "u-color-picker-dragging": Boolean(params.dragging),
    },
  ],
  preview: (params: ColorPickerPreviewClassesParams = {}) => [
    "u-color-picker-preview",
    { "p-disabled": Boolean(params.disabled) },
  ],
  panel: (params: ColorPickerPanelClassesParams = {}) => [
    "u-color-picker-panel",
    {
      "u-color-picker-panel-inline": Boolean(params.inline),
      "p-disabled": Boolean(params.disabled),
      "p-invalid": Boolean(params.invalid),
    },
  ],
  content: "u-color-picker-content",
  colorSelector: "u-color-picker-color-selector",
  colorBackground: "u-color-picker-color-background",
  colorHandle: "u-color-picker-color-handle",
  hue: "u-color-picker-hue",
  hueHandle: "u-color-picker-hue-handle",
};

/** `createBaseComponent`-shaped style module for `UColorPicker`. */
export const colorPickerStyleModule: StyleModule = { css, classes };
