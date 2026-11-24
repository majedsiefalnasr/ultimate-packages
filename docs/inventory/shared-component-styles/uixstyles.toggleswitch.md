# ToggleSwitch styles

ID: uixstyles.toggleswitch

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the toggleswitch component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/toggleswitch only (it is not re-exported from the package root). Selectors: .u-toggle-switch (position: relative), .u-toggle-switch-input, .u-toggle-switch-slider and .u-toggle-switch-handle, the u-toggle-switch-checked modifier, hover and focus-visible rules keyed on :has() over the input, and the p-invalid and p-disabled modifiers. Tokens use the toggleswitch.* names, including the handle, checked, hover, focus ring, invalid and disabled tokens. It is the @primeuix/styles 2.0.3 toggleswitch module with the root renamed to u-toggle-switch (ADR-100).

## Public exports

@ultimate/uix-styles/toggleswitch#style

## Owned source and evidence

packages/uix-styles/src/toggleswitch/index.ts

```text
packages/uix-styles/src/toggleswitch/index.ts: export const style = /*css*/ `
packages/uix-styles/src/toggleswitch/index.ts: .u-toggle-switch {
packages/uix-styles/src/toggleswitch/index.ts: .u-toggle-switch-handle {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for ToggleSwitch styles is present and is consumed by the Angular, React and Vue toggle-switch style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the token names; it does not render the CSS."
  }
]
```
