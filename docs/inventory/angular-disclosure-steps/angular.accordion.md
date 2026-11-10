# Angular UAccordion

ID: angular.accordion

Framework: angular; availability: public

## Authored interpretation

Data-model-driven collapsible panel disclosure with one shared content template.

## Framework surface

Selector u-accordion; one standalone UAccordion, not separate panel/header/content components. Public UAccordionPanel has required value: string | number, header?: string, disabled?: boolean; UAccordionTabEvent has originalEvent?: Event and index: string | number (the panel value, not positional index); UAccordionContentContext has $implicit: UAccordionPanel. Inputs panels: UAccordionPanel[] = [], multiple=false (booleanAttribute), value: string | number | (string | number)[] | undefined. Outputs valueChange of that same value union and onOpen/onClose: UAccordionTabEvent. ContentChild panelContent uses descendants:false and TemplateRef<UAccordionContentContext>, instantiated only for active panels. internalValue is fallback when value() is nullish; clicks update internal state and emit even with external value supplied. Multiple mode starts from an array or [], single mode toggles matching value to undefined. Disabled headers ignore interaction; click/Enter/Space toggle and preventDefault; headers expose role=button, aria-expanded/disabled and native Tab order, not arrow-key roving. AccordionClassesParams (active?/disabled?) and accordionStyleModule are source-only exports, absent from family barrel. All owned components extend UBaseComponent; inherited dt?: Record<string,unknown> and unstyled?: boolean inputs exist. Base ngOnInit registers theme variables and local structural CSS under componentName=accordion; local dt() token CSS and Aura accordion registration establish an indirect theme relationship, not a direct themes import or rendered-theme proof. No direct UIX style import, owned factories, base classes, hooks, separate directives or dedicated component-metadata record were found. No metadata relationship is inferred from names. Consumer availability: @ultimate/ng#UAccordion, @ultimate/ng/accordion#UAccordion, @ultimate/ng#UAccordionPanel, @ultimate/ng/accordion#UAccordionPanel, @ultimate/ng#UAccordionTabEvent, @ultimate/ng/accordion#UAccordionTabEvent, @ultimate/ng#UAccordionContentContext, @ultimate/ng/accordion#UAccordionContentContext. Manifest dist targets declare consumer entries, not verified publication/build artifacts. All remaining local css/classes constants, signals, DI references, DOM handlers and private/protected helpers in owned files belong to this family, not independent public products. Prime source comments are neutral provenance references only.

## Public exports

@ultimate/ng#UAccordion
@ultimate/ng/accordion#UAccordion
@ultimate/ng#UAccordionPanel
@ultimate/ng/accordion#UAccordionPanel
@ultimate/ng#UAccordionTabEvent
@ultimate/ng/accordion#UAccordionTabEvent
@ultimate/ng#UAccordionContentContext
@ultimate/ng/accordion#UAccordionContentContext

## Owned source and evidence

packages/ng/src/accordion/accordion-style.ts
packages/ng/src/accordion/accordion.ts
packages/ng/src/accordion/index.ts

```text
packages/ng/src/accordion/index.ts: export { UAccordion } from "./accordion";
packages/ng/src/index.ts: export * from "@ultimate/ng/accordion";
packages/ng/package.json: "./accordion"
packages/ng/src/accordion/accordion-style.ts: export const accordionStyleModule = { css, classes };
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
packages/themes/src/presets/aura/index.ts:     accordion,
packages/ng/src/accordion/accordion.ts: export class UAccordion extends UBaseComponent
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
    "behavior": "Existing bounded four-family Angular specs passed once (48 tests).",
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
