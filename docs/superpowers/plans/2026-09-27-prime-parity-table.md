# Prime Parity: Table Implementation Plan (GAP-041–GAP-047)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Execution approach:** Subagent-driven development. A fresh implementer/reviewer cycle runs per task. Chosen because GAP-041 introduces a new, cross-cutting API surface (the column-renderer contract) that every later task in this plan and in GAP-042 depends on getting right — a fresh reviewer catches an inconsistent per-framework signature before it propagates.

**Goal:** Close 7 confirmed Table gaps — column-templating/rendering (GAP-041), checkbox/radio selection UI (GAP-042), row/cell editing lifecycle (GAP-043), row expansion (GAP-044), `rowGroupMode: "rowspan"` completion (GAP-045), loading/empty states (GAP-046), and keyboard selection/select-all (GAP-047) — in Angular, React, and Vue's `UTable`.

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-table-design.md`.

**GAP → Task mapping (this document's own traceability index):**

| GAP     | Task(s)                                           |
| ------- | ------------------------------------------------- |
| GAP-041 | Task 1 (Angular), Task 2 (React), Task 3 (Vue)    |
| GAP-042 | Task 4 (Angular), Task 5 (React), Task 6 (Vue)    |
| GAP-047 | Task 7 (Angular), Task 8 (React), Task 9 (Vue)    |
| GAP-046 | Task 10 (Angular), Task 11 (React), Task 12 (Vue) |
| GAP-044 | Task 13 (Angular), Task 14 (React), Task 15 (Vue) |
| GAP-045 | Task 16 (Angular), Task 17 (React), Task 18 (Vue) |
| GAP-043 | Task 19 (Angular), Task 20 (React), Task 21 (Vue) |

## Global Constraints

- **No restructuring of `columns` into child components.** Per the Spec §5.1's own resolution (confirmed during Plan-stage investigation): real PrimeNG uses table-level named templates, real PrimeReact uses child `<Column>` render-props, real PrimeVue uses child `<Column>` slots — all three disagree with each other. Ultimate's own `columns` is already a plain data array (`{field, header}[]`) in all 3 frameworks, confirmed identical shape before this plan starts. This plan extends that existing array item shape; it does not introduce a parallel template-scanning or child-component-registration mechanism.
- **Column-renderer data contract, fixed across all 3 frameworks:** `(row, options)` where `options = { field: string; rowIndex: number }`. This is the common denominator confirmed real in PrimeReact's own `body(rowData, options)` signature (`options.field`, `options.rowIndex` both present) — not invented. The renderable return type is framework-idiomatic per GAP-024's precedent: Angular a `TemplateRef`-consuming pattern via the column object holding a template reference is out — Angular signal-input components cannot accept a `TemplateRef` as a per-item array value cleanly without content projection, so Angular's own idiomatic equivalent is a plain function returning a string (simplest form) or, if richer content is needed, a function the template invokes and interpolates — **this plan's Task 1 fixes the exact Angular shape as a function returning `string` (interpolated directly into the cell), matching the Spec's own explicit allowance for framework-idiomatic divergence.** React returns `React.ReactNode`. Vue returns a VNode (or is invoked from a render function context — see Task 3).
- **No forced identical function signature name across frameworks** — Angular: `body?: (row: T, options: { field: string; rowIndex: number }) => string`; React: `body?: (row: T, options: { field: string; rowIndex: number }) => React.ReactNode`; Vue: `body?: (row: T, options: { field: string; rowIndex: number }) => VNode | string`.
- **GAP-041 → GAP-042 hard dependency, enforced by task order.** Tasks 4-6 (GAP-042) must not start before Tasks 1-3 (GAP-041) are complete and reviewed, since GAP-042's selection-column UI renders into GAP-041's own new column-renderer mechanism as its host.
- **GAP-047 confirmed independent of GAP-042** (Spec §2.5) — Tasks 7-9 may run in any order relative to Tasks 4-6.
- **GAP-046's boolean/default half (Tasks 10-12) has no dependency on GAP-041.** Only a future templated-empty-state extension (not part of this plan's own acceptance criteria — see Spec §5.6's own "soft dependency" framing) would depend on GAP-041; this plan's own Tasks 10-12 implement the boolean flag and default message only.
- **GAP-043's editing-state model is framework-native, already settled by the original Table Spec §11 — not redesigned here.** Angular uses a key-map (`editingRowKeys`, already declared as an input on line 152 of `table.ts` but never consumed); React uses controlled/uncontrolled `editingRows`; Vue uses an array-prop. Tasks 19-21 wire each framework's own already-declared-but-unconsumed input/prop into real editing behavior, not invent a new state shape.
- **No change to `packages/uix-data`'s `FilterMatchMode`/`FilterMetadata`/`SortMeta`.** No task in this plan touches filtering or sorting.
- **TreeTable's status is unaffected.** No task reads, tests, or reasons about Tree/TreeTable/TreeSelect/Angular OrganizationChart source (DECISION-D, protected).
- **Full existing Table test suite must stay green after every task.** No task modifies a pre-existing test's assertions — only additive test blocks.
- **Full monorepo test suite (`pnpm test`) must stay green after every implementation task**, verified by its own explicit step.
- **`validate-dependency-ceiling.mjs` must pass after every task** — none of these 21 tasks introduces a new dependency.

## Review Focus

- **GAP-041's column renderer receiving a `row` value that is `null`/`undefined` in a sparse dataset** — the Spec doesn't state behavior for a missing row value; a reasonable person expects the renderer to still be called (receiving `undefined`/`null` as `row[field]` would, matching the existing `resolveCell`'s own behavior of returning `undefined` for a missing key, not throwing) rather than the cell silently skipping the custom renderer.
- **GAP-042's select-all checkbox state when `value` is empty** — the Spec doesn't state whether an empty table's header checkbox is checked, unchecked, or disabled; a reasonable person expects unchecked (no rows to select, "select all" of nothing is vacuously false, matching real PrimeNG's own `isAllSelected` returning `false` for an empty array) and enabled (not disabled — a reasonable person may still expect to click it, matching real Prime's own behavior of not special-casing empty arrays for the disabled state).
- **GAP-047's Ctrl+A when `selectionMode` is unset (no selection mode active)** — the Spec ties Ctrl+A to `selectionMode: "multiple"` explicitly; a reasonable person pressing Ctrl+A on a Table with no selection mode expects nothing to happen (no error, no selection state created), not a silent no-op that still calls `preventDefault()` and swallows the browser's own native "select all text" behavior unnecessarily.
- **GAP-046's `loading` becoming `true` while rows are already selected** — the Spec doesn't state whether existing selection is cleared when loading starts; a reasonable person expects selection state to be preserved through a loading cycle (matching real PrimeNG's own behavior of never clearing `selection` on `loading` toggle) since loading typically precedes a data refresh that may still contain the same selected rows.
- **GAP-044's row-expansion key-map with a `dataKey` that doesn't uniquely identify rows** — the Spec follows the existing selection key-map's own precedent; a reasonable person with duplicate `dataKey` values expects the same behavior selection already has for duplicates (last-write-wins on the key-map, not a thrown error), not a new, stricter uniqueness check invented for expansion alone.
- **GAP-045's `rowspan` mode with `groupRowsBy` unset** — the Spec requires grouping "sharing the same grouping-field value"; a reasonable person setting `rowGroupMode: "rowspan"` without `groupRowsBy` expects the existing `"subheader"` mode's own already-established fallback behavior (no grouping applied, rows render ungrouped) to apply identically to `rowspan`, not a new error path.

---

## File Structure

No new files. Every task modifies one of these 3 existing component files (plus its co-located `.spec` file):

- `packages/ng/src/table/table.ts` + `packages/ng/src/table/table.spec.ts`
- `packages/react/src/table/table.tsx` + `packages/react/src/table/table.spec.tsx`
- `packages/vue/src/table/Table.vue` + `packages/vue/src/table/table.spec.ts`

---

### Task 1: Angular — GAP-041 column-renderer mechanism

**Files:**

- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts`

