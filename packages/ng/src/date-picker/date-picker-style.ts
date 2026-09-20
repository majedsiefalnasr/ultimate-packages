/**
 * Ultimate-owned adaptation of PrimeNG's `DatePickerStyle` (see
 * `.vendor-extracted/ng/datepicker/style/datepickerstyle.ts`, sourced from
 * `@primeuix/styles/datepicker`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `select-style.ts`/`password-style.ts`: no
 * `@ultimate/uix-styles/datepicker` subpath exists yet and this task may not
 * add one.
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

    .u-date-picker-nav-button.p-disabled {
        opacity: 0.5;
        cursor: default;
    }

    .u-date-picker-title {
        display: flex;
        gap: 0.25rem;
    }

    .u-date-picker-title-button {
        cursor: pointer;
        background: transparent;
        border: 0 none;
        font-weight: dt('datepicker.select.month.font.weight');
        color: dt('datepicker.header.color');
    }

    .u-date-picker-day-view {
        width: 100%;
        border-collapse: collapse;
    }

    .u-date-picker-weekday-cell {
        text-align: center;
        padding: dt('datepicker.day.cell.padding');
    }

    .u-date-picker-weekday {
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

    .u-date-picker-day.p-datepicker-other-month {
        color: dt('datepicker.day.color');
        opacity: 0.5;
    }

    .u-date-picker-day.p-datepicker-today {
        background: dt('datepicker.today.background');
        color: dt('datepicker.today.color');
    }

    .u-date-picker-day.p-datepicker-day-selected {
        background: dt('datepicker.day.selected.background');
        color: dt('datepicker.day.selected.color');
    }

    .u-date-picker-day.p-focus {
        box-shadow: dt('datepicker.day.selected.focus.shadow');
    }

    .u-date-picker-day.p-disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

/** Params `UDatePicker` passes into `cx('root', params)`/`cx('day', params)`/etc. */
export interface DatePickerClassesParams {
  disabled?: boolean;
  fluid?: boolean;
  overlayVisible?: boolean;
  otherMonth?: boolean;
  today?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: DatePickerClassesParams = {}) => [
    "u-date-picker u-component p-inputwrapper",
    { "p-disabled": params.disabled, "u-date-picker-fluid": params.fluid },
  ],
  pcInputText: "u-date-picker-input",
  trigger: "u-date-picker-trigger",
  clearIcon: "u-date-picker-clear-icon",
  panel: "u-date-picker-panel",
  header: "u-date-picker-header",
  navButton: (params: DatePickerClassesParams = {}) => [
    "u-date-picker-nav-button",
    { "p-disabled": params.disabled },
  ],
  title: "u-date-picker-title",
  titleButton: "u-date-picker-title-button",
  dayView: "u-date-picker-day-view",
  weekdayCell: "u-date-picker-weekday-cell",
  weekday: "u-date-picker-weekday",
  dayCell: "u-date-picker-day-cell",
  day: (params: DatePickerClassesParams = {}) => [
    "u-date-picker-day",
    {
      "p-datepicker-other-month": params.otherMonth,
      "p-datepicker-today": params.today,
      "p-datepicker-day-selected": params.selected,
      "p-focus": params.focused,
      "p-disabled": params.disabled,
    },
  ],
};

/** `UBaseComponent`-shaped style module for `UDatePicker`. */
export const datePickerStyleModule = { css, classes };
