import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `../select/select-style.ts`'s established
 * React convention (no `dt()` tokens).
 */
const css = /*css*/ `
.u-listbox { border: 1px solid #d1d5db; border-radius: 6px; background: #ffffff; }
.u-listbox-disabled { opacity: 0.6; }
.u-listbox-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; }
.u-listbox-filter { flex: 1 1 auto; box-sizing: border-box; padding: 0.375rem 0.5rem; }
.u-listbox-list-container { max-height: 15rem; overflow: auto; }
.u-listbox-list { margin: 0; padding: 0.25rem; list-style: none; display: flex; flex-direction: column; gap: 1px; outline: none; }
.u-listbox-option { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 4px; }
.u-listbox-option-focused { background: #f3f4f6; }
.u-listbox-option-selected { background: #e0e7ff; }
.u-listbox-option-disabled { cursor: default; opacity: 0.5; }
.u-listbox-empty-message { padding: 0.5rem 0.75rem; color: #6b7280; }
`;

export interface ListboxClassesParams {
  disabled?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: ListboxClassesParams = {}) => [
    "u-listbox u-component",
    { "u-listbox-disabled": Boolean(params.disabled) },
  ],
  header: "u-listbox-header",
  filter: "u-listbox-filter",
  listContainer: "u-listbox-list-container",
  list: "u-listbox-list",
  option: (params: ListboxClassesParams = {}) => [
    "u-listbox-option",
    {
      "u-listbox-option-focused": Boolean(params.focused),
      "u-listbox-option-selected": Boolean(params.selected),
      "u-listbox-option-disabled": Boolean(params.disabled),
    },
  ],
  emptyMessage: "u-listbox-empty-message",
};

export const listboxStyleModule: StyleModule = { css, classes };
