import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived togglebutton component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset togglebutton module
 * (`.vendor-extracted/themes/src/presets/aura/togglebutton/index.ts`). Top-level
 * sections `root`, `icon`, `content` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's togglebutton module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `ToggleButtonComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `icon`, `content` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface ToggleButtonComponentTokens extends ComponentTokens {
  icon?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export const toggleButton: ToggleButtonComponentTokens = {
  root: {
    padding: "0.25rem",
    borderRadius: "{content.border.radius}",
    gap: "0.5rem",
    fontWeight: "500",
    disabledBackground: "{form.field.disabled.background}",
    disabledBorderColor: "{form.field.disabled.background}",
    disabledColor: "{form.field.disabled.color}",
    invalidBorderColor: "{form.field.invalid.border.color}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
    transitionDuration: "{form.field.transition.duration}",
    sm: {
      fontSize: "{form.field.sm.font.size}",
      padding: "0.25rem",
    },
    lg: {
      fontSize: "{form.field.lg.font.size}",
      padding: "0.25rem",
    },
  },
  icon: {
    disabledColor: "{form.field.disabled.color}",
  },
  content: {
    padding: "0.25rem 0.75rem",
    borderRadius: "{content.border.radius}",
    checkedShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.02), 0px 1px 2px 0px rgba(0, 0, 0, 0.04)",
    sm: {
      padding: "0.25rem 0.75rem",
    },
    lg: {
      padding: "0.25rem 0.75rem",
    },
  },
  colorScheme: {
    light: {
      root: {
        background: "{surface.100}",
        checkedBackground: "{surface.100}",
        hoverBackground: "{surface.100}",
        borderColor: "{surface.100}",
        color: "{surface.500}",
        hoverColor: "{surface.700}",
        checkedColor: "{surface.900}",
        checkedBorderColor: "{surface.100}",
      },
      content: {
        checkedBackground: "{surface.0}",
      },
      icon: {
        color: "{surface.500}",
        hoverColor: "{surface.700}",
        checkedColor: "{surface.900}",
      },
    },
    dark: {
      root: {
        background: "{surface.950}",
        checkedBackground: "{surface.950}",
        hoverBackground: "{surface.950}",
        borderColor: "{surface.950}",
        color: "{surface.400}",
        hoverColor: "{surface.300}",
        checkedColor: "{surface.0}",
        checkedBorderColor: "{surface.950}",
      },
      content: {
        checkedBackground: "{surface.800}",
      },
      icon: {
        color: "{surface.400}",
        hoverColor: "{surface.300}",
        checkedColor: "{surface.0}",
      },
    },
  },
};
