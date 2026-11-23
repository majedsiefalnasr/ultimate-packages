# IconField styles

ID: uixstyles.iconfield

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the icon field and input icon components.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/iconfield only (it is not re-exported from the package root). Selectors: .u-icon-field and .u-input-icon, with the icon placed by :first-child and :last-child against DOM order; the field padding rules key on the classes the sibling fields emit (u-inputtext and p-inputwrapper), and the small and large icon sizes are keyed with :has() on u-inputtext-sm and u-inputfield-sm, and on their -lg counterparts. Tokens use the form.field.padding.x, form.field.sm and lg font size, icon.size and iconfield.icon.color names. It is the @primeuix/styles 2.0.3 iconfield module with the root renamed to u-icon-field, the icon renamed to u-input-icon and the sibling selectors changed to the emitted class names (ADR-091).

## Public exports

@ultimate/uix-styles/iconfield#style

## Owned source and evidence

packages/uix-styles/src/iconfield/index.ts

```text
packages/uix-styles/src/iconfield/index.ts: export const style = /*css*/ `
packages/uix-styles/src/iconfield/index.ts: .u-icon-field {
packages/uix-styles/src/iconfield/index.ts: .u-icon-field .u-inputtext:not(:first-child)
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for IconField styles is present and is consumed by the Angular, React and Vue icon field style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the sibling class names; it does not render the CSS."
  }
]
```
