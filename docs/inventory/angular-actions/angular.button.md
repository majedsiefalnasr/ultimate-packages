# Angular UButton

ID: angular.button

Framework: angular; availability: public

## Authored interpretation

Native action button with loading/disabled gating and icon/label rendering.

## Framework surface

Root @ultimate/ng exports UButton through src/index.ts -> ./button. There is no @ultimate/ng/button manifest subpath. Selector u-button; standalone component extends UBaseComponent. Signal inputs include label, icon, iconPos, loading, disabled, severity, raised, rounded, text, outlined, size and fluid; outputs onClick, onFocus and onBlur. Private/protected styling helpers belong to this record, not additional products. Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; these declared inputs are not evidence that unstyled suppresses registration. Root @ultimate/ng re-exports this component. No dedicated manifest subpath; root entry only. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components. CSS imports @ultimate/uix-styles/button; local buttonStyleModule supplies css/classes. Theme identity button matches componentName and Aura components registry; dt() resolves those token references via base registration. BUTTON_METADATA associates ng sourcePath with this source; its native-event convention is not absence of Angular outputs. Owned source-only declarations: ButtonClassesParams, buttonStyleModule. ButtonClassesParams describes hasIcon/label/loading/severity/raised/rounded/text/outlined/size/fluid/iconPos for local root/icon class resolution.

## Public exports

@ultimate/ng#UButton

## Owned source and evidence

packages/ng/src/button/index.ts
packages/ng/src/button/button.ts
packages/ng/src/button/button-style.ts

```text
packages/ng/src/button/index.ts: export { UButton }
packages/ng/src/button/button.ts: export class UButton extends UBaseComponent
packages/ng/src/button/button-style.ts: export const
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     button,
packages/component-metadata/src/records/button.ts: export const BUTTON_METADATA
packages/ng/src/button/button-style.ts: ButtonClassesParams
packages/ng/src/button/button-style.ts: buttonStyleModule
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.button → [angular.button](angular.button.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.uix-styles.button (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng.ripple (pending cross-batch)
package.ultimate.ng-core.icons (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

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
