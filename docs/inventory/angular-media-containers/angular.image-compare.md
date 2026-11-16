# Angular UImageCompare

ID: angular.image-compare

Framework: angular; availability: public

## Authored interpretation

Projected before/after content comparison controlled by a native range slider.

## Framework surface

UImageCompare inputs tabindex?:number, ariaLabelledby?:string, ariaLabel?:string; no outputs. Two projected content regions select [left] and [right]. Native range input min=0, max=100, value=50 binds ariaLabel/ariaLabelledby; the host binds tabindex and both label attributes. Its input handler writes a polygon clipPath on the right-region span using the range value. No public composition class or template directive. The source-only imageCompareStyleModule exports css/classes; CSS supplies an initial 50% clip and :dir(rtl) variant, while the handler writes the same left-to-right inline polygon in both directions. Selector u-image-compare; standalone OnPush component with ViewEncapsulation.None, componentName "imagecompare", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers imagecompare: imageCompare; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#UImageCompare
@ultimate/ng/image-compare#UImageCompare

## Owned source and evidence

packages/ng/src/image-compare/index.ts
packages/ng/src/image-compare/image-compare-style.ts
packages/ng/src/image-compare/image-compare.ts

```text
packages/ng/src/image-compare/image-compare.ts: export class UImageCompare
packages/ng/src/image-compare/index.ts: export { UImageCompare } from "./image-compare";
packages/ng/src/index.ts: export * from "@ultimate/ng/image-compare";
packages/ng/package.json: "./image-compare":
packages/ng/src/image-compare/image-compare-style.ts: export const imageCompareStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts: imagecompare: imageCompare,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/image-compare/image-compare.ts: this.rightRef.nativeElement.style.clipPath = `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)`;
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, composition templates, helpers and style adapter exist; source presence is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; ImageCompare 4).",
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
