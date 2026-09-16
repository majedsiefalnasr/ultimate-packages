import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputTextStyle`, shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract.
 *
 * `.p-inputtext*` selectors are already renamed to `.u-inputtext*` by
 * `@ultimate/uix-styles/inputtext` itself (Task 3) — confirmed against that
 * subpath's own CSS (`packages/uix-styles/src/inputtext/index.ts`), which
 * uses `.u-inputtext`, `.u-inputtext-sm`, `.u-inputtext-lg`,
 * `.u-inputtext-fluid` (no hyphen between "input" and "text", matching real
 * pinned PrimeUIX source's `.p-inputtext` naming exactly — verified against
 * `.vendor-extracted/uix-styles-full/src/inputtext/index.ts`). The `classes`
 * resolver below must therefore emit the literal `u-inputtext` root class
 * (NOT `u-input-text`) for these selectors to apply.
 *
 * `p-invalid`/`p-variant-filled` structural modifier classes are kept
 * unrenamed — confirmed against `@ultimate/uix-styles/inputtext`'s own CSS,
 * which references these literal class names (same precedent as
 * `checkbox-style.ts`'s `p-highlight`/`p-disabled`).
 */
const css = /*css*/ `
    ${inputTextStyle}
`;

/** Params `UInputText` passes into `cx('root', params)`. */
export interface InputTextClassesParams {
  filled?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
}

const classes = {
  root: (params: InputTextClassesParams = {}) => {
    const { filled, invalid, fluid, variantFilled } = params;
    return [
      "u-inputtext u-component",
      {
        "p-filled": filled,
        "p-invalid": invalid,
        "u-inputtext-fluid": fluid,
        "p-variant-filled": variantFilled,
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UInputText`. */
export const inputTextStyleModule = { css, classes };
