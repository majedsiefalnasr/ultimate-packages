# Angular UChip

ID: angular.chip

Framework: angular; availability: public

## Authored interpretation

Identity/item token with optional image/icon, a removable control and disabled-aware removal; Enter/Backspace invoke removal, the internal visible signal is not an input, and a removed chip hides its host.

## Framework surface

UChip (selector u-chip), a standalone OnPush component extending UBaseComponent, with the UBind host directive and a U_PARENT_INSTANCE provider. Inputs: label, icon, image, alt, disabled and removable (boolean, default false), removeAriaLabel (default the English "Remove") and removeIcon (a font class). Outputs: onRemove(MouseEvent) and onImageError(Event). Projects default content before the built-in parts, and reads an optional <ng-template #removeicon> that replaces the remove glyph. The default glyph is UTimesIcon from ng-core. Pass-through sections host, root, image, icon, label and removeIcon; ngAfterViewChecked sets the host attributes from ptms(host, root). The host carries aria-label from label, data-p=removable while removable, the p-disabled class while disabled, and display: none after removal (the internal visible signal, never an input). Remove is blocked while disabled and the control gets tabindex -1. Inherits dt and unstyled from UBaseComponent, which now act on the instance (ADR-085). The style module's css is the shared @ultimate/uix-styles/chip module (ADR-082, ADR-098) on the Aura chip tokens. componentName chip matches the Aura components registry. chipProps, styleClass and a TimesCircle glyph are not carried (ADR-098). Root @ultimate/ng re-exports this component. Also exposed via @ultimate/ng/chip. Style module exports and class-parameter interfaces are source-only internals, not barrel exports or independent rendered components. No dedicated component-metadata record exists in the current records directory. Owned source-only declarations: chipStyleModule.

## Public exports

@ultimate/ng#UChip
@ultimate/ng/chip#UChip

## Owned source and evidence

packages/ng/src/chip/index.ts
packages/ng/src/chip/chip.ts
packages/ng/src/chip/chip-style.ts

```text
packages/ng/src/chip/index.ts: export { UChip }
packages/ng/src/chip/chip.ts: export class UChip extends UBaseComponent
packages/ng/src/chip/chip-style.ts: export const
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     chip,
packages/ng/src/chip/chip-style.ts: chipStyleModule
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/ng/src/chip/chip.ts: hostDirectives: [UBind],
packages/ng/src/chip/chip-style.ts: @ultimate/uix-styles/chip
```

## Relationships

package.ultimate.ng.chip → [angular.chip](angular.chip.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng-core.icons (pending cross-batch)

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
