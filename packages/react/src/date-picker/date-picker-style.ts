import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `select-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-date-picker { position: relative; display: inline-flex; align-items: center; }
.u-date-picker-fluid { display: flex; width: 100%; }
.u-date-picker-input { cursor: pointer; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem 0.75rem; background: #ffffff; }
.u-date-picker-trigger { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0 0.5rem; }
.u-date-picker-clear-icon { cursor: pointer; padding: 0 0.25rem; }
.u-date-picker-panel {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 0.25rem;
  min-width: 260px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 0.75rem;
}
.u-date-picker-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.u-date-picker-nav-button { cursor: pointer; background: transparent; border: 0 none; font-size: 1rem; padding: 0.25rem 0.5rem; }
.u-date-picker-nav-button:disabled { opacity: 0.5; cursor: default; }
.u-date-picker-title { display: flex; gap: 0.25rem; font-weight: 600; }
.u-date-picker-day-view { width: 100%; border-collapse: collapse; }
.u-date-picker-weekday-cell { text-align: center; padding: 0.25rem; color: #6b7280; font-size: 0.85rem; }
.u-date-picker-day-cell { text-align: center; padding: 2px; }
.u-date-picker-day { display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; margin: 0 auto; border-radius: 6px; cursor: pointer; }
.u-date-picker-day-other-month { opacity: 0.4; }
.u-date-picker-day-today { background: #f3f4f6; }
.u-date-picker-day-selected { background: #6366f1; color: #ffffff; }
.u-date-picker-day-focused { outline: 2px solid #6366f1; outline-offset: -2px; }
.u-date-picker-day-disabled { opacity: 0.4; cursor: default; }
`;

export interface DatePickerClassesParams {
  disabled?: boolean;
  fluid?: boolean;
  otherMonth?: boolean;
  today?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: DatePickerClassesParams = {}) => [
    "u-date-picker u-component",
    { "u-date-picker-fluid": Boolean(params.fluid) },
  ],
  input: "u-date-picker-input",
  trigger: "u-date-picker-trigger",
  clearIcon: "u-date-picker-clear-icon",
  panel: "u-date-picker-panel",
  header: "u-date-picker-header",
  navButton: "u-date-picker-nav-button",
  title: "u-date-picker-title",
  dayView: "u-date-picker-day-view",
  weekdayCell: "u-date-picker-weekday-cell",
  dayCell: "u-date-picker-day-cell",
  day: (params: DatePickerClassesParams = {}) => [
    "u-date-picker-day",
    {
      "u-date-picker-day-other-month": Boolean(params.otherMonth),
      "u-date-picker-day-today": Boolean(params.today),
      "u-date-picker-day-selected": Boolean(params.selected),
      "u-date-picker-day-focused": Boolean(params.focused),
      "u-date-picker-day-disabled": Boolean(params.disabled),
    },
  ],
};

export const datePickerStyleModule: StyleModule = { css, classes };
