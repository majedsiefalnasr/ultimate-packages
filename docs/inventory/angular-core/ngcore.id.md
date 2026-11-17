# Component id generator

ID: ngcore.id

Framework: angular; availability: public

## Authored interpretation

Injectable that yields incrementing prefixed ids for component elements.

## Framework surface

See [authored signatures and interpretation](README.md). Root export ComponentIdGenerator; @Injectable() without providedIn, so consumers must provide it. next(prefix) returns prefix_N. id/ has no index file; the root barrel re-exports the file directly.

## Public exports

@ultimate/ng-core#ComponentIdGenerator

## Owned source and evidence

packages/ng-core/src/id/component-id-generator.ts

```text
packages/ng-core/src/id/component-id-generator.ts: export class ComponentIdGenerator {
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Component id generator is present; this record describes the current source without asserting framework parity."
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
    "revision": "5a49a62b07259a6033e13fb52a4bb39869a389ed",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 38 source files accounted for, 26 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
