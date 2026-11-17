# useKeyFilter

ID: react.key-filter

Framework: react; availability: public

## Authored interpretation

Filters input keypress and paste events.

## Framework surface

useKeyFilter(inputRef, options) returns void. UseKeyFilterOptions accepts pattern?: RegExp | UKeyFilterPattern, validateOnly=false and when=true. UKeyFilterPattern presets are pint, int, pnum, money, num, hex, email, alpha and alphanum. Internal DEFAULT_MASKS and resolveRegex select the regex. Enabled effects attach keypress and paste listeners and remove them on cleanup; keypress validateOnly bypasses filtering, modifiers and Enter bypass too. Keypress tests current value plus key without caret awareness; paste tests individual characters even in validateOnly. Stateful custom regex lastIndex is not reset. No local style module or useComponentBase.

## Public exports

@ultimate/react#useKeyFilter
@ultimate/react/key-filter#useKeyFilter
@ultimate/react#UseKeyFilterOptions
@ultimate/react/key-filter#UseKeyFilterOptions
@ultimate/react#UKeyFilterPattern
@ultimate/react/key-filter#UKeyFilterPattern

## Owned source and evidence

packages/react/src/key-filter/index.ts
packages/react/src/key-filter/key-filter.ts

```text
packages/react/src/key-filter/key-filter.ts: useKeyFilter
packages/react/src/key-filter/index.ts: useKeyFilter
packages/react/src/key-filter/key-filter.spec.tsx: describe(
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implements the described surface."
  },
  {
    "state": "verified",
    "behavior": "Scoped existing key-filter tests passed as part of the recorded run.",
    "command": "NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/progress-bar/ src/progress-spinner/ src/meter-group/ src/skeleton/ src/terminal/ src/inplace/ src/scroll-top/ src/deferred-content/ src/key-filter/ src/style-class/ --config /tmp/react141-vitest.config.mjs --maxWorkers=1 --no-file-parallelism",
    "outcome": "passed",
    "revision": "e3add69e5d93fea60f7a0d3f96ca986c0c8c9738",
    "run": "docs/inventory/react-feedback/product-run.json",
    "output": "Vitest 2.1.9, Node v24.15.0: 10 test files passed, 59 tests passed (progress-bar 5, progress-spinner 4, meter-group 5, skeleton 7, terminal 6, inplace 7, scroll-top 5, deferred-content 5, key-filter 8, style-class 7). Terminal emitted React act(...) warnings.",
    "limitations": "Local jsdom unit tests only, with css.postcss.plugins=[]; PostCSS plugin processing, real browser layout, accessibility, visual, Storybook, publication and remote CI are not established. Deferred-content uses a mocked IntersectionObserver; style-class uses offsetParent stubs and synthetic animationend. Terminal emitted React act(...) warnings."
  },
  {
    "state": "ci-enforced",
    "behavior": "The configured non-docs CI Test step invokes root pnpm run test, which recursively includes React vitest run, subject to conditions and prerequisites; no remote execution or branch protection is asserted.",
    "workflow": ".github/workflows/ci.yml"
  }
]
```
