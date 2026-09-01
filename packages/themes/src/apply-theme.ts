import { Theme } from "@ultimate/uix-styled";
import { auraPreset } from "./presets/aura";
import type { UltimateThemeMode } from "./contract";

export interface ApplyUltimateThemeOptions {
  /** Defaults to the Ultimate Aura-derived preset. */
  preset?: Record<string, unknown>;
  /** @default 'system' */
  darkModeSelector?: UltimateThemeMode;
  cssLayer?: boolean | { name?: string; order?: string };
}

/**
 * Applies an Ultimate theme preset, framework-agnostically. Call this
 * once before mounting any Ultimate component (Angular/React/Vue) — every
 * `*-core` package's StyleSheet registration reads from the same
 * `Theme` singleton this function configures.
 */
export function applyUltimateTheme(options: ApplyUltimateThemeOptions = {}): void {
  const { preset = auraPreset, darkModeSelector = "system", cssLayer = false } = options;

  Theme.setTheme({
    preset,
    options: {
      prefix: "u",
      darkModeSelector,
      cssLayer,
    },
  });
}
