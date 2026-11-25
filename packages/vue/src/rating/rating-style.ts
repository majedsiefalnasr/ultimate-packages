import type { StyleModule } from "@ultimate/vue-core";
import { style as ratingStyle } from "@ultimate/uix-styles/rating";

/**
 * `createBaseComponent`-shaped style module for `URating`, adapted from
 * PrimeVue's `RatingStyle` (see `.vendor-extracted/vue/rating/style/RatingStyle.js`).
 * The structural CSS is the shared `@ultimate/uix-styles/rating` module
 * (ADR-082), the same module Angular and React consume, so it reads the Aura
 * `rating` tokens. The modifier classes below are the ones that module's
 * selectors reference.
 */
const css = /*css*/ `
    ${ratingStyle}
`;

/** Params `URating` passes into `cx('root', params)`. */
export interface RatingRootClassesParams {
  readonly?: boolean;
  disabled?: boolean;
}

/** Params `URating` passes into `cx('option', params)`. */
export interface RatingOptionClassesParams {
  active?: boolean;
  focusVisible?: boolean;
}

/** Params `URating` passes into `cx('onIcon' | 'offIcon', params)`. */
export interface RatingIconClassesParams {
  invalid?: boolean;
}

const classes = {
  root: (params: RatingRootClassesParams = {}) => [
    "u-rating u-component",
    { "p-readonly": Boolean(params.readonly), "p-disabled": Boolean(params.disabled) },
  ],
  option: (params: RatingOptionClassesParams = {}) => [
    "u-rating-option",
    {
      "u-rating-option-active": Boolean(params.active),
      "p-focus-visible": Boolean(params.focusVisible),
    },
  ],
  onIcon: (params: RatingIconClassesParams = {}) => [
    "u-rating-icon u-rating-on-icon",
    { "p-invalid": Boolean(params.invalid) },
  ],
  offIcon: (params: RatingIconClassesParams = {}) => [
    "u-rating-icon u-rating-off-icon",
    { "p-invalid": Boolean(params.invalid) },
  ],
};

export const ratingStyleModule: StyleModule = { css, classes };
