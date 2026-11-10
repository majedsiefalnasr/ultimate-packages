# Angular UTabs

ID: angular.tabs

Framework: angular; availability: public

## Authored interpretation

Value-linked tab triggers and persistent projected panels with overflow navigation.

## Framework surface

UTabs (u-tabs) owns value = model<string | number | undefined>(undefined), including generated valueChange; inputs selectOnFocus=false and showNavigators=true (booleanAttribute), tabindex=0. Public updateValue(newValue: string | number | undefined) directly sets the model. UTabList (u-tab-list) projects triggers into role=tablist with optional Previous/Next buttons, no own inputs; public updateInkBar() measures the active tab and sets indicator width/left. Browser-only ResizeObserver updates overflow state on init/resize and is disconnected on destroy; scroll also updates buttons. UTab (u-tab) requires value: string | number, disabled=false; injects both UTabs and UTabList. Active equality drives aria-selected, data state and tabindex (disabled or inactive -1). Focus activates only with selectOnFocus; click and Enter/Space/NumpadEnter activate enabled tabs. ArrowRight/Left wrap across eligible sibling u-tab elements, Home/End jump, focus scrolls into view; activation schedules updateInkBar() with setTimeout. UTabPanels (u-tab-panels) is a stateless role=presentation projection wrapper. UTabPanel (u-tab-panel) requires value: string | number; role=tabpanel, [hidden] when inactive, projected content stays mounted. All five classes are public components (not attribute directives). tabsStyleModule is source-only; its tab class resolver uses inline active?/disabled? parameter types, no named class-parameter interface. All owned components extend UBaseComponent; inherited dt?: Record<string,unknown> and unstyled?: boolean inputs exist. Base ngOnInit registers theme variables and local structural CSS under componentName=tabs; local dt() token CSS and Aura tabs registration establish an indirect theme relationship, not a direct themes import or rendered-theme proof. No direct UIX style import, owned factories, base classes, hooks, separate directives or dedicated component-metadata record were found. No metadata relationship is inferred from names. Consumer availability: @ultimate/ng#UTabs, @ultimate/ng/tabs#UTabs, @ultimate/ng#UTabList, @ultimate/ng/tabs#UTabList, @ultimate/ng#UTab, @ultimate/ng/tabs#UTab, @ultimate/ng#UTabPanels, @ultimate/ng/tabs#UTabPanels, @ultimate/ng#UTabPanel, @ultimate/ng/tabs#UTabPanel. Manifest dist targets declare consumer entries, not verified publication/build artifacts. All remaining local css/classes constants, signals, DI references, DOM handlers and private/protected helpers in owned files belong to this family, not independent public products. Prime source comments are neutral provenance references only.

## Public exports

@ultimate/ng#UTabs
@ultimate/ng/tabs#UTabs
@ultimate/ng#UTabList
@ultimate/ng/tabs#UTabList
@ultimate/ng#UTab
@ultimate/ng/tabs#UTab
@ultimate/ng#UTabPanels
@ultimate/ng/tabs#UTabPanels
@ultimate/ng#UTabPanel
@ultimate/ng/tabs#UTabPanel

## Owned source and evidence

packages/ng/src/tabs/index.ts
packages/ng/src/tabs/tab-list.ts
packages/ng/src/tabs/tab-panel.ts
packages/ng/src/tabs/tab-panels.ts
packages/ng/src/tabs/tab.ts
packages/ng/src/tabs/tabs-style.ts
packages/ng/src/tabs/tabs.ts

```text
packages/ng/src/tabs/index.ts: export { UTabs } from "./tabs";
packages/ng/src/index.ts: export * from "@ultimate/ng/tabs";
packages/ng/package.json: "./tabs"
packages/ng/src/tabs/tabs-style.ts: export const tabsStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     tabs,
packages/ng/src/tabs/tab-list.ts: export class UTabList extends UBaseComponent
packages/ng/src/tabs/tab-panel.ts: export class UTabPanel extends UBaseComponent
packages/ng/src/tabs/tab-panels.ts: export class UTabPanels extends UBaseComponent
packages/ng/src/tabs/tab.ts: export class UTab extends UBaseComponent
packages/ng/src/tabs/tabs.ts: export class UTabs extends UBaseComponent
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation, public composition/types and local style adapters exist; source evidence alone is not execution."
  },
  {
    "state": "verified",
    "behavior": "Existing bounded four-family Angular specs passed once (48 total assertions counted as tests).",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{accordion,tabs,stepper,steps}/*.spec.ts'",
    "outcome": "passed",
    "revision": "fcd2e02d28e0b9a678262d4731bb7ae31732d574",
    "output": "Exit 0. Vitest 4.0.8: Test Files 4 passed (4); Tests 48 passed (48). accordion 8, tabs 13, stepper 6, steps 21. Angular build completed; warnings NG8113 (UStepList and UStepPanels unused in VerticalStepperHost in src/g3c1-aura-styles.spec.ts), NG8102 (src/input-number/input-number.ts:90:19 step() ?? 1).",
    "run": "docs/inventory/angular-disclosure-steps/product-run.json",
    "limitations": "Local Angular unit-test environment only; not browser/visual, Storybook, package build, publication or remote CI verification. Coverage includes imported foundations, not full family/platform coverage; warnings were not repaired."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step runs root pnpm run test, recursively including @ultimate/ng ng test --project=ng. Configuration only, not an observed successful remote run. Inventory tests are not in provenance-only test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional !cancelled() and classification scope != docs; branch protection and remote executions not observed."
  }
]
```
