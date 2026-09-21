# Phase C — Migration Dependency Map

**Document type:** Analysis/documentation artifact. Not an implementation plan, not a batch selection, not a new authority tier. This document does not authorize implementation of any component and does not select a first migration batch.
**Repository:** `ultimate`
**Compiled:** 2026-09-17, on `main` at commit `a6b2f4d` (post-merge of Phase B Knowledge Reconciliation), with no drift found against the Phase A inventory during this pass (see §0).
**Governing operating context:** `docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md` — every classification below follows that document's §5 "Proof-by-exception, not proof-by-default" principle. This map does not perform a feasibility study on any individual component; it applies the classification already established by Phase A / `COMPONENT_INVENTORY.md` / `BLUEPRINT_GAPS.md`, and flags only the genuine exceptions that meet the operating context's own exception criteria.

**Migration framing:** Phase A (Migration Inventory) → Phase B (Knowledge Reconciliation) → **Phase C (Actual Migration)**. This map is Phase C planning input — the operating-context document's own boundary applies: this map does not select Migration Batch 1, does not create an implementation plan, and does not begin implementation.

---

## 0. Sources used and drift check

- `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` — primary source for React (§3) and Vue (§4); baseline for Angular cross-reference.
- `docs/architecture/COMPONENT_INVENTORY.md` — primary, current-state-tracking (tier 5) source for Angular's full 117-directory classification.
- `docs/architecture/BLUEPRINT_GAPS.md` §3/§5 — gap registry and protected-decision markers (DECISION-B/C/D/E), cited wherever a component's classification depends on them. None reopened.
- `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md` — used for the current authority-hierarchy context; no new findings drawn from it here beyond what's already merged to `main`.
- `docs/architecture/DECISIONS.md` — cited for specific ADRs where a component's prerequisite traces to one (ADR-018/024/032/043/046/047, etc.).
- Fresh repository verification this session: `packages/{ng,react,vue}/src/` and `packages/{ng-core,react-core,vue-core}/src/` directory listings, re-checked against Phase A's own built-component counts.

**Drift check result: none found.** Angular's built set (14 `packages/ng/src/` directories + `ng-core` foundation tier) exactly matches `COMPONENT_INVENTORY.md`'s "18 exclusively built" accounting. React's 8 built directories and Vue's 9 built directories both exactly match Phase A's own counts, with zero discrepancy in the built-component lists themselves.

**Three real discrepancies were found during this pass and are reported, not silently resolved:**

1. **React's `react-core/src/hooks/` claim (Phase A §3) is understated.** Phase A states React's hooks tier "was not enumerated file-by-file — largest unverified area." Fresh verification this session found `packages/react-core/src/overlay/use-overlay-listener.ts` genuinely exists — a real, built overlay-listener hook — just located under `overlay/`, not `hooks/`. This does not contradict Phase A's bottom-line conclusion (the overlay tier is usable), but the "not enumerated" framing undersells what's actually built. Not corrected in Phase A itself; recorded here as a finding for a future reconciliation pass.
2. **Angular's OrganizationChart classification is internally inconsistent across two authoritative documents.** `BLUEPRINT_GAPS.md`'s DECISION-D prose names "Tree/TreeTable/TreeSelect/OrganizationChart" as the four Tree-family components under its protected, do-not-reopen marker. `COMPONENT_INVENTORY.md`'s own row for OrganizationChart shows plain `ADAPT`, Medium risk, "basecomponent" dependency only — no Tree dependency, no `NEEDS ARCHITECTURE DECISION` label. **This document does not resolve this discrepancy** — OrganizationChart is classified below per `COMPONENT_INVENTORY.md`'s own row (the more specific, component-level tier-5 source), with the DECISION-D naming conflict flagged explicitly in §D. **Resolved (2026-09-21):** direct real-source verification confirmed Angular's real PrimeNG `OrganizationChart` genuinely imports `TreeNode` and mutates `node.expanded` in place — DECISION-D's naming was correct for Angular specifically (though not independently verified at the time it was written). React's and Vue's real implementations were separately verified structurally independent of Tree — DECISION-D's protection does not extend to them. Full record: `BLUEPRINT_GAPS.md`'s DECISION-D entry; `docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md` §12.4.
3. **Phase A's React and Vue "remaining" bullet-list enumerations do not reach Phase A's own stated remaining totals.** Re-itemizing Phase A §3's category bullets by individual name (including `SelectItem` as a named type-only item, and `Stepper`+`StepperPanel`/`Terminal`+`TerminalService` as two named items each) yields exactly **96 named React items** against a stated remaining total of 108 — **12 unnamed**. Re-itemizing Phase A §4's category bullets the same way (using its own stated family directory-counts where given, e.g. "Tabs family (5 dirs)", "Stepper family (6 dirs)", "Accordion family (4 dirs)"; and, for "Splitter family" — the one family Phase A §4 names without stating a count — resolving its size by checking the same pinned `primevue-4.5.5.tar.gz` tarball Phase A itself cites as its extraction source, which shows exactly 2 top-level directories, `splitter/` and `splitterpanel/`, consistent with this map's own §C "splitter → splitterpanel" ordering already sourced from Phase A §6) yields exactly **119 named Vue items** against a stated remaining total of ~143 — **~24 unnamed** (Phase A's own total carries a `~`, so the residual cannot be pinned to one exact integer; this map's own category totals below land at 142, one below the stated ~143, within Phase A's own disclosed margin of imprecision — not force-adjusted to hit "143" exactly). Both "108" and "~143" trace only to arithmetic (116−8, 158−15) in Phase A §3/§7 and §4/§7 respectively, never to an independent full roster. **A further, separate Phase A internal inconsistency was found while deriving this:** §4's own "Remaining" bullets name 7 suspected-deprecated Vue aliases inline (InputSwitch/Dropdown/Calendar, Sidebar/OverlayPanel, TabMenu/TabView), but §8 elsewhere states there are "8 suspected-deprecated directories" and additionally names `Chips` and `AccordionTab`, neither of which appears anywhere in §4's own "Remaining" bullet text. §4 and §8 do not agree on the alias roster; this map follows §4 (the section defining the ~143 figure being reconciled here) and flags, rather than resolves, the §4/§8 mismatch. This map does not invent the missing names — the residual is carried below as an explicit `Unverified — not individually named in Phase A` line item per framework, not folded into any classified bucket.

