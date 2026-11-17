# Themes entry

ID: themes.root

Framework: shared; availability: internal

## Authored interpretation

The package entry barrel that selects which theme contract, preset and application function are public.

## Framework surface

See [authored signatures and interpretation](README.md). src/index.ts re-exports the whole contract barrel, the single named value auraPreset from presets/aura, and applyUltimateTheme plus the type ApplyUltimateThemeOptions from apply-theme. Availability is internal because the barrel owns no export identities; the identities it forwards are attributed to the contract, apply and aura records.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/themes/src/index.ts

```text
packages/themes/src/index.ts: export * from "./contract";
packages/themes/src/index.ts: export { auraPreset } from "./presets/aura";
packages/themes/src/index.ts: export { applyUltimateTheme, type ApplyUltimateThemeOptions } from "./apply-theme";
```

## Relationships

themes.contract
themes.apply
themes.aura

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Themes entry is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior and type tests were not run for this documentation-only inventory; no product source was changed. Test files under packages/themes/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/theme-contract.json --out docs/inventory/theme-contract (run twice; authored README SHA-256 checked before and after)",
    "revision": "bced8db5905c1e1f38463c585063e110a93624ca",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 93 source files accounted for, 10 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/theme-contract/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
