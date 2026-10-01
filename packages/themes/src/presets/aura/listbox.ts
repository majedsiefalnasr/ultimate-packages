import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived listbox component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset listbox module
 * (`.vendor-extracted/themes/src/presets/aura/listbox/index.ts`). Top-level
 * sections `root`, `list`, `option`, `optionGroup`, `checkmark`, `emptyMessage` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's listbox module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `ListboxComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `list`, `option`, `optionGroup`, `checkmark`, `emptyMessage` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface ListboxComponentTokens extends ComponentTokens {
  list?: Record<string, unknown>;
  option?: Record<string, unknown>;
  optionGroup?: Record<string, unknown>;
  checkmark?: Record<string, unknown>;
  emptyMessage?: Record<string, unknown>;
}

export const listbox: ListboxComponentTokens = {
  root: {
    background: "{form.field.background}",
    disabledBackground: "{form.field.disabled.background}",
    borderColor: "{form.field.border.color}",
    invalidBorderColor: "{form.field.invalid.border.color}",
    color: "{form.field.color}",
    disabledColor: "{form.field.disabled.color}",
    shadow: "{form.field.shadow}",
    borderRadius: "{form.field.border.radius}",
    transitionDuration: "{form.field.transition.duration}",
  },
  list: {
    padding: "{list.padding}",
    gap: "{list.gap}",
    header: {
      padding: "{list.header.padding}",
    },
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
  checkmark: {
    color: "{list.option.color}",
    gutterStart: "-0.375rem",
    gutterEnd: "0.375rem",
  },
  emptyMessage: {
    padding: "{list.option.padding}",
  },
  colorScheme: {
    light: {
      option: {
        stripedBackground: "{surface.50}",
      },
    },
    dark: {
      option: {
        stripedBackground: "{surface.900}",
      },
    },
  },
};
