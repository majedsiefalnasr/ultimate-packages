# Angular UTimeline

ID: angular.timeline

Framework: angular; availability: public

## Authored interpretation

Display-only chain of events with a marker, connector and optional opposite and content slots, in vertical or horizontal layout.

## Framework surface

Selector u-timeline; standalone generic UTimeline<T=unknown>, OnPush, ViewEncapsulation.None, componentName "timeline", imports CommonModule. Inputs value: T[]=[], align: "left"|"right"|"top"|"bottom"="left", layout: "vertical"|"horizontal"="vertical". There are no outputs. Three @ContentChild template references #content, #opposite and #marker (TemplateRef<{$implicit:T}>) are rendered through ngTemplateOutlet with the event as implicit context; the marker falls back to a default div and a connector div is rendered for every event except the last. The host class binding is cx('root', {layout, align}), producing u-timeline u-component and u-timeline-vertical|horizontal; align is accepted but the style module does not branch on it. This is an Ultimate-owned adaptation: the source comments state it replaces PrimeTemplate scanning with named ng-template ContentChild refs. timelineStyleModule is a local source-only {css, classes} module (no @ultimate/uix-styles/timeline entry exists, per its comment) whose classes cover root, event, eventOpposite, eventSeparator, eventMarker, eventConnector and eventContent. Consumer availability: @ultimate/ng#UTimeline, @ultimate/ng/timeline#UTimeline; the root barrel re-exports @ultimate/ng/timeline and the manifest has a ./timeline subpath. All components extend UBaseComponent with inherited dt?: Record<string,unknown> and unstyled?: boolean; base ngOnInit registers theme variables and structural CSS. Local style modules and their css/classes are source-only, owned by this family. Remaining private/protected state, lifecycle methods, render handlers and module-level helpers belong to the owning record. No additional directive, hook, factory or base class is declared in these roots. Aura registers this component's preset through the themes package; that relationship does not prove runtime completeness. No component-metadata record exists for this family in this revision. Manifest dist targets declare availability, not verified publication or installed artifact integrity. Prime comments are neutral provenance references only.

## Public exports

@ultimate/ng#UTimeline
@ultimate/ng/timeline#UTimeline

## Owned source and evidence

packages/ng/src/timeline/index.ts
packages/ng/src/timeline/timeline-style.ts
packages/ng/src/timeline/timeline.ts

```text
packages/ng/src/timeline/timeline.ts: export class UTimeline
packages/ng/src/timeline/index.ts: export { UTimeline } from "./timeline";
packages/ng/src/index.ts: export * from "@ultimate/ng/timeline";
packages/ng/package.json: "./timeline"
packages/ng/src/timeline/timeline-style.ts: export const timelineStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     timeline,
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, template composition, helpers and style adapters exist; source presence is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded four-family Angular product specs passed once (76 tests; Timeline 5).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{data-view,order-list,pick-list,timeline}/*.spec.ts'",
    "outcome": "passed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "output": "Exit 0. Vitest 4.0.8: 4 files, 76 tests passed (Timeline 5, DataView 21, OrderList 13, PickList 37). Angular warnings NG8113 for unused UStepList/UStepPanels in VerticalStepperHost (src/g3c1-aura-styles.spec.ts), NG8102 for step() ?? 1 (src/input-number/input-number.ts:90:19).",
    "run": "docs/inventory/angular-collection-presentation/product-run.json",
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
