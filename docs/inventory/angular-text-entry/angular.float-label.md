# Angular UFloatLabel

ID: angular.float-label

Framework: angular; availability: public

## Authored interpretation

Container that positions a projected label over or in a projected form control according to a variant.

## Framework surface

Component selector u-float-label; standalone, OnPush, ViewEncapsulation.None; extends UBaseComponent; template projects content. Signal input variant: 'in'|'over'|'on' (default 'over'); no outputs. Host class cx('root', {variant}) producing u-float-label plus u-float-label-over, -on or -in; the root is bound through the UBind host directive (ptms host and root, so pt and ptOptions reach the root) and the component provides itself as U_PARENT_INSTANCE. pt, unstyled and dt come from UBaseComponent. componentName floatlabel; Theme identity floatlabel matches the Aura components registry and CSS reads dt('floatlabel.*'). The CSS is the shared @ultimate/uix-styles/floatlabel module (ADR-082) plus one Angular-only rule for .ng-invalid.ng-dirty; the module keys the float state on the classes the sibling fields emit (u-inputtext, u-textarea, p-filled, p-invalid, p-inputwrapper-filled and -focus, u-select-label, u-multi-select-label, u-cascade-select-label), so the filled and invalid label states apply to UInputText. The decisions are in ADR-090. Public API: UFloatLabel (class). Owned source-only declarations: FloatLabelClassesParams, floatLabelStyleModule. Layout-only wrapper: template is <ng-content>, no ControlValueAccessor or model tier; it extends UBaseComponent so it inherits dt/unstyled. No dedicated component-metadata record exists in the current records directory. Also exposed via @ultimate/ng/float-label. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UFloatLabel
@ultimate/ng/float-label#UFloatLabel

## Owned source and evidence

packages/ng/src/float-label/index.ts
packages/ng/src/float-label/float-label.ts
packages/ng/src/float-label/float-label-style.ts

```text
packages/ng/src/float-label/index.ts: export { UFloatLabel }
packages/ng/src/float-label/float-label.ts: export class UFloatLabel extends UBaseComponent
packages/ng/src/float-label/float-label.ts: variant = input<"in" | "over" | "on">("over");
packages/ng/src/float-label/float-label-style.ts: export interface FloatLabelClassesParams
packages/ng/src/float-label/float-label-style.ts: export const floatLabelStyleModule
packages/themes/src/presets/aura/index.ts: floatlabel: floatLabel
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.float-label → [angular.float-label](angular.float-label.md) (reconciled family alias)
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
