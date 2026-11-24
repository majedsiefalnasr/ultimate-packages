import type { StyleModule } from "@ultimate/react-core";
import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";

/**
 * `useComponentBase`-shaped style module for `UInputMask`. The root is the
 * native `<input>` itself, styled as an InputText, so the structural CSS is
 * the shared `@ultimate/uix-styles/inputtext` module (ADR-082), the same one
 * `UInputText` registers. `UInputMask` registers it under the `inputtext`
 * key, so the rules and the Aura `inputtext` theme variables exist once per
 * sheet whichever of the two mounts first (ADR-095).
 */
const css = /*css*/ `
    ${inputTextStyle}
`;

export interface InputMaskClassesParams {
  filled?: boolean;
  invalid?: boolean;
  variantFilled?: boolean;
  fluid?: boolean;
  size?: "small" | "large";
}

const classes = {
  root: (params: InputMaskClassesParams = {}) => [
    "u-inputmask u-inputtext u-component",
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

export const inputMaskStyleModule: StyleModule = { css, classes };