**Interfaces:**

- Produces: `UTableColumn<T>` gains an optional `body?: (row: T, options: { field: string; rowIndex: number }) => string` field. Consumed by Task 4 (GAP-042) as the mechanism selection-column UI renders through, and by Task 10 (GAP-046) for the empty-state region's own future extension (not this task's own scope).

- [ ] **Step 1: Write the failing tests**

Add to `packages/ng/src/table/table.spec.ts`, in a new `describe` block after the existing column-rendering tests:

```typescript
describe("column body renderer (Spec: 2026-09-26-prime-parity-table-design.md §5.1)", () => {
  interface Row {
    id: number;
    name: string;
    price: number;
  }

  it("renders a column's body function output instead of the raw field value", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Widget", price: 9.5 }]);
    fixture.componentRef.setInput("columns", [
      { field: "name", header: "Name" },
      { field: "price", header: "Price", body: (row: Row) => `$${row.price.toFixed(2)}` },
    ]);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("Widget");
    expect(cells[1].textContent?.trim()).toBe("$9.50");
  });

  it("passes { field, rowIndex } as the body function's second argument", () => {
    const seen: { field: string; rowIndex: number }[] = [];
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "A", price: 1 },
      { id: 2, name: "B", price: 2 },
    ]);
    fixture.componentRef.setInput("columns", [
      {
        field: "name",
        header: "Name",
        body: (row: Row, options: { field: string; rowIndex: number }) => {
          seen.push(options);
          return row.name;
        },
      },
    ]);
    fixture.detectChanges();
    expect(seen).toEqual([
      { field: "name", rowIndex: 0 },
      { field: "name", rowIndex: 1 },
    ]);
  });

  it("falls back to the raw field value when no body function is supplied", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "Widget", price: 9.5 }]);
    fixture.componentRef.setInput("columns", [{ field: "price", header: "Price" }]);
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("9.5");
  });

  it("calls the body function with undefined row[field] for a sparse row without throwing", () => {
    interface SparseRow {
      id: number;
      name?: string;
    }
    const fixture = TestBed.createComponent(UTable<SparseRow>);
    fixture.componentRef.setInput("value", [{ id: 1 }]);
    fixture.componentRef.setInput("columns", [
      { field: "name", header: "Name", body: (row: SparseRow) => row.name ?? "—" },
    ]);
    expect(() => fixture.detectChanges()).not.toThrow();
    const cells = fixture.nativeElement.querySelectorAll("td");
    expect(cells[0].textContent?.trim()).toBe("—");
  });
});
```

