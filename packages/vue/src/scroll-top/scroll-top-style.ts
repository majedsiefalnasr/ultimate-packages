/**
 * Ultimate-owned adaptation of PrimeVue's `ScrollTopStyle` (see
 * `.vendor-extracted/vue/scrolltop/style/ScrollTopStyle.js`), shaped to
 * match `vue-core`'s `createBaseComponent`'s `styleModule: {css, classes}`
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

/** `createBaseComponent`-shaped style module for `UScrollTop`. */
export const scrollTopStyleModule = { css, classes };
