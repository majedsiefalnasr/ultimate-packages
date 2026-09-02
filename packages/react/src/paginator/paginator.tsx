import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { getPageCount } from "@ultimate/uix-data";
import { paginatorStyleModule } from "./paginator-style";

export interface PaginatorPageChangeEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

export interface UPaginatorProps {
  first: number;
  rows: number;
  totalRecords: number;
  pageLinkSize?: number;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

/**
 * Scaffold for `UPaginator`: bare functional component with core derived
 * state (`pageCount` via uix-data's `getPageCount`, `page` from `first`/
 * `rows`). No first/prev/next/last controls or `changePage` yet — that's
 * Task 8's scope. Both computed values are exposed via `data-page-count`/
 * `data-page` attributes on the root `<nav>` for test assertion, mirroring
 * `UScroller`'s pattern of exposing internal state via `data-*` attributes,
 * and matching Angular Task 2's identical `data-page-count`/`data-page`
 * host-attribute convention for this same component.
 *
 * `pageLinkSize` and `onPageChange` are part of `UPaginatorProps`'s public
 * contract (consumed by Task 8) but are not destructured here: this task's
 * scope is state computation only, and destructuring props this component
 * doesn't yet read would trip `@typescript-eslint/no-unused-vars` (enforced
 * at error severity for `packages/react/src/**`, unlike the `uix-*` package
 * override) — Task 8 destructures them once it renders the controls that
 * consume them.
 *
 * DEVIATION from the brief's literal Step 3 example: the brief's sample
 * destructures `pageLinkSize = 5` and `onPageChange` and computes `page`
 * without exposing it, but never reads any of the three within Task 7's
 * scope. Angular's Task 2 sidesteps this because Angular treats unused
 * class fields/getters as fine — React's function-scope destructuring does
 * not get that exemption, so `pageLinkSize`/`onPageChange` are left off the
 * destructure (still fully typed on `UPaginatorProps`) and `page` is
 * consumed via `data-page` instead of computed-and-discarded.
 */
export const UPaginator: React.FC<UPaginatorProps> = ({ first, rows, totalRecords }) => {
  const { cx } = useComponentBase({ componentName: "paginator", styleModule: paginatorStyleModule });

  const pageCount = getPageCount(totalRecords, rows);
  const page = rows > 0 ? Math.floor(first / rows) : 0;

  return <nav className={cx("root")} data-page-count={pageCount} data-page={page} />;
};
