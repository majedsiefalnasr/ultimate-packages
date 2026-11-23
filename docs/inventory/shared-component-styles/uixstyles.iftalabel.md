# IftaLabel styles

ID: uixstyles.iftalabel

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the infield top-aligned label component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/iftalabel only (it is not re-exported from the package root). Selectors: .u-ifta-label with its absolutely positioned label; the field padding rules key on the classes the sibling fields emit (u-inputtext, u-textarea, u-select-label, u-multi-select-label, u-cascade-select-label, u-autocomplete-input-multiple and u-treeselect-label); the invalid colour is keyed with :has() on p-invalid, the focus colour on input and textarea :focus and on p-inputwrapper-focus, and the icon offset on u-input-icon. Tokens use the iftalabel.* namespace. It is the @primeuix/styles 2.0.3 iftalabel module with the root renamed to u-ifta-label and the sibling selectors changed to the emitted class names (ADR-092). No component currently emits p-inputwrapper-focus, so the focus colour reaches plain inputs and textareas only.

## Public exports

@ultimate/uix-styles/iftalabel#style

## Owned source and evidence

packages/uix-styles/src/iftalabel/index.ts

```text
packages/uix-styles/src/iftalabel/index.ts: export const style = /*css*/ `
packages/uix-styles/src/iftalabel/index.ts: .u-ifta-label {
packages/uix-styles/src/iftalabel/index.ts: .u-ifta-label:has(.p-invalid) label
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for IftaLabel styles is present and is consumed by the Angular and Vue ifta label style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the sibling class names; it does not render the CSS."
  }
]
```
