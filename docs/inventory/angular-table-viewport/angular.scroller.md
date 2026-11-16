# Angular UScroller

ID: angular.scroller

Framework: angular; availability: public

## Authored interpretation

Vertical virtual viewport with optional consumer content template and lazy range notifications.

## Framework surface

Selector u-scroller; standalone UScroller. Inputs items: unknown[]=[], itemSize=0, numToleratedItems?: number=undefined, loading?: boolean=undefined, disabled=false, lazy=false. Output onLazyLoad: {first:number;last:number}. Public scrollTo(options:ScrollToOptions):void calls root scrollTo; scrollToIndex(index:number,behavior:ScrollBehavior="auto"):void maps index*itemSize to top. Public UScrollerContentContext contains $implicit: {index:number;value:unknown}[] and options with getItemOptions(index) returning index/count:number and first/last/even/odd:boolean, itemSize:number and loading:boolean. ContentChild("content",{descendants:false}) accepts an optional TemplateRef<UScrollerContentContext>; otherwise built-in div items render values. Browser-only ngAfterViewInit measures offsetHeight, registers ResizeObserver and updates the reactive content-size signal; ngOnDestroy disconnects. Viewport and last use calculateNumItemsInViewport/calculateLast from @ultimate/uix-data; default tolerated items ceil(viewport/2), last clamps to item count, and visible items retain absolute indices. Scroll computes first=floor(scrollTop/(itemSize||1)); on changed first with lazy, emits captured range in Promise.resolve().then(); no initial lazy event is issued. disabled bypasses windowing to return all items. Vertical-only structural CSS sets overflow and absolute content/items, content height equals items.length*itemSize, loading adds loader and aria-busy. scrollerStyleModule wraps @ultimate/uix-styles/virtualscroller plus local structural CSS. No Aura scroller registry entry exists; base token registration and imported CSS are recorded without inventing a preset. SCROLLER_METADATA references Angular and scroller.api.mdx is generated supporting documentation. Consumer availability: @ultimate/ng#UScroller, @ultimate/ng/scroller#UScroller, @ultimate/ng#UScrollerContentContext, @ultimate/ng/scroller#UScrollerContentContext. All components extend UBaseComponent with inherited dt?: Record<string,unknown> and unstyled?: boolean; base ngOnInit registers theme variables and structural CSS. Local style modules and their css/classes constants and inline class-parameter types are source-only, owned by this family. Remaining private/protected state, lifecycle methods, render handlers and helpers belong to the owning record. No additional directive, hook, factory or base class is declared in these roots. Metadata source references establish relationships, not proof of runtime completeness. Manifest dist targets declare availability, not verified publication or installed artifact integrity. Prime comments are neutral provenance references only.

## Public exports

@ultimate/ng#UScroller
@ultimate/ng/scroller#UScroller
@ultimate/ng#UScrollerContentContext
@ultimate/ng/scroller#UScrollerContentContext

## Owned source and evidence

packages/ng/src/scroller/index.ts
packages/ng/src/scroller/scroller-style.ts
packages/ng/src/scroller/scroller.ts

```text
packages/ng/src/scroller/scroller.ts: export class UScroller
packages/ng/src/scroller/index.ts: export { UScroller }
packages/ng/src/index.ts: export * from "@ultimate/ng/scroller";
packages/ng/package.json: "./scroller"
packages/ng/src/scroller/scroller-style.ts: export const scrollerStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/component-metadata/src/records/scroller.ts: export const SCROLLER_METADATA
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.uix-data.virtualization (pending cross-batch)
package.ultimate.uix-styles.virtualscroller (pending cross-batch)
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, template composition, helpers and style adapters exist; source presence is not execution."
  },
  {
    "state": "failed",
    "behavior": "Initial scoped product attempt failed before assertions because workspace dependency artifacts were absent.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{table,paginator,scroller}/*.spec.ts'",
    "outcome": "failed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "output": "Exit 1. Application bundle generation failed; TS2307 Cannot find module '@ultimate/ng-core', '@ultimate/uix-data', '@ultimate/uix-styles/table', '@ultimate/themes' and cascading Angular compiler errors.",
    "limitations": "No product assertions ran. Dependency build was performed before retry; no product source repair."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded three-family Angular product specs passed once (135 tests).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{table,paginator,scroller}/*.spec.ts'",
    "outcome": "passed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "output": "Exit 0. Vitest 4.0.8: 3 files, 135 tests passed (Table 95, Paginator 16, Scroller 24). Angular warnings NG8113 for unused UStepList/UStepPanels in VerticalStepperHost (src/g3c1-aura-styles.spec.ts), NG8102 for step() ?? 1 (src/input-number/input-number.ts:90:19).",
    "run": "docs/inventory/angular-table-viewport/product-run.json",
    "limitations": "Local Angular unit tests only; not browser/accessibility/visual, Storybook, publication, full package build or remote CI. Coverage includes imported foundations and does not prove exhaustive coverage. Warnings were not repaired."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step runs root pnpm run test, recursively including Angular ng test --project=ng; inventory tests are outside provenance-only test:scripts. Configuration only, no remote run observed.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional !cancelled() and classification scope != docs; branch protection not observed."
  }
]
```
