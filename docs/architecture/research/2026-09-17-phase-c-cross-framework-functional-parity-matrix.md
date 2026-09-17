# Phase C — Cross-Framework Functional Parity Matrix

**Document type:** Analysis/planning artifact. Not an implementation plan, not a batch selection, not a new authority tier, not a feasibility study. This document does not authorize implementation of any capability and does not select a first migration batch.
**Repository:** `ultimate`
**Compiled:** 2026-09-17, on `main`, using the already-reconciled Dependency Map and Phase A/B evidence as inputs.
**Governing operating context:** `docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md`. Governing interpretation for this document specifically (per the task that created it): **Prime is the source ecosystem; Ultimate's cross-framework functional parity is the target.** Ultimate implementations remain framework-native — this matrix does not propose forcing identical internal component structures across Angular/React/Vue.

**Migration framing:** Phase A (Migration Inventory) → Phase B (Knowledge Reconciliation) → **Phase C (Actual Migration)**. Within Phase C: Migration Dependency Map (per-target dependency/classification) → **this matrix (cross-framework functional parity)** → a future, separately-gated batch-selection and implementation-planning exercise. This document does not perform that future exercise.

---

## 0. Sources used, and what this document does and does not do

**Sources:**
- `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` — canonical per-item naming and per-framework built/remaining data (§2/§3/§4), naming-divergence findings (§1 finding 6, §12 question 5), dependency/ordering findings (§6).
- `docs/architecture/research/2026-09-17-phase-c-migration-dependency-map.md` — the already-reconciled, single-primary-classification per-target accounting for all 3 frameworks (§A), used as the authoritative current-state source for this matrix's Framework Coverage layer (§2 below). This matrix does not recompute those classifications; it regroups them by canonical capability.
- `docs/architecture/COMPONENT_INVENTORY.md` — Angular's tier-5 source of record.
- `docs/architecture/BLUEPRINT_GAPS.md` — DECISION-B/C/D/E markers.
- `docs/architecture/DECISIONS.md` — cited ADRs (ADR-004, ADR-018/024/032, ADR-043, etc.).
- Current repository source, consulted only to resolve naming/grouping questions already flagged by Phase A, not for new research.

**What this document does:** groups the ~310 remaining migration targets (plus the 18/8/9 already-built items) from the Dependency Map into a smaller set of canonical, user-facing capabilities; records each capability's per-framework state independently; records the Prime-to-Ultimate mapping type for each capability; surfaces asymmetric per-framework coverage as parity gaps; and separates functional parity from implementation-decomposition parity.

**What this document does not do:** it does not re-derive per-target classifications (those are inherited verbatim from the Dependency Map), does not resolve any of the discrepancies already flagged in Phase A/the Dependency Map (OrganizationChart/DECISION-D, the Phase A §4-vs-§8 alias-roster mismatch, the React hooks-tier understatement), does not decide framework naming standardization (Phase A §12 question 5, explicitly deferred to a future product decision), and does not rank, score, or select a migration batch.

---

## 1. Canonical Functional Inventory

Canonical capabilities are grouped by functional family, using Phase A's own family terminology (Form, Overlay, Navigation, Data, Panel/Layout/Display, Visualization, Rich content, Primitive/Foundation, Cross-cutting). A canonical capability is a **user-facing capability**, not a source directory. Where Prime decomposes one capability into multiple directories in one or more frameworks (e.g. Vue's Tabs family: `tabs`/`tablist`/`tab`/`tabpanel`/`tabpanels`), that decomposition is recorded once, under one canonical entry, in §5 — not counted as multiple canonical capabilities.

Where a directory is purely internal/foundational (no independent user-facing surface — e.g. `basecomponent`, `componentbase`, `usestyle`) it is **not** given a canonical capability entry in this section; it appears in §3 as an "internal/foundation entry" mapping instead, per the task's own instruction not to invent product capabilities from internal utilities.

### 1.1 Foundation / Primitive (cross-cutting, already built in ≥1 framework)

| Canonical capability | Family |
|---|---|
| Base component tier (DI/style/config wiring) | Foundation |
| Editable/model-holder tier (form state) | Foundation |
| Input tier (richer form-control state) | Foundation |
| Overlay positioning primitive | Foundation |
| Focus trap | Foundation |
| Ripple (ink feedback) | Primitive |
| AutoFocus | Primitive |
| Fluid (width-adaptive sizing) | Primitive |
| Badge | Primitive |
| Attribute/property binding primitive | Foundation |

### 1.2 Form

| Canonical capability | Family |
|---|---|
| Button | Primitive |
| Checkbox | Form |
| RadioButton | Form |
| ToggleSwitch (boolean switch) | Form |
| ToggleButton | Form |
| InputText (single-line text input) | Form |
| Textarea (multi-line text input) | Form |
| InputNumber | Form |
| InputMask | Form |
| InputOTP | Form |
| InputChips (freeform tag entry) | Form |
| Password | Form |
| AutoComplete | Form |
| Select (single-select dropdown) | Form |
| MultiSelect | Form |
| CascadeSelect | Form |
| TreeSelect | Form |
| Listbox | Form |
| SelectButton | Form |
| MultiStateCheckbox | Form |
| TriStateCheckbox | Form |
| Rating | Form |
| Slider | Form |
| Knob | Form |
| ColorPicker | Form |
| DatePicker (calendar-based date entry) | Form |
| FileUpload | Form |
| KeyFilter (keystroke filtering utility) | Form |
| Mention (`@`-mention autocomplete) | Form |
| FloatLabel | Form |
| IftaLabel | Form |
| IconField / InputIcon | Form |
| InputGroup / InputGroupAddon | Form |

### 1.3 Overlay

| Canonical capability | Family |
|---|---|
| Dialog | Overlay |
| Popover (anchored floating panel) | Overlay |
| Drawer (slide-in panel) | Overlay |
| ConfirmDialog (service-driven confirmation modal) | Overlay |
| ConfirmPopup (anchored confirmation popover) | Overlay |
| DynamicDialog (service-driven dynamic-component dialog) | Overlay |
| ContextMenu | Overlay/Navigation |
| Tooltip | Overlay |
| OverlayBadge | Overlay/Primitive |
| StyleClass (class-toggle animation utility) | Overlay/directive |

