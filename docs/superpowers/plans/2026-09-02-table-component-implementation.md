# Table Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ultimate's Table component — `UTable` — for Angular (`@ultimate/ng`), React (`@ultimate/react`), and Vue (`@ultimate/vue`), matching each framework's real upstream PrimeNG/PrimeReact/PrimeVue Table behavior, as specified in `docs/superpowers/specs/2026-09-02-table-component-design.md`. Table composes the real, already-shipped `UPaginator` (`870883e`) component for pagination UI and the real, already-shipped `UScroller` (`8f8f97b`, extended `c2be17b`) component for virtualization UI — it does not reimplement either. **`UScroller` composition was BLOCKED in an earlier planning pass** (its then-shipped surface had no content-projection mechanism) — this is now resolved: a separate, reviewed, merged plan (`docs/superpowers/plans/2026-09-02-scroller-content-template-extension.md`, commits `3204f38`..`c2be17b`) extended `UScroller` in all three frameworks with a real content-level composition point mirroring PrimeNG/PrimeReact/PrimeVue's own mechanism exactly (Angular `@ContentChild('content', {descendants: false})` + `ngTemplateOutlet`; React `contentTemplate` render-prop; Vue `content` scoped slot — each dispatching `{items, getItemOptions(index), itemSize, loading}` to the consumer's own markup). Tasks 9/15b/21b below now use this real, shipped mechanism.

**Architecture:** Three independent, framework-native implementations sharing only `@ultimate/uix-data`'s six primitives (`equals`, `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast`) — unchanged, ADR-043. Each framework preserves its own real state-ownership model per spec §16: Angular always-internal-plus-emit (every stateful `@Input()` has a matching `@Output() xChange`); React explicit controlled/uncontrolled per stateful concern (callback-prop presence determines mode); Vue Options-API `d_`-prefixed internal reactive fields plus `v-model` emits. Editing state (§11), filter-operator representation (§9), and row-grouping (§13) stay framework-native per the spec — none of these introduce a new shared type. Table composes the real `UPaginator` and `UScroller` component instances (§14) — verified this planning pass against the actual shipped source (see Global Constraints), including `UScroller`'s content-template extension.

**Tech Stack:** Angular 21 standalone components + `ng-packagr` + Angular's own test runner (`ng test`, `TestBed`); React 18/19 function components + `tsup` + Vitest + `@testing-library/react`; Vue 3 Options API SFCs (`extends: createBaseComponent(...)`) + `tsup` + `vue-tsc` + Vitest + `@vue/test-utils`. All three consume `@ultimate/uix-data`, `@ultimate/{ng,react,vue}-core`, `@ultimate/uix-styles`, and their own framework's real `UPaginator`/`UScroller` (`@ultimate/{ng,react,vue}`'s own paginator/scroller subpaths).

**Spec:** `docs/superpowers/specs/2026-09-02-table-component-design.md` (commit `6bf81c6`)

**Dependencies verified real and shipped (this planning pass, read directly from source, not assumed from the spec):**
- `packages/ng/src/paginator/paginator.ts` (`UPaginator`, signal inputs `first`/`rows`/`totalRecords`/`pageLinkSize`, output `onPageChange: PaginatorPageChangeEvent`, public `changePage(first: number): void`) — merged `870883e`.
- `packages/react/src/paginator/paginator.tsx` (`UPaginatorProps { first, rows, totalRecords, pageLinkSize?, onPageChange }`, zero internal state) — merged `870883e`.
- `packages/vue/src/paginator/Paginator.vue` + `base-paginator.ts` (props `first`/`rows`/`totalRecords`/`pageLinkSize`, emits `page`/`update:first`/`update:rows`, internal `d_first`/`d_rows`) — merged `870883e`.
- `packages/ng/src/scroller/scroller.ts` (`UScroller`, inputs `items`/`itemSize`/`numToleratedItems`/`loading`/`disabled`/`lazy`, output `onLazyLoad: {first, last}`, public `scrollTo(options)`/`scrollToIndex(index, behavior?)`) — merged `8f8f97b`. **Content-template composition point** (merged `3204f38`, `descendants: false` fix `c2be17b`): `@ContentChild("content", { descendants: false }) protected contentTemplate?: TemplateRef<UScrollerContentContext>`, where `UScrollerContentContext = { $implicit: {index: number; value: unknown}[]; options: { getItemOptions: (index: number) => {index, count, first, last, even, odd}; itemSize: number; loading: boolean } }`. Dispatched via `*ngTemplateOutlet` in place of the built-in per-item `<div>` rendering when a `#content` template is projected; built-in rendering is the fallback when absent. `visibleItems()` (already-shipped windowing) is passed as `$implicit` — real absolute array indices, not window-relative.
- `packages/react/src/scroller/scroller.tsx` (`UScrollerProps`, `React.forwardRef<UScrollerHandle, UScrollerProps>`, `UScrollerHandle { scrollTo, scrollToIndex }`) — merged `8f8f97b`. **Content-template composition point** (merged `f022ccd`): `contentTemplate?: (options: UScrollerContentOptions) => React.ReactNode` prop, where `UScrollerContentOptions = { items: {index, value}[]; getItemOptions: (index: number) => {index, count, first, last, even, odd}; itemSize: number; loading: boolean }`. Called in place of the built-in per-item `.map()` when supplied.
- `packages/vue/src/scroller/Scroller.vue` + `base-scroller.ts` (props `items`/`itemSize`/`numToleratedItems` in base, `disabled`/`loading`/`lazy` in component; methods `scrollTo`/`scrollToIndex`; emit `lazy-load`) — merged `8f8f97b`. **Content-template composition point** (merged `1ae29ec`, windowed-path test fix `343816a`): `content` scoped slot exposing `:items`, `:get-item-options` (→ `getItemOptions` when destructured — Vue camelCases kebab-case slot-prop bindings, confirmed against the compiled template output), `:item-size` (→ `itemSize`), `:loading`. Built-in `v-for` rendering is the slot's fallback content, rendered automatically when `#content` isn't supplied.
- **All three frameworks' `getItemOptions(index)` are field-for-field identical**: `{index, count, first: index === 0, last: index === count - 1, even: index % 2 === 0, odd: index % 2 !== 0}`, where `count` is always the *full* (unwindowed) `items.length`, mirroring real PrimeNG/PrimeReact/PrimeVue's `getOptions(index)` — confirmed by the Scroller extension plan's final whole-branch review. This is positional/boundary metadata only, not a pre-computed style/position offset.
- **`disabled=true` interaction**: all three frameworks' content-template dispatch reuses the same `visibleItems`/`visibleItems()` value the built-in path already uses — when `disabled()`/`disabled` is `true`, that value is already the full unwindowed item list (pre-existing, shipped behavior, unrelated to this extension), so the content template receives the full list automatically with no separate disabled-specific branch needed.
- **Positioning is NOT handed down by `UScroller`.** `.u-scroller-content` (`packages/{ng,react,vue}/src/scroller/scroller-style.ts`) is `position: absolute; width: 100%` with a computed `height` but no `top` — the built-in per-item rendering compensates via `top: index * itemSize` per `.u-scroller-item`. A consumer's own content-template markup (e.g. Table's `<table>`) is a normal-flow child of that wrapper and does **not** automatically receive per-row positioning — real PrimeNG/PrimeReact/PrimeVue's own Table applies its own `translateY`/`top` offset to its rendered `<table>` (or per-row) using the real array index, and Table's own implementation here must do the same, deriving the offset from `getItemOptions(item.index).index * itemSize` (the absolute index is already available; no new field is needed from `UScroller`). This is a real, load-bearing implementation detail, not an oversight — flagged explicitly in Task 9/15b/21b below.

## Global Constraints

