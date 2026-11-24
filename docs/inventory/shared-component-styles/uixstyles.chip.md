# Chip styles

ID: uixstyles.chip

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the chip component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/chip only (it is not re-exported from the package root). Selectors: .u-chip, .u-chip-icon, .u-chip-image, .u-chip-label and .u-chip-remove-icon with its :focus-visible ring, and the :has() rules that adjust the root padding when a remove icon or an image is present. Tokens use the chip.* names (background, color, border radius, padding, gap, icon, image, remove icon and transition). It is the @primeuix/styles 2.0.3 chip module with the root renamed to u-chip, plus a u-chip-label rule that upstream lacks (ADR-098).

## Public exports

@ultimate/uix-styles/chip#style

## Owned source and evidence

packages/uix-styles/src/chip/index.ts

```text
packages/uix-styles/src/chip/index.ts: export const style = /*css*/ `
packages/uix-styles/src/chip/index.ts: .u-chip {
packages/uix-styles/src/chip/index.ts: .u-chip-remove-icon:focus-visible {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Chip styles is present and is consumed by the Angular, React and Vue chip style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the token names; it does not render the CSS."
  }
]
```