- [ ] **Step 2: Implement**

In `packages/ng/src/table/table.ts`:

1. Change the `columns` input's type from `input<{ field: string; header: string }[]>([])` to a named exported interface:
   ```typescript
   export interface UTableColumn<T = unknown> {
     field: string;
     header: string;
     body?: (row: T, options: { field: string; rowIndex: number }) => string;
   }
   ```
   Update `columns = input<{ field: string; header: string }[]>([])` to `columns = input<UTableColumn<T>[]>([])`.
2. Add a protected method: `protected renderCell(row: T, col: UTableColumn<T>, rowIndex: number): unknown { return col.body ? col.body(row, { field: col.field, rowIndex }) : this.resolveCell(row, col.field); }`
3. In the template, replace every `{{ resolveCell(item.value, col.field) }}` / `{{ resolveCell(entry.row, col.field) }}` cell-rendering expression with `{{ renderCell(item.value, col, $index) }}` / `{{ renderCell(entry.row, col, $index) }}` — using each `@for`'s own `$index` for `rowIndex` (the row's index within its currently-rendered loop, matching PrimeReact's own `rowIndex` semantics of "index within the current render pass," not a global dataset index under virtualization/pagination).

- [ ] **Step 3: Run tests, verify green**

Run `pnpm --filter @ultimate/ng test -- table.spec.ts`. Confirm all new tests pass and no pre-existing test's assertion changed.

- [ ] **Step 4: Full suite + dependency ceiling**

Run `pnpm test` (full monorepo) and `pnpm run ceiling:validate`. Both must pass.

---

### Task 2: React — GAP-041 column-renderer mechanism

**Files:**

- Modify: `packages/react/src/table/table.tsx`
- Test: `packages/react/src/table/table.spec.tsx`

**Interfaces:**

- Produces: `UTableColumn` gains `body?: (row: T, options: { field: string; rowIndex: number }) => React.ReactNode`.

- [ ] **Step 1: Write the failing tests**

Add to `packages/react/src/table/table.spec.tsx`:

```tsx
describe("column body renderer (Spec: 2026-09-26-prime-parity-table-design.md §5.1)", () => {
  interface Row {
    id: number;
    name: string;
    price: number;
  }

  it("renders a column's body function output instead of the raw field value", () => {
    render(
      <UTable<Row>
        value={[{ id: 1, name: "Widget", price: 9.5 }]}
        columns={[
          { field: "name", header: "Name" },
          { field: "price", header: "Price", body: (row) => `$${row.price.toFixed(2)}` },
        ]}
      />
    );
    const cells = screen.getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Widget");
    expect(cells[1]).toHaveTextContent("$9.50");
  });

  it("passes { field, rowIndex } as the body function's second argument", () => {
    const seen: { field: string; rowIndex: number }[] = [];
    render(
      <UTable<Row>
        value={[
          { id: 1, name: "A", price: 1 },
          { id: 2, name: "B", price: 2 },
        ]}
        columns={[
          {
            field: "name",
            header: "Name",
            body: (row, options) => {
              seen.push(options);
              return row.name;
            },
          },
        ]}
      />
    );
    expect(seen).toEqual([
      { field: "name", rowIndex: 0 },
      { field: "name", rowIndex: 1 },
    ]);
  });

  it("falls back to the raw field value when no body function is supplied", () => {
    render(
      <UTable<Row>
        value={[{ id: 1, name: "Widget", price: 9.5 }]}
        columns={[{ field: "price", header: "Price" }]}
      />
    );
    expect(screen.getAllByRole("cell")[0]).toHaveTextContent("9.5");
  });

  it("can return a React element from the body function", () => {
    render(
      <UTable<Row>
        value={[{ id: 1, name: "Widget", price: 9.5 }]}
        columns={[{ field: "name", header: "Name", body: (row) => <strong>{row.name}</strong> }]}
      />
    );
    expect(screen.getByText("Widget").tagName).toBe("STRONG");
  });
});
```

