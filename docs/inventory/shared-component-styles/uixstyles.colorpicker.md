# ColorPicker styles

ID: uixstyles.colorpicker

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the color picker component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/colorpicker only (it is not re-exported from the package root). Selectors: .u-color-picker (inline-block, relative), .u-color-picker-dragging (pointer cursor), .u-color-picker-preview and .u-color-picker-preview:enabled:focus-visible (size, radius, transitions and the focus ring), .u-color-picker-panel (background, border, radius, shadow, 193 x 166 px, absolute at the top left), .u-color-picker-panel-inline (static, no shadow), .u-color-picker-content, .u-color-picker-color-selector (150 x 150 px), .u-color-picker-color-background (the two gradients), .u-color-picker-color-handle, .u-color-picker-hue (the hue gradient) and .u-color-picker-hue-handle; positions use the logical inset-block-start and inset-inline-start properties. Tokens use the colorpicker.* names (preview size, border radius, focus border colour and focus ring, transition duration, panel background, border colour, border radius and shadow, and handle colour); colorpicker.preview.focus.border.color is kept from upstream although Aura does not define it. There is no z-index rule. It is the @primeuix/styles 2.0.3 colorpicker module with .p-colorpicker* renamed to .u-color-picker* (ADR-104).

## Public exports

@ultimate/uix-styles/colorpicker#style

## Owned source and evidence

packages/uix-styles/src/colorpicker/index.ts

```text
packages/uix-styles/src/colorpicker/index.ts: export const style = /*css*/ `
packages/uix-styles/src/colorpicker/index.ts: .u-color-picker-preview:enabled:focus-visible {
packages/uix-styles/src/colorpicker/index.ts: .u-color-picker-panel-inline {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for ColorPicker styles is present and is consumed by the Angular, React and Vue color-picker style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks its tokens, selectors and logical placement; colorpicker is not a G3-A fixture key, so no pinned fixture comparison exists, and the test does not render the CSS."
  }
]
```
