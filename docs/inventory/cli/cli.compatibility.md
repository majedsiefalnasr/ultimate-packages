# Compatibility manifest matching

ID: cli.compatibility

Framework: shared; availability: internal

## Authored interpretation

The caret-range matcher over the compatibility manifest entries and the location of the manifest copy shipped in the package dist.

## Framework surface

See [authored signatures and interpretation](README.md). `matchCompatibility(input: MatchCompatibilityInput, manifest: CompatibilityEntry[]): MatchCompatibilityResult` checks the frameworkVersionRange, ultimateFrameworkPackage.versionRange, uixVersionRange, themeVersionRange, exact metadataSchemaVersion and cliVersionRange axes, skips axes the caller omits, and fails closed on any range grammar other than caret ranges, `||` unions and exact versions. The reserved mcp and aiSkills ranges are never read. `COMPATIBILITY_MANIFEST_PATH` resolves to dist/compatibility-manifest.json under the nearest package.json directory; there is no fallback to docs/. All exports are source-only.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/cli/src/compatibility.ts
packages/cli/src/manifest-path.ts

```text
packages/cli/src/compatibility.ts: export function matchCompatibility(
packages/cli/src/manifest-path.ts: export const COMPATIBILITY_MANIFEST_PATH = join(
```

## Relationships

cli.init
cli.add
cli.theme
cli.doctor

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Compatibility manifest matching is present; this record describes the current source without asserting framework parity."
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
