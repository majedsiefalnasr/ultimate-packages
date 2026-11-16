# Vue UAccordion

ID: vue.accordion

Framework: vue; availability: public

## Authored interpretation

Compound disclosure selection root.

## Framework surface

UAccordion provides $pcAccordion and owns selection state. createBaseAccordion declares value (String, Number or readonly unknown[], undefined), multiple (false) and selectOnFocus (false). A prop watcher synchronizes d_value; updateValue toggles single or multiple selection and emits update:value, then tab-open or tab-close with {originalEvent: undefined, index: newValue}; index is a value, not position. Default slot composes the separate panel, header and content entries. accordionStyleModule is publicly exported and shared by all four base factories; its local dt() CSS and class keys root, panel, header, toggleicon, contentRoot and content support cx. Factories return Options API components extending createBaseComponent, which registers component styles on mount. No Prime parity judgment is implied. No direct UIX style-module import or component-metadata record exists for this scoped family.

## Public exports

@ultimate/vue#UAccordion
@ultimate/vue/accordion#UAccordion
@ultimate/vue#createBaseAccordion
@ultimate/vue/accordion#createBaseAccordion
@ultimate/vue#accordionStyleModule
@ultimate/vue/accordion#accordionStyleModule

## Owned source and evidence

packages/vue/src/accordion/Accordion.vue
packages/vue/src/accordion/BaseAccordion.ts
packages/vue/src/accordion/accordion-style.ts
packages/vue/src/accordion/index.ts

```text
packages/vue/src/accordion/index.ts: UAccordion
packages/vue/src/accordion/Accordion.vue: this.$emit(active ? "tab-close" : "tab-open"
packages/vue/src/accordion/BaseAccordion.ts: selectOnFocus
packages/vue/src/index.ts: export * from "./accordion";
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
vue.accordion-panel
vue.accordion-header
vue.accordion-content

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
