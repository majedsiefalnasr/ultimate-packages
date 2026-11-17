# Data package entry

ID: uixdata.root

Framework: shared; availability: internal

## Authored interpretation

The package entry barrel that selects which primitives are public.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts re-exports by name equals, calculateLast, calculateNumItemsInViewport and getPageCount (runtime) and the types SelectionMode, SortMeta, SortMode, FilterMatchMode, FilterMetadata and PaginationState with explicit named re-exports, no star re-exports. packages/uix-data/package.json declares only the root export; there are no subpaths. Workspace dependencies on the package are declared by the Angular, React and Vue component packages. Dependency: @ultimate/uix-utils. Availability is recorded as internal because this barrel file owns no export identities of its own; the public identities it forwards are attributed to the module records that define them.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/uix-data/src/index.ts

```text
packages/uix-data/src/index.ts: export { getPageCount } from "./pagination/index";
packages/uix-data/package.json: "@ultimate/uix-utils": "workspace:*"
packages/uix-data/tsup.config.ts: entry: { index: "src/index.ts" }
```

## Relationships

uixdata.identity
uixdata.selection
uixdata.sort
uixdata.filter
uixdata.pagination
uixdata.virtualization
package.ultimate.uix-utils.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Data package entry is present; this record describes the current source without asserting framework parity."
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
