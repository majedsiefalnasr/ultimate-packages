# Vue Component Status

Current-state tracking for `@ultimate/vue`, created per the approved Phase C Batch 1 Implementation Plan's own resolution of the React/Vue current-state-tracking gap (`docs/superpowers/plans/2026-09-17-phase-c-batch-1-migration-implementation.md` §1.1, Task Group Z / §8). No committed Vue-equivalent of `docs/architecture/COMPONENT_INVENTORY.md` existed before this file.

**Origin of this file's scope:** every component `@ultimate/vue` shipped **before** Phase C Batch 1 (9 components), Vue Badge (the Batch 1 infrastructure-prefix item), the 76 Vue capabilities closed by Batch 1, Vue InlineMessage from Batch 2 (1), and OrderList, PickList, DataView, and OrganizationChart from Batch 3 (4). Confirmed against direct inspection of `packages/vue/src/`: **94 top-level directories** = 9 baseline + 1 Badge + 79 Batch 1 directories (76 capabilities, with Accordion occupying four directories) + 1 Batch 2 + 4 Batch 3. No capability listed here is outside its approved framework eligibility, and no implemented Vue capability is omitted.

**Note on Vue's decomposed families:** unlike Accordion (4 separate top-level directories), Vue's Tabs and Stepper families are each implemented as multiple `.vue` files **within one top-level directory** (`tabs/` contains `Tabs.vue`, `TabList.vue`, `Tab.vue`, `TabPanel.vue`, `TabPanels.vue`; `stepper/` contains `Stepper.vue`, `StepList.vue`, `StepItem.vue`, `Step.vue`, `StepPanel.vue`, `StepPanels.vue`) — confirmed by direct directory-content inspection, not assumed from the Plan's own file-pattern description. Splitter has no separate `splitter-panel/` directory; real PrimeVue's `SplitterPanel` child-scanning was replaced with an explicit `panels: {minSize}[]` config array (disclosed reduction, matching the Accordion/PanelMenu precedent), so Splitter is a single top-level directory. Each of these three remains one canonical-capability row below regardless of its internal file count.

