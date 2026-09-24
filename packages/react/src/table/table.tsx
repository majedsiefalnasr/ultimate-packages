import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { equals } from "@ultimate/uix-data";
import type { FilterMetadata, SelectionMode, SortMeta, SortMode } from "@ultimate/uix-data";
import { deepEquals } from "@ultimate/uix-utils/object";
import { UPaginator } from "../paginator/paginator";
import type { PaginatorPageChangeEvent } from "../paginator/paginator";
import { UScroller } from "../scroller/scroller";
import { tableStyleModule } from "./table-style";

export interface UTableColumn {
  field: string;
  header: string;
}

export interface UTableSortEvent {
  sortField?: string;
  sortOrder?: 1 | 0 | -1;
  multiSortMeta?: SortMeta[];
}

export interface UTableProps<T> {
  value: T[];
  dataKey?: string;
  columns: UTableColumn[];
  sortMode?: SortMode;
  sortField?: string;
  sortOrder?: 1 | 0 | -1;
  multiSortMeta?: SortMeta[];
  onSort?: (event: UTableSortEvent) => void;
  filters?: Record<string, FilterMetadata | { operator: "and" | "or"; constraints: FilterMetadata[] }>;
  /**
   * Accepted for interface-contract completeness (spec §4.2 lists `onFilter`
   * as part of PrimeReact's real DataTable surface) but not yet invoked.
   * `filters` is entirely parent-supplied and applied via `filteredValue`
   * (no filter-editing UI exists in this task's scope), and neither the
   * plan nor the spec defines a trigger point or payload for `onFilter` —
   * Angular's Table (spec §16's per-framework event-ownership survey) has
   * no analogous filter-emit output to mirror, and no later plan task
   * consumes this callback. Wiring an invented trigger (e.g. firing on
   * every `filteredValue` recompute) would guess behavior the brief does
   * not specify. NEEDS IMPLEMENTATION-TIME VERIFICATION: define the real
   * trigger/payload once a concrete consumer (e.g. a filter-editing UI
   * task) requires it.
   */
  onFilter?: (filters: Record<string, FilterMetadata | { operator: "and" | "or"; constraints: FilterMetadata[] }>) => void;
  selectionMode?: SelectionMode;
  selection?: T | T[];
  onSelectionChange?: (selection: T | T[]) => void;
  compareSelectionBy?: "equals" | "deepEquals";
  paginator?: boolean;
  first?: number;
  rows?: number;
  totalRecords?: number;
  onPage?: (event: PaginatorPageChangeEvent) => void;
  virtualScrollerOptions?: { itemSize: number };
  lazy?: boolean;
  onLazyLoad?: (event: { first: number; last: number }) => void;
  editMode?: "cell" | "row";
  editingRows?: Record<string, boolean>;
  onRowEditChange?: (editingRows: Record<string, boolean>) => void;
  onRowEditInit?: (row: T) => void;
  onRowEditSave?: (row: T) => void;
  onRowEditCancel?: (row: T) => void;
  /**
   * Accepted for interface-contract completeness (spec §4.2 lists these as
   * part of PrimeReact's real DataTable cell-edit surface) but not yet
   * invoked — `editingMeta`'s full validator-wiring UI is
   * NEEDS IMPLEMENTATION-TIME VERIFICATION-deferred beyond this task's
   * row-edit-lifecycle scope, matching Angular Task 10's equivalent scope
   * decision for symmetry (see class doc comment).
   */
  cellEditValidator?: (event: { newValue: unknown; oldValue: unknown }) => boolean;
  onCellEditComplete?: (event: { newValue: unknown; oldValue: unknown }) => void;
  onCellEditCancel?: (event: { newValue: unknown; oldValue: unknown }) => void;
  rowGroupMode?: "subheader" | "rowspan";
  groupRowsBy?: string;
}

