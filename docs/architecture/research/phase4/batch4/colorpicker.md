# ColorPicker — Phase 4 report

Pinned revision 91a8472547e34c6e92456f2b98270a1555e3a2db. Source-read only: no tests, browser, AT or visual checks. Order: complete/partial/missing/intentional/n-a/unresolved. Oracles: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5 (pinned source wins over docs).

## Distribution (30 rows)

- Angular 8/7/12/0/3/0 ; React 4/6/15/0/5/0 ; Vue 8/5/13/0/4/0 (mandatory rows split 2026-11-19: pt, ptOptions, unstyled, per-instance dt; pre-split 28-row figures were 8/6/11/0/3/0, 4/6/14/0/4/0, 8/5/11/0/4/0)
- Lead correction: agent tally listed Vue 8/5/12/0/3/0 but its own row 20 is N (PrimeVue exposes no imperative methods, docs/prime-reference/components/colorpicker.md:65,131), so Vue = 8/5/11/0/4/0. Angular touch row verified M (packages/ng/src/color-picker/color-picker.ts:45 is an exclusion comment; no handlers).

## Rows (NG | React | Vue)

01 Value model (default ff0000): C|C|C
02 Hex # prefix: C|P|P (Ultimate React/Vue prepend #; PrimeReact/PrimeVue do not; no option)
03 Value binding: C|C|C
04 invalid: M|N|M
05 required/autofocus: M|M|N
06 @primevue/forms: N|N|M
07 Popup interaction: C|C|C
08 Inline mode: M|M|M
09 Mouse drag: C|C|C
10 Drag-listener cleanup on destroy: C|P|P
11 Touch: M|M|M
12 Hue memory at s/b=0: N|N|P
13 Panel positioning: P|P|P (LTR/RTL browser check not run)
14 appendTo: M|M|C
15 Outside/scroll/resize dismissal: M|M|M
16 z-index: P|M|M (NG autoZIndex declared, never read)
17 Motion: M|M|M
18 Change payload: C|P|C (Vue originalEvent vs event = naming only)
19 show/hide events: P|P|C
20 Imperative API: M|M|N
21 Input attributes: M|M|M
22 Root class/style: C|P|C
23 Panel customization props: M|M|M
24 Tooltip props: N|M|N
25 ARIA label locale: P|N|N
26 Aura tokens resolve: P|M|P (broken-dt ruling 2026-11-19 already reflected; class unchanged). NG packages/ng/src/color-picker/color-picker-style.ts:19 and Vue packages/vue/src/color-picker/color-picker-style.ts:21 request colorpicker.preview.border.color, absent from Aura packages/themes/src/presets/aura/color-picker.ts:19-58 and from Prime styles (`foundations/shared-foundation-audit.md:124-125`). Citation corrected: panel.border.color (NG :34, Vue :36) DOES resolve via colorScheme light/dark panel.borderColor (color-picker.ts:43,52); dt.ts:25-35 emits vars unchecked; toVariables.ts:41-65 only defined keys)
27 `pt`: M|M|M (D-PT; NG: PN colorpicker.ts:93 extends BaseEditableHolder (-> BaseModelHolder -> BaseComponent); PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR colorpicker/colorpicker.d.ts:238,243,248; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV colorpicker/BaseColorPicker.vue:2,7 (BaseEditableHolder -> BaseComponent); PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
28 `ptOptions`: M|M|M (D-PT; NG: PN colorpicker.ts:93 extends BaseEditableHolder (-> BaseModelHolder -> BaseComponent); PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR colorpicker/colorpicker.d.ts:238,243,248; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV colorpicker/BaseColorPicker.vue:2,7 (BaseEditableHolder -> BaseComponent); PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
29 `unstyled`: P|M|M (D-SHARED #5; NG: PN colorpicker.ts:93 extends BaseEditableHolder (-> BaseModelHolder -> BaseComponent); PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR colorpicker/colorpicker.d.ts:238,243,248; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled); Vue: PV colorpicker/BaseColorPicker.vue:2,7 (BaseEditableHolder -> BaseComponent); PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))
30 Per-instance `dt`: P|N/A|M (D-SHARED #5; NG: PN colorpicker.ts:93 extends BaseEditableHolder (-> BaseModelHolder -> BaseComponent); PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared); React: PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt); PrimeReact has no per-instance dt, so N/A; Vue: PV colorpicker/BaseColorPicker.vue:2,7 (BaseEditableHolder -> BaseComponent); PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props))

## Reference defects

REC keyboard promise unsupported by sources; REC says PrimeReact reads undeclared closeOnEscape; PrimeVue content class missing from classes map; Prime CSS reads colorpicker.preview.focus.border.color absent from token type; PrimeVue panelClass deprecated but applied.

## Known inventory defects (inventory strength)

docs/inventory/angular-numeric-date-color-file/README.md:75-78; react-numeric-date-color-file/README.md:68-85; vue-numeric-date-color-file/README.md:26-31.

## Decisions needed (no priority)

Hex prefix; Vue forms integration; missing props/behaviors (no in-force ADR for I); pt/unstyled per D-PT/D-SHARED.
