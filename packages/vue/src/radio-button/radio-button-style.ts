import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `RadioButtonStyle` (sourced from
 * `@primeuix/styles/radiobutton`), hand-ported directly (not re-exported
 * from `@ultimate/uix-styles`) — same reason already documented across
 * `checkbox-style.ts`/`button-style.ts`/`tooltip-style.ts`: this task may
 * not add a new `@ultimate/uix-styles/radiobutton` subpath (outside
 * `packages/ng/`/`packages/react/`/`packages/vue/`). `.p-radiobutton*`
 * selectors renamed to `.u-radio-button*`; `p-disabled`/`p-invalid` kept
 * unrenamed, matching the same `p-` -> `u-` translation established for
 * checkbox/button/tooltip.
 */
const css = /*css*/ `
    .u-radio-button {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
    }

    .u-radio-button-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: 50%;
    }

    .u-radio-button-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        border: 1px solid dt('radiobutton.border.color');
        background: dt('radiobutton.background');
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
        transition:
            background dt('radiobutton.transition.duration'),
            color dt('radiobutton.transition.duration'),
            border-color dt('radiobutton.transition.duration'),
            box-shadow dt('radiobutton.transition.duration'),
            outline-color dt('radiobutton.transition.duration');
        outline-color: transparent;
        box-shadow: dt('radiobutton.shadow');
    }

    .u-radio-button-icon {
        transition-duration: dt('radiobutton.transition.duration');
        background: transparent;
        font-size: dt('radiobutton.icon.size');
        width: dt('radiobutton.icon.size');
        height: dt('radiobutton.icon.size');
        border-radius: 50%;
    }

    .u-radio-button-checked .u-radio-button-box {
        border-color: dt('radiobutton.checked.border.color');
        background: dt('radiobutton.checked.background');
    }

    .u-radio-button-checked .u-radio-button-box .u-radio-button-icon {
        background: dt('radiobutton.icon.checked.color');
        visibility: visible;
    }

    .u-radio-button.p-invalid > .u-radio-button-box {
        border-color: dt('radiobutton.invalid.border.color');
    }

    .u-radio-button.p-disabled {
        opacity: 1;
    }

    .u-radio-button.p-disabled .u-radio-button-box {
        background: dt('radiobutton.disabled.background');
        border-color: dt('radiobutton.checked.disabled.border.color');
    }
`;

/** Params `URadioButton` passes into `cx('root', params)`. */
export interface RadioButtonClassesParams {
  checked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: RadioButtonClassesParams = {}) => {
    const { checked, disabled, invalid } = params;

    return [
      "u-radio-button",
      {
        "u-radio-button-checked": Boolean(checked),
        "p-disabled": Boolean(disabled),
        "p-invalid": Boolean(invalid),
      },
    ];
  },
  box: "u-radio-button-box",
  input: "u-radio-button-input",
  icon: "u-radio-button-icon",
};

export const radioButtonStyleModule: StyleModule = { css, classes };
