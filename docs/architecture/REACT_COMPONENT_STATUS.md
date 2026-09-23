# React Component Status

Current-state tracking for `@ultimate/react`, created per the approved Phase C Batch 1 Implementation Plan's own resolution of the React/Vue current-state-tracking gap (`docs/superpowers/plans/2026-09-17-phase-c-batch-1-migration-implementation.md` §1.1, Task Group Z / §8). No committed React-equivalent of `docs/architecture/COMPONENT_INVENTORY.md` existed before this file.

**Origin of this file's scope:** every component `@ultimate/react` shipped **before** Phase C Batch 1 (8 components), every React capability closed by Phase C Batch 1 (73), React DataScroller from Batch 2 (1), and OrderList, PickList, DataView, and OrganizationChart from Batch 3 (4). Confirmed against direct inspection of `packages/react/src/`: **86 top-level component directories = 8 + 73 + 1 + 4**. No capability listed here is outside its approved framework eligibility, and no implemented React capability is omitted.

Schema (7 columns, matching `COMPONENT_INVENTORY.md`'s own schema minus its Angular-specific `UIX dependencies`/`Angular-specific responsibilities` columns, substituting one framework-specific-responsibilities column): **Component** | **Prime source path** | **Category** | **Dependencies** | **Framework-specific responsibilities** | **Migration classification** | **Migration phase** | **Risk**.

- **Migration classification:** `ADAPT` (incorporated, PrimeReact source is the design reference) — every row in this file is `ADAPT`; React carries no `NOT NEEDED`/`NEEDS ARCHITECTURE DECISION` rows of its own distinct from Angular's (architectural exceptions are tracked once, in `COMPONENT_INVENTORY.md`, not duplicated per framework).
- **Migration phase:** `Built (pre-existing)` (shipped before Phase C Batch 1) / `Built (Phase C Batch 1)` (shipped by this batch, commits `28ecdb8..be9f35e`) / `Built (Phase C Batch 2)` / `Built (Phase C Batch 3)`.
- **Risk** is a qualitative flag, carried over from `COMPONENT_INVENTORY.md`'s own already-vetted per-capability risk rating where the capability is shared cross-framework (Prime source complexity is framework-independent in nature); Low by default for capabilities with no direct Angular-row precedent.

Real PrimeReact source paths are cited by top-level `components/lib/<name>/` directory, per PrimeReact 10.9.9's own package layout (confirmed via this batch's own component doc comments, e.g. `accordion.tsx`'s citation of `components/lib/accordion/Accordion.js`) — the equivalent role `packages/primeng/src/<name>/` plays for `COMPONENT_INVENTORY.md`.

---

## Built (pre-existing) — 8 components

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Button (`UButton`) | `components/lib/button/` | Primitive | react-core base, icons(Spinner) | Fully-controlled props (`value`/`onChange`-equivalent pattern), no CVA analogue | ADAPT | Built (pre-existing) | Low |
| Checkbox (`UCheckbox`) | `components/lib/checkbox/` | Form | react-core base | Fully-controlled `checked`/`onChange` props | ADAPT | Built (pre-existing) | Low |
| Dialog (`UDialog`) | `components/lib/dialog/` | Overlay | react-core base, focus-trap, overlay, escape, icons(Times) | Composes `react-core`'s overlay/focus-trap/escape/zindex/motion hooks directly | ADAPT | Built (pre-existing) | Medium |
| Menu (`UMenu`) | `components/lib/menu/` | Navigation | react-core base | Flat `<ul role="menu">` rendering of `UMenuItem[]`, roving tabindex | ADAPT | Built (pre-existing) | Low |
| Paginator (`UPaginator`) | `components/lib/paginator/` | Data | react-core base | Page-index/page-size state | ADAPT | Built (pre-existing) | Low |
| Scroller (`UScroller`) | `components/lib/scroller/` | Data | react-core base | Virtual-scroll windowing, composed internally by Table/Paginator | ADAPT | Built (pre-existing) | N/A (shipped) |
| Table (`UTable`) | `components/lib/table/` | Data | react-core base, overlay tier, scroller, paginator | Sort/filter/select/virtualization state | ADAPT | Built (pre-existing) | N/A (shipped) |
| Tooltip (`UTooltip`) | `components/lib/tooltip/` | Overlay | react-core base | Hook-based attribute-style API | ADAPT | Built (pre-existing) | Low |

---

## Built (Phase C Batch 1) — 73 capabilities

### Form (24 capabilities — all-3-framework-eligible or React-eligible subset)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RadioButton | `components/lib/radiobutton/` | Form | react-core base | Fully-controlled `checked`/`onChange` | ADAPT | Built (Phase C Batch 1) | Low |
| ToggleSwitch (`InputSwitch`) | `components/lib/inputswitch/` | Form | react-core base | Fully-controlled boolean input; PrimeReact names it `InputSwitch` | ADAPT | Built (Phase C Batch 1) | Low |
| ToggleButton | `components/lib/togglebutton/` | Form | react-core base | Fully-controlled boolean toggle button | ADAPT | Built (Phase C Batch 1) | Low |
| InputText | `components/lib/inputtext/` | Form | react-core base | Fully-controlled native input wrapper (Angular already Built pre-batch; this is React's own realization) | ADAPT | Built (Phase C Batch 1) | Low |
| Textarea (`InputTextarea`) | `components/lib/inputtextarea/` | Form | react-core base | Autoresize, fully-controlled; PrimeReact names it `InputTextarea` | ADAPT | Built (Phase C Batch 1) | Low |
| InputNumber | `components/lib/inputnumber/` | Form | react-core base | Numeric formatting/spinner, fully-controlled (Angular already Built pre-batch; this is React's own realization) | ADAPT | Built (Phase C Batch 1) | Medium |
| InputMask | `components/lib/inputmask/` | Form | react-core base | Mask-pattern input handling, fully-controlled | ADAPT | Built (Phase C Batch 1) | Medium |
| InputOTP | `components/lib/inputotp/` | Form | react-core base | Multi-cell input handling, focus movement between cells | ADAPT | Built (Phase C Batch 1) | Medium |
| Password | `components/lib/password/` | Form | react-core base, overlay | Strength-meter overlay, mask toggle | ADAPT | Built (Phase C Batch 1) | Low |
| AutoComplete | `components/lib/autocomplete/` | Form | react-core base, overlay | Overlay list, keyboard nav | ADAPT | Built (Phase C Batch 1) | Medium |
| Select (`Dropdown`) | `components/lib/dropdown/` | Form | react-core base, overlay | Overlay option list; PrimeReact names it `Dropdown` | ADAPT | Built (Phase C Batch 1) | Medium |
| MultiSelect | `components/lib/multiselect/` | Form | react-core base, overlay | Overlay option list, chip display; `BaseEditableHolder`-equivalent tier | ADAPT | Built (Phase C Batch 1) | Medium |
| CascadeSelect | `components/lib/cascadeselect/` | Form | react-core base, overlay | Nested overlay panels, recursive drill-path (2-file split matching real source) | ADAPT | Built (Phase C Batch 1) | Medium |
| Listbox | `components/lib/listbox/` | Form | react-core base | Option list, multi-select, not overlay-based | ADAPT | Built (Phase C Batch 1) | Medium |
| SelectButton | `components/lib/selectbutton/` | Form | react-core base | Toggle-button group, not overlay-based | ADAPT | Built (Phase C Batch 1) | Low |
| Rating | `components/lib/rating/` | Form | react-core base | Icon-based star input, keyboard arrow-stepping | ADAPT | Built (Phase C Batch 1) | Medium |
| Slider | `components/lib/slider/` | Form | react-core base | Drag/keyboard handle interaction | ADAPT | Built (Phase C Batch 1) | Medium |
| Knob | `components/lib/knob/` | Form | react-core base | SVG drag/keyboard interaction, trigonometry port | ADAPT | Built (Phase C Batch 1) | Medium |
| ColorPicker | `components/lib/colorpicker/` | Form | react-core base | HSB/RGB/HEX math port, no-Portal convention (matching Select) | ADAPT | Built (Phase C Batch 1) | Medium |
| DatePicker (`Calendar`) | `components/lib/calendar/` | Form | react-core base, overlay | Calendar grid, keyboard nav; PrimeReact names it `Calendar`; scope cut to single-date/date-grid-only, disclosed in-code | ADAPT | Built (Phase C Batch 1) | High |
| FileUpload | `components/lib/fileupload/` | Form | react-core base | Advanced mode only, XMLHttpRequest-based upload | ADAPT | Built (Phase C Batch 1) | Medium |
| KeyFilter | `components/lib/keyfilter/` | Form | react-core base | Keydown-filtering hook (not a visible component) | ADAPT | Built (Phase C Batch 1) | Low |
| FloatLabel | `components/lib/floatlabel/` | Form | react-core base | Label-position wrapper, bare-base | ADAPT | Built (Phase C Batch 1) | Low |
| IconField / InputIcon | `components/lib/iconfield/`, `components/lib/inputicon/` | Form | react-core base | Input decoration wrapper; one canonical capability, two Prime directories | ADAPT | Built (Phase C Batch 1) | Low |

### Form — React-only mixed-eligibility (4 capabilities)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| InputChips (`Chips`) | `components/lib/chips/` | Form | react-core base | Angular Unverified/excluded; Vue also builds this capability (`inputchips/`) | ADAPT | Built (Phase C Batch 1) | Medium |
| Mention | `components/lib/mention/` | Form | react-core base | Angular/Vue Unverified/excluded; simplified to follow `UAutoComplete`'s in-flow-overlay precedent rather than real source's Portal/cursor-offset architecture (disclosed smaller-surface decision) | ADAPT | Built (Phase C Batch 1) | Medium |
| MultiStateCheckbox | `components/lib/multistatecheckbox/` | Form | react-core base | Angular/Vue Unverified/excluded | ADAPT | Built (Phase C Batch 1) | Low |
| TriStateCheckbox | `components/lib/tristatecheckbox/` | Form | react-core base | Angular/Vue Unverified/excluded | ADAPT | Built (Phase C Batch 1) | Low |

### Navigation (11 capabilities — all-3-framework)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Breadcrumb | `components/lib/breadcrumb/` | Navigation | react-core base | Trail-of-links rendering | ADAPT | Built (Phase C Batch 1) | Low |
| MegaMenu | `components/lib/megamenu/` | Navigation | react-core base, overlay, Menu | Multi-column popup menu, composes Menu | ADAPT | Built (Phase C Batch 1) | Medium |
| Menubar | `components/lib/menubar/` | Navigation | react-core base, overlay, Menu | Horizontal bar with nested popup submenus, composes Menu | ADAPT | Built (Phase C Batch 1) | Medium |
| PanelMenu | `components/lib/panelmenu/` | Navigation | react-core base, Menu | Accordion-style nested menu, composes Menu | ADAPT | Built (Phase C Batch 1) | Medium |
| TieredMenu | `components/lib/tieredmenu/` | Navigation | react-core base, overlay, Menu | Nested popup submenus, composes Menu | ADAPT | Built (Phase C Batch 1) | Medium |
| Tabs | `components/lib/tabview/`, `components/lib/tabmenu/` | Navigation | react-core base | Two sub-components within one capability: `TabView` + `TabMenu` | ADAPT | Built (Phase C Batch 1) | Medium |
| Stepper | `components/lib/stepper/`, `components/lib/stepperpanel/` | Navigation | react-core base | `Stepper` before `StepperPanel`, internal soft order, same task | ADAPT | Built (Phase C Batch 1) | Medium |
| Steps | `components/lib/steps/` | Navigation | react-core base | Linear step indicator | ADAPT | Built (Phase C Batch 1) | Low |
| Dock | `components/lib/dock/` | Navigation | react-core base | CSS-only magnification (real source has no JS-driven scale/transform) | ADAPT | Built (Phase C Batch 1) | Low |
| SpeedDial | `components/lib/speeddial/` | Navigation | react-core base, Button | Expandable floating action-button menu | ADAPT | Built (Phase C Batch 1) | Low |
| SplitButton | `components/lib/splitbutton/` | Navigation | react-core base, Button, Menu | Button + Menu composition (substituted for real source's Button+TieredMenu) | ADAPT | Built (Phase C Batch 1) | Low |

### Overlay (6 capabilities — React-eligible subset of 8)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Popover (`OverlayPanel`) | `components/lib/overlaypanel/` | Overlay | react-core base, overlay | Anchored floating panel; PrimeReact names it `OverlayPanel` | ADAPT | Built (Phase C Batch 1) | Low |
| Drawer (`Sidebar`) | `components/lib/sidebar/` | Overlay | react-core base, overlay, focus-trap | Slide-in panel, position variants; PrimeReact names it `Sidebar` | ADAPT | Built (Phase C Batch 1) | Low |
| ContextMenu | `components/lib/contextmenu/` | Overlay/Navigation | react-core base, overlay, Menu | Right-click-triggered popup menu | ADAPT | Built (Phase C Batch 1) | Medium |
| StyleClass | `components/lib/styleclass/` | Overlay/directive | react-core base | Class-toggle animation hook | ADAPT | Built (Phase C Batch 1) | Low |
| ConfirmDialog | `components/lib/confirmdialog/` | Overlay | new `react-core/confirmation` service package, dialog groundwork, Button | Service-driven confirmation modal; new `react-core/confirmation` package mirrors real PrimeReact's own service shape | ADAPT | Built (Phase C Batch 1) | Low |
| ConfirmPopup | `components/lib/confirmpopup/` | Overlay | `react-core/confirmation` (shared with ConfirmDialog), overlay groundwork, Button | Anchored confirmation popover, reuses `react-core/confirmation` | ADAPT | Built (Phase C Batch 1) | Low |

**Excluded for React (Unverified, per spec §3.2):** DynamicDialog, OverlayBadge — Angular-only (Vue also builds these, gated on Group A infrastructure). Not present in this file's scope.

### Panel / Layout / Display / Feedback (26 all-3-framework + 2 React-eligible mixed = 28 capabilities)

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Accordion | `components/lib/accordion/` | Panel/Layout | react-core base | Reduced to a single data-model-driven component (real PrimeReact `Accordion`+`AccordionTab` marker-scanning family, following the `UPanelMenu` reduction precedent) | ADAPT | Built (Phase C Batch 1) | Low |
| Avatar | `components/lib/avatar/` | Display | react-core base | Image/initials/icon display | ADAPT | Built (Phase C Batch 1) | Low |
| AvatarGroup | `components/lib/avatargroup/` | Display | Avatar | Overlap-layout wrapper; no build-order dependency in React (unlike Angular's soft Avatar-before-AvatarGroup ordering) | ADAPT | Built (Phase C Batch 1) | Low |
| BlockUI | `components/lib/blockui/` | Feedback/Layout | react-core base, overlay | Content-blocking overlay mask, reuses scroll-lock/zindex primitives | ADAPT | Built (Phase C Batch 1) | Low |
| ButtonGroup | `components/lib/buttongroup/` | Layout | Button | Layout wrapper, composes Button | ADAPT | Built (Phase C Batch 1) | Low |
| Card | `components/lib/card/` | Panel/Layout | react-core base | Content-slot layout wrapper | ADAPT | Built (Phase C Batch 1) | Low |
| Carousel | `components/lib/carousel/` | Data/Display | react-core base | Slide navigation, autoplay timer via index math; item-cloning illusion, dynamic responsive `<style>` injection, touch/swipe cut and disclosed | ADAPT | Built (Phase C Batch 1) | Medium |
| Chip | `components/lib/chip/` | Display | react-core base | Removable tag display | ADAPT | Built (Phase C Batch 1) | Low |
| Divider | `components/lib/divider/` | Layout | react-core base | Visual/semantic separator | ADAPT | Built (Phase C Batch 1) | Low |
| Fieldset | `components/lib/fieldset/` | Panel/Layout | react-core base | Native `<fieldset>`-style collapsible group; icon-template/animation cut, disclosed | ADAPT | Built (Phase C Batch 1) | Low |
| Galleria | `components/lib/galleria/` | Display | react-core base | Thumbnail/fullscreen image viewer; real multi-file complexity resolved via the Carousel index-math precedent; responsiveOptions/touch/captions cut, disclosed | ADAPT | Built (Phase C Batch 1) | Medium |
| Image | `components/lib/image/` | Display | react-core base, Dialog/Drawer overlay tier | Preview/zoom overlay, composes established Dialog/Drawer overlay tier | ADAPT | Built (Phase C Batch 1) | Low |
| Inplace | `components/lib/inplace/` | Panel | react-core base | Click-to-edit content toggle; deprecated `closable`/`closeIcon` replaced with real source's own `closeCallback` pattern | ADAPT | Built (Phase C Batch 1) | Low |
| Message | `components/lib/message/` | Feedback | react-core base | Inline severity-styled message | ADAPT | Built (Phase C Batch 1) | Low |
| MeterGroup | `components/lib/metergroup/` | Data/Display | react-core base | Segmented meter/progress display with legend | ADAPT | Built (Phase C Batch 1) | Low |
| Panel | `components/lib/panel/` | Panel/Layout | react-core base | Collapsible content panel | ADAPT | Built (Phase C Batch 1) | Low |
| ProgressBar | `components/lib/progressbar/` | Feedback | react-core base | Determinate/indeterminate bar | ADAPT | Built (Phase C Batch 1) | Low |
| ProgressSpinner | `components/lib/progressspinner/` | Feedback | react-core base | SVG spinner animation | ADAPT | Built (Phase C Batch 1) | Low |
| ScrollPanel | `components/lib/scrollpanel/` | Layout | react-core base | Custom-scrollbar viewport wrapper, thumb sizing/positioning math, drag-to-scroll, keyboard stepping | ADAPT | Built (Phase C Batch 1) | Medium |
| ScrollTop | `components/lib/scrolltop/` | Navigation/Feedback | react-core base, Button | Scroll-position-triggered button, window and parent scroll-target modes | ADAPT | Built (Phase C Batch 1) | Low |
| Skeleton | `components/lib/skeleton/` | Feedback/Display | react-core base | Loading-placeholder shape | ADAPT | Built (Phase C Batch 1) | Low |
| Splitter | `components/lib/splitter/` | Layout | react-core base | Drag-resize + keyboard step-resize; real `SplitterPanel` child-component-scanning replaced with a `panels: {minSize}[]` config array (disclosed reduction, matching Accordion/PanelMenu precedent) | ADAPT | Built (Phase C Batch 1) | Medium |
| Tag | `components/lib/tag/` | Display | react-core base | Severity-styled label | ADAPT | Built (Phase C Batch 1) | Low |
| Terminal | `components/lib/terminal/` | Display | react-core base, local (non-core) `terminalEventBus` | Command-line-style input/output log; local event bus (not `react-core`), single-consumer, includes `ArrowUp` command-history recall present in real PrimeReact source | ADAPT | Built (Phase C Batch 1) | Low |
| Timeline | `components/lib/timeline/` | Data/Display | react-core base | Chronological event list layout | ADAPT | Built (Phase C Batch 1) | Low |
| Toolbar | `components/lib/toolbar/` | Layout | react-core base | Content-slot horizontal bar | ADAPT | Built (Phase C Batch 1) | Low |
| DeferredContent | `components/lib/deferredcontent/` | Primitive/Feedback | react-core base | Angular Unverified/excluded; real source uses window `scroll` + `getBoundingClientRect()` — deliberately swapped for `IntersectionObserver` (disclosed mechanism deviation, not silently substituted) | ADAPT | Built (Phase C Batch 1) | Low |
| Toast | `components/lib/toast/` | Feedback | react-core base | Ref-imperative (`useImperativeHandle` exposing `show`/`clear`), confirmed genuinely different from ConfirmDialog's `react-core/confirmation` eventbus pattern — stays local to the component, no `react-core` service | ADAPT | Built (Phase C Batch 1) | Medium |

**Excluded for React (Unverified, per spec §3.4):** ImageCompare, AnimateOnScroll — Angular+Vue only. Not present in this file's scope.

**Parity Reconciliation pass (2026-09-20)** — the Phase C Next-Step Assessment's Path 1 workstream checked React's remaining Unverified pool against real, pinned PrimeReact 10.9.9 source (never from naming similarity alone; see `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` §3.3(a)/§4.1/§4.1b for full evidence). Outcome for React:

- **Confirmed genuinely absent (reclassified Unverified → Not applicable, not eligible for any future batch without new evidence):** DynamicDialog (no dynamic-component-injection mechanism in `dialog/Dialog.js`), OverlayBadge (`badge/Badge.js` has no overlay-positioning variant), IftaLabel (zero matches in the tarball), ImageCompare (zero matches; `image/` has only a single lightbox component), AnimateOnScroll (zero matches). InputGroup/InputGroupAddon confirmed as a showcase-only CSS/markup convention (`components/doc/inputgroup/basicdoc.js`), not a shipped component — same "Not applicable" disposition.
- **Confirmed genuinely present — Batch 2 Specification created** (`docs/superpowers/specs/2026-09-20-phase-c-batch-2-migration-design.md` §3.1), now implemented (see `## Built (Phase C Batch 2)` below): **DataScroller** — real `components/lib/datascroller/DataScroller.js`/`DataScrollerBase.js`/`datascroller.d.ts`, a genuine infinite-scroll/lazy-append list component distinct from React's already-built `Scroller` virtualization primitive. Confirmed independent of `Scroller` — no composition dependency.

---

## Built (Phase C Batch 2) — 1 capability

Merged to `main` (commit `c37dc40`), originally implemented on `feature/phase-c-batch-2-migration` (commit `88cf3c6`).

| Component | Prime source path | Category | Dependencies | Framework-specific responsibilities | Migration classification | Migration phase | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DataScroller (`UDataScroller`) | `components/lib/datascroller/` | Data | react-core base | Incremental array-slicing plus scroll-position listener; imperative `load()`/`reset()` via `useImperativeHandle`; confirmed independent of `UScroller` (no composition dependency) | ADAPT | Built (Phase C Batch 2) | Medium |

---

## Built (Phase C Batch 3) — 4 capabilities

| Component                              | Prime source path                 | Category     | Dependencies               | Framework-specific responsibilities                                                                                                                       | Migration classification | Migration phase         | Risk   |
| -------------------------------------- | --------------------------------- | ------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------- | ------ |
| OrderList (UOrderList)                 | components/lib/orderlist/         | Data         | react-core base            | All four button moves, filtering, optional native HTML5 drag/drop; packages/react/src/order-list/                                                         | ADAPT                    | Built (Phase C Batch 3) | Medium |
| PickList (UPickList)                   | components/lib/picklist/          | Data         | react-core base            | Separate source/target arrays, bidirectional transfers and per-side reordering, filtering, optional native HTML5 drag/drop; packages/react/src/pick-list/ | ADAPT                    | Built (Phase C Batch 3) | Medium |
| DataView (UDataView)                   | components/lib/dataview/          | Data         | react-core base, paginator | List/grid rendering, sorting, pagination; no filtering; packages/react/src/data-view/                                                                     | ADAPT                    | Built (Phase C Batch 3) | Medium |
| OrganizationChart (UOrganizationChart) | components/lib/organizationchart/ | Data/Display | react-core base            | Per-node local expansion, object-reference single/multiple selection; packages/react/src/organization-chart/                                              | ADAPT                    | Built (Phase C Batch 3) | Medium |

OrganizationChart's React/Vue-only membership is a permanent framework asymmetry under DECISION-D. Angular OrganizationChart remains excluded.

## Verification

- 8 pre-existing baseline components + 73 Phase C Batch 1 capabilities + 1 Phase C Batch 2 capability + 4 Phase C Batch 3 capabilities = **86 entries**, matching `packages/react/src/`'s 86 top-level component directories after Batch 3 (confirmed by direct directory inspection).
- React eligibility cross-checked against spec §3: 79 canonical capabilities − 6 React-excluded (InputGroup/InputGroupAddon, IftaLabel — Angular/Vue only; ImageCompare, AnimateOnScroll — Angular/Vue only; DynamicDialog, OverlayBadge — Angular only) = 73. Matches this file's Batch 1 row count exactly.
- No capability from spec §3 is marked Built here where spec §3 excludes React for it (DynamicDialog, OverlayBadge, InputGroup/InputGroupAddon, IftaLabel, ImageCompare, AnimateOnScroll all correctly absent).
