# Component Inventory

Full classification of all top-level source areas under PrimeNG 21.1.9's `packages/primeng/src/` (117 directories, confirmed authoritative via `tar -tzf .vendor-cache/primeng-21.1.9.tar.gz | grep -E "packages/primeng/src/[^/]+/$"` — see `docs/architecture/checksums.json` for the pinned tarball and `docs/architecture/PROVENANCE.md` for the PrimeNG package-level provenance record).

This is the Phase 2 deliverable referenced by the approved spec (`docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md`, Component Inventory section) and by `docs/architecture/PROVENANCE.md`'s PrimeNG entry. It supersedes that spec section's representative-row sample with the full ~117-row table.

Schema (11 columns): **Component** | **Prime source path** | **Category** | **Dependencies** | **UIX dependencies** | **Angular-specific responsibilities** | **Style dependencies** | **Accessibility responsibilities** | **Migration classification** | **Migration phase** | **Risk**.

- **Migration classification:** `ADAPT` (incorporate, PrimeNG source is the right design reference) / `NOT NEEDED` (no Ultimate equivalent planned — pure build/lint/internal tooling, or superseded by an Ultimate-owned mechanism) / `NEEDS ARCHITECTURE DECISION` (adaptation approach is unresolved, deferred pending a design decision).
- **Migration phase:** `Phase 2` (built and incorporated this phase) / `Later Phase` (planned, not yet started) / `Not Applicable` (paired with `NOT NEEDED`).
- **Risk** is a qualitative flag for later-phase planning (Low/Medium/High), not a Phase 2 blocker.

---

## Phase 2 — built and incorporated (12 areas)

