# Angular UInputGroup and UInputGroupAddon

ID: angular.input-group

Framework: angular; availability: public

## Authored interpretation

Composition pair joining projected controls and addons into one connected group.

## Framework surface

Two standalone OnPush components in one file. UInputGroup selector u-input-group extends UBaseComponent, projects content, no inputs or outputs, host class u-input-group. UInputGroupAddon selector u-input-group-addon extends UBaseComponent, projects content, declares inlineStyle: Record<string, unknown>|null|undefined bound to host [style], host class u-input-group-addon. Both bind the host through the UBind host directive (ptms host and root in ngAfterViewChecked), so pt, ptOptions, unstyled and per-instance dt apply (ADR-093). componentNames inputgroup and inputgroupaddon; the Aura components registry has inputgroup but no inputgroupaddon key. The group style module owns the CSS: the shared @ultimate/uix-styles/inputgroup module (ADR-082, ADR-093), which also lays out nested .u-icon-field, .u-float-label and .u-ifta-label, plus the Angular-only rules for the u-button and u-input-mask host elements; the addon style module has empty css. Public API: UInputGroup, UInputGroupAddon (classes). Owned source-only declarations: inputGroupStyleModule, inputGroupAddonStyleModule; no class-parameter interface. Layout-only wrapper: template is <ng-content>, no ControlValueAccessor or model tier. No dedicated component-metadata record exists in the current records directory. Also exposed via @ultimate/ng/input-group. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components.

## Public exports

@ultimate/ng#UInputGroup
@ultimate/ng#UInputGroupAddon
@ultimate/ng/input-group#UInputGroup
@ultimate/ng/input-group#UInputGroupAddon

## Owned source and evidence

packages/ng/src/input-group/index.ts
packages/ng/src/input-group/input-group.ts
packages/ng/src/input-group/input-group-style.ts

```text
packages/ng/src/input-group/index.ts: export { UInputGroup, UInputGroupAddon }
packages/ng/src/input-group/input-group.ts: export class UInputGroup extends UBaseComponent
packages/ng/src/input-group/input-group.ts: export class UInputGroupAddon extends UBaseComponent
packages/ng/src/input-group/input-group.ts: inlineStyle = input<Record<string, unknown> | null | undefined>(undefined);
packages/ng/src/input-group/input-group-style.ts: export const inputGroupStyleModule
packages/ng/src/input-group/input-group-style.ts: export const inputGroupAddonStyleModule
packages/themes/src/presets/aura/index.ts: inputgroup: inputGroup
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/ng/src/input-group/input-group.ts: hostDirectives: [UBind]
packages/ng/src/input-group/input-group-style.ts: @ultimate/uix-styles/inputgroup"
```

## Relationships

package.ultimate.ng.input-group → [angular.input-group](angular.input-group.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
angular.icon-field
angular.float-label
angular.ifta-label

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
