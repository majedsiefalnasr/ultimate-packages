# Framework and package-manager detection

ID: cli.detection

Framework: shared; availability: internal

## Authored interpretation

Detection of the target project's framework from package.json and of its package manager from lockfiles.

## Framework surface

See [authored signatures and interpretation](README.md). `detectFramework(projectDir): Framework | null` reads dependencies and devDependencies and returns the first match in the order @angular/core, react, vue, or null when package.json is missing or malformed. `detectPackageManager(projectDir): PackageManager` checks pnpm-lock.yaml, yarn.lock and package-lock.json in that order and defaults to npm. Types Framework and PackageManager are exported from source only.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/cli/src/detect-framework.ts
packages/cli/src/detect-package-manager.ts

```text
packages/cli/src/detect-framework.ts: export function detectFramework(projectDir: string): Framework | null {
packages/cli/src/detect-package-manager.ts: export function detectPackageManager(projectDir: string): PackageManager {
```

## Relationships

cli.install
cli.init

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Framework and package-manager detection is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/cli/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck, product tests and the installed-package smoke step are skipped for docs-only changes. The CLI boundary validation step has no docs-only condition in the workflow, but it was not executed for this inventory, so no result is claimed.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/cli.json --out docs/inventory/cli (run twice; authored README SHA-256 checked before and after)",
    "revision": "bad6cc52abbeaa74c357dfcdc0a5a4338c781a86",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 16 source files accounted for, 0 root export identities (the root barrel is empty), cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution, binary execution and product behavior are not asserted.",
    "run": "docs/inventory/cli/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