function resolveCell<T>(row: T, field: string): unknown {
  return (row as Record<string, unknown>)[field];
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * Tests one row's field value against a single `FilterMetadata`. Every
 * `FilterMatchMode` value is dispatched except `custom`, which has no
 * executable registration path for React (Spec §3.4.2) and always resolves
 * to `false`.
 */
function matchesFilter<T>(row: T, field: string, filter: FilterMetadata): boolean {
  const rawCellValue = resolveCell(row, field);
  const rawFilterValue = filter.value;
  const cellValue = String(rawCellValue ?? "").toLowerCase();
  const filterValue = String(rawFilterValue ?? "").toLowerCase();

  switch (filter.matchMode) {
    case "contains":
      return cellValue.includes(filterValue);
    case "startsWith":
      return cellValue.startsWith(filterValue);
    case "notContains":
      // Real PrimeReact FilterService.js (matching PrimeNG's/PrimeVue's own
      // notContains): an absent/empty filter value passes through (matches
      // everything). String.prototype.includes("") is always true, so
      // without this guard `!cellValue.includes("")` would be false for
      // every row, hiding all of them instead of showing all of them.
      if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return true;
      return !cellValue.includes(filterValue);
    case "endsWith":
      return cellValue.endsWith(filterValue);
    case "equals":
      return cellValue === filterValue;
    case "notEquals":
      // Real PrimeReact FilterService.js: absent (undefined/null) OR an
      // empty/whitespace-only string filter value => true (matches
      // everything) — the opposite outcome from Angular's/Vue's real source
      // for the identical condition.
      if (rawFilterValue === undefined || rawFilterValue === null || (typeof rawFilterValue === "string" && rawFilterValue.trim() === "")) return true;
      return cellValue !== filterValue;
    case "lt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) < (rawFilterValue as number | Date);
    case "lte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) <= (rawFilterValue as number | Date);
    case "gt":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) > (rawFilterValue as number | Date);
    case "gte":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as number | Date) >= (rawFilterValue as number | Date);
    case "between": {
      const range = rawFilterValue as [unknown, unknown] | null | undefined;
      if (range == null || range[0] == null || range[1] == null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      const low = range[0] as number | Date;
      const high = range[1] as number | Date;
      return low <= (rawCellValue as number | Date) && (rawCellValue as number | Date) <= high;
    }
    case "in": {
      const options = rawFilterValue as unknown[] | null | undefined;
      if (options == null || options.length === 0) return true;
      return options.some((option) => equals(rawCellValue, option));
    }
    case "notIn": {
      const options = rawFilterValue as unknown[] | null | undefined;
      if (options == null || options.length === 0) return true;
      return !options.some((option) => equals(rawCellValue, option));
    }
    case "dateIs":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).toDateString() === (rawFilterValue as Date).toDateString();
    case "dateIsNot":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).toDateString() !== (rawFilterValue as Date).toDateString();
    case "dateBefore":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).getTime() < (rawFilterValue as Date).getTime();
    case "dateAfter":
      if (rawFilterValue === undefined || rawFilterValue === null) return true;
      if (rawCellValue === undefined || rawCellValue === null) return false;
      return (rawCellValue as Date).getTime() > (rawFilterValue as Date).getTime();
    case "custom":
      // No executable registration path exists for React's UTable (Spec
      // §3.4.2) — 'custom' is a recognized but permanently inert mode name
      // here, matching no rows. This must never be changed to read from or
      // invoke an application-supplied function without a new specification
      // authorizing that surface.
      return false;
    default:
      return true;
  }
}

/**
 * Tests one row's field value against a `filters` entry, which is either a
 * single `FilterMetadata` (must match) or a `{operator, constraints}` group
 * (spec §9's React object-with-constraints-array shape): `constraints` are
 * combined with AND (every constraint must match) or OR (any constraint
 * matches) per `operator`.
 */
function matchesFilterEntry<T>(
  row: T,
  field: string,
  entry: FilterMetadata | { operator: "and" | "or"; constraints: FilterMetadata[] }
): boolean {
  if (!("constraints" in entry)) return matchesFilter(row, field, entry);

  return entry.operator === "or"
    ? entry.constraints.some((c) => matchesFilter(row, field, c))
    : entry.constraints.every((c) => matchesFilter(row, field, c));
}

