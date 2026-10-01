import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived chip component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset chip module
 * (`.vendor-extracted/themes/src/presets/aura/chip/index.ts`). Top-level
 * sections `root`, `image`, `icon`, `removeIcon` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's chip module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `ChipComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `image`, `icon`, `removeIcon` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface ChipComponentTokens extends ComponentTokens {
  image?: Record<string, unknown>;
  icon?: Record<string, unknown>;
  removeIcon?: Record<string, unknown>;
}

export const chip: ChipComponentTokens = {
  root: {
    borderRadius: "16px",
    paddingX: "0.75rem",
    paddingY: "0.5rem",
    gap: "0.5rem",
    transitionDuration: "{transition.duration}",
  },
  image: {
    width: "2rem",
    height: "2rem",
  },
  icon: {
    size: "1rem",
  },
  removeIcon: {
    size: "1rem",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{form.field.focus.ring.shadow}",
    },
  },
  colorScheme: {
    light: {
      root: {
        background: "{surface.100}",
        color: "{surface.800}",
      },
      icon: {
        color: "{surface.800}",
      },
      removeIcon: {
        color: "{surface.800}",
      },
    },
    dark: {
      root: {
        background: "{surface.800}",
        color: "{surface.0}",
      },
      icon: {
        color: "{surface.0}",
      },
      removeIcon: {
        color: "{surface.0}",
      },
    },
  },
};
