# Paginator — Cross-Framework Component Implementation Specification

**Status:** Draft for review
**References:** `docs/architecture/BLUEPRINT.md`, `docs/architecture/research/2026-09-02-table-data-component-architecture.md`, `docs/architecture/research/2026-09-02-table-editing-grouping-dragdrop-architecture.md`, ADR-043 (`docs/architecture/DECISIONS.md`), `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md`, `docs/superpowers/specs/2026-09-02-table-component-design.md`, `docs/architecture/checksums.json`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

**No architectural fork was encountered while preparing this spec.** Every design decision below either restates an already-approved conclusion (ADR-043) or resolves an ordinary implementation-level question directly from real pinned source. Where real evidence was insufficient, the item is marked `NEEDS IMPLEMENTATION-TIME VERIFICATION` rather than invented.

---

## 1. Status / Purpose / Scope

**Purpose:** Define the implementation-ready design for Ultimate's Paginator component across UltimateNG, UltimateReact, and UltimateVue — the first of Table's two composition dependencies to receive its own spec (Scroller is the second, tracked separately). This spec exists because the Table implementation-plan pass discovered that Table's spec makes pagination composition a hard dependency on a real Paginator component existing per framework, and no such spec existed yet (`docs/architecture/COMPONENT_INVENTORY.md` still flags Paginator `NEEDS ARCHITECTURE DECISION`, a stale flag: the shared-primitive question was already settled by ADR-043's `PaginationState`/`getPageCount`; what remained was formalizing the component itself).

**Scope:** Paginator only, as a standalone, independently usable component. Table's own composition with Paginator is documented in `docs/superpowers/specs/2026-09-02-table-component-design.md` §14 and is not re-derived here; this spec defines Paginator's own public API, behavior, and implementation requirements so that Table (and any other future consumer — DataView, per the first Table research report §6) can compose with a real, spec-complete component.

**Out of scope for this spec:**
- Table's own pagination integration (covered by the Table spec).
- Scroller (separate future spec).
- Any new `uix-data` primitive (none is justified — `PaginationState`/`getPageCount` are already sufficient and unchanged).
- DataView's own spec (a future document; DataView reuses Paginator's exact field names per the first Table research report §6, but is not investigated further here).

---

## 2. Architectural Baseline

This spec inherits, without modification:

