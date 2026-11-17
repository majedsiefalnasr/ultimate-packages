# Theme contract and Aura — ticket #151

This is a bounded, source-backed inventory of `@ultimate/themes`: the framework-neutral theme contract (token types, mode and direction), `applyUltimateTheme`, and the public Aura preset with its imported and registered token constituents. It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `bced8db5905c1e1f38463c585063e110a93624ca`; the structured input and generated views account for 93 source files under `packages/themes/src`, 10 named root export identities and 6 records. `packages/themes/test` (27 files) lies outside the inventoried roots. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/theme-contract.json).

## Package availability

The package declares a single `"."` export (types, import and default point at `./dist/index.*`) built by tsup from `src/index.ts`. There are no subpaths and the manifest sets `sideEffects: false`. The barrel record `themes.root` owns no export identities and is `internal`. Installed or published package resolution was not exercised.

## Interface summary

- Contract (`themes.contract`): `ColorScale`, `PrimitiveTokens`, `SemanticColorScheme<T>`, `SemanticTokens<T>`, `ComponentTokens<T>`, `UltimateThemeMode`, `UltimateThemeDirection`. Types only; no runtime behavior.
- Application (`themes.apply`): `applyUltimateTheme(options?: ApplyUltimateThemeOptions): void` and `ApplyUltimateThemeOptions { preset?, darkModeSelector?, cssLayer? }`. Defaults: `auraPreset`, `"system"`, `false`. Calls `Theme.setTheme({ preset, options: { prefix: "u", darkModeSelector, cssLayer } })` from `@ultimate/uix-styled`.
- Preset (`themes.aura`): `auraPreset`, built with `definePreset({ primitive, semantic, components })` registering 79 component modules under lower-case keys.
- Constituents, attributed and not separately public: `themes.aura-base` (`primitive`, `semantic`) and `themes.aura-components` (79 modules). Their constants and token interfaces are not importable from the package root.

## Source observations retained without repair

- The CSS variable prefix is fixed to `"u"`; it cannot be configured through `applyUltimateTheme`.
- `preset` is typed `Record<string, unknown>`, so custom presets are not type-checked against the contract types.
- `UltimateThemeMode` includes `string`, so the union accepts any string and gives no compile-time narrowing.
- `UltimateThemeDirection` is a documentation type only; there is no runtime direction mechanism in this package.
- 25 component modules import contract types; the others declare module-local shapes, and `progress-spinner`, `select-button` and `skeleton` export no interface.

## Relationships

Cross-scope relationships to `@ultimate/uix-styled` (`Theme`, `definePreset`, configuration; #145) are recorded in the pending ledger because the pilot resolves references within one input. Prime-related source comments (upstream provenance of the Aura port) are neutral references only.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/theme-contract.json --out docs/inventory/theme-contract`.
- Product behavior and type tests were not run, per the documentation-only scope. Test files exist under `packages/themes/test`, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
