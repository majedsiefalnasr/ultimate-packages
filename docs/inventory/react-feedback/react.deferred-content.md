# UDeferredContent

ID: react.deferred-content

Framework: react; availability: public

## Authored interpretation

Defers child rendering until intersection.

## Framework surface

UDeferredContent is a function; UDeferredContentProps children, onLoad, className. A wrapper renders immediately; IntersectionObserver loads children and calls onLoad on first intersection, disconnecting then and on cleanup. Effect depends on loaded, not onLoad; no fallback for missing IntersectionObserver. Tests mock the observer. No local style module or useComponentBase.

## Public exports

@ultimate/react#UDeferredContent
@ultimate/react/deferred-content#UDeferredContent
@ultimate/react#UDeferredContentProps
@ultimate/react/deferred-content#UDeferredContentProps

## Owned source and evidence

packages/react/src/deferred-content/deferred-content.tsx
packages/react/src/deferred-content/index.ts

```text
packages/react/src/deferred-content/deferred-content.tsx: UDeferredContent
packages/react/src/deferred-content/index.ts: UDeferredContent
packages/react/src/deferred-content/deferred-content.spec.tsx: describe(
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
    "behavior": "Scoped existing deferred-content tests passed as part of the recorded run.",
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
