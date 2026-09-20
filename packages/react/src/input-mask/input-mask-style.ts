import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-inputmask {
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
.u-inputmask:enabled:hover { border-color: var(--u-inputtext-hover-border-color, #adb5bd); }
.u-inputmask:enabled:focus {
  border-color: var(--u-inputtext-focus-border-color, #2196F3);
  box-shadow: 0 0 0 0.2rem rgba(33,150,243,0.2);
}
.u-inputmask-invalid { border-color: var(--u-inputtext-invalid-border-color, #e24c4c); }
.u-inputmask-variant-filled { background: var(--u-inputtext-filled-background, #f8f9fa); }
.u-inputmask:disabled { opacity: 1; color: var(--u-inputtext-disabled-color, #495057); background: var(--u-inputtext-disabled-background, #e9ecef); }
.u-inputmask-fluid { width: 100%; }
`;

export interface InputMaskClassesParams {
  disabled?: boolean;
  invalid?: boolean;
  variantFilled?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: InputMaskClassesParams = {}) => [
    "u-inputmask u-component",
    {
      "u-inputmask-disabled": params.disabled,
      "u-inputmask-invalid": params.invalid,
      "u-inputmask-variant-filled": params.variantFilled,
      "u-inputmask-fluid": params.fluid,
    },
  ],
};

export const inputMaskStyleModule: StyleModule = { css, classes };
