/**
 * Ultimate-owned adaptation of PrimeNG's `FloatLabelStyle` (see
 * `.vendor-extracted/ng/floatlabel/style/floatlabelstyle.ts`, CSS body
 * sourced from `.vendor-extracted/uix-styles-full/src/floatlabel/index.ts`
 * — the real `@primeuix/styles/floatlabel` module), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. Hand-ported
 * directly, same reason documented in `date-picker-style.ts`/
 * `select-style.ts`: no `@ultimate/uix-styles/float-label` subpath exists
 * yet and this task may not add one (no new shared package export
 * authorized). `.p-floatlabel*` selectors renamed to `.u-float-label*`.
 */
const css = /*css*/ `
    .u-float-label {
        display: block;
        position: relative;
    }

    .u-float-label label {
        position: absolute;
        pointer-events: none;
        top: 50%;
        transform: translateY(-50%);
        transition-property: all;
        transition-timing-function: ease;
        line-height: 1;
        font-weight: dt('floatlabel.font.weight');
        inset-inline-start: dt('floatlabel.position.x');
        color: dt('floatlabel.color');
        transition-duration: dt('floatlabel.transition.duration');
    }

    .u-float-label:has(.u-textarea) label {
        top: dt('floatlabel.position.y');
        transform: translateY(0);
    }

    .u-float-label:has(.u-input-icon:first-child) label {
        inset-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-float-label:has(input:focus) label,
    .u-float-label:has(input.u-filled) label,
    .u-float-label:has(input:-webkit-autofill) label,
    .u-float-label:has(textarea:focus) label,
    .u-float-label:has(textarea.u-filled) label,
    .u-float-label:has(.u-inputwrapper-focus) label,
    .u-float-label:has(.u-inputwrapper-filled) label,
    .u-float-label:has(input[placeholder]) label,
    .u-float-label:has(textarea[placeholder]) label {
        top: dt('floatlabel.over.active.top');
        transform: translateY(0);
        font-size: dt('floatlabel.active.font.size');
        font-weight: dt('floatlabel.active.font.weight');
    }

    .u-float-label:has(input.u-filled) label,
    .u-float-label:has(textarea.u-filled) label,
    .u-float-label:has(.u-inputwrapper-filled) label {
        color: dt('floatlabel.active.color');
    }

    .u-float-label:has(input:focus) label,
    .u-float-label:has(input:-webkit-autofill) label,
    .u-float-label:has(textarea:focus) label,
    .u-float-label:has(.u-inputwrapper-focus) label {
        color: dt('floatlabel.focus.color');
    }

    .u-float-label-in .u-input-text,
    .u-float-label-in .u-textarea,
    .u-float-label-in .u-select-label,
    .u-float-label-in .u-multi-select-label,
    .u-float-label-in .u-autocomplete-input-multiple,
    .u-float-label-in .u-cascade-select-label {
        padding-block-start: dt('floatlabel.in.input.padding.top');
        padding-block-end: dt('floatlabel.in.input.padding.bottom');
    }

    .u-float-label-in:has(input:focus) label,
    .u-float-label-in:has(input.u-filled) label,
    .u-float-label-in:has(input:-webkit-autofill) label,
    .u-float-label-in:has(textarea:focus) label,
    .u-float-label-in:has(textarea.u-filled) label,
    .u-float-label-in:has(.u-inputwrapper-focus) label,
    .u-float-label-in:has(.u-inputwrapper-filled) label,
    .u-float-label-in:has(input[placeholder]) label,
    .u-float-label-in:has(textarea[placeholder]) label {
        top: dt('floatlabel.in.active.top');
    }

    .u-float-label-on:has(input:focus) label,
    .u-float-label-on:has(input.u-filled) label,
    .u-float-label-on:has(input:-webkit-autofill) label,
    .u-float-label-on:has(textarea:focus) label,
    .u-float-label-on:has(textarea.u-filled) label,
    .u-float-label-on:has(.u-inputwrapper-focus) label,
    .u-float-label-on:has(.u-inputwrapper-filled) label,
    .u-float-label-on:has(input[placeholder]) label,
    .u-float-label-on:has(textarea[placeholder]) label {
        top: 0;
        transform: translateY(-50%);
        border-radius: dt('floatlabel.on.border.radius');
        background: dt('floatlabel.on.active.background');
        padding: dt('floatlabel.on.active.padding');
    }

    .u-float-label:has([class^='u-'][class$='-fluid']) {
        width: 100%;
    }

    .u-float-label:has(.u-invalid) label {
        color: dt('floatlabel.invalid.color');
    }
`;

/** Params `UFloatLabel` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface FloatLabelClassesParams {
  variant?: "in" | "over" | "on";
}

/**
 * Class-name-slot resolver for `UFloatLabel`, ported from the extracted
 * `FloatLabelStyle`'s own `classes.root` function (`.p-floatlabel*` renamed
 * to `.u-float-label*`).
 */
const classes = {
  root: (params: FloatLabelClassesParams = {}) => {
    const { variant } = params;
    return [
      "u-float-label",
      {
        "u-float-label-over": variant === "over",
        "u-float-label-on": variant === "on",
        "u-float-label-in": variant === "in",
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UFloatLabel`. */
export const floatLabelStyleModule = { css, classes };
