# Implementation Plan — Phase C, Batch 1: Ordinary Cross-Framework Capability Migration

**Document:** `docs/superpowers/plans/2026-09-17-phase-c-batch-1-migration-implementation.md`
**Status:** Approved — Plan Review passed, both flagged Plan-level decisions confirmed, human-approved. Ready for Implementation.
**Approved specification:** `docs/superpowers/specs/2026-09-17-phase-c-batch-1-migration-design.md` (Spec Gate: **APPROVED**, corrections applied per the Spec Review conversation).
**Branch:** `feature/phase-c-batch-1-migration` (created off clean `main` at `e04bd5e`, verified clean at plan-writing time).
**Required sequence (this document is the Implementation Plan step):** Phase C Roadmap ✅ → Batch 1 Brainstorming/Decision ✅ → Specification ✅ → Spec Review ✅ → **Implementation Plan (this document)** → Plan Review → Implementation → Verification → Final Review/Closeout → merge to `main` → next batch, per the Roadmap.

This plan does not implement anything. It does not modify any Ultimate package, `COMPONENT_INVENTORY.md`, `BLUEPRINT_GAPS.md`, `DECISIONS.md`, or `BLUEPRINT.md`. It defines the exact tasks a future, separately-authorized Implementation step must execute, each citing the exact approved-specification section it satisfies.

---

## Pre-planning inspection performed (evidence this plan is grounded on)

