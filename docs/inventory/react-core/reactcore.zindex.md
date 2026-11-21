# Z-index hook

ID: reactcore.zindex

Framework: react; availability: public

## Authored interpretation

Hook that sets and clears stacked z-index values using named bucket bases.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports useZIndex and Z_INDEX_BUCKETS (modal 1100, overlay 1000, menu 1000, tooltip 1100, toast 1200). set ignores null elements and accepts an optional base override.

## Public exports

@ultimate/react-core#useZIndex
@ultimate/react-core#Z_INDEX_BUCKETS

## Owned source and evidence

packages/react-core/src/zindex/index.ts
packages/react-core/src/zindex/use-z-index.ts

```text
packages/react-core/src/zindex/use-z-index.ts: export function useZIndex(): {
packages/react-core/src/zindex/use-z-index.ts: export const Z_INDEX_BUCKETS = {
```

## Relationships

package.ultimate.uix-utils.zindex (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Z-index hook is present; this record describes the current source without asserting framework parity."
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
    "revision": "2b9a684df33d0e7dc1e2120eb6ca981fd2865932",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 56 source files accounted for, 46 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
