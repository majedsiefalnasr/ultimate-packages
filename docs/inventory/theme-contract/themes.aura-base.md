# Aura primitive and semantic base tiers

ID: themes.aura-base

Framework: shared; availability: internal

## Authored interpretation

Constituent data of the Aura preset: the primitive tier (border-radius scale and 22 named color ramps) and the semantic tier (focus ring, primary ramp, form-field, list, content, mask, navigation, overlay and light/dark colorScheme tokens).

## Framework surface

See [authored signatures and interpretation](README.md). Not independently reachable from the package root. base.ts exports the constants primitive: PrimitiveTokens and semantic: SemanticTokens, both consumed only by presets/aura/index.ts. Primitive keys: borderRadius plus 22 color ramps (emerald through stone). Semantic keys: transitionDuration, focusRing, disabledOpacity, iconSize, anchorGutter, primary, formField, list, content, mask, navigation, overlay, colorScheme.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/themes/src/presets/aura/base.ts

```text
packages/themes/src/presets/aura/base.ts: export const primitive: PrimitiveTokens = {
packages/themes/src/presets/aura/base.ts: export const semantic: SemanticTokens = {
packages/themes/src/presets/aura/base.ts: import type { PrimitiveTokens, SemanticTokens } from "../../contract";
```

## Relationships

themes.aura
themes.contract

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Aura base tiers is present; this record describes the current source without asserting framework parity."
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
