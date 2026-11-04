# React UDatePicker

ID: react.date-picker

Framework: react; availability: public

## Authored interpretation

Controlled single-date picker with a read-only formatted input, optional icon and clear controls, and a month-grid dialog overlay with min/max and disabled-date constraints.

## Framework surface

UDatePicker is a plain function component (not a forwardRef) with UDatePickerProps. Props: value (Date | null, required), onChange (required, receives Date | null), placeholder, disabled, fluid, minDate, maxDate, disabledDates (default [], a new array each render), showIcon, showClear, dayNames (default Su to Sa), monthNames (English default), className, inputId, onSelect, onClear, onShow and onHide. There are no locale, dateFormat, selectionMode or time props. The style module exports DatePickerClassesParams (disabled, fluid, otherMonth, today, selected, focused) and datePickerStyleModule; neither is re-exported by index.ts.

Formatting: the input text comes from a fixed MM/DD/YYYY formatter (month plus one and day padded, year not padded). State: overlayVisible, viewMonth, viewYear and focusedCell. today is computed with useMemo and an empty dependency list, so it is captured once per mount and the today highlight is not refreshed afterwards.

Constraints: isCellDisabled compares the cell date with stripTime(minDate) and stripTime(maxDate) and checks disabledDates with isSameDay. stripTime, selectCell and isCellDisabled construct dates with new Date(year, month, day), which maps years 0 to 99 to 1900 to 1999.

Open and close: show() returns when disabled, then sets the view and focused cell from value or today, sets overlayVisible and calls onShow. hide() sets overlayVisible false and calls onHide. selectCell returns for disabled cells; otherwise it calls onChange(date) then onSelect(date), moves the view for other-month cells, sets focusedCell and calls hide(). A cell click calls selectCell; disabled cells only carry aria-disabled. There is no outside-click or blur handler: the overlay closes only through cell selection, Escape, a click, Enter or Space on the input, or a click on the icon, and it stays open when disabled becomes true.

Navigation: navBackward and navForward call setViewYear inside the setViewMonth updater function, so a StrictMode double invocation can shift the year twice. Nav buttons have aria-label Previous month and Next month. Cell keys use event.code: ArrowRight and ArrowLeft move one day, ArrowDown and ArrowUp move seven, through moveFocusByDays, which does not skip disabled dates and only updates focusedCell state. No call to focus() exists, so DOM focus is never moved and only the roving tabIndex changes. Enter, NumpadEnter and Space select; Escape hides; PageUp, PageDown, Home, End and Tab are not handled.

Input and controls: a read-only text input with aria-haspopup=dialog, aria-expanded, tabIndex -1 and disabled attribute when disabled; click toggles the overlay (no-op when disabled); onKeyDown returns when disabled, toggles on Enter, NumpadEnter and Space with preventDefault, and hides on Escape when visible; ArrowDown does not open the overlay. The clear control renders when showClear, value is not null and not disabled: a span with aria-hidden, a click handler that stops propagation, calls onChange(null) and onClear, is not keyboard accessible and does not hide the overlay. The icon is a span with role=button and aria-hidden=true, no tabIndex, which toggles the overlay.

Overlay markup: an absolutely positioned div role=dialog without aria-label or aria-modal and without a portal; a table role=grid whose th cells use scope=col and key=dayName (duplicate names would collide); td cells hold a span role=gridcell with tabIndex, aria-selected and aria-disabled and key month-day-year. Weeks are laid out Sunday first and this is not configurable; dayNames is independent of that layout.

Styles: root class u-date-picker u-component plus u-date-picker-fluid (root reads only fluid); the day resolver reads otherMonth, today, selected, focused and disabled. Class keys: root, input, trigger, clearIcon, panel, header, navButton, title, dayView, weekdayCell, dayCell, day. The CSS rule .u-date-picker-nav-button:disabled never applies because nav buttons are never disabled. The doc comment lists selectionMode, month and year views, time, inline, touch UI, week numbers, button bar, multi-month and Intl as not implemented. componentName is date-picker while the Aura registry key is datepicker.

## Public exports

@ultimate/react#UDatePicker
@ultimate/react/date-picker#UDatePicker
@ultimate/react#UDatePickerProps
@ultimate/react/date-picker#UDatePickerProps

## Owned source and evidence

packages/react/src/date-picker/index.ts
packages/react/src/date-picker/date-picker.tsx
packages/react/src/date-picker/date-picker-style.ts

```text
packages/react/src/date-picker/index.ts: export { UDatePicker } from
packages/react/src/date-picker/date-picker.tsx: export function UDatePicker({
packages/react/src/date-picker/date-picker.tsx: const today = React.useMemo(() => new Date(), []);
packages/react/src/date-picker/date-picker.tsx: setViewYear((year) => year - 1);
packages/react/src/date-picker/date-picker.tsx: function stripTime(date: Date): Date {
packages/react/src/date-picker/date-picker-style.ts: export const datePickerStyleModule
packages/themes/src/presets/aura/index.ts: datepicker: datePicker,
packages/react/src/index.ts: export * from "./date-picker";
packages/react/package.json: "./date-picker": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.date-picker → [react.date-picker](react.date-picker.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product spec for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "e99d41249677496cf6c531576dd6e1c181544883",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
