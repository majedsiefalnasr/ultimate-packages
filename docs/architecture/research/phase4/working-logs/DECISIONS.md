# Phase 4 Gap Analysis: Method and Decisions (reconstructed)

Status: reconstructed 2026-11-17 from decisions the user agreed in chat. Outside the repo; no repo writes.
Repo: Ultimate (branch develop). Pinned revision: 91a8472547e34c6e92456f2b98270a1555e3a2db.
Scope: gap analysis + evidence documentation only. Product fixes and prioritization are Phase 5. No specs, tickets, or publishing.

## Method (agreed)

1. Scope: components (100 Prime reference families) AND shared foundations (primeuix utils/styled/styles/motion; presets Aura/Lara/Material/Nora; Ultimate has Aura only). Shared foundations are the target architecture for Angular, React and Vue in Ultimate. Compare the capability Prime gives each framework vs how Ultimate provides it. Implementation location alone is not a gap; presence of a shared foundation does not prove a framework uses it: verify actual use.
2. Unit: capability within a component, per framework. Component summary aggregates.
3. Oracle per framework: Angular=PrimeNG 21.1.9, React=PrimeReact 10.9.9, Vue=PrimeVue 4.5.5 (ADR-048). Cross-framework differences in Prime are reference facts (not a gap where Prime lacks it).
4. Mapping by function/behavior, not names. Record basis + evidence on both sides. Unclear mapping stays pending.
5. Classes: complete / partial / missing / intentional architectural difference / not applicable, plus "unresolved" when evidence is insufficient. Classification is separate from verification level. Name/API presence without working implementation is not complete.
6. "Intentional difference" only with an accepted in-force ADR or explicit user ruling. Old comments, phase non-goals, and superseded ADRs (030/031/039/040) are context only.
7. "N/A" only when the capability is absent from that framework's Prime reference or its technical condition does not apply, with a documented reason. Deliberately not offering a Prime capability = intentional difference needing a decision.
8. Known product defects factor into the verdict (broken/unwired is not complete). Link the existing inventory record; state source-read vs test.
9. Verification limits travel with each evidence item. Env failures are not product defects; PostCSS-disabled passes are not visual proof. Missing evidence = unresolved + required check noted.
10. Equivalent behavior with different API shape counts as complete; document the usage difference.
11. Prime's own defects (docs vs pinned source) = "reference defect". Pinned source wins over docs. If it affects classification: unresolved until the user rules. User ruling (turn 30): decide each reference defect as it appears.
12. Platform tools (CLI/MCP/metadata/AI) are a separate track.
13. One pinned Ultimate revision; keep prior evidence's revision/limits.
14. Pilot first, review in chat before generalizing.
15. Component summary = distribution per framework; no percentages or single verdict.
16. Limited runs of existing checks allowed without modifying product/config; setup needed = blocker, unresolved.
17. Refinements (approved): default-value difference is a flag on the item, not a 6th class (complete if configurable to match Prime, else partial); read implementation before classifying; use the pinned Prime archive when classification depends on defaults/presence, record incompleteness, or docs/source conflict; items blocked by superseded ADRs = "missing" + per-family decisions-needed appendix.

## D-PT (user decision)

`pt` and `ptOptions` are separate capability rows. Each is **missing** wherever the corresponding Prime oracle offers it, and **n/a** where Prime does not. Implementation scope/timing is Phase 5.

## D-SHARED (cross-cutting findings, recorded once; family reports reference by number)

