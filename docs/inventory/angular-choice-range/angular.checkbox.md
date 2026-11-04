# Angular UCheckbox

ID: angular.checkbox

Framework: angular; availability: public

## Authored interpretation

Boolean checkbox control backed by a native input with an optional text label and a ControlValueAccessor contract.

## Framework surface

Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. From UBaseEditableHolder it inherits the disabled signal input, $disabled (disabled() or the setDisabledState signal), the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. The component extends UBaseEditableHolder, provides NG_VALUE_ACCESSOR via useExisting with multi, and overrides writeControlValue. Standalone, OnPush, ViewEncapsulation.None. Component selector u-checkbox; componentName checkbox. Signal inputs: binary (booleanAttribute, default false) and label (string). binary has no read site in checkbox.ts (declared at the input line only, so it does not change behavior in this source). No outputs; state flows through the ControlValueAccessor methods. Template: native input type=checkbox with [checked] from the checked signal, [disabled]=$disabled(), [attr.aria-label]=label(), (change) and (keydown.space) handlers (handleSpace calls preventDefault then toggles), a box div, and a label span rendered only when label() is set. The only accessible name is label() through aria-label; there is no ariaLabel or ariaLabelledBy input. writeControlValue sets the checked signal to !!value and calls setModelValue(value); toggle() writes the next boolean to modelValue and calls onModelChange and onModelTouched. Host class from cx('root') with checked and disabled params. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/checkbox. Public API: UCheckbox (class). Owned source-only declarations: CheckboxClassesParams (checked, disabled), checkboxStyleModule (classes root, box, input, icon, label; the icon key has no template element in this source). CSS comes from the @ultimate/uix-styles/checkbox style export interpolated by checkboxStyleModule; root class u-checkbox with u-checkbox-checked p-highlight and p-disabled modifiers. Theme identity checkbox matches componentName and the Aura components registry. CHECKBOX_METADATA in packages/component-metadata/src/records/checkbox.ts associates sourcePath packages/ng/src/checkbox/checkbox.ts with this source; the generated checkbox.api.mdx is an excluded documentation fixture. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UCheckbox
@ultimate/ng/checkbox#UCheckbox

## Owned source and evidence

packages/ng/src/checkbox/index.ts
packages/ng/src/checkbox/checkbox.ts
packages/ng/src/checkbox/checkbox-style.ts

```text
packages/ng/src/checkbox/index.ts: export { UCheckbox }
packages/ng/src/checkbox/checkbox.ts: export class UCheckbox extends UBaseEditableHolder
packages/ng/src/checkbox/checkbox.ts: binary = input(false, { transform: booleanAttribute });
packages/ng/src/checkbox/checkbox-style.ts: import { style as checkboxStyle } from "@ultimate/uix-styles/checkbox";
packages/ng/src/checkbox/checkbox-style.ts: export const checkboxStyleModule
packages/ng/src/checkbox/checkbox-style.ts: export interface CheckboxClassesParams
packages/component-metadata/src/records/checkbox.ts: export const CHECKBOX_METADATA
packages/ng/src/checkbox/checkbox.ts: [attr.aria-label]="label()"
packages/themes/src/presets/aura/index.ts:     checkbox,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.checkbox → [angular.checkbox](angular.checkbox.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-styles.checkbox (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
