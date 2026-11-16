# Angular UScrollPanel

ID: angular.scroll-panel

Framework: angular; availability: public

## Authored interpretation

Scrollable content container with custom draggable and keyboard-operated scrollbar thumbs.

## Framework surface

UScrollPanel input step=5; no outputs. Default ng-content in a native scrolling div with hidden native scrollbars; horizontal and vertical focusable role=scrollbar thumbs mirror content position and visible/total ratios with requestAnimationFrame and a 10% minimum thumb size. Public scrollTop(scrollTop:number):void clamps the offset and refresh():void recalculates thumbs. Mouse document listeners drag the chosen axis; focus and last changed scroll axis select arrow-key orientation. setTimer uses one setTimeout at 40 ms per keydown, cleared on keyup, rather than a self-rescheduling repeat loop. Browser-only ngAfterViewInit measures and installs resize handling; DestroyRef removes resize/mouse listeners and cancels frame/timer; ngOnDestroy also removes listeners. uuid generates contentId bound by both thumbs' aria-controls, but the content div has no matching id binding. Owned source-only scrollPanelStyleModule exports css/classes; focus CSS requests scrollpanel.barfocus.ring.width/offset alongside scrollpanel.bar.focus.ring.* tokens. Selector u-scroll-panel; standalone OnPush component with ViewEncapsulation.None, componentName "scrollpanel", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers scrollpanel: scrollPanel; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#UScrollPanel
@ultimate/ng/scroll-panel#UScrollPanel

## Owned source and evidence

packages/ng/src/scroll-panel/index.ts
packages/ng/src/scroll-panel/scroll-panel-style.ts
packages/ng/src/scroll-panel/scroll-panel.ts

```text
packages/ng/src/scroll-panel/scroll-panel.ts: export class UScrollPanel
packages/ng/src/scroll-panel/index.ts: export { UScrollPanel } from "./scroll-panel";
packages/ng/src/index.ts: export * from "@ultimate/ng/scroll-panel";
packages/ng/package.json: "./scroll-panel":
packages/ng/src/scroll-panel/scroll-panel-style.ts: export const scrollPanelStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts: scrollpanel: scrollPanel,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/scroll-panel/scroll-panel.ts: this.timer = setTimeout(() => this.repeat(bar, step), 40);
packages/ng/src/scroll-panel/scroll-panel.ts: [attr.aria-controls]="contentId"
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
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; ScrollPanel 9).",
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
