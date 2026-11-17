# Angular UListbox

ID: angular.listbox

Framework: angular; availability: public

## Authored interpretation

Always-visible listbox of selectable options with optional filtering, single or multiple selection and keyboard navigation; it does not use an overlay.

## Framework surface

Extends UBaseEditableHolder directly (not UBaseInput), so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and has no fluid, variant, size, pattern, min, max or step inputs. Standalone, OnPush, ViewEncapsulation.None; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-listbox; componentName listbox. There is no UOverlay import: the list renders directly in the host (no UOverlay, trigger or panel). Signal inputs: options, optionLabel, optionValue, optionDisabled, trackBy ((index, option) => unknown), multiple, filter, filterPlaceholder, ariaLabel, emptyMessage. There is no ariaFilterLabel and no showClear. Outputs: onChange (UListboxChangeEvent {originalEvent, value}), onFocus (Event, the real DOM event), onBlurEmit (Event, synthetic new Event("blur")). Template: optional header with a filter input role=searchbox (input handler only; no keydown handler and no aria-label); ul role=listbox with aria-multiselectable bound to multiple(), aria-label from ariaLabel(), tabindex 0 or -1 when disabled, and the keydown, focus and blur handlers on the ul itself; there is no aria-activedescendant and options have no ids, so the focused index only drives a CSS class. Each li role=option has aria-selected, aria-disabled and, when multiple() is true, an inner checkbox input (tabindex -1). The @for track expression is trackOption: trackBy(index, option) when supplied, else the index. The empty-message li role=option shows when no option is visible. Selection: in single mode isSelected is modelValue() === optionValue and onOptionSelect sets the option value (selecting the current value again keeps it; there is no deselect); in multiple mode isSelected requires an array containing the value and onOptionSelect toggles membership in a new array (a non-array model is treated as []). onOptionSelect ignores disabled options but does not check $disabled(), and the listbox CSS has no pointer-events rule, so by reading the source a click on an enabled option still selects while the component is disabled (not executed). It writes the model, calls onModelChange and onModelTouched and emits onChange({originalEvent, value}). writeControlValue stores the value without array coercion. Keyboard on the ul (ignored when disabled): ArrowDown/ArrowUp move focus; Home sets index 0 and End sets visibleOptions().length - 1 (-1 when empty), neither skipping disabled options; Enter/NumpadEnter/Space select the focused option and always preventDefault. moveFocus uses the same modulo arithmetic as USelect, including ArrowUp from -1 reaching length-2 and, by reading the source, a non-terminating loop when every visible option is disabled and the focused index is -1 (not executed). Filtering uses a case-insensitive trimmed substring of the option label and resets the focused index to -1. Public API: UListbox (class), UListboxChangeEvent (type). Owned source-only declarations: ListboxClassesParams (disabled, invalid, selected, focused) and listboxStyleModule in listbox-style.ts; neither is a barrel export. Style facts: classesParams passes invalid as the constant false, so p-invalid (which has the CSS rule .u-listbox.p-invalid) is never emitted. The option class set emits u-listbox-option with p-listbox-option-selected, p-disabled and p-focus, none of which is targeted by an option-level CSS rule in listbox-style.ts (its p- rules are root-scoped), while the CSS styles .u-listbox-option-selected, .u-listbox-option-focused and .u-listbox-option-disabled, which classes.option never emitted. The root .u-listbox.p-disabled rule sets opacity 1 with disabled background and color tokens. Class keys: root, header, pcFilter, listContainer, list, option, emptyMessage. Theme: the Aura components registry key listbox (packages/themes/src/presets/aura/index.ts, preset file listbox.ts) equals componentName listbox. Root @ultimate/ng re-exports this family (barrel line export * from "@ultimate/ng/listbox"); it is also exposed via the @ultimate/ng/listbox manifest subpath. No outputs besides those listed; no ngOnInit/ngOnDestroy override, HostListener, document listener, ContentChild/ContentChildren or virtual scroll (Scroller) usage exists in listbox.ts. dt and unstyled are inherited UBaseComponent inputs and nothing in this component reads them. Component-metadata: no component-metadata record exists for listbox (packages/component-metadata/src/records has button, checkbox, dialog, menu, paginator, scroller, table, tooltip only). Styles: No dedicated @ultimate/uix-styles/listbox export exists; the CSS is hand-ported inside listbox-style.ts. The generated listbox.spec.ts and listbox.stories.ts are excluded supporting files.

## Public exports

@ultimate/ng#UListbox
@ultimate/ng/listbox#UListbox
@ultimate/ng#UListboxChangeEvent
@ultimate/ng/listbox#UListboxChangeEvent

## Owned source and evidence

packages/ng/src/listbox/index.ts
packages/ng/src/listbox/listbox.ts
packages/ng/src/listbox/listbox-style.ts

```text
packages/ng/src/listbox/index.ts: export { UListbox }
packages/ng/src/listbox/listbox.ts: export class UListbox extends UBaseEditableHolder
packages/ng/src/listbox/listbox.ts: trackBy = input<(index: number, option: unknown) => unknown>();
packages/ng/src/listbox/listbox.ts: [attr.aria-multiselectable]="multiple()"
packages/ng/src/listbox/listbox.ts: return callback ? callback(index, option) : index;
packages/ng/src/listbox/listbox.ts: newValue = optionValue;
packages/ng/src/listbox/listbox.ts: case "Home":
packages/ng/src/listbox/listbox.ts: return { disabled: this.$disabled(), invalid: false };
packages/ng/src/listbox/listbox-style.ts: "p-listbox-option-selected": params.selected,
packages/ng/src/listbox/listbox-style.ts: export const listboxStyleModule
packages/ng/src/listbox/listbox-style.ts: export interface ListboxClassesParams
packages/ng/src/listbox/listbox.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UListbox, multi: true }],
packages/themes/src/presets/aura/index.ts:     listbox,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.listbox → [angular.listbox](angular.listbox.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
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
