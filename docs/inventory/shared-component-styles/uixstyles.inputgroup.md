# InputGroup styles

ID: uixstyles.inputgroup

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the input group and input group addon components.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/inputgroup only (it is not re-exported from the package root). Selectors: .u-input-group and .u-input-group-addon, the nested layout of .u-icon-field, .u-float-label and .u-ifta-label inside a group, and the joined-field radius, border and focus rules keyed on the classes the sibling fields emit (u-inputtext, p-inputwrapper, p-inputwrapper-focus and p-focus). Tokens use the inputgroup.addon.* names: background, border color, border radius, color, min width and padding. It is the @primeuix/styles 2.0.3 inputgroup module with the root renamed to u-input-group, the addon to u-input-group-addon and the sibling selectors changed to the emitted class names (ADR-093).

## Public exports

@ultimate/uix-styles/inputgroup#style

## Owned source and evidence

packages/uix-styles/src/inputgroup/index.ts

```text
packages/uix-styles/src/inputgroup/index.ts: export const style = /*css*/ `
packages/uix-styles/src/inputgroup/index.ts: .u-input-group-addon {
packages/uix-styles/src/inputgroup/index.ts: .u-input-group .p-inputwrapper-focus
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for InputGroup styles is present and is consumed by the Angular, React and Vue input group style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the sibling class names; it does not render the CSS."
  }
]
```
