# Scroller — Cross-Framework Component Implementation Specification

**Status:** Draft for review
**References:** `docs/architecture/BLUEPRINT.md`, `docs/architecture/research/2026-09-02-table-data-component-architecture.md`, `docs/architecture/research/2026-09-02-table-editing-grouping-dragdrop-architecture.md`, ADR-043 (`docs/architecture/DECISIONS.md`), `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md`, `docs/superpowers/specs/2026-09-02-table-component-design.md`, `docs/superpowers/specs/2026-09-02-paginator-component-design.md`, `docs/architecture/checksums.json`

**This is a specification, not an implementation plan.** No code, package.json files, or source extraction happens as a result of this document.

**No architectural fork was encountered while preparing this spec.** Every design decision below either restates an already-approved conclusion (ADR-043) or resolves an ordinary implementation-level question directly from real pinned source. Where real evidence was insufficient, the item is marked `NEEDS IMPLEMENTATION-TIME VERIFICATION` rather than invented. Per the user's explicit instruction, the research revealed no new fork, so this document proceeds directly to the full spec rather than stopping.

---

## 1. Status / Purpose / Scope

**Purpose:** Define the implementation-ready design for Ultimate's Scroller (VirtualScroller) component across UltimateNG, UltimateReact, and UltimateVue — the **second and final** of Table's two composition dependencies to receive its own spec (Paginator was the first, already spec'd/reviewed/planned at commit `5074abf`). This spec exists because Table's spec (§14) makes Table's virtualization composition a hard dependency on a real Scroller component existing per framework, and no such spec existed yet (`docs/architecture/COMPONENT_INVENTORY.md` flags Scroller `NEEDS ARCHITECTURE DECISION`, a stale flag: the shared-primitive question was already settled by ADR-043's `calculateNumItemsInViewport`/`calculateLast`; what remained was formalizing the component itself).

**Once this spec is reviewed and planned, both of Table's composition dependencies (Paginator and Scroller) will have complete Spec → Review → Plan gates, and Table's own previously-stopped Implementation Plan can finally proceed with a complete dependency picture.**

**Scope:** Scroller only, as a standalone, independently usable component. Table's own composition with Scroller is documented in `docs/superpowers/specs/2026-09-02-table-component-design.md` §14 and is not re-derived here; this spec defines Scroller's own public API, behavior, and implementation requirements so that Table can compose with a real, spec-complete component.

