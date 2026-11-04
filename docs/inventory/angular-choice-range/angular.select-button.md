# Angular USelectButton

ID: angular.select-button

Framework: angular; availability: public

## Authored interpretation

Group of toggle buttons, one per option, supporting single or multiple selection, option accessors and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-select-button; componentName selectbutton. Composition: imports UToggleButton (from @ultimate/ng/toggle-button) and ReactiveFormsModule and renders one u-toggle-button per option in an @for loop, each bound with [formControl] to an entry of the optionControls computed array of FormControl<boolean>; each control's valueChanges subscription calls onOptionSelect, and the source has no explicit unsubscribe. A constructor effect syncs every control's value and disabled state with emitEvent false. Signal inputs: options (unknown[], default []), optionLabel, optionValue and optionDisabled (each a property name string or function), multiple (booleanAttribute, default false), allowEmpty (booleanAttribute, default true) and ariaLabelledBy (string). Output onChange: output<USelectButtonChangeEvent>() emitted from onOptionSelect with a synthetic new Event('change') as originalEvent and the new value. Exported type USelectButtonChangeEvent is { originalEvent: Event; value: unknown }. Host bindings: role group and aria-labelledby from ariaLabelledBy(). Selection compares by ===: single mode writes the option value or null (blocked when allowEmpty is false); multiple mode writes an array. classesParams returns the constant { invalid: false, fluid: false } because no invalid or fluid input exists. writeControlValue passes the value to setModelValue. No dedicated manifest subpath: @ultimate/ng/select-button is not in packages/ng/package.json exports, and the root barrel re-exports it from './select-button'. Public API: USelectButton (class), USelectButtonChangeEvent (type). Owned source-only declarations: SelectButtonClassesParams (invalid, fluid), selectButtonStyleModule (classes root only). CSS is hand-ported locally with no uix-styles import; root class u-select-button with p-invalid and u-select-button-fluid modifiers. Theme identity selectbutton matches componentName and the Aura components registry key selectbutton. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#USelectButton
@ultimate/ng#USelectButtonChangeEvent

## Owned source and evidence

packages/ng/src/select-button/index.ts
packages/ng/src/select-button/select-button.ts
packages/ng/src/select-button/select-button-style.ts

```text
packages/ng/src/select-button/index.ts: export { USelectButton }
packages/ng/src/select-button/select-button.ts: export class USelectButton extends UBaseEditableHolder
packages/ng/src/select-button/index.ts: export type { USelectButtonChangeEvent }
packages/ng/src/select-button/select-button.ts: import { UToggleButton } from "@ultimate/ng/toggle-button";
packages/ng/src/select-button/select-button.ts: return { invalid: false, fluid: false };
packages/ng/src/select-button/select-button.ts: this.onChange.emit({ originalEvent: new Event("change"), value: newValue });
packages/ng/src/select-button/select-button-style.ts: export interface SelectButtonClassesParams
packages/ng/src/select-button/select-button-style.ts: export const selectButtonStyleModule
packages/ng/src/index.ts: export * from "./select-button";
packages/themes/src/presets/aura/index.ts:     selectbutton: selectButton,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.select-button → [angular.select-button](angular.select-button.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng.toggle-button → [angular.toggle-button](angular.toggle-button.md) (reconciled family alias)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{checkbox,radio-button,toggle-button,toggle-switch,select-button,rating,slider,knob}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "d2e8101bf77e8e440c7166211ad5eae0e0ac6df8",
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
