# Rating styles

ID: uixstyles.rating

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the rating component.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/rating only (it is not re-exported from the package root). Selectors: .u-rating (position: relative, inline-flex with the gap), .u-rating-option with the p-focus-visible focus ring, .u-rating-icon, a hover rule on options of a rating that is neither p-disabled nor p-readonly, .u-rating-option-active, .u-rating-icon.p-invalid and .u-rating.p-readonly .u-rating-option. Tokens use the rating.* names (gap, transition duration, focus ring, icon size, color, hover color and active color) plus form.field.invalid.border.color for the invalid icon stroke. It is the @primeuix/styles 2.0.3 rating module with the root renamed to u-rating and the invalid stroke moved from the undefined rating.invalid.icon.color to the form-field token (ADR-102).

## Public exports

@ultimate/uix-styles/rating#style

## Owned source and evidence

packages/uix-styles/src/rating/index.ts

```text
packages/uix-styles/src/rating/index.ts: export const style = /*css*/ `
packages/uix-styles/src/rating/index.ts: .u-rating {
packages/uix-styles/src/rating/index.ts: .u-rating-icon.p-invalid {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Rating styles is present and is consumed by the Angular, React and Vue rating style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no browser checks. The module has a unit test under packages/uix-styles/test that checks the style string and the token names; it does not render the CSS."
  }
]
```