- `equals`, `SelectionMode`, `SortMeta`/`SortMode`, `FilterMatchMode`/`FilterMetadata`, `PaginationState`/`getPageCount`, `calculateNumItemsInViewport`/`calculateLast` are consumed from `@ultimate/uix-data` unchanged — no new export, no modification (ADR-043; spec §2, §5, §25 acceptance criterion 2). Verified this planning pass by reading `packages/uix-data/src/index.ts` and every primitive's real source — signatures above match the spec's citations exactly.
- **Table composes the real `UPaginator` and real `UScroller` — no stub, mock, or parallel reimplementation for production composition** (spec §14; user requirement #5). Paginator composition, concretely:
  - Angular: `<u-paginator [first]="..." [rows]="..." [totalRecords]="..." (onPageChange)="...">` as a real template child, imported from `@ultimate/ng`'s own `./paginator` module (intra-package import — Table lives in the same `packages/ng` package).
  - React: `import { UPaginator } from "../paginator/paginator"`, rendered as a real JSX child with `onPageChange` wired to Table's own state.
  - Vue: `import UPaginator from "../paginator/Paginator.vue"`, registered as a local `components:` entry and used as a real template element (`<UPaginator @page="..." />`).
  - Test-only rendering must mount the real component (via `TestBed`/`render`/`mount`), never a hand-rolled fake — matching the Paginator/Scroller plans' own final-review-verified convention (spec §22: "composition with real child instantiation, not a mock").
  - Scroller composition (**now unblocked**, Tasks 9/15b/21b), concretely, using the real content-template mechanism confirmed above:
    - Angular: `<u-scroller [items]="..." [itemSize]="..." [loading]="..."><ng-template #content let-visibleItems let-options="options">...Table's own &lt;table&gt;&lt;tbody&gt;...&lt;/ng-template&gt;</u-scroller>` — imported from `@ultimate/ng`'s own `./scroller` module.
    - React: `<UScroller items={...} itemSize={...} contentTemplate={(options) => <table>...</table>} />` — imported from `../scroller/scroller`.
    - Vue: `<UScroller :items="..." :item-size="..."><template #content="slotProps"><table>...</table></template></UScroller>` — imported from `../scroller/Scroller.vue`.
    - Test-only rendering must mount the real `UScroller`, same convention as `UPaginator` above.
- **The six `@ultimate/uix-data` primitives stay exactly as approved — no new shared Data abstraction** (user requirement #6; spec §5, §25 acceptance criterion 2). Sort execution, filter execution, row-grouping boundary detection, and cell/row-edit dirty-tracking are Table's own per-framework implementation logic, never centralized into `uix-data` (spec §7, §8, §11, §13 — all explicitly confirm `uix-data` has no comparator, no filter-predicate, no editing, no grouping export).
- **Framework-native state ownership and editing/filter/grouping/drag-drop behavior stays framework-native, per spec §4/§9/§11/§13/§16** (user requirement #7) — not normalized across frameworks:
  - Filter operator/constraints (spec §9): Angular uses `Record<string, FilterMetadata | FilterMetadata[]>` (array-of-alternatives, `.operator` duplicated per element); React/Vue use `Record<string, FilterMetadata | { operator: 'and' | 'or'; constraints: FilterMetadata[] }>` (object-with-constraints-array). No shared type is added to `uix-data`.
  - Row/cell editing (spec §11): Angular — single mutable `editingCell` field, DOM `.ng-invalid.ng-dirty` class query for validity, `editingRowKeys: Record<string, boolean>` key-map. React — `editingRows` controlled/uncontrolled via `onRowEditChange` presence, always-internal `editingMetaState` keyed by `dataKey`-or-`rowIndex`. Vue — `editingRows` public `Array` prop (`v-model`), internally derived `d_editingRowKeys` key-map, always-internal `d_editingMeta` keyed by `rowIndex` only. These are genuinely different structures, not the same shape wearing different names — do not reconcile.
  - Row grouping (spec §13): `groupRowsBy` injected as a synthetic leading `SortMeta` entry into Table's own sort computation; group boundaries detected via `equals`/`deepEquals` on adjacent sorted rows. Zero new `uix-data` export.
- **Paginator Task 15 (rows-per-page / jump-to-page dropdown controls) stays deferred — do not pull it into Table planning** (user requirement #8). `UPaginator`'s shipped surface has no `rowsPerPageOptions`-driven dropdown UI and no jump-to-page input; Table's own `rowsPerPageOptions` prop (spec §4) is accepted and passed through per `PaginationState`'s existing shape, but Table does not build, stub, or wait on a rows-per-page dropdown — that remains gated on an Ultimate Select-equivalent component exactly as the Paginator plan left it (confirmed absent this planning pass: `packages/{ng,react,vue}/src/*` still has no `select`/`dropdown` directory).
- **The Paginator aria-live current-page-report divergence is an already-settled, explicit open scope decision — not resolved during Table planning** (user requirement #9). Real source confirmed this pass: only Vue's `Paginator.vue` renders `<span data-u-paginator-current-report aria-live="polite">{{ page + 1 }} of {{ pageCount }}</span>` (`Paginator.vue:46`); Angular's and React's shipped Paginator templates have no equivalent element. Because Table composes the real Paginator component as-is (not its own copy), this asymmetry is inherited by Table automatically and requires no Table-level decision, code, or test — Table's own accessibility tasks (Task Group E) do not add a matching feature to Angular/React's Paginator usage, and do not remove Vue's.
- Match every existing shipped-component convention exactly (verified this planning pass by reading `packages/{ng,react,vue}/src/paginator/*` and `packages/{ng,react,vue}/src/scroller/*` in full): Angular components extend `UBaseComponent` (`@ultimate/ng-core`) with a `componentName`/`styleModule` pair, signal `input()`/`output()`, `ChangeDetectionStrategy.OnPush`, and internal state that must be mutated from outside a template event (e.g. imperative methods called by tests or parent code) implemented as `signal()` rather than a plain field — confirmed root cause pattern from both Scroller's `_contentSize` and Paginator's `_first`. React components use `useComponentBase({ componentName, styleModule })` from `@ultimate/react-core`. Vue components use `createBaseComponent({ componentName, styleModule })` from `@ultimate/vue-core` via `extends:`, with `d_`-prefixed internal reactive data mirrored from props via `watch`. Every style module is `{ css, classes }`, with `css` sourced from `@ultimate/uix-styles/<component>` and `classes` a local class-name-slot resolver object (`.p-*` renamed to `.u-*` — verified this pass: `packages/uix-styles/src/paginator/index.ts` and the vendored `.vendor-extracted/uix-styles-components/src/datatable/index.ts` both follow this convention; the latter is 608 lines, the largest style-token source of the three components planned so far, confirmed this pass).
- **`fixture.nativeElement` in Angular tests is the component's own host element** (`<u-table>`), not a child inside its template — DOM-observable state needing `getAttribute()`-style assertion must be bound via `@Component({ host: {...} })`; `querySelector`/`querySelectorAll` (subtree search) is the correct mechanism for template-descendant elements (page-link buttons, cell/row elements, etc.) — confirmed convention from both prior plans' fix rounds, carried forward without rediscovery.
- **Provenance manifest entries go into the existing per-package files** (`docs/architecture/provenance/{ng,react,vue,uix-styles}.json`), using the direct-adaptation schema (`originalPath`/`ultimateDestination`/`modificationStatus`/`modificationDescription`) already used by every Paginator/Scroller entry — confirmed this pass by reading the real tail entries of `docs/architecture/provenance/ng.json`. There is no per-component provenance file convention in this repo; none is created by this plan.
- Provenance style tokens for Table's data-table CSS already exist, vendored, at `.vendor-extracted/uix-styles-components/src/datatable/index.ts` (608 lines, real `dt('datatable.*')` token references, confirmed this pass) — this plan ports that file into `packages/uix-styles/src/table/index.ts` (Task 1), matching the exact pattern `packages/uix-styles/src/paginator/index.ts` already established. No component *logic* source is vendored yet (`.vendor-extracted/{ng,react,vue}` has no `table`/`datatable` directory) — real PrimeNG/PrimeReact/PrimeVue Table logic is read from the pinned cached tarballs as each task requires it, per the spec's own citations (`table.ts` commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`, `DataTable.js` commit `d0f574e39122668292fc7a740f081bae1b93b1e9`, `DataTable.vue` commit `66dde6788220fc9e6822342919d1ceb0e3460ece` — per spec §21).
- No new `@ultimate/uix-data` primitive, no ADR-043 change, no Blueprint change. `docs/architecture/BLUEPRINT_GAPS.md`'s GAP-014 (filter operator/constraints) is addressed by this plan's Task 5/12/19 (per-framework filter implementation matching spec §9's resolution) — updating GAP-014's status to `RESOLVED` is a documentation task at the end of this plan (Task 27), not a precondition for starting.
- **Scope boundary, restated from spec §1**: no drag-drop, no `uix-data` primitive addition, no TreeTable-as-grid, no column virtualization beyond what `calculateNumItemsInViewport`/`calculateLast` already cover. Frozen columns and column resize/reorder are explicitly out of scope (spec §1, §22 `NEEDS IMPLEMENTATION-TIME VERIFICATION` items not pursued here beyond what's needed for the acceptance criteria).

---

## Task Group A — Shared Style Tokens

### Task 1: Port Table style tokens into `@ultimate/uix-styles`

**Files:**
- Create: `packages/uix-styles/src/table/index.ts`
- Test: `packages/uix-styles/test/table.test.ts`

**Interfaces:**
- Consumes: nothing new (plain string export, matching `packages/uix-styles/src/paginator/index.ts`'s `export const style = ...` shape)
- Produces: `export const style: string` — importable as `@ultimate/uix-styles/table`, consumed by Task 2/9/16's `table-style.ts` files

- [ ] **Step 1: Write the failing test**

```typescript
// packages/uix-styles/test/table.test.ts
import { describe, it, expect } from "vitest";
import { style } from "../src/table";

describe("uix-styles table", () => {
  it("exports a non-empty CSS string with .u-table root selector", () => {
    expect(typeof style).toBe("string");
    expect(style).toContain(".u-table");
    expect(style).not.toContain(".p-datatable");
  });

  it("uses dt() token references for themeable properties", () => {
    expect(style).toContain("dt('datatable.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styles test -- table.test.ts`
Expected: FAIL — `Cannot find module '../src/table'`

- [ ] **Step 3: Write minimal implementation**

Copy `.vendor-extracted/uix-styles-components/src/datatable/index.ts` (608 lines, already vendored, real `@primeuix/styles` datatable token source) to `packages/uix-styles/src/table/index.ts`. Read the copied file first to enumerate every `.p-datatable*` compound selector (`.p-datatable`, `.p-datatable-table`, `.p-datatable-header`, `.p-datatable-thead`, `.p-datatable-tbody`, `.p-datatable-row`, `.p-datatable-row-selected`, etc. — exact list depends on the real file's contents), then apply the same find-and-replace rename convention already used for `.p-paginator` → `.u-paginator`: every `.p-datatable*` selector becomes `.u-table*` (not `.u-datatable*` — Ultimate's component is named `Table`/`UTable`, matching the spec's own naming; verify no other-namespace selector, e.g. a stray `.p-inputtext` or `.p-checkbox` reference from an embedded editing/selection control, gets left un-renamed — this is the exact class of defect the Paginator final-review caught for `.p-inputtext`, so check for it explicitly here rather than assuming the vendored file is Table-selector-clean). Do not alter the `dt('datatable.*')` token calls themselves — only the CSS class selectors.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styles test -- table.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/uix-styles/src/table/ packages/uix-styles/test/table.test.ts
git commit -m "feat(uix-styles): add table style tokens"
```

---

## Task Group B — Angular (`@ultimate/ng`) — Core Grid, Sort, Selection, Pagination Composition

### Task 2: Scaffold `UTable` — render rows/columns from `value`, style module

**Files:**
- Create: `packages/ng/src/table/table.ts`
- Create: `packages/ng/src/table/table-style.ts`
- Test: `packages/ng/src/table/table.spec.ts`

**Interfaces:**
- Consumes: `UBaseComponent` from `@ultimate/ng-core`; `style` from `@ultimate/uix-styles/table` (Task 1)
- Produces: `UTable<T>` class with signal input `value = input<T[]>([])`, `dataKey = input<string>('')`; renders `role="table"` root, `role="rowgroup"` on `tbody`, `role="row"` per data row — consumed by Task 3 (columns), Task 4 (selection)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/ng/src/table/table.spec.ts
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UTable } from "./table";

interface Row {
  id: number;
  name: string;
}

describe("UTable", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("renders one row per value entry with role=row", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.detectChanges();
    // Scoped to tbody explicitly (not a bare [role="row"] query) so this
    // assertion stays correct once Task 3 adds a header role="row" — this
    // task has no header row yet, but the selector is written defensively
    // from the start rather than fixed reactively in a later task.
    const rows = fixture.nativeElement.querySelectorAll('tbody [role="row"]');
    expect(rows.length).toBe(2);
  });

  it("root element has role=table", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="table"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — `Cannot find module './table'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/ng/src/table/table-style.ts
import { style as tableStyle } from "@ultimate/uix-styles/table";

const css = /*css*/ `
    ${tableStyle}
`;

const classes = {
  root: () => "u-table u-component",
  table: () => "u-table-table",
  thead: () => "u-table-thead",
  tbody: () => "u-table-tbody",
  row: (params: { selected?: boolean } = {}) => [
    "u-table-row",
    { "u-table-row-selected": params.selected },
  ],
};

export const tableStyleModule = { css, classes };
```

```typescript
// packages/ng/src/table/table.ts
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { tableStyleModule } from "./table-style";

@Component({
  standalone: true,
  selector: "u-table",
  template: `
    <div [class]="cx('root')" role="table">
      <table [class]="cx('table')">
        <tbody [class]="cx('tbody')" role="rowgroup">
          @for (row of value(); track $index) {
            <tr [class]="cx('row')" role="row"></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UTable<T> extends UBaseComponent {
  protected override readonly componentName = "table";
  protected override readonly styleModule = tableStyleModule;

  value = input<T[]>([]);
  dataKey = input<string>("");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table-style.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): scaffold UTable with row rendering"
```

---

### Task 3: Angular — column definitions, per-column cell templating

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `value` (Task 2)
- Produces: `columns = input<{ field: string; header: string }[]>([])` input; renders `role="columnheader"` header cells and per-column data cells resolving `row[field]` — consumed by Task 4 (sort), Task 7 (accessibility)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
it("renders a columnheader per column definition and a data cell per row/column pair", () => {
  const fixture = TestBed.createComponent(UTable<Row>);
  fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
  fixture.componentRef.setInput("columns", [
    { field: "id", header: "ID" },
    { field: "name", header: "Name" },
  ]);
  fixture.detectChanges();
  const headers = fixture.nativeElement.querySelectorAll('[role="columnheader"]');
  expect(headers.length).toBe(2);
  expect(headers[1].textContent?.trim()).toBe("Name");
  const cells = fixture.nativeElement.querySelectorAll("td");
  expect(cells.length).toBe(2);
  expect(cells[1].textContent?.trim()).toBe("Alice");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — no `columnheader`/`td` elements rendered

- [ ] **Step 3: Write minimal implementation**

Extend `table.ts`'s template with a `thead`/`columns`-driven header row and per-row `td` cells resolving `row[col.field]`:

```html
<div [class]="cx('root')" role="table">
  <table [class]="cx('table')">
    <thead [class]="cx('thead')" role="rowgroup">
      <tr role="row">
        @for (col of columns(); track col.field) {
          <th role="columnheader">{{ col.header }}</th>
        }
      </tr>
    </thead>
    <tbody [class]="cx('tbody')" role="rowgroup">
      @for (row of value(); track $index) {
        <tr [class]="cx('row')" role="row">
          @for (col of columns(); track col.field) {
            <td>{{ row[col.field] }}</td>
          }
        </tr>
      }
    </tbody>
  </table>
</div>
```

Add `columns = input<{ field: string; header: string }[]>([]);` to the class body.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add UTable column definitions and cell rendering"
```

---

### Task 4: Angular — sorting (`sortField`/`sortOrder`, `multiSortMeta`, `aria-sort`)

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `SortMeta`/`SortMode` from `@ultimate/uix-data`; `columns` (Task 3)
- Produces: `sortMode = input<SortMode>('single')`, `sortField = input<string>()`, `sortOrder = input<1|0|-1>(0)`, `multiSortMeta = input<SortMeta[]>([])`, outputs `sortFieldChange`/`sortOrderChange`/`multiSortMetaChange`; `sortedValue` getter (single- and multi-sort execution, Table's own logic per spec §7); `onSort(field)` click handler on header cells — consumed by Task 8 (real Paginator composition operates on `sortedValue`, not raw `value`)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("sorting", () => {
  it("sorts by sortField/sortOrder (single-sort) without mutating the input array", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    fixture.componentRef.setInput("value", original);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("sortField", "name");
    fixture.componentRef.setInput("sortOrder", 1);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("Alice");
    expect(original[0].name).toBe("Bob"); // original array untouched
  });

  it("sets aria-sort on the active sortField's columnheader", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("sortField", "name");
    fixture.componentRef.setInput("sortOrder", -1);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('[role="columnheader"]');
    expect(header.getAttribute("aria-sort")).toBe("descending");
  });

  it("multi-sort applies multiSortMeta entries in order", () => {
    const fixture = TestBed.createComponent(UTable<{ group: string; name: string }>);
    fixture.componentRef.setInput("value", [
      { group: "b", name: "z" },
      { group: "a", name: "y" },
      { group: "a", name: "x" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("sortMode", "multiple");
    fixture.componentRef.setInput("multiSortMeta", [
      { field: "group", order: 1 },
      { field: "name", order: 1 },
    ]);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect([cells[0].textContent?.trim(), cells[1].textContent?.trim(), cells[2].textContent?.trim()]).toEqual([
      "x",
      "y",
      "z",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — sort inputs not applied, `aria-sort` absent

- [ ] **Step 3: Write minimal implementation**

Add sort inputs/outputs and a `sortedValue` getter that clones (`[...this.value()]`) before sorting (never mutates the input array); wire the `td`/`th` loop in the template to iterate `sortedValue` instead of `value()`; add `[attr.aria-sort]` binding on `th` (`'ascending'`/`'descending'`/`null` mapped from `1`/`-1`/`0`) and `(click)="onSort(col.field)"` that toggles/sets `sortField`/`sortOrder` (single mode) or updates `multiSortMeta` (multiple mode) and emits the matching `*Change` output, per spec §4.1's "always internal, always emitting" Angular convention. Sort comparator resolves `row[field]` directly (no nested-path resolution beyond what the spec's examples require — flat `field` strings only, matching spec §7's "Table's own implementation logic" scope).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add UTable single/multi sort and aria-sort"
```

---

### Task 5: Angular — filtering (simple `FilterMetadata` + array-of-alternatives operator shape) — **scope narrowed to string match modes**

> **Scope correction from an earlier pass:** the original version of this task named the full `FilterMatchMode` vocabulary (including `lt`/`lte`/`gt`/`gte`/`between`/`dateIs`/`dateIsNot`/`dateBefore`/`dateAfter`/`in`/`notIn`/`custom`) as "in scope," with only `contains` actually tested — an unverified, speculative mini filter engine. Corrected per review: this task now implements and tests only the **string match-mode subset actually exercised below** (`contains`, `startsWith`, `equals`). `custom` in particular is not implemented here — its real upstream contract (PrimeNG's `filters` config allows a per-column custom predicate function, per `table.ts`'s own `filterService`-style dispatch, not independently re-verified this pass) is unconfirmed and out of scope. Numeric (`lt`/`lte`/`gt`/`gte`/`between`), set (`in`/`notIn`), date (`dateIs`/`dateIsNot`/`dateBefore`/`dateAfter`), and `notContains`/`endsWith`/`notEquals`/`custom` are **explicitly deferred** — not implemented, not stubbed, not silently no-op'd; `filteredValue`'s match-mode dispatch throws or passes the row through unfiltered only for modes it implements, and any `matchMode` outside this task's `{contains, startsWith, equals}` set is a `NEEDS IMPLEMENTATION-TIME VERIFICATION` follow-up task, not silently invented here.

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `FilterMatchMode`/`FilterMetadata` from `@ultimate/uix-data`; `sortedValue` (Task 4)
- Produces: `filters = input<Record<string, FilterMetadata | FilterMetadata[]>>({})` (spec §9's Angular-specific array-of-alternatives shape); `filteredValue` getter implementing only `contains`/`startsWith`/`equals` (applies filters before sort, matching real PrimeNG's filter-then-sort pipeline order) — consumed by Task 8 (Paginator operates on the fully filtered+sorted result)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("filtering (Angular array-of-alternatives operator shape, spec §9 — string match modes only)", () => {
  it("applies a simple FilterMetadata filter (matchMode: contains)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "ali", matchMode: "contains" } });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });

  it("applies matchMode: startsWith", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Alison" },
      { id: 3, name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "Ali", matchMode: "startsWith" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: equals", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Alison" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", { name: { value: "Alice", matchMode: "equals" } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(1);
  });

  it("applies an array-of-alternatives filter (FilterMetadata[]) with OR semantics per element", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Carol" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("filters", {
      name: [
        { value: "ali", matchMode: "contains" },
        { value: "car", matchMode: "contains" },
      ],
    });
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — filters input not applied

- [ ] **Step 3: Write minimal implementation**

Add `filters` input and a `filteredValue` getter implementing exactly three match modes: `contains` (case-insensitive substring), `startsWith` (case-insensitive prefix), `equals` (case-insensitive full-string equality) — matching this task's own tests, nothing broader. Any `matchMode` value outside this set is not dispatched to a handler; leave a single `// NEEDS IMPLEMENTATION-TIME VERIFICATION: <mode>` comment at the dispatch point listing the deferred modes (`notContains`, `endsWith`, `notEquals`, `lt`/`lte`/`gt`/`gte`/`between`, `in`/`notIn`, `dateIs`/`dateIsNot`/`dateBefore`/`dateAfter`, `custom`) rather than implementing guessed behavior for them. Array-form entries are OR'd together (any alternative matching passes the row) per spec §9's citation of PrimeNG's real array-of-alternatives semantics — this part of the shape is structural (how `FilterMetadata[]` combines), not match-mode-specific, so it stays in scope regardless of which individual modes are implemented. Wire the template's row loop to `filteredValue` composed with `sortedValue`'s sort logic (filter applied first, then sort, matching upstream's real pipeline order).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add UTable filtering (contains/startsWith/equals) with array-of-alternatives operator shape"
```

---

### Task 6: Angular — selection (`single`/`multiple`, `compareSelectionBy`, `aria-selected`)

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `equals` from `@ultimate/uix-data`; `dataKey` (Task 2)
- Produces: `selectionMode = input<SelectionMode>()`, `selection = input<T | T[]>()`, output `selectionChange`, `compareSelectionBy = input<'equals'|'deepEquals'>('equals')`; row `(click)` selection toggling with `aria-selected` — consumed by Task 7 (accessibility verification)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("selection", () => {
  it("emits selectionChange with the clicked row in single mode", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.selectionChange.subscribe((e: unknown) => (emitted = e));
    // tbody-scoped: by this task, Task 3's header row already exists in the
    // template, so a bare [role="row"] query would resolve the header row
    // (which has no click-to-select behavior) instead of the data row.
    fixture.nativeElement.querySelector('tbody [role="row"]').click();
    expect(emitted).toEqual({ id: 1, name: "Alice" });
  });

  it("marks the selected row aria-selected=true using dataKey identity (equals)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.componentRef.setInput("selection", { id: 1, name: "Alice" });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tbody [role="row"]').getAttribute("aria-selected")).toBe("true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — `selectionChange` undefined / `aria-selected` absent

- [ ] **Step 3: Write minimal implementation**

Add selection inputs/output; row click handler resolves single/multiple toggling using `equals(row, existing, dataKey())` for identity comparison (deepEquals branch calls a structural comparison — implement via `JSON.stringify` equality as the simplest correct `deepEquals` given no other deep-equal utility is exported by `uix-data` or `uix-utils` for this purpose; confirm `uix-utils`'s public exports first and prefer a real shared utility if one already exists there, otherwise this inline implementation is acceptable since spec §6 leaves `compareSelectionBy`'s exact deep-equal mechanism to implementation). Bind `[attr.aria-selected]` on `tr` based on whether the row matches current `selection()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add UTable single/multiple selection with dataKey identity"
```

---

### Task 7: Angular — keyboard navigation, remaining accessibility vocabulary

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: existing row/column/sort/selection state (Tasks 2-6)
- Produces: `@HostListener('keydown')`-driven arrow-key/enter/home/end navigation across `role="row"`/`role="columnheader"` elements, per spec §15 — consumed by Task 27's cross-framework accessibility verification

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("keyboard navigation", () => {
  it("ArrowDown on a row moves focus to the next row", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
    fixture.detectChanges();
    // tbody-scoped: by this task, Task 3's header row exists, so a bare
    // [role="row"] query would include it — this test must exercise
    // data-row-to-data-row navigation, not header-to-data-row.
    const rows = fixture.nativeElement.querySelectorAll('tbody [role="row"]');
    rows[0].focus();
    rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.ownerDocument.activeElement).toBe(rows[1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — focus does not move

- [ ] **Step 3: Write minimal implementation**

Add `tabindex="0"` to `tr` elements and a `(keydown)` handler on the row (or a single `@HostListener('keydown')` matching real PrimeNG's `table.ts:3918-4014` convention cited in spec §15) implementing ArrowDown/ArrowUp/Home/End navigation between `role="row"` elements using `.focus()`. Enter-key/selection-toggle behavior is covered by Task 6's click handler already — this task only adds the keyboard-equivalent path for row navigation, matching the spec's confirmed baseline (arrow/enter/home/end), not inventing additional keys beyond that vocabulary.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add UTable keyboard row navigation"
```

---

### Task 8: Angular — real `UPaginator` composition

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `UPaginator` from `../paginator/paginator` (real shipped component, `870883e`); `filteredValue`/`sortedValue` (Tasks 4-5)
- Produces: `paginator = input(false)`, `first = input(0)` + output `firstChange`, `rows = input(0)` + output `rowsChange`, `totalRecords = input(0)`, `rowsPerPageOptions = input<number[]>()`; renders a real `<u-paginator>` child when `paginator()` is true, wired to slice the already-filtered/sorted rows — consumed by Task 27 (cross-framework composition verification)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("Paginator composition (real UPaginator, not a mock)", () => {
  it("renders a real u-paginator child when paginator=true and slices rows to the current page", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("first", 0);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("totalRecords", 25);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-paginator")).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll("td").length).toBe(10);
  });

  it("advancing the real UPaginator's page updates the visible row slice", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("first", 0);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("totalRecords", 25);
    fixture.detectChanges();
    const nextButton = fixture.nativeElement.querySelector("[data-u-paginator-next]");
    nextButton.click();
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("Row 10");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — no `u-paginator` element rendered

- [ ] **Step 3: Write minimal implementation**

```typescript
// add to table.ts imports
import { UPaginator, PaginatorPageChangeEvent } from "../paginator/paginator";

// add to @Component imports array
imports: [UPaginator],
```

Extend the template with:

```html
@if (paginator()) {
  <u-paginator
    [first]="first()"
    [rows]="rows()"
    [totalRecords]="totalRecords()"
    (onPageChange)="onPaginatorPageChange($event)"
  ></u-paginator>
}
```

Add `paginator`, `first`, `rows`, `totalRecords`, `rowsPerPageOptions` inputs and `firstChange`/`rowsChange` outputs; add `onPaginatorPageChange(event: PaginatorPageChangeEvent)` that updates internal paged-slice state and emits `firstChange`/`rowsChange` (per spec §4.1's always-internal-plus-emit convention). Add a `pagedValue` getter that slices `filteredValue`/`sortedValue`'s result to `[first(), first() + rows())` when `paginator()` is true, else returns the full result — the row-rendering loop (Tasks 2-7) switches from `sortedValue`/`filteredValue` to `pagedValue` in this task, since pagination must apply after filter+sort per real Table's pipeline order (confirmed by spec §10 and both research reports' consistent filter→sort→paginate ordering).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): compose real UPaginator into UTable"
```

---

### Task 9: Angular — real `UScroller` composition (virtualization)

> **Unblocked.** The earlier blocker (`UScroller` had no content-projection mechanism) is resolved: `docs/superpowers/plans/2026-09-02-scroller-content-template-extension.md` shipped `@ContentChild('content', {descendants: false})` + `ngTemplateOutlet` on the real, merged `UScroller` (`3204f38`, `descendants: false` fix `c2be17b`). This task composes that real mechanism — Option 1 from the prior review, the option that preserves `table → tbody → tr → td` semantics through composition.

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `UScroller`, `UScrollerContentContext` from `../scroller/scroller` (real shipped, `8f8f97b`, content-template extension `3204f38`/`c2be17b`); `filteredValue`/`sortedValue` (Tasks 4-5)
- Produces: `virtualScroll = input(false)`, `virtualScrollItemSize = input(0)`, `lazy = input(false)`, `lazyLoadOnInit = input(false)`, output `onLazyLoad`; renders a real `<u-scroller>` child with a `#content` template supplying Table's own `<table><tbody><tr><td>` markup when `virtualScroll()` is true — consumed by Task 27

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("Scroller composition (real UScroller content-template mechanism, not a mock)", () => {
  it("renders a real u-scroller child with real table/tbody/tr/td markup via its #content template when virtualScroll=true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("virtualScroll", true);
    fixture.componentRef.setInput("virtualScrollItemSize", 30);
    // Real windowing requires a measured viewport — mock ResizeObserver's
    // captured callback (never construct a second observer) and offsetHeight,
    // matching the established convention from the Scroller/Paginator plans.
    fixture.detectChanges();
    const scrollerEl = fixture.nativeElement.querySelector("u-scroller");
    expect(scrollerEl).not.toBeNull();
    // Real table structure through the content template, not <div> soup:
    const table = scrollerEl.querySelector("table[data-u-table-virtual-body]");
    expect(table).not.toBeNull();
    const tbody = table.querySelector("tbody");
    expect(tbody?.parentElement).toBe(table);
    const trs = tbody.querySelectorAll(":scope > tr");
    expect(trs.length).toBeGreaterThan(0);
    expect(trs.length).toBeLessThan(200); // genuinely windowed, not the full list
    trs.forEach((tr: Element) => expect(tr.querySelector(":scope > td")).not.toBeNull());
  });

  it("does not render the built-in u-scroller-item divs when virtualScroll=true (content template fully replaces them)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` })));
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("virtualScroll", true);
    fixture.componentRef.setInput("virtualScrollItemSize", 30);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — no `u-scroller` element / no `#content`-projected table markup rendered

- [ ] **Step 3: Write minimal implementation**

Add `UScroller` to `imports`, add `virtualScroll`/`virtualScrollItemSize`/`lazy`/`lazyLoadOnInit` inputs and `onLazyLoad` output. Template renders, when `virtualScroll()` is true, a real `<u-scroller>` composing Table's own `<table><tbody><tr><td>` markup via the real `#content` template (not a reimplementation — this is exactly what real PrimeNG's own Table does at `table.ts:207-217`, confirmed in the Scroller extension plan's architecture research):

```html
@if (virtualScroll()) {
  <u-scroller
    [items]="filteredValue"
    [itemSize]="virtualScrollItemSize()"
    [lazy]="lazy()"
    (onLazyLoad)="onScrollerLazyLoad($event)"
  >
    <ng-template #content let-visibleItems let-options="options">
      <table data-u-table-virtual-body [class]="cx('table')">
        <tbody [class]="cx('tbody')" role="rowgroup">
          @for (item of visibleItems; track item.index) {
            <tr
              [class]="cx('row')"
              role="row"
              [style.position]="'absolute'"
              [style.top.px]="options.getItemOptions(item.index).index * options.itemSize"
              [style.width]="'100%'"
            >
              @for (col of columns(); track col.field) {
                <td>{{ item.value[col.field] }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </ng-template>
  </u-scroller>
}
```

**Positioning, load-bearing detail (see Global Constraints/Dependencies note above):** `UScroller`'s `.u-scroller-content` wrapper is `position: absolute; height: <total>` with no per-row `top` of its own — the built-in fallback compensates via `top: index * itemSize` on each rendered item, and a consumer's own content-template markup gets no positioning for free. This task's template therefore applies `top: options.getItemOptions(item.index).index * options.itemSize` directly on each `<tr>` (via inline style, `position: absolute` — matching the same technique `UScroller`'s own built-in `.u-scroller-item` uses), using the *absolute* array index `getItemOptions` returns (confirmed real, shared, identical across all three frameworks) rather than the item's position within the windowed slice. Do not omit this — without it, virtualized rows render stacked at the top of the scroll container regardless of actual scroll position, a real, user-visible defect, not a cosmetic one.

Add `onScrollerLazyLoad(event: {first: number; last: number})` that re-emits Table's own `onLazyLoad` output, matching `UScroller`'s real `onLazyLoad` payload shape.

**Composing `paginator` and `virtualScroll` simultaneously**: per the plan's "Mutual exclusivity — rejected" finding (real upstream evidence, see near the end of this document), this task does not impose an artificial restriction preventing `virtualScroll` from being combined with `paginator` — `filteredValue`/`sortedValue` (the pre-virtualization result) is what's passed to `<u-scroller [items]="...">`, matching real Table's own filter→sort→virtualize pipeline; if `paginator()` is also true, Task 8's `pagedValue` slicing and this task's `virtualScroll()` branch are two independent `@if` branches in the row-source selection, not stacked — real upstream Table treats `virtualScroll`/`paginator` as alternative body-rendering strategies around the same filtered+sorted data, not composable windowing layers on top of each other (confirmed: PrimeNG's own `<p-scroller *ngIf="virtualScroll">`/`<ng-container *ngIf="!virtualScroll">` split at `table.ts:191,225` is the two-way row-source switch; `<p-paginator>` is a separate, additive UI control around whichever body-rendering branch is active). This task's own scope is the `virtualScroll()`-true branch only; Task 8's `pagedValue` branch is unaffected.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): compose real UScroller content-template mechanism into UTable for virtualization"
```

---

### Task 10: Angular — row editing (DOM-validity cell editing, key-map row editing), row grouping, package wiring

**Files:**
- Modify: `packages/ng/src/table/table.ts`
- Create: `packages/ng/src/table/index.ts`
- Modify: `packages/ng/src/index.ts`
- Modify: `packages/ng/package.json` (`description` field)
- Test: `packages/ng/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: existing Table state (Tasks 2-9)
- Produces: `editMode = input<'cell'|'row'>()`, `editingRowKeys = input<Record<string, boolean>>({})` + output `editingRowKeysChange`, `rowGroupMode = input<'subheader'|'rowspan'>()`, `groupRowsBy = input<string>()`; `UTable` exported from `packages/ng/src/table/index.ts` and re-exported from `packages/ng/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
describe("row editing (key-map, spec §11.1)", () => {
  it("emits editingRowKeysChange with the row's dataKey value added when row edit is initiated", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("editMode", "row");
    fixture.detectChanges();
    let emitted: Record<string, boolean> | undefined;
    fixture.componentInstance.editingRowKeysChange.subscribe((e: Record<string, boolean>) => (emitted = e));
    fixture.componentInstance.initRowEdit({ id: 1, name: "Alice" });
    expect(emitted).toEqual({ "1": true });
  });
});

describe("row grouping (SortMeta-reuse convention, spec §13)", () => {
  it("groups adjacent rows sharing the same groupRowsBy value under subheader mode", () => {
    const fixture = TestBed.createComponent(UTable<{ group: string; name: string }>);
    fixture.componentRef.setInput("value", [
      { group: "a", name: "Alice" },
      { group: "a", name: "Amy" },
      { group: "b", name: "Bob" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("rowGroupMode", "subheader");
    fixture.componentRef.setInput("groupRowsBy", "group");
    fixture.detectChanges();
    const groupHeaders = fixture.nativeElement.querySelectorAll("[data-u-table-group-header]");
    expect(groupHeaders.length).toBe(2); // one per distinct group boundary
  });
});

describe("package export", () => {
  it("is exported from the package root barrel", () => {
    // import added at top of file: import { UTable as RootExport } from "../index";
    expect(RootExport).toBe(UTable);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: FAIL — `initRowEdit` undefined, no group headers rendered, `RootExport` undefined

- [ ] **Step 3: Write minimal implementation**

Add `editMode`/`editingRowKeys` input+output; `initRowEdit(row: T)` resolves `dataKey()` from the row and sets `{...editingRowKeys(), [String(row[dataKey()])]: true}`, emitting `editingRowKeysChange` (matching spec §11.1's key-map idiom — no separate dirty-value store; cell-level `.ng-invalid.ng-dirty` DOM query validity checking is `NEEDS IMPLEMENTATION-TIME VERIFICATION`-deferred beyond this task's key-map scope per spec §11.1's own framing that GAP-018/reactive-forms integration is a consumer/example concern, not a Table core blocker — this task ships the key-map lifecycle only, matching the acceptance criterion's "no artificial cross-framework abstraction" bar without requiring a full reactive-forms editor implementation).

Add `rowGroupMode`/`groupRowsBy` inputs; a `groupedRows` getter injects `groupRowsBy()` as a synthetic leading `SortMeta` into the existing sort pipeline (Task 4), then walks the result comparing `equals(row[groupRowsBy()], previousRow[groupRowsBy()])` to detect boundaries (spec §13's confirmed algorithm) — template renders a `data-u-table-group-header` marker row at each detected boundary in `subheader` mode.

Create `packages/ng/src/table/index.ts`:

```typescript
export { UTable } from "./table";
```

Read `packages/ng/src/index.ts` first to confirm the existing re-export pattern, then add `export * from "./table";`. Update `packages/ng/package.json`'s `"description"`: `"Ultimate Platform Angular components: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip."`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.ts packages/ng/src/table/index.ts packages/ng/src/index.ts packages/ng/package.json packages/ng/src/table/table.spec.ts
git commit -m "feat(ng): add UTable row editing key-map, row grouping, package exports"
```

---

## Task Group C — React (`@ultimate/react`) — Core Grid, Sort, Selection, Pagination Composition

### Task 11: Scaffold `UTable` — controlled `value`/columns render

**Files:**
- Create: `packages/react/src/table/table.tsx`
- Create: `packages/react/src/table/table-style.ts`
- Test: `packages/react/src/table/table.spec.tsx`

**Interfaces:**
- Consumes: `useComponentBase` from `@ultimate/react-core`; `style` from `@ultimate/uix-styles/table`
- Produces: `UTableProps<T> { value: T[]; dataKey?: string; columns: { field: string; header: string }[] }`; `UTable: React.FC<UTableProps<T>>` renders `role="table"`/`role="row"`/`role="columnheader"` — consumed by Task 12

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/src/table/table.spec.tsx
/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UTable } from "./table";

interface Row {
  id: number;
  name: string;
}

describe("UTable", () => {
  it("renders one row per value entry with role=row and a columnheader per column", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]}
        columns={[{ field: "name", header: "Name" }]}
      />
    );
    expect(container.querySelectorAll('[role="row"]').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('[role="columnheader"]')?.textContent).toBe("Name");
  });

  it("root has role=table", () => {
    const { container } = render(<UTable<Row> value={[]} columns={[]} />);
    expect(container.querySelector('[role="table"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — `Cannot find module './table'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/react/src/table/table-style.ts
import { style as tableStyle } from "@ultimate/uix-styles/table";

const css = /*css*/ `
    ${tableStyle}
`;

const classes = {
  root: () => "u-table u-component",
  table: () => "u-table-table",
  thead: () => "u-table-thead",
  tbody: () => "u-table-tbody",
  row: (params: { selected?: boolean } = {}) => ["u-table-row", { "u-table-row-selected": params.selected }],
};

export const tableStyleModule = { css, classes };
```

```tsx
// packages/react/src/table/table.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { tableStyleModule } from "./table-style";

export interface UTableColumn {
  field: string;
  header: string;
}

export interface UTableProps<T> {
  value: T[];
  dataKey?: string;
  columns: UTableColumn[];
}

export function UTable<T extends Record<string, unknown>>({ value, columns }: UTableProps<T>) {
  const { cx } = useComponentBase({ componentName: "table", styleModule: tableStyleModule });

  return (
    <div className={cx("root") as string} role="table">
      <table className={cx("table") as string}>
        <thead className={cx("thead") as string} role="rowgroup">
          <tr role="row">
            {columns.map((col) => (
              <th key={col.field} role="columnheader">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cx("tbody") as string} role="rowgroup">
          {value.map((row, index) => (
            <tr key={index} className={cx("row") as string} role="row">
              {columns.map((col) => (
                <td key={col.field}>{String(row[col.field])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table-style.ts packages/react/src/table/table.spec.tsx
git commit -m "feat(react): scaffold UTable with row/column rendering"
```

---

### Task 12: React — sorting (controlled `sortField`/`sortOrder`/`multiSortMeta`, `onSort`)

**Files:**
- Modify: `packages/react/src/table/table.tsx`
- Test: `packages/react/src/table/table.spec.tsx` (extend)

**Interfaces:**
- Consumes: `SortMeta`/`SortMode` from `@ultimate/uix-data`
- Produces: `sortMode?: SortMode`, `sortField?: string`, `sortOrder?: 1|0|-1`, `multiSortMeta?: SortMeta[]`, `onSort?: (event: { sortField?: string; sortOrder?: 1|0|-1; multiSortMeta?: SortMeta[] }) => void` props — consumed by Task 15 (Paginator composition operates on sorted rows)

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/table/table.spec.tsx
import { vi } from "vitest";

describe("sorting", () => {
  it("renders rows pre-sorted by sortField/sortOrder without mutating the value prop", () => {
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    const { container } = render(
      <UTable<Row> value={original} columns={[{ field: "name", header: "Name" }]} sortField="name" sortOrder={1} onSort={vi.fn()} />
    );
    const cells = container.querySelectorAll("td");
    expect(cells[0].textContent).toBe("Alice");
    expect(original[0].name).toBe("Bob");
  });

  it("sets aria-sort on the active sortField's columnheader and calls onSort when clicked", () => {
    const onSort = vi.fn();
    const { container } = render(
      <UTable<Row> value={[{ id: 1, name: "Alice" }]} columns={[{ field: "name", header: "Name" }]} sortField="name" sortOrder={-1} onSort={onSort} />
    );
    const header = container.querySelector('[role="columnheader"]') as HTMLElement;
    expect(header.getAttribute("aria-sort")).toBe("descending");
    header.click();
    expect(onSort).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — no sorting applied, `aria-sort` absent

- [ ] **Step 3: Write minimal implementation**

Add `sortMode`/`sortField`/`sortOrder`/`multiSortMeta`/`onSort` props (all optional — controlled only when the caller supplies `sortField`/`onSort`, matching spec §16's React controlled/uncontrolled duality); compute a `sortedValue` via `useMemo` cloning `value` before sorting; bind `aria-sort` and an `onClick` on each `th` calling `onSort` with the toggled field/order (or the array-of-`SortMeta` shape for multi-mode) — React never mutates its own state internally for this (per spec §4.2/§16, no internal fallback state is introduced; if `onSort` is omitted, clicking has no visible effect, matching the same "no uncontrolled fallback" pattern already verified and tested for `UPaginator`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): add UTable controlled sort with aria-sort"
```

---

### Task 13: React — filtering (object+constraints operator shape) and selection

**Files:**
- Modify: `packages/react/src/table/table.tsx`
- Test: `packages/react/src/table/table.spec.tsx` (extend)

**Interfaces:**
- Consumes: `FilterMatchMode`/`FilterMetadata` from `@ultimate/uix-data`; `equals` from `@ultimate/uix-data`
- Produces: `filters?: Record<string, FilterMetadata | { operator: 'and'|'or'; constraints: FilterMetadata[] }>` (spec §9's React object-with-constraints-array shape), `onFilter?`; `selectionMode?`, `selection?`, `onSelectionChange?`, `compareSelectionBy?` — consumed by Task 15

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/table/table.spec.tsx
describe("filtering (React object+constraints operator shape, spec §9)", () => {
  it("applies a simple FilterMetadata filter", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "ali", matchMode: "contains" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);
  });

  it("applies an operator+constraints filter with 'and' semantics", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Alison" }]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{
          name: {
            operator: "and",
            constraints: [
              { value: "ali", matchMode: "contains" },
              { value: "son", matchMode: "contains" },
            ],
          },
        }}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent).toBe("Alison");
  });
});

describe("selection", () => {
  it("calls onSelectionChange with the clicked row in single mode", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }]}
        dataKey="id"
        columns={[{ field: "name", header: "Name" }]}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />
    );
    (container.querySelector('tbody [role="row"]') as HTMLElement).click();
    expect(onSelectionChange).toHaveBeenCalledWith({ id: 1, name: "Alice" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — filters/selection props not applied

- [ ] **Step 3: Write minimal implementation**

Add `filters`/`onFilter` props; a filter-application function handling both the simple `FilterMetadata` shape and the `{operator, constraints}` shape (AND/OR across `constraints`, matching real PrimeReact's `DataTableFilterMeta` union cited in spec §9), applied via `useMemo` before sort. **Match-mode scope, matching Angular's Task 5 narrowing:** implement only `contains` (case-insensitive substring) — the only mode this task's own tests exercise. Do not implement the remaining `FilterMatchMode` values speculatively; leave a `// NEEDS IMPLEMENTATION-TIME VERIFICATION` comment at the dispatch point listing the deferred modes (`startsWith`, `notContains`, `endsWith`, `equals`, `notEquals`, `lt`/`lte`/`gt`/`gte`/`between`, `in`/`notIn`, date modes, `custom`) rather than guessing their behavior. Add `selectionMode`/`selection`/`onSelectionChange`/`compareSelectionBy` props; row `onClick` resolves next selection value and calls `onSelectionChange` (controlled — no internal selection state, matching spec §16); `aria-selected` bound by comparing each row against `selection` via `equals`/`compareSelectionBy`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): add UTable filtering (operator+constraints) and controlled selection"
```

---

### Task 14: React — keyboard navigation and accessibility vocabulary

**Files:**
- Modify: `packages/react/src/table/table.tsx`
- Test: `packages/react/src/table/table.spec.tsx` (extend)

**Interfaces:**
- Consumes: existing row/header rendering (Tasks 11-13)
- Produces: `onKeyDown` handlers on row and header-cell elements implementing arrow/home/end navigation, matching spec §15's confirmed React baseline (`BodyRow.js:163`, `HeaderCell.js:210`)

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/table/table.spec.tsx
describe("keyboard navigation", () => {
  it("ArrowDown on a row moves focus to the next row", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]}
        columns={[{ field: "name", header: "Name" }]}
      />
    );
    const rows = container.querySelectorAll('tbody [role="row"]');
    (rows[0] as HTMLElement).focus();
    (rows[0] as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
    );
    expect(document.activeElement).toBe(rows[1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — focus does not move

- [ ] **Step 3: Write minimal implementation**

Add `tabIndex={0}` and `onKeyDown` to each data row implementing ArrowDown/ArrowUp/Home/End focus movement between sibling `role="row"` elements (`ref`-based, using `currentTarget.nextElementSibling`/`previousElementSibling` or an indexed row-ref array), matching the same vocabulary already implemented for Angular in Task 7 — the mechanism differs (React refs/DOM traversal vs. Angular's `@HostListener`), the vocabulary does not.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): add UTable keyboard row navigation"
```

---

### Task 15: React — real `UPaginator` composition (Paginator only — Scroller composition split out, see below)

**Files:**
- Modify: `packages/react/src/table/table.tsx`
- Test: `packages/react/src/table/table.spec.tsx` (extend)

**Interfaces:**
- Consumes: `UPaginator` from `../paginator/paginator` (real shipped, `870883e`)
- Produces: `paginator?: boolean`, `first?: number`, `rows?: number`, `totalRecords?: number`, `onPage?` — consumed by Task 27

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/table/table.spec.tsx
describe("Paginator composition (real UPaginator, not a mock)", () => {
  it("renders a real UPaginator child and slices rows to the current page", () => {
    const rowsData = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        columns={[{ field: "name", header: "Name" }]}
        paginator
        first={0}
        rows={10}
        totalRecords={25}
        onPage={vi.fn()}
      />
    );
    expect(container.querySelector("nav")).not.toBeNull();
    expect(container.querySelectorAll("tbody td").length).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — no `nav` rendered

- [ ] **Step 3: Write minimal implementation**

Import `UPaginator`; add `paginator`/`first`/`rows`/`totalRecords`/`onPage` props. Render `<UPaginator first={first!} rows={rows!} totalRecords={totalRecords!} onPageChange={onPage!} />` beneath the table when `paginator` is true, and slice the rendered rows to `[first, first+rows)`. Real upstream evidence confirms `paginator` is not gated on virtualization state (PrimeReact `DataTable.js`: `props.paginator` checked independently of `isVirtualScrollerDisabled()` at lines 190/283/1498/1768/1857) — this task does not impose an artificial restriction preventing `paginator` from being combined with a future virtualization mode.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): compose real UPaginator into UTable"
```

---

### Task 15b: React — real `UScroller` composition (virtualization)

> **Unblocked.** `packages/react/src/scroller/scroller.tsx` now ships `contentTemplate?: (options: UScrollerContentOptions) => React.ReactNode` (merged `f022ccd`), mirroring real PrimeReact's own `contentTemplate` prop mechanism. This task composes that real render-prop.

**Files:**
- Modify: `packages/react/src/table/table.tsx`
- Test: `packages/react/src/table/table.spec.tsx` (extend)

**Interfaces:**
- Consumes: `UScroller`, `UScrollerContentOptions` from `../scroller/scroller` (real shipped, `8f8f97b`, content-template extension `f022ccd`)
- Produces: `virtualScrollerOptions?: { itemSize: number }`, `lazy?`, `onLazyLoad?` props; renders a real `<UScroller>` with a `contentTemplate` render-prop supplying Table's own `<table><tbody><tr><td>` markup when `virtualScrollerOptions` is set — consumed by Task 27

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/table/table.spec.tsx
describe("Scroller composition (real UScroller content-template mechanism, not a mock)", () => {
  it("renders a real UScroller child with real table/tbody/tr/td markup via contentTemplate when virtualScrollerOptions is provided", () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        columns={[{ field: "name", header: "Name" }]}
        virtualScrollerOptions={{ itemSize: 30 }}
      />
    );
    const table = container.querySelector("table[data-u-table-virtual-body]");
    expect(table).not.toBeNull();
    const tbody = table!.querySelector("tbody");
    expect(tbody?.parentElement).toBe(table);
    const trs = tbody!.querySelectorAll(":scope > tr");
    expect(trs.length).toBeGreaterThan(0);
    expect(trs.length).toBeLessThan(200);
    trs.forEach((tr) => expect(tr.querySelector(":scope > td")).not.toBeNull());
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — no `UScroller`/content-template-projected table markup rendered

- [ ] **Step 3: Write minimal implementation**

Import `UScroller`; add `virtualScrollerOptions`/`lazy`/`onLazyLoad` props. When `virtualScrollerOptions` is set, render:

```tsx
<UScroller
  items={sortedFilteredRows}
  itemSize={virtualScrollerOptions.itemSize}
  lazy={lazy}
  onLazyLoad={onLazyLoad}
  contentTemplate={({ items: visible, getItemOptions, itemSize }) => (
    <table data-u-table-virtual-body className={cx("table") as string}>
      <tbody className={cx("tbody") as string} role="rowgroup">
        {visible.map(({ index, value }) => (
          <tr
            key={index}
            className={cx("row") as string}
            role="row"
            style={{ position: "absolute", top: getItemOptions(index).index * itemSize, width: "100%" }}
          >
            {columns.map((col) => (
              <td key={col.field}>{String((value as Record<string, unknown>)[col.field])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )}
/>
```

replacing the plain `<tbody>` map used in Tasks 11-14 for this branch (mutually exclusive with the `paginator` branch's row source only in the sense that this is a different row-rendering strategy for the same `sortedFilteredRows` — see Angular Task 9's note on why real Table treats `virtualScroll`/`paginator` as alternative body-rendering strategies, not composable windowing layers; the same reasoning applies here). **Positioning, load-bearing detail** (same as Angular Task 9 — `UScroller`'s content wrapper does not position consumer-supplied markup for free): each `<tr>` gets an explicit `top: getItemOptions(index).index * itemSize` inline style using the real absolute index, matching the technique `UScroller`'s own built-in item rendering uses. Omitting this renders all visible rows stacked at the top of the scroll container regardless of scroll position.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/table.spec.tsx
git commit -m "feat(react): compose real UScroller contentTemplate render-prop into UTable for virtualization"
```

---

### Task 16: React — row/cell editing, row grouping, package export

**Files:**
- Modify: `packages/react/src/table/table.tsx`
- Create: `packages/react/src/table/index.ts`
- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/tsup.config.ts`
- Modify: `packages/react/package.json` (`exports` map + `description`)
- Test: `packages/react/src/table/table.spec.tsx` (extend)

**Interfaces:**
- Consumes: existing Table state (Tasks 11-15)
- Produces: `editMode?`, `editingRows?` (controlled/uncontrolled via `onRowEditChange` presence, per spec §11.2), always-internal `editingMeta` state; `rowGroupMode?`, `groupRowsBy?`; `UTable` exported from `packages/react/src/table/index.ts`, `@ultimate/react` root, and `@ultimate/react/table`

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/table/table.spec.tsx
describe("row editing (controlled editingRows, spec §11.2)", () => {
  it("calls onRowEditChange with the computed next editingRows when row edit is initiated", () => {
    const onRowEditChange = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }]}
        dataKey="id"
        columns={[{ field: "name", header: "Name" }]}
        editMode="row"
        editingRows={{}}
        onRowEditChange={onRowEditChange}
      />
    );
    (container.querySelector("[data-u-table-row-edit-init]") as HTMLElement).click();
    expect(onRowEditChange).toHaveBeenCalledWith({ "1": true });
  });
});

describe("row grouping (SortMeta-reuse convention, spec §13)", () => {
  it("groups adjacent rows sharing the same groupRowsBy value under subheader mode", () => {
    const { container } = render(
      <UTable<{ group: string; name: string }>
        value={[
          { group: "a", name: "Alice" },
          { group: "a", name: "Amy" },
          { group: "b", name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        rowGroupMode="subheader"
        groupRowsBy="group"
      />
    );
    expect(container.querySelectorAll("[data-u-table-group-header]").length).toBe(2);
  });
});

describe("package export", () => {
  it("is exported from its own subpath index", () => {
    // import added at top: import { UTable as SubpathExport } from "./index";
    expect(SubpathExport).toBe(UTable);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: FAIL — `onRowEditChange` not called, no group headers, `SubpathExport` undefined

- [ ] **Step 3: Write minimal implementation**

Add `editMode`/`editingRows`/`onRowEditChange`/`onRowEditInit`/`onRowEditSave`/`onRowEditCancel`/`cellEditValidator`/`onCellEditComplete`/`onCellEditCancel` props (per spec §4.2); a row-edit-init affordance (`data-u-table-row-edit-init` button per row when `editMode="row"`) computing the next `editingRows` key-map/array (key-map when `dataKey` set, matching React's real `BodyRow.js:314-338`-derived rule already documented in spec §11.2) and calling `onRowEditChange` if supplied, else falling back to internal `useState` (matching spec §11.2's controlled/uncontrolled duality exactly). Cell-edit dirty-value tracking (`editingMeta`, always-internal `useState`, keyed by `dataKey`-or-`rowIndex` per spec §11.2) is scaffolded as internal state but its full validator-wiring UI is `NEEDS IMPLEMENTATION-TIME VERIFICATION`-deferred beyond this task's row-edit-lifecycle scope, matching Angular Task 10's equivalent scope decision for symmetry.

Add `rowGroupMode`/`groupRowsBy` props with the same `SortMeta`-injection + `equals`-boundary-detection algorithm as Angular's Task 10.

Create `packages/react/src/table/index.ts`:

```typescript
export { UTable } from "./table";
export type { UTableProps, UTableColumn } from "./table";
```

Read `packages/react/src/index.ts`, add `export * from "./table";`. Add `"table/index": "src/table/index.ts"` to `tsup.config.ts`'s `entry`. Add a `"./table"` entry to `package.json`'s `exports` map matching the existing `"./paginator"` entry's shape. Update `"description"` to `"Ultimate Platform React components: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip."`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- table.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/table/table.tsx packages/react/src/table/index.ts packages/react/src/index.ts packages/react/tsup.config.ts packages/react/package.json packages/react/src/table/table.spec.tsx
git commit -m "feat(react): add UTable row editing, row grouping, and package exports"
```

---

## Task Group D — Vue (`@ultimate/vue`) — Core Grid, Sort, Selection, Pagination Composition

### Task 17: Scaffold `UTable` — `createBaseComponent`, `value`/columns render

**Files:**
- Create: `packages/vue/src/table/base-table.ts`
- Create: `packages/vue/src/table/Table.vue`
- Create: `packages/vue/src/table/table-style.ts`
- Test: `packages/vue/src/table/table.spec.ts`

**Interfaces:**
- Consumes: `createBaseComponent` from `@ultimate/vue-core`; `style` from `@ultimate/uix-styles/table`
- Produces: `UTable` SFC with props `value: { type: Array, default: () => [] }`, `dataKey: String`, `columns: { type: Array, default: () => [] }` — consumed by Task 18

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/table/table.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UTable from "./Table.vue";

describe("UTable", () => {
  it("renders one row per value entry with role=row and a columnheader per column", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        columns: [{ field: "name", header: "Name" }],
      },
    });
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThanOrEqual(2);
    expect(wrapper.find('[role="columnheader"]').text()).toBe("Name");
  });

  it("root has role=table", () => {
    const wrapper = mount(UTable, { props: { value: [], columns: [] } });
    expect(wrapper.find('[role="table"]').exists()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — `Cannot find module './Table.vue'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/vue/src/table/table-style.ts
import { style as tableStyle } from "@ultimate/uix-styles/table";

const css = /*css*/ `
    ${tableStyle}
`;

const classes = {
  root: () => "u-table u-component",
  table: () => "u-table-table",
  thead: () => "u-table-thead",
  tbody: () => "u-table-tbody",
  row: (params: { selected?: boolean } = {}) => ["u-table-row", { "u-table-row-selected": params.selected }],
};

export const tableStyleModule = { css, classes };
```

```typescript
// packages/vue/src/table/base-table.ts
import { createBaseComponent } from "@ultimate/vue-core";
import { tableStyleModule } from "./table-style";
import type { ComponentOptions } from "vue";

export function createBaseTable(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "table", styleModule: tableStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      dataKey: { type: String, default: "" },
      columns: { type: Array, default: () => [] },
    },
  };
}
```

```vue
<!-- packages/vue/src/table/Table.vue -->
<template>
  <div :class="cx('root')" role="table">
    <table :class="cx('table')">
      <thead :class="cx('thead')" role="rowgroup">
        <tr role="row">
          <th v-for="col in columns" :key="col.field" role="columnheader">{{ col.header }}</th>
        </tr>
      </thead>
      <tbody :class="cx('tbody')" role="rowgroup">
        <tr v-for="(row, index) in value" :key="index" :class="cx('row')" role="row">
          <td v-for="col in columns" :key="col.field">{{ row[col.field] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { createBaseTable } from "./base-table";

export default {
  name: "UTable",
  extends: createBaseTable(),
};
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/base-table.ts packages/vue/src/table/Table.vue packages/vue/src/table/table-style.ts packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): scaffold UTable with row/column rendering"
```

---

### Task 18: Vue — sorting (props + `@sort` emit)

**Files:**
- Modify: `packages/vue/src/table/base-table.ts`
- Modify: `packages/vue/src/table/Table.vue`
- Test: `packages/vue/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `SortMeta`/`SortMode` from `@ultimate/uix-data`
- Produces: props `sortMode`, `sortField`, `sortOrder`, `multiSortMeta`; emit `sort`; computed `sortedValue` — consumed by Task 21 (Paginator composition)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/table/table.spec.ts
describe("sorting", () => {
  it("renders rows pre-sorted by sortField/sortOrder without mutating the value prop", () => {
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    const wrapper = mount(UTable, {
      props: { value: original, columns: [{ field: "name", header: "Name" }], sortField: "name", sortOrder: 1 },
    });
    const cells = wrapper.findAll("td");
    expect(cells[0].text()).toBe("Alice");
    expect(original[0].name).toBe("Bob");
  });

  it("sets aria-sort on the active sortField's columnheader and emits sort on click", async () => {
    const wrapper = mount(UTable, {
      props: { value: [{ id: 1, name: "Alice" }], columns: [{ field: "name", header: "Name" }], sortField: "name", sortOrder: -1 },
    });
    const header = wrapper.find('[role="columnheader"]');
    expect(header.attributes("aria-sort")).toBe("descending");
    await header.trigger("click");
    expect(wrapper.emitted("sort")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — no sorting applied, `aria-sort` absent

- [ ] **Step 3: Write minimal implementation**

Add `sortMode`/`sortField`/`sortOrder`/`multiSortMeta` props to `base-table.ts`; add `sort` to `emits`. In `Table.vue`, add a `sortedValue` computed (clones before sorting), bind `:aria-sort` on `th`, and `@click` calling a `sortColumn(field)` method that computes the next sort state and `this.$emit("sort", {...})` (matching spec §16's Vue Options-API-plus-emit idiom — Vue's Table does not mutate `sortField`/`sortOrder` props directly, since props are one-way; the parent is expected to feed the emitted value back via `v-model:sortField`/`v-model:sortOrder` bindings if it wants persistence, matching the same pattern already established by Paginator's `update:first`/`update:rows`).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/base-table.ts packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): add UTable sort with aria-sort and sort emit"
```

---

### Task 19: Vue — filtering (object+constraints operator shape) and selection

**Files:**
- Modify: `packages/vue/src/table/base-table.ts`
- Modify: `packages/vue/src/table/Table.vue`
- Test: `packages/vue/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `FilterMatchMode`/`FilterMetadata`, `equals` from `@ultimate/uix-data`
- Produces: prop `filters` (object+constraints shape, same as React per spec §9), emit `filter`; prop `selectionMode`, `v-model:selection`, `compareSelectionBy` — consumed by Task 21

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/table/table.spec.ts
describe("filtering (Vue object+constraints operator shape, spec §9)", () => {
  it("applies a simple FilterMetadata filter", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "ali", matchMode: "contains" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);
  });
});

describe("selection", () => {
  it("emits update:selection with the clicked row in single mode", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }],
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "single",
      },
    });
    await wrapper.find('tbody [role="row"]').trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([{ id: 1, name: "Alice" }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — filters/selection not applied

- [ ] **Step 3: Write minimal implementation**

Add `filters` prop (same shape/semantics as React's Task 13) and `filter` emit; a `filteredValue` computed applying the same operator+constraints logic as React, scoped to the same narrowed match-mode set as React's Task 13 (`contains` only — the sole mode this task's own test exercises; the same deferred-modes list applies here, unimplemented, not guessed). Add `selectionMode`/`selection`/`compareSelectionBy` props, `update:selection` (and `selection`) to `emits`; row `@click` resolves next selection and `this.$emit("update:selection", next)` plus `this.$emit("selection-change", next)` (mirroring the plain-event-plus-`v-model` dual-emit pattern already used by Paginator's `page` + `update:first`/`update:rows`); `:aria-selected` bound via `equals`/`compareSelectionBy` comparison against the `selection` prop.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/base-table.ts packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): add UTable filtering (operator+constraints) and v-model selection"
```

---

### Task 20: Vue — keyboard navigation and accessibility vocabulary

**Files:**
- Modify: `packages/vue/src/table/Table.vue`
- Test: `packages/vue/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: existing row/header rendering (Tasks 17-19)
- Produces: `@keydown` handlers on row/header elements implementing arrow/home/end navigation, matching spec §15's confirmed Vue baseline (`HeaderCell.vue:11,239`)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/table/table.spec.ts
describe("keyboard navigation", () => {
  it("ArrowDown on a row moves focus to the next row", async () => {
    const wrapper = mount(UTable, {
      attachTo: document.body,
      props: {
        value: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        columns: [{ field: "name", header: "Name" }],
      },
    });
    const rows = wrapper.findAll('tbody [role="row"]');
    (rows[0].element as HTMLElement).focus();
    await rows[0].trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[1].element);
    wrapper.unmount();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — focus does not move

- [ ] **Step 3: Write minimal implementation**

Add `tabindex="0"` and `@keydown` to each `tr` in the tbody, implementing ArrowDown/ArrowUp/Home/End focus movement via `$el.nextElementSibling`/`previousElementSibling`, matching the same vocabulary as Angular Task 7 and React Task 14.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): add UTable keyboard row navigation"
```

---

### Task 21: Vue — real `UPaginator` composition (Paginator only — Scroller composition split out, see below)

**Files:**
- Modify: `packages/vue/src/table/base-table.ts`
- Modify: `packages/vue/src/table/Table.vue`
- Test: `packages/vue/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `UPaginator` from `../paginator/Paginator.vue` (real shipped, `870883e`)
- Produces: props `paginator`, `first`, `rows`, `totalRecords`, `rowsPerPageOptions`; emit `page` — consumed by Task 27

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/table/table.spec.ts
describe("Paginator composition (real UPaginator, not a mock)", () => {
  it("renders a real UPaginator child and slices rows to the current page", () => {
    const rowsData = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        paginator: true,
        first: 0,
        rows: 10,
        totalRecords: 25,
      },
    });
    expect(wrapper.find("nav").exists()).toBe(true);
    expect(wrapper.findAll("tbody td").length).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — no `nav` rendered

- [ ] **Step 3: Write minimal implementation**

Import `UPaginator`, register as local `components: { UPaginator }`. Add `paginator`/`first`/`rows`/`totalRecords`/`rowsPerPageOptions` props and `page` to `emits`. Template renders `<UPaginator v-if="paginator" :first="first" :rows="rows" :totalRecords="totalRecords" @page="onPaginatorPage" />` beneath the table, slicing rendered rows to `[first, first+rows)`. Real upstream evidence (PrimeVue `DataTable.vue`: `<DTPaginator v-if="paginatorTop" .../>` gated only on `paginatorTop`/`paginatorBottom`, independent of `virtualScrollerDisabled`) confirms `paginator` is not gated on virtualization state — this task does not impose an artificial restriction against combining `paginator` with a future virtualization mode.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/base-table.ts packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): compose real UPaginator into UTable"
```

---

### Task 21b: Vue — real `UScroller` composition (virtualization)

> **Unblocked.** `packages/vue/src/scroller/Scroller.vue` now ships a `content` scoped slot (merged `1ae29ec`, windowed-path test fix `343816a`), mirroring real PrimeVue's own `content` scoped-slot mechanism. This task composes that real slot.

**Files:**
- Modify: `packages/vue/src/table/base-table.ts`
- Modify: `packages/vue/src/table/Table.vue`
- Test: `packages/vue/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: `UScroller` from `../scroller/Scroller.vue` (real shipped, `8f8f97b`, content-template extension `1ae29ec`)
- Produces: `virtualScrollerOptions`, `lazy` props; emit `lazy-load`; renders a real `<UScroller>` with a `#content` scoped-slot template supplying Table's own `<table><tbody><tr><td>` markup when `virtualScrollerOptions` is set — consumed by Task 27

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/table/table.spec.ts
describe("Scroller composition (real UScroller content-template mechanism, not a mock)", () => {
  it("renders a real UScroller child with real table/tbody/tr/td markup via its #content slot when virtualScrollerOptions is provided", () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        virtualScrollerOptions: { itemSize: 30 },
      },
    });
    const table = wrapper.find("table[data-u-table-virtual-body]");
    expect(table.exists()).toBe(true);
    const tbody = table.find("tbody");
    expect(tbody.element.parentElement).toBe(table.element);
    const trs = tbody.element.querySelectorAll(":scope > tr");
    expect(trs.length).toBeGreaterThan(0);
    expect(trs.length).toBeLessThan(200);
    trs.forEach((tr) => expect(tr.querySelector(":scope > td")).not.toBeNull());
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — no `UScroller`/content-slot-projected table markup rendered

- [ ] **Step 3: Write minimal implementation**

Import `UScroller`, register as local `components: { UScroller }`. Add `virtualScrollerOptions`/`lazy` props and `lazy-load` emit. When `virtualScrollerOptions` is set, template renders:

```html
<UScroller
  v-if="virtualScrollerOptions"
  :items="sortedFilteredRows"
  :item-size="virtualScrollerOptions.itemSize"
  :lazy="lazy"
  @lazy-load="$emit('lazy-load', $event)"
>
  <template #content="slotProps">
    <table data-u-table-virtual-body :class="cx('table')">
      <tbody :class="cx('tbody')" role="rowgroup">
        <tr
          v-for="entry in slotProps.items"
          :key="entry.index"
          :class="cx('row')"
          role="row"
          :style="{ position: 'absolute', top: slotProps.getItemOptions(entry.index).index * slotProps.itemSize + 'px', width: '100%' }"
        >
          <td v-for="col in columns" :key="col.field">{{ entry.value[col.field] }}</td>
        </tr>
      </tbody>
    </table>
  </template>
</UScroller>
```

replacing the plain `tbody` row loop used in Tasks 17-20 for this branch (same "alternative body-rendering strategy, not a stacked windowing layer" reasoning as Angular Task 9/React Task 15b — real upstream Table treats `virtualScroll`/`paginator` as alternatives around the same filtered+sorted data). **Positioning, load-bearing detail** (same as Angular Task 9/React Task 15b): each `<tr>` gets an explicit `top` inline style computed from `slotProps.getItemOptions(entry.index).index * slotProps.itemSize` — the real absolute index — matching the technique `UScroller`'s own built-in item rendering uses (note Vue's scoped-slot props are destructured camelCase — `getItemOptions`/`itemSize` — even though the parent binds them kebab-case via `:get-item-options`/`:item-size`, confirmed by the Scroller extension plan's own compiled-template verification). Omitting this renders all visible rows stacked at the top of the scroll container regardless of scroll position.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/base-table.ts packages/vue/src/table/Table.vue packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): compose real UScroller content scoped-slot into UTable for virtualization"
```

---

### Task 22: Vue — row/cell editing (`v-model:editingRows` array), row grouping, package export

**Files:**
- Modify: `packages/vue/src/table/base-table.ts`
- Modify: `packages/vue/src/table/Table.vue`
- Create: `packages/vue/src/table/index.ts`
- Modify: `packages/vue/src/index.ts`
- Modify: `packages/vue/package.json` (`description`, `exports` map if per-component subpaths exist — verify against Paginator/Scroller's actual `package.json` entries first)
- Test: `packages/vue/src/table/table.spec.ts` (extend)

**Interfaces:**
- Consumes: existing Table state (Tasks 17-21)
- Produces: prop `editingRows` (`Array`, per spec §11.3), emit `update:editingRows`; internal `d_editingRowKeys`/`d_editingMeta`; props `rowGroupMode`/`groupRowsBy`; `UTable` exported from `packages/vue/src/table/index.ts` and package root

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/table/table.spec.ts
describe("row editing (v-model:editingRows array, spec §11.3)", () => {
  it("emits update:editingRows with the row appended when row edit is initiated", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }],
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        editMode: "row",
        editingRows: [],
      },
    });
    await wrapper.find("[data-u-table-row-edit-init]").trigger("click");
    expect(wrapper.emitted("update:editingRows")?.[0]).toEqual([[{ id: 1, name: "Alice" }]]);
  });
});

describe("row grouping (SortMeta-reuse convention, spec §13)", () => {
  it("groups adjacent rows sharing the same groupRowsBy value under subheader mode", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { group: "a", name: "Alice" },
          { group: "a", name: "Amy" },
          { group: "b", name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        rowGroupMode: "subheader",
        groupRowsBy: "group",
      },
    });
    expect(wrapper.findAll("[data-u-table-group-header]").length).toBe(2);
  });
});

describe("package export", () => {
  it("is exported from the package root", async () => {
    const { UTable: RootExport } = await import("../index");
    expect(RootExport).toBe(UTable);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: FAIL — `update:editingRows` not emitted, no group headers, root export missing

- [ ] **Step 3: Write minimal implementation**

Add `editMode`/`editingRows` (Array prop, default `() => []`) to `base-table.ts`; add `update:editingRows` to `emits`. In `Table.vue`, add a `d_editingRowKeys` computed/derived-on-change field (rebuilt via `dataKey`-resolved lookup whenever `editMode === 'row'`, matching real PrimeVue's `updateEditingRowKeys()` cited in spec §11.3) and a row-edit-init button (`data-u-table-row-edit-init`) per row that appends the row to `editingRows` and `this.$emit("update:editingRows", next)`. Scaffold `d_editingMeta` as internal Vue reactive `data()` state keyed by `rowIndex` only (matching spec §11.3's confirmed real-source finding — never `dataKey`-resolved, unlike React); full cell-edit validator wiring is deferred the same way as Angular Task 10 / React Task 16, for symmetry.

Add `rowGroupMode`/`groupRowsBy` props with the same algorithm as Tasks 10/16.

Create `packages/vue/src/table/index.ts`:

```typescript
export { default as UTable } from "./Table.vue";
```

Read `packages/vue/src/index.ts` to confirm its existing re-export pattern (matching Paginator's/Scroller's own `index.ts`), add the Table equivalent. Update `packages/vue/package.json`'s `"description"` to add "Table" to the component list, and add a `"./table"` `exports` entry only if Paginator/Scroller already have per-component `exports` subpaths in this package (verify first — Vue's package.json export granularity may differ from React's, per spec §20's flagged `NEEDS IMPLEMENTATION-TIME VERIFICATION` item; match whatever convention Paginator/Scroller actually established, do not invent a new one).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/table/base-table.ts packages/vue/src/table/Table.vue packages/vue/src/table/index.ts packages/vue/src/index.ts packages/vue/package.json packages/vue/src/table/table.spec.ts
git commit -m "feat(vue): add UTable row editing, row grouping, and package exports"
```

---

## Task Group E — Cross-Framework Integration, Verification, Provenance

### Task 23: Cross-framework theme-token consistency test for Table

**Files:**
- Modify: `packages/themes/test/cross-framework-consistency.test.ts`

**Interfaces:**
- Consumes: real `UTable` from all three frameworks; `dt('table.*')`/`dt('datatable.*')` token resolution
- Produces: a new describe block proving `dt('<token>')` resolves to an identical `var(--u-table-<token>, ...)` (or whatever the real token naming convention turns out to be once Task 1's ported file is read in full — verify the exact dotted-path-to-CSS-var derivation against the same mechanism already proven for Paginator/Scroller in this same test file, do not assume the prefix without checking) regardless of which framework's Table registered it, mounted via real components (not mocks) — matching the file's own existing Paginator/Scroller blocks exactly in structure

- [ ] **Step 1: Write the failing test**

Read `packages/themes/test/cross-framework-consistency.test.ts`'s existing Paginator block first (structure precedent), then add an equivalent `describe("Table", ...)` block mounting real `UTable` from `@ultimate/ng`, `@ultimate/react`, `@ultimate/vue`, asserting at least 3 representative token names (e.g. a background/border/row-selected token, chosen once the real ported file's actual token names are known from Task 1) resolve to identical `var(...)` strings across all three frameworks' registered StyleSheets.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/themes test -- cross-framework-consistency.test.ts`
Expected: FAIL — Table not yet registered/tested

- [ ] **Step 3: Write minimal implementation**

No production code changes — this task only adds the test, which should already pass once Tasks 1/2/11/17 have registered Table's style module in all three frameworks (if it does not pass, that signals a real registration-order or token-naming defect introduced earlier in the plan, to be fixed in the file where it actually originated, not patched around here).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/themes test -- cross-framework-consistency.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/cross-framework-consistency.test.ts
git commit -m "test(themes): verify UTable cross-framework token consistency"
```

---

### Task 24: Cross-framework real-child-composition verification test

**Files:**
- Create (per framework, alongside existing spec files) or extend: `packages/ng/src/table/table.spec.ts`, `packages/react/src/table/table.spec.tsx`, `packages/vue/src/table/table.spec.ts` — a final, explicitly-labeled block in each confirming the mounted Paginator instance is the real class/component, not a test double

**Interfaces:**
- Consumes: `UPaginator`, `UScroller` (real, all three frameworks — `UScroller` composition now unblocked via Tasks 9/15b/21b)
- Produces: a genuine runtime-composition assertion for Angular and Vue (both frameworks' test utilities expose a real handle to the mounted child instance/component); for React, a `vi.spyOn`-based call-site verification that actually proves runtime usage (not just import presence), since React Testing Library's `render()` does not expose fiber-level component-instance identity the way `TestBed.debugElement`/`@vue/test-utils`'s `findComponent` do — this correction replaces the plan's earlier weaker `typeof UPaginator === "function"` assertion, which proved only that the import resolved, not that `UTable` actually renders it. Both `UPaginator` and `UScroller` get this treatment per framework — the plan's original single-component version predates `UScroller`'s unblocking and is extended here, not left as a Paginator-only check.

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/table/table.spec.ts
import { UPaginator } from "../paginator/paginator";

it("composes the real UPaginator class (debugElement query, not a DOM-only check)", () => {
  const fixture = TestBed.createComponent(UTable<Row>);
  fixture.componentRef.setInput("value", [{ id: 1, name: "Alice" }]);
  fixture.componentRef.setInput("paginator", true);
  fixture.componentRef.setInput("rows", 10);
  fixture.componentRef.setInput("totalRecords", 1);
  fixture.detectChanges();
  // fixture.debugElement.query() walks the real component tree Angular
  // constructed — componentInstance here is the actual instantiated
  // UPaginator class, not a DOM lookalike, so `instanceof` is a genuine
  // runtime-composition proof (stronger than the earlier module-import check).
  const paginatorDebugEl = fixture.debugElement.query((de) => de.componentInstance instanceof UPaginator);
  expect(paginatorDebugEl).not.toBeNull();
});
```

```typescript
// append to packages/ng/src/table/table.spec.ts
import { UScroller } from "../scroller/scroller";

it("composes the real UScroller class (debugElement query, not a DOM-only check)", () => {
  const fixture = TestBed.createComponent(UTable<Row>);
  fixture.componentRef.setInput("value", Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` })));
  fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
  fixture.componentRef.setInput("virtualScroll", true);
  fixture.componentRef.setInput("virtualScrollItemSize", 30);
  fixture.detectChanges();
  const scrollerDebugEl = fixture.debugElement.query((de) => de.componentInstance instanceof UScroller);
  expect(scrollerDebugEl).not.toBeNull();
});
```

```tsx
// append to packages/react/src/table/table.spec.tsx
import * as PaginatorModule from "../paginator/paginator";
import * as ScrollerModule from "../scroller/scroller";

it("actually invokes the real UPaginator function during render (spy-based runtime proof, not just import presence)", () => {
  // Spying on the real module's export and rendering through it is the
  // closest React Testing Library gets to proving runtime composition
  // without reaching into React internals (no public fiber-walking API
  // exists in RTL's `render()` result). This is a genuinely weaker
  // guarantee than Angular's/Vue's instance-identity checks below — it
  // proves UTable's render path calls the same function reference
  // `../paginator/paginator` exports, not that no parallel copy of that
  // function exists elsewhere; that stronger claim is out of reach with
  // RTL alone. The real behavioral proof for React composition remains
  // Task 15's DOM-shape assertions (rendered `<nav>` + working page-click
  // behavior) — this test is a narrower, additional regression guard on
  // top of that, not a replacement for it.
  const paginatorSpy = vi.spyOn(PaginatorModule, "UPaginator");
  render(
    <UTable<Row>
      value={[{ id: 1, name: "Alice" }]}
      columns={[{ field: "name", header: "Name" }]}
      paginator
      rows={10}
      totalRecords={1}
      onPage={vi.fn()}
    />
  );
  expect(paginatorSpy).toHaveBeenCalled();
});

it("actually invokes the real UScroller function during render when virtualScroll is used (spy-based runtime proof)", () => {
  const scrollerSpy = vi.spyOn(ScrollerModule, "UScroller");
  const rowsData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` }));
  render(
    <UTable<Row>
      value={rowsData}
      columns={[{ field: "name", header: "Name" }]}
      virtualScrollerOptions={{ itemSize: 30 }}
    />
  );
  expect(scrollerSpy).toHaveBeenCalled();
});
```

```typescript
// append to packages/vue/src/table/table.spec.ts
import UPaginatorReal from "../paginator/Paginator.vue";
import UScrollerReal from "../scroller/Scroller.vue";

it("mounts the real Paginator.vue component, not a locally re-declared one", () => {
  const wrapper = mount(UTable, {
    props: { value: [{ id: 1, name: "Alice" }], paginator: true, rows: 10, totalRecords: 1 },
  });
  // findComponent(UPaginatorReal) resolves by the actual imported component
  // definition object, not by tag/selector — a genuine runtime-composition
  // proof, matching Angular's debugElement instanceof check in strength.
  const paginatorComponent = wrapper.findComponent(UPaginatorReal);
  expect(paginatorComponent.exists()).toBe(true);
});

it("mounts the real Scroller.vue component (via its content slot), not a locally re-declared one", () => {
  const rowsData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` }));
  const wrapper = mount(UTable, {
    props: {
      value: rowsData,
      columns: [{ field: "name", header: "Name" }],
      virtualScrollerOptions: { itemSize: 30 },
    },
  });
  const scrollerComponent = wrapper.findComponent(UScrollerReal);
  expect(scrollerComponent.exists()).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run each framework's test filter; expected FAIL only if Tasks 8/9/15/15b/21/21b actually used a different/local component — if these pass immediately (likely, since those tasks already import the real components), this task still adds durable regression coverage and should be committed as a genuine addition, not skipped. Note: React's `vi.spyOn(PaginatorModule, "UPaginator")`/`vi.spyOn(ScrollerModule, "UScroller")` require the export to be a mutable named export (function declarations reassigned via `export const UPaginator = ...`/`export const UScroller = React.forwardRef(...)` are spy-able via the namespace import shown above); if Vitest's ESM interop makes the module read-only in this repo's config, fall back to `vi.mock(...)` with `vi.importActual` to preserve real behavior while still recording the call — verify which approach this repo's existing Vitest config actually supports before writing the real test (check whether any other `.spec.tsx` file in this repo already uses `vi.spyOn` on a named ESM export; match that established pattern rather than guessing).

- [ ] **Step 3: Write minimal implementation**

None expected beyond the tests themselves, given the earlier tasks' real imports. If any test fails, the fix is in the earlier task's component file (import the real component), not a new abstraction here.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/table.spec.ts'` / `pnpm --filter @ultimate/react test -- table.spec.tsx` / `pnpm --filter @ultimate/vue test -- table.spec.ts`
Expected: PASS (all three)

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/table/table.spec.ts packages/react/src/table/table.spec.tsx packages/vue/src/table/table.spec.ts
git commit -m "test: verify UTable composes the real UPaginator/UScroller instances in all three frameworks"
```

---

### Task 25: Provenance manifest entries

**Files:**
- Modify: `docs/architecture/provenance/uix-styles.json`
- Modify: `docs/architecture/provenance/ng.json`
- Modify: `docs/architecture/provenance/react.json`
- Modify: `docs/architecture/provenance/vue.json`

**Interfaces:**
- Consumes: none
- Produces: one entry per new/modified source file created by Tasks 1-22, using the existing `originalPath`/`ultimateDestination`/`modificationStatus`/`modificationDescription` schema — verified this planning pass to be the only real convention (no per-component provenance file exists in this repo)

- [ ] **Step 1: Write the failing test**

Run `pnpm run provenance:validate -- --base-ref origin/main` against the branch's actual diff once Tasks 1-22 are committed — this is the real validator, not a new test file; a missing entry for any new source file is the "failing" signal for this task.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: FAIL — new `table`/`Table` files in `ng`/`react`/`vue`/`uix-styles` have no manifest entry

- [ ] **Step 3: Write minimal implementation**

Append entries to each of the four JSON files for every new file: `packages/uix-styles/src/table/index.ts` (adapted from `.vendor-extracted/uix-styles-components/src/datatable/index.ts`, `modificationStatus: "adapted"`); `packages/ng/src/table/{table.ts,table-style.ts,index.ts}` (adapted from PrimeNG `table.ts`, commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`, per spec §21); `packages/react/src/table/{table.tsx,table-style.ts,index.ts}` (adapted from PrimeReact `DataTable.js`, commit `d0f574e39122668292fc7a740f081bae1b93b1e9`); `packages/vue/src/table/{Table.vue,base-table.ts,table-style.ts,index.ts}` (adapted from PrimeVue `DataTable.vue`, commit `66dde6788220fc9e6822342919d1ceb0e3460ece`); all `table.spec.ts`/`table.spec.tsx` test files as `modificationStatus: "authored"` (Ultimate-authored, no upstream equivalent), matching the exact pattern of the existing Paginator entries read this planning pass.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/provenance/uix-styles.json docs/architecture/provenance/ng.json docs/architecture/provenance/react.json docs/architecture/provenance/vue.json
git commit -m "docs(provenance): add table component manifest entries"
```

---

### Task 26: Package-boundary and dependency-ceiling validation

**Files:**
- None expected (verification-only task; any fix belongs in whichever earlier task's file actually violates a boundary)

**Interfaces:**
- Consumes: `scripts/provenance/validate-boundaries.mjs`, `scripts/provenance/validate-dependency-ceiling.mjs`
- Produces: a clean run confirming Table's new imports (`@ultimate/uix-data`, intra-package `../paginator/*`, `../scroller/*`) do not violate the approved dependency direction (Framework Components → Framework Core → UltimateUIX, spec §20) or the Prime-package ceiling — both the Paginator and Scroller intra-package imports are same-package (Table lives alongside both in each framework's own `packages/{ng,react,vue}` package), not a boundary crossing.

- [ ] **Step 1: Write the failing test**

Run `pnpm run boundary:validate` and `pnpm run ceiling:validate` against the full branch diff — these are the real validators already run in CI, not new test files.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run boundary:validate && pnpm run ceiling:validate`
Expected: PASS is actually expected here (Table's dependency direction is identical to Paginator/Scroller's own already-approved direction, and the intra-package Paginator/Scroller import is same-package, not a boundary crossing) — this step's "failure" case is any unexpected violation surfacing a real defect from an earlier task, to be fixed at its source.

- [ ] **Step 3: Write minimal implementation**

None expected. If a violation surfaces, fix the offending import in its originating task's file (do not add a suppression or exception).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run boundary:validate && pnpm run ceiling:validate`
Expected: PASS

- [ ] **Step 5: Commit**

No commit if no files changed (verification-only). If a fix was required, commit it with a message describing the specific boundary violation resolved.

---

### Task 27: Full test suite, typecheck, build, GAP-014 documentation update

**Files:**
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-014 status only)

**Interfaces:**
- Consumes: entire merged Table implementation (Tasks 1-26)
- Produces: a fully green `pnpm run build && pnpm run test && pnpm run typecheck` across the whole workspace; GAP-014 marked `RESOLVED` with a one-line pointer to this plan's §9-implementing tasks (5, 13, 19) as the concrete resolution evidence, per spec §25's acceptance criterion ("GAP-014 ... updated to reflect this spec's resolution at implementation-plan time")

- [ ] **Step 1: Write the failing test**

N/A — this is the plan's final whole-workspace verification gate, not a new unit test. The "failing" state is simply "not yet run since Task 22 completed."

- [ ] **Step 2: Run test to verify it fails**

Run in order: `pnpm run build`, `pnpm run test`, `pnpm run typecheck`, `pnpm run provenance:validate -- --base-ref origin/main`, `pnpm run boundary:validate`, `pnpm run ceiling:validate` (matching `.github/workflows/ci.yml`'s exact step order, confirmed this planning pass). Note: rebuild `@ultimate/uix-styles` explicitly first if any package's tests fail against a stale `dist/` — this is the same known environment-only issue documented in both the Scroller and Paginator closeout reviews (new subpath exports not yet reflected in a locally-built `dist/`), not a Table-specific defect.

- [ ] **Step 3: Write minimal implementation**

Fix any genuine failure at its source (the specific task/file responsible), not by editing this task. Once everything passes, update `docs/architecture/BLUEPRINT_GAPS.md`'s GAP-014 entry: change its status line to `RESOLVED`, add a one-sentence pointer to "Table implementation plan Tasks 5/13/19" as the evidence, matching the existing gap-closure documentation style used elsewhere in that file (read a couple of already-`RESOLVED` gap entries first, if any exist, to match the exact format — if none exist yet, follow the same field structure as GAP-014's own current `DEFERRED` entry, only changing the status and adding the resolution note).

- [ ] **Step 4: Run test to verify it passes**

Run the same six commands from Step 2 again; all must PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/BLUEPRINT_GAPS.md
git commit -m "docs(blueprint-gaps): resolve GAP-014 with Table's framework-native filter-operator implementation"
```

---

## Acceptance Criteria (restated from spec §25, mapped to this plan's tasks)

- [ ] Table's public API is defined per framework, matching spec §4 — Tasks 2-10 (Angular), 11-16 (React), 17-22 (Vue).
- [ ] `uix-data`'s six primitives are the only shared-package dependency for identity, selection vocabulary, sort metadata, simple filter metadata, pagination state, and virtualization windowing — zero new `uix-data` export. Verified: no task in this plan modifies `packages/uix-data/`.
- [ ] Filter operator/constraints uses each framework's own real-upstream-matching shape (spec §9) — Tasks 5 (Angular array-of-alternatives, `contains`/`startsWith`/`equals` only), 13 (React object+constraints, `contains` only), 19 (Vue object+constraints, `contains` only). **Narrower than spec §9's full `FilterMatchMode` vocabulary** — see "Filter scope" below.
- [ ] Row grouping is implemented as a `SortMeta`-reuse convention (spec §13), with no new shared type introduced — Tasks 10, 16, 22.
- [ ] Editing state (row and cell) is implemented per framework matching spec §11's documented real-source mechanics, with no artificial cross-framework abstraction introduced — Tasks 10, 16, 22.
- [ ] Table composes real `UPaginator` and `UScroller` component instances in every framework (spec §14) — Paginator: Tasks 8 (Angular), 15 (React), 21 (Vue); Scroller: Tasks 9 (Angular), 15b (React), 21b (Vue), using `UScroller`'s real content-template mechanism (shipped `3204f38`..`c2be17b`); re-verified explicitly by Task 24 for both.
- [ ] Accessibility vocabulary (`role`, `aria-sort`, keyboard navigation) matches spec §15's confirmed cross-framework baseline — Tasks 2-3, 6-7 (Angular), 11-12, 14 (React), 17-18, 20 (Vue).
- [ ] Every `NEEDS IMPLEMENTATION-TIME VERIFICATION` item in spec §24 that this plan's scope touches is resolved with a cited real-source reference during implementation, or explicitly re-flagged if still unresolved — see "Unresolved / deferred within this plan's scope" below.
- [ ] `docs/architecture/BLUEPRINT_GAPS.md`'s GAP-014 is updated to reflect this plan's resolution — Task 27.
- [ ] Provenance manifest entries exist for every Table source file per framework, following the existing schema — Task 25.

### Verification commands for the complete merged state

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm run provenance:validate -- --base-ref origin/main
pnpm run boundary:validate
pnpm run ceiling:validate
```

(Matches `.github/workflows/ci.yml`'s real step order, confirmed this planning pass; `lint`/`format:check` also run in CI but are omitted here as out of this plan's functional-verification scope — run `pnpm run lint && pnpm run format:check` too before considering the branch merge-ready.)

### Filter scope (corrected)

Tasks 5 (Angular), 13 (React), 19 (Vue) implement only the string match modes each task's own tests exercise: Angular `contains`/`startsWith`/`equals`; React/Vue `contains` only (their `{operator, constraints}` structural shape is fully implemented — only the per-mode predicate dispatch is narrowed). All other `FilterMatchMode` values (`notContains`, `endsWith`, `notEquals`, the six numeric/range modes, `in`/`notIn`, the four date modes, `custom`) are explicitly **not implemented** by this plan — each task leaves a `NEEDS IMPLEMENTATION-TIME VERIFICATION` marker at the dispatch point rather than guessing behavior for them. `custom`'s real upstream contract (a per-column predicate callback) was not independently re-verified this pass and must not be implemented without that verification. This is narrower than spec §9's citation of the full shared `FilterMatchMode` vocabulary as available — the vocabulary is available for future extension, but this plan only wires the subset it can back with real tests.

### `UScroller` composition — resolved

An earlier planning pass found that `UScroller`'s then-shipped API rendered each item as a fixed `<div>{{value}}</div>`/`<div>{String(value)}</div>` with no content-projection mechanism, blocking Table's composition. **This is now resolved.** A dedicated architecture research pass (real pinned PrimeNG/PrimeReact/PrimeVue Table↔Scroller composition source) found that real Table composes Scroller via a content-level template/render-prop/scoped-slot mechanism — not per-item templating — and a separate, reviewed, merged plan (`docs/superpowers/plans/2026-09-02-scroller-content-template-extension.md`) extended `UScroller` in all three frameworks with exactly that mechanism, additively, matching the cited real upstream mechanism per framework: Angular `@ContentChild('content', {descendants: false})` + `ngTemplateOutlet` (`3204f38`, `descendants: false` fix `c2be17b`); React `contentTemplate` render-prop (`f022ccd`); Vue `content` scoped slot (`1ae29ec`, windowed-path test fix `343816a`). Tasks 9 (Angular), 15b (React), 21b (Vue) now compose this real mechanism, resolving Option 1 from the earlier decision (the option that preserves `table → tbody → tr → td` semantics through composition). Table's `paginator`-based composition (Tasks 8/15/21) was always unaffected and remains fully specified.

### Mutual exclusivity — rejected

The original draft of this plan implemented `paginator` and `virtualScroll` as mutually exclusive (`@if/@else if`). Re-verified against real pinned source this review pass: PrimeNG `table.ts` gates `<p-paginator>` only on `*ngIf="paginator && ..."` (lines 152, 304), independent of `*ngIf="virtualScroll"` on `<p-scroller>` (line 193) — both can render simultaneously. PrimeReact `DataTable.js` checks `props.paginator` independently of `isVirtualScrollerDisabled()` at multiple call sites (lines 190, 283, 1498, 1768, 1857). PrimeVue `DataTable.vue` gates `<DTPaginator>` only on `paginatorTop`/`paginatorBottom` (lines 17, 253), independent of `virtualScrollerDisabled`. **Upstream does not treat these as mutually exclusive; the plan's original restriction was an invented Ultimate-only limitation, now removed.** Tasks 8/15/21 (Paginator composition) and Tasks 9/15b/21b (Scroller composition) do not claim exclusivity with each other — both are now real, implementable tasks (see above), so this plan can ship a working simultaneous `paginator`+`virtualScroll` configuration if a consumer sets both, matching real upstream's own behavior.

### Unresolved / deferred within this plan's scope (carried forward from spec §24, not resolved by this plan)

- **Filter match-mode vocabulary beyond `contains`/`startsWith`/`equals`** — see above.
- Vue's exact cell-edit validity mechanism (spec §11.4) — this plan scaffolds `d_editingMeta`/row-edit lifecycle (Task 22) but does not implement a full validator-wiring UI; same scope decision applied symmetrically to Angular (Task 10) and React (Task 16).
- React's exact `role="columnheader"` attribute assignment — this plan adds it explicitly in Task 11 regardless, since the spec's own uncertainty was about upstream's exact source line, not whether Ultimate's own Table should have it (it should, per the strongly-convergent vocabulary requirement).
- Row/cell selection and editing ARIA states beyond `aria-selected` (spec §15) — `aria-selected` is implemented (Tasks 6, 13, 19); additional editing-state announcements are not added by this plan.
- Screen-reader live-region announcements for filter/sort/page changes (spec §15) — not added by this plan, consistent with the Paginator precedent where only Vue's Paginator itself carries a live-region (an inherited, not Table-added, behavior per this plan's Global Constraints).
- Full template/slot API surface (spec §17) — this plan's `columns: {field, header}[]` shape is deliberately minimal (matching the acceptance criteria's functional bar); a richer per-cell render-prop/slot/template system is out of this plan's scope and would be a follow-up plan.
- Sort-toggle cycling exact per-framework behavior (spec §7) — not implemented; this plan's sort click handler sets/replaces sort state directly rather than cycling through asc/desc/none.
- Package export-map granularity for Vue specifically (spec §20) — Task 22 resolves this by matching whatever Paginator/Scroller already established, not inventing a new convention.
- **Column virtualization** (frozen columns / column-level virtualization beyond what `calculateNumItemsInViewport`/`calculateLast` cover) remains out of scope per spec §1, unaffected by `UScroller`'s row-virtualization content-template mechanism resolved above — Tasks 9/15b/21b virtualize rows only, matching `UScroller`'s own shipped scope (no `columns` input on `UScroller`).

**`UScroller` composition mechanism is now resolved (see the dedicated section above)** — this was the single largest open item in the plan's earlier version, blocking Tasks 9/15b/21b and part of spec §14's composition requirement. It required, and received, a separate architecture-decision gate and a separate, reviewed, merged implementation plan (`docs/superpowers/plans/2026-09-02-scroller-content-template-extension.md`) before this plan's own tasks could be written against a real, shipped contract — not resolved by inventing an API inside this plan. Every other design decision in this plan still either restates the approved spec (§9's filter-operator shape, §13's row-grouping convention) or is an ordinary implementation-level detail resolved directly from real shipped source and this repo's established conventions (Angular signal-for-externally-mutated-state, `fixture.nativeElement`-is-host, provenance-per-package-not-per-component, `tbody`-scoped row queries to avoid header-row collisions, `UScroller`'s content-template dispatch not positioning consumer markup for free). Where the spec itself flagged `NEEDS IMPLEMENTATION-TIME VERIFICATION`, this plan either resolves it with a cited source (e.g., real `UPaginator`/`UScroller` API surfaces, confirmed this pass) or explicitly carries it forward as deferred (listed above), never silently invents a resolution — except where called out above as narrowed-and-deferred rather than fully resolved.
