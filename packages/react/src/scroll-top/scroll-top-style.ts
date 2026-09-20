/**
 * Ultimate-owned adaptation of PrimeReact's `ScrollTopBase` css, shaped to
 * match `react-core`'s `useComponentBase`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/scrolltop` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-scroll-top { position: fixed; bottom: 1.5rem; inset-inline-end: 1.5rem; }
.u-scroll-top-parent { position: sticky; }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-scroll-top",
    { "u-scroll-top-parent": params?.["target"] === "parent" },
  ],
};

/** `useComponentBase`-shaped style module for `UScrollTop`. */
export const scrollTopStyleModule = { css, classes };
