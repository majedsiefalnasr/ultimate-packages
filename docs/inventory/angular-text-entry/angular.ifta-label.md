# Angular UIftaLabel

ID: angular.ifta-label

Framework: angular; availability: public

## Authored interpretation

Container for a projected label and control using the inline top-aligned label layout.

## Framework surface

Component selector u-ifta-label; standalone, OnPush, ViewEncapsulation.None; extends UBaseComponent; template projects content; no own inputs or outputs. Host class cx('root') = 'u-ifta-label'. componentName iftalabel; Theme identity iftalabel matches the Aura components registry. CSS is hand-ported locally (comment records no @ultimate/uix-styles/ifta-label subpath) and selects descendants by class name (.u-input-text, .u-textarea, .u-input-icon, .u-inputwrapper-focus). Public API: UIftaLabel (class). Owned source-only declaration: iftaLabelStyleModule (no class-parameter interface). Layout-only wrapper: template is <ng-content>, no ControlValueAccessor or model tier; it extends UBaseComponent so it inherits dt/unstyled. No dedicated component-metadata record exists in the current records directory. Also exposed via @ultimate/ng/ifta-label. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UIftaLabel
@ultimate/ng/ifta-label#UIftaLabel

## Owned source and evidence

packages/ng/src/ifta-label/index.ts
packages/ng/src/ifta-label/ifta-label.ts
packages/ng/src/ifta-label/ifta-label-style.ts

```text
packages/ng/src/ifta-label/index.ts: export { UIftaLabel }
packages/ng/src/ifta-label/ifta-label.ts: export class UIftaLabel extends UBaseComponent
packages/ng/src/ifta-label/ifta-label.ts: selector: "u-ifta-label"
packages/ng/src/ifta-label/ifta-label-style.ts: export const iftaLabelStyleModule
packages/themes/src/presets/aura/index.ts: iftalabel: iftaLabel
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.ifta-label → [angular.ifta-label](angular.ifta-label.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
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
