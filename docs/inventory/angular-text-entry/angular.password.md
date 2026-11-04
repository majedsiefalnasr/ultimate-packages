# Angular UPassword

ID: angular.password

Framework: angular; availability: public

## Authored interpretation

Password field with optional visibility toggle and an overlay strength meter driven by configurable regular expressions.

## Framework surface

Component selector u-password; standalone, OnPush, ViewEncapsulation.None; imports UOverlay and extends UBaseInput; provides NG_VALUE_ACCESSOR. Template: a native input switching type between password and text via the unmasked signal, optional inline SVG toggle icons (role=button, aria-labels 'Show Password'/'Hide Password') when toggleMask, and, when feedback, a uOverlay appended to body containing a meter bar and info text. Signal inputs: ariaLabel, inputId, placeholder, feedback (true), toggleMask (false), promptLabel, weakLabel, mediumLabel, strongLabel, mediumRegex and strongRegex (string patterns). Outputs onFocus: output<Event>() and onBlur: output<Event>() are declared but have no emit site in this source (the handlers only toggle the overlay and mark touched). Strength levels weak/medium/strong set meter width 33.33%/66.66%/100%; Escape key hides the overlay. writeControlValue override normalizes the value to a string and refreshes meter state. There is no invalid input; classesParams passes invalid: false constantly. From UBaseInput it inherits signal inputs fluid, variant, size, inputSize, pattern, min, max, step, minlength and maxlength; from UBaseEditableHolder disabled, the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and from UModelHolder the modelValue/$filled signals. hasFluid is true when fluid() is set or an ancestor UFluid provides U_FLUID_ANCESTOR. componentName password; Theme identity password matches the Aura components registry. Public API: UPassword (class). Owned source-only declarations: PasswordClassesParams, passwordStyleModule (keys root, pcInputText, maskIcon, unmaskIcon, clearIcon, overlay, meter, meterLabel, meterText; clearIcon has a class key and CSS but no template element in this source). A comment records that no @ultimate/uix-styles/password subpath exists, so CSS is local. No dedicated component-metadata record exists in the current records directory. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Also exposed via @ultimate/ng/password. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UPassword
@ultimate/ng/password#UPassword

## Owned source and evidence

packages/ng/src/password/index.ts
packages/ng/src/password/password.ts
packages/ng/src/password/password-style.ts

```text
packages/ng/src/password/index.ts: export { UPassword }
packages/ng/src/password/password.ts: export class UPassword extends UBaseInput
packages/ng/src/password/password.ts: selector: "u-password"
packages/ng/src/password/password.ts: toggleMask = input(false, { transform: booleanAttribute });
packages/ng/src/password/password.ts: onBlur = output<Event>();
packages/ng/src/password/password.ts: imports: [UOverlay]
packages/ng/src/password/password-style.ts: export interface PasswordClassesParams
packages/ng/src/password/password-style.ts: export const passwordStyleModule
packages/themes/src/presets/aura/index.ts:     password,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.password → [angular.password](angular.password.md) (reconciled family alias)
package.ultimate.ng-core.base-input (pending cross-batch)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.ng.fluid (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
