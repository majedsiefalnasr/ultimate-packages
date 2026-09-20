/**
 * Ultimate-owned adaptation of PrimeNG's `SplitterStyle` (see
 * `.vendor-extracted/ng/splitter/style/splitterstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/splitter` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-splitter { display: flex; border: 1px solid var(--u-splitter-border, #e5e7eb); border-radius: 6px; overflow: hidden; }
.u-splitter-vertical { flex-direction: column; }
.u-splitter-panel { flex-grow: 1; flex-shrink: 1; overflow: auto; }
.u-splitter-gutter { flex-grow: 0; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--u-splitter-gutter-bg, #f3f4f6); cursor: col-resize; touch-action: none; user-select: none; }
.u-splitter-vertical .u-splitter-gutter { cursor: row-resize; }
.u-splitter-gutter-handle { background: var(--u-splitter-handle-bg, #d1d5db); border-radius: 2px; }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-splitter u-component",
    `u-splitter-${(params?.["layout"] as string) ?? "horizontal"}`,
  ],
  panel: "u-splitter-panel",
  gutter: "u-splitter-gutter",
  gutterHandle: "u-splitter-gutter-handle",
};

/** `UBaseComponent`-shaped style module for `USplitter`. */
export const splitterStyleModule = { css, classes };