- **Current working-tree state, confirmed by direct inspection:** on `feature/phase-c-batch-1-migration`, working tree clean except this plan document itself (new, untracked) and the already-committed, already-approved specification (`e04bd5e`'s Roadmap commit plus the uncommitted-but-approved spec file — confirmed via `git status --short`/`git diff --stat` immediately before writing this plan). No other pending change exists.
- **Built-package baseline, re-confirmed by direct directory listing** (matches Dependency Map/Parity Matrix exactly, zero drift): `packages/ng/src/` — 14 directories (autofocus, badge, button, checkbox, dialog, fluid, input-number, input-text, menu, paginator, ripple, scroller, table, tooltip); `packages/react/src/` — 8 (button, checkbox, dialog, menu, paginator, scroller, table, tooltip); `packages/vue/src/` — 9 (button, checkbox, dialog, menu, paginator, ripple, scroller, table, tooltip).
- **Foundation-tier baseline, re-confirmed:** `packages/ng-core/src/` contains `api`, `base-editable-holder`, `base-input`, `basecomponent`, `bind`, `config`, `focus-trap`, `icons`, `id`, `model-holder`, `overlay`. `packages/react-core/src/` contains `base`, `escape`, `focus-trap`, `hooks`, `icons`, `motion`, `overlay`, `scroll-lock`, `styling`, `zindex`. `packages/vue-core/src/` contains `base`, `directive`, `escape`, `focus-trap`, `icons`, `motion`, `overlay`, `scroll-lock`, `styling`, `zindex`.
- **Per-component file pattern, confirmed by inspecting `packages/{ng,react,vue}/src/button/`:** Angular — `{name}.ts`, `{name}-style.ts`, `{name}.spec.ts`, `{name}.stories.ts`, `index.ts`. React — `{name}.tsx`, `{name}-style.ts`, `{name}.spec.tsx`, `{name}.stories.tsx`, `index.ts`. Vue — `{Name}.vue`, `base-{name}.ts`, `{name}-style.ts`, `{name}.spec.ts`, `{name}.stories.ts`, `index.ts`. Every Batch 1 capability's task follows this exact per-framework file pattern — not restated per capability below.
- **Pinned Prime source extraction tooling, confirmed present and reusable, no new tooling authorized:** `scripts/provenance/extract-primeng-source.mjs`, and its React/Vue siblings (same directory), against `.vendor-cache/primeng-21.1.9.tar.gz`, `.vendor-cache/primereact-10.9.9.tar.gz`, `.vendor-cache/primevue-4.5.5.tar.gz` — all three tarballs confirmed present in `.vendor-cache/`.
- **`COMPONENT_INVENTORY.md`'s current schema, confirmed by direct read:** 11-column table (Component, Prime source path, Category, Dependencies, UIX dependencies, Angular-specific responsibilities, Style dependencies, Accessibility responsibilities, Migration classification, Migration phase, Risk) — the pattern every Angular Batch 1 task's `COMPONENT_INVENTORY.md` row update follows (Task Group Z, §8 below).

---

## Global constraints (binding on every task below, restated from the approved specification)

- **Exact capability scope, no more, no less** — the 79 canonical capabilities named in spec §3 (30 Form + 8 Overlay + 11 Navigation + 30 Panel/Layout/Display/Feedback), each realized only for the framework(s) spec §3 marks eligible. No task may add a capability, add a framework realization for an Unverified/excluded framework, or drop a capability that spec §3 includes.
- **Excluded, unconditionally, not touched by any task:** TreeSelect, OrganizationChart, Messages, every architectural exception (Chart, Editor, Tree, TreeTable, OrderList, PickList, DataView, Angular `config` full surface), and the four deferred items (React Ripple, Vue Fluid, React DataScroller, Vue InlineMessage).
- **Capability-scoped, per-framework-independent realization** (spec §4 items 1–2) — a mixed-eligibility capability's eligible-framework tasks proceed independently of its deferred-framework task; no task blocks on a sibling framework's task for the same capability unless spec §5 states an explicit ordering.
- **No Unverified capability promoted** (spec §4 item 3) — no task may implement a capability/framework pair the spec marks Unverified-and-excluded.
- **Dependency correctness governs sequencing** (spec §5) — restated as this plan's own Task Group ordering (§2 below). No task starts before its stated prerequisite task completes.
- **Functional Family organizes task *presentation* only** (spec §4 item 6) — this remains **one Implementation Plan**; Task Groups below are internal organization, not separate plans, and share one Verification (§9) and one Final Review/Closeout (§10).
- **Proof-by-exception** (spec §4 item 7) — no task performs a feasibility study. Where a capability's real Prime source reveals a genuinely new architectural pattern, unresolved dependency, or exception not already known, the implementer stops that specific task and escalates (Task Group templates state this explicitly, §3).
- **Framework-native implementation, no forced shared shape, no Prime runtime dependency** (spec §4 items 8–9) — every task's public API is derived from that framework's own real pinned Prime source, never copied cross-framework.
- **No new foundation-tier work beyond the two named Vue infrastructure items** (spec §6) — every task reuses the foundation tiers named in the Pre-planning inspection above; no task creates a new base-class tier or shared package export.

---

## 1. Resolving the specification's three §12 questions

Per the task's own instruction, these are resolved concretely here, at the Plan level — not deferred further.

### 1.1 React/Vue current-state tracking mechanism (spec §12 item 1)

**Resolution:** neither React nor Vue has a committed `COMPONENT_INVENTORY.md`-equivalent (confirmed, Phase A/B's own disclosed gap, unchanged today). Rather than inventing a new tracking document (which the Roadmap's own §9 step 8 and this plan's Global Constraints both discourage as unauthorized new architecture), this plan uses the **same mechanism already used for every prior React/Vue "what's built" record in this repository**: the Parity Matrix's own §2 per-capability tables are the closest existing artifact serving this role for React/Vue today, but the Parity Matrix is a dated research snapshot (tier 6), not a current-state tracking document (tier 5) — updating it after every batch would misuse its own stated nature as a point-in-time evidence snapshot.

**Concrete decision:** Task Group Z (§8) creates one new, minimal, tier-5-appropriate current-state tracking file per framework — `docs/architecture/REACT_COMPONENT_STATUS.md` and `docs/architecture/VUE_COMPONENT_STATUS.md` — each following `COMPONENT_INVENTORY.md`'s own column schema (Component, Prime source path, Category, Dependencies, Migration classification, Migration phase, Risk; UIX dependencies/Angular-specific-responsibilities columns dropped as Angular-specific, framework-specific-responsibilities column substituted per framework), seeded at creation with every already-Built React/Vue component (the 8/9 each already ships) plus every Batch 1 capability this plan closes. This is new-document creation, not new architecture — it fills exactly the same structural role `COMPONENT_INVENTORY.md` already fills for Angular, using its own schema, not a new schema. Flagged explicitly for Plan Review: **creating a new file is a real, if narrow, decision — confirm before Implementation begins.**

### 1.2 Vue service-tier API/design (spec §12 item 2)

**Resolution, grounded in real pinned PrimeVue source (`.vendor-cache/primevue-4.5.5.tar.gz`), extracted and read during this planning pass, not invented:**

Real PrimeVue's `ConfirmationService`, `DialogService`, and `ToastService` are Vue `provide`/`inject`-based services, each installed via a Vue plugin (`app.use(ConfirmationService)` etc.) that provides a small API object into the injection tree, consumed by a companion always-mounted UI component (`ConfirmDialog`/`DynamicDialog`/`Toast`) that listens for service calls via Vue's `emitter`/event-bus pattern (PrimeVue's own internal `EventBus`, already superseded in Ultimate by `@ultimate/uix-utils`'s own `eventbus` module, per Dependency Map §5/Parity Matrix — **reuse, not a new pattern**).

**Concrete decision, binding on Task Group A (§3):**
- **Ultimate names:** `UConfirmationService`, `UDialogService`, `UToastService` (matches Ultimate's existing `U`-prefix convention for every other Angular/Vue-shared-naming artifact, e.g. `UBadge`/`UDialog`).
- **Installation mechanism:** each is a Vue plugin object (`{ install(app) { app.provide(SYMBOL, api) } }`) — matching Vue's own idiomatic pattern, not PrimeVue's exact internal shape (Option B: reference, not verbatim).
- **API surface, minimum required by spec §3.0's behavioral responsibility:**
  - `UConfirmationService`: `require(options): void` (request/registration), `close(): void` (dismiss).
  - `UDialogService`: `open(component, options): DynamicDialogRef`-equivalent (request/registration + a handle for lifecycle control), `close(ref): void`.
  - `UToastService`: `add(message): void` (request/registration, supports being called multiple times for the queued/stacked lifecycle spec §3.0 requires), `remove(message): void`, `removeAll(): void`.
- **Dispatch mechanism:** `@ultimate/uix-utils`'s existing `eventbus` module (already built, already used elsewhere) — each service's method call emits an event; the companion always-mounted component (built as part of ConfirmDialog/DynamicDialog/Toast's own Batch 1 task, not a separate task) subscribes and renders. This is the same "service call → event → listening component" shape as real PrimeVue, using Ultimate's own already-built event-bus primitive instead of a new one.
- **This resolves spec §12 item 2's "exact API shape" gap** — the three service names, their method signatures, and the dispatch mechanism are now fixed inputs to Task Group A. No further design work is deferred.

### 1.3 Per-capability public API surfaces (spec §12 item 3)

**Resolution:** not resolved as a single upfront table (79 capabilities × 3 frameworks × full prop lists would itself be a multi-thousand-line document duplicating work each task must do against real source anyway). Instead, **every task template below (§3) requires the implementer to extract and verify the capability's real Prime source before writing any code** — via the same `scripts/provenance/extract-prime{ng,react,vue}-source.mjs` tooling already used for every prior Ultimate component (Table, Button, Checkbox, etc.), never from memory or training data. This is the same resolution method the Table spec itself used (its own §4 API tables were built the same way, one capability at a time, against real source) — this plan authorizes and requires the identical method, applied per Batch 1 capability, as each task executes. The per-capability API surface is therefore resolved **at Implementation time, per task, against real evidence** — not invented in this Plan and not left permanently unresolved either; §3's task template makes this step mandatory, not optional.

---

## 2. Task Group structure and dependency/order model

| Task Group | Contents | Depends on | Rationale |
|---|---|---|---|
| **Group 0** | Pre-implementation branch/working-tree check | — | Standard first task, matches prior plans' own Task 0 pattern |
| **Group A** | Vue infrastructure prefix — `UConfirmationService`, `UDialogService`, `UToastService`, Vue Badge | Group 0 | Spec §3.0/§5 item 1 — must complete before any Vue task in Groups D/E that depends on it |
| **Group B** | Form family — 30 capabilities | Group 0 (independent of Group A — no Form capability depends on the Vue infrastructure prefix) | Spec §3.1 |
| **Group C** | Navigation family — 11 capabilities | Group 0 (independent of Group A) | Spec §3.3 |
| **Group D** | Overlay family — 8 capabilities | Group 0 for Angular/React tasks; **Group A** for the 4 Vue tasks gated on the infrastructure prefix (ConfirmDialog, ConfirmPopup, DynamicDialog, OverlayBadge) | Spec §3.2, §5 item 1 |
| **Group E** | Panel/Layout/Display/Feedback family — 30 capabilities | Group 0 for all Angular/React/most-Vue tasks; **Group A** for Vue's Toast task only, and **Group B** for Angular's AvatarGroup task (after Avatar) | Spec §3.4, §5 items 1–2 |
| **Group Z** | Cross-cutting: current-state tracking file creation/updates, `COMPONENT_INVENTORY.md` updates | All of Groups A–E complete for the capabilities each entry covers | Spec §11 item 5, §9 item 5 |
| **Verification** | Whole-branch regression + acceptance-criteria check | All of Groups 0–Z | Spec §9, §11 |
| **Final Review/Closeout** | Per the repository's standard gated workflow | Verification | Spec §1, Roadmap §9 |

**No Task Group is itself a separate Plan.** All are sections of this one document, sharing one Verification and one Final Review/Closeout, per the task's own explicit instruction.

**Intra-group ordering** (restated exactly from spec §5, not re-derived):
1. Group A's four items (3 services + Badge) have no ordering constraint *among themselves* — they may proceed in any order or in parallel.
2. Within Group E: **Angular's AvatarGroup task depends on Angular's Avatar task** (same group, explicit soft ordering, spec §5 item 2). React/Vue's AvatarGroup tasks carry no such ordering.
3. Within Group C (Navigation) and Group E (Panel/Layout/Display/Feedback), for Vue's decomposed families (Tabs, Stepper, Accordion, Splitter — spec §5 item 3) and React's Stepper/StepperPanel (spec §5 item 4): container-first sub-component ordering is internal to that single capability's own task, stated in each such task's own step list (§3), not a Group-level dependency.
4. No other ordering exists among any of the 79 capabilities' tasks, per spec §5's own exhaustiveness statement (cross-capability scope) — confirmed by this plan's own re-check against Dependency Map §C.

---

## 3. Task template (applied once per capability × eligible framework — not restated 79 times below; §4–§6 give the exact capability tables each Group's tasks are generated from)

Every capability task, regardless of Group, follows this exact template. The per-capability tables in §4–§6 supply the "capability, framework(s), Prime source path, dependency notes" columns; everything else below is invariant across all 79 capabilities' tasks.

**Depends on:** per §2's Task Group dependency model, plus any capability-specific ordering the table row states.
**Exact files:** `packages/{ng|react|vue}/src/{kebab-case-name}/` — per-framework file set per the Pre-planning inspection's confirmed pattern (`{name}.ts|.tsx|.vue`, `{name}-style.ts`, `{name}.spec.ts|.tsx`, `{name}.stories.ts|.tsx`, `index.ts`; Vue additionally `base-{name}.ts`). Package barrel `index.ts` gains one new export line.
**Relevant existing Ultimate foundation to reuse:** per the capability's family and framework, from spec §6/§7 (e.g. Form-family Angular tasks extend `UBaseEditableHolder`/`UBaseInput` per the 4-tier chain; Overlay-family tasks compose the already-built `UOverlay`/`react-core` overlay tier/`vue-core` overlay tier; Navigation-family tasks depending on Menu/Button compose the already-Built component directly, not reimplement it).
**Pinned Prime source evidence to consult:** the table row's cited Prime source path, extracted via `scripts/provenance/extract-prime{ng|react|vue}-source.mjs` against the pinned tarball named in the Pre-planning inspection — never from memory or training data (spec §11 item 1, restated).

**Concrete implementation steps:**
1. Extract and read the real pinned Prime source for this capability (table row's cited path). Confirm the table row's framework-native naming note (if any, e.g. React's `Dropdown` for canonical `Select`) still matches current source.
2. Determine the public API surface (props/inputs/outputs/events/emits) directly from that source, following the same per-framework idiom already established by every prior Built component in this same package (fully-controlled for React, `ControlValueAccessor`/directive form for Angular per the existing 4-tier chain, `v-model`/`writeValue()` for Vue) — this resolves spec §12 item 3 for this specific capability, at this specific task.
3. Implement the component file(s), extending/composing the foundation tier named above. **If the real Prime source reveals a pattern not already covered by an existing Ultimate foundation tier or an already-Built sibling component's precedent — stop this task and escalate as a finding; do not invent a new architectural pattern** (spec §4 item 7, Global Constraints).
4. Add the package's style registration (`{name}-style.ts`), following the existing `uix-styled`/`dt()` pattern already used by every prior Built component.
5. Write unit tests (`{name}.spec.*`) covering the capability's own stated behavior, matching the existing test-file conventions in the same package (spec §9 item 1).
6. Add a Storybook story (`{name}.stories.*`), matching the existing convention.
7. Export the new component from the package's `index.ts` barrel.

**Tests and verification required:** the new capability's own unit test suite passes; the full existing package test suite still passes (no regression, spec §9 item 2); where the capability sources styling via `dt()`, the cross-framework-consistency test suite (`packages/themes/test/cross-framework-consistency.test.ts` pattern) covers it if that suite is capability-enumerated (verify at implementation time — do not assume, confirm).

**Dependencies/order constraints:** per §2's Group-level model plus the specific row's own ordering note (if any).

**Documentation/current-state updates:** none per-task — batched into Task Group Z (§8), to avoid 79 near-duplicate single-row documentation tasks.

**Acceptance criteria:** matches spec §11 items 1–4 and 6–7 for this specific capability/framework pair — real, source-verified implementation; tests pass; no regression; sequencing respected; nothing outside spec §3's scope touched.

---

## 4. Task Group B — Form (30 capabilities)

Realized per the per-capability, per-framework eligibility already fixed by spec §3.1 (restated in the table's Framework column — "All 3" or the named subset). Prime source paths below are the top-level PrimeNG/PrimeReact/PrimeVue directory names already confirmed by Phase A/the Dependency Map; each must be freshly extracted and read at implementation time per §3 step 1, not assumed unchanged.

| Capability | Framework(s) | Prime source path(s) (PrimeNG / PrimeReact / PrimeVue) | Notes |
|---|---|---|---|
| RadioButton | All 3 | `radiobutton/` / `radiobutton/` / `radiobutton/` | — |
| ToggleSwitch | All 3 | `toggleswitch/` / `inputswitch/` (React names it InputSwitch) / `toggleswitch/` | Framework-native name per capability, not unified — spec §4 item 10 |
| ToggleButton | All 3 | `togglebutton/` / `togglebutton/` / `togglebutton/` | — |
| InputText | React, Vue only (Angular Built) | — / `inputtext/` / `inputtext/` | Angular's `UInputText` already exists; do not modify it |
| Textarea | All 3 | `textarea/` / `inputtextarea/` (React names it InputTextarea) / `textarea/` | — |
| InputNumber | React, Vue only (Angular Built) | — / `inputnumber/` / `inputnumber/` | Angular's `UInputNumber` already exists; do not modify it. Vue/React tasks reuse the `U_FLUID_ANCESTOR`-equivalent pattern only if their own framework's foundation tier requires ancestor-Fluid detection (verify per §3 step 3) |
| InputMask | All 3 | `inputmask/` / `inputmask/` / `inputmask/` | — |
| InputOTP | All 3 | `inputotp/` / `inputotp/` / `inputotp/` | — |
| Password | All 3 | `password/` / `password/` / `password/` | — |
| AutoComplete | All 3 | `autocomplete/` / `autocomplete/` / `autocomplete/` | — |
| Select | All 3 | `select/` / `dropdown/` (React names it Dropdown) / `select/` | Framework-native name, spec §4 item 10 |
| MultiSelect | All 3 | `multiselect/` / `multiselect/` / `multiselect/` | — |
| CascadeSelect | All 3 | `cascadeselect/` / `cascadeselect/` / `cascadeselect/` | — |
| Listbox | All 3 | `listbox/` / `listbox/` / `listbox/` | — |
| SelectButton | All 3 | `selectbutton/` / `selectbutton/` / `selectbutton/` | — |
| Rating | All 3 | `rating/` / `rating/` / `rating/` | — |
| Slider | All 3 | `slider/` / `slider/` / `slider/` | — |
| Knob | All 3 | `knob/` / `knob/` / `knob/` | — |
| ColorPicker | All 3 | `colorpicker/` / `colorpicker/` / `colorpicker/` | — |
| DatePicker | All 3 | `datepicker/` / `calendar/` (React names it Calendar) / `datepicker/` | Framework-native name, spec §4 item 10 |
| FileUpload | All 3 | `fileupload/` / `fileupload/` / `fileupload/` | — |
| KeyFilter | All 3 | `keyfilter/` / `keyfilter/` / `keyfilter/` | — |
| FloatLabel | All 3 | `floatlabel/` / `floatlabel/` / `floatlabel/` | — |
| IconField / InputIcon | All 3 | `iconfield/`, `inputicon/` / `iconfield/`, `inputicon/` / `iconfield/`, `inputicon/` | One canonical capability, two Prime directories each framework — bundle as one task per framework, two small files |
| InputChips | React, Vue only (Angular Unverified — excluded) | — / `chips/` / `inputchips/` | Do not attempt an Angular realization — Unverified, not confirmed absent (spec §3.1) |
| InputGroup / InputGroupAddon | Angular, Vue only (React Unverified — excluded) | `inputgroup/`, `inputgroupaddon/` / — / `inputgroup/`, `inputgroupaddon/` | One canonical capability, two Prime directories each framework |
| IftaLabel | Angular, Vue only (React Unverified — excluded) | `iftalabel/` / — / `iftalabel/` | — |
| Mention | React only (Angular, Vue Unverified — excluded) | — / `mention/` / — | — |
| MultiStateCheckbox | React only (Angular, Vue Unverified — excluded) | — / `multistatecheckbox/` / — | — |
| TriStateCheckbox | React only (Angular, Vue Unverified — excluded) | — / `tristatecheckbox/` / — | — |

**Excluded (restated, not a task):** TreeSelect — depends on Tree, an architectural exception. No task in this Group covers it.

---

## 5. Task Group C — Navigation (11 capabilities)

All 3 frameworks, no qualification, unless noted:

| Capability | Prime source path(s) | Notes |
|---|---|---|
| Breadcrumb | `breadcrumb/` (all 3) | — |
| MegaMenu | `megamenu/` (all 3) | Composes the already-Built Menu foundation per each framework |
| Menubar | `menubar/` (all 3) | Composes Menu |
| PanelMenu | `panelmenu/` (all 3) | Composes Menu |
| TieredMenu | `tieredmenu/` (all 3) | Composes Menu |
| Tabs | `tabs/` / `tabview/`, `tabmenu/` / `tabs/`, `tablist/`, `tab/`, `tabpanel/`, `tabpanels/` | Angular: single task. React: two sub-components (TabView, TabMenu) within one capability task. Vue: 5-directory family, container-first order (tabs → tablist → tab → tabpanel → tabpanels) within one capability task, per §3's internal-ordering step |
| Stepper | `stepper/` / `stepper/`, `stepperpanel/` / `stepper/`, `step/`, `stepitem/`, `steplist/`, `steppanel/`, `steppanels/` | Angular: single task. React: Stepper before StepperPanel, same task, internal order. Vue: 6-directory family, container-first order, same task |
| Steps | `steps/` (all 3) | — |
| Dock | `dock/` (all 3) | — |
| SpeedDial | `speeddial/` (all 3) | — |
| SplitButton | `splitbutton/` (all 3) | Composes already-Built Button + Menu — no dependency wait needed, both already exist |

**Excluded (restated, not a task):** Menu — already Built.

---

## 6. Task Group D — Overlay (8 capabilities)

| Capability | Framework(s) | Prime source path(s) | Notes |
|---|---|---|---|
| Popover | All 3 | `popover/` / `overlaypanel/` (React names it OverlayPanel) / `popover/` | Framework-native name |
| Drawer | All 3 | `drawer/` / `sidebar/` (React names it Sidebar) / `drawer/` | Framework-native name |
| ContextMenu | All 3 | `contextmenu/` (all 3) | — |
| StyleClass | All 3 | `styleclass/` (all 3) | — |
| ConfirmDialog | Angular, React now; **Vue depends on Group A** | `confirmdialog/` (all 3) | Vue task starts only after Group A's `UConfirmationService` lands |
| ConfirmPopup | Angular, React now; **Vue depends on Group A** | `confirmpopup/` (all 3) | Same |
| DynamicDialog | Angular only (React Unverified — excluded); **Vue depends on Group A** | `dynamicdialog/` (Angular, Vue) | Vue task uses `UDialogService` from Group A |
| OverlayBadge | Angular only (React Unverified — excluded); **Vue depends on Group A** | `overlaybadge/` (Angular, Vue) | Vue task uses Group A's Vue Badge |

**Excluded (restated, not a task):** Dialog, Tooltip — already Built.

---

## 7. Task Group E — Panel/Layout/Display/Feedback (30 capabilities)

| Capability | Framework(s) | Prime source path(s) | Notes |
|---|---|---|---|
| Accordion | All 3 | `accordion/` / `accordion/` / `accordion/`, `accordionpanel/`, `accordionheader/`, `accordioncontent/` | Vue: 4-directory family, container-first order within one task |
| Avatar | All 3 | `avatar/` (all 3) | **Angular task must complete before Angular's AvatarGroup task below** |
| AvatarGroup | All 3 | `avatargroup/` (all 3) | Angular: depends on Angular's Avatar task (same Group, explicit soft ordering). React/Vue: no such dependency |
| BlockUI | All 3 | `blockui/` (all 3) | — |
| ButtonGroup | All 3 | `buttongroup/` (all 3) | Composes already-Built Button |
| Card | All 3 | `card/` (all 3) | — |
| Carousel | All 3 | `carousel/` (all 3) | — |
| Chip | All 3 | `chip/` (all 3) | — |
| Divider | All 3 | `divider/` (all 3) | — |
| Fieldset | All 3 | `fieldset/` (all 3) | — |
| Galleria | All 3 | `galleria/` (all 3) | — |
| Image | All 3 | `image/` (all 3) | — |
| Inplace | All 3 | `inplace/` (all 3) | — |
| Message | All 3 | `message/` (all 3) | — |
| MeterGroup | All 3 | `metergroup/` (all 3) | — |
| Panel | All 3 | `panel/` (all 3) | — |
| ProgressBar | All 3 | `progressbar/` (all 3) | — |
| ProgressSpinner | All 3 | `progressspinner/` (all 3) | — |
| ScrollPanel | All 3 | `scrollpanel/` (all 3) | — |
| ScrollTop | All 3 | `scrolltop/` (all 3) | — |
| Skeleton | All 3 | `skeleton/` (all 3) | — |
| Splitter | All 3 | `splitter/` / `splitter/` / `splitter/`, `splitterpanel/` | Vue: 2-directory family, container-first order within one task |
| Tag | All 3 | `tag/` (all 3) | — |
| Terminal | All 3 | `terminal/` (all 3) | React/Vue additionally name a companion `TerminalService` — bundle into the same task, not a separate capability (spec §3.1 note) |
| Timeline | All 3 | `timeline/` (all 3) | — |
| Toolbar | All 3 | `toolbar/` (all 3) | — |
| ImageCompare | Angular, Vue only (React Unverified — excluded) | `imagecompare/` (Angular, Vue) | — |
| AnimateOnScroll | Angular, Vue only (React Unverified — excluded) | `animateonscroll/` (Angular, Vue) | — |
| DeferredContent | React, Vue only (Angular Unverified — excluded) | `deferredcontent/` (React, Vue) | — |
| Toast | Angular, React now; **Vue depends on Group A** | `toast/` (all 3) | Vue task uses Group A's `UToastService` |

**Excluded (restated, not a task):** OrganizationChart, Messages, InlineMessage (deferred).

---

## 8. Task Group Z — Documentation and current-state tracking (cross-cutting)

**Depends on:** all of Groups A–E complete.

**What to do:**
1. **Create** `docs/architecture/REACT_COMPONENT_STATUS.md` and `docs/architecture/VUE_COMPONENT_STATUS.md`, per §1.1's resolution — schema matches `COMPONENT_INVENTORY.md`'s own columns (minus Angular-specific ones), seeded with every already-Built React/Vue component plus every React/Vue capability this batch closes.
2. **Update `COMPONENT_INVENTORY.md`** — for every Angular capability this batch closes, move its row from "Remaining" to "Built," following the exact same reconciliation pattern already used for `UInputText`/`UInputNumber`'s own prior additions (Angular Form Foundation workstream) — additive, corrected arithmetic, no wholesale rewrite.
3. **Do not modify** `BLUEPRINT.md`, `DECISIONS.md`, `BLUEPRINT_GAPS.md`, or any Phase C research artifact — none of Batch 1's work touches any open architectural decision or exception.

**Verification:** every capability closed in Groups A–E has exactly one corresponding row update (Angular) or new-file entry (React/Vue); no capability is double-counted or missing.

**Acceptance criteria covered:** spec §11 item 5.

---

## 9. Verification (whole-branch)

Per spec §9, performed once, after all Task Groups complete:

1. Full existing test suite (all three frameworks) passes — no regression to any already-Built component or foundation tier.
2. Every new capability's own unit tests pass.
3. `packages/themes/test/cross-framework-consistency.test.ts`-pattern check for every new capability sourcing styling via `dt()`.
4. `validate-dependency-ceiling.mjs` CI gate passes — confirms no new Prime runtime dependency was introduced (spec §10).
5. Re-confirm, via direct diff, that no file outside the scope named in spec §1/§3 and this plan's Global Constraints was touched.
6. Re-confirm no architectural exception, protected decision, or unresolved discrepancy (§1's excluded list) was touched, reinterpreted, or resolved anywhere in the diff.

---

## 10. Final Review/Closeout

Per the repository's standard gated workflow — one whole-branch review, findings bundled into at most one fix dispatch (per `subagent-driven-development`'s own rule), then `finishing-a-development-branch` for the merge decision, per the Roadmap's own §9 step 8/9.

---

## Plan-level unresolved questions / flags for Plan Review

1. **Task Group Z's two new files (`REACT_COMPONENT_STATUS.md`, `VUE_COMPONENT_STATUS.md`) are a real, if narrow, new-document decision** (§1.1) — not silently assumed; flagged explicitly for your confirmation before Implementation.
2. **Group A's service API names/shapes (§1.2)** are this plan's own concrete design resolution, grounded in real extracted PrimeVue source — not previously fixed by the Specification. Flagged for your confirmation, since it is genuinely new (if small) design content introduced at the Plan stage, exactly where spec §12 item 2 said it belonged.
3. **No genuinely new architectural exception was discovered while preparing this plan.** Every task template's own escalation clause (§3 step 3) remains the mechanism for anything discovered during actual implementation — this plan does not pre-empt that by inventing resolutions for capabilities not yet examined against real source.

---

## Status

**Approved.** Plan Review complete — both flagged Plan-level decisions (§1.1's two new current-state tracking files; §1.2's Vue service API design) are approved as proposed. A final self-review pass found and corrected 4 internal cross-reference defects (§2's Group A row citing a nonexistent "Group H"; three "Task Group Z, §7" citations that should have read §8, since Task Group Z is this document's own §8; the Global Constraints bullet's stale "§8/§9" citation for Verification/Final Review, corrected to §9/§10) — no substantive scope, dependency, or capability-list defect was found. All 79 capabilities across the 4 task-group tables were re-verified to sum exactly to the approved Specification's 30+8+11+30.

This plan does not itself implement anything. It is now the authorized source of truth for Implementation.
