/**
 * Ultimate-owned adaptation of PrimeNG's `ToggleButtonStyle` (see
 * `.vendor-extracted/ng/togglebutton/style/togglebuttonstyle.ts`, sourced
 * from `@primeuix/styles/togglebutton`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract — same pattern already established
 * by `checkboxStyleModule`/`radioButtonStyleModule`. Hand-ported directly
 * (not re-exported from `@ultimate/uix-styles`) for the same reason
 * documented in `radio-button-style.ts`: this task may not touch any file
 * outside `packages/ng/`/`packages/react/`/`packages/vue/`, so no new
 * `@ultimate/uix-styles/togglebutton` subpath can be added.
 *
 * `.p-togglebutton*` selectors renamed to `.u-toggle-button*`; `p-disabled`/
 * `p-invalid` kept unrenamed, matching the same precedent.
 */
const css = /*css*/ `
    .u-toggle-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .u-toggle-button-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .u-toggle-button:not(.p-disabled):not(.u-toggle-button-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .u-toggle-button.u-toggle-button-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .u-toggle-button-checked .u-toggle-button-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .u-toggle-button:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .u-toggle-button.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .u-toggle-button.p-disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .u-toggle-button-label,
    .u-toggle-button-icon {
        position: relative;
        transition: none;
    }

    .u-toggle-button-fluid {
        width: 100%;
    }
`;

/** Params `UToggleButton` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface ToggleButtonClassesParams {
  checked?: boolean;
  disabled?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: ToggleButtonClassesParams = {}) => {
    const { checked, disabled, fluid } = params;

    return [
      "u-toggle-button u-component",
      {
        "u-toggle-button-checked": checked,
        "p-disabled": disabled,
        "u-toggle-button-fluid": fluid,
      },
    ];
  },
  content: "u-toggle-button-content",
  icon: "u-toggle-button-icon",
  label: "u-toggle-button-label",
};

/** `UBaseComponent`-shaped style module for `UToggleButton`. */
export const toggleButtonStyleModule = { css, classes };
