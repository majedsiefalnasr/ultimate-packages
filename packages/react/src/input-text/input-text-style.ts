import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-inputtext {
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
.u-inputtext:enabled:hover { border-color: var(--u-inputtext-hover-border-color, #adb5bd); }
.u-inputtext:enabled:focus {
  border-color: var(--u-inputtext-focus-border-color, #2196F3);
  box-shadow: 0 0 0 0.2rem rgba(33,150,243,0.2);
}
.u-inputtext-invalid { border-color: var(--u-inputtext-invalid-border-color, #e24c4c); }
.u-inputtext-variant-filled { background: var(--u-inputtext-filled-background, #f8f9fa); }
.u-inputtext:disabled { opacity: 1; color: var(--u-inputtext-disabled-color, #495057); background: var(--u-inputtext-disabled-background, #e9ecef); }
.u-inputtext-fluid { width: 100%; }
`;

export interface InputTextClassesParams {
  disabled?: boolean;
  filled?: boolean;
  invalid?: boolean;
  variantFilled?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: InputTextClassesParams = {}) => [
    "u-inputtext u-component",
    {
      "u-inputtext-disabled": params.disabled,
      "u-inputtext-filled": params.filled,
      "u-inputtext-invalid": params.invalid,
      "u-inputtext-variant-filled": params.variantFilled,
      "u-inputtext-fluid": params.fluid,
    },
  ],
};

export const inputTextStyleModule: StyleModule = { css, classes };
