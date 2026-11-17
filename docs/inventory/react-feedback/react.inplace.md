# UInplace

ID: react.inplace

Framework: react; availability: public

## Authored interpretation

Switches between display and editable content.

## Framework surface

UInplace is a function; UInplaceProps active=false, disabled=false, preventClick=false, onToggle, onOpen, onClose, display, children(closeCallback), className. Controlled iff onToggle supplied; otherwise active initializes internal state. Disabled gates opening and closing; preventClick gates click and Enter/NumpadEnter. A close callback without an event skips onClose and supplies undefined as the controlled toggle originalEvent. Render-prop composition has no separate marker components. inplaceStyleModule is source-only. Styled using useComponentBase and local CSS; props do not expose dt, unstyled or pt.

## Public exports

@ultimate/react#UInplace
@ultimate/react/inplace#UInplace
@ultimate/react#UInplaceProps
@ultimate/react/inplace#UInplaceProps

## Owned source and evidence

packages/react/src/inplace/index.ts
packages/react/src/inplace/inplace-style.ts
packages/react/src/inplace/inplace.tsx

```text
packages/react/src/inplace/inplace.tsx: UInplace
packages/react/src/inplace/index.ts: UInplace
packages/react/src/inplace/inplace.spec.tsx: describe(
```

## Relationships

package.ultimate.react-core.base (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implements the described surface."
  },
  {
    "state": "verified",
    "behavior": "Scoped existing inplace tests passed as part of the recorded run.",
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