---

## A. Framework summaries

**Classification model (applies to all 3 frameworks):** every remaining target gets exactly one **primary classification**, drawn from this 7-item enum. Secondary attributes (dependency target, blocker name, exception rationale) are attached to a primary-classified row, never used to create an additional count. No target appears in more than one primary-classification row.

1. **Ready under established pattern** — ADAPT, no unresolved dependency.
2. **Depends on another migration target** — ADAPT, but blocked on a specific named, still-unbuilt prerequisite that is itself a migration target (not an exception in its own right).
3. **Architectural exception** — meets the operating context's §5 proof-by-exception criteria (new external runtime dependency, protected-decision consequence, structurally-incompatible pattern).
4. **Blocked (ordinary)** — unbuilt infrastructure prerequisite that is not itself an architectural exception (e.g. an unbuilt service tier).
5. **Not needed / superseded** — closed, no Phase C action required.
6. **Type-only** — bundled with a sibling target, not an independent migration unit.
7. **Unverified** — cannot be classified without further research; kept explicitly unresolved rather than forced into another bucket.

### A.1 Angular

Total PrimeNG source directories: 117. Already built: 18. Remaining, classified in this map: **99** — all 99 rows sourced directly from `COMPONENT_INVENTORY.md`'s own per-row `Migration classification` field (ADAPT / NOT NEEDED / NEEDS ARCHITECTURE DECISION), the primary tier-5 source.

