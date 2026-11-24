# Angular UToggleSwitch

ID: angular.toggle-switch

Framework: angular; availability: public

## Authored interpretation

On/off switch backed by a native checkbox input with role=switch, configurable true and false values, readonly, invalid, a handle template and a ControlValueAccessor contract.

## Framework surface

UToggleSwitch (selector u-toggle-switch, componentName toggleswitch) is a standalone OnPush component with ViewEncapsulation.None that extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR and U_PARENT_INSTANCE through useExisting, declares the UBind host directive and overrides writeControlValue. It inherits dt, unstyled and pt from UBaseComponent, and the disabled signal input, $disabled and the ControlValueAccessor methods from UBaseEditableHolder. Signal inputs: trueValue (unknown, default true), falseValue (unknown, default false), tabindex (numberAttribute), inputId, name, required, readonly, invalid and autofocus (booleanAttribute, default false), ariaLabel and ariaLabelledBy. Output: onChange emitting UToggleSwitchChangeEvent {originalEvent, checked}. A contentChild #handle template (context UToggleSwitchHandleContext {checked}) replaces the handle content. checked is a plain arrow function returning modelValue() === trueValue(). Template: a native input type=checkbox role=switch bound through uBind to the input pass-through section, with id, checked, disabled, required, name, tabindex, aria-checked, aria-labelledby, aria-label, aria-invalid (set from invalid) and uAutoFocus, then a slider div and a handle div, each bound to its own pass-through section. The host carries data-p-checked, data-p-disabled and data-p, and ngAfterViewChecked binds the host and root sections. handleChange restores the native state and returns when disabled or readonly; otherwise it writes falseValue() when checked and trueValue() when not to modelValue and onModelChange and emits onChange. handleBlur calls onModelTouched, so the control is touched on blur, not on change. The style module imports the shared @ultimate/uix-styles/toggleswitch module and adds only the Angular .ng-invalid.ng-dirty rule; classes root (checked, disabled, invalid), input, slider and handle. Root class u-toggle-switch u-component with u-toggle-switch-checked, p-disabled and p-invalid. Theme identity toggleswitch matches componentName and the Aura components registry key toggleswitch. Root @ultimate/ng re-exports this component and the UToggleSwitchChangeEvent and UToggleSwitchHandleContext types; also exposed via @ultimate/ng/toggle-switch. Style module exports and class-parameter interfaces are source-only internals, not barrel exports.

## Public exports

@ultimate/ng#UToggleSwitch
@ultimate/ng/toggle-switch#UToggleSwitch
@ultimate/ng#UToggleSwitchChangeEvent
@ultimate/ng/toggle-switch#UToggleSwitchChangeEvent
@ultimate/ng#UToggleSwitchHandleContext
@ultimate/ng/toggle-switch#UToggleSwitchHandleContext

## Owned source and evidence

packages/ng/src/toggle-switch/index.ts
packages/ng/src/toggle-switch/toggle-switch.ts
packages/ng/src/toggle-switch/toggle-switch-style.ts

```text
packages/ng/src/toggle-switch/index.ts: type UToggleSwitchChangeEvent,
packages/ng/src/toggle-switch/toggle-switch.ts: export class UToggleSwitch extends UBaseEditableHolder
packages/ng/src/toggle-switch/toggle-switch.ts: role="switch"
packages/ng/src/toggle-switch/toggle-switch.ts: readonly checked = () => this.modelValue() === this.trueValue();
packages/ng/src/toggle-switch/toggle-switch.ts: hostDirectives: [UBind],
packages/ng/src/toggle-switch/toggle-switch.ts: (blur)="handleBlur()"
packages/ng/src/toggle-switch/toggle-switch.ts: contentChild<TemplateRef<UToggleSwitchHandleContext>>
packages/ng/src/toggle-switch/toggle-switch-style.ts: @ultimate/uix-styles/toggleswitch
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
