# applyUltimateTheme

ID: themes.apply

Framework: shared; availability: public

## Authored interpretation

Framework-agnostic entry point that configures the shared uix-styled Theme singleton with a preset, a dark-mode selector and CSS-layer options.

## Framework surface

See [authored signatures and interpretation](README.md). Root exports the function applyUltimateTheme(options?: ApplyUltimateThemeOptions): void and the interface ApplyUltimateThemeOptions { preset?: Record<string, unknown>; darkModeSelector?: UltimateThemeMode; cssLayer?: boolean | { name?: string; order?: string } }. Defaults: preset auraPreset, darkModeSelector "system", cssLayer false. It calls Theme.setTheme with a fixed options.prefix of "u"; the prefix is not configurable.

## Public exports

@ultimate/themes#applyUltimateTheme
@ultimate/themes#ApplyUltimateThemeOptions

## Owned source and evidence

packages/themes/src/apply-theme.ts

```text
packages/themes/src/apply-theme.ts: export function applyUltimateTheme(options: ApplyUltimateThemeOptions = {}): void {
packages/themes/src/apply-theme.ts: export interface ApplyUltimateThemeOptions {
packages/themes/src/apply-theme.ts: prefix: "u",
packages/themes/src/apply-theme.ts: Theme.setTheme({
```

## Relationships

themes.aura
themes.contract
package.ultimate.uix-styled.service (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for applyUltimateTheme is present; this record describes the current source without asserting framework parity."
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