| Primary classification | Count | Items |
|---|---|---|
| 1. Ready under established pattern | 82 | All remaining `ADAPT`-classified rows except TreeSelect and AvatarGroup (see rows 2 below): Autocomplete, CascadeSelect, ColorPicker, DatePicker, FileUpload, FloatLabel, IconField, IftaLabel, InputGroup, InputGroupAddon, InputIcon, InputMask, InputOTP, KeyFilter, Knob, Listbox, MultiSelect, Password, RadioButton, Rating, Select, SelectButton, Slider, Textarea, ToggleButton, ToggleSwitch, ConfirmDialog, ConfirmPopup, ContextMenu, Drawer, DynamicDialog, Popover, OverlayBadge, StyleClass, Breadcrumb, MegaMenu, Menubar, PanelMenu, Steps, Stepper, Tabs, TieredMenu, Dock, SpeedDial, SplitButton, Accordion, Avatar, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, ImageCompare, Inplace, Message, MeterGroup, OrganizationChart (**resolved architectural exception for Angular, per DECISION-D scope clarification, 2026-09-21 — see §D; retained in this row's count since `COMPONENT_INVENTORY.md`, this table's own declared source, still shows its per-row field as ADAPT**), OrderList, PickList, DataView (**moved from row 3 to row 1, 2026-09-21 — `COMPONENT_INVENTORY.md`'s own per-row field updated from `NEEDS ARCHITECTURE DECISION` to `ADAPT` following the DECISION-C architecture resolution; see §D**), Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal, Timeline, Toast, Toolbar, AnimateOnScroll, DragDrop, `icons` |
| 2. Depends on another migration target | 2 | TreeSelect (hard — requires Tree, itself an architectural exception below); AvatarGroup (soft — requires Avatar, same batch, row 1 above) |
| 3. Architectural exception | 7 | TreeTable, Tree, Editor, Chart, `config` (full surface remainder), `passthrough`, `api` (remaining surface) — all `NEEDS ARCHITECTURE DECISION` per `COMPONENT_INVENTORY.md`. (OrderList/PickList/DataView moved to row 1, 2026-09-21 — see above.) |
| 4. Blocked (ordinary) | 0 | none — Angular has no remaining component blocked on ordinary unbuilt infrastructure |
| 5. Not needed / superseded | 8 | usestyle, classnames, ts-helpers, base, types, dom, utils, motion |
| 6. Type-only | 0 | none |
| 7. Unverified | 0 | none — `COMPONENT_INVENTORY.md` classifies all 99 rows explicitly |
| **Total** | **99** | **82 + 2 + 7 + 0 + 8 + 0 + 0 = 99** ✓ (updated 2026-09-21: OrderList/PickList/DataView moved row 3→row 1 per DECISION-C resolution; was 79+2+10+0+8+0+0) |

*Primary source: `docs/architecture/COMPONENT_INVENTORY.md` (tier 5, mechanically verified against the pinned PrimeNG 21.1.9 tarball). Secondary: `BLUEPRINT_GAPS.md` §3/§5.*

### A.2 React

Total PrimeReact source directories: 116. Already built: 8. Stated remaining total: 108. **This map's own recount of Phase A §3's named bullet items sums to exactly 96 (§0 finding 3) — the 12-item shortfall between Phase A's own bullet enumeration and Phase A's own stated total is not independently resolvable from the source material and is carried below entirely inside row 7 (Unverified), not invented or silently distributed across the other categories.**

| Primary classification | Count | Items |
|---|---|---|
| 1. Ready under established pattern | 82 | AutoComplete, CascadeSelect, Calendar, ColorPicker, Chips, Dropdown, FileUpload, FloatLabel, IconField, InputIcon, InputMask, InputNumber, InputOTP, InputSwitch, InputText, InputTextarea, KeyFilter, Knob, Listbox, Mention, MultiSelect, MultiStateCheckbox, Password, RadioButton, Rating, SelectButton, Slider, ToggleButton, TriStateCheckbox, ConfirmDialog, ConfirmPopup, ContextMenu, OverlayPanel, OverlayService, Sidebar, StyleClass, Breadcrumb, Dock, MegaMenu, Menubar, PanelMenu, SlideMenu, SpeedDial, SplitButton, Steps, Stepper, StepperPanel, TabMenu, TabView, TieredMenu, DataScroller, Accordion, Avatar, AvatarGroup, BlockUI, ButtonGroup, Card, Carousel, Chip, DeferredContent, Divider, Fieldset, Galleria, Image, Inplace, Message, Messages, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal, TerminalService, Timeline, Toast, Toolbar |
| 2. Depends on another migration target | 2 | TreeSelect (hard — requires Tree); TreeTable (hard — requires Tree) — neither's own pattern is in question, only their prerequisite is, so both sit here rather than in row 3 |
| 3. Architectural exception | 6 | Chart, Editor (DECISION-B, new external runtime dependency); Tree (DECISION-D, protected); OrderList, PickList, DataView (**resolved 2026-09-21 — DECISION-C's own architecture question for these 3 answered, no new foundation required; retained in this row's count since this table is sourced from Phase A's own enumeration, not a component-level tracking document like `COMPONENT_INVENTORY.md`, and Phase A's own text is not rewritten — see `BLUEPRINT_GAPS.md` DECISION-C entry and Roadmap §12.5**) |
| 4. Blocked (ordinary) | 0 | none identified beyond the exception-consequence items above |
| 5. Not needed / superseded | 2 | `componentbase` (confirmed superseded by `useComponentBase`), most of `utils` (inference by analogy to Angular's verified equivalence) |
| 6. Type-only | 1 | SelectItem |
| 7. Unverified | 15 | CSSTransition (real uncertainty per Phase A's own "likely... inference, not independently verified" hedge — kept unverified rather than asserted not-needed); `passthrough`; `api`/`PrimeReactContext` (3 named items) + **12 items Phase A's own bullets never individually named** (the exact shortfall between the 96 named items and the stated 108 — see §0 finding 3, not invented) |
| **Total** | **108** | 82 + 2 + 6 + 0 + 2 + 1 + 15 = 108 ✓ |

*Primary source: `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` §3. React has no equivalent of `COMPONENT_INVENTORY.md` yet — a known, disclosed gap from Phase A/B, not addressed by this map.*

### A.3 Vue

Total PrimeVue unique source directories (dual-root): ~158. Already built: 9. Stated remaining total: ~143 — Phase A's own figure, itself flagged by Phase A as approximate and never re-verified. **This map's own recount of Phase A §4's named/family-counted bullet items sums to exactly 119 (§0 finding 3; family sizes taken from Phase A's own stated counts, with "Splitter family" — the one family Phase A names without stating a size — resolved to 2 directories, `splitter`/`splitterpanel`, by checking the same pinned tarball Phase A itself cites) — the 24-item shortfall between Phase A's own bullet enumeration and Phase A's own stated total is not independently resolvable from the source material and is carried below entirely inside row 7 (Unverified), not invented or silently distributed across the other categories.**

| Primary classification | Count | Items |
|---|---|---|
| 1. Ready under established pattern | 96 | InputText, InputNumber, Textarea, Password, InputMask, InputOtp, InputChips, ToggleSwitch, RadioButton, RadioButtonGroup, CheckboxGroup, Select, MultiSelect, CascadeSelect, Listbox, SelectButton, ToggleButton, AutoComplete, DatePicker, ColorPicker, Knob, Slider, Rating, KeyFilter, FileUpload, FloatLabel, IftaLabel, IconField, InputIcon, InputGroup, InputGroupAddon (31 Form, excluding TreeSelect — row 2) + ContextMenu, Drawer, Popover, StyleClass (4 Overlay ready — ConfirmDialog/ConfirmPopup/DynamicDialog/OverlayBadge sit in row 4 instead, per their explicit Phase A §4 blocker) + Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Dock, SpeedDial, SplitButton, Steps, Tabs family (5 dirs), Stepper family (6 dirs) (20 Navigation, excluding TabMenu/TabView — row 7 unverified aliases; internal family ordering per §C) + Column, ColumnGroup, Row (3 Data, bundled w/ Table, excluding TreeTable — row 2) + Accordion family (4 dirs), Avatar, AvatarGroup, Badge, BadgeDirective, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, ImageCompare, InlineMessage, Inplace, Message, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter family (2 dirs), Tag, Terminal, TerminalService, Timeline, Toolbar, AnimateOnScroll, DeferredContent (37 Panel/Layout/Display) |
| 2. Depends on another migration target | 2 | TreeSelect (hard — requires Tree); TreeTable (hard — requires Tree) |
| 3. Architectural exception | 6 | Chart, Editor (DECISION-B, new external runtime dependency); Tree (DECISION-D, protected); OrderList, PickList, DataView (**resolved 2026-09-21 — DECISION-C's own architecture question for these 3 answered, no new foundation required; retained in this row's count since this table is sourced from Phase A's own enumeration, not rewritten — see `BLUEPRINT_GAPS.md` DECISION-C entry and Roadmap §12.5**) |
| 4. Blocked (ordinary) | 5 | ConfirmDialog, ConfirmPopup, DynamicDialog, Toast (unbuilt ConfirmationService/DialogService/ToastService-equivalent tier — Phase A §4 explicit quote); OverlayBadge (unbuilt Badge in Vue — **note: Badge/BadgeDirective are themselves row-1 ready items in this same remaining set, so this blocker is same-batch, not cross-phase**) |
| 5. Not needed / superseded | 1 | `passthrough` |
| 6. Type-only | 0 | none |
| 7. Unverified | 32 | InputSwitch, Dropdown, Calendar (Form aside), Sidebar, OverlayPanel (Overlay aside), TabMenu, TabView (Navigation aside) — 7 suspected-deprecated aliases named inline in Phase A §4's own "Remaining" bullets — + `config` (both roots — 1 named item), `api` (1 named item) — 9 named items total + **23 items Phase A's §4 bullets never individually enumerated to reach its own ~143 figure** (the exact shortfall against this table's row 1–6 headcount — see §0 finding 3, not invented). **Note:** Phase A §8 separately lists "8 suspected-deprecated directories," naming `Chips` and `AccordionTab` in addition to the 7 named above — neither `Chips` nor `AccordionTab` appears in §4's own "Remaining" bullet text itself, so §4 and §8 disagree on the alias roster. This is a Phase A internal inconsistency, not resolved here; the 9-named-item figure above follows §4 (the section that actually defines the ~143 "Remaining" count this table reconciles against), and the discrepancy is flagged, not silently merged. |
| **Total** | **~143** | 96 + 2 + 6 + 5 + 1 + 0 + 32 = 142 — **1 short of ~143.** Phase A's own total is stated with a tilde (`~143`), i.e. already approximate; this table's derivation from §4's literal text lands at 142, within Phase A's own disclosed margin of imprecision. Not force-adjusted to hit 143 exactly. |

*Primary source: `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` §4. Vue has no equivalent of `COMPONENT_INVENTORY.md` yet — same disclosed gap as React.*

---

## B. Dependency layers

Evidence-derived layering — components are placed by their actual cited dependency, not forced into a layer for diagram completeness.

```text
Layer 0 — Existing Ultimate foundations (already built, all 3 frameworks)
    Angular: UBaseComponent / UModelHolder / UBaseEditableHolder / UBaseInput, UOverlay, UFocusTrap,
             UBind, ripple/autofocus/fluid/badge primitives
    React:   useComponentBase, react-core's overlay/focus-trap/escape/zindex/motion/hooks tiers
    Vue:     createBaseComponent / createBaseEditableHolder / createBaseInput, createDirective,
             vue-core's overlay/focus-trap/escape/zindex/motion tiers
    Shared:  uix-utils, uix-styled, uix-styles, uix-motion, uix-data (all 3 frameworks)
        ↓
Layer 1 — Supporting foundations still needed (a small, named set — not a general "more foundations" bucket)
    Angular: none identified as blocking any remaining component in this pass
    React:   none identified as blocking any remaining component in this pass
    Vue:     Badge (blocks OverlayBadge only); an unbuilt service tier — ConfirmationService/
             DialogService/ToastService-equivalent (blocks ConfirmDialog/ConfirmPopup/
             DynamicDialog/Toast); Fluid (no remaining component in this pass was found to
             hard-require it, but it is itself unbuilt infrastructure, noted for completeness)
        ↓
Layer 2 — Component families (the large majority of remaining work, all 3 frameworks)
    Every "Depends on existing Ultimate foundation" row in §C below — the overwhelming bulk of
    remaining Form/Overlay/Navigation/Panel-Layout-Display components across all three frameworks.
    Internal composed-family ordering (Vue's Tabs/Stepper/Accordion/Splitter families; Angular's
    and React's own composed groups) sits inside this layer, not above it — these are soft,
    within-family orderings, not cross-layer prerequisites.
        ↓
Layer 3 — Higher-level/composite components
    Components that compose an already-migrated OR same-layer sibling: SplitButton (Button+Menu,
    both built, all 3 frameworks); ScrollTop/ButtonGroup (Button, built); ContextMenu/MegaMenu/
    Menubar/PanelMenu/TieredMenu (Menu, built); ConfirmDialog (Dialog, built, though also gated by
    Layer 1's service-tier gap for Vue specifically — see §C); OverlayBadge (Badge, Layer 1 for Vue).
        ↓
Layer 4 — Architectural exceptions (do not proceed under the default path)
    Chart (DECISION-B, all 3 frameworks), Editor (DECISION-B, all 3 frameworks), Tree/TreeTable/
    TreeSelect (DECISION-D, all 3 frameworks), Angular's `config` full-surface remainder (potential
    cross-cutting architecture change if built past ADR-018's scoped minimum).
    (OrderList/PickList/DataView removed from this layer 2026-09-21 — DECISION-C's own architecture
    question for these 3 is resolved, no new foundation required; not thereby migration-eligible,
    see §D.)
```

**Note on Layer 1's smallness:** the evidence does not support a large "supporting foundations" layer. Across all three frameworks combined, only three concrete, named infrastructure gaps were found to genuinely block a remaining component: Vue's Badge, Vue's service tier, and (as a non-blocking completeness note) Vue's Fluid. Angular and React have zero remaining components blocked on missing foundation infrastructure — every Angular/React foundation tier a remaining component needs is already built.

---

## C. Dependency relationships (non-trivial only)

Only relationships with real evidentiary support are listed. "Hard prerequisite" is reserved for cases where the cited source states the dependency explicitly; "soft/ordering preference" covers composed-family internal ordering and natural-but-not-mandatory build sequencing; "shared prerequisite" covers infrastructure multiple targets reference.

### Hard prerequisites

| Target | → requires → | Prerequisite | Strength | Evidence |
|---|---|---|---|---|
| Angular TreeSelect | → requires → | Tree (unbuilt, exception) | Hard | `COMPONENT_INVENTORY.md` row: "tree" dependency, "High (depends on Tree)" |
| Angular TreeTable | → requires → | Tree (unbuilt, exception) | Hard | `COMPONENT_INVENTORY.md`; DECISION-D |
| React TreeSelect | → requires → | Tree (unbuilt, exception) | Hard | Phase A §3/§6; DECISION-D |
| React TreeTable | → requires → | Tree (unbuilt, exception) | Hard | Phase A §3; DECISION-D |
| Vue TreeSelect | → requires → | Tree (unbuilt, exception) | Hard | Phase A §4/§6; DECISION-D |
| Vue TreeTable | → requires → | Tree (unbuilt, exception) | Hard | Phase A §4; DECISION-D, DECISION-C |
| Vue ConfirmDialog / ConfirmPopup / DynamicDialog / Toast | → requires → | An unbuilt ConfirmationService/DialogService/ToastService-equivalent | Hard | Phase A §4 explicit quote: "blocks ConfirmDialog/DynamicDialog/Toast until built" |
| Vue OverlayBadge | → requires → | Badge (unbuilt in Vue) | Hard | Phase A §4; fresh-verified `packages/vue/src/badge` absent |

### Soft ordering preferences (within-family, not cross-family blockers)

| Target family | Internal order | Strength | Evidence |
|---|---|---|---|
| Vue Tabs family | tabs → tablist → tab → tabpanel → tabpanels | Soft — container-first, explicitly stated | Phase A §6 |
| Vue Stepper family | stepper → step → stepitem → steplist → steppanel → steppanels | Soft — container-first, explicitly stated | Phase A §6 |
| Vue Accordion family | accordion → accordionpanel → accordionheader → accordioncontent | Soft — container-first, explicitly stated | Phase A §6 |
| Vue Splitter family | splitter → splitterpanel | Soft — **inferred by analogy** to the 3 families above, not explicitly stated by Phase A for this specific pair | Inference, flagged as such |
| React Stepper + StepperPanel | Stepper → StepperPanel | Soft — same general composed-family guidance | Phase A §6 general principle, not a per-family explicit statement for React |
| Angular AvatarGroup | Avatar (build first, compositional) | Soft | `COMPONENT_INVENTORY.md` row: "Dependencies: avatar" |

### Shared prerequisites (infrastructure referenced by multiple targets)

| Prerequisite | Referenced by | Strength | Evidence |
|---|---|---|---|
| Angular DragDrop | OrderList, PickList (their DECISION-C architectural-exception status is resolved, 2026-09-21 — see §D; DragDrop itself remains ordinary component-local dependency work, not an architectural question) | Shared, ordinary | `COMPONENT_INVENTORY.md`: "used by OrderList/PickList" |
| `uix-data`'s `FilterMatchMode`/`FilterMetadata` | Any Vue Data-family component eventually needing filter semantics | Shared, cross-framework, already built | Phase A §4, §5 (framework-agnostic package) |

### No dependency (explicitly confirmed already-satisfied)

| Target | Prerequisite already satisfied | Evidence |
|---|---|---|
| All 3 frameworks' SplitButton | Button + Menu, both already built | Phase A §6 explicit statement, all 3 frameworks |
| Angular OverlayBadge | Badge, already built in Angular | `COMPONENT_INVENTORY.md` row |
| React/Vue ContextMenu, MegaMenu, Menubar, PanelMenu, TieredMenu | Menu, already built | Phase A §6 |
| React DataScroller | Paginator + Scroller, both already built | Phase A §3 |

---

## D. Exceptions and blockers

Separated from ordinary dependencies per the task's own instruction. Each entry states target, classification, exact reason, authoritative source, and whether it is already documented (vs. newly surfaced by this map).

Each target's classification here is its single primary classification from §A — this table adds the reason and source, it does not add a second category.

| Target (all 3 frameworks unless noted) | Primary classification | Exact reason | Authoritative source | Already documented? |
|---|---|---|---|---|
| Chart | Architectural exception | New external runtime dependency (Chart.js) creates an unresolved architectural decision — meets operating-context §5 criterion 3 exactly | `BLUEPRINT_GAPS.md` DECISION-B, GAP-019; ADR-004 | Yes — pre-existing, not newly surfaced |
| Editor | Architectural exception | New external runtime dependency (Quill) — same DECISION-B | `BLUEPRINT_GAPS.md` DECISION-B, GAP-020 | Yes |
| Tree | Architectural exception (protected) | DECISION-D "do-not-reopen" marker; its own structural-incompatibility finding (PrimeNG mutates node refs in place; React/Vue use external key-maps) — meets §5 criterion 1 (required pattern doesn't exist anywhere in Ultimate). **Reference-integrity correction (Parity Reconciliation pass, 2026-09-20):** previously cited as "ADR-043's" finding — `DECISIONS.md`'s actual ADR-043 is the unrelated `@ultimate/uix-data` decision; this finding has only ever lived in `BLUEPRINT_GAPS.md`'s own DECISION-D prose, corrected there and here. DECISION-D's substance/protection is unchanged. | `BLUEPRINT_GAPS.md` DECISION-D, GAP-013 | Yes |
| TreeTable | Depends on another migration target (Tree) — Angular only; React/Vue's TreeTable classified the same way in §A | Requires Tree, itself the architectural exception above; also separately named in DECISION-C's own text (unaffected by the 2026-09-21 resolution below, which explicitly excludes TreeTable) as context, not as TreeTable's own primary classification | `BLUEPRINT_GAPS.md` DECISION-C, DECISION-D | Yes |
| TreeSelect | Depends on another migration target (Tree) | Not itself an exception, but transitively blocked by one | `BLUEPRINT_GAPS.md` DECISION-D (consequence) | Yes |
| OrderList, PickList, DataView | **Resolved (2026-09-21)** — was: Architectural exception | DECISION-C's own text asked "whether Table's now-proven composition pattern... should be treated as the answer for TreeTable/OrderList/PickList/DataView too, or whether each needs its own pass." Direct real-source verification (2026-09-21) confirmed: DataView directly composes each framework's own already-Built Paginator (no extension needed); OrderList/PickList are not architectural Table reuse at all (no selection/virtualization/Table composition, real "selection" is list-transfer membership) — both remain ordinary framework-native components. No new shared foundation required for any of the 3. TreeTable is explicitly excluded from this resolution — its own blocker remains Tree/DECISION-D, unaddressed here. | Real Prime source, extracted and read directly; `BLUEPRINT_GAPS.md` DECISION-C entry; Roadmap §12.5 | **Resolved — see `BLUEPRINT_GAPS.md` DECISION-C entry and Roadmap §12.5** |
| Angular `config` (full surface) | Architectural exception (soft — not urgent) | Building past ADR-018's scoped minimum would materially change cross-cutting config architecture — meets §5 criterion 2, conditionally (only if built to full parity; the scoped-down version is already settled) | `COMPONENT_INVENTORY.md` row; ADR-018 | Yes |
| Vue ConfirmDialog / ConfirmPopup / DynamicDialog / Toast | Blocked (ordinary, not architectural exception) | Unbuilt service tier (ConfirmationService/DialogService/ToastService-equivalent) — this is disclosed as *unbuilt infrastructure*, not an unresolved architectural question; the pattern itself isn't in doubt | Phase A §4 explicit quote | Yes (Phase A finding) |
| Vue OverlayBadge | Blocked (ordinary) | Badge not yet built in Vue — confirmed real cross-framework asymmetry, not an architectural question | Phase A §4; fresh-verified | Yes |
| Angular OrganizationChart | **Architectural exception** (resolved 2026-09-21 — was: "ready... but see discrepancy") | `BLUEPRINT_GAPS.md` DECISION-D named OrganizationChart as Tree-family; `COMPONENT_INVENTORY.md`'s own row showed plain ADAPT, no Tree dependency. Direct real-source verification (2026-09-21) confirmed Angular's real `OrganizationChart` genuinely imports `TreeNode` and mutates `node.expanded` in place — DECISION-D's naming was correct for Angular. React's/Vue's real implementations were separately confirmed structurally independent — not excluded. | Real PrimeNG source, extracted and read directly | **Resolved — see `BLUEPRINT_GAPS.md` DECISION-D entry and Roadmap §12.4** |

---

## E. Candidate migration readiness

Per the task's own instruction, this is a neutral classification list — **not a ranking, not a score, not a batch selection.** No component below is recommended over another; this section is a deterministic restatement of §A's primary classification 1 ("Ready under established pattern") per framework, plus pointers to the other 6 categories. It introduces no new judgment.

### Angular — ready under established pattern (79 items)

Autocomplete, CascadeSelect, ColorPicker, DatePicker, FileUpload, FloatLabel, IconField, IftaLabel, InputGroup, InputGroupAddon, InputIcon, InputMask, InputOTP, KeyFilter, Knob, Listbox, MultiSelect, Password, RadioButton, Rating, Select, SelectButton, Slider, Textarea, ToggleButton, ToggleSwitch, ConfirmDialog, ConfirmPopup, ContextMenu, Drawer, DynamicDialog, Popover, OverlayBadge, StyleClass, Breadcrumb, MegaMenu, Menubar, PanelMenu, Steps, Stepper, Tabs, TieredMenu, Dock, SpeedDial, SplitButton, Accordion, Avatar, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, ImageCompare, Inplace, Message, MeterGroup, OrganizationChart (**resolved architectural exception for Angular, per DECISION-D scope clarification, 2026-09-21 — see §D; retained in this row's count since `COMPONENT_INVENTORY.md`, this table's own declared source, still shows its per-row field as ADAPT**), Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal, Timeline, Toast, Toolbar, AnimateOnScroll, DragDrop, `icons`. *(TreeSelect and AvatarGroup are excluded from this list — see "Depends on another migration target" below.)*

### React — ready under established pattern (82 items)

AutoComplete, CascadeSelect, Calendar, ColorPicker, Chips, Dropdown, FileUpload, FloatLabel, IconField, InputIcon, InputMask, InputNumber, InputOTP, InputSwitch, InputText, InputTextarea, KeyFilter, Knob, Listbox, Mention, MultiSelect, MultiStateCheckbox, Password, RadioButton, Rating, SelectButton, Slider, ToggleButton, TriStateCheckbox, ConfirmDialog, ConfirmPopup, ContextMenu, OverlayPanel, OverlayService, Sidebar, StyleClass, Breadcrumb, Dock, MegaMenu, Menubar, PanelMenu, SlideMenu*, SpeedDial, SplitButton, Steps, Stepper, StepperPanel, TabMenu, TabView, TieredMenu, DataScroller, Accordion, Avatar, AvatarGroup, BlockUI, ButtonGroup, Card, Carousel, Chip, DeferredContent, Divider, Fieldset, Galleria, Image, Inplace, Message, Messages, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter, Tag, Terminal, TerminalService, Timeline, Toast, Toolbar. *(\*SlideMenu: Phase A flags as unverified React-only cross-check — carried as ready-per-Phase-A but noted. TreeSelect/TreeTable excluded — see "Depends on another migration target" below.)*

### Vue — ready under established pattern (96 items)

InputText, InputNumber, Textarea, Password, InputMask, InputOtp, InputChips, ToggleSwitch, RadioButton, RadioButtonGroup, CheckboxGroup, Select, MultiSelect, CascadeSelect, Listbox, SelectButton, ToggleButton, AutoComplete, DatePicker, ColorPicker, Knob, Slider, Rating, KeyFilter, FileUpload, FloatLabel, IftaLabel, IconField, InputIcon, InputGroup, InputGroupAddon, ContextMenu, Drawer, Popover, StyleClass, Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Dock, SpeedDial, SplitButton, Steps, Tabs family (5 dirs), Stepper family (6 dirs), Column, ColumnGroup, Row, Accordion family (4 dirs), Avatar, AvatarGroup, Badge, BadgeDirective, BlockUI, ButtonGroup, Card, Carousel, Chip, Divider, Fieldset, Galleria, Image, ImageCompare, InlineMessage, Inplace, Message, MeterGroup, OrganizationChart, Panel, ProgressBar, ProgressSpinner, ScrollPanel, ScrollTop, Skeleton, Splitter family (2 dirs), Tag, Terminal, TerminalService, Timeline, Toolbar, AnimateOnScroll, DeferredContent. *(ConfirmDialog/ConfirmPopup/DynamicDialog/OverlayBadge excluded — see "Blocked" below. TreeSelect/TreeTable excluded — see "Depends on another migration target" below.)*

### Depends on another migration target

| Target | Framework | Prerequisite |
|---|---|---|
| TreeSelect | All 3 | Tree (hard — Tree is an architectural exception) |
| TreeTable | React, Vue | Tree (hard) |
| AvatarGroup | Angular | Avatar (soft, same-batch — Avatar itself is ready above) |

### Blocked (ordinary)

| Target | Framework | Missing prerequisite |
|---|---|---|
| ConfirmDialog, ConfirmPopup, DynamicDialog, Toast | Vue | Unbuilt ConfirmationService/DialogService/ToastService-equivalent tier |
| OverlayBadge | Vue | Badge (unbuilt in Vue; Badge itself is ready above, same batch) |

### Architectural exception / Not needed / Type-only

See §A per-framework tables and §D for the full architectural-exception list; §F for not-needed items; §A.2 (SelectItem) for React's sole type-only item.

### Unverified (neither ready nor blocked — genuinely unresolved evidence, tracked per §A row 7 in each framework)

- **React (15):** CSSTransition, `passthrough`, `api`/`PrimeReactContext` (3 named, real uncertainty per Phase A's own hedge) + 12 items Phase A's own §3 bullets never individually named (the exact shortfall between the 96-item recount and the stated 108 — §0 finding 3, not invented).
- **Vue (32):** the 7 suspected-deprecated aliases named inline in Phase A §4's own bullets (InputSwitch, Dropdown, Calendar, Sidebar, OverlayPanel, TabMenu, TabView — Phase A's own file-count heuristic, never confirmed by content read; note Phase A §8 separately names an 8th and 9th suspected-deprecated item, `Chips` and `AccordionTab`, that do not appear in §4's own text — a Phase A internal inconsistency flagged, not resolved, in §0) + `config` (both roots), `api` (2 named) + 23 items Phase A never individually enumerated in §4 to reach its own ~143 figure (residual — §0 finding 3, not invented). Row total (142) lands one below the stated ~143, within Phase A's own disclosed approximation.
- **Angular (0):** none — `COMPONENT_INVENTORY.md` classifies all 99 rows explicitly.

None of these are silently resolved here; none are folded into "ready."

---

## F. Not-needed / already-closed items (no Phase C action required)

- **Angular:** `usestyle`, `classnames`, `ts-helpers`, `base`, `types`, `dom`, `utils`, `motion` — all 8 already classified `NOT NEEDED` in `COMPONENT_INVENTORY.md` with a documented reason each. Already satisfies the operating context §9 "excluded, with a documented reason" outcome.
- **React:** `componentbase` (superseded by `useComponentBase`, confirmed), most of `utils` (superseded by `uix-utils`, inference by analogy to Angular's verified equivalence), `CSSTransition` (likely superseded by `uix-motion`, unverified inference).
- **Vue:** `passthrough` — out of scope everywhere per every framework's own Option-B ADR posture; not a migration target.

---

## G. Cross-cutting unresolved items (not per-component blockers)

| Item | Frameworks | Status | Evidence |
|---|---|---|---|
| `config` (full surface beyond the ADR-018 minimum) | Angular, Vue | Deferred, not urgent — no remaining component currently requires the fuller surface | `COMPONENT_INVENTORY.md`; Phase A §4/§10 |
| `passthrough` (`pt`/`ptOptions` system) | All 3 | Deliberately out of scope everywhere, per each framework's own Option-B ADR; revisit only on real duplicate-pattern pressure | ADR-018/024/032 |
| `api` (remaining shared type contracts / global config object) | React, Vue | Partially covered by `uix-data`'s framework-agnostic exports; full coverage unverified for React/Vue specifically | Phase A §3/§4 |

---

## H. Confirmation checklist (per task's completion criteria)

1. **Phase A inventory used as baseline** — confirmed. React and Vue sections are drawn directly and near-verbatim from Phase A §3/§4; Angular is drawn from `COMPONENT_INVENTORY.md`, itself Phase A's own primary Angular source.
2. **Current repository evidence checked where needed** — confirmed. Fresh directory listings for all 6 relevant `packages/*/src/` trees performed this session; zero drift found against Phase A's built-component counts; three real discrepancies surfaced and reported (§0), not silently resolved (including a Phase A §4-vs-§8 internal inconsistency on Vue's suspected-deprecated alias roster, found during this reconciliation pass).
3. **Established Phase C principles applied** — confirmed. Proof-by-exception applied throughout: no feasibility study performed on any of the ~310 remaining rows; classification is drawn from existing tier-5/tier-6 sources, not re-derived. No new architecture proposed anywhere in this document.
4. **No settled architectural decision reopened** — confirmed. DECISION-B/C/D/E cited and their consequences classified in every relevant row; none reinterpreted or re-litigated. Real disagreement (OrganizationChart, §D) is reported as a discrepancy for human resolution, not adjudicated here.
5. **Genuine exceptions separated from ordinary migration work** — confirmed. §D isolates exactly the components meeting the operating context's own §5 exception criteria (Chart/Editor/Tree-family/OrderList-PickList-DataView's DECISION-C remainder/Angular's `config` full surface) from the much larger set of ordinary "depends on existing foundation" work, and separately from Vue's ordinary (non-architectural) service-tier/Badge blockers.
6. **No component silently dropped** — confirmed. Angular: 99/99 remaining rows classified across 4 non-empty primary categories — exact, sourced directly from `COMPONENT_INVENTORY.md`'s own per-row field. **Current split (updated 2026-09-21, following the DECISION-C resolution moving OrderList/PickList/DataView from row 3 to row 1 — see §A.1): 82 ready + 2 depends + 7 exception + 8 not-needed; 0 blocked, 0 type-only, 0 unverified.** (Original split at this checklist's own initial completion, 2026-09-17, was 79 ready + 2 depends + 10 exception + 8 not-needed — retained here for the record, superseded by the current split above.) React: 108/108 classified exactly (82 ready + 2 depends + 6 exception + 2 not-needed + 1 type-only + 15 unverified), the 15-item Unverified row itself carrying 3 named-but-uncertain items plus the 12-item shortfall between Phase A §3's own 96-item bullet enumeration and its stated 108 total (§0 finding 3). React's row-3 exception count is unchanged by the 2026-09-21 DECISION-C resolution — that table is sourced from Phase A's own frozen enumeration, not `COMPONENT_INVENTORY.md`, per §A.2's own annotation. Vue: 142/~143, within one of Phase A's own approximate figure (96 ready + 2 depends + 6 exception + 5 blocked + 1 not-needed + 32 unverified), the 32-item Unverified row carrying 9 named items plus the residual between Phase A §4's own 119-item bullet enumeration and its stated ~143 total (§0 finding 3) — not force-adjusted to hit "143" exactly; same as React, Vue's row-3 count is unchanged by the 2026-09-21 resolution for the same reason. Every framework total reconciles exactly (Angular, React) or within Phase A's own disclosed approximation (Vue) against its 7-category breakdown in §A; no target appears in more than one primary category.
7. **No implementation or batch selection occurred** — confirmed. This document contains zero code changes and makes zero ranking/scoring/selection statement about which component or family should be migrated first.
8. **Only this single new document created/modified** — confirmed (see report below).
9. **No commit made** — confirmed; this document remains untracked pending human review.

---

## Status

**READY FOR HUMAN REVIEW — NOT APPROVED.**

This document does not authorize implementation of any component, does not select Migration Batch 1, and does not create an implementation plan. It is an analysis artifact intended to inform a future, separately-gated batch-selection and implementation-planning exercise, per `docs/architecture/research/2026-09-17-phase-c-migration-operating-context.md`'s own gated-workflow requirement.
