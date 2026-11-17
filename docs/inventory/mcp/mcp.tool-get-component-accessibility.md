# get_component_accessibility tool

ID: mcp.tool-get-component-accessibility

Framework: shared; availability: public

## Authored interpretation

Returns a component's recorded accessibility facts, or an explicit not-recorded error.

## Framework surface

See [authored signatures and interpretation](README.md). `getComponentAccessibility(input: GetComponentAccessibilityInput): GetComponentAccessibilityResult | McpToolError` with input {name: string} and result AccessibilityFacts. When the optional accessibility facet is absent it returns facet_not_recorded. In the current source only the Table record under packages/component-metadata/src/records declares an accessibility facet, so the other seven components return that error.

## Public exports

@ultimate/mcp#getComponentAccessibility
@ultimate/mcp#GetComponentAccessibilityInput
@ultimate/mcp#GetComponentAccessibilityResult

## Owned source and evidence

packages/mcp/src/tools/get-component-accessibility.ts

```text
packages/mcp/src/tools/get-component-accessibility.ts: export function getComponentAccessibility(
packages/mcp/src/tools/get-component-accessibility.ts: return absentFacetError("accessibility");
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
    "behavior": "Source implementation for get_component_accessibility tool is present; this record describes the current source without asserting framework parity."
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
