# Angular URadioButton

ID: angular.radio-button

Framework: angular; availability: public

## Authored interpretation

Radio control backed by a native radio input, with value matching or binary mode and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-radio-button; componentName radiobutton. Signal inputs: value (unknown), binary (booleanAttribute, default false), name (string) and ariaLabel (string). No outputs. Template: native input type=radio with [attr.name], [checked], [disabled]=$disabled(), [attr.value] and [attr.aria-label]=ariaLabel(), plus a box div wrapping an icon div; there is no label element. writeControlValue sets checked to !!value in binary mode, otherwise to value === value(), then calls setModelValue(value). select() sets checked true and writes value() (or true in binary mode) to modelValue, onModelChange and onModelTouched; the component has no code path that unchecks itself, and mutual exclusion relies on the native name grouping per its doc comment. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/radio-button. Public API: URadioButton (class). Owned source-only declarations: RadioButtonClassesParams (checked, disabled), radioButtonStyleModule (classes root, box, input, icon). CSS is hand-ported locally with no @ultimate/uix-styles/radiobutton import; the CSS contains p-invalid and p-variant-filled selectors, but classesParams emits only checked and disabled (no invalid or variant input exists), so those modifiers are never applied by this source. Root class u-radio-button with u-radio-button-checked and p-disabled. Theme identity radiobutton matches componentName and the Aura components registry key radiobutton. No dedicated component-metadata record exists in the current records directory. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#URadioButton
@ultimate/ng/radio-button#URadioButton

## Owned source and evidence

packages/ng/src/radio-button/index.ts
packages/ng/src/radio-button/radio-button.ts
packages/ng/src/radio-button/radio-button-style.ts

```text
packages/ng/src/radio-button/index.ts: export { URadioButton }
packages/ng/src/radio-button/radio-button.ts: export class URadioButton extends UBaseEditableHolder
packages/ng/src/radio-button/radio-button.ts: ariaLabel = input<string>();
packages/ng/src/radio-button/radio-button.ts: const isChecked = this.binary() ? !!value : value === this.value();
packages/ng/src/radio-button/radio-button-style.ts: export interface RadioButtonClassesParams
packages/ng/src/radio-button/radio-button-style.ts: export const radioButtonStyleModule
packages/ng/src/radio-button/radio-button-style.ts: .u-radio-button.p-variant-filled .u-radio-button-box
packages/themes/src/presets/aura/index.ts:     radiobutton: radioButton,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.radio-button → [angular.radio-button](angular.radio-button.md) (reconciled family alias)
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
