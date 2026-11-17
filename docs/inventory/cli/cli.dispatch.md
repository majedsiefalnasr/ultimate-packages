# Command dispatch

ID: cli.dispatch

Framework: shared; availability: internal

## Authored interpretation

Top-level routing of the first argument to the six known commands, with global and per-command help handling and usage refusals.

## Framework surface

See [authored signatures and interpretation](README.md). src/cli.ts exports `runCli(argv: string[], projectDir: string = process.cwd()): Promise<number>`. It routes init, add, theme, doctor, generate and ai; prints usage and returns 1 for no command or an unknown command; prints help and returns 0 for `--help` or `-h` globally or directly after a known command; add, theme and generate return 1 when their positional argument is missing. Only positional arguments are parsed; there is no flag library. Exported from source but not from the package root.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/cli/src/cli.ts

```text
packages/cli/src/cli.ts: export async function runCli(argv: string[], projectDir: string = process.cwd()): Promise<number> {
packages/cli/src/cli.ts: case "ai": {
```

## Relationships

cli.help
cli.init
cli.add
cli.theme
cli.doctor
cli.generate
cli.ai

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Command dispatch is present; this record describes the current source without asserting framework parity."
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
