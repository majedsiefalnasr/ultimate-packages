import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived colorpicker component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset colorpicker module
 * (`.vendor-extracted/themes/src/presets/aura/colorpicker/index.ts`). Top-level
 * sections `root`, `preview`, `panel` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's colorpicker module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `ColorPickerComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `preview`, `panel` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface ColorPickerComponentTokens extends ComponentTokens {
  preview?: Record<string, unknown>;
  panel?: Record<string, unknown>;
}

export const colorPicker: ColorPickerComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  preview: {
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "{form.field.border.radius}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  panel: {
    shadow: "{overlay.popover.shadow}",
    borderRadius: "{overlay.popover.borderRadius}",
  },
  colorScheme: {
    light: {
      panel: {
        background: "{surface.800}",
        borderColor: "{surface.900}",
      },
      handle: {
        color: "{surface.0}",
      },
    },
    dark: {
      panel: {
        background: "{surface.900}",
        borderColor: "{surface.700}",
      },
      handle: {
        color: "{surface.0}",
      },
    },
  },
};