1. React Aura-token architecture: under ADR-067 (`docs/architecture/DECISIONS.md:787-803`), React components with an Aura style module must consume tokens through `dt()` and register the correct preset key. Exceptions are mention, multi-state-checkbox, tri-state-checkbox, data-scroller, button-group, scroll-top, scroller, and table. Record each component's actual style-module/key evidence; do not apply a blanket verdict from this rule. User ruling 2026-11-21 (option B): every non-exception React family report carries an explicit Aura-token row (NG/Vue C where `dt()` paths resolve, React P + architecture with the style-file and registration-key evidence). Applied to the 23 reports that had none: checkbox, radiobutton, inputnumber, inputotp, slider, card, knob, speeddial, splitter, tieredmenu, splitbutton, menubar, confirmpopup, contextmenu, megamenu, blockui, inputtext, drawer, popover, orderlist, panelmenu and the Dialog and Tabs pilots. Reports that already count an equivalent row (e.g. visual-paint or token-wiring rows in ToggleSwitch, SelectButton, ToggleButton, ProgressSpinner, ScrollPanel) were left unchanged; InputMask and AvatarGroup have no Aura key and were not given a row. Counts were recomputed mechanically from each report. Normalization (same date, user-approved): the React Aura-token cell is P in every family; Breadcrumb, Dock, OrganizationChart and Panel moved M→P and FloatLabel N→P (React 1/4/3/0/5/0).
2. Vue attribute fall-through loss: components that disable inheritAttrs without rebinding $attrs drop root attributes (id/class/aria). Counted missing/partial per family where Prime forwards them.
3. Input/field state-class mismatches: producers and dependent field styles use inconsistent root/state class names (e.g. Angular InputText emits `u-inputtext`, `p-filled`, `p-invalid` at `packages/ng/src/input-text/input-text-style.ts:38-42`, while IftaLabel/FloatLabel styles target `u-input-text`, `u-filled`, `u-invalid` at `packages/ng/src/ifta-label/ifta-label-style.ts:30,40` and `packages/ng/src/float-label/float-label-style.ts:42-45,111`; Vue InputText emits `u-input-text`, `p-invalid` at `packages/vue/src/input-text/input-text-style.ts:76-79`, while related label styles target `u-filled`/`u-invalid` at `packages/vue/src/ifta-label/ifta-label-style.ts:33,43` and `packages/vue/src/float-label/float-label-style.ts:43-46,112`). Record concrete producer/consumer evidence and classify each affected family row independently; this cross-cutting note alone does not establish impact or verdict.
4. `unstyled` and per-instance `dt` are separate capabilities. Ultimate Angular declares these inputs but does not consume them, so each is partial. Ultimate React and Vue lack unstyled mode, so those cells are missing. For per-instance `dt`, React is N/A where its PrimeReact oracle has no `dt` API; otherwise React/Vue without a matching product input are missing.
   Item 4 (default-value differences) is covered by method item 17: record as a row flag, not a separate class.

## Open rulings

- Knob arrows: user agreed (turn 30) that using `step` = complete, with Prime source difference (literal ±1 in pinned PrimeNG/PrimeReact vs docs "step") recorded as reference defect. Applied and verified in batch3: NG 6/5/3/0/0/0, React 6/4/3/0/1/0, Vue 7/4/3/0/0/0.
- Old unresolved rows: ImageCompare Vue slider naming, Fieldset NG label association and Avatar React image failure were ruled 2026-11-18 (see entries below). Card NG root class/style was settled for class and style by the 2026-11-21 Angular host probe (see the Card entry below).

## Batch 4 reference-defect rulings

- Breadcrumb Angular: user chose pinned source over documented promises for `aria-current` and hidden separators. These absent Prime capabilities are N/A for Prime parity; record Ultimate additions separately. This ruling does not establish accessibility quality.
- Menubar Angular: user chose pinned PrimeNG source for nested roles (`menubar` in Prime versus `menu` in Ultimate). Record documentation conflict as reference defect; broader ARIA result remains partial.
- Menubar React: user chose pinned PrimeReact source for root-list naming; do not require the documented label forwarding absent from source. Other ARIA differences must have independent evidence before sustaining partial.
- These are individual rulings, not blanket authorization to resolve future reference defects.

## Batch 5 reference-defect rulings

