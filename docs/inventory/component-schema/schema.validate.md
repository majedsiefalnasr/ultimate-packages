# Metadata validator and result type

ID: schema.validate

Framework: shared; availability: public

## Authored interpretation

Runtime validator that establishes whether an unknown value conforms to the v1 ComponentMetadata shape, plus its result union.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports validateComponentMetadata(record: unknown, allRecords: unknown[]): ValidationResult and ValidationResult = { valid: true; record: ComponentMetadata } | { valid: false; errors: string[] }. It rejects unrecognized keys at each level, requires name, category, description and schemaVersion strings and a positive-integer metadataVersion, requires schemaVersion to equal SCHEMA_VERSION exactly, checks packages, api, accessibility, style, relationships and guidance shapes, flags duplicate names and unknown dependsOn targets within allRecords, and for provenanceRef reads docs/architecture/provenance/<package>.json from the repository (path resolved from the module location with node:fs) to check destinations exist.

## Public exports

@ultimate/component-schema#validateComponentMetadata
@ultimate/component-schema#ValidationResult

## Owned source and evidence

packages/component-schema/src/validate.ts

```text
packages/component-schema/src/validate.ts: export function validateComponentMetadata(
packages/component-schema/src/validate.ts: export type ValidationResult =
packages/component-schema/src/validate.ts: import { readFileSync } from "node:fs";
packages/component-schema/src/validate.ts: Duplicate component identity
```

## Relationships

schema.contract
schema.version
package.ultimate.component-metadata.records (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Metadata validator is present; this record describes the current source without asserting framework parity."
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
