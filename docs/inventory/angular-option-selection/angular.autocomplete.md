# Angular UAutoComplete

ID: angular.autocomplete

Framework: angular; availability: public

## Authored interpretation

Text input with a consumer-driven suggestion list: the component emits a search request and renders whatever suggestions array the consumer supplies in an overlay listbox, selecting one option as the form value.

## Framework surface

Extends UBaseInput (which extends UBaseEditableHolder and UModelHolder) so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState. The inherited UBaseInput inputs variant, size, inputSize, pattern, min, max, step, minlength and maxlength are not read anywhere in this component's source; fluid is consumed only through hasFluid in classesParams. Standalone, OnPush, ViewEncapsulation.None; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-autocomplete; componentName autocomplete. Signal inputs: suggestions (unknown[], default []), optionLabel (string or function), minLength (default 1, numberAttribute), delay (default 300 ms, numberAttribute), ariaLabel, inputId, placeholder, loading (booleanAttribute), emptyMessage (default "No results found"), showEmptyMessage (default true). There are no optionValue, optionDisabled, filter, showClear or multiple inputs. Outputs: completeMethod (UAutoCompleteCompleteEvent {originalEvent, query}), onSelect (UAutoCompleteSelectEvent {originalEvent, value}), onFocus (Event), onBlur (Event), onClear (void). onFocus and onBlur emit a newly constructed synthetic Event (new Event("focus") / new Event("blur")), not the DOM event. Template: one native input type=text with role=combobox and aria-autocomplete=list, bound to [value]=inputValue(), placeholder, id (inputId), disabled attribute, aria-label (ariaLabel), aria-expanded (overlayVisible) and aria-activedescendant (id_option_N when focusedOptionIndex is not -1, else null); there is no aria-controls and no aria-haspopup. A loader span (aria-hidden) renders while loading() is true. The overlay (UOverlay directive, appendTo body, rendered only while overlayVisible) holds a ul role=listbox with id <id>_list and li role=option elements (id <id>_option_N, aria-selected from isSelected, click selects, mouseenter sets the focused index); when suggestions is empty and showEmptyMessage() is true an li role=option shows emptyMessage. The instance id is u_autocomplete_<n> from a static counter and is not applied to the host. Behaviour: onInput clears any pending timer; an empty query writes null, calls onModelChange(null), emits onClear and hides; a query with length >= minLength resets the focused index to -1 and schedules setTimeout(delay()) that emits completeMethod({originalEvent, query}) and then sets overlayVisible true; a shorter non-empty query hides. Typing alone never changes modelValue; it changes only on option select, an emptied input or writeValue. The pending timer is cleared only by the next onInput (there is no ngOnDestroy), so a scheduled search can still emit and open the overlay after blur or after a selection. onInputBlur calls onModelTouched, hide() and then emits onBlur; onModelTouched is not called by option selection. Keyboard (event.code, ignored with preventDefault when disabled): ArrowDown/ArrowUp act only while the overlay is visible and wrap modulo the suggestion count (ArrowDown from the last goes to 0; ArrowUp from index <= 0 goes to count-1); with an empty suggestions array ArrowDown sets the focused index to 0, and a following Enter calls onOptionSelect with suggestions()[0] which is undefined. Enter/NumpadEnter act only while visible, select the focused option when the index is not -1, and always preventDefault; Escape hides and preventDefault only while visible. There is no Home/End/Tab handling. onOptionSelect writes the option itself as modelValue (no optionValue mapping), calls onModelChange, sets the native input value to the option label, emits onSelect({originalEvent, value}) and hides. getOptionLabel returns "" for null/undefined, calls a function optionLabel, reads a string optionLabel from an object via String(obj[key] ?? ""), otherwise returns a string as is or String(option). isSelected compares modelValue() === option by identity. writeControlValue calls setModelValue(value) and sets the native input value to the label. Overlay composition: UOverlay (ng-core) moves the element to document.body and assigns a z-index while visible; the component binds only [visible] and appendTo and does not bind visibleChange. Nothing in autocomplete.ts or overlay.ts registers an outside-click listener or positions the panel; the CSS positions it absolute at top 0, left 0. Public API: UAutoComplete (class), UAutoCompleteCompleteEvent and UAutoCompleteSelectEvent (types). Owned source-only declarations: AutoCompleteClassesParams (filled, invalid, fluid, disabled, focused, selected) and autoCompleteStyleModule {css, classes} in autocomplete-style.ts; neither is a barrel export. Style facts: host class from cx('root') with filled, fluid (hasFluid) and disabled params only; classes.root can emit u-autocomplete u-component, p-filled, p-invalid, u-autocomplete-fluid and p-disabled, but invalid is never passed so p-invalid is never emitted, and the CSS in autocomplete-style.ts has no rule for p-filled, p-invalid or p-disabled. classes.option accepts selected but optionClassesParams passes only focused, so u-autocomplete-option-selected (which has a CSS rule) is never emitted. Class keys: root, pcInputText, loader, overlay, list, option, emptyMessage. Theme: the Aura components registry key autocomplete (packages/themes/src/presets/aura/index.ts, preset file autocomplete.ts) equals componentName autocomplete. Root @ultimate/ng re-exports this family (barrel line export * from "@ultimate/ng/autocomplete"); it is also exposed via the @ultimate/ng/autocomplete manifest subpath. No outputs besides those listed; no ngOnInit/ngOnDestroy override, HostListener, document listener, ContentChild/ContentChildren or virtual scroll (Scroller) usage exists in autocomplete.ts. dt and unstyled are inherited UBaseComponent inputs and nothing in this component reads them. Component-metadata: no component-metadata record exists for autocomplete (packages/component-metadata/src/records has button, checkbox, dialog, menu, paginator, scroller, table, tooltip only). Styles: No dedicated @ultimate/uix-styles/autocomplete export exists; the CSS is hand-ported inside autocomplete-style.ts. The generated autocomplete.spec.ts and autocomplete.stories.ts are excluded supporting files.

