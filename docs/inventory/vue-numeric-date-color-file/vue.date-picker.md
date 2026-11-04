# Vue UDatePicker

ID: vue.date-picker

Framework: vue; availability: public

## Authored interpretation

Single-date picker: a readonly text input opens a portal calendar panel with month navigation and a day grid.

## Framework surface

UDatePicker (Options API SFC DatePicker.vue, name "UDatePicker") and createBaseDatePicker (BaseDatePicker.ts) plus datePickerStyleModule and DatePickerClassesParams (date-picker-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseDatePicker extends createBaseInput() over createBaseEditableHolder; the factory shadows cx() and mounted() and registers the style under the name datepicker, which is also the Aura registry key. Declared props: placeholder, disabled, inputId, minDate (Date), maxDate (Date), disabledDates (array, typed readonly unknown[]), showIcon, showClear, dayNames (Su..Sa), monthNames (English names), appendTo ("body"), plus inherited size, fluid, variant, modelValue and defaultValue. Emits declared: select, clear, show, hide. select carries the bare Date (no originalEvent); clear, show and hide carry no payload. There are no slots and no v-model/defineModel declaration; writes use writeValue(value, event). Only a Date is accepted as the model: selectedDate is dValue instanceof Date, so any other model value is silently treated as empty. The initial view month and year come from defaultValue (else modelValue) when it is a Date, otherwise from today; today is captured once per mount (new Date() in data(), never refreshed). Display: the input is type=text readonly, so no typed entry; the text is the fixed MM/DD/YYYY format of formatDate (month and day zero-padded, year String(getFullYear()), no locale or format prop); an invalid Date shows NaN/NaN/NaN. Template: div root; input with id=inputId, tabindex, disabled, aria-haspopup="dialog", aria-expanded; clear span (v-if showClear && filled && !disabled, aria-hidden, click only) and trigger span role=button aria-hidden (click only), so neither is keyboard operable; UPortal (appendTo) rendered only while overlayVisible, containing a panel div role="dialog" (no aria-label or aria-modal), a header with two buttons labelled "Previous month" and "Next month" and the month and year title, and a table role="grid" whose th cells use scope=col and whose cells are span role=gridcell with tabindex 0 only on the focused cell, aria-selected and aria-disabled. Grid: weeks is Sunday first (offset from getDay()), padded with previous and next month days to full rows of 7; cell keys are month-day-year; dayNames also act as v-for keys, so duplicate names would collide. isCellDisabled compares against stripTime(minDate)/stripTime(maxDate) and calls isSameDay(d, date) for every disabledDates entry, which calls d.getFullYear(), so a non-Date entry throws a TypeError during render. Cell click calls onDateSelect(cell) without an event, so writeValue receives no event; keydown on a cell passes the event. Years 0 to 99 map to 1900 to 1999 through new Date(year, month, day) (new Date(50, 0, 1) is 1950). Keyboard: on the input Enter, NumpadEnter and Space toggle with preventDefault and Escape hides when open (no ArrowDown open); on a cell ArrowRight/Left move ±1 day, ArrowDown/Up ±7 days (focusedCell moves even onto disabled or out-of-range dates and changes the viewed month), Enter/NumpadEnter/Space select, Escape hides; no Home, End, PageUp, PageDown or Tab handling. There is no .focus( call anywhere in the scope, so DOM focus never moves into the grid (roving tabindex only). There is no outside-click handler and the panel stays open when disabled becomes true (no watcher). hide() emits hide unconditionally (cell Escape and selection call it without checking overlayVisible). Model: when only defaultValue is passed (controlled is false) writeValue emits value-change only and dValue is never updated, so later selections are not displayed (only an initial defaultValue Date shows). Selecting a date in an adjacent month switches the view to that month. Styles (date-picker-style.ts, hand-ported, no @ultimate/uix-styles import, 26 dt('datepicker.…') uses): root classes u-date-picker u-component p-inputwrapper with p-disabled (no CSS rule for p-disabled in this module) and u-date-picker-fluid; day classes other-month, today, selected, focused and disabled (only the disabled class has a rule: opacity 0.5); panel is position absolute with min-width 260px and no z-index. Theme: Aura registry key datepicker (value datePicker), differing from the family name date-picker. No component-metadata record exists. date-picker.spec.ts and date-picker.stories.ts are excluded supporting files. Composes UPortal.

## Public exports

@ultimate/vue#UDatePicker
@ultimate/vue/date-picker#UDatePicker
@ultimate/vue#createBaseDatePicker
@ultimate/vue/date-picker#createBaseDatePicker

## Owned source and evidence

packages/vue/src/date-picker/BaseDatePicker.ts
packages/vue/src/date-picker/DatePicker.vue
packages/vue/src/date-picker/date-picker-style.ts
packages/vue/src/date-picker/index.ts

```text
packages/vue/src/date-picker/DatePicker.vue: name: "UDatePicker",
packages/vue/src/date-picker/DatePicker.vue: emits: ["select", "clear", "show", "hide"],
packages/vue/src/date-picker/DatePicker.vue: return `${mm}/${dd}/${yy}`;
packages/vue/src/date-picker/DatePicker.vue: return (this.disabledDates || []).some((d) => isSameDay(d, date));
packages/vue/src/date-picker/DatePicker.vue: role="dialog"
packages/vue/src/date-picker/BaseDatePicker.ts: extends: createBaseInput(),
packages/vue/src/date-picker/BaseDatePicker.ts: registerComponentStyle("datepicker", datePickerStyleModule);
packages/vue/src/date-picker/date-picker-style.ts: export const datePickerStyleModule
packages/vue/src/date-picker/index.ts: createBaseDatePicker
packages/vue/src/index.ts: export * from "./date-picker";
packages/vue/package.json: "./date-picker": {
```

## Relationships

package.ultimate.vue.date-picker → [vue.date-picker](vue.date-picker.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
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
    "behavior": "Bounded Vue product spec for the numeric, date, color and file families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "3143b1f248e72addb28087e65a31014466c5969d",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); no product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
