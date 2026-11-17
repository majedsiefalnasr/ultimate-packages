# Angular UButtonGroup

ID: angular.button-group

Framework: angular; availability: public

## Authored interpretation

Content-projecting action group; adjoining borders are CSS composition, not imported child components.

## Framework surface

No own inputs or outputs; projects arbitrary content inside span role=group. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/button-group. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components. Structural CSS and classes are local, not imported from a shared style entry. No matching Aura component registry entry; fixed local layout CSS is not a theme-token relationship. No dedicated component-metadata record exists in the current records directory. Owned source-only declarations: buttonGroupStyleModule.

## Public exports

@ultimate/ng#UButtonGroup
@ultimate/ng/button-group#UButtonGroup

## Owned source and evidence

packages/ng/src/button-group/index.ts
packages/ng/src/button-group/button-group.ts
packages/ng/src/button-group/button-group-style.ts

```text
packages/ng/src/button-group/index.ts: export { UButtonGroup }
packages/ng/src/button-group/button-group.ts: export class UButtonGroup extends UBaseComponent
packages/ng/src/button-group/button-group-style.ts: export const
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/ng/src/button-group/button-group-style.ts: buttonGroupStyleModule
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.button-group → [angular.button-group](angular.button-group.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
angular.button

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