### 1.4 Navigation

| Canonical capability | Family |
|---|---|
| Menu (flat menu list) | Navigation |
| Breadcrumb | Navigation |
| MegaMenu | Navigation |
| Menubar | Navigation |
| PanelMenu | Navigation |
| TieredMenu | Navigation |
| Tabs | Navigation |
| Stepper | Navigation |
| Steps (linear step indicator) | Navigation |
| Dock | Navigation |
| SpeedDial | Navigation |
| SplitButton | Navigation/Primitive |

### 1.5 Data

| Canonical capability | Family |
|---|---|
| Table | Data |
| Scroller (virtual scroll windowing) | Data |
| Paginator | Data |
| TreeTable | Data |
| Tree | Data |
| OrderList | Data |
| PickList | Data |
| DataView | Data |
| DataScroller | Data |

### 1.6 Panel / Layout / Display / Feedback

| Canonical capability | Family |
|---|---|
| Accordion | Panel/Layout |
| Avatar | Display |
| AvatarGroup | Display |
| BlockUI | Feedback/Layout |
| ButtonGroup | Layout |
| Card | Panel/Layout |
| Carousel | Data/Display |
| Chip | Display |
| Divider | Layout |
| Fieldset | Panel/Layout |
| Galleria | Display |
| Image (preview/zoom) | Display |
| ImageCompare | Display |
| Inplace (click-to-edit toggle) | Panel |
| Message (inline severity message) | Feedback |
| Messages (message stack, React-named) | Feedback |
| MeterGroup | Data/Display |
| OrganizationChart | Data/Display |
| Panel | Panel/Layout |
| ProgressBar | Feedback |
| ProgressSpinner | Feedback |
| ScrollPanel | Layout |
| ScrollTop | Navigation/Feedback |
| Skeleton | Feedback/Display |
| Splitter | Layout |
| Tag | Display |
| Terminal | Display |
| Timeline | Data/Display |
| Toast | Feedback |
| Toolbar | Layout |
| AnimateOnScroll | Primitive/directive |
| DeferredContent (React/Vue-named lazy-render wrapper) | Display |
| InlineMessage (Vue-named) | Feedback |

### 1.7 Visualization / Rich content

| Canonical capability | Family |
|---|---|
| Chart | Visualization |
| Editor (rich-text editing) | Rich content |

### 1.8 Cross-cutting infrastructure (not independently user-facing; see §3 for mapping treatment)

`config` (global configuration surface), `passthrough` (attribute passthrough system), `api` (remaining shared type contracts), `DragDrop` (drag/drop primitive, Angular-named).

---

## 2. Framework Coverage

State per framework, per canonical capability. States used: **Built**, **Migration target**, **Missing**, **Blocked**, **Architectural exception**, **Not applicable**, **Unverified / mapping unresolved**. States are drawn directly from the Dependency Map's §A per-target classification (never re-derived) and from the Built tables in Phase A §2/§3/§4. Framework differences are never collapsed into one status.

### 2.1 Foundation / Primitive

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Base component tier | Built (`UBaseComponent`) | Built (`useComponentBase`) | Built (`createBaseComponent`) |
| Editable/model-holder tier | Built (`UModelHolder`, 2-consumer proof) | Not applicable — architecturally unneeded, confirmed absent upstream (Dependency Map §A.2; Phase A §3 note) | Built (`createBaseEditableHolder`), 1-consumer proof only (Checkbox) — Phase A §4 flags this as less-proven than Angular's |
| Input tier | Built (`UBaseInput`, `U_FLUID_ANCESTOR` token pattern) | Not applicable — same as above | Built (`createBaseInput`), same 1-consumer caveat as row above |
| Overlay positioning primitive | Built (`UOverlay`) | Built (`react-core` overlay tier) | Built (`vue-core` overlay tier) |
| Focus trap | Built (`UFocusTrap`) | Built (`react-core` focus-trap) | Built (`vue-core` focus-trap) |
| Ripple | Built (`URipple`) | **Missing** — confirmed real gap, no directory anywhere in `packages/react/src/` or `packages/react-core/src/` (Phase A §3 finding 4, §7) | Built (`Ripple`, `createDirective`) |
| AutoFocus | Built (`UAutoFocus`) | Unverified / mapping unresolved — not confirmed present or absent in this pass; not separately tracked by the Dependency Map | Unverified / mapping unresolved — same |
| Fluid | Built (`UFluid`) | Unverified / mapping unresolved | Missing — `packages/vue/src/fluid/` does not exist (Phase A §4 explicit finding); blocks Vue's ancestor-Fluid-detection code path from ever resolving `true` |
| Badge | Built (`UBadge`) | Unverified / mapping unresolved — not confirmed built or absent this pass | Migration target — blocked (ordinary), per Dependency Map §A.3 row 4 (blocks OverlayBadge) |
| Attribute/property binding primitive | Built (`UBind`) | Unverified / mapping unresolved — no confirmed React equivalent named in Phase A | Unverified / mapping unresolved — no confirmed Vue equivalent named in Phase A |

