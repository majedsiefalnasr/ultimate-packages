import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { equals } from "@ultimate/uix-data";
import type { FilterMetadata, SelectionMode, SortMeta, SortMode } from "@ultimate/uix-data";
import { deepEquals } from "@ultimate/uix-utils/object";
import { UPaginator } from "../paginator/paginator";
import type { PaginatorPageChangeEvent } from "../paginator/paginator";
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
 * Tests one row's field value against a single `FilterMetadata`. Only
 * `contains` (case-insensitive substring) is dispatched in this task's
 * scope; all other `FilterMatchMode` values are deferred.
 */
function matchesFilter<T>(row: T, field: string, filter: FilterMetadata): boolean {
  const cellValue = String(resolveCell(row, field) ?? "").toLowerCase();
  const filterValue = String(filter.value ?? "").toLowerCase();

  switch (filter.matchMode) {
    case "contains":
      return cellValue.includes(filterValue);
    // NEEDS IMPLEMENTATION-TIME VERIFICATION: startsWith, notContains, endsWith, equals, notEquals, lt, lte, gt, gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter, custom
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
}: UTableProps<T>) {
  const { cx } = useComponentBase({ componentName: "table", styleModule: tableStyleModule });

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
        <tbody className={cx("tbody") as string} role="rowgroup">
          {pagedValue.map((row, index) => (
            <tr
              key={index}
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
            </tr>
          ))}
        </tbody>
      </table>
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
