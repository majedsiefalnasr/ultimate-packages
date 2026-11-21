# Data and motion primitives — ticket #147

This is a bounded, source-backed inventory of `@ultimate/uix-data` (neutral identity, selection, sort, filter, pagination and virtualization contracts and functions) and `@ultimate/uix-motion` (motion configuration, utilities and types). It describes current source and package configuration only. It makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `75271f0ae536520ff9179f33b4309e7950b7aab4`; the structured input and generated views account for 11 source files under the two `src` directories (test files are outside the inventoried roots), 34 named root export identities and 11 records. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/data-motion-primitives.json).

## Package availability

Both packages declare a single `"."` export and build one tsup entry, `src/index.ts`; there are no subpaths. Both depend on `@ultimate/uix-utils`. The Angular, React and Vue component packages declare workspace dependencies on both; the React and Vue cores depend on `uix-motion`. Installed or published package resolution was not exercised.

The two package barrels differ in shape: `uix-data` uses explicit named re-exports only, while `uix-motion` uses three relative star re-exports (`./config`, `./utils`, `./types`), which the inventory tool follows. The barrel records (`uixdata.root`, `uixmotion.root`) own no export identities and are therefore recorded as `internal`; the public identities they forward are attributed to the module records that define them.

## Type contracts versus runtime functions

- `uix-data` types (no runtime value): `SelectionMode`, `SortMeta`, `SortMode`, `FilterMatchMode`, `FilterMetadata`, `PaginationState`.
- `uix-data` runtime: `equals` (re-exported from `@ultimate/uix-utils/object`), `getPageCount`, `calculateNumItemsInViewport`, `calculateLast`.
- `uix-motion` types: `MotionType`, `MotionPhase`, `MotionStage`, `MotionDuration`, `ClassNameOptions`, `MotionClassNames`, `MotionMetadata`, `MotionEvent`, `MotionHooks`, `MotionHooksWithPhase`, `MotionClassNamesWithPhase`, `MotionOptions`, `MotionInstance`.
- `uix-motion` runtime: `DEFAULT_MOTION_OPTIONS`, `createMotion`, `ANIMATION`, `TRANSITION`, `shouldSkipMotion`, `mergeOptions`, `resolveClassNames`, `getMotionHooks`, `getMotionMetadata`, `resolveDuration`, `setAutoDimensionVariables`.

## Data details

`getPageCount(totalRecords, rows)` returns `Math.ceil(totalRecords / rows)` when `rows > 0`, otherwise `0`. `calculateNumItemsInViewport(contentSize, itemSize)` is a zero-guarded ceil division. `calculateLast(first, numItemsInViewport, numToleratedItems, isColumns?)` declares `isColumns` but does not use it; callers must clamp the result against their own collection length. No sort comparator, filter function or selection storage exists in the package; `FilterMetadata` models only the simple value/matchMode form and source comments defer the operator/constraints variant. `PaginationState.rowsPerPageOptions` is pass-through that no function reads. Source comments mention other Prime libraries as verification context; they are retained as source comments only and no parity judgment is made.

## Motion details

`DEFAULT_MOTION_OPTIONS` sets `name: "u"` (changed from upstream's `p` in ticket #177, F13; the default classes are `u-enter-*` and `u-leave-*`, and the Dialog and Menu call sites pass their own `u-dialog` or `u-menu` name), `safe`, `enter`, `leave` and `autoHeight` to true, and `disabled` and `autoWidth` to false. `createMotion(element, options?)` throws when the element is missing or when both enter and leave are false. `shouldSkipMotion` consults `isPrefersReducedMotion` from `@ultimate/uix-utils`; `getMotionMetadata` reads `window.getComputedStyle`, so these helpers need a DOM. No package-wide SSR guarantee is claimed.

## Relationships

Cross-scope relationships (`uix-utils` object and DOM utilities from #143/#144, the React and Vue cores #149 and #150) are recorded in the pending ledger because the pilot resolves references within one input.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/data-motion-primitives.json --out docs/inventory/data-motion-primitives`.
- Product behavior and type tests were not run, per the documentation-only scope. Test files exist under `packages/uix-data/test` and `packages/uix-motion/test`, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
