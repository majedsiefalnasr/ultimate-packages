import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived skeleton component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset skeleton module
 * (`.vendor-extracted/themes/src/presets/aura/skeleton/index.ts`). Top-level
 * sections `root` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's skeleton module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are). `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export const skeleton: ComponentTokens = {
  root: {
    borderRadius: "{content.border.radius}",
  },
  colorScheme: {
    light: {
      root: {
        background: "{surface.200}",
        animationBackground: "rgba(255,255,255,0.4)",
      },
    },
    dark: {
      root: {
        background: "rgba(255, 255, 255, 0.06)",
        animationBackground: "rgba(255, 255, 255, 0.04)",
      },
    },
  },
};
