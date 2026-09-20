import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `SelectButtonStyle` (see
 * `.vendor-extracted/vue/selectbutton/style/SelectButtonStyle.js`, sourced
 * from `@primeuix/styles/selectbutton`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. Hand-ported
 * directly, same reason documented in `packages/vue/src/password/password-style.ts`.
 */
const css = /*css*/ `
    .u-select-button {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .u-select-button-invalid {
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

export interface SelectButtonClassesParams {
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: SelectButtonClassesParams = {}) => [
    "u-select-button u-component",
    {
      "u-select-button-invalid": Boolean(params.invalid),
      "u-select-button-fluid": Boolean(params.fluid),
    },
  ],
};

/** `createBaseComponent`-shaped style module for `USelectButton`. */
export const selectButtonStyleModule: StyleModule = { css, classes };
