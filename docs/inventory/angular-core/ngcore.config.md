# Ultimate configuration service

ID: ngcore.config

Framework: angular; availability: public

## Authored interpretation

Root-provided configuration holder with global unstyled and ripple signals.

## Framework surface

See [authored signatures and interpretation](README.md). Root export UltimateConfig, providedIn root, with unstyled defaulting to false and ripple defaulting to true.

## Public exports

@ultimate/ng-core#UltimateConfig

## Owned source and evidence

packages/ng-core/src/config/index.ts
packages/ng-core/src/config/ultimate-config.ts

```text
packages/ng-core/src/config/ultimate-config.ts: export class UltimateConfig {
packages/ng-core/src/config/index.ts: export { UltimateConfig } from "./ultimate-config";
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Ultimate configuration service is present; this record describes the current source without asserting framework parity."
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
    "revision": "e3b55c7a5ab74af66f3cf5e7ef14898a5a5a3ac7",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 60 source files accounted for, 33 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
