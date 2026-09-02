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

// Only the two slots this task's template actually renders (root, content).
// Task 11 extends this same object with first/prev/next/last/page slots when
// it adds those controls — this is the real, final style-source wiring from
// day one, not a value later thrown away; nothing here is a placeholder.
const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
};

export const paginatorStyleModule: StyleModule = { css, classes };