## Public exports

@ultimate/ng#UAutoComplete
@ultimate/ng/autocomplete#UAutoComplete
@ultimate/ng#UAutoCompleteCompleteEvent
@ultimate/ng/autocomplete#UAutoCompleteCompleteEvent
@ultimate/ng#UAutoCompleteSelectEvent
@ultimate/ng/autocomplete#UAutoCompleteSelectEvent

## Owned source and evidence

packages/ng/src/autocomplete/index.ts
packages/ng/src/autocomplete/autocomplete.ts
packages/ng/src/autocomplete/autocomplete-style.ts

```text
packages/ng/src/autocomplete/index.ts: export { UAutoComplete }
packages/ng/src/autocomplete/autocomplete.ts: export class UAutoComplete extends UBaseInput
packages/ng/src/autocomplete/autocomplete.ts: completeMethod = output<UAutoCompleteCompleteEvent>();
packages/ng/src/autocomplete/autocomplete.ts: this.searchTimeout = setTimeout(() => {
packages/ng/src/autocomplete/autocomplete.ts: this.onFocus.emit(new Event("focus"));
packages/ng/src/autocomplete/autocomplete.ts: aria-autocomplete="list"
packages/ng/src/autocomplete/autocomplete.ts: return { focused: this.focusedOptionIndex() === index };
packages/ng/src/autocomplete/autocomplete-style.ts: export const autoCompleteStyleModule
packages/ng/src/autocomplete/autocomplete-style.ts: export interface AutoCompleteClassesParams
packages/ng/src/autocomplete/autocomplete.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UAutoComplete, multi: true }],
packages/ng/src/autocomplete/autocomplete.ts: <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
packages/themes/src/presets/aura/index.ts:     autocomplete,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.autocomplete → [angular.autocomplete](angular.autocomplete.md) (reconciled family alias)
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
