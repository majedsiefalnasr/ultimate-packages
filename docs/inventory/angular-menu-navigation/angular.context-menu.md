# Angular UContextMenu

ID: angular.context-menu

Framework: angular; availability: public

## Authored interpretation

Context-triggered flat command list positioned at pointer page coordinates.

## Framework surface

Selector u-context-menu. Inputs model: UMenuItem[] = [], global=false. Outputs onShow/onHide: void and onItemSelect: {originalEvent: MouseEvent; item: UMenuItem}. Public show(event: MouseEvent) suppresses default and propagation, reads pageX/pageY, binds listeners and Escape, positions afterNextRender and focuses the list; hide() releases dismissal listeners and Escape. global is read in ngOnInit to bind document contextmenu; otherwise the host event triggers show. Template uses UOverlay appendTo body and aria-activedescendant on a tabindex=0 list. ArrowDown/ArrowUp (non-wrapping), Home/End, Enter/Space activation and Tab dismissal operate on eligible model entries. Enabled activation invokes command with {originalEvent,item}, emits onItemSelect then hides. ContextMenuClassesParams (disabled/focused) and contextMenuStyleModule are source-only exports owned here; local CSS consumes contextmenu tokens. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UContextMenu, @ultimate/ng/context-menu#UContextMenu via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the contextmenu component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UContextMenu
@ultimate/ng/context-menu#UContextMenu

## Owned source and evidence

packages/ng/src/context-menu/context-menu-style.ts
packages/ng/src/context-menu/context-menu.ts
packages/ng/src/context-menu/index.ts

```text
packages/ng/src/context-menu/context-menu.ts: export class UContextMenu extends UBaseComponent
packages/ng/src/context-menu/index.ts: export { UContextMenu }
packages/ng/src/index.ts: @ultimate/ng/context-menu
packages/ng/package.json: "./context-menu"
packages/ng/src/context-menu/context-menu-style.ts: export const contextMenuStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     contextmenu:
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

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, owned composition/types/helpers/style source and supporting specs exist; source inspection is not execution."
  },
  {
    "state": "not-run",
    "behavior": "Angular context-menu product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/context-menu/*.spec.ts'",
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
