import type { StyleModule } from "@ultimate/vue-core";
import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";

/**
 * `createBaseComponent`-shaped style module for `UInputText`. The structural
 * CSS is the shared `@ultimate/uix-styles/inputtext` module (ADR-082), the
 * same module Angular and React consume, so it reads the Aura `inputtext`
 * tokens. The modifier classes below are the ones that module's selectors
 * reference.
 */
const css = /*css*/ `
    ${inputTextStyle}
`;

/** Params `UInputText` passes into `cx('root', params)`. */
export interface InputTextClassesParams {
  invalid?: boolean;
  fluid?: boolean;
  filled?: boolean;
  variantFilled?: boolean;
  size?: string | null;
}

const classes = {
  root: (params: InputTextClassesParams = {}) => {
    const { invalid, fluid, filled, variantFilled, size } = params;
    return [
      "u-inputtext u-component",
      {
        "p-filled": Boolean(filled),
        "p-invalid": Boolean(invalid),
        "p-variant-filled": Boolean(variantFilled),
        "u-inputtext-fluid": Boolean(fluid),
        "u-inputtext-sm": size === "small",
        "u-inputtext-lg": size === "large",
      },
    ];
  },
};

export const inputTextStyleModule: StyleModule = { css, classes };
