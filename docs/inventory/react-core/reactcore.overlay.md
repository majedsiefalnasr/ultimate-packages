# Overlay portal and listeners

ID: reactcore.overlay

Framework: react; availability: public

## Authored interpretation

Portal component and a hook that reports outside clicks and viewport changes for overlays.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports Portal, PortalProps, useOverlayListener, UseOverlayListenerOptions and OverlayListenerMeta. Portal renders nothing until mounted on the client and defaults to document.body; appendTo accepts an element, a function or self. useOverlayListener returns [bind, unbind] and reports outside, resize, orientationchange and scroll events.

## Public exports

@ultimate/react-core#Portal
@ultimate/react-core#PortalProps
@ultimate/react-core#useOverlayListener
@ultimate/react-core#UseOverlayListenerOptions
@ultimate/react-core#OverlayListenerMeta

## Owned source and evidence

packages/react-core/src/overlay/index.ts
packages/react-core/src/overlay/portal.tsx
packages/react-core/src/overlay/use-overlay-listener.ts

```text
packages/react-core/src/overlay/portal.tsx: export function Portal({
packages/react-core/src/overlay/use-overlay-listener.ts: export function useOverlayListener({
```

## Relationships

reactcore.hooks

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Overlay portal and listeners is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/react-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-core.json --out docs/inventory/react-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "b93f4d6708ab4a00da820df86124a4e8a30687b0",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 37 source files accounted for, 39 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
