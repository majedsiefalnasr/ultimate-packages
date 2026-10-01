import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived selectbutton component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset selectbutton module
 * (`.vendor-extracted/themes/src/presets/aura/selectbutton/index.ts`). Top-level
 * sections `root` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's selectbutton module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are). `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export const selectButton: ComponentTokens = {
  root: {
    borderRadius: "{form.field.border.radius}",
  },
  colorScheme: {
    light: {
      root: {
        invalidBorderColor: "{form.field.invalid.border.color}",
      },
    },
    dark: {
      root: {
        invalidBorderColor: "{form.field.invalid.border.color}",
      },
    },
  },
};
