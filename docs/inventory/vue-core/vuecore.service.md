# Confirmation, dialog and toast services

ID: vuecore.service

Framework: vue; availability: public

## Authored interpretation

Vue plugins and injection keys that expose event-bus based confirmation, dialog and toast APIs.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports UConfirmationService, UConfirmationServiceKey, confirmationEventBus, ConfirmationOptions, ConfirmationServiceApi, UDialogService, UDialogServiceKey, dialogEventBus, DynamicDialogOptions, DynamicDialogRef, DialogServiceApi, UToastService, UToastServiceKey, toastEventBus, ToastMessageOptions and ToastServiceApi. Each plugin provides its API through app.provide; no renderer ships here, so consumer components must subscribe to the buses. Option types are open index signatures.

## Public exports

@ultimate/vue-core#UConfirmationService
@ultimate/vue-core#UConfirmationServiceKey
@ultimate/vue-core#confirmationEventBus
@ultimate/vue-core#ConfirmationOptions
@ultimate/vue-core#ConfirmationServiceApi
@ultimate/vue-core#UDialogService
@ultimate/vue-core#UDialogServiceKey
@ultimate/vue-core#dialogEventBus
@ultimate/vue-core#DynamicDialogOptions
@ultimate/vue-core#DynamicDialogRef
@ultimate/vue-core#DialogServiceApi
@ultimate/vue-core#UToastService
@ultimate/vue-core#UToastServiceKey
@ultimate/vue-core#toastEventBus
@ultimate/vue-core#ToastMessageOptions
@ultimate/vue-core#ToastServiceApi

## Owned source and evidence

packages/vue-core/src/service/index.ts
packages/vue-core/src/service/confirmation-service.ts
packages/vue-core/src/service/dialog-service.ts
packages/vue-core/src/service/toast-service.ts

```text
packages/vue-core/src/service/confirmation-service.ts: export const UConfirmationService: Plugin = {
packages/vue-core/src/service/dialog-service.ts: export const UDialogService: Plugin = {
packages/vue-core/src/service/toast-service.ts: export const UToastService: Plugin = {
```

## Relationships

package.ultimate.uix-utils.eventbus (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Confirmation, dialog and toast services is present; this record describes the current source without asserting framework parity."
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
    "revision": "b93f4d6708ab4a00da820df86124a4e8a30687b0",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 34 source files accounted for, 47 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
