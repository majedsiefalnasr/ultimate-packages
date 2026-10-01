import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived inputchips component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inputchips module
 * (`.vendor-extracted/themes/src/presets/aura/inputchips/index.ts`). Top-level
 * sections `root`, `chip` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's inputchips module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `InputChipsComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `chip` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface InputChipsComponentTokens extends ComponentTokens {
  chip?: Record<string, unknown>;
}

export const inputChips: InputChipsComponentTokens = {
  root: {
    background: "{form.field.background}",
    disabledBackground: "{form.field.disabled.background}",
    filledBackground: "{form.field.filled.background}",
    filledFocusBackground: "{form.field.filled.focus.background}",
    borderColor: "{form.field.border.color}",
    hoverBorderColor: "{form.field.hover.border.color}",
    focusBorderColor: "{form.field.focus.border.color}",
    invalidBorderColor: "{form.field.invalid.border.color}",
    color: "{form.field.color}",
    disabledColor: "{form.field.disabled.color}",
    placeholderColor: "{form.field.placeholder.color}",
    shadow: "{form.field.shadow}",
    paddingX: "{form.field.padding.x}",
    paddingY: "{form.field.padding.y}",
    borderRadius: "{form.field.border.radius}",
    focusRing: {
      width: "{form.field.focus.ring.width}",
      style: "{form.field.focus.ring.style}",
      color: "{form.field.focus.ring.color}",
      offset: "{form.field.focus.ring.offset}",
      shadow: "{form.field.focus.ring.shadow}",
    },
    transitionDuration: "{form.field.transition.duration}",
  },
  chip: {
    borderRadius: "{border.radius.sm}",
  },
  colorScheme: {
    light: {
      chip: {
        focusBackground: "{surface.200}",
        color: "{surface.800}",
      },
    },
    dark: {
      chip: {
        focusBackground: "{surface.700}",
        color: "{surface.0}",
      },
    },
  },
};
