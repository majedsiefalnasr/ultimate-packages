# Phase A — Migration Inventory

**Document type:** Reviewed research output (source-verified inventory). Not a spec, not an implementation plan, not a decision record.
**Repository:** `ultimate`
**Audited against:** `main` at commit `dcd418c`
**Compiled:** 2026-09-16
**Scope:** Source-verified inventory of Prime components across Angular, React, and Vue, and their current Ultimate status. Research/inventory only — no implementation, no spec, no plan. Frozen input for Phase B (Knowledge Reconciliation).

**Migration framing:** this document is Phase A of a three-phase effort — **Phase A (Migration Inventory, this document) → Phase B (Knowledge Reconciliation) → Phase C (Actual Migration)**. Phase A establishes what exists, what has shipped, and what depends on what; it does not decide what to do next.

**Legend used throughout:**
- `[BUILT]` — shipped, tested, real source
- `[GAP]` — real, confirmed missing/narrowed behavior
- `[DECISION NEEDED]` — architecture fork, unresolved
- `[UNVERIFIED]` — not independently re-checked this pass

---

## 1. Executive Summary

This is a source-verified inventory of every Prime component/source-area across PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5, cross-referenced against Ultimate's current implementation state. It was built by (a) reading all existing Ultimate architecture/gap/provenance/decision documentation, (b) extracting and reading the real pinned Prime source tarballs directly (not from memory or training data), and (c) diffing Ultimate's actual `packages/{ng,react,vue}[-core]/src/` trees against that real source.

| Metric | Count |
|---|---|
| PrimeNG directories | 117 |
| PrimeReact directories | 116 |
| PrimeVue directories (2 roots) | 158 |
| Built — Angular / React / Vue | 18 / 8 / 15 |

### Top findings

1. **Angular's inventory is already complete and current.** `docs/architecture/COMPONENT_INVENTORY.md` classifies all 117 PrimeNG directories, was last updated by the commit at current `HEAD` (`a382943`), and matches the real `packages/ng/src`/`packages/ng-core/src` trees exactly. No rework was needed — this report restates it inside a unified cross-framework structure.
2. **React and Vue never had an equivalent inventory.** `BLUEPRINT_GAPS.md` states this explicitly ("React/Vue never had a full component inventory produced at all"). This report closes that gap for the first time, verified against real source.
3. **GAP-018/GAP-038's baseline conclusion is confirmed, not reopened, and now extended to React/Vue with new evidence:**
   - **Angular** — resolved with a proven two-consumer pattern: `UModelHolder` (proven by `UInputText`) then `UBaseInput` + the `writeControlValue` bridge (proven by `UInputNumber`, a genuinely CVA-implementing second consumer distinct from the first).
   - **React needs no equivalent tier at all.** Real PrimeReact has no `BaseEditableHolder`/`BaseInput` source directories — every form component is fully-controlled (`value`/`checked` + `onChange`), verified directly from `InputText.js`/`Checkbox.js`. This is an architectural non-requirement, not an unbuilt gap.
   - **Vue already has the tier built** (`createBaseEditableHolder`/`createBaseInput` in `vue-core`), **but it has only one real consumer (`UCheckbox`, a boolean input)** — not the two-consumer, text-plus-numeric proof Angular has. Vue's tier is real and structurally sound, but less proven for the ~15-component native-text-input family it will eventually need to support.
4. **Ripple is missing entirely from React** — a genuine, confirmed cross-framework asymmetry (Angular and Vue both ship it; React has no `ripple/` directory anywhere).
5. **Angular's secondary-entry-point defect (GAP-009/GAP-023) is Angular-only.** Neither React nor Vue has any equivalent build-tool defect — both ship real per-component `exports` subpaths for every built component, with no exclusions.
6. **Naming/structural divergence across frameworks is real and non-trivial** — e.g. Popover/OverlayPanel, Drawer/Sidebar, Select/Dropdown, Tabs-family/TabView+TabMenu, DatePicker/Calendar. Several PrimeVue and PrimeReact directories are likely deprecated re-export shims of newer composed-family components (heuristically identified, not all independently confirmed).
7. A large number of individual claims in the React and Vue sections are explicitly flagged `[UNVERIFIED]` where the underlying research pass did not have budget to line-by-line diff every already-built component against real source. These are enumerated in §8, not hidden.

