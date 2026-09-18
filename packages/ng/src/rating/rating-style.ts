/**
 * Ultimate-owned adaptation of PrimeNG's `RatingStyle` (see
 * `.vendor-extracted/ng/rating/style/ratingstyle.ts`, sourced from
 * `@primeuix/styles/rating`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `password-style.ts`: no `@ultimate/uix-styles/rating`
 * subpath exists yet and this task may not add one.
 *
 * `.p-rating*` selectors renamed to `.u-rating*`; `p-disabled`/`p-focus-visible`
 * kept unrenamed, matching established precedent.
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

    .u-rating.p-disabled .u-rating-option {
        cursor: default;
    }

    .u-rating-option.p-focus-visible {
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

    .u-rating.p-disabled .u-rating-on-icon,
    .u-rating.p-disabled .u-rating-off-icon {
        color: dt('rating.icon.disabled.color');
    }
`;

/** Params `URating` passes into `cx('option', params)`. */
export interface RatingClassesParams {
  star?: number;
  value?: number | null;
  focused?: boolean;
}

const classes = {
  root: (params: { disabled?: boolean } = {}) => [
    "u-rating u-component",
    { "p-disabled": params.disabled },
  ],
  option: (params: RatingClassesParams = {}) => [
    "u-rating-option",
    { "p-focus-visible": params.focused },
  ],
  onIcon: "u-rating-on-icon",
  offIcon: "u-rating-off-icon",
};

/** `UBaseComponent`-shaped style module for `URating`. */
export const ratingStyleModule = { css, classes };
