# Focus trap component

ID: reactcore.focus-trap

Framework: react; availability: public

## Authored interpretation

Component that wraps children with hidden sentinel elements to keep tab focus inside and optionally auto-focuses on mount.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports FocusTrap and the type FocusTrapProps (children, autoFocus, disabled, autoFocusSelector, firstFocusableSelector). Hidden focusable elements are excluded through the u-hidden-focusable selector.

## Public exports

@ultimate/react-core#FocusTrap
@ultimate/react-core#FocusTrapProps

## Owned source and evidence

packages/react-core/src/focus-trap/index.ts
packages/react-core/src/focus-trap/focus-trap.tsx

```text
packages/react-core/src/focus-trap/focus-trap.tsx: export function FocusTrap({
packages/react-core/src/focus-trap/focus-trap.tsx: export interface FocusTrapProps {
```

## Relationships

reactcore.hooks
package.ultimate.uix-utils.dom (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Focus trap component is present; this record describes the current source without asserting framework parity."
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
