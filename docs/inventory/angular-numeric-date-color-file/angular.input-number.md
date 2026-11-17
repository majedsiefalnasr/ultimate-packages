# Angular UInputNumber

ID: angular.input-number

Framework: angular; availability: public

## Authored interpretation

Single numeric text field: a native text input with decimal input mode that parses each input event with Number(), clamps the result to min and max, and reports it to the form control.

## Framework surface

Extends UBaseInput (which extends UBaseEditableHolder and UModelHolder) so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-input-number; componentName inputnumber. Own members: the invalid signal input (booleanAttribute) and a public value signal (number|null). Inherited UBaseInput inputs read by the template: min, max, step, minlength, maxlength, pattern and inputSize (bound to the size attribute); variant and size are not read anywhere in this component's source; fluid is consumed only through hasFluid in classesParams. No outputs: the component declares no output() and has no blur, focus, keydown, paste or spinner-button handler; the only listener is (input). Template: one native input type=text with inputmode=decimal and role=spinbutton, [value]=value() ?? '', aria-valuemin/aria-valuemax/aria-valuenow bound to min()/max()/value(), min and max attributes, step attribute defaulting to 1 (step is never used for stepping), maxlength, minlength, pattern, size and a disabled attribute from $disabled(). There is no inputId, ariaLabel or placeholder input, so the template binds no aria-label or label association to the input. onInput: an empty string becomes null, any other text becomes Number(raw) with no guard, so non-numeric text yields NaN; clampToRange returns early for null and its comparisons are false for NaN, so NaN is stored unclamped and rendered back as NaN. It then calls writeModelValue, onModelChange and onModelTouched on every input event (touched is not tied to blur). writeControlValue stores Number(value) only for truthy values; falsy values (0, empty string, null, undefined) are stored without conversion. It then runs clampToRange, calls setModelValue with the stored value and also calls onModelChange on every CVA write, so a write can push the clamped value back to the form control. clampToRange (private) clamps to min, else to max, and is not re-run when min or max change. Locale or currency formatting (Intl), paste handling, caret logic, prefix/suffix and stepper buttons are not implemented in the source; they appear only in a doc comment as excluded. Host class cx('root', {invalid, fluid}); inner input gets cx('pcInputText') = u-inputnumber-input. The local style module imports the CSS from @ultimate/uix-styles/inputnumber (subpath exported by packages/uix-styles/package.json; defines .u-inputnumber, .u-inputnumber-fluid and .u-inputnumber-input among others). Owned source-only declarations: InputNumberClassesParams and inputNumberStyleModule (root 'u-inputnumber u-component' with p-invalid and u-inputnumber-fluid). Consumer availability: exported as UInputNumber from the @ultimate/ng/input-number manifest subpath only; it is not re-exported by the root barrel packages/ng/src/index.ts, which has no input-number line. Overlay: none; the component does not use UOverlay. Aura registry key is inputnumber (folder and selector use the hyphenated name); aura-token-wiring.spec.ts lists no approved unresolved variables for UInputNumber. That spec was not executed. There is no component-metadata record for this family (packages/component-metadata/src/records holds none for it). Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; those declared inputs are not read anywhere in ng-core, so they are not evidence that unstyled suppresses registration. Standalone, OnPush, ViewEncapsulation.None. Style helper exports are source-only internals, not barrel exports or independent rendered components. The spec and stories files are excluded.

## Public exports

@ultimate/ng/input-number#UInputNumber

## Owned source and evidence

packages/ng/src/input-number/index.ts
packages/ng/src/input-number/input-number.ts
packages/ng/src/input-number/input-number-style.ts

```text
packages/ng/src/input-number/index.ts: export { UInputNumber }
packages/ng/src/input-number/input-number.ts: export class UInputNumber extends UBaseInput
packages/ng/src/input-number/input-number.ts: role="spinbutton"
packages/ng/src/input-number/input-number.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UInputNumber, multi: true }],
packages/ng/src/input-number/input-number.ts: const next = raw === "" ? null : Number(raw);
packages/ng/src/input-number/input-number.ts: this.value.set(value ? Number(value) : (value as number | null));
packages/ng/src/input-number/input-number.ts:     this.onModelChange(this.value());
  }

  protected onInput
packages/ng/src/input-number/input-number.ts:     this.onModelTouched();
packages/ng/src/input-number/input-number.ts: if (min != null && current < min) {
packages/ng/src/input-number/input-number-style.ts: import { style as inputNumberStyle } from "@ultimate/uix-styles/inputnumber";
packages/ng/src/input-number/input-number-style.ts: export interface InputNumberClassesParams
packages/ng/src/input-number/input-number-style.ts: export const inputNumberStyleModule
packages/uix-styles/package.json: "./inputnumber": {
packages/ng/package.json: "./input-number": {
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/themes/src/presets/aura/index.ts:     inputnumber: inputNumber,
```

## Relationships

package.ultimate.ng.input-number → [angular.input-number](angular.input-number.md) (reconciled family alias)
package.ultimate.ng-core.base-input (pending cross-batch)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng.fluid (pending cross-batch)
package.ultimate.uix-styles.inputnumber (pending cross-batch)
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
    "behavior": "Bounded Angular product suite for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{input-number,date-picker,color-picker,file-upload}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "73cc77945ad2e4213695c2d140166822dc1ad12c",
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
