# ContextMenu — Phase 4 report (source-read only; no tests/browser/AT run)

Pinned revision 91a8472547e34c6e92456f2b98270a1555e3a2db. Order: complete/partial/missing/intentional/n-a/unresolved. 16 rows.
Roots: PNG=.vendor-cache/extracted/primeng-21.1.9/.../packages/primeng/src ; PR=.../primereact-10.9.9/.../components/lib ; PV=.../primevue-4.5.5/.../packages/primevue/src

## Distribution

- Angular 4/9/3/0/0/0 ; React 5/4/5/0/2/0 ; Vue 6/4/5/0/1/0 (mandatory rows split 2026-11-19: pt, ptOptions, unstyled, per-instance dt)

## Rows (NG | React | Vue)

1 Functional mapping: C|C|C (NG context-menu.ts:24-65,274-323; React context-menu.tsx:46-47,80-109; Vue ContextMenu.vue:63-75,136-165)
2 Nested submenus: P|P|P (flat list in Ultimate; Prime recursive ContextMenuSub)
3 Pointer positioning: P|P|P (pageX/pageY, no scroll offsets; NG context-menu.ts:302-323, React :80-92, Vue :149-160; Prime uses scroll offsets)
4 Trigger/target attachment: P|C|C (NG no target input/triggerEvent)
5 Touch long press: M|N/A|N/A (NG source comment :59-61)
6 Responsive/mobile: P|M|M (NG resize-dismiss only, no breakpoint)
7 Keyboard: P|M|P (React no list key handler, tabIndex=-1; type-ahead/Left-Right missing)
8 ARIA/focus metadata: P|P|P (NG role=menu matches PrimeNG source; React/Vue menu vs Prime menubar; React no aria-activedescendant)
9 Show/hide methods: C|C|C (React getElement/DOM-ref equivalence not verified)
10 Separators: C|C|C
11 `pt`: M|M|M (D-PT; NG: PN contextmenu.ts:491; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR contextmenu/contextmenu.d.ts:200 (pt), 205 (unstyled); ptOptions NOT declared; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV contextmenu/BaseContextMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
12 `ptOptions`: M|M|M (D-PT; NG: PN contextmenu.ts:491; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR contextmenu/contextmenu.d.ts:200 (pt), 205 (unstyled); ptOptions NOT declared; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); PrimeReact ContextMenu runtime accepts ptOptions through ComponentBase.extend (ComponentBase.js:420-423 merged at 429-438, read at 467) although contextmenu.d.ts omits it; runtime source governs, types omission recorded as reference defect; Vue: PV contextmenu/BaseContextMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
13 `unstyled`: P|M|M (D-SHARED #5; NG: PN contextmenu.ts:491; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR contextmenu/contextmenu.d.ts:200 (pt), 205 (unstyled); ptOptions NOT declared; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV contextmenu/BaseContextMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
14 Per-instance `dt`: P|N/A|M (D-SHARED #5; NG: PN contextmenu.ts:491; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt); PrimeReact has no per-instance dt, so N/A; Vue: PV contextmenu/BaseContextMenu.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
15 Default overlay attachment: P(default flag: hard-coded body)|C|C
16 Aura token consumption and preset key (D-SHARED #1, ADR-067): C|P|C (NG packages/ng/src/context-menu/context-menu-style.ts:1-52 22 dt() calls, key contextmenu; React packages/react/src/context-menu/context-menu-style.ts:1-31 no dt(), registers context-menu (not Aura key contextmenu); Vue packages/vue/src/context-menu/context-menu-style.ts:1-52 22 dt() calls, key contextmenu; keys at aura/index.ts:123; ADR-067 docs/architecture/DECISIONS.md:787-803 applies, not an exception. Source-only)

## Reference defect

Docs say root role menubar (contextmenu.md:88-90); pinned PrimeNG source role=menu (PNG/contextmenu/contextmenu.ts:75). Pinned source wins; no effect on NG row 8 classification.

## Verification limits

Source only. Scroll positioning: source difference, not observed failure (check: open near viewport edges on scrolled page). React portal timing (docs/inventory/react-menu-navigation/README.md:35-37) not proven a race. Inventory product tests failed pre-assertion (postcss-import) – not product evidence.

## Decisions needed (no priority)

Flat vs nested structure; target/triggerEvent/long press (NG); responsive mode; React/Vue root-role alignment. NG source comments (:59-64) are context only, no in-force ADR.
