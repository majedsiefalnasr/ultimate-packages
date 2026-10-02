import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived password component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset password module
 * (`.vendor-extracted/themes/src/presets/aura/password/index.ts`). Top-level
 * sections `meter`, `icon`, `overlay`, `content` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's password module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `PasswordComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `meter`, `icon`, `overlay`, `content` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface PasswordComponentTokens extends ComponentTokens {
  meter?: Record<string, unknown>;
  icon?: Record<string, unknown>;
  overlay?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export const password: PasswordComponentTokens = {
  meter: {
    background: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    height: ".75rem",
  },
  icon: {
    color: "{form.field.icon.color}",
  },
  overlay: {
    background: "{overlay.popover.background}",
    borderColor: "{overlay.popover.border.color}",
    borderRadius: "{overlay.popover.border.radius}",
    color: "{overlay.popover.color}",
    padding: "{overlay.popover.padding}",
    shadow: "{overlay.popover.shadow}",
  },
  content: {
    gap: "0.5rem",
  },
  colorScheme: {
    light: {
      strength: {
        weakBackground: "{red.500}",
        mediumBackground: "{amber.500}",
        strongBackground: "{green.500}",
      },
    },
    dark: {
      strength: {
        weakBackground: "{red.400}",
        mediumBackground: "{amber.400}",
        strongBackground: "{green.400}",
      },
    },
  },
};
