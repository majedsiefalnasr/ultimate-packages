import type { StyleModule } from "@ultimate/react-core";
import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

/**
 * `UBaseComponent`-shaped style module for `UPaginator`, following
 * `scroller-style.ts`'s established `${importedStyle}` interpolation
 * pattern: Task 1's ported `@ultimate/uix-styles/paginator` tokens
 * (`.u-paginator*` selectors, already renamed from PrimeUix's `.p-paginator*`)
 * are composed here unchanged.
 *
 * This task (React Task 8) renders the full control row (first/prev/next/
 * last) and page-links, so `classes` is extended with the `content`/`first`/
 * `prev`/`next`/`last`/`page` slots in addition to Task 7's `root` — matching
 * Angular Task 3's slot naming exactly for cross-framework class-name parity.
 */
const css = /*css*/ `
    ${paginatorStyle}
`;

/**
 * Class-name-slot resolver for `UPaginator`. Real PrimeReact class names
 * (`.p-paginator*`) renamed `.p-*`→`.u-*`. Each interactive slot accepts an
 * optional params object driving a `disabled`/`selected` modifier class,
 * matching Angular's Task 3 `paginator-style.ts` slot signatures.
 */
const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
  first: (params: { disabled?: boolean } = {}) => [
    "u-paginator-first",
    { "u-paginator-first-disabled": params.disabled },
  ],
  prev: (params: { disabled?: boolean } = {}) => [
    "u-paginator-prev",
    { "u-paginator-prev-disabled": params.disabled },
  ],
  next: (params: { disabled?: boolean } = {}) => [
    "u-paginator-next",
    { "u-paginator-next-disabled": params.disabled },
  ],
  last: (params: { disabled?: boolean } = {}) => [
    "u-paginator-last",
    { "u-paginator-last-disabled": params.disabled },
  ],
  page: (params: { selected?: boolean } = {}) => [
    "u-paginator-page",
    { "u-paginator-page-selected": params.selected },
  ],
};

/** `UBaseComponent`-shaped style module for `UPaginator`. */
export const paginatorStyleModule: StyleModule = { css, classes };
