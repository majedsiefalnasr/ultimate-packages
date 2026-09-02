import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

/**
 * `UBaseComponent`-shaped style module for `UPaginator`, following
 * `scroller-style.ts`'s established `${importedStyle}` interpolation
 * pattern: Task 1's ported `@ultimate/uix-styles/paginator` tokens
 * (`.u-paginator*` selectors, already renamed from PrimeUix's `.p-paginator*`)
 * are composed here unchanged.
 *
 * Task 2 rendered only the root host element, so `classes` exposed just the
 * `root` slot. Task 3 (first/prev/next/last controls) extends this object
 * with the additional class-name slots its own template requires —
 * `content` plus the four nav-button slots and `page` — matching how
 * `button-style.ts`/`scroller-style.ts` scope their `classes` object to
 * what each component's template actually binds.
 */
const css = /*css*/ `
    ${paginatorStyle}
`;

/**
 * Class-name-slot resolver for `UPaginator`. Real PrimeNG root/part class
 * names (`.p-paginator*`) renamed `.p-*`→`.u-*`.
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
export const paginatorStyleModule = { css, classes };
