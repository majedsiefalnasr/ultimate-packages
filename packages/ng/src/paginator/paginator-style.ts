import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

/**
 * `UBaseComponent`-shaped style module for `UPaginator`, following
 * `scroller-style.ts`'s established `${importedStyle}` interpolation
 * pattern: Task 1's ported `@ultimate/uix-styles/paginator` tokens
 * (`.u-paginator*` selectors, already renamed from PrimeUix's `.p-paginator*`)
 * are composed here unchanged.
 *
 * This task (Task 2) only renders the root `<nav>` element, so `classes`
 * exposes only the `root` slot it needs. Task 3 (first/prev/next/last
 * controls) extends this object with the additional class-name slots its
 * own template requires — matching how `button-style.ts`/`scroller-style.ts`
 * scope their `classes` object to what each component's template actually
 * binds.
 */
const css = /*css*/ `
    ${paginatorStyle}
`;

/**
 * Class-name-slot resolver for `UPaginator`. Real PrimeNG root class name
 * (`.p-paginator`) renamed `.p-*`→`.u-*`.
 */
const classes = {
  root: () => "u-paginator u-component",
};

/** `UBaseComponent`-shaped style module for `UPaginator`. */
export const paginatorStyleModule = { css, classes };
