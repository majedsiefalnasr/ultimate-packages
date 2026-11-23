# FloatLabel styles

ID: uixstyles.floatlabel

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the float label component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/floatlabel only (it is not re-exported from the package root). Selectors: .u-float-label with the -over, -on and -in variant classes, keyed with :has() on the classes the sibling fields emit (u-inputtext, u-textarea, u-select-label, u-multi-select-label, u-cascade-select-label, u-input-icon, p-filled, p-invalid and p-inputwrapper-filled and -focus); tokens use the floatlabel.* namespace plus form.field.padding.x and icon.size. It is the @primeuix/styles 2.0.3 floatlabel module with the root renamed to u-float-label and the sibling selectors changed to the emitted class names (ADR-090).

## Public exports

@ultimate/uix-styles/floatlabel#style

## Owned source and evidence

packages/uix-styles/src/floatlabel/index.ts

```text
packages/uix-styles/src/floatlabel/index.ts: export const style = /*css*/ `
packages/uix-styles/src/floatlabel/index.ts: .u-float-label {
packages/uix-styles/src/floatlabel/index.ts: .u-float-label:has(input.p-filled) label
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for FloatLabel styles is present and is consumed by the Angular, React and Vue float label style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the sibling class names; it does not render the CSS."
  }
]
```
