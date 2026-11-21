# ConfirmPopup — Phase 4 report

Pinned revision 91a8472547e34c6e92456f2b98270a1555e3a2db. Source-read only: no tests, browser, AT or visual checks. Order: complete/partial/missing/intentional/n-a/unresolved. Oracles: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5 (pinned source wins over docs).

## Distribution (27 rows)

- Angular 7/9/9/0/2/0 ; React 4/8/11/0/4/0 ; Vue 6/6/12/0/3/0 (mandatory rows split 2026-11-19: pt, ptOptions, unstyled, per-instance dt; pre-split 24-row figures were 6/8/8/0/2/0, 4/7/10/0/3/0, 5/6/10/0/3/0)
- Lead correction: earlier Vue figure 5/7/9 was an arithmetic error; per-row sum with row 23 (now row 25 after the split) = M (ruled: PrimeVue sets aria-modal, Ultimate Vue sets role only) gives 5/6/10.

## Rows (NG | React | Vue)

01 Service/function request and close: C|C|C
02 Multi-instance routing: C|P (no tagKey filter, PR:207)|C (group vs options.key — API naming)
03 Declarative visible: M|M|N
04 Accept/reject callbacks, hide, target focus: C|C|C
05 Message and icon: C|C|C
06 Accept/reject labels: C|C|C
07 Button icon/class/props customization: M|M|M
08 Content/icon/headless templates: M|M|M
09 Positioning, flip, arrow: P|P|P (always below target; inventory react-overlays-notifications/README.md:79-80)
10 appendTo: M|M|N
11 Outside dismissal and Escape policy: P|P|P (Escape always rejects; no closeOnEscape/dismissable guard)
12 Scroll/resize/overlay-click: P|P|P
13 Initial focus and restore: P|P|P
14 Focus trap: M|N|M
15 z-index: P|P|P
16 onShow/onHide: N|M|M
17 Motion: M|M|M
18 Root attrs/class/style on overlay: P|M|M (Vue UPortal->Teleport: packages/vue-core/src/overlay/portal.ts:13-31)
19 `pt`: M|M|M (D-PT; NG: PN confirmpopup.ts:134; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR confirmpopup/confirmpopup.d.ts:281,286,291; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV confirmpopup/BaseConfirmPopup.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
20 `ptOptions`: M|M|M (D-PT; NG: PN confirmpopup.ts:134; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR confirmpopup/confirmpopup.d.ts:281,286,291; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV confirmpopup/BaseConfirmPopup.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
21 `unstyled`: P|M|M (D-SHARED #5; NG: PN confirmpopup.ts:134; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR confirmpopup/confirmpopup.d.ts:281,286,291; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV confirmpopup/BaseConfirmPopup.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
22 Per-instance `dt`: P|N/A|M (D-SHARED #5; NG: PN confirmpopup.ts:134; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt); PrimeReact has no per-instance dt, so N/A; Vue: PV confirmpopup/BaseConfirmPopup.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
23 Locale fallback for labels: M|M|M (hardcoded Yes/No)
24 Anatomy and arrow CSS: P|P|P
25 role/aria-modal: C|N (user ruling: PrimeReact source sets neither; Ultimate role=alertdialog = extra)|M
26 Trigger aria-expanded/aria-controls: N|N|N (user ruling: docs promise, no pinned source implements)
27 Aura token consumption and preset key (D-SHARED #1, ADR-067): C|P|C (NG packages/ng/src/confirm-popup/confirm-popup-style.ts:1-28 14 dt() calls, key confirmpopup; React packages/react/src/confirm-popup/confirm-popup-style.ts:1-18 no dt(), registers confirm-popup (not Aura key confirmpopup); Vue packages/vue/src/confirm-popup/confirm-popup-style.ts:1-28 14 dt() calls, key confirmpopup; keys at aura/index.ts:122; ADR-067 docs/architecture/DECISIONS.md:787-803 applies, not an exception. Source-only)

## Reference defects

REC claims React role/aria-modal (absent in source); REC trigger ARIA absent in all sources; PrimeNG flipped class name differs between source and token sheet (not used to excuse missing flip).

## Decisions needed (no priority)

Declarative visible, React tagKey/ref handle; templates and button customization; dismissal/focus/position/appendTo; pt per D-PT; unstyled/dt per D-SHARED.
