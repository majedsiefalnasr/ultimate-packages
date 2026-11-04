# Angular UInputMask

ID: angular.input-mask

Framework: angular; availability: public

## Authored interpretation

Native text input that formats typed and pasted characters against a mask pattern and reports completion and the unmasked value.

## Framework surface

Component selector u-input-mask; standalone, OnPush, ViewEncapsulation.None; extends UBaseInput and provides NG_VALUE_ACCESSOR (useExisting UInputMask, multi). Template is one native <input type=text> (ViewChild inputEl) with keypress, keydown, input, paste, focus and blur handlers and disabled/readonly/placeholder/maxlength/minlength/size attributes. Signal inputs: mask, slotChar ('_'), autoClear (true), characterPattern ('[A-Za-z]'), unmask, readonly, placeholder, invalid. Outputs: onCompleteEvent: output<void>() and onUnmaskedChange: output<string>(). onFocus/onBlur are protected handlers, not outputs. writeControlValue override reformats a written string through the mask buffer; the model value is the unmasked or the formatted buffer string according to unmask(). From UBaseInput it inherits signal inputs fluid, variant, size, inputSize, pattern, min, max, step, minlength and maxlength; from UBaseEditableHolder disabled, the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. hasFluid is true when fluid() is set or an ancestor UFluid provides U_FLUID_ANCESTOR. componentName input-mask; ngOnInit builds the mask definitions. Public API: UInputMask (class). Host class cx('root', {invalid, fluid}); inner input uses cx('pcInputText') = 'u-inputtext', so its look relies on the inputtext class name coupling rather than an import. No dedicated Aura registry key (aura/index.ts records that inputmask has no upstream module and reuses InputText tokens). Owned source-only declarations: InputMaskClassesParams, inputMaskStyleModule (root 'u-inputmask u-component' with p-invalid and u-inputmask-fluid). No dedicated component-metadata record exists in the current records directory. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Also exposed via @ultimate/ng/input-mask. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UInputMask
@ultimate/ng/input-mask#UInputMask

## Owned source and evidence

packages/ng/src/input-mask/index.ts
packages/ng/src/input-mask/input-mask.ts
packages/ng/src/input-mask/input-mask-style.ts

```text
packages/ng/src/input-mask/index.ts: export { UInputMask }
packages/ng/src/input-mask/input-mask.ts: export class UInputMask extends UBaseInput
packages/ng/src/input-mask/input-mask.ts: selector: "u-input-mask"
packages/ng/src/input-mask/input-mask.ts: onCompleteEvent = output<void>();
packages/ng/src/input-mask/input-mask.ts: onUnmaskedChange = output<string>();
packages/ng/src/input-mask/input-mask.ts: override writeControlValue
packages/ng/src/input-mask/input-mask-style.ts: export interface InputMaskClassesParams
packages/ng/src/input-mask/input-mask-style.ts: export const inputMaskStyleModule
packages/ng/src/input-mask/input-mask-style.ts: pcInputText: "u-inputtext"
packages/themes/src/presets/aura/index.ts: `inputmask` has no upstream module
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.input-mask → [angular.input-mask](angular.input-mask.md) (reconciled family alias)
package.ultimate.ng-core.base-input (pending cross-batch)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng.fluid (pending cross-batch)
package.ultimate.uix-styles.inputtext (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component or directive, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the text-entry families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{input-text,textarea,input-mask,input-otp,password,float-label,ifta-label,icon-field,input-group}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "07ced02e76e763352e806fc53006976eb0f6259d",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. The #107 record of a compile-time failure of this suite at 4ad39332 covered other families at another revision and is not evidence for this one. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
