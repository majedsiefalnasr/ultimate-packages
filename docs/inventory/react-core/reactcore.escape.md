# Escape and display order

ID: reactcore.escape

Framework: react; availability: public

## Authored interpretation

Hooks that register the Escape key handlers with priorities and track display order of visible overlay groups.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports ESCAPE_PRIORITIES (re-exported from @ultimate/uix-utils/escape), useDisplayOrder, useGlobalEscapeKey and the type UseGlobalEscapeKeyOptions. useGlobalEscapeKey registers only while when is true and the secondary priority is defined.

## Public exports

@ultimate/react-core#ESCAPE_PRIORITIES
@ultimate/react-core#useDisplayOrder
@ultimate/react-core#useGlobalEscapeKey
@ultimate/react-core#UseGlobalEscapeKeyOptions

## Owned source and evidence

packages/react-core/src/escape/index.ts
packages/react-core/src/escape/priorities.ts
packages/react-core/src/escape/use-display-order.ts
packages/react-core/src/escape/use-global-escape-key.ts

```text
packages/react-core/src/escape/use-display-order.ts: export function useDisplayOrder(
packages/react-core/src/escape/use-global-escape-key.ts: export function useGlobalEscapeKey({ callback, when, priority }: UseGlobalEscapeKeyOptions): void {
packages/react-core/src/escape/priorities.ts: export { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
```

## Relationships

package.ultimate.uix-utils.escape (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Escape and display order is present; this record describes the current source without asserting framework parity."
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
    "revision": "38d2616779a7a2f65c765724d7760d4532fbbdd2",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 37 source files accounted for, 39 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
