import type { StyleModule } from "@ultimate/vue-core";
import { style as paginatorCss } from "@ultimate/uix-styles/paginator";

/**
 * Implementation-time verification finding (matching the same adaptation
 * already established in `packages/vue/src/button/button-style.ts` and
 * Angular's `packages/ng/src/button/button-style.ts`): the brief's draft
 * assumed `@ultimate/uix-styles/paginator` exports a `paginatorStyle`
 * object already shaped as `{ css, classes }`. The real file
 * (`packages/uix-styles/src/paginator/index.ts`) only exports a plain
 * `style: string` — raw CSS with `dt()` token references, no `classes`
 * resolver map. `StyleModule` (`packages/vue-core/src/base/base-component.ts`)
 * requires both `css` and a `classes` map of per-slot resolvers, so the
 * `classes` map below is authored locally here, not re-exported from
 * uix-styles.
 */
const css = /*css*/ `
    ${paginatorCss}
`;

// Task 10 shipped only the root/content slots this template rendered at the
// time. Task 11 extends the same object with the first/prev/next/last/page
// control slots now that Paginator.vue renders those buttons, matching the
// identical class-name slots already shipped/approved on Angular (Tasks 3-5)
// and React (Task 8) for cross-framework parity.
const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
  first: (params: Record<string, unknown> = {}) => ["u-paginator-first", { "u-paginator-first-disabled": !!params.disabled }],
  prev: (params: Record<string, unknown> = {}) => ["u-paginator-prev", { "u-paginator-prev-disabled": !!params.disabled }],
  next: (params: Record<string, unknown> = {}) => ["u-paginator-next", { "u-paginator-next-disabled": !!params.disabled }],
  last: (params: Record<string, unknown> = {}) => ["u-paginator-last", { "u-paginator-last-disabled": !!params.disabled }],
  page: (params: Record<string, unknown> = {}) => ["u-paginator-page", { "u-paginator-page-selected": !!params.selected }],
  currentPageReport: () => "u-paginator-current-report",
};

export const paginatorStyleModule: StyleModule = { css, classes };