| Component | Prime source path | Category | Dependencies | UIX dependencies | Angular-specific responsibilities | Style dependencies | Accessibility responsibilities | Migration classification | Migration phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| Button (`UButton`) | `packages/primeng/src/button/` | Primitive | basecomponent, bind, ripple, icons(Spinner) | uix-utils, uix-styled | Standalone component, `OnPush`, signal `input()`s, native `<button>` host | `uix-styles/button` | disabled state, loading state (`u-spinner-icon`) | ADAPT | **Phase 2 (done)** | Low |
| Checkbox (`UCheckbox`) | `packages/primeng/src/checkbox/` | Form | baseeditableholder, bind | uix-utils, uix-styled | CVA (`NG_VALUE_ACCESSOR`), split-signal disabled pattern (`disabled`/`_disabled`/`$disabled`) | `uix-styles/checkbox` | `role`/native `<input type="checkbox">` semantics, `aria-checked` via native input, keyboard space-toggle | ADAPT | **Phase 2 (done)** | Low |
| Dialog (`UDialog`) | `packages/primeng/src/dialog/` | Overlay | basecomponent, bind, focustrap, overlay, icons(Times) | uix-utils, uix-styled, uix-motion | Wires `UOverlay`+`UFocusTrap`+`createMotion` directly (no shared modal service, YAGNI); `effect()`-driven enter/leave motion | `uix-styles/dialog` | `aria-modal`, `aria-labelledby`, focus trap, Escape dismissal, focus-return-on-close (implemented — closes a gap PrimeNG's own source left unverified) | ADAPT | **Phase 2 (done)** | Medium (single z-index bucket; no multi-dialog stacking yet) |
| Menu (`UMenu`) | `packages/primeng/src/menu/` | Navigation | basecomponent, bind, ripple, tooltip, `@angular/router` (peer, genuinely consumed) | uix-utils, uix-styled | Flat (non-popup) `<ul role="menu">` rendering of `UMenuItem[]`; roving-tabindex via literal DOM focus movement (not PrimeNG's virtual `aria-activedescendant` pattern) | `uix-styles/menu` | `role="menu"`/`role="menuitem"`/`role="separator"`, roving tabindex with ArrowDown navigation (disabled items skipped) | ADAPT | **Phase 2 (done)** | Low |
| Tooltip (`UTooltip`) | `packages/primeng/src/tooltip/` | Overlay | basecomponent, bind | uix-utils, uix-styled | Directive-style attribute API (`[uTooltip]`); single fixed-position alignment (no 4-way fallback search) with horizontal viewport clamp | `uix-styles/tooltip` | `role="tooltip"` | ADAPT | **Phase 2 (done)** | Low |
| Ripple (`URipple`, lives in `@ultimate/ng`) | `packages/primeng/src/ripple/` | Primitive/directive | uix-utils | uix-utils | Attribute directive `[uRipple]`; unconditional ink effect (no `UltimateConfig` ripple-toggle gating) | n/a (structural CSS only) | inherited from host component | ADAPT | **Phase 2 (done)** | Low |
| AutoFocus (`UAutoFocus`, lives in `@ultimate/ng`) | `packages/primeng/src/autofocus/` | Primitive/directive | uix-utils | uix-utils | Attribute directive `[uAutoFocus]`; deferred `focus()` via `setTimeout(0)` | n/a | inherited from host component | ADAPT | **Phase 2 (done)** | Low |
| Fluid (`UFluid`, lives in `@ultimate/ng`) | `packages/primeng/src/fluid/` | Primitive | basecomponent | uix-utils | Element-selector component (`u-fluid`) with `<ng-content>` — not an attribute directive, contrary to an earlier plan assumption | n/a (structural CSS only) | n/a | ADAPT | **Phase 2 (done)** | Low |
| Badge (`UBadge`, lives in `@ultimate/ng`) | `packages/primeng/src/badge/` | Primitive | basecomponent | uix-utils, uix-styled | Component form only (no `[uBadge]` attribute-directive form) | `uix-styles/badge` | inherited from host component | ADAPT | **Phase 2 (done)** | Low |
| BaseComponent tier (`UBaseComponent`, `UBaseEditableHolder`, `UltimateConfig`) | `packages/primeng/src/basecomponent/`, `packages/primeng/src/baseeditableholder/`, `packages/primeng/src/config/` | Foundation | n/a | uix-utils, uix-styled | Option B: independently authored, PrimeNG-informed base classes — DI wiring, `dt`/`unstyled` inputs, `cx()` resolver, style registration; excludes passthrough/`$parentInstance`/full global config | n/a (infrastructure) | n/a | ADAPT (scoped) | **Phase 2 (done)** | Low |
| FocusTrap + Overlay (`UFocusTrap`, `UOverlay`, live in `ng-core`) | `packages/primeng/src/focustrap/`, `packages/primeng/src/overlay/` | Foundation/directive | basecomponent | uix-utils | Tab/Shift+Tab cycling directive; body-append + z-index positioning directive, `isPlatformBrowser()`-guarded | n/a | focus containment, tab-cycling | ADAPT | **Phase 2 (done)** | Low |
| Bind (`UBind`, lives in `ng-core`) | `packages/primeng/src/bind/` | Foundation/directive | uix-utils | uix-utils | Attribute directive applying arbitrary attributes/properties/listeners from a bound object via `Renderer2`; foundation infrastructure only — no Phase 2 component wires it in directly (PrimeNG's own Button/Dialog/Menu use it only through the excluded `pt`/passthrough call sites) | n/a | n/a (no sanitization — accepted, documented risk, see `bind.spec.ts`) | ADAPT | **Phase 2 (done)** | Low (documented, tested risk — not a defect) |

Icons (`icons/` — Spinner, Times, WindowMaximize, WindowMinimize, plus the shared `BaseIcon`-equivalent directive) are incorporated as a dependency of the above (Button uses Spinner; Dialog uses Times) rather than as an independently prioritized row; see `docs/architecture/provenance/ng-core.json` for their per-file entries. The remaining ~85+ PrimeNG icon components are listed under `icons` below, classified together with the icon area's remaining scope.

**Note on directory counting:** the 12 rows above map to 12 of PrimeNG's top-level source directories: `basecomponent`, `baseeditableholder`, `config`, `focustrap`, `overlay`, `bind`, `ripple`, `autofocus`, `fluid`, `badge`, `button`, `checkbox`, `dialog`, `menu`, `tooltip` is 15 directories, but `basecomponent`+`baseeditableholder`+`config` are grouped into one "BaseComponent tier" row and `focustrap`+`overlay` are grouped into one "FocusTrap + Overlay" row — 12 rows, 15 directories. `icons` (the 16th directory touched this phase) is *partially* built (4 of ~89 leaf icon components) and is deliberately tracked in the cross-cutting section below, not counted as a "built" directory here, since the vast majority of its content remains unbuilt. The 105-directory "remaining" count below therefore excludes these 15 built directories, counting `icons` among the 105 (partially built, mostly remaining).

---

## Remaining 105 areas — not yet incorporated

### Form components (later phase — ADAPT)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| BaseModelHolder / BaseInput (foundation tier, not yet built) | `packages/primeng/src/basemodelholder/`, `packages/primeng/src/baseinput/` | Foundation | extends `UBaseEditableHolder` (built, Phase 2) | uix-utils, uix-styled | shared `ngModel`/native-input-value-binding tier that every native-input-wrapping form component (InputText, InputNumber, Textarea, etc.) would inherit from, per the Forms Architecture decision (spec: prevent per-component CVA/value-binding duplication) | n/a (infrastructure) | n/a | ADAPT | Later Phase — first real consumer is the first native-input form component to migrate | Low — pattern already proven once by `UBaseEditableHolder`/`UCheckbox` in Phase 2 |
| Autocomplete | `packages/primeng/src/autocomplete/` | Form | basemodelholder/baseeditableholder tier, overlay | uix-utils, uix-styled | overlay list, keyboard nav, CVA | per-component | listbox ARIA pattern, `aria-expanded` | ADAPT | Later Phase | Medium |
| CascadeSelect | `packages/primeng/src/cascadeselect/` | Form | baseeditableholder tier, overlay | uix-utils, uix-styled | nested overlay panels, CVA | per-component | nested `aria-*`, keyboard nav | ADAPT | Later Phase | Medium |
| ColorPicker | `packages/primeng/src/colorpicker/` | Form | baseeditableholder tier, overlay | uix-utils, uix-styled | canvas/slider interaction, CVA | per-component | label association, keyboard control | ADAPT | Later Phase | Medium |
| DatePicker | `packages/primeng/src/datepicker/` | Form | baseeditableholder tier, overlay | uix-utils, uix-styled | calendar grid, keyboard nav, CVA | per-component | `grid`/date-cell ARIA pattern | ADAPT | Later Phase | High |
| FileUpload | `packages/primeng/src/fileupload/` | Form | basecomponent | uix-utils, uix-styled | drag-drop, progress reporting | per-component | progress announcement, file-list semantics | ADAPT | Later Phase | Medium |
| FloatLabel | `packages/primeng/src/floatlabel/` | Form | basecomponent | uix-utils, uix-styled | label-position wrapper | per-component | label association | ADAPT | Later Phase | Low |
| IconField | `packages/primeng/src/iconfield/` | Form | basecomponent | uix-utils, uix-styled | input decoration wrapper | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| IftaLabel | `packages/primeng/src/iftalabel/` | Form | basecomponent | uix-utils, uix-styled | label-position wrapper | per-component | label association | ADAPT | Later Phase | Low |
| InputGroup | `packages/primeng/src/inputgroup/` | Form | basecomponent | uix-utils, uix-styled | layout wrapper | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| InputGroupAddon | `packages/primeng/src/inputgroupaddon/` | Form | basecomponent | uix-utils, uix-styled | layout wrapper | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| InputIcon | `packages/primeng/src/inputicon/` | Form | basecomponent | uix-utils, uix-styled | icon slot wrapper | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| InputMask | `packages/primeng/src/inputmask/` | Form | baseeditableholder tier | uix-utils, uix-styled | mask-pattern input handling, CVA | per-component | label association, validation state | ADAPT | Later Phase | Medium |
| InputNumber | `packages/primeng/src/inputnumber/` | Form | baseeditableholder tier | uix-utils, uix-styled | numeric formatting/spinner, CVA | per-component | label association, validation state | ADAPT | Later Phase | Medium |
| InputOTP | `packages/primeng/src/inputotp/` | Form | baseeditableholder tier | uix-utils, uix-styled | multi-cell input handling, CVA | per-component | label association, focus movement between cells | ADAPT | Later Phase | Medium |
| InputText | `packages/primeng/src/inputtext/` | Form | baseeditableholder tier | uix-utils, uix-styled | directive form of native input, CVA | per-component | label association, validation state | ADAPT | Later Phase | Low |
| KeyFilter | `packages/primeng/src/keyfilter/` | Form | basecomponent | uix-utils | keydown filtering directive | n/a | n/a | ADAPT | Later Phase | Low |
| Knob | `packages/primeng/src/knob/` | Form | baseeditableholder tier | uix-utils, uix-styled | SVG drag/keyboard interaction, CVA | per-component | `role="slider"`, keyboard control | ADAPT | Later Phase | Medium |
| Listbox | `packages/primeng/src/listbox/` | Form | baseeditableholder tier | uix-utils, uix-styled | option list, multi-select, CVA | per-component | `role="listbox"`/`option`, keyboard nav | ADAPT | Later Phase | Medium |
| MultiSelect | `packages/primeng/src/multiselect/` | Form | baseeditableholder tier, overlay | uix-utils, uix-styled | overlay option list, chip display, CVA | per-component | `role="listbox"`, `aria-multiselectable` | ADAPT | Later Phase | Medium |
| Password | `packages/primeng/src/password/` | Form | baseeditableholder tier, overlay | uix-utils, uix-styled | strength-meter overlay, mask toggle, CVA | per-component | label association, validation state | ADAPT | Later Phase | Low |
| RadioButton | `packages/primeng/src/radiobutton/` | Form | baseeditableholder tier | uix-utils, uix-styled | native `<input type="radio">` wrapper, CVA | per-component | `role`/native radio semantics, group association | ADAPT | Later Phase | Low |
| Rating | `packages/primeng/src/rating/` | Form | baseeditableholder tier | uix-utils, uix-styled | icon-based star input, CVA | per-component | `role="radiogroup"`-style pattern, keyboard control | ADAPT | Later Phase | Medium |
| Select | `packages/primeng/src/select/` | Form | baseeditableholder tier, overlay | uix-utils, uix-styled | overlay option list, CVA | per-component | `role="listbox"`/`combobox` pattern, keyboard nav | ADAPT | Later Phase | Medium |
| SelectButton | `packages/primeng/src/selectbutton/` | Form | baseeditableholder tier | uix-utils, uix-styled | toggle-button group, CVA | per-component | `role="group"`, `aria-pressed` | ADAPT | Later Phase | Low |
| Slider | `packages/primeng/src/slider/` | Form | baseeditableholder tier | uix-utils, uix-styled | drag/keyboard handle interaction, CVA | per-component | `role="slider"`, keyboard control | ADAPT | Later Phase | Medium |
| Textarea | `packages/primeng/src/textarea/` | Form | baseeditableholder tier | uix-utils, uix-styled | directive form of native textarea, autoresize, CVA | per-component | label association, validation state | ADAPT | Later Phase | Low |
| ToggleButton | `packages/primeng/src/togglebutton/` | Form | baseeditableholder tier | uix-utils, uix-styled | boolean toggle button, CVA | per-component | `aria-pressed`, keyboard toggle | ADAPT | Later Phase | Low |
| ToggleSwitch | `packages/primeng/src/toggleswitch/` | Form | baseeditableholder tier | uix-utils, uix-styled | switch-style boolean input, CVA | per-component | `role="switch"`, `aria-checked` | ADAPT | Later Phase | Low |
| TreeSelect | `packages/primeng/src/treeselect/` | Form | baseeditableholder tier, overlay, tree | uix-utils, uix-styled | overlay tree picker, CVA | per-component | `role="tree"` pattern, keyboard nav | ADAPT | Later Phase | High (depends on Tree) |

### Overlay components (later phase — ADAPT, builds on Dialog groundwork)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| ConfirmDialog | `packages/primeng/src/confirmdialog/` | Overlay | dialog groundwork, button | uix-utils, uix-styled, uix-motion | service-driven confirmation modal | per-component | `aria-modal`, focus trap, Escape dismissal | ADAPT | Later Phase | Low |
| ConfirmPopup | `packages/primeng/src/confirmpopup/` | Overlay | overlay groundwork, button | uix-utils, uix-styled, uix-motion | anchored confirmation popover | per-component | dismissal, `role="dialog"` | ADAPT | Later Phase | Low |
| ContextMenu | `packages/primeng/src/contextmenu/` | Overlay/Navigation | menu groundwork, overlay | uix-utils, uix-styled, uix-motion | right-click-triggered popup menu | per-component | `role="menu"`, keyboard nav, focus return | ADAPT | Later Phase | Medium |
| Drawer | `packages/primeng/src/drawer/` | Overlay | overlay groundwork, focustrap | uix-utils, uix-styled, uix-motion | slide-in panel, position variants | per-component | `aria-modal`, focus trap, Escape dismissal | ADAPT | Later Phase | Low |
| DynamicDialog | `packages/primeng/src/dynamicdialog/` | Overlay | dialog groundwork | uix-utils, uix-styled, uix-motion | service-driven dynamic component injection into a dialog | per-component | same as Dialog | ADAPT | Later Phase | Medium |
| Popover | `packages/primeng/src/popover/` | Overlay | overlay groundwork | uix-utils, uix-styled, uix-motion | anchored floating panel | per-component | dismissal, `role="dialog"` | ADAPT | Later Phase | Low |
| OverlayBadge | `packages/primeng/src/overlaybadge/` | Overlay/Primitive | badge (built) | uix-utils, uix-styled | badge positioned over host content | per-component | inherited from host | ADAPT | Later Phase | Low |
| StyleClass | `packages/primeng/src/styleclass/` | Overlay/directive | dom | uix-utils | class-toggle animation directive (toggles classes on click, used to build collapsible menus) | n/a | n/a | ADAPT | Later Phase | Low |

### Navigation components (later phase — ADAPT, builds on Menu groundwork)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| Breadcrumb | `packages/primeng/src/breadcrumb/` | Navigation | basecomponent, `@angular/router` | uix-utils, uix-styled | trail-of-links rendering | per-component | `aria-label="breadcrumb"`, `aria-current` | ADAPT | Later Phase | Low |
| MegaMenu | `packages/primeng/src/megamenu/` | Navigation | menu groundwork, overlay | uix-utils, uix-styled, uix-motion | multi-column popup menu | per-component | nested `aria-*`, keyboard nav | ADAPT | Later Phase | Medium |
| Menubar | `packages/primeng/src/menubar/` | Navigation | menu groundwork, overlay | uix-utils, uix-styled, uix-motion | horizontal bar with nested popup submenus | per-component | `role="menubar"`, nested `aria-*`, keyboard nav | ADAPT | Later Phase | Medium |
| PanelMenu | `packages/primeng/src/panelmenu/` | Navigation | menu groundwork | uix-utils, uix-styled, uix-motion | accordion-style nested menu | per-component | `role="tree"`-like pattern, keyboard nav | ADAPT | Later Phase | Medium |
| Steps | `packages/primeng/src/steps/` | Navigation | basecomponent, `@angular/router` | uix-utils, uix-styled | linear step indicator | per-component | `aria-current`, keyboard nav between steps | ADAPT | Later Phase | Low |
| Stepper | `packages/primeng/src/stepper/` | Navigation | basecomponent | uix-utils, uix-styled | multi-panel stepper with content projection | per-component | `role="tablist"`-like pattern | ADAPT | Later Phase | Medium |
| Tabs | `packages/primeng/src/tabs/` | Navigation | basecomponent | uix-utils, uix-styled | tab list + panel association | per-component | `role="tablist"`/`role="tab"`/`role="tabpanel"`, keyboard nav | ADAPT | Later Phase | Medium |
| TieredMenu | `packages/primeng/src/tieredmenu/` | Navigation | menu groundwork, overlay | uix-utils, uix-styled, uix-motion | nested popup submenus | per-component | nested `aria-*`, keyboard nav | ADAPT | Later Phase | Medium |
| Dock | `packages/primeng/src/dock/` | Navigation | basecomponent | uix-utils, uix-styled | macOS-dock-style magnified icon bar | per-component | `role="menu"`-like pattern, keyboard nav | ADAPT | Later Phase | Low |
| SpeedDial | `packages/primeng/src/speeddial/` | Navigation/Overlay | basecomponent, button | uix-utils, uix-styled, uix-motion | expandable floating action-button menu | per-component | `role="menu"`, keyboard nav | ADAPT | Later Phase | Low |
| SplitButton | `packages/primeng/src/splitbutton/` | Navigation/Primitive | button, menu groundwork, overlay | uix-utils, uix-styled, uix-motion | button + attached dropdown menu | per-component | `aria-haspopup`, keyboard nav | ADAPT | Later Phase | Low |

### Data components (later phase — NEEDS ARCHITECTURE DECISION, per spec)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| Table | `packages/primeng/src/table/` | Data | primitive + overlay tiers, scroller, paginator | uix-utils, uix-styled | sort/filter/select/virtualization state | per-component | complex grid ARIA pattern (`role="grid"`) | NEEDS ARCHITECTURE DECISION | Later Phase | High |
| TreeTable | `packages/primeng/src/treetable/` | Data | table groundwork, tree | uix-utils, uix-styled | hierarchical grid state | per-component | `role="treegrid"` | NEEDS ARCHITECTURE DECISION | Later Phase | High |
| Tree | `packages/primeng/src/tree/` | Data | primitive tier | uix-utils, uix-styled | hierarchical selection/expansion state | per-component | `role="tree"`/`treeitem`, keyboard nav | NEEDS ARCHITECTURE DECISION | Later Phase | High |
| Scroller | `packages/primeng/src/scroller/` | Data | basecomponent | uix-utils | virtual-scroll windowing (used internally by Table/Tree/etc.) | n/a | n/a (internal to consuming component) | NEEDS ARCHITECTURE DECISION | Later Phase | High |
| Paginator | `packages/primeng/src/paginator/` | Data | basecomponent | uix-utils, uix-styled | page-index/page-size state | per-component | `aria-label` navigation, keyboard nav | NEEDS ARCHITECTURE DECISION | Later Phase | Medium |
| OrderList | `packages/primeng/src/orderlist/` | Data | basecomponent, dragdrop | uix-utils, uix-styled | drag/keyboard reordering state | per-component | `role="listbox"`, keyboard reorder | NEEDS ARCHITECTURE DECISION | Later Phase | Medium |
| PickList | `packages/primeng/src/picklist/` | Data | basecomponent, dragdrop | uix-utils, uix-styled | dual-list transfer state | per-component | `role="listbox"` × 2, keyboard transfer | NEEDS ARCHITECTURE DECISION | Later Phase | Medium |
| DataView | `packages/primeng/src/dataview/` | Data | paginator | uix-utils, uix-styled | grid/list layout switch, paging | per-component | landmark/list semantics | NEEDS ARCHITECTURE DECISION | Later Phase | Medium |

A shared selection/sort/filter/virtualization contract should be designed once, before the first of these components starts (spec: Data Component Strategy) — this decision point is explicitly deferred past Phase 2 per YAGNI; each row above is individually classified `NEEDS ARCHITECTURE DECISION` rather than `ADAPT` for this reason, not because PrimeNG's own implementation is unusable as a reference.

### Panel / layout / display components (later phase — ADAPT, mostly independent of proof-set groundwork)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| Accordion | `packages/primeng/src/accordion/` | Panel/Layout | basecomponent | uix-utils, uix-styled, uix-motion | expand/collapse panel group | per-component | `role="region"`, `aria-expanded`, keyboard toggle | ADAPT | Later Phase | Low |
| Avatar | `packages/primeng/src/avatar/` | Display | basecomponent | uix-utils, uix-styled | image/initials/icon display | per-component | `alt` text passthrough | ADAPT | Later Phase | Low |
| AvatarGroup | `packages/primeng/src/avatargroup/` | Display | avatar | uix-utils, uix-styled | overlap-layout wrapper | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| BlockUI | `packages/primeng/src/blockui/` | Feedback/Layout | overlay groundwork | uix-utils, uix-styled | content-blocking overlay mask | per-component | `aria-busy` | ADAPT | Later Phase | Low |
| ButtonGroup | `packages/primeng/src/buttongroup/` | Layout | button (built) | uix-utils, uix-styled | layout wrapper | per-component | `role="group"` | ADAPT | Later Phase | Low |
| Card | `packages/primeng/src/card/` | Panel/Layout | basecomponent | uix-utils, uix-styled | content-slot layout wrapper | per-component | landmark semantics | ADAPT | Later Phase | Low |
| Carousel | `packages/primeng/src/carousel/` | Data/Display | basecomponent | uix-utils, uix-styled, uix-motion | slide navigation, autoplay timer | per-component | `role="region"`, live-region slide announcement | ADAPT | Later Phase | Medium |
| Chip | `packages/primeng/src/chip/` | Display | basecomponent | uix-utils, uix-styled | removable tag display | per-component | `role="button"` on remove icon | ADAPT | Later Phase | Low |
| Divider | `packages/primeng/src/divider/` | Layout | basecomponent | uix-utils, uix-styled | visual/semantic separator | per-component | `role="separator"` | ADAPT | Later Phase | Low |
| Editor | `packages/primeng/src/editor/` | Rich content | wraps an external rich-text-editor dependency (Quill) | uix-utils | rich-text editing wrapper, CVA | per-component | editor toolbar ARIA (delegated to underlying library) | NEEDS ARCHITECTURE DECISION | Later Phase | High (external dependency approval) |
| Fieldset | `packages/primeng/src/fieldset/` | Panel/Layout | basecomponent | uix-utils, uix-styled | native `<fieldset>`-style collapsible group | per-component | `role="region"`, `aria-expanded` | ADAPT | Later Phase | Low |
| Galleria | `packages/primeng/src/galleria/` | Display | basecomponent | uix-utils, uix-styled, uix-motion | thumbnail/fullscreen image viewer | per-component | `role="region"`, keyboard nav, focus trap in fullscreen mode | ADAPT | Later Phase | Medium |
| Image | `packages/primeng/src/image/` | Display | basecomponent, overlay | uix-utils, uix-styled, uix-motion | preview/zoom overlay | per-component | `alt` text passthrough, focus trap in preview mode | ADAPT | Later Phase | Low |
| ImageCompare | `packages/primeng/src/imagecompare/` | Display | basecomponent | uix-utils, uix-styled | before/after slider comparison | per-component | `role="slider"`, keyboard control | ADAPT | Later Phase | Low |
| Inplace | `packages/primeng/src/inplace/` | Panel | basecomponent | uix-utils, uix-styled | click-to-edit content toggle | per-component | `role="button"`, focus management on toggle | ADAPT | Later Phase | Low |
| Message | `packages/primeng/src/message/` | Feedback | basecomponent | uix-utils, uix-styled, uix-motion | inline severity-styled message | per-component | `role="alert"`/`role="status"` | ADAPT | Later Phase | Low |
| MeterGroup | `packages/primeng/src/metergroup/` | Data/Display | basecomponent | uix-utils, uix-styled | segmented meter/progress display | per-component | `role="meter"` pattern | ADAPT | Later Phase | Low |
| OrganizationChart | `packages/primeng/src/organizationchart/` | Data/Display | basecomponent | uix-utils, uix-styled | hierarchical tree-chart layout | per-component | `role="tree"`-like pattern | ADAPT | Later Phase | Medium |
| Panel | `packages/primeng/src/panel/` | Panel/Layout | basecomponent | uix-utils, uix-styled, uix-motion | collapsible content panel | per-component | `role="region"`, `aria-expanded` | ADAPT | Later Phase | Low |
| ProgressBar | `packages/primeng/src/progressbar/` | Feedback | basecomponent | uix-utils, uix-styled | determinate/indeterminate bar | per-component | `role="progressbar"` | ADAPT | Later Phase | Low |
| ProgressSpinner | `packages/primeng/src/progressspinner/` | Feedback | basecomponent | uix-utils, uix-styled | SVG spinner animation | per-component | `role="progressbar"` (indeterminate) | ADAPT | Later Phase | Low |
| ScrollPanel | `packages/primeng/src/scrollpanel/` | Layout | basecomponent | uix-utils, uix-styled | custom-scrollbar viewport wrapper | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| ScrollTop | `packages/primeng/src/scrolltop/` | Navigation/Feedback | basecomponent, button | uix-utils, uix-styled, uix-motion | scroll-position-triggered button | per-component | `aria-label` | ADAPT | Later Phase | Low |
| Skeleton | `packages/primeng/src/skeleton/` | Feedback/Display | basecomponent | uix-utils, uix-styled | loading-placeholder shape | per-component | `aria-hidden` (decorative) | ADAPT | Later Phase | Low |
| Splitter | `packages/primeng/src/splitter/` | Layout | basecomponent | uix-utils, uix-styled | drag-resizable pane layout | per-component | `role="separator"`, keyboard resize | ADAPT | Later Phase | Medium |
| Tag | `packages/primeng/src/tag/` | Display | basecomponent | uix-utils, uix-styled | severity-styled label | per-component | n/a (visual only) | ADAPT | Later Phase | Low |
| Terminal | `packages/primeng/src/terminal/` | Display | basecomponent | uix-utils, uix-styled | command-line-style input/output log | per-component | `role="log"`, label association on input | ADAPT | Later Phase | Low |
| Timeline | `packages/primeng/src/timeline/` | Data/Display | basecomponent | uix-utils, uix-styled | chronological event list layout | per-component | `role="list"` semantics | ADAPT | Later Phase | Low |
| Toast | `packages/primeng/src/toast/` | Feedback | basecomponent, overlay | uix-utils, uix-styled, uix-motion | service-driven transient notification stack | per-component | `role="alert"`/`aria-live`, focus management | ADAPT | Later Phase | Medium |
| Toolbar | `packages/primeng/src/toolbar/` | Layout | basecomponent | uix-utils, uix-styled | content-slot horizontal bar | per-component | `role="toolbar"` | ADAPT | Later Phase | Low |
| AnimateOnScroll | `packages/primeng/src/animateonscroll/` | Primitive/directive | uix-utils, uix-motion | uix-utils, uix-motion | scroll-triggered animation directive | n/a | n/a | ADAPT | Later Phase | Low |
| DragDrop | `packages/primeng/src/dragdrop/` | Primitive/directive | uix-utils | uix-utils | drag-source/drop-target directive pair (used by OrderList/PickList) | n/a | n/a | ADAPT | Later Phase | Medium |

### Visualization (needs architecture decision — external dependency)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| Chart | `packages/primeng/src/chart/` | Data/Visualization | wraps Chart.js (external) | uix-utils | wrapper around an external charting library | n/a | screen-reader chart summary | NEEDS ARCHITECTURE DECISION | Later Phase | High (depends on approving an external charting dependency; blocked by ADR-004's no-required-runtime-dependency posture until Chart.js is evaluated as an explicit, approved peer dependency) |

### Cross-cutting infrastructure (needs architecture decision — revisit once later-phase components create real pressure)

| Component | Prime source path | Category | Dependencies (typical) | UIX deps | Angular-specific responsibilities | Style dep | A11y responsibility | Classification | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| `config` (full surface) | `packages/primeng/src/config/` | Cross-cutting | n/a | n/a | full `PrimeNGConfig`-equivalent global config service (ripple/theme/locale/z-index/CSP-nonce/etc.) | n/a | n/a | NEEDS ARCHITECTURE DECISION | Not resolved in Phase 2 | Medium — Phase 2's `UltimateConfig` only covers `unstyled`/ripple signals (ADR-018); this is the deferred remainder |
| `passthrough` | `packages/primeng/src/passthrough/` | Cross-cutting | n/a | n/a | `pt`/`ptOptions`/`ptm`/`ptms`/`ptmo` attribute/property passthrough system | n/a | n/a | NEEDS ARCHITECTURE DECISION | Not resolved in Phase 2 | Medium — deliberately excluded from Option B per ADR-018; revisit only on real duplicate-pattern pressure |
| `icons` (remaining ~85+ icon components) | `packages/primeng/src/icons/` | Cross-cutting/Display | basecomponent (icons tier) | uix-utils | one component per remaining PrimeNG icon (only Spinner/Times/WindowMaximize/WindowMinimize built in Phase 2) | n/a | `role="img"` per icon (established pattern from the 4 built icons) | ADAPT (mechanical, low-risk — pattern already proven) | Later Phase (as each consuming component needs an icon) | Low |
| `api` (remaining surface) | `packages/primeng/src/api/` | Cross-cutting | n/a | n/a | remaining shared type contracts beyond `UMenuItem`/`UTooltipOptions` (`ConfirmationOptions`, `TreeNode`, `SortEvent`, `FilterMetadata`, `MessageOptions`, etc.) | n/a | n/a | NEEDS ARCHITECTURE DECISION | Not resolved in Phase 2 | Low — each type is reimplemented-with-reference alongside its owning component, same pattern as `UMenuItem`/`UTooltipOptions` |

### Not needed (superseded by an Ultimate-owned mechanism, or pure internal tooling)

| Component | Prime source path | Category | Reason | Classification | Phase | Risk |
|---|---|---|---|---|---|---|
| `usestyle` | `packages/primeng/src/usestyle/` | Internal tooling | Style registration is already handled by `@ultimate/uix-styled`'s `StyleSheet` service, wired through `UBaseComponent`'s `ngOnInit` (ADR-018) — PrimeNG's own `useStyle` composable has no separate Ultimate equivalent to build | NOT NEEDED | Not Applicable | n/a |
| `classnames` (PrimeNG's own, distinct from `@ultimate/uix-utils/classnames`) | `packages/primeng/src/classnames/` | Internal tooling | Superseded by `@ultimate/uix-utils`'s own `classnames` module, already incorporated in Phase 1 and reused directly by every Phase 2 component's `cx()` resolver — no separate port needed | NOT NEEDED | Not Applicable | n/a |
| `ts-helpers` | `packages/primeng/src/ts-helpers/` | Internal tooling | TypeScript compiler-support helpers internal to PrimeNG's own build; no runtime behavior to port, and the monorepo's own TypeScript tooling (Phase 0) already covers this need | NOT NEEDED | Not Applicable | n/a |
| `base` | `packages/primeng/src/base/` | Internal tooling | PrimeNG's own package-level base/shared re-export scaffolding, not a component; superseded by `ng-core`'s own barrel/module structure | NOT NEEDED | Not Applicable | n/a |
| `types` | `packages/primeng/src/types/` | Internal tooling | PrimeNG's own package-wide ambient/utility TypeScript types; Ultimate defines its own equivalents locally per module (e.g. `ng-core/src/api/types.ts`) rather than porting this file wholesale | NOT NEEDED | Not Applicable | n/a |
| `dom` | `packages/primeng/src/dom/` | Internal tooling | DOM helper utilities — superseded by `@ultimate/uix-utils/dom`, already incorporated in Phase 1 and reused directly (e.g. `getFocusableElements`, confirmed reused by both `UFocusTrap` and `UAutoFocus` rather than duplicated) | NOT NEEDED | Not Applicable | n/a |
| `utils` | `packages/primeng/src/utils/` | Internal tooling | General utility helpers (`ObjectUtils`, `ZIndexUtils`, etc.) — superseded by `@ultimate/uix-utils`'s equivalent submodules (e.g. `zindex`), already incorporated in Phase 1 | NOT NEEDED | Not Applicable | n/a |
| `motion` | `packages/primeng/src/motion/` | Internal tooling | PrimeNG's own Angular-specific `MotionModule`/`[pMotion]` structural directive wrapping `@primeuix/motion` — superseded by `@ultimate/uix-motion`'s `createMotion(element, options)` API, called imperatively from component code (e.g. `UDialog`'s `effect()`-driven enter/leave) rather than via a structural directive; confirmed no equivalent directive exists in `@ultimate/uix-motion` and none is needed for the Phase 2 proof set | NOT NEEDED | Not Applicable | n/a |

---

## Verification

- Full directory count confirmed via `tar -tzf .vendor-cache/primeng-21.1.9.tar.gz | grep -E "packages/primeng/src/[^/]+/$" | wc -l` → **117**.
- Coverage was verified mechanically, not by hand-counting: every `packages/primeng/src/<name>/` path cited anywhere in this document was extracted (`grep -oE 'packages/primeng/src/[a-zA-Z0-9_-]+/'`), deduplicated, and diffed against the authoritative 117-directory tarball listing. The diff is empty in both directions — every one of the 117 directories is cited at least once in this document (either its own row, grouped with siblings into one row, or bundled into a "remaining icon components" / "remaining api surface" cross-cutting row), and no directory not present in the authoritative listing is cited.
- 12 directories are classified `Phase 2 (done)`; 105 remain, spread across the "Form components", "Overlay components", "Navigation components", "Data components", "Panel / layout / display components", "Visualization", "Cross-cutting infrastructure", and "Not needed" tables.
