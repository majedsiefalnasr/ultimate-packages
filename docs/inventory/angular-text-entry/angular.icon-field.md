# Angular UIconField and UInputIcon

ID: angular.icon-field

Framework: angular; availability: public

## Authored interpretation

Composition pair placing a projected icon beside a projected input inside a shared field wrapper.

## Framework surface

Two standalone OnPush components in one file. UIconField selector u-icon-field extends UBaseComponent, projects content and declares iconPosition: 'left'|'right' (default 'left'); the input only adds the root class u-icon-field-left or u-icon-field-right through cx('root', {iconPosition}), and the CSS positions the icon with :first-child and :last-child against DOM order. UInputIcon selector u-input-icon extends UBaseComponent, projects the icon content, has no inputs, and sets the host attribute aria-hidden="true" by default (an attribute written in the template or a pt entry replaces it). Both hosts bind the root through the UBind host directive (ptms host and root in ngAfterViewChecked) and provide themselves as U_PARENT_INSTANCE. componentNames are iconfield and inputicon; Theme identity iconfield matches the Aura components registry, while inputicon has no registry key. UIconField's style module owns the shared CSS, which is the @ultimate/uix-styles/iconfield module (ADR-082, ADR-091) keyed on u-inputtext and p-inputwrapper; UInputIcon's style module has empty css. Public API: UIconField, UInputIcon (classes). Owned source-only declarations: iconFieldStyleModule, inputIconStyleModule. Layout-only wrapper: template is <ng-content>, no ControlValueAccessor or model tier; it extends UBaseComponent so it inherits dt, unstyled and pt. No dedicated component-metadata record exists in the current records directory. Also exposed via @ultimate/ng/icon-field. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

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