### 2.2 Form

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Button | Built | Built | Built |
| Checkbox | Built | Built | Built |
| RadioButton | Migration target — ready | Migration target — ready | Migration target — ready |
| ToggleSwitch | Migration target — ready | Migration target — ready (React names it InputSwitch; see §3) | Migration target — ready |
| ToggleButton | Migration target — ready | Migration target — ready | Migration target — ready |
| InputText | Built (`UInputText`) | Migration target — ready | Migration target — ready |
| Textarea | Migration target — ready | Migration target — ready (React names it InputTextarea; see §3) | Migration target — ready |
| InputNumber | Built (`UInputNumber`) | Migration target — ready | Migration target — ready |
| InputMask | Migration target — ready | Migration target — ready | Migration target — ready |
| InputOTP | Migration target — ready | Migration target — ready | Migration target — ready |
| InputChips | Unverified / mapping unresolved — no Angular directory named with this capability's description in Phase A §2; absence of a matching name does not establish the capability is functionally absent from Angular's scope (see §3.3) | Migration target — ready (React names it Chips; see §3) | Migration target — ready |
| Password | Migration target — ready | Migration target — ready | Migration target — ready |
| AutoComplete | Migration target — ready | Migration target — ready | Migration target — ready |
| Select | Migration target — ready | Migration target — ready (React names it Dropdown; see §3) | Migration target — ready |
| MultiSelect | Migration target — ready | Migration target — ready | Migration target — ready |
| CascadeSelect | Migration target — ready | Migration target — ready | Migration target — ready |
| TreeSelect | Migration target — depends on Tree (hard) | Migration target — depends on Tree (hard) | Migration target — depends on Tree (hard) |
| Listbox | Migration target — ready | Migration target — ready | Migration target — ready |
| SelectButton | Migration target — ready | Migration target — ready | Migration target — ready |
| MultiStateCheckbox | Unverified / mapping unresolved — no Angular directory named with this description in Phase A §2; not established as functionally absent (see §3.3) | Migration target — ready | Unverified / mapping unresolved — same as Angular's caveat |
| TriStateCheckbox | Unverified / mapping unresolved — same | Migration target — ready | Unverified / mapping unresolved — same |
| Rating | Migration target — ready | Migration target — ready | Migration target — ready |
| Slider | Migration target — ready | Migration target — ready | Migration target — ready |
| Knob | Migration target — ready | Migration target — ready | Migration target — ready |
| ColorPicker | Migration target — ready | Migration target — ready | Migration target — ready |
| DatePicker | Migration target — ready | Migration target — ready (React names it Calendar; see §3) | Migration target — ready |
| FileUpload | Migration target — ready | Migration target — ready | Migration target — ready |
| KeyFilter | Migration target — ready | Migration target — ready | Migration target — ready |
| Mention | Unverified / mapping unresolved — no Angular directory named with this description in Phase A §2; not established as functionally absent | Migration target — ready | Unverified / mapping unresolved — same |
| FloatLabel | Migration target — ready | Migration target — ready | Migration target — ready |
| IftaLabel | Migration target — ready | Unverified / mapping unresolved — no React directory named with this description in Phase A §3; not established as functionally absent (see §3.3) | Migration target — ready |
| IconField / InputIcon | Migration target — ready | Migration target — ready | Migration target — ready |
| InputGroup / InputGroupAddon | Migration target — ready | Unverified / mapping unresolved — no React directories named with this description in Phase A §3; not established as functionally absent | Migration target — ready |

### 2.3 Overlay

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Dialog | Built | Built | Built |
| Popover | Migration target — ready | Migration target — ready (React names it OverlayPanel; see §3) | Migration target — ready |
| Drawer | Migration target — ready | Migration target — ready (React names it Sidebar; see §3) | Migration target — ready |
| ConfirmDialog | Migration target — ready | Migration target — ready | Migration target — blocked (ordinary), unbuilt service tier |
| ConfirmPopup | Migration target — ready | Migration target — ready | Migration target — blocked (ordinary), unbuilt service tier |
| DynamicDialog | Migration target — ready | Unverified / mapping unresolved — no React directory named with this description in Phase A §3; not established as functionally absent (see §3.3) | Migration target — blocked (ordinary), unbuilt service tier |
| ContextMenu | Migration target — ready | Migration target — ready | Migration target — ready |
| Tooltip | Built | Built | Built |
| OverlayBadge | Migration target — ready (Badge already built in Angular) | Unverified / mapping unresolved — no React directory named with this description in Phase A §3; not established as functionally absent | Migration target — blocked (ordinary), unbuilt Badge |
| StyleClass | Migration target — ready | Migration target — ready | Migration target — ready |

### 2.4 Navigation

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Menu | Built | Built | Built |
| Breadcrumb | Migration target — ready | Migration target — ready | Migration target — ready |
| MegaMenu | Migration target — ready | Migration target — ready | Migration target — ready |
| Menubar | Migration target — ready | Migration target — ready | Migration target — ready |
| PanelMenu | Migration target — ready | Migration target — ready | Migration target — ready |
| TieredMenu | Migration target — ready | Migration target — ready | Migration target — ready |
| Tabs | Migration target — ready (single Angular directory) | Migration target — ready (decomposed as TabView + TabMenu; see §3/§5) | Migration target — ready (decomposed as a 5-directory family; see §3/§5) |
| Stepper | Migration target — ready (single Angular directory, "Stepper + StepperPanel" as one row per Phase A) | Migration target — ready (Stepper + StepperPanel, 2 directories) | Migration target — ready (decomposed as a 6-directory family; see §3/§5) |
| Steps | Migration target — ready | Migration target — ready | Migration target — ready |
| Dock | Migration target — ready | Migration target — ready | Migration target — ready |
| SpeedDial | Migration target — ready | Migration target — ready | Migration target — ready |
| SplitButton | Migration target — ready (no dependency — Button+Menu already built) | Migration target — ready (same) | Migration target — ready (same) |

