# Angular UIconField and UInputIcon

ID: angular.icon-field

Framework: angular; availability: public

## Authored interpretation

Composition pair placing a projected icon beside a projected input inside a shared field wrapper.

## Framework surface

Two standalone OnPush components in one file. UIconField selector u-icon-field extends UBaseComponent, projects content and declares iconPosition: 'left'|'right' (default 'left'); that input is declared but not read by the host class or style in this source. UInputIcon selector u-input-icon extends UBaseComponent and projects the icon content; it has no inputs. Both host classes are cx('root'): u-icon-field and u-input-icon. componentNames iconfield and input-icon; Theme identity iconfield matches the Aura components registry, while input-icon has no registry key. UIconField's style module owns the shared .u-icon-field/.u-input-icon CSS; UInputIcon's style module has empty css. CSS is hand-ported locally. Public API: UIconField, UInputIcon (classes). Owned source-only declarations: iconFieldStyleModule, inputIconStyleModule. Layout-only wrapper: template is <ng-content>, no ControlValueAccessor or model tier; it extends UBaseComponent so it inherits dt/unstyled. No dedicated component-metadata record exists in the current records directory. Also exposed via @ultimate/ng/icon-field. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UIconField
@ultimate/ng#UInputIcon
@ultimate/ng/icon-field#UIconField
@ultimate/ng/icon-field#UInputIcon

## Owned source and evidence

packages/ng/src/icon-field/index.ts
packages/ng/src/icon-field/icon-field.ts
packages/ng/src/icon-field/icon-field-style.ts

```text
packages/ng/src/icon-field/index.ts: export { UIconField, UInputIcon }
packages/ng/src/icon-field/icon-field.ts: export class UIconField extends UBaseComponent
packages/ng/src/icon-field/icon-field.ts: export class UInputIcon extends UBaseComponent
packages/ng/src/icon-field/icon-field.ts: iconPosition = input<"left" | "right">("left");
packages/ng/src/icon-field/icon-field-style.ts: export const iconFieldStyleModule
packages/ng/src/icon-field/icon-field-style.ts: export const inputIconStyleModule
packages/themes/src/presets/aura/index.ts: iconfield: iconField
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.icon-field → [angular.icon-field](angular.icon-field.md) (reconciled family alias)
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
