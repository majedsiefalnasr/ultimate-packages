import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `ToggleSwitchStyle` (sourced from
 * `@primeuix/styles/toggleswitch`, verified against
 * `.vendor-extracted/vue/toggleswitch/style/ToggleSwitchStyle.js`), hand-ported
 * directly (not re-exported from `@ultimate/uix-styles`) — same reason
 * documented in `toggle-button-style.ts`/`radio-button-style.ts`: this task
 * may not add a new `@ultimate/uix-styles/toggleswitch` subpath. Token names
 * and rule shape match Angular's own `toggle-switch-style.ts` (same pinned
 * `@primeuix/styles/toggleswitch` source), adapted to this project's
 * `u-toggle-switch*` class-name convention and Vue's plain-string-array
 * `cx()` contract. `.p-toggleswitch*` selectors renamed to `.u-toggle-switch*`;
 * `p-disabled`/`p-invalid` kept unrenamed, matching the same precedent.
 */
const css = /*css*/ `
    .u-toggle-switch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
        position: relative;
    }

    .u-toggle-switch-input {
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
        border-radius: dt('toggleswitch.border.radius');
    }

    .u-toggle-switch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
        position: relative;
    }

    .u-toggle-switch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .u-toggle-switch.u-toggle-switch-checked .u-toggle-switch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .u-toggle-switch.u-toggle-switch-checked .u-toggle-switch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .u-toggle-switch:not(.p-disabled):has(.u-toggle-switch-input:hover) .u-toggle-switch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .u-toggle-switch:not(.p-disabled):has(.u-toggle-switch-input:hover) .u-toggle-switch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .u-toggle-switch:not(.p-disabled):has(.u-toggle-switch-input:hover).u-toggle-switch-checked .u-toggle-switch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .u-toggle-switch:not(.p-disabled):has(.u-toggle-switch-input:hover).u-toggle-switch-checked .u-toggle-switch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .u-toggle-switch:not(.p-disabled):has(.u-toggle-switch-input:focus-visible) .u-toggle-switch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .u-toggle-switch.p-invalid > .u-toggle-switch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .u-toggle-switch.p-disabled {
        opacity: 1;
    }

    .u-toggle-switch.p-disabled .u-toggle-switch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .u-toggle-switch.p-disabled .u-toggle-switch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`;

/** Params `UToggleSwitch` passes into `cx('root', params)`. */
export interface ToggleSwitchClassesParams {
  checked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: ToggleSwitchClassesParams = {}) => {
    const { checked, disabled, invalid } = params;

    return [
      "u-toggle-switch",
      {
        "u-toggle-switch-checked": Boolean(checked),
        "p-disabled": Boolean(disabled),
        "p-invalid": Boolean(invalid),
      },
    ];
  },
  input: "u-toggle-switch-input",
  slider: "u-toggle-switch-slider",
  handle: "u-toggle-switch-handle",
};

export const toggleSwitchStyleModule: StyleModule = { css, classes };
