/**
 * Ultimate Aura-derived inputtext component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inputtext module
 * (`.vendor-extracted/themes/src/presets/aura/inputtext/index.ts`). Top-level
 * sections `root` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's inputtext module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `InputTextComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface InputTextComponentTokens {
  root?: Record<string, unknown>;
}

export const inputText: InputTextComponentTokens = {
  root: {
    background: "{form.field.background}",
    disabledBackground: "{form.field.disabled.background}",
    filledBackground: "{form.field.filled.background}",
    filledHoverBackground: "{form.field.filled.hover.background}",
    filledFocusBackground: "{form.field.filled.focus.background}",
    borderColor: "{form.field.border.color}",
    hoverBorderColor: "{form.field.hover.border.color}",
    focusBorderColor: "{form.field.focus.border.color}",
    invalidBorderColor: "{form.field.invalid.border.color}",
    color: "{form.field.color}",
    disabledColor: "{form.field.disabled.color}",
    placeholderColor: "{form.field.placeholder.color}",
    invalidPlaceholderColor: "{form.field.invalid.placeholder.color}",
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
    sm: {
      fontSize: "{form.field.sm.font.size}",
      paddingX: "{form.field.sm.padding.x}",
      paddingY: "{form.field.sm.padding.y}",
    },
    lg: {
      fontSize: "{form.field.lg.font.size}",
      paddingX: "{form.field.lg.padding.x}",
      paddingY: "{form.field.lg.padding.y}",
    },
  },
};
