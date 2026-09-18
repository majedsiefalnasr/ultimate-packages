import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `RatingStyle` (see
 * `.vendor-extracted/vue/rating/style/RatingStyle.js`, sourced from
 * `@primeuix/styles/rating`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/vue/src/password/password-style.ts`.
 */
const css = /*css*/ `
    .u-rating {
        position: relative;
        display: flex;
        align-items: center;
        gap: dt('rating.gap');
    }

    .u-rating-option {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
    }

    .u-rating.u-rating-disabled .u-rating-option {
        cursor: default;
    }

    .u-rating-option-focused {
        outline: 2px solid dt('focus.ring.color');
        outline-offset: 2px;
        border-radius: 50%;
    }

    .u-rating-on-icon {
        color: dt('rating.icon.active.color');
    }

    .u-rating-off-icon {
        color: dt('rating.icon.color');
    }

    .u-rating.u-rating-disabled .u-rating-on-icon,
    .u-rating.u-rating-disabled .u-rating-off-icon {
        color: dt('rating.icon.disabled.color');
    }
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

/** `createBaseComponent`-shaped style module for `URating`. */
export const ratingStyleModule: StyleModule = { css, classes };
