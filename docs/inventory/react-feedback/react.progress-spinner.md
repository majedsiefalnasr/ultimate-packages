# UProgressSpinner

ID: react.progress-spinner

Framework: react; availability: public

## Authored interpretation

Displays a spinning progress indicator.

## Framework surface

UProgressSpinner is forwardRef<HTMLDivElement>; UProgressSpinnerProps strokeWidth="2", fill="none", animationDuration="2s", ariaLabel, className. A busy progressbar contains an SVG circle; animationDuration applies to the SVG. progressSpinnerStyleModule is source-only local CSS and classes. Styled using useComponentBase and local CSS; props do not expose dt, unstyled or pt.

## Public exports

@ultimate/react#UProgressSpinner
@ultimate/react/progress-spinner#UProgressSpinner
@ultimate/react#UProgressSpinnerProps
@ultimate/react/progress-spinner#UProgressSpinnerProps

## Owned source and evidence

packages/react/src/progress-spinner/index.ts
packages/react/src/progress-spinner/progress-spinner-style.ts
packages/react/src/progress-spinner/progress-spinner.tsx

```text
packages/react/src/progress-spinner/progress-spinner.tsx: UProgressSpinner
packages/react/src/progress-spinner/index.ts: UProgressSpinner
packages/react/src/progress-spinner/progress-spinner.spec.tsx: describe(
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
    "behavior": "Scoped existing progress-spinner tests passed as part of the recorded run.",
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
