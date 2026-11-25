# Knob styles

ID: uixstyles.knob

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the knob component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/knob only (it is not re-exported from the package root). Selectors: .u-knob-range (fill none, stroke transition), .u-knob-value (the u-knob-dash-frame animation, fill none), .u-knob-text, .u-knob svg (round, with transitions) and .u-knob svg:focus-visible with the focus ring, plus @keyframes u-knob-dash-frame. Tokens use the knob.* names (transition duration and the focus ring shadow, width, style, color and offset). It is the @primeuix/styles 2.0.3 knob module with .p-knob* and the p-knob-dash-frame keyframes renamed to u-knob* (ADR-103).

## Public exports

@ultimate/uix-styles/knob#style

## Owned source and evidence

packages/uix-styles/src/knob/index.ts

```text
packages/uix-styles/src/knob/index.ts: export const style = /*css*/ `
packages/uix-styles/src/knob/index.ts: .u-knob svg:focus-visible {
packages/uix-styles/src/knob/index.ts: @keyframes u-knob-dash-frame {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Knob styles is present and is consumed by the Angular, React and Vue knob style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that compares the style string with the pinned G3-A fixture; it does not render the CSS."
  }
]
```
