# React core — ticket #149

This is a bounded, source-backed inventory of `@ultimate/react-core`: the React foundation layer (component base hook, confirmation event bus, escape and display-order hooks, focus trap, lifecycle/event/resize/merge-props hooks, icons, motion hook, portal and overlay listener, scroll lock, styling and z-index). It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `bc2ea64ece059085cc26dbc0e72e983b12f16cd1`; the structured input and generated views account for 37 source files under `packages/react-core/src`, 39 named root export identities and 12 records. Spec files (14) are explicit dispositions. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/react-core.json).

## Package availability

The package declares a single `"."` export built by tsup from `src/index.ts`, which star re-exports eleven modules; the inventory tool follows them. There are no subpaths. The barrel record `reactcore.root` owns no export identities and is `internal`. Installed or published package resolution was not exercised.

## Interface summary

- Base and styling: `useComponentBase` returns a `cx` resolver and `createPassThrough` returns `ptm` and `ptmo` for the `pt` prop; `useComponentStyle` registers theme variables, hidden-accessible, box-model and component CSS once on mount into `reactCoreStyleSheet` (SSR-guarded).
- Hooks: `useMergeProps`, `useMountEffect`, `useUnmountEffect`, `useUpdateEffect`, `usePrevious`, `useEventListener` (returns `[bind, unbind]`), `useResizeListener`.
- Escape and ordering: `ESCAPE_PRIORITIES` (re-exported from `@ultimate/uix-utils/escape`), `useDisplayOrder`, `useGlobalEscapeKey`.
- Overlay: `Portal` (defaults to `document.body`, renders nothing before client mount), `useOverlayListener`; `FocusTrap` component; `useScrollLock`; `useZIndex` with `Z_INDEX_BUCKETS`; `useMotion`.
- Confirmation: `confirmationEventBus`, `confirmDialog`, `confirmPopup`; no renderer is provided in this package.
- Icons: `USpinnerIcon`, `UTimesIcon`, `UWindowMaximizeIcon`, `UWindowMinimizeIcon`, `UCheckIcon`, `IconProps`.

## Source observations retained without repair

- `useMotion` depends only on `visible` and `ready`, so changes to `options` do not re-run the effect.
- `usePrevious` calls `useRef<T>()` without an initial value.
- `useUpdateEffect` takes `deps` as a plain array and does not declare exhaustive dependencies.

## Relationships

Cross-scope relationships (`uix-utils` class names, event bus, escape, DOM, scroll lock and z-index from #143/#144, `uix-styled` from #145, `uix-motion` from #147) are recorded in the pending ledger because the pilot resolves references within one input. Prime-related source comments, where present, are neutral references only.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-core.json --out docs/inventory/react-core`.
- Product behavior and type tests were not run, per the documentation-only scope. Spec files exist beside the sources, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
