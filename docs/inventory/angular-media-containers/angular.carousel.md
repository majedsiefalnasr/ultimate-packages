# Angular UCarousel

ID: angular.carousel

Framework: angular; availability: public

## Authored interpretation

Paged horizontal or vertical template-driven collection carousel with navigation and timed advancement.

## Framework surface

Generic UCarousel<T=unknown>; inputs value:T[]=[], numVisible=1, numScroll=1, circular=false, showIndicators=true, showNavigators=true, autoplayInterval=0, orientation:"horizontal"|"vertical"="horizontal". Output onPage:UCarouselPageEvent with page:number. Exported UCarouselItemContext<T> has $implicit:T for the @ContentChild("item", {descendants:false}) TemplateRef; each item uses ngTemplateOutlet with that context, with no default textual item renderer. Public navForward(), navBackward() and goToPage(index:number) update the internal page and emit onPage; previous/next wrap only when circular. totalPages is 0 for an empty collection and ceil((value.length-numVisible)/numScroll)+1 otherwise; the translate percentage is page*numScroll*100/numVisible, on X or Y according to orientation. Native navigator and indicator buttons have labels; the content wrapper has aria-live=polite when autoplayInterval>0 and off otherwise. Autoplay starts in ngOnInit when the interval is positive, always wraps at the last page, and is stopped by previous/next navigation and on destroy; indicator navigation does not stop it. Owned source-only carouselStyleModule exports css/classes, and source-only CarouselItemListParams has optional numVisible:number and vertical:boolean for class calculation. Selector u-carousel; standalone OnPush component with ViewEncapsulation.None, componentName "carousel", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers carousel: carousel; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#UCarousel
@ultimate/ng#UCarouselItemContext
@ultimate/ng#UCarouselPageEvent
@ultimate/ng/carousel#UCarousel
@ultimate/ng/carousel#UCarouselItemContext
@ultimate/ng/carousel#UCarouselPageEvent

## Owned source and evidence

packages/ng/src/carousel/index.ts
packages/ng/src/carousel/carousel-style.ts
packages/ng/src/carousel/carousel.ts

```text
packages/ng/src/carousel/carousel.ts: export class UCarousel
packages/ng/src/carousel/index.ts: export { UCarousel } from "./carousel";
packages/ng/src/index.ts: export * from "@ultimate/ng/carousel";
packages/ng/package.json: "./carousel":
packages/ng/src/carousel/carousel-style.ts: export const carouselStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     carousel,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/carousel/carousel.ts: export interface UCarouselItemContext
packages/ng/src/carousel/carousel.ts: export interface UCarouselPageEvent
packages/ng/src/carousel/carousel.ts: return Math.ceil((length - this.numVisible()) / this.numScroll()) + 1;
packages/ng/src/carousel/carousel.ts: [attr.aria-live]="autoplayInterval() > 0 ? 'polite' : 'off'"
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
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; Carousel 9).",
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
