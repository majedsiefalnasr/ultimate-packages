# useStyleClass

ID: react.style-class

Framework: react; availability: public

## Authored interpretation

Applies classes and transitions to a target on trigger interaction.

## Framework surface

useStyleClass(triggerRef, options) returns void. UseStyleClassOptions selector supports @next, @prev, @parent, @grandparent or a document selector, plus enterFromClass, enterActiveClass, enterToClass, leaveFromClass, leaveActiveClass, leaveToClass, toggleClass, hideOnOutsideClick, hideOnEscape, hideOnResize. Dismissal flags default false. Target is cached on first click. toggleClass toggles directly; otherwise offsetParent determines enter or leave. Active animations wait for animationend; immediate branches remove From and add To. Dismissal listeners apply to enter/leave. Cleanup removes trigger/document/window listeners and resets target, but not in-flight animationend listeners or animating flag. No local style module or useComponentBase.

## Public exports

@ultimate/react#useStyleClass
@ultimate/react/style-class#useStyleClass
@ultimate/react#UseStyleClassOptions
@ultimate/react/style-class#UseStyleClassOptions

## Owned source and evidence

packages/react/src/style-class/index.ts
packages/react/src/style-class/style-class.ts

```text
packages/react/src/style-class/style-class.ts: useStyleClass
packages/react/src/style-class/index.ts: useStyleClass
packages/react/src/style-class/style-class.spec.tsx: describe(
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
    "behavior": "Scoped existing style-class tests passed as part of the recorded run.",
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
