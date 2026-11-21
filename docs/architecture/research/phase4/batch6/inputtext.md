<!-- Historical pre-normalization lead review 2026-11-18: arithmetic verified row-by-row (NG 9/2/3/0/5/0, React 4/6/4/0/5/0, Vue 6/3/6/0/4/0). No unresolved rows. Row 9 NG: no ruling needed. Pinned PrimeNG root class p-filled is value-derived (inputtext/style/inputtextstyle.ts:22 instance.$filled(); basemodelholder.ts:9 $filled = isNotEmpty(modelValue)); only dataP filled key is variant-derived (inputtext.ts:125). Xjw NG mirrors both (packages/ng/src/input-text/input-text.ts:113 and :131) -> C. Vue p-filled oracle is value-derived (PrimeVue InputTextStyle.js), Xjw Vue uses variant -> M stands. Row 5 React: lead keeps M without ruling; PrimeReact documents sizes via className p-inputtext-sm/lg styled by its theme CSS (components/doc/inputtext/sizesdoc.js; theme.css), which is PrimeReact normal styling mechanism; Xjw React CSS has no sm/lg. Row 15 N per user ruling (DECISIONS.md). Agent-10 report below, unchanged. -->

# Batch 6 — InputText (corrected). All claims SOURCE-READ ONLY (no tests/browser/AT).

