<!-- Historical pre-normalization lead review 2026-11-18: arithmetic verified row-by-row (NG 0/0/0/0/9/0, React 4/2/3/0/0/0, Vue 4/1/3/0/1/0). No unresolved rows. Source-read only. Agent-9 report below, unchanged. -->

# DeferredContent — final report

Everything is from reading source only: no tests, builds or browser checks, and no product files written. Revision `91a8472547e34c6e92456f2b98270a1555e3a2db`. Counts are in the order C/P/M/I/N/U (complete / partial / missing / intentional / n/a / unresolved).

Path abbreviations:

- `PR` = `.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib`
- `PV` = `.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src`
- `X` = repo `packages/`

`pt` follows D-PT, unstyled/`dt` follows D-SHARED #5, and Vue attribute loss follows D-SHARED #2.

## Mapping

- **React:** `UDeferredContent` (`X/react/src/deferred-content/deferred-content.tsx:28-59`) maps to `PR/deferredcontent/DeferredContent.js:6-68`.
- **Vue:** `UDeferredContent` (`X/vue/src/deferred-content/DeferredContent.vue:1-53`) maps to `PV/deferredcontent/DeferredContent.vue:1-64`.
- **Angular:** PrimeNG 21.1.9 has no DeferredContent. `pDefer` was removed in v20 and there is no `deferredcontent` folder in the pinned source (`docs/prime-reference/components/deferredcontent.md:13`). Ultimate Angular has nothing equivalent, so every Angular row is N.

## Capability matrix (11 rows)

| #   | Capability                               | NG  | React | Vue | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------- | --- | ----- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Wrapper renders children only after load | N   | C     | C   | X React `:54-58`, Vue `:1-5`; PR `:67`; PV `:2-4`                                                                                                                                                                                                                                                                                                                                                                                               |
| 2   | Viewport trigger condition               | N   | P     | P   | X uses `IntersectionObserver` with `isIntersecting` (React `:41-48`, Vue `:41-47`). Prime checks `clientHeight >= rect.top` on mount and on window scroll (PR `:14-23,32-41,53-57`; PV `:22-27,32-58`). They differ for roots already above the viewport (Prime loads them, X does not) and inside nested scrollers (X detects them, Prime does not). The source comments explaining the swap are not an ADR.                                   |
| 3   | One-way load (never unloads)             | N   | C     | C   | X React `:41-46`, Vue `:43-45`; PR `:17-20,43-46`; PV `:33-36,59-61`                                                                                                                                                                                                                                                                                                                                                                            |
| 4   | Load event                               | N   | C     | C   | X React `onLoad` (`:5,44`), Vue `load` (`:33,44`); PR `:43-46`; PV `:59-62`. Prime's mount-path payload is `undefined`.                                                                                                                                                                                                                                                                                                                         |
| 5   | Listener cleanup on unmount              | N   | C     | C   | X React effect cleanup `:50`, Vue `beforeUnmount` `:50-52`; PR `useEventListener` disposes on unmount (`PR/hooks/useEventListener.js:68-70`); PV `:28-30`                                                                                                                                                                                                                                                                                       |
| 6   | Root attribute forwarding                | N   | P     | M   | React accepts only `children`, `onLoad` and `className` (`X/react/...:3-7`), while PR forwards other props (`:59-65`). Vue: X sets `inheritAttrs: false` and binds nothing on its root (`:2,32`); PV rebinds through `ptmi('root')` (`:2,14`). This is a D-SHARED #2 case.                                                                                                                                                                      |
| 7   | Public element handle (`getElement`)     | N   | M     | N   | PR has `useImperativeHandle` (`:48-51`); X React has only an internal ref and no `forwardRef`. PrimeVue documents no method (`deferredcontent.md:45`).                                                                                                                                                                                                                                                                                          |
| 8   | `pt`                                     | N   | M     | M   | No PrimeNG DeferredContent in the pin (no `deferredcontent/` dir under N). PR `:25-30,64` (`ptm('root')`); PV `DeferredContent.vue:2` (`ptmi('root')`). D-PT.                                                                                                                                                                                                                                                                                   |
| 9   | `ptOptions`                              | N   | M     | M   | Same Prime components consume PT, so merge options apply: R `componentbase/ComponentBase.js:420-423` defaults pt/ptOptions/unstyled only (no dt key; `cx` gated by isUnstyled at `:507-513`); VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt. X React `packages/react-core/src/base/component-base.ts` and Vue `packages/vue-core/src/base/base-component.ts:30-42` have no pt/ptOptions/unstyled/dt. D-PT. |
| 10  | Unstyled mode                            | N   | N     | M   | PrimeReact `deferredcontent/DeferredContent.js:25-30,59-67` uses only `ptm` and supplies no generated class or style. `DeferredContentBase.js:3-9` defines no stylesheet. The inherited React flag has no component behavior to suppress. PrimeVue `DeferredContent.vue:8-16` extends BaseComponent and registers DeferredContentStyle; its base gates theme loading. Ultimate Vue has no such registration or override.                        |
| 11  | Per-instance `dt`                        | N   | N     | M   | PrimeReact has no scoped token option (R `componentbase/ComponentBase.js:420-423` defaults pt/ptOptions/unstyled only (no dt key; `cx` gated by isUnstyled at `:507-513`)). PV inherits `dt` (VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt); X Vue has none. D-SHARED #5.                                                                                                                                 |

## Distribution (11 rows)

Normalization 2026-11-19 (toggle-audit, scratch): `pt`, `ptOptions`, `unstyled` and per-instance `dt` split into four rows per current method; PrimeReact per-instance `dt` is N (ComponentBase.js:420-423 has no dt). Counts recomputed mechanically; prior user/ADR rulings and statuses preserved.

| Framework | C   | P   | M   | I   | N   | U   |
| --------- | --- | --- | --- | --- | --- | --- |
| Angular   | 0   | 0   | 0   | 0   | 11  | 0   |
| React     | 4   | 2   | 3   | 0   | 2   | 0   |
| Vue       | 4   | 1   | 5   | 0   | 1   | 0   |

## Top gaps

1. No `pt` and no unstyled/`dt` in React or Vue (rows 8 and 9).
2. Root attributes are restricted to `className` in React and lost in Vue (row 6).
3. The trigger behaves differently at the edges (row 2), and React has no element handle (row 7).

## Inventory

- `docs/inventory/react-feedback/react.deferred-content.md:13`: requires `IntersectionObserver` with no fallback, and captures `onLoad` in an effect that depends only on `loaded`. The jsdom tests mocked the observer, at revision `e3add69e`.
- `docs/inventory/vue-feedback/vue.deferred-content.md`: jsdom tests passed at `fdd42818` with PostCSS disabled. The first attempt failed on `postcss-import`, an environment problem rather than a product defect.
- Neither record is behavioral evidence at the pinned revision.

## Reference defects (flagged, no class impact)

- `PR/deferredcontent/DeferredContentBase.js` declares `onload` in lower case, while `DeferredContent.js:45` reads `onLoad` (`deferredcontent.md:50`).

## Decisions needed (no priority)

- Whether the `IntersectionObserver` semantics are acceptable against Prime's scroll rule (row 2).
- `pt` and unstyled/`dt`.
- Root attribute pass-through in React and Vue.
- The React element handle.

## Verification limits

- **Row 2 edge cases.** Check in a browser: mount the component below, within and above the viewport, and inside a nested scroller, then compare when `load` fires against Prime.
