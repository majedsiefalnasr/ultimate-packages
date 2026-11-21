# Aura preset

ID: themes.aura

Framework: shared; availability: public

## Authored interpretation

The public Aura-derived preset object built with definePreset from the primitive and semantic base tiers and the registered component token modules.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports the value auraPreset only. src/presets/aura/index.ts builds it with definePreset({ primitive, semantic, css, components }) and registers 79 component modules under lower-case upstream-style keys (for example blockui, cascadeselect, datepicker). The top-level css string comes from src/presets/aura/css.ts (selectors for option rows and menu and table rows with one transition: none declaration; ticket #172, F4). The base tier is attributed to themes.aura-base and the component modules to themes.aura-components; neither is a separate root entry point.

## Public exports

@ultimate/themes#auraPreset

## Owned source and evidence

packages/themes/src/presets/aura/index.ts
packages/themes/src/presets/aura/css.ts

```text
packages/themes/src/presets/aura/index.ts: export const auraPreset = definePreset({
packages/themes/src/presets/aura/index.ts:   primitive,
packages/themes/src/presets/aura/index.ts:   semantic,
packages/themes/src/presets/aura/index.ts:   css,
packages/themes/src/presets/aura/css.ts: export const css = `
packages/themes/src/presets/aura/index.ts:     tooltip,
```

## Relationships

themes.aura-base
themes.aura-components
themes.apply
package.ultimate.uix-styled.helpers (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Aura preset is present; this record describes the current source without asserting framework parity."
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
