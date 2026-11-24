import { style as toggleSwitchStyle } from "@ultimate/uix-styles/toggleswitch";

/**
 * Ultimate-owned adaptation of PrimeNG's `ToggleSwitchStyle` (see
 * `.vendor-extracted/ng/toggleswitch/style/toggleswitchstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. The
 * structural CSS is the shared `@ultimate/uix-styles/toggleswitch` module
 * (ADR-082), so it reads the Aura `toggleswitch` tokens and matches React
 * and Vue. The `.ng-invalid.ng-dirty` rule is Angular-only, as in PrimeNG.
 */
const css = /*css*/ `
    ${toggleSwitchStyle}

    .u-toggle-switch.ng-invalid.ng-dirty > .u-toggle-switch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }
`;

/** Params `UToggleSwitch` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface ToggleSwitchClassesParams {
  checked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

const classes = {
  root: (params: ToggleSwitchClassesParams = {}) => {
    const { checked, disabled, invalid } = params;

    return [
      "u-toggle-switch u-component",
      {
        "u-toggle-switch-checked": checked,
        "p-disabled": disabled,
        "p-invalid": invalid,
      },
    ];
  },
  input: "u-toggle-switch-input",
  slider: "u-toggle-switch-slider",
  handle: "u-toggle-switch-handle",
};

/** `UBaseComponent`-shaped style module for `UToggleSwitch`. */
export const toggleSwitchStyleModule = { css, classes };
