# Angular UInputMask

ID: angular.input-mask

Framework: angular; availability: public

## Authored interpretation

Native text input that formats typed and pasted characters against a mask pattern and reports completion and the unmasked value.

## Framework surface

Two public classes. UInputMask (selector u-input-mask; standalone, OnPush, ViewEncapsulation.None) extends UBaseInput, provides NG_VALUE_ACCESSOR (useExisting UInputMask, multi) and renders one native <input> (ViewChild) plus an optional clear icon (a #clearicon template or UTimesIcon). UInputMaskDirective (selector [uInputMask], exportAs uInputMask) extends UBaseComponent and masks a host input. Both delegate the DOM listeners and the buffer algorithm to InputMaskEngine (input-mask-engine.ts): focus, blur, keydown, keypress, input, paste, compositionstart and compositionend; Backspace, Delete, Escape (restores the value held at focus) and Enter (blurs); keepBuffer; an Android Chrome branch; a deferred paste reformat that runs after the browser applies the paste; and a re-entrancy flag for the engine's own synthetic input event. Component signal inputs: mask, slotChar ('_'), autoClear (true), characterPattern, keepBuffer, unmask, readonly, placeholder, invalid, showClear, type, inputId, name, title, autocomplete, tabindex, ariaLabel, ariaLabelledBy, ariaRequired, required and autofocus. Outputs: onCompleteEvent, onUnmaskedChange, onFocus, onBlur, onKeydown, onInput and onClear; methods focus() and clear(). A value written before the view exists is applied in ngAfterViewInit, and a changed mask re-initializes and reformats. aria-invalid is set on the input. The directive has outputs onComplete and onUnmaskedChange and uses the unprefixed pt, ptOptions, unstyled and dt of the base (ADR-095). From UBaseInput the component inherits fluid, variant, size, inputSize and the min/max attributes; hasFluid is true when fluid() is set or an ancestor UFluid provides U_FLUID_ANCESTOR. componentName is inputmask (component) and inputmaskdirective (directive). The component binds UBind with ptms(['host','root']) and provides U_PARENT_INSTANCE (ADR-079, ADR-080); ptOptions has no visible effect until the global pt source exists. Host class cx('root', ...) is u-inputmask u-component p-inputwrapper with p-invalid, p-variant-filled and u-inputmask-fluid; the inner input uses cx('pcInputText') to produce the InputText classes. The style module includes the shared @ultimate/uix-styles/inputtext CSS (ADR-082) and the clear icon, fluid and .ng-invalid.ng-dirty rules. Owned source-only declarations: InputMaskClassesParams, InputMaskInputClassesParams, inputMaskStyleModule and inputMaskDirectiveStyleModule. The Aura registry has no inputmask key. Mobile and IME paths are tested with simulated events only. No dedicated component-metadata record exists in the current records directory. Also exposed via @ultimate/ng/input-mask. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UInputMask
@ultimate/ng/input-mask#UInputMask
@ultimate/ng#UInputMaskDirective
@ultimate/ng/input-mask#UInputMaskDirective

## Owned source and evidence

packages/ng/src/input-mask/index.ts
packages/ng/src/input-mask/input-mask-engine.ts
packages/ng/src/input-mask/input-mask.ts
packages/ng/src/input-mask/input-mask-style.ts

```text
packages/ng/src/input-mask/index.ts: export { UInputMask, UInputMaskDirective }
packages/ng/src/input-mask/input-mask.ts: export class UInputMask extends UBaseInput
packages/ng/src/input-mask/input-mask.ts: selector: "u-input-mask"
packages/ng/src/input-mask/input-mask.ts: onCompleteEvent = output<void>();
packages/ng/src/input-mask/input-mask.ts: onUnmaskedChange = output<string>();
packages/ng/src/input-mask/input-mask.ts: override writeControlValue
packages/ng/src/input-mask/input-mask.ts: selector: "[uInputMask]"
packages/ng/src/input-mask/input-mask.ts: export class UInputMaskDirective extends UBaseComponent
packages/ng/src/input-mask/input-mask-engine.ts: export class InputMaskEngine
packages/ng/src/input-mask/input-mask-style.ts: export interface InputMaskClassesParams
packages/ng/src/input-mask/input-mask-style.ts: export const inputMaskStyleModule
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
