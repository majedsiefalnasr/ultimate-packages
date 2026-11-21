# React core entry

ID: reactcore.root

Framework: react; availability: internal

## Authored interpretation

The package entry barrel that selects which React core primitives are public.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts star re-exports eleven modules (base, confirmation, escape, focus-trap, hooks, icons, motion, overlay, scroll-lock, styling, zindex). Availability is internal because the barrel owns no export identities; the identities it forwards are attributed to the module records.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/react-core/src/index.ts

```text
packages/react-core/src/index.ts: export * from "./base";
packages/react-core/src/index.ts: export * from "./zindex";
```

## Relationships

reactcore.base
reactcore.confirmation
reactcore.escape
reactcore.focus-trap
reactcore.hooks
reactcore.icons
reactcore.motion
reactcore.overlay
reactcore.scroll-lock
reactcore.styling
reactcore.zindex

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for React core entry is present; this record describes the current source without asserting framework parity."
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
    "revision": "e3b55c7a5ab74af66f3cf5e7ef14898a5a5a3ac7",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 56 source files accounted for, 46 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
