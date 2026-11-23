# Angular UAvatarGroup

ID: angular.avatar-group

Framework: angular; availability: public

## Authored interpretation

Projected identity group; overlap is CSS-only with logical, size-specific offsets, and there is no UAvatar import or child-management API.

## Framework surface

No own inputs/outputs; ng-content wrapper, no public child collection. hostDirectives [UBind]; ngAfterViewChecked applies ptms(['host','root']), so pt reaches the host. Inherits dt, unstyled, pt and ptOptions from UBaseComponent (ADR-077, ADR-085); ptOptions has no visible effect until the global pt source exists (ADR-080). Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/avatar-group. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components. Structural CSS is the shared @ultimate/uix-styles/avatar module (ADR-082, ADR-087), with logical margin-inline-start offsets from the avatar.group tokens. No matching Aura component registry entry for the group name; the offsets use the avatar namespace tokens. No dedicated component-metadata record exists in the current records directory. Owned source-only declarations: avatarGroupStyleModule.

## Public exports

@ultimate/ng#UAvatarGroup
@ultimate/ng/avatar-group#UAvatarGroup

## Owned source and evidence

packages/ng/src/avatar-group/index.ts
packages/ng/src/avatar-group/avatar-group.ts
packages/ng/src/avatar-group/avatar-group-style.ts

```text
packages/ng/src/avatar-group/index.ts: export { UAvatarGroup }
packages/ng/src/avatar-group/avatar-group.ts: export class UAvatarGroup extends UBaseComponent
packages/ng/src/avatar-group/avatar-group-style.ts: export const
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/ng/src/avatar-group/avatar-group-style.ts: avatarGroupStyleModule
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/ng/src/avatar-group/avatar-group.ts: hostDirectives: [UBind]
packages/ng/src/avatar-group/avatar-group-style.ts: @ultimate/uix-styles/avatar
```

## Relationships

package.ultimate.ng.avatar-group → [angular.avatar-group](angular.avatar-group.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
angular.avatar

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style slots, source-only helpers and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "failed",
    "behavior": "Bounded Angular suite aborted during bundle compilation before assertions.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{button,button-group,split-button,avatar,avatar-group,badge,overlay-badge,chip,tag,toolbar}/*.spec.ts'",
    "outcome": "failed",
    "revision": "4ad393323af126b83c46c40a53d34cdadf2070ef",
    "limitations": "Node 24.15.0. Angular compiles broader tsconfig sources despite include filter. Missing workspace dependency artifacts prevent runtime proof; no product repairs attempted. No CI run observed.",
    "output": "Application bundle generation failed. TS2307: Cannot find module '@ultimate/ng-core'; cascading TS2339 cx and TS4112 override diagnostics; exit 1."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
