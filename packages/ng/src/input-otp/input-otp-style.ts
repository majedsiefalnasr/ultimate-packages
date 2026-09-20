/**
 * Ultimate-owned adaptation of PrimeNG's `InputOtpStyle` (real CSS extracted
 * this session from `.vendor-cache/@primeuix__styles-2.0.3.tar.gz`'s
 * `package/dist/inputotp/index.mjs`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract — same hand-port pattern already
 * established by `radioButtonStyleModule`/`textareaStyleModule`.
 *
 * `.p-inputotp*` selectors are renamed to `.u-inputotp*`. Real source's own
 * `.p-inputotp-input` inherits `.p-inputtext` styling by applying `pInputText`
 * on each segment (confirmed against real `inputotp.ts`'s own template:
 * `<input type="text" pInputText ... [class]="cn(cx('pcInputText'), ...)">`)
 * — the `pcInputText` slot below reuses `UInputText`'s real `u-inputtext`
 * class for this reason, matching real source's own reuse relationship
 * rather than duplicating `.p-inputtext`'s rules under a new selector.
 */
const css = /*css*/ `
    .u-inputotp {
        display: flex;
        align-items: center;
        gap: dt('inputotp.gap');
    }

    .u-inputotp-input {
        text-align: center;
        width: dt('inputotp.input.width');
    }
`;

/** Params `UInputOtp` passes into `cx('root', params)`. */
export type InputOtpClassesParams = Record<string, never>;

const classes = {
  root: "u-inputotp u-component",
  pcInputText: "u-inputtext u-inputotp-input",
};

/** `UBaseComponent`-shaped style module for `UInputOtp`. */
export const inputOtpStyleModule = { css, classes };
