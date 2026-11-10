# Angular UMegaMenu

ID: angular.mega-menu

Framework: angular; availability: public

## Authored interpretation

Top-level navigation with a multi-column overlay of labeled flat leaf groups.

## Framework surface

Selector u-mega-menu. Inputs model: UMegaMenuItem[] = [], ariaLabel?: string. Output onItemSelect: {originalEvent: MouseEvent; item: UMenuItem}. Public composition UMegaMenuColumnGroup (selector u-mega-menu-column-group) requires @Input group: UMegaMenuGroup and emits itemSelect of the same payload. UMegaMenuItem extends Omit<UMenuItem,"items"> with items?: UMegaMenuGroup[][]: columns of groups. UMegaMenuGroup extends Omit<UMenuItem,"items"> with items?: UMenuItem[]; it is exported by its source but not re-exported by the family barrel. Root click/hover opens a group overlay; leaf activation invokes command and emits selection, and nested leaf selection clears openItem. Root ArrowRight/Left move focus, Enter/Space open and defer focus into the overlay; Escape closes and restores trigger focus. Column groups handle ArrowDown/Up among eligible leaves and let Escape bubble. MegaMenuClassesParams (disabled/open) and megaMenuStyleModule are source-only exports owned here; local token CSS controls overlay display and grid/column flex layout. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UMegaMenu, @ultimate/ng/mega-menu#UMegaMenu, @ultimate/ng#UMegaMenuColumnGroup, @ultimate/ng/mega-menu#UMegaMenuColumnGroup, @ultimate/ng#UMegaMenuItem, @ultimate/ng/mega-menu#UMegaMenuItem via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the megamenu component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UMegaMenu
@ultimate/ng/mega-menu#UMegaMenu
@ultimate/ng#UMegaMenuColumnGroup
@ultimate/ng/mega-menu#UMegaMenuColumnGroup
@ultimate/ng#UMegaMenuItem
@ultimate/ng/mega-menu#UMegaMenuItem

## Owned source and evidence

packages/ng/src/mega-menu/index.ts
packages/ng/src/mega-menu/mega-menu-column.ts
packages/ng/src/mega-menu/mega-menu-item.ts
packages/ng/src/mega-menu/mega-menu-style.ts
packages/ng/src/mega-menu/mega-menu.ts

```text
packages/ng/src/mega-menu/mega-menu.ts: export class UMegaMenu extends UBaseComponent
packages/ng/src/mega-menu/index.ts: export { UMegaMenu }
packages/ng/src/index.ts: @ultimate/ng/mega-menu
packages/ng/package.json: "./mega-menu"
packages/ng/src/mega-menu/mega-menu-style.ts: export const megaMenuStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     megamenu:
packages/ng-core/src/api/types.ts: command?: (event: unknown) => void;
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.api (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, owned composition/types/helpers/style source and supporting specs exist; source inspection is not execution."
  },
  {
    "state": "not-run",
    "behavior": "Angular mega-menu product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/mega-menu/*.spec.ts'",
    "outcome": "not-run",
    "revision": "e661ec4539053d25da39594441225520e5dd07ab",
    "limitations": "Explicit resource limits prohibit installs, builds, Vitest, ng test, Storybook and watchers. No product runtime success or failure inferred from source/test presence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step invokes root pnpm run test, whose recursive command includes Angular test. Configuration only: no successful CI execution or branch protection inferred; test:scripts selects provenance tests, not these inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on !cancelled() and classification scope != docs; dependencies can prevent assertions. Remote CI not observed."
  }
]
```