- [ ] **Step 2: Implement**

In `packages/react/src/table/table.tsx`:

1. Export `UTableColumn`: `export interface UTableColumn<T = unknown> { field: string; header: string; body?: (row: T, options: { field: string; rowIndex: number }) => React.ReactNode; }`. Update `UTableProps<T>`'s `columns: UTableColumn[]` to `columns: UTableColumn<T>[]`.
2. Add a module-level or component-scoped helper: `function renderCell<T>(row: T, col: UTableColumn<T>, rowIndex: number): React.ReactNode { return col.body ? col.body(row, { field: col.field, rowIndex }) : (row as Record<string, unknown>)[col.field] as React.ReactNode; }`
3. Replace every existing raw-field cell-rendering expression (`{(row as Record<string, unknown>)[col.field] as React.ReactNode}` or equivalent) with `{renderCell(row, col, rowIndex)}`, using the row's own current-render-pass index for `rowIndex`.

- [ ] **Step 3: Run tests, verify green**

Run `pnpm --filter @ultimate/react test -- table.spec.tsx`.

- [ ] **Step 4: Full suite + dependency ceiling**

Run `pnpm test` and `pnpm run ceiling:validate`.

---

### Task 3: Vue — GAP-041 column-renderer mechanism

**Files:**

- Modify: `packages/vue/src/table/Table.vue`
- Test: `packages/vue/src/table/table.spec.ts`

**Interfaces:**

- Produces: `UTableColumn` gains `body?: (row: T, options: { field: string; rowIndex: number }) => VNode | string`.

- [ ] **Step 1: Write the failing tests**

Add to `packages/vue/src/table/table.spec.ts`:

```typescript
describe("column body renderer (Spec: 2026-09-26-prime-parity-table-design.md §5.1)", () => {
  interface Row {
    id: number;
    name: string;
    price: number;
  }

  it("renders a column's body function output instead of the raw field value", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Widget", price: 9.5 }],
        columns: [
          { field: "name", header: "Name" },
          { field: "price", header: "Price", body: (row: Row) => `$${row.price.toFixed(2)}` },
        ],
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells[0].text()).toBe("Widget");
    expect(cells[1].text()).toBe("$9.50");
  });

  it("passes { field, rowIndex } as the body function's second argument", () => {
    const seen: { field: string; rowIndex: number }[] = [];
    mount(UTable, {
      props: {
        value: [
          { id: 1, name: "A", price: 1 },
          { id: 2, name: "B", price: 2 },
        ],
        columns: [
          {
            field: "name",
            header: "Name",
            body: (row: Row, options: { field: string; rowIndex: number }) => {
              seen.push(options);
              return row.name;
            },
          },
        ],
      },
    });
    expect(seen).toEqual([
      { field: "name", rowIndex: 0 },
      { field: "name", rowIndex: 1 },
    ]);
  });

  it("falls back to the raw field value when no body function is supplied", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Widget", price: 9.5 }],
        columns: [{ field: "price", header: "Price" }],
      },
    });
    expect(wrapper.find("td").text()).toBe("9.5");
  });
});
```

- [ ] **Step 2: Implement**

In `packages/vue/src/table/Table.vue`:

