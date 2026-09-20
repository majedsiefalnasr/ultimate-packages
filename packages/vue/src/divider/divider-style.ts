/**
 * Ultimate-owned adaptation of PrimeVue's `DividerStyle` (see
 * `.vendor-extracted/vue/divider/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/divider` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-divider { display: flex; position: relative; }
.u-divider-horizontal { width: 100%; margin: 1rem 0; align-items: center; }
.u-divider-horizontal::before { content: ""; flex: 1 1 0%; border-top: 1px solid var(--u-divider-border-color, #dee2e6); }
.u-divider-vertical { min-height: 100%; margin: 0 1rem; justify-content: center; }
.u-divider-vertical::before { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; border-left: 1px solid var(--u-divider-border-color, #dee2e6); }
.u-divider-content { padding: 0 0.5rem; z-index: 1; background: var(--u-divider-content-background, #fff); }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-divider u-component",
    {
      "u-divider-horizontal": params?.["layout"] !== "vertical",
      "u-divider-vertical": params?.["layout"] === "vertical",
    },
  ],
  content: "u-divider-content",
};

/** `createBaseComponent`-shaped style module for `UDivider`. */
export const dividerStyleModule = { css, classes };
