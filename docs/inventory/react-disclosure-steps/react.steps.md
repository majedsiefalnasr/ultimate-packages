# React USteps

ID: react.steps

Framework: react; availability: public

## Authored interpretation

Model-driven step indicator navigation with optional readonly mode.

## Framework surface

USteps forwards HTMLElement (nav, ol, li, a). UStepsProps: model (UMenuItem[], type-only import from ../menu), activeIndex=0, readonly=true, onSelect({originalEvent,item,index}), className. activeIndex is consumer-owned and never mutated internally. An item is disabled when item.disabled or (readonly and index differs from activeIndex). Clicks on readonly or disabled items preventDefault and return, so even the active item does not fire onSelect in readonly mode; otherwise onSelect then item.command run, and default navigation is prevented unless the item has a url. The ol handles ArrowRight, ArrowLeft, Home and End via event.code to move focus across enabled links; disabled links get tabIndex -1. The active li carries aria-current=step, links carry aria-disabled and href item.url ?? #. Items with visible === false are skipped but numbering keeps the model index. Only item.label is rendered; icon is not. Public type is UStepsProps. stepsStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. The family uses useComponentBase from react-core/base with componentName "steps", whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/steps expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers steps; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision, so no metadata relationship is claimed. Prime mentions in source comments are provenance context only; no parity or gap judgment is made.

## Public exports

@ultimate/react#USteps
@ultimate/react/steps#USteps
@ultimate/react#UStepsProps
@ultimate/react/steps#UStepsProps

## Owned source and evidence

packages/react/src/steps/index.ts
packages/react/src/steps/steps-style.ts
packages/react/src/steps/steps.tsx

```text
packages/react/src/steps/index.ts: export { USteps } from "./steps";
packages/react/src/steps/steps.tsx: componentName: "steps"
packages/react/src/steps/steps-style.ts: export const stepsStyleModule: StyleModule = { css, classes };
packages/react/src/steps/steps.tsx: export interface UStepsProps {
packages/react/src/steps/steps.tsx: export const USteps = React.forwardRef<HTMLElement, UStepsProps>(function USteps(
packages/react/src/steps/steps.tsx: aria-current={active ? "step" : undefined}
packages/react/src/steps/steps.tsx: if (readonly || item.disabled) {
packages/react/src/steps/steps.tsx: import type { UMenuItem } from "../menu";
packages/react/src/index.ts: export * from "./steps";
packages/react/package.json: "./steps": {
packages/themes/src/presets/aura/index.ts:     steps,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.steps → [react.steps](react.steps.md) (reconciled family alias)
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
