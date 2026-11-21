# Confirmation service

ID: ngcore.confirmation

Framework: angular; availability: public

## Authored interpretation

Service that publishes confirmation requests and close signals for confirmation UI.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports UConfirmationService and the UConfirmation type. The service exposes confirm and close and an observable of confirmation requests.

## Public exports

@ultimate/ng-core#UConfirmationService
@ultimate/ng-core#UConfirmation

## Owned source and evidence

packages/ng-core/src/confirmation/index.ts
packages/ng-core/src/confirmation/confirmation-service.ts
packages/ng-core/src/confirmation/confirmation.ts

```text
packages/ng-core/src/confirmation/confirmation-service.ts: export class UConfirmationService {
packages/ng-core/src/confirmation/confirmation.ts: export interface UConfirmation {
```

## Relationships

package.ultimate.ng.dialog (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Confirmation service is present; this record describes the current source without asserting framework parity."
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
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 40 source files accounted for, 33 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
