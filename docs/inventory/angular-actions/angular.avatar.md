# Angular UAvatar

ID: angular.avatar

Framework: angular; availability: public

## Authored interpretation

Person identity rendered as image, label or icon; image failure switches to label/icon fallback.

## Framework surface

label/icon/image/ariaLabel string inputs; size normal|large|xlarge default normal; shape square|circle default square; onImageError(Event). imageFailed and handlers are protected internals. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/avatar. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components. Structural CSS and classes are local, not imported from a shared style entry. Theme identity avatar matches componentName and Aura components registry; dt() resolves those token references via base registration. No dedicated component-metadata record exists in the current records directory. Owned source-only declarations: AvatarClassesParams, avatarStyleModule. AvatarClassesParams describes hasImage/imageFailed/shape/size for local root classes.

## Public exports

@ultimate/ng#UAvatar
@ultimate/ng/avatar#UAvatar

## Owned source and evidence

packages/ng/src/avatar/index.ts
packages/ng/src/avatar/avatar.ts
packages/ng/src/avatar/avatar-style.ts

```text
packages/ng/src/avatar/index.ts: export { UAvatar }
packages/ng/src/avatar/avatar.ts: export class UAvatar extends UBaseComponent
packages/ng/src/avatar/avatar-style.ts: export const
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     avatar,
packages/ng/src/avatar/avatar-style.ts: AvatarClassesParams
packages/ng/src/avatar/avatar-style.ts: avatarStyleModule
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.avatar → [angular.avatar](angular.avatar.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
