# Button metadata record

ID: metadata.button

Framework: shared; availability: internal

## Authored interpretation

Populated ComponentMetadata record for Button (category Primitive) with per-framework API facts for Angular, React and Vue, written by hand against the framework sources.

## Framework surface

See [authored signatures and interpretation](README.md). Not exported from the package root; reachable only through ALL_COMPONENTS. packages/component-metadata/src/records/button.ts declares export const BUTTON_METADATA: ComponentMetadata with schemaVersion SCHEMA_VERSION. The record is a hand-maintained description of source, not a superior source of truth; the drift check compares its prop and event names against framework source.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/component-metadata/src/records/button.ts

```text
packages/component-metadata/src/records/button.ts: export const BUTTON_METADATA: ComponentMetadata = {
packages/component-metadata/src/records/button.ts: import { SCHEMA_VERSION } from "@ultimate/component-schema";
```

## Relationships

metadata.root
metadata.drift
package.ultimate.component-schema.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Button metadata record is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/component-metadata/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. The metadata drift check, API docs check and coverage report steps in the same workflow are skipped on that path, so none of them is claimed as exercised.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/metadata-registry.json --out docs/inventory/metadata-registry (run twice; authored README SHA-256 checked before and after)",
    "revision": "e60b2f03cdcfdbd8bf6cdb999a346858ad619718",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 16 source files accounted for, 1 root export identity attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/metadata-registry/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
