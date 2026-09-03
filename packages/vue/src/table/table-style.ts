import type { StyleModule } from "@ultimate/vue-core";
import { style as tableCss } from "@ultimate/uix-styles/table";

/**
 * Implementation-time verification finding (matching the same adaptation
 * already established in `packages/vue/src/paginator/paginator-style.ts`
 * and Angular's/React's equivalent table-style files): the brief's draft
 * assumed `@ultimate/uix-styles/table` exports a `tableStyle` object
 * already shaped as `{ css, classes }`. The real file
 * (`packages/uix-styles/src/table/index.ts`) only exports a plain
 * `style: string` — raw CSS with `dt()` token references, no `classes`
 * resolver map. `StyleModule` (`packages/vue-core/src/base/base-component.ts`)
 * requires both `css` and a `classes` map of per-slot resolvers, so the
 * `classes` map below is authored locally here, not re-exported from
 * uix-styles.
 */
const css = /*css*/ `
    ${tableCss}
`;

const classes = {
  root: () => "u-table u-component",
  table: () => "u-table-table",
  thead: () => "u-table-thead",
  tbody: () => "u-table-tbody",
  row: (params: Record<string, unknown> = {}) => ["u-table-row", { "u-table-row-selected": !!params.selected }],
};

export const tableStyleModule: StyleModule = { css, classes };
