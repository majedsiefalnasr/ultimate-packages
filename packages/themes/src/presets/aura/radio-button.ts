/**
 * Ultimate Aura-derived radiobutton component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset radiobutton module
 * (`.vendor-extracted/themes/src/presets/aura/radiobutton/index.ts`). Top-level
 * sections `root`, `icon` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's radiobutton module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `RadioButtonComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface RadioButtonComponentTokens {
  root?: Record<string, unknown>;
  icon?: Record<string, unknown>;
}

export const radioButton: RadioButtonComponentTokens = {
  root: {
    width: "1.25rem",
    height: "1.25rem",
    background: "{form.field.background}",
    checkedBackground: "{primary.color}",
    checkedHoverBackground: "{primary.hover.color}",
    disabledBackground: "{form.field.disabled.background}",
    filledBackground: "{form.field.filled.background}",
    borderColor: "{form.field.border.color}",
    hoverBorderColor: "{form.field.hover.border.color}",
    focusBorderColor: "{form.field.border.color}",
    checkedBorderColor: "{primary.color}",
    checkedHoverBorderColor: "{primary.hover.color}",
    checkedFocusBorderColor: "{primary.color}",
    checkedDisabledBorderColor: "{form.field.border.color}",
    invalidBorderColor: "{form.field.invalid.border.color}",
    shadow: "{form.field.shadow}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
    transitionDuration: "{form.field.transition.duration}",
    sm: {
      width: "1rem",
      height: "1rem",
    },
    lg: {
      width: "1.5rem",
      height: "1.5rem",
    },
  },
  icon: {
    size: "0.75rem",
    checkedColor: "{primary.contrast.color}",
    checkedHoverColor: "{primary.contrast.color}",
    disabledColor: "{form.field.disabled.color}",
    sm: {
      size: "0.5rem",
    },
    lg: {
      size: "1rem",
    },
  },
};
