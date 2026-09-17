import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `autocomplete-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-select { position: relative; display: inline-flex; align-items: center; cursor: pointer; border: 1px solid #d1d5db; border-radius: 6px; background: #ffffff; }
.u-select-disabled { cursor: default; opacity: 0.6; }
.u-select-open { border-color: #6366f1; }
.u-select-fluid { display: flex; width: 100%; }
.u-select-label { flex: 1 1 auto; padding: 0.5rem 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; outline: none; }
.u-select-placeholder { color: #6b7280; }
.u-select-dropdown { display: flex; align-items: center; justify-content: center; width: 2rem; flex-shrink: 0; }
.u-select-clear-icon { cursor: pointer; padding: 0 0.25rem; }
.u-select-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 100%;
  z-index: 1000;
  margin-top: 0.25rem;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.u-select-header { padding: 0.5rem; }
.u-select-filter { width: 100%; box-sizing: border-box; padding: 0.375rem 0.5rem; }
.u-select-list-container { max-height: 15rem; overflow: auto; }
.u-select-list { margin: 0; padding: 0.25rem; list-style: none; display: flex; flex-direction: column; gap: 1px; }
.u-select-option { cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 4px; }
.u-select-option-focused { background: #f3f4f6; }
.u-select-option-selected { background: #e0e7ff; }
.u-select-option-disabled { cursor: default; opacity: 0.5; }
.u-select-empty-message { padding: 0.5rem 0.75rem; color: #6b7280; }
`;

export interface SelectClassesParams {
  disabled?: boolean;
  fluid?: boolean;
  overlayVisible?: boolean;
  placeholder?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: SelectClassesParams = {}) => [
    "u-select u-component",
    {
      "u-select-disabled": Boolean(params.disabled),
      "u-select-open": Boolean(params.overlayVisible),
      "u-select-fluid": Boolean(params.fluid),
    },
  ],
  label: (params: SelectClassesParams = {}) => [
    "u-select-label",
    { "u-select-placeholder": Boolean(params.placeholder) },
  ],
  dropdown: "u-select-dropdown",
  clearIcon: "u-select-clear-icon",
  overlay: "u-select-overlay",
  header: "u-select-header",
  filter: "u-select-filter",
  listContainer: "u-select-list-container",
  list: "u-select-list",
  option: (params: SelectClassesParams = {}) => [
    "u-select-option",
    {
      "u-select-option-focused": Boolean(params.focused),
      "u-select-option-selected": Boolean(params.selected),
      "u-select-option-disabled": Boolean(params.disabled),
    },
  ],
  emptyMessage: "u-select-empty-message",
};

export const selectStyleModule: StyleModule = { css, classes };
