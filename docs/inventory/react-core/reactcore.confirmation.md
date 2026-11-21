# Confirmation event bus

ID: reactcore.confirmation

Framework: react; availability: public

## Authored interpretation

Event-bus based imperative API for requesting confirm dialogs and confirm popups.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports confirmationEventBus, confirmDialog, confirmPopup and the type UConfirmationOptions. Both functions emit with visible defaulting to true; no renderer is provided here, so a consumer component must subscribe.

## Public exports

@ultimate/react-core#confirmationEventBus
@ultimate/react-core#confirmDialog
@ultimate/react-core#confirmPopup
@ultimate/react-core#UConfirmationOptions

## Owned source and evidence

packages/react-core/src/confirmation/index.ts
packages/react-core/src/confirmation/confirmation-event-bus.ts

```text
packages/react-core/src/confirmation/confirmation-event-bus.ts: export function confirmDialog(options: UConfirmationOptions = {}): void {
packages/react-core/src/confirmation/confirmation-event-bus.ts: export function confirmPopup(options: UConfirmationOptions = {}): void {
```

## Relationships

package.ultimate.uix-utils.eventbus (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Confirmation event bus is present; this record describes the current source without asserting framework parity."
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
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 38 source files accounted for, 46 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/react-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
