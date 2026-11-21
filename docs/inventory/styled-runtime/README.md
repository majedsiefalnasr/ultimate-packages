# Styled runtime — ticket #145

This is a bounded, source-backed inventory of the `@ultimate/uix-styled` runtime: preset and theme actions, the `Theme` configuration singleton, `ThemeService`, token and color helpers, `StyleSheet` with shared style registrations, shared token utilities, and the exported configuration types. It describes current source and package configuration only. It makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `f0b7e867d6edf346284af3400e28e6ec6fbe4500`; the structured input and generated views account for 26 source files under `packages/uix-styled/src` (test files are outside the inventoried root) and 55 named root export identities across 8 records. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/styled-runtime.json).

## Package availability and scope

`packages/uix-styled/package.json` declares a single `"."` export (types `./dist/index.d.mts`, import `./dist/index.mjs`); there are no subpath exports. `packages/uix-styled/tsup.config.ts` builds one entry, `src/index.ts`. Every inventoried symbol is therefore available from the package root only. The package is a workspace dependency of the Angular, React and Vue core and component packages and of `@ultimate/themes`. Installed or published package resolution was not exercised.

`packages/uix-styled/src/index.ts` mixes named re-exports, default-export re-exports (`export { default as X }`) and relative star re-exports (`export * from "./helpers/index"`, `./utils/index`). The inventory tool was extended in this ticket to follow relative star re-exports within the repository so these symbols are discovered rather than omitted; non-relative or namespace star re-exports still fail closed.

## Actions

Source: `packages/uix-styled/src/actions/*.ts`. All are default exports re-exported by name from the root.

- `definePreset<T extends Record<string, unknown>>(...presets: T[]): T` deep-merges presets with `deepMerge` and does not apply them.
- `usePreset<T>(...presets: T[]): T` deep-merges presets and calls `Theme.setPreset`.
- `updatePreset<T>(...presets: T[]): T` merges `Theme.getPreset()` with the arguments and applies the result.
- `updatePrimaryPalette<T, P>(palette?: T): P` and `updateSurfacePalette<T, P>(palette?: T): P` update the semantic palette through `$t(...).update()` and return the resulting preset.
- `useTheme<T>(theme: T): T` applies a theme with `mergePresets: false`.

## Configuration and service

`Theme` (`src/config/index.ts`) is a plain object holding the active theme, preset, options and tokens, defaults, loaded-style bookkeeping, and CSS-producing accessors. Setters emit `ThemeService` events (`theme:change`, `preset:change`, `options:change`, `theme:load`). Many parameters are typed `any`. `ThemeService` (`src/service/index.ts`) is an `EventBus()` instance; its surface is owned by the UIX event bus record in #144.

## Helpers

`$dt`, `dt`, `dtwt`, `css`, `$t`, `toVariables` (default export of `src/helpers/toVariables.ts`, with `toVariableOptions` and `toVariableOutput`), and the color utilities `mix`, `shade`, `tint` and `palette`. `shade` and `tint` delegate to `mix` with black and white. `palette` returns a `ColorScale` (50–950) either from token references or from tint/shade computation, or returns a non-string input unchanged. The upstream-style `t` name is not exported; `$t` is.

## Stylesheet and shared registrations

`StyleSheet<E>` is a keyed style registry whose `createStyleElement` returns `undefined` by default; framework cores override it. `update()` is an empty placeholder in source. `registerThemeVariables`, `registerHiddenAccessible`, `registerIconSpin` and `registerBoxModel` are idempotent through `StyleSheet.has()`. `registerThemeVariables` also registers the preset top-level `css`, when present, under `u-global-style` after the common variables, run through `Theme.transformCSS` (ticket #172, F4). Source comments reference prior project gap identifiers and upstream versions; they are retained as source context only and no parity or equivalence judgment is made.

## Utilities and types

Regular expressions `EXPR_REGEX`, `CALC_REGEX`, `VAR_REGEX` are exported with the global flag, so shared `lastIndex` state is a consumer consideration. Functions `toTokenKey`, `merge`, `toValue`, `toUnit`, `toNormalizePrefix`, `toNormalizeVariable`, `getVariableName`, `hasOddBraces`, `getVariableValue`, `getComputedValue`, `setProperty`, `getRule`, `evaluateDtExpressions` and the `ThemeUtils` object are runtime values. `StyleOptions`, `StyleType`, `ThemeOptions` and `ColorScale` are type contracts declared in `src/index.ts`; `StyleSheetProps` and `StyleMeta` are declared in `src/stylesheet/index.ts`. `ThemeUtils` internals are not individually inventoried.

## Relationships

Cross-scope relationships (`uix-utils` object, event bus, classnames and DOM utilities from #143/#144; `themes` #151; Angular, React and Vue cores #148–#150) are recorded in the pending ledger because the pilot resolves references within one input. Foundation and theme relationships are limited to what source imports and `package.json` dependencies show.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/styled-runtime.json --out docs/inventory/styled-runtime`.
- Product runtime tests were not run, per the documentation-only scope. Test files exist under `packages/uix-styled/test`, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
