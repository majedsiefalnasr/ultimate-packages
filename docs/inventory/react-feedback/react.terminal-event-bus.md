# Terminal event bus

ID: react.terminal-event-bus

Framework: react; availability: public

## Authored interpretation

Shares command, response and clear events with terminal instances.

## Framework surface

terminalEventBus is a public singleton created with EventBus(); UTerminalCommand has text: string and response?: string. EventBus provides on, off, emit and clear; bus.clear() removes listeners, whereas emit("clear") asks mounted terminals to clear their command logs. Responses apply to the latest command. The bus is shared across instances.

## Public exports

@ultimate/react#terminalEventBus
@ultimate/react/terminal#terminalEventBus
@ultimate/react#UTerminalCommand
@ultimate/react/terminal#UTerminalCommand

## Owned source and evidence

packages/react/src/terminal/terminal-event-bus.ts

```text
packages/react/src/terminal/terminal-event-bus.ts: terminalEventBus
packages/uix-utils/src/eventbus/index.ts: clear()
```

## Relationships

react.terminal
package.ultimate.uix-utils.eventbus (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "The source exposes the singleton and command type."
  },
  {
    "state": "verified",
    "behavior": "Terminal existing tests cover command and response events in the recorded run.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/progress-bar/ src/progress-spinner/ src/meter-group/ src/skeleton/ src/terminal/ src/inplace/ src/scroll-top/ src/deferred-content/ src/key-filter/ src/style-class/ --config /tmp/react141-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "outcome": "passed",
    "revision": "e3add69e5d93fea60f7a0d3f96ca986c0c8c9738",
    "run": "docs/inventory/react-feedback/product-run.json",
    "output": "Vitest 2.1.9, Node v24.15.0: 10 test files passed, 59 tests passed (progress-bar 5, progress-spinner 4, meter-group 5, skeleton 7, terminal 6, inplace 7, scroll-top 5, deferred-content 5, key-filter 8, style-class 7). Terminal emitted React act(...) warnings.",
    "limitations": "Local jsdom unit tests only, with css.postcss.plugins=[]; PostCSS plugin processing, real browser layout, accessibility, visual, Storybook, publication and remote CI are not established. Deferred-content uses a mocked IntersectionObserver; style-class uses offsetParent stubs and synthetic animationend. Terminal emitted React act(...) warnings."
  }
]
```
