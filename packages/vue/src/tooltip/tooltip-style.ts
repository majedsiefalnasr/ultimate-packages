import type { StyleModule } from "@ultimate/vue-core";
import { style as tooltipCss } from "@ultimate/uix-styles/tooltip";

/**
 * Implementation-time verification finding (this task's Step 2, same
 * mismatch already found for `@ultimate/uix-styles/button` in Task 17 and
 * for Angular's `packages/ng/src/tooltip/tooltip-style.ts`): the brief's
 * draft assumed `@ultimate/uix-styles/tooltip` exports a `tooltipStyle`
 * object already shaped as `StyleModule`'s `{ css, classes }` contract. The
 * real file (`packages/uix-styles/src/tooltip/index.ts`) only exports a
 * plain `style: string` — raw CSS with `dt()` token references, no
 * `classes` resolver map at all. `StyleModule`
 * (`packages/vue-core/src/base/base-component.ts`) requires both `css` and
 * a `classes` map of per-slot resolvers. The `classes` map below is
 * therefore authored locally here, not re-exported from uix-styles.
 */
const css = /*css*/ `
    ${tooltipCss}
`;

const classes = {
  root: (params: { position?: string } = {}) => [
    "u-tooltip",
    { [`u-tooltip-${params.position ?? "right"}`]: true },
  ],
  text: "u-tooltip-text",
  arrow: "u-tooltip-arrow",
};

export const tooltipStyleModule: StyleModule = { css, classes };
