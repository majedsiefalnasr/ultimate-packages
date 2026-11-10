# Angular UMenu

ID: angular.menu

Framework: angular; availability: public

## Authored interpretation

Flat navigation or command list, inline or imperatively opened as a popup anchored to a triggering element.

## Framework surface

Selector u-menu. Inputs model: UMenuItem[] = [], popup=false (booleanAttribute), appendTo?: HTMLElement | (() => HTMLElement), baseZIndex=0 (numberAttribute), closeOnEscape=true (booleanAttribute). Outputs onShow/onHide: void. Public toggle(event), show(event), hide(event?) manage popup visibility; show is a no-op in inline mode. Enabled item activation calls command with the raw MouseEvent and closes a popup. ArrowDown/ArrowUp move native focus among anchors, skipping disabled anchors. Provides ComponentIdGenerator for composed UTooltip; composes URipple, RouterModule and UOverlay. Resolves appendTo per open; positions below target in a microtask, sets ZIndex, and registers outside-click/resize and display-order Escape resources released on hide/destroy. MenuClassesParams (popup/focused/disabled) and menuStyleModule are source-only style exports, not barrel API. menuStyleModule wraps @ultimate/uix-styles/menu CSS with local class resolvers. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UMenu via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the menu component token family; this is source configuration, not rendered-theme verification. MENU_METADATA in component-metadata records links to the Angular implementation; generated menu.api.mdx is supporting documentation. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UMenu

## Owned source and evidence

packages/ng/src/menu/index.ts
packages/ng/src/menu/menu-style.ts
packages/ng/src/menu/menu.ts

```text
packages/ng/src/menu/menu.ts: export class UMenu extends UBaseComponent
packages/ng/src/menu/index.ts: export { UMenu }
packages/ng/src/index.ts: ./menu
packages/ng/package.json: "name": "@ultimate/ng"
packages/ng/src/menu/menu-style.ts: export const menuStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     menu,
packages/component-metadata/src/records/menu.ts: export const MENU_METADATA
packages/ng-core/src/api/types.ts: command?: (event: unknown) => void;
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.api (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.uix-utils.escape (pending cross-batch)
package.ultimate.uix-utils.zindex (pending cross-batch)
package.ultimate.ng-core.id (pending cross-batch)
package.ultimate.ng.ripple (pending cross-batch)
package.ultimate.ng.tooltip (pending cross-batch)
package.ultimate.uix-styles.menu (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, owned composition/types/helpers/style source and supporting specs exist; source inspection is not execution."
  },
  {
    "state": "not-run",
    "behavior": "Angular menu product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/menu/*.spec.ts'",
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
