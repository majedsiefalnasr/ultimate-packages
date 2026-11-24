import type { StyleModule } from "@ultimate/vue-core";
import { style as toggleSwitchStyle } from "@ultimate/uix-styles/toggleswitch";

/**
 * `createBaseComponent`-shaped style module for `UToggleSwitch`. The
 * structural CSS is the shared `@ultimate/uix-styles/toggleswitch` module
 * (ADR-082), the same module Angular and React consume, so it reads the Aura
 * `toggleswitch` tokens. The modifier classes below are the ones that
 * module's selectors reference.
 */
const css = /*css*/ `
    ${toggleSwitchStyle}
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