1. Export/define `UTableColumn` type (co-located, matching the file's existing type-export convention): `{ field: string; header: string; body?: (row: unknown, options: { field: string; rowIndex: number }) => VNode | string }`.
2. Add a helper function inside the `<script>` block: `function renderCell(row: unknown, col: UTableColumn, rowIndex: number) { return col.body ? col.body(row, { field: col.field, rowIndex }) : (row as Record<string, unknown>)[col.field]; }`
3. Replace every `{{ entry.row[col.field] }}` cell-rendering expression with `{{ renderCell(entry.row, col, index) }}`, using the row's own current `v-for` index.

- [ ] **Step 3: Run tests, verify green**

Run `pnpm --filter @ultimate/vue test -- table.spec.ts`.

- [ ] **Step 4: Full suite + dependency ceiling**

Run `pnpm test` and `pnpm run ceiling:validate`.

---

### Task 4: Angular — GAP-042 checkbox/radio selection UI

**Files:**

- Modify: `packages/ng/src/table/table.ts`
- Test: `packages/ng/src/table/table.spec.ts`

**Interfaces:**

- Consumes: Task 1's `UTableColumn.body`/`renderCell` mechanism as the render host for the selection-column cell/header.
- Produces: a new `selectionColumn` input (`boolean`, default `false`) that, when true, prepends a checkbox/radio selection column, matching real Prime's own template-consumed selection-column pattern (Spec §5.2).

**Depends on: Task 1 (hard).**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("selection-column UI (Spec §5.2, GAP-042)", () => {
  interface Row {
    id: number;
    name: string;
  }

  it("renders a checkbox per row and a header select-all checkbox when selectionMode is multiple and selectionColumn is true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.detectChanges();
    const headerCheckbox = fixture.nativeElement.querySelector("thead input[type=checkbox]");
    const rowCheckboxes = fixture.nativeElement.querySelectorAll("tbody input[type=checkbox]");
    expect(headerCheckbox).toBeTruthy();
    expect(rowCheckboxes.length).toBe(2);
  });

  it("renders a radio button per row and no header control when selectionMode is single and selectionColumn is true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "single");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("tbody input[type=radio]")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("thead input")).toBeFalsy();
  });

  it("does not render a selection column when selectionColumn is false (default)", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("input[type=checkbox]")).toBeFalsy();
  });

  it("header checkbox is unchecked and enabled when value is empty", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.detectChanges();
    const headerCheckbox = fixture.nativeElement.querySelector("thead input[type=checkbox]");
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.disabled).toBe(false);
  });

  it("clicking a row checkbox toggles that row into the selection and emits selectionChange", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.componentRef.setInput("selection", []);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("tbody input[type=checkbox]").click();
    expect(emitted).toEqual([[{ id: 1, name: "A" }]]);
  });

  it("clicking the header checkbox selects all rows; clicking again deselects all", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selectionColumn", true);
    fixture.componentRef.setInput("selection", []);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    const headerCheckbox = fixture.nativeElement.querySelector("thead input[type=checkbox]");
    headerCheckbox.click();
    expect(emitted[0]).toEqual(rows);
  });
});
```

- [ ] **Step 2: Implement**

1. Add `selectionColumn = input(false);` to `UTable`.
2. In the template, when `selectionColumn()` and `selectionMode()` are truthy, prepend a `<th>` (header) and per-row `<td>` (body) rendering a checkbox (`selectionMode() === "multiple"`) or radio (`selectionMode() === "single"`), reusing the existing `isSelected(row)` method for checked state and existing selection-mutation logic (already present for row-click-based selection) for click handling.
3. Header checkbox: `checked` = `value().length > 0 && value().every(isSelected)`; `click` handler toggles all rows in/out of `selection` and emits `selectionChange`.
4. Row checkbox/radio `click`/`change` handler delegates to the same selection-toggle logic the existing row-click handler already uses (do not duplicate the toggle logic — extract a shared private method if the existing `onRowClick` doesn't already expose one cleanly).

- [ ] **Step 3-4: Tests, full suite, dependency ceiling** (same pattern as Task 1).

---

### Task 5: React — GAP-042 checkbox/radio selection UI

**Files:** `packages/react/src/table/table.tsx`, `table.spec.tsx`. **Depends on: Task 2 (hard).**

- [ ] **Step 1:** Write the equivalent 6 tests from Task 4, using React Testing Library idioms (`render`, `screen.getAllByRole("checkbox")`, `fireEvent.click`).
- [ ] **Step 2: Implement** — add `selectionColumn?: boolean` to `UTableProps`, default `false`; render header/per-row checkbox or radio the same way as Task 4, reusing React's existing row-click selection-toggle logic.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 6: Vue — GAP-042 checkbox/radio selection UI

**Files:** `packages/vue/src/table/Table.vue`, `table.spec.ts`. **Depends on: Task 3 (hard).**

- [ ] **Step 1:** Write the equivalent 6 tests from Task 4, using `@vue/test-utils` idioms (`mount`, `wrapper.find`, `wrapper.trigger("click")`).
- [ ] **Step 2: Implement** — add `selectionColumn` prop, default `false`; render header/per-row checkbox or radio, reusing Vue's existing row-click selection-toggle logic.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 7: Angular — GAP-047 keyboard selection/select-all

**Files:** `packages/ng/src/table/table.ts`, `table.spec.ts`. **Independent of Tasks 4-6.**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("keyboard selection (Spec §5.7, GAP-047)", () => {
  interface Row {
    id: number;
    name: string;
  }

  it("Space toggles the focused row's selection when selectionMode is set", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selection", []);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector("tbody [role=row]");
    row.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(emitted).toEqual([[{ id: 1, name: "A" }]]);
  });

  it("Enter toggles the focused row's selection when selectionMode is set", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "single");
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("tbody [role=row]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));
    expect(emitted).toEqual([{ id: 1, name: "A" }]);
  });

  it("Ctrl+A selects all rows when selectionMode is multiple", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    const rows = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    fixture.componentRef.setInput("value", rows);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("tbody [role=row]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA", ctrlKey: true }));
    expect(emitted).toEqual([rows]);
  });

  it("Ctrl+A does nothing when selectionMode is unset", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    const emitted: unknown[] = [];
    fixture.componentInstance.selectionChange.subscribe((v: unknown) => emitted.push(v));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("tbody [role=row]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA", ctrlKey: true }));
    expect(emitted).toEqual([]);
  });

  it("existing Arrow/Home/End keyboard navigation is unaffected by the new Space/Enter/Ctrl+A handling", () => {
    // Re-run one pre-existing Arrow-navigation assertion verbatim to confirm no regression.
    // (Exact assertion copied from the existing "keyboard navigation" describe block above this one.)
  });
});
```

