import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS, no `dt()` tokens, matching `date-picker-style.ts`'s
 * established React convention. Selector structure ported from real
 * source's own inline `styles` string (`.vendor-extracted`
 * `react/mention/MentionBase.js`), `.p-mention*` renamed to `.u-mention*`.
 * The overlay itself is rendered in-flow (not a Portal/z-index-tier
 * overlay) — see `mention.tsx`'s own doc comment for why, matching this
 * package's already-Built `UAutoComplete`'s identical precedent.
 */
const css = /*css*/ `
.u-mention { display: inline-flex; position: relative; }
.u-mention-panel {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 0.25rem;
  min-width: 220px;
  max-height: 200px;
  overflow: auto;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.u-mention-items { margin: 0; padding: 0.25rem 0; list-style-type: none; }
.u-mention-item {
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  padding: 0.5rem 0.75rem;
}
.u-mention-item-selected { background: #eef2ff; }
.u-mention-input {
  width: 100%;
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  resize: vertical;
}
`;

const classes = {
  root: (params: { focused?: boolean; filled?: boolean } = {}) => [
    "u-mention",
    { "u-mention-focused": params.focused, "u-mention-filled": params.filled },
  ],
  input: "u-mention-input",
  panel: "u-mention-panel",
  items: "u-mention-items",
  item: (params: { selected?: boolean } = {}) => [
    "u-mention-item",
    { "u-mention-item-selected": params.selected },
  ],
};

export const mentionStyleModule: StyleModule = { css, classes };
