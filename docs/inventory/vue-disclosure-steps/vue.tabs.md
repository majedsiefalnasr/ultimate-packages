# Vue UTabs

ID: vue.tabs

Framework: vue; availability: public

## Authored interpretation

Compound tab navigation and panels.

## Framework surface

UTabs, UTabList, UTab, UTabPanels and UTabPanel are public compositions with createBaseTabs. Its props are value (String or Number, undefined), lazy (false), scrollable (false), showNavigators (true), tabindex (0), selectOnFocus (false). UTabs provides $pcTabs, synchronizes local d_value and emits update:value on a changed selection. UTab requires value, accepts disabled (false), exposes role=tab, aria-selected/disabled and roving tabindex; ArrowRight/Left wrap among eligible tabs, Home/End focus boundaries, PageUp/Down scroll boundaries, Enter/Space/NumpadEnter activate; focus activates only when selectOnFocus. UTabList provides role=tablist, prev/next scroll buttons, a measured ink bar, and manages a ResizeObserver. UTabPanel requires value and uses role=tabpanel with v-show; panels stay mounted even when lazy is true. UTabPanels wraps the default slot. scrollable is declared but not consulted in the current list implementation. tabsStyleModule is source-only local CSS/classes; no independently exported types or part factories. Factories return Options API components extending createBaseComponent, which registers component styles on mount. No Prime parity judgment is implied. No direct UIX style-module import or component-metadata record exists for this scoped family.

## Public exports

@ultimate/vue#UTabs
@ultimate/vue/tabs#UTabs
@ultimate/vue#UTabList
@ultimate/vue/tabs#UTabList
@ultimate/vue#UTab
@ultimate/vue/tabs#UTab
@ultimate/vue#UTabPanels
@ultimate/vue/tabs#UTabPanels
@ultimate/vue#UTabPanel
@ultimate/vue/tabs#UTabPanel
@ultimate/vue#createBaseTabs
@ultimate/vue/tabs#createBaseTabs

## Owned source and evidence

packages/vue/src/tabs/BaseTabs.ts
packages/vue/src/tabs/Tab.vue
packages/vue/src/tabs/TabList.vue
packages/vue/src/tabs/TabPanel.vue
packages/vue/src/tabs/TabPanels.vue
packages/vue/src/tabs/Tabs.vue
packages/vue/src/tabs/index.ts
packages/vue/src/tabs/tabs-style.ts

```text
packages/vue/src/tabs/index.ts: UTabs
packages/vue/src/tabs/Tab.vue: this.$pcTabs.selectOnFocus
packages/vue/src/tabs/TabList.vue: new ResizeObserver
packages/vue/src/tabs/TabPanel.vue: v-show=
packages/vue/src/index.ts: export * from "./tabs";
.github/workflows/ci.yml: run: pnpm run test
packages/themes/src/presets/aura/index.ts:     tabs,
packages/vue-core/src/base/base-component.ts: registerComponentStyle(componentName, styleModule);
package.json: "test": "pnpm --filter @ultimate/themes run test && pnpm -r --filter '!@ultimate/themes' --if-present run test"
packages/vue/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The documented public entries and family implementation are source-present."
  },
  {
    "state": "verified",
    "behavior": "The scoped existing Vue product suite passed locally.",
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