- [ ] **Step 2: Implement**

In the existing `onRowKeyDown` handler (already present, handling Arrow/Home/End): add `case "Space":` and `case "Enter":` (matching on `event.code`) that, when `selectionMode()` is truthy, toggle the target row's selection (reuse Task 4's shared toggle logic if Task 4 landed first; otherwise implement the toggle directly here and Task 4 reuses it) and call `event.preventDefault()`. Add a `keydown` check for `event.ctrlKey/event.metaKey && event.code === "KeyA"` that, when `selectionMode() === "multiple"`, sets `selection` to the full `value()` array, emits `selectionChange`, and calls `event.preventDefault()` — when `selectionMode()` is not `"multiple"` (including unset), do nothing and do not call `preventDefault()` (Review Focus item 3).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 8: React — GAP-047 keyboard selection/select-all

**Files:** `packages/react/src/table/table.tsx`, `table.spec.tsx`. **Independent.**

- [ ] **Step 1:** Equivalent 5 tests using `fireEvent.keyDown`.
- [ ] **Step 2: Implement** — extend the existing row `onKeyDown` handler with Space/Enter/Ctrl+A, same semantics as Task 7.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 9: Vue — GAP-047 keyboard selection/select-all

**Files:** `packages/vue/src/table/Table.vue`, `table.spec.ts`. **Independent.**

- [ ] **Step 1:** Equivalent 5 tests using `wrapper.trigger("keydown", { code: ... })`.
- [ ] **Step 2: Implement** — extend the existing `onRowKeyDown` handler with Space/Enter/Ctrl+A, same semantics as Task 7.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 10: Angular — GAP-046 loading/empty states

**Files:** `packages/ng/src/table/table.ts`, `table.spec.ts`. **Independent of GAP-041.**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("loading/empty states (Spec §5.6, GAP-046)", () => {
  interface Row {
    id: number;
    name: string;
  }

  it("shows a loading indicator when loading is true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-table-loading]")).toBeTruthy();
  });

  it("shows a default empty-state message when value is empty and loading is false", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("No records found");
  });

  it("does not show the empty-state message when value has rows", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("No records found");
  });

  it("does not show the empty-state message while loading is true, even with an empty value", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain("No records found");
  });

  it("preserves existing selection when loading toggles to true", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("selectionMode", "multiple");
    fixture.componentRef.setInput("selection", [{ id: 1, name: "A" }]);
    fixture.detectChanges();
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual([{ id: 1, name: "A" }]);
  });
});
```

- [ ] **Step 2: Implement**

Add `loading = input(false);` and a fixed default empty-state string constant (`"No records found"`, matching real PrimeNG's own default `emptyMessage` text — confirmed real default during Table Spec's own original evidence). In the template, when `loading()` is true, render a `[data-u-table-loading]` element (visual detail deferred to styling, not this task's own scope — the attribute's presence is the contract). When `value().length === 0 && !loading()`, render the empty-state message instead of the `tbody`'s row loop. Do not add any logic that reads or mutates `selection` based on `loading()` — the absence of such logic is itself the correct behavior per Review Focus item 4.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 11: React — GAP-046 loading/empty states

**Files:** `packages/react/src/table/table.tsx`, `table.spec.tsx`. **Independent.**

- [ ] **Step 1:** Equivalent 5 tests.
- [ ] **Step 2: Implement** — add `loading?: boolean` to `UTableProps`, default `false`; same empty-state/loading-indicator logic as Task 10.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 12: Vue — GAP-046 loading/empty states

**Files:** `packages/vue/src/table/Table.vue`, `table.spec.ts`. **Independent.**

- [ ] **Step 1:** Equivalent 5 tests.
- [ ] **Step 2: Implement** — add `loading` prop, default `false`; same logic as Task 10.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 13: Angular — GAP-044 row expansion

**Files:** `packages/ng/src/table/table.ts`, `table.spec.ts`. **Independent.**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("row expansion (Spec §5.4, GAP-044)", () => {
  interface Row {
    id: number;
    name: string;
  }

  it("toggles a row's expanded state and renders expanded content via the expandedRowTemplate", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("expandedRowKeys", {});
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-table-row-toggle]").click();
    expect(fixture.componentInstance.expandedRowKeysChange).toBeTruthy();
  });

  it("emits onRowExpand when a row is expanded and onRowCollapse when collapsed", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    const expandEvents: unknown[] = [];
    fixture.componentInstance.onRowExpand.subscribe((e: unknown) => expandEvents.push(e));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-table-row-toggle]").click();
    expect(expandEvents.length).toBe(1);
  });

  it("does not throw when dataKey maps to a duplicate value across two rows", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, name: "A" },
      { id: 1, name: "B" },
    ]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
```

