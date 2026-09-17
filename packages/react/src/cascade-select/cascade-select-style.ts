import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `../select/select-style.ts`'s established
 * React convention (no `dt()` tokens).
 */
const css = /*css*/ `
.u-cascade-select { position: relative; display: inline-flex; align-items: center; cursor: pointer; border: 1px solid #d1d5db; border-radius: 6px; background: #ffffff; }
.u-cascade-select-disabled { cursor: default; opacity: 0.6; }
.u-cascade-select-open { border-color: #6366f1; }
.u-cascade-select-label { flex: 1 1 auto; padding: 0.5rem 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; outline: none; }
.u-cascade-select-placeholder { color: #6b7280; }
.u-cascade-select-dropdown { display: flex; align-items: center; justify-content: center; width: 2rem; flex-shrink: 0; }
.u-cascade-select-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 0.25rem;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.u-cascade-select-list { margin: 0; padding: 0.25rem; list-style: none; display: flex; flex-direction: column; gap: 1px; min-width: 10rem; }
.u-cascade-select-sublist {
  position: absolute;
  left: 100%;
  top: 0;
  z-index: 1;
  min-width: 10rem;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.u-cascade-select-option { cursor: pointer; position: relative; }
.u-cascade-select-option-content { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 4px; }
.u-cascade-select-option-content-focused { background: #f3f4f6; }
.u-cascade-select-option-content-selected { background: #e0e7ff; }
.u-cascade-select-option-content-disabled { cursor: default; opacity: 0.5; }
.u-cascade-select-group-icon { font-size: 0.75rem; }
.u-cascade-select-empty-message { padding: 0.5rem 0.75rem; color: #6b7280; }
`;

export interface CascadeSelectClassesParams {
  disabled?: boolean;
  overlayVisible?: boolean;
  placeholder?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: CascadeSelectClassesParams = {}) => [
    "u-cascade-select u-component",
    {
      "u-cascade-select-disabled": Boolean(params.disabled),
      "u-cascade-select-open": Boolean(params.overlayVisible),
    },
  ],
  label: (params: CascadeSelectClassesParams = {}) => [
    "u-cascade-select-label",
    { "u-cascade-select-placeholder": Boolean(params.placeholder) },
  ],
  dropdown: "u-cascade-select-dropdown",
  overlay: "u-cascade-select-overlay",
  list: "u-cascade-select-list",
  sublist: "u-cascade-select-sublist",
  option: "u-cascade-select-option",
  optionContent: (params: CascadeSelectClassesParams = {}) => [
    "u-cascade-select-option-content",
    {
      "u-cascade-select-option-content-focused": Boolean(params.focused),
      "u-cascade-select-option-content-selected": Boolean(params.selected),
      "u-cascade-select-option-content-disabled": Boolean(params.disabled),
    },
  ],
  groupIcon: "u-cascade-select-group-icon",
  emptyMessage: "u-cascade-select-empty-message",
};

export const cascadeSelectStyleModule: StyleModule = { css, classes };
