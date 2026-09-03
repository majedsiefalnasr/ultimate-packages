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

/**
 * `UTable`: minimal controlled `value`/`columns` render — one `role="row"`
 * per `value` entry and one `role="columnheader"` per column, matching
 * Angular's Task 2/3 scaffold but built as a single dense task per this
 * package's group design. No sorting, filtering, or selection yet — those
 * land in later tasks (Task 12+).
 */
export function UTable<T>({ value, columns }: UTableProps<T>) {
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
                <td key={col.field}>{String((row as Record<string, unknown>)[col.field])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
