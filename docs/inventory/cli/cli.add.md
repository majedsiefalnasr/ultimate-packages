# add command

ID: cli.add

Framework: shared; availability: internal

## Authored interpretation

Runs the same framework and compatibility checks as init, then installs a caller-named package.

## Framework surface

See [authored signatures and interpretation](README.md). `runAdd(projectDir: string, packageName: string): Promise<AddResult>`. The package name is installed verbatim; there is no check that it is an Ultimate package, and the compatibility check does not depend on it. The install exit code is passed through.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/cli/src/commands/add.ts

```text
packages/cli/src/commands/add.ts: export async function runAdd(projectDir: string, packageName: string): Promise<AddResult> {
```

## Relationships

cli.detection
cli.compatibility
cli.install
cli.dispatch

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for add command is present; this record describes the current source without asserting framework parity."
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
