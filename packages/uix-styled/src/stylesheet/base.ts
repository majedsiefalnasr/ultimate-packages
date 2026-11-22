import { style as baseCss } from "@ultimate/uix-styles/base";
import { registerComponentCss } from "./theme-variables";
import type StyleSheet from "./index";

/** Reserved style key for the shared base module of `@ultimate/uix-styles` (A6, ADR-081). */
export const SHARED_BASE_KEY = "u-base";

/**
 * Registers the shared `@ultimate/uix-styles/base` module into `sheet` once,
 * with its `dt()` references resolved and kept current after theme changes.
 * Each core calls it once, next to `registerThemeVariables`, so an unstyled
 * instance (which skips both) does not load it. The base module holds the
 * `u-*` disabled, icon, overlay-mask, anchored-overlay and collapsible rules;
 * the page-wide `box-sizing` rule of Prime's base is not part of it (ADR-063).
 */
export function registerSharedBase(sheet: StyleSheet<any>): void {
  registerComponentCss(sheet, SHARED_BASE_KEY, baseCss);
}
