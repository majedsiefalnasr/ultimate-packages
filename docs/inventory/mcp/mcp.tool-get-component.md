# get_component tool

ID: mcp.tool-get-component

Framework: shared; availability: public

## Authored interpretation

Returns a component's metadata record, optionally narrowed to one framework's package and api entries.

## Framework surface

See [authored signatures and interpretation](README.md). `getComponent(input: GetComponentInput): GetComponentResult | McpToolError` with input {name: string; framework?: ng | react | vue} and result ComponentMetadata. Without a framework the record is returned unmodified; with one, framework-neutral facets are kept and packages and api are narrowed to that framework, omitting api when absent. Unknown names return not_found listing the known components.

## Public exports

@ultimate/mcp#getComponent
@ultimate/mcp#GetComponentInput
@ultimate/mcp#GetComponentResult

## Owned source and evidence

packages/mcp/src/tools/get-component.ts

```text
packages/mcp/src/tools/get-component.ts: export function getComponent(input: GetComponentInput): GetComponentResult | McpToolError {
packages/mcp/src/tools/get-component.ts: const narrowedApi = component.api?.[input.framework];
```

## Relationships

mcp.errors
mcp.server
package.ultimate.component-metadata.root (pending cross-batch)
package.ultimate.component-schema.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for get_component tool is present; this record describes the current source without asserting framework parity."
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
