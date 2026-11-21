# Phase 4 — Ripple

Ultimate HEAD `91a8472547e34c6e92456f2b98270a1555e3a2db`; PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5. Source-read only; no tests/browser/visual/AT checks. C/P/M/I/N/U = complete/partial/missing/intentional/not applicable/unresolved. PN=`.vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/`; PR=`.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/`; PV=`.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/`.

## Mapping

| Framework | Prime                 | Ultimate          | Basis                                                             |
| --------- | --------------------- | ----------------- | ----------------------------------------------------------------- |
| Angular   | `[pRipple]` directive | `URipple`         | Host-bound click feedback effect.                                 |
| React     | `<Ripple />` child    | absent            | No Ripple component in `packages/react`; Prime capability exists. |
| Vue       | `v-ripple` directive  | `rippleDirective` | Host-bound directive.                                             |

## Capability matrix

|   # | Capability                                   | NG  | React | Vue | Evidence (Prime → product)                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --: | -------------------------------------------- | :-: | :---: | :-: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Create ink effect when global ripple enabled |  C  |   M   |  P  | PN `ripple/ripple.ts:36-43,112-124` → `packages/ng/src/ripple/ripple.ts:55-71,134-150`; PR `ripple/Ripple.js:13-18,112-125` → no React Ripple source (glob of `packages/react/src`); PV `ripple/Ripple.js:6-16,31-48` → Vue creates unconditionally (`packages/vue/src/ripple/ripple.ts:96-115`).                                                                                                                                                       |
|   2 | Position/size ink from pointer and host      |  C  |   M   |  C  | PN `ripple/ripple.ts:51-83` → NG `:74-100`; PR `ripple/Ripple.js:31-62` → missing; PV `ripple/Ripple.js:25-48` → Vue `:49-82`.                                                                                                                                                                                                                                                                                                                          |
|   3 | Remove active ink on animation end / timeout |  C  |   M   |  C  | PN `ripple/ripple.ts:95-110,126-135` → NG `:102-109,124-132`; PR `ripple/Ripple.js:56-76` → missing; PV `ripple/Ripple.js:88-104` → Vue `:40-47,76-82`.                                                                                                                                                                                                                                                                                                 |
|   4 | Global runtime enable/disable behavior       |  C  |   M   |  M  | PN `ripple/ripple.ts:36-43` → NG `:55-71`; PR context gate `ripple/Ripple.js:13-18` → missing; PV config watcher `ripple/Ripple.js:6-23` → product always mounts effect, no config gate (`packages/vue/src/ripple/ripple.ts:96-115`).                                                                                                                                                                                                                   |
|   5 | Host and ink semantics/markers               |  C  |   M   |  P  | PN host class + ink aria/data attrs (`ripple/ripple.ts:13-19,112-124`) → NG `:36-42,134-149`; PR host class + aria-only ink (`ripple/Ripple.js:112-125`) → missing; PV data-pd host + data-pc ink (`ripple/Ripple.js:11-13,35-46`) → Vue aria/role but no data marker (`packages/vue/src/ripple/ripple.ts:28-37`).                                                                                                                                      |
|   6 | `pt` on ink                                  |  N  |   M   |  C  | PN exposes but never reads PT (`ripple/ripple.ts:12-20,112-124`) → NG no PT (`packages/ng/src/ripple/ripple.ts:36-49`); PR applies `ptm('root')` (`ripple/Ripple.js:116-125`) → absent; PV applies root PT (`ripple/Ripple.js:35-46`) → product no PT (`packages/vue/src/ripple/ripple.ts:96-115`).                                                                                                                                                     |
|   7 | `ptOptions`                                  |  N  |   M   |  M  | PN no PT use (`ripple/ripple.ts:12-20`) → NG none (`packages/ng/src/ripple/ripple.ts:36-49`); PR supports options through ComponentBase (`ripple/RippleBase.js:1-20`, `componentbase/ComponentBase.js:420-430`) → absent; PV directive binding has ptOptions (`ripple/Ripple.d.ts:20-68`) → product no forwarding (`packages/vue/src/ripple/ripple.ts:96-115`).                                                                                         |
|   8 | Unstyled                                     |  N  |   M   |  M  | PN directive style mode declared in base but effect/classes unconditionally applied (`ripple/ripple.ts:54-74`) → product no gate (`packages/ng/src/ripple/ripple.ts:29-34,55-71`); PR `unstyled` option (`ripple/ripple.d.ts:43-58`) → absent; PV unstyled skips classes (`ripple/Ripple.js:40-48,71-88`) → absent.                                                                                                                                     |
|   9 | Per-instance `dt`                            |  N  |   N   |  M  | PN base exposes dt but no class consumes per-instance tokens (`ripple/ripple.ts:12-20`, `style/ripplestyle.ts:1-24`) → N under no consumed token styling; PR has no dt API (`ripple/ripple.d.ts:43-58`) → N; PV binding supports dt (`ripple/Ripple.d.ts:20-68`) → product lacks token plumbing (`packages/vue/src/ripple/ripple.ts:96-115`).                                                                                                           |
|  10 | Aura token / structural Ripple CSS           |  P  |   N   |  P  | PN CSS style module `ripple/style/ripplestyle.ts:1-34`; product registers none and renames p-ink to u-ink (`packages/ng/src/ripple/ripple.ts:29-34,134-149`), so ink receives no matching structural CSS. PR uses private CSS, no PrimeUIX tokens (`ripple/RippleBase.js:1-39`) → N for Aura tokens, React product absent; PV uses PrimeUIX (`ripple/style/RippleStyle.js:1-12`) → no product CSS (`packages/vue/src/ripple/ripple.ts:22-27,85-95`), P. |

## Distribution (10 rows; C/P/M/I/N/U)

| Framework |   C |   P |   M |   I |   N |   U |
| --------- | --: | --: | --: | --: | --: | --: |
| Angular   |   5 |   1 |   0 |   0 |   4 |   0 |
| React     |   0 |   0 |   8 |   0 |   2 |   0 |
| Vue       |   3 |   3 |   4 |   0 |   0 |   0 |

## Default flags

- Ripple is disabled by default in all pinned Prime configs; NG defaults are not consumed by product as a default setting because product's `UltimateConfig.ripple` is user-configurable and gates effect (`packages/ng/src/ripple/ripple.ts:55-71`). Vue product has no matching gate. Prime defaults in `docs/prime-reference/components/ripple.md:57,64,73`.

## Reference defects

- PrimeNG exposes PT through BaseComponent but Ripple never applies it; classify N under the established runtime-over-declaration decision (`docs/prime-reference/components/ripple.md:105`).
- PrimeReact Ripple declaration describes class component while runtime exports memo/forwardRef (`docs/prime-reference/components/ripple.md:74`); no product React counterpart.

## Rulings (resolved 2026-11-21)

1. **Angular/Vue Ripple visual CSS row:** user chose A. P in Angular and Vue: product creates and activates the ink but ships no structural CSS (positioning, background, keyframes). The Vue source comment claiming the theme defines `.u-ink-active` is a note, not evidence; no such selector was found in product CSS. Counts unchanged.
2. **React rows:** user chose A. They stay M; no I is authorized by superseded ADR-031. ADR-034 applies to the Vue directive form only. Counts unchanged.

## Verification limits

Source-only; no style injection, animation rendering, user preference/config switching, or browser interaction checked. No tests were run. Product Angular and Vue use `u-ink` classes, but this repository search found no product CSS selectors for them.
