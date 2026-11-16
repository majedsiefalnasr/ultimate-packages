# Angular USplitter

ID: angular.splitter

Framework: angular; availability: public

## Authored interpretation

Resizable template-based panels with per-panel minimums and pointer/keyboard gutters.

## Framework surface

USplitter inputs layout:"horizontal"|"vertical"="horizontal", gutterSize=4 and step=5. Outputs onResizeStart and onResizeEnd:USplitterResizeEvent, an exported interface {originalEvent:Event;sizes:number[]}. Exported standalone USplitterPanel directive selects ng-template[uSplitterPanel], exposes readonly templateRef:TemplateRef and minSize=0 aliased uSplitterPanelMinSize (numberAttribute). @ContentChildren(USplitterPanel) yields panel templates rendered with ngTemplateOutlet; ngAfterContentInit seeds equal percentage sizes. Each panel flex-basis is calc(size% - gutterCount*gutterSize px). Gutters use role=separator and focusable handles with aria-orientation/aria-valuenow. Mouse/touch start/move/end chains resize adjacent panels using pointer deltas and clamp against per-panel minimums. ArrowLeft/Right decrement/increment in horizontal layout; ArrowDown/Up decrement/increment in vertical layout. Keyboard resizing performs an immediate step then setInterval at 40 ms; keyup clears it and emits the end event. DestroyRef registers mouse-listener cleanup only; touch listeners and the repeat timer are cleared on their corresponding interaction-end paths rather than that destroy callback. Owned source-only splitterStyleModule exports css/classes. Selector u-splitter; standalone OnPush component with ViewEncapsulation.None, componentName "splitter", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers splitter: splitter; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#USplitter
@ultimate/ng#USplitterPanel
@ultimate/ng#USplitterResizeEvent
@ultimate/ng/splitter#USplitter
@ultimate/ng/splitter#USplitterPanel
@ultimate/ng/splitter#USplitterResizeEvent

## Owned source and evidence

packages/ng/src/splitter/index.ts
packages/ng/src/splitter/splitter-style.ts
packages/ng/src/splitter/splitter.ts

```text
packages/ng/src/splitter/splitter.ts: export class USplitter
packages/ng/src/splitter/index.ts: export { USplitter, USplitterPanel } from "./splitter";
packages/ng/src/index.ts: export * from "@ultimate/ng/splitter";
packages/ng/package.json: "./splitter":
packages/ng/src/splitter/splitter-style.ts: export const splitterStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     splitter,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/splitter/splitter.ts: export class USplitterPanel
packages/ng/src/splitter/splitter.ts: export interface USplitterResizeEvent
packages/ng/src/splitter/splitter.ts: this.destroyRef.onDestroy(() => this.unbindMouseListeners());
packages/ng/src/splitter/splitter.ts: this.repeatTimer = setInterval(repeat, 40);
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
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; Splitter 8).",
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
