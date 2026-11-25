import type { StyleModule } from "@ultimate/react-core";
import { style as ratingStyle } from "@ultimate/uix-styles/rating";

/**
 * Ultimate-owned adaptation of PrimeReact's `RatingBase` classes (see
 * `.vendor-extracted/react/rating/RatingBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/rating` module (ADR-082), so it
 * reads the Aura `rating` tokens (ADR-067) and matches Angular and Vue.
 *
 * PrimeReact's `p-rating-item` and `p-focus` become the shared
 * `u-rating-option` and `p-focus-visible`, and the cancel item reuses the
 * option and icon classes, as PrimeReact's `p-rating-item p-rating-cancel-item`
 * does.
 */
const css = /*css*/ `
    ${ratingStyle}
`;

const classes = {
  root: (params: { disabled?: boolean; readOnly?: boolean } = {}) => [
    "u-rating u-component",
    { "p-disabled": params.disabled, "p-readonly": params.readOnly },
  ],
  item: (params: { active?: boolean; focusVisible?: boolean } = {}) => [
    "u-rating-option",
    { "u-rating-option-active": params.active, "p-focus-visible": params.focusVisible },
  ],
  onIcon: (params: { invalid?: boolean } = {}) => [
    "u-rating-icon u-rating-on-icon",
    { "p-invalid": params.invalid },
  ],
  offIcon: (params: { invalid?: boolean } = {}) => [
    "u-rating-icon u-rating-off-icon",
    { "p-invalid": params.invalid },
  ],
  cancelItem: "u-rating-option u-rating-cancel-option",
  cancelIcon: "u-rating-icon u-rating-cancel-icon",
};

/** `useComponentBase`-shaped style module for `URating`. */
export const ratingStyleModule: StyleModule = { css, classes };
