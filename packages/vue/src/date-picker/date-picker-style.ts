import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `DatePickerStyle` (see
 * `.vendor-extracted/vue/datepicker/style/DatePickerStyle.js`, sourced from
 * `@primeuix/styles/datepicker`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/vue/src/select/select-style.ts`.
 */
const css = /*css*/ `
    .u-date-picker {
        display: inline-flex;
        position: relative;
    }

    .u-date-picker-input {
        cursor: pointer;
    }

    .u-date-picker-fluid {
        display: flex;
        width: 100%;
    }

    .u-date-picker-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        width: dt('datepicker.dropdown.width');
        border: 1px solid dt('datepicker.dropdown.border.color');
        background: dt('datepicker.dropdown.background');
        color: dt('datepicker.dropdown.color');
    }

    .u-date-picker-clear-icon {
        cursor: pointer;
    }

    .u-date-picker-panel {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 260px;
        background: dt('datepicker.panel.background');
        color: dt('datepicker.panel.color');
        border: 1px solid dt('datepicker.panel.border.color');
        border-radius: dt('datepicker.panel.border.radius');
        box-shadow: dt('datepicker.panel.shadow');
        padding: dt('datepicker.panel.padding');
    }

    .u-date-picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: dt('datepicker.header.padding');
    }

    .u-date-picker-nav-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: transparent;
        border: 0 none;
        border-radius: dt('datepicker.select.month.border.radius');
        color: dt('datepicker.header.color');
    }

    .u-date-picker-title {
        display: flex;
        gap: 0.25rem;
        font-weight: dt('datepicker.select.month.font.weight');
    }

    .u-date-picker-day-view {
        width: 100%;
        border-collapse: collapse;
    }

    .u-date-picker-weekday-cell {
        text-align: center;
        padding: dt('datepicker.day.cell.padding');
        color: dt('datepicker.day.color');
    }

    .u-date-picker-day-cell {
        text-align: center;
        padding: dt('datepicker.day.cell.padding');
    }

    .u-date-picker-day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: dt('datepicker.day.width');
        height: dt('datepicker.day.height');
        border-radius: dt('datepicker.day.border.radius');
        cursor: pointer;
        color: dt('datepicker.day.color');
    }

    .u-date-picker-day-other-month {
        opacity: 0.5;
    }

    .u-date-picker-day-today {
        background: dt('datepicker.today.background');
        color: dt('datepicker.today.color');
    }

    .u-date-picker-day-selected {
        background: dt('datepicker.day.selected.background');
        color: dt('datepicker.day.selected.color');
    }

    .u-date-picker-day-focused {
        box-shadow: dt('datepicker.day.selected.focus.shadow');
    }

    .u-date-picker-day-disabled {
        opacity: 0.5;
        cursor: default;
    }
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
    "u-date-picker u-component p-inputwrapper",
    { "p-disabled": Boolean(params.disabled), "u-date-picker-fluid": Boolean(params.fluid) },
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
