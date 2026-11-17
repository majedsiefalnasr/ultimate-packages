# Schema version and metadata version helper

ID: schema.version

Framework: shared; availability: public

## Authored interpretation

The schema version constant and the helper that computes the next per-record metadataVersion.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports SCHEMA_VERSION (string constant "1.0.0") and nextMetadataVersion(current: ComponentMetadata, next: Omit<ComponentMetadata, "metadataVersion">): number. The helper compares every field except metadataVersion and schemaVersion via JSON.stringify and returns current.metadataVersion + 1 on a change, otherwise the unchanged value; key order therefore affects the comparison.

## Public exports

@ultimate/component-schema#SCHEMA_VERSION
@ultimate/component-schema#nextMetadataVersion

## Owned source and evidence

packages/component-schema/src/version.ts
packages/component-schema/src/metadata-version.ts

```text
packages/component-schema/src/version.ts: export const SCHEMA_VERSION = "1.0.0";
packages/component-schema/src/metadata-version.ts: export function nextMetadataVersion(
packages/component-schema/src/metadata-version.ts: JSON.stringify(currentContent) !== JSON.stringify(nextContent)
```

## Relationships

schema.contract
schema.validate

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Schema version and helper is present; this record describes the current source without asserting framework parity."
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
