# Base directive factory

ID: vuecore.directive

Framework: vue; availability: public

## Authored interpretation

Factory that wraps mounted, updated and unmounted hooks into a Vue object directive with a simplified binding.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports createDirective and the types DirectiveBinding and DirectiveInstanceOptions. The simplified binding exposes value and oldValue only.

## Public exports

@ultimate/vue-core#createDirective
@ultimate/vue-core#DirectiveBinding
@ultimate/vue-core#DirectiveInstanceOptions

## Owned source and evidence

packages/vue-core/src/directive/index.ts
packages/vue-core/src/directive/base-directive.ts

```text
packages/vue-core/src/directive/base-directive.ts: export function createDirective<TValue = unknown>(
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Base directive factory is present; this record describes the current source without asserting framework parity."
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
    "revision": "559f51eb761fb20b6994abde24167c00d86df58e",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 35 source files accounted for, 53 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/vue-core/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
