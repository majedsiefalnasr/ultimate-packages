# Vue core — ticket #150

This is a bounded, source-backed inventory of `@ultimate/vue-core`: the Vue foundation layer (component, editable and input base factories, `createDirective`, escape and display-order mixins, focus-trap directive, icons, motion transition hooks, portal, scroll lock, confirmation, dialog and toast services, styling and z-index). It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `c6edfa7cf08c553b13a4f0ca486adc6fca4b6a89`; the structured input and generated views account for 34 source files under `packages/vue-core/src`, 47 named root export identities and 12 records. Spec files (20) beside the sources are explicit dispositions; `packages/vue-core/test` lies outside the inventoried roots. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/vue-core.json).

## Package availability

The package declares a single `"."` export (types, import and default point at `./dist/index.*`) built by tsup from `src/index.ts`, which star re-exports eleven modules; the inventory tool follows them. There are no subpaths and the manifest sets `sideEffects: true`. The barrel record `vuecore.root` owns no export identities and is `internal`. Installed or published package resolution was not exercised.

## Interface summary

- Bases (Options API): `createBaseComponent` (`cx` method, style registration on mount), `createBaseEditableHolder` (`modelValue`, `defaultValue`, `update:modelValue`, `value-change`, `controlled`, `filled`), `createBaseInput` (`size`, `fluid`, `variant`, injected `pcFluid`).
- Directives: `createDirective` and `focusTrapDirective` (hidden sentinels, `MutationObserver`, per-element `WeakMap` state).
- Escape and ordering: `createGlobalEscapeKeyMixin`, `createDisplayOrderMixin`, `useDisplayOrder`.
- Overlay and layering: `Portal` (`UPortal`, Teleport, defaults to `body`), `useScrollLock`, `useZIndex` with `Z_INDEX_KEYS`, `createMotionTransitionHooks`.
- Services: `UConfirmationService`, `UDialogService`, `UToastService` plugins with injection keys and event buses; no renderer ships in this package.
- Icons: `SpinnerIcon`, `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `CheckIcon`, `MinusIcon`, `IconProps`.
- Styling: `vueCoreStyleSheet` (SSR-guarded) and `registerComponentStyle`.

## Source observations retained without repair

- Service option types (`ConfirmationOptions`, `ToastMessageOptions`) are open index signatures, so their fields are not typed.
- `createDisplayOrderMixin` keeps its `uid` and registration flag in the factory closure, so one mixin instance shared by several component instances shares that state.
- `createMotionTransitionHooks` resolves `done` from the motion promise without a rejection handler.

## Relationships

Cross-scope relationships (`uix-utils` class names, event bus, escape, DOM, scroll lock and z-index from #143/#144, `uix-styled` from #145, `uix-motion` from #147) are recorded in the pending ledger because the pilot resolves references within one input. Prime-related source comments, where present, are neutral references only.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-core.json --out docs/inventory/vue-core`.
- Product behavior and type tests were not run, per the documentation-only scope. Spec files exist beside the sources, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
