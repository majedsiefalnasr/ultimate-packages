# Angular UGalleria

ID: angular.galleria

Framework: angular; availability: public

## Authored interpretation

Template-driven image/item gallery with thumbnails, keyboard navigation and optional fullscreen overlay.

## Framework surface

Generic UGalleria<T=unknown>; inputs value:T[]=[], activeIndexInput:number=0 exposed as activeIndex, showItemNavigators=true, showThumbnails=true, circular=false, autoplayInterval=0, fullScreen=false. Output activeIndexChange:number. Exported UGalleriaItemContext<T> has $implicit:T. @ContentChild item and thumbnail TemplateRefs use ngTemplateOutlet; thumbnails fall back to the item template. Public activeIndex signal begins at 0 and is seeded from activeIndexInput in the constructor, without a later input synchronization effect. Public fullScreenActive signal, openFullScreen() and closeFullScreen() control a UOverlay appendTo="body" mask with UFocusTrap and UTimesIcon; fullScreen input gates openFullScreen(); no built-in item click opens it. Keyboard ArrowLeft/ArrowRight/Home/End navigates, Escape closes fullscreen, and editable targets are skipped; thumbnail Enter/Space selects. Previous/next wrap only with circular and stop autoplay; the timer starts on init, always wraps at the end and is cleared on destroy. Owned source-only galleriaStyleModule exports css/classes. Selector u-galleria; standalone OnPush component with ViewEncapsulation.None, componentName "galleria", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers galleria: galleria; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#UGalleria
@ultimate/ng#UGalleriaItemContext
@ultimate/ng/galleria#UGalleria
@ultimate/ng/galleria#UGalleriaItemContext

## Owned source and evidence

packages/ng/src/galleria/index.ts
packages/ng/src/galleria/galleria-style.ts
packages/ng/src/galleria/galleria.ts

```text
packages/ng/src/galleria/galleria.ts: export class UGalleria
packages/ng/src/galleria/index.ts: export { UGalleria } from "./galleria";
packages/ng/src/index.ts: export * from "@ultimate/ng/galleria";
packages/ng/package.json: "./galleria":
packages/ng/src/galleria/galleria-style.ts: export const galleriaStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     galleria,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/galleria/galleria.ts: export interface UGalleriaItemContext
packages/ng/src/galleria/galleria.ts: this.activeIndex.set(this.activeIndexInput());
packages/ng/src/galleria/galleria.ts: if (this.fullScreen()) this.fullScreenActive.set(true);
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.ng-core.focus-trap (pending cross-batch)
package.ultimate.ng-core.icons (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, composition templates, helpers and style adapter exist; source presence is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; Galleria 21).",
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
