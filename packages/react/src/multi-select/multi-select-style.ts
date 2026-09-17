import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `../select/select-style.ts`'s established
 * React convention (no `dt()` tokens — React has no
 * `@ultimate/uix-styles` subpath dependency the way Angular/Vue's style
 * modules do).
 */
const css = /*css*/ `
.u-multi-select { position: relative; display: inline-flex; align-items: center; cursor: pointer; border: 1px solid #d1d5db; border-radius: 6px; background: #ffffff; }
.u-multi-select-disabled { cursor: default; opacity: 0.6; }
.u-multi-select-open { border-color: #6366f1; }
.u-multi-select-fluid { display: flex; width: 100%; }
.u-multi-select-label { flex: 1 1 auto; padding: 0.5rem 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; outline: none; }
.u-multi-select-placeholder { color: #6b7280; }
.u-multi-select-dropdown { display: flex; align-items: center; justify-content: center; width: 2rem; flex-shrink: 0; }
.u-multi-select-clear-icon { cursor: pointer; padding: 0 0.25rem; }
.u-multi-select-overlay {
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
.u-multi-select-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; }
.u-multi-select-filter { flex: 1 1 auto; box-sizing: border-box; padding: 0.375rem 0.5rem; }
.u-multi-select-list-container { max-height: 15rem; overflow: auto; }
.u-multi-select-list { margin: 0; padding: 0.25rem; list-style: none; display: flex; flex-direction: column; gap: 1px; }
.u-multi-select-option { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 4px; }
.u-multi-select-option-focused { background: #f3f4f6; }
.u-multi-select-option-selected { background: #e0e7ff; }
.u-multi-select-option-disabled { cursor: default; opacity: 0.5; }
.u-multi-select-empty-message { padding: 0.5rem 0.75rem; color: #6b7280; }
`;

export interface MultiSelectClassesParams {
  disabled?: boolean;
  fluid?: boolean;
  overlayVisible?: boolean;
  placeholder?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: MultiSelectClassesParams = {}) => [
    "u-multi-select u-component",
    {
      "u-multi-select-disabled": Boolean(params.disabled),
      "u-multi-select-open": Boolean(params.overlayVisible),
      "u-multi-select-fluid": Boolean(params.fluid),
    },
  ],
  label: (params: MultiSelectClassesParams = {}) => [
    "u-multi-select-label",
    { "u-multi-select-placeholder": Boolean(params.placeholder) },
  ],
  dropdown: "u-multi-select-dropdown",
  clearIcon: "u-multi-select-clear-icon",
  overlay: "u-multi-select-overlay",
  header: "u-multi-select-header",
  filter: "u-multi-select-filter",
  listContainer: "u-multi-select-list-container",
  list: "u-multi-select-list",
  option: (params: MultiSelectClassesParams = {}) => [
    "u-multi-select-option",
    {
      "u-multi-select-option-focused": Boolean(params.focused),
      "u-multi-select-option-selected": Boolean(params.selected),
      "u-multi-select-option-disabled": Boolean(params.disabled),
    },
  ],
  emptyMessage: "u-multi-select-empty-message",
};

export const multiSelectStyleModule: StyleModule = { css, classes };