**Out of scope for this spec:**
- Table's own virtualization integration (covered by the Table spec).
- Paginator (already spec'd separately, commit `5074abf`).
- Any new `uix-data` primitive (none is justified — `calculateNumItemsInViewport`/`calculateLast` are already sufficient and unchanged).
- Any consumer other than Table (no other component's composition with Scroller was investigated this pass).

---

## 2. Architectural Baseline

This spec inherits, without modification:

- **`@ultimate/uix-data`** (ADR-043) — Scroller consumes exactly two primitives: `calculateNumItemsInViewport(contentSize, itemSize): number` and `calculateLast(first, numItemsInViewport, numToleratedItems, isColumns?): number`. No new export is added by this spec.
- **Array-bounds clamping against live collection length is excluded from `uix-data`** (explicitly stated in `docs/superpowers/specs/2026-09-01-uix-data-foundation-design.md`'s Function and Type Semantics section: `calculateLast` "does not clamp against a live array length — callers must apply their own bound"). This spec treats that clamp as Scroller's own framework-native implementation logic (§9 — the centerpiece finding of this spec, directly analogous to Paginator's state-ownership divergence being that spec's centerpiece).
- **Table↔Scroller composition** (both Table research reports; Table spec §14) — not reopened. Table depends on this spec's component existing; this spec does not depend on Table.

This spec adds, from targeted real-source verification performed while preparing it:

- Full public API surface for all three frameworks, verified directly against real Prime source (not previously investigated at this depth by either Table research report, which only confirmed *that* composition exists, not Scroller's own internal design).
- The exact framework-native array-bounds-clamping mechanism per framework (§9) — confirmed as a real, load-bearing `getLast()`/`getLast`/`getLast()` method present nearly identically in all three, but genuinely requiring live `items`/`props.items`/`this.items` state, exactly as the uix-data spec's exclusion predicted.
- A confirmed, cross-framework **absence** of any ARIA/`role` attribute on Scroller's scroll container in any of the three real implementations (§13) — a genuine accessibility gap in the upstream libraries themselves, not an Ultimate omission, and not merely unconfirmed (as several Paginator accessibility items were) but positively confirmed absent by direct source inspection.
- Confirmation that Scroller has **no dependency on GAP-018 or any Select/InputNumber-equivalent component** (§17) — unlike Paginator, Scroller has zero dropdown/select controls of any kind; it is a pure scroll-container/virtualization component.

---

## 3. Component Responsibilities

Scroller is a generic, content-agnostic virtualized-rendering container. Confirmed identical responsibility set across all three real Prime implementations:

- Render only the subset of `items` that fits the current viewport (plus a tolerance buffer), using `itemSize` and the container's measured content dimensions.
- Recompute the visible window (`first`/`last`) on scroll, resize, and `items`/`itemSize`/`scrollHeight`/`scrollWidth` changes.
- Support `vertical`, `horizontal`, and `both` (2D grid) orientations.
- Optionally trigger a lazy-load callback when the visible window changes, so a consumer can fetch/replace `items` on demand.
- Provide public `scrollTo`/`scrollToIndex`/`scrollInView` methods for programmatic scroll control.
- Optionally render a loading state (spinner or custom template) while `loading`/`lazy` state is active.

Scroller is explicitly **not** responsible for: selection, sorting, filtering, pagination (Paginator's job), item-identity/`dataKey` concepts, or any Table-specific concern. It has zero awareness of any of `uix-data`'s identity/selection/sort/filter/pagination primitives — only the two virtualization functions apply.

---

## 4. Public API by Framework

Following each framework's own idiom, per the same naming-precedent rule established in the Table and Paginator specs: Prime-recognizable vocabulary preserved where the concept is genuinely shared; component-level public API naming is not finalized by this spec.

### 4.1 UltimateNG (Angular)

`@Input()`/`@Output()` surface, matching PrimeNG's real `scroller.ts` (verified in full, 1247 lines):

- `items: any[] | undefined | null`
- `itemSize: number[] | number = 0` (array form `[rowHeight, colWidth]` used when `orientation === 'both'`)
- `scrollHeight: string | undefined`, `scrollWidth: string | undefined`
- `orientation: 'vertical' | 'horizontal' | 'both' = 'vertical'`
- `step: number = 0` (page-like grouping for lazy-load batching — distinct from Paginator's `rows`; see §9's lazy-load discussion)
- `delay: number = 0` (scroll-event debounce before recomputing the window), `resizeDelay: number = 10`
- `numToleratedItems: any` (buffer item count outside the viewport; defaults to half the viewport count when unset — computed internally, not a fixed default)
- `appendOnly: boolean = false` (append-only mode: items are never removed from the DOM, only added — explicit warning in source: "Using very large data may cause the browser to crash")
- `inline: boolean = false`
- `lazy: boolean = false`, `loading: boolean | undefined`
- `disabled: boolean = false` (when true, Scroller is a pure passthrough — renders `<ng-content>`/the content template directly with zero virtualization, confirmed at `scroller.ts:52,89-94`)
- `loaderDisabled: boolean = false`, `showLoader: boolean = false`, `showSpacer: boolean = true`
- `columns: any[] | undefined | null` (for `horizontal`/`both` orientation column virtualization)
- `autoSize: boolean = false`
- `trackBy: Function` (Angular `*ngFor` trackBy function, defaults to object-identity)
- `options: ScrollerOptions | undefined` — a single object that can carry any of the above props plus per-instance override of the three output-equivalent callback names (`scroller.ts:353-363`); setting `options` mutates the matching individual `_`-prefixed internal fields
- `@Output() onLazyLoad: EventEmitter<ScrollerLazyLoadEvent>`
- `@Output() onScroll: EventEmitter<ScrollerScrollEvent>`
- `@Output() onScrollIndexChange: EventEmitter<ScrollerScrollIndexChangeEvent>`
- **Public methods** (callable via `@ViewChild`, confirmed real, not internal-only): `scrollTo(options: ScrollToOptions)`, `scrollToIndex(index: number | number[], behavior?: ScrollBehavior)`, `scrollInView(index: number, to: ScrollerToType, behavior?: ScrollBehavior)`, `getElementRef()`, `getRenderedRange()`.

**Template customization** (Content children): `content`, `item`, `loader`, `loadericon` — confirmed at `scroller.ts:444-476`, all `@ContentChild(...)`-based.

### 4.2 UltimateReact (React)

Functional-component props, matching PrimeReact's real `VirtualScroller.js`/`VirtualScrollerBase.js` (verified in full, 805 + 101 lines):

- `items: any[] | null = null`
- `itemSize: number | number[] = 0`
- `scrollHeight`, `scrollWidth: string | null = null`
- `orientation: 'vertical' | 'horizontal' | 'both' = 'vertical'`
- `step: number = 0`, `delay: number = 0`, `resizeDelay: number = 10`
- `numToleratedItems: number | null = null`
- `appendOnly: boolean = false`, `inline: boolean = false`
- `lazy: boolean = false`, `loading: boolean | undefined = undefined`
- `disabled: boolean = false`
- `loaderDisabled: boolean = false`, `showLoader: boolean = false`, `showSpacer: boolean = true`
- `columns: any[] | null = null`
- `autoSize: boolean = false`
- `loadingIcon`, `loadingTemplate`, `loaderIconTemplate`, `itemTemplate`, `contentTemplate: ReactNode | function`
- `onScroll`, `onScrollIndexChange`, `onLazyLoad: (event) => void`
- **State ownership** (verified, `VirtualScroller.js:19-25`): `firstState`, `lastState`, `pageState`, `numItemsInViewportState`, `numToleratedItemsState`, `loadingState`, `loaderArrState` are all real internal `React.useState` hooks — **genuinely different from Paginator's React implementation**, which has zero internal state for its equivalent fields (Paginator spec §8). Scroller's `items`/`itemSize`/every other prop is read directly from `props` every render (fully controlled, no internal duplication) but the *derived* virtualization window (`first`/`last`/`numItemsInViewport`) is internally owned and updated via `setFirstState`/`setLastState`/etc. in response to scroll/resize events — there is no `onFirstChange`-equivalent callback and no way for a parent to control `first`/`last` directly the way Paginator's parent controls `first`/`rows`. This is a fundamentally different state-ownership shape from Paginator's, not a variation of the same pattern: **Scroller is controlled for its input data but uncontrolled for its derived scroll-position window.**
- **Public methods** (via `React.useImperativeHandle`, `VirtualScroller.js:625-632`): `getElementRef`, `scrollTo`, `scrollToIndex`, `scrollInView`, `getRenderedRange` — confirmed identical method-name set to Angular's public API.

### 4.3 UltimateVue (Vue)

Options-API props + internal reactive data, matching PrimeVue's real `VirtualScroller.vue`/`BaseVirtualScroller.vue` (verified in full, 713 + 101 lines):

- `items: Array = null`
- `itemSize: [Number, Array] = 0`
- `scrollHeight`, `scrollWidth: null`
- `orientation: String = 'vertical'`
- `numToleratedItems: Number = null`
- `delay: Number = 0`, `resizeDelay: Number = 10`
- `lazy: Boolean = false`
- `disabled: Boolean = false`
- `loaderDisabled: Boolean = false`
- `columns: Array = null`
- `loading: Boolean = false`
- `showSpacer: Boolean = true`, `showLoader: Boolean = false`
- `tabindex: Number = 0`
- `inline: Boolean = false`
- `step: Number = 0`, `appendOnly: Boolean = false`, `autoSize: Boolean = false`
- `emits: ['update:numToleratedItems', 'scroll', 'scroll-index-change', 'lazy-load']` (`VirtualScroller.vue:55`) — **only `numToleratedItems` has a `v-model`-compatible `update:` emit; `first`/`last`/`page` do not.** This is a real, confirmed difference from what a reader might assume from Paginator's `v-model:first`/`v-model:rows` precedent — Vue's Scroller does **not** offer `v-model:first`.
- **State ownership** (verified, `VirtualScroller.vue:56-71`): `first`, `last`, `page`, `numItemsInViewport`, `lastScrollPos`, `d_numToleratedItems`, `d_loading`, `loaderArr`, `spacerStyle`, `contentStyle` are all `data()` reactive fields, internally owned, synced from props via `watch` handlers for the handful of props that need reconciliation (`numToleratedItems`, `loading`, `items`, `itemSize`, `orientation`, `scrollHeight`, `scrollWidth` — `VirtualScroller.vue:86-118`). Matches React's "controlled input, internally-owned derived window" shape structurally, expressed through Vue's own reactive-data-plus-watchers idiom rather than React's `useState`.
- Named slots: `content`, `item`, `loader`, `loadingicon` — confirmed at `VirtualScroller.vue:1-43`.
- **Public methods** (confirmed real instance methods under `methods:`, `VirtualScroller.vue:134-...`): `scrollTo`, `scrollToIndex`, `scrollInView` — same method-name set as Angular/React. `getRenderedRange` also present (verified via grep; not read line-by-line this pass — `NEEDS IMPLEMENTATION-TIME VERIFICATION` for its exact return shape parity with Angular/React, though the method's existence and name are confirmed).

---

## 5. Shared Concepts vs Framework-Native Concepts

| Concept | Status | Source |
|---|---|---|
| `calculateNumItemsInViewport` | **Shared** — `uix-data` | ADR-043; consumed identically in all three real `calculateNumItems()`/`calculateNumItems`/`calculateNumItems` methods (`scroller.ts:856`; `VirtualScroller.js:187`; `VirtualScroller.vue:290`) — each framework's real source re-derives the identical formula inline rather than importing a shared function, same duplication pattern already found and closed by the Paginator spec's `getPageCount` finding (§5 there) |
| `calculateLast` | **Shared** — `uix-data` | ADR-043; consumed identically in all three real `calculateOptions()` methods (`scroller.ts:872`; `VirtualScroller.js:200`; `VirtualScroller.vue:304`) — same re-inlining-instead-of-importing pattern, same closure opportunity |
| Array-bounds clamp (`getLast`) | **Framework-native** (excluded from `uix-data` by design) | §9 — requires live `items`/`props.items`/`this.items` state; confirmed present nearly identically in all three, but genuinely component-state-coupled, not pure |
| Orientation-driven shape branching (`vertical`/`horizontal`/`both`) | **Strongly convergent concept, framework-native implementation** | §4, §8 — same three-value vocabulary and same `{rows, cols}`-shaped state for `both` orientation in all three, each independently implemented |
| Public method names (`scrollTo`/`scrollToIndex`/`scrollInView`/`getRenderedRange`) | **Strongly convergent naming, framework-native implementation** | §4 — identical method-name vocabulary confirmed in all three, each a real per-framework implementation, not a shared function |
| Derived scroll-window state ownership (`first`/`last`/`numItemsInViewport`) | **Framework-native, genuinely divergent from Paginator's pattern** | §4.2, §4.3 — Angular and Vue both use internal component state; React uses internal `useState`; **none** of the three offer any two-way-binding/`v-model`/`Change`-output for these fields, unlike Paginator |
| Accessibility (`role`/`aria-*`) | **Confirmed absent in all three upstream implementations** | §13 — a genuine gap, not a framework divergence to reconcile |

No item in this table requires a new `uix-data` export.

---

## 6. Identity and Selection

Not applicable. Scroller has no item-identity or selection concept in any of the three real implementations — confirmed by the full read of all three main component files (§4); no `dataKey`, no `equals`, no selection-related prop or method exists anywhere in Scroller's real source. `trackBy` (Angular only, `*ngFor` optimization) is a rendering-performance concern, not an identity concern in the `uix-data` sense — it defaults to object-identity comparison, not `dataKey`-based equality.

---

## 7. Sorting / Filtering

Not applicable. Scroller has no sort or filter concept. (Section numbered for structural parity with the Table/Paginator specs' section lists where a concept applies; omitted here where confirmed absent from real source rather than filled with invented content.)

---

## 8. Pagination

Not applicable in the `PaginationState`/`getPageCount` sense — Scroller has no `first`/`rows`/`totalRecords` pagination concept. It does have an internal `page`/`getPageByFirst` concept (Angular `scroller.ts:729-731`; React `VirtualScroller.js:64-66`; Vue confirmed via its `page`/`both ? {rows,cols} : 0`-shaped `data()` field), but this is a **lazy-load batching page**, unrelated to Paginator's page: it groups virtualization windows into `step`-sized chunks purely to throttle how often `onLazyLoad` fires (§10), not a user-facing pagination UI concept. Do not conflate Scroller's internal `page` with Paginator's `PaginationState`/`page` — they share a name by upstream-library coincidence, not a shared contract.

---

## 9. Virtualization — Array-Bounds Clamping (Core of This Spec)

This is Scroller's central architectural question, directly analogous to Paginator's state-ownership divergence (Paginator spec §8) as the centerpiece finding of that spec. `uix-data`'s `calculateLast` explicitly excludes the final clamp against a live collection's actual length — this section documents exactly how each framework performs that clamp in real source, confirming the uix-data spec's exclusion was correct and load-bearing, not merely cautious.

| Framework | Clamp method | Real signature | Confirmed at |
|---|---|---|---|
| Angular | `getLast(last = 0, isCols = false)` | `return this._items ? Math.min(isCols ? (this._columns \|\| this._items[0]).length : this._items.length, last) : 0;` | `scroller.ts:925-927` |
| React | `getLast(last = 0, isCols)` | `return props.items ? Math.min(isCols ? (props.columns \|\| props.items[0])?.length \|\| 0 : (props.items \|\| []).length, last) : 0;` | `VirtualScroller.js:251-253` |
| Vue | `getLast(last = 0, isCols)` | `return this.items ? Math.min(isCols ? (this.columns \|\| this.items[0])?.length \|\| 0 : this.items?.length \|\| 0, last) : 0;` | `VirtualScroller.vue:358-360` |

**Observed fact:** all three implementations are near-textually-identical — `Math.min(<live collection length>, <uix-data's calculateLast output>)`, with `0` as the fallback when `items` is absent. `calculateOptions()`/`calculateOptions`/`calculateOptions` (Angular `scroller.ts:870-879`; React `VirtualScroller.js:198-207`; Vue `VirtualScroller.vue:300-...`) all call `calculateLast` (the local closure wrapping `uix-data`'s pure formula) and immediately pass its result through `getLast()` before storing it as the component's real `last` state.

**Architectural inference:** this is not a framework divergence to document per-framework — it is the **same real dependency-on-live-state** in all three, which is exactly why `uix-data`'s spec excluded it. The near-identical implementation across all three frameworks is *itself* evidence the uix-data authors correctly identified the boundary: the formula (`Math.min`) is trivial and shared in spirit, but the inputs (`this._items.length`/`props.items.length`/`this.items?.length`) are unavoidably live component state, which is exactly the class of thing `uix-data`'s Ownership Boundaries (per the uix-data spec) keeps out of the shared package.

**Ultimate implication:** each framework's Scroller implementation should include this exact clamp as its own local method (matching the real Prime pattern of independent reimplementation rather than a shared utility), calling `uix-data`'s `calculateLast` first and then clamping the result against the framework's own live `items` reference. **This does not require a `uix-data` change** — the existing exclusion is reconfirmed, not reopened, with concrete evidence this pass adds beyond what the uix-data spec's original prose asserted.

---

## 10. Lazy-Loading Mechanics

Confirmed present and structurally identical in all three frameworks:

- `lazy: boolean` gates the feature; `step: number` (default `0`, meaning "no batching, fire on every window change") groups virtualization-window changes into fixed-size batches before firing `onLazyLoad`/`onLazyLoad`/`lazy-load`.
- `getPageByFirst(first)` (Angular `scroller.ts:729-731`; React `VirtualScroller.js:64-66`; Vue confirmed present via grep, not read line-by-line — `NEEDS IMPLEMENTATION-TIME VERIFICATION` for Vue's exact formula, though the concept's presence is confirmed) computes `Math.floor((first + numToleratedItems * 4) / (step || 1))` — this is the "batching page," distinct from Paginator's user-facing page (§8).
- `isPageChanged(first)` gates whether a new `onLazyLoad` event actually fires — if `step` is unset (`0`), every scroll-triggered window change fires lazy-load; if `step` is set, only a batching-page boundary crossing fires it.
- The lazy-load event payload is `{first, last}` (window bounds, batched by `step` when set), confirmed identical shape in Angular (`scroller.ts:891-897`) and React (`VirtualScroller.js:213-222`); Vue's exact payload shape was not independently re-verified this pass — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**, though the `lazy-load` emit name itself is confirmed (`VirtualScroller.vue:55`).
- Lazy-load firing is deferred via `Promise.resolve().then(...)` in all three (a microtask-queue deferral, not `setTimeout`), confirmed identical in Angular (`scroller.ts:890`) and React (`VirtualScroller.js:214`); Vue's exact deferral mechanism for this specific call site was not independently re-verified — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**.

**Classification:** strongly convergent mechanism (same debounce/batching concept, same event shape, same deferral pattern where confirmed), framework-native implementation (each is real component-internal logic, not a candidate for `uix-data` — it requires live scroll-position state to determine when a "page" boundary is crossed, the same class of exclusion as §9's array-bounds clamp).

---

## 11. `scrollTo` / `scrollToIndex` / `scrollInView` Public API

Confirmed present with identical method names and near-identical signatures in all three real implementations (§4):

- `scrollTo(options: ScrollToOptions)` — thin wrapper around the native `Element.scrollTo()` DOM method, confirmed in all three.
- `scrollToIndex(index: number | number[], behavior?: ScrollBehavior = 'auto')` — computes the target scroll position from `index * itemSize` (plus content-position offset) and calls `scrollTo`. Accepts a two-element array `[rowIndex, colIndex]` when `orientation === 'both'`, confirmed identical branching logic in Angular (`scroller.ts:742-776`) and React (`VirtualScroller.js:81-102`); Vue's exact branching was confirmed present via grep at the same method name but not read to the same line-level depth — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`** for full parity confirmation, though the method's existence, name, and general purpose are confirmed.
- `scrollInView(index: number, to: ScrollerToType, behavior?: ScrollBehavior = 'auto')` — scrolls only if the target index is currently outside the rendered range (`'to-start'`/`'to-end'` variants), confirmed identical in Angular (`scroller.ts:778-815`) and React (`VirtualScroller.js:104-139`); Vue confirmed present, not independently re-verified line-by-line this pass — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**.
- `getRenderedRange()` — returns `{first, last, viewport: {first, last}}`, confirmed identical shape in Angular (`scroller.ts:817-850`) and React (`VirtualScroller.js:153-181`); Vue confirmed present by name, exact return shape not independently re-verified — **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**.

**Classification:** strongly convergent public API surface — same method names, same general behavior, framework-native implementation (DOM-coupled, cannot be a shared pure function). This is Scroller's most stable cross-framework contract at the *naming* level, even though none of it is implementable as shared code.

---

## 12. Templates / Slots / Render Customization

Confirmed present in all three, structurally similar:

- **Angular**: `content`, `item`, `loader`, `loadericon` content-child templates (`scroller.ts:444-476`).
- **React**: `contentTemplate`, `itemTemplate`, `loadingTemplate`, `loaderIconTemplate` props (function-or-node, `VirtualScrollerBase.js:89-92`).
- **Vue**: `content`, `item`, `loader`, `loadingicon` named slots (`VirtualScroller.vue:4-36`).

**Classification:** strongly convergent concept (same four customization points — content wrapper, per-item, loader, loader icon), framework-native API shape (Angular content-children vs. React function-props vs. Vue named slots — matching the same pattern already established for Paginator's and Table's own template/slot sections). No shared package concern.

---

## 13. Accessibility and Keyboard Behavior

**Confirmed absent across all three real implementations**, not merely unconfirmed:

- **No `role` attribute** on Scroller's root scroll container in any framework — Angular's template (`scroller.ts:53`: `<div #element ... [class]="cn(cx('root'), styleClass)" ...>`), React's `rootProps` (`VirtualScroller.js:783-793`), and Vue's template (`VirtualScroller.vue:3`: `<div :ref="elementRef" :class="containerClass" ...>`) all render a plain `<div>` with zero `role`/`aria-*` binding anywhere in the file. Exhaustive grep for `role=`/`aria-` across all three main component files returned **zero matches** in Angular and React; Vue's template was read directly and confirmed to carry no `role`/`aria-*` binding either.
- **No keyboard-navigation handler** — no dedicated keydown listener was found in any of the three real Scroller implementations. Scroller relies entirely on native scroll-container tab-order/scroll-wheel/touch behavior; it does not implement arrow-key or Page-Up/Page-Down virtualization-aware scrolling itself (a consumer like Table, which does have dedicated keyboard grid-navigation per the Table spec §15, must handle this at the Table level, not expect Scroller to provide it).
- **No live-region** (`aria-live`) anywhere in Scroller's real source, unlike Paginator's confirmed Vue `aria-live="polite"` current-page-report (Paginator spec §12) — Scroller has no equivalent "N of M" status text concept at all.

**Classification:** this is a genuine, confirmed accessibility gap in the upstream Prime libraries themselves, not a framework divergence needing reconciliation and not an item to mark `NEEDS IMPLEMENTATION-TIME VERIFICATION` (the absence is positively confirmed, not merely unchecked). **Ultimate implication:** Scroller's own implementation should add, at minimum, an ARIA live-region announcing loading state changes (`aria-busy` on the container while `loading`/`d_loading` is true is the most direct, evidence-adjacent starting point, since `loading` state already exists as a real prop/field in all three) and should document that any richer virtualized-list accessibility pattern (e.g. `aria-rowcount`/`aria-setsize` for a virtualized grid) is a genuine Ultimate improvement over upstream, not a source-verified requirement — flagged as an open decision (§20), not silently invented as if it were already-confirmed Prime behavior.

---

## 14. Events and State Ownership

Restated from §4, consolidated:

- **Angular**: `onLazyLoad`, `onScroll`, `onScrollIndexChange` outputs; internal `first`/`last`/`page`/`numItemsInViewport` fields (plain class properties, not getter/setter-backed the way Paginator's `first` is) — no `Change` output for any of them.
- **React**: `onLazyLoad`, `onScroll`, `onScrollIndexChange` callback props; internal `useState` for `firstState`/`lastState`/`pageState`/`numItemsInViewportState` — `items` itself is fully controlled (read from `props` every render), but the derived scroll window is unconditionally internal, with **no callback-based override path** the way Paginator's `onPageChange` is the *only* path to state change. This is architecturally different from Paginator's "controlled, no fallback" model — Scroller is **"controlled input, uncontrolled derived output,"** a third distinct state-ownership shape not previously catalogued by either the Table or Paginator specs.
- **Vue**: `update:numToleratedItems`, `scroll`, `scroll-index-change`, `lazy-load` emits; internal `data()` reactive fields for `first`/`last`/`page`/`numItemsInViewport`, watcher-synced only for the props that need reconciliation (not `first`/`last` themselves, since those aren't props at all — they're purely derived/internal). **No `v-model:first` exists**, unlike Paginator's confirmed `v-model:first`/`v-model:rows`.

**Ultimate implication:** each framework's Scroller implementation should match its own real upstream model exactly. Consumers (including Ultimate's own future Table implementation) must not expect any two-way binding on `first`/`last`/the visible window in any framework — Scroller's scroll position is read via `getRenderedRange()`/the `onScrollIndexChange` event, never set directly except through `scrollTo`/`scrollToIndex`/`scrollInView`.

**This does not require a `uix-data` change.** The virtualization functions describe pure windowing math, not ownership of the resulting state — ownership was already implicitly excluded from `uix-data`'s scope by the same Ownership Boundaries principle applied to Paginator's pagination state and Table's selection/sort/filter state (per ADR-043 and the uix-data spec). This finding sharpens, but does not contradict, that existing exclusion.

---

## 15. Styling / Theming Integration

Inherits Ultimate's existing theming/styling infrastructure (`uix-styled`, `uix-styles-components`, `uix-styles-full`, `uix-motion` — already implemented, out of this spec's scope to re-describe). PrimeNG's real source confirms a dedicated style module (`ScrollerStyle`, imported from `./style/scrollerstyle`, `scroller.ts:39,575`) — the same per-component style-module pattern already established by Phase 1's foundation-tier components and reused by both the Table spec (§18) and the Paginator spec (§14). PrimeVue's real source confirms the identical pattern (`VirtualScrollerStyle`, `BaseVirtualScroller.vue:3,90`). Scroller's Ultimate implementation follows the same pattern. **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: exact design-token names, deferred to implementation planning against the already-existing token infrastructure — check `.vendor-extracted/uix-styles-components/src/` for a pre-ported `scroller`/`virtualscroller` token set before assuming one must be authored from scratch (the Paginator implementation plan found a real pre-ported `paginator` token file this way; the same check applies here).

---

## 16. Performance Considerations

- Scroller's entire purpose is a performance optimization — rendering only a bounded window of items regardless of `items.length` magnitude. Its own internal computation (`calculateNumItemsInViewport`, `calculateLast`, `getLast`) is O(1) per scroll/resize event — trivial.
- The `delay`/`resizeDelay` debounce mechanism (confirmed identical purpose in all three: avoid recomputing the window on every single scroll/resize event) is itself a performance feature, not a correctness concern — document it as such, do not treat missing debounce as a defect if an implementation-time simplification omits it for a first pass (flagged as an open decision, §20, not a hard requirement).
- `trackBy` (Angular), key-based reconciliation (React's `key={options.index}`, confirmed `VirtualScroller.js:707`), and Vue's `:key="index"` (confirmed `VirtualScroller.vue:22`) all exist specifically to avoid unnecessary DOM node recreation during virtualization — a real, load-bearing performance mechanism in all three, not an incidental convenience.
- Record `dist/` size and gzip size after implementation, consistent with every other UIX/component package's existing performance-baseline recording practice.
- **This is Scroller's single most performance-critical component in the entire Data family** (per both prior Table research reports' composition findings — Table, TreeTable, and any future DataView virtual-scroll mode all depend on Scroller's correctness and performance) — implementation-time performance testing (large `items` arrays, rapid scroll events) is a genuine requirement, not optional polish, though the specific benchmark methodology is deferred to the implementation plan.

---

## 17. Package Boundaries / Exports

Scroller belongs in each framework's own component package (`ng`/`react`/`vue`), following the same dependency direction as Table and Paginator (`docs/architecture/PACKAGE_ARCHITECTURE.md`):

```text
Framework Components (Scroller, this spec)
        down to
Framework Core (ng-core / react-core / vue-core)
        down to
UltimateUIX (uix-data, uix-utils, uix-styled, uix-styles, uix-motion)
```

- Scroller depends on `@ultimate/uix-data` for exactly `calculateNumItemsInViewport` and `calculateLast` — no other `uix-data` primitive applies (no identity, selection, sort, filter, or pagination concept exists in Scroller).
- Scroller has **no dependency on GAP-018** (Angular's `BaseModelHolder`/`BaseInput` tier) — confirmed by full source read of all three frameworks: Scroller has zero dropdown, select, input, or any other form-control child component of any kind. This is a stronger, cleaner "no dependency" finding than Paginator's (which did depend on Ultimate's own future Select/InputNumber-equivalents for its rows-per-page controls) — Scroller has no such controls at all.
- Scroller has **no dependency on Table, Paginator, or any other Data-family component** — it is a leaf dependency in the composition graph, identical in this respect to Paginator (Table depends on Scroller; Scroller depends on nothing Data-family-specific).
- No new `uix-*` package is introduced by this spec.
- Export surface: **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**, same as the Table and Paginator specs' equivalent items — deferred to implementation-plan-level detail.

---

## 18. Provenance and Licensing

- Scroller's real upstream source is PrimeNG 21.1.9 (`scroller.ts`, commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`), PrimeReact 10.9.9 (`VirtualScroller.js`/`VirtualScrollerBase.js`, commit `d0f574e39122668292fc7a740f081bae1b93b1e9`), PrimeVue 4.5.5 (`VirtualScroller.vue`/`BaseVirtualScroller.vue`, commit `66dde6788220fc9e6822342919d1ceb0e3460ece`) — all three pinned and sha256-verified per `docs/architecture/checksums.json`, same pins used throughout the Table spec, Paginator spec, and both research reports.
- Provenance manifest entries follow the existing `originalPath`/`ultimateDestination` schema (direct per-framework adaptation of a real upstream file each), matching Phase 1/2's existing component provenance pattern and the Table/Paginator specs' own provenance approach — not `uix-data`'s `verifiedAgainst` schema, since Scroller (unlike `uix-data`'s cross-framework-synthesized primitives) is a direct per-framework component adaptation.
- License: MIT, inherited from PrimeNG/PrimeReact/PrimeVue, per the existing `THIRD-PARTY-NOTICES.md` pattern.
- **`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: exact per-file provenance manifest entries (line-range citations) are an implementation-time artifact.

---

## 19. Testing / Verification Matrix

| Area | Angular | React | Vue |
|---|---|---|---|
| `calculateNumItemsInViewport`/`calculateLast` consumption | Unit: confirms both imports used, not re-inlined (closing the same duplication pattern found and closed for Paginator's `getPageCount`) | Same | Same |
| Array-bounds clamp (`getLast`, §9) | Unit: known-input/known-output table, including the case where `calculateLast`'s output exceeds `items.length` | Same | Same |
| Orientation branching (§4, §8) | Component: `vertical`/`horizontal`/`both` each render the correct subset of `items`/`{rows,cols}`-shaped state | Same | Same |
| Lazy-load batching (§10) | Component: `step` unset fires `onLazyLoad` on every window change; `step` set only fires on batch-boundary crossing | Same | Same |
| `scrollTo`/`scrollToIndex`/`scrollInView` (§11) | Component: each method produces the expected scroll-position call | Same | Same |
| State-ownership behavior (§14) | Component: verify internal `first`/`last` update on scroll without requiring any parent callback | Component: verify `firstState`/`lastState` update via internal `useState`, confirm no controlled-override path exists | Component: verify internal `data()` fields update; confirm no `v-model:first` exists |
| `disabled` passthrough mode | Component: renders content directly with zero virtualization, zero window computation | Same | Same |
| Accessibility (`aria-busy` during loading, §13) | Automated assertion once implemented (this is a new Ultimate addition, not upstream-sourced — test what Ultimate actually implements, not what Prime provides) | Same | Same |
| Templates/slots (§12) | Component: content/item/loader/loadericon rendering | Component: function-or-node template rendering | Component: named-slot rendering |
| Dependency Boundary | `boundary:validate` (existing) | Same | Same |
| Prime Dependency Boundary | `ceiling:validate` (existing) | Same | Same |
| Provenance | `provenance:validate` (existing, extended per Scroller's manifest entries) | Same | Same |

**`NEEDS IMPLEMENTATION-TIME VERIFICATION`**: visual regression, cross-browser test tooling, and large-dataset performance benchmarking methodology — same open architectural decision tracked in `docs/architecture/BLUEPRINT_GAPS.md`, not resolved here, not reopened.

---

## 20. Known Framework Divergences

1. **Derived scroll-window state ownership** (§14): a genuine three-way divergence, distinct from Paginator's own three-way divergence — Angular (plain internal fields, no getter/setter, no `Change` output), React (`useState`, controlled input but uncontrolled derived output — a shape not previously catalogued), Vue (`data()` reactive fields, watcher-synced only for reconcilable props, no `v-model:first`).
2. **No two-way binding of any kind for `first`/`last`** in any framework — a stronger statement than Paginator's own divergence (where Vue at least offered `v-model:first`/`v-model:rows`); Scroller offers none of the three frameworks any way to externally set the visible window except through `scrollTo`/`scrollToIndex`/`scrollInView`.
3. **Confirmed absence of accessibility semantics** in all three upstream implementations — not a divergence between frameworks (they agree, by omission) but a genuine gap relative to Paginator's confirmed `aria-label`/`aria-current` vocabulary.
4. **Template/slot API shape**: Angular's content-children vs. React's function-or-node props vs. Vue's named slots — the same pattern already established for Paginator and Table, not a new finding, restated here for completeness.
5. **Vue's `getRenderedRange`, `scrollToIndex`, `scrollInView` exact internal branching** was confirmed present by name/grep but not read to the same line-level depth as Angular's and React's equivalents this pass — flagged `NEEDS IMPLEMENTATION-TIME VERIFICATION` rather than assumed identical.

None of these divergences are defects or reconciliation targets — each is the framework-appropriate implementation of a shared *concept*, matching the Table and Paginator specs' own established standard for preserving genuine per-framework differences.

---

## 21. Open Decisions / Explicitly Deferred Items

### Already decided by this spec (restated, not reopened)

Array-bounds clamping as framework-native, requiring live state, correctly excluded from `uix-data` (§9, confirms rather than extends the existing uix-data exclusion); state-ownership model per framework (§14, matches real upstream exactly per framework, no forced symmetry); no new `uix-data` primitive (confirmed, §5); no GAP-018 dependency (confirmed, §17, a cleaner finding than Paginator's own GAP-018-adjacent Select/InputNumber dependency).

### Genuinely open, requiring implementation-time verification (ordinary detail resolvable from source during implementation)

- Vue's exact `getPageByFirst`/`scrollToIndex`/`scrollInView`/`getRenderedRange` internal branching, confirmed present by name but not read line-by-line to the same depth as Angular/React (§4.3, §10, §11).
- Exact lazy-load event payload shape for Vue (§10).
- Exact design-token consumption in Scroller's style module (§15) — check `.vendor-extracted/uix-styles-components/src/` for a pre-ported token set first.
- Package export-map granularity per framework (§17).
- Exact per-file provenance manifest line-range citations (§18).

### New Ultimate-authored accessibility addition (not upstream-sourced — a genuine open design question, not a source-verification gap)

- Whether Ultimate's Scroller implementation should add `aria-busy` during loading state, richer virtualized-grid ARIA attributes (`aria-rowcount`/`aria-setsize`), or defer all accessibility improvement to the Table-level consumer (which does have its own confirmed keyboard/ARIA requirements per the Table spec §15) — flagged here as a real open question requiring a decision during implementation planning, distinct from every other `NEEDS IMPLEMENTATION-TIME VERIFICATION` item in this document (those are "verify what Prime does"; this one is "decide what Ultimate should add beyond Prime").

### Explicitly deferred (not blocking Scroller implementation start)

- Table's own composition wiring (already specified in the Table spec §14; not re-derived here).
- Any other future Scroller consumer's own composition needs (none investigated this pass — Scroller's only confirmed consumer per both Table research reports is Table itself).

---

## 22. Acceptance Criteria

- [ ] Scroller's public API is defined per framework, matching §4, with no invented cross-framework contract beyond what §5 lists as genuinely shared.
- [ ] `uix-data`'s `calculateNumItemsInViewport` and `calculateLast` are the only shared-package dependency — zero new `uix-data` export, and both functions are called rather than re-inlined (closing the same duplicate-inline-formula pattern already closed for Paginator's `getPageCount`).
- [ ] The array-bounds clamp (`getLast`, §9) is implemented natively per framework, calling `calculateLast` first and clamping its result against the framework's own live `items` reference — never attempted as a shared package function.
- [ ] State-ownership behavior matches §14's per-framework model exactly — no invented two-way binding for `first`/`last` in any framework.
- [ ] `scrollTo`/`scrollToIndex`/`scrollInView`/`getRenderedRange` public methods exist with matching names across all three frameworks (§11).
- [ ] Every `NEEDS IMPLEMENTATION-TIME VERIFICATION` item in §20 is either resolved with a cited real-source reference during implementation, or explicitly re-flagged in the implementation plan if still unresolved.
- [ ] The accessibility open decision (§20) is explicitly resolved (with a stated direction, even if the direction is "defer to Table") rather than silently skipped.
- [ ] Provenance manifest entries exist for every Scroller source file per framework, following the existing `originalPath`/`ultimateDestination` schema.

---

## 23. Implementation Sequencing / Dependencies

```text
uix-data (approved, implemented — ADR-043)
    ↓ (sufficient for)
Scroller (this spec)
    ├── requires: uix-data's calculateNumItemsInViewport/calculateLast (already available)
    ├── does not require: GAP-018 or any Select/InputNumber-equivalent component (confirmed, §17 — Scroller has zero form-control children of any kind)
    ├── does not require: Paginator, Table, or any other Data-family component
    └── does not require: any new uix-data primitive

Table (docs/superpowers/specs/2026-09-02-table-component-design.md)
    ↑ depends on Scroller (this spec) shipping first, per framework — real composition dependency (Table spec §14, §26)
    ↑ depends on Paginator (docs/superpowers/specs/2026-09-02-paginator-component-design.md, commit acac505) shipping first — already spec'd/reviewed/planned

TreeTable (future spec, per the first Table research report's taxonomy)
    ↑ likely depends on Scroller shipping first for its own virtual-scroll mode — not investigated further this pass, flagged for whoever specs TreeTable next
```

**No true architectural blocker was found for Scroller.** It has an even cleaner dependency profile than Paginator (§23 there) — Scroller has zero implementation-time prerequisite components at all, unlike Paginator's Select/InputNumber-equivalent gate. Once this spec is reviewed and planned, **both of Table's composition dependencies will be complete**, and Table's own previously-stopped Implementation Plan can proceed.

---

## 24. Consistency Check

- **`@ultimate/uix-data`**: unchanged. No new export, no modified export. `calculateNumItemsInViewport`/`calculateLast` consumed exactly as they exist today.
- **ADR-043**: not contradicted. The array-bounds-clamping exclusion is reconfirmed with concrete cross-framework evidence, not reopened. The state-ownership-is-framework-owned boundary is reconfirmed and sharpened (§14), not reopened.
- **`docs/architecture/BLUEPRINT_GAPS.md`**: no factual contradiction found. Scroller's `NEEDS ARCHITECTURE DECISION` flag in `COMPONENT_INVENTORY.md` is now stale relative to this spec's existence, but `COMPONENT_INVENTORY.md` is not a gap-registry file this spec is authorized to edit, and no `BLUEPRINT_GAPS.md` entry specifically claims Scroller is unspecified — **not changed by this spec itself**, per the instruction to stop and report rather than silently edit. Flagging here for whoever next updates the component inventory (same flag already raised by the Paginator spec for its own entry).
- **`ULTIMATE_PLATFORM_BLUEPRINT.md`** / `docs/architecture/BLUEPRINT.md`: not modified, not contradicted.
- **`docs/superpowers/specs/2026-09-02-table-component-design.md`**: not reopened or contradicted. This spec fulfills, rather than revises, that spec's own stated dependency on a real Scroller component existing (Table spec §14, §26). Composition claims (component/import names) independently re-verified consistent with what Table's spec already asserts.
- **`docs/superpowers/specs/2026-09-02-paginator-component-design.md`**: not reopened or contradicted. Scroller's own state-ownership findings are genuinely different from Paginator's (§14, §20) — this is new, non-conflicting evidence, not a correction to the Paginator spec.

No code was written or modified. Only this specification document was created.
