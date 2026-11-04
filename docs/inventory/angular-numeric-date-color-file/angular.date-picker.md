# Angular UDatePicker

ID: angular.date-picker

Framework: angular; availability: public

## Authored interpretation

Single-date picker: a readonly text input opens an overlay calendar for one month at a time; selecting a day writes a Date to the form control.

## Framework surface

Extends UBaseInput (which extends UBaseEditableHolder and UModelHolder) so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. None of the inherited UBaseInput config inputs variant, size, inputSize, pattern, min, max, step, minlength and maxlength is read in this component's source; fluid is consumed only through hasFluid in rootClassesParams. Selector u-date-picker; componentName datepicker. Composes UOverlay (uOverlay on a panel div with appendTo=body, rendered only while the overlay is visible). Signal inputs: dateFormat (default mm/dd/yy; never read, because the private formatDate always renders mm/dd/yyyy with the four-digit year from getFullYear()), placeholder, inputId, minDate, maxDate, disabledDates (Date[], default []), showIcon, showClear (booleanAttribute), dayNames (default Su to Sa) and monthNames (English defaults). No time, range, multiple or month/year view inputs exist. Outputs: onSelect (output<Date>(): it emits a plain Date), onClear (void), onShow (void), onHide (void). The exported interface UDatePickerSelectEvent {originalEvent: Event; value: Date} is not used by any output or other source in packages/ng/src; the event argument of onDateSelect is discarded with void event. Template: a readonly input type=text with aria-haspopup=dialog, aria-expanded bound to the overlay state, tabindex -1 when disabled, and click/keydown handlers; an optional clear span (shown when showClear, $filled and not disabled) and an optional trigger span with role=button, aria-hidden=true and no tabindex or key handler; a panel with role=dialog (no aria-label or aria-modal), previous/next buttons labelled Previous month and Next month, a month and year title made of two non-interactive spans, and a table role=grid whose day cells are span role=gridcell with tabindex 0 only on the focused cell, aria-selected and aria-disabled. Opening the panel never moves DOM focus (no focus() call exists in the source). Selection: onDateSelect returns early for a disabled cell, otherwise calls writeModelValue, onModelChange, onModelTouched, emits onSelect, moves the view for other-month cells, sets the focused cell and hides the panel. clear() stops propagation, calls writeModelValue(null) and onModelChange(null) and emits onClear, but does not call onModelTouched. minDate and maxDate compare against date-stripped values; disabledDates compare by year, month and day; the previous/next month buttons are never disabled by minDate or maxDate. Keyboard: the input handles Enter, NumpadEnter and Space (toggle) and Escape (hide only while visible); it returns early when disabled. Day cells handle ArrowLeft/ArrowRight (one day), ArrowUp/ArrowDown (seven days) through moveFocusByDays, Enter/NumpadEnter/Space (select) and Escape (hide); moveFocusByDays updates the focused-cell signal and the view month only, may land on disabled dates, and no Home, End, PageUp or PageDown handler exists. No click-outside handler exists, so the panel closes only through the input (click, Enter, NumpadEnter, Space or Escape), a day selection or a day-cell Escape. show() emits onShow and hide() emits onHide on every call. The input click, Enter, NumpadEnter and Space handlers call hide() when the panel is visible and the input Escape handler only while it is visible, but onDateSelect (after a successful selection) and the day-cell Escape handler call it without an open check. The date field initializer captures today once (new Date()) at instance creation and never refreshes it. The weeks computed fills leading and trailing days with a while loop on cells.length % 7, which terminates because it tests the remainder. writeControlValue calls setModelValue(value instanceof Date ? value : null) only: strings and timestamps become null, it does not call onModelChange, and an invalid Date instance is accepted. An invalid Date renders in the input as NaN/NaN/NaN, and opening the panel from it sets the view month and year from NaN, which yields a day grid with no cells (read from source and checked in plain Node arithmetic, not executed in the component). Host class cx('root', {disabled, fluid}). Owned source-only declarations: UDatePickerDayCell, DEFAULT_DAY_NAMES, DEFAULT_MONTH_NAMES, DatePickerClassesParams (its overlayVisible member is never read by a class resolver nor passed by the component) and datePickerStyleModule (root 'u-date-picker u-component p-inputwrapper'; day classes p-datepicker-other-month, p-datepicker-today, p-datepicker-day-selected, p-focus, p-disabled). navButton receives no params in the template, so its p-disabled branch is never applied. Consumer availability: exported (UDatePicker, type UDatePickerSelectEvent) from the root barrel via @ultimate/ng/date-picker and from the @ultimate/ng/date-picker manifest subpath. No dedicated @ultimate/uix-styles export exists for this family: its CSS is hand-ported into the local style file. Aura registry key is datepicker (folder and selector use the hyphenated name); aura-token-wiring.spec.ts lists nine approved unresolved variables (day border radius, day cell padding, day color, day height, day selected background, color and focus shadow, day width, select month font weight). That spec was not executed. There is no component-metadata record for this family (packages/component-metadata/src/records holds none for it). Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; those declared inputs are not read anywhere in ng-core, so they are not evidence that unstyled suppresses registration. Standalone, OnPush, ViewEncapsulation.None. Style helper exports are source-only internals, not barrel exports or independent rendered components. The spec and stories files are excluded.

