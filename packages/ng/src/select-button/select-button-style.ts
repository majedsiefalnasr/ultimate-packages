/**
 * Ultimate-owned adaptation of PrimeNG's `SelectButtonStyle` (see
 * `.vendor-extracted/ng/selectbutton/style/selectbuttonstyle.ts`, sourced
 * from `@primeuix/styles/selectbutton`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. Hand-ported
 * directly, same reason documented in `password-style.ts`: no
 * `@ultimate/uix-styles/selectbutton` subpath exists yet and this task may
 * not add one.
 *
 * `.p-selectbutton*` selectors renamed to `.u-select-button*`; `p-invalid`
 * kept unrenamed, matching established precedent.
 */
const css = /*css*/ `
    .u-select-button {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .u-select-button.p-invalid {
        outline: 1px solid dt('selectbutton.invalid.border.color');
        outline-offset: 0;
    }

    .u-select-button-fluid {
        display: flex;
    }

    .u-select-button-fluid .u-toggle-button {
        flex: 1 1 0;
    }
`;

/** Params `USelectButton` passes into `cx('root', params)`. */
export interface SelectButtonClassesParams {
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: SelectButtonClassesParams = {}) => [
    "u-select-button u-component",
    {
      "p-invalid": params.invalid,
      "u-select-button-fluid": params.fluid,
    },
  ],
};

/** `UBaseComponent`-shaped style module for `USelectButton`. */
export const selectButtonStyleModule = { css, classes };
