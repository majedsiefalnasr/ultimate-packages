# Component schema entry

ID: schema.root

Framework: shared; availability: internal

## Authored interpretation

The package entry barrel that selects the public schema constants, types, version helper and validator.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts re-exports SCHEMA_VERSION, eleven types, nextMetadataVersion, validateComponentMetadata and ValidationResult. Availability is internal because the barrel owns no export identities; they are attributed to the version, contract and validator records.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/component-schema/src/index.ts

```text
packages/component-schema/src/index.ts: export { SCHEMA_VERSION } from "./version";
packages/component-schema/src/index.ts: export { validateComponentMetadata } from "./validate";
```

## Relationships

schema.version
schema.contract
schema.validate

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Component schema entry is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/component-schema/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/component-schema.json --out docs/inventory/component-schema (run twice; authored README SHA-256 checked before and after)",
    "revision": "0fa34369fc5b6f0a424f932d91ef6b560a294236",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 12 source files accounted for, 15 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/component-schema/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
