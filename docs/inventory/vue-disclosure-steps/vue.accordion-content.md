# Vue UAccordionContent

ID: vue.accordion-content

Framework: vue; availability: public

## Authored interpretation

Compound disclosure content region.

## Framework surface

UAccordionContent injects accordion and panel. createBaseAccordionContent declares no additional props and shares accordionStyleModule. Its default slot renders in a role=region with v-show: inactive content remains mounted. Factories return Options API components extending createBaseComponent, which registers component styles on mount. No Prime parity judgment is implied. No direct UIX style-module import or component-metadata record exists for this scoped family.

## Public exports

@ultimate/vue#UAccordionContent
@ultimate/vue/accordion-content#UAccordionContent
@ultimate/vue#createBaseAccordionContent
@ultimate/vue/accordion-content#createBaseAccordionContent

## Owned source and evidence

packages/vue/src/accordion-content/AccordionContent.vue
packages/vue/src/accordion-content/BaseAccordionContent.ts
packages/vue/src/accordion-content/index.ts

```text
packages/vue/src/accordion-content/index.ts: UAccordionContent
packages/vue/src/accordion-content/AccordionContent.vue: v-show=
packages/vue/src/index.ts: export * from "./accordion-content";
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
