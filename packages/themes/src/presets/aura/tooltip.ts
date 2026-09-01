import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived tooltip component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset tooltip module
 * (`.vendor-extracted/themes/src/presets/aura/tooltip/index.ts`, recovered
 * in Task 9). `root` sizing tokens and the `colorScheme.light`/
 * `colorScheme.dark` values are transcribed as-is from the extracted
 * upstream source — including the real upstream finding that light and
 * dark tooltip colors are identical (`{surface.700}` background,
 * `{surface.0}` text, in both modes). This is not a defect; it is ported
 * faithfully rather than "corrected".
 */
export interface TooltipColorSchemeTokens {
  root?: {
    background?: string;
    color?: string;
  };
}

export const tooltip: ComponentTokens<TooltipColorSchemeTokens> = {
  root: {
    maxWidth: "12.5rem",
    gutter: "0.25rem",
    shadow: "{overlay.popover.shadow}",
    padding: "0.5rem 0.75rem",
    borderRadius: "{overlay.popover.border.radius}",
  },
  colorScheme: {
    light: {
      root: {
        background: "{surface.700}",
        color: "{surface.0}",
      },
    },
    dark: {
      root: {
        background: "{surface.700}",
        color: "{surface.0}",
      },
    },
  },
};
