/**
 * Ultimate-owned adaptation of PrimeReact's `DataScroller` style (real
 * source: `components/lib/datascroller/DataScrollerBase.js`), shaped to
 * match `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/datascroller` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tagStyleModule`).
 */
const css = /*css*/ `
.u-data-scroller { display: block; }
.u-data-scroller-inline { overflow-y: auto; }
.u-data-scroller-content { display: flex; flex-direction: column; }
.u-data-scroller-empty-message { padding: 0.75rem; text-align: center; color: var(--u-data-scroller-empty-color, #6b7280); }
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    ["u-data-scroller u-component", params?.["inline"] ? "u-data-scroller-inline" : ""].filter(Boolean).join(" "),
  content: "u-data-scroller-content",
  emptyMessage: "u-data-scroller-empty-message",
};

/** `useComponentBase`-shaped style module for `UDataScroller`. */
export const dataScrollerStyleModule = { css, classes };
