# Angular UToggleButton

ID: angular.toggle-button

Framework: angular; availability: public

## Authored interpretation

Two-state button whose host element is the interactive role=button element, with on and off labels and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-toggle-button; componentName togglebutton. Signal inputs: onLabel (string, default 'Yes'), offLabel (string, default 'No') and fluid (booleanAttribute). No outputs. Host bindings: role button, aria-pressed 'true'/'false' from checked(), tabindex -1 when $disabled() else 0, (click)=handleToggle, (keydown.enter) and (keydown.space)=handleKeydown (preventDefault then toggle); a HostListener on blur calls onModelTouched. Template: a content span wrapping a label span showing onLabel or offLabel. writeControlValue sets checked to !!value and calls setModelValue(value); handleToggle writes the negated boolean to modelValue, onModelChange and onModelTouched. Disabled is exposed through tabindex and the skipped handler; the host sets no aria-disabled. USelectButton composes this component. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/toggle-button. Public API: UToggleButton (class). Owned source-only declarations: ToggleButtonClassesParams (checked, disabled, fluid), toggleButtonStyleModule (classes root, content, icon, label; the icon key has no template element in this source). CSS is hand-ported locally with no uix-styles import; it contains a p-invalid selector that classesParams never emits. Root class u-toggle-button with u-toggle-button-checked, p-disabled and u-toggle-button-fluid. Theme identity togglebutton matches componentName and the Aura components registry key togglebutton. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UToggleButton
@ultimate/ng/toggle-button#UToggleButton

## Owned source and evidence

packages/ng/src/toggle-button/index.ts
packages/ng/src/toggle-button/toggle-button.ts
packages/ng/src/toggle-button/toggle-button-style.ts

```text
packages/ng/src/toggle-button/index.ts: export { UToggleButton }
packages/ng/src/toggle-button/toggle-button.ts: export class UToggleButton extends UBaseEditableHolder
packages/ng/src/toggle-button/toggle-button.ts: "[attr.role]": "'button'",
packages/ng/src/toggle-button/toggle-button.ts: @HostListener("blur")
packages/ng/src/toggle-button/toggle-button.ts: onLabel = input<string>("Yes");
packages/ng/src/toggle-button/toggle-button-style.ts: export interface ToggleButtonClassesParams
packages/ng/src/toggle-button/toggle-button-style.ts: export const toggleButtonStyleModule
packages/ng/src/toggle-button/toggle-button-style.ts: .u-toggle-button.p-invalid {
packages/themes/src/presets/aura/index.ts:     togglebutton: toggleButton,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.toggle-button → [angular.toggle-button](angular.toggle-button.md) (reconciled family alias)
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
