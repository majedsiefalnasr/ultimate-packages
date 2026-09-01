/**
 * Ultimate Aura-derived checkbox component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset checkbox module
 * (`.vendor-extracted/themes/src/presets/aura/checkbox/index.ts`, recovered
 * in Task 9). `root` and `icon` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's checkbox module has NO `colorScheme`
 * split — every value below references semantic tokens instead (e.g.
 * `{form.field.background}`, `{primary.color}`), and mode-awareness flows
 * transitively through those semantic references, which ARE mode-split in
 * `base.ts`. This type is intentionally a flat `Record<string, unknown>`
 * shape rather than `ComponentTokens<T>` (Task 8's contract type) — forcing
 * a fake `colorScheme` wrapper here would misrepresent upstream's real
 * structure. See CheckboxComponentTokens below.
 */
export interface CheckboxComponentTokens {
  root?: Record<string, unknown>;
  icon?: Record<string, unknown>;
}

export const checkbox: CheckboxComponentTokens = {
  root: {
    borderRadius: "{border.radius.sm}",
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
    size: "0.875rem",
    color: "{form.field.color}",
    checkedColor: "{primary.contrast.color}",
    checkedHoverColor: "{primary.contrast.color}",
    disabledColor: "{form.field.disabled.color}",
    sm: {
      size: "0.75rem",
    },
    lg: {
      size: "1rem",
    },
  },
};