- Drawer fullscreen: compare the user-visible full-screen effect as one capability. `position="full"` counts as equivalent where source evidence supports viewport fill; PrimeNG's mismatch between the `fullScreen`-driven class/animation and `position="full"`-driven `data-p` state is recorded as a reference defect, not a separate required API (user agreed during batch 5 review).
- PanelMenu Angular nested roles: use pinned PrimeNG source (`tree`) as the oracle over reference docs (`group`); where Ultimate also uses `tree`, classify that role behavior complete and record the docs/source conflict as a reference defect. Keep independent header/region accessibility gaps separate (user agreed during batch 5 review).
- OrganizationChart Vue `selectable:false`: use pinned PrimeVue runtime over docs. Since the reference source emits selection despite the flag, classify the capability “ignore click when selectable=false” as N/A for PrimeVue and record the docs/source conflict; Ultimate's stricter blocking behavior is an Ultimate-specific extra (user ruled during batch 5 review).
- OrganizationChart React `expanded:false`: PrimeReact source suppresses child rendering for nodes with `expanded === false`, while Ultimate permits opening such a node through its toggle. Classify the row partial and record a PrimeReact reference defect (user ruled during batch 5 review).
- ConfirmPopup trigger `aria-expanded` / `aria-controls`: pinned NG/React/Vue sources do not add these despite docs. Classify N/A in all three and record a docs/source reference defect (user ruled during batch 5 review).
- ConfirmPopup React root role/`aria-modal`: pinned PrimeReact source sets neither despite docs; classify the docs-promised capability N/A for PrimeReact and record Ultimate React's `role="alertdialog"` as an extra (user ruled during batch 5 review).

## Batch 6 reference-defect rulings

- Mention React ARIA (user approved 2026-11-18): use pinned PrimeReact source, which implements none of the docs-promised combobox/listbox roles and ARIA. Classify row 23 N/A, record the docs/source reference defect, and record Ultimate's existing ARIA as an extra. No product changes or accessibility-quality conclusion follow from this ruling. Mention React distribution becomes 4/9/12/1/2/0 (C/P/M/I/N/U).

- InputGroup Angular `fluid` property (user approved 2026-11-18): classify activation via a component `fluid` input N/A. Pinned PrimeNG InputGroupStyle checks `instance.fluid` (inputgroup/style/inputgroupstyle.ts:45), but InputGroup and its BaseComponent expose no such property. Record the unreachable class condition as a reference defect. This ruling does not classify other full-width layout mechanisms.

- InputText React visual `iconPosition` (user approved 2026-11-18): row 15 N/A for visible icon positioning. Pinned InputTextBase.js:30 declares the prop; InputText.js:21 only exposes it to pt metadata context. There is no built-in visual position behavior. Document this API/behavior limitation and retain pt-context coverage under the separate pt row. Do not label the prop entirely unused.

- BlockUI full-screen coverage (user approved 2026-11-18): row 2 P in Angular, React and Vue. Inline fixed masks can be constrained by an ancestor establishing a fixed-position containing block; pinned Prime appends/moves the mask to body. Judge observable coverage, not portal placement alone. Source-based finding; transformed-ancestor browser verification remains unrun. Final BlockUI C/P/M/I/N/U: NG 3/4/5/0/3/0; React 3/5/6/0/1/0; Vue 5/3/5/0/2/0.

- KeyFilter preset semantics (user approved 2026-11-18): row 03 stays P [default-differs] in React and Vue. Prime tests the single typed character against preset regexes; Ultimate tests the would-be value (e.g. `-` accepted only at start; Vue alphanum case-insensitive vs PrimeVue case-sensitive). No in-force ADR, so not I. Counts unchanged: NG 10/1/4/0/2/0; React 8/3/2/0/4/0; Vue 8/3/2/0/4/0.

- Card NG root class/style (user approved 2026-11-18): the deprecated `styleClass` input is not itself a gap. Native `class` and `style` on the host are the functional replacement, and the row is complete only if a runtime check confirms they coexist with the component root class `u-card u-component` and update dynamically. Until that check runs, the row stays U. Do not classify it as partial merely because the name differs. Resolved 2026-11-21: a jsdom host probe confirmed that consumer static and dynamic `class` and `style` coexist with `u-card u-component` and update dynamically. Aria and other root attributes were not probed.

