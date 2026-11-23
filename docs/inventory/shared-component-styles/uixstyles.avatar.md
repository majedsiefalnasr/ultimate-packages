# Avatar styles

ID: uixstyles.avatar

Framework: shared; availability: public

## Authored interpretation

Shared CSS for the avatar and avatar group components.

## Framework surface

See [authored signatures and interpretation](README.md). The module exports one named string constant, style, a CSS template (/*css*/) with embedded dt('...') design-token placeholders and no imports or runtime logic. It is available at the subpath @ultimate/uix-styles/avatar only (it is not re-exported from the package root). Selectors: .u-avatar plus image, clickable, circle, lg and xl modifiers, .u-avatar-icon, and .u-avatar-group with logical margin-inline-start offsets per avatar size; tokens use the avatar.* namespace, including avatar.group.*. It is the @primeuix/styles 2.0.3 avatar module with the u- prefix and one added rule, .u-avatar-clickable (ADR-087).

## Public exports

@ultimate/uix-styles/avatar#style

## Owned source and evidence

packages/uix-styles/src/avatar/index.ts

```text
packages/uix-styles/src/avatar/index.ts: export const style = /*css*/ `
packages/uix-styles/src/avatar/index.ts: .u-avatar {
packages/uix-styles/src/avatar/index.ts: .u-avatar-clickable {
```

## Relationships

uixstyles.root
package.ultimate.uix-styled.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Avatar styles is present and is consumed by the Angular, React and Vue avatar and avatar group style modules; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "This inventory update ran no product tests or browser checks. Test files under packages/uix-styles/test exist but their presence is not a passing result here."
  }
]
```
