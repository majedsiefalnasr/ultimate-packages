# Angular UInputOtp

ID: angular.input-otp

Framework: angular; availability: public

## Authored interpretation

One-time-code entry rendering one single-character native input per segment backed by one string model value.

## Framework surface

Component selector u-input-otp; standalone, OnPush, ViewEncapsulation.None; extends UBaseEditableHolder (not UBaseInput) and provides NG_VALUE_ACCESSOR via forwardRef. Template loops over range() rendering native inputs with maxlength 1, type from inputType() (password when mask), inputmode from inputMode() (numeric when integerOnly), disabled/readonly attributes and input, keydown, paste and focus handlers. Signal inputs: length (4), mask, integerOnly, readonly. Outputs: onChange: output<{ value: string }>(), onFocus: output<Event>(), onBlur: output<Event>(); onChange and onFocus have emit sites, onBlur is declared but has no emit site in this source. Public readonly computed inputMode and inputType. Local private tokens signal holds one character per segment; keyboard navigation (ArrowLeft/ArrowRight/Backspace via sibling traversal), integerOnly keydown filtering and paste splitting are implemented; writeControlValue override populates tokens. It inherits disabled and the CVA methods from UBaseEditableHolder and modelValue/$filled from UModelHolder, not the UBaseInput signal inputs. componentName inputotp; Theme identity inputotp matches the Aura components registry. Public API: UInputOtp (class). Segment inputs use cx('pcInputText') = 'u-inputtext u-inputotp-input' (class-name coupling to inputtext, no import). Owned source-only declarations: InputOtpClassesParams (Record<string, never>), inputOtpStyleModule. The doc comment records omitted upstream inputTemplate and passthrough. No dedicated component-metadata record exists in the current records directory. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Also exposed via @ultimate/ng/input-otp. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UInputOtp
@ultimate/ng/input-otp#UInputOtp

## Owned source and evidence

packages/ng/src/input-otp/index.ts
packages/ng/src/input-otp/input-otp.ts
packages/ng/src/input-otp/input-otp-style.ts

```text
packages/ng/src/input-otp/index.ts: export { UInputOtp }
packages/ng/src/input-otp/input-otp.ts: export class UInputOtp extends UBaseEditableHolder
packages/ng/src/input-otp/input-otp.ts: selector: "u-input-otp"
packages/ng/src/input-otp/input-otp.ts: onChange = output<{ value: string }>();
packages/ng/src/input-otp/input-otp.ts: onBlur = output<Event>();
packages/ng/src/input-otp/input-otp.ts: override writeControlValue
packages/ng/src/input-otp/input-otp-style.ts: export type InputOtpClassesParams
packages/ng/src/input-otp/input-otp-style.ts: export const inputOtpStyleModule
packages/ng/src/input-otp/input-otp-style.ts: pcInputText: "u-inputtext u-inputotp-input"
packages/themes/src/presets/aura/index.ts: inputotp: inputOtp
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.input-otp → [angular.input-otp](angular.input-otp.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.uix-styles.inputtext (pending cross-batch)
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
