# Angular UCard

ID: angular.card

Framework: angular; availability: public

## Authored interpretation

Content container with optional heading, subtitle, header and footer regions.

## Framework surface

UCard inputs header?:string and subheader?:string; no outputs. Projection regions [card-header], default body and [card-footer]; title/subtitle markup is conditional on the string inputs. No public composition classes or template directives. Owned source-only cardStyleModule exports css/classes. Selector u-card; standalone OnPush component with ViewEncapsulation.None, componentName "card", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers card: card; no scoped record is registered in packages/component-metadata/src/index.ts. A0 (#170, ADR-077): UCard is the Angular passthrough pilot. It also takes the inherited pt and ptOptions inputs; each region binds ptm(section) through the UBind host directive, for the sections root, header, body, title, subtitle, content and footer, and it provides U_PARENT_INSTANCE for its descendants.

## Public exports

@ultimate/ng#UCard
@ultimate/ng/card#UCard

## Owned source and evidence

packages/ng/src/card/index.ts
packages/ng/src/card/card-style.ts
packages/ng/src/card/card.ts

```text
packages/ng/src/card/card.ts: export class UCard
packages/ng/src/card/index.ts: export { UCard } from "./card";
packages/ng/src/index.ts: export * from "@ultimate/ng/card";
packages/ng/package.json: "./card":
packages/ng/src/card/card-style.ts: export const cardStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     card,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
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
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; Card 5).",
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
