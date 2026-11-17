# Angular UToggleSwitch

ID: angular.toggle-switch

Framework: angular; availability: public

## Authored interpretation

On/off switch backed by a native checkbox input with role=switch, configurable true and false values and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-toggle-switch; componentName toggleswitch. Signal inputs: trueValue (unknown, default true) and falseValue (unknown, default false). No outputs. checked is a plain arrow function (not a signal) returning modelValue() === trueValue(). Template: native input type=checkbox role=switch with [checked], [disabled]=$disabled(), [attr.aria-checked]=checked() and (change)=handleChange, then a slider div wrapping a handle div; there is no label input and no aria-label or aria-labelledby input. writeControlValue passes the value straight to setModelValue; handleChange writes falseValue() when checked, otherwise trueValue(), to modelValue, onModelChange and onModelTouched. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/toggle-switch. Public API: UToggleSwitch (class). Owned source-only declarations: ToggleSwitchClassesParams (checked, disabled), toggleSwitchStyleModule (classes root, input, slider, handle). CSS is hand-ported locally with no uix-styles import; it contains a p-invalid selector that classesParams never emits. Root class u-toggle-switch with u-toggle-switch-checked and p-disabled. Theme identity toggleswitch matches componentName and the Aura components registry key toggleswitch. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UToggleSwitch
@ultimate/ng/toggle-switch#UToggleSwitch

## Owned source and evidence

packages/ng/src/toggle-switch/index.ts
packages/ng/src/toggle-switch/toggle-switch.ts
packages/ng/src/toggle-switch/toggle-switch-style.ts

```text
packages/ng/src/toggle-switch/index.ts: export { UToggleSwitch }
packages/ng/src/toggle-switch/toggle-switch.ts: export class UToggleSwitch extends UBaseEditableHolder
packages/ng/src/toggle-switch/toggle-switch.ts: role="switch"
packages/ng/src/toggle-switch/toggle-switch.ts: readonly checked = () => this.modelValue() === this.trueValue();
packages/ng/src/toggle-switch/toggle-switch.ts: trueValue = input<unknown>(true);
packages/ng/src/toggle-switch/toggle-switch-style.ts: export interface ToggleSwitchClassesParams
packages/ng/src/toggle-switch/toggle-switch-style.ts: export const toggleSwitchStyleModule
packages/themes/src/presets/aura/index.ts:     toggleswitch: toggleSwitch,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.toggle-switch → [angular.toggle-switch](angular.toggle-switch.md) (reconciled family alias)
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
