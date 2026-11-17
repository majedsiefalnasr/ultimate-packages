# check_framework_compatibility tool

ID: mcp.tool-check-framework-compatibility

Framework: shared; availability: public

## Authored interpretation

A single-axis check of a caller-supplied framework version against the manifest's frameworkVersionRange; not a full multi-axis compatibility verdict.

## Framework surface

See [authored signatures and interpretation](README.md). `checkFrameworkCompatibility(input: CheckFrameworkCompatibilityInput): CheckFrameworkCompatibilityResult | McpToolError` with input {framework: angular | react | vue; frameworkVersion: string} and result {compatible: boolean; reason?: string}. It evaluates only frameworkVersionRange with a private caret, `||` and exact range matcher that duplicates, rather than imports, the CLI matcher; unsupported grammar fails closed. It makes no claim about the Ultimate framework package, UIX, theme, schema or CLI version axes. Note the vocabulary difference: this tool takes `angular`, while the other four tools take `ng`.

## Public exports

@ultimate/mcp#checkFrameworkCompatibility
@ultimate/mcp#CheckFrameworkCompatibilityInput
@ultimate/mcp#CheckFrameworkCompatibilityResult

## Owned source and evidence

packages/mcp/src/tools/check-framework-compatibility.ts

```text
packages/mcp/src/tools/check-framework-compatibility.ts: export function checkFrameworkCompatibility(
packages/mcp/src/tools/check-framework-compatibility.ts: not imported from @ultimate/cli
```

## Relationships

mcp.errors
mcp.manifest
mcp.server

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for check_framework_compatibility tool is present; this record describes the current source without asserting framework parity."
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
