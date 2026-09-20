import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `select-button-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-rating { display: flex; align-items: center; gap: 0.25rem; }
.u-rating-option { display: inline-flex; align-items: center; cursor: pointer; }
.u-rating-disabled .u-rating-option { cursor: default; }
.u-rating-option-focused { outline: 2px solid #3b82f6; outline-offset: 2px; border-radius: 50%; }
.u-rating-on-icon { color: #f59e0b; }
.u-rating-off-icon { color: #9ca3af; }
.u-rating-disabled .u-rating-on-icon,
.u-rating-disabled .u-rating-off-icon { color: #d1d5db; }
`;

export interface RatingClassesParams {
  disabled?: boolean;
}

export interface RatingOptionClassesParams {
  focused?: boolean;
}

const classes = {
  root: (params: RatingClassesParams = {}) => [
    "u-rating u-component",
    { "u-rating-disabled": Boolean(params.disabled) },
  ],
  option: (params: RatingOptionClassesParams = {}) => [
    "u-rating-option",
    { "u-rating-option-focused": Boolean(params.focused) },
  ],
  onIcon: "u-rating-on-icon",
  offIcon: "u-rating-off-icon",
};

export const ratingStyleModule: StyleModule = { css, classes };
