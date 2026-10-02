import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived progressspinner component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset progressspinner module
 * (`.vendor-extracted/themes/src/presets/aura/progressspinner/index.ts`). Top-level
 * sections `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's progressspinner module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are). `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export const progressSpinner: ComponentTokens = {
  colorScheme: {
    light: {
      root: {
        colorOne: "{red.500}",
        colorTwo: "{blue.500}",
        colorThree: "{green.500}",
        colorFour: "{yellow.500}",
      },
    },
    dark: {
      root: {
        colorOne: "{red.400}",
        colorTwo: "{blue.400}",
        colorThree: "{green.400}",
        colorFour: "{yellow.400}",
      },
    },
  },
};
