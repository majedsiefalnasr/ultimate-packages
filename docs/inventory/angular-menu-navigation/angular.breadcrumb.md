# Angular UBreadcrumb

ID: angular.breadcrumb

Framework: angular; availability: public

## Authored interpretation

Trail of navigation links with optional home item and separators.

## Framework surface

Selector u-breadcrumb. Inputs model: UMenuItem[] = [], home?: UMenuItem, homeAriaLabel?: string. Output onItemClick: {originalEvent: MouseEvent; item: UMenuItem}. RouterModule handles routerLink and ordinary anchors use url; visible=false omits entries and disabled activation prevents default. onClick invokes command with {originalEvent,item} and emits the output. The component-local isCurrent compares window pathname after stripping one leading slash and sets aria-current=page only on the final model entry when matched. BreadcrumbClassesParams (disabled), breadcrumbStyleModule and isCurrentBreadcrumbItem are source-only exports owned here, not public barrel exports. isCurrentBreadcrumbItem is a separate helper accepting Pick<UMenuItem,"routerLink"> and normalizing repeated slashes for its pathname comparison; the component uses its own isCurrent instead. Local CSS consumes breadcrumb tokens. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#UBreadcrumb, @ultimate/ng/breadcrumb#UBreadcrumb via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the breadcrumb component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#UBreadcrumb
@ultimate/ng/breadcrumb#UBreadcrumb

## Owned source and evidence

packages/ng/src/breadcrumb/breadcrumb-style.ts
packages/ng/src/breadcrumb/breadcrumb.ts
packages/ng/src/breadcrumb/index.ts

```text
packages/ng/src/breadcrumb/breadcrumb.ts: export class UBreadcrumb extends UBaseComponent
packages/ng/src/breadcrumb/index.ts: export { UBreadcrumb }
packages/ng/src/index.ts: @ultimate/ng/breadcrumb
packages/ng/package.json: "./breadcrumb"
packages/ng/src/breadcrumb/breadcrumb-style.ts: export const breadcrumbStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     breadcrumb,
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
    "behavior": "Angular breadcrumb product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/breadcrumb/*.spec.ts'",
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
