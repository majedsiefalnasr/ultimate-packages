/**
 * Ultimate-owned adaptation of PrimeReact's `Toolbar` style (real source:
 * `components/lib/toolbar/ToolbarBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/toolbar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding: 0.75rem 1rem; background: var(--u-toolbar-bg, #f9fafb); border: 1px solid var(--u-toolbar-border, #e5e7eb); border-radius: 6px; }
.u-toolbar-start { display: flex; align-items: center; gap: 0.5rem; }
.u-toolbar-center { display: flex; align-items: center; gap: 0.5rem; }
.u-toolbar-end { display: flex; align-items: center; gap: 0.5rem; }
`;

const classes = {
  root: "u-toolbar u-component",
  start: "u-toolbar-start",
  center: "u-toolbar-center",
  end: "u-toolbar-end",
};

/** `useComponentBase`-shaped style module for `UToolbar`. */
export const toolbarStyleModule = { css, classes };