## Public exports

@ultimate/ng#UDatePicker
@ultimate/ng/date-picker#UDatePicker
@ultimate/ng#UDatePickerSelectEvent
@ultimate/ng/date-picker#UDatePickerSelectEvent

## Owned source and evidence

packages/ng/src/date-picker/index.ts
packages/ng/src/date-picker/date-picker.ts
packages/ng/src/date-picker/date-picker-style.ts

```text
packages/ng/src/date-picker/index.ts: export { UDatePicker }
packages/ng/src/date-picker/date-picker.ts: export class UDatePicker extends UBaseInput
packages/ng/src/date-picker/date-picker.ts: dateFormat = input("mm/dd/yy");
packages/ng/src/date-picker/date-picker.ts: return `${mm}/${dd}/${yy}`;
packages/ng/src/date-picker/date-picker.ts: onSelect = output<Date>();
packages/ng/src/date-picker/date-picker.ts: export interface UDatePickerSelectEvent
packages/ng/src/date-picker/date-picker.ts: void event;
packages/ng/src/date-picker/date-picker.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UDatePicker, multi: true }],
packages/ng/src/date-picker/date-picker.ts: role="dialog"
packages/ng/src/date-picker/date-picker.ts: role="gridcell"
packages/ng/src/date-picker/date-picker.ts: while (cells.length % 7 !== 0) {
packages/ng/src/date-picker/date-picker.ts: private moveFocusByDays(cell: UDatePickerDayCell, delta: number): void {
packages/ng/src/date-picker/date-picker.ts: setModelValue(value instanceof Date ? value : null);
packages/ng/src/date-picker/date-picker.ts: this.onModelChange(null);
    this.onClear.emit();
packages/ng/src/date-picker/date-picker-style.ts: export const datePickerStyleModule
packages/ng/src/date-picker/date-picker-style.ts: export interface DatePickerClassesParams
packages/ng/src/date-picker/date-picker-style.ts: overlayVisible?: boolean;
packages/ng/package.json: "./date-picker": {
packages/ng/src/index.ts: export * from "@ultimate/ng/date-picker";
packages/ng-core/src/overlay/overlay.ts: selector: "[uOverlay]",
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/themes/src/presets/aura/index.ts:     datepicker: datePicker,
```

## Relationships

package.ultimate.ng.date-picker → [angular.date-picker](angular.date-picker.md) (reconciled family alias)
package.ultimate.ng-core.base-input (pending cross-batch)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.ng.fluid (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{input-number,date-picker,color-picker,file-upload}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "73cc77945ad2e4213695c2d140166822dc1ad12c",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
