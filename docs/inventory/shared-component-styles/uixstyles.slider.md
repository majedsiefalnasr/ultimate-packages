# Slider styles

ID: uixstyles.slider

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the slider component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/slider only (it is not re-exported from the package root). Selectors: .u-slider (position: relative) with the .u-slider-horizontal and .u-slider-vertical modifiers, .u-slider-range, .u-slider-handle (position: absolute, with a ::before inner circle and hover and focus-visible rules) and the p-disabled modifier. Tokens use the slider.* names, including the track, range, handle, handle content, focus ring and transition tokens. It is the @primeuix/styles 2.0.3 slider module with the root renamed to u-slider and position: absolute added on the handle and the range (ADR-101).

## Public exports

@ultimate/uix-styles/slider#style

## Owned source and evidence

packages/uix-styles/src/slider/index.ts

```text
packages/uix-styles/src/slider/index.ts: export const style = /*css*/ `
packages/uix-styles/src/slider/index.ts: .u-slider {
packages/uix-styles/src/slider/index.ts: .u-slider-handle {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Slider styles is present and is consumed by the Angular, React and Vue slider style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the token names; it does not render the CSS."
  }
]
```
