import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-inputotp { display: flex; align-items: center; gap: 0.5rem; }
.u-inputotp-input {
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
  width: 2.5rem;
  text-align: center;
}
.u-inputotp-input:enabled:hover { border-color: var(--u-inputtext-hover-border-color, #adb5bd); }
.u-inputotp-input:enabled:focus {
  border-color: var(--u-inputtext-focus-border-color, #2196F3);
  box-shadow: 0 0 0 0.2rem rgba(33,150,243,0.2);
}
.u-inputotp-input-invalid { border-color: var(--u-inputtext-invalid-border-color, #e24c4c); }
.u-inputotp-input:disabled { opacity: 1; color: var(--u-inputtext-disabled-color, #495057); background: var(--u-inputtext-disabled-background, #e9ecef); }
`;

const classes = {
  root: "u-inputotp u-component",
  input: (params: { invalid?: boolean } = {}) => [
    "u-inputotp-input",
    { "u-inputotp-input-invalid": params.invalid },
  ],
};

export const inputOtpStyleModule: StyleModule = { css, classes };
