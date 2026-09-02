import type { StyleModule } from "@ultimate/react-core";
import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

/**
 * `UBaseComponent`-shaped style module for `UPaginator`, following
 * `scroller-style.ts`'s established `${importedStyle}` interpolation
 * pattern: Task 1's ported `@ultimate/uix-styles/paginator` tokens
 * (`.u-paginator*` selectors, already renamed from PrimeUix's `.p-paginator*`)
 * are composed here unchanged.
 *
 * This task (React Task 7) renders only the root `<nav>` element, so
 * `classes` exposes just the `root` slot — matching Angular Task 2's
 * `paginator-style.ts` scoping and `button-style.ts`/`scroller-style.ts`'s
 * pattern of scoping `classes` to what each component's template actually
 * binds. Task 8 (first/prev/next/last controls, page-links) extends this
 * object with the additional class-name slots its own template requires.
 */
const css = /*css*/ `
    ${paginatorStyle}
`;

/**
 * Class-name-slot resolver for `UPaginator`. Real PrimeReact root class name
 * (`.p-paginator`) renamed `.p-*`→`.u-*`.
 */
const classes = {
  root: () => "u-paginator u-component",
};

/** `UBaseComponent`-shaped style module for `UPaginator`. */
export const paginatorStyleModule: StyleModule = { css, classes };
