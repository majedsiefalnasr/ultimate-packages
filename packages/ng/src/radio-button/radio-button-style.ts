/**
 * Ultimate-owned adaptation of PrimeNG's `RadioButtonStyle` (see
 * `.vendor-extracted/ng/radiobutton/style/radiobuttonstyle.ts`, sourced from
 * `@primeuix/styles/radiobutton`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract — same pattern already established
 * by `checkboxStyleModule`
 * (`packages/ng/src/checkbox/checkbox-style.ts`).
 *
 * Per the same finding already documented for `checkbox`/`button`/`badge`/
 * `tooltip`/`menu`/`dialog`/`input-text`/`input-number`/`paginator`/
 * `scroller`/`table` (`@ultimate/uix-styles` never exports a `classes`
 * object, only a plain CSS `style` string), and because this task's hard
 * constraints forbid touching any file outside `packages/ng/`, `packages/
 * react/`, `packages/vue/` — meaning no new `@ultimate/uix-styles/
 * radiobutton` subpath can be added here — this file hand-ports the real
 * `@primeuix/styles/radiobutton` CSS content directly (extracted from
 * `.vendor-cache/@primeuix__styles-2.0.3.tar.gz`'s
 * `package/dist/radiobutton/index.mjs`), with `.p-radiobutton*` selectors
 * renamed to `.u-radio-button*`, matching the same `p-` -> `u-` translation
 * `checkboxStyleModule` already established. `p-disabled`/`p-invalid`/
 * `p-variant-filled` are kept unrenamed — shared, structural PrimeNG-wide
 * modifier classes, matching `checkboxStyleModule`'s own precedent.
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
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
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
        backface-visibility: hidden;
        transform: translateZ(0) scale(0.1);
    }

    .u-radio-button:not(.p-disabled):has(.u-radio-button-input:hover) .u-radio-button-box {
        border-color: dt('radiobutton.hover.border.color');
    }

    .u-radio-button-checked .u-radio-button-box {
        border-color: dt('radiobutton.checked.border.color');
        background: dt('radiobutton.checked.background');
    }

    .u-radio-button-checked .u-radio-button-box .u-radio-button-icon {
        background: dt('radiobutton.icon.checked.color');
        transform: translateZ(0) scale(1, 1);
        visibility: visible;
    }

    .u-radio-button-checked:not(.p-disabled):has(.u-radio-button-input:hover) .u-radio-button-box {
        border-color: dt('radiobutton.checked.hover.border.color');
        background: dt('radiobutton.checked.hover.background');
    }

    .u-radio-button:not(.p-disabled):has(.u-radio-button-input:hover).u-radio-button-checked .u-radio-button-box .u-radio-button-icon {
        background: dt('radiobutton.icon.checked.hover.color');
    }

    .u-radio-button:not(.p-disabled):has(.u-radio-button-input:focus-visible) .u-radio-button-box {
        border-color: dt('radiobutton.focus.border.color');
        box-shadow: dt('radiobutton.focus.ring.shadow');
        outline: dt('radiobutton.focus.ring.width') dt('radiobutton.focus.ring.style') dt('radiobutton.focus.ring.color');
        outline-offset: dt('radiobutton.focus.ring.offset');
    }

    .u-radio-button-checked:not(.p-disabled):has(.u-radio-button-input:focus-visible) .u-radio-button-box {
        border-color: dt('radiobutton.checked.focus.border.color');
    }

    .u-radio-button.p-invalid > .u-radio-button-box {
        border-color: dt('radiobutton.invalid.border.color');
    }

    .u-radio-button.p-variant-filled .u-radio-button-box {
        background: dt('radiobutton.filled.background');
    }

    .u-radio-button.p-disabled {
        opacity: 1;
    }

    .u-radio-button.p-disabled .u-radio-button-box {
        background: dt('radiobutton.disabled.background');
        border-color: dt('radiobutton.checked.disabled.border.color');
    }
`;

/** Params `URadioButton` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface RadioButtonClassesParams {
  checked?: boolean;
  disabled?: boolean;
}

/**
 * Class-name-slot resolver for `URadioButton`, ported from the extracted
 * `RadioButtonStyle`'s own `classes` object (`.p-radiobutton*` renamed to
 * `.u-radio-button*`; `p-disabled` kept unrenamed to match this file's own
 * CSS selectors above — same precedent as `checkboxStyleModule`).
 * `invalid`/`$variant`/`size` params dropped, matching `checkboxStyleModule`'s
 * own established minimal-surface precedent (no matching inputs on
 * `URadioButton`, per this component's Checkbox-pattern surface).
 */
const classes = {
  root: (params: RadioButtonClassesParams = {}) => {
    const { checked, disabled } = params;

    return [
      "u-radio-button u-component",
      {
        "u-radio-button-checked": checked,
        "p-disabled": disabled,
      },
    ];
  },
  box: "u-radio-button-box",
  input: "u-radio-button-input",
  icon: "u-radio-button-icon",
};

/** `UBaseComponent`-shaped style module for `URadioButton`. */
export const radioButtonStyleModule = { css, classes };