Schema (7 columns, matching `COMPONENT_INVENTORY.md`'s own schema minus its Angular-specific `UIX dependencies`/`Angular-specific responsibilities` columns, substituting one framework-specific-responsibilities column): **Component** | **Prime source path** | **Category** | **Dependencies** | **Framework-specific responsibilities** | **Migration classification** | **Migration phase** | **Risk**.

- **Migration classification:** `ADAPT` (incorporated, PrimeVue source is the design reference) — every row in this file is `ADAPT`.
- **Migration phase:** `Built (pre-existing)` (shipped before Phase C Batch 1) / `Built (Phase C Batch 1, Group A infrastructure)` (Vue Badge, sequenced first per spec §3.0/§5 item 1) / `Built (Phase C Batch 1)` (the 76 canonical capabilities, commits `28ecdb8..be9f35e`) / `Built (Phase C Batch 2)` / `Built (Phase C Batch 3)`.
- **Risk** is a qualitative flag, carried over from `COMPONENT_INVENTORY.md`'s own already-vetted per-capability risk rating where the capability is shared cross-framework; Low by default otherwise.

Real PrimeVue source paths are cited by top-level `<name>/` directory, per PrimeVue 4.5.5's own package layout (confirmed via this batch's own component doc comments, e.g. `Accordion.vue`'s citation of `.vendor-extracted/vue/accordion/Accordion.vue`) — the equivalent role `packages/primeng/src/<name>/` plays for `COMPONENT_INVENTORY.md`.

---

## Built (pre-existing) — 9 components

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Button (`UButton`) | `button/` | Primitive | vue-core base | `v-model`/`writeValue()`-equivalent not applicable (non-form primitive) | ADAPT | Built (pre-existing) | Low |
| Checkbox (`UCheckbox`) | `checkbox/` | Form | vue-core `createBaseInput` | First proven `createBaseInput` consumer (1-consumer proof at the time) | ADAPT | Built (pre-existing) | Low |
| Dialog (`UDialog`) | `dialog/` | Overlay | vue-core base, focus-trap, overlay, escape, motion | Composes `vue-core`'s overlay/focus-trap/escape/zindex/motion tiers directly | ADAPT | Built (pre-existing) | Medium |
| Menu (`UMenu`) | `menu/` | Navigation | vue-core base | Flat `<ul role="menu">` rendering of `UMenuItem[]`, roving tabindex | ADAPT | Built (pre-existing) | Low |
| Paginator (`UPaginator`) | `paginator/` | Data | vue-core base | Page-index/page-size state | ADAPT | Built (pre-existing) | Low |
| Ripple (`URipple`) | `ripple/` | Primitive/directive | vue-core `createDirective` | Attribute-directive-equivalent via `createDirective` factory | ADAPT | Built (pre-existing) | Low |
| Scroller (`UScroller`) | `scroller/` | Data | vue-core base | Virtual-scroll windowing, composed internally by Table/Paginator | ADAPT | Built (pre-existing) | N/A (shipped) |
| Table (`UTable`) | `table/` | Data | vue-core base, overlay tier, scroller, paginator | Sort/filter/select/virtualization state | ADAPT | Built (pre-existing) | N/A (shipped) |
| Tooltip (`UTooltip`) | `tooltip/` | Overlay | vue-core base, `createDirective` | Directive-style attribute API via `createDirective` | ADAPT | Built (pre-existing) | Low |

---

## Built (Phase C Batch 1, Group A infrastructure) — 1 item

Sequenced first per spec §3.0/§5 item 1, ahead of any Vue task depending on it (ConfirmDialog, ConfirmPopup, DynamicDialog, OverlayBadge, Toast). Not itself one of the 79 canonical capabilities.

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Badge (`UBadge`) | `badge/` | Primitive | vue-core base | Component form only, matching Angular `UBadge`'s functional role; unblocks Vue's OverlayBadge realization | ADAPT | Built (Phase C Batch 1, Group A infrastructure) | Low |

(`UConfirmationService`, `UDialogService`, `UToastService` — the remaining 3 Group A infrastructure items — live in `packages/vue-core/src/service/`, a foundation-tier package, not a `packages/vue/src/` component directory; not row-tracked here, consistent with this file's scope being `packages/vue/src/` components only, matching `COMPONENT_INVENTORY.md`'s own component-directory scope.)

---

## Built (Phase C Batch 1) — 76 capabilities

### Form (24 capabilities — all-3-framework-eligible or Vue-eligible subset)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RadioButton | `radiobutton/` | Form | vue-core `createBaseEditableHolder` | `createBaseEditableHolder` tier (no value/binary dichotomy) | ADAPT | Built (Phase C Batch 1) | Low |
| ToggleSwitch | `toggleswitch/` | Form | vue-core `createBaseEditableHolder` | Built fresh from real PrimeVue source; `createBaseEditableHolder` tier | ADAPT | Built (Phase C Batch 1) | Low |
| ToggleButton | `togglebutton/` | Form | vue-core `createBaseEditableHolder` | Built fresh from real PrimeVue source; `createBaseEditableHolder` tier | ADAPT | Built (Phase C Batch 1) | Low |
| InputText | `inputtext/` | Form | vue-core `createBaseInput` | `createBaseInput` tier (Angular already Built pre-batch; this is Vue's own realization) | ADAPT | Built (Phase C Batch 1) | Low |
| Textarea | `textarea/` | Form | vue-core `createBaseInput` | `createBaseInput` tier | ADAPT | Built (Phase C Batch 1) | Low |
| InputNumber | `inputnumber/` | Form | vue-core `createBaseInput` | `createBaseInput` tier (Angular already Built pre-batch; this is Vue's own realization) | ADAPT | Built (Phase C Batch 1) | Medium |
| InputMask | `inputmask/` | Form | vue-core `createBaseInput` | `createBaseInput` tier | ADAPT | Built (Phase C Batch 1) | Medium |
| InputOTP | `inputotp/` | Form | vue-core `createBaseInput` | `createBaseInput` tier, focus movement between cells | ADAPT | Built (Phase C Batch 1) | Medium |
| Password | `password/` | Form | vue-core `createBaseEditableHolder`, overlay | Strength-meter overlay, mask toggle | ADAPT | Built (Phase C Batch 1) | Low |
| AutoComplete | `autocomplete/` | Form | vue-core `createBaseEditableHolder`, overlay | Overlay list; `inputValue` derived independently of parent-tier `data()` (documented multi-tier-`data()` pitfall avoidance) | ADAPT | Built (Phase C Batch 1) | Medium |
| Select | `select/` | Form | vue-core `createBaseInput`, overlay | Overlay option list | ADAPT | Built (Phase C Batch 1) | Medium |
| MultiSelect | `multiselect/` | Form | vue-core `createBaseInput`, overlay | Overlay option list, chip display; `createBaseInput` (a real, confirmed tier divergence from Angular's `BaseEditableHolder`) | ADAPT | Built (Phase C Batch 1) | Medium |
| CascadeSelect | `cascadeselect/` | Form | vue-core `createBaseInput`, overlay | Nested overlay panels; real PrimeVue's own `CascadeSelect.vue`+`CascadeSelectSub.vue` 2-component recursive split, ported as `CascadeSelect.vue`+`CascadeSelectSublist.vue` | ADAPT | Built (Phase C Batch 1) | Medium |
| Listbox | `listbox/` | Form | vue-core `createBaseEditableHolder` | Option list, multi-select, not overlay-based | ADAPT | Built (Phase C Batch 1) | Medium |
| SelectButton | `selectbutton/` | Form | vue-core `createBaseEditableHolder` | Toggle-button group, not overlay-based | ADAPT | Built (Phase C Batch 1) | Low |
| Rating | `rating/` | Form | vue-core `createBaseEditableHolder` | Icon-based star input, keyboard arrow-stepping | ADAPT | Built (Phase C Batch 1) | Medium |
| Slider | `slider/` | Form | vue-core `createBaseEditableHolder` | Drag/keyboard handle interaction | ADAPT | Built (Phase C Batch 1) | Medium |
| Knob | `knob/` | Form | vue-core `createBaseEditableHolder` | SVG drag/keyboard interaction, trigonometry port | ADAPT | Built (Phase C Batch 1) | Medium |
| ColorPicker | `colorpicker/` | Form | vue-core `createBaseEditableHolder` | HSB/RGB/HEX math port; overlay-relocated-DOM drag handlers capture `event.currentTarget` correctly | ADAPT | Built (Phase C Batch 1) | Medium |
| DatePicker | `datepicker/` | Form | vue-core `createBaseInput`, overlay | Calendar grid, keyboard nav; overlay-based, composes `UOverlay`/`UPortal`; scope cut to single-date/date-grid-only, disclosed in-code | ADAPT | Built (Phase C Batch 1) | High |
| FileUpload | `fileupload/` | Form | vue-core base | Advanced mode only, XMLHttpRequest-based upload; no CVA-bindable scalar value, not overlay-based | ADAPT | Built (Phase C Batch 1) | Medium |
| KeyFilter | `keyfilter/` | Form | vue-core `createDirective` | Keydown-filtering directive via `createDirective` (not a visible component) | ADAPT | Built (Phase C Batch 1) | Low |
| FloatLabel | `floatlabel/` | Form | vue-core base | Label-position wrapper, bare-`BaseComponent`, no CVA | ADAPT | Built (Phase C Batch 1) | Low |
| IconField / InputIcon | `iconfield/`, `inputicon/` | Form | vue-core base | Input decoration wrapper; one canonical capability, two Prime directories, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |

### Form — Vue-eligible mixed-eligibility (3 capabilities; excludes Mention/MultiStateCheckbox/TriStateCheckbox, React-only)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| InputChips | `inputchips/` | Form | vue-core base | Angular Unverified/excluded; extends bare `BaseComponent` (not the editable-holder chain) despite being a real form control — `modelValue` implemented manually, matching real source's own extends chain | ADAPT | Built (Phase C Batch 1) | Medium |
| InputGroup / InputGroupAddon | `inputgroup/`, `inputgroupaddon/` | Form | vue-core base | React Unverified/excluded; one canonical capability, two Prime directories, bare-`BaseComponent` wrapper, no CVA | ADAPT | Built (Phase C Batch 1) | Low |
| IftaLabel | `iftalabel/` | Form | vue-core base | React Unverified/excluded; bare-`BaseComponent` wrapper, no CVA | ADAPT | Built (Phase C Batch 1) | Low |

### Navigation (11 capabilities — all-3-framework)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Breadcrumb | `breadcrumb/` | Navigation | vue-core base | Trail-of-links rendering | ADAPT | Built (Phase C Batch 1) | Low |
| MegaMenu | `megamenu/` | Navigation | vue-core base, overlay, Menu | Multi-column popup menu, composes Menu; local `UMegaMenuItem` extension for 2D-grid-specific shape | ADAPT | Built (Phase C Batch 1) | Medium |
| Menubar | `menubar/` | Navigation | vue-core base, overlay, Menu | Horizontal bar with nested popup submenus, composes Menu | ADAPT | Built (Phase C Batch 1) | Medium |
| PanelMenu | `panelmenu/` | Navigation | vue-core base, Menu | Accordion-style nested menu; position-derived string keys (not object-identity `Set`) — real PrimeVue's own key-based `expandedKeys` pattern, needed because Vue wraps every prop-received object in a fresh reactive Proxy per access | ADAPT | Built (Phase C Batch 1) | Medium |
| TieredMenu | `tieredmenu/` | Navigation | vue-core base, overlay, Menu | Nested popup submenus, composes Menu | ADAPT | Built (Phase C Batch 1) | Medium |
| Tabs | `tabs/` (5-file family: `Tabs.vue`, `TabList.vue`, `Tab.vue`, `TabPanel.vue`, `TabPanels.vue`, one top-level directory) | Navigation | vue-core base, `provide`/`inject` | Container-first order (tabs → tablist → tab → tabpanel → tabpanels); `provide`/`inject` matching real PrimeVue's own `$pcTabs` pattern | ADAPT | Built (Phase C Batch 1) | Medium |
| Stepper | `stepper/` (6-file family: `Stepper.vue`, `StepList.vue`, `StepItem.vue`, `Step.vue`, `StepPanel.vue`, `StepPanels.vue`, one top-level directory) | Navigation | vue-core base, `provide`/`inject` | Container-first order; `provide`/`inject` matching real PrimeVue's own `$pcStepper` pattern | ADAPT | Built (Phase C Batch 1) | Medium |
| Steps | `steps/` | Navigation | vue-core base | Linear step indicator | ADAPT | Built (Phase C Batch 1) | Low |
| Dock | `dock/` | Navigation | vue-core base | CSS-only magnification (real source has no JS-driven scale/transform) | ADAPT | Built (Phase C Batch 1) | Low |
| SpeedDial | `speeddial/` | Navigation | vue-core base, Button | Expandable floating action-button menu | ADAPT | Built (Phase C Batch 1) | Low |
| SplitButton | `splitbutton/` | Navigation | vue-core base, Button, Menu | Button + Menu composition (substituted for real source's Button+TieredMenu); no-Portal Vue overlay choice, disclosed | ADAPT | Built (Phase C Batch 1) | Low |

### Overlay (7 capabilities — Vue-eligible subset of 8, all now unblocked by Group A)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Popover | `popover/` | Overlay | vue-core base, overlay | Anchored floating panel; Escape-key mixin `.updated()` called directly from `show()`/`hide()` (real Vue 3 slot-reactivity fix — `v-if` nested inside `UPortal`'s slot means the component's own `updated()` lifecycle never fires after imperative visibility changes) | ADAPT | Built (Phase C Batch 1) | Low |
| Drawer | `drawer/` | Overlay | vue-core base, overlay, focus-trap | Slide-in panel, position variants; async-Teleport-mount test-timing pattern (matching Dialog's established precedent) | ADAPT | Built (Phase C Batch 1) | Low |
| ContextMenu | `contextmenu/` | Overlay/Navigation | vue-core base, overlay, Menu | Right-click-triggered popup menu | ADAPT | Built (Phase C Batch 1) | Medium |
| StyleClass | `styleclass/` | Overlay/directive | vue-core base | Class-toggle animation directive | ADAPT | Built (Phase C Batch 1) | Low |
| ConfirmDialog | `confirmdialog/` | Overlay | `UConfirmationService` (Group A, `vue-core/service`), dialog groundwork, Button | Uses the already-built Group A `UConfirmationService` directly | ADAPT | Built (Phase C Batch 1) | Low |
| ConfirmPopup | `confirmpopup/` | Overlay | `UConfirmationService` (Group A, `vue-core/service`), overlay groundwork, Button | Uses the already-built Group A `UConfirmationService` directly | ADAPT | Built (Phase C Batch 1) | Low |
| DynamicDialog | `dynamicdialog/` | Overlay | `UDialogService` (Group A, `vue-core/service`), dialog groundwork | Uses the already-built Group A `UDialogService`; `toRaw()` applied on both sides of a reactive-Proxy-vs-raw-ref identity comparison (real bug fix) | ADAPT | Built (Phase C Batch 1) | Medium |
| OverlayBadge | `overlaybadge/` | Overlay/Primitive | Badge (Group A) | Uses the already-built Group A `UBadge` directly; badge positioned over host content | ADAPT | Built (Phase C Batch 1) | Low |

**Excluded for Vue (Unverified, per spec §3.2):** none — all 4 mixed-eligibility Overlay capabilities are Vue-eligible once Group A lands.

### Panel / Layout / Display / Feedback (26 all-3-framework + 3 Vue-eligible mixed = 29 capabilities)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Accordion | `accordion/`, `accordion-panel/`, `accordion-header/`, `accordion-content/` (real 4-directory family, container-first order) | Panel/Layout | vue-core base, `provide`/`inject` | Real 4-directory family, `provide`/`inject` chain (`$pcAccordion`/`$pcAccordionPanel`) matching Tabs' own proven pattern; one canonical capability, four Prime/Ultimate directories | ADAPT | Built (Phase C Batch 1) | Low |
| Avatar | `avatar/` | Display | vue-core base | Image/initials/icon display; **built before AvatarGroup** (no formal ordering requirement in Vue, unlike Angular) | ADAPT | Built (Phase C Batch 1) | Low |
| AvatarGroup | `avatargroup/` | Display | Avatar | Overlap-layout wrapper; no build-order dependency in Vue (unlike Angular's soft Avatar-before-AvatarGroup ordering) | ADAPT | Built (Phase C Batch 1) | Low |
| BlockUI | `blockui/` | Feedback/Layout | vue-core base, overlay | Content-blocking overlay mask, reuses Dialog/Drawer's scroll-lock/zindex primitives for fullScreen mode | ADAPT | Built (Phase C Batch 1) | Low |
| ButtonGroup | `buttongroup/` | Layout | Button | Layout wrapper, composes Button | ADAPT | Built (Phase C Batch 1) | Low |
| Card | `card/` | Panel/Layout | vue-core base | Content-slot layout wrapper | ADAPT | Built (Phase C Batch 1) | Low |
| Carousel | `carousel/` | Data/Display | vue-core base | Slide navigation, autoplay timer via index math; item-cloning illusion, dynamic responsive `<style>` injection, touch/swipe cut and disclosed | ADAPT | Built (Phase C Batch 1) | Medium |
| Chip | `chip/` | Display | vue-core base | Removable tag display | ADAPT | Built (Phase C Batch 1) | Low |
| Divider | `divider/` | Layout | vue-core base | Visual/semantic separator | ADAPT | Built (Phase C Batch 1) | Low |
| Fieldset | `fieldset/` | Panel/Layout | vue-core base | Native `<fieldset>`-style collapsible group; icon-template/animation cut, disclosed | ADAPT | Built (Phase C Batch 1) | Low |
| Galleria | `galleria/` | Display | vue-core base | Thumbnail/fullscreen image viewer; real multi-file complexity resolved via the Carousel index-math precedent; responsiveOptions/touch/captions cut, disclosed | ADAPT | Built (Phase C Batch 1) | Medium |
| Image | `image/` | Display | vue-core base, Dialog/Drawer overlay tier | Preview/zoom overlay, composes established Dialog/Drawer overlay tier; `IMAGE:400` escape-priority activated (matching real PrimeReact's own `ESC_KEY_HANDLING_PRIORITIES.IMAGE`) | ADAPT | Built (Phase C Batch 1) | Low |
| ImageCompare | `imagecompare/` | Display | vue-core base | React Unverified/excluded; before/after slider comparison; RTL-auto-detection cut, disclosed | ADAPT | Built (Phase C Batch 1) | Low |
| Inplace | `inplace/` | Panel | vue-core base | Click-to-edit content toggle; deprecated `closable`/`closeIcon` replaced with real source's own `closeCallback` pattern | ADAPT | Built (Phase C Batch 1) | Low |
| Message | `message/` | Feedback | vue-core base | Inline severity-styled message, bare-`BaseComponent`, no CVA | ADAPT | Built (Phase C Batch 1) | Low |
| MeterGroup | `metergroup/` | Data/Display | vue-core base | Segmented meter/progress display with legend, folded `MeterGroup`+`MeterGroupLabel` per the Accordion/PanelMenu reduction precedent | ADAPT | Built (Phase C Batch 1) | Low |
| Panel | `panel/` | Panel/Layout | vue-core base | Collapsible content panel; internal collapsed-toggle mirrors real source's own `_collapsed` field, matching Fieldset's precedent | ADAPT | Built (Phase C Batch 1) | Low |
| ProgressBar | `progressbar/` | Feedback | vue-core base | Determinate/indeterminate bar, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |
| ProgressSpinner | `progressspinner/` | Feedback | vue-core base | SVG spinner animation, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |
| ScrollPanel | `scrollpanel/` | Layout | vue-core base | Custom-scrollbar viewport wrapper; thumb sizing/positioning math, drag-to-scroll, keyboard stepping, resize re-measurement — genuinely implemented, not a fake `overflow:auto` wrapper; touch-drag/RTL-beyond-logical-properties/template-override cut, disclosed | ADAPT | Built (Phase C Batch 1) | Medium |
| ScrollTop | `scrolltop/` | Navigation/Feedback | vue-core base, Button | Scroll-position-triggered button; supports both window and parent scroll-target modes, smooth-scroll-to-top | ADAPT | Built (Phase C Batch 1) | Low |
| Skeleton | `skeleton/` | Feedback/Display | vue-core base | Loading-placeholder shape, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |
| Splitter | `splitter/` | Layout | vue-core base | Real mouse-drag resize (flex-basis from pointer delta), min-size clamping, keyboard step-resize (40ms repeat interval); real `SplitterPanel` child-scanning replaced with a `panels: {minSize}[]` config array (disclosed reduction, matching Accordion/PanelMenu precedent); touch-drag wired but untested, stateStorage/stateKey persistence and RTL drag-flip cut, disclosed | ADAPT | Built (Phase C Batch 1) | Medium |
| Tag | `tag/` | Display | vue-core base | Severity-styled label, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |
| Terminal | `terminal/` | Display | vue-core base, local (non-core) `terminalEventBus` | Command-line-style input/output log; local event bus (not `vue-core`), single-consumer, matching real PrimeVue's own plain `EventBus()` shape (no `ArrowUp` history recall — absent from real PrimeVue source, kept framework-accurate) | ADAPT | Built (Phase C Batch 1) | Low |
| Timeline | `timeline/` | Data/Display | vue-core base | Chronological event list layout, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |
| Toolbar | `toolbar/` | Layout | vue-core base | Content-slot horizontal bar, bare-`BaseComponent` | ADAPT | Built (Phase C Batch 1) | Low |
| AnimateOnScroll | `animateonscroll/` | Primitive/directive | vue-core `createDirective` | React Unverified/excluded; real 2-`IntersectionObserver` mechanism (main + reset-on-exit) ported faithfully; new `createDirective` consumer, options folded into the binding value object since `createDirective`'s binding has no modifiers surface; per-element `WeakMap` state (cleaner than real PrimeVue's own top-level-field pattern) | ADAPT | Built (Phase C Batch 1) | Low |
| DeferredContent | `deferredcontent/` | Primitive/Feedback | vue-core base | Angular Unverified/excluded; real source uses window `scroll` + `getBoundingClientRect()` — deliberately swapped for `IntersectionObserver` (disclosed mechanism deviation, not silently substituted) | ADAPT | Built (Phase C Batch 1) | Low |
| Toast | `toast/` | Feedback | `UToastService`/`toastEventBus` (Group A, `vue-core/service`) | Reuses the already-built Group A `UToastService`/`toastEventBus` directly, subscribing to add/remove/remove-all events, filtering on `group`; per-message dismiss-timer map assigned in `created()` (real self-caught bug fix — a top-level object-literal outside `data()` is never auto-installed as an instance property by Vue) | ADAPT | Built (Phase C Batch 1) | Medium |

**Excluded for Vue (Unverified, per spec §3.4):** none in this family — Vue is eligible for all 26 all-3-framework capabilities plus ImageCompare, AnimateOnScroll, and DeferredContent (Toast unblocked by Group A). Mention/MultiStateCheckbox/TriStateCheckbox remain React-only, tracked only in `REACT_COMPONENT_STATUS.md`.

**Parity Reconciliation pass (2026-09-20)** — the Phase C Next-Step Assessment's Path 1 workstream checked Vue's remaining Unverified pool against real, pinned PrimeVue 4.5.5 source (never from naming similarity alone; see `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` §3.3(a)/§4.1b for full evidence).

**Confirmed genuinely present — Batch 2 Specification created** (`docs/superpowers/specs/2026-09-20-phase-c-batch-2-migration-design.md` §3.2), now implemented (see `## Built (Phase C Batch 2)` below): **InlineMessage** — real `inlinemessage/InlineMessage.vue`/`BaseInlineMessage.vue`, with theme presets across all 4 PrimeVue preset packs, independently confirmed materially distinct from PrimeVue's own separate `Message.vue` (severity-driven icon, no close button — not an alias or subset of `Message`). **Correction (Batch 2 Specification, 2026-09-20):** real source's `sticky`/`life` auto-dismiss mechanism referenced in `mounted()` is dead code — neither prop is declared anywhere, and the template never gates on `visible` — so real InlineMessage is actually always-visible with no dismiss mechanism of any kind, not "auto-dismiss unless sticky" as earlier reported. The Batch 2 Spec requires the corrected (always-visible) behavior, and this is what was implemented.

**Still genuinely Unverified for Vue (not checked by this pass):** MultiStateCheckbox, TriStateCheckbox, Mention, DataScroller.

---

## Built (Phase C Batch 2) — 1 capability

Merged to `main` (commit `c37dc40`), originally implemented on `feature/phase-c-batch-2-migration` (commit `cdef095`).

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| InlineMessage (`UInlineMessage`) | `inlinemessage/` | Feedback | vue-core base | Severity-driven icon, always-visible, no close button, no dismiss timer (real source's `sticky`/`life` confirmed dead code, deliberately not ported) | ADAPT | Built (Phase C Batch 2) | Low |

---

## Built (Phase C Batch 3) — 4 capabilities

| Component                              | Prime source path  | Category     | Dependencies             | Framework-specific responsibilities                                                                                               | Migration classification | Migration phase         | Risk   |
| -------------------------------------- | ------------------ | ------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------- | ------ |
| OrderList (UOrderList)                 | orderlist/         | Data         | vue-core base, listbox   | All four button moves; no drag/drop or filtering; packages/vue/src/order-list/                                                    | ADAPT                    | Built (Phase C Batch 3) | Medium |
| PickList (UPickList)                   | picklist/          | Data         | vue-core base, listbox   | Combined modelValue pair, bidirectional transfers and per-side reordering; no drag/drop or filtering; packages/vue/src/pick-list/ | ADAPT                    | Built (Phase C Batch 3) | Medium |
| DataView (UDataView)                   | dataview/          | Data         | vue-core base, paginator | Separate list/grid slots, sorting, pagination; no filtering; packages/vue/src/data-view/                                          | ADAPT                    | Built (Phase C Batch 3) | Medium |
| OrganizationChart (UOrganizationChart) | organizationchart/ | Data/Display | vue-core base            | One root node, selectionKeys/collapsedKeys maps, opt-in collapse; packages/vue/src/organization-chart/                            | ADAPT                    | Built (Phase C Batch 3) | Medium |

OrganizationChart's React/Vue-only membership is a permanent framework asymmetry under DECISION-D. Angular OrganizationChart remains excluded.

## Verification

- 9 pre-existing baseline components + 1 Group A infrastructure item (Badge) + 76 Phase C Batch 1 canonical capabilities + 1 Phase C Batch 2 capability + 4 Phase C Batch 3 capabilities = **91 canonical-capability-equivalent rows**. This reconciles to `packages/vue/src/`'s 94 top-level directories after Batch 3: 94 total directories − 3 extra directories consumed by Accordion's four-directory family = 91.
- Vue eligibility cross-checked against spec §3: 79 canonical capabilities − 3 Vue-excluded (Mention, MultiStateCheckbox, TriStateCheckbox — React only) = 76. Matches this file's Batch 1 canonical-capability row count exactly (excluding the separately-tracked Badge infrastructure item, which is not one of the 79).
- No capability from spec §3 is marked Built here where spec §3 excludes Vue for it (Mention, MultiStateCheckbox, TriStateCheckbox all correctly absent).
