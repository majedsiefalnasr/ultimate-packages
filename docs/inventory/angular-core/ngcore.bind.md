# Bind directive

ID: ngcore.bind

Framework: angular; availability: public

## Authored interpretation

Attribute directive that applies a map of attributes, classes, styles and event listeners to its host element.

## Framework surface

See [authored signatures and interpretation](README.md). Root export UBind, selector [uBind] with an input of the same name. Event listeners are registered once per event name and null attributes are removed.

## Public exports

@ultimate/ng-core#UBind

## Owned source and evidence

packages/ng-core/src/bind/index.ts
packages/ng-core/src/bind/bind.ts

```text
packages/ng-core/src/bind/bind.ts: selector: "[uBind]",
packages/ng-core/src/bind/index.ts: export { UBind } from "./bind";
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Bind directive is present; this record describes the current source without asserting framework parity."
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
    "revision": "38d2616779a7a2f65c765724d7760d4532fbbdd2",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 38 source files accounted for, 26 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/angular-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
