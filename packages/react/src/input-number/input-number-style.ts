import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-inputnumber { display: inline-flex; }
.u-inputnumber-input {
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
  flex: 1 1 auto;
  text-align: right;
}
.u-inputnumber-input:enabled:hover { border-color: var(--u-inputtext-hover-border-color, #adb5bd); }
.u-inputnumber-input:enabled:focus {
  border-color: var(--u-inputtext-focus-border-color, #2196F3);
  box-shadow: 0 0 0 0.2rem rgba(33,150,243,0.2);
}
.u-inputnumber-invalid .u-inputnumber-input { border-color: var(--u-inputtext-invalid-border-color, #e24c4c); }
.u-inputnumber-input:disabled { opacity: 1; color: var(--u-inputtext-disabled-color, #495057); background: var(--u-inputtext-disabled-background, #e9ecef); }
.u-inputnumber-fluid { width: 100%; }
.u-inputnumber-fluid .u-inputnumber-input { width: 1%; }

.u-inputnumber-buttons-stacked { flex-direction: row; }
.u-inputnumber-button-group { display: flex; flex-direction: column; }
.u-inputnumber-button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  border: 1px solid var(--u-inputtext-border-color, #ced4da);
  background: var(--u-inputtext-background, #ffffff);
  cursor: pointer;
  padding-inline: 0.5rem;
}
.u-inputnumber-button:disabled { opacity: 0.6; cursor: default; }
`;

export interface InputNumberClassesParams {
  invalid?: boolean;
  fluid?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: InputNumberClassesParams = {}) => [
    "u-inputnumber u-component u-inputnumber-buttons-stacked",
    {
      "u-inputnumber-invalid": params.invalid,
      "u-inputnumber-fluid": params.fluid,
      "u-inputnumber-focus": params.focused,
    },
  ],
  input: "u-inputnumber-input",
  buttonGroup: "u-inputnumber-button-group",
  incrementButton: "u-inputnumber-button u-inputnumber-button-up",
  decrementButton: "u-inputnumber-button u-inputnumber-button-down",
};

export const inputNumberStyleModule: StyleModule = { css, classes };
