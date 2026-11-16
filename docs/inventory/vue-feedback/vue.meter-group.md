# Vue UMeterGroup

ID: vue.meter-group

Framework: vue; availability: public

## Authored interpretation

Displays grouped meter values.

## Framework surface

Props: value (readonly unknown[] array, default []), min (number, default 0), max (number, default 100), orientation (string, default "horizontal"). Each rendered item reads label, color, value and optional icon. Emits: none. Slots: none.

## Public exports

@ultimate/vue#UMeterGroup
@ultimate/vue#createBaseMeterGroup
@ultimate/vue/meter-group#UMeterGroup
@ultimate/vue/meter-group#createBaseMeterGroup

## Owned source and evidence

packages/vue/src/meter-group/BaseMeterGroup.ts
packages/vue/src/meter-group/MeterGroup.vue
packages/vue/src/meter-group/index.ts
packages/vue/src/meter-group/meter-group-style.ts

```text
packages/vue/src/meter-group/index.ts: export
```

## Relationships

package.ultimate.vue.meter-group → [vue.meter-group](vue.meter-group.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Scoped source and package entrypoint declarations inspected; runtime behavior is not inferred from another framework."
  },
  {
    "state": "verified",
    "behavior": "Scoped Vue unit suite passed with all assertions after building workspace prerequisites.",
    "command": "pnpm --filter @ultimate/vue exec vitest run --config ../../scripts/inventory/vue-disclosure-vitest.config.mjs src/progress-bar/ src/progress-spinner/ src/meter-group/ src/skeleton/ src/terminal/ src/inplace/ src/scroll-top/ src/deferred-content/ src/ripple/ src/key-filter/ src/style-class/ src/animate-on-scroll/ --maxWorkers=1 --minWorkers=1",
    "outcome": "passed",
    "revision": "fdd42818185ed77ae0c025f732310672581c1cea",
    "limitations": "Vitest 2.1.9 on Node v24.15.0. Local jsdom unit tests only. The inventory PostCSS override bypassed the host ancestor PostCSS config, so PostCSS processing, browser behavior, visual output, accessibility, publication and remote CI were not verified.",
    "run": "docs/inventory/vue-feedback/product-attempts.json",
    "output": "Vitest 2.1.9, Node v24.15.0: 12 files passed, 68 tests passed (progress-bar 5, progress-spinner 4, meter-group 5, skeleton 7, terminal 6, inplace 6, scroll-top 6, deferred-content 5, ripple 3, key-filter 8, style-class 7, animate-on-scroll 6)."
  },
  {
    "state": "failed",
    "behavior": "Initial unmodified scoped product test attempt stopped during PostCSS configuration loading before any product assertions.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/progress-bar/ src/progress-spinner/ src/meter-group/ src/skeleton/ src/terminal/ src/inplace/ src/scroll-top/ src/deferred-content/ src/ripple/ src/key-filter/ src/style-class/ src/animate-on-scroll/ --maxWorkers=1 --minWorkers=1",
    "outcome": "failed",
    "revision": "fdd42818185ed77ae0c025f732310672581c1cea",
    "output": "Failed to load PostCSS config: Failed to load PostCSS config (searchPath: /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/.worktrees/docs-142-vue-feedback/packages/vue): [Error] Loading PostCSS Plugin failed: Cannot find module 'postcss-import'\nRequire stack:\n- /Users/majedsiefalnasr/postcss.config.mjs",
    "limitations": "Environment/configuration failure before assertions; no product behavior was tested by this attempt.",
    "run": "docs/inventory/vue-feedback/product-attempts.json"
  }
]
```
