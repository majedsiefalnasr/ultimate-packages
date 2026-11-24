import type { StyleModule } from "@ultimate/vue-core";
import { style as textareaStyle } from "@ultimate/uix-styles/textarea";

/**
 * `createBaseComponent`-shaped style module for `UTextarea`. The structural
 * CSS is the shared `@ultimate/uix-styles/textarea` module (ADR-082), the
 * same module Angular and React consume, so it reads the Aura `textarea`
 * tokens and carries the filled hover and focus backgrounds, the invalid
 * placeholder colour and the sm/lg sizes. The modifier classes below are the
 * ones that module's selectors reference.
 */
const css = /*css*/ `
    ${textareaStyle}
`;

/** Params `UTextarea` passes into `cx('root', params)`. */
export interface TextareaClassesParams {
  filled?: boolean;
  autoResize?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
  size?: string | null;
}

const classes = {
  root: (params: TextareaClassesParams = {}) => {
    const { filled, autoResize, invalid, fluid, variantFilled, size } = params;

    return [
      "u-textarea u-component",
      {
        "p-filled": Boolean(filled),
        "u-textarea-resizable": Boolean(autoResize),
        "p-invalid": Boolean(invalid),
        "u-textarea-fluid": Boolean(fluid),
        "p-variant-filled": Boolean(variantFilled),
        "u-textarea-sm": size === "small",
        "u-textarea-lg": size === "large",
      },
    ];
  },
};

export const textareaStyleModule: StyleModule = { css, classes };
