# Shared API types

ID: ngcore.api

Framework: angular; availability: public

## Authored interpretation

Type-only contracts for menu items and tooltip options shared by component packages.

## Framework surface

See [authored signatures and interpretation](README.md). Root type exports UMenuItem and UTooltipOptions; neither exists at runtime.

## Public exports

@ultimate/ng-core#UMenuItem
@ultimate/ng-core#UTooltipOptions

## Owned source and evidence

packages/ng-core/src/api/index.ts
packages/ng-core/src/api/types.ts

```text
packages/ng-core/src/api/types.ts: export interface UMenuItem {
packages/ng-core/src/api/types.ts: export interface UTooltipOptions {
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Shared API types is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files beside the sources under packages/ng-core/src exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-core.json --out docs/inventory/angular-core (run twice; authored README SHA-256 checked before and after)",
    "revision": "b9051a6668bf08b91654c23925a41cdcd9b84119",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 60 source files accounted for, 33 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
