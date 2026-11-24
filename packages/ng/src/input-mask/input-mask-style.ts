import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputMaskStyle`
 * (`primeng/src/inputmask/style/inputmaskstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract.
 *
 * PrimeNG has no `@primeuix/styles/inputmask` package: the component's own
 * rules live in `inputmaskstyle.ts` (host positioning, the clear icon, fluid
 * width and the `.ng-invalid.ng-dirty` borders). They are ported here with
 * the host selectors renamed from `p-inputmask` to `u-input-mask`.
 *
 * The inner input is styled by the shared InputText module
 * (`@ultimate/uix-styles/inputtext`), included in this sheet so the input
 * is styled even when the app has not created a `UInputText` (the
 * component does not use the `uInputText` directive). When an app also uses
 * `UInputText`, both sheets carry the same rules, which is harmless.
 */
const css = /*css*/ `
    ${inputTextStyle}

    u-input-mask {
        position: relative;
    }

    .u-inputmask-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    u-input-mask.u-inputmask-fluid {
        width: 100%;
    }

    u-input-mask.ng-invalid.ng-dirty > .u-inputtext {
        border-color: dt('inputtext.invalid.border.color');
    }

    u-input-mask.ng-invalid.ng-dirty > .u-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
    }

    u-input-mask.ng-invalid.ng-dirty > .u-inputtext::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }
`;

/** Params `UInputMask` passes into `cx('root', params)`. */
export interface InputMaskClassesParams {
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
}

/** Params `UInputMask` passes into `cx('pcInputText', params)`. */
export interface InputMaskInputClassesParams {
  filled?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
  size?: "small" | "large";
}

const classes = {
  root: (params: InputMaskClassesParams = {}) => {
    const { invalid, fluid, variantFilled } = params;
    return [
      "u-inputmask u-component p-inputwrapper",
      {
        "p-invalid": invalid,
        "p-variant-filled": variantFilled,
        "u-inputmask-fluid": fluid,
      },
    ];
  },
  pcInputText: (params: InputMaskInputClassesParams = {}) => {
    const { filled, invalid, fluid, variantFilled, size } = params;
    return [
      "u-inputtext u-component",
      {
        "p-filled": filled,
        "p-invalid": invalid,
        "u-inputtext-fluid": fluid,
        "p-variant-filled": variantFilled,
        "u-inputtext-sm": size === "small",
        "u-inputtext-lg": size === "large",
      },
    ];
  },
  clearIcon: "u-inputmask-clear-icon",
};

/** `UBaseComponent`-shaped style module for `UInputMask`. */
export const inputMaskStyleModule = { css, classes };

/**
 * Style module for the `[uInputMask]` directive. PrimeNG's directive adds
 * only the `p-inputmask` class to the host input; the host is a native
 * `<input>`, so the host rules above do not apply to it.
 */
export const inputMaskDirectiveStyleModule = {
  css: "",
  classes: { root: "u-inputmask" },
};