- [ ] **Step 2: Implement**

Add `expandedRowKeys = input<Record<string, boolean>>({});`, `expandedRowKeysChange = output<Record<string, boolean>>();`, `onRowExpand = output<{ originalEvent: Event; data: T }>();`, `onRowCollapse = output<{ originalEvent: Event; data: T }>();`. Add a `[data-u-table-row-toggle]` button per row (only rendered when a row-expansion mechanism is enabled — gate on the presence of a new `rowExpansionTemplate`-equivalent input if the Spec requires template customization, or simply always render the toggle when `dataKey()` is set, matching the existing selection key-map's own precedent of using `dataKey` as the identity source) that flips that row's key in `expandedRowKeys`, emits the change output, and emits `onRowExpand`/`onRowCollapse` accordingly. Use the same key-map read/write pattern already established by the existing selection mechanism (last-write-wins on duplicate keys, per Review Focus item 5 — no new uniqueness validation).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 14: React — GAP-044 row expansion

**Files:** `packages/react/src/table/table.tsx`, `table.spec.tsx`. **Independent.**

- [ ] **Step 1:** Equivalent 3 tests.
- [ ] **Step 2: Implement** — add `expandedRowKeys?: Record<string, boolean>`, `onExpandedRowKeysChange?`, `onRowExpand?`, `onRowCollapse?` to `UTableProps`; same key-map mechanism as Task 13.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 15: Vue — GAP-044 row expansion

**Files:** `packages/vue/src/table/Table.vue`, `table.spec.ts`. **Independent.**

- [ ] **Step 1:** Equivalent 3 tests.
- [ ] **Step 2: Implement** — add `expandedRowKeys` prop + `update:expandedRowKeys`/`row-expand`/`row-collapse` emits; same key-map mechanism as Task 13.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 16: Angular — GAP-045 `rowGroupMode: "rowspan"`

**Files:** `packages/ng/src/table/table.ts`, `table.spec.ts`. **Independent.**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("rowGroupMode rowspan (Spec §5.5, GAP-045)", () => {
  interface Row {
    id: number;
    category: string;
    name: string;
  }

  it("spans consecutive rows sharing the same groupRowsBy value under one cell", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [
      { id: 1, category: "Fruit", name: "Apple" },
      { id: 2, category: "Fruit", name: "Banana" },
      { id: 3, category: "Veg", name: "Carrot" },
    ]);
    fixture.componentRef.setInput("columns", [
      { field: "category", header: "Category" },
      { field: "name", header: "Name" },
    ]);
    fixture.componentRef.setInput("rowGroupMode", "rowspan");
    fixture.componentRef.setInput("groupRowsBy", "category");
    fixture.detectChanges();
    const categoryCells = fixture.nativeElement.querySelectorAll("td[data-u-table-group-cell]");
    expect(categoryCells.length).toBe(2); // one spanned cell per group, not per row
    expect(categoryCells[0].getAttribute("rowspan")).toBe("2");
    expect(categoryCells[1].getAttribute("rowspan")).toBe("1");
  });

  it("renders ungrouped when groupRowsBy is unset, matching subheader mode's own fallback", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, category: "Fruit", name: "Apple" }]);
    fixture.componentRef.setInput("columns", [{ field: "category", header: "Category" }]);
    fixture.componentRef.setInput("rowGroupMode", "rowspan");
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector("[data-u-table-group-header]")).toBeFalsy();
  });
});
```

- [ ] **Step 2: Implement**

Reuse the existing `groupedRows` computation already built for `"subheader"` mode (confirmed present in the template's `@for (entry of groupedRows; track $index)`). Add a `rowGroupMode() === "rowspan"` branch: instead of rendering a separate group-header row, compute each group's row count and render the grouping column's first row in each group with `[attr.rowspan]="group.size"` and `[attr.data-u-table-group-cell]`, then omit that column's `<td>` entirely for subsequent rows in the same group (standard HTML rowspan semantics — the spanned cell covers multiple rows, so those rows render one fewer `<td>`).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 17: React — GAP-045 `rowGroupMode: "rowspan"`

**Files:** `packages/react/src/table/table.tsx`, `table.spec.tsx`. **Independent.**

- [ ] **Step 1:** Equivalent 2 tests.
- [ ] **Step 2: Implement** — same rowspan-cell mechanism as Task 16, reusing React's existing `"subheader"` grouping computation.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 18: Vue — GAP-045 `rowGroupMode: "rowspan"` (new for Vue)

**Files:** `packages/vue/src/table/Table.vue`, `table.spec.ts`. **Independent.**

**Note:** Vue's `rowGroupMode` type currently only accepts `"subheader"` (confirmed: Vue's own task never declared `"rowspan"` — GAP-045's own evidence). This task adds the option for the first time, not merely completing an existing branch.

- [ ] **Step 1:** Equivalent 2 tests to Task 16.
- [ ] **Step 2: Implement** — widen Vue's `rowGroupMode` prop type from `'subheader'` to `'subheader' | 'rowspan'`; add the same rowspan-cell rendering branch as Task 16, reusing Vue's existing `groupedRows`-equivalent computation (confirmed present: `entry.isGroupHeader` branch in the template).
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 19: Angular — GAP-043 row/cell editing lifecycle

**Files:** `packages/ng/src/table/table.ts`, `table.spec.ts`. **Independent.**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("row/cell editing lifecycle (Spec §5.3, GAP-043)", () => {
  interface Row {
    id: number;
    name: string;
  }

  it("entering edit mode on a row adds its key to editingRowKeys and renders an editable input", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("editMode", "row");
    fixture.componentRef.setInput("editingRowKeys", {});
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-table-row-edit-init]").click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-table-cell-editor] input")).toBeTruthy();
  });

  it("saving an edit commits the new value and exits edit mode", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("editMode", "row");
    fixture.componentRef.setInput("editingRowKeys", { "1": true });
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("[data-u-table-cell-editor] input");
    input.value = "Changed";
    input.dispatchEvent(new Event("input"));
    fixture.nativeElement.querySelector("[data-u-table-row-edit-save]").click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-table-cell-editor]")).toBeFalsy();
    expect(fixture.nativeElement.textContent).toContain("Changed");
  });

  it("canceling an edit reverts to the original value and exits edit mode", () => {
    const fixture = TestBed.createComponent(UTable<Row>);
    fixture.componentRef.setInput("value", [{ id: 1, name: "A" }]);
    fixture.componentRef.setInput("columns", [{ field: "name", header: "Name" }]);
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("editMode", "row");
    fixture.componentRef.setInput("editingRowKeys", { "1": true });
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("[data-u-table-cell-editor] input");
    input.value = "Changed";
    input.dispatchEvent(new Event("input"));
    fixture.nativeElement.querySelector("[data-u-table-row-edit-cancel]").click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("A");
    expect(fixture.nativeElement.textContent).not.toContain("Changed");
  });
});
```

