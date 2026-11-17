# API drift, source mapping and exclusions

ID: metadata.drift

Framework: shared; availability: internal

## Authored interpretation

Tooling that extracts prop and event names from Angular, React and Vue source and compares them with the registry records, with a source map and recorded exclusions.

## Framework surface

See [authored signatures and interpretation](README.md). scripts/check-api-drift.mjs exports FRAMEWORKS, NATIVE_EVENT_PASSTHROUGH, extractApi, extractSources, diffApi, readSourceMap, readExclusions, collectDrift, formatProblem, driftProblems, applyExclusions and runDriftCheck and runs as drift:check when executed directly. scripts/source-map.json maps each of the eight components to its ng, react and vue source files. scripts/drift-exclusions.json lists three deliberate exclusions: Dialog vue event after-hide, Scroller react prop contentTemplate and Table vue event update:selection, each with a rationale and source line range. These helpers are script exports, not package root exports.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/component-metadata/scripts/check-api-drift.mjs
packages/component-metadata/scripts/source-map.json
packages/component-metadata/scripts/drift-exclusions.json

```text
packages/component-metadata/scripts/check-api-drift.mjs: export function runDriftCheck(
packages/component-metadata/scripts/check-api-drift.mjs: export function applyExclusions(
packages/component-metadata/scripts/source-map.json: "Tooltip": {
packages/component-metadata/scripts/drift-exclusions.json: "name": "after-hide"
```

## Relationships

metadata.root
metadata.docs

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for API drift tooling is present; this record describes the current source without asserting framework parity."
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
