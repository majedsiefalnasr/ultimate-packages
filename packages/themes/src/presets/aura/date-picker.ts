import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived datepicker component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset datepicker module
 * (`.vendor-extracted/themes/src/presets/aura/datepicker/index.ts`). Top-level
 * sections `root`, `panel`, `header`, `title`, `dropdown`, `inputIcon`, `selectMonth`, `selectYear`, `group`, `dayView`, `weekDay`, `date`, `monthView`, `month`, `yearView`, `year`, `buttonbar`, `timePicker` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's datepicker module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `DatePickerComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `panel`, `header`, `title`, `dropdown`, `inputIcon`, `selectMonth`, `selectYear`, `group`, `dayView`, `weekDay`, `date`, `monthView`, `month`, `yearView`, `year`, `buttonbar`, `timePicker` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface DatePickerComponentTokens extends ComponentTokens {
  panel?: Record<string, unknown>;
  header?: Record<string, unknown>;
  title?: Record<string, unknown>;
  dropdown?: Record<string, unknown>;
  inputIcon?: Record<string, unknown>;
  selectMonth?: Record<string, unknown>;
  selectYear?: Record<string, unknown>;
  group?: Record<string, unknown>;
  dayView?: Record<string, unknown>;
  weekDay?: Record<string, unknown>;
  date?: Record<string, unknown>;
  monthView?: Record<string, unknown>;
  month?: Record<string, unknown>;
  yearView?: Record<string, unknown>;
  year?: Record<string, unknown>;
  buttonbar?: Record<string, unknown>;
  timePicker?: Record<string, unknown>;
}

export const datePicker: DatePickerComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  panel: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    borderRadius: "{content.border.radius}",
    shadow: "{overlay.popover.shadow}",
    padding: "{overlay.popover.padding}",
  },
  header: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    padding: "0 0 0.5rem 0",
  },
  title: {
    gap: "0.5rem",
    fontWeight: "500",
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
  inputIcon: {
    color: "{form.field.icon.color}",
  },
  selectMonth: {
    hoverBackground: "{content.hover.background}",
    color: "{content.color}",
    hoverColor: "{content.hover.color}",
    padding: "0.25rem 0.5rem",
    borderRadius: "{content.border.radius}",
  },
  selectYear: {
    hoverBackground: "{content.hover.background}",
    color: "{content.color}",
    hoverColor: "{content.hover.color}",
    padding: "0.25rem 0.5rem",
    borderRadius: "{content.border.radius}",
  },
  group: {
    borderColor: "{content.border.color}",
    gap: "{overlay.popover.padding}",
  },
  dayView: {
    margin: "0.5rem 0 0 0",
  },
  weekDay: {
    padding: "0.25rem",
    fontWeight: "500",
    color: "{content.color}",
  },
  date: {
    hoverBackground: "{content.hover.background}",
    selectedBackground: "{primary.color}",
    rangeSelectedBackground: "{highlight.background}",
    color: "{content.color}",
    hoverColor: "{content.hover.color}",
    selectedColor: "{primary.contrast.color}",
    rangeSelectedColor: "{highlight.color}",
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    padding: "0.25rem",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  monthView: {
    margin: "0.5rem 0 0 0",
  },
  month: {
    padding: "0.375rem",
    borderRadius: "{content.border.radius}",
  },
  yearView: {
    margin: "0.5rem 0 0 0",
  },
  year: {
    padding: "0.375rem",
    borderRadius: "{content.border.radius}",
  },
  buttonbar: {
    padding: "0.5rem 0 0 0",
    borderColor: "{content.border.color}",
  },
  timePicker: {
    padding: "0.5rem 0 0 0",
    borderColor: "{content.border.color}",
    gap: "0.5rem",
    buttonGap: "0.25rem",
  },
  colorScheme: {
    light: {
      dropdown: {
        background: "{surface.100}",
        hoverBackground: "{surface.200}",
        activeBackground: "{surface.300}",
        color: "{surface.600}",
        hoverColor: "{surface.700}",
        activeColor: "{surface.800}",
      },
      today: {
        background: "{surface.200}",
        color: "{surface.900}",
      },
    },
    dark: {
      dropdown: {
        background: "{surface.800}",
        hoverBackground: "{surface.700}",
        activeBackground: "{surface.600}",
        color: "{surface.300}",
        hoverColor: "{surface.200}",
        activeColor: "{surface.100}",
      },
      today: {
        background: "{surface.700}",
        color: "{surface.0}",
      },
    },
  },
};