/**
 * `UTable`: controlled `value`/`columns` render — one `role="row"` per
 * `value` entry and one `role="columnheader"` per column — plus controlled
 * sorting (`sortMode`/`sortField`/`sortOrder`/`multiSortMeta`/`onSort`, all
 * optional per spec §16's React controlled/uncontrolled duality), filtering,
 * and selection. Matches Angular's Task 2/3 scaffold plus Task 4/5/6's
 * sort/filter/selection behavior, but built as dense per-task slices per
 * this package's group design.
 *
 * `applySort` clones its input (`[...input]`) before sorting so the
 * caller's `value` array is never mutated, matching Angular's `applySort`.
 * Clicking a header directly sets/replaces sort state rather than cycling
 * through asc/desc/none (deferred per the plan's Global Constraints):
 * single mode always emits `{ sortField: field, sortOrder: 1 }`; multi mode
 * emits a `multiSortMeta` array with that field's entry added or replaced
 * with `order: 1`. This component holds no sort state of its own — if
 * `onSort` is omitted, clicking a header has no visible effect, matching
 * the same "no uncontrolled fallback" pattern already verified for
 * `UPaginator`.
 *
 * `filteredValue` applies `filters` (filter-then-sort) via
 * `matchesFilterEntry`/`matchesFilter`: each `filters` entry is keyed by
 * field and is either a single `FilterMetadata` (must match) or a
 * `{operator, constraints}` group (spec §9's React
 * object-with-constraints-array shape, distinct from Angular's
 * array-of-alternatives shape) whose `constraints` combine with AND/OR per
 * `operator`. Only `contains` match mode is dispatched in this task's
 * scope — see `matchesFilter`'s dispatch comment for the deferred modes.
 *
 * Selection (`selectionMode`/`selection`/`onSelectionChange`/
 * `compareSelectionBy`) is controlled-only, matching sort's pattern: no
 * internal selection state, so clicking a row is inert unless both
 * `selectionMode` and `onSelectionChange` are supplied. `aria-selected` is
 * computed per row via `isRowEqual`, which dispatches on
 * `compareSelectionBy` between `uix-data`'s `equals` (default, `dataKey`-
 * based field identity) and `uix-utils`'s structural `deepEquals`.
 *
 * Pagination (`paginator`/`first`/`rows`/`totalRecords`/`onPage`) composes
 * the real, already-shipped `UPaginator` (fully controlled, no internal
 * state of its own — see its own doc comment) rather than a mock: when
 * `paginator` is true, `<UPaginator>` is rendered beneath the table and
 * `filteredValue` is sliced to `[first, first + rows)` for display, while
 * `onPage` simply forwards `UPaginator`'s `onPageChange` callback (Table
 * itself owns no page state, matching the sort/selection "no uncontrolled
 * fallback" pattern). Per real upstream evidence (PrimeReact's
 * `DataTable.js`: `props.paginator` checked independently of
 * `isVirtualScrollerDisabled()` at lines 190/283/1498/1768/1857),
 * `paginator` is not gated on virtualization state here either.
 *
 * Virtualization (`virtualScrollerOptions`/`lazy`/`onLazyLoad`) composes the
 * real, already-shipped `UScroller` (not a mock) via its real
 * `contentTemplate` render-prop mechanism: when `virtualScrollerOptions` is
 * set, the plain `<tbody>` map used otherwise is replaced by a `<UScroller>`
 * whose `contentTemplate` supplies Table's own `<table><tbody><tr><td>`
 * markup for just the windowed subset `UScroller` hands back, mirroring
 * Angular's Task 9 composition. `UScroller`'s `.u-scroller-content` wrapper
 * is `position: absolute` with a computed height but no per-row `top` of its
 * own — only its built-in fallback rendering self-positions each item — so
 * each `<tr>` here explicitly sets `top: getItemOptions(index).index *
 * itemSize` using the real absolute index, matching the technique
 * `UScroller`'s own built-in item rendering uses. Omitting this would render
 * all visible rows stacked at the top of the scroll container regardless of
 * actual scroll offset.
 *
 * Row editing (`editMode`/`editingRows`/`onRowEditChange` plus the
 * `onRowEditInit`/`onRowEditSave`/`onRowEditCancel`/`cellEditValidator`/
 * `onCellEditComplete`/`onCellEditCancel` lifecycle props, spec §4.2)
 * follows spec §11.2's controlled/uncontrolled duality exactly: when
 * `onRowEditChange` is supplied, `editingRows` is fully parent-owned (the
 * `editingRows` prop drives rendering and this component holds no state of
 * its own for it, matching the sort/selection/pagination "no uncontrolled
 * fallback unless the callback is present" pattern); when `onRowEditChange`
 * is omitted, an internal `useState` fallback takes over so the row-edit
 * affordance still works standalone. A `data-u-table-row-edit-init` button
 * rendered per row when `editMode === "row"` computes the next
 * `editingRows` key-map (keyed by `dataKey`-resolved row identity, matching
 * React's real `BodyRow.js:314-338`-derived rule already documented in spec
 * §11.2) and calls `onRowEditChange` if supplied, else the internal setter.
 * Cell-edit dirty-value tracking (`editingMeta`) is scaffolded as
 * always-internal `useState` keyed by `dataKey`-or-`rowIndex` per spec
 * §11.2, but its full validator-wiring UI is
 * NEEDS IMPLEMENTATION-TIME VERIFICATION-deferred beyond this task's
 * row-edit-lifecycle scope, matching Angular Task 10's equivalent scope
 * decision for symmetry.
 *
 * Row grouping (`rowGroupMode`/`groupRowsBy`, spec §13's confirmed
 * algorithm) reuses the existing sort machinery rather than a parallel
 * comparator: `groupRowsBy` is injected as a synthetic leading `SortMeta`
 * ahead of any existing `multiSortMeta`, so rows sharing the same group
 * value are always adjacent, then the grouped result is walked once
 * comparing each row's group value against the previous row's via
 * `uix-data`'s shared `equals` (2-arg form) to detect group boundaries.
 * Each boundary renders a `data-u-table-group-header` marker row ahead of
 * it in `subheader` mode, matching Angular's Task 10 `groupedRows` getter.
 * When `groupRowsBy` is unset, this degrades to `pagedValue` unchanged (no
 * boundaries ever detected), preserving every prior task's ungrouped
 * rendering.
 */
