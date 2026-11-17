# MCP tool error contract

ID: mcp.errors

Framework: shared; availability: public

## Authored interpretation

The shared five-case error taxonomy and constructors used by every tool.

## Framework surface

See [authored signatures and interpretation](README.md). `McpToolError { code: invalid_input | not_found | manifest_unreadable | facet_not_recorded | internal_error; message }` and `invalidInputError(field, reason)`, `notFoundError(name, knownNames)`, `manifestUnreadableError(_detail)`, `absentFacetError(facetName)` and `internalError()`. manifestUnreadableError ignores its detail so no filesystem path reaches the response; internalError takes no arguments.

## Public exports

@ultimate/mcp#McpToolError
@ultimate/mcp#invalidInputError
@ultimate/mcp#notFoundError
@ultimate/mcp#manifestUnreadableError
@ultimate/mcp#absentFacetError
@ultimate/mcp#internalError

## Owned source and evidence

packages/mcp/src/errors.ts

```text
packages/mcp/src/errors.ts: export function internalError(): McpToolError {
packages/mcp/src/errors.ts: export interface McpToolError {
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for MCP tool error contract is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/mcp/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck, product tests and the installed-package smoke step are skipped for docs-only changes. The MCP boundary validation step has no docs-only condition in the workflow, but it was not executed for this inventory, so no result is claimed.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/mcp.json --out docs/inventory/mcp (run twice; authored README SHA-256 checked before and after)",
    "revision": "642e7e27996c29dc6cca009f93a84e76ee74c9b8",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 12 source files accounted for, 24 root export identities attributed to public records, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution, stdio server execution and product behavior are not asserted.",
    "run": "docs/inventory/mcp/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
