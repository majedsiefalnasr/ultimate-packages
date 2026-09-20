import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `toggle-button-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-select-button { display: inline-flex; user-select: none; vertical-align: bottom; border-radius: 6px; }
.u-select-button-invalid { outline: 1px solid #ef4444; outline-offset: 0; }
.u-select-button-fluid { display: flex; }
.u-select-button-fluid .u-toggle-button { flex: 1 1 0; }
`;

export interface SelectButtonClassesParams {
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: SelectButtonClassesParams = {}) => [
    "u-select-button u-component",
    {
      "u-select-button-invalid": Boolean(params.invalid),
      "u-select-button-fluid": Boolean(params.fluid),
    },
  ],
};

export const selectButtonStyleModule: StyleModule = { css, classes };
