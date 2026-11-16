# Vue UAccordionHeader

ID: vue.accordion-header

Framework: vue; availability: public

## Authored interpretation

Interactive compound disclosure header.

## Framework surface

UAccordionHeader injects accordion and panel. createBaseAccordionHeader declares no additional props and shares accordionStyleModule. Its role=button header exposes aria-expanded, aria-disabled and disabled tabindex; default and toggleicon slots receive active. Click and Enter, Space or NumpadEnter toggle an enabled panel. Arrow/Home/End navigation and selectOnFocus activation are not implemented here. Factories return Options API components extending createBaseComponent, which registers component styles on mount. No Prime parity judgment is implied. No direct UIX style-module import or component-metadata record exists for this scoped family.

## Public exports

@ultimate/vue#UAccordionHeader
@ultimate/vue/accordion-header#UAccordionHeader
@ultimate/vue#createBaseAccordionHeader
@ultimate/vue/accordion-header#createBaseAccordionHeader

## Owned source and evidence

packages/vue/src/accordion-header/AccordionHeader.vue
packages/vue/src/accordion-header/BaseAccordionHeader.ts
packages/vue/src/accordion-header/index.ts

```text
packages/vue/src/accordion-header/index.ts: UAccordionHeader
packages/vue/src/accordion-header/AccordionHeader.vue: event.code === "NumpadEnter"
packages/vue/src/index.ts: export * from "./accordion-header";
.github/workflows/ci.yml: run: pnpm run test
packages/themes/src/presets/aura/index.ts:     accordion,
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule);
package.json: "test": "pnpm --filter @ultimate/themes run test && pnpm -r --filter '!@ultimate/themes' --if-present run test"
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
vue.accordion

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The documented public entries and family implementation are source-present."
  },
  {
    "state": "verified",
    "behavior": "The scoped existing Vue product suite passed locally; accordion parts are exercised by the accordion suite.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --minWorkers=1",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "limitations": "Local jsdom unit tests only with built workspace prerequisites and the committed inventory PostCSS override; not browser, accessibility, visual, published-package or remote CI verification.",
    "output": "Vitest 2.1.9: 4 files passed, 63 tests passed (accordion 9, tabs 17, stepper 21, steps 16).",
    "run": "docs/inventory/vue-disclosure-steps/product-run.json"
  },
  {
    "state": "failed",
    "behavior": "The first scoped Vue product-suite attempt was blocked before assertions by the host PostCSS configuration.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --maxWorkers=1 --minWorkers=1",
    "outcome": "failed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "limitations": "Environment/configuration failure; no product assertion ran.",
    "output": "Vitest stopped before assertions because the ancestor /Users/majedsiefalnasr/postcss.config.mjs imports unavailable postcss-import.",
    "run": "docs/inventory/vue-disclosure-steps/product-attempts.json"
  },
  {
    "state": "failed",
    "behavior": "A retry with the committed PostCSS override failed before assertions because workspace build prerequisites were missing.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --minWorkers=1",
    "outcome": "failed",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "limitations": "Workspace build prerequisites had not yet been built; no product assertion ran. The subsequent run passed after building prerequisites.",
    "output": "Vitest collection failed for all four suites because the built @ultimate/vue-core entry was unavailable.",
    "run": "docs/inventory/vue-disclosure-steps/product-attempts.json"
  },
  {
    "state": "ci-enforced",
    "behavior": "Existing CI conditionally runs the root product-test script for non-docs changes; inventory tests are not included. No remote run or branch protection was observed.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on non-docs scope and !cancelled(); no remote run or branch protection observed."
  }
]
```