### 2.5 Data

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Table | Built (single file; filter vocabulary narrowed, GAP-014/DECISION-C) | Built (single-structure; real upstream decomposes further — Column/ColumnGroup/Row are separate directories, tracked as decomposition in §5) | Built (single file; real upstream decomposes into ~17-file DataTable + Column/ColumnGroup/Row, tracked as decomposition in §5) |
| Scroller | Built | Built | Built |
| Paginator | Built | Built (single file; real upstream decomposes into 9 subcomponents, tracked in §5) | Built (single file; real upstream decomposes into 9 subcomponents, tracked in §5) |
| TreeTable | Architectural exception (inherits Tree; also DECISION-C remainder) | Migration target — depends on Tree (hard) | Migration target — depends on Tree (hard) |
| Tree | Architectural exception — DECISION-D protected, do-not-reopen | Architectural exception — same DECISION-D | Architectural exception — same DECISION-D |
| OrderList | Architectural exception — DECISION-C open remainder | Architectural exception — same | Architectural exception — same |
| PickList | Architectural exception — DECISION-C open remainder | Architectural exception — same | Architectural exception — same |
| DataView | Architectural exception — DECISION-C open remainder | Architectural exception — same | Architectural exception — same |
| DataScroller | Unverified / mapping unresolved — no Angular directory named with this description in Phase A §2; not established as functionally absent (see §3.3) | Migration target — ready (Paginator + Scroller already built, no dependency) | Unverified / mapping unresolved — same as Angular's caveat |

### 2.6 Panel / Layout / Display / Feedback

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Accordion | Migration target — ready (single Angular directory) | Migration target — ready (single React directory) | Migration target — ready (decomposed as a 4-directory family; see §3/§5) |
| Avatar | Migration target — ready | Migration target — ready | Migration target — ready |
| AvatarGroup | Migration target — depends on Avatar (soft, same-batch) | Migration target — ready | Migration target — ready |
| BlockUI | Migration target — ready | Migration target — ready | Migration target — ready |
| ButtonGroup | Migration target — ready | Migration target — ready | Migration target — ready |
| Card | Migration target — ready | Migration target — ready | Migration target — ready |
| Carousel | Migration target — ready | Migration target — ready | Migration target — ready |
| Chip | Migration target — ready | Migration target — ready | Migration target — ready |
| Divider | Migration target — ready | Migration target — ready | Migration target — ready |
| Fieldset | Migration target — ready | Migration target — ready | Migration target — ready |
| Galleria | Migration target — ready | Migration target — ready | Migration target — ready |
| Image | Migration target — ready | Migration target — ready | Migration target — ready |
| ImageCompare | Migration target — ready | Unverified / mapping unresolved — no React directory named with this description in Phase A §3; not established as functionally absent (see §3.3) | Migration target — ready |
| Inplace | Migration target — ready | Migration target — ready | Migration target — ready |
| Message | Migration target — ready | Migration target — ready | Migration target — ready |
| Messages | Unverified / mapping unresolved — whether this is a distinct capability from Message or a framework-specific shape/naming difference cannot be determined from current evidence; see §3.6 | Migration target — ready | Unverified / mapping unresolved — same |
| MeterGroup | Migration target — ready | Migration target — ready | Migration target — ready |
| OrganizationChart | Migration target — ready per `COMPONENT_INVENTORY.md`, **but see §4 parity-gap note and the preserved, unresolved DECISION-D discrepancy** | Migration target — ready | Migration target — ready |
| Panel | Migration target — ready | Migration target — ready | Migration target — ready |
| ProgressBar | Migration target — ready | Migration target — ready | Migration target — ready |
| ProgressSpinner | Migration target — ready | Migration target — ready | Migration target — ready |
| ScrollPanel | Migration target — ready | Migration target — ready | Migration target — ready |
| ScrollTop | Migration target — ready | Migration target — ready | Migration target — ready |
| Skeleton | Migration target — ready | Migration target — ready | Migration target — ready |
| Splitter | Migration target — ready (single Angular directory) | Migration target — ready (single React directory) | Migration target — ready (decomposed as splitter/splitterpanel; see §3/§5) |
| Tag | Migration target — ready | Migration target — ready | Migration target — ready |
| Terminal | Migration target — ready | Migration target — ready (also names TerminalService separately; see §3) | Migration target — ready (also names TerminalService separately; see §3) |
| Timeline | Migration target — ready | Migration target — ready | Migration target — ready |
| Toast | Migration target — ready | Migration target — ready | Migration target — blocked (ordinary), unbuilt service tier |
| Toolbar | Migration target — ready | Migration target — ready | Migration target — ready |
| AnimateOnScroll | Migration target — ready | Unverified / mapping unresolved — no React directory named with this description in Phase A §3; not established as functionally absent (see §3.3) | Migration target — ready |
| DeferredContent | Unverified / mapping unresolved — no Angular directory named with this description in Phase A §2; not established as functionally absent | Migration target — ready | Migration target — ready |
| InlineMessage | Unverified / mapping unresolved — no Angular directory named with this description in Phase A §2; not established as functionally absent | Unverified / mapping unresolved — same for React, per Phase A §3 | Migration target — ready |

### 2.7 Visualization / Rich content

| Canonical capability | Angular | React | Vue |
|---|---|---|---|
| Chart | Architectural exception — DECISION-B, Chart.js external dependency | Architectural exception — same | Architectural exception — same |
| Editor | Architectural exception — DECISION-B, Quill external dependency | Architectural exception — same | Architectural exception — same |

### 2.8 Cross-cutting infrastructure

| Item | Angular | React | Vue |
|---|---|---|---|
| `config` | Architectural exception (full surface remainder; scoped minimum already built per ADR-018) | Unverified / mapping unresolved — cross-cutting, unresolved per Phase A §3 (`PrimeReactContext`) | Unverified / mapping unresolved — same, per Phase A §4 |
| `passthrough` | Architectural exception (`NEEDS ARCHITECTURE DECISION`, `COMPONENT_INVENTORY.md`) | Not needed / superseded — deliberately out of scope per Option-B ADR posture | Not needed / superseded — same |
| `api` (remaining surface) | Architectural exception | Unverified / mapping unresolved | Unverified / mapping unresolved |
| `DragDrop` | Migration target — ready (shared prerequisite for OrderList/PickList, both exceptions for unrelated reasons) | Unverified / mapping unresolved — no distinct React directory confirmed in Phase A §3 | Unverified / mapping unresolved — no distinct Vue directory confirmed in Phase A §4 |

---

## 3. Prime-to-Ultimate Mapping

