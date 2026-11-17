# React feedback and utility inventory (#141)

Start with the [generated index](index.md) and [scoped validation](validation.md). The ten scoped families produce eleven records: ten component/hook records and an independent public terminal event bus contract. All 48 scoped files have exactly one owner or reasoned supporting-file disposition: 28 runtime/barrel/style files and 20 specs/stories. There are 24 public names, exposed at both root and family entries (48 entry-qualified exports). Family labels do not determine product count. Props/options and meter item types are interpreted with their owning component/hook; no public factory or composition marker is exported in this scope.

Edit `scripts/inventory/react-feedback.json`, not the generated detail pages. The unchanged pilot generator reconciles files, explicit barrel exports, evidence, relationships and ownership aliases from #98. Root mappings are bounded to family barrels and separately checked against the real root star exports, package manifest and build entries. Declared distribution entries do not establish publication. `terminalEventBus` and `UTerminalCommand` are public at the terminal and root entries; the singleton has independent consumer use and its own record. Local style modules belong to the corresponding components and are source-only exports, not public family exports. Private percent/regex helpers, event handlers, observer lifecycle and animation sequences belong to their owning implementation.

Seven components use React core `useComponentBase` and local `{css, classes}` modules: progress-bar, progress-spinner, meter-group, skeleton, terminal, inplace and scroll-top. Their props do not expose `dt`, `unstyled` or `pt`. Progress-bar, spinner, meter-group, skeleton and scroll-top forward refs; terminal, inplace and deferred-content do not. Deferred-content and the two hooks have no local style/base integration. Aura registers progressbar, progressspinner, metergroup, skeleton, terminal and inplace; there is no scroll-top preset registration. Presence of preset data does not prove these local CSS variables are correctly connected to tokens or rendered appearance. None of these families has an entry in `ALL_COMPONENTS` or a family module under UIX styles at this baseline.

React core base and z-index (#149), shared EventBus (#144) and theme presets (#151) stay with their separate inventory scopes. Scroll-top composes React UButton (#108). Those cross-batch relationships assert ownership, not completion. Framework APIs, including DOM event/observer handling, are described from current source rather than inferred from Angular counterparts. No product fix, architecture decision or parity score is included.

## Executed verification

Source revision: `e3add69e5d93fea60f7a0d3f96ca986c0c8c9738`. Product source was not changed. Node v24.15.0 was used, with `pnpm install --frozen-lockfile` completed in this worktree. Builds of `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-data`, `@ultimate/uix-motion`, `@ultimate/uix-styles` and `@ultimate/react-core` passed before the product run.

```sh
node --test scripts/inventory/react-feedback.test.mjs
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-feedback.json --out docs/inventory/react-feedback
```

The inventory tests reconcile tracked files, real public entries, AST exported declarations, source anchors, ownership aliases, captured-run consistency and deterministic generated views. Negative mutations reject missing owners, invented exports, invalid same-ticket deferral, contradictory verification, false source anchors and dangling relationships. These checks verify the inventory, not rendered product behavior. Inventory tests are not included by the root `test:scripts` provenance-only command.

The initial direct scoped product command failed before any tests ran:

```sh
pnpm --filter @ultimate/react exec vitest run src/progress-bar/progress-bar.spec.tsx src/progress-spinner/progress-spinner.spec.tsx src/meter-group/meter-group.spec.tsx src/skeleton/skeleton.spec.tsx src/terminal/terminal.spec.tsx src/inplace/inplace.spec.tsx src/scroll-top/scroll-top.spec.tsx src/deferred-content/deferred-content.spec.tsx src/key-filter/key-filter.spec.tsx src/style-class/style-class.spec.tsx
```

Vite discovered the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs` and reported `Cannot find module 'postcss-import'`. Following the existing React inventory approach, a temporary `/tmp/react141-vitest.config.mjs` set `css.postcss.plugins=[]`, `test.environment="jsdom"`, `test.globals=true`, and `setupFiles` to the absolute `packages/react/vitest.setup.ts` in this worktree. It was removed after execution. No tracked configuration or host configuration changed.

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/progress-bar/ src/progress-spinner/ src/meter-group/ src/skeleton/ src/terminal/ src/inplace/ src/scroll-top/ src/deferred-content/ src/key-filter/ src/style-class/ --config /tmp/react141-vitest.config.mjs --maxWorkers=1 --no-file-parallelism
```

Vitest 2.1.9 passed 59 tests across ten files: progress-bar 5, spinner 4, meter-group 5, skeleton 7, terminal 6, inplace 7, scroll-top 5, deferred-content 5, key-filter 8 and style-class 7. Terminal emitted `Warning: An update to UTerminal inside a test was not wrapped in act(...).` The [captured run](product-run.json) records revision, command, preparation, outcome and limitations. These are existing jsdom specs; PostCSS processing, real browser layout, accessibility, visual behavior, Storybook, publication and remote CI were not exercised. Deferred-content mocks IntersectionObserver; style-class stubs offsetParent and synthesizes animationend. The run is not exhaustive behavioral proof.

The configured non-docs CI Test step invokes root `pnpm run test`, recursively including React's `vitest run`, conditional on scope, cancellation and prerequisite steps. This is configuration evidence only; no remote run or branch protection was observed. A docs-only classified run can skip those product tests.

## Current source observations

Progress-bar does not clamp values. Meter-group normalizes the total for aria-valuenow while keeping raw min/max attributes. Inplace is controlled only when onToggle exists; a close without an event skips onClose. Terminal's shared bus broadcasts across instances; `clear()` removes event listeners whereas `emit("clear")` clears mounted command logs.

Scroll-top starts hidden until a scroll event and has no explicit unmount z-index clear. Deferred-content requires IntersectionObserver and captures onLoad in an effect depending only on loaded. Key-filter's validateOnly bypass applies to keypress but not paste, and custom stateful regex lastIndex is not reset. Style-class caches its target and does not clean up in-flight animationend listeners or reset its animating flag. These observations describe source without repairing it or making parity judgments.
