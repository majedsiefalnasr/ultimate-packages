# MCP package entry

ID: mcp.root

Framework: shared; availability: internal

## Authored interpretation

The package root barrel that selects the public server factory, five tool functions with their types, the manifest reader and the error constructors.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts re-exports 24 identities: createMcpServer; searchComponents, getComponentApi, getComponent, getComponentAccessibility and checkFrameworkCompatibility with their Input and Result types; readCompatibilityManifest and CompatibilityManifestEntry; the McpToolError type and the five error constructors. Availability is internal because the barrel owns no export identities; they are attributed to the records that implement them.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/mcp/src/index.ts

```text
packages/mcp/src/index.ts: export { createMcpServer } from "./server";
packages/mcp/src/index.ts:   internalError,
```

## Relationships

mcp.server
mcp.tool-search-components
mcp.tool-get-component
mcp.tool-get-component-api
mcp.tool-get-component-accessibility
mcp.tool-check-framework-compatibility
mcp.manifest
mcp.errors

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for MCP package entry is present; this record describes the current source without asserting framework parity."
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
