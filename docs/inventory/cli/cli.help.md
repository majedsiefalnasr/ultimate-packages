# Help and exit-code tables

ID: cli.help

Framework: shared; availability: internal

## Authored interpretation

Static command usage text, exit-code tables and the help renderer shared by the dispatcher and the README.

## Framework surface

See [authored signatures and interpretation](README.md). src/help.ts exports KNOWN_COMMANDS (init, add, theme, doctor, generate, ai), KnownCommand, ExitCodeRow, CommandUsage, EXIT_CODES, COMMAND_USAGE and `renderHelp(command?: string): string`. It lists `create` (EX-1, not implemented) and `ai` (EX-2, stub) as documented exceptions. Exported from source but not from the package root.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/cli/src/help.ts

```text
packages/cli/src/help.ts: export const KNOWN_COMMANDS = ["init", "add", "theme", "doctor", "generate", "ai"] as const;
packages/cli/src/help.ts: EX-1: not implemented
```

## Relationships

cli.dispatch

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Help and exit-code tables is present; this record describes the current source without asserting framework parity."
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
