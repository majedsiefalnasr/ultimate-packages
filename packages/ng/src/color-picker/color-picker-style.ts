import { style as colorPickerStyle } from "@ultimate/uix-styles/colorpicker";

/**
 * Ultimate-owned adaptation of PrimeNG's `ColorPickerStyle` (see
 * `.vendor-extracted/ng/colorpicker/style/colorpickerstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. The
 * structural CSS is the shared `@ultimate/uix-styles/colorpicker` module
 * (ADR-082), so it reads the Aura `colorpicker` tokens and matches React and
 * Vue.
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
}

const classes = {
  root: (params: ColorPickerRootClassesParams = {}) => [
    "u-color-picker u-component",
    { "u-color-picker-overlay": !params.inline, "u-color-picker-dragging": params.dragging },
  ],
  preview: (params: ColorPickerPreviewClassesParams = {}) => [
    "u-color-picker-preview",
    { "p-disabled": params.disabled },
  ],
  panel: (params: ColorPickerPanelClassesParams = {}) => [
    "u-color-picker-panel",
    { "u-color-picker-panel-inline": params.inline, "p-disabled": params.disabled },
  ],
  content: "u-color-picker-content",
  colorSelector: "u-color-picker-color-selector",
  colorBackground: "u-color-picker-color-background",
  colorHandle: "u-color-picker-color-handle",
  hue: "u-color-picker-hue",
  hueHandle: "u-color-picker-hue-handle",
};

/** `UBaseComponent`-shaped style module for `UColorPicker`. */
export const colorPickerStyleModule = { css, classes };
