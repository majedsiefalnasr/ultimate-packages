/**
 * Ultimate Aura-derived cascadeselect component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset cascadeselect module
 * (`.vendor-extracted/themes/src/presets/aura/cascadeselect/index.ts`). Top-level
 * sections `root`, `dropdown`, `overlay`, `list`, `option`, `clearIcon` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's cascadeselect module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `CascadeSelectComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface CascadeSelectComponentTokens {
  root?: Record<string, unknown>;
  dropdown?: Record<string, unknown>;
  overlay?: Record<string, unknown>;
  list?: Record<string, unknown>;
  option?: Record<string, unknown>;
  clearIcon?: Record<string, unknown>;
}

export const cascadeSelect: CascadeSelectComponentTokens = {
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
  dropdown: {
    width: "2.5rem",
    color: "{form.field.icon.color}",
  },
  overlay: {
    background: "{overlay.select.background}",
    borderColor: "{overlay.select.border.color}",
    borderRadius: "{overlay.select.border.radius}",
    color: "{overlay.select.color}",
    shadow: "{overlay.select.shadow}",
  },
  list: {
    padding: "{list.padding}",
    gap: "{list.gap}",
    mobileIndent: "1rem",
  },
  option: {
    focusBackground: "{list.option.focus.background}",
    selectedBackground: "{list.option.selected.background}",
    selectedFocusBackground: "{list.option.selected.focus.background}",
    color: "{list.option.color}",
    focusColor: "{list.option.focus.color}",
    selectedColor: "{list.option.selected.color}",
    selectedFocusColor: "{list.option.selected.focus.color}",
    padding: "{list.option.padding}",
    borderRadius: "{list.option.border.radius}",
    icon: {
      color: "{list.option.icon.color}",
      focusColor: "{list.option.icon.focus.color}",
      size: "0.875rem",
    },
  },
  clearIcon: {
    color: "{form.field.icon.color}",
  },
};
