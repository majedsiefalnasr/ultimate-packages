import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UPaginator, type PaginatorPageChangeEvent } from "../paginator/paginator";
import { dataViewStyleModule } from "./data-view-style";

function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value != null && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      item
    );
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));
}

export interface UDataViewProps<T = unknown> {
  value: T[];
  itemTemplate: (item: T, layout: "list" | "grid") => React.ReactNode;
  layout?: "list" | "grid";
  paginator?: boolean;
  first?: number;
  rows?: number;
  totalRecords?: number;
  rowsPerPageOptions?: number[];
  paginatorPosition?: "top" | "bottom" | "both";
  alwaysShowPaginator?: boolean;
  currentPageReportTemplate?: string;
  sortField?: string;
  sortOrder?: 1 | -1;
  lazy?: boolean;
  loading?: boolean;
  loadingIcon?: React.ReactNode;
  emptyMessage?: string;
  dataKey?: string;
  trackBy?: (item: T, index: number) => React.Key;
  onPageChange?: (event: PaginatorPageChangeEvent) => void;
  onLazyLoad?: (event: {
    first: number;
    rows: number;
    sortField?: string;
    sortOrder: 1 | -1;
  }) => void;
  className?: string;
}

export function UDataView<T = unknown>({
  value,
  itemTemplate,
  layout = "list",
  paginator = false,
  first = 0,
  rows = 0,
  totalRecords,
  rowsPerPageOptions = [],
  paginatorPosition = "bottom",
  alwaysShowPaginator = true,
  currentPageReportTemplate = "{first} to {last} of {totalRecords}",
  sortField,
  sortOrder = 1,
  lazy = false,
  loading = false,
  loadingIcon = "Loading",
  emptyMessage = "No results found",
  dataKey,
  trackBy,
  onPageChange,
  onLazyLoad,
  className,
}: UDataViewProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "data-view", styleModule: dataViewStyleModule });
  const [pageFirst, setPageFirst] = React.useState(first);
  const [pageRows, setPageRows] = React.useState(rows);

  React.useEffect(() => {
    setPageFirst(first);
  }, [first]);

  React.useEffect(() => {
    setPageRows(rows);
  }, [rows]);

  React.useEffect(() => {
    if (lazy) onLazyLoad?.({ first: pageFirst, rows: pageRows, sortField, sortOrder });
  }, [lazy, pageFirst, pageRows, sortField, sortOrder, onLazyLoad]);

  const processed = React.useMemo(() => {
    if (lazy || !sortField) return value;
    return [...value].sort((a, b) => compare(field(a, sortField), field(b, sortField)) * sortOrder);
  }, [value, lazy, sortField, sortOrder]);
  const count = lazy ? (totalRecords ?? value.length) : processed.length;
  const paged =
    lazy || !paginator || pageRows <= 0
      ? processed
      : processed.slice(pageFirst, pageFirst + pageRows);
  const changePage = (event: PaginatorPageChangeEvent): void => {
    setPageFirst(event.first);
    setPageRows(event.rows);
    onPageChange?.(event);
  };
  const pageCount = pageRows > 0 ? Math.ceil(count / pageRows) : 0;
  const report = currentPageReportTemplate
    .replaceAll("{first}", String(count ? pageFirst + 1 : 0))
    .replaceAll("{last}", String(Math.min(pageFirst + pageRows, count)))
    .replaceAll("{totalRecords}", String(count))
    .replaceAll("{currentPage}", String(pageCount ? Math.floor(pageFirst / pageRows) + 1 : 0))
    .replaceAll("{totalPages}", String(pageCount))
    .replaceAll("{rows}", String(pageRows));
  const showPaginator = paginator && (alwaysShowPaginator || count > pageRows);
  const paging = (
    <UPaginator first={pageFirst} rows={pageRows} totalRecords={count} onPageChange={changePage} />
  );
  const key = (item: T, index: number): React.Key =>
    dataKey ? String(field(item, dataKey)) : trackBy ? trackBy(item, index) : index;

  return (
    <div className={[cx("root"), className].filter(Boolean).join(" ")} aria-busy={loading}>
      {loading && <span role="status">{loadingIcon}</span>}
      {showPaginator && paginatorPosition !== "bottom" && paging}
      {layout === "grid" ? (
        <div className={cx("list", { layout: "grid" })} role="list">
          {paged.length ? (
            paged.map((item, index) => (
              <div className={cx("listItem")} role="listitem" key={key(item, index)}>
                {itemTemplate(item, "grid")}
              </div>
            ))
          ) : (
            <div>{emptyMessage}</div>
          )}
        </div>
      ) : (
        <ul className={cx("list", { layout: "list" })}>
          {paged.length ? (
            paged.map((item, index) => (
              <li className={cx("listItem")} key={key(item, index)}>
                {itemTemplate(item, "list")}
              </li>
            ))
          ) : (
            <li>{emptyMessage}</li>
          )}
        </ul>
      )}
      {showPaginator && paginatorPosition !== "top" && paging}
      {paginator && (
        <>
          {rowsPerPageOptions.length > 0 && (
            <label>
              Rows per page
              <select
                value={pageRows}
                onChange={(event) => {
                  const nextRows = Number(event.target.value);
                  if (nextRows > 0)
                    changePage({
                      first: 0,
                      rows: nextRows,
                      page: 0,
                      pageCount: Math.ceil(count / nextRows),
                    });
                }}
              >
                {rowsPerPageOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          )}
          <span aria-live="polite">{report}</span>
        </>
      )}
    </div>
  );
}
