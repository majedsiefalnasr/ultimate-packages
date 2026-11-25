import { style as ratingStyle } from "@ultimate/uix-styles/rating";

/**
 * Ultimate-owned adaptation of PrimeNG's `RatingStyle` (see
 * `.vendor-extracted/ng/rating/style/ratingstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/rating` module (ADR-082), so it
 * reads the Aura `rating` tokens and matches React and Vue.
 *
 * The `.ng-invalid.ng-dirty` rule is Angular-only, as in PrimeNG. PrimeNG's
 * selector (`p-rating.ng-invalid.ng-dirty > .p-rating > .p-rating-icon`)
 * never matches, because the host is the `.p-rating` root; this one targets
 * the icons inside the host and uses the shared form-field invalid colour.
 */
const css = /*css*/ `
    ${ratingStyle}

    .u-rating.ng-invalid.ng-dirty .u-rating-icon {
        stroke: dt('form.field.invalid.border.color');
    }
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
    { "p-readonly": params.readonly, "p-disabled": params.disabled },
  ],
  option: (params: RatingOptionClassesParams = {}) => [
    "u-rating-option",
    { "u-rating-option-active": params.active, "p-focus-visible": params.focusVisible },
  ],
  onIcon: (params: RatingIconClassesParams = {}) => [
    "u-rating-icon u-rating-on-icon",
    { "p-invalid": params.invalid },
  ],
  offIcon: (params: RatingIconClassesParams = {}) => [
    "u-rating-icon u-rating-off-icon",
    { "p-invalid": params.invalid },
  ],
};

/** `UBaseComponent`-shaped style module for `URating`. */
export const ratingStyleModule = { css, classes };