export function UTable<T>({
  value,
  dataKey,
  columns,
  sortMode = "single",
  sortField,
  sortOrder = 0,
  multiSortMeta = [],
  onSort,
  filters = {},
  selectionMode,
  selection,
  onSelectionChange,
  compareSelectionBy = "equals",
  paginator = false,
  first = 0,
  rows = 0,
  totalRecords = 0,
  onPage,
  virtualScrollerOptions,
  lazy,
  onLazyLoad,
  editMode,
  editingRows,
  onRowEditChange,
  onRowEditInit,
  rowGroupMode,
  groupRowsBy,
}: UTableProps<T>) {
  const { cx } = useComponentBase({ componentName: "table", styleModule: tableStyleModule });

  const [internalEditingRows, setInternalEditingRows] = React.useState<Record<string, boolean>>({});
  const resolvedEditingRows = onRowEditChange ? editingRows ?? {} : editingRows ?? internalEditingRows;

  /**
   * Always-internal cell-edit dirty-value tracking (spec §11.2), keyed by
   * `dataKey`-or-`rowIndex`. Scaffolded per the row-edit-lifecycle scope
   * documented on the class doc comment — no consumer reads this yet.
   */
  const [editingMeta, setEditingMeta] = React.useState<Record<string, Record<string, unknown>>>({});
  void editingMeta;
  void setEditingMeta;

  const applySort = React.useCallback(
    (input: T[]): T[] => {
      const rows = [...input];

      if (sortMode === "multiple") {
        if (multiSortMeta.length === 0) return rows;
        return rows.sort((a, b) => {
          for (const { field, order } of multiSortMeta) {
            const result = compareValues(resolveCell(a, field), resolveCell(b, field));
            if (result !== 0) return result * order;
          }
          return 0;
        });
      }

      if (!sortField || sortOrder === 0) return rows;
      return rows.sort(
        (a, b) => compareValues(resolveCell(a, sortField), resolveCell(b, sortField)) * sortOrder
      );
    },
    [sortMode, sortField, sortOrder, multiSortMeta]
  );

  const sortedValue = React.useMemo(() => applySort(value), [value, applySort]);

  const filteredValue = React.useMemo(() => {
    const fields = Object.keys(filters);
    if (fields.length === 0) return sortedValue;

    return applySort(
      value.filter((row) => fields.every((field) => matchesFilterEntry(row, field, filters[field])))
    );
  }, [value, filters, applySort, sortedValue]);

  const isRowEqual = React.useCallback(
    (a: T, b: T): boolean =>
      compareSelectionBy === "deepEquals" ? deepEquals(a, b) : equals(a, b, dataKey),
    [compareSelectionBy, dataKey]
  );

  const isSelected = React.useCallback(
    (row: T): boolean => {
      if (selection == null) return false;
      if (Array.isArray(selection)) return selection.some((s) => isRowEqual(s, row));
      return isRowEqual(selection, row);
    },
    [selection, isRowEqual]
  );

  const handleRowClick = (row: T) => {
    if (!selectionMode || !onSelectionChange) return;

    if (selectionMode === "single") {
      onSelectionChange(row);
      return;
    }

    const current = Array.isArray(selection) ? selection : [];
    const index = current.findIndex((s) => isRowEqual(s, row));
    const next = index === -1 ? [...current, row] : current.filter((_, i) => i !== index);
    onSelectionChange(next);
  };

  const ariaSortFor = (field: string): "ascending" | "descending" | undefined => {
    if (sortMode === "multiple") {
      const entry = multiSortMeta.find((m) => m.field === field);
      if (!entry || entry.order === 0) return undefined;
      return entry.order === 1 ? "ascending" : "descending";
    }
    if (sortField !== field || sortOrder === 0) return undefined;
    return sortOrder === 1 ? "ascending" : "descending";
  };

  /**
   * Keyboard-equivalent path for row navigation (spec §15's confirmed
   * ArrowDown/ArrowUp/Home/End baseline), matching Angular's Task 7
   * `onRowKeyDown` vocabulary — the mechanism differs (DOM traversal via
   * `currentTarget`/`parentElement` here vs. Angular's `@HostListener`),
   * the vocabulary does not. Only moves `.focus()` between `tbody
   * [role="row"]` elements — never the header row, since this handler is
   * bound per data row. Enter/selection-toggle behavior is already covered
   * by `onClick`, so it is intentionally out of scope here.
   */
  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    const row = event.currentTarget;
    const rowGroup = row.parentElement;
    if (!rowGroup) return;

    const rows = Array.from(rowGroup.querySelectorAll<HTMLElement>(':scope > [role="row"]'));
    const index = rows.indexOf(row);
    if (index === -1) return;

    let target: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowDown":
        target = rows[index + 1];
        break;
      case "ArrowUp":
        target = rows[index - 1];
        break;
      case "Home":
        target = rows[0];
        break;
      case "End":
        target = rows[rows.length - 1];
        break;
      default:
        return;
    }

    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  const pagedValue = React.useMemo(
    () => (paginator ? filteredValue.slice(first, first + rows) : filteredValue),
    [paginator, filteredValue, first, rows]
  );

  /**
   * Row-grouping view (spec §13's confirmed algorithm, matching Angular
   * Task 10's `groupedRows` getter): reuses the existing multi-field sort
   * comparator (`compareValues`, the same one `applySort` uses) rather than
   * a parallel comparator — `groupRowsBy` is injected as a synthetic
   * leading `SortMeta` ahead of any existing `multiSortMeta`, so rows
   * sharing the same group value are always adjacent in the result, then
   * the rows are walked once comparing each row's group value against the
   * previous row's via `uix-data`'s shared `equals` (2-arg form) to detect
   * group boundaries. When `groupRowsBy` is unset, this degrades to
   * `pagedValue` unchanged (no boundaries ever detected).
   */
  const groupedRows = React.useMemo((): { row: T; isGroupHeader: boolean }[] => {
    if (!groupRowsBy) return pagedValue.map((row) => ({ row, isGroupHeader: false }));

    const meta: SortMeta[] = [{ field: groupRowsBy, order: 1 }, ...multiSortMeta];
    const rows = [...pagedValue].sort((a, b) => {
      for (const { field, order } of meta) {
        const result = compareValues(resolveCell(a, field), resolveCell(b, field));
        if (result !== 0) return result * order;
      }
      return 0;
    });

    return rows.map((row, index) => {
      const previous = rows[index - 1];
      const isGroupHeader =
        index === 0 || !equals(resolveCell(row, groupRowsBy), resolveCell(previous, groupRowsBy));
      return { row, isGroupHeader };
    });
  }, [groupRowsBy, pagedValue, multiSortMeta]);

  /**
   * Row-editing lifecycle entry point (spec §11.2's key-map idiom, matching
   * Angular Task 10's `initRowEdit`): marks `row`'s `dataKey`-resolved
   * identity as editing by adding it to `resolvedEditingRows` and calling
   * `onRowEditChange` if supplied, else falling back to the internal
   * `useState` setter (spec §11.2's controlled/uncontrolled duality).
   */
  const initRowEdit = (row: T) => {
    const key = String(resolveCell(row, dataKey ?? ""));
    const next = { ...resolvedEditingRows, [key]: true };
    onRowEditInit?.(row);
    if (onRowEditChange) {
      onRowEditChange(next);
    } else {
      setInternalEditingRows(next);
    }
  };

  const handleSort = (field: string) => {
    if (!onSort) return;

    if (sortMode === "multiple") {
      const meta = [...multiSortMeta];
      const index = meta.findIndex((m) => m.field === field);
      if (index === -1) {
        meta.push({ field, order: 1 });
      } else {
        meta[index] = { field, order: 1 };
      }
      onSort({ multiSortMeta: meta });
      return;
    }

    onSort({ sortField: field, sortOrder: 1 });
  };

  return (
    <div className={cx("root") as string} role="table">
      <table className={cx("table") as string}>
        <thead className={cx("thead") as string} role="rowgroup">
          <tr role="row">
            {columns.map((col) => (
              <th
                key={col.field}
                role="columnheader"
                aria-sort={ariaSortFor(col.field)}
                onClick={() => handleSort(col.field)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {!virtualScrollerOptions && (
          <tbody className={cx("tbody") as string} role="rowgroup">
            {groupedRows.map(({ row, isGroupHeader }, index) => (
              <React.Fragment key={index}>
                {rowGroupMode === "subheader" && isGroupHeader && (
                  <tr data-u-table-group-header className={cx("rowGroupHeader") as string}>
                    <td colSpan={columns.length}>{String(resolveCell(row, groupRowsBy ?? ""))}</td>
                  </tr>
                )}
                <tr
                  className={cx("row") as string}
                  role="row"
                  tabIndex={0}
                  aria-selected={isSelected(row)}
                  onClick={() => handleRowClick(row)}
                  onKeyDown={handleRowKeyDown}
                >
                  {columns.map((col) => (
                    <td key={col.field}>{String(resolveCell(row, col.field))}</td>
                  ))}
                  {editMode === "row" && (
                    <td>
                      <button
                        type="button"
                        data-u-table-row-edit-init
                        onClick={(event) => {
                          event.stopPropagation();
                          initRowEdit(row);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        )}
      </table>
      {virtualScrollerOptions && (
        <UScroller
          items={filteredValue}
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
                    tabIndex={0}
                    aria-selected={isSelected(value as T)}
                    onClick={() => handleRowClick(value as T)}
                    // Known limitation: handleRowKeyDown walks :scope > [role="row"]
                    // within this tbody, which under virtualization only contains the
                    // currently-rendered window, not the full logical dataset — so
                    // ArrowDown/ArrowUp/Home/End stop at the edges of what's mounted,
                    // not the edges of the full `value` dataset. This is intentional
                    // (a row outside the window isn't in the DOM to focus), not a bug.
                    onKeyDown={handleRowKeyDown}
                    style={{ position: "absolute", top: getItemOptions(index).index * itemSize, width: "100%" }}
                  >
                    {columns.map((col) => (
                      <td key={col.field}>{String(resolveCell(value as T, col.field))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />
      )}
      {paginator && (
        <UPaginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPageChange={(event) => onPage?.(event)}
        />
      )}
    </div>
  );
}
