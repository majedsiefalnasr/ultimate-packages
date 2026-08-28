export { default as definePreset } from "./actions/definePreset";
export { default as updatePreset } from "./actions/updatePreset";
export { default as updatePrimaryPalette } from "./actions/updatePrimaryPalette";
export { default as updateSurfacePalette } from "./actions/updateSurfacePalette";
export { default as usePreset } from "./actions/usePreset";
export { default as useTheme } from "./actions/useTheme";

export { default as Theme } from "./config/index";

export { default as mix } from "./helpers/color/mix";
export { default as palette } from "./helpers/color/palette";
export { default as shade } from "./helpers/color/shade";
export { default as tint } from "./helpers/color/tint";
export * from "./helpers/index";

export { default as ThemeService } from "./service/index";

export { default as StyleSheet, type StyleSheetProps, type StyleMeta } from "./stylesheet/index";

export * from "./utils/index";

/**
 * Options accepted by the `dt()` design-token resolver's `fallback` argument
 * when it is passed as a nested style resolver.
 */
export interface StyleOptions {
  dt: (
    key: string,
    fallback?: string | number | Pick<StyleOptions, "dt">
  ) => string | number | undefined;
}

/**
 * A style value: either a literal CSS string, or a function that receives
 * `StyleOptions` (primarily the `dt` token resolver) and returns CSS.
 */
export type StyleType<T = StyleOptions> = string | ((options?: T) => string);

/**
 * Theme configuration options (prefix, dark-mode selector, CSS layer).
 */
export interface ThemeOptions {
  /**
   * The prefix for the theme
   * @default 'p'
   */
  prefix?: string;
  /**
   * Dark mode selector
   * @default 'system'
   */
  darkModeSelector?: string;
  /**
   * Whether to use the css layer
   * @default false
   */
  cssLayer?: boolean | { name?: string; order?: string };
}

/**
 * A generated color palette: shade keys (50-950) to hex color values.
 */
export type ColorScale = {
  0?: string;
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
};
