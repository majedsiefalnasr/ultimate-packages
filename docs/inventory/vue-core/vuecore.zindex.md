# Z-index composable

ID: vuecore.zindex

Framework: vue; availability: public

## Authored interpretation

Composable that sets and clears stacked z-index values by named key.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports useZIndex and Z_INDEX_KEYS (modal, menu, tooltip, overlay). There is no base-value table in this package; baseZIndex is forwarded to ZIndex.set unchanged.

## Public exports

@ultimate/vue-core#useZIndex
@ultimate/vue-core#Z_INDEX_KEYS

## Owned source and evidence

packages/vue-core/src/zindex/index.ts
packages/vue-core/src/zindex/use-z-index.ts

```text
packages/vue-core/src/zindex/use-z-index.ts: export function useZIndex(): {
packages/vue-core/src/zindex/use-z-index.ts: export const Z_INDEX_KEYS = {
```

## Relationships

package.ultimate.uix-utils.zindex (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Z-index composable is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/vue-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-core.json --out docs/inventory/vue-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 35 source files accounted for, 53 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
