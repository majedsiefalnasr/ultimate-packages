# search_components tool

ID: mcp.tool-search-components

Framework: shared; availability: public

## Authored interpretation

Case-insensitive substring search over component name, category and description, optionally limited to components with a package for one framework.

## Framework surface

See [authored signatures and interpretation](README.md). `searchComponents(input: SearchComponentsInput): SearchComponentsResult | McpToolError` with input {query: string; framework?: ng | react | vue} and result {matches: {name, category, description}[]}. Matches keep ALL_COMPONENTS order and are unranked; there is no fuzzy matching. The component set is the metadata registry's eight records.

## Public exports

@ultimate/mcp#searchComponents
@ultimate/mcp#SearchComponentsInput
@ultimate/mcp#SearchComponentsResult

## Owned source and evidence

packages/mcp/src/tools/search-components.ts

```text
packages/mcp/src/tools/search-components.ts: export function searchComponents(
packages/mcp/src/tools/search-components.ts: component.name.toLowerCase().includes(needle)
```

## Relationships

mcp.errors
mcp.server
package.ultimate.component-metadata.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for search_components tool is present; this record describes the current source without asserting framework parity."
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
