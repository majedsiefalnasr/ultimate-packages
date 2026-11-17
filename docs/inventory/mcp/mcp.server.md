# MCP server factory

ID: mcp.server

Framework: shared; availability: public

## Authored interpretation

Constructs the McpServer and registers the five tools with their zod input schemas, wrapping every handler so results and errors share one response shape.

## Framework surface

See [authored signatures and interpretation](README.md). `createMcpServer(): McpServer` creates a server named @ultimate/mcp with the hard-coded version 0.1.0 and registers search_components, get_component, get_component_api, get_component_accessibility and check_framework_compatibility. Framework arguments use the vocabulary ng, react, vue for the four component tools and angular, react, vue for check_framework_compatibility. A result object carrying a `code` field becomes an isError response with {code, message}; any thrown exception is logged to stderr and replaced by a generic internal_error. Responses are JSON text content.

## Public exports

@ultimate/mcp#createMcpServer

## Owned source and evidence

packages/mcp/src/server.ts

```text
packages/mcp/src/server.ts: export function createMcpServer(): McpServer {
packages/mcp/src/server.ts: const FRAMEWORK_ENUM_ANGULAR = z.enum(["angular", "react", "vue"]);
```

## Relationships

mcp.errors
mcp.tool-search-components
mcp.tool-get-component
mcp.tool-get-component-api
mcp.tool-get-component-accessibility
mcp.tool-check-framework-compatibility

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for MCP server factory is present; this record describes the current source without asserting framework parity."
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
