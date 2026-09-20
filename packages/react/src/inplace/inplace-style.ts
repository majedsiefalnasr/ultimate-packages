/**
 * Ultimate-owned adaptation of PrimeReact's `InplaceBase` style (real
 * source: `components/lib/inplace/InplaceBase.js`'s `css`/`classes`),
 * shaped to match `useComponentBase`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/inplace` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as `cardStyleModule`).
 */
const css = /*css*/ `
.u-inplace-display { cursor: pointer; display: inline; border-radius: 6px; }
.u-inplace-display:focus-visible { outline: 2px solid var(--u-inplace-focus-ring, #8dd0ff); outline-offset: 1px; }
.u-inplace-content { display: inline-flex; align-items: center; gap: 0.5rem; }
`;

const classes = {
  root: () => ["u-inplace u-component"],
  display: "u-inplace-display",
  content: "u-inplace-content",
};

/** `useComponentBase`-shaped style module for `UInplace`. */
export const inplaceStyleModule = { css, classes };