Pins/prefixes N, R, V as in blockui.md. Classes C/P/M/I/N-A/U. No row is I. pt = M (D-PT); unstyled NG P, React/Vue M; per-instance dt NG P, React N, Vue M (D-SHARED #5). API shape irrelevant if behaviour equivalent.

## Mapping

UInputText = PrimeNG [pInputText] directive, PrimeReact InputText, PrimeVue InputText. Files: packages/ng/src/input-text/input-text.ts ([uInputText]), packages/react/src/input-text/input-text.tsx, packages/vue/src/input-text/InputText.vue (+BaseInputText.ts).

## Distribution (C/P/M/I/N-A/U)

NG 10/3/4/0/5/0 ; React 4/7/5/0/6/0 ; Vue 7/3/8/0/4/0 (each sums to 22)
Normalization 2026-11-19 (toggle-audit, scratch): `pt`, `ptOptions`, `unstyled` and per-instance `dt` split into four rows per current method; PrimeReact per-instance `dt` is N (ComponentBase.js:420-423 has no dt). Counts recomputed mechanically; prior user/ADR rulings and statuses preserved.

## Rows (NG | React | Vue | flags)

1 Single native text input: C | C | C | NG naming-only (uInputText vs pInputText). NG input-text.ts selector; React input-text.tsx:54-67; Vue InputText.vue:2-13; N inputtext.ts:17.
2 Value binding/form-control sync: C | C | C. NG UModelHolder + NgControl (input-text.ts:135-155); React controlled value/onChange via rest (input-text.tsx:21-31,65); Vue writeValue emitting update:modelValue/value-change (packages/vue-core/src/base/base-editable-holder.ts:79-85).
3 @primevue/forms formControl/formField: N-A | N-A | M. V BaseEditableHolder.vue:30,39-44,61-85,90-99; Ultimate base-editable-holder.ts writeValue has no forms callback.
4 Variant with global config fallback: P | P | P | default-diff. Explicit variant works; config fallback absent. N inputtext.ts:83 (variant()||config.inputStyle()||config.inputVariant()); R InputTextBase.js:10; V core baseinput/BaseInput.vue:30-32. Ultimate NG input-text.ts:104; React input-text.tsx:60; Vue base-input.ts:23-25.
5 Visual size sm/lg: M | M | M | Vue known-defect. N inputtext.ts:63 pSize + style p-inputtext-sm/lg; V size prop + p-inputtext-sm p-inputfield-sm (V style/InputTextStyle.js:9-10); R emits no size classes (InputTextBase.js:5-11; sm/lg via theme CSS/className). Ultimate NG excludes pSize (input-text.ts:64-66); React CSS lacks sm/lg (input-text-style.ts:3-27); Vue size inherited (base-input.ts:15) but never read (InputText.vue:30-37; inventory vue-text-entry/README.md:39). React row M rests on missing sm/lg CSS; Prime React offers it only via theme CSS - weakest verdict.
6 Fluid incl. ancestor: C | N-A | P. NG inject UFluid (input-text.ts, N inputtext.ts:75,118). React Prime has none (extra). Vue: explicit fluid prop works (base-input.ts:16,26-28); ancestor injects pcFluid (base-input.ts:19-21) but NO shipped Vue Fluid component/provider exists (no packages/vue/src fluid file; not in packages/vue/src/index.ts) vs Prime BaseFluid.vue:9-14 providing $pcFluid. Resolved from source -> P (was U).
7 Invalid state (prop/class/aria-invalid): C | C | C. N inputtext.ts:81,123; V InputText.vue:2.
8 Angular .ng-invalid.ng-dirty styling: M | N-A | N-A. N style/inputtextstyle.ts:5-16; none under packages/ng/src/input-text or uix-styles inputtext.
9 Filled-state class: C | M | M | React known-defect. NG filled:$filled() (input-text.ts:113); React never passes filled (input-text.tsx:60; inventory react-text-entry/README.md:26-27); Vue filled = resolvedVariant==='filled' not value (InputText.vue:34). Note PrimeNG itself sets filled from $variant()==='filled' (N inputtext.ts:125) - reference quirk.
10 Disabled: C | C | C.
11 Native attribute passthrough: C | P | C. React type omits size (input-text.tsx:21-24) though rest spread at :65.
12 Event surface: N-A | P | C. React Prime onInput(event, validatePattern)/onBeforeInput/onKeyDown/onPaste (InputTextBase.js:23-26); validatePattern arg missing; Vue update:modelValue/value-change (+ focus/blur extras).
13 keyfilter/validateOnly: N-A | P | N-A. R InputTextBase.js:22,29. Ultimate excludes prop but packages/react/src/key-filter/key-filter.ts:64-104 exports useKeyFilter(inputRef,{pattern,validateOnly,when}) using keypress+paste (validateOnly skips keypress, paste still blocked); no beforeinput/Android path, no validation-result output (R keyfilter/KeyFilter.js:22-92). NG/Vue use separate KeyFilter directive -> N-A.
14 tooltip/tooltipOptions: N-A | P | N-A. Ultimate composition: packages/react/src/tooltip/tooltip.tsx:15-28 (target,content,position,event,delays,...), mounts listeners once (:81-92), assigns no top/left (:144-156; inventory react-overlays-notifications/README.md:83) so anchoring deficient; lacks mouseTrack/showOnDisabled/autoHide/updateDelay (R Tooltip.js:76,84,88,191).
15 iconPosition visible icon positioning: N-A | N-A | N-A. Per user ruling (via lead): prop only exposed to pt metadata context (R InputText.js:21), no visual effect; pt context is tracked under row 18.
16 Theme CSS state coverage: C | P | P. NG uses shared uix-styles inputtext (packages/uix-styles/src/inputtext/index.ts:27-78); React hardcoded fallbacks, no placeholder/sm/lg (input-text-style.ts:3-27); Vue lacks placeholder/sm/lg/filled hover (input-text-style.ts:14-34).
17 data-p hook: C | N-A | M. NG input-text.ts:127-133; V InputText.vue:2,31-38; Ultimate Vue none.
18 pt (incl. iconPosition pt context): M | M | M (D-PT). N inputtext.ts:37,90-91,105; R InputText.js:16,21; V BaseInputText.vue:7 via BaseInput; NG excludes (base-component.ts:21-24).
19 ptOptions: M | M | M (D-PT). N `basecomponent/basecomponent.ts:54,60,66,72` declares dt/unstyled/pt/ptOptions; R `componentbase/ComponentBase.js:420-423` defaults pt/ptOptions/unstyled only (no dt key; `cx` gated by isUnstyled at `:507-513`); VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt. X NG `packages/ng-core/src/basecomponent/base-component.ts:21-24` excludes pt/ptOptions; `:35-36` declares dt/unstyled without applying them (`:50-53`); X React `packages/react-core/src/base/component-base.ts` and Vue `packages/vue-core/src/base/base-component.ts:30-42` have no pt/ptOptions/unstyled/dt.
20 unstyled: P | M | M (D-SHARED #5). NG base-component.ts:36, cx not suppressing on unstyled (:50-53); R InputText.js:16,25 passes isUnstyled; Vue packages/vue-core/src/base/base-component.ts:30-42 none.
21 dt: P | N | M (D-SHARED #5). NG base-component.ts:35 declared not applied; PrimeReact has no dt (R `componentbase/ComponentBase.js:420-423` defaults pt/ptOptions/unstyled only (no dt key; `cx` gated by isUnstyled at `:507-513`)); VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt; X Vue none (style modules use preset dt() tokens, not per-instance).
22 Aura token consumption and preset key (D-SHARED #1, ADR-067): C | P | C | NG packages/ng/src/input-text/input-text-style.ts:1-51 imports shared uix-styles/inputtext, key inputtext; React packages/react/src/input-text/input-text-style.ts:1-51 no dt(), registers input-text (not Aura key inputtext); Vue packages/vue/src/input-text/input-text-style.ts:1-87 22 dt() calls, key inputtext; keys at aura/index.ts:144; ADR-067 docs/architecture/DECISIONS.md:787-803 applies, not an exception. Source-only.

## Reference defects

- docs/prime-reference/components/inputtext.md lists p-inputtext-sm/-lg for PrimeReact but InputTextBase.js:5-11 emits none.
- Doc 'Visual size' row mixes three mechanisms.
- PrimeNG filled class derives from variant not value (N inputtext.ts:125).
  No verdict depends on them.

## Decisions/rulings needed (reference-side)

- Row 5 React: whether theme-CSS-only sm/lg counts as Prime offering size.
- Row 9 NG: whether PrimeNG variant-derived filled is the oracle or value-derived.

## Unresolved (exact checks; none counted U)

- Row 14 React: runtime check that tooltip positions near input with top/left.
- Row 6 Vue: confirm no provider via grep 'provide' of packages/vue/src for a Fluid component (glob found none).
- Row 2/5 N line anchors: now exact (inputtext.ts:17,37,63,69,75,81,83,118,125).

## Limits

Source-read only; no runtime, visual or AT verification. Inventory lines corroborate only.
