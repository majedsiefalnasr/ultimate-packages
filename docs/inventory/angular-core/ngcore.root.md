# Angular core entry

ID: ngcore.root

Framework: angular; availability: internal

## Authored interpretation

The package entry barrel that selects which core primitives are public.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts star re-exports fifteen modules (basecomponent, base-editable-holder, base-input, overlay, focus-trap, config, bind, icons, api, id/component-id-generator, model-holder, confirmation, dialog-service, terminal-service, toast-service). packages/ng-core/package.json has no exports map and points main and module at the ng-packagr bundle. Availability is recorded as internal because this barrel owns no export identities of its own; the identities it forwards are attributed to the module records that define them.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/ng-core/src/index.ts

```text
packages/ng-core/src/index.ts: export * from "./basecomponent";
packages/ng-core/src/index.ts: export * from "./toast-service";
```

## Relationships

ngcore.basecomponent
ngcore.model-holder
ngcore.base-editable-holder
ngcore.base-input
ngcore.overlay
ngcore.focus-trap
ngcore.config
ngcore.bind
ngcore.icons
ngcore.api
ngcore.id
ngcore.confirmation
ngcore.dialog-service
ngcore.terminal-service
ngcore.toast-service

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Angular core entry is present; this record describes the current source without asserting framework parity."
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
