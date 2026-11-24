import type { StyleModule } from "@ultimate/react-core";
import { style as textareaStyle } from "@ultimate/uix-styles/textarea";

/**
 * `useComponentBase`-shaped style module for `UInputTextarea`. The structural
 * CSS is the shared `@ultimate/uix-styles/textarea` module (ADR-082), the
 * same module Angular and Vue consume, so it reads the Aura `textarea`
 * tokens (ADR-067). The modifier classes below are the ones that module's
 * selectors reference.
 */
const css = /*css*/ `
    ${textareaStyle}
`;

export interface InputTextareaClassesParams {
  filled?: boolean;
  invalid?: boolean;
  variantFilled?: boolean;
  fluid?: boolean;
  autoResize?: boolean;
  size?: "small" | "large";
}

const classes = {
  root: (params: InputTextareaClassesParams = {}) => [
    "u-textarea u-component",
    {
      "p-filled": params.filled,
      "p-invalid": params.invalid,
      "p-variant-filled": params.variantFilled,
      "u-textarea-fluid": params.fluid,
      "u-textarea-resizable": params.autoResize,
      "u-textarea-sm": params.size === "small",
      "u-textarea-lg": params.size === "large",
    },
  ],
};

export const inputTextareaStyleModule: StyleModule = { css, classes };
