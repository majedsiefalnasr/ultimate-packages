# Angular UTextarea

ID: angular.textarea

Framework: angular; availability: public

## Authored interpretation

Styles a native textarea in place, mirrors its value into model state and optionally grows with content.

## Framework surface

Attribute directive (selector [uTextarea], exportAs uTextarea) applied to a native <textarea>, not a wrapping component; there is no template. Standalone; extends UModelHolder directly (skipping UBaseEditableHolder) so it has no disabled input of its own. It injects NgControl optionally (self) read-only and does not implement ControlValueAccessor or provide NG_VALUE_ACCESSOR: Angular's native DefaultValueAccessor stays the only accessor, and the directive only mirrors NgControl.value (or the native value) into modelValue/$filled for styling via the native input event, ngAfterViewInit, NgControl.valueChanges (takeUntilDestroyed) and ngDoCheck. Optionally injects an ancestor UFluid (host, skipSelf); hasFluid is fluid() ?? presence of that ancestor. Signal inputs: variant ('filled'|'outlined'|undefined), fluid and invalid (boolean attribute transforms), plus autoResize (boolean attribute) and the output onResize: output<Event | Record<string, never>>() emitted by the private resize(), which resets height to auto, sets height from scrollHeight and switches overflow/overflowY according to a CSS max-height; autoResize runs it from ngAfterViewInit and each input event. Computed $variant. Host binds class via cx('root', classesParams()). componentName textarea. Public API: UTextarea (class). No data-p host attribute. Theme identity textarea matches componentName and the Aura components registry. CSS is hand-ported locally (a comment records that no @ultimate/uix-styles/textarea subpath exists); root class 'u-textarea u-component' plus p-invalid, u-textarea-fluid, p-variant-filled and u-textarea-resizable. Owned source-only declarations: TextareaClassesParams, textareaStyleModule. No dedicated component-metadata record exists in the current records directory. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. No dedicated manifest subpath; root entry only. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UTextarea

## Owned source and evidence

packages/ng/src/textarea/index.ts
packages/ng/src/textarea/textarea.ts
packages/ng/src/textarea/textarea-style.ts

```text
packages/ng/src/textarea/index.ts: export { UTextarea }
packages/ng/src/textarea/textarea.ts: export class UTextarea extends UModelHolder
packages/ng/src/textarea/textarea.ts: selector: "[uTextarea]"
packages/ng/src/textarea/textarea.ts: onResize = output<Event | Record<string, never>>();
packages/ng/src/textarea/textarea-style.ts: export interface TextareaClassesParams
packages/ng/src/textarea/textarea-style.ts: export const textareaStyleModule
packages/themes/src/presets/aura/index.ts:     textarea,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.textarea → [angular.textarea](angular.textarea.md) (reconciled family alias)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
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
