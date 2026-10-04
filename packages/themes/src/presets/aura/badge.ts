import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived badge component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset badge module
 * (`.vendor-extracted/themes/src/presets/aura/badge/index.ts`). Top-level
 * sections `root`, `dot`, `sm`, `lg`, `xl` and `colorScheme` are transcribed
 * as-is from the extracted upstream source (GAP-064 Tranche 1).
 *
 * Upstream's badge module HAS a `colorScheme` split, so it is typed against the
 * `ComponentTokens` contract, extended by a local `BadgeComponentTokens` because
 * the contract only models `root` + `colorScheme` and upstream also has `dot`,
 * `sm`, `lg`, `xl` sections outside the split. `colorScheme.light` and
 * `colorScheme.dark` are transcribed as-is.
 */
export interface BadgeComponentTokens extends ComponentTokens {
  dot?: Record<string, unknown>;
  sm?: Record<string, unknown>;
  lg?: Record<string, unknown>;
  xl?: Record<string, unknown>;
}

export const badge: BadgeComponentTokens = {
  root: {
    borderRadius: "{border.radius.md}",
    padding: "0 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    minWidth: "1.5rem",
    height: "1.5rem",
  },
  dot: {
    size: "0.5rem",
  },
  sm: {
    fontSize: "0.625rem",
    minWidth: "1.25rem",
    height: "1.25rem",
  },
  lg: {
    fontSize: "0.875rem",
    minWidth: "1.75rem",
    height: "1.75rem",
  },
  xl: {
    fontSize: "1rem",
    minWidth: "2rem",
    height: "2rem",
  },
  colorScheme: {
    light: {
      primary: { background: "{primary.color}", color: "{primary.contrast.color}" },
      secondary: { background: "{surface.100}", color: "{surface.600}" },
      success: { background: "{green.500}", color: "{surface.0}" },
      info: { background: "{sky.500}", color: "{surface.0}" },
      warn: { background: "{orange.500}", color: "{surface.0}" },
      danger: { background: "{red.500}", color: "{surface.0}" },
      contrast: { background: "{surface.950}", color: "{surface.0}" },
    },
    dark: {
      primary: { background: "{primary.color}", color: "{primary.contrast.color}" },
      secondary: { background: "{surface.800}", color: "{surface.300}" },
      success: { background: "{green.400}", color: "{green.950}" },
      info: { background: "{sky.400}", color: "{sky.950}" },
      warn: { background: "{orange.400}", color: "{orange.950}" },
      danger: { background: "{red.400}", color: "{red.950}" },
      contrast: { background: "{surface.0}", color: "{surface.950}" },
    },
  },
};
