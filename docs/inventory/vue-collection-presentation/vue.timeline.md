# Vue UTimeline

ID: vue.timeline

Framework: vue; availability: public

## Authored interpretation

Display-only chain of events with marker, connector and opposite and content slots in vertical or horizontal layout.

## Framework surface

UTimeline and createBaseTimeline (componentName timeline, extending createBaseComponent directly as a display component); source-only timelineStyleModule, a plain {css, classes} object. Props: value, align (default left) and layout (default vertical); inheritAttrs is false. Scoped slots opposite, marker and content receive {item}; the marker falls back to a default div, a connector renders for every event except the last, and events are keyed by index. The root class reads only layout; align is passed to the class map but has no style branch. The style file records that no @ultimate/uix-styles/timeline entry exists and that it follows the messageStyleModule precedent. createBaseTimeline is the only base factory exported by any family barrel in this scope. Each is an Options API SFC extending its exported base factory, which extends createBaseComponent from @ultimate/vue-core; the family barrel exposes the same named surface at the root and at the family subpath, and declared dist paths do not establish publication. The style module is source-only: exported from its style file, not from the family barrel. No component-metadata record or @ultimate/uix-styles entry exists for this family in this revision. The Aura preset registration does not prove rendered appearance. Prime references in source are neutral provenance context.

## Public exports

@ultimate/vue#UTimeline
@ultimate/vue/timeline#UTimeline
@ultimate/vue#createBaseTimeline
@ultimate/vue/timeline#createBaseTimeline

## Owned source and evidence

packages/vue/src/timeline/Timeline.vue
packages/vue/src/timeline/BaseTimeline.ts
packages/vue/src/timeline/timeline-style.ts
packages/vue/src/timeline/index.ts

```text
packages/vue/src/timeline/Timeline.vue: name: "UTimeline"
packages/vue/src/timeline/BaseTimeline.ts: createBaseTimeline
packages/vue/src/timeline/timeline-style.ts: export const timelineStyleModule
packages/vue/src/timeline/index.ts: export { default as UTimeline } from "./Timeline.vue";
packages/vue/src/index.ts: export * from "./timeline";
packages/vue/package.json: "./timeline": {
packages/vue/tsup.config.ts: "timeline/index"
packages/themes/src/presets/aura/index.ts:     timeline,
.github/workflows/ci.yml: run: pnpm run test
package.json: "test:scripts": "node --test scripts/provenance/*.test.mjs"
packages/vue/src/timeline/index.ts: export { createBaseTimeline } from "./BaseTimeline";
packages/vue/src/timeline/Timeline.vue: inheritAttrs: false
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
    "behavior": "The SFC, base factory and local style module exist in source; implementation evidence alone is not a passing behavior check."
  },
  {
    "state": "verified",
    "behavior": "Existing scoped Vue product specifications passed: 5 test files and 52 tests (timeline 5).",
    "run": "docs/inventory/vue-collection-presentation/product-run.json",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/vue exec vitest run src/data-view src/order-list src/organization-chart src/pick-list src/timeline --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "revision": "3864a1d23b5ef0c5601ff740c104fdec4584d14d",
    "outcome": "passed",
    "output": "Vitest 2.1.9, Node v24.15.0: Test Files 5 passed (5); Tests 52 passed (52): pick-list 22, order-list 14, data-view 6, organization-chart 5, timeline 5.",
    "limitations": "The repository config scripts/inventory/vue-disclosure-vitest.config.mjs extends the Vue package config with css.postcss.plugins=[] to bypass the host ancestor /Users/majedsiefalnasr/postcss.config.mjs requiring missing postcss-import; PostCSS processing was not exercised. Workspace dependencies were already built. Local jsdom unit tests only; not browser, accessibility, visual, Storybook, publication or remote CI evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured conditional non-docs CI Test step runs root pnpm run test, which invokes the Vue test script; this describes workflow configuration, not a successful run or branch protection. The scoped inventory Node tests are not included in test:scripts.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on scope != docs and !cancelled(); earlier steps can prevent execution. No remote CI run observed."
  }
]
```
