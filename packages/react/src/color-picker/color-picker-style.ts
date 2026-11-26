import type { StyleModule } from "@ultimate/react-core";
import { style as colorPickerStyle } from "@ultimate/uix-styles/colorpicker";

/**
 * `useComponentBase`-shaped style module for `UColorPicker`. The structural
 * CSS is the shared `@ultimate/uix-styles/colorpicker` module (ADR-082), so
 * it reads the Aura `colorpicker` tokens (ADR-067) and matches Angular and
 * Vue.
 */
const css = /*css*/ `
    ${colorPickerStyle}
`;

export interface ColorPickerRootClassesParams {
  inline?: boolean;
  dragging?: boolean;
}

export interface ColorPickerPreviewClassesParams {
  disabled?: boolean;
}

export interface ColorPickerPanelClassesParams {
  inline?: boolean;
  disabled?: boolean;
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
    },
  ],
  content: "u-color-picker-content",
  colorSelector: "u-color-picker-color-selector",
  colorBackground: "u-color-picker-color-background",
  colorHandle: "u-color-picker-color-handle",
  hue: "u-color-picker-hue",
  hueHandle: "u-color-picker-hue-handle",
};

export const colorPickerStyleModule: StyleModule = { css, classes };
