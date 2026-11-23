# Shared styles package entry and type

ID: uixstyles.root

Framework: shared; availability: public

## Authored interpretation

The package root barrel and the shared StyleType alias, plus reconciliation of subpath entries against package exports and build configuration.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts re-exports the base module's style as the named root export base and re-exports everything from src/types.ts with a relative star re-export. src/types.ts declares `export type StyleType = string;`, a type contract (no runtime value) redefined locally instead of importing from another package; no module in this package currently imports it. Subpath reconciliation: packages/uix-styles/package.json declares 15 exports (the root plus ./avatar, ./base, ./badge, ./button, ./checkbox, ./dialog, ./floatlabel, ./inputnumber, ./inputtext, ./menu, ./paginator, ./table, ./tooltip, ./virtualscroller). packages/uix-styles/tsup.config.ts builds src/index.ts plus one entry per directory found under src, which yields the same 14 subpath entries by directory discovery. The two sets agree at the inspected revision. The root does not re-export any component style.

## Public exports

@ultimate/uix-styles#StyleType
@ultimate/uix-styles#base

## Owned source and evidence

packages/uix-styles/src/index.ts
packages/uix-styles/src/types.ts

```text
packages/uix-styles/src/index.ts: export { style as base } from "./base";
packages/uix-styles/src/types.ts: export type StyleType = string;
packages/uix-styles/src/../package.json: "./virtualscroller": {
packages/uix-styles/src/../tsup.config.ts: readdirSync
```

## Relationships

uixstyles.base
uixstyles.avatar
uixstyles.badge
uixstyles.button
uixstyles.checkbox
uixstyles.dialog
uixstyles.floatlabel
uixstyles.iconfield
uixstyles.iftalabel
uixstyles.inputgroup
uixstyles.inputnumber
uixstyles.inputtext
uixstyles.menu
uixstyles.paginator
uixstyles.table
uixstyles.tooltip
uixstyles.virtualscroller

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Shared styles package entry and type is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and snapshot tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/uix-styles/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/shared-component-styles.json --out docs/inventory/shared-component-styles (run twice; authored README SHA-256 checked before and after)",
    "revision": "b9051a6668bf08b91654c23925a41cdcd9b84119",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 14 source files, 14 named symbols, 14 root/subpath export identities, 13 records, no problems; the authored README SHA-256 was unchanged. Cross-scope relationships remain in the pending ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/shared-component-styles/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
