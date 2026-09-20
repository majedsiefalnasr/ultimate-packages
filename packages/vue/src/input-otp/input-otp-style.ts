import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `InputOtpStyle` (sourced from
 * `@primeuix/styles/inputotp`), hand-ported directly (not re-exported from
 * `@ultimate/uix-styles`) — same reason already documented across
 * `input-text-style.ts`/`checkbox-style.ts`. `.p-inputotp*` selectors
 * renamed to `.u-input-otp*`.
 */
const css = /*css*/ `
    .u-input-otp {
        display: flex;
        align-items: center;
        gap: dt('inputotp.gap');
    }

    .u-input-otp-input {
        text-align: center;
        width: dt('inputotp.input.width');
    }
`;

const classes = {
  root: "u-input-otp",
  pcInputText: "u-input-otp-input",
};

export const inputOtpStyleModule: StyleModule = { css, classes };
