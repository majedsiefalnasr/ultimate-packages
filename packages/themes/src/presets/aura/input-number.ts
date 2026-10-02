import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived inputnumber component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inputnumber module
 * (`.vendor-extracted/themes/src/presets/aura/inputnumber/index.ts`). Top-level
 * sections `root`, `button` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's inputnumber module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `InputNumberComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `button` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface InputNumberComponentTokens extends ComponentTokens {
  button?: Record<string, unknown>;
}

export const inputNumber: InputNumberComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  button: {
    width: "2.5rem",
    borderRadius: "{form.field.border.radius}",
    verticalPadding: "{form.field.padding.y}",
  },
  colorScheme: {
    light: {
      button: {
        background: "transparent",
        hoverBackground: "{surface.100}",
        activeBackground: "{surface.200}",
        borderColor: "{form.field.border.color}",
        hoverBorderColor: "{form.field.border.color}",
        activeBorderColor: "{form.field.border.color}",
        color: "{surface.400}",
        hoverColor: "{surface.500}",
        activeColor: "{surface.600}",
      },
    },
    dark: {
      button: {
        background: "transparent",
        hoverBackground: "{surface.800}",
        activeBackground: "{surface.700}",
        borderColor: "{form.field.border.color}",
        hoverBorderColor: "{form.field.border.color}",
        activeBorderColor: "{form.field.border.color}",
        color: "{surface.400}",
        hoverColor: "{surface.300}",
        activeColor: "{surface.200}",
      },
    },
  },
};
