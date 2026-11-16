# Angular UPanel

ID: angular.panel

Framework: angular; availability: public

## Authored interpretation

Header/body/footer container with optional collapse controls and toggle events.

## Framework surface

UPanel inputs header?:string, toggleable=false, collapsed=false, showHeader=true. Outputs collapsedChange:boolean, onBeforeToggle:{originalEvent:Event;collapsed:boolean}, onAfterToggle:{originalEvent:Event;collapsed:boolean}. Projection selects [header], default content and [footer]. UButton with pi pi-plus/pi-minus toggles body presence through @if; onBeforeToggle reports the current collapsed state and onAfterToggle the resulting state. The private toggledCollapsed signal overrides the input after the first toggle. uuid generates header/content IDs for aria-controls and content role=region aria-labelledby. The aria-label/controls/expanded bindings are on the u-button custom host, not the inner native button. Owned source-only panelStyleModule exports css/classes. Consumer availability is @ultimate/ng#UPanel only: the local barrel is root-reexported and package.json has no ./panel secondary entry. Selector u-panel; standalone OnPush component with ViewEncapsulation.None, componentName "panel", extends UBaseComponent (inherited dt and unstyled inputs; ngOnInit registers theme variables). Style adapter is imported locally, not barrel-exported, and does not import @ultimate/uix-styles. Aura preset components registers panel: panel; no scoped record is registered in packages/component-metadata/src/index.ts.

## Public exports

@ultimate/ng#UPanel

## Owned source and evidence

packages/ng/src/panel/index.ts
packages/ng/src/panel/panel-style.ts
packages/ng/src/panel/panel.ts

```text
packages/ng/src/panel/panel.ts: export class UPanel
packages/ng/src/panel/index.ts: export { UPanel } from "./panel";
packages/ng/src/index.ts: export * from "./panel";
packages/ng/package.json: "name": "@ultimate/ng"
packages/ng/src/panel/panel-style.ts: export const panelStyleModule
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     panel,
packages/component-metadata/src/index.ts: export const ALL_COMPONENTS: ComponentMetadata[] = [
packages/ng/src/panel/panel.ts: [attr.aria-expanded]="!isCollapsed()"
packages/ng/src/panel/panel.ts: this.onBeforeToggle.emit({ originalEvent: event, collapsed: wasCollapsed });
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-utils.uuid (pending cross-batch)
package.ultimate.ng.button (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, owned types, composition templates, helpers and style adapter exist; source presence is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded ten-family Angular product specs passed once (79 tests; Panel 6).",
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
