import { style as textareaStyle } from "@ultimate/uix-styles/textarea";

/**
 * Ultimate-owned adaptation of PrimeNG's `TextareaStyle`, shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/textarea` module (ADR-082), the
 * same module React and Vue consume; `.p-textarea*` selectors are renamed to
 * `.u-textarea*` there, while `p-invalid`/`p-variant-filled`/`p-filled` stay
 * unrenamed.
 *
 * The `.ng-invalid.ng-dirty` rules are Angular-only (PrimeNG
 * `textareastyle.ts:9-12`): Angular forms mark a control invalid through
 * those classes, which React and Vue have no counterpart for (ADR-082
 * framework-local exception).
 */
const css = /*css*/ `
    ${textareaStyle}

    .u-textarea.ng-invalid.ng-dirty {
        border-color: dt('textarea.invalid.border.color');
    }

    .u-textarea.ng-invalid.ng-dirty::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }
`;

/** Params `UTextarea` passes into `cx('root', params)`. */
export interface TextareaClassesParams {
  filled?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
  autoResize?: boolean;
  size?: "small" | "large";
}

const classes = {
  root: (params: TextareaClassesParams = {}) => {
    const { filled, invalid, fluid, variantFilled, autoResize, size } = params;
    return [
      "u-textarea u-component",
      {
        "p-filled": filled,
        "p-invalid": invalid,
        "u-textarea-fluid": fluid,
        "p-variant-filled": variantFilled,
        "u-textarea-resizable": autoResize,
        "u-textarea-sm": size === "small",
        "u-textarea-lg": size === "large",
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UTextarea`. */
export const textareaStyleModule = { css, classes };
