import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `InputNumberStyle` (sourced from
 * `@primeuix/styles/inputnumber`), hand-ported directly (not re-exported
 * from `@ultimate/uix-styles`) — same reason already documented across
 * `input-text-style.ts`/`checkbox-style.ts`. Only the base
 * `.p-inputnumber`/`.p-inputnumber-input`/fluid/invalid rules are ported —
 * the spin-button-layout rules (`stacked`/`horizontal`/`vertical`,
 * `.p-inputnumber-button*`) are intentionally excluded, matching this
 * component's own documented scope cut (see `InputNumber.vue`'s class doc
 * comment: no spin-button UI in this port).
 */
const css = /*css*/ `
    .u-input-number {
        display: inline-flex;
        position: relative;
    }

    .u-input-number-input {
        flex: 1 1 auto;
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .u-input-number-input.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .u-input-number-input:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .u-input-number-fluid {
        width: 100%;
    }

    .u-input-number-fluid .u-input-number-input {
        width: 1%;
    }
`;

/** Params `UInputNumber` passes into `cx('root', params)`. */
export interface InputNumberClassesParams {
  invalid?: boolean;
  fluid?: boolean;
  filled?: boolean;
}

const classes = {
  root: (params: InputNumberClassesParams = {}) => {
    const { fluid } = params;
    return [
      "u-input-number",
      {
        "u-input-number-fluid": Boolean(fluid),
      },
    ];
  },
  input: (params: InputNumberClassesParams = {}) => {
    const { invalid } = params;
    return [
      "u-input-number-input",
      {
        "p-invalid": Boolean(invalid),
      },
    ];
  },
};

export const inputNumberStyleModule: StyleModule = { css, classes };