- ImageCompare Vue slider naming (user approved 2026-11-18): row classified complete + reference-defect. Pinned PrimeVue and Ultimate Vue both bind aria-label/aria-labelledby to the root, not the slider; docs promise slider naming and their example IDs mismatch (docs/prime-reference/components/imagecompare.md:68). Pinned source wins over docs. Ultimate NG does label its slider (PrimeNG labels root only): recorded as a cross-framework difference with no accessibility-quality conclusion. ImageCompare Vue becomes 4/1/4/0/1/0.

- Fieldset Angular region label association (user approved 2026-11-18): row 10 complete + reference-defect by parity with pinned PrimeNG. Both implementations point aria-labelledby at the conditional toggle button id, leaving a dangling reference when non-toggleable (Ultimate `packages/ng/src/fieldset/fieldset.ts:37-62`; PrimeNG `fieldset/fieldset.ts:43-87`). This establishes source parity only, not accessibility quality. Angular Fieldset distribution becomes 6/2/7/0/2/0.

- Avatar React image failure (user approved 2026-11-18): row 4 complete + reference-defect. Ultimate falls back to label/icon on every image error (`packages/react/src/avatar/avatar.tsx:33-42`), matching docs avatar.md:53,100; pinned PrimeReact suppresses built-in fallback when `onImageError` is supplied (`avatar/Avatar.js:61-74`). Pinned source wins for the contract but the contradiction with its own docs is a reference defect; no gap counted. imageFallback is a separate row. Avatar React becomes 5/4/5/0/1/0.

- ToggleButton React role/state (user ruling 2026-11-18): row 16 is C + reference defect. Pinned PrimeReact source and Ultimate both expose a checked native checkbox; the published PrimeReact example claims button/aria-pressed. Use pinned runtime source as oracle. Accessible naming and keyboard behavior remain separate rows. After splitting the required style-control rows and React row 33, ToggleButton has 42 rows: NG 13/3/13/0/12/1, React 11/3/16/0/12/0, Vue 23/1/9/0/9/0. Angular row 33 remains U pending runtime class coexistence evidence.

- SelectButton Vue dedicated focus/blur emits (user ruling 2026-11-18): row 15 is N + reference defect. Pinned PrimeVue `SelectButton.vue:32-37` emits only `change`; the declaration `SelectButton.d.ts:254-261` lists focus/blur without runtime support. Ultimate's lack of dedicated component emits matches the pinned implementation. Native DOM focus/blur listeners on the root are a separate capability. After separating `pt`, `ptOptions`, `unstyled` and `dt`, SelectButton has 34 rows: NG 10/4/14/0/6/0, React 10/2/14/0/8/0, Vue 10/2/13/0/9/0.

