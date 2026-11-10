# Angular UMenubar

ID: angular.menubar

Framework: angular; availability: public

## Authored interpretation

Horizontal navigation bar composed from recursively nested submenu levels.

## Framework surface

Selector u-menubar. Inputs model: UMenuItem[] = [], ariaLabel?: string. Output onItemSelect: {originalEvent: MouseEvent; item: UMenuItem}. Public UMenubarSub (selector u-menubar-sub) has @Input items: UMenuItem[] = [], root=false and itemSelect output with the same payload. Recursive levels render separators, visible items, router/url links and submenu state. Hover opens enabled groups; click toggles groups or invokes leaf command and emits itemSelect. Root keys use ArrowRight/Left, nested levels ArrowDown/Up; Enter/Space opens children with deferred focus and Escape closes the nearest open level and restores its trigger. Private ITEM_LINK_SELECTOR limits native-focus lookup to a level’s own links; resolveOwnItem/renderedItems/moveFocus/focusFirstSubmenuItem/closeAndRefocus are owned implementation helpers. MenubarClassesParams (disabled/open/focused) and menubarStyleModule are source-only exports owned here. Local menubar token CSS controls nested submenu visibility. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UMenubar, @ultimate/ng/menubar#UMenubar, @ultimate/ng#UMenubarSub, @ultimate/ng/menubar#UMenubarSub via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the menubar component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UMenubar
@ultimate/ng/menubar#UMenubar
@ultimate/ng#UMenubarSub
@ultimate/ng/menubar#UMenubarSub

## Owned source and evidence

packages/ng/src/menubar/index.ts
packages/ng/src/menubar/menubar-style.ts
packages/ng/src/menubar/menubar-sub.ts
packages/ng/src/menubar/menubar.ts

```text
packages/ng/src/menubar/menubar.ts: export class UMenubar extends UBaseComponent
packages/ng/src/menubar/index.ts: export { UMenubar }
packages/ng/src/index.ts: @ultimate/ng/menubar
packages/ng/package.json: "./menubar"
packages/ng/src/menubar/menubar-style.ts: export const menubarStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     menubar,
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
    "behavior": "Angular menubar product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/menubar/*.spec.ts'",
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
