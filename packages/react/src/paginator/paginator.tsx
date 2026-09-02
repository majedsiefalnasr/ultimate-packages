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
 * `UPaginator`: full first/prev/next/last controls plus page-link buttons,
 * matching Angular's Tasks 3-5 combined (controls + page-links +
 * accessibility, all in one task here). `page` is now genuinely consumed
 * (via `isFirstPage`/`isLastPage`/the page-link `aria-current` logic), so
 * Task 7's `data-page` attribute — added purely as a documented
 * `@typescript-eslint/no-unused-vars` workaround for that task's narrower,
 * controls-free render — is dropped here rather than carried forward.
 *
 * DEVIATION from Task 7 (documented, evidence-based): grepped the repo for
 * `data-page` usage — Angular's `paginator.ts`/`paginator.spec.ts` keep
 * `[attr.data-page]` as a real, permanently-tested host-attribute
 * convention (alongside `data-page-links`), but nothing in this package's
 * own spec, any later-task plan text, or any other file reads `data-page`
 * on the *React* `<nav>` specifically. Task 7's own component comment
 * frames it as a lint workaround scoped to that task's narrower render,
 * not a cross-framework contract requirement for React. Since `page` no
 * longer needs an artificial consumer and no test depends on the
 * attribute, it is intentionally omitted; `data-page-count` is kept
 * (asserted by two existing tests and shared with Angular/Vue as the
 * common cross-framework convention per the plan).
 *
 * `changePage` never mutates internal state — it only ever calls
 * `props.onPageChange(...)`, matching the React state-ownership model in
 * spec §8/§13: this component holds no page state of its own, so a parent
 * that ignores the callback sees no UI advance (verified by an explicit
 * "no uncontrolled fallback" test).
 */
export const UPaginator: React.FC<UPaginatorProps> = ({
  first,
  rows,
  totalRecords,
  pageLinkSize = 5,
  onPageChange,
}) => {
  const { cx } = useComponentBase({ componentName: "paginator", styleModule: paginatorStyleModule });

  const pageCount = getPageCount(totalRecords, rows);
  const page = rows > 0 ? Math.floor(first / rows) : 0;
  const isFirstPage = page === 0;
  const isLastPage = page === pageCount - 1;

  const changePage = (newFirst: number) => {
    const p = rows > 0 ? Math.floor(newFirst / rows) : 0;
    if (p >= 0 && p < pageCount) {
      onPageChange({ page: p, first: newFirst, rows, pageCount });
    }
  };

  const visiblePages = Math.min(pageLinkSize, pageCount);
  let start = Math.max(0, Math.ceil(page - visiblePages / 2));
  const end = Math.min(pageCount - 1, start + visiblePages - 1);
  const delta = pageLinkSize - (end - start + 1);
  start = Math.max(0, start - delta);
  const pageLinks: number[] = [];
  for (let i = start; i <= end; i++) pageLinks.push(i + 1);

  return (
    <nav className={cx("root")} data-page-count={pageCount}>
      <div className={cx("content")}>
        <button
          type="button"
          data-u-paginator-first
          className={cx("first", { disabled: isFirstPage })}
          disabled={isFirstPage}
          aria-label="First Page"
          onClick={() => changePage(0)}
        />
        <button
          type="button"
          data-u-paginator-prev
          className={cx("prev", { disabled: isFirstPage })}
          disabled={isFirstPage}
          aria-label="Previous Page"
          onClick={() => changePage(Math.max(0, first - rows))}
        />
        {pageLinks.map((link) => (
          <button
            key={link}
            type="button"
            data-u-paginator-page
            className={cx("page", { selected: link - 1 === page })}
            aria-current={link - 1 === page ? "page" : undefined}
            aria-label={`Page ${link}`}
            onClick={() => changePage((link - 1) * rows)}
          >
            {link}
          </button>
        ))}
        <button
          type="button"
          data-u-paginator-next
          className={cx("next", { disabled: isLastPage })}
          disabled={isLastPage}
          aria-label="Next Page"
          onClick={() => changePage(first + rows)}
        />
        <button
          type="button"
          data-u-paginator-last
          className={cx("last", { disabled: isLastPage })}
          disabled={isLastPage}
          aria-label="Last Page"
          onClick={() => changePage((pageCount - 1) * rows)}
        />
      </div>
    </nav>
  );
};
