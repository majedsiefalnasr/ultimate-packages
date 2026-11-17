# Sort contracts

ID: uixdata.sort

Framework: shared; availability: public

## Authored interpretation

Type contracts for sort metadata and sort cardinality.

## Framework surface

See [authored signatures and interpretation](README.md). Root export of @ultimate/uix-data only (the package declares a single "." export and tsup builds one entry). Types only, no runtime values: SortMeta { field: string; order: 1 | 0 | -1 } and SortMode = "single" | "multiple". No comparator or sort function exists in the package.

## Public exports

@ultimate/uix-data#SortMeta
@ultimate/uix-data#SortMode

## Owned source and evidence

packages/uix-data/src/sort/index.ts

```text
packages/uix-data/src/sort/index.ts: export interface SortMeta {
packages/uix-data/src/sort/index.ts: export type SortMode = "single" | "multiple";
```

## Relationships

uixdata.root

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Sort contracts is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/uix-data/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/data-motion-primitives.json --out docs/inventory/data-motion-primitives (run twice; authored README SHA-256 checked before and after)",
    "revision": "75271f0ae536520ff9179f33b4309e7950b7aab4",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 11 source files, 34 named symbols, 34 root export identities, 11 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/data-motion-primitives/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
