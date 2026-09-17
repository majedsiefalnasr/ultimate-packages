import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `checkbox-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-autocomplete { position: relative; display: inline-flex; }
.u-autocomplete-input { width: 100%; }
.u-autocomplete.u-autocomplete-fluid { display: flex; }
.u-autocomplete-loader { position: absolute; top: 50%; right: 0.75rem; transform: translateY(-50%); }
.u-autocomplete-overlay {
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
  max-height: 15rem;
  overflow: auto;
}
.u-autocomplete-list { margin: 0; padding: 0.25rem; list-style: none; display: flex; flex-direction: column; gap: 1px; }
.u-autocomplete-option { cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 4px; }
.u-autocomplete-option-focused { background: #f3f4f6; }
.u-autocomplete-option-selected { background: #e0e7ff; }
.u-autocomplete-empty-message { padding: 0.5rem 0.75rem; color: #6b7280; }
`;

export interface AutoCompleteClassesParams {
  filled?: boolean;
  disabled?: boolean;
  fluid?: boolean;
  focused?: boolean;
  selected?: boolean;
}

const classes = {
  root: (params: AutoCompleteClassesParams = {}) => [
    "u-autocomplete u-component",
    {
      "u-autocomplete-filled": Boolean(params.filled),
      "u-autocomplete-disabled": Boolean(params.disabled),
      "u-autocomplete-fluid": Boolean(params.fluid),
    },
  ],
  input: "u-autocomplete-input",
  loader: "u-autocomplete-loader",
  overlay: "u-autocomplete-overlay",
  list: "u-autocomplete-list",
  option: (params: AutoCompleteClassesParams = {}) => [
    "u-autocomplete-option",
    {
      "u-autocomplete-option-focused": Boolean(params.focused),
      "u-autocomplete-option-selected": Boolean(params.selected),
    },
  ],
  emptyMessage: "u-autocomplete-empty-message",
};

export const autoCompleteStyleModule: StyleModule = { css, classes };
