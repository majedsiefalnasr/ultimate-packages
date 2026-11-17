# Coverage tooling

ID: metadata.coverage

Framework: shared; availability: internal

## Authored interpretation

Tooling that reports which shipped framework components lack a metadata record, skill or stories.

## Framework surface

See [authored signatures and interpretation](README.md). scripts/coverage-report.mjs exports FRAMEWORKS, NON_COMPONENT_SUBPATHS, normalizeName, shippedComponents, unlistedDirs, coverageReport, parseArgs, exitCodeFor, readRepositoryInputs and runCoverageReport and runs as coverage:report when executed directly. It reads framework package exports and the repository layout, not only the registry.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/component-metadata/scripts/coverage-report.mjs

```text
packages/component-metadata/scripts/coverage-report.mjs: export function coverageReport(
packages/component-metadata/scripts/coverage-report.mjs: export const NON_COMPONENT_SUBPATHS
```

## Relationships

metadata.root

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Coverage tooling is present; this record describes the current source without asserting framework parity."
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
