# Angular UBadge

ID: angular.badge

Framework: angular; availability: public

## Authored interpretation

Status/count indicator with null-value dot and single-character circle styling.

## Framework surface

badgeSize and deprecated size: small|large|xlarge|null; severity secondary|info|success|warn|danger|contrast|null; value string|number|null; badgeDisabled boolean false. No outputs. UBadge binds pt (root and host sections) through the UBind host directive and provides U_PARENT_INSTANCE (ADR-088). Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/badge. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components. CSS imports @ultimate/uix-styles/badge; local badgeStyleModule supplies css/classes. Theme identity badge matches componentName and Aura components registry; dt() resolves those token references via base registration. No dedicated component-metadata record exists in the current records directory. Owned source-only declarations: BadgeClassesParams, badgeStyleModule. BadgeClassesParams describes value/size/badgeSize/severity for local root classes.

## Public exports

@ultimate/ng#UBadge
@ultimate/ng/badge#UBadge

## Owned source and evidence

packages/ng/src/badge/index.ts
packages/ng/src/badge/badge.ts
packages/ng/src/badge/badge-style.ts

```text
packages/ng/src/badge/index.ts: export { UBadge }
packages/ng/src/badge/badge.ts: export class UBadge extends UBaseComponent
packages/ng/src/badge/badge-style.ts: export const
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     badge,
packages/ng/src/badge/badge-style.ts: BadgeClassesParams
packages/ng/src/badge/badge-style.ts: badgeStyleModule
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/ng/src/badge/badge.ts: this.bindDirective.setAttrs(this.ptms(["host", "root"]))
```

## Relationships

package.ultimate.ng.badge → [angular.badge](angular.badge.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.uix-styles.badge (pending cross-batch)
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
