# Toast service

ID: ngcore.toast-service

Framework: angular; availability: public

## Authored interpretation

Service that publishes toast messages and clear requests.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports UToastService (add, addAll, clear) and the UToastMessageOptions type.

## Public exports

@ultimate/ng-core#UToastService
@ultimate/ng-core#UToastMessageOptions

## Owned source and evidence

packages/ng-core/src/toast-service/index.ts
packages/ng-core/src/toast-service/toast-service.ts

```text
packages/ng-core/src/toast-service/toast-service.ts: export class UToastService {
packages/ng-core/src/toast-service/toast-service.ts: export interface UToastMessageOptions {
```

## Relationships

package.ultimate.ng.toast (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Toast service is present; this record describes the current source without asserting framework parity."
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
    "revision": "2b9a684df33d0e7dc1e2120eb6ca981fd2865932",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 60 source files accounted for, 33 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
