import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `ToggleButtonStyle` (sourced from
 * `@primeuix/styles/togglebutton`, verified against
 * `.vendor-extracted/vue/togglebutton/style/ToggleButtonStyle.js`), hand-ported
 * directly (not re-exported from `@ultimate/uix-styles`) — same reason already
 * documented across `radio-button-style.ts`/`checkbox-style.ts`: this task may
 * not add a new `@ultimate/uix-styles/togglebutton` subpath (outside
 * `packages/ng/`/`packages/react/`/`packages/vue/`). Token names and rule
 * shape match Angular's own `toggle-button-style.ts` (same pinned
 * `@primeuix/styles/togglebutton` source), adapted to this project's
 * `u-toggle-button*` class-name convention and Vue's plain-string-array
 * `cx()` contract instead of upstream's `{instance, props}` params shape.
 * `.p-togglebutton*` selectors renamed to `.u-toggle-button*`; `p-disabled`/
 * `p-invalid` kept unrenamed, matching the same `p-` -> `u-` translation
 * established for checkbox/radio-button.
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

/** Params `UToggleButton` passes into `cx('root', params)`. */
export interface ToggleButtonClassesParams {
  checked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: ToggleButtonClassesParams = {}) => {
    const { checked, disabled, invalid, fluid } = params;

    return [
      "u-toggle-button",
      {
        "u-toggle-button-checked": Boolean(checked),
        "p-disabled": Boolean(disabled),
        "p-invalid": Boolean(invalid),
        "u-toggle-button-fluid": Boolean(fluid),
      },
    ];
  },
  content: "u-toggle-button-content",
  icon: "u-toggle-button-icon",
  label: "u-toggle-button-label",
};

export const toggleButtonStyleModule: StyleModule = { css, classes };
