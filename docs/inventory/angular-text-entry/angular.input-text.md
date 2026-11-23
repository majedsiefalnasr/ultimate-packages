# Angular UInputText

ID: angular.input-text

Framework: angular; availability: public

## Authored interpretation

Styles a native input element in place, mirrors its value into model state for filled styling, and exposes size, pass-through, unstyled and per-instance dt; not a wrapping component.

## Framework surface

Attribute directive (selector [uInputText], exportAs uInputText) applied to a native <input>, not a wrapping component; there is no template. Standalone; extends UModelHolder directly (skipping UBaseEditableHolder) so it has no disabled input of its own. It injects NgControl optionally (self) read-only and does not implement ControlValueAccessor or provide NG_VALUE_ACCESSOR: Angular's native DefaultValueAccessor stays the only accessor, and the directive only mirrors NgControl.value (or the native value) into modelValue/$filled for styling via the native input event, ngAfterViewInit, NgControl.valueChanges (takeUntilDestroyed) and ngDoCheck. Optionally injects an ancestor UFluid (host, skipSelf); hasFluid is fluid() ?? presence of that ancestor. Signal inputs: variant ('filled'|'outlined'|undefined), uSize ('small'|'large'|undefined, named so it does not collide with the native size attribute), fluid and invalid (boolean attribute transforms). Computed $variant. hostDirectives [UBind]; ngAfterViewChecked applies ptms(['host','root']) to the input, so pt and ptOptions reach it. Host binds class via cx('root', classesParams()) and host attribute data-p from a cn() token string (invalid, fluid, variant-derived filled, size token). The p-filled class is value-derived ($filled). componentName inputtext; imports cn from @ultimate/uix-utils/classnames. Public API: UInputText (class). The doc comment records the omitted hostName lookup, inputSize attribute and NgModule wrapper; no outputs are declared. Theme identity inputtext matches componentName and the Aura components registry; dt() resolves those token references via base registration. CSS comes from @ultimate/uix-styles/inputtext (style import) with local inputTextStyleModule supplying css/classes: root class 'u-inputtext u-component' plus p-filled, p-invalid, u-inputtext-fluid, p-variant-filled, u-inputtext-sm and u-inputtext-lg modifiers; the local css adds the Angular-only .u-inputtext.ng-invalid.ng-dirty border and placeholder rules. Owned source-only declarations: InputTextClassesParams, inputTextStyleModule. No dedicated component-metadata record exists in the current records directory. Inherits dt, unstyled, pt and ptOptions from UBaseComponent (ADR-077, ADR-085); a unit test shows unstyled drops the classes and dt writes a scoped variable block, and ptOptions has no visible effect until the global pt source exists (ADR-080). The decisions for this family are in ADR-086. No dedicated manifest subpath; root entry only. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UInputText

## Owned source and evidence

packages/ng/src/input-text/index.ts
packages/ng/src/input-text/input-text.ts
packages/ng/src/input-text/input-text-style.ts

```text
packages/ng/src/input-text/index.ts: export { UInputText }
packages/ng/src/input-text/input-text.ts: export class UInputText extends UModelHolder
packages/ng/src/input-text/input-text.ts: selector: "[uInputText]"
packages/ng/src/input-text/input-text.ts: inject(NgControl, { optional: true, self: true })
packages/ng/src/input-text/input-text-style.ts: import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";
packages/ng/src/input-text/input-text-style.ts: export interface InputTextClassesParams
packages/ng/src/input-text/input-text-style.ts: export const inputTextStyleModule
packages/themes/src/presets/aura/index.ts: inputtext: inputText
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/ng/src/input-text/input-text.ts: hostDirectives: [UBind]
packages/ng/src/input-text/input-text.ts: uSize = input<"small" | "large" | undefined>()
packages/ng/src/input-text/input-text-style.ts: .u-inputtext.ng-invalid.ng-dirty {
```

## Relationships

package.ultimate.ng.input-text → [angular.input-text](angular.input-text.md) (reconciled family alias)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng.fluid (pending cross-batch)
package.ultimate.uix-styles.inputtext (pending cross-batch)
package.ultimate.uix-utils.classnames (pending cross-batch)
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
