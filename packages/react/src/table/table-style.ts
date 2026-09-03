import type { StyleModule } from "@ultimate/react-core";
import { style as tableStyle } from "@ultimate/uix-styles/table";

/**
 * `UBaseComponent`-shaped style module for `UTable`, following
 * `paginator-style.ts`'s established `${importedStyle}` interpolation
 * pattern: Table 1's ported `@ultimate/uix-styles/table` tokens
 * (`.u-table*` selectors, already renamed from PrimeUix's `.p-datatable*`)
 * are composed here unchanged.
 */
const css = /*css*/ `
    ${tableStyle}
`;

/**
 * Class-name-slot resolver for `UTable`. Each row slot accepts an optional
 * params object driving a `selected` modifier class, matching Angular's
 * `table-style.ts` slot signatures.
 */
const classes = {
  root: () => "u-table u-component",
  table: () => "u-table-table",
  thead: () => "u-table-thead",
  tbody: () => "u-table-tbody",
  row: (params: { selected?: boolean } = {}) => ["u-table-row", { "u-table-row-selected": params.selected }],
};

/** `UBaseComponent`-shaped style module for `UTable`. */
export const tableStyleModule: StyleModule = { css, classes };
