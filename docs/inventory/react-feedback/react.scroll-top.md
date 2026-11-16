# UScrollTop

ID: react.scroll-top

Framework: react; availability: public

## Authored interpretation

Provides a scroll-to-top button after a threshold.

## Framework surface

UScrollTop is forwardRef<HTMLButtonElement>; UScrollTopProps target="window" or "parent", threshold=400, behavior="smooth" or "auto", buttonAriaLabel="Scroll to top", onShow, onHide, className. Initially hidden; visibility changes on scroll only when position exceeds threshold. Parent target uses a hidden reference span. Click invokes target.scroll({top:0,behavior}). Composes UButton and useZIndex; effect sets overlay z-index on show, while a hidden conditional ref may be null on hide and no explicit unmount clear exists. scrollTopStyleModule is source-only. Styled using useComponentBase and local CSS; props do not expose dt, unstyled or pt.

## Public exports

@ultimate/react#UScrollTop
@ultimate/react/scroll-top#UScrollTop
@ultimate/react#UScrollTopProps
@ultimate/react/scroll-top#UScrollTopProps

## Owned source and evidence

packages/react/src/scroll-top/index.ts
packages/react/src/scroll-top/scroll-top-style.ts
packages/react/src/scroll-top/scroll-top.tsx

```text
packages/react/src/scroll-top/scroll-top.tsx: UScrollTop
packages/react/src/scroll-top/index.ts: UScrollTop
packages/react/src/scroll-top/scroll-top.spec.tsx: describe(
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.zindex (pending cross-batch)
package.ultimate.react.button (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implements the described surface."
  },
  {
    "state": "verified",
    "behavior": "Scoped existing scroll-top tests passed as part of the recorded run.",
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
