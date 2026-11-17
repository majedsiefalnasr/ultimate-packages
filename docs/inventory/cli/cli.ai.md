# ai command stub

ID: cli.ai

Framework: shared; availability: internal

## Authored interpretation

An unconditional stub for the ai command; not an implemented command.

## Framework surface

See [authored signatures and interpretation](README.md). `AI_UNAVAILABLE_MESSAGE` and `runAi(): AiResult`. Every invocation prints `ai: not yet available — Phase 9 (AI Skills) is not started.` to stderr and returns exit code 1. It ignores arguments. The separate AI tooling package is inventoried under #156 and is not invoked by this command.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/cli/src/commands/ai.ts

```text
packages/cli/src/commands/ai.ts: export function runAi(): AiResult {
packages/cli/src/commands/ai.ts: Phase 9 (AI Skills) is not started.
```

## Relationships

cli.dispatch
package.ultimate.ai (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for ai command stub is present; this record describes the current source without asserting framework parity."
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
