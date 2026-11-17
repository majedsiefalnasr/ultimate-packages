# Angular UDock

ID: angular.dock

Framework: angular; availability: public

## Authored interpretation

Positionable icon command bar with CSS hover magnification.

## Framework surface

Selector u-dock. Inputs model: UMenuItem[] = [], position: bottom|top|left|right = bottom, ariaLabel?: string. Output onItemSelect: {originalEvent: MouseEvent; item: UMenuItem}. Visible model entries render icon links, using RouterModule for enabled routerLink or url anchors with target. Enabled click emits selection then invokes command; it prevents default when item.url is absent. Hover state starts/resets at -3 and drives data-u-active. ArrowRight/Left for top/bottom and ArrowDown/Up for left/right wrap eligible focus; Home/End focus edges. DOM/model mapping helpers are owned here. dockStyleModule is a source-only export with inline parameter types for position and active/disabled; local dock token CSS applies scale(1.5) to hovered/data-u-active links. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UDock, @ultimate/ng/dock#UDock via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the dock component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UDock
@ultimate/ng/dock#UDock

## Owned source and evidence

packages/ng/src/dock/dock-style.ts
packages/ng/src/dock/dock.ts
packages/ng/src/dock/index.ts

```text
packages/ng/src/dock/dock.ts: export class UDock extends UBaseComponent
packages/ng/src/dock/index.ts: export { UDock }
packages/ng/src/index.ts: @ultimate/ng/dock
packages/ng/package.json: "./dock"
packages/ng/src/dock/dock-style.ts: export const dockStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     dock,
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
    "behavior": "Angular dock product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/dock/*.spec.ts'",
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
