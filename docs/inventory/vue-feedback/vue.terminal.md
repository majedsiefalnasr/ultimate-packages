# Vue UTerminal

ID: vue.terminal

Framework: vue; availability: public

## Authored interpretation

Displays terminal output and accepts command input.

## Framework surface

Props: welcomeMessage (string, default undefined), prompt (string, default "$"). Emits: none on the component; the event bus emits command(string) and receives response(string) and clear. Slots: none.

## Public exports

@ultimate/vue#UTerminal
@ultimate/vue#createBaseTerminal
@ultimate/vue#terminalEventBus
@ultimate/vue/terminal#UTerminal
@ultimate/vue/terminal#createBaseTerminal
@ultimate/vue/terminal#terminalEventBus

## Owned source and evidence

packages/vue/src/terminal/BaseTerminal.ts
packages/vue/src/terminal/Terminal.vue
packages/vue/src/terminal/index.ts
packages/vue/src/terminal/terminal-event-bus.ts
packages/vue/src/terminal/terminal-style.ts

```text
packages/vue/src/terminal/index.ts: export
```

## Relationships

package.ultimate.vue.terminal → [vue.terminal](vue.terminal.md) (reconciled family alias)
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
