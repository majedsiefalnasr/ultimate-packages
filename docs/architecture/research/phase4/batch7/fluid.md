# Fluid — Phase 4 source comparison

Product revision `91a8472547e34c6e92456f2b98270a1555e3a2db`; PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5. Source-read only; no tests, browser or visual checks. C/P/M/I/N/U per `the phase 4 closeout record`; default differences are flags.

## Mapping and evidence keys

Fluid is a layout wrapper that makes descendant form controls/buttons span full width via an ambient flag.

- PN = `.vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/`
- PR = `.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/` (no `fluid/` directory exists; no `fluid` prop in `inputtext/InputTextBase.js` or `button/ButtonBase.js`)
- PV = `.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/`
- Product: NG `packages/ng/src/fluid/fluid.ts`; React and Vue have no Fluid component (`packages/react/src/fluid`, `packages/vue/src/fluid` absent).

## Capability matrix

| #   | Capability                                                                            | Angular | React | Vue | Evidence (Prime ↔ product)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------- | ------: | ----: | --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Wrapper component rendering a root with the fluid class around projected content      |       C |     N |   M | PN `fluid/fluid.ts:14-26`, `fluid/style/fluidstyle.ts:4-6` ↔ NG `packages/ng/src/fluid/fluid.ts:26-37` (`u-fluid`, `ng-content`, host class `u-fluid`; exported `packages/ng/src/fluid/index.ts:1`, `packages/ng/src/index.ts:3`). PR has no Fluid component. PV `fluid/Fluid.vue:1-15`, `fluid/style/FluidStyle.js:3-10` ↔ Vue: no component under `packages/vue/src/` (directory absent).                                                                                                                                                                                                                                                                                                                                                                               |
| 2   | Ambient provision: descendant inputs/buttons detect the wrapper and become full width |       C |     N |   M | PN `fluid/fluid.ts:30,27` (`$pcFluid`), consumers `inputtext/inputtext.ts:57,118`, `button/button.ts:308` ↔ NG `packages/ng/src/fluid/fluid.ts:35` (`U_FLUID_ANCESTOR`), consumers `packages/ng/src/input-text/input-text.ts:90-108`, `packages/ng/src/textarea/textarea.ts:62-85`, `packages/ng-core/src/base-input/base-input.ts:41,70`. PR: none (per-component `fluid` prop only; product `packages/react/src/input-text/input-text.tsx:29,34,60`). PV `fluid/BaseFluid.vue:9-14` (`provide $pcFluid`) ↔ Vue consumers exist (`packages/vue-core/src/base/base-input.ts:20,27`, `packages/vue/src/button/base-button.ts:51`, `Button.vue:60`) but nothing provides `$pcFluid` (grep of `packages/vue/src`, `packages/vue-core/src`), so the injection never resolves. |
| 3   | Consumer attributes reach the rendered root                                           |       C |     N |   M | PN host binding `fluid/fluid.ts:22-25` ↔ NG host element is the root (`packages/ng/src/fluid/fluid.ts:32-34`). PR n/a. PV `fluid/Fluid.vue:2,13` (`ptmi('root')`) ↔ Vue none (no component).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4   | `pt`                                                                                  |       M |     N |   M | PN `fluid/fluid.ts:25,34-36`, types `types/fluid/fluid.types.ts`; PV `fluid/Fluid.d.ts:80`, `Fluid.vue:2` ↔ NG `packages/ng/src/fluid/fluid.ts:26-37` (no pass-through, class has no base); Vue absent. PR has no Fluid.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5   | `ptOptions`                                                                           |       M |     N |   M | PN inherited `basecomponent/basecomponent.ts:66-72`; PV `fluid/Fluid.d.ts:85`, core `packages/core/src/basecomponent/BaseComponent.vue:18-21` ↔ NG `fluid.ts:37` (plain class, no inputs); Vue absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 6   | `unstyled`                                                                            |       M |     N |   M | PN `basecomponent/basecomponent.ts:60`; PV `fluid/Fluid.d.ts:90`, core `BaseComponent.vue:22-24` ↔ NG `packages/ng/src/fluid/fluid.ts:37` does not extend `UBaseComponent`, so it does not even declare the input (M, not the usual NG P; flagged below); Vue absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 7   | Per-instance `dt`                                                                     |       M |     N |   M | PN `basecomponent/basecomponent.ts:54`; PV `fluid/Fluid.d.ts:75`, core `BaseComponent.vue:26-29` ↔ NG `fluid.ts:37` (no `dt` input; M, not the usual NG P); Vue absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8   | Aura token integration                                                                |       N |     N |   N | Prime Fluid has no component CSS or tokens in any framework (PN `fluid/style/fluidstyle.ts:4-13` classes only; PV `fluid/style/FluidStyle.js:3-10`; PR none); product ships no `.u-fluid` CSS rule (`packages/ng/src/fluid/fluid.ts:32-34`; no `u-fluid` rule anywhere in `packages/*/src`) and Aura has no fluid preset module.                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Distribution

8 capabilities per framework; counted mechanically from the matrix.

| Framework |   C |   P |   M |   I |   N |   U |
| --------- | --: | --: | --: | --: | --: | --: |
| Angular   |   3 |   0 |   4 |   0 |   1 |   0 |
| React     |   0 |   0 |   0 |   0 |   8 |   0 |
| Vue       |   0 |   0 |   7 |   0 |   1 |   0 |

## Default flags

None.

## Reference defects

None found. PrimeReact genuinely lacks Fluid (`components/lib` has no `fluid` directory), so React rows are N rather than a gap.

## Ruling needed

None.

## Notes

- Brief default "NG unstyled P / dt P" does not apply to rows 6-7 because `UFluid` has no base class and declares neither input; recorded as M with this reason.
- Fluid row 8 is N for all three: Prime itself ships no tokens, so no parity obligation.
- Product `u-fluid` class is applied but has no CSS rule in any product package; effect on descendants relies on each consumer's own `fluid` handling (row 2). Not verified at runtime.

## Verification limits

Source only. Absence claims (React/Vue Fluid, missing `$pcFluid` provider, no `.u-fluid` CSS) are from grep over `packages/{ng,react,vue,react-core,vue-core,ng-core}/src`; template-literal or computed references could be missed.
