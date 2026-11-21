# Phase 4 — AnimateOnScroll

Ultimate HEAD `91a8472547e34c6e92456f2b98270a1555e3a2db`; PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5. Source-read only; no tests/browser/visual/AT checks. C/P/M/I/N/U = complete/partial/missing/intentional/not applicable/unresolved. Product paths repo-relative. PN=`.vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/`; PV=`.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/`; PrimeReact root=`.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/`.

## Mapping

| Framework | Prime                          | Ultimate                                 | Basis                                                                              |
| --------- | ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Angular   | `[pAnimateOnScroll]` directive | `UAnimateOnScroll`, `[uAnimateOnScroll]` | Viewport observer applies consumer classes on host.                                |
| React     | absent from PrimeReact 10.9.9  | absent                                   | PrimeReact has no package or showcase entry; no applicable product implementation. |
| Vue       | `v-animateonscroll` directive  | `animateOnScrollDirective`               | Directive binding with intersection observer.                                      |

## Capability matrix

| # | Capability | NG | React | Vue | Evidence (Prime → product) |
| --: | -------------------------------------------------------- | :-: | :---: | :-: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------- |
| 1 | Apply enter/leave classes as element crosses viewport | C | N | C | PN `animateonscroll/animateonscroll.ts:73-143` → `packages/ng/src/animate-on-scroll/animate-on-scroll.ts:87-143`; PrimeReact absent (`components/layout/menu.json` has no entry and no `components/lib/animateonscroll/`) → no product React implementation; PV `animateonscroll/AnimateOnScroll.js:34-90` → `packages/vue/src/animate-on-scroll/animate-on-scroll.ts:70-127`. |
| 2 | `IntersectionObserver` root/rootMargin/threshold options | P | N | P | PN `animateonscroll/animateonscroll.ts:28-50` → NG supports root/rootMargin/threshold, but `threshold                                                                                                                                                                                                                                                                                                                                                                                              |     | 0.5` coerces 0 (`packages/ng/src/animate-on-scroll/animate-on-scroll.ts:48-59,83-85`); PV `animateonscroll/AnimateOnScroll.js:17-25`→ Vue`threshold |     | 0.5` also loses 0 (`packages/vue/src/animate-on-scroll/animate-on-scroll.ts:3-11,62-68`); React absent. |
| 3 | Stop observing after first entry (`once`) | C | N | P | PN `animateonscroll/animateonscroll.ts:145-162` → NG `:119-131,145-155`; PV `.once` modifier in `animateonscroll/AnimateOnScroll.js:93-111` → product supports `once` property but not Vue directive modifier (`packages/vue/src/animate-on-scroll/animate-on-scroll.ts:3-11,106-117`); React absent. |
| 4 | Clear classes/re-arm for repeat entry after exit | C | N | C | PN `animateonscroll/animateonscroll.ts:113-143` → NG `:106-117,134-155`; React absent; PV `animateonscroll/AnimateOnScroll.js:76-111` → Vue `:93-103,120-144`. |
| 5 | `pt` | N | N | N | PN base inheritance does not provide a consumed section: directive has no Bind/PT calls (`animateonscroll/animateonscroll.ts:12-25,73-80`) → product no PT surface (`packages/ng/src/animate-on-scroll/animate-on-scroll.ts:38-42`); React N (Prime absent); PV types expose hooks only (`animateonscroll/AnimateOnScroll.d.ts:35-52`), runtime has no DOM section (`AnimateOnScroll.js:3-10`) → product binding has no PT (`packages/vue/src/animate-on-scroll/animate-on-scroll.ts:3-11,40-60`). |
| 6 | `ptOptions` | N | N | N | PN no PT runtime use (`animateonscroll/animateonscroll.ts:12-25`) → NG none (`packages/ng/src/animate-on-scroll/animate-on-scroll.ts:38-42`); React N; PV hook-only directive PT (`AnimateOnScroll.d.ts:35-52`) → Vue no hook forwarding (`packages/vue/src/animate-on-scroll/animate-on-scroll.ts:40-60`). |
| 7 | Unstyled | N | N | N | No own structural CSS to suppress: PN no style module (`animateonscroll/animateonscroll.ts:12-25`), PV style module empty (`animateonscroll/style/AnimateOnScrollStyle.js:1-8`), React absent. Product directives likewise register no CSS (`packages/ng/src/animate-on-scroll/animate-on-scroll.ts:38-42`; `packages/vue/src/animate-on-scroll/animate-on-scroll.ts:40-60`). KeyFilter/FocusTrap directive precedent. |
| 8 | Per-instance `dt` | N | N | N | No component tokens/style in Prime (`docs/prime-reference/components/animateonscroll.md:74-78`; PV `animateonscroll/style/AnimateOnScrollStyle.js:1-8`); product has no styling integration. PrimeReact absent/no dt. |

## Distribution (8 rows; C/P/M/I/N/U)

| Framework |   C |   P |   M |   I |   N |   U |
| --------- | --: | --: | --: | --: | --: | --: |
| Angular   |   3 |   1 |   0 |   0 |   4 |   0 |
| React     |   0 |   0 |   0 |   0 |   8 |   0 |
| Vue       |   2 |   2 |   0 |   0 |   4 |   0 |

## Default flags

- PrimeVue `.once` type says default true while runtime reads a modifier absent by default; product's `once` object value defaults falsy. Because row maps capability presence and not default, note only; source references `docs/prime-reference/components/animateonscroll.md:43-45` and `AnimateOnScroll.js:3-10`.

## Reference defects

- PrimeVue config type calls the global key `directives.animate`, runtime uses `directives.animateonscroll` (`docs/prime-reference/components/animateonscroll.md:78`; PV `animateonscroll/AnimateOnScroll.js:3-7`, core `basedirective/BaseDirective.js:181`). Not a product classification change.
- PrimeNG showcase object-form `pAnimateOnScroll` is not an input; use individual inputs (`docs/prime-reference/components/animateonscroll.md:62`).

## Ruling needed

- None identified. PrimeReact absence makes every listed capability N for that framework. The directive has no styling/tokens, so four style-control rows use N under KeyFilter/FocusTrap precedent. Vue's `.once` modifier is not implemented by product; property-form `once` is implemented, hence P pending no user ruling (no source/docs contradiction changes that class).

## Verification limits

Source-only; no observer execution, CSS animation, reduced-motion, SSR or browser checks. No tests were run.
