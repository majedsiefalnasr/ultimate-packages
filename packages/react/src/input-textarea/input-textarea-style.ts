import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-inputtextarea {
  font-family: inherit;
  font-feature-settings: inherit;
  font-size: 1rem;
  color: var(--u-inputtext-color, #495057);
  background: var(--u-inputtext-background, #ffffff);
  padding-block: var(--u-inputtext-padding-y, 0.5rem);
  padding-inline: var(--u-inputtext-padding-x, 0.75rem);
  border: 1px solid var(--u-inputtext-border-color, #ced4da);
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  border-radius: var(--u-inputtext-border-radius, 6px);
  outline-color: transparent;
}
.u-inputtextarea:enabled:hover { border-color: var(--u-inputtext-hover-border-color, #adb5bd); }
.u-inputtextarea:enabled:focus {
  border-color: var(--u-inputtext-focus-border-color, #2196F3);
  box-shadow: 0 0 0 0.2rem rgba(33,150,243,0.2);
}
.u-inputtextarea-invalid { border-color: var(--u-inputtext-invalid-border-color, #e24c4c); }
.u-inputtextarea-variant-filled { background: var(--u-inputtext-filled-background, #f8f9fa); }
.u-inputtextarea:disabled { opacity: 1; color: var(--u-inputtext-disabled-color, #495057); background: var(--u-inputtext-disabled-background, #e9ecef); }
.u-inputtextarea-fluid { width: 100%; }
.u-inputtextarea-resizable { overflow: hidden; resize: none; }
`;

export interface InputTextareaClassesParams {
  disabled?: boolean;
  filled?: boolean;
  invalid?: boolean;
  variantFilled?: boolean;
  fluid?: boolean;
  autoResize?: boolean;
}

const classes = {
  root: (params: InputTextareaClassesParams = {}) => [
    "u-inputtextarea u-component",
    {
      "u-inputtextarea-disabled": params.disabled,
      "u-inputtextarea-filled": params.filled,
      "u-inputtextarea-invalid": params.invalid,
      "u-inputtextarea-variant-filled": params.variantFilled,
      "u-inputtextarea-fluid": params.fluid,
      "u-inputtextarea-resizable": params.autoResize,
    },
  ],
};

export const inputTextareaStyleModule: StyleModule = { css, classes };
