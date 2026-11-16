# React UAccordion

ID: react.accordion

Framework: react; availability: public

## Authored interpretation

Collapsible panel group with single or multiple expansion.

## Framework surface

UAccordion forwards HTMLDivElement. UAccordionProps: panels (UAccordionPanel[]), multiple=false, value, defaultValue (string | number | array of those), onValueChange(value | undefined), onTabOpen and onTabClose (UAccordionTabEvent with optional originalEvent and the panel value as index), className. UAccordionPanel: value, header, disabled, content. State is controlled when value !== undefined, otherwise internal state seeded from defaultValue. In multiple mode toggling adds or removes the value in an array; in single mode an open panel toggles to undefined. onValueChange fires first, then onTabOpen or onTabClose based on the prior active state. Header is a div role=button with tabIndex 0 (-1 when disabled), aria-expanded, aria-disabled, data-u-active and data-u-disabled; Enter and Space activate. A disabled panel returns before preventDefault. Content is rendered only while active (unmounted otherwise) inside role=region. Glyphs are aria-hidden. AccordionClassesParams is exported from accordion-style.ts but is not re-exported by the barrel (source-only). accordionStyleModule is exported untyped, unlike the other three families. accordionStyleModule is the owned source-only StyleModule adapter (css and classes), not a public package export. The family uses useComponentBase from react-core/base with componentName "accordion", whose implementation calls useComponentStyle from react-core/styling. No separate base class, props factory, directive, context/provider or exported hook exists under this family root. Root @ultimate/react and secondary @ultimate/react/accordion expose the same named barrel surface; manifest paths declare dist artifacts, not proof of a published/installable package. Aura registers accordion; registration is not rendered theme verification. No family implementation imports @ultimate/uix-styles, @ultimate/uix-utils or @ultimate/uix-motion. No dedicated component-metadata record exists for this family at the inspected revision, so no metadata relationship is claimed. Prime mentions in source comments are provenance context only; no parity or gap judgment is made.

## Public exports

@ultimate/react#UAccordion
@ultimate/react/accordion#UAccordion
@ultimate/react#UAccordionPanel
@ultimate/react/accordion#UAccordionPanel
@ultimate/react#UAccordionTabEvent
@ultimate/react/accordion#UAccordionTabEvent
@ultimate/react#UAccordionProps
@ultimate/react/accordion#UAccordionProps

## Owned source and evidence

packages/react/src/accordion/accordion-style.ts
packages/react/src/accordion/accordion.tsx
packages/react/src/accordion/index.ts

```text
packages/react/src/accordion/index.ts: export { UAccordion } from "./accordion";
packages/react/src/accordion/accordion.tsx: componentName: "accordion"
packages/react/src/accordion/accordion-style.ts: export const accordionStyleModule = { css, classes };
packages/react/src/accordion/accordion-style.ts: export interface AccordionClassesParams {
packages/react/src/accordion/accordion.tsx: export interface UAccordionProps {
packages/react/src/accordion/accordion.tsx: export const UAccordion = React.forwardRef<HTMLDivElement, UAccordionProps>(function UAccordion(
packages/react/src/accordion/accordion.tsx: aria-expanded
packages/react/src/index.ts: export * from "./accordion";
packages/react/package.json: "./accordion": {
packages/themes/src/presets/aura/index.ts:     accordion,
packages/react-core/src/base/component-base.ts: import { useComponentStyle } from "../styling/use-component-style";
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
```

## Relationships

package.ultimate.react.accordion → [react.accordion](react.accordion.md) (reconciled family alias)
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