- **`@ultimate/uix-data`** (ADR-043) — Paginator consumes exactly two primitives: `PaginationState { first, rows, totalRecords, rowsPerPageOptions? }` and `getPageCount(totalRecords, rows): number`. No new export is added by this spec.
- **Page-link display math is excluded from `uix-data`** (ADR-043's existing exclusion, reconfirmed by the Table spec §10) — it is a rendering concern, not a data concern. This spec treats it as Paginator's own framework-native implementation logic (§9).
- **Table↔Paginator composition** (both Table research reports; Table spec §14) — not reopened. Table depends on this spec's component existing; this spec does not depend on Table.

This spec adds, from targeted real-source verification performed while preparing it:

- Full public API surface for all three frameworks, verified directly against real Prime source (not previously investigated at this depth by either Table research report, which only confirmed *that* composition exists, not Paginator's own internal design).
- A newly-discovered **three-way divergence in state ownership** (§8) — genuinely different from the two-way (Angular two-way-binding vs. React controlled/uncontrolled) pattern documented for Table. This is new evidence, not previously surfaced.

---

## 3. Component Responsibilities

Paginator is a generic, content-agnostic paging control. Confirmed identical responsibility set across all three real Prime implementations:

- Compute current page, page count, and first/last-page state from `PaginationState`-shaped input (`first`, `rows`, `totalRecords`).
- Render first/prev/page-links/next/last navigation controls, a rows-per-page selector, an optional jump-to-page control, and an optional current-page-report string — all individually togglable via template/slot configuration.
- Emit a page-change notification carrying the new `{page, first, rows, pageCount}` state whenever the user interacts with any navigation control.
- Provide accessible labels for every interactive control.

Paginator is explicitly **not** responsible for: fetching or slicing data (the consumer owns `value`/`totalRecords`), virtualization (Scroller's job), or any Table-specific concern (selection, sort, filter — Paginator has zero awareness of these).

---

## 4. Public API by Framework

Following each framework's own idiom, per the same naming-precedent rule established in the Table spec (§4): Prime-recognizable vocabulary preserved where the concept is genuinely shared; component-level public API naming is not finalized by this spec.

### 4.1 UltimateNG (Angular)

`@Input()`/`@Output()` surface, matching PrimeNG's real `paginator.ts` (verified in full, lines 160–288):

- `first: number` (getter/setter-backed, `paginator.ts:270-276`) — **one-way input only, no `firstChange` output exists.**
- `rows: number` (plain `@Input()`, no getter/setter)
- `totalRecords: number`
- `rowsPerPageOptions: any[] | undefined`
- `pageLinkSize: number = 5`
- `alwaysShow: boolean = true`
- `showCurrentPageReport: boolean | undefined`, `currentPageReportTemplate: string = '{currentPage} of {totalPages}'`
- `showFirstLastIcon: boolean = true`, `showPageLinks: boolean = true`
- `showJumpToPageDropdown: boolean | undefined`, `showJumpToPageInput: boolean | undefined`
- `dropdownScrollHeight: string = '200px'`, `dropdownAppendTo` / `appendTo` (overlay target for the rows-per-page and jump-to-page dropdowns)
- `locale: string | undefined`
- `templateLeft` / `templateRight: TemplateRef<PaginatorTemplateContext>` (arbitrary left/right content slots)
- `dropdownItemTemplate` / `jumpToPageItemTemplate: TemplateRef<PaginatorDropdownItemTemplateContext>`
- Content-child icon template overrides: `dropdownicon`, `firstpagelinkicon`, `previouspagelinkicon`, `lastpagelinkicon`, `nextpagelinkicon`
- `@Output() onPageChange: EventEmitter<PaginatorState>` — the **only** output; fires `{page, first, rows, pageCount}` (`paginator.ts:502-507`).

**State ownership** (verified, `paginator.ts:270-276,340,497-513`): `first` is stored in an internal field `_first`, exposed via getter/setter. The setter simply assigns (`set first(val) { this._first = val; }`) — there is **no two-way-binding output** (`firstChange`) the way Table's own `first`/`rows`/`selection` inputs have. On interaction, `changePage()` computes the new `_first` internally and emits `onPageChange` — but if the parent does not update its bound `[first]` value in response, the component's own internal `_first` has already changed and will diverge from the parent's stale binding on the next change-detection pass (Angular's one-way `[first]` binding does not re-push the parent's stale value back down automatically — the component's `_first` is the actual source of truth for rendering *between* parent updates). This is a real, verified difference from Table's own `@Input() first` + `@Output() firstChange` two-way pattern (Table spec §4.1) — **Paginator itself is not two-way-bindable out of the box**, unlike the way Table wires its own `first`.

### 4.2 UltimateReact (React)

Fully controlled functional-component props, matching PrimeReact's real `Paginator.js` (verified in full) and `PaginatorBase.js` defaults:

- `first: number = 0`, `rows: number = 0`, `totalRecords: number = 0` — **read directly from `props` on every render; confirmed zero internal `useState` for any of these** (`Paginator.js:29-33`: `const page = Math.floor(props.first / props.rows)` computed fresh every render, not derived from any local state hook).
- `rowsPerPageOptions: any[] | null = null`
- `pageLinkSize: number = 5`
- `alwaysShow: boolean = true`
- `template: string | object = 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'`
- `currentPageReportTemplate: string = '({currentPage} of {totalPages})'`
- `leftContent` / `rightContent: ReactNode | ((props) => ReactNode)`
- `dropdownAppendTo`
- `onPageChange: (event: PaginatorPageChangeEvent) => void` — the **only** callback; fires `{first, rows, page, totalPages}` (`Paginator.js:69-74,76-78`). If `onPageChange` is not supplied, `changePage()` still computes the new state but never calls anything — **there is no fallback internal state update of any kind**, confirmed by the absence of any `useState`/`setState` call touching `first`/`rows`/`page` anywhere in `Paginator.js`. This is a genuinely different pattern from Table's React controlled/uncontrolled duality (Table spec §4.2, §16) — Paginator has **no uncontrolled mode at all**; it is unconditionally controlled.

### 4.3 UltimateVue (Vue)

Options-API props + internal reactive data + `v-model` + emit, matching PrimeVue's real `Paginator.vue`/`BasePaginator.vue` (verified in full):

- `first: number = 0`, `rows: number = 0`, `totalRecords: number = 0`
- `rowsPerPageOptions: any[] | null = null`
- `pageLinkSize: number = 5`
- `alwaysShow: boolean = true`
- `template: string | object = 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'`
- `currentPageReportTemplate: string = '({currentPage} of {totalPages})'`
- Named slots: `container`, `start`, `end`, `firsticon`/`firstpagelinkicon`, `previcon`/`prevpagelinkicon`, `nexticon`/`nextpagelinkicon`, `lasticon`/`lastpagelinkicon`
- Emits: `update:first`, `update:rows` (full `v-model:first`/`v-model:rows` support), `page` (fires `{page, first, rows, pageCount}`, `Paginator.vue:151-166`)

**State ownership** (verified, `Paginator.vue:128-146,151-167`): internal reactive `d_first`/`d_rows`, **initialized from props** (`data() { return { d_first: this.first, d_rows: this.rows } }`) and **kept in sync via explicit watchers** (`watch: { first(newValue) { this.d_first = newValue }, rows(newValue) { this.d_rows = newValue } }`) whenever the parent's bound prop value changes. `changePage()` mutates `d_first` internally, then emits all three (`update:first`, `update:rows`, `page`) — giving Vue's Paginator genuine two-way `v-model` support (a parent using `v-model:first="x"` receives the update automatically) while *also* always emitting the descriptive `page` event, unlike React's exclusively-callback-driven model and unlike Angular's one-way-only `first` input.

---

## 5. Shared Concepts vs Framework-Native Concepts

| Concept | Status | Source |
|---|---|---|
| `PaginationState`-shaped fields (`first`/`rows`/`totalRecords`/`rowsPerPageOptions`) | **Shared** — `uix-data` | ADR-043; field names confirmed 1:1 across all three real implementations (§4) |
| `getPageCount` | **Shared** — `uix-data` | ADR-043; each framework's real source independently re-derives the same `Math.ceil(totalRecords / rows)` calculation inline (`paginator.ts:460-461`; `Paginator.js:30`; `Paginator.vue:292`) rather than importing a shared function — Ultimate's implementation should call `getPageCount` instead of re-inlining it, removing three duplicate copies of the same one-line formula |
| Page-link display math (`calculatePageLinkBoundaries`) | **Framework-native** (excluded from `uix-data`, confirmed identical algorithm in all three, but a rendering concern) | ADR-043's exclusion; algorithm independently re-verified identical this spec (§9) |
| State-ownership mechanism | **Framework-native, genuinely three-way divergent** (not just Angular-vs-others) | §8 — new finding, more divergent than Table's own state-ownership pattern |
| Accessibility label vocabulary (`aria-label` per control, via translation/locale lookup) | **Strongly convergent vocabulary, framework-native mechanism** | §12 |

No item in this table requires a new `uix-data` export.

---

## 6. Identity and Selection

Not applicable. Paginator has no item-identity or selection concept in any of the three real implementations — confirmed by the full read of all three main component files (§4); no `dataKey`, no `equals`, no selection-related prop or method exists anywhere in Paginator's real source.

---

## 7. Sorting / Filtering

Not applicable. Paginator has no sort or filter concept. (Sections numbered for structural parity with the Table spec's section list where a concept applies; omitted here where confirmed absent from real source rather than filled with invented content.)

---

## 8. Pagination — State Ownership (Core of This Spec)

This is Paginator's central architectural question, and the real source reveals a genuine three-way divergence — more pronounced than anything found in Table's own state-ownership analysis (Table spec §16, which found Angular "always-internal-plus-emit" vs. React "explicit controlled/uncontrolled" vs. Vue "Options-API-reactive-plus-v-model" as three framework-idiomatic expressions of a similar *shape*). Paginator's three models are not just idiomatically different — they have **different actual behavior** when a parent fails to update its bound value in response to `onPageChange`:

| Framework | Internal state? | Behavior if parent ignores the change event | Two-way binding support |
|---|---|---|---|
| Angular | Yes — `_first` (getter/setter-backed `@Input()`) | Component's own internal `_first` has already advanced; renders the new page regardless of what the parent's bound value says. Reconciliation is concrete and mechanism-specific, not merely "eventual": PrimeNG's `ngOnChanges` handler contains `if (simpleChange.first) { this._first = simpleChange.first.currentValue; ... }` (`paginator.ts:413-417`) — `_first` is overwritten from the parent's bound `[first]` value on every Angular change-detection cycle where that input actually changes. An implementer must wire reconciliation through `ngOnChanges`/`SimpleChanges.first`, not `ngDoCheck` or another lifecycle hook — there is still a render in between using the stale-relative-to-parent internal value, on the cycle where the click happens and before the parent's own state update flows back down | No — no `firstChange` output exists; only `onPageChange`, which carries the full state but is not itself a two-way-binding-compatible emitter name |
| React | No — fully derived from `props.first`/`props.rows` every render, confirmed zero `useState` | Component re-renders using the **unchanged** prop values; the click has no visible effect until the parent updates `first`/`rows` in its own state in response to `onPageChange` | N/A — there is no uncontrolled fallback at all; this is unconditionally controlled |
| Vue | Yes — `d_first`/`d_rows` (initialized from props, watcher-synced) | Component's own `d_first`/`d_rows` have already advanced (used for rendering `page`/`pageCount`/etc., all computed from `d_first`/`d_rows`, not from `first`/`rows` directly); if the parent does not update its `v-model:first`, Vue's `watch: first(newValue)` will reconcile `d_first` back down on the next prop change, same class of behavior as Angular's, but Vue *additionally* offers genuine `v-model` support so the common case (parent uses `v-model:first`) never hits this divergence in practice | Yes — full `v-model:first`/`v-model:rows` via `update:first`/`update:rows` emits |

**Ultimate implication:** Each framework's Paginator implementation should match its own real upstream model exactly, per the constraint to preserve meaningful per-framework API differences (do not force React into an uncontrolled fallback it doesn't have upstream; do not strip Angular's/Vue's internal state to force pure-controlled symmetry with React). Consumers (including Ultimate's own future Table implementation) must be written with framework-appropriate expectations: Angular/Vue consumers can rely on Paginator's own internal state advancing visually even before their own state catches up; React consumers must update `first`/`rows` in their own state inside `onPageChange`, or the UI will not advance at all.

**This does not require a `uix-data` change.** `PaginationState` describes the *shape* of pagination data, not its ownership mechanism — ownership was already explicitly excluded from `uix-data`'s scope by ADR-043's Ownership Boundaries ("live `first`/`rows` pagination state and its change-event handling" is framework-owned, per the uix-data spec §Ownership Boundaries, restated in the uix-data spec's Package Scope table). This finding sharpens, but does not contradict, that existing exclusion.

---

## 9. Page-Link Display Algorithm

Verified identical across all three frameworks (`paginator.ts:464-477`; `Paginator.js:35-49`; `Paginator.vue:300-314`) — same formula, same variable-naming pattern (`start`/`end`/`delta`/`visiblePages`), differing only in host-language syntax:

```text
visiblePages = min(pageLinkSize, pageCount)
start = max(0, ceil(currentPage - visiblePages / 2))
end = min(pageCount - 1, start + visiblePages - 1)
delta = pageLinkSize - (end - start + 1)
start = max(0, start - delta)
pageLinks = [start+1 .. end+1]   // 1-indexed for display
```

**Classification: strongly convergent algorithm, correctly excluded from `uix-data` anyway** (per ADR-043's existing rendering-concern exclusion, not reopened) — this is which-page-numbers-to-render-as-clickable-links logic, not a data-shape concern. Ultimate's three Paginator implementations may share this exact formula as **documented pseudocode** (as above) to ensure behavioral parity, each reimplemented natively per framework (matching the real upstream pattern of each framework independently reimplementing the identical formula rather than importing a shared function) — this is a case where the algorithm's simplicity (pure arithmetic, ~10 lines) does not meet the bar for a shared package export (same reasoning the Table spec applied to OrderList/PickList's button-move logic, Table spec §5.1/§5.3's analogous finding, cited here for consistency of standard rather than re-derived).

---

## 10. Rows-Per-Page Handling

Confirmed present in all three frameworks as a dropdown/select populated from `rowsPerPageOptions: number[]` (or, in PrimeNG specifically, an array element may be an object with a `showAll` key mapped to `{label, value: totalRecords}` — `paginator.ts:433-450`; **not confirmed present in React or Vue's real source this pass** — `NEEDS IMPLEMENTATION-TIME VERIFICATION` whether React/Vue support the same `showAll` object-in-array convention or only plain numbers). Selecting a new rows-per-page value triggers `changePage(0, newRows)`-equivalent logic in all three (reset to first page on page-size change) — confirmed identical behavior (`paginator.ts:557-559`; `Paginator.js:106-110`; `Paginator.vue:195-198`).

---

## 11. Templates / Slots / Render Customization

Confirmed substantial per-framework template/slot surface, structurally similar but not identical:

- **Angular**: `templateLeft`/`templateRight` (arbitrary left/right content), `dropdownItemTemplate`/`jumpToPageItemTemplate` (per-dropdown-item customization), five icon-override content-children (`dropdownicon`, `firstpagelinkicon`, `previouspagelinkicon`, `lastpagelinkicon`, `nextpagelinkicon`).
- **React**: `leftContent`/`rightContent` (function-or-node), a `template` prop that is either a layout string (space-separated control names, e.g. `'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'`) or an object mapping control names to per-control template overrides, or (confirmed, `Paginator.vue`'s Vue counterpart shares this exact pattern — see below) a **breakpoint-keyed object** for responsive layouts (Vue's `hasBreakpoints()`/`createStyle()`, `Paginator.vue:199-257,266-280` — generates media-query CSS per breakpoint key; **not confirmed whether React's real source has the identical breakpoint-object convention** — `NEEDS IMPLEMENTATION-TIME VERIFICATION`).
- **Vue**: named slots (`container`, `start`, `end`, plus icon slots), plus the same `template` string/object/breakpoint-object convention as confirmed in Vue's own source.

**Classification**: control-name-driven layout composition (which controls appear, in what order) is a strongly convergent *concept* across all three, but the exact API shape (Angular's discrete `@Input()`s vs. React/Vue's single polymorphic `template` prop) is framework-native. The breakpoint/responsive-layout feature (confirmed in Vue, unconfirmed in React) is flagged `NEEDS IMPLEMENTATION-TIME VERIFICATION` for cross-framework parity rather than assumed present or absent.

This section also covers events/state ownership for templating concerns and render customization in full — no separate section restates it elsewhere in this document.

---

## 12. Accessibility and Keyboard Behavior

- **Labels**: every interactive control (`first`/`prev`/`next`/`last` buttons, each page-link button, the rows-per-page dropdown, the jump-to-page dropdown) receives an `aria-label` sourced from a translation/locale lookup keyed by a fixed label name (`firstPageLabel`, `prevPageLabel`, `nextPageLabel`, `lastPageLabel`, `pageLabel`, `rowsPerPageLabel`, `jumpToPageDropdownLabel`) — confirmed identical label-name vocabulary in all three: Angular (`getAriaLabel`/`getPageAriaLabel`, `paginator.ts:386-392`, consuming `this.config.translation.aria`), React (`ariaLabel()` helper imported from `../api/Api`, confirmed call sites in `FirstPageLink.js:40`, `PageLinks.js:53,77`), Vue (`getAriaLabel()`, `Paginator.vue:258-260`, consuming `this.$primevue.config.locale.aria`).
- **Current-page indication**: `aria-current="page"` on the active page-link button — confirmed in Angular (`paginator.ts:73`: `[attr.aria-current]="pageLink - 1 == getPage() ? 'page' : undefined"`); **not independently confirmed in React or Vue's page-link sub-components this pass** — `NEEDS IMPLEMENTATION-TIME VERIFICATION`.
- **Live region**: Vue's `CurrentPageReport` sub-component is rendered with `aria-live="polite"` (`Paginator.vue:66`) — confirmed. **Not independently confirmed for Angular or React's current-page-report elements this pass** — `NEEDS IMPLEMENTATION-TIME VERIFICATION` (this is a real, specific, non-trivial accessibility feature; do not assume parity without checking).
- **Root element semantics**: none of the three frameworks set an explicit `role` attribute on Paginator's root element in the real source read this pass. Vue's real template uses a semantic `<nav>` root element (`Paginator.vue:2`), which carries an implicit `role="navigation"` per HTML/ARIA mapping rules without an explicit attribute. Angular's and React's root-element tag was not confirmed as semantic `<nav>` vs. generic `<div>` this pass — `NEEDS IMPLEMENTATION-TIME VERIFICATION`.
- **Disabled-state handling**: `disabled` attribute (not merely a visual class) confirmed applied to prev/next/first/last controls when at a boundary or when `empty` (zero pages) — confirmed in all three (`paginator.ts:60,103,109`; `Paginator.js` sub-component `disabled` props threaded through `createElement`; `Paginator.vue:32,41,50,59`).
- **Keyboard navigation beyond native button/select focus order**: no dedicated keydown handler (arrow-key paging, etc.) was found in any of the three real Paginator implementations during this pass — Paginator relies on native button/select tab-order and Enter/Space activation, unlike Table's dedicated arrow-key grid navigation (Table spec §15). **Not exhaustively verified** — `NEEDS IMPLEMENTATION-TIME VERIFICATION` if a more thorough pass finds a custom handler this read missed, but no evidence of one was found in the files read.

**Classification**: strongly convergent label vocabulary and `aria-current`/disabled-state pattern (where confirmed), several specific gaps correctly flagged rather than assumed. This is documented as an implementation requirement, not a `uix-data` concern (accessibility wiring already excluded from `uix-data`'s scope per ADR-043).

---

## 13. Events and State Ownership

Restated from §8, consolidated:

- **Angular**: single `onPageChange` output; internal `_first` state; no two-way binding for `first`/`rows` themselves.
- **React**: single `onPageChange` callback prop; zero internal state; unconditionally controlled, no uncontrolled fallback.
- **Vue**: `page` event (descriptive, matches the other two frameworks' `onPageChange` role) **plus** `update:first`/`update:rows` (enabling `v-model:first`/`v-model:rows`); internal `d_first`/`d_rows` state, watcher-synced to props.

No cross-framework event-naming or state-ownership contract is introduced. Each framework's Paginator matches its own real upstream exactly.

---

## 14. Styling / Theming Integration

Inherits Ultimate's existing theming/styling infrastructure (`uix-styled`, `uix-styles-components`, `uix-styles-full`, `uix-motion` — already implemented, out of this spec's scope to re-describe). PrimeNG's real source confirms a dedicated style module (`PaginatorStyle`, imported from `./style/paginatorstyle`, `paginator.ts:37,344`) — the same per-component style-module pattern already established by Phase 1's foundation-tier components and reused by the Table spec (§18). Paginator's implementation follows the same pattern. **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: exact design-token names, deferred to implementation planning against the already-existing token infrastructure.

---

## 15. Performance Considerations

- Paginator's own computation (page count, page-link boundaries, current-page report string interpolation) is O(pageLinkSize) per render/update — trivial, no concern.
- No virtualization or large-dataset concern applies to Paginator itself (it renders a bounded, small number of controls regardless of `totalRecords` magnitude).
- Record `dist/` size and gzip size after implementation, consistent with every other UIX/component package's existing performance-baseline recording practice.

---

## 16. Package Boundaries / Exports

Paginator belongs in each framework's own component package (`ng`/`react`/`vue`), following the same dependency direction as Table (`docs/architecture/PACKAGE_ARCHITECTURE.md`):

```text
Framework Components (Paginator, this spec)
        down to
Framework Core (ng-core / react-core / vue-core)
        down to
UltimateUIX (uix-data, uix-utils, uix-styled, uix-styles, uix-motion)
```

- Paginator depends on `@ultimate/uix-data` for exactly `PaginationState` and `getPageCount` — no other `uix-data` primitive applies (no identity, selection, sort, or filter concept exists in Paginator).
- Paginator has **no dependency on GAP-018** (Angular's `BaseModelHolder`/`BaseInput` tier) — confirmed by full source read: Paginator's rows-per-page and jump-to-page controls use PrimeNG's own `p-select`/`p-inputnumber` components directly (`paginator.ts:80-102,115`), not a raw native `<input>`/`<select>` requiring Ultimate's own wrapped-input foundation. Ultimate's own equivalent dropdown/input-number components (whatever Ultimate names them, following Phase 1/2's established component-package pattern) are Paginator's real dependency — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`** for exact package/component names once Ultimate's own Select/InputNumber-equivalent components are confirmed to exist (check `packages/ng/src` for an existing select/dropdown component before assuming one must be built first).
- Paginator has **no dependency on Table, Scroller, or any Data-family component** — it is a leaf dependency in the composition graph (Table depends on Paginator; Paginator depends on nothing Data-family-specific).
- No new `uix-*` package is introduced by this spec.
- Export surface: **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**, same as the Table spec's equivalent item — deferred to implementation-plan-level detail.

---

## 17. Provenance and Licensing

- Paginator's real upstream source is PrimeNG 21.1.9 (`paginator.ts`, commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`), PrimeReact 10.9.9 (`Paginator.js` and siblings, commit `d0f574e39122668292fc7a740f081bae1b93b1e9`), PrimeVue 4.5.5 (`Paginator.vue` and siblings, commit `66dde6788220fc9e6822342919d1ceb0e3460ece`) — all three pinned and sha256-verified per `docs/architecture/checksums.json`, same pins used throughout the Table spec and both research reports.
- Provenance manifest entries follow the existing `originalPath`/`ultimateDestination` schema (direct per-framework adaptation of a real upstream file each), matching Phase 1/2's existing component provenance pattern and the Table spec's own provenance approach (§21) — not `uix-data`'s `verifiedAgainst` schema, since Paginator (unlike `uix-data`'s cross-framework-synthesized primitives) is a direct per-framework component adaptation.
- License: MIT, inherited from PrimeNG/PrimeReact/PrimeVue, per the existing `THIRD-PARTY-NOTICES.md` pattern.
- **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: exact per-file provenance manifest entries (line-range citations) are an implementation-time artifact.

---

## 18. Testing / Verification Matrix

| Area | Angular | React | Vue |
|---|---|---|---|
| `PaginationState`/`getPageCount` consumption | Unit: confirms `getPageCount` import used, not re-inlined | Same | Same |
| Page-link boundary algorithm (§9) | Unit: known-input/known-output table, including boundary cases (first page, last page, `pageLinkSize` larger than `pageCount`) | Same | Same |
| State-ownership behavior (§8) | Component: verify internal `_first` advances on click even before parent re-binds `[first]` | Component: verify UI does NOT advance if `onPageChange` doesn't update `first`/`rows` (confirms the no-uncontrolled-fallback finding) | Component: verify `v-model:first` round-trips correctly; verify `d_first` watcher-syncs when parent changes `first` externally |
| Rows-per-page change | Component: resets to page 0 | Same | Same |
| Accessibility labels (§12) | Automated `aria-label`/`aria-current` assertion per control | Same | Same, plus `aria-live="polite"` on current-page-report |
| Templates/slots (§11) | Component: icon-override and left/right-content rendering | Component: string/object `template` layout rendering | Component: named-slot rendering, plus breakpoint-object layout if confirmed at implementation time |
| Dependency Boundary | `boundary:validate` (existing) | Same | Same |
| Prime Dependency Boundary | `ceiling:validate` (existing) | Same | Same |
| Provenance | `provenance:validate` (existing, extended per Paginator's manifest entries) | Same | Same |

**`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: visual regression and cross-browser test tooling — same open architectural decision tracked in `docs/architecture/BLUEPRINT_GAPS.md`, not resolved here, not reopened.

---

## 19. Known Framework Divergences

1. **State ownership** (§8): Angular internal-with-one-way-input vs. React fully-controlled-no-fallback vs. Vue internal-with-full-v-model — a genuine three-way divergence, more pronounced than Table's own two/three-way state-ownership split, because Paginator's divergence produces **observably different behavior**, not just different mechanism, when a consumer fails to update bound state.
2. **Two-way binding support**: only Vue (`v-model:first`/`v-model:rows`) and, functionally, Angular's internal-state-persists-until-reconciled behavior offer any form of "the UI advances even if the parent is slow to react" — React offers none.
3. **Template/slot API shape**: Angular's discrete per-slot `@Input()`s vs. React/Vue's polymorphic `template` string/object prop (Vue's confirmed to also support a breakpoint-object form; React's parity with that specific feature unconfirmed).
4. **Rows-per-page-options `showAll` convenience**: confirmed in Angular's real source only this pass; React/Vue parity unconfirmed.

None of these divergences are defects or reconciliation targets — each is the framework-appropriate implementation of a shared *concept*, matching the Table spec's own established standard for preserving genuine per-framework differences.

---

## 20. Open Decisions / Explicitly Deferred Items

### Already decided by this spec (restated, not reopened)

State-ownership model per framework (§8, matches real upstream exactly per framework, no forced symmetry); page-link display math as framework-native pseudocode-shared-not-code-shared (§9); no new `uix-data` primitive (confirmed, §5).

### Genuinely open, requiring implementation-time verification (ordinary detail resolvable from source during implementation)

- Whether React/Vue support PrimeNG's `rowsPerPageOptions` `showAll` object-in-array convention (§10).
- Whether React's `template` prop supports the same breakpoint-object responsive-layout convention confirmed in Vue (§11).
- `aria-current="page"` presence in React's and Vue's page-link sub-components (§12).
- `aria-live` presence on Angular's and React's current-page-report elements (§12).
- Root-element semantic tag (`<nav>` vs. generic container) for Angular and React (§12).
- Exact Ultimate Select/InputNumber-equivalent component names Paginator's rows-per-page/jump-to-page controls will depend on (§17) — check existing `packages/ng/src`, `packages/react/src`, `packages/vue/src` for an already-shipped equivalent before assuming new components must be built first.
- Exact design-token consumption in Paginator's style module (§15).
- Package export-map granularity per framework (§17).

### Explicitly deferred (not blocking Paginator implementation start)

- Table's own composition wiring (already specified in the Table spec §14; not re-derived here).
- Scroller's own spec (separate future document; tracked as the second of Table's two composition dependencies).
- DataView's own spec (reuses Paginator's field names per the first Table research report §6, not investigated further here).

---

## 21. Acceptance Criteria

- [ ] Paginator's public API is defined per framework, matching §4, with no invented cross-framework contract beyond what §5 lists as genuinely shared.
- [ ] `uix-data`'s `PaginationState` and `getPageCount` are the only shared-package dependency — zero new `uix-data` export, and `getPageCount` is called rather than re-inlined (closing the three-way duplicate-inline-formula finding, §5).
- [ ] Page-link display math matches the algorithm documented in §9, implemented natively per framework (not imported from a shared package).
- [ ] State-ownership behavior matches §8's per-framework model exactly — Angular's internal `_first` persists across renders until reconciled; React has zero internal state and zero uncontrolled fallback; Vue supports genuine `v-model:first`/`v-model:rows`.
- [ ] Accessibility labels match §12's confirmed cross-framework vocabulary.
- [ ] Every `NEEDS IMPLEMENTATION-TIME VERIFICATION` item in §21 is either resolved with a cited real-source reference during implementation, or explicitly re-flagged in the implementation plan if still unresolved.
- [ ] Provenance manifest entries exist for every Paginator source file per framework, following the existing `originalPath`/`ultimateDestination` schema.

---

## 22. Implementation Sequencing / Dependencies

```text
uix-data (approved, implemented — ADR-043)
    ↓ (sufficient for)
Paginator (this spec)
    ├── requires: uix-data's PaginationState/getPageCount (already available)
    ├── requires: Ultimate's own Select/InputNumber-equivalent components for rows-per-page/jump-to-page controls — NEEDS IMPLEMENTATION-TIME VERIFICATION whether these already exist in packages/{ng,react,vue}/src
    ├── does not require: GAP-018 (confirmed, §17 — Paginator uses component-level dropdown/input controls, not raw native inputs)
    ├── does not require: Table, Scroller, or any other Data-family component
    └── does not require: any new uix-data primitive

Table (docs/superpowers/specs/2026-09-02-table-component-design.md)
    ↑ depends on Paginator (this spec) shipping first, per framework — real composition dependency (Table spec §14, §26)

DataView (future spec)
    ↑ depends on Paginator (this spec) shipping first — reuses Paginator's field names (first Table research report §6), composition mechanism not yet investigated for DataView specifically
```

**No true architectural blocker was found for Paginator.** Its one open implementation-time question (§17, whether Ultimate's own Select/InputNumber-equivalent components already exist) is an ordinary sequencing check, not a fork — if they don't exist yet, that becomes an ordinary prerequisite task in the implementation plan, not a blocked spec.

---

## 23. Consistency Check

- **`@ultimate/uix-data`**: unchanged. No new export, no modified export. `PaginationState`/`getPageCount` consumed exactly as they exist today.
- **ADR-043**: not contradicted. The page-link-math exclusion is reconfirmed, not reopened. The state-ownership-is-framework-owned boundary is reconfirmed and sharpened (§8), not reopened.
- **`docs/architecture/BLUEPRINT_GAPS.md`**: no factual contradiction found. Paginator's `NEEDS ARCHITECTURE DECISION` flag in `COMPONENT_INVENTORY.md` (line 114) is now stale relative to this spec's existence, but `COMPONENT_INVENTORY.md` is not a gap-registry file this spec is authorized to edit, and no BLUEPRINT_GAPS.md entry specifically claims Paginator is unspecified — **not changed by this spec itself**, per the instruction to stop and report rather than silently edit. Flagging here for whoever next updates the component inventory.
- **`ULTIMATE_PLATFORM_BLUEPRINT.md`**: not modified, not contradicted.
- **`docs/superpowers/specs/2026-09-02-table-component-design.md`**: not reopened or contradicted. This spec fulfills, rather than revises, that spec's own stated dependency on a real Paginator component existing (Table spec §14, §26).

No code was written or modified. Only this specification document was created.
