<!-- Historical pre-normalization lead review 2026-11-18: user approved row 2 P in all frameworks for full-screen coverage limitations when an ancestor establishes a fixed-position containing block. Final counts: NG 3/4/5/0/3/0, React 3/5/6/0/1/0, Vue 5/3/5/0/2/0. Each totals 15. PrimeVue animationend reference defect touches no row. Source-read only; no browser check. Ledger updated to reflect the ruling. -->

# Batch 6 — BlockUI (corrected). All claims SOURCE-READ ONLY (no tests/browser/AT).

Pins: ultimate 91a8472547e34c6e92456f2b98270a1555e3a2db; PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5.
N=.vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/
R=.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/
V=.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/
Classes C/P/M/I/N-A/U. No row is I (no accepted ADR/ruling). pt = M (D-PT); unstyled NG P, React/Vue M; per-instance dt NG P, React N, Vue M (D-SHARED #5). Cross-cutting fallthrough -> D-SHARED #2.

## Mapping

UBlockUI = PrimeNG/React/Vue BlockUI. Files: packages/ng/src/block-ui/block-ui.ts, packages/react/src/block-ui/block-ui.tsx, packages/vue/src/block-ui/BlockUI.vue (+BaseBlockUI.ts).

## Distribution (C/P/M/I/N-A/U)

NG 4/5/6/0/3/0 ; React 3/6/7/0/2/0 ; Vue 6/3/7/0/2/0 (each sums to 18)
Normalization 2026-11-19 (toggle-audit, scratch): `pt`, `ptOptions`, `unstyled` and per-instance `dt` split into four rows per current method; PrimeReact per-instance `dt` is N (ComponentBase.js:420-423 has no dt). Counts recomputed mechanically; prior user/ADR rulings and statuses preserved.

## Rows (NG | React | Vue | flags)

1 Mask over own region (children-wrapping): N-A | P | C | React known-defect. NG oracle has no own-children mode (target or document only, N blockui.ts:126-147); Ultimate NG own-slot masking is an extra. React CSS gives non-fullscreen mask no geometry (packages/react/src/block-ui/block-ui-style.ts:9-11, only fullscreen fixed); NG/Vue have top0/left0/100%/absolute (packages/ng/src/block-ui/block-ui-style.ts:12-16; packages/vue/src/block-ui/block-ui-style.ts:10-14). Inventory react-overlays-notifications/README.md:84.
2 Full-screen mask: P | P | P | user ruling 2026-11-18. Ultimate renders inline position:fixed (not appended to body; packages/ng/src/block-ui/block-ui-style.ts:16); Prime moves/appends to body (N blockui.ts:131-138; R BlockUI.js:92; V BlockUI.vue:39-56). Ordinary placement fills the viewport, but an ancestor establishing a fixed-position containing block (for example via transform or certain filter/contain values) can constrain coverage. Classification compares this observable limitation, not implementation location alone. No browser proof.
3 target: M | N-A | N-A. N blockui.ts:48,131-138; R/V have no target.
4 autoZIndex/baseZIndex: P | P | P | default-diff. Ultimate ZIndex.set("modal",mask,baseZIndex=0): NG block-ui.ts:104-106, React block-ui.tsx:65-67, Vue BlockUI.vue:57-59; Prime base+config modal 1100 (N blockui.ts:141; R BlockUI.js:60-63; V BlockUI.vue:72-74). NG reads non-reactive ViewChild at block-ui.ts:104; inventory angular-overlays-notifications/README.md:87-88 says runtime timing NOT established -> not claimed as confirmed defect.
5 blocked/unblocked events: N-A | C | C(naming-only). NG oracle declares no events (N blockui.ts inspected whole). Vue names blocked/unblocked vs Prime block/unblock (V BlockUI.vue:17,77,112; Ultimate BlockUI.vue:35).
6 Imperative block()/unblock()/getElement: M | M | P. N blockui.ts:126,149; R BlockUI.js:83-88; V BlockUI.vue:36,79. Ultimate Vue methods (BlockUI.vue:55-65) exist but mask renders from prop only (:4) -> partial. NG effect-only (block-ui.ts:93-114).
7 Mask content template: M | M | N-A. N blockui.ts:88,112-124; R BlockUI.js:107; V none.
8 Enter/leave motion + animationend deferral: M | M | M. N blockui.ts:144-158; R BlockUI.js:31-39; V BlockUI.vue:79-100. Ultimate removes mask immediately. Compares motion only, not Prime's removal correctness (see defect).
9 Body scroll lock: C | C | C. NG block-ui.ts:101-121; React block-ui.tsx:62-85; Vue BlockUI.vue:42-47,56-63.
10 Focus handling when fullscreen: N-A | M | M | a11y. R BlockUI.js:25-28,46-49,56-58; V BlockUI.vue:56 (blur only); N none.
11 aria-busy on root: C | C | C. NG block-ui.ts:54; React block-ui.tsx:90; Vue BlockUI.vue:2.
12 Root id/class/style/attrs forwarding: C | P | M | Vue known-defect (D-SHARED #2). React accepts only className/style (block-ui.tsx:5-15,43-44) vs Prime id/containerClassName/containerStyle (R BlockUI.js:122-132); Vue inheritAttrs-false-equivalent flag with no $attrs binding (BlockUI.vue:34); inventory vue-overlays-notifications/README.md:78.
13 Lifecycle/cleanup: P | P | C. NG destroy unregisters scroll only (block-ui.ts:117-121; N clears zindex 166,190). React clears zindex on unblock after mask detaches (ref null, block-ui.tsx:73) and cleanup captures first-render fullScreen (:78-85), no zindex cleanup; inventory react-overlays-notifications/README.md:73. Vue BlockUI.vue:39-47,62-66; not gating clear on autoZIndex is not an inherent defect (inventory vue:91-92).
14 pt: M | M | M (D-PT). N blockui.ts:34,42; R BlockUI.js:19,105,131; V BlockUI.vue:2,51,67.
15 ptOptions: M | M | M (D-PT). N `basecomponent/basecomponent.ts:54,60,66,72` declares dt/unstyled/pt/ptOptions; R `componentbase/ComponentBase.js:420-423` defaults pt/ptOptions/unstyled only (no dt key; `cx` gated by isUnstyled at `:507-513`); VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt. X NG `packages/ng-core/src/basecomponent/base-component.ts:21-24` excludes pt/ptOptions; `:35-36` declares dt/unstyled without applying them (`:50-53`); X React `packages/react-core/src/base/component-base.ts` and Vue `packages/vue-core/src/base/base-component.ts:30-42` have no pt/ptOptions/unstyled/dt.
16 unstyled: P | M | M (D-SHARED #5). NG base has unstyled input (packages/ng-core/src/basecomponent/base-component.ts:36) but cx never suppresses classes (:50-53); R BlockUI.js:19-23 passes isUnstyled to useHandleStyle; Vue base has none (packages/vue-core/src/base/base-component.ts:30-42); React CSS hardcoded.
17 dt: P | N | M (D-SHARED #5). NG declares dt (base-component.ts:35) without applying it; PrimeReact has no dt (R `componentbase/ComponentBase.js:420-423` defaults pt/ptOptions/unstyled only (no dt key; `cx` gated by isUnstyled at `:507-513`)); VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt; X Vue none.
18 Aura token consumption and preset key (D-SHARED #1, ADR-067): C | P | C | NG packages/ng/src/block-ui/block-ui-style.ts:1-29 3 dt() calls, key blockui; React packages/react/src/block-ui/block-ui-style.ts:1-24 no dt(), registers block-ui (not Aura key blockui); Vue packages/vue/src/block-ui/block-ui-style.ts:1-32 3 dt() calls, key blockui; keys at aura/index.ts:112; ADR-067 docs/architecture/DECISIONS.md:787-803 applies, not an exception. Source-only.

## Reference defects

- PrimeVue handleAnimationEnd clears the fallback timer but does NOT call removeMask (V BlockUI.vue:83-95): if animationend fires first the mask may remain. Earlier draft wrongly said removal always occurs via 300 ms timer; corrected. No verdict depends on it.
- Prime z-index key differs: React 'overlay' when not fullscreen, NG/Vue 'modal' (R BlockUI.js:60-63).
- PrimeNG p-blockui-mask-document keyed on !target (N style/blockuistyle.ts:6-11).

## Decisions needed (reference-side only)

- Resolved 2026-11-18: user approved row 2 P in all frameworks for the full-screen coverage limitation; final distribution and ledger updated.
- Reference-defect ruling for PrimeVue animationend (U for any row it would touch: none counted).

## Unresolved (exact checks; not counted U)

- Row 4 NG: mount <u-block-ui [blocked]="true">, read .u-blockui-mask style.zIndex, toggle off/on and re-read.
- Row 1 React: mount UBlockUI blocked with sized child; check mask height/position.
- Row 2: place inside transformed ancestor; check mask coverage.

## Limits

Source-read only. Inventory lines are corroboration, not pass/fail evidence.
