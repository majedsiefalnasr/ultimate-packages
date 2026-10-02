import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived tag component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset tag module
 * (`.vendor-extracted/themes/src/presets/aura/tag/index.ts`). Top-level
 * sections `root`, `icon` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's tag module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `TagComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `icon` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface TagComponentTokens extends ComponentTokens {
  icon?: Record<string, unknown>;
}

export const tag: TagComponentTokens = {
  root: {
    fontSize: "0.875rem",
    fontWeight: "700",
    padding: "0.25rem 0.5rem",
    gap: "0.25rem",
    borderRadius: "{content.border.radius}",
    roundedBorderRadius: "{border.radius.xl}",
  },
  icon: {
    size: "0.75rem",
  },
  colorScheme: {
    light: {
      primary: {
        background: "{primary.100}",
        color: "{primary.700}",
      },
      secondary: {
        background: "{surface.100}",
        color: "{surface.600}",
      },
      success: {
        background: "{green.100}",
        color: "{green.700}",
      },
      info: {
        background: "{sky.100}",
        color: "{sky.700}",
      },
      warn: {
        background: "{orange.100}",
        color: "{orange.700}",
      },
      danger: {
        background: "{red.100}",
        color: "{red.700}",
      },
      contrast: {
        background: "{surface.950}",
        color: "{surface.0}",
      },
    },
    dark: {
      primary: {
        background: "color-mix(in srgb, {primary.500}, transparent 84%)",
        color: "{primary.300}",
      },
      secondary: {
        background: "{surface.800}",
        color: "{surface.300}",
      },
      success: {
        background: "color-mix(in srgb, {green.500}, transparent 84%)",
        color: "{green.300}",
      },
      info: {
        background: "color-mix(in srgb, {sky.500}, transparent 84%)",
        color: "{sky.300}",
      },
      warn: {
        background: "color-mix(in srgb, {orange.500}, transparent 84%)",
        color: "{orange.300}",
      },
      danger: {
        background: "color-mix(in srgb, {red.500}, transparent 84%)",
        color: "{red.300}",
      },
      contrast: {
        background: "{surface.0}",
        color: "{surface.950}",
      },
    },
  },
};
