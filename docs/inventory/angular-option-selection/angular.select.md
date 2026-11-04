# Angular USelect

ID: angular.select

Framework: angular; availability: public

## Authored interpretation

Single-value dropdown: a combobox trigger opens an overlay listbox of options with optional text filtering and an optional clear icon.

## Framework surface

Extends UBaseInput (which extends UBaseEditableHolder and UModelHolder) so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState. The inherited UBaseInput inputs variant, size, inputSize, pattern, min, max, step, minlength and maxlength are not read anywhere in this component's source; fluid is consumed only through hasFluid in classesParams. Standalone, OnPush, ViewEncapsulation.None; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-select; componentName select; the host also binds [attr.id] to the instance id u_select_<n> (static counter). Signal inputs: options, optionLabel, optionValue, optionDisabled (each string property name or function), placeholder, filter, filterPlaceholder, ariaFilterLabel, showClear (all booleanAttribute where boolean), ariaLabel, inputId, emptyMessage (default "No results found"). Outputs: onChange (USelectChangeEvent {originalEvent, value}), onFocus (Event), onBlurEmit (Event), onClear (void). onFocus forwards the real DOM focus event ($event); onBlurEmit emits a newly constructed synthetic new Event("blur"). onChange is emitted only from onOptionSelect (click or keyboard) and not from clear or writeValue. Template: trigger span role=combobox with aria-haspopup=listbox, aria-expanded, aria-controls (the <id>_list value only while the overlay is open, else null), aria-activedescendant (<id>_option_N when the focused index is not -1), aria-disabled, tabindex 0 or -1 when disabled, and aria-label computed as ariaLabel() || label() (the displayed label is the fallback when ariaLabel is unset). The label shows the selected option label or placeholder(); when label() is undefined the interpolation expression selects the string "&nbsp;" (how that text is rendered was not verified). A clear span (aria-hidden) renders only when showClear() && $filled() && !$disabled(); clear() stops propagation, writes null, calls onModelChange(null) and emits onClear, without onModelTouched or onChange. A dropdown div role=button aria-hidden toggles the overlay. The overlay (UOverlay, appendTo body, rendered only while visible) contains an optional filter header (input role=searchbox, aria-label from ariaFilterLabel(), click propagation stopped) and ul role=listbox with li role=option (aria-selected, aria-disabled, ids <id>_option_N); the empty-message li role=option is always shown when there are no visible options. State: selectedOption is options().find(o => getOptionValue(o) === modelValue()) using strict equality; visibleOptions filters by a case-insensitive trimmed substring of the option label. show() is a no-op when disabled, opens the overlay and sets the focused index to the selected option's index in visibleOptions (or -1); hide() closes, resets the focused index to -1 and clears the filter text. Keyboard on the trigger (ignored when disabled): ArrowDown/ArrowUp open when closed, else move focus; Home/End act only while open (Home sets 0, End sets visibleOptions().length - 1, neither skips disabled options); Enter/NumpadEnter/Space open when closed or select the focused option when open, with preventDefault; Escape closes (preventDefault) only while open; Tab closes without preventDefault. The filter input handles ArrowDown/ArrowUp/Enter/NumpadEnter/Escape with preventDefault. Edge cases from moveFocus: next = (next + delta + length) % length, repeated while the option is disabled and next !== focusedOptionIndex(); from index -1, ArrowDown reaches 0 and ArrowUp reaches length-2 (not the last option) when length >= 2; when every visible option is disabled and the focused index is -1 the exit condition next !== -1 cannot become false, so by reading the source the loop does not terminate (not executed). onOptionSelect ignores disabled options but does not check $disabled(); it writes the option value, calls onModelChange and onModelTouched, emits onChange and hides. Overlay composition: UOverlay moves the panel to document.body with a z-index while visible; visibleChange is not bound and no outside-click listener exists in select.ts or overlay.ts. The trigger blur does not close the overlay. Public API: USelect (class), USelectChangeEvent (type). Owned source-only declarations: SelectClassesParams (disabled, filled, focused, invalid, fluid, overlayVisible, selected, placeholder) and selectStyleModule in select-style.ts; neither is a barrel export. Style facts: classesParams passes disabled, filled, fluid and overlayVisible and never passes focused or invalid, so the root classes p-focus and p-invalid (which have CSS rules .u-select.p-focus and .u-select.p-invalid) are never emitted; the root emits u-select u-component p-inputwrapper plus p-disabled, p-inputwrapper-filled, p-select-open and u-select-fluid as applicable (p-inputwrapper and p-inputwrapper-filled have no rule in select-style.ts). Option classes emit u-select-option with p-select-option-selected, p-disabled and p-focus, and the CSS styles all three. classes.optionGroup (u-select-option-group, with a CSS rule) is defined but no template element uses it. Class keys: root, label, clearIcon, dropdown, overlay, header, pcFilter, listContainer, list, optionGroup, option, emptyMessage. Theme: the Aura components registry key select (packages/themes/src/presets/aura/index.ts, preset file select.ts) equals componentName select. Root @ultimate/ng re-exports this family (barrel line export * from "@ultimate/ng/select"); it is also exposed via the @ultimate/ng/select manifest subpath. No outputs besides those listed; no ngOnInit/ngOnDestroy override, HostListener, document listener, ContentChild/ContentChildren or virtual scroll (Scroller) usage exists in select.ts. dt and unstyled are inherited UBaseComponent inputs and nothing in this component reads them. Component-metadata: no component-metadata record exists for select (packages/component-metadata/src/records has button, checkbox, dialog, menu, paginator, scroller, table, tooltip only). Styles: No dedicated @ultimate/uix-styles/select export exists; the CSS is hand-ported inside select-style.ts. The generated select.spec.ts and select.stories.ts are excluded supporting files.

## Public exports

@ultimate/ng#USelect
@ultimate/ng/select#USelect
@ultimate/ng#USelectChangeEvent
@ultimate/ng/select#USelectChangeEvent

## Owned source and evidence

packages/ng/src/select/index.ts
packages/ng/src/select/select.ts
packages/ng/src/select/select-style.ts

```text
packages/ng/src/select/index.ts: export { USelect }
packages/ng/src/select/select.ts: export class USelect extends UBaseInput
packages/ng/src/select/select.ts: onChange = output<USelectChangeEvent>();
packages/ng/src/select/select.ts: this.onBlurEmit.emit(new Event("blur"));
packages/ng/src/select/select.ts: [attr.aria-controls]="overlayVisible() ? id + '_list' : null"
packages/ng/src/select/select.ts: [attr.aria-label]="ariaFilterLabel()"
packages/ng/src/select/select.ts: } while (this.isOptionDisabled(options[next]) && next !== this.focusedOptionIndex());
packages/ng/src/select/select.ts: protected readonly id = `u_select_${++USelect.instanceCount}`;
packages/ng/src/select/select-style.ts: export const selectStyleModule
packages/ng/src/select/select-style.ts: export interface SelectClassesParams
packages/ng/src/select/select.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: USelect, multi: true }],
packages/ng/src/select/select.ts: <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
packages/themes/src/presets/aura/index.ts:     select,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.select → [angular.select](angular.select.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.base-input (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the option-selection families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{autocomplete,select,multi-select,cascade-select,listbox}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "f8fc98fc26ad56886dfe9af8714fb6b6f66e78a7",
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
