# Angular UMultiSelect

ID: angular.multi-select

Framework: angular; availability: public

## Authored interpretation

Multi-value dropdown: a combobox trigger opens an overlay listbox of checkbox options with optional select-all, filtering and clear; the model is an array of option values.

## Framework surface

Extends UBaseEditableHolder directly (not UBaseInput), so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and has no fluid, variant, size, pattern, min, max or step inputs. Standalone, OnPush, ViewEncapsulation.None; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-multi-select; componentName multiselect (the registry key differs from the folder and selector names). Signal inputs: options, optionLabel, optionValue, optionDisabled, placeholder, filter, filterPlaceholder, showClear, showToggleAll (default true), ariaLabel, inputId, emptyMessage, maxSelectedLabels (default 3, no transform), selectedItemsLabel (default "{0} items selected"). There is no ariaFilterLabel input. Outputs: onChange (UMultiSelectChangeEvent {originalEvent, value: unknown[]}), onFocus (Event, the real DOM event), onBlurEmit (Event, synthetic new Event("blur")), onClear (void). Template: trigger span role=combobox with aria-haspopup=listbox, aria-expanded, aria-disabled, aria-label from ariaLabel() and tabindex; there is no aria-controls, no aria-activedescendant and no id on the list or options. The overlay (UOverlay) always renders its header div; inside it a select-all input type=checkbox with the hard-coded aria-label "Select All" renders when showToggleAll() is true and a filter input role=searchbox (no aria-label) renders when filter() is true. The list is ul role=listbox with aria-multiselectable=true; each li role=option has aria-selected, aria-disabled and an inner checkbox input (tabindex -1, disabled for disabled options). State: selectedValues is modelValue() when it is an array, else []; isSelected uses includes (SameValueZero) on the option value. The label is placeholder() ?? "" when nothing is selected, selectedItemsLabel with the first "{0}" replaced by the count when the count exceeds maxSelectedLabels, otherwise the joined ", " labels of the matching options (String(value) when no option matches). writeControlValue stores the value when it is an array and [] otherwise. show() only opens the overlay and leaves the focused index unchanged. Keyboard on the trigger (ignored when disabled): ArrowDown/ArrowUp open when closed else move focus; Enter/NumpadEnter/Space open when closed or select the focused option when open (preventDefault); Escape closes only while open; Tab closes. There is no Home/End handling. The filter input handles only Escape. moveFocus uses the same modulo arithmetic as USelect, including ArrowUp from index -1 reaching length-2 and, by reading the source, a non-terminating loop when every visible option is disabled and the focused index is -1 (not executed). Mutations: onOptionSelect ignores disabled options (it does not check $disabled()), toggles the option value in a new array, writes it, calls onModelChange and onModelTouched, emits onChange({originalEvent, value}) and never closes the overlay. toggleAll (select-all checkbox change) operates on enabled visible options (removes them all when allSelected(), else appends the missing ones), writes the model, calls onModelChange and onModelTouched and emits onChange with a newly constructed new Event("change") as originalEvent; allSelected is false when no enabled option is visible. clear() stops propagation, writes [], calls onModelChange([]) and emits onClear without onModelTouched. The clear icon renders only when showClear() && $filled() && !$disabled(); $filled is false for an empty array. Overlay composition: UOverlay moves the panel to document.body while visible; visibleChange is not bound; no outside-click listener exists in multi-select.ts. Public API: UMultiSelect (class), UMultiSelectChangeEvent (type). Owned source-only declarations: MultiSelectClassesParams (disabled, filled, focused, fluid, overlayVisible, selected, placeholder) and multiSelectStyleModule in multi-select-style.ts; neither is a barrel export. Style facts: classesParams passes fluid as the constant false, so u-multi-select-fluid is never emitted. The option class set emits u-multi-select-option with p-multiselect-option-selected, p-disabled and p-focus, none of which is targeted by an option-level CSS rule in multi-select-style.ts (its only p- rules are root-scoped), while the CSS styles .u-multi-select-option-selected, .u-multi-select-option-focused and .u-multi-select-option-disabled, which classes.option never emitted. The root rules .u-multi-select.p-multiselect-open and .u-multi-select.p-disabled match emitted classes. Class keys: root, label, clearIcon, dropdown, overlay, header, pcFilter, listContainer, list, option, emptyMessage. Theme: the Aura components registry key multiselect (assigned from the multiSelect export of multi-select.ts in packages/themes/src/presets/aura/index.ts) equals componentName multiselect. Root @ultimate/ng re-exports this family (barrel line export * from "@ultimate/ng/multi-select"); it is also exposed via the @ultimate/ng/multi-select manifest subpath. No outputs besides those listed; no ngOnInit/ngOnDestroy override, HostListener, document listener, ContentChild/ContentChildren or virtual scroll (Scroller) usage exists in multi-select.ts. dt and unstyled are inherited UBaseComponent inputs and nothing in this component reads them. Component-metadata: no component-metadata record exists for multi-select (packages/component-metadata/src/records has button, checkbox, dialog, menu, paginator, scroller, table, tooltip only). Styles: No dedicated @ultimate/uix-styles/multi-select export exists; the CSS is hand-ported inside multi-select-style.ts. The generated multi-select.spec.ts and multi-select.stories.ts are excluded supporting files.

## Public exports

@ultimate/ng#UMultiSelect
@ultimate/ng/multi-select#UMultiSelect
@ultimate/ng#UMultiSelectChangeEvent
@ultimate/ng/multi-select#UMultiSelectChangeEvent

## Owned source and evidence

packages/ng/src/multi-select/index.ts
packages/ng/src/multi-select/multi-select.ts
packages/ng/src/multi-select/multi-select-style.ts

```text
packages/ng/src/multi-select/index.ts: export { UMultiSelect }
packages/ng/src/multi-select/multi-select.ts: export class UMultiSelect extends UBaseEditableHolder
packages/ng/src/multi-select/multi-select.ts: showToggleAll = input(true, { transform: booleanAttribute });
packages/ng/src/multi-select/multi-select.ts: aria-label="Select All"
packages/ng/src/multi-select/multi-select.ts: maxSelectedLabels = input<number>(3);
packages/ng/src/multi-select/multi-select.ts: this.onChange.emit({ originalEvent: new Event("change"), value: newValue });
packages/ng/src/multi-select/multi-select.ts: setModelValue(Array.isArray(value) ? value : []);
packages/ng/src/multi-select/multi-select.ts: } while (this.isOptionDisabled(options[next]) && next !== this.focusedOptionIndex());
packages/ng/src/multi-select/multi-select-style.ts: "p-multiselect-option-selected": params.selected,
packages/ng/src/multi-select/multi-select-style.ts: export const multiSelectStyleModule
packages/ng/src/multi-select/multi-select-style.ts: export interface MultiSelectClassesParams
packages/ng/src/multi-select/multi-select.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UMultiSelect, multi: true }],
packages/ng/src/multi-select/multi-select.ts: <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
packages/themes/src/presets/aura/index.ts:     multiselect: multiSelect,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.multi-select → [angular.multi-select](angular.multi-select.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
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