- [ ] **Step 2: Implement**

Angular's `table.ts` already declares `editMode`/`editingRowKeys`/`editingRowKeysChange` (lines 151-153) but never consumes them (confirmed during this plan's own file read — the existing `[class]="cx('prompt')"`-style row-edit-init button referenced in the doc comments exists visually for `editMode === 'row'` per line ~35's `data-u-table-row-edit-init` reference, but no save/cancel/editor logic exists). Wire: when a row's key is present in `editingRowKeys()`, render each column's cell via an editable input (a plain `<input>` bound to a local per-row draft-value signal, not the live `value()` — matching the Spec's own "save commits, cancel reverts" contract) instead of `renderCell`'s normal output; add `[data-u-table-row-edit-save]`/`[data-u-table-row-edit-cancel]` buttons that either commit the draft into a new `value()` array (save) or discard the draft (cancel), both removing the row's key from `editingRowKeys` and emitting `editingRowKeysChange`.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 20: React — GAP-043 row/cell editing lifecycle

**Files:** `packages/react/src/table/table.tsx`, `table.spec.tsx`. **Independent.**

- [ ] **Step 1:** Equivalent 3 tests, using React's own controlled/uncontrolled `editingRows` prop (already declared per Spec §5.3 — confirmed via `UTableProps`'s existing `editingRows?: Record<string, boolean>` field, currently unconsumed).
- [ ] **Step 2: Implement** — same save/cancel/draft-value mechanism as Task 19, using React's controlled-or-uncontrolled `editingRows` state management convention (support both a parent-controlled `editingRows` prop and internal uncontrolled state when the prop is omitted, matching React's own established convention elsewhere in this codebase for controlled/uncontrolled dual support).
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 21: Vue — GAP-043 row/cell editing lifecycle

**Files:** `packages/vue/src/table/Table.vue`, `table.spec.ts`. **Independent.**

- [ ] **Step 1:** Equivalent 3 tests, using Vue's own array-prop editing-state model (per Spec §5.3).
- [ ] **Step 2: Implement** — same save/cancel/draft-value mechanism as Task 19, using Vue's array-prop convention for tracking which rows are in edit mode.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

## Completion Criteria

- All 21 tasks' tests pass, in all 3 frameworks.
- `pnpm test` (full monorepo) passes after the final task.
- `pnpm run ceiling:validate` passes.
- No pre-existing Table test's assertion was modified.
- GAP-041 through GAP-047's own acceptance criteria (Spec §9) are each satisfied by at least one task above, traceable via this document's own GAP → Task mapping table.

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-041 through GAP-047 as RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`, citing this plan's own commit history as evidence — not performed by this plan document itself (Plan-stage constraint: no source/doc changes authorized until Implementation is separately authorized).
