# Angular UTieredMenu

ID: angular.tiered-menu

Framework: angular; availability: public

## Authored interpretation

Vertical nested navigation, either inline or conditionally rendered as a popup.

## Framework surface

Selector u-tiered-menu. Inputs model: UMenuItem[] = [], popup=false (booleanAttribute). Outputs onItemSelect: {originalEvent: MouseEvent; item: UMenuItem}, onShow/onHide: void. Public toggle(), show(), hide() change the internal visible signal and emit transition events; popup gates template visibility and leaf selection hides when popup=true. document:keydown.escape hides a visible popup. Public UTieredMenuSub (selector u-tiered-menu-sub) accepts @Input items: UMenuItem[] = [], root=false and emits itemSelect with the same payload. Recursive levels use router/url links, hover/click group opening, ArrowDown/Up focus movement, ArrowRight/Enter/Space opening and Escape nearest-level closure/refocus. Private ITEM_LINK_SELECTOR and focus/index helpers are owned implementation details. TieredMenuClassesParams (disabled/open) and tieredMenuStyleModule are source-only exports. Local CSS positions submenus and gives popup root class u-tieredmenu-overlay absolute top/left -9999px; this record does not claim successful popup positioning. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UTieredMenu, @ultimate/ng/tiered-menu#UTieredMenu, @ultimate/ng#UTieredMenuSub, @ultimate/ng/tiered-menu#UTieredMenuSub via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the tieredmenu component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UTieredMenu
@ultimate/ng/tiered-menu#UTieredMenu
@ultimate/ng#UTieredMenuSub
@ultimate/ng/tiered-menu#UTieredMenuSub

## Owned source and evidence

packages/ng/src/tiered-menu/index.ts
packages/ng/src/tiered-menu/tiered-menu-style.ts
packages/ng/src/tiered-menu/tiered-menu-sub.ts
packages/ng/src/tiered-menu/tiered-menu.ts

```text
packages/ng/src/tiered-menu/tiered-menu.ts: export class UTieredMenu extends UBaseComponent
packages/ng/src/tiered-menu/index.ts: export { UTieredMenu }
packages/ng/src/index.ts: @ultimate/ng/tiered-menu
packages/ng/package.json: "./tiered-menu"
packages/ng/src/tiered-menu/tiered-menu-style.ts: export const tieredMenuStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     tieredmenu:
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
    "behavior": "Angular tiered-menu product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/tiered-menu/*.spec.ts'",
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
