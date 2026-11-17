# Scroll lock hook

ID: reactcore.scroll-lock

Framework: react; availability: public

## Authored interpretation

Hook exposing register and unregister functions backed by the shared scroll lock registry.

## Framework surface

See [authored signatures and interpretation](README.md). Root export useScrollLock returning stable register(id) and unregister(id) callbacks.

## Public exports

@ultimate/react-core#useScrollLock

## Owned source and evidence

packages/react-core/src/scroll-lock/index.ts
packages/react-core/src/scroll-lock/use-scroll-lock.ts

```text
packages/react-core/src/scroll-lock/use-scroll-lock.ts: export function useScrollLock(): {
```

## Relationships

package.ultimate.uix-utils.scroll-lock (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Scroll lock hook is present; this record describes the current source without asserting framework parity."
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
    "revision": "bc2ea64ece059085cc26dbc0e72e983b12f16cd1",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 37 source files accounted for, 39 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
