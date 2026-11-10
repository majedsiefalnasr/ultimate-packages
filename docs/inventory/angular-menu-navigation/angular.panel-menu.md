# Angular UPanelMenu

ID: angular.panel-menu

Framework: angular; availability: public

## Authored interpretation

Accordion-style command navigation with nested expansion in normal document flow.

## Framework surface

Selector u-panel-menu. Inputs model: UMenuItem[] = [], multiple=false (booleanAttribute). Output onItemSelect: {originalEvent: MouseEvent; item: UMenuItem}. Public UPanelMenuList (selector u-panel-menu-list) accepts @Input items: UMenuItem[] = [], required expandedItems: WritableSignal<Set<UMenuItem>>, multiple=false, and emits itemSelect with the same payload. Root owns expandedItems signal shared through recursion. Group click or Enter/Space toggles a copied Set; when multiple=false only this level’s siblings are deleted before adding a group. Leaf activation calls command and emits selection; ArrowDown/Up wrap among eligible siblings. Template uses tree/treeitem roles and aria-expanded; expanded children are conditionally rendered. resolveOwnItem/getItemLinks/renderedItems/moveFocus and toggleExpanded are owned helpers. PanelMenuClassesParams (disabled/expanded) and panelMenuStyleModule are source-only exports; local panelmenu token CSS styles expansion and indent. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UPanelMenu, @ultimate/ng/panel-menu#UPanelMenu, @ultimate/ng#UPanelMenuList, @ultimate/ng/panel-menu#UPanelMenuList via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the panelmenu component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UPanelMenu
@ultimate/ng/panel-menu#UPanelMenu
@ultimate/ng#UPanelMenuList
@ultimate/ng/panel-menu#UPanelMenuList

## Owned source and evidence

packages/ng/src/panel-menu/index.ts
packages/ng/src/panel-menu/panel-menu-list.ts
packages/ng/src/panel-menu/panel-menu-style.ts
packages/ng/src/panel-menu/panel-menu.ts

```text
packages/ng/src/panel-menu/panel-menu.ts: export class UPanelMenu extends UBaseComponent
packages/ng/src/panel-menu/index.ts: export { UPanelMenu }
packages/ng/src/index.ts: @ultimate/ng/panel-menu
packages/ng/package.json: "./panel-menu"
packages/ng/src/panel-menu/panel-menu-style.ts: export const panelMenuStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     panelmenu:
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
    "behavior": "Angular panel-menu product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/panel-menu/*.spec.ts'",
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
