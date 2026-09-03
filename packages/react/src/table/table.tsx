import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import type { SortMeta, SortMode } from "@ultimate/uix-data";
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
 * `UTable`: controlled `value`/`columns` render — one `role="row"` per
 * `value` entry and one `role="columnheader"` per column — plus controlled
 * sorting (`sortMode`/`sortField`/`sortOrder`/`multiSortMeta`/`onSort`, all
 * optional per spec §16's React controlled/uncontrolled duality). Matches
 * Angular's Task 2/3 scaffold plus Task 4's sort behavior, but built as
 * dense per-task slices per this package's group design. Filtering and
 * selection are not yet implemented — those land in later tasks.
 *
 * `sortedValue` clones `value` (`[...value]`) before sorting so the
 * caller's input array is never mutated, matching Angular's `applySort`.
 * Clicking a header directly sets/replaces sort state rather than cycling
 * through asc/desc/none (deferred per the plan's Global Constraints):
 * single mode always emits `{ sortField: field, sortOrder: 1 }`; multi mode
 * emits a `multiSortMeta` array with that field's entry added or replaced
 * with `order: 1`. This component holds no sort state of its own — if
 * `onSort` is omitted, clicking a header has no visible effect, matching
 * the same "no uncontrolled fallback" pattern already verified for
 * `UPaginator`.
 */
export function UTable<T>({
  value,
  columns,
  sortMode = "single",
  sortField,
  sortOrder = 0,
  multiSortMeta = [],
  onSort,
}: UTableProps<T>) {
  const { cx } = useComponentBase({ componentName: "table", styleModule: tableStyleModule });

  const sortedValue = React.useMemo(() => {
    const rows = [...value];

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
  }, [value, sortMode, sortField, sortOrder, multiSortMeta]);

  const ariaSortFor = (field: string): "ascending" | "descending" | undefined => {
    if (sortMode === "multiple") {
      const entry = multiSortMeta.find((m) => m.field === field);
      if (!entry || entry.order === 0) return undefined;
      return entry.order === 1 ? "ascending" : "descending";
    }
    if (sortField !== field || sortOrder === 0) return undefined;
    return sortOrder === 1 ? "ascending" : "descending";
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
        <tbody className={cx("tbody") as string} role="rowgroup">
          {sortedValue.map((row, index) => (
            <tr key={index} className={cx("row") as string} role="row">
              {columns.map((col) => (
                <td key={col.field}>{String(resolveCell(row, col.field))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
