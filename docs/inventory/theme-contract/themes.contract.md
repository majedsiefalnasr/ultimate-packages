# Theme contract, mode and direction

ID: themes.contract

Framework: shared; availability: public

## Authored interpretation

TypeScript-only description of the theme token shapes (primitive, semantic, component) and the supported mode and direction values; carries no runtime behavior.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports the types ColorScale, PrimitiveTokens, SemanticColorScheme, SemanticTokens, ComponentTokens, UltimateThemeMode and UltimateThemeDirection. UltimateThemeMode is "system" | "light" | "dark" | string, so it accepts any string; UltimateThemeDirection is "ltr" | "rtl" and is a documentation type, not a runtime mechanism. The barrel src/contract/index.ts re-exports tokens, mode and direction.

## Public exports

@ultimate/themes#ColorScale
@ultimate/themes#PrimitiveTokens
@ultimate/themes#SemanticColorScheme
@ultimate/themes#SemanticTokens
@ultimate/themes#ComponentTokens
@ultimate/themes#UltimateThemeMode
@ultimate/themes#UltimateThemeDirection

## Owned source and evidence

packages/themes/src/contract/index.ts
packages/themes/src/contract/tokens.ts
packages/themes/src/contract/mode.ts
packages/themes/src/contract/direction.ts

```text
packages/themes/src/contract/tokens.ts: export type ColorScale = {
packages/themes/src/contract/tokens.ts: export interface PrimitiveTokens {
packages/themes/src/contract/tokens.ts: export interface SemanticColorScheme<T = Record<string, unknown>> {
packages/themes/src/contract/tokens.ts: export interface SemanticTokens<T = Record<string, unknown>> {
packages/themes/src/contract/tokens.ts: export interface ComponentTokens<T = Record<string, unknown>> {
packages/themes/src/contract/mode.ts: export type UltimateThemeMode = "system" | "light" | "dark" | string;
packages/themes/src/contract/direction.ts: export type UltimateThemeDirection = "ltr" | "rtl";
```

## Relationships

themes.aura-base
themes.aura-components
package.ultimate.uix-styled.config (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Theme contract, mode and direction is present; this record describes the current source without asserting framework parity."
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
