# Preset and theme actions

ID: uixstyled.actions

Framework: shared; availability: public

## Authored interpretation

Public functions that define, merge and apply presets, palettes and themes onto the shared Theme configuration.

## Framework surface

See [authored signatures and interpretation](README.md). definePreset<T extends Record<string, unknown>>(...presets: T[]): T deep-merges presets without applying them. usePreset(...presets) deep-merges then calls Theme.setPreset. updatePreset(...presets) merges the current preset with the arguments and applies it. updatePrimaryPalette(palette?) and updateSurfacePalette(palette?) update the semantic primary or surface palette through $t and return the resulting preset. useTheme<T>(theme: T): T replaces the theme without merging presets. All are re-exported from the package root only.

## Public exports

@ultimate/uix-styled#definePreset
@ultimate/uix-styled#updatePreset
@ultimate/uix-styled#updatePrimaryPalette
@ultimate/uix-styled#updateSurfacePalette
@ultimate/uix-styled#usePreset
@ultimate/uix-styled#useTheme

## Owned source and evidence

packages/uix-styled/src/actions/definePreset.ts
packages/uix-styled/src/actions/updatePreset.ts
packages/uix-styled/src/actions/updatePrimaryPalette.ts
packages/uix-styled/src/actions/updateSurfacePalette.ts
packages/uix-styled/src/actions/usePreset.ts
packages/uix-styled/src/actions/useTheme.ts

```text
packages/uix-styled/src/actions/usePreset.ts: Theme.setPreset(newPreset);
packages/uix-styled/src/actions/definePreset.ts: return deepMerge(...presets) as T;
packages/uix-styled/src/index.ts: export { default as useTheme } from "./actions/useTheme";
packages/uix-styled/package.json: "types": "./dist/index.d.mts"
```

## Relationships

uixstyled.config
uixstyled.helpers
package.ultimate.uix-utils.object (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Preset and theme actions is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed. Existing package tests under packages/uix-styled/test exist but their presence is not a passing result."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/styled-runtime.json --out docs/inventory/styled-runtime (run twice; authored README SHA-256 checked before and after)",
    "revision": "b9051a6668bf08b91654c23925a41cdcd9b84119",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 28 source files accounted for, 61 root export identities each attributed to one public record, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/styled-runtime/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