> **What this report is not:** not a spec, not an implementation plan, not a decision document. Existing protected decisions (Tree-family exclusion, DECISION-B external-dependency policy, DECISION-C's Table/Data narrowing) are treated as given baselines and are not reopened. This is the frozen factual basis Phase B (Knowledge Reconciliation) will work from.

---

## 2. Complete Angular Inventory

Fully documented and verified current in `docs/architecture/COMPONENT_INVENTORY.md` (mechanically cross-checked against the real 117-directory PrimeNG 21.1.9 tarball listing; citation-coverage checked in both directions). This report does not restate all 117 rows — see that document directly — and instead summarizes its state and reconciles it into this cross-framework structure.

| Metric | Count |
|---|---|
| Exclusively built | 18 |
| Split-scope (config, icons) | 2 |
| Exclusively remaining | 97 |

### Built (18 of 117 PrimeNG directories)

| Component | Category | Notes |
|---|---|---|
| Button (`UButton`) | Primitive | Standalone, OnPush, signal inputs |
| Checkbox (`UCheckbox`) | Form | CVA; migrated onto `writeControlValue` bridge |
| Dialog (`UDialog`) | Overlay | Single z-index bucket, no multi-dialog stacking yet |
| Menu (`UMenu`) | Navigation | Literal DOM focus movement (not virtual `aria-activedescendant`) |
| Tooltip (`UTooltip`) | Overlay | Single fixed-position alignment, no 4-way fallback |
| Ripple, AutoFocus, Fluid, Badge | Primitive/directive | All 4 primitives built |
| BaseComponent tier | Foundation | `UBaseComponent`, `UBaseEditableHolder`, `UltimateConfig` |
| FocusTrap + Overlay | Foundation | `UFocusTrap`, `UOverlay` (in `ng-core`) |
| Bind (`UBind`) | Foundation/directive | No sanitization — documented, tested risk |
| Table, Scroller, Paginator | Data | Built via a separate later initiative; filter vocabulary narrowed to string-match only (GAP-014/DECISION-C) |
| BaseModelHolder (`UModelHolder`) | Foundation | Inserted `UBaseComponent → UModelHolder → UBaseEditableHolder`, GAP-018 resolved |
| InputText (`UInputText`) | Form | Attribute directive, no own CVA — native `DefaultValueAccessor` remains sole accessor |
| BaseInput (`UBaseInput`) | Foundation | Inserted above `UBaseEditableHolder`; `U_FLUID_ANCESTOR` token avoids cross-entry-point import; GAP-038 resolved |
| InputNumber (`UInputNumber`) | Form | Real CVA (`NG_VALUE_ACCESSOR`), overrides `writeControlValue`; excludes Intl formatting/clipboard/caret logic/spinner buttons |

### Remaining (97 exclusively, + config/icons split-scope) — grouped by category

Full per-row detail (dependencies, style deps, a11y responsibilities, risk) lives in `COMPONENT_INVENTORY.md`. Category groupings below preserve that document's structure.

- **Form (later phase, ADAPT):** Autocomplete, CascadeSelect, ColorPicker, DatePicker, FileUpload, FloatLabel, IconField, IftaLabel, InputGroup, InputGroupAddon, InputIcon, InputMask, InputOTP, KeyFilter, Knob, Listbox, MultiSelect, Password, RadioButton, Rating, Select, SelectButton, Slider, Textarea, ToggleButton, ToggleSwitch, TreeSelect
- **Overlay (ADAPT, builds on Dialog):** ConfirmDialog, ConfirmPopup, ContextMenu, Drawer, DynamicDialog, Popover, OverlayBadge, StyleClass
- **Navigation (ADAPT, builds on Menu):** Breadcrumb, MegaMenu, Menubar, PanelMenu, Steps, Stepper, Tabs, TieredMenu, Dock, SpeedDial, SplitButton
- **Data (mixed):** TreeTable, Tree, OrderList, PickList, DataView — all `[DECISION NEEDED]`, deliberately deferred (no proven composition pattern; Tree-family structurally protected, ADR-043)
- **Panel/Layout/Display (ADAPT):** Accordion, Avatar, AvatarGroup, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, ImageCompare, Inplace, Message, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal, Timeline, Toast, Toolbar, AnimateOnScroll, DragDrop
- **Visualization:** Chart — `[DECISION NEEDED]` (Chart.js external dependency, DECISION-B)
- **Rich content:** Editor — `[DECISION NEEDED]` (Quill external dependency, DECISION-B)
- **Cross-cutting (split-scope, DECISION NEEDED):** `config` (full global config surface beyond ripple/unstyled), `passthrough` (pt/ptOptions system, deliberately excluded per ADR-018), `icons` (~85 of ~89 icon components remaining), `api` (remaining shared type contracts)
- **Not needed (superseded):** usestyle, classnames, ts-helpers, base, types, dom, utils, motion

---

## 3. Complete React Inventory

Real PrimeReact 10.9.9 source extracted from `.vendor-cache/primereact-10.9.9.tar.gz`, library root `components/lib/` (never the repo root, which is a Next.js showcase app — DEPENDENCIES.md's own flagged risk). 116 top-level directories mechanically counted — supersedes PROVENANCE.md's earlier "~111" estimate.

| Metric | Count |
|---|---|
| Total directories | 116 |
| Built | 8 |
| Remaining | 108 |

### Built (8) — real-source comparison

| Component | PrimeReact source | Verification depth | Confirmed gap / note |
|---|---|---|---|
| Button | `button/Button.js` | Not re-diffed this pass | — |
| Checkbox | `checkbox/Checkbox.js` | `[BUILT]` Line-by-line | Fully-controlled `checked`/`onChange`, matches upstream's own always-controlled pattern exactly |
| Dialog | `dialog/Dialog.js` | `[UNVERIFIED]` Not re-diffed | Real PrimeReact supports maximizable/blockScroll/breakpoints/keepInViewport — whether Ultimate's 202-line `UDialog` covers any of this is unverified |
| Menu | `menu/Menu.js` | Not re-diffed | — |
| Paginator | `paginator/Paginator.js` + 9 subcomponents | Per existing PROVENANCE.md record | Fully-controlled, no-uncontrolled-fallback; consumes `uix-data`'s `getPageCount` |
| Scroller | `virtualscroller/VirtualScroller.js` | Per existing record | Real windowing/measurement adapted; consumes `uix-data`'s `calculateNumItemsInViewport`/`calculateLast` |
| Table | `datatable/` (14 files) + `column/`, `columngroup/`, `row/` | `[UNVERIFIED]` Partially unverified | Real DataTable composes ColumnGroup/Row for multi-level headers, frozen columns, resizable/reorderable columns, export — coverage in Ultimate's Table not re-checked this pass |
| Tooltip | `tooltip/Tooltip.js` | Not re-diffed | — |

**Honesty note (carried from the source draft):** full line-by-line re-verification of Dialog/Menu/Table/Tooltip/Button against real PrimeReact source was out of scope for this pass given the 116-directory breadth required; Checkbox was verified in full as the representative sample. The existing `docs/architecture/provenance/react.json`/`react-core.json` file-level manifests are the authoritative per-file record for these 8 — this report does not supersede them, only cross-checks the componentbase/form-mechanism claim.

### Remaining (108) — grouped by category

- **Form (ADAPT, no foundation-tier prerequisite — see §5):** AutoComplete, CascadeSelect, Calendar, ColorPicker, Chips, Dropdown, FileUpload, FloatLabel, IconField, InputIcon, InputMask, InputNumber, InputOTP, InputSwitch, InputText, InputTextarea, KeyFilter, Knob, Listbox, Mention, MultiSelect, MultiStateCheckbox, Password, RadioButton, Rating, SelectButton, Slider, ToggleButton, TreeSelect, TriStateCheckbox *(SelectItem is type-only, bundled)*
- **Overlay (ADAPT):** ConfirmDialog, ConfirmPopup, ContextMenu, OverlayPanel *(=Popover elsewhere)*, OverlayService, Sidebar *(=Drawer elsewhere)*, StyleClass
- **Navigation (ADAPT):** Breadcrumb, Dock, MegaMenu, Menubar, PanelMenu, SlideMenu *(React-only, unverified cross-check)*, SpeedDial, SplitButton, Steps, Stepper + StepperPanel, TabMenu, TabView, TieredMenu
- **Data (mixed):** DataScroller (ADAPT); DataView, OrderList, PickList, Tree, TreeTable — all `[DECISION NEEDED]`
- **Panel/Layout/Display/Feedback (ADAPT):** Accordion, Avatar, AvatarGroup, BlockUI, ButtonGroup, Card, Carousel, Chip, DeferredContent, Divider, Fieldset, Galleria, Image, Inplace, Message, Messages, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal + TerminalService, Timeline, Toast, Toolbar
- **Visualization:** Chart — `[DECISION NEEDED]` (same DECISION-B posture)
- **Rich content:** Editor — `[DECISION NEEDED]`
- **Not needed / superseded (likely, per-item verification varies):** `componentbase` (covered by `react-core`'s `useComponentBase`), most of `utils` (covered by `uix-utils`), CSSTransition (likely superseded by `uix-motion`'s `createMotion` — inference, not independently verified)
- **Cross-cutting, unresolved:** `passthrough`, `api`'s global config object (`PrimeReactContext`) — same posture as Angular's `config` row

### React-specific foundation/architecture notes

> **React needs no BaseModelHolder/BaseInput-equivalent tier.** Verified directly from `InputText.js`/`InputTextBase.js`/`Checkbox.js`: every PrimeReact form component is fully controlled (`value`/`checked` prop + `onChange`/`onValueChange` callback), with no shared base class carrying model-value state. React has *no* `basemodelholder`/`baseeditableholder`/`baseinput` source directories at all in its 116-directory listing. This resolves the "genuinely unknown" note in `BLUEPRINT_GAPS.md` for React specifically: there is nothing to build — the Form family has zero foundation-tier prerequisite beyond the already-built `useComponentBase` hook.

- **`componentbase` (`ComponentBase.extend()`):** object-based mixin for prop-merging, passthrough resolution, style injection. Ultimate's `react-core/src/base/component-base.ts` (`useComponentBase`) covers the `cx()`/style-registration slice; full `pt` passthrough excluded, matching Angular's ADR-018 posture — but no equivalent ADR was found *by name* for React in `DECISIONS.md` (flagged as a documentation gap, not a technical one).
- **Hooks tier:** PrimeReact ships 18 individual hook modules (`useClickOutside`, `useOverlayListener`, `useResizeListener`, etc.). Ultimate's `react-core/src/hooks/` exists but was not enumerated file-by-file — largest unverified area of React's foundation tier, and a real prerequisite for any future overlay-based component.
- **Ripple gap (confirmed, real):** Angular and Vue both ship a Ripple primitive; React has none anywhere in `packages/react/src/` or `packages/react-core/src/`. Genuine cross-framework asymmetry, not a documentation oversight.

---

## 4. Complete Vue Inventory

Real PrimeVue 4.5.5 source extracted from `.vendor-cache/primevue-4.5.5.tar.gz`. PrimeVue's monorepo splits source across two roots: `packages/primevue/src/` (149 dirs — components/directives) and `packages/core/src/` (12 dirs — foundation tier), with 3 overlapping names holding genuinely different files (`config`, `usestyle`, `utils`). 158 unique directory names total.

| Metric | Count |
|---|---|
| Total unique directories | 158 |
| Built (9 components + 4 foundation + focustrap/portal) | 15 |
| Remaining (re-verify exact count in Phase B) | ~143 |

### Built (9 components) — real-source comparison

| Component | PrimeVue source | Confirmed gap / note |
|---|---|---|
| Button | `button/{Button,BaseButton}.vue` | Extends `createBaseComponent` directly, matching upstream (Button is not an editable-holder). Full prop parity unverified. |
| Checkbox | `checkbox/{Checkbox,BaseCheckbox}.vue` | Extends `createBaseInput()` — Vue's **only** real BaseInput consumer (see below) |
| Dialog | `dialog/{Dialog,BaseDialog}.vue` | **14 real upstream props confirmed excluded**: draggable, keepInViewport, minX/minY, maximizable + related icons/props, breakpoints, showHeader, contentStyle/Class/Props, closeIcon, closeButtonProps. Deliberate, YAGNI-scoped (spec §15). |
| Menu | `menu/{Menu,Menuitem,BaseMenu}.vue` | File-structure match only; behavior/prop parity not re-diffed |
| Paginator | `paginator/` (14 files, 9 subcomponents) | Ultimate's version is a single `Paginator.vue` — **not decomposed** into the same 9-subcomponent structure (JumpToPage, RowsPerPageDropdown, etc.). Whether all upstream behavior is reproduced inline is unverified. |
| Ripple | `ripple/{Ripple,BaseRipple}.js` | Confirmed real: `createDirective`, ink-span DOM creation, CSS-driven `.u-ink-active` toggle matches upstream measurement approach |
| Scroller | `virtualscroller/{VirtualScroller,BaseVirtualScroller}.vue` | Deliberate rename (Scroller vs. virtualscroller); real `ResizeObserver` usage preserved per existing PROVENANCE.md record |
| Table | `datatable/` (17 files) + separate `column/`, `columngroup/`, `row/` directories | Ultimate's Table is a single file, **not decomposed** the way real PrimeVue's ~17-file DataTable + 3 independent sibling directories are structured |
| Tooltip | `tooltip/{Tooltip,BaseTooltip}.js` | Confirmed real: `createDirective`, own z-index registry, uuid-based panel ID. `aria-describedby` parity unverified (mirrors Angular's resolved GAP-006 — unknown if Vue ever had/fixed the same gap). |

### Vue-specific foundation/architecture notes — most important finding

> **Vue's BaseEditableHolder/BaseInput tier already exists (built before this inventory was even requested) but has only ONE proven consumer, not two.**
>
> Real PrimeVue chain: `BaseComponent → BaseEditableHolder → BaseInput` (verified — no `BaseModelHolder` intermediate tier exists upstream in Vue at all; Angular's 4-tier chain is a genuine, source-confirmed framework difference, not a migration gap).
>
> Ultimate's equivalent: `createBaseEditableHolder()` / `createBaseInput()` in `packages/vue-core/src/base/`, Options-API `extends:` mixin pattern (matches real PrimeVue's own authoring style — Composition API is *not* the primary component mechanism in either upstream or Ultimate).
>
> **Only real consumer: `UCheckbox`** (grep-confirmed — no other non-spec file references `createBaseInput`/`createBaseEditableHolder`). Checkbox is a boolean input; it never exercises `size`/`variant`/typed-value coercion the way a text or numeric input would. Angular's equivalent milestone required *two* consumers spanning text (`UInputText`) and numeric (`UInputNumber`) before being considered proven for the wider ~15-component native-input family. **Vue's tier is real and correctly built, but its readiness for that wider family is genuinely less proven than Angular's** — a load-bearing distinction for Phase B/C sequencing, not a paperwork nuance.

- **Deliberate scope cut (documented in-code):** Ultimate's version excludes real upstream's entire `@primevue/forms`-coupled surface (`$pcForm`/`$pcFormField` injection, `formField.onChange`) — a real, working, verified upstream feature Ultimate chose not to port.
- **Fluid ancestor-detection gap:** `createBaseInput` injects `pcFluid`, but no `UFluid`-equivalent Vue component exists yet (`packages/vue/src/fluid/` does not exist) — `resolvedFluid` can never resolve `true` via ancestor detection today, only via an explicit prop. Unlike Angular, Vue has no packaging-defect reason to need a token-indirection workaround (no `ng-packagr`-equivalent secondary-entry-point crash risk found) — this is purely "component not built yet."
- **Directive pattern confirmed:** `createDirective` (`vue-core/src/directive/base-directive.ts`) is the real `BaseDirective`-equivalent, consumer-verified via Ripple and Tooltip.
- **No service tier built:** ConfirmationService/DialogService/ToastService have no Ultimate equivalent yet — blocks ConfirmDialog/DynamicDialog/Toast until built.

### Remaining (~143) — grouped by category

- **Form / native-input family (ADAPT, dependency-ordering caveat above):** InputText, InputNumber, Textarea, Password, InputMask, InputOtp, InputChips, ToggleSwitch, RadioButton, RadioButtonGroup, CheckboxGroup, Select, MultiSelect, CascadeSelect, TreeSelect, Listbox, SelectButton, ToggleButton, AutoComplete, DatePicker, ColorPicker, Knob, Slider, Rating, KeyFilter, FileUpload, FloatLabel, IftaLabel, IconField, InputIcon, InputGroup, InputGroupAddon *(InputSwitch, Dropdown, Calendar suspected deprecated aliases — unverified)*
- **Overlay (ADAPT):** ConfirmDialog, ConfirmPopup, ContextMenu, Drawer, DynamicDialog, Popover, OverlayBadge, StyleClass *(Sidebar, OverlayPanel suspected deprecated aliases — unverified)*
- **Navigation (ADAPT):** Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Dock, SpeedDial, SplitButton, Steps, Tabs family (5 dirs), Stepper family (6 dirs) *(TabMenu, TabView suspected deprecated — unverified)*
- **Data (mixed):** Column, ColumnGroup, Row (ADAPT, bundled w/ Table); TreeTable, Tree, OrderList, PickList, DataView — `[DECISION NEEDED]`
- **Panel/Layout/Display (ADAPT):** Accordion family (4 dirs), Avatar, AvatarGroup, Badge *(built in Angular, not yet in Vue — cross-framework asymmetry)*, BadgeDirective, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, ImageCompare, InlineMessage, Inplace, Message, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter family, Tag, Terminal + TerminalService, Timeline, Toast (+ service tier), Toolbar, AnimateOnScroll, DeferredContent
- **Visualization / Rich content:** Chart, Editor — both `[DECISION NEEDED]`
- **Cross-cutting, unresolved:** `config` (both roots), `passthrough`, `api` (likely partly covered by `uix-data`'s framework-agnostic `FilterMatchMode` — unverified for Vue specifically)

---

## 5. Cross-Framework Shared Architecture

| Package | Role | Consumed by |
|---|---|---|
| `uix-utils` | classnames, dom, escape, eventbus, mergeprops, object, scroll-lock, uuid, zindex | All 3 frameworks' core packages |
| `uix-styled` | StyleSheet service, style registration runtime | All 3, each with a framework-specific subclass (e.g. React's `ReactStyleSheet` — real DOM injection from day one; Angular's `ngCoreStyleSheet` never overrides `createStyleElement`, a real, disclosed, unfixed gap) |
| `uix-styles` | Design-token CSS modules (base + per-component) | All 3; React's own components do not yet source CSS from this via `dt()` calls (hand-written static CSS) — disclosed content gap, not a pipeline defect |
| `uix-motion` | Framework-agnostic `createMotion(element, options)` | Angular (Dialog), React (`useMotion`, replaces `react-transition-group` PrimeReact itself depends on), Vue |
| `uix-data` (ADR-043) | `equals`, `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast` | Table/Scroller/Paginator across all 3 frameworks. Deliberately excludes Tree-family selection (structurally incompatible — PrimeNG mutates object refs in place; React/Vue use external key-maps) and operator-based filter constraints (deferred pending real pressure). |

### Per-framework base-class architecture (Option B: reference, not verbatim)

| Framework | Chain | Mechanism | Form-integration |
|---|---|---|---|
| Angular | `UBaseComponent → UModelHolder → UBaseEditableHolder → UBaseInput` | Standalone classes, DI, signals | `ControlValueAccessor` (native or self-implemented per component) |
| React | *No equivalent chain — architecturally unnecessary* | `useComponentBase` hook | Fully-controlled props (`value`/`onChange`) — no CVA analogue anywhere in React's own architecture |
| Vue | `createBaseComponent → createBaseEditableHolder → createBaseInput` (3 tiers, no ModelHolder-equivalent — matches real PrimeVue's own chain shape) | Options-API `extends:` mixin factories | `v-model` / `update:modelValue` emit via `writeValue()` |

Directive-shaped primitives (FocusTrap/Tooltip/Ripple) are real Vue custom directives (`v-focustrap`/`v-tooltip`/`v-ripple`, via a separate `createDirective` factory — ADR-033/034), materially different in artifact shape from Angular's directive-with-component-render and React's ref-based sentinel/target components (ADR-025). This is dictated by each framework's own native primitives, not an independent Ultimate design choice.

### Escape / z-index / scroll-lock registries

Originally React-only (`react-core`), later extracted to `@ultimate/uix-utils/escape` and `/scroll-lock` once confirmed to have zero load-bearing React coupling (ADR-036) — `react-core` now delegates to the shared module rather than owning the logic, and Vue is expected to author its own thin reactive wrapper independently rather than depending on `react-core` directly (preserves framework-native isolation). Angular's `UOverlay`/`UDialog` have **not yet adopted** this shared mechanism (GAP-007) despite it being proven and available — pure backlog, no architecture fork.

---

## 6. Dependency / Ordering Map

### Proven dependency orderings (source-verified)

- **Angular Form family** — blocked until `UModelHolder` (light, InputText/Textarea-shaped) or `UBaseInput` (richer, CVA-implementing components) lands, per which tier a given component's real PrimeNG ancestor uses. Both tiers are now built and proven.
- **Angular ancestor-`UFluid` detection** — must route through `U_FLUID_ANCESTOR` token indirection (not a direct `UFluid` class import) for any component that needs its own secondary entry point, per GAP-009's refined trigger condition (§9 below).
- **Any framework's Tree-dependent component** (TreeSelect, TreeTable) — blocked on Tree, itself `[DECISION NEEDED]` and deliberately protected from reopening (ADR-043's structural-incompatibility finding: PrimeNG mutates node refs in place; React/Vue use external key-maps).
- **Any overlay-anchored component** (ContextMenu, MegaMenu, Menubar, PanelMenu, TieredMenu, AutoComplete, CascadeSelect, MultiSelect, etc., across all 3 frameworks) — depends on each framework's own overlay/portal groundwork, already built as part of the Dialog proof-set work.
- **Service-driven overlay families** (ConfirmDialog/ConfirmPopup, DynamicDialog, Toast) — depend on a not-yet-built provide/inject or DI service tier (Vue: ConfirmationService/DialogService/ToastService; Angular/React: no equivalent tier confirmed built either — `[UNVERIFIED]` not independently checked for Angular/React this pass).
- **Composed multi-directory families** — build container-first: Tabs (Vue: tabs→tablist→tab→tabpanel→tabpanels), Stepper (Vue: stepper→step→stepitem→steplist→steppanel→steppanels; Angular: single Stepper+Stepper Panel row), Accordion (Vue: accordion→accordionpanel→accordionheader→accordioncontent).
- **SplitButton** (all 3 frameworks) — depends on Button + Menu, both already built.
- **OverlayBadge** (Angular, PrimeVue-equivalent) — depends on Badge (built in Angular; **not yet built in Vue**, a real cross-framework asymmetry).

### Assumptions vs. proven facts

| Claim | Status |
|---|---|
| Angular's 4-tier chain generalizes to the ~20 remaining native-input Form components | `[BUILT]` Proven — pattern demonstrated twice (text + numeric) |
| Vue's 3-tier chain generalizes the same way | `[GAP]` Assumption — proven only for boolean input (Checkbox); untested for text/numeric coercion |
| React's Form family needs no shared foundation tier | `[BUILT]` Proven — architecturally confirmed absent upstream too |
| A component needing ancestor-`UFluid` detection can still get its own Angular secondary entry point, if routed through the token | `[BUILT]` Proven — `UInputNumber` is the positive proof; `UInputText` (direct import) is the negative control |
| Table's proven 3-framework composition pattern generalizes to TreeTable/OrderList/PickList/DataView | `[DECISION NEEDED]` Assumption, explicitly un-decided — DECISION-C's narrow remainder |

---

## 7. Existing Ultimate Coverage vs Prime

| Framework | Built | Coverage % | Notable narrowings vs. real Prime source |
|---|---|---|---|
| Angular | 18 / 117 | ~15% | No passthrough system; single z-index bucket (no multi-dialog stacking); Tooltip has no `aria-describedby` wiring (GAP-006); InputNumber excludes Intl formatting/clipboard/caret/spinner-buttons |
| React | 8 / 116 | ~7% | No passthrough; no Ripple primitive at all; Dialog excludes draggable/resizable/maximizable (ADR-030); no `react-transition-group` dependency (uses `uix-motion` instead — a deliberate improvement, not a narrowing) |
| Vue | 9 / 158 | ~6% | No passthrough, no `@primevue/forms` integration (ADR-039); Dialog excludes draggable/maximizable, resizable never existed upstream either (ADR-040); Paginator/Table not decomposed into upstream's real multi-file sub-component architecture |

Percentages are directory-count ratios, a rough proxy — not a maturity or effort measure. A handful of large composite areas (Table, Data family, Form family) dominate remaining effort far more than the raw count suggests.

### Confirmed cross-framework asymmetries

- **Ripple:** Angular ✅ / Vue ✅ / React ❌ (no directory anywhere)
- **Badge:** Angular ✅ / React — not confirmed this pass / Vue ❌
- **BaseInput-equivalent tier:** Angular ✅✅ (2 consumers) / Vue ✅ (1 consumer) / React N/A (architecturally unneeded)
- **Secondary entry points:** Angular ⚠️ (9 of 13 shippable components affected by a real build-tool defect) / React ✅ (all 8, zero exclusions) / Vue ✅ (all 9, zero exclusions confirmed for the built set)

---

## 8. Known Gaps and Unverified Areas

### Real, confirmed gaps (not just unverified — actually missing/narrowed)

- React has no Ripple primitive anywhere.
- Vue has no Fluid component yet — ancestor-detection is dead code without it.
- Vue has no ConfirmationService/DialogService/ToastService tier — blocks 3 component families.
- Angular's Tooltip has no `aria-describedby` wiring (GAP-006, tracked, low severity).
- Angular's `ngCoreStyleSheet` never actually injects a DOM `<style>` element (real gap found during Phase 3's cross-check, ADR-029) — React's equivalent works correctly from day one.
- Angular's overlay z-index/Escape handling has no multi-dialog stacking (GAP-007) — the shared, proven fix (`uix-utils/escape`+`/zindex`) exists and is already consumed by React, just not yet adopted by Angular.

### Unverified this pass (flagged explicitly by the source forks, not silently assumed)

- **React:** Dialog/Menu/Table/Tooltip not re-diffed line-by-line against real source (only Checkbox was, as representative sample); `hooks/` tier not enumerated file-by-file; whether `icons/` is genuinely empty or mis-scanned; whether an explicit ADR names React's passthrough exclusion by number.
- **Vue:** whether 8 suspected-deprecated directories (InputSwitch, Dropdown, Calendar, Sidebar, OverlayPanel, Chips, AccordionTab, TabMenu/TabView) are genuinely re-export shims or independent implementations — inferred from file-count heuristic only; Button/Menu/Paginator/Scroller/Table not behaviorally diffed beyond file-structure matching; whether `vue-core/overlay` is a verified Teleport-based Portal adaptation; whether Vue's Tooltip has the same `aria-describedby` gap Angular had.
- **Angular:** none material — inventory is current and was mechanically citation-checked in the source document itself.

### Deliberately deferred decisions (not reopened by this report)

- **DECISION-B** — external runtime dependency approval process (blocks Chart.js/Quill for all 3 frameworks). Still fully open.
- **DECISION-C** — narrowed to whether Table's proven 3-framework pattern generalizes to TreeTable/OrderList/PickList/DataView.
- **DECISION-D** — Tree-family, explicitly protected (ADR-043's structural-incompatibility finding). Not reopened.
- **DECISION-E** — package naming, gated to "before first stable release," not yet reached (all 17 packages at `0.1.0`).

---

## 9. Secondary Entry-Point Findings

Directly relevant to GAP-009/GAP-023, re-examined per the instruction to evaluate the newly-proven `UInputNumber`/`U_FLUID_ANCESTOR` pattern's implications.

### The refined trigger condition

Angular's `ng-packagr`/`ShimReferenceTagger` defect is triggered **specifically by one secondary entry point's compilation unit directly importing another secondary entry point's root class** — not by inherited ancestor-detection *behavior* in general. Confirmed by a real positive/negative pair:

- **Negative control — `UInputText`:** directly imports `UFluid`'s class (`inject(UFluid, {optional, host, skipSelf})`) → excluded from secondary entry points (ships via main barrel only).
- **Positive proof — `UInputNumber`:** also needs ancestor-`UFluid` detection (inherited via `UBaseInput`'s `hasFluid`), but never imports `UFluid`'s class directly — the `U_FLUID_ANCESTOR` `InjectionToken` indirection means the cross-entry-point class import never happens in its own compilation unit → ships as a real 9th secondary entry point, zero crash.

> **Practical consequence for future Angular work:** any future component needing ancestor-`UFluid` (or similarly-shaped ancestor) detection should route it through `UBaseInput`'s token pattern, not a direct class import, to remain eligible for its own secondary entry point.

### Current state, all 3 frameworks

| Framework | Secondary entry points | Exclusions | Mechanism |
|---|---|---|---|
| Angular | 9 of 13 shippable components (checkbox, paginator, scroller, tooltip, autofocus, badge, fluid, ripple, input-number) | button, dialog, menu, table, input-text — permanently excluded, upstream `ng-packagr` defect, no available fix | `ng-package.json` per entry, real `exports` map |
| React | All 8 built components | **None.** No React analogue to the defect exists — confirmed via real module-import-graph inspection, not just absence-of-evidence. | `package.json` `exports` map, standard bundler subpath exports |
| Vue | All 9 built components (implied by real per-component `exports` map; not independently stress-tested against a Fluid-ancestor-style cross-import scenario since Vue's Fluid component doesn't exist yet) | None found | `package.json` `exports` map |

Vue caveat: since Vue has no Fluid component yet, the specific cross-entry-point-import scenario that broke Angular has never actually been exercised in Vue. This is a genuine gap in verification, not a claim that Vue is immune — flagged for Phase B/C attention once Vue's Fluid component is built.

---

## 10. Migration Scope Boundaries

- **No Prime runtime dependency, ever** (ADR-004) — enforced by CI (`validate-dependency-ceiling.mjs`). Every component is adapted/reimplemented ("Option B: reference, not verbatim"), never re-exported or wrapped.
- **MIT-only baseline** (ADR-005) — PrimeReact 11.x is explicitly excluded as commercially licensed; only PrimeNG 21.1.9 / PrimeReact 10.9.9 / PrimeVue 4.5.5 / the four pinned `@primeuix/*` packages at their exact pinned versions are eligible source.
- **Framework-native implementations** (ADR-006) — no forced single rendering mechanism or forced API-shape parity across frameworks; divergence is expected and often correct (e.g. React's `aria-activedescendant` Menu vs. Angular's literal-DOM-focus Menu, both matching their own real upstream reference).
- **Tree-family selection/identity is out of scope for any shared contract** (ADR-043) — structurally incompatible across frameworks (object-reference mutation vs. external key-maps), remains framework-native.
- **External runtime dependencies** (Chart.js for Chart, Quill for Editor) require a not-yet-created approval process (DECISION-B) before any work can begin — currently a hard stop for those 2 component families across all 3 frameworks.
- **Passthrough (`pt`/`ptOptions`/etc.) is out of scope** everywhere, per each framework's own Option-B ADR, revisit only on real duplicate-pattern pressure — not a blanket "never," but not scheduled.
- **Full global config service** (locale, CSP nonce, full ripple/theme/z-index surface) is out of scope everywhere — each framework ships only a minimal `unstyled`/ripple-toggle subset today.

---

## 11. Documentation Sources Relevant to Migration

Not an exhaustive doc index — only the artifacts that materially informed this inventory and will matter to Phase B (Knowledge Reconciliation).

| Document | Relevance |
|---|---|
| `docs/architecture/COMPONENT_INVENTORY.md` | Angular's complete, current, mechanically-verified inventory — the template this report's structure follows |
| `docs/architecture/PROVENANCE.md` | Package-level provenance for all 3 Prime frameworks + 4 `@primeuix/*` packages; component-level file manifests referenced (`docs/architecture/provenance/*.json`) |
| `docs/architecture/BLUEPRINT_GAPS.md` | Full gap registry (47 ADRs' worth of cross-references) — GAP-009/018/023/038 directly informed this report's central findings; explicitly states React/Vue never had an inventory, which this report addresses |
| `docs/architecture/DECISIONS.md` | All 47 ADRs — per-framework architecture decisions, each citing specific real-source evidence (file paths, line numbers, prop names) |
| `docs/architecture/DEPENDENCIES.md` | Retained/vendored/excluded dependency classification; PrimeReact repo-root copy-paste risk flag |
| `docs/architecture/PACKAGE_ARCHITECTURE.md` | Monorepo package boundary contract, runtime dependency direction |
| `docs/architecture/ROADMAP.md` | Phase-by-phase status with disclosed footnote caveats per phase |
| `docs/architecture/research/2026-09-13-blueprint-closure-current-state-reconciliation.md` | Most recent audit — confirms nothing architectural blocks freezing the Blueprint; classifies every open gap/decision; directly informed §8's "deliberately deferred" list |
| `docs/architecture/research/2026-09-12-*.md` (3 documents) | Prior reconciliation audits this report's baseline document builds on — AI/knowledge architecture, project-reality audit, post-Phase-10 reconciliation |
| `.vendor-cache/{primeng-21.1.9,primereact-10.9.9,primevue-4.5.5}.tar.gz` | The actual pinned real Prime source used for every verification claim in this report |
| `scripts/provenance/extract-prime{ng,react,vue}-source.mjs` | Existing tooling for pulling a specific component's real source out of the pinned tarballs — reusable for Phase B/C per-component work |

---

## 12. Open Questions Requiring Decisions

Distinguished from unverified-but-answerable research gaps (§8) — these genuinely need a human or Phase B call, not just more grep.

1. **DECISION-B (pre-existing, unresolved):** what approval process governs a new external runtime dependency (Chart.js, Quill)? Blocks Chart and Editor across all 3 frameworks.
2. **DECISION-C's narrow remainder (pre-existing):** does Table's proven 3-framework composition pattern generalize to TreeTable/OrderList/PickList/DataView, or does each need its own architecture pass?
3. **New — Vue BaseInput tier sequencing:** should Vue build a second, text/numeric-input `createBaseInput` consumer (mirroring Angular's InputText→InputNumber sequence) before fanning out to the full native-input family, to raise proof-confidence to Angular's level? Or is one consumer (Checkbox) sufficient evidence to proceed? This is a genuine sequencing judgment call, not just a fact to verify.
4. **New — React passthrough exclusion documentation:** should an explicit ADR be added naming React's `componentbase`/passthrough exclusion (Angular has ADR-018 by name; no equivalent found for React), or is this purely a documentation-hygiene item with no decision content?
5. **New — naming reconciliation across frameworks:** Popover vs. OverlayPanel, Drawer vs. Sidebar, Select vs. Dropdown, DatePicker vs. Calendar, Tabs-family vs. TabView+TabMenu, Accordion-family vs. AccordionTab. Does Ultimate standardize on one name per concept across all 3 frameworks (breaking from whichever framework's real upstream uses the "other" name), or does each framework keep its own upstream-native name? This is a real product-API-design decision, not a research question — explicitly out of Phase A's scope to answer, flagged for Phase B.
6. **New — deprecated-alias verification:** before Phase B treats any of the 8 suspected-deprecated PrimeVue directories (§4) or the React naming variants (§3) as NOT NEEDED, their content should be read directly — this report's classification was a file-count heuristic, not a confirmed read.
7. **Pre-existing, still open:** DECISION-D (Tree-family) remains deliberately protected — not a question for Phase A or B to reopen absent new direct repository/source evidence per the task's own instruction.
8. **Pre-existing, non-urgent:** DECISION-E (package naming) — gated to first stable release, not yet reached.

---

*Phase A — Migration Inventory. Compiled from direct repository inspection and real pinned Prime source (PrimeNG 21.1.9 / PrimeReact 10.9.9 / PrimeVue 4.5.5) extracted from `.vendor-cache/`. No repository files were modified in the production of this report. Frozen as input to Phase B — Knowledge Reconciliation.*
