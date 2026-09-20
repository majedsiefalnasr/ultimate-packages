import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `PasswordBase.css.styles`, hand-
 * authored per this package's own established convention (React ports use
 * hand-authored CSS matching `checkbox-style.ts`'s precedent, not `dt()`
 * tokens — React has no `@ultimate/uix-styles` subpath dependency the way
 * Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-password { position: relative; display: inline-flex; }
.u-password-input { width: 100%; }
.u-password.u-password-fluid { display: flex; }
.u-password-mask-icon, .u-password-unmask-icon, .u-password-clear-icon {
  cursor: pointer;
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
}
.u-password-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 100%;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 0.75rem;
  margin-top: 0.25rem;
}
.u-password-meter { height: 10px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.u-password-meter-label { height: 100%; width: 0%; transition: width 1s ease-in-out; }
.u-password-meter-label-weak { background: #ef4444; }
.u-password-meter-label-medium { background: #f59e0b; }
.u-password-meter-label-strong { background: #22c55e; }
.u-password-meter-text { margin-top: 0.5rem; font-size: 0.875rem; }
`;

export interface PasswordClassesParams {
  filled?: boolean;
  disabled?: boolean;
  fluid?: boolean;
  strength?: "weak" | "medium" | "strong" | null;
}

const classes = {
  root: (params: PasswordClassesParams = {}) => {
    const { filled, disabled, fluid } = params;
    return [
      "u-password u-component",
      {
        "u-password-filled": Boolean(filled),
        "u-password-disabled": Boolean(disabled),
        "u-password-fluid": Boolean(fluid),
      },
    ];
  },
  input: "u-password-input",
  maskIcon: "u-password-mask-icon",
  unmaskIcon: "u-password-unmask-icon",
  clearIcon: "u-password-clear-icon",
  overlay: "u-password-overlay",
  meter: "u-password-meter",
  meterLabel: (params: PasswordClassesParams = {}) =>
    ["u-password-meter-label", params.strength ? `u-password-meter-label-${params.strength}` : ""]
      .filter(Boolean)
      .join(" "),
  meterText: "u-password-meter-text",
};

export const passwordStyleModule: StyleModule = { css, classes };
