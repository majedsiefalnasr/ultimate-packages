# Angular UFieldset

ID: angular.fieldset

Framework: angular; availability: public

## Authored interpretation

Native fieldset container with optional collapsible legend controls.

## Framework surface

UFieldset inputs legend?:string, toggleable=false and collapsed=false; output collapsedChange:boolean. Native fieldset/legend markup, a toggleable native legend button and default ng-content; no public composition directive or named template. Click and Enter/Space toggle, plus/minus text marks state, and @if removes collapsed content. Private toggledCollapsed overrides the collapsed input after the first toggle. uuid supplies content ID used by aria-controls; the rendered content container always has role=region and aria-labelledby referencing the toggle-button ID. Owned source-only fieldsetStyleModule exports css/classes. Selector u-fieldset; standalone OnPush component with ViewEncapsulation.None, componentName "fieldset", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers fieldset: fieldset; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#UFieldset
@ultimate/ng/fieldset#UFieldset

## Owned source and evidence

packages/ng/src/fieldset/index.ts
packages/ng/src/fieldset/fieldset-style.ts
packages/ng/src/fieldset/fieldset.ts

```text
packages/ng/src/fieldset/fieldset.ts: export class UFieldset
packages/ng/src/fieldset/index.ts: export { UFieldset } from "./fieldset";
packages/ng/src/index.ts: export * from "@ultimate/ng/fieldset";
packages/ng/package.json: "./fieldset":
packages/ng/src/fieldset/fieldset-style.ts: export const fieldsetStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     fieldset,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/fieldset/fieldset.ts: protected readonly isCollapsed = computed(() => this.toggledCollapsed() ?? this.collapsed());
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-utils.uuid (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, composition templates, helpers and style adapter exist; source presence is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; Fieldset 7).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{carousel,galleria,image,image-compare,card,panel,fieldset,splitter,divider,scroll-panel}/*.spec.ts'",
    "outcome": "passed",
    "revision": "cc6e7ab39f0a963bbfddc0dd6a181dc3c6feffc6",
    "output": "Exit 0. Vitest 4.0.8: 10 files, 79 tests passed (Carousel 9, Galleria 21, Image 7, ImageCompare 4, Card 5, Panel 6, Fieldset 7, Splitter 8, Divider 3, ScrollPanel 9). Angular warnings NG8113 for unused UStepList/UStepPanels in VerticalStepperHost (src/g3c1-aura-styles.spec.ts), NG8102 for step() ?? 1 (src/input-number/input-number.ts:90:19), and NG0912 component ID collision between SsrHostComponent and HostComponent during the splitter panel-wrapper spec.",
    "run": "docs/inventory/angular-media-containers/product-run.json",
    "limitations": "Local Angular unit tests only; not browser/accessibility/visual, Storybook, publication, full package build or remote CI. Coverage includes imported foundations and does not prove exhaustive coverage. Warnings and product observations were not repaired."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step runs root pnpm run test, recursively including Angular ng test --project=ng; inventory tests are outside provenance-only test:scripts. Configuration only, no remote run observed.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional !cancelled() and classification scope != docs; branch protection not observed."
  }
]
```
