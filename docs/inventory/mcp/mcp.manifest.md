# Compatibility manifest reader

ID: mcp.manifest

Framework: shared; availability: public

## Authored interpretation

A minimal independent reader of the compatibility manifest copy shipped in the package dist, plus the module that holds its resolved path.

## Framework surface

See [authored signatures and interpretation](README.md). `readCompatibilityManifest(): CompatibilityManifestEntry[] | McpToolError` and `CompatibilityManifestEntry { framework: angular | react | vue; frameworkVersionRange: string }`. It reads only those two fields, returns manifest_unreadable on read, parse, non-array or malformed-entry failure, and never falls back to an empty result. `COMPATIBILITY_MANIFEST_PATH` in src/manifest-path.ts is source-only and resolves to dist/compatibility-manifest.json under the nearest package.json directory, with no fallback to docs/.

## Public exports

@ultimate/mcp#readCompatibilityManifest
@ultimate/mcp#CompatibilityManifestEntry

## Owned source and evidence

packages/mcp/src/manifest.ts
packages/mcp/src/manifest-path.ts

```text
packages/mcp/src/manifest.ts: export function readCompatibilityManifest(): CompatibilityManifestEntry[] | McpToolError {
packages/mcp/src/manifest-path.ts: export const COMPATIBILITY_MANIFEST_PATH = join(
```

## Relationships

mcp.errors
mcp.tool-check-framework-compatibility

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Compatibility manifest reader is present; this record describes the current source without asserting framework parity."
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