- InputNumber Vue `getFormatter` (user ruling 2026-11-18): C + reference defect. Pinned PrimeVue runtime exposes a computed formatter and Ultimate does likewise; PrimeVue types/docs call it a method. Runtime source wins. InputNumber counts NG 2/7/16/0/4/0, React 3/13/8/0/5/0, Vue 4/10/14/0/1/0 (29 rows) after separating PT, ptOptions, unstyled and per-instance dt; with the 2026-11-21 Aura-token row (D-SHARED #1 ruling): 30 rows, NG 3/7/16/0/4/0, React 3/14/8/0/5/0, Vue 5/10/14/0/1/0.

- Password strength live-region announcement (user ruling 2026-11-18): NG and React rows N + reference defect, separately. Pinned sources have no live region though docs promise announcements. After the dedicated forms-integration audit and four-row style-control split, Password (25 rows) counts were NG 5/6/10/0/4/0; React 3/9/7/0/6/0; Vue 6/4/11/0/4/0; after the 2026-11-19 broken-dt ruling added an Aura-token row, Password (26 rows) is NG 5/7/10/0/4/0, React 3/10/7/0/6/0, Vue 6/5/11/0/4/0.

- Slider keyboard behavior (user ruling 2026-11-18): use each pinned source, not conflicting documentation. NG and Vue rows P because product arrows match source but configured-step paging differs. React row P because product's Home/End min/max behavior corrects PrimeReact's out-of-bound source calculation in some min/step/range cases. Document each Prime reference discrepancy. Current source-based Slider counts after four-row style-control split: 17 rows; NG 1/11/4/0/1/0; React 3/6/4/0/4/0; Vue 1/8/7/0/1/0. With the 2026-11-21 Aura-token row (D-SHARED #1 ruling): 18 rows; NG 2/11/4/0/1/0; React 3/7/4/0/4/0; Vue 2/8/7/0/1/0.

- Slider React `aria-valuenow` (user ruling 2026-11-18): compare the documented actual-value meaning; product outputs actual value whereas pinned PrimeReact outputs percentage position. Record reference defect. The combined accessible-value/name row remains P because the product does not forward an accessible name. Count contribution remains P.

- Slider NG animation (user ruling 2026-11-18): N/source note. PrimeNG toggles `p-slider-animate`, but pinned styles have no corresponding selector/effect. Do not count absence as product gap; retain evidence that the upstream API class is inert.

- PrimeReact dedicated forms integration for Rating, InputOtp, Slider, InputNumber and Password: no dedicated field registration, context, or adapter exists. Generic controlled props/events are manual integration only. Their framework forms-integration rows are N/A. Pinned declarations `components/lib/ts-helpers.d.ts:7-13,23-30` define event payload types only; each component types/source were separately audited. This resolves the React forms U rows for InputNumber, InputOtp, Password and Slider.

- Rating React role/checked-state capability (user ruling 2026-11-18): N/A + reference defect. Pinned PrimeReact source has focusable divs without radio semantics although its docs promise hidden radios. Record Ultimate's radio semantics as extra behavior; this is not an accessibility-quality conclusion.

- Rating React locale-driven star labels (user ruling 2026-11-18): N/A + reference defect. Pinned source provides neither built-in labels nor localization although the docs promise locale labels. Record Ultimate's English labels as extra behavior, not localization.

- Rating React standard Space activation (user ruling 2026-11-18): N/A + reference defect. PrimeReact tests `event.key === 'Space'` while standard React space input is `' '`; product handles `' '`. Record product support as extra behavior. Clear-on-reactivation remains separate.

- InputOtp React standard focus/blur callbacks (user ruling 2026-11-18): N/A + reference defect. Types/docs advertise `onFocus/onBlur`, but pinned runtime invokes only undocumented `focus/blur` properties. Record the runtime hooks as a source note; Ultimate has no callbacks.

- InputOtp React root attribute forwarding (user ruling 2026-11-18): N/A + reference defect for broad HTML props/className declared by PrimeReact types but not consumed by pinned runtime (root uses its own class, ref, style and PT). Ultimate's explicit className support is an extra, but general arbitrary-attribute forwarding is absent. DOM output remains unverified.

- InputOtp Angular Tab in integerOnly mode (user ruling 2026-11-18): P + reference defect. Compare the pinned source: its integer-only key filter blocks Tab despite the docs promise, whereas Ultimate allows leaving. Other arrow/navigation and digit-filtering support exists, but this combined keyboard row differs. Source only; focus movement not browser-verified. After separating `pt`, `ptOptions`, `unstyled` and `dt`, InputOtp has 15 rows: NG 0/10/4/0/1/0, React 2/5/4/0/4/0, Vue 6/2/6/0/1/0; with the 2026-11-21 Aura-token row (D-SHARED #1 ruling): 16 rows, NG 1/10/4/0/1/0, React 2/6/4/0/4/0, Vue 7/2/6/0/1/0.

## Counting convention

Each family matrix includes four separate rows: `pt`, `ptOptions`, `unstyled`, and per-instance `dt`. Do not combine `pt` with `ptOptions` or `unstyled` with `dt`. Earlier ScrollPanel and Badge reports combined both pairs; normalize them and recalculate their distributions.

## Additional rulings (user approved 2026-11-19)

- Dialog NG block-scroll (user ruling): row P, following pinned PrimeNG source. Ultimate (`packages/ng/src/dialog/dialog.ts:343-349`) locks scroll whenever visible and has no `blockScroll` input; PrimeNG (`dialog/dialog.ts:263,751-763,784-796`) declares `blockScroll=false` but locks when `modal`, reading `blockScroll` only on maximize of non-modal dialogs. Docs `docs/prime-reference/components/dialog.md:53` conflict with source: recorded as a reference defect. Source-only; no runtime check.

- RadioButton React `onClick` (user ruling): N + reference defect. PrimeReact declares it in types (`radiobutton/radiobutton.d.ts:70-73`, `RadioButtonBase.js:30-32`) but the pinned runtime neither invokes nor forwards it (`componentbase/ComponentBase.js:441`, `RadioButton.js:24-182`). After splitting mandatory method rows, the final 19-row counts are NG 3/4/10/0/2/0, React 5/0/10/0/4/0, Vue 8/2/4/0/5/0.

- InputNumber/Password integration with FloatLabel/IftaLabel (user ruling): not a new counted row. Kept as cross-cutting note D-SHARED #3 to avoid double counting existing invalid-state rows. Producers emit `p-invalid`/`p-filled` (React `u-inputnumber-invalid`/`u-password-filled`), consumers expect `u-invalid`/`u-filled`. Source-only; no runtime check. Apply the same note-only treatment to Chips' label-state hook mismatch: Batch2 Chips row 28a was removed from the count because the problem overlaps existing focus/invalid/style rows and is the same shared label integration; evidence remains in `batch2/chips.md`.

- PrimeVue Dialog `modal` default (user approved 2026-11-19): record as a default-value flag under method rule 17, not a class conflict. PrimeVue `BaseDialog.vue:21-24` defaults to null (false-like); Ultimate defaults to true. This does not create a classification U.

- MeterGroup Vue sizing precision (user ruling 2026-11-19): row 2 = P, follow pinned PrimeVue runtime using fractional dimensions; record the conflicting documentation claim that dimensions are rounded as a reference defect.
- MeterGroup Vue legend icon slot (user ruling 2026-11-19): row 12 = N/A for PrimeVue runtime, with a reference defect. The internal label component declares an icon slot, but the MeterGroup root does not forward it; Ultimate Vue also does not expose it.
- MeterGroup React/Vue equal bounds (user ruling 2026-11-19): row 20 = C; keep Ultimate's guard that returns 100 as a safer extra and record pinned Prime's division-by-zero/NaN behavior as a reference defect.
- TriStateCheckbox React null state (user ruling 2026-11-19): row 8 = C + Prime reference defect. Ultimate emits `aria-checked="mixed"`; pinned PrimeReact emits `false` for null. Count the component's indeterminate state capability as complete; do not treat the Prime source result as the required contract.
- Checkbox and RadioButton matrices (user-approved method application 2026-11-19): split `pt`, `ptOptions`, `unstyled`, and per-instance `dt` into separate rows. Counts after split are in `batch7/checkbox.md` and `batch7/radiobutton.md`.
- Tabs Vue Home/End (user ruling 2026-11-19): row 3 = C following all three pinned Prime runtimes (Home→first, End→last); record the docs reversal as a reference defect. Angular and React remain P because they also lack PageUp/PageDown.
- Runtime theme switching (user ruling 2026-11-19): P in Angular, React and Vue, recorded in the shared-foundation track (not a family row). Prime subscribes to `theme:change` (PrimeNG `basecomponent.ts:395-401`, PrimeVue `BaseComponent.vue:208-215`); Ultimate emits it (`packages/uix-styled/src/config/index.ts:53-76`) but nothing subscribes. No ADR accepts set-before-mount only. Source-only.
- Broken `dt()` token references (user ruling 2026-11-19): include in family reports. Aura-token rows drop C→P in Angular and Vue for affected families (date-picker, file-upload, password, select, multi-select, listbox, cascade-select, color-picker, rating) per exact lines in `foundations/shared-foundation-audit.md`. Families not yet reported apply this when analysed.
- Broken-dt application (lead, 2026-11-19): CascadeSelect row21 NG C→P (NG 9/8/10/0/1/0); ColorPicker row26 unchanged P|M|P (only `preview.border.color` is broken; `panel.border.color` resolves via Aura colorScheme); Password and Rating gained an Aura-token row (Rating 26 rows: NG 7/9/7/0/3/0, React 4/3/8/0/11/0, Vue 5/6/10/0/5/0). React cells in those new rows are P under D-SHARED #1/ADR-067 (hand-authored CSS, no `dt()`), same basis as CascadeSelect row21 React.
- ConfirmDialog React role (user ruling 2026-11-20): N + reference defect. Pinned PrimeReact renders Dialog `role="dialog"` (`dialog/Dialog.js:668-671`); docs promise alertdialog. React 6/2/9/0/2/0 (19 rows).
- Tooltip `aria-describedby` (user ruling 2026-11-20): N + reference defect in NG, React and Vue; pinned sources never write it; Ultimate's linkage is an extra. Tooltip (18 rows) NG 5/5/7/0/1/0, React 7/5/4/0/2/0, Vue 9/4/4/0/1/0.
- Toast React `group` routing (user ruling 2026-11-20): N + reference defect; typed in `toast.d.ts:107-110` but not routed in `Toast.js:34-38,117-177`. Toast React 8/3/8/0/4/0 (23 rows).
- ConfirmDialog PrimeNG `defaultFocus` (user ruling 2026-11-20): stays U, deferred runtime check (selector `.p-confirm-dialog-accept` vs template class `p-confirmdialog-accept-button`). ConfirmDialog NG keeps 10/2/6/0/0/1. Superseded 2026-11-21: see the ConfirmDialog focus entry below (user approved N + reference defect, NG 10/2/6/0/1/0).
- DatePicker `aria-selected` NG row 21 (user ruling 2026-11-20): N + reference defect; pinned PrimeNG day cell lacks it, Ultimate's binding is an extra.
- DatePicker weekday `abbr` rows 22 NG/React (user ruling 2026-11-20): N + reference defect each. DatePicker (32 rows) NG 6/9/14/0/3/0, React 5/7/16/0/4/0, Vue 7/8/15/0/2/0.
- FocusTrap `pt`/`ptOptions` NG/Vue (user ruling 2026-11-20): N + reference defect (declared, never applied). FocusTrap `unstyled`/`dt` (user ruling): N in all three, KeyFilter precedent. FocusTrap (13 rows) NG 1/1/1/0/10/0, React 3/2/1/0/7/0, Vue 4/2/2/0/5/0 (verify mechanically).
- Carousel NG Home/End (user ruling 2026-11-20): N + reference defect; PrimeNG declares onHomeKey/onEndKey but never calls them. Carousel NG 11/4/12/0/1/1 (one other U remains, verify). Superseded count: batch8/carousel.md now records NG 12/4/12/0/1/0, so no U remains in that report.
- Editor (user ruling 2026-11-20): rows stay M; no ADR defers Editor, so none are I. ADR-055 requires its own Spec and Plan.
- Select Vue `content` slot, row 33 (user ruling 2026-11-20): N + reference defect; PrimeVue declares it in `Select.d.ts` but `Select.vue` never reads `$slots.content`. Select Vue becomes 7/13/13/0/2/0 (35 rows); verify the in-file distribution section, which is stale (still 33 rows).
- AutoComplete NG `aria-haspopup` (user ruling 2026-11-19, recorded late 2026-11-20): N + reference defect. PrimeNG docs promise `aria-haspopup=listbox`; pinned `autocomplete.ts:76-110` omits it; Ultimate also omits it. AutoComplete NG 4/9/20/0/1/0 on the 34-row draft (final 36-row draft: NG 5/10/20/0/1/0, React 6/6/16/0/8/0, Vue 8/6/19/0/3/0).
- Menu popup trigger ARIA, row 23 (user ruling 2026-11-20): N + reference defect in NG, React and Vue; pinned sources never write aria-expanded/haspopup/controls though docs/prime-reference/components/menu.md:123 promises them. Menu (30 rows) NG 10/11/8/0/1/0, React 17/6/5/0/2/0, Vue 19/2/8/0/1/0.

## Additional rulings (user approved 2026-11-21)

- Steps Angular list element, row 18 (user ruling, option A): N + reference defect. Pinned PrimeNG renders `<ul>` although docs say ordered list; pinned source wins.
- Steps React `aria-current`, row 17 (user ruling, option A): N + reference defect. Pinned PrimeReact writes it only through template options; Ultimate's attribute is an extra.
- Steps Vue keyboard activation (user ruling, option B): split activation (row 15, P for missing Space) from index correctness (new row 15b, C + reference defect, since pinned PrimeVue emits an undefined index on Enter/Space). Row 15b added as C in Angular and React to keep the matrix rectangular. Steps (27 rows) NG 11/8/2/0/6/0, React 11/5/7/0/4/0, Vue 9/6/8/0/4/0.
- Button React ripple, row 22 (user ruling, option A): M. No in-force ADR exists; superseded ADR-031 is context only.
- Button Vue tooltip, row 17 (user ruling, option A): N; Ultimate's `v-tooltip` is recorded as an extra.
- Ripple Angular/Vue visual CSS (user ruling, option A): P. Product activates ink but ships no structural CSS. The Vue comment saying the theme defines `.u-ink-active` is a note, not evidence.
- Ripple React (user ruling, option A): M; no I without an in-force ADR. Consistent with the Button React ripple ruling.
- ScrollTop transition, row 3 (user ruling, option A): P in all three; animation is a Prime capability.
- ScrollTop icon override, row 4 (user ruling, option A): P in all three.
- ScrollTop styling, row 10 (user ruling, option A): Angular/Vue P; React I covers token consumption only (ADR-067) and is not extended to omitted transitions.
- Terminal input accessible name, row 8 (user ruling, option A): the docs-promised input label is N + reference defect (pinned sources place attrs on the root). The row now measures root attribute forwarding: NG C, React P (className only), Vue M (`inheritAttrs:false`, D-SHARED #2). The row classifications were derived by the agent from the ruling and source and are source-only. Terminal (13 rows) NG 6/2/3/0/2/0, React 6/2/3/0/2/0, Vue 6/0/5/0/2/0.
- Terminal autofocus NG, row 6 (user ruling, option A): stays P; counted as a capability gap.
- Tag Angular consumer class, row 08 (user ruling, option A): stays U until a permitted runtime check, following the Card Angular precedent. Resolved 2026-11-21 by the same host probe (class only).

## Foundation ledger and Table pilot rulings (user approved 2026-11-21)

- Foundation ledger (`foundations/shared-foundation-audit.md` §8): the user approved every proposed class as written. F4 = M/M/M (C2); F6 = P/P/P (C3); F10 = P/P/P (C6); F13 = P/P/P (C7); F9 = P/P/P (C8); F3, F12, F14 and the C4 reading of F7 unchanged.
- Table pilot (user ruling, option C): extend `pilot/table.md` with the four capability areas most likely to hide gaps: keyboard and ARIA, `scrollable`/`scrollHeight`, and the global filter. The other excluded capabilities stay excluded and documented as not researched.

## ConfirmDialog focus and Timeline root (2026-11-21)

- ConfirmDialog Angular row 8, initial focus target (user approved, recommended option): N + reference defect. Pinned PrimeNG declares `defaultFocus` and queries `.p-confirm-dialog-accept` and `.p-confirm-dialog-reject`, but its template and style map apply `p-confirmdialog-accept-button` and `p-confirmdialog-reject-button`, so the advertised focus target is not rendered by default. Pinned source wins over the documented promise.
- Timeline Angular row 8, root class and style (agent judgment, not a user ruling): C, following the user-approved Card ruling by precedent. Pending the user's objection.

## Closeout decision (user approved 2026-11-21)

At the end of Phase 4, one curated closeout document is saved inside the product repository under `docs/` (for example `docs/architecture/research/`), containing the evidence synthesis, rulings and reference defects. The raw archive is then deleted as the user previously directed (local and remote). This is the only planned exception to the no-repo-writes rule. It happens only after the synthesis is reviewed, on a new branch from `develop`, and each repo write or push still needs its own authorization (AGENTS.md section 5.1). Nothing is written to the repository before then.
