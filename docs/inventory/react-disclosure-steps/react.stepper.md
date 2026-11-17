# React UStepper

ID: react.stepper

Framework: react; availability: public

## Authored interpretation

Step container with a header strip and panel markers rendering per-step content.

## Framework surface

UStepper forwards HTMLDivElement. UStepperProps: activeStep=0, linear=false, onChangeStep({originalEvent | undefined, index}), children, className. Children are filtered to UStepperPanel elements. UStepperPanel is a marker declared React.FC<UStepperPanelProps> = () => null and never rendered itself. UStepperPanelProps: header, disabled, children as ReactNode or a render function receiving UStepperPanelRenderProps {index, active, prevCallback, nextCallback}. Internal activeStepState is synced from the activeStep prop by an effect, so the component is not purely controlled: clicks always update state and fire onChangeStep. The programmatic activeStep prop bypasses linear gating. Root is role=tablist; the header list item carries aria-current=step for the active step; header buttons are disabled when (linear and not active) or the panel is disabled, so a disabled active step is also disabled. Panels are role=tabpanel and hidden unless active, but every panel content is rendered each render, and render-prop children are invoked for every panel. prevCallback and nextCallback are no-ops at the ends. No keyboard handler exists. The separator class is defined in local CSS but never rendered. Public types are UStepperProps, UStepperPanelProps and UStepperPanelRenderProps. stepperStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. The family uses useComponentBase from react-core/base with componentName "stepper", whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/stepper expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers stepper; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision, so no metadata relationship is claimed. Prime mentions in source comments are provenance context only; no parity or gap judgment is made.

## Public exports

@ultimate/react#UStepper
@ultimate/react/stepper#UStepper
@ultimate/react#UStepperProps
@ultimate/react/stepper#UStepperProps
@ultimate/react#UStepperPanel
@ultimate/react/stepper#UStepperPanel
@ultimate/react#UStepperPanelProps
@ultimate/react/stepper#UStepperPanelProps
@ultimate/react#UStepperPanelRenderProps
@ultimate/react/stepper#UStepperPanelRenderProps

## Owned source and evidence

packages/react/src/stepper/index.ts
packages/react/src/stepper/stepper-panel.tsx
packages/react/src/stepper/stepper-style.ts
packages/react/src/stepper/stepper.tsx

```text
packages/react/src/stepper/index.ts: export { UStepper } from "./stepper";
packages/react/src/stepper/stepper.tsx: componentName: "stepper"
packages/react/src/stepper/stepper-style.ts: export const stepperStyleModule: StyleModule = { css, classes };
packages/react/src/stepper/stepper-panel.tsx: export const UStepperPanel: React.FC<UStepperPanelProps> = () => null;
packages/react/src/stepper/stepper.tsx: export interface UStepperProps {
packages/react/src/stepper/stepper-panel.tsx: export interface UStepperPanelRenderProps {
packages/react/src/stepper/stepper.tsx: aria-current={active ? "step" : undefined}
packages/react/src/stepper/stepper.tsx: role="tablist"
packages/react/src/index.ts: export * from "./stepper";
packages/react/package.json: "./stepper": {
packages/themes/src/presets/aura/index.ts:     stepper,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.stepper → [react.stepper](react.stepper.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Inspected component, types, owned composition and local style sources exist. Source interpretation and supporting spec presence are not passing runtime verification."
  },
  {
    "state": "verified",
    "behavior": "Existing React product specifications passed: 4 test files and 65 tests.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config /tmp/vitest-react129.config.mjs --maxWorkers=1 --no-file-parallelism",
    "outcome": "passed",
    "revision": "ac4fc25447d81612681a7a7a075ce569e0490498",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 4 passed (4); Tests 65 passed (65). React act(...) warnings appeared during accordion tests; all assertions passed.",
    "limitations": "Node v24.15.0 and pnpm; temporary Vitest config supplied css.postcss.plugins=[] to bypass discovery of the unrelated host /Users/majedsiefalnasr/postcss.config.mjs, which requires unavailable postcss-import. CSS PostCSS processing was therefore not exercised. React emitted act(...) warnings during accordion tests; all assertions passed.",
    "run": "docs/inventory/react-disclosure-steps/product-run.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/react vitest run. Workflow configuration only, not an observed successful CI execution or branch-protection claim. test:scripts is provenance-only and does not include inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); upstream dependencies may prevent execution. No remote CI observed."
  }
]
```