Mapping type recorded per canonical capability where the relationship differs from a plain 1:1 same-name mapping, or where evidence is insufficient to state a relationship with confidence. Mapping types used: **1:1**, **same capability / different name**, **one capability decomposed into multiple framework components**, **framework-specific supporting component**, **internal/foundation entry rather than user-facing capability**, **deprecated/alias entry**, **no corresponding capability**, **mapping unresolved**.

### 3.1 Same capability / different name

| Canonical capability | Angular name | React name | Vue name | Evidence |
|---|---|---|---|---|
| ToggleSwitch | ToggleSwitch | InputSwitch | ToggleSwitch (Vue also names an unverified `InputSwitch` alias — see §3.4) | Phase A §1 finding 6 does not name this pair explicitly; grouped here on direct name-similarity plus shared Form-family boolean-switch description in Phase A §2/§3/§4. **Not independently confirmed behaviorally equivalent — grouped by name/description only.** |
| Textarea | Textarea | InputTextarea | Textarea | Direct name variants, Form family, same description ("multi-line text input") across all three Phase A sections. |
| InputChips | *(not applicable in Angular — see §3.3)* | Chips | InputChips | Phase A §4 flags Vue's `Chips` as a suspected-deprecated alias of `InputChips` within Vue itself (§8) — a **separate, internal Vue naming question** from the React/Vue cross-framework naming pair recorded here. Not resolved by this matrix. |
| Select | Select | Dropdown | Select | Phase A §12 question 5 explicitly names "Select vs. Dropdown" as an open naming-reconciliation question, deferred to a future product decision — not resolved here. |
| DatePicker | DatePicker | Calendar | DatePicker | Phase A §12 question 5 explicitly names "DatePicker vs. Calendar" — same deferred status. |
| Popover | Popover | OverlayPanel | Popover | Phase A §12 question 5 explicitly names "Popover vs. OverlayPanel" — same deferred status. |
| Drawer | Drawer | Sidebar | Drawer | Phase A §12 question 5 explicitly names "Drawer vs. Sidebar" — same deferred status. |
| Message | Message | Message (+ a separately named `Messages` directory — relationship unresolved, see §3.6) | Message (+ InlineMessage, a separate row — see §3.3(b)) | Direct single-message capability, present under this name in all three frameworks' Phase A entries. |
| Terminal | Terminal | Terminal + TerminalService | Terminal + TerminalService | React and Vue both name a companion `TerminalService` directory alongside `Terminal`; Angular's Phase A §2 entry does not name a separate service. Recorded as a framework-specific supporting component (§3.2) attached to the Terminal capability, not a second canonical capability. |

### 3.2 Framework-specific supporting component (not a separate canonical capability)

| Supporting component | Attached to canonical capability | Framework(s) | Evidence |
|---|---|---|---|
| TerminalService | Terminal | React, Vue | Phase A §3/§4 name it alongside Terminal; Angular's entry does not. |
| OverlayService | *(unclear — see below)* | React | Phase A §3 Overlay bullet names `OverlayService` alongside `OverlayPanel`/Sidebar/etc. with no further description. **Mapping unresolved** — this matrix does not have sufficient Phase A detail to confidently attach it to a specific canonical Overlay capability (candidate: a general overlay-lifecycle service, possibly related to Vue/Angular's own not-yet-built service tier referenced in Dependency Map §B Layer 1 for Vue). Recorded as Unverified rather than guessed. |
| SelectItem | Select (or MultiSelect — ambiguous) | React | Phase A §3 marks `SelectItem` as "type-only, bundled" — a TypeScript type definition, not an independent component. Not given its own canonical capability entry per the task's own instruction against inventing capabilities from internal/type-only artifacts. |
| Column / ColumnGroup / Row | Table | React, Vue | Real upstream decomposes DataTable's header/column structure into separate directories in both React and Vue; Angular's built Table does not expose these as separate top-level directories in Phase A §2's built-table entry. Treated as implementation-decomposition detail of the Table capability (see §5), not separate capabilities. |
| Paginator subcomponents (JumpToPage, RowsPerPageDropdown, etc.) | Paginator | React, Vue | Both React's and Vue's real upstream Paginator decomposes into 9 subcomponents; Ultimate's built Paginator in both frameworks is a single file (Phase A §3/§4 built tables, explicitly noted as "not decomposed"). Implementation-decomposition detail only (§5). |

### 3.3 Directory-naming asymmetries — classified by evidentiary tier, not collapsed into "absent"

Phase A's per-framework "Remaining"/"Built" enumerations name capabilities by their Prime source-directory names. When a capability's name does not appear in a given framework's Phase A list, that is evidence about **naming enumeration**, not evidence about **functional presence or absence**. The task's own correction requires these to be separated into three distinct tiers rather than treated as one "confirmed absent" bucket. No item below is described as confirmed functional absence unless independently corroborated (tier a).

**(a) Confirmed functional absence** — evidence establishes the capability does not exist for that framework, independent of naming:

| Canonical capability | Absent from | Evidence establishing functional absence (not just naming) |
|---|---|---|
| Editable/model-holder tier, Input tier | React | Phase A §3 states directly: "every PrimeReact form component is fully controlled... with no shared base class carrying model-value state. React has *no* `basemodelholder`/`baseeditableholder`/`baseinput` source directories at all" — verified against real PrimeReact source itself, not just Ultimate's own inventory. This is functional-architecture evidence, not a naming gap. |
| Ripple | React | Phase A §1 finding 4 / §7: "React has none anywhere in `packages/react/src/` or `packages/react-core/src/`" — confirmed by direct repository inspection of the actual built-package trees, not merely by the absence of a Prime directory name. Real, confirmed cross-framework asymmetry. |

**(b) No corresponding named Prime entry found (naming-enumeration gap only — functional status not established)**

The following capabilities have no Phase A entry under a matching name for the framework(s) listed, but Phase A's own per-framework enumeration is known to be incomplete (the Dependency Map's own §0 finding 3 already established that Phase A's React/Vue "Remaining" bullets undercount their own stated totals by 12 and ~23-24 items respectively) and Phase A never performed a reverse check (searching each framework's real Prime source for a capability under a *different* name). Absence of a matching directory name is therefore **not sufficient evidence of functional absence** and each is carried as Unverified in §2, not "Not applicable":

