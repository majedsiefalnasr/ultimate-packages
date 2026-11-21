# MegaMenu — Phase 4 report (source-read only; no tests/browser/AT run)

Pinned revision 91a8472547e34c6e92456f2b98270a1555e3a2db. Order: complete/partial/missing/intentional/n-a/unresolved. 17 rows.

## Distribution

- Angular 6/5/6/0/0/0 ; React 5/3/7/0/2/0 ; Vue 5/4/8/0/0/0 (mandatory rows split 2026-11-19: pt, ptOptions, unstyled, per-instance dt)

## Rows (NG | React | Vue)

1 Functional mapping: C|C|C (NG mega-menu.ts:61-115; React mega-menu.tsx:200-265; Vue MegaMenu.vue:1-44)
2 Column/group grid: C|C|C
3 Orientation: M|M|M (horizontal only; Vue exclusion BaseMegaMenu.ts:6-11 not an in-force ADR)
4 Responsive/mobile + scrollHeight: M|M|M
5 Start/end regions: M|M|M
6 Separators: M|M|M (NG story note mega-menu.stories.ts:31)
7 Keyboard: P|P|P (root Left/Right/Enter/Space/Escape, groups Up/Down; no Home/End/Tab/typeahead)
8 Router/navigation: C|C|P (Vue root suppresses href when routerLink set but no router binding; MegaMenu.vue:16,140-160)
9 Component-wide disabled: P|N/A|P
10 ARIA/focus metadata: P|P|P
11 `pt`: M|M|M (D-PT; NG: PN megamenu.ts:445; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR megamenu/megamenu.d.ts:226,231,236; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV megamenu/BaseMegaMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
12 `ptOptions`: M|M|M (D-PT; NG: PN megamenu.ts:445; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR megamenu/megamenu.d.ts:226,231,236; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV megamenu/BaseMegaMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
13 `unstyled`: P|M|M (D-SHARED #5; NG: PN megamenu.ts:445; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR megamenu/megamenu.d.ts:226,231,236; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV megamenu/BaseMegaMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
14 Per-instance `dt`: P|N/A|M (D-SHARED #5; NG: PN megamenu.ts:445; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt); PrimeReact has no per-instance dt, so N/A; Vue: PV megamenu/BaseMegaMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
15 Model default/empty: C|C|C
16 Command/item select: C|C|C
17 Aura token consumption and preset key (D-SHARED #1, ADR-067): C|P|C (NG packages/ng/src/mega-menu/mega-menu-style.ts:1-71 46 dt() calls, key megamenu; React packages/react/src/mega-menu/mega-menu-style.ts:1-38 no dt(), registers mega-menu (not Aura key megamenu); Vue packages/vue/src/mega-menu/mega-menu-style.ts:1-73 46 dt() calls, key megamenu; keys at aura/index.ts:147; ADR-067 docs/architecture/DECISIONS.md:787-803 applies, not an exception. Source-only)

## Reference defects

None affect classification. PrimeVue .d.ts menubutton vs template button slot name is a docs/types inconsistency (megamenu.md:15).

## Verification limits

Source only. Vue router row 8: check by clicking a routerLink root item in a Vue Router app. Interim note that React root/Vue groups lacked key handlers was disproved (mega-menu.tsx:170-180; MegaMenuColumnGroup.vue:116-120). Inventory tests failed pre-assertion (postcss-import); Angular not run.

## Decisions needed (no priority)

Orientation, responsive, start/end, separators, NG/Vue component-level disabled, Vue routerLink semantics.
