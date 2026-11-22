import type { StyleModule } from "@ultimate/react-core";
import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";

/**
 * `useComponentBase`-shaped style module for `UInputText`. The structural CSS
 * is the shared `@ultimate/uix-styles/inputtext` module (ADR-082), so it
 * reads the Aura `inputtext` tokens and matches Angular and Vue. The
 * modifier classes below are the ones that module's selectors reference.
 */
const css = /*css*/ `
    ${inputTextStyle}
`;

export interface InputTextClassesParams {
  filled?: boolean;
  invalid?: boolean;
  variantFilled?: boolean;
  fluid?: boolean;
  size?: "small" | "large";
}

const classes = {
  root: (params: InputTextClassesParams = {}) => [
    "u-inputtext u-component",
    {
      "p-filled": params.filled,
      "p-invalid": params.invalid,
      "p-variant-filled": params.variantFilled,
      "u-inputtext-fluid": params.fluid,
      "u-inputtext-sm": params.size === "small",
      "u-inputtext-lg": params.size === "large",
    },
  ],
};

export const inputTextStyleModule: StyleModule = { css, classes };