MultiStateCheckbox, TriStateCheckbox, Mention (no Angular/Vue directory named), InputGroup/InputGroupAddon, IftaLabel, DynamicDialog, OverlayBadge, ImageCompare, AnimateOnScroll (no React directory named), DataScroller (no Angular/Vue directory named), DeferredContent (no Angular directory named), InlineMessage (no Angular/React directory named), InputChips (no Angular directory named).

**(c) Mapping unresolved / insufficient evidence** — see §3.6 for items where even the naming-enumeration facts above cannot be established with confidence (e.g. whether an item might exist under an entirely different canonical name not yet identified by this matrix).

**Governing principle applied throughout this document:** a capability is only classified "Not applicable" for a framework when independent evidence (tier a) establishes functional absence. A capability whose only supporting evidence is "no Phase A directory entry with this name" is classified "Unverified / mapping unresolved" in §2, per correction #1/#2 — it may exist under another component, name, or API that this matrix's evidence does not surface.

### 3.4 Deprecated/alias entry (Prime-side, not yet independently confirmed)

Per Phase A §4/§8's own file-count heuristic (never confirmed by content read), the following Vue directories are suspected re-export aliases of a canonical capability already listed above, rather than independent capabilities:

| Suspected alias directory | Suspected canonical target | Evidence |
|---|---|---|
| InputSwitch | ToggleSwitch | Phase A §4 Form bullet aside |
| Dropdown | Select | Phase A §4 Form bullet aside |
| Calendar | DatePicker | Phase A §4 Form bullet aside |
| Sidebar | Drawer | Phase A §4 Overlay bullet aside |
| OverlayPanel | Popover | Phase A §4 Overlay bullet aside |
| TabMenu | Tabs | Phase A §4 Navigation bullet aside |
| TabView | Tabs | Phase A §4 Navigation bullet aside |
| Chips (Phase A §8 only — not in §4's own bullets) | InputChips | Phase A §8 names this as an 8th alias; **not corroborated by §4's own Form bullet text**, which never lists `Chips` for Vue at all — the Dependency Map already flagged this §4-vs-§8 internal inconsistency (§0 finding 3) and it is preserved unresolved here |
| AccordionTab (Phase A §8 only — not in §4's own bullets) | Accordion | Same §4-vs-§8 inconsistency as above, preserved unresolved |

None of these 9 are treated as confirmed aliases by this matrix — they remain **Unverified / mapping unresolved** per Phase A's own explicit hedge ("this report's classification was a file-count heuristic, not a confirmed read," Phase A §12 question 6).

### 3.5 Internal/foundation entry rather than user-facing capability

`config`, `passthrough`, `api`, base-component/editable-holder/input tiers, `usestyle`, `classnames`, `ts-helpers`, `base`, `types`, `dom`, `utils`, `motion` (Angular's not-needed list), `componentbase` (React), and their Vue equivalents are cross-cutting or internal infrastructure, not independent user-facing capabilities. They are tracked in §2.1/§2.8 for completeness (since Ultimate's own architecture treats some of them as real open decisions, e.g. `config`/`passthrough`) but are excluded from the canonical capability count in §1.

### 3.6 Mapping unresolved (insufficient evidence to state a relationship)

| Item | Why unresolved |
|---|---|
| OverlayService (React) | See §3.2 — cannot confidently attach to a specific canonical capability from Phase A's own description. |
| AutoFocus (React, Vue presence) | Dependency Map and Phase A do not confirm or deny a React/Vue equivalent exists; Angular's is built. |
| Attribute/property binding primitive (React, Vue equivalents) | No confirmed React/Vue equivalent named anywhere in Phase A. |
| `DragDrop` (React, Vue equivalents) | No confirmed React/Vue equivalent named anywhere in Phase A; Angular's is a named, ready migration target. |
| The ~12 React and ~23-24 Vue Phase A "Remaining"-bullet items that the Dependency Map's own §0 finding 3 already identified as never individually named by Phase A | Carried forward unresolved from the Dependency Map, not re-investigated here — this matrix cannot assign these to canonical capabilities because Phase A never named them. |
| Messages (React) | Phase A §3 lists `Messages` as a directory separate from `Message`, with no further description distinguishing its behavior or API shape. Whether this represents a genuinely distinct canonical capability (e.g. a multi-message stack/collection API) or a framework-specific naming/shape variant of the same single-message capability cannot be determined from Phase A's evidence alone. Not canonicalized as a separate capability or merged into Message — recorded as its own row in §2.6 with an explicit Unverified state for Angular and Vue, per correction #5. |
| Every capability listed in §3.3(b) | See §3.3 — these are naming-enumeration gaps, not confirmed functional absences; the specific reason each is unresolved (rather than confirmed absent) is Phase A's own incomplete enumeration, documented in the Dependency Map §0 finding 3, plus the lack of any reverse-search of each framework's real Prime source under alternate names. |

---

## 4. Functional Parity Gaps

A functional parity gap is asymmetric coverage of a canonical capability across the 3 frameworks, per the task's own definition — **regardless of whether Prime itself has the capability in all three frameworks.** Decomposition differences (one framework splitting a capability into several source entries) are explicitly **not** parity gaps and are excluded here (see §5).

### 4.1 Confirmed functional parity gaps (evidence-backed functional absence, not directory-naming asymmetry)

Per correction #4, an item is listed here only when independent evidence (not merely "no Phase A directory name found") establishes that a framework genuinely lacks the capability, while at least one other framework has it. Every item previously listed here on the basis of "No corresponding capability named" alone has been removed and reclassified — see §3.3(b) and §2 for their corrected Unverified states. Only two items meet the stricter bar:

| Canonical capability | Angular | React | Vue | Gap description |
|---|---|---|---|---|
| Ripple | Built | **Missing** | Built | Confirmed by direct repository inspection of `packages/react/src/` and `packages/react-core/src/` — no Ripple directory exists anywhere in React's actual built-package trees (Phase A §1 finding 4, §7). This is evidence of the built package's real contents, not an inference from a missing Prime directory name. |
| Fluid | Built | Unverified | **Missing** (Vue only) | Vue's absence is confirmed by direct evidence: `packages/vue/src/fluid/` does not exist, and this concretely blocks Vue's own ancestor-Fluid-detection code path from ever resolving `true` (Phase A §4 explicit finding). React's status remains genuinely Unverified — not established as present or absent — so this is recorded as a two-framework asymmetry (Angular built, Vue confirmed missing), not a three-way comparison. |

**Reclassified out of this section (no longer treated as confirmed functional parity gaps):**

- **Badge** — Vue's state is "migration target, blocked (unbuilt)," not "missing." It is an ordinary not-yet-built target like hundreds of others in the Dependency Map, not evidence of functional absence. React's status is Unverified. No confirmed gap.
- **OverlayBadge, InputGroup/InputGroupAddon, IftaLabel, DynamicDialog, ImageCompare, AnimateOnScroll, MultiStateCheckbox/TriStateCheckbox/Mention, DataScroller, DeferredContent, InlineMessage** — each was previously listed here solely because Phase A's per-framework enumeration does not name a matching directory for one or more frameworks. Per §3.3(b), that is a naming-enumeration gap, not a confirmed functional gap — Phase A's own enumeration is independently known to be incomplete (Dependency Map §0 finding 3), and no reverse-search for an alternate name was performed. These remain Unverified in §2, not confirmed gaps here.
- **Messages** — relationship to Message is itself unresolved (§3.6), so it cannot be evidence of a parity gap; a capability whose own existence-as-distinct-from-Message is unresolved cannot simultaneously be asserted as "present in React, missing elsewhere."

### 4.1a Confirmed infrastructure asymmetry (distinct from a capability being functionally absent)

One further asymmetry is evidence-backed but is not "capability missing" — it is a currently-unbuilt shared prerequisite blocking an otherwise-named, otherwise-ready capability family in one framework only:

| Capability family | Angular | React | Vue | Description |
|---|---|---|---|---|
| ConfirmDialog / ConfirmPopup / DynamicDialog / Toast | Migration target — ready | Migration target — ready (DynamicDialog: Unverified, no matching React directory name found — see §3.3(b)) | Migration target — **blocked**, unbuilt ConfirmationService/DialogService/ToastService-equivalent tier | Phase A §4 states explicitly that Vue's service tier is unbuilt and blocks this family. This is a real, confirmed infrastructure gap for Vue specifically — but the capability itself is named and classified in Vue's own inventory (not "missing"), so it is recorded here as a blocked-infrastructure asymmetry rather than folded into §4.1's functional-absence list. |

### 4.2 OrganizationChart — preserved, unresolved discrepancy (not adjudicated)

Per the Dependency Map (§0 finding 2, §D), `BLUEPRINT_GAPS.md`'s DECISION-D prose names OrganizationChart as part of the protected Tree family across all three frameworks, while `COMPONENT_INVENTORY.md`'s own Angular row classifies it as plain `ADAPT` with no Tree dependency. This matrix's §2.6 entry for OrganizationChart follows the Dependency Map's own choice (classify per `COMPONENT_INVENTORY.md`, flag the conflict) and does **not** resolve it. If DECISION-D's naming is authoritative, OrganizationChart would become an architectural exception in all three frameworks rather than a ready migration target in all three — this would change §2.6's entries from three "ready" cells to three "architectural exception" cells, but that determination is for human resolution, not this document.

### 4.3 Not a parity gap — decomposition-only differences

Per the task's own instruction, the following are explicitly **excluded** from §4.1 because the underlying functional capability is covered in every framework that has it — only the internal source-file decomposition differs:

- **Tabs** — Angular: 1 directory; React: 2 (TabView + TabMenu); Vue: 5-directory family. Functional capability present in all three.
- **Stepper** — Angular: 1 row (per Phase A §2, "Stepper + StepperPanel" as one entry); React: 2 directories; Vue: 6-directory family. Present in all three.
- **Accordion** — Angular: 1 directory; React: 1 directory; Vue: 4-directory family. Present in all three.
- **Splitter** — Angular: 1 directory; React: 1 directory; Vue: 2-directory family (splitter/splitterpanel). Present in all three.
- **Table** — all three built; React/Vue's real upstream additionally decomposes into Column/ColumnGroup/Row source directories not separately exposed by Ultimate's single-file Table. Functional capability present and built in all three.
- **Paginator** — all three built; React/Vue's real upstream decomposes into 9 subcomponents Ultimate does not replicate. Functional capability present and built in all three.

---

## 5. Framework-Specific Implementation Detail (decomposition parity, kept separate from functional parity)

| Canonical capability | Angular implementation shape | React implementation shape | Vue implementation shape |
|---|---|---|---|
| Tabs | Single component/directive set | Two source directories (TabView container + TabMenu variant) | Composed from a 5-directory family: tabs → tablist → tab → tabpanel → tabpanels (container-first ordering, Dependency Map §C) |
| Stepper | Single "Stepper + StepperPanel" entry | Two source directories (Stepper + StepperPanel) | Composed from a 6-directory family: stepper → step → stepitem → steplist → steppanel → steppanels (container-first ordering) |
| Accordion | Single directory | Single directory | Composed from a 4-directory family: accordion → accordionpanel → accordionheader → accordioncontent |
| Splitter | Single directory | Single directory | Composed from a 2-directory family: splitter → splitterpanel |
| Table | Single file; sort/filter/select/virtualization state co-located | Single-structure Ultimate implementation; real upstream additionally splits Column/ColumnGroup/Row as independent directories, not replicated | Single file; real upstream additionally splits into ~17-file DataTable plus independent Column/ColumnGroup/Row directories, not replicated |
| Paginator | Single directive/component | Single file; real upstream decomposes into 9 subcomponents (JumpToPage, RowsPerPageDropdown, etc.), not replicated — whether all upstream behavior is reproduced inline is unverified (Phase A §3) | Single `Paginator.vue` file; same 9-subcomponent upstream decomposition, not replicated — same unverified-inline-behavior caveat (Phase A §4) |
| Directive-shaped primitives (FocusTrap/Tooltip/Ripple) | Directive-with-component-render pattern | Ref-based sentinel/target component pattern (ADR-025) | Native Vue custom directives via `createDirective` factory (ADR-033/034) | 
| Form-integration mechanism | `ControlValueAccessor` (native or self-implemented per component) | Fully-controlled props (`value`/`onChange`) — no CVA analogue anywhere in React's architecture | `v-model` / `update:modelValue` emit via `writeValue()` |
| Base-class chain depth | 4-tier: `UBaseComponent → UModelHolder → UBaseEditableHolder → UBaseInput` | No chain — architecturally unnecessary, confirmed absent upstream too | 3-tier: `createBaseComponent → createBaseEditableHolder → createBaseInput` (no ModelHolder-equivalent — matches real PrimeVue's own chain shape) |

This section exists to make explicit that **implementation/decomposition parity is not required** for functional parity to hold — per the governing interpretation (§0), Ultimate implementations remain framework-native, and a capability composed from 6 Vue source directories that produces the same user-facing Stepper behavior as Angular's single directive is **not** a parity gap.

---

## 6. Measurement Discipline (avoiding false precision)

Per the task's own instruction, these are kept as explicitly distinct counts, never conflated:

| Measurement | Angular | React | Vue |
|---|---|---|---|
| Prime source-directory count (total) | 117 | 116 | ~158 (dual-root) |
| Prime source-directory count (already built) | 18 | 8 | 9 |
| Prime source-directory count (remaining, Dependency Map §A) | 99 | 108 (stated) / 96 (named) | ~143 (stated) / 119 (named) |
| Canonical user-facing capabilities identified in this matrix (§1.1–§1.7 tables; §1.8's 4 cross-cutting infrastructure entries are explicitly excluded as non-user-facing per §3.5) | 109 capability rows total, mechanically counted (shared across all 3 frameworks — this is not a per-framework count) | (same 109-row canonical list) | (same 109-row canonical list) |
| Canonical capabilities with a "Built" or "Migration target — ready" state, this framework | Count derivable from §2's per-framework columns; not restated as a single figure here since doing so would re-introduce a ranking-adjacent summary number the task's §"Avoid false precision" section warns against conflating with the other rows above | (same caveat) | (same caveat) |

**Why the 109-row canonical count cannot be derived by simply subtracting decomposition duplicates from the Dependency Map's per-framework totals:** the canonical list in §1 merges 1:1, same-capability-different-name, and decomposed-family entries into one row each, but also **excludes** internal/foundation-only entries (§3.5) that the Dependency Map's per-framework totals do include (e.g. `config`, `passthrough`, `api`, the not-needed internal-tooling rows). The two counts measure different things by design and are not reconcilable by arithmetic — restated per the task's explicit instruction not to equate source-directory counts, Prime component counts, Ultimate component counts, and canonical capability counts.

---

## 7. Verification checklist (per task's completion criteria)

1. **No duplicate canonical capabilities caused merely by framework decomposition** — confirmed. Tabs/Stepper/Accordion/Splitter/Table/Paginator each appear once in §1, with their per-framework decomposition recorded only in §5, not as additional §1 rows.
2. **No component-directory count presented as a functional capability count** — confirmed. §6 keeps Prime directory counts, Dependency Map remaining counts, and the §1 canonical capability count (109, mechanically verified) in separate rows with an explicit non-reconciliation note.
3. **Every framework has an explicit state for each canonical capability where the evidence permits** — confirmed for §2's rows; where evidence does not permit a state, `Unverified / mapping unresolved` is used. `Not applicable` is now reserved exclusively for the 2 rows in §2.1 (React's Editable/model-holder and Input tiers) where independent, non-naming evidence establishes genuine functional absence — every other prior "Not applicable" use was reclassified to `Unverified / mapping unresolved` this pass (see report).
4. **Unresolved mappings remain explicitly unresolved** — confirmed. §3.4 (Vue's 9 suspected aliases, including the §4-vs-§8 internal inconsistency), §3.6 (OverlayService, Messages/Message relationship, and others), and §4.2 (OrganizationChart/DECISION-D) are all preserved unresolved, matching the Dependency Map's own prior treatment.
5. **Functional parity is distinguished from implementation/decomposition parity** — confirmed. §4 covers functional gaps only; §5 covers implementation shape only; §4.3 explicitly excludes decomposition-only differences from the gap list; §4.1a separates infrastructure-blocked-but-named capabilities from functionally-absent ones.
6. **No migration ordering, ranking, scoring, or Batch 1 selection** — confirmed. This document contains no priority language, no recommended sequence beyond what the Dependency Map already established (not restated here), and no batch-selection statement.
7. **Directory-name absence is not treated as functional absence** — confirmed this pass (see report). §3.3 now separates confirmed functional absence (tier a, 2 items) from naming-enumeration-only gaps (tier b, 12 items) from mapping-unresolved (tier c); §4.1 retains only the 2 tier-a items as confirmed functional parity gaps.
8. **"Confirmed functional gap" is not used as a proxy for directory-structure asymmetry** — confirmed this pass. §4.1 was reduced from 13 rows to 2; the 11 removed rows are explicitly listed as reclassified-out, with the reasoning stated per item, not silently dropped.

---

## Status

**READY FOR HUMAN REVIEW — NOT APPROVED.**

This document does not authorize implementation of any capability, does not select Migration Batch 1, and does not create an implementation plan. It is a planning artifact intended to inform a future, separately-gated batch-selection and implementation-planning exercise, per `docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md`'s own gated-workflow requirement.
