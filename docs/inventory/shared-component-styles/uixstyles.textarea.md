# Textarea styles

ID: uixstyles.textarea

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the textarea component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/textarea only (it is not re-exported from the package root). Selectors: .u-textarea with :enabled:hover and :enabled:focus, the p-invalid and p-variant-filled modifiers (with filled hover and focus backgrounds and the invalid placeholder), :disabled, ::placeholder, .u-textarea-fluid, .u-textarea-resizable, and the .u-textarea-sm and .u-textarea-lg sizes. Tokens use the textarea.* names, including textarea.sm and textarea.lg font size and padding. It is the @primeuix/styles 2.0.3 textarea module with the root renamed to u-textarea (ADR-097).

## Public exports

@ultimate/uix-styles/textarea#style

## Owned source and evidence

packages/uix-styles/src/textarea/index.ts

```text
packages/uix-styles/src/textarea/index.ts: export const style = /*css*/ `
packages/uix-styles/src/textarea/index.ts: .u-textarea {
packages/uix-styles/src/textarea/index.ts: .u-textarea-lg {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Textarea styles is present and is consumed by the Angular, React and Vue textarea style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string, the Aura textarea tokens and the selector names; it does not render the CSS."
  }
]
```
