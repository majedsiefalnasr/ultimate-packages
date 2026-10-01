import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived autocomplete component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset autocomplete module
 * (`.vendor-extracted/themes/src/presets/aura/autocomplete/index.ts`). Top-level
 * sections `root`, `overlay`, `list`, `option`, `optionGroup`, `dropdown`, `chip`, `emptyMessage` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's autocomplete module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `AutocompleteComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `overlay`, `list`, `option`, `optionGroup`, `dropdown`, `chip`, `emptyMessage` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface AutocompleteComponentTokens extends ComponentTokens {
  overlay?: Record<string, unknown>;
  list?: Record<string, unknown>;
  option?: Record<string, unknown>;
  optionGroup?: Record<string, unknown>;
  dropdown?: Record<string, unknown>;
  chip?: Record<string, unknown>;
  emptyMessage?: Record<string, unknown>;
}

export const autocomplete: AutocompleteComponentTokens = {
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
  },
  optionGroup: {
    background: "{list.option.group.background}",
    color: "{list.option.group.color}",
    fontWeight: "{list.option.group.font.weight}",
    padding: "{list.option.group.padding}",
  },
  dropdown: {
    width: "2.5rem",
    sm: {
      width: "2rem",
    },
    lg: {
      width: "3rem",
    },
    borderColor: "{form.field.border.color}",
    hoverBorderColor: "{form.field.border.color}",
    activeBorderColor: "{form.field.border.color}",
    borderRadius: "{form.field.border.radius}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  chip: {
    borderRadius: "{border.radius.sm}",
  },
  emptyMessage: {
    padding: "{list.option.padding}",
  },
  colorScheme: {
    light: {
      chip: {
        focusBackground: "{surface.200}",
        focusColor: "{surface.800}",
      },
      dropdown: {
        background: "{surface.100}",
        hoverBackground: "{surface.200}",
        activeBackground: "{surface.300}",
        color: "{surface.600}",
        hoverColor: "{surface.700}",
        activeColor: "{surface.800}",
      },
    },
    dark: {
      chip: {
        focusBackground: "{surface.700}",
        focusColor: "{surface.0}",
      },
      dropdown: {
        background: "{surface.800}",
        hoverBackground: "{surface.700}",
        activeBackground: "{surface.600}",
        color: "{surface.300}",
        hoverColor: "{surface.200}",
        activeColor: "{surface.100}",
      },
    },
  },
};
